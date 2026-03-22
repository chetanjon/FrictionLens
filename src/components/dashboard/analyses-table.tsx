"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, XCircle, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AnalysisRow = {
  id: string;
  app_name: string;
  platform: string | null;
  status: string;
  vibe_score: number | null;
  review_count: number;
  created_at: string;
  vibeColorHex: string | null;
};

type AnalysesTableProps = {
  analyses: AnalysisRow[];
};

export function AnalysesTable({ analyses }: AnalysesTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    let result = analyses;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((a) => a.app_name.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") {
      result = result.filter((a) => a.status === statusFilter);
    }
    return result;
  }, [analyses, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: analyses.length };
    for (const a of analyses) {
      counts[a.status] = (counts[a.status] ?? 0) + 1;
    }
    return counts;
  }, [analyses]);

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by app name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          {["all", "completed", "processing", "failed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === status
                  ? "bg-friction-blue/10 text-friction-blue"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
              {statusCounts[status] ? ` (${statusCounts[status]})` : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200/60 bg-white/65 backdrop-blur-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>App Name</TableHead>
              <TableHead className="hidden sm:table-cell">Platform</TableHead>
              <TableHead>Vibe Score</TableHead>
              <TableHead className="hidden sm:table-cell">Reviews</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-sm text-slate-400">
                  {search.trim() ? "No analyses match your search." : "No analyses yet."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((a) => (
                <TableRow key={a.id} className="group">
                  <TableCell>
                    <Link
                      href={`/dashboard/analysis/${a.id}`}
                      className="font-medium text-slate-900 hover:text-friction-blue"
                    >
                      {a.app_name}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-xs text-slate-500">
                      {a.platform ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {a.status === "completed" && a.vibe_score != null ? (
                      <span
                        className="font-mono text-sm font-semibold"
                        style={{ color: a.vibeColorHex ?? undefined }}
                      >
                        {Math.round(a.vibe_score)}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-sm text-slate-600">
                      {a.review_count.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={a.status} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-xs text-slate-400">
                      {new Date(a.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <Badge variant="secondary" className="gap-1 bg-green-50 text-green-700">
          <CheckCircle2 className="h-3 w-3" />
          Done
        </Badge>
      );
    case "processing":
      return (
        <Badge variant="secondary" className="gap-1 bg-blue-50 text-blue-700">
          <Loader2 className="h-3 w-3 animate-spin" />
          Processing
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Failed
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          {status}
        </Badge>
      );
  }
}
