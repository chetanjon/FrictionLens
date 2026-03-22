"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileBarChart,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Command Center", href: "/dashboard", icon: LayoutDashboard },
  { label: "All Analyses", href: "/dashboard/analyses", icon: FileBarChart },
  { label: "Trends", href: "/dashboard/trends", icon: TrendingUp },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

type SidebarShellProps = {
  userEmail: string;
  displayName?: string;
  avatarUrl?: string | null;
  hasApiKey?: boolean;
  onNewAnalysis?: () => void;
  children: React.ReactNode;
};

export function SidebarShell({
  userEmail,
  displayName,
  avatarUrl,
  hasApiKey,
  onNewAnalysis,
  children,
}: SidebarShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const initial = (displayName ?? userEmail).charAt(0).toUpperCase();

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-slate-900">
          FrictionLens
        </span>
      </div>

      <Separator className="mx-4 w-auto" />

      {/* Quick action */}
      <div className="px-3 pt-3">
        <Button
          size="sm"
          className="w-full justify-start gap-2 bg-friction-blue text-white hover:bg-friction-blue/90"
          onClick={() => {
            setMobileOpen(false);
            onNewAnalysis?.();
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          New Analysis
        </Button>
      </div>

      {/* Navigation */}
      <nav className="mt-3 flex-1 space-y-0.5 px-3" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-friction-blue",
                active
                  ? "bg-friction-blue/10 text-friction-blue"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active ? "text-friction-blue" : "text-slate-400"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2.5">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-friction-blue/10 text-xs font-semibold text-friction-blue">
              {initial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-slate-700" title={displayName ?? userEmail}>
              {displayName ?? userEmail.split("@")[0]}
            </p>
            <div className="flex items-center gap-1.5">
              <p className="truncate text-[10px] text-slate-400" title={userEmail}>
                {userEmail}
              </p>
              {hasApiKey !== undefined && (
                <span
                  className={cn(
                    "inline-block h-1.5 w-1.5 shrink-0 rounded-full",
                    hasApiKey ? "bg-green-400" : "bg-amber-400"
                  )}
                  title={hasApiKey ? "API key configured" : "No API key set"}
                />
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="mt-2 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50/60">
      {/* Desktop sidebar */}
      <aside
        className="hidden w-[220px] shrink-0 border-r border-slate-200 bg-white md:block"
        role="complementary"
        aria-label="Sidebar navigation"
      >
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b border-slate-200 bg-white px-4 md:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-friction-blue"
          aria-label={mobileOpen ? "Close sidebar menu" : "Open sidebar menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-sidebar"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
        <div className="ml-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-slate-900">
            FrictionLens
          </span>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            id="mobile-sidebar"
            className="fixed inset-y-0 left-0 z-50 w-[260px] border-r border-slate-200 bg-white pt-14 md:hidden"
            role="complementary"
            aria-label="Sidebar navigation"
          >
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Main content */}
      <main id="main-content" className="flex-1 overflow-auto pt-14 md:pt-0" role="main">
        {children}
      </main>
    </div>
  );
}
