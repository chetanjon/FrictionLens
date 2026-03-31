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

  return (
    <svg viewBox="0 0 260 260" className="w-full max-w-[290px]">
      {/* Pentagon grid lines */}
      {gridLevels.map((level) => {
        const gridPts = Array.from({ length: 5 }, (_, i) => toXY(level, i));
        return (
          <polygon
            key={level}
            points={gridPts.map((p) => p.join(",")).join(" ")}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.7"
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
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.5"
          />
        );
      })}

      {/* Gradient fill definition */}
      <defs>
        <linearGradient id="radar-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6B9FD4" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#6B9FD4" stopOpacity="0.03" />
        </linearGradient>
      </defs>

      {/* Data polygon */}
      <polygon
        points={pts.map((p) => p.join(",")).join(" ")}
        fill="url(#radar-fill)"
        stroke="#6B9FD4"
        strokeWidth="1.5"
      />

      {/* Vertex dots */}
      {pts.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="4"
          fill="#6B9FD4"
          stroke="rgba(0,0,0,0.4)"
          strokeWidth="2"
        />
      ))}

      {/* Axis labels */}
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
              fontSize: 10,
              fill: "#94A3B8",
              fontWeight: 500,
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
              fill: "#6B9FD4",
              fontWeight: 600,
            }}
          >
            {v.toFixed(1)}
          </text>
        );
      })}
    </svg>
  );
}
