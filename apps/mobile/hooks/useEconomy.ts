import { useState, useEffect } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

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
    const [balance, setBalance] = useState<UserBalance | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown>(null);

    const fetchBalance = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await economyDb
                .from("economy_wallets")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setBalance(data as UserBalance);
            } else {
                setBalance({
                    user_id: user.id,
                    points: 0,
                    promokeys: 0,
                    gems: 0,
                    gold: 0,
                    usd: 0,
                    master_key_unlocked: false,
                    master_key_expires_at: null,
                    updated_at: new Date().toISOString()
                });
            }
        } catch (e) {
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalance();
    }, [user]);

    return { balance, loading, error, refetch: fetchBalance };
}

export function useEconomyHistory() {
    const { user } = useAuth();
    const [history, setHistory] = useState<EconomyTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown>(null);

    const fetchHistory = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await economyDb
                .from("economy_transactions")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(20);

            if (error) throw error;
            setHistory(data as EconomyTransaction[]);
        } catch (e) {
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [user]);

    return { history, loading, error, refetch: fetchHistory };
}

export function useGemWithdrawals() {
    const { user } = useAuth();
    const [withdrawals, setWithdrawals] = useState<GemWithdrawalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown>(null);

    const fetchWithdrawals = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        try {
            const { data, error } = await economyDb
                .from("gem_withdrawal_requests")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(20);
            if (error) throw error;
            setWithdrawals((data || []) as GemWithdrawalRequest[]);
        } catch (e) {
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, [user]);

    return { withdrawals, loading, error, refetch: fetchWithdrawals };
}

export function useGemWalletActions() {
    const requestWithdrawal = async (amount: number, note?: string) => {
        const { error } = await economyDb.rpc("request_gem_withdrawal", {
            p_gems_amount: amount,
            p_payout_note: note || null,
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
    };

    const cancelWithdrawal = async (requestId: string) => {
        const { error } = await economyDb.rpc("cancel_requested_gem_withdrawal", {
            p_request_id: requestId,
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
    };

    return { requestWithdrawal, cancelWithdrawal };
}
