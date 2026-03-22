/**
 * Upstash Redis caching layer with lazy singleton and graceful fallback.
 * Returns null / no-ops when Redis is not configured.
 */

import { Redis } from "@upstash/redis";

// ── Lazy singleton ──

let redisInstance: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (redisInstance !== undefined) return redisInstance;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    redisInstance = null;
    return null;
  }

  redisInstance = new Redis({ url, token });
  return redisInstance;
}

// ── Generic helpers ──

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;

  try {
    const value = await redis.get<T>(key);
    return value ?? null;
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch {
    // Silently fail — caching is best-effort
  }
}

export async function cacheDel(key: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.del(key);
  } catch {
    // Silently fail — caching is best-effort
  }
}

export async function cacheGetOrSet<T>(
  key: string,
  ttlSeconds: number,
  compute: () => Promise<T>
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;

  const result = await compute();
  await cacheSet(key, result, ttlSeconds);
  return result;
}
