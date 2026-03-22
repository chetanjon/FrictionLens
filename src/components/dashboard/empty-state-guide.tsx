"use client";

import { Key, FileUp, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateGuideProps = {
  hasApiKey: boolean;
  onNewAnalysis: () => void;
};

const STEPS = [
  {
    icon: Key,
    title: "Add API Key",
    description: "Get a free Gemini API key from Google AI Studio and add it in Settings.",
    href: "/dashboard/settings",
    color: "text-friction-blue",
    bgColor: "bg-friction-blue/10",
  },
  {
    icon: FileUp,
    title: "Import Reviews",
    description: "Search the App Store, upload a CSV, or paste reviews directly.",
    color: "text-friction-amber",
    bgColor: "bg-friction-amber/10",
  },
  {
    icon: BarChart3,
    title: "Get Your Report",
    description: "AI analyzes sentiment across 5 dimensions and surfaces friction & churn signals.",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
] as const;

export function EmptyStateGuide({ hasApiKey, onNewAnalysis }: EmptyStateGuideProps) {
  const currentStep = hasApiKey ? 1 : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome to FrictionLens
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          Your AI-powered review intelligence platform. Get started in three simple steps.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STEPS.map((step, i) => {
          const isCurrentStep = i === currentStep;
          const isCompleted = i < currentStep;
          const StepIcon = step.icon;

          return (
            <div
              key={step.title}
              className={cn(
                "relative rounded-2xl border p-6 transition-all",
                isCurrentStep
                  ? "border-friction-blue/30 bg-white shadow-lg shadow-friction-blue/5"
                  : isCompleted
                    ? "border-green-200/60 bg-green-50/30"
                    : "border-slate-200/60 bg-white/65 backdrop-blur-xl"
              )}
            >
              {/* Step number */}
              <div className="mb-4 flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    isCompleted
                      ? "bg-green-100 text-green-600"
                      : step.bgColor
                  )}
                >
                  {isCompleted ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <StepIcon className={cn("h-4 w-4", step.color)} />
                  )}
                </div>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Step {i + 1}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                {step.description}
              </p>

              {/* Action for current step */}
              {isCurrentStep && i === 0 && (
                <Link href="/dashboard/settings" className="mt-4 block">
                  <Button size="sm" variant="outline" className="w-full text-xs">
                    Go to Settings
                  </Button>
                </Link>
              )}
              {isCurrentStep && i === 1 && (
                <Button
                  size="sm"
                  className="mt-4 w-full bg-friction-blue text-xs text-white hover:bg-friction-blue/90"
                  onClick={onNewAnalysis}
                >
                  Start Your First Analysis
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-friction-blue/40" />
          App Store search
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-friction-amber/40" />
          CSV upload
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-friction-red/40" />
          Paste reviews
        </span>
      </div>
    </div>
  );
}
