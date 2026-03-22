import { NextRequest, NextResponse } from "next/server";
import { searchApps } from "@/lib/scrapers";
import { cacheGetOrSet } from "@/lib/cache/redis";
import { searchCacheKey } from "@/lib/cache/keys";

export async function GET(request: NextRequest) {
  const term = request.nextUrl.searchParams.get("q");

  if (!term || term.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing search query parameter 'q'" },
      { status: 400 }
    );
  }

  const normalizedTerm = term.trim().toLowerCase();

  try {
    const results = await cacheGetOrSet(
      searchCacheKey(normalizedTerm),
      1800,
      () => searchApps(normalizedTerm, 5)
    );
    return NextResponse.json({ results });
  } catch (err) {
    console.error("App search failed:", err);
    return NextResponse.json(
      { error: "Failed to search app stores. Please try again." },
      { status: 500 }
    );
  }
}
