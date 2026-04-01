"use client";

import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ParsedReview } from "@/lib/types/review";

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: fullStars }, (_, i) => (
        <Star
          key={`full-${i}`}
          className="size-3.5 fill-[#C9B06A] text-[#C9B06A]"
        />
      ))}
      {hasHalf && (
        <span className="relative inline-block size-3.5">
          <Star className="absolute inset-0 size-3.5 text-slate-600" />
          <span className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
            <Star className="size-3.5 fill-[#C9B06A] text-[#C9B06A]" />
          </span>
        </span>
      )}
      {Array.from({ length: emptyStars }, (_, i) => (
        <Star key={`empty-${i}`} className="size-3.5 text-slate-600" />
      ))}
      <span className="ml-1 text-xs text-slate-400">{rating}</span>
    </span>
  );
}

type ReviewPreviewProps = {
  reviews: ParsedReview[];
  onClear?: () => void;
};

export function ReviewPreview({ reviews, onClear }: ReviewPreviewProps) {
  const previewRows = reviews.slice(0, 10);
  const hasRatings = reviews.some((r) => r.rating !== undefined);
  const hasDates = reviews.some((r) => r.date !== undefined);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white">Parsed Reviews</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-white/[0.06] text-slate-300 border-white/[0.08] text-xs">
            {reviews.length} total
          </Badge>
          {onClear && (
            <Button variant="ghost" size="sm" onClick={onClear} className="text-slate-400 hover:text-slate-300 h-7 px-2">
              <X className="size-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="w-10 px-4 py-2.5 text-left text-xs font-medium text-slate-500">#</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Content</th>
              {hasRatings && <th className="w-28 px-4 py-2.5 text-left text-xs font-medium text-slate-500">Rating</th>}
              {hasDates && <th className="w-28 px-4 py-2.5 text-left text-xs font-medium text-slate-500">Date</th>}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((review, i) => (
              <tr key={i} className="border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-2.5 text-slate-500">{i + 1}</td>
                <td className="px-4 py-2.5 max-w-md">
                  <span className="line-clamp-2 text-sm text-slate-300">
                    {review.content.length > 80
                      ? `${review.content.slice(0, 80)}...`
                      : review.content}
                  </span>
                </td>
                {hasRatings && (
                  <td className="px-4 py-2.5">
                    {review.rating !== undefined ? (
                      <StarRating rating={review.rating} />
                    ) : (
                      <span className="text-sm text-slate-500">-</span>
                    )}
                  </td>
                )}
                {hasDates && (
                  <td className="px-4 py-2.5 text-sm text-slate-500">
                    {review.date ? review.date.slice(0, 10) : "-"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {reviews.length > 10 && (
        <div className="px-5 py-3 border-t border-white/[0.06]">
          <p className="text-center text-xs text-slate-500">
            Showing 10 of {reviews.length} reviews
          </p>
        </div>
      )}
    </div>
  );
}
