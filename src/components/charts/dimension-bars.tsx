import { Heart, Frown, Shield, TrendingUp, MessageCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type DimensionScores = {
  love: number;
  frustration: number;
  loyalty: number;
  momentum: number;
  wom: number;
};

type DimensionBarsProps = {
  dimensions: DimensionScores;
  compact?: boolean;
};

type DimensionConfig = {
  key: keyof DimensionScores;
  label: string;
  color: string;
  Icon: LucideIcon;
};

const DIMENSION_CONFIG: DimensionConfig[] = [
  { key: "love", label: "Love", color: "#E8457C", Icon: Heart },
  { key: "frustration", label: "Frustration", color: "#D94F4F", Icon: Frown },
  { key: "loyalty", label: "Loyalty", color: "#4A90D9", Icon: Shield },
  { key: "momentum", label: "Momentum", color: "#D4A843", Icon: TrendingUp },
  { key: "wom", label: "Word-of-Mouth", color: "#6B5CE7", Icon: MessageCircle },
];

export function DimensionBars({ dimensions, compact = false }: DimensionBarsProps) {
  return (
    <div
      className={cn("flex flex-col", compact ? "gap-2" : "gap-3")}
      role="list"
      aria-label="Sentiment dimension scores"
    >
      {DIMENSION_CONFIG.map(({ key, label, color, Icon }) => {
        const value = dimensions[key];
        const pct = Math.min(100, Math.max(0, value * 10));

        return (
          <div
            key={key}
            className="flex items-center gap-3"
            role="listitem"
            aria-label={`${label}: ${value.toFixed(1)} out of 10`}
          >
            {/* Icon */}
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-lg",
                compact ? "h-6 w-6" : "h-7 w-7"
              )}
              style={{ backgroundColor: `${color}18` }}
              aria-hidden="true"
            >
              <Icon
                className={compact ? "h-3 w-3" : "h-3.5 w-3.5"}
                style={{ color }}
              />
            </div>

            {/* Label */}
            <span
              className={cn(
                "shrink-0 font-medium text-slate-700",
                compact ? "w-[80px] text-xs" : "w-[100px] text-[13px]"
              )}
            >
              {label}
            </span>

            {/* Bar track */}
            <div
              className={cn(
                "flex-1 rounded-full bg-slate-100",
                compact ? "h-[6px]" : "h-[8px]"
              )}
            >
              <div
                className="h-full rounded-full transition-[width] duration-500 ease-out"
                style={{
                  width: `${pct}%`,
                  backgroundColor: color,
                }}
              />
            </div>

            {/* Value */}
            <span
              className={cn(
                "shrink-0 text-right font-mono font-bold tabular-nums",
                compact ? "w-[30px] text-xs" : "w-[36px] text-sm"
              )}
              style={{ color }}
            >
              {value.toFixed(1)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
