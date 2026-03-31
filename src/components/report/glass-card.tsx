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
  variant = "light",
  style,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "backdrop-blur-xl rounded-2xl",
        variant === "light" &&
          "bg-white/72 border border-slate-200/50 shadow-sm",
        variant === "dark" &&
          "bg-slate-900/80 border border-white/[0.08] text-white",
        hover &&
          "transition-all duration-200 hover:border-friction-blue/25 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(15,23,42,0.08)]",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
