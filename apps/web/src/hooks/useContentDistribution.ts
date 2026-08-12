import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getSeededContentDrop, seededContentDropLeaderboards } from "@/data/seeded-content-drops";
import type { ContentContext } from "@promorang/shared";

export type ContentDistributionAsset = {
  id: string;
  campaign_id: string;
  content_item_id?: string | null;
  creator_id?: string | null;
  title: string;
  description?: string | null;
  asset_type: "content" | "link" | "image" | "video" | "text" | "audio" | "other";
  target_url?: string | null;
  media_url?: string | null;
  status: "draft" | "active" | "paused" | "archived";
  attribution_slug?: string | null;
  metadata?: Record<string, unknown>;
};

export type ContentDistributionCampaign = {
  id: string;
  owner_id: string;
  sponsor_id?: string | null;
  linked_moment_id?: string | null;
  title: string;
  description?: string | null;
  objective_type: "awareness" | "engagement" | "share" | "signup" | "sale" | "content_launch" | "custom";
  status: "draft" | "active" | "paused" | "completed" | "cancelled";
  starts_at?: string | null;
  ends_at?: string | null;
  reward_config?: {
    base_points?: number;
    point_multiplier?: number;
    points_by_action?: Record<string, number>;
  };
  promoshare_config?: {
    enabled?: boolean;
    actions?: string[];
    entries_per_action?: number;
    entries_by_action?: Record<string, number>;
  };
  budget_amount?: number;
  budget_currency?: string;
  metadata?: Record<string, unknown>;
  content_distribution_assets?: ContentDistributionAsset[];
};

export type ContentDistributionLeaderboardRow = {
  id: string;
  campaign_id: string;
  user_id: string;
  rank_position: number;
  shares_count: number;
  clicks_count: number;
  engagements_count: number;
  conversions_count: number;
  points_earned: number;
  promoshare_entries_earned: number;
  distribution_score: number;
  user?: {
    id: string;
    username?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
  } | null;
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
    throw new Error(payload.error || `Content distribution request failed with ${response.status}`);
  }

  return response.json();
}

export function useContentDrops(status = "active") {
  return useQuery({
    queryKey: ["content-drops", status],
    queryFn: async () => {
      const payload = await apiFetch<{ success: boolean; data: ContentDistributionCampaign[] }>(
        `/content-distribution/campaigns?status=${status}`
      );
      return payload.data;
    },
  });
}

export function useMyContentDrops(status = "all") {
  const { session } = useAuth();

  return useQuery({
    queryKey: ["my-content-drops", status, session?.user?.id],
    queryFn: async () => {
      const payload = await apiFetch<{ success: boolean; data: ContentDistributionCampaign[] }>(
        `/content-distribution/me/campaigns?status=${status}`,
        { token: session?.access_token }
      );
      return payload.data;
    },
    enabled: !!session?.access_token,
  });
}

export function useContentDrop(campaignId?: string) {
  const seededDrop = getSeededContentDrop(campaignId);

  return useQuery({
    queryKey: ["content-drop", campaignId],
    queryFn: async () => {
      if (seededDrop) return seededDrop;
      const payload = await apiFetch<{ success: boolean; data: ContentDistributionCampaign }>(
        `/content-distribution/campaigns/${campaignId}`
      );
      return payload.data;
    },
    enabled: !!campaignId,
  });
}

export function useContentDropContext(campaignId?: string) {
  const { session } = useAuth();
  return useQuery({
    queryKey: ["content-drop-context", campaignId, session?.user?.id],
    queryFn: async () => {
      const payload = await apiFetch<{ success: boolean; data: ContentContext }>(`/content-distribution/campaigns/${campaignId}/context`, { token: session?.access_token });
      return payload.data;
    },
    enabled: !!campaignId && !getSeededContentDrop(campaignId),
  });
}

export function useContentDropLeaderboard(campaignId?: string) {
  const seededLeaderboard = campaignId ? seededContentDropLeaderboards[campaignId] : undefined;

  return useQuery({
    queryKey: ["content-drop-leaderboard", campaignId],
    queryFn: async () => {
      if (seededLeaderboard) return seededLeaderboard;
      const payload = await apiFetch<{ success: boolean; data: ContentDistributionLeaderboardRow[] }>(
        `/content-distribution/campaigns/${campaignId}/leaderboard`
      );
      return payload.data;
    },
    enabled: !!campaignId,
  });
}

export function useCreateContentDrop() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch<{ success: boolean; data: ContentDistributionCampaign }>("/content-distribution/campaigns", {
        method: "POST",
        token: session?.access_token,
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-drops"] });
      queryClient.invalidateQueries({ queryKey: ["my-content-drops"] });
      toast({
        title: "Content Drop launched",
        description: "Your distribution desk is ready for contributors.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Drop creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useAddContentDropAsset() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignId, body }: { campaignId: string; body: Record<string, unknown> }) =>
      apiFetch<{ success: boolean; data: ContentDistributionAsset }>(
        `/content-distribution/campaigns/${campaignId}/assets`,
        {
          method: "POST",
          token: session?.access_token,
          body,
        }
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["content-drop", variables.campaignId] });
      queryClient.invalidateQueries({ queryKey: ["content-drops"] });
      queryClient.invalidateQueries({ queryKey: ["my-content-drops"] });
    },
  });
}

export function useRecordContentDropAction(campaignId?: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch<{ success: boolean; data: unknown }>(`/content-distribution/campaigns/${campaignId}/actions`, {
        method: "POST",
        token: session?.access_token,
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-drop-leaderboard", campaignId] });
      toast({
        title: "Contribution recorded",
        description: "Your action was added to this drop's momentum.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Action was not recorded",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
