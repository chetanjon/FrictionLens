/**
 * Review classification into tiers to minimize unnecessary AI calls.
 *
 * Tier 1: 1-5 words, trivial — use star rating only
 * Tier 2: 5-20 words, single sentiment — rule-based scoring
 * Tier 3: 20+ words — send to Gemini for full analysis
 */

import type { ParsedReview, ReviewAnalysis } from "@/lib/types/review";

type ClassificationResult =
  | { tier: 1; analysis: ReviewAnalysis }
  | { tier: 2; analysis: ReviewAnalysis }
  | { tier: 3; analysis?: undefined };

const POSITIVE_WORDS = new Set([
  "great",
  "amazing",
  "awesome",
  "love",
  "excellent",
  "perfect",
  "fantastic",
  "wonderful",
  "best",
  "good",
  "nice",
  "superb",
  "brilliant",
  "outstanding",
  "incredible",
  "phenomenal",
  "stellar",
  "solid",
  "smooth",
  "fast",
  "beautiful",
  "intuitive",
  "helpful",
  "useful",
  "recommend",
]);

const NEGATIVE_WORDS = new Set([
  "terrible",
  "awful",
  "horrible",
  "hate",
  "worst",
  "bad",
  "trash",
  "garbage",
  "useless",
  "broken",
  "slow",
  "buggy",
  "crash",
  "crashes",
  "sucks",
  "disappointing",
  "frustrating",
  "annoying",
  "pathetic",
  "waste",
  "scam",
  "ripoff",
  "unusable",
  "laggy",
  "glitchy",
  "ugly",
  "confusing",
]);

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function ratingToScores(rating: number | undefined): {
  love: number;
  frustration: number;
  loyalty: number;
  momentum: number;
  wom: number;
} {
  // Map 1-5 star rating to dimension scores
  const r = rating ?? 3; // default to neutral if no rating

  switch (r) {
    case 5:
      return { love: 8, frustration: 0, loyalty: 7, momentum: 6, wom: 8 };
    case 4:
      return { love: 6, frustration: 2, loyalty: 6, momentum: 5, wom: 6 };
    case 3:
      return { love: 4, frustration: 4, loyalty: 4, momentum: 4, wom: 4 };
    case 2:
      return { love: 2, frustration: 6, loyalty: 3, momentum: 3, wom: 2 };
    case 1:
      return { love: 1, frustration: 8, loyalty: 2, momentum: 2, wom: 1 };
    default:
      return { love: 4, frustration: 4, loyalty: 4, momentum: 4, wom: 4 };
  }
}

function scoresToChurnRisk(
  love: number,
  frustration: number,
  loyalty: number
): "Critical" | "High" | "Medium" | "Low" {
  const risk = frustration - (love + loyalty) / 2;
  if (risk > 4) return "Critical";
  if (risk > 2) return "High";
  if (risk > 0) return "Medium";
  return "Low";
}

function buildTrivialAnalysis(
  review: ParsedReview,
  sentimentOverride?: "positive" | "negative"
): ReviewAnalysis {
  const scores = ratingToScores(review.rating);
  let { love, frustration, wom } = scores;
  const { loyalty, momentum } = scores;

  // Adjust if we detected sentiment from text that conflicts with rating
  if (sentimentOverride === "positive" && love < 6) {
    love = Math.max(love, 7);
    frustration = Math.min(frustration, 1);
    wom = Math.max(wom, 7);
  } else if (sentimentOverride === "negative" && frustration < 6) {
    love = Math.min(love, 2);
    frustration = Math.max(frustration, 7);
    wom = Math.min(wom, 2);
  }

  const churnRisk = scoresToChurnRisk(love, frustration, loyalty);

  return {
    love_score: love,
    frustration_score: frustration,
    loyalty_score: loyalty,
    momentum_score: momentum,
    wom_score: wom,
    churn_risk: churnRisk,
    features_mentioned: [],
    churn_phrases: [],
    summary: sentimentOverride
      ? `Short ${sentimentOverride} review (rated ${review.rating ?? "unrated"}/5).`
      : `Trivial review (rated ${review.rating ?? "unrated"}/5).`,
  };
}

function detectSentiment(
  text: string
): "positive" | "negative" | "neutral" {
  const words = text.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of words) {
    if (POSITIVE_WORDS.has(word)) positiveCount++;
    if (NEGATIVE_WORDS.has(word)) negativeCount++;
  }

  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  return "neutral";
}

export function classifyReview(review: ParsedReview): ClassificationResult {
  const words = wordCount(review.content);

  if (words <= 5) {
    // Tier 1: trivial review
    const sentiment = detectSentiment(review.content);
    const override = sentiment === "neutral" ? undefined : sentiment;
    return {
      tier: 1,
      analysis: buildTrivialAnalysis(review, override),
    };
  }

  if (words <= 20) {
    // Tier 2: short single-sentiment review
    const sentiment = detectSentiment(review.content);
    const override = sentiment === "neutral" ? undefined : sentiment;
    return {
      tier: 2,
      analysis: buildTrivialAnalysis(review, override),
    };
  }

  // Tier 3: complex review — needs Gemini analysis
  return { tier: 3 };
}
