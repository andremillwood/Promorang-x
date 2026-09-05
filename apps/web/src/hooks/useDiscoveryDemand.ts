import { supabase } from "@/integrations/supabase/client";

const ANON_KEY = "promorang.discover.anon";

export function readDiscoverAnonId(): string {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(ANON_KEY);
  if (existing) return existing;
  const next = crypto.randomUUID();
  window.localStorage.setItem(ANON_KEY, next);
  return next;
}

export async function recordDiscoveryNamedIntent(city: string, query: string): Promise<boolean> {
  try {
    const { error } = await (supabase as any).rpc("record_discovery_named_intent", {
      p_city: city,
      p_query: query,
      p_anonymous_id: readDiscoverAnonId() || null,
    });
    return !error;
  } catch {
    return false;
  }
}
