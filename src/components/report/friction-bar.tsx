import { cn } from "@/lib/utils";
import { scoreColor, trendColor, trendIcon } from "@/lib/constants";

type FrictionBarProps = {
  name: string;
  score: number;
  mentions?: number;
  trend?: "rising" | "stable" | "falling";
  delta?: string;
};

export function FrictionBar({
  name,
  score,
  mentions,
  trend,
  delta,
}: FrictionBarProps) {
  const color = scoreColor(score);

  return (
    <div
      className={cn(
        "grid items-center gap-3.5 rounded-2xl border border-gray-200 bg-white px-[18px] py-[13px]",
        "grid-cols-[160px_1fr_60px_50px_56px]"
      )}
    >
      <span className="text-[13px] font-semibold text-gray-900">{name}</span>

      <div className="h-[5px] rounded-[3px] bg-gray-100">
        <div
          className="h-full rounded-[3px] transition-[width] duration-600 ease-out"
          style={{
            width: `${score * 10}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
          }}
        />
      </div>

      <span
        className="text-right font-mono text-base font-bold"
        style={{ color }}
      >
        {score}
      </span>

      {mentions !== undefined && (
        <span className="text-right font-mono text-[11px] text-gray-600">
          {mentions}
        </span>
      )}

      {trend && delta && (
        <span
          className="text-right font-mono text-xs font-semibold"
          style={{ color: trendColor(trend) }}
        >
          {trendIcon(trend)} {delta}
        </span>
      )}
    </div>
  );
}
