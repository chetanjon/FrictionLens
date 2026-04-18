"use client";

import { useState, useCallback } from "react";
import {
  Search,
  Loader2,
  MessageSquare,
  ArrowUp,
  Download,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { ParsedReview } from "@/lib/types/review";

// When the scraper can't find Reddit OAuth keys it throws with this exact
// substring (see src/lib/scrapers/reddit.ts). We detect it and swap in a
// configuration help panel instead of leaking the raw error to users.
const MISSING_CREDS_MARKER = "Reddit API credentials not configured";

function MissingCredsPanel() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-6 text-center">
      <MessageSquare
        className="mx-auto mb-2 h-6 w-6 text-slate-400"
        aria-hidden="true"
      />
      <p className="text-sm font-semibold text-slate-700">
        Reddit pull is not configured
      </p>
      <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-slate-500">
        Create a script app at{" "}
        <a
          href="https://www.reddit.com/prefs/apps"
          target="_blank"
          rel="noopener noreferrer"
          className="text-friction-blue underline hover:no-underline"
        >
          reddit.com/prefs/apps
        </a>
        , add{" "}
        <code className="font-mono text-[11px] text-slate-700">
          REDDIT_CLIENT_ID
        </code>{" "}
        and{" "}
        <code className="font-mono text-[11px] text-slate-700">
          REDDIT_CLIENT_SECRET
        </code>{" "}
        to your{" "}
        <code className="font-mono text-[11px] text-slate-700">.env.local</code>
        , then restart the dev server.
      </p>
    </div>
  );
}

type RedditPost = {
  postId: string;
  title: string;
  subreddit: string;
  author: string;
  commentCount: number;
  score: number;
  permalink: string;
  preview: string;
  createdAt: string;
};

type RedditSearchProps = {
  onReviewsPulled: (reviews: ParsedReview[], appName: string, platform: string) => void;
  disabled?: boolean;
};

export function RedditSearch({ onReviewsPulled, disabled }: RedditSearchProps) {
  const [appName, setAppName] = useState("");
  const [subreddit, setSubreddit] = useState("");
  const [results, setResults] = useState<RedditPost[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credsMissing, setCredsMissing] = useState(false);
  const [pulled, setPulled] = useState(false);
  const [pullProgress, setPullProgress] = useState("");

  const handleSearch = useCallback(async () => {
    if (!appName.trim() || disabled) return;

    setIsSearching(true);
    setError(null);
    setResults([]);
    setPulled(false);
    setPullProgress("");

    try {
      const params = new URLSearchParams({ q: appName.trim() });
      if (subreddit.trim()) {
        params.set("subreddit", subreddit.trim().replace(/^r\//, ""));
      }

      const res = await fetch(`/api/reddit/search?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        const msg = String(data.error ?? "Search failed.");
        if (msg.includes(MISSING_CREDS_MARKER)) {
          setCredsMissing(true);
        } else {
          setError(msg);
        }
        return;
      }

      const posts: RedditPost[] = data.results ?? [];
      setResults(posts);

      if (posts.length === 0) {
        setError("No Reddit posts found. Try a different search term or subreddit.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }, [appName, subreddit, disabled]);

  const handlePullReviews = useCallback(async () => {
    if (disabled || results.length === 0) return;

    setIsPulling(true);
    setPullProgress("Pulling comments from Reddit posts...");
    setError(null);

    try {
      const params = new URLSearchParams({ appName: appName.trim(), count: "200" });
      if (subreddit.trim()) {
        params.set("subreddit", subreddit.trim().replace(/^r\//, ""));
      }

      const res = await fetch(`/api/reddit/reviews?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        const msg = String(data.error ?? "Failed to pull comments.");
        if (msg.includes(MISSING_CREDS_MARKER)) {
          setCredsMissing(true);
        } else {
          setError(msg);
        }
        return;
      }

      const reviews: ParsedReview[] = data.reviews ?? [];

      if (reviews.length === 0) {
        setError("No usable comments found. Comments must be 10+ words and not from bots.");
        return;
      }

      setPulled(true);
      setPullProgress(`Pulled ${reviews.length} comments from Reddit`);
      onReviewsPulled(reviews, appName.trim(), "reddit");
    } catch {
      setError("Network error while pulling comments.");
    } finally {
      setIsPulling(false);
    }
  }, [appName, subreddit, disabled, results, onReviewsPulled]);

  // If we've already learned the server is missing Reddit creds, replace the
  // whole panel with a configuration help card. Don't render the search inputs
  // — letting the user submit again would only surface the same error.
  if (credsMissing) {
    return <MissingCredsPanel />;
  }

  return (
    <div className="space-y-4">
      {/* Search inputs */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="App name... e.g. Spotify, Notion"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            disabled={disabled || isSearching || isPulling}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="default"
            onClick={handleSearch}
            disabled={disabled || isSearching || isPulling || !appName.trim()}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        <Input
          placeholder="Subreddit (optional)... e.g. android, iphone, apps"
          value={subreddit}
          onChange={(e) => setSubreddit(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          disabled={disabled || isSearching || isPulling}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200/60 bg-red-50/50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Search results preview */}
      {results.length > 0 && !pulled && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500">
            {results.length} {results.length === 1 ? "post" : "posts"} found
          </p>
          <div className="max-h-[280px] space-y-1.5 overflow-y-auto">
            {results.slice(0, 10).map((post) => (
              <div
                key={post.postId}
                className="rounded-xl border border-slate-200/60 bg-white/65 backdrop-blur-xl px-3 py-2.5 transition-colors hover:bg-white/80"
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {post.title}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                      <Badge
                        variant="secondary"
                        className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-[10px]"
                      >
                        r/{post.subreddit}
                      </Badge>
                      <span className="flex items-center gap-0.5">
                        <ArrowUp className="h-3 w-3" />
                        {post.score}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <MessageSquare className="h-3 w-3" />
                        {post.commentCount}
                      </span>
                    </div>
                    {post.preview && (
                      <p className="mt-1.5 line-clamp-2 text-xs text-gray-500">
                        {post.preview}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pull all button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePullReviews}
            disabled={disabled || isPulling}
            className="w-full"
          >
            {isPulling ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Pulling comments...
              </>
            ) : (
              <>
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Pull Comments from These Posts
              </>
            )}
          </Button>
        </div>
      )}

      {/* Pulled state */}
      {pulled && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-white/65 backdrop-blur-xl px-3 py-2.5">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {pullProgress}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setPulled(false);
              setPullProgress("");
              setResults([]);
            }}
            disabled={disabled}
            className="text-xs text-gray-500 hover:text-gray-600"
          >
            Change
          </Button>
        </div>
      )}

      {/* Pull progress */}
      {isPulling && pullProgress && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          {pullProgress}
        </div>
      )}
    </div>
  );
}
