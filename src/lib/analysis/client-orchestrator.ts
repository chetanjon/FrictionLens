"use client";

/**
 * Client-side orchestrator for the chunked analysis pipeline.
 * Calls 4 endpoints in sequence with rate-limit-safe delays.
 */

type CompetitorInput = {
  appId: string;
  name: string;
  platform: "android" | "ios";
  storeId?: number;
};

type ParsedReview = {
  content: string;
  rating?: number;
  author?: string;
  date?: string;
  platform?: string;
  version?: string;
};

type ProgressCallback = (step: string, progress: number) => void;

type ChunkedAnalysisParams = {
  appName: string;
  platform?: string;
  reviews: ParsedReview[];
  competitors: CompetitorInput[];
};

type ChunkedAnalysisResult = {
  analysisId: string;
  vibeScore: number;
  reviewCount: number;
  competitorCount: number;
};

// Init endpoint response shape
type InitResponse = {
  analysisId: string;
  vibeScore: number;
  dimensionScores: {
    love: number;
    frustration: number;
    loyalty: number;
    momentum: number;
    wom: number;
  };
  localFrictionScores: unknown[];
  localChurnDrivers: unknown[];
  reviewSummaries: string[];
  reviewCount: number;
  tier3Count: number;
  error?: string;
};

const RATE_LIMIT_DELAY_MS = 7_000;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 15_000;

function isRateLimitError(errorMsg: string): boolean {
  const lower = errorMsg.toLowerCase();
  return (
    lower.includes("rate limit") ||
    lower.includes("rate_limit") ||
    lower.includes("resource_exhausted") ||
    lower.includes("429") ||
    lower.includes("too many requests")
  );
}

async function fetchWithRetry(
  url: string,
  body: unknown,
  onProgress: ProgressCallback,
  retryLabel: string
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) return res;

      const data = await res.json().catch(() => ({ error: "Request failed" }));
      const errorMsg = data.error ?? `HTTP ${res.status}`;

      if (isRateLimitError(errorMsg) && attempt < MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
        const delaySec = Math.ceil(delay / 1000);
        onProgress(
          `Rate limited on ${retryLabel}. Retrying in ${delaySec}s...`,
          -1
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw new Error(errorMsg);
    } catch (err) {
      if (err instanceof Error && !isRateLimitError(err.message)) {
        throw err;
      }
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt < MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
        const delaySec = Math.ceil(delay / 1000);
        onProgress(
          `Rate limited on ${retryLabel}. Retrying in ${delaySec}s...`,
          -1
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError ?? new Error(`Failed after ${MAX_RETRIES} retries`);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Run the analysis pipeline as a series of chunked API calls.
 * Each call stays under 60 seconds for Vercel free tier compatibility.
 */
export async function runChunkedAnalysis(
  params: ChunkedAnalysisParams,
  onProgress: ProgressCallback
): Promise<ChunkedAnalysisResult> {
  const { appName, platform, reviews, competitors } = params;

  // ── Phase 1: Init (classify + batch-analyze + save reviews) ──
  onProgress("Classifying and analyzing reviews...", 5);

  const initRes = await fetchWithRetry(
    "/api/analyze/init",
    { appName, platform, reviews },
    onProgress,
    "review analysis"
  );
  const initData: InitResponse = await initRes.json();

  if (initData.error) {
    throw new Error(initData.error);
  }

  onProgress(
    `Analyzed ${initData.reviewCount} reviews (${initData.tier3Count} via AI). Vibe Score: ${Math.round(initData.vibeScore)}`,
    65
  );

  // ── Rate limit delay before report ──
  onProgress("Preparing report generation...", 68);
  await delay(RATE_LIMIT_DELAY_MS);

  // ── Phase 2: Generate Vibe Report ──
  onProgress("Generating Vibe Report...", 70);

  const reportRes = await fetchWithRetry(
    "/api/analyze/report",
    {
      analysisId: initData.analysisId,
      appName,
      platform,
      reviewSummaries: initData.reviewSummaries,
      dimensionAverages: initData.dimensionScores,
      vibeScore: initData.vibeScore,
      reviewCount: initData.reviewCount,
    },
    onProgress,
    "report generation"
  );
  const reportData = await reportRes.json();

  if (reportData.error) {
    throw new Error(reportData.error);
  }

  onProgress("Vibe Report generated.", 82);

  // ── Phase 3: Competitor analysis (one per call) ──
  let completedCompetitors = 0;

  for (const comp of competitors) {
    await delay(RATE_LIMIT_DELAY_MS);

    const compProgress =
      82 + Math.round(((completedCompetitors + 0.5) / competitors.length) * 10);
    onProgress(`Analyzing competitor: ${comp.name}...`, compProgress);

    const compRes = await fetchWithRetry(
      "/api/analyze/competitor",
      {
        analysisId: initData.analysisId,
        competitor: comp,
      },
      onProgress,
      `competitor "${comp.name}"`
    );
    const compData = await compRes.json();

    if (compData.error) {
      // Skip failed competitors, don't block the analysis
      console.error(`Competitor analysis failed for ${comp.name}:`, compData.error);
    }

    completedCompetitors++;
    onProgress(
      `Competitor ${completedCompetitors}/${competitors.length} complete.`,
      82 + Math.round((completedCompetitors / competitors.length) * 10)
    );
  }

  // ── Phase 4: Finalize ──
  onProgress("Saving results...", 95);

  const finalizeRes = await fetchWithRetry(
    "/api/analyze/finalize",
    {
      analysisId: initData.analysisId,
      vibeScore: initData.vibeScore,
      reviewCount: initData.reviewCount,
      competitorCount: completedCompetitors,
      appName,
      userEmail: undefined,
    },
    onProgress,
    "finalization"
  );
  const finalizeData = await finalizeRes.json();

  if (finalizeData.error) {
    throw new Error(finalizeData.error);
  }

  return {
    analysisId: initData.analysisId,
    vibeScore: initData.vibeScore,
    reviewCount: initData.reviewCount,
    competitorCount: completedCompetitors,
  };
}
