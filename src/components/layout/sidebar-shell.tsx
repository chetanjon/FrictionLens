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
        <svg width="32" height="32" viewBox="-32 -32 64 64" fill="none">
          <ellipse cx="0" cy="0" rx="30" ry="29.5" fill="none" stroke="#1e293b" strokeWidth="1.2"/>
          <ellipse cx="0" cy="0" rx="24" ry="23.5" fill="#1e293b"/>
          <path d="M -7 -12 L 7 -12 L 7 -8.5 L -3 -8.5 L -3 -1.5 L 5 -1.5 L 5 1.5 L -3 1.5 L -3 13 L -7 13 Z" fill="#0f172a"/>
        </svg>
        <span className="text-[15px] font-semibold tracking-tight text-gray-900">
          FrictionLens
        </span>
      </div>

      <Separator className="mx-4 w-auto border-gray-200" />

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
                  ? "bg-friction-blue/15 text-friction-blue"
                  : "text-gray-500 hover:bg-gray-100 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active ? "text-friction-blue" : "text-gray-500"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2.5">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-friction-blue/20 text-xs font-semibold text-friction-blue">
              {initial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-gray-600" title={displayName ?? userEmail}>
              {displayName ?? userEmail.split("@")[0]}
            </p>
            <div className="flex items-center gap-1.5">
              <p className="truncate text-[10px] text-gray-500" title={userEmail}>
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
          className="mt-2 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F2F2F7]">
      {/* Desktop sidebar */}
      <aside
        className="hidden w-[220px] shrink-0 border-r border-gray-200 bg-slate-950 md:block"
        role="complementary"
        aria-label="Sidebar navigation"
      >
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b border-gray-200 bg-slate-950 px-4 md:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-friction-blue"
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
          <svg width="28" height="28" viewBox="-32 -32 64 64" fill="none">
            <ellipse cx="0" cy="0" rx="30" ry="29.5" fill="none" stroke="#1e293b" strokeWidth="1.2"/>
            <ellipse cx="0" cy="0" rx="24" ry="23.5" fill="#1e293b"/>
            <path d="M -7 -12 L 7 -12 L 7 -8.5 L -3 -8.5 L -3 -1.5 L 5 -1.5 L 5 1.5 L -3 1.5 L -3 13 L -7 13 Z" fill="#0f172a"/>
          </svg>
          <span className="text-sm font-semibold text-gray-900">
            FrictionLens
          </span>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-[#F2F2F7]/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            id="mobile-sidebar"
            className="fixed inset-y-0 left-0 z-50 w-[260px] border-r border-gray-200 bg-slate-950 pt-14 md:hidden"
            role="complementary"
            aria-label="Sidebar navigation"
          >
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Main content */}
      <main id="main-content" className="relative flex-1 overflow-auto pt-14 md:pt-0" role="main">
        {/* Ambient blurs for glass effect */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="aurora-blob-1 absolute top-[10%] right-[10%] h-[400px] w-[400px] rounded-full bg-friction-blue/[0.025] blur-[140px]" />
          <div className="aurora-blob-2 absolute bottom-[20%] left-[20%] h-[350px] w-[350px] rounded-full bg-[#7C3AED]/[0.02] blur-[120px]" />
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
