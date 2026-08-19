import { supabase } from "@/integrations/supabase/client";
import { API_BASE_URL } from "@/lib/api";
import { getAnonymousId } from "@/lib/marketing-attribution";

export type PresentsExperience = {
  id: string;
  slug: string;
  title: string;
  event_name: string;
  event_date?: string | null;
  venue_name?: string | null;
  category: string;
  description?: string | null;
  unlock_label?: string | null;
  quantity: number;
  claimed_count: number;
  promo_keys_required: number;
  promo_points_required: number;
  referrals_required: number;
  mission_requirements: string[];
  redemption_rules?: string | null;
  status: string;
  metadata?: Record<string, string>;
};

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/presents${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(await authHeaders()), ...(init?.headers || {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Promorang Presents is temporarily unavailable");
  return payload.data as T;
}

export const getPresentsCatalog = () => request<{ program: Record<string, any>; experiences: PresentsExperience[] }>("/catalog");

export const redeemPresentsInvite = (code: string) => request<{ membership_id: string; program_slug: string; tier: string; already_member: boolean; invite_codes: string[] }>("/redeem", {
  method: "POST",
  body: JSON.stringify({ code, anonymousId: getAnonymousId(), sourcePath: `${location.pathname}${location.search}` }),
});

export const getMyPresents = () => request<{ membership: Record<string, any> | null; invite_codes: Array<{ id: string; code: string; status: string; max_uses: number; used_count: number }>; claims: Array<Record<string, any>> }>(`/me?anonymousId=${encodeURIComponent(getAnonymousId())}`);

export const claimPresentsExperience = (experienceId: string) => request<{ claim_id: string; credential_code: string; status: string }>(`/experiences/${experienceId}/claim`, { method: "POST", body: "{}" });

export const getPresentsAdmin = () => request<Record<string, any[]>>("/admin/overview");
export const createPresentsCode = (input: Record<string, unknown>) => request<Record<string, any>>("/admin/codes", { method: "POST", body: JSON.stringify(input) });
export const updatePresentsClaim = (id: string, status: string) => request<Record<string, any>>(`/admin/claims/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
