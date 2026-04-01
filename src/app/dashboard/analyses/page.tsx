import { AnalysesTable } from "@/components/dashboard/analyses-table";
import { vibeColor } from "@/lib/constants";

export const metadata = {
  title: "All Analyses",
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

export default async function AnalysesPage() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: analyses } = await supabase
    .from("analyses")
    .select("id, app_name, platform, status, vibe_score, review_count, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = ((analyses as AnalysisRow[]) ?? []).map((a) => ({
    ...a,
    vibeColorHex: a.vibe_score != null ? vibeColor(a.vibe_score) : null,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          All Analyses
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {rows.length} {rows.length === 1 ? "analysis" : "analyses"} total
        </p>
      </div>
      <AnalysesTable analyses={rows} />
    </div>
  );
}
