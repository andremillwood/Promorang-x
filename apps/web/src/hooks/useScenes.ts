import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Scene, SceneMembership } from "@promorang/shared";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const db = supabase as any;

export function useScenes(filters?: { city?: string; country?: string; limit?: number }) {
  return useQuery({
    queryKey: ["scenes", "public", filters],
    queryFn: async () => {
      let query = db.from("scenes").select("*").eq("visibility", "public").eq("status", "active").order("updated_at", { ascending: false });
      if (filters?.city) query = query.ilike("city", filters.city);
      if (filters?.country) query = query.ilike("country", filters.country);
      if (filters?.limit) query = query.limit(filters.limit);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Scene[];
    },
  });
}

export function useScene(slug?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["scene", slug, user?.id],
    enabled: Boolean(slug),
    queryFn: async () => {
      const { data: scene, error } = await db.from("scenes").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      if (!scene) return null;
      const [membershipResult, linksResult, discoveriesResult] = await Promise.all([
        user ? db.from("scene_memberships").select("*").eq("scene_id", scene.id).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
        db.from("moment_scene_links").select("relationship,moments(*)").eq("scene_id", scene.id).limit(12),
        db.from("discoveries").select("*").eq("scene_id", scene.id).eq("verification_status", "approved").order("created_at", { ascending: false }).limit(12),
      ]);
      return {
        scene: scene as Scene,
        membership: (membershipResult.data || null) as SceneMembership | null,
        moments: (linksResult.data || []).map((link: any) => link.moments).filter(Boolean),
        discoveries: discoveriesResult.data || [],
      };
    },
  });
}

export function useJoinScene(scene?: Scene | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to join this Scene");
      if (!scene) throw new Error("Scene unavailable");
      const ref = new URLSearchParams(window.location.search).get("ref");
      let invitedBy: string | null = null;
      if (ref) {
        const referrer = await db.from("users").select("id").eq("primary_referral_code", ref).maybeSingle();
        if (referrer.data?.id && referrer.data.id !== user.id) invitedBy = referrer.data.id;
      }
      const { error } = await db.from("scene_memberships").upsert({ scene_id: scene.id, user_id: user.id, relationship: "participant", membership_state: "active" }, { onConflict: "scene_id,user_id,relationship" });
      if (error) throw error;
      if (invitedBy) {
        await db.from("hub_member_attributions").upsert({
          scene_id: scene.id,
          member_user_id: user.id,
          attributed_by_user_id: invitedBy,
          source: "invite",
        }, { onConflict: "scene_id,member_user_id" });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["scene", scene?.slug] }),
  });
}
