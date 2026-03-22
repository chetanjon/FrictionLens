import { describe, it, expect } from "vitest";

/**
 * Vibe Score Formula (from CLAUDE.md):
 * vibeScore = (avgLove * 0.25 + (10 - avgFrustration) * 0.25 + avgLoyalty * 0.2 + avgMomentum * 0.15 + avgWom * 0.15) * 10
 *
 * Result is 0-100 scale.
 */
function computeVibeScore(dimensions: {
  love: number;
  frustration: number;
  loyalty: number;
  momentum: number;
  wom: number;
}): number {
  const { love, frustration, loyalty, momentum, wom } = dimensions;
  return (
    (love * 0.25 +
      (10 - frustration) * 0.25 +
      loyalty * 0.2 +
      momentum * 0.15 +
      wom * 0.15) *
    10
  );
}

describe("Vibe Score Calculation", () => {
  it("should return 100 for perfect scores", () => {
    const score = computeVibeScore({
      love: 10,
      frustration: 0,
      loyalty: 10,
      momentum: 10,
      wom: 10,
    });
    expect(score).toBe(100);
  });

  it("should return 0 for worst possible scores", () => {
    const score = computeVibeScore({
      love: 0,
      frustration: 10,
      loyalty: 0,
      momentum: 0,
      wom: 0,
    });
    expect(score).toBe(0);
  });

  it("should return 50 for all-neutral scores", () => {
    const score = computeVibeScore({
      love: 5,
      frustration: 5,
      loyalty: 5,
      momentum: 5,
      wom: 5,
    });
    expect(score).toBe(50);
  });

  it("should weight love and frustration equally at 25% each", () => {
    const baseDimensions = {
      love: 5,
      frustration: 5,
      loyalty: 5,
      momentum: 5,
      wom: 5,
    };

    const withHighLove = computeVibeScore({ ...baseDimensions, love: 10 });
    const withLowFrustration = computeVibeScore({
      ...baseDimensions,
      frustration: 0,
    });

    // Both should increase by 12.5 (5 * 0.25 * 10)
    expect(withHighLove - 50).toBeCloseTo(12.5);
    expect(withLowFrustration - 50).toBeCloseTo(12.5);
  });

  it("should weight loyalty at 20%", () => {
    const base = computeVibeScore({
      love: 5,
      frustration: 5,
      loyalty: 0,
      momentum: 5,
      wom: 5,
    });
    const high = computeVibeScore({
      love: 5,
      frustration: 5,
      loyalty: 10,
      momentum: 5,
      wom: 5,
    });
    // Difference should be 10 * 0.2 * 10 = 20
    expect(high - base).toBeCloseTo(20);
  });

  it("should weight momentum and wom at 15% each", () => {
    const base = computeVibeScore({
      love: 5,
      frustration: 5,
      loyalty: 5,
      momentum: 0,
      wom: 5,
    });
    const high = computeVibeScore({
      love: 5,
      frustration: 5,
      loyalty: 5,
      momentum: 10,
      wom: 5,
    });
    expect(high - base).toBeCloseTo(15);
  });

  it("should handle decimal dimension scores", () => {
    const score = computeVibeScore({
      love: 7.5,
      frustration: 2.3,
      loyalty: 6.8,
      momentum: 5.1,
      wom: 8.2,
    });
    expect(score).toBeGreaterThan(50);
    expect(score).toBeLessThan(100);
  });

  describe("Color thresholds", () => {
    it("should be blue (>=75)", () => {
      const score = computeVibeScore({
        love: 9,
        frustration: 1,
        loyalty: 8,
        momentum: 7,
        wom: 8,
      });
      expect(score).toBeGreaterThanOrEqual(75);
    });

    it("should be amber (>=50, <75)", () => {
      const score = computeVibeScore({
        love: 5,
        frustration: 5,
        loyalty: 5,
        momentum: 5,
        wom: 5,
      });
      expect(score).toBeGreaterThanOrEqual(50);
      expect(score).toBeLessThan(75);
    });

    it("should be red (<50)", () => {
      const score = computeVibeScore({
        love: 2,
        frustration: 8,
        loyalty: 2,
        momentum: 2,
        wom: 2,
      });
      expect(score).toBeLessThan(50);
    });
  });
});
