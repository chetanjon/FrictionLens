"use client";

import { cn } from "@/lib/utils";
import type { ReactNode, CSSProperties } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: CSSProperties;
};

export function GlassCard({
  children,
  className,
  hover = false,
  style,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "bg-white/65 backdrop-blur-xl border border-slate-200/60 rounded-2xl",
        hover &&
          "transition-all duration-300 hover:border-friction-blue/25 hover:-translate-y-px hover:shadow-[0_8px_30px_rgba(15,23,42,0.05)]",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
