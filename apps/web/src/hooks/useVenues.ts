import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Venue {
  id: string;
  owner_id: string;
  name: string;
  address: string;
  description: string | null;
  image_url: string | null;
  category: string;
  phone: string | null;
  website: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useMerchantVenues() {
  const { user, activeOrgId } = useAuth();

  return useQuery({
    queryKey: ["merchant-venues", user?.id, activeOrgId],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("venues")
        .select("*")
        .order("created_at", { ascending: false });

      if (activeOrgId) {
        query = query.eq("organization_id", activeOrgId);
      } else {
        query = query.eq("owner_id", user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Venue[];
    },
    enabled: !!user,
  });
}

export function useCreateVenue() {
  const { user, activeOrgId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (venue: Partial<Venue>) => {
      if (!user) throw new Error("Not authenticated");

      const insertData: any = {
        owner_id: user.id,
        name: venue.name,
        address: venue.address,
        description: venue.description,
        image_url: venue.image_url,
        category: venue.category || "general",
        phone: venue.phone,
        website: venue.website,
      };

      if (activeOrgId) {
        insertData.organization_id = activeOrgId;
      }

      const { data, error } = await supabase
        .from("venues")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Venue Added! 🎉",
        description: "Your venue is now registered.",
      });
      queryClient.invalidateQueries({ queryKey: ["merchant-venues"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error adding venue",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useMerchantStats() {
  const { user, activeOrgId } = useAuth();

  return useQuery({
    queryKey: ["merchant-stats", user?.id, activeOrgId],
    queryFn: async () => {
      if (!user) return null;

      let query = supabase
        .from("venues")
        .select("*");

      if (activeOrgId) {
        query = query.eq("organization_id", activeOrgId);
      } else {
        query = query.eq("owner_id", user.id);
      }

      const { data: venues, error } = await query;

      if (error) throw error;

      const venueIds = venues.map((venue) => venue.id);
      let momentIds: string[] = [];
      if (venueIds.length) {
        const { data: moments } = await supabase.from("moments").select("id").in("venue_id", venueIds);
        momentIds = (moments || []).map((moment) => moment.id);
      }

      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      let weeklyTraffic = 0;
      let repeatVisitors = 0;
      if (momentIds.length) {
        const { data: arrivals } = await supabase
          .from("check_ins")
          .select("user_id, checked_in_at")
          .in("moment_id", momentIds)
          .eq("location_verified", true);
        const verifiedArrivals = arrivals || [];
        weeklyTraffic = verifiedArrivals.filter((arrival) => new Date(arrival.checked_in_at) >= startOfWeek).length;
        const visitsByUser = verifiedArrivals.reduce<Record<string, number>>((counts, arrival) => {
          counts[arrival.user_id] = (counts[arrival.user_id] || 0) + 1;
          return counts;
        }, {});
        repeatVisitors = Object.values(visitsByUser).filter((count) => count > 1).length;
      }

      const { data: orders } = await (supabase as any)
        .from("commerce_orders")
        .select("payment_status, fulfillment_status, merchant_net")
        .eq("merchant_id", user.id);
      const orderRows = orders || [];
      const paidOrders = orderRows.filter((order: any) => order.payment_status === "paid");

      return {
        totalVenues: venues.length,
        activeVenues: venues.filter((v) => v.is_active).length,
        weeklyTraffic,
        repeatVisitors,
        openOrders: orderRows.filter((order: any) => !["delivered", "redeemed", "cancelled"].includes(order.fulfillment_status)).length,
        paidOrders: paidOrders.length,
        revenue: paidOrders.reduce((sum: number, order: any) => sum + Number(order.merchant_net || 0), 0),
      };
    },
    enabled: !!user,
  });
}
