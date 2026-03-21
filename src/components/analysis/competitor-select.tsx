"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  Search,
  Loader2,
  Smartphone,
  Star,
  Plus,
  X,
  Swords,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export type CompetitorApp = {
  appId: string;
  name: string;
  developer: string;
  icon: string;
  score: number | null;
  platform: "android" | "ios";
  storeId?: number;
};

type CompetitorSelectProps = {
  competitors: CompetitorApp[];
  onCompetitorsChange: (competitors: CompetitorApp[]) => void;
  disabled?: boolean;
  maxCompetitors?: number;
};

type AppResult = {
  appId: string;
  title: string;
  developer: string;
  icon: string;
  score: number | null;
  platform: "android" | "ios";
  storeId?: number;
};

export function CompetitorSelect({
  competitors,
  onCompetitorsChange,
  disabled,
  maxCompetitors = 3,
}: CompetitorSelectProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AppResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim() || disabled) return;
    setIsSearching(true);
    setResults([]);

    try {
      const res = await fetch(
        `/api/apps/search?q=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();
      if (res.ok) {
        setResults(data.results ?? []);
      }
    } catch {
      // Silently fail
    } finally {
      setIsSearching(false);
    }
  }, [query, disabled]);

  const addCompetitor = useCallback(
    (app: AppResult) => {
      if (competitors.length >= maxCompetitors) return;
      // Avoid duplicates
      const exists = competitors.some(
        (c) => c.appId === app.appId && c.platform === app.platform
      );
      if (exists) return;

      onCompetitorsChange([
        ...competitors,
        {
          appId: app.appId,
          name: app.title,
          developer: app.developer,
          icon: app.icon,
          score: app.score,
          platform: app.platform,
          storeId: app.storeId,
        },
      ]);
      setShowSearch(false);
      setQuery("");
      setResults([]);
    },
    [competitors, maxCompetitors, onCompetitorsChange]
  );

  const removeCompetitor = useCallback(
    (index: number) => {
      onCompetitorsChange(competitors.filter((_, i) => i !== index));
    },
    [competitors, onCompetitorsChange]
  );

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Swords className="h-4 w-4 text-friction-blue" />
          Competitor Vibe Battle
          <span className="text-xs font-normal text-slate-400">(optional)</span>
        </div>
        {competitors.length < maxCompetitors && !showSearch && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSearch(true)}
            disabled={disabled}
            className="text-xs text-friction-blue"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Competitor
          </Button>
        )}
      </div>

      {/* Selected competitors */}
      {competitors.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {competitors.map((comp, i) => (
            <div
              key={`${comp.platform}-${comp.appId}`}
              className="flex items-center gap-2 rounded-lg border border-slate-200/60 bg-white/50 px-2.5 py-1.5"
            >
              <Image
                src={comp.icon}
                alt=""
                width={20}
                height={20}
                className="h-5 w-5 rounded-md"
                unoptimized
              />
              <span className="text-xs font-medium text-slate-700">
                {comp.name}
              </span>
              <Badge
                variant="secondary"
                className={`text-[9px] ${
                  comp.platform === "ios"
                    ? "bg-slate-100 text-slate-500"
                    : "bg-green-50 text-green-600"
                }`}
              >
                {comp.platform === "ios" ? "iOS" : "Android"}
              </Badge>
              {!disabled && (
                <button
                  onClick={() => removeCompetitor(i)}
                  className="ml-0.5 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Search panel */}
      {showSearch && (
        <div className="rounded-lg border border-slate-200/60 bg-white/50 p-3">
          <div className="flex gap-2">
            <Input
              placeholder="Search competitor app..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              disabled={disabled || isSearching}
              className="flex-1 text-sm"
              autoFocus
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSearch}
              disabled={disabled || isSearching || !query.trim()}
            >
              {isSearching ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Search className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowSearch(false);
                setResults([]);
                setQuery("");
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {results.length > 0 && (
            <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
              {results.map((app) => {
                const isAdded = competitors.some(
                  (c) => c.appId === app.appId && c.platform === app.platform
                );
                return (
                  <button
                    key={`${app.platform}-${app.appId}`}
                    onClick={() => addCompetitor(app)}
                    disabled={isAdded || disabled}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-slate-50 disabled:opacity-50"
                  >
                    <Image
                      src={app.icon}
                      alt=""
                      width={24}
                      height={24}
                      className="h-6 w-6 rounded-md"
                      unoptimized
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-medium text-slate-800">
                          {app.title}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`shrink-0 text-[8px] ${
                            app.platform === "ios"
                              ? "bg-slate-100 text-slate-500"
                              : "bg-green-50 text-green-600"
                          }`}
                        >
                          <Smartphone className="mr-0.5 h-2 w-2" />
                          {app.platform === "ios" ? "iOS" : "And"}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {app.developer}
                        {app.score != null && (
                          <>
                            {" "}
                            <Star className="mb-px inline h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                            {app.score.toFixed(1)}
                          </>
                        )}
                      </span>
                    </div>
                    {isAdded ? (
                      <span className="text-[10px] text-slate-400">Added</span>
                    ) : (
                      <Plus className="h-3.5 w-3.5 shrink-0 text-friction-blue" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {competitors.length === 0 && !showSearch && (
        <p className="text-xs text-slate-400">
          Add up to {maxCompetitors} competitor apps to compare dimension scores in
          your Vibe Report.
        </p>
      )}
    </div>
  );
}
