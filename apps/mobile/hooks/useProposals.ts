import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Alert } from "react-native";
import { useAuth } from "@/context/AuthContext";

export interface Proposal {
    id: string;
    planner_id: string;
    brand_id: string | null;
    title: string;
    description: string | null;
    budget: number | null;
    status: 'draft' | 'sent' | 'accepted' | 'declined';
    target_moment_id: string | null;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
    brand?: {
        name: string;
    };
}

export function useProposals() {
    const { user, activeOrgId } = useAuth();

    return useQuery({
        queryKey: ["proposals", user?.id, activeOrgId],
        queryFn: async () => {
            if (!user) return [];

            // Fetch proposals where user is the planner OR the target brand is the active org
            let query = supabase
                .from("proposals")
                .select(`
                    *,
                    brand:brand_id (name)
                `)
                .order("created_at", { ascending: false });

            // Logic: If I am looking at my agency dashboard, I want to see things I PLANNED.
            // If I am looking at a Brand dashboard (via switcher), I want to see things sent TO ME.
            // For now, let's just fetch everything relevant to the user's ID or active Org context.

            if (activeOrgId) {
                query = query.or(`planner_id.eq.${user.id},brand_id.eq.${activeOrgId}`);
            } else {
                query = query.eq('planner_id', user.id);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as Proposal[];
        },
        enabled: !!user,
    });
}

export function useCreateProposal() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (proposal: Omit<Proposal, "id" | "created_at" | "updated_at" | "planner_id">) => {
            if (!user) throw new Error("not_authenticated");

            const { data, error } = await supabase
                .from("proposals")
                .insert({
                    ...proposal,
                    planner_id: user.id
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            Alert.alert("Success", "Proposal created.");
            queryClient.invalidateQueries({ queryKey: ["proposals"] });
        },
        onError: (error: any) => {
            Alert.alert("Error", error.message);
        }
    });
}
