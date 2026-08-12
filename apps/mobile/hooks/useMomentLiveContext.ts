import { useQuery } from '@tanstack/react-query';
import { momentContextApi } from '@/lib/api';

export const useMomentLiveContext = (momentId?: string) => useQuery({
  queryKey: ['moment-live-context', momentId],
  queryFn: async () => (await momentContextApi.get(momentId!)).data,
  enabled: Boolean(momentId),
});
