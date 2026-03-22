"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import type { Platform } from "@/lib/types";

const PLATFORM_URL_PATTERNS: Record<Platform, (username: string) => string> = {
  instagram: (u) => `https://www.instagram.com/${u}/`,
  facebook: (u) => `https://www.facebook.com/${u}`,
  linkedin: (u) => `https://www.linkedin.com/company/${u}/`,
  tiktok: (u) => `https://www.tiktok.com/@${u}`,
  youtube: (u) => `https://www.youtube.com/@${u}`,
};

interface ProfileInput {
  platform: Platform;
  username: string;
}

export async function createClient(formData: {
  name: string;
  companyName?: string;
  profiles: ProfileInput[];
}): Promise<{ success: true; clientId: string } | { success: false; error: string }> {
  const { name, companyName, profiles } = formData;

  if (!name.trim()) {
    return { success: false, error: "Client name is required" };
  }

  // Check for duplicates
  const { data: existing } = await supabase
    .from("clients")
    .select("id")
    .ilike("name", name.trim())
    .limit(1);

  if (existing && existing.length > 0) {
    return { success: false, error: `A client named "${name.trim()}" already exists` };
  }

  // Insert client
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .insert({
      name: name.trim(),
      company_name: companyName?.trim() || null,
      is_active: true,
    })
    .select("id")
    .single();

  if (clientError || !client) {
    return { success: false, error: clientError?.message || "Failed to create client" };
  }

  // Insert profiles
  for (const profile of profiles) {
    if (!profile.username.trim()) continue;

    const profileUrl = PLATFORM_URL_PATTERNS[profile.platform](
      profile.username.trim()
    );

    const { error: profileError } = await supabase
      .from("social_profiles")
      .insert({
        client_id: client.id,
        platform: profile.platform,
        username: profile.username.trim(),
        profile_url: profileUrl,
        is_active: true,
      });

    if (profileError) {
      console.error(`Failed to create profile: ${profileError.message}`);
    }
  }

  revalidatePath("/clients");
  return { success: true, clientId: client.id };
}
