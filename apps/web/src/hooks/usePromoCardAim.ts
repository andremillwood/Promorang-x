import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { resolvePromoCardAim, type PromoCardAim } from "@promorang/shared";
import { peopleExperienceApi } from "@/services/peopleExperience";
import { DISCOVERY_POLLS } from "@/data/discoveriesData";
import { matchPollForAim, resolveStoredPromoCardAim, writePromoCardAim } from "@/lib/promocard-aim";
import { useAuth } from "@/contexts/AuthContext";

export function usePromoCardAim(serverAim?: string | null) {
  const [searchParams, setSearchParams] = useSearchParams();
  const aim = resolveStoredPromoCardAim(searchParams) || resolvePromoCardAim(serverAim);

  useEffect(() => {
    if (aim) writePromoCardAim(aim);
  }, [aim]);

  const chooseAim = useCallback((next: PromoCardAim) => {
    writePromoCardAim(next);
    const params = new URLSearchParams(searchParams);
    params.set("aim", next.id);
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  return { aim, chooseAim };
}

export function useApplyPromoCardAim(serverAim?: string | null) {
  const { user } = useAuth();
  const { aim, chooseAim } = usePromoCardAim(serverAim);
  const queryClient = useQueryClient();
  const applied = useRef<string | null>(null);

  useEffect(() => {
    if (!user || !aim) return;
    const key = `${user.id}:${aim.id}`;
    if (applied.current === key) return;
    applied.current = key;

    const poll = matchPollForAim(aim, DISCOVERY_POLLS);
    void peopleExperienceApi
      .aimCard(aim.id)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["experience-card"] });
      })
      .catch(() => undefined);
    if (!poll) return;

    void peopleExperienceApi
      .unlockDiscover({
        city: aim.city,
        pollId: poll.id,
        question: poll.question,
        perkTitle: poll.targetUnlockPerk,
        query: aim.discoverQuery,
        aim: aim.id,
      })
      .then((remote) => {
        if (!remote?.redemptionCode) return;
        queryClient.invalidateQueries({ queryKey: ["experience-card"] });
      })
      .catch(() => {
        applied.current = null;
      });
  }, [aim, queryClient, user]);

  return { aim, chooseAim };
}
