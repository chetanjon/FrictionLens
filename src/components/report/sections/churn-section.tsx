import { SectionWrapper } from "@/components/report/section-wrapper";
import { GlassCard } from "@/components/report/glass-card";
import { SeverityBadge } from "@/components/report/severity-badge";
import type { ChurnDriver } from "@/lib/types/review";

type ChurnSectionProps = {
  churnDrivers: ChurnDriver[];
  churnRiskPercent: number;
};

export function ChurnSection({
  churnDrivers,
  churnRiskPercent,
}: ChurnSectionProps) {
  return (
    <SectionWrapper
      id="churn"
      label="Section 04"
      title="Churn Driver Analysis"
      alt
    >
      {/* Overall churn risk banner */}
      <GlassCard
        hover={false}
        className="mb-[18px] border-l-[3px] border-l-[#C47070] bg-white/[0.03] px-5 py-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-[3px] font-mono text-[10px] font-semibold uppercase tracking-[1.5px] text-[#C47070]">
              Overall Churn Risk
            </div>
            <div className="text-[13px] text-slate-400">
              {churnRiskPercent}% of analyzed reviewers show high or critical
              churn signals
            </div>
          </div>
          <div className="font-serif text-4xl font-extrabold text-[#C47070]">
            {churnRiskPercent}%
          </div>
        </div>
      </GlassCard>

      {/* Churn driver cards */}
      <div className="flex flex-col gap-2.5">
        {churnDrivers.map((driver) => (
          <GlassCard key={driver.theme} className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-[15px] font-bold text-white">
                  {driver.theme}
                </span>
                <SeverityBadge severity={driver.severity} />
              </div>
              <span className="font-mono text-xs text-slate-300">
                {driver.count} reviews
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              {driver.quotes.map((quote, j) => (
                <div
                  key={j}
                  className="rounded-[10px] border-l-2 border-white/[0.08] bg-white/[0.04] px-3.5 py-[9px] font-serif text-[12.5px] italic leading-normal text-slate-400"
                >
                  &ldquo;{quote}&rdquo;
                </div>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
    </SectionWrapper>
  );
}
