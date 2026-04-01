import { SectionWrapper } from "@/components/report/section-wrapper";
import { RadarChart } from "@/components/report/radar-chart";

type DimensionScores = {
  love: number;
  frustration: number;
  loyalty: number;
  momentum: number;
  wom: number;
};

type DimensionsSectionProps = {
  dimensionScores: DimensionScores;
};

type DimensionRow = {
  key: string;
  label: string;
  value: number;
  inverted: boolean;
  description: string;
};

function getDimensionDescription(key: string, value: number): string {
  switch (key) {
    case "love":
      return value > 6
        ? "Strong emotional attachment from users. Core product features drive genuine delight."
        : value > 4
          ? "Moderate positive sentiment. Users see value but lack deep emotional connection."
          : "Low emotional engagement. Users are functionally satisfied at best.";
    case "frustration":
      return value > 6
        ? "Significant frustration signals detected. Multiple pain points are compounding user dissatisfaction."
        : value > 4
          ? "Moderate friction present. A few key issues are driving recurring complaints."
          : "Low frustration levels. Users report a generally smooth experience.";
    case "loyalty":
      return value > 6
        ? "High user investment and switching costs. Users are deeply embedded in the platform."
        : value > 4
          ? "Moderate loyalty. Users stay but may consider alternatives if friction grows."
          : "Weak retention signals. Users show low commitment and may churn easily.";
    case "momentum":
      return value > 6
        ? "Positive trajectory. Users perceive the product as improving over time."
        : value > 4
          ? "Stable but stagnant. Users see neither clear improvement nor decline."
          : "Declining momentum. Users perceive quality deterioration in recent updates.";
    case "wom":
      return value > 6
        ? "Strong advocacy signals. Users actively recommend the product to others."
        : value > 4
          ? "Mixed word-of-mouth. Promoters and detractors are roughly balanced."
          : "Negative word-of-mouth risk. Detractors outweigh promoters in review sentiment.";
    default:
      return "";
  }
}

export function DimensionsSection({ dimensionScores }: DimensionsSectionProps) {
  const dimensions: DimensionRow[] = [
    {
      key: "love",
      label: "Love",
      value: dimensionScores.love,
      inverted: false,
      description: getDimensionDescription("love", dimensionScores.love),
    },
    {
      key: "frustration",
      label: "Frustration",
      value: dimensionScores.frustration,
      inverted: true,
      description: getDimensionDescription("frustration", dimensionScores.frustration),
    },
    {
      key: "loyalty",
      label: "Loyalty",
      value: dimensionScores.loyalty,
      inverted: false,
      description: getDimensionDescription("loyalty", dimensionScores.loyalty),
    },
    {
      key: "momentum",
      label: "Momentum",
      value: dimensionScores.momentum,
      inverted: false,
      description: getDimensionDescription("momentum", dimensionScores.momentum),
    },
    {
      key: "wom",
      label: "Word-of-Mouth",
      value: dimensionScores.wom,
      inverted: false,
      description: getDimensionDescription("wom", dimensionScores.wom),
    },
  ];

  return (
    <SectionWrapper
      id="dimensions"
      label="Section 02"
      title="Sentiment Dimensions"
      alt
    >
      <div className="flex flex-wrap gap-9">
        {/* Radar chart */}
        <div className="w-[290px] flex-shrink-0">
          <RadarChart dims={dimensionScores} />
        </div>

        {/* Dimension breakdown */}
        <div className="min-w-[280px] flex-1">
          {dimensions.map((d) => {
            const color = d.inverted
              ? d.value > 5
                ? "#C47070"
                : "#6B9FD4"
              : d.value > 5
                ? "#6B9FD4"
                : "#C9B06A";

            return (
              <div
                key={d.key}
                className="mb-[18px] border-b border-gray-200 pb-[18px] last:mb-0 last:border-b-0 last:pb-0"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">
                    {d.label}
                  </span>
                  <span
                    className="font-mono text-lg font-bold"
                    style={{ color }}
                  >
                    {d.value.toFixed(1)}
                  </span>
                </div>
                <div className="mb-2 h-[3px] rounded-sm bg-gray-100">
                  <div
                    className="h-full rounded-sm transition-[width] duration-600 ease-out"
                    style={{
                      width: `${d.value * 10}%`,
                      background: color,
                    }}
                  />
                </div>
                <p className="m-0 text-[12.5px] leading-normal text-gray-500">
                  {d.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
