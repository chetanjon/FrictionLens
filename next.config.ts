import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

// Conservative baseline security headers. Strict-Transport-Security is added
// only when behind HTTPS (Vercel handles that); the rest are safe everywhere.
//
// CSP keeps 'unsafe-inline' for both scripts and styles because Next.js
// inlines bootstrap scripts and Tailwind/chart components emit inline styles.
// 'unsafe-eval' is dev-only — Turbopack's HMR runtime needs it; production
// bundles do not.
const isProd = process.env.NODE_ENV === "production";

const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  ...(isProd ? [] : ["'unsafe-eval'"]),
  "https://*.posthog.com",
].join(" ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src ${scriptSrc}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.posthog.com https://*.upstash.io https://generativelanguage.googleapis.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      // Production-only: in dev the dev server is http and this directive
      // would rewrite <Link> prefetches to https, causing ERR_SSL_PROTOCOL_ERROR
      // on localhost. In prod Vercel terminates TLS so upgrading is correct.
      ...(isProd ? ["upgrade-insecure-requests"] : []),
    ].join("; "),
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
