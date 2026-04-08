import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type AmbassadorStatus = Database["public"]["Enums"]["ambassador_status"];

export interface BrandAmbassador {
  id: string;
  user_id: string;
  brand_id: string;
  status: AmbassadorStatus;
  bio: string | null;
  social_links: Record<string, string>;
  ambassador_code: string | null;
  commission_rate: number;
  monthly_target: number | null;
  total_referrals: number;
  total_earnings: number;
  perks: any[];
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

// Generate unique ambassador code
function generateAmbassadorCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "AMB-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Fetch user's ambassador applications/status
export function useUserAmbassadorships() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-ambassadorships", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("brand_ambassadors")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BrandAmbassador[];
    },
    enabled: !!user,
  });
}

// Fetch ambassadors for a brand (for brand managers)
export function useBrandAmbassadors(brandId: string) {
  return useQuery({
    queryKey: ["brand-ambassadors", brandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_ambassadors")
        .select("*")
        .eq("brand_id", brandId)
        .order("status", { ascending: true });

      if (error) throw error;
      return data as BrandAmbassador[];
    },
    enabled: !!brandId,
  });
}

// Apply to become an ambassador
export function useApplyAsAmbassador() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      brandId,
      bio,
      socialLinks,
    }: {
      brandId: string;
      bio?: string;
      socialLinks?: Record<string, string>;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Check if already applied
      const { data: existing } = await supabase
        .from("brand_ambassadors")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("brand_id", brandId)
        .maybeSingle();

      if (existing) {
        throw new Error(`You've already applied (status: ${existing.status})`);
      }

      const { data, error } = await supabase
        .from("brand_ambassadors")
        .insert({
          user_id: user.id,
          brand_id: brandId,
          bio: bio || null,
          social_links: socialLinks || {},
          status: "applied",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Application submitted! 🌟",
        description: "The brand will review your application.",
      });
      queryClient.invalidateQueries({ queryKey: ["user-ambassadorships"] });
    },
    onError: (error: any) => {
      toast({
        title: "Application failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Update ambassador status (for brand managers)
export function useUpdateAmbassadorStatus() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ambassadorId,
      status,
      commissionRate,
      monthlyTarget,
      perks,
    }: {
      ambassadorId: string;
      status: AmbassadorStatus;
      commissionRate?: number;
      monthlyTarget?: number;
      perks?: any[];
    }) => {
      if (!user) throw new Error("Not authenticated");

      const updates: Partial<BrandAmbassador> = { status };

      if (status === "active") {
        updates.approved_by = user.id;
        updates.approved_at = new Date().toISOString();
        updates.ambassador_code = generateAmbassadorCode();
      }

      if (commissionRate !== undefined) updates.commission_rate = commissionRate;
      if (monthlyTarget !== undefined) updates.monthly_target = monthlyTarget;
      if (perks !== undefined) updates.perks = perks;

      const { error } = await supabase
        .from("brand_ambassadors")
        .update(updates)
        .eq("id", ambassadorId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Ambassador updated",
        description: "Status has been changed.",
      });
      queryClient.invalidateQueries({ queryKey: ["brand-ambassadors"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Get ambassador stats (for active ambassadors)
export function useAmbassadorStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["ambassador-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: ambassadorships } = await supabase
        .from("brand_ambassadors")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active");

      if (!ambassadorships || ambassadorships.length === 0) return null;

      const totalEarnings = ambassadorships.reduce((sum, a) => sum + (a.total_earnings || 0), 0);
      const totalReferrals = ambassadorships.reduce((sum, a) => sum + (a.total_referrals || 0), 0);
      const activeBrands = ambassadorships.length;

      return {
        totalEarnings,
        totalReferrals,
        activeBrands,
        ambassadorships: ambassadorships as BrandAmbassador[],
      };
    },
    enabled: !!user,
  });
}
