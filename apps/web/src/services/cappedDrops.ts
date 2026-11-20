import { API_BASE_URL } from "@/lib/api";

export type CappedDropPayload = {
  id: string;
  slug: string;
  title: string;
  cap: number;
  claimed_count: number;
  remaining: number;
  status: string;
  sold_out_at?: string | null;
  opens_at?: string | null;
  closes_at?: string | null;
  already_claimed?: boolean;
  moment_id?: string | null;
};

async function readPayload(response: Response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    const error = new Error(payload.error || "");
    (error as Error & { status?: number; code?: string }).status = response.status;
    (error as Error & { code?: string }).code = payload.code;
    throw error;
  }
  return payload.data;
}

function headers(token?: string | null) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function fetchCappedDrop(slug: string, token?: string | null) {
  return fetch(`${API_BASE_URL}/capped-drops/${encodeURIComponent(slug)}`, {
    headers: headers(token),
  }).then(readPayload) as Promise<CappedDropPayload>;
}

export function claimCappedDrop(slug: string, token: string) {
  return fetch(`${API_BASE_URL}/capped-drops/${encodeURIComponent(slug)}/claim`, {
    method: "POST",
    headers: headers(token),
    body: "{}",
  }).then(readPayload);
}

export function notifyNextCappedDrop(token: string) {
  return fetch(`${API_BASE_URL}/capped-drops/next-notice`, {
    method: "POST",
    headers: headers(token),
    body: "{}",
  }).then(readPayload);
}

export function createCappedDrop(token: string, body: { title: string; cap?: number; moment_id?: string | null }) {
  return fetch(`${API_BASE_URL}/capped-drops`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify(body),
  }).then(readPayload) as Promise<CappedDropPayload>;
}
