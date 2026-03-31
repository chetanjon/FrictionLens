"use client";

import { useMemo } from "react";
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

type AppScore = {
  appName: string;
  vibeScore: number;
  color: string;
};

export function VibeScoreTrendChart({ data }: VibeScoreTrendChartProps) {
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

  if (data.length === 1) {
    const app = appScores[0];
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div
          className="mb-3 flex h-16 w-16 items-center justify-center rounded-full font-mono text-xl font-bold text-white"
          style={{ backgroundColor: app.color, boxShadow: `0 0 20px ${app.color}40` }}
        >
          {app.vibeScore}
        </div>
        <p className="text-sm font-medium text-white">{app.appName}</p>
        <p className="mt-1 text-xs text-slate-500">
          Run more analyses to compare apps
        </p>
      </div>
    );
  }

  const gridLines = [0, 25, 50, 75, 100];

  return (
    <div className="pt-2">
      {/* Grid + Bars */}
      <div className="relative">
        {/* Y-axis grid lines */}
        {gridLines.map((val) => (
          <div
            key={val}
            className="absolute left-0 right-0 flex items-center"
            style={{ bottom: `${val}%` }}
          >
            <span className="absolute -left-1 -translate-x-full font-mono text-[10px] text-slate-600 tabular-nums">
              {val}
            </span>
            <div className="ml-6 flex-1 border-t border-white/[0.04]" />
          </div>
        ))}

        {/* Bars container */}
        <div
          className="relative ml-8 flex items-end justify-around gap-3"
          style={{ height: 220 }}
        >
          {appScores.map((app) => {
            const pct = app.vibeScore;
            return (
              <div
                key={app.appName}
                className="group flex flex-1 max-w-20 flex-col items-center"
              >
                {/* Score label above bar */}
                <span
                  className="mb-2 font-mono text-xs font-bold transition-all duration-300 group-hover:scale-110"
                  style={{ color: app.color }}
                >
                  {app.vibeScore}
                </span>

                {/* Bar */}
                <div
                  className="relative w-full rounded-t-lg transition-all duration-500 ease-out"
                  style={{
                    height: `${Math.max(pct * 1.8, 8)}px`,
                    background: `linear-gradient(to top, ${app.color}CC, ${app.color})`,
                    boxShadow: `0 0 20px ${app.color}30, inset 0 1px 0 rgba(255,255,255,0.15)`,
                  }}
                >
                  {/* Shine effect */}
                  <div
                    className="absolute inset-y-0 left-0 w-1/3 rounded-tl-lg opacity-20"
                    style={{
                      background: "linear-gradient(to right, rgba(255,255,255,0.3), transparent)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="ml-8 mt-3 flex items-start justify-around gap-3">
        {appScores.map((app) => (
          <div key={app.appName} className="flex-1 max-w-20 text-center">
            <p
              className={cn(
                "truncate text-[10px] font-medium",
                app.vibeScore >= 75
                  ? "text-friction-blue"
                  : app.vibeScore >= 50
                    ? "text-friction-amber"
                    : "text-friction-red"
              )}
            >
              {app.appName}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
