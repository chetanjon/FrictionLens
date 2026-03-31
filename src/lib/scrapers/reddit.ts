import { z } from "zod";
import type { ParsedReview } from "@/lib/types/review";
import { cacheGetOrSet } from "@/lib/cache/redis";
import { redditReviewsCacheKey } from "@/lib/cache/keys";

// ── Zod schemas for Reddit API responses ──

const RedditPostDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  subreddit: z.string(),
  selftext: z.string().optional().default(""),
  author: z.string(),
  created_utc: z.number(),
  num_comments: z.number(),
  score: z.number(),
  permalink: z.string(),
  url: z.string(),
}).passthrough();

const RedditListingChildSchema = z.object({
  kind: z.string(),
  data: RedditPostDataSchema,
}).passthrough();

const RedditListingSchema = z.object({
  kind: z.literal("Listing"),
  data: z.object({
    children: z.array(RedditListingChildSchema),
  }).passthrough(),
});

const RedditCommentDataSchema = z.object({
  id: z.string(),
  body: z.string().optional().default(""),
  author: z.string(),
  created_utc: z.number(),
  score: z.number(),
}).passthrough();

const RedditCommentChildSchema = z.object({
  kind: z.string(),
  data: RedditCommentDataSchema,
}).passthrough();

const RedditCommentListingSchema = z.object({
  kind: z.literal("Listing"),
  data: z.object({
    children: z.array(RedditCommentChildSchema),
  }).passthrough(),
});

// ── Types ──

export type RedditSearchResult = {
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

type PullRedditReviewsOptions = {
  appName: string;
  subreddit?: string;
  count?: number;
};

// ── Constants ──

const BOT_AUTHORS = new Set([
  "AutoModerator",
  "BotDefense",
  "RemindMeBot",
  "sneakpeekbot",
  "RepostSleuthBot",
  "WikiSummarizerBot",
  "SaveVideo",
  "haikusbot",
]);
const MIN_WORD_COUNT = 10;

// ── OAuth Token Management ──

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getRedditAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Reddit API credentials not configured. Add REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET to your environment variables."
    );
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "FrictionLens/1.0 (by /u/frictionlens)",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`Reddit OAuth failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number };

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.token;
}

// ── Helpers ──

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).length;
}

function isUsableComment(author: string, body: string): boolean {
  if (!body || body === "[deleted]" || body === "[removed]") return false;
  if (BOT_AUTHORS.has(author)) return false;
  if (author === "[deleted]") return false;
  if (wordCount(body) < MIN_WORD_COUNT) return false;
  return true;
}

async function redditFetch(path: string, retries = 2): Promise<unknown> {
  const token = await getRedditAccessToken();
  const url = `https://oauth.reddit.com${path}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "FrictionLens/1.0 (by /u/frictionlens)",
        Accept: "application/json",
      },
    });

    if (res.status === 429) {
      if (attempt < retries) {
        await sleep(2000 * (attempt + 1));
        continue;
      }
      throw new Error("Reddit rate limit exceeded. Please try again in a moment.");
    }

    if (!res.ok) {
      throw new Error(`Reddit API error: ${res.status} ${res.statusText}`);
    }

    return res.json();
  }

  throw new Error("Failed to fetch from Reddit after retries.");
}

// ── Public API ──

/**
 * Search Reddit for posts mentioning an app name.
 * Uses Reddit OAuth API (works from any server, including cloud providers).
 */
export async function searchReddit(
  appName: string,
  subreddit?: string
): Promise<RedditSearchResult[]> {
  const query = encodeURIComponent(appName);
  const path = subreddit
    ? `/r/${encodeURIComponent(subreddit)}/search?q=${query}&restrict_sr=on&sort=new&t=year&limit=25`
    : `/search?q=${query}&sort=new&t=year&limit=25`;

  const raw = await redditFetch(path);
  const listing = RedditListingSchema.parse(raw);

  return listing.data.children
    .filter((child) => child.kind === "t3")
    .map((child) => ({
      postId: child.data.id,
      title: child.data.title,
      subreddit: child.data.subreddit,
      author: child.data.author,
      commentCount: child.data.num_comments,
      score: child.data.score,
      permalink: child.data.permalink,
      preview: child.data.selftext.slice(0, 200),
      createdAt: new Date(child.data.created_utc * 1000).toISOString(),
    }));
}

/**
 * Pull Reddit comments as ParsedReview[] for the analysis pipeline.
 */
export async function pullRedditReviews(
  opts: PullRedditReviewsOptions
): Promise<ParsedReview[]> {
  const { appName, subreddit, count = 200 } = opts;

  const cacheKey = redditReviewsCacheKey(appName, subreddit);
  return cacheGetOrSet(cacheKey, 3600, () =>
    fetchRedditReviews(appName, subreddit, count)
  );
}

async function fetchRedditReviews(
  appName: string,
  subreddit: string | undefined,
  count: number
): Promise<ParsedReview[]> {
  const posts = await searchReddit(appName, subreddit);
  if (posts.length === 0) return [];

  const sorted = [...posts].sort((a, b) => b.commentCount - a.commentCount);
  const reviews: ParsedReview[] = [];

  for (const post of sorted) {
    if (reviews.length >= count) break;
    if (post.commentCount === 0) continue;

    try {
      const commentsPath = `${post.permalink}?limit=100&sort=new`;
      const raw = await redditFetch(commentsPath);

      const listings = z.array(z.unknown()).parse(raw);
      if (listings.length < 2) continue;

      const commentListing = RedditCommentListingSchema.parse(listings[1]);

      for (const child of commentListing.data.children) {
        if (child.kind !== "t1") continue;
        if (reviews.length >= count) break;

        const { body, author, created_utc } = child.data;
        if (!isUsableComment(author, body)) continue;

        reviews.push({
          content: body,
          rating: undefined,
          author,
          date: new Date(created_utc * 1000).toISOString(),
          platform: "reddit",
          version: undefined,
        });
      }

      await sleep(1000);
    } catch {
      continue;
    }
  }

  return reviews.slice(0, count);
}
