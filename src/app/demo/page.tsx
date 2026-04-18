import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { SAMPLE_REPORT, SAMPLE_REVIEWS } from "@/lib/demo/sample-vibe-report";

/* ---------------------------------------------------------------------------
 * Dynamic section imports — match the vibe-report page so the demo and the
 * real report stay visually identical.
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

const SummarySection = dynamic(
  () =>
    import("@/components/report/sections/summary-section").then(
      (m) => m.SummarySection
    ),
  { loading: sectionFallback("Summary") }
);

const DimensionsSection = dynamic(
  () =>
    import("@/components/report/sections/dimensions-section").then(
      (m) => m.DimensionsSection
    ),
  { loading: sectionFallback("Dimensions") }
);

const FrictionSection = dynamic(
  () =>
    import("@/components/report/sections/friction-section").then(
      (m) => m.FrictionSection
    ),
  { loading: sectionFallback("Friction Scores") }
);

const ChurnSection = dynamic(
  () =>
    import("@/components/report/sections/churn-section").then(
      (m) => m.ChurnSection
    ),
  { loading: sectionFallback("Churn Drivers") }
);

const ReleaseSection = dynamic(
  () =>
    import("@/components/report/sections/release-section").then(
      (m) => m.ReleaseSection
    ),
  { loading: sectionFallback("Release Impact") }
);

const CompareSection = dynamic(
  () =>
    import("@/components/report/sections/compare-section").then(
      (m) => m.CompareSection
    ),
  { loading: sectionFallback("Compare") }
);

const ActionsSection = dynamic(
  () =>
    import("@/components/report/sections/actions-section").then(
      (m) => m.ActionsSection
    ),
  { loading: sectionFallback("Action Items") }
);

const ExplorerSection = dynamic(
  () =>
    import("@/components/report/sections/explorer-section").then(
      (m) => m.ExplorerSection
    ),
  { loading: sectionFallback("Data Explorer") }
);

const ReportNav = dynamic(() =>
  import("@/components/report/report-nav").then((m) => m.ReportNav)
);

/* ---------------------------------------------------------------------------
 * Metadata
 * ----------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: `${SAMPLE_REPORT.app_name} \u2014 sample Vibe Report`,
  description:
    "See what FrictionLens makes from app reviews. Sample report for Spotify: scores, top complaints, and what to fix first.",
  openGraph: {
    title: `${SAMPLE_REPORT.app_name} \u2014 sample Vibe Report`,
    description:
      "Sample report for Spotify: scores, top complaints, and what to fix first.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SAMPLE_REPORT.app_name} \u2014 sample Vibe Report`,
    description:
      "Sample report for Spotify: scores, top complaints, and what to fix first.",
  },
};

/* ---------------------------------------------------------------------------
 * Page
 * ----------------------------------------------------------------------- */

export default function DemoPage() {
  const a = SAMPLE_REPORT;
  const reviews = SAMPLE_REVIEWS;

  const churnRiskCount = reviews.filter(
    (r) => r.churn_risk === "Critical" || r.churn_risk === "High"
  ).length;
  const churnRiskPct =
    reviews.length > 0
      ? Math.round((churnRiskCount / reviews.length) * 100)
      : 0;

  const topFriction = a.friction_scores[0] ?? null;

  const mappedFrictionScores = a.friction_scores.map((f) => ({
    feature: f.feature,
    score: f.score,
    mentions: f.mentions,
    trend: f.trend,
    delta: f.delta,
  }));

  const explorerReviews = reviews.map((r) => ({
    rating: r.rating ?? undefined,
    content: r.content,
    love_score: r.love_score ?? undefined,
    frustration_score: r.frustration_score ?? undefined,
    churn_risk: r.churn_risk ?? undefined,
  }));

  // All sections have data in the demo, so include them all in the nav.
  const sectionIds = [
    "summary",
    "dimensions",
    "friction",
    "churn",
    "release",
    "compare",
    "actions",
    "data",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 relative">
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

      {/* Demo banner — clearly marks this as a sample with a CTA */}
      <div className="relative z-20 border-b border-friction-blue/20 bg-gradient-to-r from-friction-blue/10 via-friction-blue/5 to-friction-blue/10">
        <div className="mx-auto flex max-w-[920px] flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-7">
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <Sparkles
              className="h-3.5 w-3.5 text-friction-blue"
              aria-hidden="true"
            />
            <span className="font-semibold">Sample report</span>
            <span className="text-slate-500">
              &mdash; example numbers for Spotify so you can see how it works.
              Sign up to run one for your own app.
            </span>
          </div>
          <Link
            href="/signup"
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-friction-blue px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-friction-blue/90"
          >
            Try it free
          </Link>
        </div>
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
            <span className="text-[15px] font-bold tracking-tight text-slate-900">
              FrictionLens
            </span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-mono uppercase tracking-[2px]">
              Vibe Report Demo
            </span>
          </div>
        </div>
      </header>

      <div className="relative z-10">
        <ReportNav
          analysisId={a.id}
          appName={a.app_name}
          isPublic={true}
          slug={a.slug}
          readOnly
          availableSectionIds={sectionIds}
        />

        <SummarySection
          appName={a.app_name}
          platform={a.platform ?? undefined}
          vibeScore={Math.round(a.vibe_score)}
          summary={a.results.summary}
          reviewCount={a.review_count}
          topFriction={topFriction?.feature}
          topFrictionScore={topFriction?.score}
          churnRiskPercent={churnRiskPct}
          dimensionScores={a.dimension_scores}
          frictionScores={mappedFrictionScores
            .slice(0, 5)
            .map((f) => ({ name: f.feature, score: f.score }))}
        />

        <DimensionsSection dimensionScores={a.dimension_scores} />

        <FrictionSection frictionScores={mappedFrictionScores} />

        <ChurnSection
          churnDrivers={a.churn_drivers}
          churnRiskPercent={churnRiskPct}
        />

        <ReleaseSection releaseImpact={a.release_impact} />

        <CompareSection
          appName={a.app_name}
          vibeScore={Math.round(a.vibe_score)}
          dimensionScores={a.dimension_scores}
          competitors={a.competitors}
        />

        <ActionsSection actionItems={a.action_items} />

        <ExplorerSection reviews={explorerReviews} />

        {/* CTA footer */}
        <footer className="border-t border-slate-200 print:hidden">
          <div className="mx-auto max-w-[920px] px-4 py-14 sm:px-6 lg:px-7">
            <div className="relative overflow-hidden rounded-2xl bg-slate-900 px-8 py-12 text-center md:px-14">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-friction-blue/20 blur-3xl" />
                <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-friction-amber/15 blur-3xl" />
              </div>
              <div className="relative">
                <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                  Run this on your own app in 90 seconds
                </h3>
                <p className="mx-auto mt-3 max-w-md text-sm text-slate-300">
                  Free to start, no credit card needed. Add your own Google
                  Gemini key (free from Google) when you want to run more.
                </p>
                <Link
                  href="/signup"
                  className="mt-6 inline-flex h-10 items-center rounded-xl bg-white px-6 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors shadow-lg shadow-black/20"
                >
                  Try FrictionLens Free&nbsp;&rarr;
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
