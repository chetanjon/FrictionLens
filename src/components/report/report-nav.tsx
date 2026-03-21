"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShareDialog } from "@/components/report/share-dialog";
import {
  FileText,
  BarChart3,
  AlertTriangle,
  TrendingDown,
  Rocket,
  GitCompare,
  CheckSquare,
  Database,
  Download,
  Share2,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "summary", label: "Summary", icon: FileText },
  { id: "dimensions", label: "Dimensions", icon: BarChart3 },
  { id: "friction", label: "Friction", icon: AlertTriangle },
  { id: "churn", label: "Churn", icon: TrendingDown },
  { id: "release", label: "Release", icon: Rocket },
  { id: "compare", label: "Compare", icon: GitCompare },
  { id: "actions", label: "Actions", icon: CheckSquare },
  { id: "data", label: "Data", icon: Database },
] as const;

type ReportNavProps = {
  analysisId: string;
  appName: string;
  isPublic: boolean;
  slug: string | null;
  readOnly?: boolean;
};

export function ReportNav({
  analysisId,
  appName,
  isPublic,
  slug,
  readOnly = false,
}: ReportNavProps) {
  const [shareOpen, setShareOpen] = useState(false);

  const handleExportPdf = () => {
    window.print();
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex max-w-[920px] items-center justify-between px-7 py-2">
          <div className="flex items-center gap-1 overflow-x-auto">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2 pl-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPdf}
              className="gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export PDF</span>
            </Button>
            {!readOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShareOpen(true)}
                className="gap-1.5"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {!readOnly && (
        <ShareDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          analysisId={analysisId}
          appName={appName}
          isPublic={isPublic}
          slug={slug}
        />
      )}
    </>
  );
}
