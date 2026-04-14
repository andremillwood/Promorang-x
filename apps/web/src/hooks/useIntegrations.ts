import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface MerchantIntegration {
    id: string;
    provider: "shopify" | "square" | "woocommerce";
    status: "pending" | "connected" | "disconnected" | "error";
    external_store_name: string | null;
    external_store_id: string | null;
    last_synced_at: string | null;
    sync_status: "idle" | "syncing" | "success" | "error";
    sync_error: string | null;
    products_synced: number;
    created_at: string;
}

async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
    };
}

// Fetch all integration statuses
export function useIntegrations() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ["integrations", user?.id],
        queryFn: async () => {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_URL}/api/integrations/status`, { headers });
            if (!res.ok) throw new Error("Failed to fetch integrations");
            const data = await res.json();
            return data.integrations as MerchantIntegration[];
        },
        enabled: !!user,
    });
}

// Get a specific integration by provider
export function useIntegration(provider: string) {
    const { data: integrations } = useIntegrations();
    return integrations?.find(
        (i) => i.provider === provider && i.status === "connected"
    );
}

// Initiate Shopify OAuth
export function useShopifyConnect() {
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (shopDomain: string) => {
            const headers = await getAuthHeaders();
            const res = await fetch(
                `${API_URL}/api/integrations/shopify/connect?shop=${encodeURIComponent(shopDomain)}`,
                { headers }
            );
            if (!res.ok) throw new Error("Failed to initiate Shopify connection");
            return res.json();
        },
        onSuccess: (data) => {
            // Redirect to Shopify OAuth
            window.location.href = data.url;
        },
        onError: (error: any) => {
            toast({
                title: "Connection failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}

// Initiate Square OAuth
export function useSquareConnect() {
    const { toast } = useToast();

    return useMutation({
        mutationFn: async () => {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_URL}/api/integrations/square/connect`, { headers });
            if (!res.ok) throw new Error("Failed to initiate Square connection");
            return res.json();
        },
        onSuccess: (data) => {
            window.location.href = data.url;
        },
        onError: (error: any) => {
            toast({
                title: "Connection failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}

// Connect WooCommerce
export function useWooCommerceConnect() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: {
            siteUrl: string;
            consumerKey: string;
            consumerSecret: string;
        }) => {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_URL}/api/integrations/woocommerce/connect`, {
                method: "POST",
                headers,
                body: JSON.stringify(params),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to connect WooCommerce");
            }
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "WooCommerce connected! 🎉" });
            queryClient.invalidateQueries({ queryKey: ["integrations"] });
        },
        onError: (error: any) => {
            toast({
                title: "Connection failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}

// Sync products for a provider
export function useSyncProducts() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (provider: "shopify" | "square" | "woocommerce") => {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_URL}/api/integrations/${provider}/sync`, {
                method: "POST",
                headers,
            });
            if (!res.ok) throw new Error("Sync failed");
            return res.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Products synced! 📦",
                description: `${data.products_synced} products imported.`,
            });
            queryClient.invalidateQueries({ queryKey: ["integrations"] });
        },
        onError: (error: any) => {
            toast({
                title: "Sync failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}

// Disconnect an integration
export function useDisconnectIntegration() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (provider: string) => {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_URL}/api/integrations/${provider}/disconnect`, {
                method: "DELETE",
                headers,
            });
            if (!res.ok) throw new Error("Failed to disconnect");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Integration disconnected" });
            queryClient.invalidateQueries({ queryKey: ["integrations"] });
        },
        onError: (error: any) => {
            toast({
                title: "Disconnect failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}
