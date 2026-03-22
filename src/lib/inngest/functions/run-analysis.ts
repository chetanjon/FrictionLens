/**
 * Inngest function: run-analysis
 * Orchestrates the full analysis pipeline as a background job.
 */

import { inngest } from "../client";
import { setAnalysisProgress } from "../progress";
import { runAnalysisPipeline } from "@/lib/analysis/run-pipeline";
import type { ParsedReview } from "@/lib/types/review";
import type { CompetitorInput } from "@/lib/ai/analyze-competitor";

type AnalysisRequestedEvent = {
  data: {
    analysisId: string;
    userId: string;
    userEmail?: string;
    appName: string;
    platform?: string;
    reviews: ParsedReview[];
    competitors?: CompetitorInput[];
    apiKey: string;
    model: string;
  };
};

export const runAnalysisFunction = inngest.createFunction(
  {
    id: "run-analysis",
    triggers: [{ event: "analysis/requested" }],
  },
  async ({ event, step }) => {
    const {
      analysisId,
      userId,
      userEmail,
      appName,
      platform,
      reviews,
      competitors,
      apiKey,
      model,
    } = event.data as AnalysisRequestedEvent["data"];

    await step.run("run-pipeline", async () => {
      await runAnalysisPipeline({
        userId,
        userEmail,
        appName,
        platform,
        reviews,
        competitors,
        apiKey,
        model,
        analysisId,
        onProgress: async (stepName: string, progress: number) => {
          await setAnalysisProgress(analysisId, stepName, progress);
        },
      });

      // Mark as completed in Redis
      await setAnalysisProgress(analysisId, "Done", 100, "completed");
    });
  }
);
