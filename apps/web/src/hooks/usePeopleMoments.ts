import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  addSocialPlanOption,
  attachMomentPerk,
  claimMomentPerk,
  convertSocialPlan,
  createPeopleMoment,
  createSocialPlan,
  fetchDemandSnapshot,
  fetchHappeningNow,
  fetchMySocialPlans,
  fetchPeopleParticipants,
  fetchSocialPlan,
  joinPeopleMoment,
  requestMomentClaim,
  sendPeopleInvite,
  voteSocialPlanOption,
} from "@/lib/people-moments-api";

export function useHappeningNow() {
  return useQuery({
    queryKey: ["people-moments", "happening-now"],
    queryFn: async () => (await fetchHappeningNow()).moments,
  });
}

export function useMySocialPlans(enabled = true) {
  return useQuery({
    queryKey: ["people-moments", "my-plans"],
    enabled,
    queryFn: async () => (await fetchMySocialPlans()).plans,
  });
}

export function useMomentParticipants(momentId?: string | null) {
  return useQuery({
    queryKey: ["people-moments", "participants", momentId],
    enabled: Boolean(momentId),
    queryFn: async () => (await fetchPeopleParticipants(momentId as string)).participants,
  });
}

export function useMomentDemand(momentId?: string | null) {
  return useQuery({
    queryKey: ["people-moments", "demand", momentId],
    enabled: Boolean(momentId),
    queryFn: async () => (await fetchDemandSnapshot(momentId as string)).snapshot,
  });
}

export function useMomentPerks(momentId?: string | null) {
  return useQuery({
    queryKey: ["people-moments", "perks", momentId],
    enabled: Boolean(momentId),
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("moment_perks")
        .select("*")
        .eq("moment_id", momentId)
        .eq("status", "live")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useSocialPlan(planId?: string | null) {
  return useQuery({
    queryKey: ["people-moments", "plan", planId],
    enabled: Boolean(planId),
    queryFn: async () => (await fetchSocialPlan(planId as string)).plan,
  });
}

export function useCreatePeopleMoment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPeopleMoment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people-moments"] });
    },
  });
}

export function useJoinPeopleMoment(momentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown> = {}) => joinPeopleMoment(momentId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people-moments", "participants", momentId] });
      queryClient.invalidateQueries({ queryKey: ["people-moments", "demand", momentId] });
    },
  });
}

export function useInviteToMoment() {
  return useMutation({
    mutationFn: sendPeopleInvite,
  });
}

export function useClaimMoment(momentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown> = {}) => requestMomentClaim(momentId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["people-moments", "demand", momentId] }),
  });
}

export function useAttachMomentPerk(momentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => attachMomentPerk(momentId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["people-moments", "perks", momentId] }),
  });
}

export function useClaimMomentPerk(momentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (perkId: string) => claimMomentPerk(perkId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["people-moments", "perks", momentId] }),
  });
}

export function useCreateSocialPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSocialPlan,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["people-moments", "my-plans"] }),
  });
}

export function usePlanActions(planId: string) {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["people-moments", "plan", planId] });
  return {
    addOption: useMutation({
      mutationFn: (body: Record<string, unknown>) => addSocialPlanOption(planId, body),
      onSuccess: refresh,
    }),
    vote: useMutation({
      mutationFn: (optionId: string) => voteSocialPlanOption(planId, optionId),
      onSuccess: refresh,
    }),
    convert: useMutation({
      mutationFn: (body: Record<string, unknown> = {}) => convertSocialPlan(planId, body),
      onSuccess: refresh,
    }),
  };
}
