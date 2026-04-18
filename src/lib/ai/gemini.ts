/**
 * Gemini AI wrapper using Vercel AI SDK with @ai-sdk/google.
 * Includes per-model rate limiting for the free tier.
 */

import { generateText, Output } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

import type { ReviewAnalysis, ParsedReview } from "@/lib/types/review";
import {
  reviewAnalysisSchema,
  batchReviewAnalysisSchema,
} from "./schemas";
import { SYSTEM_PROMPT, buildReviewPrompt, buildBatchPrompt } from "./prompts";
import {
  checkAndRecordRequest,
  waitForRateLimit,
} from "@/lib/cache/rate-limiter";

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

// ── Retry helper for rate limit errors ──

const RATE_LIMIT_RETRY_DELAY_MS = 15_000;
const MAX_RATE_LIMIT_RETRIES = 2;

async function withRateLimitRetry<T>(
  fn: () => Promise<T>
): Promise<T> {
  for (let attempt = 0; attempt <= MAX_RATE_LIMIT_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const classified = classifyError(error);
      if (classified.code === "RATE_LIMIT" && attempt < MAX_RATE_LIMIT_RETRIES) {
        const delay = RATE_LIMIT_RETRY_DELAY_MS * (attempt + 1);
        console.warn(
          `Rate limit hit, retrying in ${delay / 1000}s (attempt ${attempt + 1}/${MAX_RATE_LIMIT_RETRIES})...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw classified;
    }
  }
  // Unreachable, but TypeScript needs it
  throw new GeminiAnalysisError("Retry exhausted", "RATE_LIMIT");
}

// ── Public API ──

export async function analyzeReview(
  review: string,
  apiKey: string,
  model?: string
): Promise<ReviewAnalysis> {
  const resolvedModel = model ?? DEFAULT_MODEL;

  return withRateLimitRetry(async () => {
    await waitForRateLimit(resolvedModel);
    await checkAndRecordRequest(resolvedModel);

    const google = createGoogleGenerativeAI({ apiKey });

    const result = await generateText({
      model: google(resolvedModel),
      output: Output.object({ schema: reviewAnalysisSchema }),
      system: SYSTEM_PROMPT,
      prompt: buildReviewPrompt(review),
    });

    const parsed = reviewAnalysisSchema.safeParse(result.output);
    if (!parsed.success) {
      throw new GeminiAnalysisError(
        `Review analysis returned malformed output: ${parsed.error.issues
          .slice(0, 3)
          .map((i) => i.message)
          .join("; ")}`,
        "MODEL_ERROR"
      );
    }
    return parsed.data as ReviewAnalysis;
  });
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

  return withRateLimitRetry(async () => {
    await waitForRateLimit(resolvedModel);
    await checkAndRecordRequest(resolvedModel);

    const google = createGoogleGenerativeAI({ apiKey });

    const result = await generateText({
      model: google(resolvedModel),
      output: Output.object({ schema: batchReviewAnalysisSchema }),
      system: SYSTEM_PROMPT,
      prompt: buildBatchPrompt(reviews),
    });

    const parsed = batchReviewAnalysisSchema.safeParse(result.output);
    if (!parsed.success) {
      throw new GeminiAnalysisError(
        `Batch analysis returned malformed output: ${parsed.error.issues
          .slice(0, 3)
          .map((i) => i.message)
          .join("; ")}`,
        "MODEL_ERROR"
      );
    }
    const analyses = parsed.data.analyses as ReviewAnalysis[];

    if (analyses.length !== reviews.length) {
      console.warn(
        `Expected ${reviews.length} analyses but got ${analyses.length}. Padding or truncating.`
      );
    }

    return analyses;
  });
}
