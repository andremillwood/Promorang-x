import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type SocialReturnSummary = {
  scenes: number;
  moments: number;
  returns: number;
  people_brought: number;
  connections: number;
  invitations: number;
  open_doors: number;
  memories: number;
  recent_openings: Array<{ id: string; type: string; title: string; status: string; destination_url?: string | null; opened_at: string }>;
};

const emptySummary: SocialReturnSummary = { scenes: 0, moments: 0, returns: 0, people_brought: 0, connections: 0, invitations: 0, open_doors: 0, memories: 0, recent_openings: [] };

export function useSocialReturn() {
  const [summary, setSummary] = useState<SocialReturnSummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: rpcError } = await (supabase as any).rpc('get_my_social_return');
    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
      return;
    }
    setSummary({ ...emptySummary, ...(data || {}) });
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { summary, loading, error, refresh };
}
