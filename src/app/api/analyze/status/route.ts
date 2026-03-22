/**
 * GET /api/analyze/status?id=<analysisId>
 * Polls analysis progress from Redis, falls back to checking the analyses table.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAnalysisProgress } from "@/lib/inngest/progress";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const analysisId = request.nextUrl.searchParams.get("id");

  if (!analysisId) {
    return NextResponse.json(
      { error: "Missing ?id query parameter." },
      { status: 400 }
    );
  }

  // 1. Check Redis progress first (set by Inngest worker)
  const progress = await getAnalysisProgress(analysisId);
  if (progress) {
    return NextResponse.json({
      status: progress.status,
      step: progress.step,
      progress: progress.progress,
      analysisId,
    });
  }

  // 2. Fall back to checking the analyses table directly
  const supabase = await createClient();
  const { data: analysis, error } = await supabase
    .from("analyses")
    .select("status, vibe_score")
    .eq("id", analysisId)
    .single();

  if (error || !analysis) {
    return NextResponse.json(
      { error: "Analysis not found." },
      { status: 404 }
    );
  }

  if (analysis.status === "completed") {
    return NextResponse.json({
      status: "completed",
      step: "Done",
      progress: 100,
      analysisId,
    });
  }

  if (analysis.status === "failed") {
    return NextResponse.json({
      status: "failed",
      step: "Failed",
      progress: 0,
      analysisId,
    });
  }

  // Still processing but no Redis entry — Inngest hasn't started yet or Redis is down
  return NextResponse.json({
    status: "processing",
    step: "Queued...",
    progress: 0,
    analysisId,
  });
}
