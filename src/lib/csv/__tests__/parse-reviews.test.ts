import { describe, it, expect } from "vitest";
import { parseReviewsText, REVIEW_LIMITS } from "../parse-reviews";

describe("parseReviewsText", () => {
  it("returns an error for empty input", () => {
    const r = parseReviewsText("");
    expect(r.ok).toBe(false);
  });

  it("parses plain-text reviews one per line", () => {
    const r = parseReviewsText("first review\nsecond review\nthird review");
    if (!r.ok) throw new Error("expected ok");
    expect(r.format).toBe("plain");
    expect(r.totalCount).toBe(3);
    expect(r.reviews[0].content).toBe("first review");
  });

  it("detects CSV with required content column", () => {
    const csv = ["review,rating", "great app,5", "buggy,2"].join("\n");
    const r = parseReviewsText(csv);
    if (!r.ok) throw new Error("expected ok");
    expect(r.format).toBe("csv");
    expect(r.totalCount).toBe(2);
    expect(r.reviews[0].rating).toBe(5);
    expect(r.mapping?.content).toBe("review");
    expect(r.mapping?.rating).toBe("rating");
  });

  it("rejects CSVs with no recognised content column", () => {
    const csv = ["foo,bar", "1,2"].join("\n");
    const r = parseReviewsText(csv);
    expect(r.ok).toBe(false);
  });

  it("caps reviews at REVIEW_LIMITS.maxReviews", () => {
    const lines = Array.from(
      { length: REVIEW_LIMITS.maxReviews + 50 },
      (_, i) => `review ${i}`
    );
    const r = parseReviewsText(lines.join("\n"));
    if (!r.ok) throw new Error("expected ok");
    expect(r.totalCount).toBe(REVIEW_LIMITS.maxReviews);
  });

  it("rejects payloads above the byte cap", () => {
    const big = "a".repeat(REVIEW_LIMITS.maxBytes + 1);
    const r = parseReviewsText(big);
    expect(r.ok).toBe(false);
  });

  it("drops CSV rows whose content exceeds the per-review cap", () => {
    const tooLong = "x".repeat(REVIEW_LIMITS.maxContentChars + 1);
    // Use a proper CSV with a comma so looksLikeCsv triggers the CSV path.
    const csv = [
      "review,rating",
      "ok one,5",
      `${tooLong},5`,
      "another ok,4",
    ].join("\n");
    const r = parseReviewsText(csv);
    if (!r.ok) throw new Error("expected ok");
    expect(r.format).toBe("csv");
    expect(r.totalCount).toBe(2);
  });
});
