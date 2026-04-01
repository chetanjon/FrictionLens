/**
 * Free trial configuration and server-side helpers.
 *
 * New users get a limited number of analyses using the platform Gemini key
 * so they can experience value before adding their own API key.
 */

import { createClient } from "@/lib/supabase/server";

/** Maximum number of free analyses per user (using platform key). */
export const FREE_TRIAL_LIMIT = 2;

/** Maximum reviews allowed per free trial analysis (keeps costs manageable). */
export const FREE_TRIAL_MAX_REVIEWS = 100;

/** The model used for free trial analyses (cheapest option). */
export const FREE_TRIAL_MODEL = "gemini-2.5-flash-lite";

export type FreeTrialStatus = {
  /** How many free analyses the user has consumed. */
  used: number;
  /** How many free analyses remain. */
  remaining: number;
  /** Whether the platform key is available for free trials. */
  platformKeyAvailable: boolean;
  /** Whether the user has their own API key saved. */
  hasOwnKey: boolean;
};

/**
 * Fetch the current free trial status for a user.
 * Safe to call from server components and server actions.
 */
export async function getFreeTrialStatus(
  userId: string
): Promise<FreeTrialStatus> {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("user_settings")
    .select("gemini_api_key_encrypted, free_analyses_used")
    .eq("user_id", userId)
    .single();

  const used = settings?.free_analyses_used ?? 0;
  const hasOwnKey = !!settings?.gemini_api_key_encrypted;
  const platformKeyAvailable = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  return {
    used,
    remaining: Math.max(0, FREE_TRIAL_LIMIT - used),
    platformKeyAvailable,
    hasOwnKey,
  };
}

/**
 * Check whether a user can run a free trial analysis, and if so,
 * increment their usage counter atomically.
 *
 * Returns `{ allowed: true }` or `{ allowed: false, reason: string }`.
 */
export async function consumeFreeTrial(
  userId: string
): Promise<{ allowed: true } | { allowed: false; reason: string }> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return {
      allowed: false,
      reason: "Free trial is not available. Please add your own Gemini API key in Settings.",
    };
  }

  const supabase = await createClient();

  // Fetch current usage
  const { data: settings } = await supabase
    .from("user_settings")
    .select("free_analyses_used")
    .eq("user_id", userId)
    .single();

  const used = settings?.free_analyses_used ?? 0;

  if (used >= FREE_TRIAL_LIMIT) {
    return {
      allowed: false,
      reason: `You've used all ${FREE_TRIAL_LIMIT} free analyses. Add your own Gemini API key in Settings to continue.`,
    };
  }

  // Increment usage — try update first, then insert if no row exists
  if (settings) {
    const { error: updateError } = await supabase
      .from("user_settings")
      .update({
        free_analyses_used: used + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Failed to update free trial usage:", updateError);
      return {
        allowed: false,
        reason: "Failed to verify trial status. Please try again.",
      };
    }
  } else {
    // New user with no settings row — create one with all required fields
    const { error: insertError } = await supabase
      .from("user_settings")
      .insert({
        user_id: userId,
        free_analyses_used: 1,
        preferred_model: "gemini-2.5-flash",
        updated_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Failed to create trial record:", insertError.message, insertError.code, insertError.details);
      return {
        allowed: false,
        reason: "Failed to verify trial status. Please try again.",
      };
    }
  }

  return { allowed: true };
}
