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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8">
        <div className="max-w-md rounded-2xl border border-amber-200/60 bg-amber-50/50 p-8 text-center">
          <h2 className="text-lg font-semibold text-amber-900">
            Supabase Not Configured
          </h2>
          <p className="mt-3 text-sm text-amber-700">
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

  return (
    <SidebarShell userEmail={user.email ?? "user"}>
      {children}
    </SidebarShell>
  );
}
