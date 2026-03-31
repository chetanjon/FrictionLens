"use client";

import { TrendAreaChart } from "@/components/charts/trend-area-chart";
import { DimensionHealth } from "@/components/dashboard/dimension-health";

type TrendPoint = {
  date: string;
  label: string;
  appName: string;
  vibeScore: number;
};

type DimensionTrendPoint = {
  date: string;
  label: string;
  appName: string;
  love: number;
  frustration: number;
  loyalty: number;
  momentum: number;
  wom: number;
};

type FrictionFrequencyItem = {
  feature: string;
  count: number;
};

type TrendsClientProps = {
  vibeTrendData: TrendPoint[];
  appNames: string[];
  dimensionTrendData: DimensionTrendPoint[];
  frictionFrequency: FrictionFrequencyItem[];
};

export function TrendsClient({
  vibeTrendData,
  appNames,
  dimensionTrendData,
  frictionFrequency,
}: TrendsClientProps) {
  if (vibeTrendData.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/[0.08] bg-[#111111] px-6 py-16 text-center">
        <p className="text-sm text-slate-500">
          No completed analyses yet. Run your first analysis to see trends.
        </p>
      </div>
    );
  }

  // Compute latest dimension averages for the dimension health display
  const latestDims = dimensionTrendData.length > 0
    ? dimensionTrendData[dimensionTrendData.length - 1]
    : null;

  const maxFreq = frictionFrequency.length > 0 ? frictionFrequency[0].count : 1;

  return (
    <div className="space-y-6">
      {/* Vibe Score Trend */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#111111] p-6">
        <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-friction-blue">
          Vibe Score Over Time
        </p>
        <TrendAreaChart data={vibeTrendData} appNames={appNames} height={320} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Latest Dimensions */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#111111] p-6">
          <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-friction-blue">
            Latest Dimension Scores
          </p>
          {latestDims ? (
            <DimensionHealth
              dimensions={{
                love: latestDims.love,
                frustration: latestDims.frustration,
                loyalty: latestDims.loyalty,
                momentum: latestDims.momentum,
                wom: latestDims.wom,
              }}
            />
          ) : (
            <p className="py-8 text-center text-xs text-slate-400">
              No dimension data available
            </p>
          )}
        </div>

        {/* Friction Feature Frequency */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#111111] p-6">
          <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-friction-blue">
            Top Friction Features
          </p>
          {frictionFrequency.length > 0 ? (
            <div className="space-y-2.5">
              {frictionFrequency.map((item) => (
                <div key={item.feature} className="flex items-center gap-3">
                  <span className="w-28 truncate text-xs font-medium text-slate-300">
                    {item.feature}
                  </span>
                  <div className="flex-1">
                    <div className="h-5 overflow-hidden rounded-md bg-white/[0.08]">
                      <div
                        className="h-full rounded-md bg-friction-red/70 transition-all"
                        style={{
                          width: `${Math.max(8, (item.count / maxFreq) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="w-8 text-right font-mono text-xs font-medium text-slate-500">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-xs text-slate-400">
              No friction data available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
