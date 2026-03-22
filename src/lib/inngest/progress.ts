/**
 * Progress tracking for background analysis jobs.
 * Stores progress state in Redis so it can be polled by the SSE endpoint.
 */

import { cacheGet, cacheSet } from "@/lib/cache/redis";
import { analysisProgressKey } from "@/lib/cache/keys";

export type AnalysisProgress = {
  step: string;
  progress: number;
  status: "processing" | "completed" | "failed";
};

const PROGRESS_TTL_SECONDS = 3600;

export async function setAnalysisProgress(
  analysisId: string,
  step: string,
  progress: number,
  status: "processing" | "completed" | "failed" = "processing"
): Promise<void> {
  const key = analysisProgressKey(analysisId);
  const value: AnalysisProgress = { step, progress, status };
  await cacheSet(key, value, PROGRESS_TTL_SECONDS);
}

export async function getAnalysisProgress(
  analysisId: string
): Promise<AnalysisProgress | null> {
  const key = analysisProgressKey(analysisId);
  return cacheGet<AnalysisProgress>(key);
}
