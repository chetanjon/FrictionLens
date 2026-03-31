import Link from "next/link";
import { AnalysisCard } from "@/components/dashboard/analysis-card";
import type { AnalysisCardProps } from "@/components/dashboard/analysis-card";
import { Badge } from "@/components/ui/badge";

type RecentAnalysesGridProps = {
  analyses: AnalysisCardProps[];
};

const MAX_VISIBLE = 6;

export function RecentAnalysesGrid({ analyses }: RecentAnalysesGridProps) {
  if (analyses.length === 0) return null;

  const visible = analyses.slice(0, MAX_VISIBLE);

  return (
    <section aria-labelledby="recent-analyses-heading">
      {/* Section header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2
            id="recent-analyses-heading"
            className="font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-friction-blue"
          >
            Recent Analyses
          </h2>
          <Badge
            className="bg-white/[0.06] text-slate-400 border-white/[0.08] font-mono text-[10px]"
            variant="outline"
          >
            {analyses.length}
          </Badge>
        </div>

        <Link
          href="/dashboard/analyses"
          className="font-mono text-[10px] font-semibold uppercase tracking-[2px] text-slate-400 transition-colors hover:text-friction-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-friction-blue focus-visible:ring-offset-1 rounded"
          aria-label="View all analyses"
        >
          View all
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((analysis) => (
          <AnalysisCard key={analysis.id} {...analysis} />
        ))}
      </div>
    </section>
  );
}
