import { NextRequest, NextResponse } from "next/server";

import { analyzeCompetitor } from "@/lib/ai/analyze-competitor";
import { authenticateAndDecryptKey } from "@/lib/analysis/pipeline-helpers";
import { competitorRequestSchema } from "@/lib/analysis/pipeline-schemas";

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
    const { apiKey, model, supabase } =
      await authenticateAndDecryptKey(analysisId);

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
