import { SectionWrapper } from "@/components/report/section-wrapper";
import { GlassCard } from "@/components/report/glass-card";

type CompetitorData = {
  name: string;
  platform: string;
  vibe_score: number;
  review_count: number;
  dimension_scores: {
    love: number;
    frustration: number;
    loyalty: number;
    momentum: number;
    wom: number;
  };
};

type CompareSectionProps = {
  appName?: string;
  vibeScore?: number;
  dimensionScores?: {
    love: number;
    frustration: number;
    loyalty: number;
    momentum: number;
    wom: number;
  };
  competitors?: CompetitorData[];
};

function vibeColor(score: number): string {
  if (score >= 75) return "#4A90D9";
  if (score >= 50) return "#D4A843";
  return "#D94F4F";
}

function dimColor(value: number, invert = false): string {
  const v = invert ? 10 - value : value;
  if (v >= 7) return "#4A90D9";
  if (v >= 4) return "#64748B";
  return "#D94F4F";
}

export function CompareSection({
  appName,
  vibeScore,
  dimensionScores,
  competitors,
}: CompareSectionProps) {
  const hasData = competitors && competitors.length > 0 && dimensionScores;

  return (
    <SectionWrapper
      id="compare"
      label="Section 06"
      title="Competitor Vibe Battle"
      alt
    >
      {hasData ? (
        <>
          {/* Comparison table */}
          <GlassCard hover={false} className="overflow-hidden p-0">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50/80">
                  {["", "Vibe", "Love", "Frust.", "Loyalty", "Mom.", "WoM"].map(
                    (h) => (
                      <th
                        key={h}
                        className={`border-b border-slate-100 px-3.5 py-3 font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-slate-400 ${
                          h ? "text-center" : "text-left"
                        }`}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {/* Your app row (highlighted) */}
                <tr className="bg-friction-blue/[0.04]">
                  <td className="px-3.5 py-3.5 text-sm font-bold text-slate-900">
                    {appName ?? "Your App"}{" "}
                    <span className="ml-1.5 inline-block rounded bg-slate-900 px-1.5 py-px font-mono text-[9px] font-bold text-white">
                      YOU
                    </span>
                  </td>
                  <td
                    className="text-center font-mono text-sm font-bold"
                    style={{ color: vibeColor(vibeScore ?? 0) }}
                  >
                    {Math.round(vibeScore ?? 0)}
                  </td>
                  <td className="text-center font-mono text-xs">
                    {dimensionScores.love.toFixed(1)}
                  </td>
                  <td
                    className="text-center font-mono text-xs"
                    style={{ color: "#D94F4F" }}
                  >
                    {dimensionScores.frustration.toFixed(1)}
                  </td>
                  <td className="text-center font-mono text-xs">
                    {dimensionScores.loyalty.toFixed(1)}
                  </td>
                  <td
                    className="text-center font-mono text-xs"
                    style={{
                      color: dimColor(dimensionScores.momentum),
                    }}
                  >
                    {dimensionScores.momentum.toFixed(1)}
                  </td>
                  <td className="text-center font-mono text-xs">
                    {dimensionScores.wom.toFixed(1)}
                  </td>
                </tr>

                {/* Competitor rows */}
                {competitors.map((comp) => (
                  <tr
                    key={`${comp.platform}-${comp.name}`}
                    className="border-b border-slate-100"
                  >
                    <td className="px-3.5 py-3.5 font-medium text-slate-500">
                      {comp.name}
                    </td>
                    <td
                      className="text-center font-mono text-sm font-bold"
                      style={{ color: vibeColor(comp.vibe_score) }}
                    >
                      {Math.round(comp.vibe_score)}
                    </td>
                    {[
                      comp.dimension_scores.love,
                      comp.dimension_scores.frustration,
                      comp.dimension_scores.loyalty,
                      comp.dimension_scores.momentum,
                      comp.dimension_scores.wom,
                    ].map((v, i) => (
                      <td
                        key={i}
                        className="text-center font-mono text-xs text-slate-400"
                      >
                        {v.toFixed(1)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>

          {/* Summary insight */}
          <GlassCard
            hover={false}
            className="mt-3 border-l-[3px] border-l-friction-blue px-5 py-3.5"
          >
            <p className="text-[13px] leading-relaxed text-slate-500">
              <strong className="text-slate-900">Summary:</strong>{" "}
              {generateCompareSummary(
                appName ?? "Your App",
                vibeScore ?? 0,
                dimensionScores,
                competitors
              )}
            </p>
          </GlassCard>
        </>
      ) : (
        <GlassCard
          hover={false}
          className="border-l-[3px] border-l-friction-blue px-5 py-10 text-center"
        >
          <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[2px] text-slate-400">
            No Competitors Selected
          </div>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-500">
            Add competitor apps when creating your analysis to see a head-to-head
            comparison across all five sentiment dimensions.
          </p>
        </GlassCard>
      )}
    </SectionWrapper>
  );
}

/**
 * Generate a natural-language comparison summary.
 */
function generateCompareSummary(
  appName: string,
  vibeScore: number,
  dims: { love: number; frustration: number; loyalty: number; momentum: number; wom: number },
  competitors: CompetitorData[]
): string {
  const parts: string[] = [];

  // Overall position
  const allScores = [
    { name: appName, score: vibeScore },
    ...competitors.map((c) => ({ name: c.name, score: c.vibe_score })),
  ].sort((a, b) => b.score - a.score);

  const rank = allScores.findIndex((a) => a.name === appName) + 1;
  const total = allScores.length;

  if (rank === 1) {
    parts.push(
      `${appName} leads the competitive set with a Vibe Score of ${Math.round(vibeScore)}`
    );
  } else {
    parts.push(
      `${appName} ranks #${rank} of ${total} with a Vibe Score of ${Math.round(vibeScore)}, trailing ${allScores[0].name} (${Math.round(allScores[0].score)})`
    );
  }

  // Find weakest dimension vs competitors
  const dimNames = ["love", "frustration", "loyalty", "momentum", "wom"] as const;
  const dimLabels = { love: "love", frustration: "frustration", loyalty: "loyalty", momentum: "momentum", wom: "word-of-mouth" };

  let biggestGap = 0;
  let biggestGapDim = "";
  let biggestGapComp = "";

  for (const comp of competitors) {
    for (const dim of dimNames) {
      if (dim === "frustration") {
        // Higher frustration is worse
        const gap = dims[dim] - comp.dimension_scores[dim];
        if (gap > biggestGap) {
          biggestGap = gap;
          biggestGapDim = dimLabels[dim];
          biggestGapComp = comp.name;
        }
      } else {
        const gap = comp.dimension_scores[dim] - dims[dim];
        if (gap > biggestGap) {
          biggestGap = gap;
          biggestGapDim = dimLabels[dim];
          biggestGapComp = comp.name;
        }
      }
    }
  }

  if (biggestGap > 0.5 && biggestGapComp) {
    parts.push(
      `Your biggest vulnerability is ${biggestGapDim} where ${biggestGapComp} leads by ${biggestGap.toFixed(1)} points`
    );
  }

  // Find strongest advantage
  let biggestAdvantage = 0;
  let advantageDim = "";

  for (const comp of competitors) {
    for (const dim of dimNames) {
      if (dim === "frustration") {
        const adv = comp.dimension_scores[dim] - dims[dim];
        if (adv > biggestAdvantage) {
          biggestAdvantage = adv;
          advantageDim = `lower ${dimLabels[dim]}`;
        }
      } else {
        const adv = dims[dim] - comp.dimension_scores[dim];
        if (adv > biggestAdvantage) {
          biggestAdvantage = adv;
          advantageDim = dimLabels[dim];
        }
      }
    }
  }

  if (biggestAdvantage > 0.5 && advantageDim) {
    parts.push(`Your strongest advantage is ${advantageDim}`);
  }

  return parts.join(". ") + ".";
}
