"use client";

import { cn } from "@/lib/utils";
import type { ReactNode, CSSProperties } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  variant?: "light" | "dark";
  style?: CSSProperties;
};

export function GlassCard({
  children,
  className,
  hover = false,
  variant = "dark",
  style,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl",
        variant === "light" &&
          "bg-white/72 backdrop-blur-xl border border-slate-200/50 shadow-sm",
        variant === "dark" &&
          "bg-[#111111] border border-white/[0.08] text-white",
        hover &&
          "transition-all duration-200 hover:border-friction-blue/25 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(74,144,217,0.08)]",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
