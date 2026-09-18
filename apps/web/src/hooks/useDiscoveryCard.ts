import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { peopleExperienceApi } from "@/services/peopleExperience";
import {
  perkTitleForPoll,
  readLocalCardUnlocks,
  writeLocalCardUnlock,
  type DiscoveryCardUnlock,
} from "@/lib/discovery-card";
import { readDiscoverAnonId } from "@/hooks/useDiscoveryDemand";

export async function unlockDiscoveryOntoCard(input: {
  city: string;
  poll: { id: string; question: string; targetUnlockPerk?: string };
  query?: string;
  aim?: string | null;
}): Promise<DiscoveryCardUnlock> {
  const cached = readLocalCardUnlocks().find((row) => row.pollId === input.poll.id);
  if (cached?.redemptionCode) return cached;

  const perkTitle = perkTitleForPoll(input.poll);

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session?.access_token) {
      try {
        const remote = await peopleExperienceApi.unlockDiscover({
          city: input.city,
          pollId: input.poll.id,
          question: input.poll.question,
          perkTitle,
          query: input.query,
          aim: input.aim || undefined,
        });
        if (remote?.redemptionCode) {
          return writeLocalCardUnlock({
            id: remote.id || `unlock:${input.poll.id}`,
            pollId: input.poll.id,
            pollQuestion: input.poll.question,
            perkTitle: remote.perkTitle || perkTitle,
            city: input.city,
            query: (input.query || "").trim() || undefined,
            redemptionCode: remote.redemptionCode,
            status: "claimed",
            createdAt: new Date().toISOString(),
            source: "discover",
          });
        }
      } catch {
        // Fall through to the durable Supabase RPC.
      }
    }

    const { data, error } = await (supabase as any).rpc("unlock_discovery_onto_card", {
      p_city: input.city,
      p_poll_id: input.poll.id,
      p_poll_question: input.poll.question,
      p_perk_title: perkTitle,
      p_query: input.query || null,
      p_anonymous_id: readDiscoverAnonId() || null,
    });
    if (error) throw error;
    if (Array.isArray(data) && data[0]?.redemption_code) {
      return writeLocalCardUnlock({
        id: data[0].unlock_id || `unlock:${input.poll.id}`,
        pollId: input.poll.id,
        pollQuestion: input.poll.question,
        perkTitle: data[0].perk_title || perkTitle,
        city: input.city,
        query: (input.query || "").trim() || undefined,
        redemptionCode: data[0].redemption_code,
        status: "claimed",
        createdAt: new Date().toISOString(),
        source: "discover",
      });
    }
  } catch (error) {
    throw error instanceof Error ? error : new Error("Could not put that perk on your card yet.");
  }

  throw new Error("Could not put that perk on your card yet.");
}

export function useDiscoveryCard() {
  const queryClient = useQueryClient();
  return {
    unlock: async (input: { city: string; poll: { id: string; question: string; targetUnlockPerk?: string }; query?: string; aim?: string | null }) => {
      const unlock = await unlockDiscoveryOntoCard(input);
      queryClient.invalidateQueries({ queryKey: ["experience-card"] });
      queryClient.invalidateQueries({ queryKey: ["discovery-card-unlocks"] });
      return unlock;
    },
    localUnlocks: readLocalCardUnlocks(),
  };
}
