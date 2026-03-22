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
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
          <svg width="18" height="18" viewBox="0 0 500 500" fill="none">
            <path d="M102 82 C118 98,138 126,155 150 C168 170,182 190,198 210 C210 226,222 237,236 244 C244 248,252 249,260 252 C272 257,284 268,300 290 C318 316,340 348,360 376 C374 396,390 414,410 436 C406 440,400 442,394 444 C374 422,358 400,340 374 C322 348,304 322,288 298 C276 280,266 268,256 260 C248 254,240 252,232 250 C222 248,212 238,198 222 C180 200,165 178,150 156 C136 134,122 112,110 94Z" fill="white" opacity="0.92"/>
            <ellipse cx="250" cy="251" rx="5.5" ry="5" fill="#4A90D9"/>
            <ellipse cx="236" cy="240" rx="2.2" ry="1.8" fill="#4A90D9" opacity="0.3"/>
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
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900">
            <svg width="16" height="16" viewBox="0 0 500 500" fill="none">
              <path d="M102 82 C118 98,138 126,155 150 C168 170,182 190,198 210 C210 226,222 237,236 244 C244 248,252 249,260 252 C272 257,284 268,300 290 C318 316,340 348,360 376 C374 396,390 414,410 436 C406 440,400 442,394 444 C374 422,358 400,340 374 C322 348,304 322,288 298 C276 280,266 268,256 260 C248 254,240 252,232 250 C222 248,212 238,198 222 C180 200,165 178,150 156 C136 134,122 112,110 94Z" fill="white" opacity="0.92"/>
              <ellipse cx="250" cy="251" rx="7" ry="6.5" fill="#4A90D9"/>
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
