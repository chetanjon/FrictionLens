/**
 * Quick competitor analysis — pulls reviews and computes dimension averages.
 * Does NOT store individual reviews, only aggregate scores.
 */

import { pullReviews } from "@/lib/scrapers";
import { classifyReview } from "@/lib/ai/classify";
import { analyzeReviewBatch } from "@/lib/ai/gemini";
import type { ParsedReview, ReviewAnalysis } from "@/lib/types/review";

export type CompetitorResult = {
  name: string;
  platform: string;
  vibe_score: number;
  review_count: number;
  dimension_scores: {
    love: number;
    frustration: number;
    loyalty: number;
    momentum: number;
    wom: number;
  };
};

export type CompetitorInput = {
  appId: string;
  name: string;
  platform: "android" | "ios";
  storeId?: number;
};

export async function analyzeCompetitor(
  competitor: CompetitorInput,
  apiKey: string,
  model: string,
  onProgress?: (msg: string) => void
): Promise<CompetitorResult> {
  onProgress?.(`Pulling reviews for ${competitor.name}...`);

  // Pull fewer reviews for competitors (100 max)
  const reviews = await pullReviews({
    appId: competitor.appId,
    platform: competitor.platform,
    storeId: competitor.storeId,
    count: 100,
  });

  if (reviews.length === 0) {
    throw new Error(`No reviews found for ${competitor.name}`);
  }

  onProgress?.(`Analyzing ${reviews.length} reviews for ${competitor.name}...`);

  // Classify and analyze
  const classified = reviews.map((review) => ({
    review,
    classification: classifyReview(review),
  }));

  const localResults: Array<{ review: ParsedReview; analysis: ReviewAnalysis }> = [];
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

  // Batch analyze Tier 3 (BATCH_SIZE=50 to minimize API calls and rate limit hits)
  const BATCH_SIZE = 50;
  const geminiResults: Array<{ review: ParsedReview; analysis: ReviewAnalysis }> = [];

  for (let i = 0; i < tier3Reviews.length; i += BATCH_SIZE) {
    // Rate limit delay between batches (skip first)
    if (i > 0) {
      await new Promise((resolve) => setTimeout(resolve, 6500));
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

  const allResults = [...localResults, ...geminiResults];
  const n = allResults.length;

  // Compute averages
  const avgLove = allResults.reduce((s, r) => s + r.analysis.love_score, 0) / n;
  const avgFrustration = allResults.reduce((s, r) => s + r.analysis.frustration_score, 0) / n;
  const avgLoyalty = allResults.reduce((s, r) => s + r.analysis.loyalty_score, 0) / n;
  const avgMomentum = allResults.reduce((s, r) => s + r.analysis.momentum_score, 0) / n;
  const avgWom = allResults.reduce((s, r) => s + r.analysis.wom_score, 0) / n;

  const vibeScore =
    (avgLove * 0.25 +
      (10 - avgFrustration) * 0.25 +
      avgLoyalty * 0.2 +
      avgMomentum * 0.15 +
      avgWom * 0.15) *
    10;

  return {
    name: competitor.name,
    platform: competitor.platform,
    vibe_score: Math.round(vibeScore * 10) / 10,
    review_count: n,
    dimension_scores: {
      love: Math.round(avgLove * 10) / 10,
      frustration: Math.round(avgFrustration * 10) / 10,
      loyalty: Math.round(avgLoyalty * 10) / 10,
      momentum: Math.round(avgMomentum * 10) / 10,
      wom: Math.round(avgWom * 10) / 10,
    },
  };
}
