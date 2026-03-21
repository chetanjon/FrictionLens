import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { vibeColor } from "@/lib/constants";

export const metadata = {
  title: "Dashboard — FrictionLens",
};

type AnalysisRow = {
  id: string;
  app_name: string;
  platform: string | null;
  status: string;
  vibe_score: number | null;
  review_count: number;
  created_at: string;
};

export default async function DashboardPage() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-6 text-center">
          <h2 className="text-lg font-semibold text-amber-900">
            Supabase Not Configured
          </h2>
          <p className="mt-2 text-sm text-amber-700">
            Set{" "}
            <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
            and{" "}
            <code className="font-mono text-xs">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>{" "}
            in your <code className="font-mono text-xs">.env.local</code> file,
            then restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  const { createClient } = await import("@/lib/supabase/server");

  let recentAnalyses: AnalysisRow[] = [];
  let hasApiKey = false;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Check if user has an API key
      const { data: settings } = await supabase
        .from("user_settings")
        .select("gemini_api_key_encrypted")
        .eq("user_id", user.id)
        .single();

      hasApiKey = !!settings?.gemini_api_key_encrypted;

      // Fetch recent analyses
      const { data: analyses } = await supabase
        .from("analyses")
        .select(
          "id, app_name, platform, status, vibe_score, review_count, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      recentAnalyses = (analyses as AnalysisRow[]) ?? [];
    }
  } catch (err) {
    console.error("Failed to load dashboard data:", err);
  }

  // Serialize for client component
  const serializedAnalyses = recentAnalyses.map((a) => ({
    ...a,
    vibeColorHex: a.vibe_score != null ? vibeColor(a.vibe_score) : null,
  }));

  return (
    <DashboardClient
      recentAnalyses={serializedAnalyses}
      hasApiKey={hasApiKey}
    />
  );
}
