import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";

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

export interface ReferralPerson {
  id: string;
  referred_id: string;
  status: string;
  activated_at: string | null;
  total_commission_paid: number;
  total_gems_earned: number;
  total_points_earned: number;
  created_at: string;
  users?: {
    username?: string | null;
    display_name?: string | null;
    profile_image?: string | null;
  } | null;
}

export interface ReferralCommission {
  id: string;
  referred_user_id: string;
  earning_type: string;
  earning_amount: number;
  earning_currency: string;
  commission_rate: number;
  commission_amount: number;
  commission_currency: string;
  status: string;
  paid_at: string | null;
  created_at: string;
  users?: {
    username?: string | null;
    display_name?: string | null;
    profile_image?: string | null;
  } | null;
}

// Fetch user's referral codes
export function useReferralCodes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["referral-codes", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: sessionData } = await supabase.auth.getSession();
      const response = await fetch(`${API_BASE_URL}/referrals/my-code`, {
        headers: { Authorization: `Bearer ${sessionData.session?.access_token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || payload.error || "Failed to load referral code");
      const code = payload.data?.code;
      return code ? [{
        id: code, user_id: user.id, code, is_active: true,
        total_clicks: 0, total_signups: 0, total_conversions: 0, created_at: new Date().toISOString(),
      }] as ReferralCode[] : [];
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
        .from("user_referrals")
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

      const { data: sessionData } = await supabase.auth.getSession();
      const response = await fetch(`${API_BASE_URL}/referrals/my-code`, {
        headers: { Authorization: `Bearer ${sessionData.session?.access_token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || payload.error || "Failed to create referral code");
      return payload.data;
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

// Get referral stats
export function useReferralStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["referral-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: sessionData } = await supabase.auth.getSession();
      const response = await fetch(`${API_BASE_URL}/referrals/stats`, {
        headers: { Authorization: `Bearer ${sessionData.session?.access_token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || payload.error || "Failed to load referral stats");
      const summary = payload.data?.summary || {};
      const totalClicks = Number(summary.total_clicks || 0);
      const totalSignups = Number(summary.total_referrals || 0);
      const totalConversions = Number(summary.active_referrals || 0);
      const commissions = (payload.data?.recent_commissions || []) as ReferralCommission[];
      const pendingEarnings = commissions
        .filter((commission) => commission.status === "pending")
        .reduce((sum, commission) => sum + Number(commission.commission_amount || 0), 0);

      return {
        referrals: {
          totalClicks,
          totalSignups,
          totalConversions,
        },
        affiliate: {
          totalClicks,
          totalConversions,
          totalEarnings: Number(summary.total_earnings?.usd || 0),
          pendingEarnings,
        },
        earnings: {
          usd: Number(summary.total_earnings?.usd || 0),
          gems: Number(summary.total_earnings?.gems || 0),
          points: Number(summary.total_earnings?.points || 0),
        },
        referralsList: (payload.data?.referrals || []) as ReferralPerson[],
        commissions,
      };
    },
    enabled: !!user,
  });
}
