"use client";

import { useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type DashboardHeaderProps = {
  displayName: string;
  onNewAnalysis: () => void;
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

export function DashboardHeader({
  displayName,
  onNewAnalysis,
}: DashboardHeaderProps) {
  const firstName = displayName.split(" ")[0] ?? displayName;

  const { greeting, formattedDate } = useMemo(() => {
    const now = new Date();
    return {
      greeting: getGreeting(now.getHours()),
      formattedDate: formatTodayDate(now),
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6 sm:p-8">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-friction-blue/[0.06] blur-3xl" />

      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-serif text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {greeting}, {firstName}
          </h1>
          <p className="mt-0.5 font-mono text-[11px] text-gray-500 tracking-wide">
            {formattedDate}
          </p>
        </div>

        <Button
          onClick={onNewAnalysis}
          size="lg"
          className="shrink-0 bg-friction-blue text-white shadow-lg shadow-friction-blue/10 hover:bg-friction-blue/90"
          aria-label="Start a new analysis"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Analysis
        </Button>
      </div>
    </div>
  );
}
