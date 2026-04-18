import { NextRequest, NextResponse } from "next/server";

import { authenticateAndDecryptKey } from "@/lib/analysis/pipeline-helpers";
import { finalizeRequestSchema } from "@/lib/analysis/pipeline-schemas";
import { notifySlackAnalysisComplete } from "@/lib/slack";
import { log } from "@/lib/log";
import {
  checkApiRateLimit,
  rateLimitResponseInit,
} from "@/lib/cache/api-rate-limit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = finalizeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 }
      );
    }

    const { analysisId, vibeScore, reviewCount, competitorCount, appName, userEmail } =
      parsed.data;
    const { userId, supabase } = await authenticateAndDecryptKey(analysisId);

    const limit = await checkApiRateLimit("analyze-finalize", userId, 30);
    if (!limit.ok) {
      return new NextResponse(
        JSON.stringify({
          error: `Too many finalize calls \u2014 wait ${limit.retryAfterSeconds}s.`,
        }),
        rateLimitResponseInit(limit)
      );
    }

    // Mark analysis as completed
    const { error: updateError } = await supabase
      .from("analyses")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", analysisId);

    if (updateError) {
      // Try without completed_at if column is missing
      await supabase
        .from("analyses")
        .update({ status: "completed" })
        .eq("id", analysisId);
    }

    // Fire-and-forget Slack notification — log failures so misconfigured
    // webhooks or rate-limits aren't silently dropped.
    notifySlackAnalysisComplete({
      appName,
      vibeScore,
      reviewCount,
      competitorCount,
      analysisId,
      userEmail,
    }).catch((err) => {
      log.error("slack_notify_failed", { analysisId, error: err });
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
