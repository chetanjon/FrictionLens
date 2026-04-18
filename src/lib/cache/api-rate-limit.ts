/**
 * Per-identifier sliding-window rate limiter for API endpoints.
 * Distinct from the per-Gemini-model limiter in `rate-limiter.ts` —
 * this one keys by user/IP and protects HTTP routes from abuse.
 *
 * Uses Upstash Redis when configured, in-memory fallback otherwise.
 */

import { Ratelimit } from "@upstash/ratelimit";

import { getRedis } from "./redis";

export type ApiRateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

const apiLimiters = new Map<string, Ratelimit>();

function getApiLimiter(namespace: string, rpm: number): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  const key = `${namespace}:${rpm}`;
  const existing = apiLimiters.get(key);
  if (existing) return existing;
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(rpm, "1 m"),
    prefix: `fl:api:${namespace}`,
  });
  apiLimiters.set(key, limiter);
  return limiter;
}

// In-memory fallback — bounded so noisy IPs can't grow the map without limit.
type Bucket = { times: number[] };
const memBuckets = new Map<string, Bucket>();
const MAX_MEM_KEYS = 5_000;

function evictOldest(count: number): void {
  const it = memBuckets.keys();
  for (let i = 0; i < count; i++) {
    const k = it.next().value;
    if (k === undefined) break;
    memBuckets.delete(k);
  }
}

function inMemoryCheck(key: string, rpm: number): ApiRateLimitResult {
  if (memBuckets.size >= MAX_MEM_KEYS) {
    evictOldest(Math.floor(MAX_MEM_KEYS / 4));
  }
  let bucket = memBuckets.get(key);
  if (bucket) {
    // Touch: re-insert to move to the end of insertion order, so evictOldest
    // behaves as LRU rather than FIFO — noisy keys stay hot, quiet ones age out.
    memBuckets.delete(key);
    memBuckets.set(key, bucket);
  } else {
    bucket = { times: [] };
    memBuckets.set(key, bucket);
  }
  const now = Date.now();
  const oneMinuteAgo = now - 60_000;
  bucket.times = bucket.times.filter((t) => t > oneMinuteAgo);
  if (bucket.times.length >= rpm) {
    const retry = Math.ceil((bucket.times[0] + 60_000 - now) / 1000);
    return { ok: false, retryAfterSeconds: Math.max(retry, 1) };
  }
  bucket.times.push(now);
  if (bucket.times.length > rpm * 4) {
    bucket.times.splice(0, bucket.times.length - rpm * 4);
  }
  return { ok: true };
}

/**
 * Check + record a request for the given namespace + identifier.
 * Returns ok: true if allowed, ok: false with a retry-after hint otherwise.
 */
export async function checkApiRateLimit(
  namespace: string,
  identifier: string,
  rpm = 30
): Promise<ApiRateLimitResult> {
  const limiter = getApiLimiter(namespace, rpm);
  if (limiter) {
    const { success, reset } = await limiter.limit(identifier);
    if (!success) {
      const retry = Math.ceil(Math.max(reset - Date.now(), 1000) / 1000);
      return { ok: false, retryAfterSeconds: retry };
    }
    return { ok: true };
  }
  return inMemoryCheck(`${namespace}:${identifier}`, rpm);
}

/**
 * Pull a best-effort client identifier from headers (proxy-aware).
 * Falls back to "unknown" rather than throwing — callers should prefer
 * an authenticated user id when available.
 */
export function clientIpFromHeaders(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    headers.get("fly-client-ip") ??
    "unknown"
  );
}

export function rateLimitResponseInit(
  result: Extract<ApiRateLimitResult, { ok: false }>
): ResponseInit {
  return {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(result.retryAfterSeconds),
    },
  };
}
