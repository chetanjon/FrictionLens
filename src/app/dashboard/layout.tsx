import { redirect } from "next/navigation";
import { SidebarShell } from "@/components/layout/sidebar-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gracefully handle missing Supabase env vars
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-8">
        <div className="max-w-md rounded-2xl border border-amber-500/20 bg-amber-500/10 p-8 text-center">
          <h2 className="text-lg font-semibold text-amber-400">
            Supabase Not Configured
          </h2>
          <p className="mt-3 text-sm text-amber-400/80">
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile and settings for sidebar
  const [profileResult, settingsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .single(),
    supabase
      .from("user_settings")
      .select("gemini_api_key_encrypted")
      .eq("user_id", user.id)
      .single(),
  ]);

  const displayName = profileResult.data?.display_name ?? undefined;
  const avatarUrl = profileResult.data?.avatar_url ?? null;
  const hasApiKey = !!settingsResult.data?.gemini_api_key_encrypted;

  return (
    <SidebarShell
      userEmail={user.email ?? "user"}
      displayName={displayName}
      avatarUrl={avatarUrl}
      hasApiKey={hasApiKey}
    >
      {children}
    </SidebarShell>
  );
}
