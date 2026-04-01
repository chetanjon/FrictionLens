"use client";

import { Key, FileUp, BarChart3, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateGuideProps = {
  hasApiKey: boolean;
  freeTrialRemaining?: number;
  onNewAnalysis: () => void;
};

export function EmptyStateGuide({
  hasApiKey,
  freeTrialRemaining = 0,
  onNewAnalysis,
}: EmptyStateGuideProps) {
  const hasFreeTrials = !hasApiKey && freeTrialRemaining > 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-20 sm:px-8">
      <div className="text-center">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-friction-blue/10">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4A90D9" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Welcome to FrictionLens
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base text-gray-500">
          Your AI-powered review intelligence platform.
          {hasFreeTrials
            ? ` You have ${freeTrialRemaining} free ${freeTrialRemaining === 1 ? "analysis" : "analyses"}, no API key needed.`
            : " Get started in three simple steps."}
        </p>
      </div>

      {/* Free trial: simplified 2-step flow */}
      {hasFreeTrials ? (
        <>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:max-w-3xl sm:mx-auto">
            <div className="relative rounded-2xl border border-friction-blue/30 bg-white p-8 shadow-lg shadow-friction-blue/8 ring-1 ring-friction-blue/10">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-friction-blue/10">
                  <FileUp className="h-5 w-5 text-friction-blue" />
                </div>
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Step 1
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Import Reviews</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Search the App Store, Reddit, upload a CSV, or paste reviews directly.
              </p>
              <Button
                size="default"
                className="mt-6 w-full bg-friction-blue text-white hover:bg-friction-blue/90"
                onClick={onNewAnalysis}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Start Your Free Analysis
              </Button>
            </div>

            <div className="relative rounded-2xl border border-gray-200/60 bg-white p-8">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Step 2
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Get Your Report</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                AI analyzes sentiment across 5 dimensions and surfaces friction & churn signals.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Want unlimited analyses?{" "}
              <Link href="/dashboard/settings" className="text-friction-blue hover:underline">
                Add your Gemini API key
              </Link>{" "}
              (it&apos;s free from Google).
            </p>
          </div>
        </>
      ) : (
        /* No free trials: full 3-step flow */
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              icon: Key,
              title: "Add API Key",
              description: "Get a free Gemini API key from Google AI Studio to power the analysis.",
              color: "text-friction-blue",
              bgColor: "bg-friction-blue/10",
              isActive: !hasApiKey,
              action: !hasApiKey ? (
                <Link href="/dashboard/settings" className="mt-6 block">
                  <Button size="default" variant="outline" className="w-full">
                    Go to Settings
                  </Button>
                </Link>
              ) : null,
            },
            {
              icon: FileUp,
              title: "Import Reviews",
              description: "Search the App Store, Reddit, upload a CSV, or paste reviews directly.",
              color: "text-friction-amber",
              bgColor: "bg-friction-amber/10",
              isActive: hasApiKey,
              action: hasApiKey ? (
                <Button
                  size="default"
                  className="mt-6 w-full bg-friction-blue text-white hover:bg-friction-blue/90"
                  onClick={onNewAnalysis}
                >
                  Start Your First Analysis
                </Button>
              ) : null,
            },
            {
              icon: BarChart3,
              title: "Get Your Report",
              description: "AI analyzes sentiment across 5 dimensions and surfaces friction & churn signals.",
              color: "text-green-600",
              bgColor: "bg-green-50",
              isActive: false,
              action: null,
            },
          ].map((step, i) => {
            const isCompleted = hasApiKey && i === 0;
            const StepIcon = step.icon;

            return (
              <div
                key={step.title}
                className={cn(
                  "relative rounded-2xl border p-8 transition-all",
                  step.isActive
                    ? "border-friction-blue/30 bg-white shadow-lg shadow-friction-blue/8 ring-1 ring-friction-blue/10"
                    : isCompleted
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-gray-200/60 bg-white"
                )}
              >
                <div className="mb-5 flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      isCompleted ? "bg-green-100 text-green-600" : step.bgColor
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
                  <span className="font-mono text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Step {i + 1}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {step.description}
                </p>

                {step.action}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-12 flex items-center justify-center gap-6 text-sm text-gray-500">
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
