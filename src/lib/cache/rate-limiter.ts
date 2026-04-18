/**
 * Redis-backed rate limiter with in-memory fallback.
 * Uses @upstash/ratelimit when Redis is available,
 * otherwise falls back to local in-memory buckets.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { GEMINI_MODELS, GeminiAnalysisError } from "@/lib/ai/gemini";
import { getRedis } from "./redis";

type GeminiModelId = keyof typeof GEMINI_MODELS;

// ── Redis-backed rate limiters (lazy, per-model) ──

const redisLimiters = new Map<string, Ratelimit>();

function getRedisLimiter(model: string): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  if (redisLimiters.has(model)) {
    return redisLimiters.get(model)!;
  }

  const modelId = model as GeminiModelId;
  const limits = GEMINI_MODELS[modelId];
  if (!limits) return null;

  const limiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(limits.rpm, "1 m"),
    prefix: `fl:rl:${model}`,
  });

  redisLimiters.set(model, limiter);
  return limiter;
}

// ── In-memory fallback ──

type RateLimitBucket = {
  minuteRequests: number[];
  dayRequests: number[];
};

const rateLimitBuckets = new Map<string, RateLimitBucket>();
// Hard cap so an unknown / typoed model id can't grow buckets without bound.
const MAX_TRACKED_MODELS = 32;

function getRateLimitBucket(model: string): RateLimitBucket {
  const existing = rateLimitBuckets.get(model);
  if (existing) return existing;
  if (rateLimitBuckets.size >= MAX_TRACKED_MODELS) {
    // Evict the oldest insertion to keep the map bounded.
    const oldestKey = rateLimitBuckets.keys().next().value;
    if (oldestKey !== undefined) rateLimitBuckets.delete(oldestKey);
  }
  const bucket: RateLimitBucket = { minuteRequests: [], dayRequests: [] };
  rateLimitBuckets.set(model, bucket);
  return bucket;
}

function pruneBucket(bucket: RateLimitBucket, now: number): void {
  const oneMinuteAgo = now - 60_000;
  const oneDayAgo = now - 86_400_000;
  bucket.minuteRequests = bucket.minuteRequests.filter((t) => t > oneMinuteAgo);
  bucket.dayRequests = bucket.dayRequests.filter((t) => t > oneDayAgo);
}

function checkRateLimitInMemory(model: string): void {
  const modelId = model as GeminiModelId;
  const limits = GEMINI_MODELS[modelId];
  if (!limits) return;

  const bucket = getRateLimitBucket(model);
  const now = Date.now();
  pruneBucket(bucket, now);

  if (bucket.minuteRequests.length >= limits.rpm) {
    const waitMs = bucket.minuteRequests[0] + 60_000 - now;
    throw new GeminiAnalysisError(
      `Rate limit: ${limits.rpm} requests/min for ${limits.label}. Wait ${Math.ceil(waitMs / 1000)}s.`,
      "RATE_LIMIT"
    );
  }

  if (bucket.dayRequests.length >= limits.rpd) {
    throw new GeminiAnalysisError(
      `Daily limit reached: ${limits.rpd} requests/day for ${limits.label}. Try again tomorrow or switch to a model with higher limits.`,
      "RATE_LIMIT"
    );
  }
}

function recordRequestInMemory(model: string): void {
  const bucket = getRateLimitBucket(model);
  const now = Date.now();
  bucket.minuteRequests.push(now);
  bucket.dayRequests.push(now);
  // Belt-and-braces cap so a runaway caller can't grow arrays without bound
  // even if pruneBucket isn't called for a while.
  const modelId = model as GeminiModelId;
  const limits = GEMINI_MODELS[modelId];
  const minuteCap = (limits?.rpm ?? 60) * 4;
  const dayCap = (limits?.rpd ?? 5000) * 2;
  if (bucket.minuteRequests.length > minuteCap) {
    bucket.minuteRequests.splice(0, bucket.minuteRequests.length - minuteCap);
  }
  if (bucket.dayRequests.length > dayCap) {
    bucket.dayRequests.splice(0, bucket.dayRequests.length - dayCap);
  }
}

// ── Public API ──

/**
 * Check rate limit and record the request atomically.
 * Uses Redis sliding window when available, in-memory fallback otherwise.
 */
export async function checkAndRecordRequest(model: string): Promise<void> {
  const limiter = getRedisLimiter(model);

  if (limiter) {
    const { success, reset } = await limiter.limit(model);
    if (!success) {
      const modelId = model as GeminiModelId;
      const limits = GEMINI_MODELS[modelId];
      const waitMs = reset - Date.now();
      throw new GeminiAnalysisError(
        `Rate limit: ${limits?.rpm ?? "?"} requests/min for ${limits?.label ?? model}. Wait ${Math.ceil(Math.max(waitMs, 1000) / 1000)}s.`,
        "RATE_LIMIT"
      );
    }
    return;
  }

  // In-memory fallback
  checkRateLimitInMemory(model);
  recordRequestInMemory(model);
}

/**
 * Wait until rate limit allows the next request.
 * Peeks at the current state without consuming a token; the consume happens in
 * checkAndRecordRequest.
 */
export async function waitForRateLimit(model: string): Promise<void> {
  const limiter = getRedisLimiter(model);

  if (limiter) {
    // getRemaining is a non-consuming peek (limit() would burn an extra token).
    const { remaining, reset } = await limiter.getRemaining(model);
    if (remaining <= 0) {
      const waitMs = reset - Date.now() + 100;
      if (waitMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }
    return;
  }

  // In-memory fallback
  const modelId = model as GeminiModelId;
  const limits = GEMINI_MODELS[modelId];
  if (!limits) return;

  const bucket = getRateLimitBucket(model);
  const now = Date.now();
  pruneBucket(bucket, now);

  if (bucket.minuteRequests.length >= limits.rpm) {
    const waitMs = bucket.minuteRequests[0] + 60_000 - now + 100;
    if (waitMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
}
