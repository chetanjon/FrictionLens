import { notFound } from "next/navigation";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { AnalysisResult, FrictionItem } from "@/lib/types/review";
import { ReportNav } from "@/components/report/report-nav";
import { GlassCard } from "@/components/report/glass-card";
import { getSiteUrl } from "@/lib/config/site";

// Public reports are immutable once completed (the few that change — e.g. an
// owner toggling is_public — should call revalidatePath at the toggle site).
// Hourly ISR lets Vercel's edge cache serve subsequent requests instantly,
// which both improves load time and lets Googlebot crawl reliably.
export const revalidate = 3600;

/* ---------------------------------------------------------------------------
 * Dynamic section imports with graceful fallbacks
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
    return { title: "Vibe Report" };
  }

  const { createServerClient } = await import("@supabase/ssr");
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const { data } = await supabase
    .from("analyses")
    .select("app_name, vibe_score, results")
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (!data) {
    return { title: "Report Not Found" };
  }

  const appUrl = getSiteUrl();
  const score = Math.round(data.vibe_score ?? 0);
  const aiSummary =
    typeof (data.results as AnalysisResult | null)?.summary === "string"
      ? ((data.results as AnalysisResult).summary ?? "").trim()
      : "";

  // Twitter caps descriptions around 200 chars; Open Graph is more generous
  // but keep the share preview readable.
  const fallbackDescription = `Vibe Score ${score}/100 — friction scores, churn drivers, and actionable insights for ${data.app_name}.`;
  const description = aiSummary
    ? aiSummary.length > 200
      ? `${aiSummary.slice(0, 197)}...`
      : aiSummary
    : fallbackDescription;

  const canonicalUrl = `${appUrl}/vibe/${slug}`;

  return {
    title: `${data.app_name} Vibe Report`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${data.app_name} Vibe Score: ${score}/100`,
      description,
      url: canonicalUrl,
      siteName: "FrictionLens",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${data.app_name} Vibe Score: ${score}/100`,
      description,
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

  // Explicit column list — avoids exposing internal fields (user_id, encrypted
  // keys, etc.) to anon clients even if RLS on `analyses` is ever loosened.
  const { data: analysis, error: analysisError } = await supabase
    .from("analyses")
    .select(
      "id,app_name,platform,status,vibe_score,review_count,results,dimension_scores,friction_scores,churn_drivers,action_items,competitors,created_at,completed_at,is_public,slug"
    )
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
  // Reviews are no longer readable via direct anon SELECT — they go through
  // a SECURITY DEFINER RPC that returns only the columns the public report
  // actually renders (no author, no version, no platform).
  const { data: reviews } = await supabase.rpc(
    "get_public_analysis_reviews",
    { p_slug: slug }
  );

  const typedReviews = (reviews as ReviewRow[] | null) ?? [];

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

  // Map AnalysisResult.friction_scores (mention_count) to FrictionItem (mentions).
  // Separate names are load-bearing: stored analyses in Supabase already use
  // mention_count, so we can't rename the stored shape without a migration.
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

  /* -- JSON-LD structured data ------------------------------------------ */
  const appUrl = getSiteUrl();
  const canonicalUrl = `${appUrl}/vibe/${a.slug ?? slug}`;
  const reportPublishedAt = a.completed_at ?? a.created_at;

  const operatingSystem = (() => {
    const p = (a.platform ?? "").toLowerCase();
    if (p.includes("ios") && p.includes("android")) return "iOS, Android";
    if (p.includes("ios")) return "iOS";
    if (p.includes("android")) return "Android";
    return "Web";
  })();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${a.app_name} Vibe Report`,
    description: summary
      ? summary.slice(0, 280)
      : `Vibe Score ${Math.round(vibeScore)}/100 — sentiment, friction, and churn analysis for ${a.app_name}.`,
    url: canonicalUrl,
    datePublished: reportPublishedAt,
    dateModified: reportPublishedAt,
    author: {
      "@type": "Organization",
      name: "FrictionLens",
      url: appUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "FrictionLens",
      url: appUrl,
    },
    about: {
      "@type": "SoftwareApplication",
      name: a.app_name,
      operatingSystem,
      applicationCategory: "MobileApplication",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Ambient background — soft pastel blobs for depth on the light canvas */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-15%] right-0 h-[600px] w-[600px] rounded-full bg-[#6B9FD4]/[0.10] blur-3xl" />
        <div className="absolute bottom-[-5%] left-[5%] h-[400px] w-[400px] rounded-full bg-[#C9B06A]/[0.08] blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(15,23,42,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.08) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* Branding header */}
      <header className="relative z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[920px] items-center justify-between px-4 py-4 sm:px-6 lg:px-7">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-friction-blue/10 border border-friction-blue/20 text-friction-blue">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <span className="text-[15px] font-bold tracking-tight text-gray-900">
              FrictionLens
            </span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-mono uppercase tracking-[2px]">
              Vibe Report
            </span>
          </div>
        </div>
      </header>

      {/* Report nav (read-only, no share button) — only lists sections that
          are actually rendered below so clicking a tab never lands on an
          empty placeholder. */}
      <div className="relative z-10">
      {(() => {
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
          <>
      <ReportNav
        analysisId={a.id}
        appName={a.app_name}
        isPublic={true}
        slug={a.slug ?? null}
        readOnly
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

      {/* Footer with CTA */}
      <footer className="border-t border-slate-200 print:hidden">
        <div className="mx-auto max-w-[920px] px-4 py-14 sm:px-6 lg:px-7">
          <div className="relative overflow-hidden rounded-2xl bg-slate-900 px-8 py-12 text-center md:px-14">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-friction-blue/20 blur-3xl" />
              <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-friction-amber/15 blur-3xl" />
            </div>
            <div className="relative">
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                Get your own Vibe Report
              </h3>
              <p className="mx-auto mt-3 max-w-sm text-sm text-slate-300">
                Turn hundreds of app store reviews into actionable intelligence. Free to start.
              </p>
              <Link
                href="/signup"
                className="mt-6 inline-flex h-10 items-center rounded-xl bg-white px-6 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors shadow-lg shadow-black/20"
              >
                Try FrictionLens Free&nbsp;&rarr;
              </Link>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-friction-blue text-white">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-700">FrictionLens</span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Powered by AI review intelligence
            </p>
          </div>
        </div>
      </footer>
          </>
        );
      })()}
      </div>
    </div>
  );
}
