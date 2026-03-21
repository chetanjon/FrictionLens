import { SectionWrapper } from "@/components/report/section-wrapper";
import { FrictionBar } from "@/components/report/friction-bar";
import type { FrictionItem } from "@/lib/types/review";

type FrictionSectionProps = {
  frictionScores: FrictionItem[];
};

export function FrictionSection({ frictionScores }: FrictionSectionProps) {
  const sorted = [...frictionScores].sort((a, b) => b.score - a.score);

  return (
    <SectionWrapper id="friction" label="Section 03" title="Friction Score Heatmap">
      <div className="flex flex-col gap-2">
        {sorted.map((item) => (
          <FrictionBar
            key={item.feature}
            name={item.feature}
            score={item.score}
            mentions={item.mentions}
            trend={item.trend}
            delta={item.delta}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-5 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-sm bg-[#D94F4F]" />
          High friction (7&ndash;10)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-sm bg-[#D4A843]" />
          Medium (4&ndash;7)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-sm bg-[#4A90D9]" />
          Low (0&ndash;4)
        </span>
      </div>
    </SectionWrapper>
  );
}
