import { NextRequest, NextResponse } from "next/server";

import { analyzeCompetitor } from "@/lib/ai/analyze-competitor";
import { authenticateAndDecryptKey } from "@/lib/analysis/pipeline-helpers";
import { competitorRequestSchema } from "@/lib/analysis/pipeline-schemas";
import {
  checkApiRateLimit,
  rateLimitResponseInit,
} from "@/lib/cache/api-rate-limit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = competitorRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 }
      );
    }

    const { analysisId, competitor } = parsed.data;
    const { userId, apiKey, model, supabase } =
      await authenticateAndDecryptKey(analysisId);

    // Called multiple times per analysis but each call hits the scraper +
    // Gemini, so cap per-user.
    const limit = await checkApiRateLimit("analyze-competitor", userId, 15);
    if (!limit.ok) {
      return new NextResponse(
        JSON.stringify({
          error: `Too many competitor requests \u2014 wait ${limit.retryAfterSeconds}s.`,
        }),
        rateLimitResponseInit(limit)
      );
    }

    // Analyze the competitor
    const compResult = await analyzeCompetitor(competitor, apiKey, model);

    // Append competitor result to the analysis record
    const { data: existing } = await supabase
      .from("analyses")
      .select("competitors")
      .eq("id", analysisId)
      .single();

    const existingCompetitors = Array.isArray(existing?.competitors)
      ? existing.competitors
      : [];

    await supabase
      .from("analyses")
      .update({
        competitors: [...existingCompetitors, compResult],
      })
      .eq("id", analysisId);

    return NextResponse.json(compResult);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
