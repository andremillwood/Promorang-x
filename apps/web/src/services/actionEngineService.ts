import { supabase } from "@/integrations/supabase/client";
import { Action, ActionCompletion, UserActivation, GemLedgerEntry } from "@promorang/shared";

export async function fetchSceneBySlug(slug: string) {
  const { data, error } = await supabase
    .from("scenes" as any)
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching scene:", error);
    return null;
  }

  return data;
}

export async function fetchActionsBySceneId(sceneId: string) {
  const { data, error } = await supabase
    .from("actions" as any)
    .select("*")
    .eq("scene_id", sceneId)
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching actions:", error);
    return [];
  }

  return data;
}

export async function fetchActionBySlug(slug: string) {
  const { data, error } = await supabase
    .from("actions" as any)
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching action by slug:", error);
    return null;
  }

  return data;
}

export async function submitActionCompletion(
  actionId: string,
  userId: string,
  proofData: Record<string, unknown>,
  referrerId?: string
) {
  const { data, error } = await supabase.rpc("record_action_completion" as any, {
    p_action_id: actionId,
    p_user_id: userId,
    p_proof_data: proofData,
    p_referrer_id: referrerId || null
  });

  if (error) {
    console.error("Error recording action completion:", error);
    throw error;
  }

  return data;
}

export async function getUserActivationStatus(userId: string) {
  const { data, error } = await supabase
    .from("user_activations" as any)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user activation:", error);
    return null;
  }

  return data as UserActivation | null;
}
