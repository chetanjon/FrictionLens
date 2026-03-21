"use client";

import { useState, useCallback } from "react";
import Papa from "papaparse";
import { ClipboardPaste } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { ParsedReview } from "@/lib/types/review";

const CONTENT_COLUMNS = ["review", "text", "body", "content", "comment"];
const RATING_COLUMNS = ["rating", "score", "stars"];
const DATE_COLUMNS = ["date", "review_date", "created", "timestamp"];
const AUTHOR_COLUMNS = ["author", "user", "username", "name"];
const VERSION_COLUMNS = ["version", "app_version"];
const PLATFORM_COLUMNS = ["platform"];

function looksLikeCsv(text: string): boolean {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return false;

  const commaCountFirst = (lines[0].match(/,/g) || []).length;
  if (commaCountFirst === 0) return false;

  // Check that at least 50% of lines have a similar comma count
  let matches = 0;
  for (let i = 1; i < Math.min(lines.length, 10); i++) {
    const count = (lines[i].match(/,/g) || []).length;
    if (Math.abs(count - commaCountFirst) <= 1) matches++;
  }

  return matches / Math.min(lines.length - 1, 9) >= 0.5;
}

function parseCsvText(text: string): ParsedReview[] {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  if (!result.meta.fields || result.data.length === 0) return [];

  const headers = result.meta.fields;
  const lower = headers.map((h) => h.toLowerCase().trim());

  function findMatch(candidates: string[]): string | null {
    for (const c of candidates) {
      const idx = lower.indexOf(c);
      if (idx !== -1) return headers[idx];
    }
    return null;
  }

  const contentCol = findMatch(CONTENT_COLUMNS);
  if (!contentCol) return [];

  const ratingCol = findMatch(RATING_COLUMNS);
  const dateCol = findMatch(DATE_COLUMNS);
  const authorCol = findMatch(AUTHOR_COLUMNS);
  const versionCol = findMatch(VERSION_COLUMNS);
  const platformCol = findMatch(PLATFORM_COLUMNS);

  const reviews: ParsedReview[] = [];

  for (const row of result.data) {
    const content = row[contentCol]?.trim();
    if (!content) continue;

    const rating = ratingCol ? parseFloat(row[ratingCol]) : undefined;

    const review: ParsedReview = { content };
    if (rating && !isNaN(rating)) review.rating = rating;
    if (dateCol && row[dateCol]?.trim()) review.date = row[dateCol].trim();
    if (authorCol && row[authorCol]?.trim()) review.author = row[authorCol].trim();
    if (versionCol && row[versionCol]?.trim()) review.version = row[versionCol].trim();
    if (platformCol && row[platformCol]?.trim()) review.platform = row[platformCol].trim();

    reviews.push(review);
  }

  return reviews;
}

function parsePlainText(text: string): ParsedReview[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => ({ content: line }));
}

type PasteInputProps = {
  onReviewsParsed: (reviews: ParsedReview[]) => void;
};

export function PasteInput({ onReviewsParsed }: PasteInputProps) {
  const [text, setText] = useState("");
  const [detectedCount, setDetectedCount] = useState(0);
  const [formatLabel, setFormatLabel] = useState<"csv" | "plain" | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setText(value);

      if (!value.trim()) {
        setDetectedCount(0);
        setFormatLabel(null);
        return;
      }

      if (looksLikeCsv(value)) {
        const reviews = parseCsvText(value);
        setDetectedCount(reviews.length);
        setFormatLabel("csv");
      } else {
        const reviews = parsePlainText(value);
        setDetectedCount(reviews.length);
        setFormatLabel("plain");
      }
    },
    []
  );

  const handleSubmit = useCallback(() => {
    if (!text.trim()) return;

    const reviews = looksLikeCsv(text)
      ? parseCsvText(text)
      : parsePlainText(text);

    if (reviews.length > 0) {
      onReviewsParsed(reviews);
    }
  }, [text, onReviewsParsed]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardPaste className="size-4 text-[#4A90D9]" />
          Paste Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={text}
          onChange={handleChange}
          placeholder={`Paste reviews here...\n\nSupported formats:\n- CSV with headers (content, rating, date, etc.)\n- One review per line (plain text)`}
          className="min-h-[200px] font-mono text-sm"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {detectedCount > 0 && (
              <>
                <Badge variant="secondary">
                  {detectedCount} review{detectedCount !== 1 ? "s" : ""}{" "}
                  detected
                </Badge>
                {formatLabel && (
                  <Badge variant="outline">
                    {formatLabel === "csv" ? "CSV format" : "Plain text"}
                  </Badge>
                )}
              </>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={detectedCount === 0}
          >
            Use {detectedCount} review{detectedCount !== 1 ? "s" : ""}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
