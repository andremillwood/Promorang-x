import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Reward {
  id: string;
  user_id: string;
  moment_id: string;
  campaign_id: string | null;
  reward_type: string;
  reward_value: string;
  status: string;
  earned_at: string;
  claimed_at: string | null;
  expires_at: string | null;
  redemption_code: string | null;
  moment?: {
    title: string;
    image_url: string | null;
  };
}

export function useUserRewards() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-rewards", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("rewards")
        .select(`
          *,
          moment:moments(title, image_url)
        `)
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false });

      if (error) throw error;
      return data as Reward[];
    },
    enabled: !!user,
  });
}

export function useClaimReward() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (rewardId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("rewards")
        .update({
          status: "claimed",
          claimed_at: new Date().toISOString(),
        })
        .eq("id", rewardId)
        .eq("user_id", user.id)
        .eq("status", "earned")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Reward is unavailable or has already been claimed");
      return data as Reward;
    },
    onSuccess: (reward) => {
      toast({
        title: "Reward claim recorded",
        description: reward.redemption_code
          ? "Your recorded redemption credential is now available. Merchant validation is still required."
          : "The claim is recorded. Redemption remains pending until an issuer credential or fulfillment record is available.",
      });
      queryClient.invalidateQueries({ queryKey: ["user-rewards", user?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to claim reward",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useRewardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["reward-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      const earned = data.filter((r) => r.status === "earned").length;
      const claimed = data.filter((r) => r.status === "claimed").length;
      const expired = data.filter((r) => r.status === "expired").length;

      return {
        total: data.length,
        earned,
        claimed,
        expired,
      };
    },
    enabled: !!user,
  });
}
