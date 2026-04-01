import { SectionWrapper } from "@/components/report/section-wrapper";
import { GlassCard } from "@/components/report/glass-card";
import type { ReleaseImpact } from "@/lib/types/review";

type ReleaseSectionProps = {
  releaseImpact?: ReleaseImpact | null;
};

function gradeColor(grade: string): string {
  if (grade.startsWith("A")) return "#6B9FD4";
  if (grade.startsWith("B")) return "#6B9FD4";
  if (grade.startsWith("C")) return "#C9B06A";
  return "#C47070";
}

export function ReleaseSection({ releaseImpact }: ReleaseSectionProps) {
  if (!releaseImpact) {
    return (
      <SectionWrapper
        id="release"
        label="Section 05"
        title="Release Impact Analysis"
      >
        <GlassCard hover={false} className="px-6 py-10 text-center">
          <p className="text-sm text-gray-500">
            No release data available yet. Release impact analysis will appear
            here once version-tagged reviews are detected.
          </p>
        </GlassCard>
      </SectionWrapper>
    );
  }

  const bgColor = gradeColor(releaseImpact.grade);
  const sentimentColor =
    releaseImpact.sentiment_delta < 0 ? "#C47070" : "#6B9FD4";
  const sentimentPrefix = releaseImpact.sentiment_delta > 0 ? "+" : "";

  return (
    <SectionWrapper
      id="release"
      label="Section 05"
      title="Release Impact Analysis"
    >
      <GlassCard hover={false} className="p-6">
        {/* Header: version info + grade */}
        <div className="mb-7 flex items-start justify-between">
          <div>
            <div className="text-xs text-gray-500">Latest Release</div>
            <div className="font-mono text-[22px] font-extrabold text-gray-900">
              v{releaseImpact.version}
            </div>
            <div className="mt-0.5 text-[11px] text-gray-500">
              Released {releaseImpact.date}
            </div>
          </div>
          <div
            className="grid h-[68px] w-[68px] place-items-center rounded-2xl font-serif text-[26px] font-extrabold text-gray-900"
            style={{
              background: bgColor,
              boxShadow: `0 6px 20px ${bgColor}33`,
            }}
          >
            {releaseImpact.grade}
          </div>
        </div>

        {/* 3 stat cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[14px] border border-slate-200/60 bg-white/65 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-[18px] text-center">
            <div
              className="font-mono text-[26px] font-extrabold"
              style={{ color: sentimentColor }}
            >
              {sentimentPrefix}
              {releaseImpact.sentiment_delta}%
            </div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-[1px] text-gray-500">
              Sentiment Change
            </div>
          </div>
          <div className="rounded-[14px] border border-slate-200/60 bg-white/65 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-[18px] text-center">
            <div className="font-mono text-[26px] font-extrabold text-[#C9B06A]">
              {releaseImpact.new_themes.length}
            </div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-[1px] text-gray-500">
              New Themes
            </div>
          </div>
          <div className="rounded-[14px] border border-slate-200/60 bg-white/65 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-[18px] text-center">
            <div className="font-mono text-[26px] font-extrabold text-[#6B9FD4]">
              {releaseImpact.review_velocity}
            </div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-[1px] text-gray-500">
              Review Velocity
            </div>
          </div>
        </div>

        {/* Theme tags */}
        {releaseImpact.new_themes.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {releaseImpact.new_themes.map((theme) => (
              <span
                key={theme}
                className="rounded-[10px] border border-[#C47070]/20 bg-[#C47070]/10 px-3 py-1 font-mono text-[11px] text-[#C47070]"
              >
                New: {theme}
              </span>
            ))}
          </div>
        )}
      </GlassCard>
    </SectionWrapper>
  );
}
