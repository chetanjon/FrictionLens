import { SectionWrapper } from "@/components/report/section-wrapper";
import { VibeScoreCircle } from "@/components/report/vibe-score-circle";

type SummarySectionProps = {
  appName: string;
  platform?: string;
  category?: string;
  vibeScore: number;
  summary: string;
  reviewCount: number;
  topFriction?: string;
  topFrictionScore?: number;
  churnRiskPercent?: number;
  dimensionScores?: {
    love: number;
    frustration: number;
    loyalty: number;
    momentum: number;
    wom: number;
  };
  releaseGrade?: string;
  releaseVersion?: string;
  frictionScores?: Array<{ name: string; score: number }>;
};

function momentumLabel(score: number): string {
  if (score >= 7) return "Trending up";
  if (score >= 5) return "Stable";
  return "Trending down";
}

function scoreColor(score: number): string {
  if (score > 7) return "#C47070";
  if (score > 4) return "#C9B06A";
  return "#6B9FD4";
}

export function SummarySection({
  appName,
  platform,
  vibeScore,
  summary,
  reviewCount,
  topFriction,
  topFrictionScore,
  churnRiskPercent,
  dimensionScores,
  releaseGrade,
  releaseVersion,
  frictionScores,
}: SummarySectionProps) {
  const initial = appName.charAt(0).toUpperCase();
  const momentum = dimensionScores?.momentum;

  return (
    <SectionWrapper id="summary">
      {/* Hero row: app info + vibe score */}
      <div className="flex flex-wrap items-start gap-10">
        <div className="min-w-[300px] flex-1">
          <div className="mb-5 flex items-center gap-3.5">
            <div
              className="grid h-14 w-14 place-items-center rounded-2xl text-[28px] shadow-lg"
              style={{
                background: "linear-gradient(135deg, #6B9FD4, #4A7BB5)",
                boxShadow: "0 6px 20px rgba(107,159,212,0.15)",
              }}
            >
              <span className="leading-none text-white">{initial}</span>
            </div>
            <div>
              <h1 className="m-0 text-[28px] font-extrabold tracking-[-1px] text-white">
                {appName}
              </h1>
              <div className="mt-0.5 font-mono text-xs text-slate-400">
                Vibe Report · {reviewCount.toLocaleString()} reviews
                {platform ? ` · ${platform}` : ""}
              </div>
            </div>
          </div>

          <p className="mb-5 max-w-[480px] text-[15.5px] leading-7 text-slate-300">
            {summary}
          </p>
        </div>

        <div className="flex-shrink-0">
          <VibeScoreCircle score={vibeScore} size="md" />
        </div>
      </div>

      {/* Stat cards row — matches reference design */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Churn Risk */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-[18px] backdrop-blur-md">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[1.5px] text-slate-400">
            Churn Risk
          </div>
          <div
            className="mt-1 font-mono text-2xl font-extrabold tracking-tight"
            style={{ color: (churnRiskPercent ?? 0) > 15 ? "#C47070" : (churnRiskPercent ?? 0) > 8 ? "#C9B06A" : "#6B9FD4" }}
          >
            {churnRiskPercent != null ? `${churnRiskPercent}%` : "N/A"}
          </div>
        </div>

        {/* Top Friction */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-[18px] backdrop-blur-md">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[1.5px] text-slate-400">
            Top Friction
          </div>
          <div className="mt-1 font-mono text-2xl font-extrabold tracking-tight text-[#C47070]">
            {topFrictionScore != null ? topFrictionScore.toFixed(1) : "N/A"}
          </div>
          {topFriction && (
            <div className="mt-0.5 text-[11px] text-slate-400">{topFriction}</div>
          )}
        </div>

        {/* Release Grade */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-[18px] backdrop-blur-md">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[1.5px] text-slate-400">
            Release Grade
          </div>
          <div
            className="mt-1 font-serif text-2xl font-extrabold tracking-tight"
            style={{ color: releaseGrade ? "#C9B06A" : "#94A3B8" }}
          >
            {releaseGrade ?? "—"}
          </div>
          {releaseVersion && (
            <div className="mt-0.5 text-[11px] text-slate-400">{releaseVersion}</div>
          )}
        </div>

        {/* Momentum */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-[18px] backdrop-blur-md">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[1.5px] text-slate-400">
            Momentum
          </div>
          <div
            className="mt-1 font-mono text-2xl font-extrabold tracking-tight"
            style={{ color: momentum != null ? scoreColor(momentum) : "#94A3B8" }}
          >
            {momentum != null ? momentum.toFixed(1) : "N/A"}
          </div>
          {momentum != null && (
            <div className="mt-0.5 text-[11px] text-slate-400">
              {momentumLabel(momentum)}
            </div>
          )}
        </div>
      </div>

      {/* Side-by-side: Sentiment Radar + Friction Heatmap */}
      {dimensionScores && (
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* Sentiment Radar Card */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-md">
            <h3 className="mb-3 text-base font-bold text-white">
              Sentiment Radar
            </h3>
            <RadarMini dims={dimensionScores} />
          </div>

          {/* Friction Heatmap Card */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-md">
            <h3 className="mb-3 text-base font-bold text-white">
              Friction Heatmap
            </h3>
            {frictionScores && frictionScores.length > 0 ? (
              <FrictionMiniChart items={frictionScores} />
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">
                No friction data yet
              </p>
            )}
          </div>
        </div>
      )}

      {/* Top Churn Driver Banner */}
      {churnRiskPercent != null && churnRiskPercent > 0 && topFriction && (
        <div className="mt-4 flex items-center gap-4 rounded-2xl border border-[#C47070]/20 bg-[#C47070]/[0.06] px-5 py-4 backdrop-blur-md">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#C47070]/10">
            <svg className="h-5 w-5 text-[#C47070]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[1.5px] text-[#C47070]">
              Top Churn Driver
            </div>
            <div className="mt-0.5 text-[13px] font-semibold text-white">
              {topFriction} — highest friction point driving user churn
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-[#C47070] px-3 py-1 font-mono text-xs font-bold text-white">
            P0
          </span>
        </div>
      )}
    </SectionWrapper>
  );
}

/**
 * Compact radar chart for the summary section.
 */
function RadarMini({ dims }: { dims: { love: number; frustration: number; loyalty: number; momentum: number; wom: number } }) {
  const labels = ["Love", "Calm", "Loyalty", "Momentum", "WoM"];
  const vals = [dims.love, 10 - dims.frustration, dims.loyalty, dims.momentum, dims.wom];
  const cx = 130, cy = 124, r = 80;

  const toXY = (v: number, i: number): [number, number] => {
    const a = -Math.PI / 2 + i * ((2 * Math.PI) / 5);
    return [cx + (v / 10) * r * Math.cos(a), cy + (v / 10) * r * Math.sin(a)];
  };

  const pts = vals.map((v, i) => toXY(v, i));

  return (
    <svg viewBox="0 0 260 248" className="mx-auto w-full max-w-[260px]">
      {[2.5, 5, 7.5, 10].map((level) => {
        const gp = Array.from({ length: 5 }, (_, i) => toXY(level, i));
        return <polygon key={level} points={gp.map((p) => p.join(",")).join(" ")} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.7" />;
      })}
      {Array.from({ length: 5 }, (_, i) => {
        const [ex, ey] = toXY(10, i);
        return <line key={i} x1={cx} y1={cy} x2={ex} y2={ey} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />;
      })}
      <defs>
        <linearGradient id="radar-mini-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6B9FD4" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#6B9FD4" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <polygon points={pts.map((p) => p.join(",")).join(" ")} fill="url(#radar-mini-fill)" stroke="#6B9FD4" strokeWidth="1.5" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="#6B9FD4" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" />
      ))}
      {labels.map((label, i) => {
        const [lx, ly] = toXY(12.2, i);
        return (
          <text key={label} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 9.5, fill: "#94A3B8", fontWeight: 500 }}>
            {label}
          </text>
        );
      })}
    </svg>
  );
}

/**
 * Compact horizontal friction bars for the summary section heatmap.
 */
function FrictionMiniChart({ items }: { items: Array<{ name: string; score: number }> }) {
  function barColor(s: number): string {
    if (s > 7) return "#C47070";
    if (s > 4) return "#C9B06A";
    return "#6B9FD4";
  }

  return (
    <div className="space-y-2.5 py-1">
      {items.map((item) => (
        <div key={item.name} className="flex items-center gap-3">
          <span className="w-[120px] shrink-0 truncate text-[13px] font-medium text-slate-300">
            {item.name}
          </span>
          <div className="h-[10px] flex-1 rounded bg-white/[0.06]">
            <div
              className="h-full rounded transition-[width] duration-500 ease-out"
              style={{
                width: `${item.score * 10}%`,
                background: barColor(item.score),
              }}
            />
          </div>
          <span className="w-[36px] text-right font-mono text-sm font-bold" style={{ color: barColor(item.score) }}>
            {item.score.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}
