import { NextRequest, NextResponse } from "next/server";

import { generateText, Output } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

import { authenticateAndDecryptKey } from "@/lib/analysis/pipeline-helpers";
import { reportRequestSchema } from "@/lib/analysis/pipeline-schemas";
import { vibeReportSchema } from "@/lib/ai/schemas";
import { REPORT_SYSTEM_PROMPT, buildReportPrompt } from "@/lib/ai/prompts";
import { DEFAULT_MODEL } from "@/lib/ai/gemini";
import {
  checkApiRateLimit,
  rateLimitResponseInit,
} from "@/lib/cache/api-rate-limit";
import type { VibeReport } from "@/lib/types/review";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = reportRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 }
      );
    }

    const {
      analysisId,
      appName,
      platform,
      reviewSummaries,
      dimensionAverages,
      vibeScore,
      reviewCount,
    } = parsed.data;

    const { userId, apiKey, model, supabase } =
      await authenticateAndDecryptKey(analysisId);

    const limit = await checkApiRateLimit("analyze-report", userId, 10);
    if (!limit.ok) {
      return new NextResponse(
        JSON.stringify({
          error: `Too many report requests \u2014 wait ${limit.retryAfterSeconds}s.`,
        }),
        rateLimitResponseInit(limit)
      );
    }
    const resolvedModel = model ?? DEFAULT_MODEL;

    // Generate Vibe Report via Gemini
    const google = createGoogleGenerativeAI({ apiKey });
    const result = await generateText({
      model: google(resolvedModel),
      output: Output.object({ schema: vibeReportSchema }),
      system: REPORT_SYSTEM_PROMPT,
      prompt: buildReportPrompt(appName, reviewSummaries, dimensionAverages),
    });

    const parsedOutput = vibeReportSchema.safeParse(result.output);
    if (!parsedOutput.success) {
      return NextResponse.json(
        { error: "Vibe report generation returned malformed output." },
        { status: 502 }
      );
    }
    const output = parsedOutput.data;

    const vibeReport: VibeReport = {
      app_name: appName,
      platform,
      review_count: reviewCount,
      summary: output.summary,
      vibe_score: vibeScore,
      dimension_scores: dimensionAverages,
      friction_scores: output.friction_scores,
      churn_drivers: output.churn_drivers,
      release_impact: output.release_impact ?? undefined,
      action_items: output.action_items,
    };

    // Update analysis record with report data
    const updatePayload: Record<string, unknown> = {
      results: {
        vibe_score: vibeScore,
        dimension_scores: dimensionAverages,
        friction_scores: vibeReport.friction_scores.map((f) => ({
          feature: f.feature,
          score: f.score,
          trend: f.trend,
          mention_count: f.mentions,
          delta: f.delta,
        })),
        churn_drivers: vibeReport.churn_drivers,
        action_items: vibeReport.action_items,
        review_count: reviewCount,
        summary: vibeReport.summary,
      },
      friction_scores: vibeReport.friction_scores,
      churn_drivers: vibeReport.churn_drivers,
      action_items: vibeReport.action_items,
    };

    if (vibeReport.release_impact) {
      updatePayload.release_impact = vibeReport.release_impact;
    }

    const { error: updateError } = await supabase
      .from("analyses")
      .update(updatePayload)
      .eq("id", analysisId);

    // Fall back to minimal payload if optional columns are missing.
    if (updateError) {
      console.warn("Full report update failed, trying minimal:", {
        analysisId,
        message: updateError.message,
      });
      const { error: minError } = await supabase
        .from("analyses")
        .update({
          friction_scores: vibeReport.friction_scores,
          churn_drivers: vibeReport.churn_drivers,
          action_items: vibeReport.action_items,
        })
        .eq("id", analysisId);
      if (minError) {
        console.error("Minimal report update also failed:", {
          analysisId,
          error: minError,
        });
      }
    }

    return NextResponse.json({
      frictionScores: vibeReport.friction_scores,
      churnDrivers: vibeReport.churn_drivers,
      actionItems: vibeReport.action_items,
      releaseImpact: vibeReport.release_impact ?? null,
      summary: vibeReport.summary,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
