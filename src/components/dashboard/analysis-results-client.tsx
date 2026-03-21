"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Flame,
  Shield,
  TrendingUp,
  Megaphone,
  AlertTriangle,
  Star,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { vibeColor, scoreColor, severityColor } from "@/lib/constants";
import type { AnalysisResult } from "@/lib/types/review";

type ReviewRow = {
  id: string;
  content: string;
  rating: number | null;
  author: string | null;
  review_date: string | null;
  love_score: number | null;
  frustration_score: number | null;
  loyalty_score: number | null;
  momentum_score: number | null;
  wom_score: number | null;
  churn_risk: string | null;
  summary: string | null;
};

type AnalysisProps = {
  id: string;
  appName: string;
  platform: string | null;
  reviewCount: number;
  vibeScore: number;
  vibeHex: string;
  createdAt: string;
  completedAt: string | null;
  results: AnalysisResult | null;
};

const DIMENSION_CONFIG = [
  {
    key: "love" as const,
    label: "Love",
    icon: Heart,
    description: "How much users adore and enjoy the app",
    color: "#E8457C",
  },
  {
    key: "frustration" as const,
    label: "Frustration",
    icon: Flame,
    description: "Level of user pain points and friction",
    color: "#D94F4F",
  },
  {
    key: "loyalty" as const,
    label: "Loyalty",
    icon: Shield,
    description: "How likely users are to stick around",
    color: "#4A90D9",
  },
  {
    key: "momentum" as const,
    label: "Momentum",
    icon: TrendingUp,
    description: "Whether the app is improving or declining",
    color: "#D4A843",
  },
  {
    key: "wom" as const,
    label: "Word-of-Mouth",
    icon: Megaphone,
    description: "How likely users are to recommend the app",
    color: "#6B5CE7",
  },
];

const STAR_FILTERS = ["All", "1", "2", "3", "4", "5"] as const;

