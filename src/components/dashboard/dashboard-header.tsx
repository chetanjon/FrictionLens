"use client";

import { useMemo } from "react";

type DashboardHeaderProps = {
  displayName: string;
  // Kept in the prop signature for backwards-compat; the canonical
  // "New Analysis" entry point is now the sidebar button.
  onNewAnalysis?: () => void;
};

function getGreeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatTodayDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function DashboardHeader({ displayName }: DashboardHeaderProps) {
  const firstName = displayName.split(" ")[0] ?? displayName;

  const { greeting, formattedDate } = useMemo(() => {
    const now = new Date();
    return {
      greeting: getGreeting(now.getHours()),
      formattedDate: formatTodayDate(now),
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-gray-200/60 shadow-sm p-6 sm:p-8">
      <div className="relative">
        <h1 className="font-serif text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
          {greeting}, {firstName}
        </h1>
        <p className="mt-0.5 font-mono text-[11px] text-gray-500 tracking-wide">
          {formattedDate}
        </p>
      </div>
    </div>
  );
}
