import { useState, useEffect, useCallback } from 'react';
import { sponsorApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { SponsorPool, SponsorTier, SponsorAnalytics } from '@/types';

export function useSponsorConfig() {
  const [config, setConfig] = useState<{
    tiers: SponsorTier[];
    features: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const response = await sponsorApi.getConfig();
      setConfig(response.data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return { config, loading, error, refetch: fetchConfig };
}

export function useSponsorPools() {
  const { user } = useAuth();
  const [pools, setPools] = useState<SponsorPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPools = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await sponsorApi.getPools();
      setPools(response.data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  return { pools, loading, error, refetch: fetchPools };
}

export function useSponsorAnalytics(poolId: string | null) {
  const [analytics, setAnalytics] = useState<SponsorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!poolId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await sponsorApi.getAnalytics(poolId);
      setAnalytics(response.data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [poolId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { analytics, loading, error, refetch: fetchAnalytics };
}

export function useSponsorCostCalculator() {
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<{
    breakdown: {
      base_pool: number;
      platform_fee: number;
      total_cost: number;
      winner_count: number;
      min_win_value: number;
    };
    premium_placements: {
      homepage_banner: number;
      push_notification: number;
      sponsored_badge: number;
    };
  } | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const calculate = useCallback(async (params: {
    tier: string;
    amount: number;
    homepage_banner?: boolean;
    push_notification?: boolean;
    sponsored_badge?: boolean;
  }) => {
    try {
      setCalculating(true);
      setError(null);
      const response = await sponsorApi.calculateCost(params);
      setResult(response.data);
      return response.data;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setCalculating(false);
    }
  }, []);

  return { calculate, calculating, result, error };
}

export function useCreateSponsorPool() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createPool = useCallback(async (poolData: {
    name: string;
    tier: string;
    pool_amount: number;
    brand_message?: string;
    premium_placements?: {
      homepage_banner?: boolean;
      push_notification?: boolean;
      sponsored_badge?: boolean;
    };
  }) => {
    try {
      setCreating(true);
      setError(null);
      const response = await sponsorApi.createPool(poolData);
      return response.data;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setCreating(false);
    }
  }, []);

  return { createPool, creating, error };
}

export function useSponsorCheckout() {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createCheckout = useCallback(async (poolId: string) => {
    try {
      setProcessing(true);
      setError(null);
      const response = await sponsorApi.createCheckout(poolId);
      return response.data;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setProcessing(false);
    }
  }, []);

  const checkPaymentStatus = useCallback(async (poolId: string) => {
    try {
      const response = await sponsorApi.getPaymentStatus(poolId);
      return response.data;
    } catch (e) {
      setError(e as Error);
      throw e;
    }
  }, []);

  return { createCheckout, checkPaymentStatus, processing, error };
}
