/**
 * Hard-coded sample report used by /demo so visitors can experience the
 * Vibe Report layout without signing up. Numbers and quotes are fabricated
 * but written in the voice of real users so the demo feels familiar — kept
 * deliberately plain-English (no industry jargon) so the output reads like
 * what a normal user would actually type.
 */

import type {
  AnalysisResult,
  FrictionItem,
  ChurnDriver,
  ActionItem,
  ReleaseImpact,
} from "@/lib/types/review";

export type DemoCompetitor = {
  name: string;
  platform: string;
  vibe_score: number;
  review_count: number;
  dimension_scores: {
    love: number;
    frustration: number;
    loyalty: number;
    momentum: number;
    wom: number;
  };
};

export type DemoReviewRow = {
  id: string;
  content: string;
  rating: number | null;
  review_date: string | null;
  love_score: number | null;
  frustration_score: number | null;
  loyalty_score: number | null;
  momentum_score: number | null;
  wom_score: number | null;
  churn_risk: string | null;
  summary: string | null;
};

export type DemoAnalysis = {
  id: string;
  app_name: string;
  platform: string | null;
  status: string;
  vibe_score: number;
  review_count: number;
  results: AnalysisResult;
  dimension_scores: AnalysisResult["dimension_scores"];
  friction_scores: FrictionItem[];
  churn_drivers: ChurnDriver[];
  action_items: ActionItem[];
  competitors: DemoCompetitor[];
  release_impact: ReleaseImpact;
  created_at: string;
  completed_at: string;
  is_public: boolean;
  slug: string;
};

const APP_NAME = "Spotify";
const PLATFORM = "ios";
const REVIEW_COUNT = 612;

const dimensionScores = {
  love: 7.8,
  frustration: 6.4,
  loyalty: 7.6,
  momentum: 4.5,
  wom: 6.8,
};

const vibeScore = Math.round(
  ((dimensionScores.love * 0.25 +
    (10 - dimensionScores.frustration) * 0.25 +
    dimensionScores.loyalty * 0.2 +
    dimensionScores.momentum * 0.15 +
    dimensionScores.wom * 0.15) *
    10) *
    10
) / 10;

const frictionScores: FrictionItem[] = [
  { feature: "too many ads", score: 8.7, mentions: 142, trend: "rising", delta: "+18%" },
  { feature: "shuffle plays the same songs", score: 8.1, mentions: 98, trend: "rising", delta: "+12%" },
  { feature: "price went up", score: 7.4, mentions: 81, trend: "rising", delta: "+24%" },
  { feature: "podcast recommendations", score: 6.9, mentions: 64, trend: "stable", delta: "+3%" },
  { feature: "downloaded songs disappearing", score: 6.6, mentions: 47, trend: "rising", delta: "+9%" },
  { feature: "discover weekly is worse", score: 6.2, mentions: 53, trend: "rising", delta: "+15%" },
  { feature: "lyrics out of sync", score: 5.4, mentions: 38, trend: "stable", delta: "+1%" },
  { feature: "audio quality on free tier", score: 4.8, mentions: 29, trend: "falling", delta: "-4%" },
];

const churnDrivers: ChurnDriver[] = [
  {
    theme: "switching to Apple Music",
    count: 56,
    severity: "Critical",
    quotes: [
      "Too many ads. Switching to Apple Music — at least there my downloads stay downloaded.",
      "After the price hike I am out. Apple Music it is.",
      "Cancelled today. The shuffle is broken and Apple Music is the same price now.",
    ],
  },
  {
    theme: "ads on free tier are unbearable",
    count: 41,
    severity: "Critical",
    quotes: [
      "I get an ad every two songs and they are LOUDER than the music. This is unusable.",
      "Listened to a 30 second ad for car insurance three times in a row. Why?",
      "Free tier used to be fine. Now it is just an ad app with some songs.",
    ],
  },
  {
    theme: "shuffle is not random",
    count: 28,
    severity: "High",
    quotes: [
      "I have 2,000 songs in my liked list and shuffle plays the same 30 over and over. Please fix.",
      "Shuffle is just not shuffle. It plays my most-listened songs every time.",
    ],
  },
  {
    theme: "downloads disappear",
    count: 19,
    severity: "Medium",
    quotes: [
      "Went on a flight, opened my downloaded playlist, half the songs were gone with no internet.",
      "Pay for premium so I can have offline music. Downloads vanish every couple of weeks.",
    ],
  },
];

