import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { pullRedditReviews } from "@/lib/scrapers/reddit";
import { createClient } from "@/lib/supabase/server";
import {
  checkApiRateLimit,
  rateLimitResponseInit,
} from "@/lib/cache/api-rate-limit";

const querySchema = z.object({
  appName: z.string().min(1).max(200),
  subreddit: z.string().max(100).optional(),
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

  const limit = await checkApiRateLimit("reddit-reviews", user.id, 10);
  if (!limit.ok) {
    return new NextResponse(
      JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }),
      rateLimitResponseInit(limit)
    );
  }

  const parsed = querySchema.safeParse({
    appName: request.nextUrl.searchParams.get("appName"),
    subreddit: request.nextUrl.searchParams.get("subreddit") ?? undefined,
    count: request.nextUrl.searchParams.get("count") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid query." },
      { status: 400 }
    );
  }

  const { appName, subreddit, count } = parsed.data;

  try {
    const reviews = await pullRedditReviews({
      appName: appName.trim(),
      subreddit,
      count: count ?? 200,
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
