"use client";

import { Star, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
          className="size-3.5 fill-[#D4A843] text-[#D4A843]"
        />
      ))}
      {hasHalf && (
        <span className="relative inline-block size-3.5">
          <Star className="absolute inset-0 size-3.5 text-slate-300" />
          <span className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
            <Star className="size-3.5 fill-[#D4A843] text-[#D4A843]" />
          </span>
        </span>
      )}
      {Array.from({ length: emptyStars }, (_, i) => (
        <Star key={`empty-${i}`} className="size-3.5 text-slate-300" />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{rating}</span>
    </span>
  );
}

type ReviewPreviewProps = {
  reviews: ParsedReview[];
  onClear: () => void;
};

export function ReviewPreview({ reviews, onClear }: ReviewPreviewProps) {
  const previewRows = reviews.slice(0, 10);
  const hasRatings = reviews.some((r) => r.rating !== undefined);
  const hasDates = reviews.some((r) => r.date !== undefined);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Parsed Reviews</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {reviews.length} total
            </Badge>
            <Button variant="ghost" size="sm" onClick={onClear}>
              <X className="size-3" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Content</TableHead>
                {hasRatings && <TableHead className="w-28">Rating</TableHead>}
                {hasDates && <TableHead className="w-28">Date</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewRows.map((review, i) => (
                <TableRow key={i}>
                  <TableCell className="text-muted-foreground">
                    {i + 1}
                  </TableCell>
                  <TableCell className="max-w-md">
                    <span className="line-clamp-2 text-sm">
                      {review.content.length > 80
                        ? `${review.content.slice(0, 80)}...`
                        : review.content}
                    </span>
                  </TableCell>
                  {hasRatings && (
                    <TableCell>
                      {review.rating !== undefined ? (
                        <StarRating rating={review.rating} />
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  )}
                  {hasDates && (
                    <TableCell className="text-sm text-muted-foreground">
                      {review.date ?? "-"}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {reviews.length > 10 && (
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Showing 10 of {reviews.length} reviews
          </p>
        )}
      </CardContent>
    </Card>
  );
}
