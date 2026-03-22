import posthog from "posthog-js";

/* ─────────────────────────────────────────────────────────
 * Centralized analytics event helpers.
 *
 * All PostHog calls go through here so:
 *  - Events are discoverable via grep/search
 *  - The app never crashes if PostHog isn't configured
 *  - Event names stay consistent
 * ───────────────────────────────────────────────────────── */

function capture(event: string, properties?: Record<string, unknown>) {
  try {
    if (typeof window !== "undefined" && posthog.__loaded) {
      posthog.capture(event, properties);
    }
  } catch {
    // Never let analytics break the app
  }
}

/* ── Identity ── */

export function identifyUser(userId: string, email?: string) {
  try {
    if (typeof window !== "undefined" && posthog.__loaded) {
      posthog.identify(userId, email ? { email } : undefined);
    }
  } catch {
    // noop
  }
}

export function resetUser() {
  try {
    if (typeof window !== "undefined" && posthog.__loaded) {
      posthog.reset();
    }
  } catch {
    // noop
  }
}

/* ── Auth events ── */

export function trackSignup(method: "email" | "oauth" = "email") {
  capture("signup_completed", { method });
}

export function trackLogin(method: "email" | "oauth" = "email") {
  capture("login_completed", { method });
}

export function trackLogout() {
  capture("logout");
  resetUser();
}

/* ── Onboarding ── */

export function trackApiKeySaved() {
  capture("api_key_saved");
}

/* ── Analysis events ── */

export function trackAnalysisStarted(properties: {
  appName: string;
  reviewCount: number;
  source: "csv" | "paste" | "app_store";
  competitorCount: number;
}) {
  capture("analysis_started", properties);
}

export function trackAnalysisCompleted(properties: {
  appName: string;
  vibeScore: number;
  reviewCount: number;
  competitorCount: number;
  durationMs: number;
}) {
  capture("analysis_completed", properties);
}

export function trackAnalysisError(properties: {
  appName: string;
  error: string;
  stage?: string;
}) {
  capture("analysis_error", properties);
}

/* ── Report events ── */

export function trackReportViewed(properties: {
  analysisId: string;
  appName: string;
  isPublic: boolean;
}) {
  capture("report_viewed", properties);
}

export function trackReportSectionViewed(section: string) {
  capture("report_section_viewed", { section });
}

export function trackReportShared(properties: {
  analysisId: string;
  appName: string;
}) {
  capture("report_shared", properties);
}

export function trackReportExportPdf(analysisId: string) {
  capture("report_export_pdf", { analysisId });
}

export function trackShareLinkCopied(analysisId: string) {
  capture("share_link_copied", { analysisId });
}

/* ── Review explorer ── */

export function trackReviewFiltered(filter: string) {
  capture("review_filtered", { filter });
}
