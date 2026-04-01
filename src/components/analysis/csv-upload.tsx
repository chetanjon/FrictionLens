"use client";

import { useState, useRef, useCallback } from "react";
import Papa from "papaparse";
import { Upload, FileText, X, AlertCircle, CheckCircle2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { ParsedReview } from "@/lib/types/review";

const CONTENT_COLUMNS = ["review", "text", "body", "content", "comment"];
const RATING_COLUMNS = ["rating", "score", "stars"];
const DATE_COLUMNS = ["date", "review_date", "created", "timestamp"];
const AUTHOR_COLUMNS = ["author", "user", "username", "name"];
const VERSION_COLUMNS = ["version", "app_version"];
const PLATFORM_COLUMNS = ["platform"];

type ColumnMapping = {
  content: string | null;
  rating: string | null;
  date: string | null;
  author: string | null;
  version: string | null;
  platform: string | null;
};

function detectColumnMapping(headers: string[]): ColumnMapping {
  const lower = headers.map((h) => h.toLowerCase().trim());

  function findMatch(candidates: string[]): string | null {
    for (const candidate of candidates) {
      const idx = lower.indexOf(candidate);
      if (idx !== -1) return headers[idx];
    }
    return null;
  }

  return {
    content: findMatch(CONTENT_COLUMNS),
    rating: findMatch(RATING_COLUMNS),
    date: findMatch(DATE_COLUMNS),
    author: findMatch(AUTHOR_COLUMNS),
    version: findMatch(VERSION_COLUMNS),
    platform: findMatch(PLATFORM_COLUMNS),
  };
}

function mapRowToReview(
  row: Record<string, string>,
  mapping: ColumnMapping
): ParsedReview | null {
  const content = mapping.content ? row[mapping.content]?.trim() : null;
  if (!content) return null;

  const rating = mapping.rating
    ? parseFloat(row[mapping.rating])
    : undefined;

  return {
    content,
    rating: rating && !isNaN(rating) ? rating : undefined,
    date: mapping.date ? row[mapping.date]?.trim() || undefined : undefined,
    author: mapping.author
      ? row[mapping.author]?.trim() || undefined
      : undefined,
    version: mapping.version
      ? row[mapping.version]?.trim() || undefined
      : undefined,
    platform: mapping.platform
      ? row[mapping.platform]?.trim() || undefined
      : undefined,
  };
}

type CsvUploadProps = {
  onReviewsParsed: (reviews: ParsedReview[]) => void;
};

export function CsvUpload({ onReviewsParsed }: CsvUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [previewRows, setPreviewRows] = useState<ParsedReview[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [allReviews, setAllReviews] = useState<ParsedReview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setFileName(null);
    setError(null);
    setMapping(null);
    setPreviewRows([]);
    setTotalCount(0);
    setAllReviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const parseFile = useCallback(
    (file: File) => {
      reset();

      const validTypes = [
        "text/csv",
        "text/plain",
        "application/vnd.ms-excel",
      ];
      const validExtensions = [".csv", ".txt"];
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

      if (!validTypes.includes(file.type) && !validExtensions.includes(ext)) {
        setError("Invalid file type. Please upload a .csv or .txt file.");
        return;
      }

      setFileName(file.name);

      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0 && results.data.length === 0) {
            setError(
              `Failed to parse CSV: ${results.errors[0].message}`
            );
            return;
          }

          const headers = results.meta.fields;
          if (!headers || headers.length === 0) {
            setError("No columns detected in the file.");
            return;
          }

          const detectedMapping = detectColumnMapping(headers);

          if (!detectedMapping.content) {
            setError(
              `Could not detect a review content column. Found columns: ${headers.join(", ")}. Expected one of: ${CONTENT_COLUMNS.join(", ")}`
            );
            return;
          }

          setMapping(detectedMapping);

          const reviews = results.data
            .map((row) => mapRowToReview(row, detectedMapping))
            .filter((r): r is ParsedReview => r !== null);

          if (reviews.length === 0) {
            setError("No valid reviews found in the file.");
            return;
          }

          setAllReviews(reviews);
          setPreviewRows(reviews.slice(0, 5));
          setTotalCount(reviews.length);
        },
        error: (err) => {
          setError(`Failed to read file: ${err.message}`);
        },
      });
    },
    [reset]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) parseFile(file);
    },
    [parseFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) parseFile(file);
    },
    [parseFile]
  );

  const handleConfirm = useCallback(() => {
    onReviewsParsed(allReviews);
  }, [allReviews, onReviewsParsed]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="size-4 text-[#4A90D9]" />
          Upload CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all",
            isDragOver
              ? "border-[#4A90D9] bg-[#4A90D9]/5"
              : "border-gray-200 hover:border-[#4A90D9]/50 hover:bg-gray-50",
            fileName && !error && "border-emerald-300 bg-emerald-50/50"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          {fileName && !error ? (
            <>
              <FileText className="size-8 text-emerald-500" />
              <div className="text-center">
                <p className="font-medium text-foreground">{fileName}</p>
                <p className="text-sm text-muted-foreground">
                  {totalCount} reviews detected
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
              >
                <X className="size-3" />
                Remove
              </Button>
            </>
          ) : (
            <>
              <Upload
                className={cn(
                  "size-8",
                  isDragOver ? "text-[#4A90D9]" : "text-gray-500"
                )}
              />
              <div className="text-center">
                <p className="font-medium text-foreground">
                  Drop your CSV here or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports .csv and .txt files
                </p>
              </div>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Column mapping preview */}
        {mapping && !error && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Column Mapping
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                Object.entries(mapping) as [keyof ColumnMapping, string | null][]
              ).map(([field, column]) => (
                <Badge
                  key={field}
                  variant={column ? "secondary" : "outline"}
                  className={cn(!column && "opacity-50")}
                >
                  {column ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="size-3 text-emerald-500" />
                      {field} &larr; {column}
                    </span>
                  ) : (
                    <span>{field}: not found</span>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Preview table */}
        {previewRows.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Preview (first 5 rows)
            </p>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Content</TableHead>
                    {mapping?.rating && <TableHead>Rating</TableHead>}
                    {mapping?.date && <TableHead>Date</TableHead>}
                    {mapping?.author && <TableHead>Author</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground">
                        {i + 1}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {row.content.length > 80
                          ? `${row.content.slice(0, 80)}...`
                          : row.content}
                      </TableCell>
                      {mapping?.rating && (
                        <TableCell>
                          {row.rating !== undefined ? row.rating : "-"}
                        </TableCell>
                      )}
                      {mapping?.date && (
                        <TableCell>{row.date ?? "-"}</TableCell>
                      )}
                      {mapping?.author && (
                        <TableCell>{row.author ?? "-"}</TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Confirm button */}
        {allReviews.length > 0 && (
          <Button onClick={handleConfirm} className="w-full">
            Use {totalCount} reviews
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
