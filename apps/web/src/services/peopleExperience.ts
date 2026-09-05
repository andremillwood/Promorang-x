import { supabase } from "@/integrations/supabase/client";
import { API_BASE_URL } from "@/lib/api";

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/experience${path}`, {
    ...init,
    headers: {
      ...(await authHeaders()),
      ...(init?.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.error || payload.message || "Could not load this yet");
  }
  return payload.data as T;
}

export const peopleExperienceApi = {
  home: () => request<Record<string, any>>("/home"),
  network: (sceneId?: string) => request<Record<string, any>>(`/network${sceneId ? `?sceneId=${sceneId}` : ""}`),
  perks: () => request<any[]>("/perks"),
  opportunities: (sceneId?: string) => request<any[]>(`/opportunities${sceneId ? `?sceneId=${sceneId}` : ""}`),
  happened: (sceneId?: string) => request<Record<string, any>>(`/happened${sceneId ? `?sceneId=${sceneId}` : ""}`),
  card: () => request<Record<string, any>>("/card"),
  drop: (slug: string) => request<Record<string, any>>(`/drops/${slug}`),
  createDrop: (body: Record<string, unknown>) => request<Record<string, any>>("/drops", { method: "POST", body: JSON.stringify(body) }),
  claimDrop: (slug: string) => request<Record<string, any>>(`/drops/${slug}/claim`, { method: "POST", body: "{}" }),
  takeOpportunity: (id: string, sceneId?: string) =>
    request<Record<string, any>>(`/opportunities/${encodeURIComponent(id)}/take`, { method: "POST", body: JSON.stringify({ sceneId }) }),
  provideInventory: (body: Record<string, unknown>) =>
    request<Record<string, any>>("/inventory", { method: "POST", body: JSON.stringify(body) }),
  hub: (slug: string) => request<Record<string, any>>(`/hubs/${slug}`),
  contribute: (slug: string, kind = "contributor") =>
    request<Record<string, any>>(`/hubs/${slug}/contribute`, { method: "POST", body: JSON.stringify({ kind }) }),
  invite: (slug: string) => request<Record<string, any>>(`/hubs/${slug}/invite`, { method: "POST", body: "{}" }),
  start: (body: Record<string, unknown>) => request<Record<string, any>>("/start", { method: "POST", body: JSON.stringify(body) }),
  ask: (body: Record<string, unknown>) => request<Record<string, any>>("/ask", { method: "POST", body: JSON.stringify(body) }),
  unlockDiscover: (body: Record<string, unknown>) =>
    request<Record<string, any>>("/discover/unlock", { method: "POST", body: JSON.stringify(body) }),
};
