import { useQuery } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { PromoCardData } from "@/lib/promocard";

type PromoCardRow = {
  user_id: string;
  tier: PromoCardData["tier"];
  monthly_limit: number | string;
  available_balance: number | string;
  spent_this_cycle: number | string;
  recharge_health_score: number;
  card_number: string;
  cycle_resets_at: string;
  total_savings_lifetime: number | string;
  created_at: string;
};

type PromoCardDatabase = {
  public: {
    Tables: {
      user_promo_cards: {
        Row: PromoCardRow;
        Insert: never;
        Update: never;
        Relationships: [];
      };
      merchant_margin_pools: {
        Row: { id: string; is_active: boolean };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const promoClient = supabase as unknown as SupabaseClient<PromoCardDatabase>;

const numberValue = (value: number | string) => Number(value || 0);

function mapCard(row: PromoCardRow, acceptedLocationsCount: number): PromoCardData {
  const resetAt = new Date(row.cycle_resets_at).getTime();
  const cycleDaysRemaining = Math.max(0, Math.ceil((resetAt - Date.now()) / 86_400_000));

  return {
    userId: row.user_id,
    tier: row.tier,
    monthlyLimit: numberValue(row.monthly_limit),
    availableBalance: numberValue(row.available_balance),
    prepaidCashBalance: 0,
    spentThisCycle: numberValue(row.spent_this_cycle),
    cycleDaysRemaining,
    rechargeHealthScore: row.recharge_health_score,
    cardNumber: row.card_number,
    cardHolderName: "Promorang Member",
    memberSince: new Date(row.created_at).getFullYear().toString(),
    totalSavingsLifetime: numberValue(row.total_savings_lifetime),
    acceptedLocationsCount,
  };
}

export function usePromoCard(userId?: string) {
  return useQuery({
    queryKey: ["promocard", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const [cardResult, poolResult] = await Promise.all([
        promoClient
          .from("user_promo_cards")
          .select("user_id,tier,monthly_limit,available_balance,spent_this_cycle,recharge_health_score,card_number,cycle_resets_at,total_savings_lifetime,created_at")
          .eq("user_id", userId!)
          .maybeSingle(),
        promoClient
          .from("merchant_margin_pools")
          .select("id", { count: "exact", head: true })
          .eq("is_active", true),
      ]);

      if (cardResult.error) throw cardResult.error;
      if (!cardResult.data) return null;

      return mapCard(cardResult.data, poolResult.count || 0);
    },
    staleTime: 30_000,
    retry: 1,
  });
}