const actionItems: ActionItem[] = [
  {
    title: "Fix the shuffle button",
    description:
      "Make shuffle actually random instead of replaying the user's most-played songs. This complaint shows up in almost every 3-star or lower review.",
    impact: "Critical",
    priority: "P0",
    effort: "Medium",
  },
  {
    title: "Cut ad frequency on the free tier",
    description:
      "Free users say ads are louder and more frequent than the music. Drop to one ad every 4-5 songs and match ad volume to song volume.",
    impact: "Critical",
    priority: "P0",
    effort: "Low",
  },
  {
    title: "Stop downloads from disappearing",
    description:
      "Premium users are losing their offline songs every couple of weeks. Look at the auto-cleanup logic and add a 'these were removed' notice instead of silently deleting.",
    impact: "High",
    priority: "P1",
    effort: "Medium",
  },
  {
    title: "Bring back the old Discover Weekly",
    description:
      "Users say recommendations have gotten worse and play the same songs they already listen to. Test a 'more variety' toggle.",
    impact: "Medium",
    priority: "P1",
    effort: "Low",
  },
];

const releaseImpact: ReleaseImpact = {
  version: "8.10.0",
  date: "2026-04-05",
  grade: "C",
  sentiment_delta: -8,
  new_themes: ["new home page", "video-first feed"],
  review_velocity: "+38%",
};

const competitors: DemoCompetitor[] = [
  {
    name: "Apple Music",
    platform: "ios",
    vibe_score: 78.4,
    review_count: 1842,
    dimension_scores: { love: 8.0, frustration: 4.8, loyalty: 8.1, momentum: 7.0, wom: 7.6 },
  },
  {
    name: "YouTube Music",
    platform: "ios",
    vibe_score: 69.5,
    review_count: 1356,
    dimension_scores: { love: 7.2, frustration: 5.4, loyalty: 6.9, momentum: 6.1, wom: 6.8 },
  },
  {
    name: "Amazon Music",
    platform: "ios",
    vibe_score: 64.8,
    review_count: 921,
    dimension_scores: { love: 6.8, frustration: 5.9, loyalty: 6.4, momentum: 5.2, wom: 6.0 },
  },
];

const summary =
  "Spotify users love their playlists and library, but a lot of them are upset about three things: too many ads, a shuffle button that keeps replaying the same songs, and the recent price increase. Free-tier users are the most likely to leave, especially toward Apple Music.";

const aggregateResult: AnalysisResult = {
  vibe_score: vibeScore,
  dimension_scores: dimensionScores,
  friction_scores: frictionScores.map((f) => ({
    feature: f.feature,
    score: f.score,
    trend: f.trend,
    mention_count: f.mentions,
    delta: f.delta,
  })),
  churn_drivers: churnDrivers,
  action_items: actionItems,
  release_impact: releaseImpact,
  review_count: REVIEW_COUNT,
  summary,
};

