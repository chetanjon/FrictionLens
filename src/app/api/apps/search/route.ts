import { NextRequest, NextResponse } from "next/server";
import { searchApps } from "@/lib/scrapers";
import { cacheGetOrSet } from "@/lib/cache/redis";
import { searchCacheKey } from "@/lib/cache/keys";
import { createClient } from "@/lib/supabase/server";
import {
  checkApiRateLimit,
  rateLimitResponseInit,
} from "@/lib/cache/api-rate-limit";

export async function GET(request: NextRequest) {
  // Auth — these endpoints proxy to App Store / Play Store scrapers; they must
  // not be open to the public internet (otherwise we get used as a free
  // scraping proxy and burn through quotas).
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

  const limit = await checkApiRateLimit("apps-search", user.id, 30);
  if (!limit.ok) {
    return new NextResponse(
      JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }),
      rateLimitResponseInit(limit)
    );
  }

  const term = request.nextUrl.searchParams.get("q");
  if (!term || term.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing search query parameter 'q'" },
      { status: 400 }
    );
  }

  // Defensive cap so a single request can't cause an unbounded upstream call.
  if (term.length > 200) {
    return NextResponse.json(
      { error: "Search query too long." },
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
