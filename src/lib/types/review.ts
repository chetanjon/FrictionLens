export type ParsedReview = {
  content: string;
  rating?: number;
  author?: string;
  date?: string;
  platform?: string;
  version?: string;
};

export type ReviewAnalysis = {
  love_score: number;
  frustration_score: number;
  loyalty_score: number;
  momentum_score: number;
  wom_score: number;
  churn_risk: "Critical" | "High" | "Medium" | "Low";
  features_mentioned: Array<{
    feature: string;
    sentiment: "positive" | "negative" | "neutral";
    severity: number;
  }>;
  churn_phrases: string[];
  summary: string;
};

export type FrictionItem = {
  feature: string;
  score: number;
  mentions: number;
  trend: "rising" | "stable" | "falling";
  delta: string;
};

export type ChurnDriver = {
  theme: string;
  count: number;
  severity: "Critical" | "High" | "Medium" | "Low";
  quotes: string[];
};

export type ReleaseImpact = {
  version: string;
  date: string;
  grade: string;
  sentiment_delta: number;
  new_themes: string[];
  review_velocity: string;
};

export type ActionItem = {
  title: string;
  description: string;
  impact: "Critical" | "High" | "Medium" | "Low";
  priority: "P0" | "P1" | "P2" | "P3";
  effort: "Low" | "Medium" | "High";
};

export type VibeReport = {
  app_name: string;
  platform?: string;
  review_count: number;
  summary: string;
  vibe_score: number;
  dimension_scores: {
    love: number;
    frustration: number;
    loyalty: number;
    momentum: number;
    wom: number;
  };
  friction_scores: FrictionItem[];
  churn_drivers: ChurnDriver[];
  release_impact?: ReleaseImpact;
  action_items: ActionItem[];
};

export type AnalysisResult = {
  vibe_score: number;
  dimension_scores: {
    love: number;
    frustration: number;
    loyalty: number;
    momentum: number;
    wom: number;
  };
  friction_scores: Array<{
    feature: string;
    score: number;
    trend: "rising" | "stable" | "falling";
    mention_count: number;
    delta: string;
  }>;
  churn_drivers: Array<{
    theme: string;
    count: number;
    severity: "Critical" | "High" | "Medium" | "Low";
    quotes: string[];
  }>;
  action_items: Array<{
    title: string;
    description: string;
    impact: "Critical" | "High" | "Medium" | "Low";
    priority: "P0" | "P1" | "P2" | "P3";
    effort: "Low" | "Medium" | "High";
  }>;
  release_impact?: ReleaseImpact;
  review_count: number;
  summary: string;
};
