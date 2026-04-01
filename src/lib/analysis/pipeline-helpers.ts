/**
 * Shared helpers for the chunked analysis pipeline endpoints.
 * Extracts common auth, aggregation, and timing logic.
 */

import { createClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/crypto";
import { consumeFreeTrial, FREE_TRIAL_MODEL } from "@/lib/free-trial";
import type { ParsedReview, ReviewAnalysis } from "@/lib/types/review";

export type AuthResult = {
  userId: string;
  userEmail: string | undefined;
  apiKey: string;
  model: string;
  /** True when the analysis is running on the platform key (free trial). */
  isFreeTrial: boolean;
  supabase: Awaited<ReturnType<typeof createClient>>;
};

/**
 * Authenticate user, decrypt Gemini API key, and optionally verify analysis ownership.
 * Used by all chunked pipeline endpoints.
 */
export async function authenticateAndDecryptKey(
  analysisId?: string
): Promise<AuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be signed in.");
  }

  // Verify analysis ownership if analysisId provided
  if (analysisId) {
    const { data: analysis, error: fetchError } = await supabase
      .from("analyses")
      .select("user_id")
      .eq("id", analysisId)
      .single();

    if (fetchError || !analysis) {
      throw new Error("Analysis not found.");
    }
    if (analysis.user_id !== user.id) {
      throw new Error("You do not own this analysis.");
    }
  }

  // Decrypt API key
  const { data: settings } = await supabase
    .from("user_settings")
    .select(
      "gemini_api_key_encrypted, gemini_api_key_iv, gemini_api_key_tag, preferred_model"
    )
    .eq("user_id", user.id)
    .single();

  let apiKey: string | null = null;
  let model = "gemini-2.5-flash";

  if (
    settings?.gemini_api_key_encrypted &&
    settings?.gemini_api_key_iv &&
    settings?.gemini_api_key_tag
  ) {
    apiKey = decrypt(
      settings.gemini_api_key_encrypted,
      settings.gemini_api_key_iv,
      settings.gemini_api_key_tag
    );
    model = settings.preferred_model ?? "gemini-2.5-flash";
  }

  // If user has no key, try free trial with the platform key
  if (!apiKey) {
    const trialResult = await consumeFreeTrial(user.id);
    if (!trialResult.allowed) {
      throw new Error(trialResult.reason);
    }
    apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? null;
    model = FREE_TRIAL_MODEL;
  }

  if (!apiKey) {
    throw new Error(
      "No Gemini API key found. Please add your API key in Settings."
    );
  }

  const isFreeTrial = !settings?.gemini_api_key_encrypted;

  return {
    userId: user.id,
    userEmail: user.email,
    apiKey,
    model,
    isFreeTrial,
    supabase,
  };
}

type ReviewWithAnalysis = {
  review: ParsedReview;
  analysis: ReviewAnalysis;
};

export type AggregateResult = {
  vibeScore: number;
  dimensionScores: {
    love: number;
    frustration: number;
    loyalty: number;
    momentum: number;
    wom: number;
  };
  localFrictionScores: Array<{
    feature: string;
    score: number;
    trend: "stable";
    mention_count: number;
    delta: string;
  }>;
  localChurnDrivers: Array<{
    theme: string;
    count: number;
    severity: "Critical" | "High" | "Medium" | "Low";
    quotes: string[];
  }>;
};

/**
 * Compute vibe score, dimension averages, friction scores, and churn drivers
 * from analyzed reviews. Pure computation, no AI calls.
 */
export function computeAggregates(
  allResults: ReviewWithAnalysis[]
): AggregateResult {
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

  // Friction scores per feature
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

  // Churn drivers
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

  return {
    vibeScore: Math.round(vibeScore * 10) / 10,
    dimensionScores: {
      love: Math.round(avgLove * 10) / 10,
      frustration: Math.round(avgFrustration * 10) / 10,
      loyalty: Math.round(avgLoyalty * 10) / 10,
      momentum: Math.round(avgMomentum * 10) / 10,
      wom: Math.round(avgWom * 10) / 10,
    },
    localFrictionScores,
    localChurnDrivers,
  };
}

/**
 * Build condensed review summaries for the report generation endpoint.
 * Includes analysis summary, features, churn signals, and rating.
 */
export function buildReviewSummaries(
  allResults: ReviewWithAnalysis[]
): string[] {
  return allResults.map((item) => {
    const parts: string[] = [item.analysis.summary];

    if (item.analysis.features_mentioned.length > 0) {
      const feats = item.analysis.features_mentioned
        .map((f) => `${f.feature} (${f.sentiment}, severity: ${f.severity})`)
        .join("; ");
      parts.push(`Features: ${feats}`);
    }

    if (item.analysis.churn_phrases.length > 0) {
      parts.push(
        `Churn signals: "${item.analysis.churn_phrases.join('", "')}"`
      );
    }

    if (item.review.version) {
      parts.push(`Version: ${item.review.version}`);
    }

    if (item.review.rating !== undefined) {
      parts.push(`Rating: ${item.review.rating}/5`);
    }

    return parts.join(" | ");
  });
}

/**
 * Simple delay for rate limiting between Gemini calls within one request.
 */
export function interBatchDelay(ms = 6500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
