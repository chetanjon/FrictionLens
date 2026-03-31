"use client";

import { useMemo } from "react";
import { TrendAreaChart } from "@/components/charts/trend-area-chart";

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

export function VibeScoreTrendChart({
  data,
  appNames,
  height = 240,
}: VibeScoreTrendChartProps) {
  // Transform flat array of {date, label, appName, vibeScore}
  // into recharts format: {label, [appName]: vibeScore, ...}
  const chartData = useMemo(() => {
    const grouped = new Map<string, { date: string; label: string; [k: string]: string | number }>();

    for (const point of data) {
      const key = point.date;
      if (!grouped.has(key)) {
        grouped.set(key, { date: point.date, label: point.label });
      }
      const row = grouped.get(key)!;
      row[point.appName] = point.vibeScore;
    }

    return [...grouped.values()];
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-xs text-slate-400">
          Run analyses to see vibe score trends
        </p>
      </div>
    );
  }

  if (data.length === 1) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div
          className="mb-3 flex h-16 w-16 items-center justify-center rounded-full font-mono text-xl font-bold text-white"
          style={{ backgroundColor: "#4A90D9" }}
        >
          {data[0].vibeScore}
        </div>
        <p className="text-sm font-medium text-slate-300">{data[0].appName}</p>
        <p className="mt-1 text-xs text-slate-400">
          Run more analyses to see trends over time
        </p>
      </div>
    );
  }

  return <TrendAreaChart data={chartData} appNames={appNames} height={height} />;
}
