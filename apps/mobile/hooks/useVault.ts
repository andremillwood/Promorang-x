import { useState, useEffect, useCallback } from 'react';
import { vaultApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { VaultAsset, VaultTransaction } from '@/types';
import { supabase } from '@/lib/supabase';

export interface VaultMemory {
  id: string;
  user_id: string;
  moment_id: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  title: string;
  collection_key: string | null;
  legacy_score: number;
  issued_at: string;
  expires_at: string | null;
  metadata: Record<string, any> | null;
  moments?: {
    title?: string | null;
    location?: string | null;
    image_url?: string | null;
  } | null;
}

export function useVaultAssets() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<VaultAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAssets = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await vaultApi.getAssets();
      setAssets(response.data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return { assets, loading, error, refetch: fetchAssets };
}

export function useVaultTransactions(limit = 20) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<VaultTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await vaultApi.getTransactions(limit);
      setTransactions(response.data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [user, limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, error, refetch: fetchTransactions };
}

export function useVaultSummary() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<{
    total_value_usd: number;
    asset_counts: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await vaultApi.getSummary();
      setSummary(response.data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refetch: fetchSummary };
}

export function useVaultMemories() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<VaultMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMemories = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error: queryError } = await supabase
      .from('memories')
      .select('id, user_id, moment_id, rarity, title, collection_key, legacy_score, issued_at, expires_at, metadata, moments:moment_id(title, location, image_url)')
      .eq('user_id', user.id)
      .order('issued_at', { ascending: false })
      .limit(50);

    if (queryError) {
      setError(queryError);
      setMemories([]);
    } else {
      setError(null);
      setMemories((data || []) as VaultMemory[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  return { memories, loading, error, refetch: fetchMemories };
}
