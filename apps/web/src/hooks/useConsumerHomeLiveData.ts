import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useScenes } from "@/hooks/useScenes";
import { useDiscoveries } from "@/hooks/useDiscoveries";
import { useJoinedMoments } from "@/hooks/useMoments";
import { useReferralCodes, useReferralStats } from "@/hooks/useReferrals";
import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

export function useConsumerHomeLiveData() {
  const { user, profile, session } = useAuth();
  const scenes = useScenes({ city: "Kingston", country: "Jamaica", limit: 3 });
  const discoveries = useDiscoveries({ city: "Kingston", country: "Jamaica", limit: 4 });
  const joinedMoments = useJoinedMoments();
  const referralCodes = useReferralCodes();
  const referralStats = useReferralStats();

  const polls = useQuery({
    queryKey: ["consumer-home-live-polls"],
    queryFn: async () => {
      const { data, error } = await db
        .from("discovery_questions")
        .select("id,scene_id,question,category,total_votes,is_moment_triggered,created_at,discovery_options(id,option_text,votes_count)")
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60_000,
  });

  const pieces = useQuery({
    queryKey: ["consumer-home-pieces", user?.id],
    enabled: Boolean(session?.access_token),
    queryFn: async () => {
      const apiBaseUrl = (import.meta.env.VITE_API_URL || "https://api.promorang.co").replace(/\/$/, "");
      const apiUrl = `${apiBaseUrl}${apiBaseUrl.endsWith("/api") ? "" : "/api"}/pieces/portfolio/me`;
      const response = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!response.ok) return { positions: [], total_value: 0 };
      const payload = await response.json();
      return {
        positions: payload.positions || [],
        total_value: Number(payload.total_value || 0),
      };
    },
    staleTime: 60_000,
  });

  const activePromoKeys = useQuery({
    queryKey: ["consumer-home-promokeys", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await db
        .from("promokey_claims")
        .select("id,moment_id,promo_code,perk_description,venue_name,expires_at,is_redeemed")
        .eq("user_id", user!.id)
        .eq("is_redeemed", false)
        .gt("expires_at", new Date().toISOString())
        .order("expires_at", { ascending: true })
        .limit(5);
      if (error) return [];
      return data || [];
    },
    staleTime: 30_000,
  });

  const plans = useMemo(() => {
    const now = Date.now();
    return (joinedMoments.data || [])
      .filter((moment: any) => {
        const startsAt = moment.starts_at ? new Date(moment.starts_at).getTime() : Number.NaN;
        return Number.isFinite(startsAt) && startsAt >= now;
      })
      .slice(0, 3);
  }, [joinedMoments.data]);

  const pointsBalance = Number((profile as any)?.points_balance || (profile as any)?.promo_points || 0);

  return {
    user,
    profile,
    scenes,
    discoveries,
    polls,
    plans,
    plansLoading: joinedMoments.isLoading,
    referralCodes,
    referralStats,
    pieces,
    activePromoKeys,
    pointsBalance,
  };
}
