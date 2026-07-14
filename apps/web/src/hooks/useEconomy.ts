import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const economyDb = supabase as unknown as SupabaseClient;

export interface UserBalance {
    user_id: string;
    points: number;
    promokeys: number;
    gems: number;
    gold: number;
    usd: number;
    master_key_unlocked: boolean;
    master_key_expires_at: string | null;
    updated_at: string;
}

export interface EconomyTransaction {
    id: string;
    user_id: string;
    currency: 'points' | 'promokeys' | 'gems' | 'gold';
    amount: number;
    transaction_type: string;
    source: string;
    description: string | null;
    created_at: string;
}

export interface GemWithdrawalRequest {
    id: string;
    user_id: string;
    gems_amount: number;
    usd_amount: number;
    fee_gems: number;
    status: string;
    payout_reference: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

export function useUserBalance() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ["user-balance", user?.id],
        queryFn: async () => {
            if (!user) return null;

            const { data, error } = await economyDb
                .from("economy_wallets")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle();

            if (error) throw error;

            // If no balance exists, return a default one (usually handled by DB trigger but good to have safety)
            if (!data) {
                return {
                    user_id: user.id,
                    points: 0,
                    promokeys: 0,
                    gems: 0,
                    gold: 0,
                    usd: 0,
                    master_key_unlocked: false,
                    master_key_expires_at: null,
                    updated_at: new Date().toISOString()
                } as UserBalance;
            }

            return data as UserBalance;
        },
        enabled: !!user,
    });
}

export function useGemWithdrawals() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ["gem-withdrawals", user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await economyDb
                .from("gem_withdrawal_requests")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(20);

            if (error) throw error;
            return data as GemWithdrawalRequest[];
        },
        enabled: !!user,
    });
}

export function useGemWalletActions() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const refresh = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["user-balance", user?.id] }),
            queryClient.invalidateQueries({ queryKey: ["economy-history", user?.id] }),
            queryClient.invalidateQueries({ queryKey: ["gem-withdrawals", user?.id] }),
        ]);
    };

    const requestWithdrawal = useMutation({
        mutationFn: async ({ amount, note }: { amount: number; note?: string }) => {
            const { error } = await economyDb.rpc("request_gem_withdrawal", {
                p_gems_amount: amount,
                p_payout_note: note || null,
            });
            if (error) throw error;
        },
        onSuccess: refresh,
    });

    const cancelWithdrawal = useMutation({
        mutationFn: async (requestId: string) => {
            const { error } = await economyDb.rpc("cancel_requested_gem_withdrawal", {
                p_request_id: requestId,
            });
            if (error) throw error;
        },
        onSuccess: refresh,
    });

    return { requestWithdrawal, cancelWithdrawal };
}

export function useEconomyHistory() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ["economy-history", user?.id],
        queryFn: async () => {
            if (!user) return [];

            const { data, error } = await economyDb
                .from("economy_transactions")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(20);

            if (error) throw error;
            return data as EconomyTransaction[];
        },
        enabled: !!user,
    });
}
