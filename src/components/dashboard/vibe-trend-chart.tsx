"use client";

import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

type TrendPoint = {
  date: string;
  label: string;
  appName: string;
  vibeScore: number;
};

type VibeScoreTrendChartProps = {
  data: TrendPoint[];
  appNames: string[];
  height?: number;
};

function vibeColor(score: number): string {
  if (score >= 75) return "#4A90D9";
  if (score >= 50) return "#D4A843";
  return "#D94F4F";
}

function vibeLabel(score: number): string {
  if (score >= 75) return "Great";
  if (score >= 50) return "Fair";
  return "Needs Work";
}

function relativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

type AppScore = {
  appName: string;
  vibeScore: number;
  date: string;
  color: string;
};

export function VibeScoreTrendChart({
  data,
}: VibeScoreTrendChartProps) {
  const appScores = useMemo(() => {
    const latest = new Map<string, TrendPoint>();
    for (const point of data) {
      const existing = latest.get(point.appName);
      if (!existing || point.date > existing.date) {
        latest.set(point.appName, point);
      }
    }
    return [...latest.values()]
      .map((p): AppScore => ({
        appName: p.appName,
        vibeScore: Math.round(p.vibeScore),
        date: p.date,
        color: vibeColor(p.vibeScore),
      }))
      .sort((a, b) => b.vibeScore - a.vibeScore);
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-xs text-slate-500">
          Run analyses to see vibe score trends
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appScores.map((app) => (
        <div
          key={app.appName}
          className="group flex items-center gap-4 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 transition-all duration-200 hover:bg-white/[0.05] hover:border-white/[0.10]"
        >
          {/* Score circle */}
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-mono text-base font-bold text-white"
            style={{
              backgroundColor: app.color,
              boxShadow: `0 0 16px ${app.color}30`,
            }}
          >
            {app.vibeScore}
          </div>

          {/* App name + date */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {app.appName}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {relativeTime(app.date)}
            </p>
          </div>

          {/* Score bar */}
          <div className="hidden sm:flex flex-1 items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${app.vibeScore}%`,
                  backgroundColor: app.color,
                  boxShadow: `0 0 8px ${app.color}40`,
                }}
              />
            </div>
          </div>

          {/* Label */}
          <span
            className={cn(
              "shrink-0 rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
              app.vibeScore >= 75
                ? "bg-friction-blue/10 text-friction-blue"
                : app.vibeScore >= 50
                  ? "bg-friction-amber/10 text-friction-amber"
                  : "bg-friction-red/10 text-friction-red"
            )}
          >
            {vibeLabel(app.vibeScore)}
          </span>
        </div>
      ))}
    </div>
  );
}
