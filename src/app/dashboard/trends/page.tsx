import { TrendsClient } from "@/components/dashboard/trends-client";

export const metadata = {
  title: "Trends — FrictionLens",
};

type AnalysisRow = {
  id: string;
  app_name: string;
  status: string;
  vibe_score: number | null;
  review_count: number;
  created_at: string;
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

export default async function TrendsPage() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: analyses } = await supabase
    .from("analyses")
    .select(
      "id, app_name, status, vibe_score, review_count, created_at, dimension_scores, friction_scores, results"
    )
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: true })
    .limit(100);

  const rows = ((analyses as AnalysisRow[]) ?? []).filter(
    (a) => a.vibe_score != null
  );

  // Build vibe trend data
  const vibeTrendData = rows.map((a) => ({
    date: a.created_at,
    label: new Date(a.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    appName: a.app_name,
    vibeScore: Math.round(a.vibe_score ?? 0),
  }));
  const appNames = [...new Set(vibeTrendData.map((d) => d.appName))];

  // Build dimension trend data
  const dimensionTrendData = rows
    .filter((a) => a.dimension_scores)
    .map((a) => ({
      date: a.created_at,
      label: new Date(a.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      appName: a.app_name,
      ...a.dimension_scores!,
    }));

  // Build friction frequency
  const frictionMap = new Map<string, number>();
  for (const a of rows) {
    const scores = a.friction_scores ?? a.results?.friction_scores ?? [];
    for (const f of scores) {
      frictionMap.set(f.feature, (frictionMap.get(f.feature) ?? 0) + 1);
    }
  }
  const frictionFrequency = [...frictionMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([feature, count]) => ({ feature, count }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Trends
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Track your app review sentiment over time
        </p>
      </div>
      <TrendsClient
        vibeTrendData={vibeTrendData}
        appNames={appNames}
        dimensionTrendData={dimensionTrendData}
        frictionFrequency={frictionFrequency}
      />
    </div>
  );
}
