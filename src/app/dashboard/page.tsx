import { DashboardCommandCenter } from "@/components/dashboard/dashboard-command-center";
import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client";
import { vibeColor } from "@/lib/constants";

export const metadata = {
  title: "Dashboard — FrictionLens",
};

type AnalysisRow = {
  id: string;
  app_name: string;
  platform: string | null;
  status: string;
  vibe_score: number | null;
  review_count: number;
  created_at: string;
  completed_at: string | null;
  is_public: boolean;
  dimension_scores: {
    love: number;
    frustration: number;
    loyalty: number;
    momentum: number;
    wom: number;
  } | null;
  friction_scores: Array<{
    feature: string;
    score: number;
    mentions: number;
  }> | null;
  results: {
    friction_scores?: Array<{
      feature: string;
      score: number;
      mentions: number;
    }>;
  } | null;
};

export default async function DashboardPage() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-6 text-center">
          <h2 className="text-lg font-semibold text-amber-900">
            Supabase Not Configured
          </h2>
          <p className="mt-2 text-sm text-amber-700">
            Set{" "}
            <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
            and{" "}
            <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
            in your <code className="font-mono text-xs">.env.local</code> file,
            then restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  let allAnalyses: AnalysisRow[] = [];
  let hasApiKey = false;
  let displayName = "";

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const [settingsRes, analysesRes, profileRes] = await Promise.all([
        supabase
          .from("user_settings")
          .select("gemini_api_key_encrypted")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("analyses")
          .select(
            "id, app_name, platform, status, vibe_score, review_count, created_at, completed_at, is_public, dimension_scores, friction_scores, results"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .single(),
      ]);

      hasApiKey = !!settingsRes.data?.gemini_api_key_encrypted;
      allAnalyses = (analysesRes.data as AnalysisRow[]) ?? [];
      displayName = profileRes.data?.display_name ?? user.email?.split("@")[0] ?? "there";
    }
  } catch (err) {
    console.error("Failed to load dashboard data:", err);
  }

  // Compute aggregates
  const completed = allAnalyses.filter(
    (a) => a.status === "completed" && a.vibe_score != null
  );

  const avgVibeScore =
    completed.length > 0
      ? Math.round(
          completed.reduce((s, a) => s + (a.vibe_score ?? 0), 0) /
            completed.length
        )
      : null;

  const totalReviews = completed.reduce((s, a) => s + a.review_count, 0);

  const now = new Date();
  const thisMonthCount = completed.filter((a) => {
    const d = new Date(a.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Avg dimensions
  const dimsAccum = { love: 0, frustration: 0, loyalty: 0, momentum: 0, wom: 0, count: 0 };
  for (const a of completed) {
    if (a.dimension_scores) {
      dimsAccum.love += a.dimension_scores.love;
      dimsAccum.frustration += a.dimension_scores.frustration;
      dimsAccum.loyalty += a.dimension_scores.loyalty;
      dimsAccum.momentum += a.dimension_scores.momentum;
      dimsAccum.wom += a.dimension_scores.wom;
      dimsAccum.count += 1;
    }
  }
  const avgDimensions =
    dimsAccum.count > 0
      ? {
          love: Math.round((dimsAccum.love / dimsAccum.count) * 10) / 10,
          frustration: Math.round((dimsAccum.frustration / dimsAccum.count) * 10) / 10,
          loyalty: Math.round((dimsAccum.loyalty / dimsAccum.count) * 10) / 10,
          momentum: Math.round((dimsAccum.momentum / dimsAccum.count) * 10) / 10,
          wom: Math.round((dimsAccum.wom / dimsAccum.count) * 10) / 10,
        }
      : null;

  // Top friction feature across analyses
  const frictionMap = new Map<string, { totalScore: number; appearances: number }>();
  for (const a of completed) {
    const scores = a.friction_scores ?? a.results?.friction_scores ?? [];
    for (const f of scores) {
      const existing = frictionMap.get(f.feature) ?? { totalScore: 0, appearances: 0 };
      existing.totalScore += f.score;
      existing.appearances += 1;
      frictionMap.set(f.feature, existing);
    }
  }
  let topFrictionFeature: { name: string; score: number } | null = null;
  let maxWeight = 0;
  for (const [feature, data] of frictionMap) {
    const weight = data.appearances * (data.totalScore / data.appearances);
    if (weight > maxWeight) {
      maxWeight = weight;
      topFrictionFeature = {
        name: feature,
        score: Math.round((data.totalScore / data.appearances) * 10) / 10,
      };
    }
  }

  // Vibe score trend (chronological)
  const vibeScoreTrend = completed
    .slice()
    .reverse()
    .map((a) => Math.round(a.vibe_score ?? 0));

  // Trend chart data
  const trendData = completed
    .slice()
    .reverse()
    .map((a) => ({
      date: a.created_at,
      label: new Date(a.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      appName: a.app_name,
      vibeScore: Math.round(a.vibe_score ?? 0),
    }));
  const trendAppNames = [...new Set(trendData.map((d) => d.appName))];

  // Recent analyses for grid (top 6)
  const recentAnalyses = allAnalyses.slice(0, 6).map((a) => {
    const frictions = a.friction_scores ?? a.results?.friction_scores ?? [];
    return {
      id: a.id,
      appName: a.app_name,
      platform: a.platform,
      status: a.status,
      vibeScore: a.vibe_score,
      vibeColorHex: a.vibe_score != null ? vibeColor(a.vibe_score) : null,
      reviewCount: a.review_count,
      createdAt: a.created_at,
      frictionItems: frictions.slice(0, 2).map((f) => f.feature),
      dimensionScores: a.dimension_scores,
    };
  });

  // Activity events
  const activityEvents = allAnalyses.slice(0, 10).map((a) => ({
    id: a.id,
    type: (a.status === "completed"
      ? a.is_public
        ? "shared"
        : "completed"
      : a.status === "failed"
        ? "failed"
        : "started") as "completed" | "started" | "shared" | "failed",
    appName: a.app_name,
    vibeScore: a.vibe_score,
    timestamp: a.completed_at ?? a.created_at,
  }));

  return (
    <DashboardPageClient
      displayName={displayName}
      hasApiKey={hasApiKey}
      avgVibeScore={avgVibeScore}
      totalReviews={totalReviews}
      analysisCount={completed.length}
      thisMonthCount={thisMonthCount}
      topFrictionFeature={topFrictionFeature}
      vibeScoreTrend={vibeScoreTrend}
      avgDimensions={avgDimensions}
      trendData={trendData}
      trendAppNames={trendAppNames}
      recentAnalyses={recentAnalyses}
      activityEvents={activityEvents}
    />
  );
}
