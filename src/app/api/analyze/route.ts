import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/crypto";
import { classifyReview } from "@/lib/ai/classify";
import { analyzeReviewBatch } from "@/lib/ai/gemini";
import { generateVibeReport } from "@/lib/ai/generate-report";
import { analyzeCompetitor } from "@/lib/ai/analyze-competitor";
import type { CompetitorInput, CompetitorResult } from "@/lib/ai/analyze-competitor";
import type {
  ParsedReview,
  ReviewAnalysis,
  AnalysisResult,
  VibeReport,
} from "@/lib/types/review";

/**
 * POST /api/analyze
 * Runs the analysis pipeline with SSE progress streaming.
 *
 * Body: { appName: string, platform?: string, reviews: ParsedReview[] }
 * Response: text/event-stream with progress events + final result
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { appName, platform, reviews, competitors: competitorInputs } = body as {
    appName: string;
    platform?: string;
    reviews: ParsedReview[];
    competitors?: CompetitorInput[];
  };

  if (!appName?.trim()) {
    return new Response(
      JSON.stringify({ error: "App name is required." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!reviews?.length) {
    return new Response(
      JSON.stringify({ error: "No reviews provided." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: Record<string, unknown>) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      try {
        // 1. Auth
        send("progress", { step: "Authenticating...", progress: 5 });
        const supabase = await createClient();
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          send("error", { error: "You must be signed in." });
          controller.close();
          return;
        }

        // 2. Get API key
        send("progress", { step: "Loading settings...", progress: 8 });
        const { data: settings } = await supabase
          .from("user_settings")
          .select(
            "gemini_api_key_encrypted, gemini_api_key_iv, gemini_api_key_tag, default_model"
          )
          .eq("user_id", user.id)
          .single();

        let apiKey: string | null = null;
        let model: string = "gemini-2.5-flash";

        if (
          settings?.gemini_api_key_encrypted &&
          settings?.gemini_api_key_iv &&
          settings?.gemini_api_key_tag
        ) {
          try {
            apiKey = decrypt(
              settings.gemini_api_key_encrypted,
              settings.gemini_api_key_iv,
              settings.gemini_api_key_tag
            );
            model = settings.default_model ?? "gemini-2.5-flash";
          } catch {
            send("error", {
              error: "Failed to decrypt API key. Please re-enter it in Settings.",
            });
            controller.close();
            return;
          }
        }

        if (!apiKey) {
          apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? null;
        }

        if (!apiKey) {
          send("error", {
            error: "No Gemini API key found. Please add your API key in Settings.",
          });
          controller.close();
          return;
        }

        // 3. Create analysis row
        send("progress", { step: "Creating analysis...", progress: 10 });
        const { data: analysis, error: createError } = await supabase
          .from("analyses")
          .insert({
            user_id: user.id,
            app_name: appName.trim(),
            platform: platform ?? null,
            status: "processing",
            review_count: reviews.length,
          })
          .select("id")
          .single();

        if (createError || !analysis) {
          send("error", { error: "Failed to create analysis." });
          controller.close();
          return;
        }

        const analysisId = analysis.id;

        try {
          // 4. Classify reviews
          send("progress", {
            step: `Classifying ${reviews.length} reviews...`,
            progress: 15,
          });

          const classified = reviews.map((review) => ({
            review,
            classification: classifyReview(review),
          }));

          const localResults: Array<{
            review: ParsedReview;
            analysis: ReviewAnalysis;
          }> = [];
          const tier3Reviews: ParsedReview[] = [];

          for (const item of classified) {
            if (item.classification.tier === 1 || item.classification.tier === 2) {
              localResults.push({
                review: item.review,
                analysis: item.classification.analysis,
              });
            } else {
              tier3Reviews.push(item.review);
            }
          }

          send("progress", {
            step: `Classified: ${localResults.length} local, ${tier3Reviews.length} need AI`,
            progress: 20,
          });

          // 5. Batch analyze Tier 3 with progress
          const BATCH_SIZE = 10;
          const totalBatches = Math.ceil(tier3Reviews.length / BATCH_SIZE);
          const geminiResults: Array<{
            review: ParsedReview;
            analysis: ReviewAnalysis;
          }> = [];

          for (let i = 0; i < tier3Reviews.length; i += BATCH_SIZE) {
            const batchNum = Math.floor(i / BATCH_SIZE) + 1;
            const batch = tier3Reviews.slice(i, i + BATCH_SIZE);

            send("progress", {
              step: `Analyzing batch ${batchNum}/${totalBatches} (${batch.length} reviews)...`,
              progress: 20 + Math.round((batchNum / totalBatches) * 50),
            });

            const batchAnalyses = await analyzeReviewBatch(batch, apiKey, model);

            for (let j = 0; j < batch.length; j++) {
              geminiResults.push({
                review: batch[j],
                analysis: batchAnalyses[j] ?? {
                  love_score: 5,
                  frustration_score: 5,
                  loyalty_score: 5,
                  momentum_score: 5,
                  wom_score: 5,
                  churn_risk: "Medium" as const,
                  features_mentioned: [],
                  churn_phrases: [],
                  summary: "Analysis incomplete.",
                },
              });
            }
          }

          // 6. Combine and insert
          const allResults = [...localResults, ...geminiResults];

          send("progress", {
            step: "Saving review data...",
            progress: 75,
          });

          function buildReviewRows(includeChurnPhrases: boolean) {
            return allResults.map((item) => {
              const row: Record<string, unknown> = {
                analysis_id: analysisId,
                content: item.review.content,
                rating: item.review.rating ?? null,
                author: item.review.author ?? null,
                review_date: item.review.date ?? null,
                platform: item.review.platform ?? platform ?? null,
                love_score: item.analysis.love_score,
                frustration_score: item.analysis.frustration_score,
                loyalty_score: item.analysis.loyalty_score,
                momentum_score: item.analysis.momentum_score,
                wom_score: item.analysis.wom_score,
                churn_risk: item.analysis.churn_risk,
                features_mentioned: item.analysis.features_mentioned,
                summary: item.analysis.summary,
              };
              if (includeChurnPhrases) {
                row.churn_phrases = item.analysis.churn_phrases;
              }
              return row;
            });
          }

          if (allResults.length > 0) {
            let { error: insertError } = await supabase
              .from("reviews")
              .insert(buildReviewRows(true));
            // Retry without churn_phrases if column doesn't exist
            if (insertError?.message?.includes("churn_phrases")) {
              console.warn("churn_phrases column missing, retrying without it");
              ({ error: insertError } = await supabase
                .from("reviews")
                .insert(buildReviewRows(false)));
            }
            if (insertError) {
              console.error("Failed to insert reviews:", insertError);
            }
          }

          // 7. Compute aggregates
          send("progress", {
            step: "Computing Vibe Score...",
            progress: 80,
          });

          const n = allResults.length;
          const avgLove =
            allResults.reduce((s, r) => s + r.analysis.love_score, 0) / n;
          const avgFrustration =
            allResults.reduce((s, r) => s + r.analysis.frustration_score, 0) / n;
          const avgLoyalty =
            allResults.reduce((s, r) => s + r.analysis.loyalty_score, 0) / n;
          const avgMomentum =
            allResults.reduce((s, r) => s + r.analysis.momentum_score, 0) / n;
          const avgWom =
            allResults.reduce((s, r) => s + r.analysis.wom_score, 0) / n;

          const vibeScore =
            (avgLove * 0.25 +
              (10 - avgFrustration) * 0.25 +
              avgLoyalty * 0.2 +
              avgMomentum * 0.15 +
              avgWom * 0.15) *
            10;

          // Friction scores (local fallback)
          const featureMap = new Map<
            string,
            { totalSeverity: number; count: number; sentiments: string[] }
          >();
          for (const item of allResults) {
            for (const feat of item.analysis.features_mentioned) {
              const existing = featureMap.get(feat.feature) ?? {
                totalSeverity: 0,
                count: 0,
                sentiments: [],
              };
              existing.totalSeverity += feat.severity;
              existing.count += 1;
              existing.sentiments.push(feat.sentiment);
              featureMap.set(feat.feature, existing);
            }
          }

          const localFrictionScores = Array.from(featureMap.entries())
            .map(([feature, data]) => ({
              feature,
              score: Math.round((data.totalSeverity / data.count) * 10) / 10,
              trend: "stable" as const,
              mention_count: data.count,
              delta: "0%",
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

          // Churn drivers (local fallback)
          const churnPhraseMap = new Map<string, string[]>();
          for (const item of allResults) {
            for (const phrase of item.analysis.churn_phrases) {
              const normalised = phrase.toLowerCase().trim();
              if (normalised) {
                const existing = churnPhraseMap.get(normalised) ?? [];
                existing.push(item.review.content.slice(0, 120));
                churnPhraseMap.set(normalised, existing);
              }
            }
          }

          const localChurnDrivers = Array.from(churnPhraseMap.entries())
            .map(([theme, quotes]) => ({
              theme,
              count: quotes.length,
              severity: (quotes.length > 5
                ? "Critical"
                : quotes.length > 3
                  ? "High"
                  : quotes.length > 1
                    ? "Medium"
                    : "Low") as "Critical" | "High" | "Medium" | "Low",
              quotes: quotes.slice(0, 3),
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);

          const roundedVibeScore = Math.round(vibeScore * 10) / 10;
          const dimensionScores = {
            love: Math.round(avgLove * 10) / 10,
            frustration: Math.round(avgFrustration * 10) / 10,
            loyalty: Math.round(avgLoyalty * 10) / 10,
            momentum: Math.round(avgMomentum * 10) / 10,
            wom: Math.round(avgWom * 10) / 10,
          };

          // 8. Generate Vibe Report (second AI pass)
          send("progress", {
            step: "Generating Vibe Report...",
            progress: 85,
          });

          let vibeReport: VibeReport | null = null;
          try {
            vibeReport = await generateVibeReport({
              appName,
              platform,
              reviews: allResults,
              dimensionAverages: dimensionScores,
              vibeScore: roundedVibeScore,
              apiKey,
              model,
            });
          } catch (reportErr) {
            console.error("Vibe Report generation failed:", reportErr);
          }

          // 9. Analyze competitors (if any)
          const competitorResults: CompetitorResult[] = [];
          if (competitorInputs && competitorInputs.length > 0) {
            const total = competitorInputs.length;
            for (let ci = 0; ci < total; ci++) {
              const comp = competitorInputs[ci];
              send("progress", {
                step: `Analyzing competitor ${ci + 1}/${total}: ${comp.name}...`,
                progress: 88 + Math.round(((ci + 1) / total) * 6),
              });

              try {
                const compResult = await analyzeCompetitor(
                  comp,
                  apiKey,
                  model,
                  (msg) => send("progress", { step: msg, progress: 88 + Math.round(((ci + 0.5) / total) * 6) })
                );
                competitorResults.push(compResult);
              } catch (compErr) {
                console.error(`Competitor analysis failed for ${comp.name}:`, compErr);
                // Skip failed competitors, don't block the main analysis
              }
            }
          }

          // 10. Build result
          send("progress", {
            step: "Saving results...",
            progress: 95,
          });

          const result: AnalysisResult = {
            vibe_score: roundedVibeScore,
            dimension_scores: dimensionScores,
            friction_scores: vibeReport
              ? vibeReport.friction_scores.map((f) => ({
                  feature: f.feature,
                  score: f.score,
                  trend: f.trend,
                  mention_count: f.mentions,
                  delta: f.delta,
                }))
              : localFrictionScores,
            churn_drivers: vibeReport
              ? vibeReport.churn_drivers
              : localChurnDrivers,
            action_items: vibeReport ? vibeReport.action_items : [],
            review_count: n,
            summary: vibeReport
              ? vibeReport.summary
              : `Analysis of ${n} reviews for ${appName}. Vibe Score: ${Math.round(vibeScore)}/100.`,
          };

          // Build update payload — try full payload first, fall back to minimal if columns missing
          const fullPayload: Record<string, unknown> = {
            status: "completed",
            vibe_score: result.vibe_score,
            results: result,
            completed_at: new Date().toISOString(),
          };

          if (vibeReport) {
            fullPayload.friction_scores = vibeReport.friction_scores;
            fullPayload.churn_drivers = vibeReport.churn_drivers;
            fullPayload.action_items = vibeReport.action_items;
            if (vibeReport.release_impact) {
              fullPayload.release_impact = vibeReport.release_impact;
            }
          }

          if (competitorResults.length > 0) {
            fullPayload.competitors = competitorResults;
          }

          let { error: updateError } = await supabase
            .from("analyses")
            .update(fullPayload)
            .eq("id", analysisId);

          // If full update fails (missing columns), fall back to minimal
          if (updateError) {
            console.warn("Full update failed, trying minimal:", updateError.message);
            const minimalPayload: Record<string, unknown> = {
              status: "completed",
              vibe_score: result.vibe_score,
            };
            if (vibeReport) {
              minimalPayload.friction_scores = vibeReport.friction_scores;
              minimalPayload.churn_drivers = vibeReport.churn_drivers;
              minimalPayload.action_items = vibeReport.action_items;
            }
            const { error: minError } = await supabase
              .from("analyses")
              .update(minimalPayload)
              .eq("id", analysisId);
            if (minError) {
              console.error("Minimal update also failed:", minError);
            }
          }

          // 11. Done!
          send("complete", {
            analysisId,
            vibeScore: roundedVibeScore,
            reviewCount: n,
            competitorCount: competitorResults.length,
            progress: 100,
          });
        } catch (err) {
          console.error("Analysis pipeline error:", err);

          // Try with completed_at, fall back without it
          const { error: failErr } = await supabase
            .from("analyses")
            .update({ status: "failed", completed_at: new Date().toISOString() })
            .eq("id", analysisId);
          if (failErr) {
            await supabase
              .from("analyses")
              .update({ status: "failed" })
              .eq("id", analysisId);
          }

          const message =
            err instanceof Error ? err.message : "An unexpected error occurred.";
          send("error", { error: message });
        }
      } catch (err) {
        console.error("Streaming analysis error:", err);
        send("error", { error: "An unexpected error occurred." });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