export function AnalysisResultsClient({
  analysis,
  reviews,
}: {
  analysis: AnalysisProps;
  reviews: ReviewRow[];
}) {
  const [starFilter, setStarFilter] = useState<string>("All");

  const results = analysis.results;
  const dimensions = results?.dimension_scores;

  const filteredReviews =
    starFilter === "All"
      ? reviews
      : reviews.filter((r) => r.rating === parseInt(starFilter));

  // Compute top friction feature
  const topFriction = results?.friction_scores?.[0];

  // Compute churn risk percentage
  const churnRiskCount = reviews.filter(
    (r) => r.churn_risk === "Critical" || r.churn_risk === "High"
  ).length;
  const churnRiskPct =
    reviews.length > 0 ? Math.round((churnRiskCount / reviews.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {analysis.appName}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            {analysis.platform && analysis.platform !== "unknown" && (
              <span className="capitalize">{analysis.platform}</span>
            )}
            <span>{analysis.reviewCount} reviews</span>
            <span>
              {new Date(analysis.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Large Vibe Score circle */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full shadow-lg"
            style={{
              backgroundColor: analysis.vibeHex,
              boxShadow: `0 8px 30px ${analysis.vibeHex}33`,
            }}
          >
            <span className="font-mono text-2xl font-bold text-white">
              {Math.round(analysis.vibeScore)}
            </span>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Vibe Score
            </p>
            <p className="text-sm text-slate-600">out of 100</p>
          </div>
        </div>
      </header>

      {/* Stat Cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Vibe Score"
          value={Math.round(analysis.vibeScore).toString()}
          sublabel="/ 100"
          color={analysis.vibeHex}
        />
        <StatCard
          label="Total Reviews"
          value={analysis.reviewCount.toString()}
          sublabel="analyzed"
        />
        <StatCard
          label="Top Friction"
          value={topFriction?.feature ?? "None"}
          sublabel={
            topFriction ? `Score: ${topFriction.score}/10` : "No friction detected"
          }
          color={topFriction ? scoreColor(topFriction.score) : undefined}
        />
        <StatCard
          label="Churn Risk"
          value={`${churnRiskPct}%`}
          sublabel="Critical + High"
          color={churnRiskPct > 30 ? "#D94F4F" : churnRiskPct > 15 ? "#D4A843" : "#4A90D9"}
        />
      </div>

      {/* Sentiment Dimensions */}
      {dimensions && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Sentiment Dimensions
          </h2>
          <div className="rounded-2xl border border-slate-200/60 bg-white/65 p-5 backdrop-blur-xl">
            <div className="space-y-4">
              {DIMENSION_CONFIG.map((dim) => {
                const score = dimensions[dim.key];
                return (
                  <div key={dim.key} className="flex items-center gap-4">
                    <div className="flex w-32 shrink-0 items-center gap-2 sm:w-40">
                      <dim.icon
                        className="h-4 w-4 shrink-0"
                        style={{ color: dim.color }}
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {dim.label}
                      </span>
                    </div>
                    <div className="flex flex-1 items-center gap-3">
                      <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                          style={{
                            width: `${(score / 10) * 100}%`,
                            backgroundColor: dim.color,
                          }}
                        />
                      </div>
                      <span
                        className="w-10 text-right font-mono text-sm font-semibold"
                        style={{ color: dim.color }}
                      >
                        {score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">
              {DIMENSION_CONFIG.map((dim) => (
                <p key={dim.key} className="text-xs text-slate-400">
                  <span className="font-medium text-slate-500">
                    {dim.label}:
                  </span>{" "}
                  {dim.description}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews Table */}
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Reviews</h2>
          <Tabs
            value={starFilter}
            onValueChange={setStarFilter}
            className="w-auto"
          >
            <TabsList className="h-8">
              {STAR_FILTERS.map((f) => (
                <TabsTrigger key={f} value={f} className="px-2.5 text-xs">
                  {f === "All" ? "All" : `${f}\u2605`}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/65 backdrop-blur-xl">
          {filteredReviews.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-400">
              No reviews match this filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100">
                    <TableHead className="w-20 text-xs">Rating</TableHead>
                    <TableHead className="text-xs">Content</TableHead>
                    <TableHead className="w-16 text-center text-xs">
                      Love
                    </TableHead>
                    <TableHead className="w-16 text-center text-xs">
                      Frust.
                    </TableHead>
                    <TableHead className="w-24 text-center text-xs">
                      Churn Risk
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map((review) => (
                    <TableRow key={review.id} className="border-slate-50">
                      <TableCell className="align-top">
                        <RatingStars rating={review.rating} />
                      </TableCell>
                      <TableCell className="max-w-xs align-top">
                        <p className="line-clamp-3 text-sm text-slate-700">
                          {review.content}
                        </p>
                      </TableCell>
                      <TableCell className="text-center align-top">
                        <span
                          className="font-mono text-sm font-medium"
                          style={{
                            color:
                              review.love_score != null
                                ? vibeColor(review.love_score * 10)
                                : "#94A3B8",
                          }}
                        >
                          {review.love_score ?? "-"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center align-top">
                        <span
                          className="font-mono text-sm font-medium"
                          style={{
                            color:
                              review.frustration_score != null
                                ? scoreColor(review.frustration_score)
                                : "#94A3B8",
                          }}
                        >
                          {review.frustration_score ?? "-"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center align-top">
                        <ChurnBadge risk={review.churn_risk} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {filteredReviews.length > 0 && (
          <p className="mt-3 text-center text-xs text-slate-400">
            Showing {filteredReviews.length} of {reviews.length} reviews
          </p>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sublabel,
  color,
}: {
  label: string;
  value: string;
  sublabel: string;
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/65 p-4 backdrop-blur-xl">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p
        className="mt-1.5 truncate font-mono text-xl font-bold"
        style={{ color: color ?? "#1e293b" }}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs text-slate-400">{sublabel}</p>
    </div>
  );
}

function RatingStars({ rating }: { rating: number | null }) {
  if (rating == null) {
    return <span className="text-xs text-slate-300">N/A</span>;
  }

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-100 text-slate-200"
          )}
        />
      ))}
    </div>
  );
}

function ChurnBadge({ risk }: { risk: string | null }) {
  if (!risk) return <span className="text-xs text-slate-300">-</span>;

  const colorHex = severityColor(risk);

  return (
    <Badge
      variant="secondary"
      className="text-[10px]"
      style={{
        backgroundColor: `${colorHex}15`,
        color: colorHex,
        borderColor: `${colorHex}30`,
      }}
    >
      {risk}
    </Badge>
  );
}
