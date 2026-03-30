import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/crypto";
import { consumeFreeTrial, FREE_TRIAL_MODEL, FREE_TRIAL_MAX_REVIEWS } from "@/lib/free-trial";
import { isInngestEnabled } from "@/lib/inngest/is-enabled";
import { inngest } from "@/lib/inngest/client";
import { getAnalysisProgress } from "@/lib/inngest/progress";
import { runAnalysisPipeline } from "@/lib/analysis/run-pipeline";
import type { CompetitorInput } from "@/lib/ai/analyze-competitor";
import type { ParsedReview } from "@/lib/types/review";

/**
 * POST /api/analyze
 * Runs the analysis pipeline with SSE progress streaming.
 *
 * Mode A (Inngest enabled): Dispatches to Inngest, polls Redis for progress.
 * Mode B (fallback): Runs the pipeline directly with SSE callbacks.
 *
 * Body: { appName: string, platform?: string, reviews: ParsedReview[], competitors?: CompetitorInput[] }
 * Response: text/event-stream with progress events + final result
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { appName, platform, reviews: rawReviews, competitors: competitorInputs } = body as {
    appName: string;
    platform?: string;
    reviews: ParsedReview[];
    competitors?: CompetitorInput[];
  };
  let reviews = rawReviews;

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

        // If user has no key, try free trial with the platform key
        if (!apiKey) {
          const trialResult = await consumeFreeTrial(user.id);
          if (!trialResult.allowed) {
            send("error", { error: trialResult.reason });
            controller.close();
            return;
          }
          apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? null;
          model = FREE_TRIAL_MODEL;

          // Cap review count for free trial analyses
          if (reviews.length > FREE_TRIAL_MAX_REVIEWS) {
            reviews = reviews.slice(0, FREE_TRIAL_MAX_REVIEWS);
          }
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

        // ── Branch: Inngest (Mode A) vs Direct (Mode B) ──

        if (isInngestEnabled()) {
          // Mode A: Dispatch to Inngest, poll Redis for progress
          await runWithInngest({
            analysisId,
            userId: user.id,
            userEmail: user.email,
            appName: appName.trim(),
            platform,
            reviews,
            competitorInputs,
            apiKey,
            model,
            send,
          });
        } else {
          // Mode B: Run pipeline directly with SSE callbacks
          await runDirectly({
            analysisId,
            userId: user.id,
            userEmail: user.email,
            appName: appName.trim(),
            platform,
            reviews,
            competitorInputs,
            apiKey,
            model,
            send,
            supabase,
          });
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

// ── Mode A: Inngest background job with SSE polling ──

type InngestModeParams = {
  analysisId: string;
  userId: string;
  userEmail?: string;
  appName: string;
  platform?: string;
  reviews: ParsedReview[];
  competitorInputs?: CompetitorInput[];
  apiKey: string;
  model: string;
  send: (event: string, data: Record<string, unknown>) => void;
};

async function runWithInngest(params: InngestModeParams): Promise<void> {
  const {
    analysisId,
    userId,
    userEmail,
    appName,
    platform,
    reviews,
    competitorInputs,
    apiKey,
    model,
    send,
  } = params;

  // Dispatch the background job
  await inngest.send({
    name: "analysis/requested",
    data: {
      analysisId,
      userId,
      userEmail,
      appName,
      platform,
      reviews,
      competitors: competitorInputs,
      apiKey,
      model,
    },
  });

  send("progress", { step: "Queued for processing...", progress: 12 });

  // Poll Redis for progress updates, forwarding them as SSE events
  const MAX_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
  const POLL_INTERVAL_MS = 2_000;
  const KEEPALIVE_INTERVAL_MS = 15_000;

  const startTime = Date.now();
  let lastKeepalive = Date.now();
  let lastProgress = 0;

  while (Date.now() - startTime < MAX_TIMEOUT_MS) {
    const progress = await getAnalysisProgress(analysisId);

    if (progress) {
      // Forward progress to SSE client
      if (progress.progress > lastProgress) {
        send("progress", {
          step: progress.step,
          progress: progress.progress,
        });
        lastProgress = progress.progress;
      }

      if (progress.status === "completed") {
        send("complete", {
          analysisId,
          progress: 100,
        });
        return;
      }

      if (progress.status === "failed") {
        send("error", { error: "Analysis failed during background processing." });
        return;
      }
    }

    // Send keepalive comment to prevent connection timeout
    if (Date.now() - lastKeepalive >= KEEPALIVE_INTERVAL_MS) {
      send("progress", { step: "Processing...", progress: lastProgress });
      lastKeepalive = Date.now();
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  // Timed out — check if analysis actually completed in the database
  send("error", {
    error: "Analysis is taking longer than expected. Check back shortly.",
  });
}

// ── Mode B: Direct pipeline execution (fallback when Inngest not configured) ──

type DirectModeParams = {
  analysisId: string;
  userId: string;
  userEmail?: string;
  appName: string;
  platform?: string;
  reviews: ParsedReview[];
  competitorInputs?: CompetitorInput[];
  apiKey: string;
  model: string;
  send: (event: string, data: Record<string, unknown>) => void;
  supabase: Awaited<ReturnType<typeof createClient>>;
};

async function runDirectly(params: DirectModeParams): Promise<void> {
  const {
    analysisId,
    userId,
    userEmail,
    appName,
    platform,
    reviews,
    competitorInputs,
    apiKey,
    model,
    send,
    supabase,
  } = params;

  try {
    const result = await runAnalysisPipeline({
      userId,
      userEmail,
      appName,
      platform,
      reviews,
      competitors: competitorInputs,
      apiKey,
      model,
      analysisId,
      onProgress: (step: string, progress: number) => {
        send("progress", { step, progress });
      },
    });

    send("complete", {
      analysisId: result.analysisId,
      vibeScore: result.vibeScore,
      reviewCount: result.reviewCount,
      competitorCount: result.competitorCount,
      progress: 100,
    });
  } catch (err) {
    console.error("Analysis pipeline error:", err);

    // Mark analysis as failed in database
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
}
