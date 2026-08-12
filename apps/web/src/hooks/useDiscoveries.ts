import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Discovery } from "@promorang/shared";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const db = supabase as any;

export function useDiscoveries(filters?: { category?: string; city?: string; country?: string; limit?: number }) {
  return useQuery({
    queryKey: ["discoveries", filters],
    queryFn: async () => {
      let query = db
        .from("discoveries")
        .select("*")
        .eq("verification_status", "approved")
        .order("created_at", { ascending: false });

      if (filters?.category && filters.category !== "all") {
        query = query.eq("category", filters.category);
      }
      if (filters?.city) {
        query = query.ilike("city", filters.city);
      }
      if (filters?.country) {
        query = query.ilike("country", filters.country);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) {
        console.warn("Error fetching discoveries:", error);
        return [];
      }
      return (data || []) as Discovery[];
    },
  });
}

export function useDiscovery(slug?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["discovery", slug, user?.id],
    enabled: Boolean(slug),
    queryFn: async () => {
      const { data: discovery, error } = await db
        .from("discoveries")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      if (!discovery) return null;

      // Fetch related scene if present
      let scene = null;
      if (discovery.scene_id) {
        const { data: s } = await db.from("scenes").select("id, slug, title, city").eq("id", discovery.scene_id).maybeSingle();
        scene = s;
      }

      // Fetch creator profile if present
      let creatorProfile = null;
      if (discovery.creator_id) {
        const { data: p } = await db.from("profiles").select("id, display_name, username, avatar_url").eq("id", discovery.creator_id).maybeSingle();
        creatorProfile = p;
      }

      return {
        ...discovery,
        scene,
        creator_profile: creatorProfile,
      } as Discovery;
    },
  });
}

export function useSaveDiscovery(discoveryId?: string | number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to save this Discovery");
      if (!discoveryId) throw new Error("Discovery unavailable");

      // Increment save count in database
      const { error } = await db.rpc("increment_discovery_save", { d_id: discoveryId });
      if (error) {
        // Fallback direct update
        await db.from("discoveries").update({ save_count: db.raw("save_count + 1") }).eq("id", discoveryId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discoveries"] });
      queryClient.invalidateQueries({ queryKey: ["discovery"] });
    },
  });
}
