import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { peopleExperienceApi } from "@/services/peopleExperience";

export function useExperienceHome() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["experience-home", user?.id],
    queryFn: () => peopleExperienceApi.home(),
    enabled: Boolean(user),
    retry: 1,
    staleTime: 30_000,
  });
}

export function useExperienceNetwork(sceneId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["experience-network", user?.id, sceneId],
    queryFn: () => peopleExperienceApi.network(sceneId),
    enabled: Boolean(user),
    retry: 1,
  });
}

export function useGiveablePerks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["experience-perks", user?.id],
    queryFn: () => peopleExperienceApi.perks(),
    enabled: Boolean(user),
    retry: 1,
  });
}

export function useOpportunities(sceneId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["experience-opportunities", user?.id, sceneId],
    queryFn: () => peopleExperienceApi.opportunities(sceneId),
    enabled: Boolean(user),
    retry: 1,
  });
}

export function useWhatHappened(sceneId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["experience-happened", user?.id, sceneId],
    queryFn: () => peopleExperienceApi.happened(sceneId),
    enabled: Boolean(user),
    retry: 1,
  });
}

export function useMyPromoCard() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["experience-card", user?.id],
    queryFn: () => peopleExperienceApi.card(),
    enabled: Boolean(user),
    retry: 1,
  });
}

export function usePublicDrop(slug?: string) {
  return useQuery({
    queryKey: ["experience-drop", slug],
    queryFn: () => peopleExperienceApi.drop(slug!),
    enabled: Boolean(slug),
    retry: 1,
  });
}

export function useHubExperience(slug?: string) {
  return useQuery({
    queryKey: ["experience-hub", slug],
    queryFn: () => peopleExperienceApi.hub(slug!),
    enabled: Boolean(slug),
    retry: 1,
  });
}

export function useExperienceActions() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["experience-home"] });
    queryClient.invalidateQueries({ queryKey: ["experience-network"] });
    queryClient.invalidateQueries({ queryKey: ["experience-perks"] });
    queryClient.invalidateQueries({ queryKey: ["experience-opportunities"] });
    queryClient.invalidateQueries({ queryKey: ["experience-happened"] });
    queryClient.invalidateQueries({ queryKey: ["experience-card"] });
    queryClient.invalidateQueries({ queryKey: ["experience-hub"] });
    queryClient.invalidateQueries({ queryKey: ["scene"] });
  };

  const createDrop = useMutation({
    mutationFn: peopleExperienceApi.createDrop,
    onSuccess: invalidate,
  });
  const claimDrop = useMutation({
    mutationFn: peopleExperienceApi.claimDrop,
    onSuccess: invalidate,
  });
  const takeOpportunity = useMutation({
    mutationFn: ({ id, sceneId }: { id: string; sceneId?: string }) => peopleExperienceApi.takeOpportunity(id, sceneId),
    onSuccess: invalidate,
  });
  const contribute = useMutation({
    mutationFn: ({ slug, kind }: { slug: string; kind?: string }) => peopleExperienceApi.contribute(slug, kind),
    onSuccess: invalidate,
  });
  const invite = useMutation({
    mutationFn: peopleExperienceApi.invite,
  });
  const start = useMutation({
    mutationFn: peopleExperienceApi.start,
    onSuccess: invalidate,
  });
  const ask = useMutation({
    mutationFn: peopleExperienceApi.ask,
    onSuccess: invalidate,
  });
  const provideInventory = useMutation({
    mutationFn: peopleExperienceApi.provideInventory,
    onSuccess: invalidate,
  });
  const gather = useMutation({
    mutationFn: peopleExperienceApi.gather,
    onSuccess: invalidate,
  });

  return { createDrop, claimDrop, takeOpportunity, contribute, invite, start, ask, provideInventory, gather };
}
