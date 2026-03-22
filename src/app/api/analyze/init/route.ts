import { NextRequest, NextResponse } from "next/server";

import { classifyReview } from "@/lib/ai/classify";
import { analyzeReviewBatch } from "@/lib/ai/gemini";
import {
  authenticateAndDecryptKey,
  computeAggregates,
  buildReviewSummaries,
  interBatchDelay,
} from "@/lib/analysis/pipeline-helpers";
import { initRequestSchema } from "@/lib/analysis/pipeline-schemas";
import type { ParsedReview, ReviewAnalysis } from "@/lib/types/review";

const BATCH_SIZE = 50;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = initRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 }
      );
    }

    const { appName, platform, reviews } = parsed.data;
    const { userId, apiKey, model, supabase } =
      await authenticateAndDecryptKey();

    // Create analysis record
    const { data: analysis, error: createError } = await supabase
      .from("analyses")
      .insert({
        user_id: userId,
        app_name: appName,
        platform: platform ?? null,
        status: "processing",
        review_count: reviews.length,
      })
      .select("id")
      .single();

    if (createError || !analysis) {
      return NextResponse.json(
        { error: "Failed to create analysis." },
        { status: 500 }
      );
    }

    const analysisId = analysis.id;

    // Classify reviews
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

    // Batch-analyze Tier 3 reviews (BATCH_SIZE=50 to minimize API calls)
    const geminiResults: Array<{
      review: ParsedReview;
      analysis: ReviewAnalysis;
    }> = [];

    for (let i = 0; i < tier3Reviews.length; i += BATCH_SIZE) {
      // Rate limit delay between batches (skip first batch)
      if (i > 0) {
        await interBatchDelay();
      }

      const batch = tier3Reviews.slice(i, i + BATCH_SIZE);
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

    // Combine and save reviews to Supabase
    const allResults = [...localResults, ...geminiResults];

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
      if (insertError?.message?.includes("churn_phrases")) {
        ({ error: insertError } = await supabase
          .from("reviews")
          .insert(buildReviewRows(false)));
      }
      if (insertError) {
        console.error("Failed to insert reviews:", insertError);
      }
    }

    // Compute aggregates
    const aggregates = computeAggregates(allResults);
    const reviewSummaries = buildReviewSummaries(allResults);

    // Update analysis with initial aggregates
    await supabase
      .from("analyses")
      .update({
        vibe_score: aggregates.vibeScore,
        dimension_scores: aggregates.dimensionScores,
      })
      .eq("id", analysisId);

    return NextResponse.json({
      analysisId,
      vibeScore: aggregates.vibeScore,
      dimensionScores: aggregates.dimensionScores,
      localFrictionScores: aggregates.localFrictionScores,
      localChurnDrivers: aggregates.localChurnDrivers,
      reviewSummaries,
      reviewCount: allResults.length,
      tier3Count: tier3Reviews.length,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
