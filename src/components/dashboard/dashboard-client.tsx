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
import { AppStoreSearch as AppStoreSearchImport } from "@/components/analysis/app-store-search";
import { CompetitorSelect } from "@/components/analysis/competitor-select";
import type { CompetitorApp } from "@/components/analysis/competitor-select";
import type { ParsedReview } from "@/lib/types/review";

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

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appName: appName.trim(),
          reviews,
          competitors: competitors.map((c) => ({
            appId: c.appId,
            name: c.name,
            platform: c.platform,
            storeId: c.storeId,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Analysis failed.");
        setIsAnalyzing(false);
        setProgressPct(0);
        setProgressText("");
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError("Streaming not supported.");
        setIsAnalyzing(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        let eventType = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));

            if (eventType === "progress") {
              setProgressText(data.step);
              setProgressPct(data.progress);
            } else if (eventType === "complete") {
              setProgressText("Analysis complete! Redirecting...");
              setProgressPct(100);
              setTimeout(() => {
                router.push(`/dashboard/analysis/${data.analysisId}`);
              }, 600);
              return;
            } else if (eventType === "error") {
              setError(data.error);
              setIsAnalyzing(false);
              setProgressPct(0);
              setProgressText("");
              return;
            }
          }
        }
      }
    } catch {
      setError("Network error. Please try again.");
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
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            New Analysis
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Upload or paste app reviews to generate a Vibe Report.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-white/65 p-6 backdrop-blur-xl">
          {/* App name */}
          <div className="mb-5">
            <Label htmlFor="app-name" className="text-sm font-medium text-slate-700">
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
              <AppStoreSearchSlot
                onReviewsPulled={(reviews, name) => {
                  handleReviewsParsed(reviews);
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
            <div className="mb-5">
              <ReviewPreviewSlot reviews={reviews} />
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
              <div className="flex items-center gap-2 text-sm text-slate-600">
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
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Reports
          </h2>
          <span className="text-xs text-slate-400">
            {recentAnalyses.length} {recentAnalyses.length === 1 ? "report" : "reports"}
          </span>
        </div>

        {recentAnalyses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/40 px-6 py-12 text-center">
            <FileText className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-500">
              No analyses yet
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Upload reviews above to create your first Vibe Report.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentAnalyses.map((a) => (
              <Link
                key={a.id}
                href={`/dashboard/analysis/${a.id}`}
                className="group flex items-center gap-4 rounded-xl border border-slate-200/60 bg-white/65 px-4 py-3.5 backdrop-blur-xl transition-all hover:border-slate-300 hover:shadow-sm"
              >
                {/* Vibe score circle */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-sm font-semibold text-white"
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
                    <span className="truncate text-sm font-medium text-slate-900">
                      {a.app_name}
                    </span>
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
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

                <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-slate-500" />
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
        <Badge variant="secondary" className="gap-1 bg-green-50 text-green-700">
          <CheckCircle2 className="h-3 w-3" />
          Done
        </Badge>
      );
    case "processing":
      return (
        <Badge variant="secondary" className="gap-1 bg-blue-50 text-blue-700">
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

/**
 * Slot components for the analysis inputs.
 * These attempt to import the real components; if they're not built yet,
 * they render placeholder UIs.
 */

function CsvUploadSlot({
  onReviewsParsed,
  disabled,
}: {
  onReviewsParsed: (reviews: ParsedReview[]) => void;
  disabled: boolean;
}) {
  // Try to use the real component if available
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { CsvUpload } = require("@/components/analysis/csv-upload");
    return <CsvUpload onReviewsParsed={onReviewsParsed} disabled={disabled} />;
  } catch {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
        <p className="text-sm text-slate-400">
          CSV upload component is being built...
        </p>
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
    return (
      <PasteInput onReviewsParsed={onReviewsParsed} disabled={disabled} />
    );
  } catch {
    return (
      <PasteInputFallback onReviewsParsed={onReviewsParsed} disabled={disabled} />
    );
  }
}

function PasteInputFallback({
  onReviewsParsed,
  disabled,
}: {
  onReviewsParsed: (reviews: ParsedReview[]) => void;
  disabled: boolean;
}) {
  const [text, setText] = useState("");

  function handleParse() {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const parsed: ParsedReview[] = lines.map((line) => ({
      content: line,
    }));

    if (parsed.length > 0) {
      onReviewsParsed(parsed);
    }
  }

  return (
    <div className="space-y-3">
      <textarea
        className="min-h-[120px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-friction-blue focus:outline-none focus:ring-1 focus:ring-friction-blue"
        placeholder="Paste one review per line..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleParse}
        disabled={disabled || text.trim().length === 0}
      >
        Parse Reviews
      </Button>
    </div>
  );
}

function AppStoreSearchSlot({
  onReviewsPulled,
  disabled,
}: {
  onReviewsPulled: (reviews: ParsedReview[], appName: string, platform: string) => void;
  disabled: boolean;
}) {
  return <AppStoreSearchImport onReviewsPulled={onReviewsPulled} disabled={disabled} />;
}

function ReviewPreviewSlot({ reviews }: { reviews: ParsedReview[] }) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ReviewPreview } = require("@/components/analysis/review-preview");
    return <ReviewPreview reviews={reviews} />;
  } catch {
    return (
      <div className="rounded-lg border border-slate-200/60 bg-slate-50/30 p-4">
        <p className="text-sm font-medium text-slate-700">
          {reviews.length} {reviews.length === 1 ? "review" : "reviews"} ready
        </p>
        <div className="mt-2 max-h-40 space-y-1.5 overflow-y-auto">
          {reviews.slice(0, 5).map((r, i) => (
            <p key={i} className="truncate text-xs text-slate-500">
              {r.rating ? `${"★".repeat(r.rating)} ` : ""}
              {r.content}
            </p>
          ))}
          {reviews.length > 5 && (
            <p className="text-xs text-slate-400">
              ...and {reviews.length - 5} more
            </p>
          )}
        </div>
      </div>
    );
  }
}
