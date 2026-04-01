"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Copy, Globe, Lock } from "lucide-react";
import { togglePublic, generateSlug } from "@/app/dashboard/analysis/[id]/share-action";
import { trackReportShared, trackShareLinkCopied } from "@/lib/analytics";

type ShareDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysisId: string;
  appName: string;
  isPublic: boolean;
  slug: string | null;
};

export function ShareDialog({
  open,
  onOpenChange,
  analysisId,
  appName,
  isPublic: initialPublic,
  slug: initialSlug,
}: ShareDialogProps) {
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [slug, setSlug] = useState(initialSlug);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const publicUrl = slug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/vibe/${slug}`
    : null;

  const handleToggle = () => {
    const newValue = !isPublic;
    startTransition(async () => {
      const result = await togglePublic(analysisId, newValue);
      if (result.success) {
        setIsPublic(newValue);
        if (newValue && !slug) {
          const slugResult = await generateSlug(analysisId, appName);
          if (slugResult.success && slugResult.slug) {
            setSlug(slugResult.slug);
          }
        }
        if (newValue) {
          trackReportShared({ analysisId, appName });
        }
      }
    });
  };

  const handleCopy = async () => {
    if (publicUrl) {
      await navigator.clipboard.writeText(publicUrl);
      trackShareLinkCopied(analysisId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Report</DialogTitle>
          <DialogDescription>
            Make this Vibe Report publicly accessible via a shareable link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-white/65 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-4">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Globe className="h-5 w-5 text-friction-blue" />
              ) : (
                <Lock className="h-5 w-5 text-gray-500" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {isPublic ? "Public" : "Private"}
                </p>
                <p className="text-xs text-gray-500">
                  {isPublic
                    ? "Anyone with the link can view"
                    : "Only you can access this report"}
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isPublic}
              disabled={isPending}
              onClick={handleToggle}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-friction-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                isPublic ? "bg-friction-blue" : "bg-white/[0.10]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isPublic ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Public URL */}
          {isPublic && publicUrl && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">
                Public URL
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 truncate rounded-lg border border-slate-200/60 bg-white/65 backdrop-blur-xl px-3 py-2 font-mono text-xs text-gray-600">
                  {publicUrl}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="shrink-0 gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
