"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { TooltipContentProps } from "recharts/types/component/Tooltip";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { cn } from "@/lib/utils";

type TrendDataPoint = {
  date: string;
  label: string;
  [appName: string]: number | string;
};

type TrendAreaChartProps = {
  data: TrendDataPoint[];
  appNames: string[];
  height?: number;
};

/**
 * Brand palette for multi-app charting. First entry is friction-blue.
 * Subsequent entries cycle through secondary brand colours.
 */
const APP_COLORS: string[] = [
  "#4A90D9",
  "#D94F4F",
  "#D4A843",
  "#6B5CE7",
  "#E8457C",
  "#22C55E",
];

function appColor(index: number): string {
  return APP_COLORS[index % APP_COLORS.length];
}

type PayloadEntry = {
  name: string;
  value: number;
  color?: string;
};

type CustomTooltipProps = TooltipContentProps<ValueType, NameType> & {
  appNames: string[];
};

function CustomTooltip(props: CustomTooltipProps) {
  const { active, payload, label, appNames } = props;
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      className={cn(
        "bg-white/65 backdrop-blur-xl border border-slate-200/60 rounded-2xl",
        "px-4 py-3 shadow-xl shadow-slate-200/40"
      )}
    >
      <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[2px] text-slate-400">
        {label}
      </p>
      <div className="flex flex-col gap-1.5">
        {(payload as unknown as PayloadEntry[]).map((entry) => {
          const idx = appNames.indexOf(entry.name);
          const color = appColor(idx >= 0 ? idx : 0);
          return (
            <div key={entry.name} className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-[12px] font-medium text-slate-700">
                {entry.name}
              </span>
              <span
                className="ml-auto font-mono text-sm font-bold tabular-nums"
                style={{ color }}
              >
                {typeof entry.value === "number"
                  ? entry.value.toFixed(0)
                  : String(entry.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TrendAreaChart({
  data,
  appNames,
  height = 280,
}: TrendAreaChartProps) {
  if (data.length === 0 || appNames.length === 0) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height }}
        aria-label="No trend data available"
      >
        <p className="text-sm text-slate-400">No trend data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 4, bottom: 0, left: -16 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#F1F5F9"
          vertical={false}
        />

        <XAxis
          dataKey="label"
          tick={{
            fontSize: 10,
            fill: "#94A3B8",
            fontFamily: "IBM Plex Mono, monospace",
          }}
          axisLine={false}
          tickLine={false}
          dy={6}
        />

        <YAxis
          domain={[0, 100]}
          tick={{
            fontSize: 10,
            fill: "#94A3B8",
            fontFamily: "IBM Plex Mono, monospace",
          }}
          axisLine={false}
          tickLine={false}
          ticks={[0, 25, 50, 75, 100]}
          dx={-4}
        />

        <Tooltip
          content={(tooltipProps) => (
            <CustomTooltip
              {...(tooltipProps as TooltipContentProps<ValueType, NameType>)}
              appNames={appNames}
            />
          )}
          cursor={{
            stroke: "#E2E8F0",
            strokeWidth: 1,
            strokeDasharray: "4 2",
          }}
        />

        {appNames.map((name, idx) => {
          const color = appColor(idx);

          return (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 4, fill: color, stroke: "white", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: color, stroke: "white", strokeWidth: 2 }}
              connectNulls={false}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}
