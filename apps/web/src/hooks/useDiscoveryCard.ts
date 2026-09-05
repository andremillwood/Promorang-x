import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { peopleExperienceApi } from "@/services/peopleExperience";
import {
  perkTitleForPoll,
  readLocalCardUnlocks,
  unlockFromPoll,
  writeLocalCardUnlock,
  type DiscoveryCardUnlock,
} from "@/lib/discovery-card";
import { readDiscoverAnonId } from "@/hooks/useDiscoveryDemand";

export async function unlockDiscoveryOntoCard(input: {
  city: string;
  poll: { id: string; question: string; targetUnlockPerk?: string };
  query?: string;
}): Promise<DiscoveryCardUnlock> {
  const existing = readLocalCardUnlocks().find((row) => row.pollId === input.poll.id) || null;
  const local = writeLocalCardUnlock(unlockFromPoll({ ...input, existing }));

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session?.access_token) {
      try {
        const remote = await peopleExperienceApi.unlockDiscover({
          city: input.city,
          pollId: input.poll.id,
          question: input.poll.question,
          perkTitle: perkTitleForPoll(input.poll),
          query: input.query,
        });
        if (remote?.redemptionCode) {
          return writeLocalCardUnlock({
            ...local,
            id: remote.id || local.id,
            redemptionCode: remote.redemptionCode,
            perkTitle: remote.perkTitle || local.perkTitle,
          });
        }
      } catch {
        // RPC still records the card when the API is down.
      }
    }

    const { data, error } = await (supabase as any).rpc("unlock_discovery_onto_card", {
      p_city: input.city,
      p_poll_id: input.poll.id,
      p_poll_question: input.poll.question,
      p_perk_title: local.perkTitle,
      p_query: input.query || null,
      p_anonymous_id: readDiscoverAnonId() || null,
    });
    if (!error && Array.isArray(data) && data[0]?.redemption_code) {
      return writeLocalCardUnlock({
        ...local,
        id: data[0].unlock_id || local.id,
        redemptionCode: data[0].redemption_code,
        perkTitle: data[0].perk_title || local.perkTitle,
      });
    }
  } catch {
    // Local slip is enough for this browser.
  }

  return local;
}

export function useDiscoveryCard() {
  const queryClient = useQueryClient();
  return {
    unlock: async (input: { city: string; poll: { id: string; question: string; targetUnlockPerk?: string }; query?: string }) => {
      const unlock = await unlockDiscoveryOntoCard(input);
      queryClient.invalidateQueries({ queryKey: ["experience-card"] });
      queryClient.invalidateQueries({ queryKey: ["discovery-card-unlocks"] });
      return unlock;
    },
    localUnlocks: readLocalCardUnlocks(),
  };
}
