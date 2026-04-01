"use server";

import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/crypto";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

export async function saveApiKey(formData: FormData): Promise<{ success: true } | { error: string }> {
  try {
    const apiKey = formData.get("apiKey") as string | null;
    const model = formData.get("model") as string | null;

    if (!apiKey || apiKey.trim().length === 0) {
      return { error: "API key is required." };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "You must be signed in to save an API key." };
    }

    const { encrypted, iv, tag } = encrypt(apiKey.trim());

    const { error: upsertError } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: user.id,
          gemini_api_key_encrypted: encrypted,
          gemini_api_key_iv: iv,
          gemini_api_key_tag: tag,
          preferred_model: model || "gemini-2.5-flash",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error("Failed to save API key:", upsertError);
      return { error: "Failed to save API key. Please try again." };
    }

    return { success: true };
  } catch (err) {
    console.error("saveApiKey error:", err);
    return { error: "An unexpected error occurred while saving the API key." };
  }
}

export async function testApiKey(formData: FormData): Promise<{ success: true } | { error: string }> {
  try {
    const apiKey = formData.get("apiKey") as string | null;

    if (!apiKey || apiKey.trim().length === 0) {
      return { error: "Please enter an API key to test." };
    }

    const google = createGoogleGenerativeAI({ apiKey: apiKey.trim() });

    await generateText({
      model: google("gemini-2.5-flash"),
      prompt: "Say 'ok' and nothing else.",
      maxOutputTokens: 5,
    });

    return { success: true };
  } catch (err) {
    console.error("testApiKey error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";

    if (message.includes("API_KEY_INVALID") || message.includes("401") || message.includes("403")) {
      return { error: "Invalid API key. Please check and try again." };
    }

    return { error: `Connection test failed: ${message}` };
  }
}

export async function deleteApiKey(): Promise<{ success: true } | { error: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "You must be signed in to remove an API key." };
    }

    const { error: updateError } = await supabase
      .from("user_settings")
      .update({
        gemini_api_key_encrypted: null,
        gemini_api_key_iv: null,
        gemini_api_key_tag: null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Failed to delete API key:", updateError);
      return { error: "Failed to remove API key. Please try again." };
    }

    return { success: true };
  } catch (err) {
    console.error("deleteApiKey error:", err);
    return { error: "An unexpected error occurred while removing the API key." };
  }
}
