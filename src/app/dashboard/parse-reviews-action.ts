"use server";

import { createClient } from "@/lib/supabase/server";
import { parseReviewsText, REVIEW_LIMITS } from "@/lib/csv/parse-reviews";
import {
  checkApiRateLimit,
} from "@/lib/cache/api-rate-limit";
import type { ParseResult } from "@/lib/csv/parse-reviews";

/**
 * Parse pasted text or CSV file content into reviews on the server.
 * Lets us drop the ~28KB papaparse dependency from the client bundle and
 * adds a single Zod-validated entry point for review ingestion.
 */
export async function parseReviewsAction(
  text: string
): Promise<ParseResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to upload reviews." };
  }

  const limit = await checkApiRateLimit("parse-reviews", user.id, 30);
  if (!limit.ok) {
    return {
      ok: false,
      error: `Too many parse requests — wait ${limit.retryAfterSeconds}s.`,
    };
  }

  if (typeof text !== "string") {
    return { ok: false, error: "Expected text payload." };
  }

  return parseReviewsText(text);
}

export const PARSE_REVIEWS_LIMITS = REVIEW_LIMITS;
