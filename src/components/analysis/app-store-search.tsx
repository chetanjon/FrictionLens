"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  Search,
  Loader2,
  Smartphone,
  Star,
  Download,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { ParsedReview } from "@/lib/types/review";

type AppResult = {
  appId: string;
  title: string;
  developer: string;
  icon: string;
  score: number | null;
  platform: "android" | "ios";
  storeId?: number;
};

type AppStoreSearchProps = {
  onReviewsPulled: (reviews: ParsedReview[], appName: string, platform: string) => void;
  disabled?: boolean;
};

export function AppStoreSearch({ onReviewsPulled, disabled }: AppStoreSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AppResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPulling, setIsPulling] = useState<string | null>(null);
  const [pullProgress, setPullProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pulledApp, setPulledApp] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim() || disabled) return;

    setIsSearching(true);
    setError(null);
    setResults([]);
    setPulledApp(null);

    try {
      const res = await fetch(
        `/api/apps/search?q=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Search failed.");
        return;
      }

      setResults(data.results ?? []);
      if ((data.results ?? []).length === 0) {
        setError("No apps found. Try a different search term.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }, [query, disabled]);

  const handlePullReviews = useCallback(
    async (app: AppResult) => {
      if (disabled) return;

      const pullId = `${app.platform}-${app.appId}`;
      setIsPulling(pullId);
      setPullProgress("Pulling most recent reviews from store...");
      setError(null);

      try {
        const params = new URLSearchParams({
          appId: app.appId,
          platform: app.platform,
          count: "200",
        });
        if (app.storeId) {
          params.set("storeId", String(app.storeId));
        }

        const res = await fetch(`/api/apps/reviews?${params.toString()}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Failed to pull reviews.");
          return;
        }

        const reviews: ParsedReview[] = data.reviews ?? [];

        if (reviews.length === 0) {
          setError("No reviews found for this app.");
          return;
        }

        setPulledApp(pullId);
        setPullProgress(`Pulled ${reviews.length} most recent reviews`);
        onReviewsPulled(reviews, app.title, app.platform);
      } catch {
        setError("Network error while pulling reviews.");
      } finally {
        setIsPulling(null);
      }
    },
    [disabled, onReviewsPulled]
  );

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="flex gap-2">
        <Input
          placeholder="Search app stores... e.g. Spotify, Notion"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          disabled={disabled || isSearching}
          className="flex-1"
        />
        <Button
          variant="outline"
          size="default"
          onClick={handleSearch}
          disabled={disabled || isSearching || !query.trim()}
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200/60 bg-red-50/50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Results — collapse to selected app after pull */}
      {results.length > 0 && (
        <div className="space-y-2">
          {!pulledApp && (
            <p className="text-xs font-medium text-gray-500">
              {results.length} {results.length === 1 ? "app" : "apps"} found
            </p>
          )}
          <div className={pulledApp ? "" : "max-h-[320px] space-y-1.5 overflow-y-auto"}>
            {results
              .filter((app) => !pulledApp || `${app.platform}-${app.appId}` === pulledApp)
              .map((app) => {
              const pullId = `${app.platform}-${app.appId}`;
              const isThisPulling = isPulling === pullId;
              const isThisPulled = pulledApp === pullId;

              return (
                <div
                  key={pullId}
                  className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white/65 backdrop-blur-xl px-3 py-2.5 transition-colors hover:bg-white/80"
                >
                  {/* App icon */}
                  <Image
                    src={app.icon}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 rounded-xl"
                    unoptimized
                  />

                  {/* App info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-gray-900">
                        {app.title}
                      </span>
                      <Badge
                        variant="secondary"
                        className={`shrink-0 text-[10px] ${
                          app.platform === "ios"
                            ? "bg-slate-500/10 text-gray-500 border-slate-500/20"
                            : "bg-green-500/10 text-green-400 border-green-500/20"
                        }`}
                      >
                        <Smartphone className="mr-0.5 h-2.5 w-2.5" />
                        {app.platform === "ios" ? "iOS" : "Android"}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                      <span className="truncate">{app.developer}</span>
                      {app.score != null && (
                        <span className="flex shrink-0 items-center gap-0.5">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {app.score.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pull button / Change app */}
                  {isThisPulled ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="flex items-center gap-1.5 text-sm text-green-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Pulled
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPulledApp(null);
                          setPullProgress("");
                        }}
                        disabled={disabled}
                        className="text-xs text-gray-500 hover:text-gray-600"
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePullReviews(app)}
                      disabled={disabled || !!isPulling}
                      className="shrink-0"
                    >
                      {isThisPulling ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Pulling...
                        </>
                      ) : (
                        <>
                          <Download className="mr-1.5 h-3.5 w-3.5" />
                          Pull Recent Reviews
                        </>
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pull progress */}
      {(isPulling || pulledApp) && pullProgress && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {isPulling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          )}
          {pullProgress}
        </div>
      )}
    </div>
  );
}
