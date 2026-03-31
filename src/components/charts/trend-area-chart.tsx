"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { TooltipContentProps } from "recharts/types/component/Tooltip";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

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

const APP_COLORS: string[] = [
  "#6B9FD4",
  "#C47070",
  "#C9B06A",
  "#8B7FD4",
  "#C9708A",
  "#5CB88A",
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
    <div className="rounded-xl border border-white/[0.10] bg-[#1A1A1A] px-4 py-3 shadow-xl shadow-black/40">
      <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[2px] text-slate-500">
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
                style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}60` }}
              />
              <span className="text-[12px] font-medium text-slate-300">
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
        <p className="text-sm text-slate-500">No trend data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={data}
        margin={{ top: 8, right: 4, bottom: 0, left: -16 }}
      >
        <defs>
          {appNames.map((name, idx) => {
            const color = appColor(idx);
            return (
              <linearGradient key={name} id={`grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            );
          })}
        </defs>

        <CartesianGrid
          strokeDasharray="0"
          stroke="rgba(255,255,255,0.06)"
          vertical={false}
        />

        <XAxis
          dataKey="label"
          tick={{
            fontSize: 10,
            fill: "#64748B",
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
            fill: "#64748B",
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
            stroke: "rgba(255,255,255,0.08)",
            strokeWidth: 1,
          }}
        />

        {appNames.map((name, idx) => {
          const color = appColor(idx);

          return (
            <Area
              key={name}
              type="monotone"
              dataKey={name}
              stroke={color}
              strokeWidth={2.5}
              fill={`url(#grad-${idx})`}
              style={{ filter: `drop-shadow(0 0 4px ${color}50)` }}
              dot={{
                r: 5,
                fill: color,
                stroke: "black",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 7,
                fill: color,
                stroke: "black",
                strokeWidth: 3,
                style: { filter: `drop-shadow(0 0 8px ${color}AA)` },
              }}
              connectNulls={false}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}
