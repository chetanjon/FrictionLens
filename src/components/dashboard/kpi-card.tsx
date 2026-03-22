import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/report/glass-card";
import { Sparkline } from "@/components/charts/sparkline";

type KpiCardDelta = {
  value: string;
  positive: boolean;
};

type KpiCardProps = {
  label: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  delta?: KpiCardDelta;
  sparklineData?: number[];
  icon?: ReactNode;
};

export function KpiCard({
  label,
  value,
  subtitle,
  color,
  delta,
  sparklineData,
  icon,
}: KpiCardProps) {
  return (
    <GlassCard className="flex flex-col gap-3 p-4">
      {/* Header row: label + icon */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-friction-blue">
          {label}
        </span>
        {icon && (
          <span className="shrink-0 text-slate-400" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>

      {/* Value row */}
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <div
            className="truncate font-mono text-2xl font-extrabold tracking-tight leading-none"
            style={color ? { color } : undefined}
            title={String(value)}
          >
            {value}
          </div>

          {subtitle && (
            <div className="mt-1 text-xs text-slate-400 leading-snug">
              {subtitle}
            </div>
          )}

          {delta && (
            <div
              className={cn(
                "mt-1.5 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold",
                delta.positive
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-500"
              )}
              aria-label={`Change: ${delta.value}`}
            >
              <span aria-hidden="true">{delta.positive ? "▲" : "▼"}</span>
              {delta.value}
            </div>
          )}
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <div className="shrink-0" aria-hidden="true">
            <Sparkline
              data={sparklineData}
              width={80}
              height={28}
              color={color ?? "#4A90D9"}
            />
          </div>
        )}
      </div>
    </GlassCard>
  );
}
