import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface StakeholderEconomyStats {
    totalPointsDistributed: number;
    totalKeysImpacted: number;
    activeMomentROI: number;
    unusualActivityCount: number;
}

export function useBrandEconomy() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ["brand-economy", user?.id],
        queryFn: async () => {
            if (!user) return null;

            // 1. Get all moments owned by this brand
            const { data: moments } = await supabase
                .from("moments")
                .select("id")
                .eq("organizer_id", user.id);

            const momentIds = moments?.map(m => m.id) || [];
            if (momentIds.length === 0) return { totalPointsDistributed: 0, totalKeysImpacted: 0, activeMomentROI: 0, unusualActivityCount: 0 };

            // 2. Sum points from transaction_history where reference_id is in momentIds
            const { data: transactions, error } = await supabase
                .from("transaction_history")
                .select("amount")
                .eq("currency", "points")
                .in("reference_id", momentIds);

            if (error) throw error;

            const totalPoints = transactions?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;

            return {
                totalPointsDistributed: totalPoints,
                totalKeysImpacted: Math.floor(totalPoints / 1000), // Platform standard conversion
                activeMomentROI: totalPoints > 0 ? (totalPoints / momentIds.length) : 0,
                unusualActivityCount: 0 // Placeholder for fraud detection logic
            };
        },
        enabled: !!user,
    });
}

export function useMerchantEconomy() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ["merchant-economy", user?.id],
        queryFn: async () => {
            if (!user) return null;

            // 1. Get venues owned by merchant
            const { data: venues } = await supabase
                .from("venues")
                .select("id")
                .eq("owner_id", user.id);

            const venueIds = venues?.map(v => v.id) || [];
            if (venueIds.length === 0) return { totalPointsEarned: 0, visitorCount: 0, yieldPerVisitor: 0 };

            // 2. Get moments at these venues
            const { data: moments } = await supabase
                .from("moments")
                .select("id")
                .in("venue_id", venueIds);

            const momentIds = moments?.map(m => m.id) || [];
            if (momentIds.length === 0) return { totalPointsEarned: 0, visitorCount: 0, yieldPerVisitor: 0 };

            // 3. Sum points for these moments
            const { data: transactions, error } = await supabase
                .from("transaction_history")
                .select("amount")
                .eq("currency", "points")
                .in("reference_id", momentIds);

            if (error) throw error;

            const totalPoints = transactions?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;

            return {
                totalPointsEarned: totalPoints,
                visitorCount: transactions?.length || 0,
                yieldPerVisitor: transactions?.length ? (totalPoints / transactions.length) : 0
            };
        },
        enabled: !!user,
    });
}

export function useHostEconomy() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ["host-economy", user?.id],
        queryFn: async () => {
            if (!user) return null;

            // Hosts own moments
            const { data: moments } = await supabase
                .from("moments")
                .select("id")
                .eq("organizer_id", user.id);

            const momentIds = moments?.map(m => m.id) || [];
            if (momentIds.length === 0) return { economicInfluence: 0, pointsGenerated: 0 };

            const { data: transactions, error } = await supabase
                .from("transaction_history")
                .select("amount")
                .eq("currency", "points")
                .in("reference_id", momentIds);

            if (error) throw error;

            const totalPoints = transactions?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;

            return {
                economicInfluence: totalPoints,
                pointsGenerated: totalPoints
            };
        },
        enabled: !!user,
    });
}
