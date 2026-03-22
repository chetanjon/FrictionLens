import { NextRequest, NextResponse } from "next/server";

import { authenticateAndDecryptKey } from "@/lib/analysis/pipeline-helpers";
import { finalizeRequestSchema } from "@/lib/analysis/pipeline-schemas";
import { notifySlackAnalysisComplete } from "@/lib/slack";

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
    const { supabase } = await authenticateAndDecryptKey(analysisId);

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

    // Fire-and-forget Slack notification
    notifySlackAnalysisComplete({
      appName,
      vibeScore,
      reviewCount,
      competitorCount,
      analysisId,
      userEmail,
    }).catch(() => {
      /* swallow */
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
