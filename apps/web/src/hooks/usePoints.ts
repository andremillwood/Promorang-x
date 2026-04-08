import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type LoyaltyTier = Database["public"]["Enums"]["loyalty_tier"];
type PointAction = Database["public"]["Enums"]["point_action"];

export interface UserBrandPoints {
  id: string;
  user_id: string;
  brand_id: string;
  current_points: number;
  lifetime_points: number;
  current_tier: LoyaltyTier;
  tier_updated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PointTransaction {
  id: string;
  user_id: string;
  brand_id: string;
  action: PointAction;
  points: number;
  description: string | null;
  reference_type: string | null;
  reference_id: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface BrandLoyaltyTier {
  id: string;
  brand_id: string;
  tier: LoyaltyTier;
  tier_name: string;
  min_points: number;
  discount_percent: number;
  priority_access: boolean;
  tier_benefits: any[];
  created_at: string;
}

export interface BrandPointProgram {
  id: string;
  brand_id: string;
  program_name: string;
  points_per_checkin: number;
  points_per_referral: number;
  points_per_review: number;
  points_per_media: number;
  point_expiry_days: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Fetch user's points across all brands
export function useUserPoints() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-points", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_brand_points")
        .select("*")
        .eq("user_id", user.id)
        .order("current_points", { ascending: false });

      if (error) throw error;
      return data as UserBrandPoints[];
    },
    enabled: !!user,
  });
}

// Fetch points for a specific brand
export function useUserBrandPoints(brandId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-brand-points", user?.id, brandId],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_brand_points")
        .select("*")
        .eq("user_id", user.id)
        .eq("brand_id", brandId)
        .maybeSingle();

      if (error) throw error;
      return data as UserBrandPoints | null;
    },
    enabled: !!user && !!brandId,
  });
}

// Fetch point transactions for user
export function usePointTransactions(brandId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["point-transactions", user?.id, brandId],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("point_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (brandId) {
        query = query.eq("brand_id", brandId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as PointTransaction[];
    },
    enabled: !!user,
  });
}

// Fetch loyalty tiers for a brand
export function useBrandLoyaltyTiers(brandId: string) {
  return useQuery({
    queryKey: ["brand-loyalty-tiers", brandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_loyalty_tiers")
        .select("*")
        .eq("brand_id", brandId)
        .order("min_points", { ascending: true });

      if (error) throw error;
      return data as BrandLoyaltyTier[];
    },
    enabled: !!brandId,
  });
}

// Fetch brand's point program
export function useBrandPointProgram(brandId: string) {
  return useQuery({
    queryKey: ["brand-point-program", brandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_point_programs")
        .select("*")
        .eq("brand_id", brandId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data as BrandPointProgram | null;
    },
    enabled: !!brandId,
  });
}

// Get aggregated points stats for user
export function usePointsStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["points-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: points, error } = await supabase
        .from("user_brand_points")
        .select("current_points, lifetime_points, current_tier")
        .eq("user_id", user.id);

      if (error) throw error;

      const totalCurrent = points?.reduce((sum, p) => sum + (p.current_points || 0), 0) || 0;
      const totalLifetime = points?.reduce((sum, p) => sum + (p.lifetime_points || 0), 0) || 0;
      const brandCount = points?.length || 0;

      // Get highest tier
      const tierOrder: LoyaltyTier[] = ["bronze", "silver", "gold", "platinum", "ambassador"];
      const highestTier = points?.reduce((highest, p) => {
        const currentIndex = tierOrder.indexOf(p.current_tier || "bronze");
        const highestIndex = tierOrder.indexOf(highest);
        return currentIndex > highestIndex ? (p.current_tier || "bronze") : highest;
      }, "bronze" as LoyaltyTier);

      return {
        totalCurrent,
        totalLifetime,
        brandCount,
        highestTier,
      };
    },
    enabled: !!user,
  });
}

// Award points (for system use or brand managers)
export function useAwardPoints() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      brandId,
      action,
      points,
      description,
      referenceType,
      referenceId,
    }: {
      userId: string;
      brandId: string;
      action: PointAction;
      points: number;
      description?: string;
      referenceType?: string;
      referenceId?: string;
    }) => {
      // Create transaction
      const { error: txError } = await supabase
        .from("point_transactions")
        .insert({
          user_id: userId,
          brand_id: brandId,
          action,
          points,
          description: description || null,
          reference_type: referenceType || null,
          reference_id: referenceId || null,
        });

      if (txError) throw txError;

      // Update or create user_brand_points
      const { data: existing } = await supabase
        .from("user_brand_points")
        .select("id, current_points, lifetime_points")
        .eq("user_id", userId)
        .eq("brand_id", brandId)
        .maybeSingle();

      if (existing) {
        const { error: updateError } = await supabase
          .from("user_brand_points")
          .update({
            current_points: (existing.current_points || 0) + points,
            lifetime_points: (existing.lifetime_points || 0) + (points > 0 ? points : 0),
          })
          .eq("id", existing.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("user_brand_points")
          .insert({
            user_id: userId,
            brand_id: brandId,
            current_points: points,
            lifetime_points: points > 0 ? points : 0,
          });

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      toast({
        title: "Points awarded! 🎯",
        description: "Points have been added to the account.",
      });
      queryClient.invalidateQueries({ queryKey: ["user-points"] });
      queryClient.invalidateQueries({ queryKey: ["point-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["points-stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to award points",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
