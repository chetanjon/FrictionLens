"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PortfolioKpiStrip } from "@/components/dashboard/portfolio-kpi-strip";
import { VibeScoreTrendChart } from "@/components/dashboard/vibe-trend-chart";
import { DimensionHealth } from "@/components/dashboard/dimension-health";
import { RecentAnalysesGrid } from "@/components/dashboard/recent-analyses-grid";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { NewAnalysisDialog } from "@/components/dashboard/new-analysis-dialog";
import type { AnalysisCardProps } from "@/components/dashboard/analysis-card";
import type { ActivityEvent } from "@/components/dashboard/activity-feed";

type DimensionScores = {
  love: number;
  frustration: number;
  loyalty: number;
  momentum: number;
  wom: number;
};

type TrendPoint = {
  date: string;
  label: string;
  appName: string;
  vibeScore: number;
};

type DashboardCommandCenterProps = {
  displayName: string;
  hasApiKey: boolean;
  freeTrialRemaining?: number;
  avgVibeScore: number | null;
  totalReviews: number;
  analysisCount: number;
  thisMonthCount: number;
  topFrictionFeature: { name: string; score: number } | null;
  vibeScoreTrend: number[];
  avgDimensions: DimensionScores | null;
  trendData: TrendPoint[];
  trendAppNames: string[];
  recentAnalyses: AnalysisCardProps[];
  activityEvents: ActivityEvent[];
};

export function DashboardCommandCenter({
  displayName,
  hasApiKey,
  freeTrialRemaining,
  avgVibeScore,
  totalReviews,
  analysisCount,
  thisMonthCount,
  topFrictionFeature,
  vibeScoreTrend,
  avgDimensions,
  trendData,
  trendAppNames,
  recentAnalyses,
  activityEvents,
}: DashboardCommandCenterProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <DashboardHeader
        displayName={displayName}
        onNewAnalysis={() => setDialogOpen(true)}
      />

      {/* KPI Strip */}
      <div className="mt-6">
        <PortfolioKpiStrip
          avgVibeScore={avgVibeScore}
          totalReviews={totalReviews}
          analysisCount={analysisCount}
          thisMonthCount={thisMonthCount}
          topFrictionFeature={topFrictionFeature}
          vibeScoreTrend={vibeScoreTrend}
        />
      </div>

      {/* Charts Row */}
      {analysisCount > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <div className="h-full rounded-2xl border border-slate-200/60 bg-white/65 p-5 backdrop-blur-xl">
              <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-friction-blue">
                Vibe Score Trend
              </p>
              <VibeScoreTrendChart data={trendData} appNames={trendAppNames} />
            </div>
          </div>
          <div>
            <div className="h-full rounded-2xl border border-slate-200/60 bg-white/65 p-5 backdrop-blur-xl">
              <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-friction-blue">
                Sentiment Radar
              </p>
              {avgDimensions ? (
                <DimensionHealth dimensions={avgDimensions} />
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
                    <svg className="h-5 w-5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 16l4-8 4 4 5-10" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-xs text-slate-400">
                    Complete an analysis to see dimensions
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Row: Recent + Activity */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentAnalysesGrid analyses={recentAnalyses} />
        </div>
        <div className="lg:col-span-1">
          <ActivityFeed events={activityEvents} />
        </div>
      </div>

      <NewAnalysisDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        hasApiKey={hasApiKey}
        freeTrialRemaining={freeTrialRemaining}
      />
    </div>
  );
}
