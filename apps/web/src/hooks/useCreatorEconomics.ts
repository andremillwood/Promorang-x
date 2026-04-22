import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CreatorEconomicProfile {
  user_id: string;
  tier: 'starter' | 'rising' | 'signature' | 'icon';
  payout_schedule: 'manual' | 'weekly' | 'biweekly' | 'monthly';
  default_revshare_percent: number;
  minimum_payout_amount: number;
  lifetime_momentum_value: number;
  lifetime_verified_unlocks: number;
  lifetime_memories_issued: number;
  lifetime_catalyst_conversions: number;
  next_payout_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreatorEarningsSummary {
  pendingAmount: number;
  approvedAmount: number;
  settledAmount: number;
  totalGross: number;
  totalCreatorShare: number;
  ytdEarnings: number;
  lastPayoutAmount: number | null;
  lastPayoutDate: string | null;
  nextScheduledPayout: string | null;
}

export interface EarningsBySource {
  source_type: string;
  count: number;
  gross_amount: number;
  creator_share_amount: number;
}

export interface MonthlyEarnings {
  month: string;
  gross_amount: number;
  creator_share_amount: number;
  transaction_count: number;
}

export function useCreatorEconomicProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["creator-economic-profile", user?.id],
    queryFn: async (): Promise<CreatorEconomicProfile | null> => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("creator_economic_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error) {
        if (error.code === "PGRST116") return null; // No profile found
        throw error;
      }
      
      return data as CreatorEconomicProfile;
    },
    enabled: !!user,
  });
}

export function useCreatorEarningsSummary() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["creator-earnings-summary", user?.id],
    queryFn: async (): Promise<CreatorEarningsSummary> => {
      if (!user) {
        return {
          pendingAmount: 0,
          approvedAmount: 0,
          settledAmount: 0,
          totalGross: 0,
          totalCreatorShare: 0,
          ytdEarnings: 0,
          lastPayoutAmount: null,
          lastPayoutDate: null,
          nextScheduledPayout: null,
        };
      }
      
      // Get summary by status
      const { data: statusData, error: statusError } = await supabase
        .from("creator_earnings_ledger")
        .select("status, gross_amount, creator_share_amount")
        .eq("creator_id", user.id);
      
      if (statusError) throw statusError;
      
      // Calculate totals
      const summary = (statusData || []).reduce(
        (acc, row) => {
          acc.totalGross += Number(row.gross_amount);
          acc.totalCreatorShare += Number(row.creator_share_amount);
          
          if (row.status === "pending") {
            acc.pendingAmount += Number(row.creator_share_amount);
          } else if (row.status === "approved") {
            acc.approvedAmount += Number(row.creator_share_amount);
          } else if (row.status === "settled") {
            acc.settledAmount += Number(row.creator_share_amount);
          }
          
          return acc;
        },
        {
          pendingAmount: 0,
          approvedAmount: 0,
          settledAmount: 0,
          totalGross: 0,
          totalCreatorShare: 0,
          ytdEarnings: 0,
          lastPayoutAmount: null as number | null,
          lastPayoutDate: null as string | null,
          nextScheduledPayout: null as string | null,
        }
      );
      
      // Get YTD earnings (current year settled)
      const startOfYear = new Date().getFullYear().toString() + "-01-01";
      const { data: ytdData, error: ytdError } = await supabase
        .from("creator_earnings_ledger")
        .select("creator_share_amount")
        .eq("creator_id", user.id)
        .eq("status", "settled")
        .gte("created_at", startOfYear);
      
      if (!ytdError && ytdData) {
        summary.ytdEarnings = ytdData.reduce(
          (sum, row) => sum + Number(row.creator_share_amount),
          0
        );
      }
      
      return summary;
    },
    enabled: !!user,
  });
}

export function useEarningsBySource() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["earnings-by-source", user?.id],
    queryFn: async (): Promise<EarningsBySource[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("creator_earnings_ledger")
        .select("source_type, gross_amount, creator_share_amount")
        .eq("creator_id", user.id)
        .eq("status", "settled");
      
      if (error) throw error;
      
      // Aggregate by source type
      const aggregated = (data || []).reduce((acc, row) => {
        const existing = acc.find((i) => i.source_type === row.source_type);
        if (existing) {
          existing.count += 1;
          existing.gross_amount += Number(row.gross_amount);
          existing.creator_share_amount += Number(row.creator_share_amount);
        } else {
          acc.push({
            source_type: row.source_type,
            count: 1,
            gross_amount: Number(row.gross_amount),
            creator_share_amount: Number(row.creator_share_amount),
          });
        }
        return acc;
      }, [] as EarningsBySource[]);
      
      return aggregated.sort((a, b) => b.creator_share_amount - a.creator_share_amount);
    },
    enabled: !!user,
  });
}

export function useMonthlyEarnings(months: number = 6) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["monthly-earnings", user?.id, months],
    queryFn: async (): Promise<MonthlyEarnings[]> => {
      if (!user) return [];
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      
      const { data, error } = await supabase
        .from("creator_earnings_ledger")
        .select("created_at, gross_amount, creator_share_amount")
        .eq("creator_id", user.id)
        .eq("status", "settled")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());
      
      if (error) throw error;
      
      // Group by month
      const grouped = (data || []).reduce((acc, row) => {
        const month = row.created_at.substring(0, 7); // YYYY-MM
        const existing = acc.find((i) => i.month === month);
        if (existing) {
          existing.transaction_count += 1;
          existing.gross_amount += Number(row.gross_amount);
          existing.creator_share_amount += Number(row.creator_share_amount);
        } else {
          acc.push({
            month,
            gross_amount: Number(row.gross_amount),
            creator_share_amount: Number(row.creator_share_amount),
            transaction_count: 1,
          });
        }
        return acc;
      }, [] as MonthlyEarnings[]);
      
      // Sort by month ascending
      return grouped.sort((a, b) => a.month.localeCompare(b.month));
    },
    enabled: !!user,
  });
}

export function useRecentEarnings(limit: number = 10) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["recent-earnings", user?.id, limit],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("creator_earnings_ledger")
        .select(`
          id,
          source_type,
          status,
          unit_count,
          unit_amount,
          gross_amount,
          creator_share_percent,
          creator_share_amount,
          created_at,
          mission_attribution_id,
          mission_link_id,
          content_item_id,
          moment_id
        `)
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}
