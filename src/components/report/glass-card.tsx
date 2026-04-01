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
        "bg-white/65 backdrop-blur-xl border border-slate-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.04)]",
        variant === "dark" && "text-gray-900",
        hover &&
          "transition-all duration-300 hover:bg-white/80 hover:border-slate-300/60 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
