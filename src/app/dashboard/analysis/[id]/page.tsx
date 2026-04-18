import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ChevronLeft } from "lucide-react";
import type { AnalysisResult, FrictionItem } from "@/lib/types/review";
import { ReportNav } from "@/components/report/report-nav";
import { GlassCard } from "@/components/report/glass-card";

/* ---------------------------------------------------------------------------
 * Dynamic imports for section components (graceful fallback if not built yet)
 * ----------------------------------------------------------------------- */

function sectionFallback(label: string) {
  function SectionFallback() {
    return (
      <div className="mx-auto max-w-[920px] px-4 py-13 sm:px-6 lg:px-7">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-2 w-16 rounded bg-gray-100" />
            <div className="h-2 w-2 rounded-full bg-gray-100" />
            <div className="h-3 w-32 rounded bg-gray-100" />
          </div>
          <div className="rounded-2xl border border-gray-200/60 bg-white p-8">
            <div className="space-y-3">
              <div className="h-3 w-3/4 rounded bg-gray-100" />
              <div className="h-3 w-1/2 rounded bg-gray-100" />
              <div className="h-3 w-2/3 rounded bg-gray-100" />
            </div>
          </div>
        </div>
        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-widest text-gray-600">
          Loading {label}
        </p>
      </div>
    );
  }
  return SectionFallback;
}

function sectionPlaceholder(label: string) {
  return function PlaceholderSection() {
    return (
      <GlassCard className="mx-auto max-w-[920px] p-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600">
          Coming Soon
        </p>
        <p className="mt-1 text-sm text-gray-500">{label}</p>
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
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Analysis ${id.slice(0, 8)}...`,
  };
}

/* ---------------------------------------------------------------------------
 * Page
 * ----------------------------------------------------------------------- */

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-2xl border border-[#C9B06A]/20 bg-[#C9B06A]/[0.06] p-6 text-center">
          <h2 className="text-lg font-semibold text-[#C9B06A]">
            Supabase Not Configured
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Set{" "}
            <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
            and{" "}
            <code className="font-mono text-xs">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>{" "}
            in your <code className="font-mono text-xs">.env.local</code> file.
          </p>
        </div>
      </div>
    );
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: analysis, error: analysisError } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (analysisError || !analysis) {
    notFound();
  }

  const a = analysis as AnalysisRow;

  /* -- Processing state -------------------------------------------------- */
  if (a.status === "processing") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-gray-200/60 bg-white p-12">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-friction-blue" />
          <h2 className="text-lg font-semibold text-gray-900">
            Analysis in Progress
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Your reviews for{" "}
            <span className="font-medium">{a.app_name}</span> are being
            analyzed. This page will update when complete.
          </p>
          <p className="mt-4 text-xs text-gray-500">
            {a.review_count} reviews queued
          </p>
        </div>
      </div>
    );
  }

  /* -- Failed state ------------------------------------------------------ */
  if (a.status === "failed") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-[#C47070]/20 bg-[#C47070]/[0.06] p-12">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#C47070]/10 text-[#C47070]">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[#C47070]">
            Analysis Failed
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Something went wrong while analyzing reviews for{" "}
            <span className="font-medium text-gray-600">{a.app_name}</span>.
          </p>
          <p className="mt-4 text-xs text-[#C47070]/70">
            Please check your API key in Settings and try again.
          </p>
        </div>
      </div>
    );
  }

  /* -- Fetch reviews ----------------------------------------------------- */
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      "id, content, rating, author, review_date, love_score, frustration_score, loyalty_score, momentum_score, wom_score, churn_risk, summary"
    )
    .eq("analysis_id", id)
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

  // Compute churn risk percentage
  const churnRiskCount = typedReviews.filter(
    (r) => r.churn_risk === "Critical" || r.churn_risk === "High"
  ).length;
  const churnRiskPct =
    typedReviews.length > 0
      ? Math.round((churnRiskCount / typedReviews.length) * 100)
      : 0;

  const topFriction = frictionScores[0] ?? null;

  // Map AnalysisResult.friction_scores (mention_count) to FrictionItem (mentions).
  // Stored analyses in Supabase use mention_count; we translate at the UI boundary.
  const mappedFrictionScores: FrictionItem[] = frictionScores.map((f) => ({
    feature: f.feature,
    score: f.score,
    mentions: f.mention_count,
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

  const hasCompetitors = (a.competitors?.length ?? 0) > 0;
  const hasRelease = !!releaseImpact;
  const sectionIds = [
    "summary",
    ...(dimensionScores ? ["dimensions" as const] : []),
    "friction",
    "churn",
    ...(hasRelease ? ["release" as const] : []),
    ...(hasCompetitors ? ["compare" as const] : []),
    "actions",
    "data",
  ];

  return (
    <div className="min-h-screen">
      {/* Breadcrumb — gives users a way back to the Command Center without
          relying on the sidebar (especially useful when the report nav is
          sticky and pushes the rest of the chrome out of view). */}
      <div className="mx-auto flex max-w-[920px] items-center gap-1 px-4 pt-6 text-xs sm:px-6 lg:px-7">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 rounded-md px-1.5 py-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Command Center
        </Link>
        <span className="text-slate-300" aria-hidden="true">/</span>
        <span className="truncate text-slate-700 font-medium">{a.app_name}</span>
      </div>

      {/* Sticky report navigation */}
      <ReportNav
        analysisId={a.id}
        appName={a.app_name}
        isPublic={a.is_public ?? false}
        slug={a.slug ?? null}
        availableSectionIds={sectionIds}
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

      {/* ------- 5. Release (only when version-tagged data exists) ------- */}
      {hasRelease && <ReleaseSection releaseImpact={releaseImpact} />}

      {/* ------- 6. Compare (only when competitors were analyzed) ------- */}
      {hasCompetitors && (
        <CompareSection
          appName={a.app_name}
          vibeScore={Math.round(vibeScore)}
          dimensionScores={dimensionScores ?? undefined}
          competitors={a.competitors ?? undefined}
        />
      )}

      {/* ------- 7. Actions ------- */}
      <ActionsSection actionItems={actionItems} />

      {/* ------- 8. Data Explorer ------- */}
      <ExplorerSection reviews={explorerReviews} />
    </div>
  );
}
