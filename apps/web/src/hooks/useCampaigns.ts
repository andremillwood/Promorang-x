import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type RewardType = 'discount' | 'freebie' | 'points' | 'voucher' | 'experience' | 'access' | 'gems';

export interface Campaign {
  id: string;
  brand_id: string;
  organization_id?: string | null;
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
  system_module?: "promopush";
  moment_id?: string | null;
  objective_type?: "content" | "purchase" | "sampling" | "signup" | "attendance" | "custom" | null;
  geo_label?: string | null;
  geo_radius_meters?: number | null;
  distribution_starts_at?: string | null;
  distribution_ends_at?: string | null;
  entry_mode?: "moment_direct" | "qr" | "ad_link" | "direct_link" | null;
  entry_endpoint?: string | null;
  distribution_channels?: string[] | null;
  creator_reward_per_verified_action_jmd?: number | null;
  payout_per_scan_signup_jmd?: number | null;
  payout_per_verified_post_jmd?: number | null;
  payout_per_purchase_proof_jmd?: number | null;
  compiler_metadata?: any;
  activation_proposal_id?: string | null;
}

export function useBrandCampaigns() {
  const { user, activeOrgId } = useAuth();

  return useQuery({
    queryKey: ["brand-campaigns", activeOrgId, user?.id],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      query = activeOrgId ? query.eq("organization_id", activeOrgId) : query.eq("brand_id", user.id);
      const { data, error } = await query;

      if (error) throw error;
      return data as Campaign[];
    },
    enabled: !!user,
  });
}

export function useCreateCampaign() {
  const { user, activeOrgId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaign: Partial<Campaign>) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("campaigns")
        .insert({
          brand_id: user.id,
          organization_id: activeOrgId,
          title: campaign.title!,
          description: campaign.description,
          budget: campaign.budget,
          reward_type: (campaign.reward_type || "discount") as RewardType,
          reward_value: campaign.reward_value,
          is_active: campaign.is_active ?? false,
          target_categories: campaign.target_categories,
          start_date: campaign.start_date,
          end_date: campaign.end_date,
          system_module: campaign.system_module || "promopush",
          moment_id: campaign.moment_id,
          objective_type: campaign.objective_type,
          geo_label: campaign.geo_label,
          geo_radius_meters: campaign.geo_radius_meters,
          distribution_starts_at: campaign.distribution_starts_at,
          distribution_ends_at: campaign.distribution_ends_at,
          entry_mode: campaign.entry_mode,
          entry_endpoint: campaign.entry_endpoint,
          distribution_channels: campaign.distribution_channels,
          creator_reward_per_verified_action_jmd: campaign.creator_reward_per_verified_action_jmd,
          payout_per_scan_signup_jmd: campaign.payout_per_scan_signup_jmd,
          payout_per_verified_post_jmd: campaign.payout_per_verified_post_jmd,
          payout_per_purchase_proof_jmd: campaign.payout_per_purchase_proof_jmd,
          compiler_metadata: campaign.compiler_metadata,
          activation_proposal_id: campaign.activation_proposal_id,
        })
        .select()
        .single();

      if (error) throw error;

      const demandPlan = campaign.compiler_metadata?.demandPlan;
      if (demandPlan) {
        const { error: planError } = await supabase.from("demand_plans").insert({
          owner_user_id: user.id,
          organization_id: activeOrgId,
          campaign_id: data.id,
          version: demandPlan.version,
          status: demandPlan.status || "draft",
          title: demandPlan.title,
          promise: demandPlan.promise,
          intent: demandPlan.intent,
          people: demandPlan.people,
          experience: demandPlan.experience,
          shared_value: demandPlan.sharedValue,
          distribution: demandPlan.distribution,
          return_path: demandPlan.returnPath,
          measurement: demandPlan.measurement,
          readiness: demandPlan.readiness,
          source: "promopilot",
        });

        // The campaign retains the complete plan in compiler_metadata, so a
        // projection failure must not lose the merchant's saved work.
        if (planError) console.warn("Demand plan projection could not be saved", planError.message);
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Activation plan saved",
        description: "Nothing is live or funded yet. Review the plan and secure its Gems before opening it to people.",
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
  const { user, activeOrgId } = useAuth();

  return useQuery({
    queryKey: ["brand-stats", activeOrgId, user?.id],
    queryFn: async () => {
      if (!user) return null;

      let query = supabase
        .from("campaigns")
        .select("*");
      query = activeOrgId ? query.eq("organization_id", activeOrgId) : query.eq("brand_id", user.id);
      const { data: campaigns, error } = await query;

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
        attributedSales: totalRedemptions,
      };
    },
    enabled: !!user,
  });
}
