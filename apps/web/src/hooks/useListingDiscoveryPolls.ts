import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DiscoveryPoll } from "@/data/discoveriesData";

interface ListingPollRow {
  id: string;
  question: string;
  category: string;
  author_name: string;
  total_votes: number;
  threshold_for_moment: number;
  venue_slug: string;
  reward_points: number;
  options: Array<{ id: string; text: string; votes: number }>;
}

export function useListingDiscoveryPolls(limit = 6) {
  return useQuery({
    queryKey: ["listing-discovery-polls", limit],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("view_public_listing_discovery_polls")
        .select("*")
        .order("total_votes", { ascending: false })
        .limit(limit);
      if (error) throw error;

      return ((data || []) as ListingPollRow[]).map((row): DiscoveryPoll => ({
        id: row.id,
        slug: row.venue_slug,
        detailUrl: `/venues/${row.venue_slug}`,
        question: row.question,
        category: row.category,
        categorySlug: "place-verification",
        authorName: row.author_name,
        authorRole: "Community verification",
        description: "Help verify a public-source place listing.",
        contextNotes: "Votes guide Scout proof missions; they do not transfer ownership of the listing.",
        totalVotes: row.total_votes || 0,
        thresholdForMoment: row.threshold_for_moment || 5,
        targetUnlockPerk: "Unlock a verified local place profile",
        pointsReward: row.reward_points || 0,
        options: Array.isArray(row.options) ? row.options : [],
        comments: [],
        tags: ["enrichment", "place verification"],
      }));
    },
  });
}

export async function castListingDiscoveryVote(discoveryId: string, optionId: string) {
  const { error } = await (supabase as any).rpc("cast_listing_discovery_vote", {
    p_discovery_id: discoveryId,
    p_option_id: optionId,
  });
  if (error) throw error;
}
