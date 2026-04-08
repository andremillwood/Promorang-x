import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  is_active: boolean;
  total_clicks: number;
  total_signups: number;
  total_conversions: number;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code_id: string | null;
  status: string;
  reward_points: number | null;
  reward_paid_at: string | null;
  created_at: string;
}

export interface AffiliateLink {
  id: string;
  user_id: string;
  link_code: string;
  destination_url: string;
  brand_id: string | null;
  campaign_id: string | null;
  moment_id: string | null;
  commission_type: string;
  commission_percent: number;
  fixed_commission: number | null;
  is_active: boolean;
  click_count: number;
  conversion_count: number;
  total_earnings: number;
  created_at: string;
  updated_at: string;
}

export interface AffiliateConversion {
  id: string;
  affiliate_link_id: string;
  affiliate_user_id: string;
  converted_user_id: string | null;
  conversion_type: string;
  order_value: number | null;
  commission_earned: number;
  is_paid: boolean;
  paid_at: string | null;
  created_at: string;
}

// Generate unique code
function generateCode(length: number = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Fetch user's referral codes
export function useReferralCodes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["referral-codes", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("referral_codes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ReferralCode[];
    },
    enabled: !!user,
  });
}

// Fetch user's referrals
export function useReferrals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["referrals", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Referral[];
    },
    enabled: !!user,
  });
}

// Create a referral code
export function useCreateReferralCode() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const code = generateCode();

      const { data, error } = await supabase
        .from("referral_codes")
        .insert({
          user_id: user.id,
          code,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Referral code created! 🔗",
        description: "Share your code to earn rewards.",
      });
      queryClient.invalidateQueries({ queryKey: ["referral-codes"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create code",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Fetch user's affiliate links
export function useAffiliateLinks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["affiliate-links", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("affiliate_links")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AffiliateLink[];
    },
    enabled: !!user,
  });
}

// Create affiliate link
export function useCreateAffiliateLink() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      destinationUrl,
      brandId,
      campaignId,
      momentId,
      commissionType = "percentage",
      commissionPercent = 10,
    }: {
      destinationUrl: string;
      brandId?: string;
      campaignId?: string;
      momentId?: string;
      commissionType?: string;
      commissionPercent?: number;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const linkCode = generateCode(10);

      const { data, error } = await supabase
        .from("affiliate_links")
        .insert({
          user_id: user.id,
          link_code: linkCode,
          destination_url: destinationUrl,
          brand_id: brandId || null,
          campaign_id: campaignId || null,
          moment_id: momentId || null,
          commission_type: commissionType,
          commission_percent: commissionPercent,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Affiliate link created! 💰",
        description: "Start sharing to earn commissions.",
      });
      queryClient.invalidateQueries({ queryKey: ["affiliate-links"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create link",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Fetch affiliate conversions
export function useAffiliateConversions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["affiliate-conversions", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("affiliate_conversions")
        .select("*")
        .eq("affiliate_user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AffiliateConversion[];
    },
    enabled: !!user,
  });
}

// Get referral stats
export function useReferralStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["referral-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get referral codes stats
      const { data: codes } = await supabase
        .from("referral_codes")
        .select("total_clicks, total_signups, total_conversions")
        .eq("user_id", user.id);

      const totalClicks = codes?.reduce((sum, c) => sum + (c.total_clicks || 0), 0) || 0;
      const totalSignups = codes?.reduce((sum, c) => sum + (c.total_signups || 0), 0) || 0;
      const totalConversions = codes?.reduce((sum, c) => sum + (c.total_conversions || 0), 0) || 0;

      // Get affiliate earnings
      const { data: links } = await supabase
        .from("affiliate_links")
        .select("click_count, conversion_count, total_earnings")
        .eq("user_id", user.id);

      const affiliateClicks = links?.reduce((sum, l) => sum + (l.click_count || 0), 0) || 0;
      const affiliateConversions = links?.reduce((sum, l) => sum + (l.conversion_count || 0), 0) || 0;
      const totalEarnings = links?.reduce((sum, l) => sum + (l.total_earnings || 0), 0) || 0;

      // Get pending earnings
      const { data: pendingConversions } = await supabase
        .from("affiliate_conversions")
        .select("commission_earned")
        .eq("affiliate_user_id", user.id)
        .eq("is_paid", false);

      const pendingEarnings = pendingConversions?.reduce((sum, c) => sum + c.commission_earned, 0) || 0;

      return {
        referrals: {
          totalClicks,
          totalSignups,
          totalConversions,
        },
        affiliate: {
          totalClicks: affiliateClicks,
          totalConversions: affiliateConversions,
          totalEarnings,
          pendingEarnings,
        },
      };
    },
    enabled: !!user,
  });
}
