import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DiscoveryPoll } from "@/data/discoveriesData";

type CommunityDemandRow = {
  id: string;
  question: string;
  category: string;
  author_name: string;
  total_votes: number;
  threshold_for_moment: number;
  created_at: string;
  city: string | null;
  purpose: string | null;
  consequence: string | null;
  decision_owner: string | null;
  source: string | null;
  user_voted_option_id: string | null;
  options: Array<{ id: string; text: string; votes: number }>;
};

function purposeLabel(purpose?: string | null) {
  if (purpose === "unlock") return "Choose what should happen next";
  if (purpose === "demand") return "See if other people want this too";
  if (purpose === "motivation") return "Find what would move people";
  if (purpose === "verdict") return "Get a verdict before deciding";
  return "Help decide what happens next";
}

export function useCommunityDemandPolls(city?: string, limit = 20) {
  return useQuery({
    queryKey: ["community-demand-polls", city || "all", limit],
    queryFn: async () => {
      let query = (supabase as any)
        .from("view_public_community_demand_polls")
        .select("*")
        .order("total_votes", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit);

      if (city) query = query.eq("city", city);

      const { data, error } = await query;
      if (error) throw error;

      return ((data || []) as CommunityDemandRow[]).map((row): DiscoveryPoll => ({
        id: row.id,
        slug: row.id,
        question: row.question,
        category: row.category || "Community choice",
        categorySlug: "community-demand",
        authorName: row.author_name || "Community member",
        authorRole: row.decision_owner || "Community",
        description: row.consequence || "Your answer helps clarify what people want.",
        contextNotes: row.consequence
          ? "What happens next: " + row.consequence
          : "Answers help clarify the market. No supply, attendance or reward is automatic.",
        totalVotes: Number(row.total_votes || 0),
        thresholdForMoment: Number(row.threshold_for_moment || 35),
        signalKind: "demand",
        targetUnlockPerk: row.consequence || "Result informs the stated next decision",
        pointsReward: 0,
        options: Array.isArray(row.options) ? row.options : [],
        userVotedOptionId: row.user_voted_option_id || undefined,
        comments: [],
        tags: ["community question", row.city || ""].filter(Boolean),
        purpose: row.purpose || "demand",
        purposeLabel: purposeLabel(row.purpose),
        consequence: row.consequence || undefined,
        decisionOwner: row.decision_owner || undefined,
      }));
    },
  });
}
