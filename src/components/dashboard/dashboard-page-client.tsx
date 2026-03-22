"use client";

import { useState } from "react";
import { DashboardCommandCenter } from "@/components/dashboard/dashboard-command-center";
import { EmptyStateGuide } from "@/components/dashboard/empty-state-guide";
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

type DashboardPageClientProps = {
  displayName: string;
  hasApiKey: boolean;
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

export function DashboardPageClient(props: DashboardPageClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  if (props.analysisCount === 0 && props.recentAnalyses.length === 0) {
    return (
      <>
        <EmptyStateGuide
          hasApiKey={props.hasApiKey}
          onNewAnalysis={() => setDialogOpen(true)}
        />
        <NewAnalysisDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          hasApiKey={props.hasApiKey}
        />
      </>
    );
  }

  return (
    <DashboardCommandCenter
      {...props}
    />
  );
}
