import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export interface UserBalance {
    user_id: string;
    points: number;
    promokeys: number;
    gems: number;
    gold: number;
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

export function useUserBalance() {
    const { user } = useAuth();
    const [balance, setBalance] = useState<UserBalance | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchBalance = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from("user_balances")
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
    const [error, setError] = useState<any>(null);

    const fetchHistory = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from("transaction_history")
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
