import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/api";

export type DemandStage = "discovery" | "interest" | "participation" | "conversion" | "review" | "referral" | "loyalty" | "advocacy" | "merchant_growth" | "community_growth";

export type DemandIntelligence = {
  plan: { id: string; title: string; measurement?: Record<string, unknown> };
  summary: {
    counts: Record<DemandStage, number>;
    rates: Record<string, number>;
    verified_conversions: number;
    verified_value: number;
    total_events: number;
    last_event_at: string | null;
  };
  benchmark: {
    eligible: boolean;
    campaign_count: number;
    reason?: string;
    current_rate?: number;
    cohort_median?: number;
    difference_points?: number;
  };
  events: Array<{
    id: string;
    event_type: string;
    stage: DemandStage;
    source_system: string;
    verified: boolean;
    value_amount?: number | null;
    value_currency?: string | null;
    occurred_at: string;
  }>;
};

export function useCampaignDemandIntelligence(campaignId?: string) {
  const { session } = useAuth();
  return useQuery<DemandIntelligence>({
    queryKey: ["campaign-demand-intelligence", campaignId],
    enabled: Boolean(campaignId && session?.access_token),
    retry: false,
    refetchInterval: 30_000,
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/demand-plans/campaign/${campaignId}/intelligence`, {
        headers: { Authorization: `Bearer ${session!.access_token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Campaign demand could not be measured");
      return payload;
    },
  });
}
