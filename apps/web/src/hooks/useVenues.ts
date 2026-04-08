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

      // For now, we'll return placeholder stats since we don't track venue traffic yet
      return {
        totalVenues: venues.length,
        activeVenues: venues.filter((v) => v.is_active).length,
        weeklyTraffic: 0, // Would need traffic tracking implementation
        growth: 0,
      };
    },
    enabled: !!user,
  });
}
