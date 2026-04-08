import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Alert } from "react-native";

export interface Product {
    id: string;
    organization_id: string;
    name: string;
    description: string | null;
    price: number | null;
    currency: string;
    image_url: string | null;
    type: "physical" | "service" | "digital";
    status: string;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export function useProducts(organizationId?: string | null) {
    return useQuery({
        queryKey: ["products", organizationId],
        queryFn: async () => {
            if (!organizationId) return [];

            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("organization_id", organizationId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Product[];
        },
        enabled: !!organizationId,
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (product: Omit<Product, "id" | "created_at" | "updated_at">) => {
            const { data, error } = await supabase
                .from("products")
                .insert(product)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            Alert.alert("Success", "Product added to catalog.");
            queryClient.invalidateQueries({ queryKey: ["products", variables.organization_id] });
        },
        onError: (error: any) => {
            Alert.alert("Error", error.message);
        }
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, organizationId }: { id: string; organizationId: string }) => {
            const { error } = await supabase
                .from("products")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            Alert.alert("Deleted", "Product removed from catalog.");
            queryClient.invalidateQueries({ queryKey: ["products", variables.organizationId] });
        },
        onError: (error: any) => {
            Alert.alert("Error", error.message);
        }
    });
}
