import { API_BASE_URL } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { captureGrowthAttribution, getAnonymousId } from "@/lib/marketing-attribution";
import type { BusinessOutcomeBrief } from "@/lib/business-outcomes";

export type FunnelKind = "participant" | "operator" | "brand";
export type FunnelStage = "reserved" | "verified" | "account" | "invited" | "returned" | "brief_captured" | "published" | "first_customer" | "repeat_activation" | "pilot_scoped" | "funded" | "outcome_report" | "renewed";
export type FunnelEvidence = { entity_type: string; entity_id: string; occurred_at: string };
export type FunnelProgress = { funnel: FunnelKind; nextStage: FunnelStage | null; stages: Array<{ stage: FunnelStage; complete: boolean; evidence: FunnelEvidence | null }> };
export type FunnelInvitation = { id: string; title: string; kind: "moment" | "offer"; startsAt: string | null; location: string; city: string; category?: string; href: string };
export type CampaignOutcomeReport = {
  campaign: { id: string; title: string; description: string | null; isActive: boolean };
  metrics: { attendance: number; redemptions: number; purchases: number; acceptedProofs: number; returningPeople: number; lastOutcomeAt: string | null };
  funding: { funded: boolean; securedGems: number; releasedGems: number; refundedGems: number };
  canRenew: boolean;
};

export async function funnelRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}), ...options.headers },
  });
  const payload = await response.json();
  if (!response.ok || payload.success === false) throw new Error(payload.error || "This action could not be completed");
  return payload.data;
}

export async function captureBusinessBrief(brief: BusinessOutcomeBrief, contact: { email: string; fullName: string; organizationName: string; phone: string; marketingConsent: boolean; website: string }) {
  const result = await funnelRequest<{ leadId: string; saved: boolean }>("/leads/brief", {
    method: "POST", body: JSON.stringify({ brief, ...contact, attribution: captureGrowthAttribution()?.lastTouch || {}, anonymousId: getAnonymousId(), landingPath: `${window.location.pathname}${window.location.search}` }),
  });
  if (!result?.saved || !result.leadId) throw new Error("The brief was not saved");
  return result;
}

export function funnelNextHref(progress: FunnelProgress): string {
  const evidence = (stage: FunnelStage) => progress.stages.find(item => item.stage === stage)?.evidence;
  if (progress.funnel === "participant") {
    const source = evidence("verified") || evidence("reserved");
    if (progress.nextStage === "verified" && source) return source.entity_type === "offer" ? "/my-promocard" : `/moments/${source.entity_id}`;
    if (source?.entity_type === "moment") return `/journey?moment=${source.entity_id}`;
    if (source?.entity_type === "offer") return `/journey?offer=${source.entity_id}`;
    return "/discover";
  }
  if (progress.nextStage === "brief_captured") return "/business/start";
  if (progress.funnel === "operator") {
    if (progress.nextStage === "first_customer") {
      const source = evidence("published");
      return source?.entity_type === "moment" ? `/host/moments/${source.entity_id}/guests` : "/offers";
    }
    return "/business/start?resume=1";
  }
  const campaign = evidence("funded") || evidence("pilot_scoped");
  if (campaign && (progress.nextStage === "funded" || progress.nextStage === "outcome_report")) return `/dashboard/campaigns/${campaign.entity_id}`;
  const report = evidence("outcome_report");
  if (report && progress.nextStage === "renewed") return `/create/campaign?renew=${report.entity_id}`;
  return "/create/campaign?from=business-outcome";
}
