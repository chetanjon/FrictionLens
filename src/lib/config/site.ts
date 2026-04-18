/**
 * Canonical public URL for this deployment — used for metadata, robots.txt,
 * sitemap.xml, and Open Graph tags.
 *
 * Resolution order:
 *  1. NEXT_PUBLIC_SITE_URL (explicit override, e.g. once a custom domain is live)
 *  2. VERCEL_PROJECT_PRODUCTION_URL (auto-injected by Vercel at build/runtime)
 *  3. localhost fallback (dev)
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}
