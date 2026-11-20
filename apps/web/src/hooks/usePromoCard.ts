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

export type PromoCardLedgerEntryType =
  | "spend"
  | "payout_credit"
  | "recharge"
  | "cycle_reset"
  | "reversal_refund"
  | "admin_adjustment";

export type PromoCardLedgerRow = {
  id: string;
  entry_type: PromoCardLedgerEntryType;
  amount: number | string;
  currency: string;
  balance_after: number | string;
  business_night: string | null;
  cycle_id: string | null;
  moment_id: string | null;
  order_id: string | null;
  created_at: string;
  is_test: boolean;
  metadata: { promocard_title?: string | null } | null;
};

export type PromoCardActivityEntry = {
  id: string;
  entryType: PromoCardLedgerEntryType;
  amount: number;
  currency: string;
  balanceAfter: number;
  businessNight: string | null;
  cycleId: string | null;
  momentId: string | null;
  orderId: string | null;
  createdAt: string;
  isTest: boolean;
  title: string | null;
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
      promocard_ledger: {
        Row: PromoCardLedgerRow;
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

export function promoCardLedgerQueryKey(userId?: string) {
  return ["promocard-ledger", userId] as const;
}

export function isPromoCardLedgerUnavailable(error: { code?: string; message?: string } | null | undefined) {
  const code = error?.code || "";
  const message = error?.message || "";
  return code === "PGRST205"
    || code === "42P01"
    || /schema cache/i.test(message)
    || (/promocard_ledger/i.test(message) && /does not exist/i.test(message));
}

export function mapPromoCardLedgerRow(row: PromoCardLedgerRow): PromoCardActivityEntry {
  const title = row.metadata?.promocard_title?.trim();
  return {
    id: row.id,
    entryType: row.entry_type,
    amount: Number(row.amount),
    currency: row.currency || "USD",
    balanceAfter: Number(row.balance_after),
    businessNight: row.business_night,
    cycleId: row.cycle_id,
    momentId: row.moment_id,
    orderId: row.order_id,
    createdAt: row.created_at,
    isTest: Boolean(row.is_test),
    title: title || null,
  };
}

export function usePromoCardLedger(userId?: string) {
  return useQuery({
    queryKey: promoCardLedgerQueryKey(userId),
    enabled: Boolean(userId),
    queryFn: async () => {
      const result = await promoClient
        .from("promocard_ledger")
        .select("id,entry_type,amount,currency,balance_after,business_night,cycle_id,moment_id,order_id,created_at,is_test,metadata")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(50);
      if (result.error) {
        if (isPromoCardLedgerUnavailable(result.error)) return [];
        throw result.error;
      }
      return (result.data || []).map(mapPromoCardLedgerRow);
    },
    staleTime: 30_000,
    retry: 1,
  });
}
