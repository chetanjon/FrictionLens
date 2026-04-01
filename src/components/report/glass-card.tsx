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
          "bg-white border border-gray-200",
        variant === "dark" &&
          "bg-white border border-gray-200 text-gray-900",
        hover &&
          "transition-all duration-300 hover:bg-white hover:border-gray-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)]",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
