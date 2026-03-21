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

  // Generate slug: sanitized-app-name + short unique suffix
  const sanitized = appName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);

  const suffix = nanoid(6);
  const slug = `${sanitized}-${suffix}`;

  const { error } = await supabase
    .from("analyses")
    .update({ slug: slug })
    .eq("id", analysisId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message, slug: null };
  }

  return { success: true, slug };
}
