"use client";

import { useState } from "react";
import { SectionWrapper } from "@/components/report/section-wrapper";
import { GlassCard } from "@/components/report/glass-card";
import { severityColor } from "@/lib/constants";

type ReviewRow = {
  rating?: number;
  content: string;
  love_score?: number;
  frustration_score?: number;
  churn_risk?: string;
};

type ExplorerSectionProps = {
  reviews: ReviewRow[];
};

const TABS = ["all", "1", "2", "3", "4", "5"] as const;
const PAGE_SIZE = 20;

function ratingColor(rating: number): string {
  if (rating <= 2) return "#D94F4F";
  if (rating <= 3) return "#D4A843";
  return "#4A90D9";
}

function starDisplay(rating: number): string {
  return "\u2605".repeat(rating) + "\u2606".repeat(5 - rating);
}

export function ExplorerSection({ reviews }: ExplorerSectionProps) {
  const [tab, setTab] = useState<string>("all");

  const filtered =
    tab === "all"
      ? reviews
      : reviews.filter((r) => r.rating === Number(tab));

  const displayed = filtered.slice(0, PAGE_SIZE);

  return (
    <SectionWrapper
      id="data"
      label="Section 08"
      title="Review Explorer"
      alt
    >
      {/* Filter tabs */}
      <div className="mb-4 flex gap-1.5">
        {TABS.map((t) => {
          const isActive = tab === t;
          const label = t === "all" ? "All" : `${t}\u2605`;

          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="cursor-pointer rounded-lg border px-3.5 py-[5px] font-mono text-xs font-medium transition-colors"
              style={{
                borderColor: isActive
                  ? "rgba(74,144,217,0.3)"
                  : "#E2E8F0",
                background: isActive
                  ? "rgba(74,144,217,0.06)"
                  : "white",
                color: isActive ? "#4A90D9" : "#94A3B8",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <GlassCard hover={false} className="overflow-hidden p-0">
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr className="bg-slate-50">
              {["Rating", "Review", "Love", "Frust.", "Risk"].map((h) => (
                <th
                  key={h}
                  className="border-b border-slate-100 px-3.5 py-[11px] text-left font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-slate-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3.5 py-8 text-center text-sm text-slate-400"
                >
                  No reviews match this filter.
                </td>
              </tr>
            ) : (
              displayed.map((rv, i) => {
                const rating = rv.rating ?? 0;
                const churnColor = rv.churn_risk
                  ? severityColor(rv.churn_risk)
                  : "#94A3B8";

                return (
                  <tr
                    key={i}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <td
                      className="whitespace-nowrap px-3.5 py-[11px] font-mono font-semibold"
                      style={{ color: ratingColor(rating) }}
                    >
                      {starDisplay(rating)}
                    </td>
                    <td className="max-w-[340px] px-3.5 py-[11px] leading-snug text-slate-500">
                      {rv.content}
                    </td>
                    <td
                      className="px-3.5 py-[11px] font-mono"
                      style={{
                        color:
                          (rv.love_score ?? 0) > 5 ? "#4A90D9" : "#D4A843",
                      }}
                    >
                      {rv.love_score?.toFixed(1) ?? "-"}
                    </td>
                    <td
                      className="px-3.5 py-[11px] font-mono"
                      style={{
                        color:
                          (rv.frustration_score ?? 0) > 5
                            ? "#D94F4F"
                            : "#4A90D9",
                      }}
                    >
                      {rv.frustration_score?.toFixed(1) ?? "-"}
                    </td>
                    <td className="px-3.5 py-[11px]">
                      {rv.churn_risk ? (
                        <span
                          className="inline-block rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold"
                          style={{
                            background: `${churnColor}10`,
                            color: churnColor,
                          }}
                        >
                          {rv.churn_risk}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </GlassCard>

      {/* Footer count */}
      <div className="mt-3 text-right font-mono text-[11px] text-slate-400">
        Showing {displayed.length} of {filtered.length} reviews
      </div>
    </SectionWrapper>
  );
}
