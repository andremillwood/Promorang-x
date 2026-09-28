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
      const [membershipResult, linksResult, discoveriesResult, demandResult, offersResult] = await Promise.all([
        user ? db.from("scene_memberships").select("*").eq("scene_id", scene.id).eq("user_id", user.id).eq("membership_state", "active").limit(1).maybeSingle() : Promise.resolve({ data: null }),
        db.from("moment_scene_links").select("relationship,moments(*)").eq("scene_id", scene.id).limit(12),
        db.from("discoveries").select("*").eq("scene_id", scene.id).eq("verification_status", "approved").order("created_at", { ascending: false }).limit(12),
        db.from("discovery_questions").select("id,scene_id,semantic_kind,question,category,total_votes,threshold_for_moment,is_moment_triggered,created_at,discovery_options!discovery_options_discovery_id_fkey(id,option_text,votes_count)").eq("scene_id", scene.id).eq("semantic_kind", "demand").order("total_votes", { ascending: false }).limit(8),
        db.from("community_drops").select("id,slug,title,description,remaining").eq("scene_id", scene.id).eq("status", "active").gt("remaining", 0).limit(8),
      ]);
      if (membershipResult.error) throw membershipResult.error;
      const moments = (linksResult.data || []).map((link: any) => link.moments).filter(Boolean);
      const demandIds = (demandResult.data || []).map((item: any) => item.id);
      const responsesResult = demandIds.length
        ? await db.from("demand_activation_responses").select("id,discovery_id,proposal_id,response_summary,route,published_at").in("discovery_id", demandIds).order("published_at", { ascending: false })
        : { data: [] };
      const venueIds = [...new Set(moments.map((moment: any) => moment.venue_id).filter(Boolean))];
      const personIds = [...new Set(moments.map((moment: any) => moment.host_id || moment.organizer_id).filter(Boolean))];
      const [placesResult, peopleResult] = await Promise.all([
        venueIds.length
          ? db.from("view_public_venue_directory").select("id,slug,name,city,country,images").in("id", venueIds)
          : Promise.resolve({ data: [] }),
        personIds.length
          ? db.from("profiles").select("id,user_id,display_name,username,avatar_url").in("user_id", personIds)
          : Promise.resolve({ data: [] }),
      ]);
      // Some deployed databases predate the existing public-discovery-graph migration.
      // Omit unsupported Scene enrichment; never infer a relationship from city/category.
      const discoveryLinkUnavailable = discoveriesResult.error?.code === "42703"
        && discoveriesResult.error.message?.includes("scene_id");
      return {
        hasContentError: [linksResult, ...(discoveryLinkUnavailable ? [] : [discoveriesResult]), demandResult, offersResult, responsesResult, placesResult, peopleResult].some((result) => result.error),
        scene: scene as Scene,
        membership: (membershipResult.data || null) as SceneMembership | null,
        moments,
        discoveries: discoveriesResult.data || [],
        demand: demandResult.data || [],
        offers: offersResult.data || [],
        demandResponses: responsesResult.data || [],
        places: placesResult.data || [],
        people: peopleResult.data || [],
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
    onSuccess: async () => {
      await Promise.all([
        ["scene", scene?.slug], ["movement-feed-scene-memberships"],
        ["experience-home"], ["experience-card"], ["experience-hub"],
      ].map((queryKey) => queryClient.invalidateQueries({ queryKey })));
    },
  });
}
