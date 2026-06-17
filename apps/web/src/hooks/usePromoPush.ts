import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type PromoPushChannelType =
  | "qr_code"
  | "meta_ads"
  | "direct_link"
  | "creator_link"
  | "street_activation";

export type PromoPushEventType =
  | "impression"
  | "click"
  | "scan"
  | "join"
  | "move_completed"
  | "proof_submitted"
  | "proof_verified"
  | "reward_issued"
  | "geo_interaction";

export type PromoPushMomentOption = {
  id: string;
  title: string;
  starts_at?: string | null;
  location?: string | null;
  venue_name?: string | null;
};

export type PromoPushChannel = {
  id: string;
  campaign_id: string;
  channel_type: PromoPushChannelType;
  label: string;
  tracking_code: string;
  tracking_link: string;
  moment_entry_endpoint: string;
  reward_per_verified_action: number;
  metrics?: {
    clicks: number;
    joins: number;
    moves_completed: number;
    proof_submissions: number;
    proof_verified: number;
    rewards_issued: number;
  };
};

export type PromoPushCampaign = {
  id: string;
  title: string;
  linked_moment_id: string;
  geo_radius_meters: number;
  geo_center_lat: number;
  geo_center_lng: number;
  geo_label?: string | null;
  start_time: string;
  end_time: string;
  budget?: number | null;
  reward_rules: Record<string, unknown>;
  request_creative_support: boolean;
  status: "draft" | "active" | "completed" | "paused";
  moment?: PromoPushMomentOption | null;
  channels?: PromoPushChannel[];
};

type ApiOptions = {
  method?: string;
  body?: unknown;
  token?: string;
};

async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    credentials: "include",
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `PromoPush request failed with ${response.status}`);
  }

  return response.json();
}

export function usePromoPushCampaigns() {
  const { session } = useAuth();

  return useQuery({
    queryKey: ["promopush-campaigns", session?.user?.id],
    queryFn: () => apiFetch<PromoPushCampaign[]>("/promopush/campaigns", { token: session?.access_token }),
    enabled: !!session?.access_token,
  });
}

export function usePromoPushMoments() {
  const { session } = useAuth();

  return useQuery({
    queryKey: ["promopush-moments", session?.user?.id],
    queryFn: () => apiFetch<PromoPushMomentOption[]>("/promopush/moments", { token: session?.access_token }),
    enabled: !!session?.access_token,
  });
}

export function useCreatePromoPushCampaign() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch<{ campaign: PromoPushCampaign; channels: PromoPushChannel[] }>("/promopush/campaigns", {
        method: "POST",
        token: session?.access_token,
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promopush-campaigns"] });
      toast({
        title: "PromoPush campaign created",
        description: "Tracking links and QR channels are ready.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "PromoPush creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useSubmitPromoPushApplication() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch<{ application: { id: string } }>("/promopush/careers", {
        method: "POST",
        body,
      }),
    onSuccess: () => {
      toast({
        title: "Application received",
        description: "The PromoPush team can now review your coverage and availability.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Application failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function usePromoPushPromoterAssignments() {
  const { session } = useAuth();

  return useQuery({
    queryKey: ["promopush-promoter", session?.user?.id],
    queryFn: () => apiFetch<any[]>("/promopush/promoter", { token: session?.access_token }),
    enabled: !!session?.access_token,
  });
}

export function usePromoPushActiveCampaigns() {
  const { session } = useAuth();

  return useQuery({
    queryKey: ["promopush-active-campaigns"],
    queryFn: () => apiFetch<Array<{
      id: string;
      title: string;
      linked_moment_id: string;
      geo_label?: string | null;
      geo_radius_meters: number;
      reward_rules?: Record<string, unknown>;
      start_time: string;
      end_time: string;
      status: string;
    }>>("/promopush/active-campaigns", { token: session?.access_token }),
    enabled: !!session?.access_token,
  });
}

export function usePromoPushCreatorLinks() {
  const { session } = useAuth();

  return useQuery({
    queryKey: ["promopush-creator-links", session?.user?.id],
    queryFn: () => apiFetch<Array<PromoPushChannel & {
      campaign?: {
        id: string;
        title: string;
        linked_moment_id: string;
        geo_label?: string | null;
        status: string;
        reward_rules?: Record<string, unknown>;
      };
      earnings: {
        pending: number;
        approved: number;
        paid: number;
        total: number;
      };
    }>>("/promopush/creator-links", { token: session?.access_token }),
    enabled: !!session?.access_token,
  });
}

export function useCreatePromoPushCreatorLink() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (campaignId: string) =>
      apiFetch<{ channel: PromoPushChannel }>("/promopush/creator-links", {
        method: "POST",
        token: session?.access_token,
        body: { campaign_id: campaignId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promopush-creator-links"] });
      toast({ title: "Creator link ready", description: "Your tracked PromoPush link is available." });
    },
    onError: (error: Error) => {
      toast({ title: "Could not create link", description: error.message, variant: "destructive" });
    },
  });
}

export function usePromoPushAdmin() {
  const { session } = useAuth();

  return useQuery({
    queryKey: ["promopush-admin"],
    queryFn: () => apiFetch<{
      campaigns: Array<{ id: string; title: string; geo_label?: string | null; status: string }>;
      applications: Array<any>;
      creative_tasks: Array<any>;
      assignments: Array<any>;
    }>("/promopush/admin", { token: session?.access_token }),
    enabled: !!session?.access_token,
  });
}

export function useAssignPromoPushPromoter() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (body: { campaign_id: string; promoter_id: string; flyer_url?: string }) =>
      apiFetch("/promopush/admin/assignments", {
        method: "POST",
        token: session?.access_token,
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promopush-admin"] });
      toast({ title: "Promoter assigned", description: "A personal street activation channel was created." });
    },
  });
}

export function useUpdatePromoPushCreativeTask() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; status?: string; assigned_to?: string; notes?: string; asset_url?: string }) =>
      apiFetch(`/promopush/admin/creative-tasks/${id}`, {
        method: "PATCH",
        token: session?.access_token,
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promopush-admin"] });
    },
  });
}

export function useUpdatePromoPushApplication() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; status?: string; user_id?: string }) =>
      apiFetch(`/promopush/admin/applications/${id}`, {
        method: "PATCH",
        token: session?.access_token,
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promopush-admin"] });
    },
  });
}

export async function resolvePromoPushEntry(code: string) {
  return apiFetch<{
    campaign_id: string;
    channel_id: string;
    tracking_code: string;
    moment_id: string;
    redirect_url: string;
  }>(`/promopush/entry/${code}`);
}
