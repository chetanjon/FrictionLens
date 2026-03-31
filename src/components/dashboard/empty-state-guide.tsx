"use client";

import { Key, FileUp, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateGuideProps = {
  hasApiKey: boolean;
  freeTrialRemaining?: number;
  onNewAnalysis: () => void;
};

const STEPS = [
  {
    icon: Key,
    title: "Add API Key",
    description: "Get a free Gemini API key from Google AI Studio, or try your first analysis free!",
    href: "/dashboard/settings",
    color: "text-friction-blue",
    bgColor: "bg-friction-blue/10",
  },
  {
    icon: FileUp,
    title: "Import Reviews",
    description: "Search the App Store, Reddit, upload a CSV, or paste reviews directly.",
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

export function EmptyStateGuide({
  hasApiKey,
  freeTrialRemaining = 0,
  onNewAnalysis,
}: EmptyStateGuideProps) {
  const canAnalyze = hasApiKey || freeTrialRemaining > 0;
  const currentStep = canAnalyze ? 1 : 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-20 sm:px-8">
      <div className="text-center">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Welcome to FrictionLens
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base text-slate-400">
          Your AI-powered review intelligence platform. Get started in three simple steps.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {STEPS.map((step, i) => {
          const isCurrentStep = i === currentStep;
          const isCompleted = i < currentStep;
          const StepIcon = step.icon;

          return (
            <div
              key={step.title}
              className={cn(
                "relative rounded-2xl border p-8 transition-all",
                isCurrentStep
                  ? "border-friction-blue/30 bg-white/[0.03] backdrop-blur-md shadow-lg shadow-friction-blue/8 ring-1 ring-friction-blue/10"
                  : isCompleted
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-white/[0.07] bg-white/[0.03] backdrop-blur-md"
              )}
            >
              {/* Step number */}
              <div className="mb-5 flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    isCompleted
                      ? "bg-green-100 text-green-600"
                      : step.bgColor
                  )}
                >
                  {isCompleted ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <StepIcon className={cn("h-5 w-5", step.color)} />
                  )}
                </div>
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Step {i + 1}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {step.description}
              </p>

              {/* Action for current step */}
              {isCurrentStep && i === 0 && !canAnalyze && (
                <Link href="/dashboard/settings" className="mt-6 block">
                  <Button size="default" variant="outline" className="w-full">
                    Go to Settings
                  </Button>
                </Link>
              )}
              {isCurrentStep && i === 1 && (
                <Button
                  size="default"
                  className="mt-6 w-full bg-friction-blue text-white hover:bg-friction-blue/90"
                  onClick={onNewAnalysis}
                >
                  Start Your First Analysis
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Free trial CTA */}
      {!hasApiKey && freeTrialRemaining > 0 && (
        <div className="mt-12 text-center">
          <Button
            size="lg"
            className="bg-friction-blue px-8 text-base text-white hover:bg-friction-blue/90"
            onClick={onNewAnalysis}
          >
            Try Your First Analysis Free
          </Button>
          <p className="mt-3 text-sm text-slate-400">
            {freeTrialRemaining} free {freeTrialRemaining === 1 ? "analysis" : "analyses"} included — no API key needed
          </p>
        </div>
      )}

      <div className="mt-12 flex items-center justify-center gap-6 text-sm text-slate-400">
        <span className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-friction-blue/40" />
          App Store search
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-orange-500/40" />
          Reddit
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-friction-amber/40" />
          CSV upload
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-friction-red/40" />
          Paste reviews
        </span>
      </div>
    </div>
  );
}
