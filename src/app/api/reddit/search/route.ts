import { NextRequest, NextResponse } from "next/server";
import { searchReddit } from "@/lib/scrapers/reddit";
import { cacheGetOrSet } from "@/lib/cache/redis";
import { redditSearchCacheKey } from "@/lib/cache/keys";
import { createClient } from "@/lib/supabase/server";
import {
  checkApiRateLimit,
  rateLimitResponseInit,
} from "@/lib/cache/api-rate-limit";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const limit = await checkApiRateLimit("reddit-search", user.id, 30);
  if (!limit.ok) {
    return new NextResponse(
      JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }),
      rateLimitResponseInit(limit)
    );
  }

  const appName = request.nextUrl.searchParams.get("q");
  const subreddit = request.nextUrl.searchParams.get("subreddit") || undefined;

  if (!appName || appName.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing search query parameter 'q'" },
      { status: 400 }
    );
  }

  if (appName.length > 200 || (subreddit && subreddit.length > 100)) {
    return NextResponse.json(
      { error: "Query too long." },
      { status: 400 }
    );
  }

  const normalized = appName.trim().toLowerCase();

  try {
    const results = await cacheGetOrSet(
      redditSearchCacheKey(normalized, subreddit),
      1800,
      () => searchReddit(normalized, subreddit)
    );
    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Reddit search failed:", message, err);
    return NextResponse.json(
      {
        error: message.includes("Reddit")
          ? message
          : "Failed to search Reddit. Please try again.",
      },
      { status: 500 }
    );
  }
}
