/**
 * Cache key builders for FrictionLens.
 * All keys use the `fl:` namespace prefix.
 */

export function searchCacheKey(term: string): string {
  return `fl:search:${term.trim().toLowerCase()}`;
}

export function reviewsCacheKey(appId: string, platform: string): string {
  return `fl:reviews:${platform}:${appId}`;
}

export function rateLimitKey(identifier: string, model: string): string {
  return `fl:rl:${model}:${identifier}`;
}

export function analysisProgressKey(analysisId: string): string {
  return `fl:progress:${analysisId}`;
}

export function analysisDedupeKey(appName: string, hash: string): string {
  return `fl:dedupe:${hash}`;
}

export function redditSearchCacheKey(appName: string, subreddit?: string): string {
  const sub = subreddit ? subreddit.trim().toLowerCase() : "all";
  return `fl:reddit:search:${sub}:${appName.trim().toLowerCase()}`;
}

export function redditReviewsCacheKey(appName: string, subreddit?: string): string {
  const sub = subreddit ? subreddit.trim().toLowerCase() : "all";
  return `fl:reddit:reviews:${sub}:${appName.trim().toLowerCase()}`;
}
