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
  if (rating <= 2) return "#C47070";
  if (rating <= 3) return "#C9B06A";
  return "#6B9FD4";
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
                  ? "rgba(107,159,212,0.3)"
                  : "rgba(255,255,255,0.06)",
                background: isActive
                  ? "rgba(107,159,212,0.08)"
                  : "rgba(255,255,255,0.03)",
                color: isActive ? "#6B9FD4" : "#94A3B8",
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
            <tr className="bg-white">
              {["Rating", "Review", "Love", "Frust.", "Risk"].map((h) => (
                <th
                  key={h}
                  className="border-b border-gray-200 px-3.5 py-[11px] text-left font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-gray-500"
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
                  className="px-3.5 py-8 text-center text-sm text-gray-500"
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
                    className="border-b border-gray-200 last:border-b-0"
                  >
                    <td
                      className="whitespace-nowrap px-3.5 py-[11px] font-mono font-semibold"
                      style={{ color: ratingColor(rating) }}
                    >
                      {starDisplay(rating)}
                    </td>
                    <td className="max-w-[340px] px-3.5 py-[11px] leading-snug text-gray-500">
                      {rv.content}
                    </td>
                    <td
                      className="px-3.5 py-[11px] font-mono"
                      style={{
                        color:
                          (rv.love_score ?? 0) > 5 ? "#6B9FD4" : "#C9B06A",
                      }}
                    >
                      {rv.love_score?.toFixed(1) ?? "-"}
                    </td>
                    <td
                      className="px-3.5 py-[11px] font-mono"
                      style={{
                        color:
                          (rv.frustration_score ?? 0) > 5
                            ? "#C47070"
                            : "#6B9FD4",
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
                        <span className="text-gray-600">-</span>
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
      <div className="mt-3 text-right font-mono text-[11px] text-gray-500">
        Showing {displayed.length} of {filtered.length} reviews
      </div>
    </SectionWrapper>
  );
}
