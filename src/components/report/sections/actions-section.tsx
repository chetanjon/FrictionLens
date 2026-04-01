import { SectionWrapper } from "@/components/report/section-wrapper";
import { GlassCard } from "@/components/report/glass-card";
import { PriorityBadge } from "@/components/report/priority-badge";
import type { ActionItem } from "@/lib/types/review";

type ActionsSectionProps = {
  actionItems: ActionItem[];
};

function impactColor(impact: string): string {
  switch (impact) {
    case "Critical":
      return "#C47070";
    case "High":
      return "#C9B06A";
    case "Medium":
      return "#94A3B8";
    case "Low":
      return "#94A3B8";
    default:
      return "#94A3B8";
  }
}

export function ActionsSection({ actionItems }: ActionsSectionProps) {
  return (
    <SectionWrapper
      id="actions"
      label="Section 07"
      title="AI-Generated Action Items"
    >
      <div className="flex flex-col gap-2.5">
        {actionItems.map((action) => (
          <GlassCard key={action.title} className="px-5 py-[18px]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-1.5 flex items-center gap-2">
                  <PriorityBadge priority={action.priority} />
                  <span className="text-sm font-bold text-gray-900">
                    {action.title}
                  </span>
                </div>
                <p className="m-0 text-[12.5px] leading-relaxed text-gray-500">
                  {action.description}
                </p>
              </div>

              <div className="flex flex-shrink-0 gap-1.5">
                <div className="rounded-lg border border-slate-200/60 bg-white/65 backdrop-blur-xl px-2.5 py-1.5 text-center">
                  <div className="font-mono text-[9px] uppercase tracking-[0.5px] text-gray-500">
                    Impact
                  </div>
                  <div
                    className="text-[11px] font-semibold"
                    style={{ color: impactColor(action.impact) }}
                  >
                    {action.impact}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200/60 bg-white/65 backdrop-blur-xl px-2.5 py-1.5 text-center">
                  <div className="font-mono text-[9px] uppercase tracking-[0.5px] text-gray-500">
                    Effort
                  </div>
                  <div className="text-[11px] font-semibold text-gray-500">
                    {action.effort}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </SectionWrapper>
  );
}
