import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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

    return useQuery({
        queryKey: ["user-balance", user?.id],
        queryFn: async () => {
            if (!user) return null;

            const { data, error } = await supabase
                .from("user_balances")
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

export function useEconomyHistory() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ["economy-history", user?.id],
        queryFn: async () => {
            if (!user) return [];

            const { data, error } = await supabase
                .from("transaction_history")
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
