type MiniRadarDimensions = {
  love: number;
  frustration: number;
  loyalty: number;
  momentum: number;
  wom: number;
};

type MiniRadarProps = {
  dimensions: MiniRadarDimensions;
  size?: number;
};

/**
 * Compact pentagon radar chart for use inside KPI cards.
 * No labels — purely visual at small sizes.
 * Pure SVG, no external dependencies.
 */
export function MiniRadar({ dimensions, size = 64 }: MiniRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  // Leave 15% margin so vertex dots don't clip
  const r = (size / 2) * 0.78;

  // Map frustration to "calm" so higher = better for the radar shape
  const vals: number[] = [
    dimensions.love,
    10 - dimensions.frustration,
    dimensions.loyalty,
    dimensions.momentum,
    dimensions.wom,
  ];

  function toXY(value: number, index: number): [number, number] {
    // Start at top (-π/2) and go clockwise
    const angle = -Math.PI / 2 + index * ((2 * Math.PI) / 5);
    return [
      cx + (value / 10) * r * Math.cos(angle),
      cy + (value / 10) * r * Math.sin(angle),
    ];
  }

  function toOuterXY(index: number): [number, number] {
    const angle = -Math.PI / 2 + index * ((2 * Math.PI) / 5);
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  }

  const dataPts = vals.map((v, i) => toXY(v, i));
  const outerPts = Array.from({ length: 5 }, (_, i) => toOuterXY(i));

  const gridLevels: number[] = [2.5, 5, 7.5, 10];

  const gradientId = "mini-radar-fill";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A90D9" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#4A90D9" stopOpacity="0.06" />
        </linearGradient>
      </defs>

      {/* Pentagon grid rings */}
      {gridLevels.map((level) => {
        const ringPts = Array.from({ length: 5 }, (_, i) => toXY(level, i));
        return (
          <polygon
            key={level}
            points={ringPts.map((p) => p.join(",")).join(" ")}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={0.6}
          />
        );
      })}

      {/* Axis lines from center to each vertex */}
      {outerPts.map(([ex, ey], i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={ex}
          y2={ey}
          stroke="#E2E8F0"
          strokeWidth={0.5}
        />
      ))}

      {/* Data polygon — friction-blue fill at 20% opacity + stroke */}
      <polygon
        points={dataPts.map((p) => p.join(",")).join(" ")}
        fill={`url(#${gradientId})`}
        stroke="#4A90D9"
        strokeWidth={1.25}
        strokeLinejoin="round"
      />

      {/* Vertex dots */}
      {dataPts.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={1.75}
          fill="#4A90D9"
          stroke="white"
          strokeWidth={1}
        />
      ))}
    </svg>
  );
}