const sampleReviews: DemoReviewRow[] = [
  {
    id: "r1",
    content:
      "Too many ads. I get a 30 second ad every two songs and they are louder than the music. Switching to Apple Music — at least there my downloads stay downloaded.",
    rating: 1,
    review_date: "2026-04-13",
    love_score: 3,
    frustration_score: 9,
    loyalty_score: 2,
    momentum_score: 3,
    wom_score: 2,
    churn_risk: "Critical",
    summary: "Free-tier user leaving over ad frequency.",
  },
  {
    id: "r2",
    content:
      "Love my Daylist and the wrapped at the end of the year. Have been a paying customer for 7 years and not going anywhere.",
    rating: 5,
    review_date: "2026-04-11",
    love_score: 9,
    frustration_score: 2,
    loyalty_score: 9,
    momentum_score: 7,
    wom_score: 9,
    churn_risk: "Low",
    summary: "Long-time paid user, loves Daylist and Wrapped.",
  },
  {
    id: "r3",
    content:
      "Why is shuffle not shuffle? I have 2,000 liked songs and it plays the same 30 every single day. This has been broken for years.",
    rating: 2,
    review_date: "2026-04-10",
    love_score: 4,
    frustration_score: 8,
    loyalty_score: 5,
    momentum_score: 4,
    wom_score: 3,
    churn_risk: "High",
    summary: "Shuffle is not random — long-standing complaint.",
  },
  {
    id: "r4",
    content:
      "After the price hike I am out. Apple Music is the same price now and Apple Music gives you lossless. Cancelled today.",
    rating: 1,
    review_date: "2026-04-09",
    love_score: 4,
    frustration_score: 8,
    loyalty_score: 1,
    momentum_score: 3,
    wom_score: 2,
    churn_risk: "Critical",
    summary: "Cancelled premium after price increase, switched to Apple Music.",
  },
  {
    id: "r5",
    content:
      "Went on a flight last week, opened my downloaded playlist, half the songs were gone. I pay for premium SO that I can have offline music.",
    rating: 2,
    review_date: "2026-04-07",
    love_score: 5,
    frustration_score: 8,
    loyalty_score: 4,
    momentum_score: 4,
    wom_score: 3,
    churn_risk: "High",
    summary: "Downloaded songs disappear without warning.",
  },
  {
    id: "r6",
    content:
      "AI DJ is actually really good. Best new feature in years. The voice is a little weird but the picks are spot on.",
    rating: 5,
    review_date: "2026-04-06",
    love_score: 8,
    frustration_score: 2,
    loyalty_score: 7,
    momentum_score: 8,
    wom_score: 8,
    churn_risk: "Low",
    summary: "Loves the AI DJ feature.",
  },
  {
    id: "r7",
    content:
      "The new home page is pushing me video clips and reels. I am here for music. Why does every app want to be TikTok now.",
    rating: 2,
    review_date: "2026-04-05",
    love_score: 5,
    frustration_score: 7,
    loyalty_score: 6,
    momentum_score: 3,
    wom_score: 4,
    churn_risk: "Medium",
    summary: "Dislikes the video-first home page redesign.",
  },
  {
    id: "r8",
    content:
      "Discover Weekly used to introduce me to new music every Monday. Now it just plays songs I already liked. Bring back the old version please.",
    rating: 3,
    review_date: "2026-04-03",
    love_score: 6,
    frustration_score: 6,
    loyalty_score: 6,
    momentum_score: 4,
    wom_score: 5,
    churn_risk: "Medium",
    summary: "Recommendations getting worse, repeats already-liked songs.",
  },
];

export const SAMPLE_REPORT: DemoAnalysis = {
  id: "demo-spotify",
  app_name: APP_NAME,
  platform: PLATFORM,
  status: "completed",
  vibe_score: vibeScore,
  review_count: REVIEW_COUNT,
  results: aggregateResult,
  dimension_scores: dimensionScores,
  friction_scores: frictionScores,
  churn_drivers: churnDrivers,
  action_items: actionItems,
  competitors,
  release_impact: releaseImpact,
  created_at: "2026-04-15T18:30:00Z",
  completed_at: "2026-04-15T18:46:00Z",
  is_public: true,
  slug: "demo-spotify",
};

export const SAMPLE_REVIEWS: DemoReviewRow[] = sampleReviews;
