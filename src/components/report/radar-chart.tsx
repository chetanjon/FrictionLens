type RadarDims = {
  love: number;
  frustration: number;
  loyalty: number;
  momentum: number;
  wom: number;
};

type RadarChartProps = {
  dims: RadarDims;
};

export function RadarChart({ dims }: RadarChartProps) {
  const labels = ["Love", "Calm", "Loyalty", "Momentum", "WoM"];
  const vals = [
    dims.love,
    10 - dims.frustration,
    dims.loyalty,
    dims.momentum,
    dims.wom,
  ];
  const raw = [
    dims.love,
    dims.frustration,
    dims.loyalty,
    dims.momentum,
    dims.wom,
  ];

  const cx = 130;
  const cy = 124;
  const r = 88;

  const toXY = (v: number, i: number): [number, number] => {
    const a = -Math.PI / 2 + i * ((2 * Math.PI) / 5);
    return [cx + (v / 10) * r * Math.cos(a), cy + (v / 10) * r * Math.sin(a)];
  };

  const pts = vals.map((v, i) => toXY(v, i));
  const gridLevels = [2.5, 5, 7.5, 10];

  // Plain-text alternative for screen readers — every datapoint, in the same
  // order as the visual axes, with their numeric scores.
  const ariaSummary = labels
    .map((l, i) => `${l} ${vals[i].toFixed(1)} of 10`)
    .join(", ");

  return (
    <svg
      viewBox="0 0 260 260"
      className="w-full max-w-[290px]"
      role="img"
      aria-label={`Sentiment radar chart: ${ariaSummary}`}
    >
      <title>Sentiment dimensions radar</title>
      <desc>{ariaSummary}</desc>
      {/* Pentagon grid lines — slate so they're visible on the light card */}
      {gridLevels.map((level) => {
        const gridPts = Array.from({ length: 5 }, (_, i) => toXY(level, i));
        return (
          <polygon
            key={level}
            points={gridPts.map((p) => p.join(",")).join(" ")}
            fill="none"
            stroke="rgba(15,23,42,0.12)"
            strokeWidth="0.8"
          />
        );
      })}

      {/* Axis lines from center to vertices */}
      {Array.from({ length: 5 }, (_, i) => {
        const [ex, ey] = toXY(10, i);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={ex}
            y2={ey}
            stroke="rgba(15,23,42,0.10)"
            strokeWidth="0.6"
          />
        );
      })}

      {/* Gradient fill definition — denser fill so the polygon reads at a glance */}
      <defs>
        <linearGradient id="radar-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A90D9" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#4A90D9" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      {/* Data polygon */}
      <polygon
        points={pts.map((p) => p.join(",")).join(" ")}
        fill="url(#radar-fill)"
        stroke="#4A90D9"
        strokeWidth="2"
      />

      {/* Vertex dots */}
      {pts.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="4.5"
          fill="#4A90D9"
          stroke="white"
          strokeWidth="2"
        />
      ))}

      {/* Axis labels — slate-600/700 for proper contrast on white */}
      {labels.map((label, i) => {
        const [lx, ly] = toXY(12.5, i);
        return (
          <text
            key={label}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-sans"
            style={{
              fontSize: 11,
              fill: "#334155",
              fontWeight: 600,
            }}
          >
            {label}
          </text>
        );
      })}

      {/* Score values near vertices */}
      {raw.map((v, i) => {
        const [px, py] = toXY(vals[i] > 5 ? vals[i] - 1.6 : vals[i] + 2, i);
        return (
          <text
            key={`v${i}`}
            x={px}
            y={py}
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-mono"
            style={{
              fontSize: 11,
              fill: "#1e3a5f",
              fontWeight: 700,
            }}
          >
            {v.toFixed(1)}
          </text>
        );
      })}
    </svg>
  );
}
