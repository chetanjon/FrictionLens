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
  /** REDDIT_CLIENT_ID + SECRET present on the server. */
  redditEnabled: boolean;
};

export function DashboardPageClient(props: DashboardPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Derive the initial dialog state from the URL during the first render
  // instead of inside an effect — avoids the cascading-render that
  // setState-in-effect would cause and satisfies react-hooks/set-state-in-effect.
  const shouldAutoOpen = searchParams.get("new") === "1";
  const [dialogOpen, setDialogOpen] = useState(shouldAutoOpen);

  // After we've consumed `?new=1`, scrub it from the URL so a refresh doesn't
  // reopen the dialog. Plain side-effect, no setState.
  useEffect(() => {
    if (shouldAutoOpen) {
      router.replace("/dashboard", { scroll: false });
    }
    // shouldAutoOpen is captured from first-render searchParams; intentionally
    // not in deps because we only want to scrub the URL once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

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
          redditEnabled={props.redditEnabled}
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
