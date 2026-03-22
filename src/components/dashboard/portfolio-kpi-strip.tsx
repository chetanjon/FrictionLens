import {
  Activity,
  MessageSquare,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { vibeColor } from "@/lib/constants";

type PortfolioKpiStripProps = {
  avgVibeScore: number | null;
  totalReviews: number;
  analysisCount: number;
  thisMonthCount: number;
  topFrictionFeature: { name: string; score: number } | null;
  vibeScoreTrend: number[];
};

export function PortfolioKpiStrip({
  avgVibeScore,
  totalReviews,
  analysisCount,
  thisMonthCount,
  topFrictionFeature,
  vibeScoreTrend,
}: PortfolioKpiStripProps) {
  const vibeScoreColor =
    avgVibeScore !== null ? vibeColor(avgVibeScore) : "#94A3B8";

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {/* Avg Vibe Score */}
      <KpiCard
        label="Avg Vibe Score"
        value={avgVibeScore !== null ? Math.round(avgVibeScore) : "--"}
        subtitle={avgVibeScore !== null ? "portfolio average" : "no data yet"}
        color={vibeScoreColor}
        sparklineData={vibeScoreTrend}
        icon={<Activity className="h-4 w-4" />}
      />

      {/* Total Reviews */}
      <KpiCard
        label="Total Reviews"
        value={totalReviews.toLocaleString()}
        subtitle="across all analyses"
        icon={<MessageSquare className="h-4 w-4" />}
      />

      {/* Analyses Run */}
      <KpiCard
        label="Analyses Run"
        value={analysisCount.toLocaleString()}
        subtitle={`${thisMonthCount} this month`}
        icon={<BarChart3 className="h-4 w-4" />}
      />

      {/* Top Friction Feature */}
      <KpiCard
        label="Top Friction"
        value={topFrictionFeature ? topFrictionFeature.score.toFixed(1) : "--"}
        subtitle={topFrictionFeature ? topFrictionFeature.name : "no friction data"}
        color={topFrictionFeature ? "#D94F4F" : undefined}
        icon={<AlertTriangle className="h-4 w-4" />}
      />
    </div>
  );
}
