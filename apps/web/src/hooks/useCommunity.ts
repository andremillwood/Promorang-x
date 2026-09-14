import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { API_BASE_URL } from '@/lib/api';
import type { CommunityMembership, CommunityWorkspaceData } from '@/types/community';

export class CommunityError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
async function request<T>(path: string, signal?: AbortSignal, body?: Record<string, unknown>): Promise<T> {
  const { data } = await supabase.auth.getSession();
  if (!data.session?.access_token) throw new CommunityError('Sign in to enter the community.', 401);
  const response = await fetch(`${API_BASE_URL}/community${path}`, {
    signal, method: body ? 'POST' : 'GET', cache: 'no-store',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.success) throw new CommunityError(payload.error || 'The community could not be loaded.', response.status);
  return payload.data as T;
}
export function useCommunityAccess() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['community-access', user?.id], enabled: Boolean(user), retry: false, staleTime: 0, gcTime: 0,
    refetchOnWindowFocus: 'always', refetchInterval: 30000,
    queryFn: ({ signal }) => request<{ membership: CommunityMembership | null; canBootstrap: boolean; paths: string[] }>('/access', signal),
  });
}
export function useCommunityWorkspace(enabled: boolean) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['community-workspace', user?.id], enabled: enabled && Boolean(user), retry: false, staleTime: 0, gcTime: 0,
    refetchOnWindowFocus: 'always', refetchInterval: 30000,
    queryFn: ({ signal }) => request<CommunityWorkspaceData>('/workspace', signal),
  });
}
export function useCommunityAction() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: ({ action, data }: { action: string; data: Record<string, unknown> }) => request(`/actions/${encodeURIComponent(action)}`, undefined, data),
    onSettled: async () => {
      await Promise.all(['community-access', 'community-workspace', 'experience-card', 'experience-home', 'wallet'].map(key =>
        cache.invalidateQueries({ queryKey: [key] })));
    },
  });
}
