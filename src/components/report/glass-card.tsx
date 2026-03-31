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
          "bg-white/[0.03] backdrop-blur-md border border-white/[0.06]",
        variant === "dark" &&
          "bg-white/[0.03] backdrop-blur-md border border-white/[0.06] text-white",
        hover &&
          "transition-all duration-300 hover:bg-white/[0.05] hover:border-white/[0.10] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)]",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
