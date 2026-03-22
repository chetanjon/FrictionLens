import { describe, it, expect, beforeEach } from "vitest";
import { checkAndRecordRequest, waitForRateLimit } from "../rate-limiter";

describe("Rate limiter — in-memory fallback", () => {
  beforeEach(() => {
    // Ensure Redis is not available
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("should allow requests within rate limits", async () => {
    await expect(
      checkAndRecordRequest("gemini-2.0-flash")
    ).resolves.not.toThrow();
  });

  it("should not throw for unknown models", async () => {
    await expect(
      checkAndRecordRequest("unknown-model")
    ).resolves.not.toThrow();
  });

  it("should not throw from waitForRateLimit", async () => {
    await expect(
      waitForRateLimit("gemini-2.5-flash")
    ).resolves.not.toThrow();
  });
});
