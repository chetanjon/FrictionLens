/**
 * Aggregate Vibe Report generator.
 * Makes a second Gemini call after individual review analysis
 * to produce friction scores, churn drivers, action items, and more.
 */

import { generateText, Output } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

import type {
  ReviewAnalysis,
  ParsedReview,
  VibeReport,
} from "@/lib/types/review";
import { vibeReportSchema } from "./schemas";
import { REPORT_SYSTEM_PROMPT, buildReportPrompt } from "./prompts";
import { DEFAULT_MODEL } from "./gemini";

type GenerateVibeReportInput = {
  appName: string;
  platform?: string;
  reviews: Array<{
    review: ParsedReview;
    analysis: ReviewAnalysis;
  }>;
  dimensionAverages: {
    love: number;
    frustration: number;
    loyalty: number;
    momentum: number;
    wom: number;
  };
  vibeScore: number;
  apiKey: string;
  model?: string;
};

export async function generateVibeReport(
  input: GenerateVibeReportInput
): Promise<VibeReport> {
  const {
    appName,
    platform,
    reviews,
    dimensionAverages,
    vibeScore,
    apiKey,
    model,
  } = input;
  const resolvedModel = model ?? DEFAULT_MODEL;

  // Build review summaries with context for the AI
  const reviewSummaries = reviews.map((item) => {
    const parts: string[] = [item.analysis.summary];

    // Add feature context
    if (item.analysis.features_mentioned.length > 0) {
      const feats = item.analysis.features_mentioned
        .map((f) => `${f.feature} (${f.sentiment}, severity: ${f.severity})`)
        .join("; ");
      parts.push(`Features: ${feats}`);
    }

    // Add churn phrases
    if (item.analysis.churn_phrases.length > 0) {
      parts.push(`Churn signals: "${item.analysis.churn_phrases.join('", "')}"`);
    }

    // Add version info if present
    if (item.review.version) {
      parts.push(`Version: ${item.review.version}`);
    }

    // Add rating
    if (item.review.rating !== undefined) {
      parts.push(`Rating: ${item.review.rating}/5`);
    }

    return parts.join(" | ");
  });

  const google = createGoogleGenerativeAI({ apiKey });

  const result = await generateText({
    model: google(resolvedModel),
    output: Output.object({ schema: vibeReportSchema }),
    system: REPORT_SYSTEM_PROMPT,
    prompt: buildReportPrompt(appName, reviewSummaries, dimensionAverages),
  });

  const output = result.output!;

  // Assemble the full VibeReport
  const vibeReport: VibeReport = {
    app_name: appName,
    platform,
    review_count: reviews.length,
    summary: output.summary,
    vibe_score: vibeScore,
    dimension_scores: dimensionAverages,
    friction_scores: output.friction_scores,
    churn_drivers: output.churn_drivers,
    release_impact: output.release_impact ?? undefined,
    action_items: output.action_items,
  };

  return vibeReport;
}
