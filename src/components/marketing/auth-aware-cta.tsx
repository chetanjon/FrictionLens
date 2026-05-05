"use client";

import Link from "next/link";
import { useSyncExternalStore, type ReactNode } from "react";

// Optimistic client-side presence check for the Supabase SSR auth cookie.
// Real auth is enforced by middleware + server actions; this just lets the
// landing page swap a CTA after hydration without forcing dynamic rendering.
const SUPABASE_AUTH_COOKIE_RE = /(?:^|;\s*)sb-[^=]+-auth-token(?:\.[0-9]+)?=/;

function readAuthCookiePresence(): boolean {
  if (typeof document === "undefined") return false;
  return SUPABASE_AUTH_COOKIE_RE.test(document.cookie);
}

// useSyncExternalStore lets the server render `false` and the client read the
// real cookie state on hydration without triggering React 19's
// "no setState in effect" rule. We don't subscribe to cookie changes — the
// CTA only needs to be correct on initial mount.
const subscribeNoop = () => () => {};

export function useHasAuthCookie(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    readAuthCookiePresence,
    () => false
  );
}

type HeroSearchCTAProps = {
  className?: string;
  placeholder?: string;
};

export function HeroSearchCTA({
  className = "hero-fade-3 mt-10 flex max-w-xl items-center gap-0 rounded-2xl border border-gray-200/80 bg-white p-2 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-300/40 transition-shadow cursor-pointer",
  placeholder = "Search any app or paste reviews...",
}: HeroSearchCTAProps) {
  const isLoggedIn = useHasAuthCookie();
  return (
    <Link href={isLoggedIn ? "/dashboard" : "/signup"} className={className}>
      <div className="flex items-center flex-1 min-w-0">
        <svg
          className="ml-3 mr-2.5 h-5 w-5 shrink-0 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className="min-w-0 flex-1 py-3.5 text-base text-gray-400">
          {placeholder}
        </span>
      </div>
      <span className="shrink-0 rounded-xl bg-friction-blue px-6 py-3.5 text-sm font-semibold text-white shadow-sm">
        {isLoggedIn ? "Dashboard →" : "Analyze Free →"}
      </span>
    </Link>
  );
}

type PrimaryCTAButtonProps = {
  className: string;
  loggedOutLabel: ReactNode;
  loggedInLabel: ReactNode;
  loggedOutHref?: string;
  loggedInHref?: string;
};

export function PrimaryCTAButton({
  className,
  loggedOutLabel,
  loggedInLabel,
  loggedOutHref = "/signup",
  loggedInHref = "/dashboard",
}: PrimaryCTAButtonProps) {
  const isLoggedIn = useHasAuthCookie();
  return (
    <Link href={isLoggedIn ? loggedInHref : loggedOutHref} className={className}>
      {isLoggedIn ? loggedInLabel : loggedOutLabel}
    </Link>
  );
}

export function NavAuthCTAs() {
  const isLoggedIn = useHasAuthCookie();
  if (isLoggedIn) {
    return (
      <Link
        href="/dashboard"
        className="hidden md:inline-flex h-9 items-center rounded-lg bg-friction-blue px-4 text-sm font-medium text-white hover:bg-friction-blue/90 transition-colors"
      >
        Dashboard
      </Link>
    );
  }
  return (
    <>
      <Link
        href="/login"
        className="hidden md:inline text-sm text-gray-500 hover:text-slate-900 transition-colors"
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className="hidden md:inline-flex h-9 items-center rounded-lg bg-friction-blue px-4 text-sm font-medium text-white hover:bg-friction-blue/90 transition-colors"
      >
        Get Started
      </Link>
    </>
  );
}
