"use server";

import { nanoid } from "nanoid";

export async function togglePublic(analysisId: string, isPublic: boolean) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("analyses")
    .update({ is_public: isPublic })
    .eq("id", analysisId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function generateSlug(analysisId: string, appName: string) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized", slug: null };
  }

  // Check if slug already exists
  const { data: existing } = await supabase
    .from("analyses")
    .select("slug")
    .eq("id", analysisId)
    .eq("user_id", user.id)
    .single();

  if (existing?.slug) {
    return { success: true, slug: existing.slug };
  }

  // Generate slug: sanitized-app-name + unique suffix.
  // 12-char nanoid (~3.5e21 combinations) so the public URL space isn't
  // brute-forceable by enumeration.
  const sanitized = appName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);

  const SLUG_NANOID_LEN = 12;
  const MAX_ATTEMPTS = 5;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const suffix = nanoid(SLUG_NANOID_LEN);
    const slug = `${sanitized}-${suffix}`;
    const { error } = await supabase
      .from("analyses")
      .update({ slug })
      .eq("id", analysisId)
      .eq("user_id", user.id);

    if (!error) {
      return { success: true, slug };
    }
    // Postgres unique-violation code is 23505. Retry with a fresh suffix;
    // any other error short-circuits.
    const code = (error as { code?: string }).code;
    if (code !== "23505") {
      return { success: false, error: error.message, slug: null };
    }
  }

  return {
    success: false,
    error: "Could not allocate a unique share slug. Try again.",
    slug: null,
  };
}
