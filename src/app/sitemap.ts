import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/config/site";

// Re-fetch hourly so newly-published reports show up in search engines without
// requiring a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Pull every public, completed report so search engines can index them.
  // Best-effort — if Supabase is misconfigured we still return the static set.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return staticEntries;
  }

  try {
    const { createServerClient } = await import("@supabase/ssr");
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );

    const { data } = await supabase
      .from("analyses")
      .select("slug, completed_at, created_at")
      .eq("is_public", true)
      .eq("status", "completed")
      .not("slug", "is", null)
      .order("completed_at", { ascending: false })
      .limit(5_000);

    const reportEntries: MetadataRoute.Sitemap = (data ?? [])
      .filter((row): row is { slug: string; completed_at: string | null; created_at: string | null } =>
        typeof row.slug === "string" && row.slug.length > 0
      )
      .map((row) => ({
        url: `${baseUrl}/vibe/${row.slug}`,
        lastModified: row.completed_at
          ? new Date(row.completed_at)
          : row.created_at
            ? new Date(row.created_at)
            : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));

    return [...staticEntries, ...reportEntries];
  } catch (err) {
    console.error("sitemap: failed to fetch public reports", err);
    return staticEntries;
  }
}
