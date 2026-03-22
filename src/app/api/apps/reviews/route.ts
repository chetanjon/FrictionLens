import { NextRequest, NextResponse } from "next/server";
import { pullReviews } from "@/lib/scrapers";
import { cacheGetOrSet } from "@/lib/cache/redis";
import { reviewsCacheKey } from "@/lib/cache/keys";

export async function GET(request: NextRequest) {
  const appId = request.nextUrl.searchParams.get("appId");
  const platform = request.nextUrl.searchParams.get("platform") as
    | "android"
    | "ios"
    | null;
  const storeId = request.nextUrl.searchParams.get("storeId");
  const count = request.nextUrl.searchParams.get("count");

  if (!appId || !platform) {
    return NextResponse.json(
      { error: "Missing required parameters: appId, platform" },
      { status: 400 }
    );
  }

  if (platform !== "android" && platform !== "ios") {
    return NextResponse.json(
      { error: "Platform must be 'android' or 'ios'" },
      { status: 400 }
    );
  }

  if (platform === "ios" && !storeId) {
    return NextResponse.json(
      { error: "storeId is required for iOS apps" },
      { status: 400 }
    );
  }

  const reviewCount = count ? Math.min(Number(count), 500) : 200;

  try {
    const reviews = await cacheGetOrSet(
      reviewsCacheKey(appId, platform),
      3600,
      () =>
        pullReviews({
          appId,
          platform,
          storeId: storeId ? Number(storeId) : undefined,
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
