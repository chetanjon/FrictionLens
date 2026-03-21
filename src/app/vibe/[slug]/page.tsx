import { notFound } from "next/navigation";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { AnalysisResult } from "@/lib/types/review";
import { ReportNav } from "@/components/report/report-nav";
import { GlassCard } from "@/components/report/glass-card";

/* ---------------------------------------------------------------------------
 * Dynamic section imports with graceful fallbacks
 * ----------------------------------------------------------------------- */

function sectionFallback(label: string) {
  return () => (
    <GlassCard className="p-8 text-center">
      <p className="text-sm text-slate-400">{label} section is loading...</p>
    </GlassCard>
  );
}

function sectionPlaceholder(label: string) {
  return function PlaceholderSection() {
    return (
      <GlassCard className="mx-auto max-w-[920px] p-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-300">
          Coming Soon
        </p>
        <p className="mt-1 text-sm text-slate-400">{label}</p>
      </GlassCard>
    );
  };
}

const SummarySection = dynamic(
  () =>
    import("@/components/report/sections/summary-section")
      .then((m) => m.SummarySection)
      .catch(() => sectionPlaceholder("Summary")),
  { loading: sectionFallback("Summary") }
);

const DimensionsSection = dynamic(
  () =>
    import("@/components/report/sections/dimensions-section")
      .then((m) => m.DimensionsSection)
      .catch(() => sectionPlaceholder("Dimensions")),
  { loading: sectionFallback("Dimensions") }
);

const FrictionSection = dynamic(
  () =>
    import("@/components/report/sections/friction-section")
      .then((m) => m.FrictionSection)
      .catch(() => sectionPlaceholder("Friction Scores")),
  { loading: sectionFallback("Friction Scores") }
);

const ChurnSection = dynamic(
  () =>
    import("@/components/report/sections/churn-section")
      .then((m) => m.ChurnSection)
      .catch(() => sectionPlaceholder("Churn Drivers")),
  { loading: sectionFallback("Churn Drivers") }
);

const ReleaseSection = dynamic(
  () =>
    import("@/components/report/sections/release-section")
      .then((m) => m.ReleaseSection)
      .catch(() => sectionPlaceholder("Release Impact")),
  { loading: sectionFallback("Release Impact") }
);

const CompareSection = dynamic(
  () =>
    import("@/components/report/sections/compare-section")
      .then((m) => m.CompareSection)
      .catch(() => sectionPlaceholder("Compare")),
  { loading: sectionFallback("Compare") }
);

const ActionsSection = dynamic(
  () =>
    import("@/components/report/sections/actions-section")
      .then((m) => m.ActionsSection)
      .catch(() => sectionPlaceholder("Action Items")),
  { loading: sectionFallback("Action Items") }
);

const ExplorerSection = dynamic(
  () =>
    import("@/components/report/sections/explorer-section")
      .then((m) => m.ExplorerSection)
      .catch(() => sectionPlaceholder("Data Explorer")),
  { loading: sectionFallback("Data Explorer") }
);

/* ---------------------------------------------------------------------------
 * Types
 * ----------------------------------------------------------------------- */

type CompetitorData = {
  name: string;
  platform: string;
  vibe_score: number;
  review_count: number;
  dimension_scores: {
    love: number;
    frustration: number;
    loyalty: number;
    momentum: number;
    wom: number;
  };
};

type AnalysisRow = {
  id: string;
  app_name: string;
  platform: string | null;
  status: string;
  vibe_score: number | null;
  review_count: number;
  results: AnalysisResult | null;
  dimension_scores: AnalysisResult["dimension_scores"] | null;
  friction_scores: AnalysisResult["friction_scores"] | null;
  churn_drivers: AnalysisResult["churn_drivers"] | null;
  action_items: AnalysisResult["action_items"] | null;
  competitors: CompetitorData[] | null;
  created_at: string;
  completed_at: string | null;
  is_public: boolean | null;
  slug: string | null;
};

type ReviewRow = {
  id: string;
  content: string;
  rating: number | null;
  author: string | null;
  review_date: string | null;
  love_score: number | null;
  frustration_score: number | null;
  loyalty_score: number | null;
  momentum_score: number | null;
  wom_score: number | null;
  churn_risk: string | null;
  summary: string | null;
};

/* ---------------------------------------------------------------------------
 * Metadata
 * ----------------------------------------------------------------------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { title: "Vibe Report — FrictionLens" };
  }

  const { createServerClient } = await import("@supabase/ssr");
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const { data } = await supabase
    .from("analyses")
    .select("app_name, vibe_score")
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (!data) {
    return { title: "Report Not Found — FrictionLens" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://frictionlens.com";

  return {
    title: `${data.app_name} Vibe Report — FrictionLens`,
    description: `Vibe Score: ${data.vibe_score ?? "N/A"}/100. See the full sentiment analysis, friction scores, and churn drivers.`,
    openGraph: {
      title: `${data.app_name} — Vibe Score: ${Math.round(data.vibe_score ?? 0)}/100`,
      description: `AI-powered review intelligence for ${data.app_name}. Friction scores, churn drivers, and actionable insights.`,
      url: `${appUrl}/vibe/${slug}`,
      siteName: "FrictionLens",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${data.app_name} — Vibe Score: ${Math.round(data.vibe_score ?? 0)}/100`,
      description: `AI-powered review intelligence by FrictionLens`,
    },
  };
}

/* ---------------------------------------------------------------------------
 * Page
 * ----------------------------------------------------------------------- */

