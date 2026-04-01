import { cn } from "@/lib/utils";
import { vibeColor } from "@/lib/constants";

type VibeScoreCircleProps = {
  score: number;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: {
    container: "h-20 w-20",
    score: "text-[28px]",
    label: "text-[7px] tracking-[1.5px]",
  },
  md: {
    container: "h-[124px] w-[124px]",
    score: "text-[40px]",
    label: "text-[9px] tracking-[2px]",
  },
  lg: {
    container: "h-40 w-40",
    score: "text-[52px]",
    label: "text-[10px] tracking-[2.5px]",
  },
};

export function VibeScoreCircle({
  score,
  size = "md",
}: VibeScoreCircleProps) {
  const color = vibeColor(score);
  const s = sizeMap[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-full border-2 border-gray-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.3)]",
        s.container
      )}
    >
      <span
        className={cn(
          "font-serif font-extrabold leading-none tracking-[-2px]",
          s.score
        )}
        style={{ color }}
      >
        {score}
      </span>
      <span
        className={cn(
          "mt-0.5 font-mono uppercase text-gray-500",
          s.label
        )}
      >
        Vibe Score
      </span>
    </div>
  );
}
