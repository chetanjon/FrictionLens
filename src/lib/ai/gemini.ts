/**
 * Gemini AI wrapper using Vercel AI SDK with @ai-sdk/google.
 * Includes per-model rate limiting for the free tier.
 */

import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

import type { ReviewAnalysis, ParsedReview } from "@/lib/types/review";
import { reviewAnalysisSchema, batchReviewAnalysisSchema } from "./schemas";
import { SYSTEM_PROMPT, buildReviewPrompt, buildBatchPrompt } from "./prompts";

// ── Model definitions with free-tier rate limits ──

export const GEMINI_MODELS = {
  "gemini-2.5-flash": {
    label: "Gemini 2.5 Flash",
    description: "Best price-performance, fast and capable",
    rpm: 10,
    rpd: 250,
    tpm: 250_000,
  },
  "gemini-2.5-flash-lite": {
    label: "Gemini 2.5 Flash-Lite",
    description: "Fastest, budget-friendly",
    rpm: 15,
    rpd: 1000,
    tpm: 250_000,
  },
  "gemini-2.5-pro": {
    label: "Gemini 2.5 Pro",
    description: "Most advanced, deep reasoning",
    rpm: 5,
    rpd: 100,
    tpm: 250_000,
  },
  "gemini-2.0-flash": {
    label: "Gemini 2.0 Flash",
    description: "Previous gen, stable",
    rpm: 15,
    rpd: 1500,
    tpm: 1_000_000,
  },
} as const;

export type GeminiModelId = keyof typeof GEMINI_MODELS;

export const DEFAULT_MODEL: GeminiModelId = "gemini-2.5-flash";

export const MODEL_OPTIONS = Object.entries(GEMINI_MODELS).map(
  ([id, info]) => ({
    value: id,
    label: info.label,
    description: info.description,
    rpm: info.rpm,
    rpd: info.rpd,
  })
);

// ── In-memory rate limiter (per model) ──

type RateLimitBucket = {
  minuteRequests: number[];
  dayRequests: number[];
};

const rateLimitBuckets = new Map<string, RateLimitBucket>();

function getRateLimitBucket(model: string): RateLimitBucket {
  if (!rateLimitBuckets.has(model)) {
    rateLimitBuckets.set(model, { minuteRequests: [], dayRequests: [] });
  }
  return rateLimitBuckets.get(model)!;
}

function checkRateLimit(model: string): void {
  const modelId = model as GeminiModelId;
  const limits = GEMINI_MODELS[modelId];
  if (!limits) return; // unknown model, skip limiting

  const bucket = getRateLimitBucket(model);
  const now = Date.now();
  const oneMinuteAgo = now - 60_000;
  const oneDayAgo = now - 86_400_000;

  // Clean old entries
  bucket.minuteRequests = bucket.minuteRequests.filter((t) => t > oneMinuteAgo);
  bucket.dayRequests = bucket.dayRequests.filter((t) => t > oneDayAgo);

  if (bucket.minuteRequests.length >= limits.rpm) {
    const waitMs =
      bucket.minuteRequests[0] + 60_000 - now;
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

function recordRequest(model: string): void {
  const bucket = getRateLimitBucket(model);
  const now = Date.now();
  bucket.minuteRequests.push(now);
  bucket.dayRequests.push(now);
}

// ── Delay helper for respecting RPM ──

async function waitForRateLimit(model: string): Promise<void> {
  const modelId = model as GeminiModelId;
  const limits = GEMINI_MODELS[modelId];
  if (!limits) return;

  const bucket = getRateLimitBucket(model);
  const now = Date.now();
  const oneMinuteAgo = now - 60_000;
  bucket.minuteRequests = bucket.minuteRequests.filter((t) => t > oneMinuteAgo);

  if (bucket.minuteRequests.length >= limits.rpm) {
    const waitMs = bucket.minuteRequests[0] + 60_000 - now + 100;
    if (waitMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
}

// ── Error classification ──

export class GeminiAnalysisError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "INVALID_API_KEY"
      | "RATE_LIMIT"
      | "MODEL_ERROR"
      | "UNKNOWN",
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "GeminiAnalysisError";
  }
}

function classifyError(error: unknown): GeminiAnalysisError {
  if (error instanceof GeminiAnalysisError) return error;

  const message = error instanceof Error ? error.message : String(error);

  if (
    message.includes("API key") ||
    message.includes("401") ||
    message.includes("UNAUTHENTICATED")
  ) {
    return new GeminiAnalysisError(
      "Invalid or missing Google API key. Please check your API key and try again.",
      "INVALID_API_KEY",
      error
    );
  }

  if (
    message.includes("429") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("rate")
  ) {
    return new GeminiAnalysisError(
      "Rate limit exceeded. Please wait a moment and try again.",
      "RATE_LIMIT",
      error
    );
  }

  if (
    message.includes("model") ||
    message.includes("404") ||
    message.includes("NOT_FOUND")
  ) {
    return new GeminiAnalysisError(
      `Model error: ${message}`,
      "MODEL_ERROR",
      error
    );
  }

  return new GeminiAnalysisError(
    `Analysis failed: ${message}`,
    "UNKNOWN",
    error
  );
}

// ── Public API ──

export async function analyzeReview(
  review: string,
  apiKey: string,
  model?: string
): Promise<ReviewAnalysis> {
  const resolvedModel = model ?? DEFAULT_MODEL;

  try {
    await waitForRateLimit(resolvedModel);
    checkRateLimit(resolvedModel);

    const google = createGoogleGenerativeAI({ apiKey });

    const result = await generateObject({
      model: google(resolvedModel),
      schema: reviewAnalysisSchema,
      system: SYSTEM_PROMPT,
      prompt: buildReviewPrompt(review),
    });

    recordRequest(resolvedModel);
    return result.object as ReviewAnalysis;
  } catch (error) {
    throw classifyError(error);
  }
}

export async function analyzeReviewBatch(
  reviews: ParsedReview[],
  apiKey: string,
  model?: string
): Promise<ReviewAnalysis[]> {
  if (reviews.length === 0) return [];

  const resolvedModel = model ?? DEFAULT_MODEL;

  // For a single review, use the single-review endpoint
  if (reviews.length === 1) {
    const analysis = await analyzeReview(reviews[0].content, apiKey, resolvedModel);
    return [analysis];
  }

  try {
    await waitForRateLimit(resolvedModel);
    checkRateLimit(resolvedModel);

    const google = createGoogleGenerativeAI({ apiKey });

    const result = await generateObject({
      model: google(resolvedModel),
      schema: batchReviewAnalysisSchema,
      system: SYSTEM_PROMPT,
      prompt: buildBatchPrompt(reviews),
    });

    recordRequest(resolvedModel);
    const analyses = result.object.analyses as ReviewAnalysis[];

    if (analyses.length !== reviews.length) {
      console.warn(
        `Expected ${reviews.length} analyses but got ${analyses.length}. Padding or truncating.`
      );
    }

    return analyses;
  } catch (error) {
    throw classifyError(error);
  }
}
