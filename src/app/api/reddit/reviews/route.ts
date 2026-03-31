import { NextRequest, NextResponse } from "next/server";
import { pullRedditReviews } from "@/lib/scrapers/reddit";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const appName = request.nextUrl.searchParams.get("appName");
  const subreddit = request.nextUrl.searchParams.get("subreddit") || undefined;
  const countParam = request.nextUrl.searchParams.get("count");

  if (!appName || appName.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing required parameter: appName" },
      { status: 400 }
    );
  }

  const count = countParam ? Math.min(Number(countParam), 500) : 200;

  try {
    const reviews = await pullRedditReviews({
      appName: appName.trim(),
      subreddit,
      count,
    });

    return NextResponse.json({
      reviews,
      count: reviews.length,
    });
  } catch (err) {
    console.error("Reddit review pull failed:", err);
    return NextResponse.json(
      { error: "Failed to pull Reddit comments. Please try again." },
      { status: 500 }
    );
  }
}
