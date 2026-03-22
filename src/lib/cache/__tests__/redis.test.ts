import { describe, it, expect, beforeEach } from "vitest";
import { getRedis, cacheGet, cacheSet, cacheGetOrSet } from "../redis";

describe("Redis cache helpers", () => {
  beforeEach(() => {
    // Ensure Redis env vars are not set for unit tests
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  describe("getRedis", () => {
    it("should return null when env vars are not set", () => {
      const client = getRedis();
      expect(client).toBeNull();
    });
  });

  describe("cacheGet — no Redis", () => {
    it("should return null when Redis is unavailable", async () => {
      const result = await cacheGet("some-key");
      expect(result).toBeNull();
    });
  });

  describe("cacheSet — no Redis", () => {
    it("should not throw when Redis is unavailable", async () => {
      await expect(
        cacheSet("some-key", { data: "test" }, 300)
      ).resolves.not.toThrow();
    });
  });

  describe("cacheGetOrSet — no Redis", () => {
    it("should call compute function when Redis is unavailable", async () => {
      let called = false;
      const result = await cacheGetOrSet("key", 300, async () => {
        called = true;
        return { value: 42 };
      });
      expect(called).toBe(true);
      expect(result).toEqual({ value: 42 });
    });

    it("should always recompute without Redis (no caching)", async () => {
      let callCount = 0;
      const compute = async () => {
        callCount++;
        return callCount;
      };

      const r1 = await cacheGetOrSet("key", 300, compute);
      const r2 = await cacheGetOrSet("key", 300, compute);
      expect(r1).toBe(1);
      expect(r2).toBe(2);
    });
  });
});
