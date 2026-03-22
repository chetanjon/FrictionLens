import { describe, it, expect } from "vitest";
import { classifyReview } from "../classify";
import type { ParsedReview } from "@/lib/types/review";

describe("classifyReview", () => {
  describe("Tier 1 — trivial reviews (<=5 words)", () => {
    it("should classify 1-word review as tier 1", () => {
      const review: ParsedReview = { content: "Great!", rating: 5 };
      const result = classifyReview(review);
      expect(result.tier).toBe(1);
      expect(result.analysis).toBeDefined();
    });

    it("should classify 5-word review as tier 1", () => {
      const review: ParsedReview = {
        content: "This app is very good",
        rating: 4,
      };
      const result = classifyReview(review);
      expect(result.tier).toBe(1);
    });

    it("should use positive sentiment override for positive words", () => {
      const review: ParsedReview = { content: "Amazing!", rating: 2 };
      const result = classifyReview(review);
      expect(result.tier).toBe(1);
      expect(result.analysis!.love_score).toBeGreaterThanOrEqual(7);
      expect(result.analysis!.frustration_score).toBeLessThanOrEqual(1);
    });

    it("should use negative sentiment override for negative words", () => {
      const review: ParsedReview = { content: "Terrible!", rating: 4 };
      const result = classifyReview(review);
      expect(result.tier).toBe(1);
      expect(result.analysis!.frustration_score).toBeGreaterThanOrEqual(7);
      expect(result.analysis!.love_score).toBeLessThanOrEqual(2);
    });

    it("should default to neutral when no rating given", () => {
      const review: ParsedReview = { content: "Ok then" };
      const result = classifyReview(review);
      expect(result.tier).toBe(1);
      expect(result.analysis!.love_score).toBe(4);
      expect(result.analysis!.frustration_score).toBe(4);
    });
  });

  describe("Tier 2 — short reviews (6-20 words)", () => {
    it("should classify 10-word review as tier 2", () => {
      const review: ParsedReview = {
        content:
          "The app works fine but could use some improvements overall",
        rating: 3,
      };
      const result = classifyReview(review);
      expect(result.tier).toBe(2);
      expect(result.analysis).toBeDefined();
    });

    it("should detect negative sentiment in short review", () => {
      const review: ParsedReview = {
        content: "This app is broken and crashes every time I open it",
        rating: 1,
      };
      const result = classifyReview(review);
      expect(result.tier).toBe(2);
      expect(result.analysis!.frustration_score).toBeGreaterThanOrEqual(7);
    });

    it("should detect positive sentiment in short review", () => {
      const review: ParsedReview = {
        content: "Love this app so much it is amazing and wonderful",
        rating: 5,
      };
      const result = classifyReview(review);
      expect(result.tier).toBe(2);
      expect(result.analysis!.love_score).toBeGreaterThanOrEqual(7);
    });
  });

  describe("Tier 3 — complex reviews (>20 words)", () => {
    it("should classify 25-word review as tier 3", () => {
      const review: ParsedReview = {
        content:
          "I have been using this app for months now and while I love the interface the constant crashes and slow loading times are really starting to frustrate me",
        rating: 3,
      };
      const result = classifyReview(review);
      expect(result.tier).toBe(3);
      expect(result.analysis).toBeUndefined();
    });
  });

  describe("Churn risk calculation", () => {
    it("should assign Critical churn risk for 1-star negative review", () => {
      const review: ParsedReview = { content: "Terrible!", rating: 1 };
      const result = classifyReview(review);
      expect(result.analysis!.churn_risk).toBe("Critical");
    });

    it("should assign Low churn risk for 5-star positive review", () => {
      const review: ParsedReview = { content: "Amazing!", rating: 5 };
      const result = classifyReview(review);
      expect(result.analysis!.churn_risk).toBe("Low");
    });

    it("should assign Low churn risk for neutral 3-star review", () => {
      // 3-star: frustration=4, love=4, loyalty=4
      // risk = 4 - (4+4)/2 = 0, which maps to Low
      const review: ParsedReview = { content: "Fine", rating: 3 };
      const result = classifyReview(review);
      expect(result.analysis!.churn_risk).toBe("Low");
    });
  });

  describe("Rating-to-scores mapping", () => {
    it("should produce correct scores for each star rating", () => {
      const ratings = [1, 2, 3, 4, 5];
      for (const rating of ratings) {
        const review: ParsedReview = { content: "Test", rating };
        const result = classifyReview(review);
        expect(result.analysis!.love_score).toBeGreaterThanOrEqual(0);
        expect(result.analysis!.love_score).toBeLessThanOrEqual(10);
        expect(result.analysis!.frustration_score).toBeGreaterThanOrEqual(0);
        expect(result.analysis!.frustration_score).toBeLessThanOrEqual(10);
      }
    });

    it("should have higher love and lower frustration for 5 stars vs 1 star", () => {
      const five: ParsedReview = { content: "Ok", rating: 5 };
      const one: ParsedReview = { content: "Ok", rating: 1 };

      const fiveResult = classifyReview(five);
      const oneResult = classifyReview(one);

      expect(fiveResult.analysis!.love_score).toBeGreaterThan(
        oneResult.analysis!.love_score
      );
      expect(fiveResult.analysis!.frustration_score).toBeLessThan(
        oneResult.analysis!.frustration_score
      );
    });
  });

  describe("Edge cases", () => {
    it("should handle empty content gracefully", () => {
      const review: ParsedReview = { content: "", rating: 3 };
      const result = classifyReview(review);
      expect(result.tier).toBe(1);
    });

    it("should handle review with no rating", () => {
      const review: ParsedReview = { content: "Decent app overall" };
      const result = classifyReview(review);
      expect(result.analysis).toBeDefined();
    });

    it("should include empty arrays for features and churn phrases", () => {
      const review: ParsedReview = { content: "Good!", rating: 5 };
      const result = classifyReview(review);
      expect(result.analysis!.features_mentioned).toEqual([]);
      expect(result.analysis!.churn_phrases).toEqual([]);
    });
  });
});
