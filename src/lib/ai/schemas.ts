/**
 * Zod schemas for structured AI output.
 * Used with Vercel AI SDK's generateObject().
 */

import { z } from "zod";

export const featureMentionSchema = z.object({
  feature: z.string().describe("Feature name, normalized to lowercase"),
  sentiment: z.enum(["positive", "negative", "neutral"]),
  severity: z
    .number()
    .min(0)
    .max(10)
    .describe("How severe this mention is, 0-10"),
});

export const reviewAnalysisSchema = z.object({
  love_score: z
    .number()
    .min(0)
    .max(10)
    .describe(
      "How much the user loves the product (0 = hates it, 10 = passionate advocate)"
    ),
  frustration_score: z
    .number()
    .min(0)
    .max(10)
    .describe(
      "How frustrated the user is (0 = no frustration, 10 = extremely frustrated)"
    ),
  loyalty_score: z
    .number()
    .min(0)
    .max(10)
    .describe(
      "How loyal the user seems (0 = about to leave, 10 = die-hard fan)"
    ),
  momentum_score: z
    .number()
    .min(0)
    .max(10)
    .describe(
      "Perceived product momentum (0 = getting worse, 10 = rapidly improving)"
    ),
  wom_score: z
    .number()
    .min(0)
    .max(10)
    .describe(
      "Word-of-mouth likelihood (0 = would actively warn others, 10 = enthusiastically recommends)"
    ),
  churn_risk: z
    .enum(["Critical", "High", "Medium", "Low"])
    .describe("Overall churn risk level for this reviewer"),
  features_mentioned: z
    .array(featureMentionSchema)
    .describe("All features or product aspects mentioned in the review"),
  churn_phrases: z
    .array(z.string())
    .describe(
      "Exact phrases from the review that indicate churn risk or dissatisfaction"
    ),
  summary: z
    .string()
    .describe("One-sentence summary of the review sentiment and key points"),
});

export const batchReviewAnalysisSchema = z.object({
  analyses: z
    .array(reviewAnalysisSchema)
    .describe("One analysis per review, in the same order as the input"),
});

// ── Aggregate Vibe Report schema (second AI pass) ──

export const frictionItemSchema = z.object({
  feature: z.string().describe("Feature or product area name"),
  score: z
    .number()
    .min(0)
    .max(10)
    .describe("Friction score 0-10 (10 = maximum friction)"),
  mentions: z.number().describe("Number of reviews mentioning this feature"),
  trend: z
    .enum(["rising", "stable", "falling"])
    .describe("Whether friction for this feature is rising, stable, or falling"),
  delta: z.string().describe("Percentage change description, e.g. '+12%' or '-5%' or '0%'"),
});

export const churnDriverSchema = z.object({
  theme: z
    .string()
    .describe("Theme or pattern driving churn (e.g. 'price increase frustration')"),
  count: z.number().describe("Number of reviews exhibiting this churn driver"),
  severity: z.enum(["Critical", "High", "Medium", "Low"]),
  quotes: z
    .array(z.string())
    .describe("Up to 3 representative verbatim quotes from reviews"),
});

export const releaseImpactSchema = z.object({
  version: z.string().describe("Version string if detectable, else 'unknown'"),
  date: z.string().describe("Approximate release date or 'unknown'"),
  grade: z
    .string()
    .describe("Letter grade A-F for the release based on review sentiment"),
  sentiment_delta: z
    .number()
    .describe("Sentiment change from before to after release, -10 to +10"),
  new_themes: z
    .array(z.string())
    .describe("New themes that appeared after this release"),
  review_velocity: z
    .string()
    .describe("Description of review volume change, e.g. '2x spike in first week'"),
});

export const actionItemSchema = z.object({
  title: z.string().describe("Short action title"),
  description: z
    .string()
    .describe("1-2 sentence description of what to do and why"),
  impact: z.enum(["Critical", "High", "Medium", "Low"]),
  priority: z.enum(["P0", "P1", "P2", "P3"]),
  effort: z.enum(["Low", "Medium", "High"]),
});

export const vibeReportSchema = z.object({
  summary: z
    .string()
    .describe(
      "One-sentence executive summary of overall app sentiment and key takeaway"
    ),
  friction_scores: z
    .array(frictionItemSchema)
    .describe(
      "Top friction areas ranked by score. Include up to 10 features with the highest friction."
    ),
  churn_drivers: z
    .array(churnDriverSchema)
    .describe(
      "Top 5 churn drivers — recurring themes that drive users away, with representative quotes"
    ),
  release_impact: releaseImpactSchema
    .nullable()
    .describe(
      "Release impact analysis if version data is present in reviews, otherwise null"
    ),
  action_items: z
    .array(actionItemSchema)
    .describe(
      "3-5 prioritized action items for the product team, ordered by priority"
    ),
});

export type VibeReportOutput = z.infer<typeof vibeReportSchema>;
export type ReviewAnalysisOutput = z.infer<typeof reviewAnalysisSchema>;
export type BatchReviewAnalysisOutput = z.infer<
  typeof batchReviewAnalysisSchema
>;
