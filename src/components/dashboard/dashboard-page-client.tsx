"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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

export function DashboardPageClient(props: DashboardPageClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Auto-open dialog when sidebar "New Analysis" button navigates here with ?new=1
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setDialogOpen(true);
      router.replace("/dashboard", { scroll: false });
    }
  }, [searchParams, router]);

  if (props.analysisCount === 0 && props.recentAnalyses.length === 0) {
    return (
      <>
        <EmptyStateGuide
          hasApiKey={props.hasApiKey}
          freeTrialRemaining={props.freeTrialRemaining}
          onNewAnalysis={() => setDialogOpen(true)}
        />
        <NewAnalysisDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          hasApiKey={props.hasApiKey}
          freeTrialRemaining={props.freeTrialRemaining}
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
