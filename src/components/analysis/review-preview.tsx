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
      <span className="ml-1 text-xs text-gray-500">{rating}</span>
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
    <div className="rounded-2xl border border-slate-200/60 bg-white/65 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Parsed Reviews</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200 text-xs">
            {reviews.length} total
          </Badge>
          {onClear && (
            <Button variant="ghost" size="sm" onClick={onClear} className="text-gray-500 hover:text-gray-600 h-7 px-2">
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
            <tr className="border-b border-gray-200">
              <th className="w-10 px-4 py-2.5 text-left text-xs font-medium text-gray-500">#</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Content</th>
              {hasRatings && <th className="w-28 px-4 py-2.5 text-left text-xs font-medium text-gray-500">Rating</th>}
              {hasDates && <th className="w-28 px-4 py-2.5 text-left text-xs font-medium text-gray-500">Date</th>}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((review, i) => (
              <tr key={i} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-2.5 text-gray-500">{i + 1}</td>
                <td className="px-4 py-2.5 max-w-md">
                  <span className="line-clamp-2 text-sm text-gray-600">
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
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                )}
                {hasDates && (
                  <td className="px-4 py-2.5 text-sm text-gray-500">
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
        <div className="px-5 py-3 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            Showing 10 of {reviews.length} reviews
          </p>
        </div>
      )}
    </div>
  );
}
