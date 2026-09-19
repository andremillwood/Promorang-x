import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Discovery } from "@promorang/shared";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const db = supabase as any;

export function useDiscoveries(filters?: { category?: string; city?: string; country?: string; limit?: number }) {
  return useQuery({
    queryKey: ["discoveries", "approved", filters],
    queryFn: async () => {
      let query = db
        .from("discoveries")
        .select("*")
        .eq("verification_status", "approved")
        .order("created_at", { ascending: false });

      if (filters?.category && filters.category !== "all") query = query.eq("category", filters.category);
      if (filters?.city) query = query.ilike("city", filters.city);
      if (filters?.country) query = query.ilike("country", filters.country);
      if (filters?.limit) query = query.limit(filters.limit);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Discovery[];
    },
  });
}

export function useDiscovery(slug?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["discovery", "approved", slug, user?.id],
    enabled: Boolean(slug),
    queryFn: async () => {
      let result = await db
        .from("discoveries")
        .select("*")
        .eq("slug", slug)
        .eq("verification_status", "approved")
        .maybeSingle();

      let discovery = result.data;
      let error = result.error;

      if (!discovery && slug) {
        result = await db
          .from("discoveries")
          .select("*")
          .eq("id", slug)
          .eq("verification_status", "approved")
          .maybeSingle();
        discovery = result.data;
        error = result.error;
      }

      if (error) throw error;
      if (!discovery) return null;

      const [sceneResult, creatorResult, venueResult] = await Promise.all([
        discovery.scene_id
          ? db.from("scenes").select("id,slug,title,city").eq("id", discovery.scene_id).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
        discovery.creator_id
          ? db.from("profiles").select("id,display_name,username,avatar_url,reputation_title").eq("id", discovery.creator_id).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
        discovery.venue_id
          ? db.from("venues").select("id,name,city").eq("id", discovery.venue_id).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);

      return {
        ...discovery,
        scene: sceneResult.data || undefined,
        creator_profile: creatorResult.data || undefined,
        venue: venueResult.data || undefined,
      } as Discovery;
    },
  });
}

/**
 * Records aggregate interest in a Discovery. This is not a personal Vault save.
 * Personal retained-value semantics belong to the Piece/Vault family.
 */
export function useSaveDiscovery(discoveryId?: string | number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to register interest in this Discovery");
      if (!discoveryId) throw new Error("Discovery unavailable");
      const { error } = await db.rpc("increment_discovery_save", { d_id: discoveryId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discoveries"] });
      queryClient.invalidateQueries({ queryKey: ["discovery"] });
    },
  });
}
