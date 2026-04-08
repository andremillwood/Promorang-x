import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface MerchantProduct {
  id: string;
  merchant_id: string;
  venue_id: string | null;
  name: string;
  description: string | null;
  category: string | null;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  currency: string;
  inventory_quantity: number;
  inventory_policy: string;
  is_active: boolean;
  is_redeemable_with_points: boolean;
  points_cost: number | null;
  images: string[];
  variants: any[];
  external_id: string | null;
  external_source: string | null;
  external_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductRedemption {
  id: string;
  user_id: string;
  product_id: string;
  brand_id: string;
  points_spent: number;
  quantity: number;
  status: string;
  shipping_address: Record<string, any> | null;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MerchantIntegration {
  id: string;
  merchant_id: string;
  platform: string;
  store_url: string | null;
  is_active: boolean;
  sync_status: string;
  sync_error: string | null;
  last_sync_at: string | null;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Fetch merchant's products
export function useMerchantProducts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["merchant-products", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("merchant_products")
        .select("*")
        .eq("merchant_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MerchantProduct[];
    },
    enabled: !!user,
  });
}

// Fetch products available for point redemption
export function useRedeemableProducts(brandId?: string) {
  return useQuery({
    queryKey: ["redeemable-products", brandId],
    queryFn: async () => {
      let query = supabase
        .from("merchant_products")
        .select("*")
        .eq("is_active", true)
        .eq("is_redeemable_with_points", true)
        .gt("inventory_quantity", 0)
        .order("points_cost", { ascending: true });

      if (brandId) {
        query = query.eq("merchant_id", brandId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as MerchantProduct[];
    },
  });
}

// Create a product
export function useCreateProduct() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Omit<MerchantProduct, "id" | "merchant_id" | "created_at" | "updated_at" | "external_id" | "external_source" | "external_sync_at">) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("merchant_products")
        .insert({
          ...product,
          merchant_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Product created! 📦",
        description: "Your product is now available.",
      });
      queryClient.invalidateQueries({ queryKey: ["merchant-products"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create product",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Update a product
export function useUpdateProduct() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      updates,
    }: {
      productId: string;
      updates: Partial<MerchantProduct>;
    }) => {
      const { error } = await supabase
        .from("merchant_products")
        .update(updates)
        .eq("id", productId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Product updated",
        description: "Changes have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["merchant-products"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Delete a product
export function useDeleteProduct() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from("merchant_products")
        .delete()
        .eq("id", productId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Product deleted",
        description: "The product has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["merchant-products"] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Redeem a product with points
export function useRedeemProduct() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      brandId,
      quantity = 1,
      shippingAddress,
    }: {
      productId: string;
      brandId: string;
      quantity?: number;
      shippingAddress?: Record<string, any>;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Get product details
      const { data: product } = await supabase
        .from("merchant_products")
        .select("points_cost, inventory_quantity")
        .eq("id", productId)
        .single();

      if (!product || !product.points_cost) {
        throw new Error("Product not available for redemption");
      }

      if (product.inventory_quantity < quantity) {
        throw new Error("Insufficient inventory");
      }

      const pointsRequired = product.points_cost * quantity;

      // Check user's points
      const { data: userPoints } = await supabase
        .from("user_brand_points")
        .select("current_points")
        .eq("user_id", user.id)
        .eq("brand_id", brandId)
        .maybeSingle();

      if (!userPoints || (userPoints.current_points || 0) < pointsRequired) {
        throw new Error("Insufficient points");
      }

      // Create redemption
      const { data, error } = await supabase
        .from("product_redemptions")
        .insert({
          user_id: user.id,
          product_id: productId,
          brand_id: brandId,
          points_spent: pointsRequired,
          quantity,
          shipping_address: shippingAddress || null,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      // Deduct points
      await supabase
        .from("user_brand_points")
        .update({
          current_points: (userPoints.current_points || 0) - pointsRequired,
        })
        .eq("user_id", user.id)
        .eq("brand_id", brandId);

      // Log transaction
      await supabase
        .from("point_transactions")
        .insert({
          user_id: user.id,
          brand_id: brandId,
          action: "redemption",
          points: -pointsRequired,
          description: `Redeemed product`,
          reference_type: "product_redemption",
          reference_id: data.id,
        });

      // Decrease inventory
      await supabase
        .from("merchant_products")
        .update({
          inventory_quantity: product.inventory_quantity - quantity,
        })
        .eq("id", productId);

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Product redeemed! 🎁",
        description: "Your redemption is being processed.",
      });
      queryClient.invalidateQueries({ queryKey: ["user-points"] });
      queryClient.invalidateQueries({ queryKey: ["point-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["product-redemptions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Redemption failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Fetch user's redemptions
export function useUserRedemptions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-redemptions", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("product_redemptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ProductRedemption[];
    },
    enabled: !!user,
  });
}

// Fetch redemptions for merchant
export function useMerchantRedemptions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["merchant-redemptions", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("product_redemptions")
        .select("*")
        .eq("brand_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ProductRedemption[];
    },
    enabled: !!user,
  });
}

// Update redemption status
export function useUpdateRedemptionStatus() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      redemptionId,
      status,
      trackingNumber,
      notes,
    }: {
      redemptionId: string;
      status: string;
      trackingNumber?: string;
      notes?: string;
    }) => {
      const { error } = await supabase
        .from("product_redemptions")
        .update({
          status,
          tracking_number: trackingNumber || null,
          notes: notes || null,
        })
        .eq("id", redemptionId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Redemption updated",
        description: "Status has been changed.",
      });
      queryClient.invalidateQueries({ queryKey: ["merchant-redemptions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Fetch merchant integrations
export function useMerchantIntegrations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["merchant-integrations", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("merchant_integrations")
        .select("*")
        .eq("merchant_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MerchantIntegration[];
    },
    enabled: !!user,
  });
}

// Get merchant inventory stats
export function useMerchantInventoryStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["merchant-inventory-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: products } = await supabase
        .from("merchant_products")
        .select("price, inventory_quantity, is_active, is_redeemable_with_points")
        .eq("merchant_id", user.id);

      if (!products) return null;

      const totalProducts = products.length;
      const activeProducts = products.filter((p) => p.is_active).length;
      const redeemableProducts = products.filter((p) => p.is_redeemable_with_points).length;
      const totalInventory = products.reduce((sum, p) => sum + (p.inventory_quantity || 0), 0);
      const lowStock = products.filter((p) => (p.inventory_quantity || 0) < 10).length;

      // Get pending redemptions count
      const { count: pendingRedemptions } = await supabase
        .from("product_redemptions")
        .select("*", { count: "exact", head: true })
        .eq("brand_id", user.id)
        .eq("status", "pending");

      return {
        totalProducts,
        activeProducts,
        redeemableProducts,
        totalInventory,
        lowStock,
        pendingRedemptions: pendingRedemptions || 0,
      };
    },
    enabled: !!user,
  });
}
