import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { participationApi } from '@/lib/api';
import { resolveMomentJourney } from '@promorang/shared';

export function useMomentParticipation(momentId?: string) {
  const queryClient = useQueryClient();
  const status = useQuery({
    queryKey: ['moment-participation', momentId],
    queryFn: () => participationApi.status(momentId!),
    enabled: Boolean(momentId),
  });
  const journey = useQuery({
    queryKey: ['moment-journey', momentId],
    queryFn: () => participationApi.journey(momentId!),
    enabled: Boolean(momentId),
  });

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['moment-participation', momentId] }),
      queryClient.invalidateQueries({ queryKey: ['moment-live-context', momentId] }),
      queryClient.invalidateQueries({ queryKey: ['moment-journey', momentId] }),
      queryClient.invalidateQueries({ queryKey: ['moments'] }),
    ]);
  };

  const join = useMutation({ mutationFn: () => participationApi.join(momentId!), onSuccess: refresh });
  const leave = useMutation({ mutationFn: () => participationApi.leave(momentId!), onSuccess: refresh });

  return {
    joined: Boolean(status.data?.joined),
    checkedIn: Boolean(status.data?.checked_in),
    journey: journey.data?.facts ? resolveMomentJourney(journey.data.facts) : null,
    loading: status.isLoading || journey.isLoading,
    changing: join.isPending || leave.isPending,
    error: status.error || journey.error || join.error || leave.error,
    join: join.mutateAsync,
    leave: leave.mutateAsync,
  };
}
