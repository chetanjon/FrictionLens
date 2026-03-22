"use client";

import { DimensionBars } from "@/components/charts/dimension-bars";

type DimensionScores = {
  love: number;
  frustration: number;
  loyalty: number;
  momentum: number;
  wom: number;
};

type DimensionHealthProps = {
  dimensions: DimensionScores;
  compact?: boolean;
};

const LABELS = ["Love", "Calm", "Loyalty", "Momentum", "WoM"] as const;

const LABEL_COLORS = [
  "#E8457C",
  "#4A90D9",
  "#4A90D9",
  "#D4A843",
  "#6B5CE7",
] as const;

export function DimensionHealth({ dimensions, compact }: DimensionHealthProps) {
  // Map frustration to calm (inverted)
  const vals: number[] = [
    dimensions.love,
    10 - dimensions.frustration,
    dimensions.loyalty,
    dimensions.momentum,
    dimensions.wom,
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Spider Web Radar */}
      <div className="flex justify-center">
        <SpiderWebRadar values={vals} size={200} />
      </div>

      {/* Dimension Bars */}
      <DimensionBars dimensions={dimensions} compact={compact} />
    </div>
  );
}

function SpiderWebRadar({
  values,
  size = 200,
}: {
  values: number[];
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const labelOffset = 28;
  const r = (size / 2) - labelOffset;

  function toXY(value: number, index: number): [number, number] {
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

  function toLabelXY(index: number): [number, number] {
    const angle = -Math.PI / 2 + index * ((2 * Math.PI) / 5);
    const labelR = r + 16;
    return [
      cx + labelR * Math.cos(angle),
      cy + labelR * Math.sin(angle),
    ];
  }

  const dataPts = values.map((v, i) => toXY(v, i));
  const outerPts = Array.from({ length: 5 }, (_, i) => toOuterXY(i));
  const gridLevels = [2, 4, 6, 8, 10];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Sentiment radar showing Love, Calm, Loyalty, Momentum, and Word-of-Mouth scores"
    >
      <defs>
        <linearGradient id="spider-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A90D9" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#4A90D9" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Web grid rings */}
      {gridLevels.map((level) => {
        const ringPts = Array.from({ length: 5 }, (_, i) => toXY(level, i));
        return (
          <polygon
            key={level}
            points={ringPts.map((p) => p.join(",")).join(" ")}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={level === 10 ? 1 : 0.5}
            strokeDasharray={level === 10 ? "none" : "2 2"}
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

      {/* Data polygon */}
      <polygon
        points={dataPts.map((p) => p.join(",")).join(" ")}
        fill="url(#spider-fill)"
        stroke="#4A90D9"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* Vertex dots */}
      {dataPts.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={3}
          fill="#4A90D9"
          stroke="white"
          strokeWidth={1.5}
        />
      ))}

      {/* Labels */}
      {LABELS.map((label, i) => {
        const [lx, ly] = toLabelXY(i);
        return (
          <text
            key={label}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="central"
            fill={LABEL_COLORS[i]}
            fontSize={9}
            fontWeight={600}
            fontFamily="'IBM Plex Mono', monospace"
          >
            {label}
          </text>
        );
      })}

      {/* Score values near each vertex */}
      {values.map((val, i) => {
        const [dx, dy] = dataPts[i];
        // Offset slightly from the data point
        const angle = -Math.PI / 2 + i * ((2 * Math.PI) / 5);
        const offsetX = 10 * Math.cos(angle);
        const offsetY = 10 * Math.sin(angle);
        return (
          <text
            key={`val-${i}`}
            x={dx + offsetX}
            y={dy + offsetY}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#64748B"
            fontSize={8}
            fontWeight={700}
            fontFamily="'IBM Plex Mono', monospace"
          >
            {val.toFixed(1)}
          </text>
        );
      })}
    </svg>
  );
}
