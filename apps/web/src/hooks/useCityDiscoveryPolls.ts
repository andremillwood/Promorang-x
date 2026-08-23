import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CityDiscoveryPoll = {
  id: string;
  question: string;
  category: string;
  author_name: string;
  total_votes: number;
  threshold_for_moment: number;
  country_code: string;
  country_slug: string;
  city: string;
  city_slug: string;
  options: Array<{ id: string; text: string; votes: number }>;
};

export function useCityDiscoveryPolls(countrySlug: string, citySlug?: string, limit = 8) {
  return useQuery({
    queryKey: ["city-discovery-polls", countrySlug, citySlug, limit],
    enabled: Boolean(countrySlug),
    queryFn: async () => {
      let query = (supabase as any).from("view_public_city_discovery_polls").select("*").eq("country_slug", countrySlug).order("total_votes", { ascending: false }).limit(limit);
      if (citySlug) query = query.eq("city_slug", citySlug);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as CityDiscoveryPoll[];
    },
  });
}
