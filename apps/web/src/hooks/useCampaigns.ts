import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type RewardType = 'discount' | 'freebie' | 'points' | 'voucher' | 'experience' | 'access';

export interface Campaign {
  id: string;
  brand_id: string;
  title: string;
  description: string | null;
  budget: number | null;
  reward_type: RewardType;
  reward_value: string | null;
  target_categories: string[] | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  impressions: number;
  redemptions: number;
  created_at: string;
  updated_at: string;
  compiler_metadata?: any;
}

export function useBrandCampaigns() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["brand-campaigns", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("brand_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Campaign[];
    },
    enabled: !!user,
  });
}

export function useCreateCampaign() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaign: Partial<Campaign>) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("campaigns")
        .insert({
          brand_id: user.id,
          title: campaign.title!,
          description: campaign.description,
          budget: campaign.budget,
          reward_type: (campaign.reward_type || "discount") as RewardType,
          reward_value: campaign.reward_value,
          target_categories: campaign.target_categories,
          start_date: campaign.start_date,
          end_date: campaign.end_date,
          compiler_metadata: campaign.compiler_metadata,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Campaign Created! 🎉",
        description: "Your campaign is now live.",
      });
      queryClient.invalidateQueries({ queryKey: ["brand-campaigns"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating campaign",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useBrandStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["brand-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: campaigns, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("brand_id", user.id);

      if (error) throw error;

      const activeCampaigns = campaigns.filter((c) => c.is_active).length;
      const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
      const totalRedemptions = campaigns.reduce((sum, c) => sum + (c.redemptions || 0), 0);
      const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);

      return {
        totalCampaigns: campaigns.length,
        activeCampaigns,
        totalImpressions,
        totalRedemptions,
        totalBudget,
        attributedSales: totalRedemptions * 42, // Mock ROI multiplier for demo/V1
      };
    },
    enabled: !!user,
  });
}
