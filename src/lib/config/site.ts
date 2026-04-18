/**
 * Canonical public URL for this deployment — used for metadata, robots.txt,
 * sitemap.xml, and Open Graph tags.
 *
 * Resolution order:
 *  1. NEXT_PUBLIC_SITE_URL (explicit override — set in local .env for dev)
 *  2. https://frictionlens.app (the owned production domain)
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  return "https://frictionlens.app";
}
