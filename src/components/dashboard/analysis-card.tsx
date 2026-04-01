"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/report/glass-card";
import { VibeScoreCircle } from "@/components/report/vibe-score-circle";
import { Badge } from "@/components/ui/badge";

type DimensionScores = {
  love: number;
  frustration: number;
  loyalty: number;
  momentum: number;
  wom: number;
};

type AnalysisCardProps = {
  id: string;
  appName: string;
  platform: string | null;
  status: string;
  vibeScore: number | null;
  vibeColorHex: string | null;
  reviewCount: number;
  createdAt: string;
  frictionItems?: string[];
  dimensionScores?: DimensionScores | null;
};

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <Badge
          className="gap-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          variant="outline"
        >
          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
          Done
        </Badge>
      );
    case "processing":
      return (
        <Badge
          className="gap-1 bg-amber-500/10 text-amber-400 border-amber-500/20"
          variant="outline"
        >
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          Processing
        </Badge>
      );
    case "failed":
      return (
        <Badge
          className="gap-1 bg-red-500/10 text-red-400 border-red-500/20"
          variant="outline"
        >
          <XCircle className="h-3 w-3" aria-hidden="true" />
          Failed
        </Badge>
      );
    default:
      return (
        <Badge
          className="gap-1 bg-slate-500/10 text-gray-500 border-slate-500/20"
          variant="outline"
        >
          <Clock className="h-3 w-3" aria-hidden="true" />
          Pending
        </Badge>
      );
  }
}

function PlatformBadge({ platform }: { platform: string | null }) {
  if (!platform) return null;

  const label = platform.toLowerCase().includes("android") ? "Android" : "iOS";
  const colorClass =
    label === "Android"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : "bg-blue-500/10 text-blue-400 border-blue-500/20";

  return (
    <Badge className={cn("text-[10px]", colorClass)} variant="outline">
      {label}
    </Badge>
  );
}

function relativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function AnalysisCard({
  id,
  appName,
  platform,
  status,
  vibeScore,
  vibeColorHex,
  reviewCount,
  createdAt,
  frictionItems,
}: AnalysisCardProps) {
  const topFriction = frictionItems?.slice(0, 2) ?? [];
  const isCompleted = status === "completed" && vibeScore !== null;

  return (
    <Link
      href={`/dashboard/analysis/${id}`}
      aria-label={`View ${appName} analysis${vibeScore != null ? `, vibe score ${Math.round(vibeScore)}` : ""}`}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-friction-blue focus-visible:ring-offset-2 rounded-2xl"
    >
      <GlassCard hover className="flex flex-col gap-3 p-4">
        {/* Header: status badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-gray-900">
              {appName}
            </span>
            <PlatformBadge platform={platform} />
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Score + friction */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold text-gray-900 shadow-sm"
            style={{
              backgroundColor: isCompleted && vibeColorHex
                ? vibeColorHex
                : "#CBD5E1",
            }}
          >
            {isCompleted ? Math.round(vibeScore!) : "--"}
          </div>
          {topFriction.length > 0 ? (
            <ul className="min-w-0 space-y-0.5" aria-label="Top friction areas">
              {topFriction.map((item) => (
                <li
                  key={item}
                  className="truncate text-xs text-gray-500"
                >
                  <span className="mr-1.5 inline-block h-1 w-1 rounded-full bg-friction-red/50 align-middle" />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-xs text-gray-500">
              {isCompleted ? "No friction data" : "Awaiting results"}
            </span>
          )}
        </div>

        {/* Bottom: review count + relative date */}
        <div className="flex items-center justify-between gap-2 border-t border-gray-200 pt-2.5">
          <span className="font-mono text-[10px] text-gray-500">
            {reviewCount.toLocaleString()} reviews
          </span>
          <time
            dateTime={createdAt}
            className="font-mono text-[10px] text-gray-500"
          >
            {relativeTime(createdAt)}
          </time>
        </div>
      </GlassCard>
    </Link>
  );
}

export type { AnalysisCardProps };
