import { describe, it, expect } from "vitest";
import {
  searchCacheKey,
  reviewsCacheKey,
  rateLimitKey,
  analysisProgressKey,
  analysisDedupeKey,
} from "../keys";

describe("Cache key builders", () => {
  describe("searchCacheKey", () => {
    it("should normalize to lowercase and trim", () => {
      expect(searchCacheKey("  Spotify  ")).toBe("fl:search:spotify");
    });

    it("should produce consistent keys", () => {
      expect(searchCacheKey("twitter")).toBe(searchCacheKey("Twitter"));
    });
  });

  describe("reviewsCacheKey", () => {
    it("should include platform and appId", () => {
      const key = reviewsCacheKey("com.spotify.music", "android");
      expect(key).toBe("fl:reviews:android:com.spotify.music");
    });
  });

  describe("rateLimitKey", () => {
    it("should include model and identifier", () => {
      const key = rateLimitKey("user123", "gemini-2.5-flash");
      expect(key).toBe("fl:rl:gemini-2.5-flash:user123");
    });
  });

  describe("analysisProgressKey", () => {
    it("should include analysis ID", () => {
      const key = analysisProgressKey("abc-123");
      expect(key).toBe("fl:progress:abc-123");
    });
  });

  describe("analysisDedupeKey", () => {
    it("should include hash", () => {
      const key = analysisDedupeKey("Spotify", "sha256hash");
      expect(key).toBe("fl:dedupe:sha256hash");
    });
  });
});
