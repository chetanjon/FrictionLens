"use client";

import { useState, useCallback, useTransition } from "react";
import { ClipboardPaste, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { ParsedReview } from "@/lib/types/review";
import { parseReviewsAction } from "@/app/dashboard/parse-reviews-action";

const MAX_TEXT_BYTES = 5 * 1024 * 1024;

function looksLikeCsv(text: string): boolean {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return false;
  const commaCountFirst = (lines[0].match(/,/g) || []).length;
  if (commaCountFirst === 0) return false;
  let matches = 0;
  const sample = Math.min(lines.length - 1, 9);
  for (let i = 1; i <= sample; i++) {
    const count = (lines[i].match(/,/g) || []).length;
    if (Math.abs(count - commaCountFirst) <= 1) matches++;
  }
  return matches / sample >= 0.5;
}

// Lightweight client-side estimate so users see live feedback while typing
// — the real parse happens on submit, server-side.
function estimateReviewCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const lines = trimmed.split("\n").filter((l) => l.trim().length > 0);
  // For CSV, the first line is the header.
  return looksLikeCsv(text) ? Math.max(lines.length - 1, 0) : lines.length;
}

type PasteInputProps = {
  onReviewsParsed: (reviews: ParsedReview[]) => void;
  disabled?: boolean;
};

export function PasteInput({ onReviewsParsed, disabled = false }: PasteInputProps) {
  const [text, setText] = useState("");
  const [estimatedCount, setEstimatedCount] = useState(0);
  const [formatLabel, setFormatLabel] = useState<"csv" | "plain" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setText(value);
      setError(null);

      if (!value.trim()) {
        setEstimatedCount(0);
        setFormatLabel(null);
        return;
      }

      setEstimatedCount(estimateReviewCount(value));
      setFormatLabel(looksLikeCsv(value) ? "csv" : "plain");
    },
    []
  );

  const handleSubmit = useCallback(() => {
    const value = text;
    if (!value.trim()) return;

    if (new TextEncoder().encode(value).byteLength > MAX_TEXT_BYTES) {
      setError("Pasted text exceeds 5MB limit.");
      return;
    }

    startTransition(async () => {
      const result = await parseReviewsAction(value);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onReviewsParsed(result.reviews);
    });
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
          disabled={disabled}
          placeholder={`Paste reviews here...\n\nSupported formats:\n- CSV with headers (content, rating, date, etc.)\n- One review per line (plain text)`}
          className="min-h-[200px] font-mono text-sm"
        />

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {estimatedCount > 0 && (
              <>
                <Badge variant="secondary">
                  ~{estimatedCount} review{estimatedCount !== 1 ? "s" : ""}
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
            disabled={estimatedCount === 0 || isPending || disabled}
          >
            {isPending
              ? "Parsing..."
              : `Use ${estimatedCount} review${estimatedCount !== 1 ? "s" : ""}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
