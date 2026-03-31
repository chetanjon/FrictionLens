type SparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showDot?: boolean;
};

export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = "#4A90D9",
  showDot = true,
}: SparklineProps) {
  // Edge cases
  if (data.length === 0) {
    return (
      <svg width={width} height={height} aria-hidden="true">
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1.5}
        />
      </svg>
    );
  }

  if (data.length === 1) {
    const cy = height / 2;
    return (
      <svg width={width} height={height} aria-hidden="true">
        {showDot && (
          <circle cx={width / 2} cy={cy} r={3} fill={color} />
        )}
      </svg>
    );
  }

  const padding = showDot ? 3 : 1;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;

  const xStep = (width - padding * 2) / (data.length - 1);
  const yScale = (height - padding * 2) / range;

  const toX = (i: number): number => padding + i * xStep;
  const toY = (v: number): number =>
    height - padding - (v - min) * yScale;

  const points = data.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");

  // Area path: draw line forward, then down and back to close
  const lastX = toX(data.length - 1);
  const firstX = toX(0);
  const bottomY = height - padding;
  const areaPath = [
    `M ${firstX},${toY(data[0])}`,
    ...data.slice(1).map((v, i) => `L ${toX(i + 1)},${toY(v)}`),
    `L ${lastX},${bottomY}`,
    `L ${firstX},${bottomY}`,
    "Z",
  ].join(" ");

  const gradientId = `sparkline-area-${color.replace("#", "")}`;
  const lastDotX = toX(data.length - 1);
  const lastDotY = toY(data[data.length - 1]);

  return (
    <svg
      width={width}
      height={height}
      aria-hidden="true"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Filled area */}
      <path d={areaPath} fill={`url(#${gradientId})`} />

      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Dot on last point */}
      {showDot && (
        <>
          <circle cx={lastDotX} cy={lastDotY} r={3} fill={color} />
          <circle
            cx={lastDotX}
            cy={lastDotY}
            r={1.5}
            fill="#111111"
          />
        </>
      )}
    </svg>
  );
}
