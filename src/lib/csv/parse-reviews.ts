/**
 * Server-side review parsing.
 * Pulls papaparse out of the client bundle and centralises column detection
 * + Zod validation that previously lived in two near-duplicate components.
 */

import Papa from "papaparse";
import { z } from "zod";

import type { ParsedReview } from "@/lib/types/review";

const CONTENT_COLUMNS = ["review", "text", "body", "content", "comment"];
const RATING_COLUMNS = ["rating", "score", "stars"];
const DATE_COLUMNS = ["date", "review_date", "created", "timestamp"];
const AUTHOR_COLUMNS = ["author", "user", "username", "name"];
const VERSION_COLUMNS = ["version", "app_version"];
const PLATFORM_COLUMNS = ["platform"];

export const REVIEW_LIMITS = {
  maxBytes: 5 * 1024 * 1024, // 5 MB raw text — far above legit usage
  maxReviews: 5_000,
  maxContentChars: 8_000,
};

export type ColumnMapping = {
  content: string | null;
  rating: string | null;
  date: string | null;
  author: string | null;
  version: string | null;
  platform: string | null;
};

export type ParseSuccess = {
  ok: true;
  reviews: ParsedReview[];
  totalCount: number;
  format: "csv" | "plain";
  mapping: ColumnMapping | null;
  headers: string[] | null;
};

export type ParseFailure = {
  ok: false;
  error: string;
};

export type ParseResult = ParseSuccess | ParseFailure;

const reviewSchema = z.object({
  content: z.string().min(1).max(REVIEW_LIMITS.maxContentChars),
  rating: z.number().min(0).max(10).optional(),
  date: z.string().max(64).optional(),
  author: z.string().max(256).optional(),
  version: z.string().max(64).optional(),
  platform: z.string().max(32).optional(),
});

function detectColumnMapping(headers: string[]): ColumnMapping {
  const lower = headers.map((h) => h.toLowerCase().trim());
  function findMatch(candidates: string[]): string | null {
    for (const c of candidates) {
      const idx = lower.indexOf(c);
      if (idx !== -1) return headers[idx];
    }
    return null;
  }
  return {
    content: findMatch(CONTENT_COLUMNS),
    rating: findMatch(RATING_COLUMNS),
    date: findMatch(DATE_COLUMNS),
    author: findMatch(AUTHOR_COLUMNS),
    version: findMatch(VERSION_COLUMNS),
    platform: findMatch(PLATFORM_COLUMNS),
  };
}

function looksLikeCsv(text: string): boolean {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return false;

  const commaCountFirst = (lines[0].match(/,/g) || []).length;
  if (commaCountFirst === 0) return false;

  let matches = 0;
  const sampleSize = Math.min(lines.length - 1, 9);
  for (let i = 1; i <= sampleSize; i++) {
    const count = (lines[i].match(/,/g) || []).length;
    if (Math.abs(count - commaCountFirst) <= 1) matches++;
  }
  return matches / sampleSize >= 0.5;
}

function safeReview(raw: unknown): ParsedReview | null {
  const parsed = reviewSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

function parseCsv(text: string): ParseResult {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  const headers = result.meta.fields;
  if (!headers || headers.length === 0) {
    return { ok: false, error: "No columns detected in the file." };
  }

  const mapping = detectColumnMapping(headers);
  if (!mapping.content) {
    return {
      ok: false,
      error: `Could not detect a review content column. Found columns: ${headers.join(", ")}. Expected one of: ${CONTENT_COLUMNS.join(", ")}`,
    };
  }

  const reviews: ParsedReview[] = [];
  for (const row of result.data) {
    const content = row[mapping.content]?.trim();
    if (!content) continue;
    const rating = mapping.rating ? parseFloat(row[mapping.rating]) : undefined;
    const candidate: ParsedReview = {
      content,
      rating: rating !== undefined && !isNaN(rating) ? rating : undefined,
      date: mapping.date ? row[mapping.date]?.trim() || undefined : undefined,
      author: mapping.author
        ? row[mapping.author]?.trim() || undefined
        : undefined,
      version: mapping.version
        ? row[mapping.version]?.trim() || undefined
        : undefined,
      platform: mapping.platform
        ? row[mapping.platform]?.trim() || undefined
        : undefined,
    };
    const safe = safeReview(candidate);
    if (safe) reviews.push(safe);
    if (reviews.length >= REVIEW_LIMITS.maxReviews) break;
  }

  if (reviews.length === 0) {
    return { ok: false, error: "No valid reviews found in the file." };
  }

  return {
    ok: true,
    reviews,
    totalCount: reviews.length,
    format: "csv",
    mapping,
    headers,
  };
}

function parsePlain(text: string): ParseResult {
  const reviews: ParsedReview[] = [];
  for (const line of text.split("\n")) {
    const content = line.trim();
    if (!content) continue;
    const safe = safeReview({ content });
    if (safe) reviews.push(safe);
    if (reviews.length >= REVIEW_LIMITS.maxReviews) break;
  }
  if (reviews.length === 0) {
    return { ok: false, error: "No reviews found in the pasted text." };
  }
  return {
    ok: true,
    reviews,
    totalCount: reviews.length,
    format: "plain",
    mapping: null,
    headers: null,
  };
}

export function parseReviewsText(text: string): ParseResult {
  if (!text || !text.trim()) {
    return { ok: false, error: "Text is empty." };
  }
  // Bytes, not chars, so multi-byte content can't bypass the cap.
  if (Buffer.byteLength(text, "utf8") > REVIEW_LIMITS.maxBytes) {
    return {
      ok: false,
      error: `Input exceeds ${Math.round(REVIEW_LIMITS.maxBytes / 1024 / 1024)}MB limit.`,
    };
  }
  return looksLikeCsv(text) ? parseCsv(text) : parsePlain(text);
}
