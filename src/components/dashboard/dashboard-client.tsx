"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AppStoreSearch } from "@/components/analysis/app-store-search";
import { CompetitorSelect } from "@/components/analysis/competitor-select";
import type { CompetitorApp } from "@/components/analysis/competitor-select";
import { CsvUpload } from "@/components/analysis/csv-upload";
import { PasteInput } from "@/components/analysis/paste-input";
import { ReviewPreview } from "@/components/analysis/review-preview";
import type { ParsedReview } from "@/lib/types/review";
import { runChunkedAnalysis } from "@/lib/analysis/client-orchestrator";
import { trackAnalysisStarted, trackAnalysisCompleted, trackAnalysisError } from "@/lib/analytics";

type SerializedAnalysis = {
  id: string;
  app_name: string;
  platform: string | null;
  status: string;
  vibe_score: number | null;
  review_count: number;
  created_at: string;
  vibeColorHex: string | null;
};

export function DashboardClient({
  recentAnalyses,
  hasApiKey,
}: {
  recentAnalyses: SerializedAnalysis[];
  hasApiKey: boolean;
}) {
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
    if (!hasApiKey) {
      setError(
        "No API key configured. Please go to Settings and add your Gemini API key first."
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
          // Only update progress if not a retry notification (progress = -1)
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
        router.push(`/dashboard/analysis/${result.analysisId}`);
      }, 600);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Analysis failed.";
      trackAnalysisError({ appName: appName.trim(), error: message, stage: "chunked" });
      setError(message);
      setIsAnalyzing(false);
      setProgressPct(0);
      setProgressText("");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* New Analysis Section */}
      <section>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            New Analysis
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload or paste app reviews to generate a Vibe Report.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
          {/* App name */}
          <div className="mb-5">
            <Label htmlFor="app-name" className="text-sm font-medium text-gray-600">
              App Name
            </Label>
            <Input
              id="app-name"
              placeholder="e.g. Spotify, Notion, Duolingo"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="mt-1.5"
              disabled={isAnalyzing}
            />
          </div>

          {/* Tabs for App Store / CSV / Paste */}
          <Tabs defaultValue="appstore" className="mb-5">
            <TabsList className="mb-3">
              <TabsTrigger value="appstore">
                <Store className="mr-1.5 h-3.5 w-3.5" />
                App Store
              </TabsTrigger>
              <TabsTrigger value="upload">Upload CSV</TabsTrigger>
              <TabsTrigger value="paste">Paste Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="appstore">
              <AppStoreSearch
                onReviewsPulled={(reviews, name) => {
                  handleReviewsParsed(reviews);
                  if (!appName.trim()) setAppName(name);
                }}
                disabled={isAnalyzing}
              />
            </TabsContent>

            <TabsContent value="upload">
              <CsvUpload
                onReviewsParsed={handleReviewsParsed}
                disabled={isAnalyzing}
              />
            </TabsContent>

            <TabsContent value="paste">
              <PasteInput
                onReviewsParsed={handleReviewsParsed}
                disabled={isAnalyzing}
              />
            </TabsContent>
          </Tabs>

          {/* Review preview */}
          {reviews.length > 0 && (
            <div className="mb-5">
              <ReviewPreview reviews={reviews} />
            </div>
          )}

          {/* Competitor selection */}
          {reviews.length > 0 && (
            <div className="mb-5">
              <CompetitorSelect
                competitors={competitors}
                onCompetitorsChange={setCompetitors}
                disabled={isAnalyzing}
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200/60 bg-red-50/50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Progress */}
          {isAnalyzing && (
            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                {progressText}
              </div>
              <Progress value={progressPct} className="h-2" />
            </div>
          )}

          {/* Analyze button */}
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || reviews.length === 0}
            className="w-full bg-friction-blue text-white hover:bg-friction-blue/90 sm:w-auto"
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
      </section>

      {/* Recent Reports Section */}
      <section className="mt-12">
        <Separator className="mb-8" />
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Reports
          </h2>
          <span className="text-xs text-gray-500">
            {recentAnalyses.length} {recentAnalyses.length === 1 ? "report" : "reports"}
          </span>
        </div>

        {recentAnalyses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200/60 bg-white px-6 py-16 text-center">
            {/* Illustrated empty state */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white ring-1 ring-white/[0.08]">
              <FileText className="h-7 w-7 text-gray-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-600">
              No reports yet
            </h3>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-gray-500">
              Search for an app or upload a CSV above to generate your first
              Vibe Report with sentiment scores and churn signals.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
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
        ) : (
          <div className="space-y-2">
            {recentAnalyses.map((a) => (
              <Link
                key={a.id}
                href={`/dashboard/analysis/${a.id}`}
                className="group flex items-center gap-4 rounded-xl border border-gray-200/60 bg-white px-4 py-3.5 transition-all duration-200 hover:border-gray-200 hover:bg-gray-100 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-friction-blue focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                aria-label={`View ${a.app_name} report${a.vibe_score != null ? `, vibe score ${Math.round(a.vibe_score)}` : ""}`}
              >
                {/* Vibe score circle */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-sm font-semibold text-gray-900"
                  style={{
                    backgroundColor:
                      a.status === "completed" && a.vibeColorHex
                        ? a.vibeColorHex
                        : "#94A3B8",
                  }}
                >
                  {a.status === "completed" && a.vibe_score != null
                    ? Math.round(a.vibe_score)
                    : "--"}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-gray-900">
                      {a.app_name}
                    </span>
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-500">
                    <span>{a.review_count} reviews</span>
                    <span>
                      {new Date(a.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 shrink-0 text-gray-600 transition-colors group-hover:text-gray-500" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-400 border-green-500/20">
          <CheckCircle2 className="h-3 w-3" />
          Done
        </Badge>
      );
    case "processing":
      return (
        <Badge variant="secondary" className="gap-1 bg-blue-500/10 text-blue-400 border-blue-500/20">
          <Loader2 className="h-3 w-3 animate-spin" />
          Processing
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Failed
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          {status}
        </Badge>
      );
  }
}

