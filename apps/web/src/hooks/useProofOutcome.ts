import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "https://api.promorang.co";

export type ProofOutcomeScope = "moment" | "host" | "campaign";

export interface ProofOutcomeMoment {
  id: string;
  title: string;
  starts_at?: string | null;
  venue_name?: string | null;
  joins: number;
  check_ins?: number;
  verified_proofs: number;
  pending_proofs?: number;
  approved_content?: number;
  reward_units: number;
  spend_usd?: number;
}

export interface ProofOutcomeData {
  scope: ProofOutcomeScope;
  entity: Record<string, any> | null;
  label: string;
  chain: {
    action: { label: string; value: number; helper: string };
    verification: { label: string; value: number; helper: string };
    outcome: { label: string; value: number; helper: string };
    repeatability: { label: string; value: number; helper: string };
  };
  metrics: {
    joins: number;
    check_ins: number;
    verified_proofs: number;
    pending_proofs: number;
    rejected_proofs: number;
    approved_content: number;
    pending_content: number;
    rejected_content: number;
    reward_units: number;
    proof_completion_rate: number;
    content_approval_rate: number;
  };
  top_moments: ProofOutcomeMoment[];
  spend_usd?: number;
  spend_per_verified_proof?: number;
}

async function fetchProofOutcome(path: string, token: string) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Failed to load proof outcome");
  }

  return payload as ProofOutcomeData;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function useMomentProofOutcome(momentId?: string | null) {
  const { session } = useAuth();
  const isValidUuid = Boolean(momentId && UUID_PATTERN.test(momentId));

  return useQuery({
    queryKey: ["proof-outcome", "moment", momentId],
    enabled: Boolean(session?.access_token && isValidUuid),
    queryFn: () => fetchProofOutcome(`/api/analytics/proof-outcome/moments/${momentId}`, session!.access_token),
  });
}

export function useHostProofOutcome() {
  const { session } = useAuth();

  return useQuery({
    queryKey: ["proof-outcome", "host"],
    enabled: !!session?.access_token,
    queryFn: () => fetchProofOutcome("/api/analytics/proof-outcome/host", session!.access_token),
  });
}

export function useCampaignProofOutcome(campaignId?: string | null) {
  const { session } = useAuth();

  return useQuery({
    queryKey: ["proof-outcome", "campaign", campaignId],
    enabled: !!session?.access_token && !!campaignId,
    queryFn: () => fetchProofOutcome(`/api/analytics/proof-outcome/brand/campaigns/${campaignId}`, session!.access_token),
  });
}