export default async function PublicVibePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    notFound();
  }

  // Use an anonymous (no-cookie) client for public access
  const { createServerClient } = await import("@supabase/ssr");
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const { data: analysis, error: analysisError } = await supabase
    .from("analyses")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (analysisError || !analysis) {
    notFound();
  }

  const a = analysis as AnalysisRow;

  // Only show completed analyses publicly
  if (a.status !== "completed") {
    notFound();
  }

  /* -- Fetch reviews ----------------------------------------------------- */
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      "id, content, rating, author, review_date, love_score, frustration_score, loyalty_score, momentum_score, wom_score, churn_risk, summary"
    )
    .eq("analysis_id", a.id)
    .order("frustration_score", { ascending: false });

  const typedReviews = (reviews as ReviewRow[]) ?? [];

  /* -- Derive report data ------------------------------------------------ */
  const results = a.results;
  const vibeScore = a.vibe_score ?? results?.vibe_score ?? 0;

  const dimensionScores =
    a.dimension_scores ?? results?.dimension_scores ?? null;
  const frictionScores = a.friction_scores ?? results?.friction_scores ?? [];
  const churnDrivers = a.churn_drivers ?? results?.churn_drivers ?? [];
  const actionItems = a.action_items ?? results?.action_items ?? [];
  const summary = results?.summary ?? "";
  const releaseImpact = results?.release_impact ?? null;

  const churnRiskCount = typedReviews.filter(
    (r) => r.churn_risk === "Critical" || r.churn_risk === "High"
  ).length;
  const churnRiskPct =
    typedReviews.length > 0
      ? Math.round((churnRiskCount / typedReviews.length) * 100)
      : 0;

  const topFriction = frictionScores[0] ?? null;

  // Map friction_scores from AnalysisResult shape to FrictionItem shape
  const mappedFrictionScores = frictionScores.map((f) => ({
    feature: f.feature,
    score: f.score,
    mentions: "mentions" in f ? (f as Record<string, unknown>).mentions as number : ("mention_count" in f ? (f as Record<string, unknown>).mention_count as number : 0),
    trend: f.trend,
    delta: f.delta,
  }));

  // Map reviews for explorer section (convert null to undefined)
  const explorerReviews = typedReviews.map((r) => ({
    rating: r.rating ?? undefined,
    content: r.content,
    love_score: r.love_score ?? undefined,
    frustration_score: r.frustration_score ?? undefined,
    churn_risk: r.churn_risk ?? undefined,
  }));

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Branding header */}
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[920px] items-center justify-between px-7 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-friction-blue text-white">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="font-sans text-lg font-bold tracking-tight text-slate-900">
              FrictionLens
            </span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-mono uppercase tracking-wider">
              Vibe Report
            </span>
          </div>
        </div>
      </header>

      {/* Report nav (read-only, no share button) */}
      <ReportNav
        analysisId={a.id}
        appName={a.app_name}
        isPublic={true}
        slug={a.slug ?? null}
        readOnly
      />

      {/* ------- 1. Summary ------- */}
      <SummarySection
        appName={a.app_name}
        platform={a.platform ?? undefined}
        vibeScore={Math.round(vibeScore)}
        summary={summary}
        reviewCount={a.review_count}
        topFriction={topFriction?.feature}
        topFrictionScore={topFriction?.score}
        churnRiskPercent={churnRiskPct}
        dimensionScores={dimensionScores ?? undefined}
        frictionScores={mappedFrictionScores.slice(0, 5).map(f => ({ name: f.feature, score: f.score }))}
      />

      {/* ------- 2. Dimensions ------- */}
      {dimensionScores && (
        <DimensionsSection dimensionScores={dimensionScores} />
      )}

      {/* ------- 3. Friction ------- */}
      <FrictionSection frictionScores={mappedFrictionScores} />

      {/* ------- 4. Churn ------- */}
      <ChurnSection
        churnDrivers={churnDrivers}
        churnRiskPercent={churnRiskPct}
      />

      {/* ------- 5. Release ------- */}
      <ReleaseSection releaseImpact={releaseImpact} />

      {/* ------- 6. Compare ------- */}
      <CompareSection
        appName={a.app_name}
        vibeScore={Math.round(vibeScore)}
        dimensionScores={dimensionScores ?? undefined}
        competitors={a.competitors ?? undefined}
      />

      {/* ------- 7. Actions ------- */}
      <ActionsSection actionItems={actionItems} />

      {/* ------- 8. Data Explorer ------- */}
      <ExplorerSection reviews={explorerReviews} />

      {/* Footer with CTA */}
      <footer className="border-t border-slate-200/60 bg-white/80 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex max-w-[920px] flex-col items-center gap-4 px-7 py-10 text-center">
          <p className="text-sm text-slate-500">
            Powered by{" "}
            <Link
              href="/"
              className="font-semibold text-friction-blue transition-colors hover:text-friction-blue/80"
            >
              FrictionLens
            </Link>
          </p>
          <p className="max-w-md text-xs text-slate-400">
            Turn hundreds of app store reviews into actionable intelligence. Get
            your own Vibe Report in minutes.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-friction-blue px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-friction-blue/90"
          >
            Get Started Free
          </Link>
        </div>
      </footer>
    </div>
  );
}
