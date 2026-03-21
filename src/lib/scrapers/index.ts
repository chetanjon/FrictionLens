import gplay from "google-play-scraper";
import store from "app-store-scraper";
import type { ParsedReview } from "@/lib/types/review";

export type AppSearchResult = {
  appId: string;
  title: string;
  developer: string;
  icon: string;
  score: number | null;
  platform: "android" | "ios";
  storeId?: number; // iOS numeric ID
};

export type PullReviewsOptions = {
  appId: string;
  platform: "android" | "ios";
  storeId?: number; // Required for iOS
  count?: number; // Max reviews to pull (default 200)
};

/**
 * Search for apps across both Google Play and App Store.
 */
export async function searchApps(
  term: string,
  num = 5
): Promise<AppSearchResult[]> {
  const [androidResults, iosResults] = await Promise.allSettled([
    searchGooglePlay(term, num),
    searchAppStore(term, num),
  ]);

  const results: AppSearchResult[] = [];

  if (androidResults.status === "fulfilled") {
    results.push(...androidResults.value);
  }
  if (iosResults.status === "fulfilled") {
    results.push(...iosResults.value);
  }

  return results;
}

async function searchGooglePlay(
  term: string,
  num: number
): Promise<AppSearchResult[]> {
  const results = await gplay.search({ term, num });
  return results.map((app) => ({
    appId: app.appId,
    title: app.title,
    developer: app.developer as string,
    icon: app.icon,
    score: app.score ?? null,
    platform: "android" as const,
  }));
}

async function searchAppStore(
  term: string,
  num: number
): Promise<AppSearchResult[]> {
  const results = await store.search({ term, num });
  return results.map((app: Record<string, unknown>) => ({
    appId: app.appId as string,
    title: app.title as string,
    developer: app.developer as string,
    icon: app.icon as string,
    score: (app.score as number) ?? null,
    platform: "ios" as const,
    storeId: app.id as number,
  }));
}

/**
 * Pull reviews from Google Play or App Store.
 * Returns ParsedReview[] ready for the analysis pipeline.
 */
export async function pullReviews(
  opts: PullReviewsOptions
): Promise<ParsedReview[]> {
  const count = opts.count ?? 200;

  if (opts.platform === "android") {
    return pullGooglePlayReviews(opts.appId, count);
  } else {
    return pullAppStoreReviews(opts.storeId ?? 0, count);
  }
}

async function pullGooglePlayReviews(
  appId: string,
  count: number
): Promise<ParsedReview[]> {
  const allReviews: ParsedReview[] = [];
  let nextToken: string | undefined;
  const batchSize = Math.min(count, 150);

  while (allReviews.length < count) {
    const remaining = count - allReviews.length;
    const num = Math.min(batchSize, remaining);

    const result = await gplay.reviews({
      appId,
      sort: 2, // NEWEST
      num,
      paginate: true,
      nextPaginationToken: nextToken,
    });

    if (!result.data || result.data.length === 0) break;

    for (const rev of result.data) {
      if (!rev.text || rev.text.trim().length === 0) continue;
      allReviews.push({
        content: rev.text,
        rating: rev.score ?? undefined,
        author: rev.userName ?? undefined,
        date: rev.date ? new Date(rev.date).toISOString() : undefined,
        platform: "android",
        version: rev.version ?? undefined,
      });
    }

    nextToken = result.nextPaginationToken as string | undefined;
    if (!nextToken) break;

    // Throttle to avoid rate limiting
    await sleep(500);
  }

  return allReviews.slice(0, count);
}

async function pullAppStoreReviews(
  storeId: number,
  count: number
): Promise<ParsedReview[]> {
  const allReviews: ParsedReview[] = [];
  const maxPages = Math.ceil(count / 50); // 50 reviews per page

  for (let page = 1; page <= maxPages && allReviews.length < count; page++) {
    try {
      const reviews = await store.reviews({
        id: storeId,
        sort: store.sort.RECENT,
        page,
      });

      if (!reviews || reviews.length === 0) break;

      for (const rev of reviews as Array<Record<string, unknown>>) {
        const text = rev.text as string | undefined;
        const title = rev.title as string | undefined;
        if (!text || text.trim().length === 0) continue;

        const content = title ? `${title}. ${text}` : text;

        allReviews.push({
          content,
          rating: (rev.score as number) ?? undefined,
          author: (rev.userName as string) ?? undefined,
          date: rev.date
            ? new Date(rev.date as string).toISOString()
            : undefined,
          platform: "ios",
          version: (rev.version as string) ?? undefined,
        });
      }

      // Throttle between pages
      await sleep(300);
    } catch {
      // Apple's endpoint sometimes fails on later pages — just stop
      break;
    }
  }

  return allReviews.slice(0, count);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
