/**
 * Core analysis pipeline extracted from the analyze route handler.
 * Can be invoked directly (SSE mode) or via Inngest (background job mode).
 */

import { createClient } from "@/lib/supabase/server";
import { classifyReview } from "@/lib/ai/classify";
import { analyzeReviewBatch } from "@/lib/ai/gemini";
import { generateVibeReport } from "@/lib/ai/generate-report";
import { analyzeCompetitor } from "@/lib/ai/analyze-competitor";
import { notifySlackAnalysisComplete } from "@/lib/slack";
import type { CompetitorInput, CompetitorResult } from "@/lib/ai/analyze-competitor";
import type {
  ParsedReview,
  ReviewAnalysis,
  AnalysisResult,
  VibeReport,
} from "@/lib/types/review";

export type PipelineParams = {
  userId: string;
  userEmail?: string;
  appName: string;
  platform?: string;
  reviews: ParsedReview[];
  competitors?: CompetitorInput[];
  apiKey: string;
  model: string;
  analysisId: string;
  onProgress: (step: string, progress: number) => void | Promise<void>;
};

export type PipelineResult = {
  analysisId: string;
  vibeScore: number;
  reviewCount: number;
  competitorCount: number;
};

export async function runAnalysisPipeline(
  params: PipelineParams
): Promise<PipelineResult> {
  const {
    userEmail,
    appName,
    platform,
    reviews,
    competitors: competitorInputs,
    apiKey,
    model,
    analysisId,
    onProgress,
  } = params;

  const supabase = await createClient();

  // 1. Classify reviews
  await onProgress(`Classifying ${reviews.length} reviews...`, 15);

  const classified = reviews.map((review) => ({
    review,
    classification: classifyReview(review),
  }));

  const localResults: Array<{
    review: ParsedReview;
    analysis: ReviewAnalysis;
  }> = [];
  const tier3Reviews: ParsedReview[] = [];

  for (const item of classified) {
    if (item.classification.tier === 1 || item.classification.tier === 2) {
      localResults.push({
        review: item.review,
        analysis: item.classification.analysis,
      });
    } else {
      tier3Reviews.push(item.review);
    }
  }

  await onProgress(
    `Classified: ${localResults.length} local, ${tier3Reviews.length} need AI`,
    20
  );

  // 2. Batch analyze Tier 3 with progress (BATCH_SIZE=50 to minimize API calls)
  const BATCH_SIZE = 50;
  const totalBatches = Math.ceil(tier3Reviews.length / BATCH_SIZE);
  const geminiResults: Array<{
    review: ParsedReview;
    analysis: ReviewAnalysis;
  }> = [];

  for (let i = 0; i < tier3Reviews.length; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const batch = tier3Reviews.slice(i, i + BATCH_SIZE);

    // Rate limit delay between batches (skip first)
    if (i > 0) {
      await new Promise((resolve) => setTimeout(resolve, 6500));
    }

    await onProgress(
      `Analyzing batch ${batchNum}/${totalBatches} (${batch.length} reviews)...`,
      20 + Math.round((batchNum / totalBatches) * 50)
    );

    const batchAnalyses = await analyzeReviewBatch(batch, apiKey, model);

    for (let j = 0; j < batch.length; j++) {
      geminiResults.push({
        review: batch[j],
        analysis: batchAnalyses[j] ?? {
          love_score: 5,
          frustration_score: 5,
          loyalty_score: 5,
          momentum_score: 5,
          wom_score: 5,
          churn_risk: "Medium" as const,
          features_mentioned: [],
          churn_phrases: [],
          summary: "Analysis incomplete.",
        },
      });
    }
  }

  // 3. Combine and insert reviews into Supabase
  const allResults = [...localResults, ...geminiResults];

  await onProgress("Saving review data...", 75);

  function buildReviewRows(includeChurnPhrases: boolean) {
    return allResults.map((item) => {
      const row: Record<string, unknown> = {
        analysis_id: analysisId,
        content: item.review.content,
        rating: item.review.rating ?? null,
        author: item.review.author ?? null,
        review_date: item.review.date ?? null,
        platform: item.review.platform ?? platform ?? null,
        love_score: item.analysis.love_score,
        frustration_score: item.analysis.frustration_score,
        loyalty_score: item.analysis.loyalty_score,
        momentum_score: item.analysis.momentum_score,
        wom_score: item.analysis.wom_score,
        churn_risk: item.analysis.churn_risk,
        features_mentioned: item.analysis.features_mentioned,
        summary: item.analysis.summary,
      };
      if (includeChurnPhrases) {
        row.churn_phrases = item.analysis.churn_phrases;
      }
      return row;
    });
  }

  if (allResults.length > 0) {
    let { error: insertError } = await supabase
      .from("reviews")
      .insert(buildReviewRows(true));
    // Retry without churn_phrases if column doesn't exist
    if (insertError?.message?.includes("churn_phrases")) {
      console.warn("churn_phrases column missing, retrying without it");
      ({ error: insertError } = await supabase
        .from("reviews")
        .insert(buildReviewRows(false)));
    }
    if (insertError) {
      console.error("Failed to insert reviews:", insertError);
    }
  }

  // 4. Compute aggregates (vibe score, friction scores, churn drivers)
  await onProgress("Computing Vibe Score...", 80);

  const n = allResults.length;
  const avgLove =
    allResults.reduce((s, r) => s + r.analysis.love_score, 0) / n;
  const avgFrustration =
    allResults.reduce((s, r) => s + r.analysis.frustration_score, 0) / n;
  const avgLoyalty =
    allResults.reduce((s, r) => s + r.analysis.loyalty_score, 0) / n;
  const avgMomentum =
    allResults.reduce((s, r) => s + r.analysis.momentum_score, 0) / n;
  const avgWom =
    allResults.reduce((s, r) => s + r.analysis.wom_score, 0) / n;

  const vibeScore =
    (avgLove * 0.25 +
      (10 - avgFrustration) * 0.25 +
      avgLoyalty * 0.2 +
      avgMomentum * 0.15 +
      avgWom * 0.15) *
    10;

  // Friction scores (local fallback)
  const featureMap = new Map<
    string,
    { totalSeverity: number; count: number; sentiments: string[] }
  >();
  for (const item of allResults) {
    for (const feat of item.analysis.features_mentioned) {
      const existing = featureMap.get(feat.feature) ?? {
        totalSeverity: 0,
        count: 0,
        sentiments: [],
      };
      existing.totalSeverity += feat.severity;
      existing.count += 1;
      existing.sentiments.push(feat.sentiment);
      featureMap.set(feat.feature, existing);
    }
  }

  const localFrictionScores = Array.from(featureMap.entries())
    .map(([feature, data]) => ({
      feature,
      score: Math.round((data.totalSeverity / data.count) * 10) / 10,
      trend: "stable" as const,
      mention_count: data.count,
      delta: "0%",
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // Churn drivers (local fallback)
  const churnPhraseMap = new Map<string, string[]>();
  for (const item of allResults) {
    for (const phrase of item.analysis.churn_phrases) {
      const normalised = phrase.toLowerCase().trim();
      if (normalised) {
        const existing = churnPhraseMap.get(normalised) ?? [];
        existing.push(item.review.content.slice(0, 120));
        churnPhraseMap.set(normalised, existing);
      }
    }
  }

  const localChurnDrivers = Array.from(churnPhraseMap.entries())
    .map(([theme, quotes]) => ({
      theme,
      count: quotes.length,
      severity: (quotes.length > 5
        ? "Critical"
        : quotes.length > 3
          ? "High"
          : quotes.length > 1
            ? "Medium"
            : "Low") as "Critical" | "High" | "Medium" | "Low",
      quotes: quotes.slice(0, 3),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const roundedVibeScore = Math.round(vibeScore * 10) / 10;
  const dimensionScores = {
    love: Math.round(avgLove * 10) / 10,
    frustration: Math.round(avgFrustration * 10) / 10,
    loyalty: Math.round(avgLoyalty * 10) / 10,
    momentum: Math.round(avgMomentum * 10) / 10,
    wom: Math.round(avgWom * 10) / 10,
  };

  // 5. Generate Vibe Report (second AI pass)
  await onProgress("Generating Vibe Report...", 85);

  let vibeReport: VibeReport | null = null;
  try {
    vibeReport = await generateVibeReport({
      appName,
      platform,
      reviews: allResults,
      dimensionAverages: dimensionScores,
      vibeScore: roundedVibeScore,
      apiKey,
      model,
    });
  } catch (reportErr) {
    console.error("Vibe Report generation failed:", reportErr);
  }

  // 6. Analyze competitors (if any)
  const competitorResults: CompetitorResult[] = [];
  if (competitorInputs && competitorInputs.length > 0) {
    const total = competitorInputs.length;
    for (let ci = 0; ci < total; ci++) {
      const comp = competitorInputs[ci];
      await onProgress(
        `Analyzing competitor ${ci + 1}/${total}: ${comp.name}...`,
        88 + Math.round(((ci + 1) / total) * 6)
      );

      try {
        const compResult = await analyzeCompetitor(
          comp,
          apiKey,
          model,
          (msg) =>
            onProgress(
              msg,
              88 + Math.round(((ci + 0.5) / total) * 6)
            )
        );
        competitorResults.push(compResult);
      } catch (compErr) {
        console.error(
          `Competitor analysis failed for ${comp.name}:`,
          compErr
        );
        // Skip failed competitors, don't block the main analysis
      }
    }
  }

  // 7. Update analysis record in Supabase
  await onProgress("Saving results...", 95);

  const result: AnalysisResult = {
    vibe_score: roundedVibeScore,
    dimension_scores: dimensionScores,
    friction_scores: vibeReport
      ? vibeReport.friction_scores.map((f) => ({
          feature: f.feature,
          score: f.score,
          trend: f.trend,
          mention_count: f.mentions,
          delta: f.delta,
        }))
      : localFrictionScores,
    churn_drivers: vibeReport ? vibeReport.churn_drivers : localChurnDrivers,
    action_items: vibeReport ? vibeReport.action_items : [],
    review_count: n,
    summary: vibeReport
      ? vibeReport.summary
      : `Analysis of ${n} reviews for ${appName}. Vibe Score: ${Math.round(vibeScore)}/100.`,
  };

  // Build update payload — try full payload first, fall back to minimal if columns missing
  const fullPayload: Record<string, unknown> = {
    status: "completed",
    vibe_score: result.vibe_score,
    dimension_scores: result.dimension_scores,
    results: result,
    completed_at: new Date().toISOString(),
  };

  if (vibeReport) {
    fullPayload.friction_scores = vibeReport.friction_scores;
    fullPayload.churn_drivers = vibeReport.churn_drivers;
    fullPayload.action_items = vibeReport.action_items;
    if (vibeReport.release_impact) {
      fullPayload.release_impact = vibeReport.release_impact;
    }
  }

  if (competitorResults.length > 0) {
    fullPayload.competitors = competitorResults;
  }

  const { error: updateError } = await supabase
    .from("analyses")
    .update(fullPayload)
    .eq("id", analysisId);

  // If full update fails (missing columns), fall back to minimal
  if (updateError) {
    console.warn(
      "Full update failed, trying minimal:",
      updateError.message
    );
    const minimalPayload: Record<string, unknown> = {
      status: "completed",
      vibe_score: result.vibe_score,
      dimension_scores: result.dimension_scores,
      friction_scores: result.friction_scores.map((f) => ({
        feature: f.feature,
        score: f.score,
        mentions: f.mention_count,
        trend: f.trend,
        delta: f.delta,
      })),
      churn_drivers: result.churn_drivers,
      action_items: result.action_items,
    };
    const { error: minError } = await supabase
      .from("analyses")
      .update(minimalPayload)
      .eq("id", analysisId);
    if (minError) {
      console.error("Minimal update also failed:", minError);
    }
  }

  // 8. Send Slack notification (fire-and-forget)
  notifySlackAnalysisComplete({
    appName,
    vibeScore: roundedVibeScore,
    reviewCount: n,
    competitorCount: competitorResults.length,
    analysisId,
    userEmail,
  }).catch(() => {
    /* swallow */
  });

  return {
    analysisId,
    vibeScore: roundedVibeScore,
    reviewCount: n,
    competitorCount: competitorResults.length,
  };
}
