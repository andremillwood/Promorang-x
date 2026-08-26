import { API_BASE_URL } from "@/lib/api";
import {
  captureGrowthAttribution,
  getAnonymousId,
  getGrowthAttribution,
} from "@/lib/marketing-attribution";
import { supabase } from "@/integrations/supabase/client";

export type DiscoveryChoice = {
  id: string;
  label: string;
  description?: string | null;
  imageUrl?: string | null;
  icon?: string | null;
  sortOrder: number;
  momentId?: string | null;
  destinationUrl?: string | null;
  metadata?: Record<string, unknown>;
  votesCount?: number;
  votePct?: number;
  rank?: number;
};

export type AcquisitionDiscovery = {
  id: string;
  slug: string;
  title: string;
  eyebrow?: string | null;
  description?: string | null;
  coverImageUrl?: string | null;
  discoveryType: string;
  maxSelections: number;
  sceneId?: string | null;
  relatedMomentId?: string | null;
  status: string;
  captureRequired: boolean;
  resultsVisibility: string;
  allowRepeatVotes: boolean;
  indexable: boolean;
  primaryNextAction: string;
  nextActionLabel?: string | null;
  nextActionDestination?: string | null;
  nextActionConfig?: {
    prompt?: string;
    options?: Array<{ value: string; label: string }>;
    going_routes_to_moment?: boolean;
    secondary_actions?: string[];
    template?: string;
  };
  rewardPoints: number;
  partnerAttribution?: {
    venue?: string;
    creator?: string;
    event?: string;
    attribution_line?: string;
  };
  shareCopyTemplate?: string | null;
  seoTitle?: string;
  seoDescription?: string | null;
  ogImageUrl?: string | null;
  totalVotes?: number;
  totalCaptures?: number;
  choices: DiscoveryChoice[];
  results?: {
    totalVotes: number;
    leader: { id: string; label: string; votePct: number; rank: number } | null;
    selected: Array<{ id: string; label: string; votePct: number; rank: number; votesCount: number }>;
    headline: string;
  } | null;
};

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

function attributionPayload() {
  captureGrowthAttribution();
  const params = new URLSearchParams(window.location.search);
  const attribution = getGrowthAttribution();
  return {
    anonymousId: getAnonymousId(),
    source: params.get("src") || params.get("source") || attribution?.lastTouch.utm_source || undefined,
    campaign: params.get("campaign") || params.get("utm_campaign") || attribution?.lastTouch.utm_campaign || undefined,
    referrerUrl: document.referrer || undefined,
    ref: params.get("ref") || undefined,
    utm: {
      utm_source: params.get("utm_source") || attribution?.lastTouch.utm_source,
      utm_medium: params.get("utm_medium") || attribution?.lastTouch.utm_medium,
      utm_campaign: params.get("utm_campaign") || attribution?.lastTouch.utm_campaign,
      utm_content: params.get("utm_content") || attribution?.lastTouch.utm_content,
      utm_term: params.get("utm_term") || attribution?.lastTouch.utm_term,
    },
  };
}

async function parseJson(res: Response) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
  return json.data ?? json;
}

export async function loadDiscovery(slug: string) {
  const attr = attributionPayload();
  const qs = new URLSearchParams({
    anonymousId: attr.anonymousId,
    ...(attr.source ? { src: attr.source } : {}),
    ...(attr.campaign ? { campaign: attr.campaign } : {}),
    ...(attr.ref ? { ref: attr.ref } : {}),
    ...(attr.utm.utm_source ? { utm_source: attr.utm.utm_source } : {}),
    ...(attr.utm.utm_medium ? { utm_medium: attr.utm.utm_medium } : {}),
    ...(attr.utm.utm_campaign ? { utm_campaign: attr.utm.utm_campaign } : {}),
  });
  const res = await fetch(`${API_BASE_URL}/d/${encodeURIComponent(slug)}?${qs}`, {
    headers: await authHeaders(),
  });
  return parseJson(res) as Promise<{
    discovery: AcquisitionDiscovery;
    session: { id: string; anonymousId: string; voted: boolean; captured: boolean; userId?: string | null };
    response: { id: string; choiceIds: string[]; isCaptured: boolean; pointsAwarded: number } | null;
  }>;
}

export async function voteDiscovery(slug: string, choiceIds: string[]) {
  const res = await fetch(`${API_BASE_URL}/d/${encodeURIComponent(slug)}/vote`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ ...attributionPayload(), choiceIds }),
  });
  return parseJson(res);
}

export async function captureDiscovery(
  slug: string,
  input: { phone?: string; email?: string; displayName?: string }
) {
  const res = await fetch(`${API_BASE_URL}/d/${encodeURIComponent(slug)}/capture`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ ...attributionPayload(), ...input }),
  });
  return parseJson(res);
}

export async function shareDiscovery(slug: string, channel = "whatsapp") {
  const res = await fetch(`${API_BASE_URL}/d/${encodeURIComponent(slug)}/share`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ ...attributionPayload(), channel }),
  });
  return parseJson(res) as Promise<{ text: string; link: string; whatsapp: string; choiceLabel: string }>;
}

export async function discoveryNextAction(
  slug: string,
  input: { actionType?: string; actionValue?: string; destination?: string; momentId?: string }
) {
  const res = await fetch(`${API_BASE_URL}/d/${encodeURIComponent(slug)}/action`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ ...attributionPayload(), ...input }),
  });
  return parseJson(res) as Promise<{ action: unknown; destination?: string }>;
}

export async function listDiscoveriesAdmin() {
  const res = await fetch(`${API_BASE_URL}/d/admin/list`, { headers: await authHeaders() });
  return parseJson(res);
}

export async function upsertDiscoveryAdmin(payload: Record<string, unknown>) {
  const id = payload.id as string | undefined;
  const res = await fetch(id ? `${API_BASE_URL}/d/admin/${id}` : `${API_BASE_URL}/d/admin`, {
    method: id ? "PUT" : "POST",
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseJson(res);
}

export async function getDiscoveryAnalytics(idOrSlug: string) {
  const res = await fetch(`${API_BASE_URL}/d/admin/${encodeURIComponent(idOrSlug)}/analytics`, {
    headers: await authHeaders(),
  });
  return parseJson(res);
}

export async function getDiscoveryAdmin(idOrSlug: string) {
  const res = await fetch(`${API_BASE_URL}/d/admin/${encodeURIComponent(idOrSlug)}`, {
    headers: await authHeaders(),
  });
  return parseJson(res);
}
