"use server";

import { createClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/crypto";
import { classifyReview } from "@/lib/ai/classify";
import { analyzeReviewBatch } from "@/lib/ai/gemini";
import { generateVibeReport } from "@/lib/ai/generate-report";
import type { ParsedReview, ReviewAnalysis, AnalysisResult, VibeReport } from "@/lib/types/review";

type RunAnalysisInput = {
  appName: string;
  platform?: string;
  reviews: ParsedReview[];
};

type ProgressCallback = {
  step: string;
  progress: number;
};

type RunAnalysisResult =
  | { success: true; analysisId: string }
  | { error: string };

export async function runAnalysis(
  input: RunAnalysisInput
): Promise<RunAnalysisResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "You must be signed in to run an analysis." };
    }

    if (!input.reviews.length) {
      return { error: "No reviews provided." };
    }

    if (!input.appName.trim()) {
      return { error: "App name is required." };
    }

    // 1. Get user's API key
    const { data: settings } = await supabase
      .from("user_settings")
      .select(
        "gemini_api_key_encrypted, gemini_api_key_iv, gemini_api_key_tag, preferred_model"
      )
      .eq("user_id", user.id)
      .single();

    let apiKey: string | null = null;
    let model: string = "gemini-2.5-flash";

    if (
      settings?.gemini_api_key_encrypted &&
      settings?.gemini_api_key_iv &&
      settings?.gemini_api_key_tag
    ) {
      try {
        apiKey = decrypt(
          settings.gemini_api_key_encrypted,
          settings.gemini_api_key_iv,
          settings.gemini_api_key_tag
        );
        model = settings.preferred_model ?? "gemini-2.5-flash";
      } catch {
        return { error: "Failed to decrypt API key. Please re-enter it in Settings." };
      }
    }

    // Fallback to env var
    if (!apiKey) {
      apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? null;
    }

    if (!apiKey) {
      return {
        error:
          "No Gemini API key found. Please add your API key in Settings first.",
      };
    }

    // 2. Create analysis row
    const { data: analysis, error: createError } = await supabase
      .from("analyses")
      .insert({
        user_id: user.id,
        app_name: input.appName.trim(),
        platform: input.platform ?? null,
        status: "processing",
        review_count: input.reviews.length,
      })
      .select("id")
      .single();

    if (createError || !analysis) {
      console.error("Failed to create analysis:", createError);
      return { error: "Failed to create analysis. Please try again." };
    }

    const analysisId = analysis.id;

    try {
      // 3. Classify reviews into tiers
      const classified = input.reviews.map((review) => ({
        review,
        classification: classifyReview(review),
      }));

      // Tier 1 & 2: already have analysis
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

      // 4. Run Gemini on Tier 3 reviews in batches
      const BATCH_SIZE = 10;
      const geminiResults: Array<{
        review: ParsedReview;
        analysis: ReviewAnalysis;
      }> = [];

      for (let i = 0; i < tier3Reviews.length; i += BATCH_SIZE) {
        const batch = tier3Reviews.slice(i, i + BATCH_SIZE);
        const batchAnalyses = await analyzeReviewBatch(batch, apiKey, model);

        for (let j = 0; j < batch.length; j++) {
          geminiResults.push({
            review: batch[j],
            analysis: batchAnalyses[j] ?? localResults[0]?.analysis ?? {
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

      // 5. Combine all results
      const allResults = [...localResults, ...geminiResults];

      // 6. Insert reviews into Supabase
      const reviewRows = allResults.map((item) => ({
        analysis_id: analysisId,
        content: item.review.content,
        rating: item.review.rating ?? null,
        author: item.review.author ?? null,
        review_date: item.review.date ?? null,
        platform: item.review.platform ?? input.platform ?? null,
        love_score: item.analysis.love_score,
        frustration_score: item.analysis.frustration_score,
        loyalty_score: item.analysis.loyalty_score,
        momentum_score: item.analysis.momentum_score,
        wom_score: item.analysis.wom_score,
        churn_risk: item.analysis.churn_risk,
        features_mentioned: item.analysis.features_mentioned,
        churn_phrases: item.analysis.churn_phrases,
        summary: item.analysis.summary,
      }));

      if (reviewRows.length > 0) {
        const { error: insertError } = await supabase
          .from("reviews")
          .insert(reviewRows);

        if (insertError) {
          console.error("Failed to insert reviews:", insertError);
        }
      }

      // 7. Compute aggregate scores
      const n = allResults.length;
      const avgLove =
        allResults.reduce((sum, r) => sum + r.analysis.love_score, 0) / n;
      const avgFrustration =
        allResults.reduce((sum, r) => sum + r.analysis.frustration_score, 0) /
        n;
      const avgLoyalty =
        allResults.reduce((sum, r) => sum + r.analysis.loyalty_score, 0) / n;
      const avgMomentum =
        allResults.reduce((sum, r) => sum + r.analysis.momentum_score, 0) / n;
      const avgWom =
        allResults.reduce((sum, r) => sum + r.analysis.wom_score, 0) / n;

      // Vibe Score formula
      const vibeScore =
        (avgLove * 0.25 +
          (10 - avgFrustration) * 0.25 +
          avgLoyalty * 0.2 +
          avgMomentum * 0.15 +
          avgWom * 0.15) *
        10;

      // Aggregate friction scores from features mentioned (local fallback)
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

      // Aggregate churn drivers (local fallback)
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

      // Churn risk distribution
      const churnCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
      for (const item of allResults) {
        churnCounts[item.analysis.churn_risk]++;
      }

      const roundedVibeScore = Math.round(vibeScore * 10) / 10;
      const dimensionScores = {
        love: Math.round(avgLove * 10) / 10,
        frustration: Math.round(avgFrustration * 10) / 10,
        loyalty: Math.round(avgLoyalty * 10) / 10,
        momentum: Math.round(avgMomentum * 10) / 10,
        wom: Math.round(avgWom * 10) / 10,
      };

      // 8. Generate aggregate Vibe Report via second AI pass
      let vibeReport: VibeReport | null = null;
      try {
        vibeReport = await generateVibeReport({
          appName: input.appName,
          platform: input.platform,
          reviews: allResults,
          dimensionAverages: dimensionScores,
          vibeScore: roundedVibeScore,
          apiKey,
          model,
        });
      } catch (reportErr) {
        console.error(
          "Vibe Report generation failed, falling back to local aggregation:",
          reportErr
        );
        // Fall through — vibeReport stays null, we use local data
      }

      // Build the AnalysisResult, preferring AI-generated report data when available
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
        churn_drivers: vibeReport
          ? vibeReport.churn_drivers
          : localChurnDrivers,
        action_items: vibeReport ? vibeReport.action_items : [],
        review_count: n,
        summary: vibeReport
          ? vibeReport.summary
          : `Analysis of ${n} reviews for ${input.appName}. Vibe Score: ${Math.round(vibeScore)}/100.`,
      };

      // 9. Update analysis with results (include full vibe report data)
      const updatePayload: Record<string, unknown> = {
        status: "completed",
        vibe_score: result.vibe_score,
        results: result,
        completed_at: new Date().toISOString(),
      };

      // Store granular report sections in dedicated jsonb columns if available
      if (vibeReport) {
        updatePayload.friction_scores = vibeReport.friction_scores;
        updatePayload.churn_drivers = vibeReport.churn_drivers;
        updatePayload.action_items = vibeReport.action_items;
        if (vibeReport.release_impact) {
          updatePayload.release_impact = vibeReport.release_impact;
        }
      }

      const { error: updateError } = await supabase
        .from("analyses")
        .update(updatePayload)
        .eq("id", analysisId);

      if (updateError) {
        console.error("Failed to update analysis:", updateError);
      }

      return { success: true, analysisId };
    } catch (err) {
      console.error("Analysis pipeline error:", err);

      // Mark analysis as failed
      await supabase
        .from("analyses")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", analysisId);

      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      return { error: message };
    }
  } catch (err) {
    console.error("runAnalysis error:", err);
    return { error: "An unexpected error occurred." };
  }
}
