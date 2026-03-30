"use client";

import { useRef, useState, useTransition } from "react";
import { Eye, EyeOff, ExternalLink, Loader2, Trash2, Zap, Save } from "lucide-react";
import { toast } from "sonner";
import { saveApiKey, testApiKey, deleteApiKey } from "@/app/dashboard/settings/actions";
import { cn } from "@/lib/utils";
import { trackApiKeySaved } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const MODELS = [
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", desc: "Best balance — 10 RPM, 250 RPD" },
  { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash-Lite", desc: "Fastest — 15 RPM, 1000 RPD" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro", desc: "Most powerful — 5 RPM, 100 RPD" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash", desc: "Previous gen — 15 RPM, 1500 RPD" },
] as const;

/** Must match the value in @/lib/free-trial.ts (can't import server module in client component). */
const FREE_TRIAL_LIMIT = 2;

type Props = {
  hasKey: boolean;
  currentModel: string;
  freeAnalysesUsed?: number;
};

export function SettingsForm({ hasKey, currentModel, freeAnalysesUsed = 0 }: Props) {
  const freeTrialRemaining = Math.max(0, FREE_TRIAL_LIMIT - freeAnalysesUsed);
  const formRef = useRef<HTMLFormElement>(null);
  const [showKey, setShowKey] = useState(false);
  const [keyExists, setKeyExists] = useState(hasKey);
  const [model, setModel] = useState(currentModel);
  const [isSaving, startSaving] = useTransition();
  const [isTesting, startTesting] = useTransition();
  const [isDeleting, startDeleting] = useTransition();

  function handleSave(formData: FormData) {
    formData.set("model", model);
    startSaving(async () => {
      const result = await saveApiKey(formData);
      if ("success" in result) {
        trackApiKeySaved();
        toast.success("API key saved successfully.");
        setKeyExists(true);
        if (formRef.current) {
          const input = formRef.current.querySelector<HTMLInputElement>(
            'input[name="apiKey"]'
          );
          if (input) input.value = "";
        }
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleTest(formData: FormData) {
    startTesting(async () => {
      const result = await testApiKey(formData);
      if ("success" in result) {
        toast.success("Connection successful! Your API key is valid.");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete() {
    startDeleting(async () => {
      const result = await deleteApiKey();
      if ("success" in result) {
        toast.success("API key removed.");
        setKeyExists(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* API Key Card */}
      <Card className="bg-white/65 backdrop-blur-xl border-slate-200/60 rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Gemini API Key
              </CardTitle>
              <CardDescription className="mt-0.5">
                Add your own key for unlimited AI-powered analysis.
              </CardDescription>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-medium">
              <span
                className={`inline-block size-2 rounded-full ${
                  keyExists ? "bg-emerald-500" : "bg-slate-300"
                }`}
              />
              {keyExists ? "Key saved" : "Not set"}
            </span>
          </div>
        </CardHeader>

        <CardContent>
          <form ref={formRef} className="flex flex-col gap-5">
            {/* API key input */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="apiKey">API Key</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  name="apiKey"
                  type={showKey ? "text" : "password"}
                  placeholder={
                    keyExists
                      ? "Enter a new key to replace the current one"
                      : "Paste your Gemini API key"
                  }
                  autoComplete="off"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showKey ? "Hide API key" : "Show API key"}
                >
                  {showKey ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Model selector */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="model">Preferred Model</Label>
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                {MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label} — {m.desc}
                  </option>
                ))}
              </select>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                type="submit"
                formAction={handleSave}
                disabled={isSaving}
                className="bg-[#0F172A] text-white hover:bg-[#0F172A]/90"
              >
                {isSaving ? (
                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                ) : (
                  <Save className="mr-1.5 size-4" />
                )}
                {isSaving ? "Saving..." : "Save"}
              </Button>

              <Button
                type="submit"
                formAction={handleTest}
                variant="outline"
                disabled={isTesting}
              >
                {isTesting ? (
                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                ) : (
                  <Zap className="mr-1.5 size-4" />
                )}
                {isTesting ? "Testing..." : "Test Connection"}
              </Button>

              {keyExists && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="ml-auto text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                >
                  {isDeleting ? (
                    <Loader2 className="mr-1.5 size-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-1.5 size-4" />
                  )}
                  {isDeleting ? "Removing..." : "Remove Key"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Free Trial Status */}
      {!keyExists && (
        <Card className="bg-white/65 backdrop-blur-xl border-slate-200/60 rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Free Trial</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {freeTrialRemaining > 0
                    ? `You have ${freeTrialRemaining} free ${freeTrialRemaining === 1 ? "analysis" : "analyses"} remaining. Add your own API key for unlimited access.`
                    : "You've used all your free analyses. Add a Gemini API key above to continue."}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: FREE_TRIAL_LIMIT }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "inline-block h-2.5 w-2.5 rounded-full",
                      i < freeAnalysesUsed ? "bg-slate-300" : "bg-friction-blue"
                    )}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Card */}
      <Card className="bg-white/65 backdrop-blur-xl border-slate-200/60 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Getting an API Key
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
          <ol className="list-decimal list-inside space-y-1.5">
            <li>
              Visit{" "}
              <a
                href="https://aistudio.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 font-medium text-[#4A90D9] hover:underline"
              >
                aistudio.google.com
                <ExternalLink className="size-3" />
              </a>
            </li>
            <li>Sign in with your Google account.</li>
            <li>Click &quot;Get API Key&quot; and create a new key.</li>
            <li>Paste it above and hit Save.</li>
          </ol>

          <Separator />

          <p className="text-xs leading-relaxed text-muted-foreground/80">
            Your key is encrypted at rest using AES-256-GCM and is never exposed to
            the browser. It is only decrypted server-side when making AI calls on your
            behalf.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
