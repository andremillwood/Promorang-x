import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/AuthContext';
import { peopleExperienceApi } from '@/lib/api';

export function useExperienceHome() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['experience-home', user?.id],
    queryFn: () => peopleExperienceApi.home(),
    enabled: Boolean(user),
    retry: 1,
    staleTime: 30_000,
  });
}

export function useExperienceNetwork(sceneId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['experience-network', user?.id, sceneId],
    queryFn: () => peopleExperienceApi.network(sceneId),
    enabled: Boolean(user),
    retry: 1,
  });
}

export function useGiveablePerks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['experience-perks', user?.id],
    queryFn: () => peopleExperienceApi.perks(),
    enabled: Boolean(user),
    retry: 1,
  });
}

export function useOpportunities(sceneId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['experience-opportunities', user?.id, sceneId],
    queryFn: () => peopleExperienceApi.opportunities(sceneId),
    enabled: Boolean(user),
    retry: 1,
  });
}

export function useWhatHappened(sceneId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['experience-happened', user?.id, sceneId],
    queryFn: () => peopleExperienceApi.happened(sceneId),
    enabled: Boolean(user),
    retry: 1,
  });
}

export function useMyPromoCard() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['experience-card', user?.id],
    queryFn: () => peopleExperienceApi.card(),
    enabled: Boolean(user),
    retry: 1,
  });
}

export function usePublicDrop(slug?: string) {
  return useQuery({
    queryKey: ['experience-drop', slug],
    queryFn: () => peopleExperienceApi.drop(slug!),
    enabled: Boolean(slug),
    retry: 1,
  });
}

export function useExperienceActions() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['experience-home'] });
    queryClient.invalidateQueries({ queryKey: ['experience-network'] });
    queryClient.invalidateQueries({ queryKey: ['experience-perks'] });
    queryClient.invalidateQueries({ queryKey: ['experience-opportunities'] });
    queryClient.invalidateQueries({ queryKey: ['experience-happened'] });
    queryClient.invalidateQueries({ queryKey: ['experience-card'] });
  };

  return {
    createDrop: useMutation({
      mutationFn: peopleExperienceApi.createDrop,
      onSuccess: invalidate,
    }),
    claimDrop: useMutation({
      mutationFn: peopleExperienceApi.claimDrop,
      onSuccess: invalidate,
    }),
    takeOpportunity: useMutation({
      mutationFn: ({ id, sceneId }: { id: string; sceneId?: string }) =>
        peopleExperienceApi.takeOpportunity(id, sceneId),
      onSuccess: invalidate,
    }),
    contribute: useMutation({
      mutationFn: ({ slug, kind }: { slug: string; kind?: string }) =>
        peopleExperienceApi.contribute(slug, kind),
      onSuccess: invalidate,
    }),
    invite: useMutation({
      mutationFn: peopleExperienceApi.invite,
    }),
    start: useMutation({
      mutationFn: peopleExperienceApi.start,
      onSuccess: invalidate,
    }),
    ask: useMutation({
      mutationFn: peopleExperienceApi.ask,
      onSuccess: invalidate,
    }),
    provideInventory: useMutation({
      mutationFn: peopleExperienceApi.provideInventory,
      onSuccess: invalidate,
    }),
  };
}
