import { useState, useEffect, useCallback } from 'react';
import { promoShareApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { 
  PromoShareDashboardData, 
  PromoShareCycle, 
  PromoShareUserStats,
  PromoShareEntry,
  PromoShareWinner 
} from '@/types';

export function usePromoShareDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<PromoShareDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await promoShareApi.getDashboard();
      setData(response.data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, loading, error, refetch: fetchDashboard };
}

export function usePromoShareCycles() {
  const { user } = useAuth();
  const [cycles, setCycles] = useState<PromoShareCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCycles = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await promoShareApi.getActiveCycles();
      setCycles(response.data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  return { cycles, loading, error, refetch: fetchCycles };
}

export function usePromoShareHistory(limit = 20) {
  const { user } = useAuth();
  const [history, setHistory] = useState<PromoShareWinner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await promoShareApi.getHistory(limit);
      setHistory(response.data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [user, limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, error, refetch: fetchHistory };
}

export function usePromoShareEntries(limit = 10) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<PromoShareEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEntries = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await promoShareApi.getEntries(limit);
      setEntries(response.data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [user, limit]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return { entries, loading, error, refetch: fetchEntries };
}

export function usePromoShareCycleProgress(cycleId: string | null) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<{
    cycle: PromoShareCycle;
    user_stats: PromoShareUserStats;
    progress_percent: number;
    actions_needed: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!user || !cycleId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await promoShareApi.getCycleProgress(cycleId);
      setProgress(response.data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [user, cycleId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { progress, loading, error, refetch: fetchProgress };
}

export function usePromoSharePrizes() {
  const { user } = useAuth();
  const [unclaimedPrizes, setUnclaimedPrizes] = useState<PromoShareWinner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [claiming, setClaiming] = useState<string | null>(null);

  const fetchUnclaimedPrizes = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await promoShareApi.getUnclaimedPrizes();
      setUnclaimedPrizes(response.data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const claimPrize = useCallback(async (winnerId: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      setClaiming(winnerId);
      const response = await promoShareApi.claimPrize(winnerId);

      // Remove claimed prize from list
      setUnclaimedPrizes(prev => prev.filter(p => p.id !== winnerId));

      return { success: true, data: response.data };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    } finally {
      setClaiming(null);
    }
  }, [user]);

  useEffect(() => {
    fetchUnclaimedPrizes();
  }, [fetchUnclaimedPrizes]);

  return {
    unclaimedPrizes,
    loading,
    error,
    claiming,
    claimPrize,
    refetch: fetchUnclaimedPrizes
  };
}
