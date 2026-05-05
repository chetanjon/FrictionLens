"use client";

import { Suspense, useEffect, useState, type ComponentType } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

type PostHogClient = {
  capture: (event: string, props?: Record<string, unknown>) => void;
};

type LoadedAnalytics = {
  Provider: ComponentType<{ client: unknown; children: React.ReactNode }>;
  client: PostHogClient;
  usePostHog: () => PostHogClient | undefined;
};

/* ── Track pageviews on route change ── */
function PostHogPageView({
  usePostHog,
}: {
  usePostHog: () => PostHogClient | undefined;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (pathname && ph) {
      let url = window.origin + pathname;
      const search = searchParams.toString();
      if (search) url += "?" + search;
      ph.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, ph]);

  return null;
}

/* ── Provider wrapper ──
 * PostHog is loaded and initialized lazily on requestIdleCallback so its ~50KB
 * SDK stays out of the critical-path bundle and doesn't run before first paint.
 * The provider is unmounted on initial render and only mounts once the SDK
 * resolves, which costs us the very first pageview but keeps LCP/TBT down. */
export function PostHogAnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [analytics, setAnalytics] = useState<LoadedAnalytics | null>(null);

  useEffect(() => {
    if (!POSTHOG_KEY) return;
    if (typeof window === "undefined") return;

    let cancelled = false;

    const load = async () => {
      const [{ default: posthog }, react] = await Promise.all([
        import("posthog-js"),
        import("posthog-js/react"),
      ]);
      if (cancelled) return;

      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        person_profiles: "identified_only",
        capture_pageview: false,
        capture_pageleave: true,
        autocapture: true,
      });

      setAnalytics({
        Provider: react.PostHogProvider as LoadedAnalytics["Provider"],
        client: posthog as unknown as PostHogClient,
        usePostHog: react.usePostHog as LoadedAnalytics["usePostHog"],
      });
    };

    type IdleHandle = number;
    type IdleCallback = (cb: () => void) => IdleHandle;
    const w = window as Window & {
      requestIdleCallback?: IdleCallback;
      cancelIdleCallback?: (handle: IdleHandle) => void;
    };
    const schedule: IdleCallback =
      w.requestIdleCallback ??
      ((cb: () => void) => setTimeout(cb, 1) as unknown as IdleHandle);
    const handle = schedule(() => {
      void load();
    });

    return () => {
      cancelled = true;
      if (w.cancelIdleCallback) w.cancelIdleCallback(handle);
    };
  }, []);

  if (!POSTHOG_KEY || !analytics) {
    return <>{children}</>;
  }

  const { Provider, client, usePostHog } = analytics;

  return (
    <Provider client={client}>
      <Suspense fallback={null}>
        <PostHogPageView usePostHog={usePostHog} />
      </Suspense>
      {children}
    </Provider>
  );
}
