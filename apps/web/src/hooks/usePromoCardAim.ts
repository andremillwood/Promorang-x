import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { peopleExperienceApi } from "@/services/peopleExperience";
import { DISCOVERY_POLLS } from "@/data/discoveriesData";
import { matchPollForAim, resolveStoredPromoCardAim, writePromoCardAim } from "@/lib/promocard-aim";
import { useAuth } from "@/contexts/AuthContext";

export function usePromoCardAim() {
  const [searchParams] = useSearchParams();
  const aim = resolveStoredPromoCardAim(searchParams);

  useEffect(() => {
    if (aim) writePromoCardAim(aim);
  }, [aim]);

  return aim;
}

export function useApplyPromoCardAim() {
  const { user } = useAuth();
  const aim = usePromoCardAim();
  const queryClient = useQueryClient();
  const applied = useRef<string | null>(null);

  useEffect(() => {
    if (!user || !aim) return;
    const key = `${user.id}:${aim.id}`;
    if (applied.current === key) return;
    applied.current = key;

    const poll = matchPollForAim(aim, DISCOVERY_POLLS);
    if (!poll) return;

    void peopleExperienceApi
      .unlockDiscover({
        city: aim.city,
        pollId: poll.id,
        question: poll.question,
        perkTitle: poll.targetUnlockPerk,
        query: aim.discoverQuery,
      })
      .then((remote) => {
        if (!remote?.redemptionCode) return;
        queryClient.invalidateQueries({ queryKey: ["experience-card"] });
      })
      .catch(() => {
        applied.current = null;
      });
  }, [aim, queryClient, user]);

  return aim;
}
