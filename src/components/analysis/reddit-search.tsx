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

// ── Types ──

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

// ── Reddit client-side helpers ──
// Fetches directly from the user's browser to avoid Vercel IP blocks

const REDDIT_BASE = "https://www.reddit.com";
const BOT_AUTHORS = new Set([
  "AutoModerator", "BotDefense", "RemindMeBot", "sneakpeekbot",
  "RepostSleuthBot", "WikiSummarizerBot", "SaveVideo", "haikusbot",
]);
const MIN_WORD_COUNT = 10;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).length;
}

function isUsableComment(author: string, body: string): boolean {
  if (!body || body === "[deleted]" || body === "[removed]") return false;
  if (BOT_AUTHORS.has(author) || author === "[deleted]") return false;
  return wordCount(body) >= MIN_WORD_COUNT;
}

async function redditFetch(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Reddit API error: ${res.status} ${res.statusText}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("json")) {
    throw new Error("Reddit returned an unexpected response. Please try again.");
  }

  return res.json();
}

async function searchRedditClient(
  appName: string,
  subreddit?: string
): Promise<RedditPost[]> {
  const query = encodeURIComponent(appName);
  const url = subreddit
    ? `${REDDIT_BASE}/r/${encodeURIComponent(subreddit)}/search.json?q=${query}&restrict_sr=on&sort=new&t=year&limit=25`
    : `${REDDIT_BASE}/search.json?q=${query}&sort=new&t=year&limit=25`;

  const raw = await redditFetch(url);

  // Loosely extract from the response without strict Zod (client-side)
  const listing = raw as {
    data?: { children?: Array<{ kind: string; data: Record<string, unknown> }> };
  };

  const children = listing?.data?.children ?? [];

  return children
    .filter((c) => c.kind === "t3")
    .map((c) => {
      const d = c.data;
      return {
        postId: String(d.id ?? ""),
        title: String(d.title ?? ""),
        subreddit: String(d.subreddit ?? ""),
        author: String(d.author ?? ""),
        commentCount: Number(d.num_comments ?? 0),
        score: Number(d.score ?? 0),
        permalink: String(d.permalink ?? ""),
        preview: String(d.selftext ?? "").slice(0, 200),
        createdAt: new Date(Number(d.created_utc ?? 0) * 1000).toISOString(),
      };
    });
}

async function pullCommentsFromPosts(
  posts: RedditPost[],
  maxReviews: number
): Promise<ParsedReview[]> {
  const sorted = [...posts].sort((a, b) => b.commentCount - a.commentCount);
  const reviews: ParsedReview[] = [];

  for (const post of sorted) {
    if (reviews.length >= maxReviews) break;
    if (post.commentCount === 0) continue;

    try {
      const url = `${REDDIT_BASE}${post.permalink}.json?limit=100&sort=new`;
      const raw = await redditFetch(url);

      const listings = raw as Array<{
        data?: { children?: Array<{ kind: string; data: Record<string, unknown> }> };
      }>;

      if (!Array.isArray(listings) || listings.length < 2) continue;

      const comments = listings[1]?.data?.children ?? [];

      for (const child of comments) {
        if (child.kind !== "t1") continue;
        if (reviews.length >= maxReviews) break;

        const body = String(child.data.body ?? "");
        const author = String(child.data.author ?? "");
        const createdUtc = Number(child.data.created_utc ?? 0);

        if (!isUsableComment(author, body)) continue;

        reviews.push({
          content: body,
          rating: undefined,
          author,
          date: new Date(createdUtc * 1000).toISOString(),
          platform: "reddit",
          version: undefined,
        });
      }

      // Throttle between post fetches
      await new Promise((r) => setTimeout(r, 1000));
    } catch {
      continue;
    }
  }

  return reviews;
}

// ── Component ──

export function RedditSearch({ onReviewsPulled, disabled }: RedditSearchProps) {
  const [appName, setAppName] = useState("");
  const [subreddit, setSubreddit] = useState("");
  const [results, setResults] = useState<RedditPost[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      const sub = subreddit.trim().replace(/^r\//, "") || undefined;
      const posts = await searchRedditClient(appName.trim(), sub);
      setResults(posts);

      if (posts.length === 0) {
        setError("No Reddit posts found. Try a different search term or subreddit.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Search failed.";
      setError(message);
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
      const reviews = await pullCommentsFromPosts(results, 200);

      if (reviews.length === 0) {
        setError("No usable comments found. Comments must be 10+ words and not from bots.");
        return;
      }

      setPulled(true);
      setPullProgress(`Pulled ${reviews.length} comments from Reddit`);
      onReviewsPulled(reviews, appName.trim(), "reddit");
    } catch {
      setError("Failed to pull comments. Please try again.");
    } finally {
      setIsPulling(false);
    }
  }, [appName, disabled, results, onReviewsPulled]);

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
          <p className="text-xs font-medium text-slate-500">
            {results.length} {results.length === 1 ? "post" : "posts"} found
          </p>
          <div className="max-h-[280px] space-y-1.5 overflow-y-auto">
            {results.slice(0, 10).map((post) => (
              <div
                key={post.postId}
                className="rounded-xl border border-white/[0.08] bg-[#161616] px-3 py-2.5 transition-colors hover:bg-[#1C1C1C]"
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {post.title}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
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
                      <p className="mt-1.5 line-clamp-2 text-xs text-slate-500">
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
        <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#161616] px-3 py-2.5">
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
            className="text-xs text-slate-400 hover:text-slate-300"
          >
            Change
          </Button>
        </div>
      )}

      {/* Pull progress */}
      {isPulling && pullProgress && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          {pullProgress}
        </div>
      )}
    </div>
  );
}
