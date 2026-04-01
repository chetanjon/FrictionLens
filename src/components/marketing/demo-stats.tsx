"use client";

import { AnimatedCounter } from "@/components/marketing/animated-counter";

type DemoStat = {
  label: string;
  value: number;
  suffix: string;
  decimals?: number;
  color: string;
  sub: string;
  display?: string;
};

const STATS: DemoStat[] = [
  { label: "Churn Risk", value: 18, suffix: "%", color: "text-friction-red", sub: "+3.2% vs prev" },
  { label: "Top Friction", value: 8.2, suffix: "", decimals: 1, color: "text-friction-red", sub: "Shuffle Algorithm" },
  { label: "Release Grade", value: 0, suffix: "", color: "text-friction-amber", sub: "v8.9.42", display: "D+" },
  { label: "Momentum", value: 4.1, suffix: "", decimals: 1, color: "text-friction-amber", sub: "Trending down" },
];

export function DemoStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-gray-200 bg-[#1E2333] p-3 sm:p-4 text-center"
        >
          <div className="text-[9px] font-semibold text-gray-500 uppercase tracking-[1px] font-mono">
            {stat.label}
          </div>
          <div className={`font-mono text-xl sm:text-2xl font-bold mt-1 ${stat.color}`}>
            {stat.display ? (
              stat.display
            ) : (
              <AnimatedCounter
                value={stat.value}
                suffix={stat.suffix}
                decimals={stat.decimals ?? 0}
              />
            )}
          </div>
          <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{stat.sub}</div>
        </div>
      ))}
    </div>
  );
}

export function DemoVibeScore() {
  return (
    <div className="text-right">
      <div className="text-[9px] font-semibold text-gray-500 uppercase tracking-[2px] font-mono">Vibe Score</div>
      <div className="font-serif text-3xl sm:text-4xl font-bold text-friction-amber tracking-tight">
        <AnimatedCounter value={72} duration={1500} />
      </div>
    </div>
  );
}
