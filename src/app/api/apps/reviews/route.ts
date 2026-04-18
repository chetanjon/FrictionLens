import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { pullReviews } from "@/lib/scrapers";
import { cacheGetOrSet } from "@/lib/cache/redis";
import { reviewsCacheKey } from "@/lib/cache/keys";
import { createClient } from "@/lib/supabase/server";
import {
  checkApiRateLimit,
  rateLimitResponseInit,
} from "@/lib/cache/api-rate-limit";

const querySchema = z.object({
  appId: z.string().min(1).max(256),
  platform: z.enum(["android", "ios"]),
  storeId: z.coerce.number().int().positive().optional(),
  count: z.coerce.number().int().min(1).max(500).optional(),
});

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

  // Tighter limit than search since each request hits the upstream scraper.
  const limit = await checkApiRateLimit("apps-reviews", user.id, 10);
  if (!limit.ok) {
    return new NextResponse(
      JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }),
      rateLimitResponseInit(limit)
    );
  }

  const parsed = querySchema.safeParse({
    appId: request.nextUrl.searchParams.get("appId"),
    platform: request.nextUrl.searchParams.get("platform"),
    storeId: request.nextUrl.searchParams.get("storeId") ?? undefined,
    count: request.nextUrl.searchParams.get("count") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid query." },
      { status: 400 }
    );
  }

  const { appId, platform, storeId, count } = parsed.data;

  if (platform === "ios" && !storeId) {
    return NextResponse.json(
      { error: "storeId is required for iOS apps" },
      { status: 400 }
    );
  }

  const reviewCount = count ?? 200;

  try {
    const reviews = await cacheGetOrSet(
      reviewsCacheKey(appId, platform),
      3600,
      () =>
        pullReviews({
          appId,
          platform,
          storeId,
          count: reviewCount,
        })
    );

    return NextResponse.json({
      reviews,
      count: reviews.length,
    });
  } catch (err) {
    console.error("Review pull failed:", err);
    return NextResponse.json(
      { error: "Failed to pull reviews. Please try again." },
      { status: 500 }
    );
  }
}
