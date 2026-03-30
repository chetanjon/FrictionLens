import { SettingsForm } from "@/components/settings/settings-form";

export const metadata = {
  title: "Settings — FrictionLens",
};

export default async function SettingsPage() {
  // Gracefully handle missing Supabase env vars
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-6 text-center">
          <h2 className="text-lg font-semibold text-amber-900">
            Supabase Not Configured
          </h2>
          <p className="mt-2 text-sm text-amber-700">
            Set <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your{" "}
            <code className="font-mono text-xs">.env.local</code> file, then restart the dev
            server.
          </p>
        </div>
      </div>
    );
  }

  // Dynamic import so the module isn't evaluated when env vars are missing
  const { createClient } = await import("@/lib/supabase/server");

  let hasKey = false;
  let currentModel = "gemini-2.5-flash";
  let freeAnalysesUsed = 0;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: settings } = await supabase
        .from("user_settings")
        .select("gemini_api_key_encrypted, default_model, free_analyses_used")
        .eq("user_id", user.id)
        .single();

      if (settings) {
        hasKey = !!settings.gemini_api_key_encrypted;
        currentModel = settings.default_model ?? "gemini-2.5-flash";
        freeAnalysesUsed = settings.free_analyses_used ?? 0;
      }
    }
  } catch (err) {
    console.error("Failed to load user settings:", err);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your Gemini API key and preferences.
        </p>
      </div>

      <SettingsForm hasKey={hasKey} currentModel={currentModel} freeAnalysesUsed={freeAnalysesUsed} />
    </div>
  );
}
