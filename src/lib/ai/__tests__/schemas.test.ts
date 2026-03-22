import { describe, it, expect } from "vitest";
import {
  reviewAnalysisSchema,
  batchReviewAnalysisSchema,
  vibeReportSchema,
  featureMentionSchema,
  frictionItemSchema,
  churnDriverSchema,
  actionItemSchema,
} from "../schemas";

describe("Zod Schemas", () => {
  describe("featureMentionSchema", () => {
    it("should accept valid feature mention", () => {
      const result = featureMentionSchema.safeParse({
        feature: "search",
        sentiment: "negative",
        severity: 7,
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid sentiment", () => {
      const result = featureMentionSchema.safeParse({
        feature: "search",
        sentiment: "bad",
        severity: 5,
      });
      expect(result.success).toBe(false);
    });

    it("should reject severity out of range", () => {
      const below = featureMentionSchema.safeParse({
        feature: "search",
        sentiment: "positive",
        severity: -1,
      });
      const above = featureMentionSchema.safeParse({
        feature: "search",
        sentiment: "positive",
        severity: 11,
      });
      expect(below.success).toBe(false);
      expect(above.success).toBe(false);
    });
  });

  describe("reviewAnalysisSchema", () => {
    const validAnalysis = {
      love_score: 7,
      frustration_score: 3,
      loyalty_score: 6,
      momentum_score: 5,
      wom_score: 8,
      churn_risk: "Low",
      features_mentioned: [
        { feature: "ui", sentiment: "positive", severity: 2 },
      ],
      churn_phrases: [],
      summary: "Great app with nice UI.",
    };

    it("should accept valid review analysis", () => {
      const result = reviewAnalysisSchema.safeParse(validAnalysis);
      expect(result.success).toBe(true);
    });

    it("should reject scores below 0", () => {
      const result = reviewAnalysisSchema.safeParse({
        ...validAnalysis,
        love_score: -1,
      });
      expect(result.success).toBe(false);
    });

    it("should reject scores above 10", () => {
      const result = reviewAnalysisSchema.safeParse({
        ...validAnalysis,
        frustration_score: 11,
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid churn_risk", () => {
      const result = reviewAnalysisSchema.safeParse({
        ...validAnalysis,
        churn_risk: "Extreme",
      });
      expect(result.success).toBe(false);
    });

    it("should accept empty features_mentioned and churn_phrases", () => {
      const result = reviewAnalysisSchema.safeParse({
        ...validAnalysis,
        features_mentioned: [],
        churn_phrases: [],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("batchReviewAnalysisSchema", () => {
    it("should accept array of valid analyses", () => {
      const result = batchReviewAnalysisSchema.safeParse({
        analyses: [
          {
            love_score: 5,
            frustration_score: 5,
            loyalty_score: 5,
            momentum_score: 5,
            wom_score: 5,
            churn_risk: "Medium",
            features_mentioned: [],
            churn_phrases: [],
            summary: "Neutral review.",
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    it("should accept empty analyses array", () => {
      const result = batchReviewAnalysisSchema.safeParse({ analyses: [] });
      expect(result.success).toBe(true);
    });
  });

  describe("frictionItemSchema", () => {
    it("should accept valid friction item", () => {
      const result = frictionItemSchema.safeParse({
        feature: "login",
        score: 8.5,
        mentions: 42,
        trend: "rising",
        delta: "+15%",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid trend", () => {
      const result = frictionItemSchema.safeParse({
        feature: "login",
        score: 5,
        mentions: 10,
        trend: "increasing",
        delta: "+5%",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("churnDriverSchema", () => {
    it("should accept valid churn driver", () => {
      const result = churnDriverSchema.safeParse({
        theme: "Price increase frustration",
        count: 15,
        severity: "High",
        quotes: ["Too expensive now", "Prices went up"],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("actionItemSchema", () => {
    it("should accept valid action item", () => {
      const result = actionItemSchema.safeParse({
        title: "Fix login crashes",
        description: "Users report frequent crashes on the login screen.",
        impact: "Critical",
        priority: "P0",
        effort: "Medium",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid priority", () => {
      const result = actionItemSchema.safeParse({
        title: "Fix bug",
        description: "A bug fix",
        impact: "Low",
        priority: "P5",
        effort: "Low",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("vibeReportSchema", () => {
    it("should accept valid vibe report", () => {
      const result = vibeReportSchema.safeParse({
        summary: "Overall positive sentiment with some friction in payments.",
        friction_scores: [
          {
            feature: "payments",
            score: 7.5,
            mentions: 30,
            trend: "rising",
            delta: "+10%",
          },
        ],
        churn_drivers: [
          {
            theme: "Payment failures",
            count: 12,
            severity: "High",
            quotes: ["Payment keeps failing"],
          },
        ],
        release_impact: null,
        action_items: [
          {
            title: "Fix payment flow",
            description: "Address recurring payment failures.",
            impact: "Critical",
            priority: "P0",
            effort: "High",
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    it("should accept null release_impact", () => {
      const result = vibeReportSchema.safeParse({
        summary: "Summary",
        friction_scores: [],
        churn_drivers: [],
        release_impact: null,
        action_items: [],
      });
      expect(result.success).toBe(true);
    });
  });
});
