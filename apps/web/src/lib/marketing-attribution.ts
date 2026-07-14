import { API_BASE_URL } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";

const INTENT_KEY = "promorang_marketing_intent";
const ATTRIBUTION_KEY = "promorang_growth_attribution";
const ANONYMOUS_KEY = "promorang_anonymous_id";
const SESSION_KEY = "promorang_growth_session_id";
const PENDING_SIGNUP_KEY = "promorang_pending_signup";
const EXPERIMENT_KEY = "promorang_growth_experiments";

export type AttributionTouch = {
  capturedAt: string;
  sourcePath: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referral_code?: string;
  promopush_campaign_id?: string;
  promopush_channel_id?: string;
  promopush_tracking_code?: string;
};

export type GrowthAttribution = {
  firstTouch: AttributionTouch;
  lastTouch: AttributionTouch;
};

export type MarketingIntent = {
  action: string;
  audience?: string;
  destination: string;
  sourcePath: string;
  capturedAt: string;
  referrer?: string;
  campaign?: Record<string, string>;
};

function id(prefix: string) {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${random}`;
}

export function getAnonymousId() {
  if (typeof window === "undefined") return "server";
  let value = localStorage.getItem(ANONYMOUS_KEY);
  if (!value) {
    value = id("anon");
    localStorage.setItem(ANONYMOUS_KEY, value);
  }
  return value;
}

export function getGrowthSessionId() {
  if (typeof window === "undefined") return "server";
  let value = sessionStorage.getItem(SESSION_KEY);
  if (!value) {
    value = id("session");
    sessionStorage.setItem(SESSION_KEY, value);
  }
  return value;
}

function currentTouch(): AttributionTouch {
  const params = new URLSearchParams(window.location.search);
  const referralCode = params.get("ref") || params.get("referral") || params.get("referral_code");
  return {
    capturedAt: new Date().toISOString(),
    sourcePath: `${window.location.pathname}${window.location.search}`,
    referrer: document.referrer || undefined,
    utm_source: params.get("utm_source") || undefined,
    utm_medium: params.get("utm_medium") || undefined,
    utm_campaign: params.get("utm_campaign") || undefined,
    utm_content: params.get("utm_content") || undefined,
    utm_term: params.get("utm_term") || undefined,
    referral_code: referralCode?.trim().toUpperCase() || undefined,
    promopush_campaign_id: params.get("promopush_campaign_id") || params.get("pp_campaign") || undefined,
    promopush_channel_id: params.get("promopush_channel_id") || params.get("pp_channel") || undefined,
    promopush_tracking_code: params.get("promopush_tracking_code") || params.get("pp") || undefined,
  };
}

export function captureGrowthAttribution() {
  if (typeof window === "undefined") return null;
  const touch = currentTouch();
  let existing: GrowthAttribution | null = null;
  try {
    existing = JSON.parse(localStorage.getItem(ATTRIBUTION_KEY) || "null");
  } catch {
    localStorage.removeItem(ATTRIBUTION_KEY);
  }

  const hasCampaignSignal = Boolean(
    touch.utm_source || touch.utm_medium || touch.utm_campaign || touch.referral_code ||
    touch.promopush_campaign_id || touch.promopush_channel_id || touch.promopush_tracking_code
  );
  const attribution: GrowthAttribution = existing
    ? { firstTouch: existing.firstTouch, lastTouch: hasCampaignSignal ? touch : existing.lastTouch }
    : { firstTouch: touch, lastTouch: touch };
  localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  getAnonymousId();
  getGrowthSessionId();
  return attribution;
}

export function getGrowthAttribution(): GrowthAttribution | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(ATTRIBUTION_KEY) || "null");
  } catch {
    return null;
  }
}

export function getGrowthSignupMetadata() {
  const attribution = captureGrowthAttribution();
  return {
    anonymous_id: getAnonymousId(),
    referral_code: attribution?.firstTouch.referral_code || attribution?.lastTouch.referral_code,
    first_touch: attribution?.firstTouch,
    last_touch: attribution?.lastTouch,
  };
}

export function markPendingSignup() {
  if (typeof window !== "undefined") localStorage.setItem(PENDING_SIGNUP_KEY, new Date().toISOString());
}

type GrowthEventInput = {
  eventName: string;
  journey: "participant" | "commercial" | "shared";
  stage: "acquired" | "captured" | "activated" | "outcome" | "amplified" | "monetized" | "retained";
  momentId?: string;
  entityType?: string;
  entityId?: string;
  experimentKey?: string;
  experimentVariant?: string;
  value?: number;
  currency?: string;
  properties?: Record<string, unknown>;
  idempotencyKey?: string;
};

export async function trackGrowthEvent(input: GrowthEventInput) {
  if (typeof window === "undefined") return;
  const attribution = captureGrowthAttribution();
  const touch = attribution?.lastTouch;
  const { data } = await supabase.auth.getSession();
  const response = await fetch(`${API_BASE_URL}/growth-ops/events`, {
    method: "POST",
    keepalive: true,
    headers: {
      "Content-Type": "application/json",
      ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}),
    },
    body: JSON.stringify({
      ...input,
      anonymousId: getAnonymousId(),
      sessionId: getGrowthSessionId(),
      source: touch?.utm_source || (touch?.referral_code ? "referral" : "direct"),
      medium: touch?.utm_medium || (touch?.referral_code ? "referral" : "none"),
      campaign: touch?.utm_campaign,
      content: touch?.utm_content,
      term: touch?.utm_term,
      referralCode: touch?.referral_code,
      promoPushCampaignId: touch?.promopush_campaign_id,
      promoPushChannelId: touch?.promopush_channel_id,
      referrerUrl: touch?.referrer,
    }),
  });
  if (!response.ok && import.meta.env.DEV) {
    console.warn("[Growth] Event was not accepted", input.eventName, response.status);
  }
}

export async function getExperimentAssignment(experimentKey: string) {
  if (typeof window === "undefined") return null;
  let assignments: Record<string, string> = {};
  try {
    assignments = JSON.parse(localStorage.getItem(EXPERIMENT_KEY) || "{}");
  } catch {
    localStorage.removeItem(EXPERIMENT_KEY);
  }
  if (assignments[experimentKey]) return assignments[experimentKey];
  const { data } = await supabase.auth.getSession();
  const response = await fetch(`${API_BASE_URL}/growth-ops/experiments/${encodeURIComponent(experimentKey)}/assignment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}),
    },
    body: JSON.stringify({ anonymousId: getAnonymousId() }),
  });
  if (!response.ok) return null;
  const payload = await response.json();
  const variant = payload.data?.variant || null;
  if (variant) {
    assignments[experimentKey] = variant;
    localStorage.setItem(EXPERIMENT_KEY, JSON.stringify(assignments));
  }
  return variant;
}

