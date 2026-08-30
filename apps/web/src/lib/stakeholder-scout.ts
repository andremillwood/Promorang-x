import { API_BASE_URL } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";

export type ScoutCandidate = {
  id: string;
  candidate_key: string;
  kind: "venue" | "merchant" | "brand" | "product";
  display_name: string;
  hub_id: string;
  neighborhood?: string | null;
  category_clusters?: string[];
  job?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  website?: string | null;
  status: string;
  recommendation?: string | null;
  score: number;
  score_breakdown?: Record<string, number>;
  reasons?: string[];
  blockers?: string[];
  preferred_channel: string;
  moment_title?: string | null;
  moment_starts_at?: string | null;
  invite_subject?: string | null;
  invite_body?: string | null;
  claim_path?: string | null;
  review_note?: string | null;
  auto_send?: boolean;
  send_allowed?: boolean;
};

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

async function parseJson(res: Response) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
  return json.data ?? json;
}

export async function listScoutQueue(input?: { hub?: string; status?: string }) {
  const qs = new URLSearchParams();
  if (input?.hub) qs.set("hub", input.hub);
  if (input?.status) qs.set("status", input.status);
  const res = await fetch(`${API_BASE_URL}/stakeholder-scout/queue?${qs}`, {
    headers: await authHeaders(),
  });
  return parseJson(res) as Promise<{ autoSend: false; candidates: ScoutCandidate[] }>;
}

export async function ingestScoutCatalog(asOf?: string) {
  const res = await fetch(`${API_BASE_URL}/stakeholder-scout/ingest`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(asOf ? { asOf } : {}),
  });
  return parseJson(res);
}

export async function nominateScoutCandidate(payload: Record<string, unknown>) {
  const res = await fetch(`${API_BASE_URL}/stakeholder-scout/nominate`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseJson(res);
}

export async function approveScoutCandidate(id: string, note?: string) {
  const res = await fetch(`${API_BASE_URL}/stakeholder-scout/${id}/approve`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ note }),
  });
  return parseJson(res);
}

export async function rejectScoutCandidate(id: string, note?: string) {
  const res = await fetch(`${API_BASE_URL}/stakeholder-scout/${id}/reject`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ note }),
  });
  return parseJson(res);
}

export async function draftScoutInvite(id: string) {
  const res = await fetch(`${API_BASE_URL}/stakeholder-scout/${id}/draft`, {
    method: "POST",
    headers: await authHeaders(),
  });
  return parseJson(res) as Promise<{
    candidate: ScoutCandidate;
    draft: { subject: string; body: string; claimPath: string; preferredChannel: string; sendAllowed: false };
    autoSend: false;
  }>;
}

export async function recordScoutHumanSend(id: string, channel: string, note?: string) {
  const res = await fetch(`${API_BASE_URL}/stakeholder-scout/${id}/record-send`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ channel, note }),
  });
  return parseJson(res);
}

export async function suppressScoutCandidate(id: string, reason?: string) {
  const res = await fetch(`${API_BASE_URL}/stakeholder-scout/${id}/suppress`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ reason }),
  });
  return parseJson(res);
}
