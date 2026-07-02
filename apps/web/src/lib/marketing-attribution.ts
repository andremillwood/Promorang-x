import { API_BASE_URL } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "promorang_marketing_intent";

export type MarketingIntent = {
  action: string;
  audience?: string;
  destination: string;
  sourcePath: string;
  capturedAt: string;
  referrer?: string;
  campaign?: Record<string, string>;
};

function campaignParams() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].reduce<Record<string, string>>((result, key) => {
    const value = params.get(key);
    if (value) result[key] = value;
    return result;
  }, {});
}

export function rememberMarketingIntent(action: string, destination: string, audience?: string) {
  if (typeof window === "undefined") return;
  const intent: MarketingIntent = {
    action,
    audience,
    destination,
    sourcePath: `${window.location.pathname}${window.location.search}`,
    capturedAt: new Date().toISOString(),
    referrer: document.referrer || undefined,
    campaign: campaignParams(),
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(intent));
}

export async function flushMarketingIntent() {
  if (typeof window === "undefined") return;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  const { data } = await supabase.auth.getSession();
  if (!data.session?.access_token) return;

  let intent: MarketingIntent;
  try {
    intent = JSON.parse(raw) as MarketingIntent;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return;
  }

  const response = await fetch(`${API_BASE_URL}/revenue-funnels/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${data.session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      funnel: "campaign",
      stage: "captured",
      entityType: "marketing_intent",
      source: "web",
      sessionId: data.session.user.id,
      metadata: intent,
      idempotencyKey: `marketing-intent:${data.session.user.id}:${intent.capturedAt}`,
    }),
  });

  if (response.ok) sessionStorage.removeItem(STORAGE_KEY);
}
