import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "";

export type OfferDistribution = {
  channel: "direct" | "moment" | "content" | "promoshare" | "campaign" | "referral" | "manual";
  trigger_event: string;
  source_id?: string | null;
  source_label?: string | null;
  qualification_rules?: Record<string, unknown>;
  allocation_limit?: number | null;
  is_active?: boolean;
};

export type Offer = {
  id: string;
  title: string;
  description?: string | null;
  terms?: string | null;
  reward_type: string;
  fulfillment_type: string;
  value_amount?: number | null;
  value_currency?: string | null;
  quantity_total?: number | null;
  quantity_reserved: number;
  quantity_redeemed: number;
  status: string;
  starts_at: string;
  ends_at?: string | null;
  offer_distributions?: OfferDistribution[];
  offer_issuances?: Array<{ id: string; status: string }>;
};

export type OfferIssuance = {
  id: string;
  status: string;
  redemption_code: string;
  issued_at: string;
  expires_at?: string | null;
  offers: Offer;
};

async function request<T>(path: string, token?: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}/api/offers${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const payload = await response.json();
  if (!response.ok || !payload.success) throw new Error(payload.error || "Offer request failed");
  return payload.data;
}

export function useOwnerOffers() {
  const { session } = useAuth();
  return useQuery({
    queryKey: ["offers", "mine"],
    queryFn: () => request<Offer[]>("/mine", session?.access_token),
    enabled: !!session?.access_token,
  });
}

export function usePublicOffers() {
  return useQuery({
    queryKey: ["offers", "public"],
    queryFn: () => request<Offer[]>("/public?channel=direct"),
  });
}

export function useOfferWallet() {
  const { session } = useAuth();
  return useQuery({
    queryKey: ["offers", "wallet"],
    queryFn: () => request<OfferIssuance[]>("/wallet", session?.access_token),
    enabled: !!session?.access_token,
  });
}

export function useCreateOffer() {
  const { session } = useAuth();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => request<Offer>("", session?.access_token, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["offers"] }),
  });
}

export function useUpdateOffer() {
  const { session } = useAuth();
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) => request<Offer>(`/${id}`, session?.access_token, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["offers"] }),
  });
}

export function useClaimIssuance() {
  const { session } = useAuth();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => request<OfferIssuance>(`/issuances/${id}/claim`, session?.access_token, { method: "POST" }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["offers", "wallet"] }),
  });
}

export function useDirectOfferClaim() {
  const { session } = useAuth();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => request<OfferIssuance>(`/${id}/claim`, session?.access_token, { method: "POST" }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["offers"] }),
  });
}

export function useRedeemOffer() {
  const { session } = useAuth();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: { code: string; venue_id?: string; notes?: string }) => request<OfferIssuance>("/redeem", session?.access_token, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["offers"] }),
  });
}
