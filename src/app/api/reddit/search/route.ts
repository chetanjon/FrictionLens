import { NextRequest, NextResponse } from "next/server";
import { searchReddit } from "@/lib/scrapers/reddit";
import { cacheGetOrSet } from "@/lib/cache/redis";
import { redditSearchCacheKey } from "@/lib/cache/keys";


export async function GET(request: NextRequest) {
  const appName = request.nextUrl.searchParams.get("q");
  const subreddit = request.nextUrl.searchParams.get("subreddit") || undefined;

  if (!appName || appName.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing search query parameter 'q'" },
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
      { error: message.includes("Reddit") ? message : "Failed to search Reddit. Please try again." },
      { status: 500 }
    );
  }
}