export async function stitchGrowthIdentity() {
  if (typeof window === "undefined") return;
  const attribution = captureGrowthAttribution();
  const { data } = await supabase.auth.getSession();
  if (!data.session?.access_token) return;
  await fetch(`${API_BASE_URL}/growth-ops/identity`, {
    method: "POST",
    headers: { Authorization: `Bearer ${data.session.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      anonymousId: getAnonymousId(), firstTouch: attribution?.firstTouch || {}, lastTouch: attribution?.lastTouch || {},
    }),
  });
}

export async function claimStoredReferral() {
  if (typeof window === "undefined") return;
  const attribution = captureGrowthAttribution();
  const referralCode = attribution?.firstTouch.referral_code || attribution?.lastTouch.referral_code;
  if (!referralCode) return;
  const { data } = await supabase.auth.getSession();
  if (!data.session?.access_token) return;
  await fetch(`${API_BASE_URL}/growth-ops/claim-referral`, {
    method: "POST",
    headers: { Authorization: `Bearer ${data.session.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ referralCode, anonymousId: getAnonymousId(), attribution: attribution.firstTouch, source: "web" }),
  });
}

export async function flushGrowthAfterAuth() {
  await stitchGrowthIdentity();
  await claimStoredReferral();
  const pendingSignup = localStorage.getItem(PENDING_SIGNUP_KEY);
  if (pendingSignup) {
    await trackGrowthEvent({
      eventName: "signup_completed", journey: "participant", stage: "captured",
      idempotencyKey: `growth:signup:${getAnonymousId()}`,
    });
    localStorage.removeItem(PENDING_SIGNUP_KEY);
  }
}

export function rememberMarketingIntent(action: string, destination: string, audience?: string) {
  if (typeof window === "undefined") return;
  const attribution = captureGrowthAttribution();
  const intent: MarketingIntent = {
    action, audience, destination,
    sourcePath: `${window.location.pathname}${window.location.search}`,
    capturedAt: new Date().toISOString(),
    referrer: document.referrer || undefined,
    campaign: Object.fromEntries(Object.entries(attribution?.lastTouch || {}).filter(([key, value]) => key.startsWith("utm_") && value)) as Record<string, string>,
  };
  sessionStorage.setItem(INTENT_KEY, JSON.stringify(intent));
  void trackGrowthEvent({
    eventName: "cta_clicked", journey: audience === "brand" || audience === "host" ? "commercial" : "participant",
    stage: "captured", entityType: "marketing_cta", entityId: action,
    properties: { destination, audience },
  });
}

// Backward-compatible bridge for the existing revenue funnel intent record.
export async function flushMarketingIntent() {
  if (typeof window === "undefined") return;
  await flushGrowthAfterAuth();
  const raw = sessionStorage.getItem(INTENT_KEY);
  if (!raw) return;
  const { data } = await supabase.auth.getSession();
  if (!data.session?.access_token) return;
  const intent = JSON.parse(raw) as MarketingIntent;
  const response = await fetch(`${API_BASE_URL}/revenue-funnels/events`, {
    method: "POST",
    headers: { Authorization: `Bearer ${data.session.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      funnel: "campaign", stage: "captured", entityType: "marketing_intent", source: "web",
      sessionId: getGrowthSessionId(), metadata: intent,
      idempotencyKey: `marketing-intent:${data.session.user.id}:${intent.capturedAt}`,
    }),
  });
  if (response.ok) sessionStorage.removeItem(INTENT_KEY);
}
