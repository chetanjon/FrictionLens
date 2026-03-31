"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Loader2,
  Sparkles,
  Store,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppStoreSearch } from "@/components/analysis/app-store-search";
import { CompetitorSelect } from "@/components/analysis/competitor-select";
import type { CompetitorApp } from "@/components/analysis/competitor-select";
import type { ParsedReview } from "@/lib/types/review";
import { runChunkedAnalysis } from "@/lib/analysis/client-orchestrator";
import {
  trackAnalysisStarted,
  trackAnalysisCompleted,
  trackAnalysisError,
} from "@/lib/analytics";

type NewAnalysisDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasApiKey: boolean;
  freeTrialRemaining?: number;
};

export function NewAnalysisDialog({
  open,
  onOpenChange,
  hasApiKey,
  freeTrialRemaining = 0,
}: NewAnalysisDialogProps) {
  const canAnalyze = hasApiKey || freeTrialRemaining > 0;
  const router = useRouter();
  const [appName, setAppName] = useState("");
  const [reviews, setReviews] = useState<ParsedReview[]>([]);
  const [progressText, setProgressText] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [competitors, setCompetitors] = useState<CompetitorApp[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  function handleReviewsParsed(parsed: ParsedReview[]) {
    setReviews(parsed);
    setError(null);
  }

  async function handleAnalyze() {
    if (!appName.trim()) {
      setError("Please enter an app name.");
      return;
    }
    if (reviews.length === 0) {
      setError("Please add some reviews first.");
      return;
    }
    if (!canAnalyze) {
      setError(
        "You've used all your free analyses. Go to Settings and add your Gemini API key to continue."
      );
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setProgressText("Starting analysis...");
    setProgressPct(5);

    const analysisStartTime = Date.now();
    trackAnalysisStarted({
      appName: appName.trim(),
      reviewCount: reviews.length,
      source: "app_store",
      competitorCount: competitors.length,
    });

    try {
      const result = await runChunkedAnalysis(
        {
          appName: appName.trim(),
          reviews,
          competitors: competitors.map((c) => ({
            appId: c.appId,
            name: c.name,
            platform: c.platform,
            storeId: c.storeId,
          })),
        },
        (step, progress) => {
          setProgressText(step);
          if (progress >= 0) {
            setProgressPct(progress);
          }
        }
      );

      trackAnalysisCompleted({
        appName: appName.trim(),
        vibeScore: result.vibeScore,
        reviewCount: result.reviewCount,
        competitorCount: result.competitorCount,
        durationMs: Date.now() - analysisStartTime,
      });
      setProgressText("Analysis complete! Redirecting...");
      setProgressPct(100);
      setTimeout(() => {
        onOpenChange(false);
        router.push(`/dashboard/analysis/${result.analysisId}`);
      }, 600);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Analysis failed.";
      trackAnalysisError({
        appName: appName.trim(),
        error: message,
        stage: "chunked",
      });
      setError(message);
      setIsAnalyzing(false);
      setProgressPct(0);
      setProgressText("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={isAnalyzing ? undefined : onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Analysis</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* App name */}
          <div>
            <Label htmlFor="dialog-app-name" className="text-sm font-medium text-slate-300">
              App Name
            </Label>
            <Input
              id="dialog-app-name"
              placeholder="e.g. Spotify, Notion, Duolingo"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="mt-1.5"
              disabled={isAnalyzing}
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="appstore">
            <TabsList className="mb-3">
              <TabsTrigger value="appstore">
                <Store className="mr-1.5 h-3.5 w-3.5" />
                App Store
              </TabsTrigger>
              <TabsTrigger value="reddit">
                <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                Reddit
              </TabsTrigger>
              <TabsTrigger value="upload">Upload CSV</TabsTrigger>
              <TabsTrigger value="paste">Paste Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="appstore">
              <AppStoreSearch
                onReviewsPulled={(pulled, name) => {
                  handleReviewsParsed(pulled);
                  if (!appName.trim()) setAppName(name);
                }}
                disabled={isAnalyzing}
              />
            </TabsContent>

            <TabsContent value="reddit">
              <RedditSearchSlot
                onReviewsPulled={(pulled, name) => {
                  handleReviewsParsed(pulled);
                  if (!appName.trim()) setAppName(name);
                }}
                disabled={isAnalyzing}
              />
            </TabsContent>

            <TabsContent value="upload">
              <CsvUploadSlot
                onReviewsParsed={handleReviewsParsed}
                disabled={isAnalyzing}
              />
            </TabsContent>

            <TabsContent value="paste">
              <PasteInputSlot
                onReviewsParsed={handleReviewsParsed}
                disabled={isAnalyzing}
              />
            </TabsContent>
          </Tabs>

          {/* Review preview */}
          {reviews.length > 0 && (
            <ReviewPreviewSlot reviews={reviews} />
          )}

          {/* Competitor selection */}
          {reviews.length > 0 && (
            <CompetitorSelect
              competitors={competitors}
              onCompetitorsChange={setCompetitors}
              disabled={isAnalyzing}
            />
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200/60 bg-red-50/50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Progress */}
          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                {progressText}
              </div>
              <Progress value={progressPct} className="h-2" />
            </div>
          )}

          {/* Free trial notice */}
          {!hasApiKey && freeTrialRemaining > 0 && !isAnalyzing && (
            <div className="flex items-center gap-2 rounded-lg border border-friction-blue/20 bg-friction-blue/5 px-4 py-3 text-sm text-friction-blue">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>
                <strong>{freeTrialRemaining}</strong> free {freeTrialRemaining === 1 ? "analysis" : "analyses"} remaining.{" "}
                <a href="/dashboard/settings" className="underline hover:no-underline">
                  Add your API key
                </a>{" "}
                for unlimited access.
              </span>
            </div>
          )}

          {/* Analyze button */}
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || reviews.length === 0 || !canAnalyze}
            className="w-full bg-friction-blue text-white hover:bg-friction-blue/90"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing {reviews.length} reviews...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze {reviews.length > 0 ? `${reviews.length} Reviews` : "Reviews"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* Slot components for lazy-loaded analysis inputs */

function CsvUploadSlot({
  onReviewsParsed,
  disabled,
}: {
  onReviewsParsed: (reviews: ParsedReview[]) => void;
  disabled: boolean;
}) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { CsvUpload } = require("@/components/analysis/csv-upload");
    return <CsvUpload onReviewsParsed={onReviewsParsed} disabled={disabled} />;
  } catch {
    return (
      <div className="rounded-lg border border-dashed border-white/[0.08] bg-[#161616] p-8 text-center">
        <p className="text-sm text-slate-400">CSV upload loading...</p>
      </div>
    );
  }
}

function PasteInputSlot({
  onReviewsParsed,
  disabled,
}: {
  onReviewsParsed: (reviews: ParsedReview[]) => void;
  disabled: boolean;
}) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PasteInput } = require("@/components/analysis/paste-input");
    return <PasteInput onReviewsParsed={onReviewsParsed} disabled={disabled} />;
  } catch {
    return (
      <div className="rounded-lg border border-dashed border-white/[0.08] bg-[#161616] p-8 text-center">
        <p className="text-sm text-slate-400">Paste input loading...</p>
      </div>
    );
  }
}

function RedditSearchSlot({
  onReviewsPulled,
  disabled,
}: {
  onReviewsPulled: (reviews: ParsedReview[], appName: string, platform: string) => void;
  disabled: boolean;
}) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { RedditSearch } = require("@/components/analysis/reddit-search");
    return <RedditSearch onReviewsPulled={onReviewsPulled} disabled={disabled} />;
  } catch {
    return (
      <div className="rounded-lg border border-dashed border-white/[0.08] bg-[#161616] p-8 text-center">
        <p className="text-sm text-slate-400">Reddit search loading...</p>
      </div>
    );
  }
}

function ReviewPreviewSlot({ reviews }: { reviews: ParsedReview[] }) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ReviewPreview } = require("@/components/analysis/review-preview");
    return <ReviewPreview reviews={reviews} />;
  } catch {
    return (
      <div className="rounded-lg border border-white/[0.08] bg-[#161616] p-4">
        <p className="text-sm font-medium text-slate-300">
          {reviews.length} {reviews.length === 1 ? "review" : "reviews"} ready
        </p>
      </div>
    );
  }
}
