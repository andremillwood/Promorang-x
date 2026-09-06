import type { User } from "@supabase/supabase-js";
import { isPlaceholderDisplayName, resolvePersonName } from "@promorang/shared";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AccountProfile = Record<string, any> & {
  id?: string;
  user_id?: string;
  full_name?: string | null;
  display_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
};

export function identityFromAuthUser(user?: User | null) {
  const meta = (user?.user_metadata || {}) as Record<string, any>;
  return {
    fullName: meta.full_name || meta.name || meta.display_name || null,
    username: meta.user_name || meta.preferred_username || meta.username || null,
    avatarUrl: meta.avatar_url || meta.picture || null,
    email: user?.email || null,
  };
}

export async function fetchProfileRow(client: SupabaseClient, userId: string) {
  const byUser = await client.from("profiles").select("*").eq("user_id", userId).maybeSingle();
  if (byUser.data) return { data: byUser.data as AccountProfile, error: byUser.error };
  const byId = await client.from("profiles").select("*").eq("id", userId).maybeSingle();
  return { data: (byId.data as AccountProfile | null) || null, error: byUser.error || byId.error };
}

export function mergeAccountProfile(input: {
  profile?: AccountProfile | null;
  userRow?: Record<string, any> | null;
  authUser?: User | null;
}) {
  const auth = identityFromAuthUser(input.authUser);
  const real = (value?: string | null) => (isPlaceholderDisplayName(value) ? null : value);
  const resolvedName = resolvePersonName({
    displayName: real(input.profile?.display_name) || real(input.userRow?.display_name),
    fullName: real(input.profile?.full_name) || real(input.userRow?.full_name) || auth.fullName,
    username: real(input.profile?.username) || real(input.userRow?.username) || auth.username,
    email: auth.email,
    fallback: "",
  }) || null;

  return {
    ...(input.userRow || {}),
    ...(input.profile || {}),
    id: input.profile?.id || input.authUser?.id,
    user_id: input.profile?.user_id || input.authUser?.id,
    full_name: resolvedName,
    display_name: resolvedName,
    username: input.profile?.username || input.userRow?.username || auth.username,
    avatar_url: input.profile?.avatar_url || input.userRow?.avatar_url || auth.avatarUrl,
  } as AccountProfile;
}

export async function ensureAccountProfile(
  client: SupabaseClient,
  userId: string,
  identity: ReturnType<typeof identityFromAuthUser>,
) {
  const existing = await fetchProfileRow(client, userId);
  if (existing.data) {
    const missingName =
      isPlaceholderDisplayName(existing.data.full_name) &&
      isPlaceholderDisplayName(existing.data.display_name);
    if (!missingName || !identity.fullName) return existing.data;
    const key = existing.data.user_id ? "user_id" : "id";
    const value = existing.data.user_id || existing.data.id;
    const { data } = await client
      .from("profiles")
      .update({
        full_name: identity.fullName,
        display_name: identity.fullName,
        avatar_url: existing.data.avatar_url || identity.avatarUrl,
      })
      .eq(key, value)
      .select("*")
      .maybeSingle();
    return (data as AccountProfile) || existing.data;
  }

  const { data, error } = await client
    .from("profiles")
    .insert({
      id: userId,
      user_id: userId,
      full_name: identity.fullName,
      display_name: identity.fullName,
      username: identity.username,
      avatar_url: identity.avatarUrl,
    } as any)
    .select("*")
    .maybeSingle();

  if (error) {
    console.warn("[account-profile] Could not create missing profile row:", error.message);
    return null;
  }
  return data as AccountProfile | null;
}
