import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VenueEnrichmentOpportunity {
  id: string;
  field_key: string;
  title: string;
  instructions: string;
  proof_requirements: string[];
  reward_points: number;
  status: "open" | "claimed";
  venue_slug: string;
}

export function useVenueEnrichment(venueSlug?: string) {
  return useQuery({
    queryKey: ["venue-enrichment", venueSlug],
    enabled: Boolean(venueSlug),
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("view_public_listing_enrichment")
        .select("*")
        .eq("venue_slug", venueSlug)
        .order("priority", { ascending: false })
        .limit(6);
      if (error) throw error;
      return (data || []) as VenueEnrichmentOpportunity[];
    },
  });
}

export function useClaimVenueEnrichment(venueSlug?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (opportunityId: string) => {
      const { data, error } = await (supabase as any).rpc("claim_listing_enrichment", {
        p_opportunity_id: opportunityId,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["venue-enrichment", venueSlug] }),
  });
}
