"use client";

import { useState, useRef, useCallback, useTransition } from "react";
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
import type { ColumnMapping } from "@/lib/csv/parse-reviews";
import { parseReviewsAction } from "@/app/dashboard/parse-reviews-action";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

type CsvUploadProps = {
  onReviewsParsed: (reviews: ParsedReview[]) => void;
  disabled?: boolean;
};

export function CsvUpload({ onReviewsParsed, disabled = false }: CsvUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [previewRows, setPreviewRows] = useState<ParsedReview[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [allReviews, setAllReviews] = useState<ParsedReview[]>([]);
  const [isPending, startTransition] = useTransition();
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

      if (file.size > MAX_FILE_BYTES) {
        setError("File too large. Limit is 5MB.");
        return;
      }

      setFileName(file.name);

      startTransition(async () => {
        try {
          const text = await file.text();
          const result = await parseReviewsAction(text);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setMapping(result.mapping);
          setAllReviews(result.reviews);
          setPreviewRows(result.reviews.slice(0, 5));
          setTotalCount(result.totalCount);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to read file."
          );
        }
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
          onDrop={disabled ? undefined : handleDrop}
          onDragOver={disabled ? undefined : handleDragOver}
          onDragLeave={disabled ? undefined : handleDragLeave}
          onClick={() => {
            if (disabled) return;
            fileInputRef.current?.click();
          }}
          aria-disabled={disabled || undefined}
          className={cn(
            "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all",
            disabled
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer",
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
            disabled={disabled}
            className="hidden"
          />

          {fileName && !error ? (
            <>
              <FileText className="size-8 text-emerald-500" />
              <div className="text-center">
                <p className="font-medium text-foreground">{fileName}</p>
                <p className="text-sm text-muted-foreground">
                  {isPending
                    ? "Parsing..."
                    : `${totalCount} reviews detected`}
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
                  Supports .csv and .txt files (5MB max)
                </p>
              </div>
            </>
          )}
        </div>

        {/* Format hint — shown only when no file is loaded so first-time
            users know what columns FrictionLens looks for. */}
        {!fileName && !error && (
          <div className="rounded-lg border border-slate-200/60 bg-slate-50/50 px-3 py-2.5 text-xs text-slate-500">
            <span className="font-medium text-slate-600">Expected columns:</span>{" "}
            <code className="font-mono text-[11px] text-slate-700">
              review
            </code>
            ,{" "}
            <code className="font-mono text-[11px] text-slate-700">
              rating
            </code>
            ,{" "}
            <code className="font-mono text-[11px] text-slate-700">date</code>{" "}
            <span className="text-slate-400">(only </span>
            <code className="font-mono text-[11px] text-slate-700">review</code>
            <span className="text-slate-400">
              {" "}
              is required; we accept aliases like{" "}
            </span>
            <code className="font-mono text-[11px] text-slate-700">text</code>
            <span className="text-slate-400">, </span>
            <code className="font-mono text-[11px] text-slate-700">body</code>
            <span className="text-slate-400">, </span>
            <code className="font-mono text-[11px] text-slate-700">
              comment
            </code>
            <span className="text-slate-400">)</span>
          </div>
        )}

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
          <Button
            onClick={handleConfirm}
            className="w-full"
            disabled={isPending || disabled}
          >
            Use {totalCount} reviews
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
