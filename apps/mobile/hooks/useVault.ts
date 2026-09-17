import { useState, useEffect, useCallback } from 'react';
import { vaultApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { VaultTransaction } from '@/types';
import { supabase } from '@/lib/supabase';

export type CanonicalVaultAssetType = 'memory' | 'token' | 'coupon' | 'ticket' | 'key';

export interface CanonicalVaultAsset {
  id: string;
  user_id: string;
  canonical_type: CanonicalVaultAssetType;
  asset_name: string;
  asset_symbol: string;
  balance: number;
  metadata: Record<string, any>;
  acquired_at: string;
  expires_at: string | null;
  legacy_score?: number;
  financial_value_recorded?: boolean;
  value_note?: string;
}

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

export interface VaultSummary {
  total_value_usd: number;
  total_legacy_score: number;
  value_source?: string;
  value_note?: string;
  asset_counts: Record<string, number>;
}

function canonicalizeAsset(asset: any): CanonicalVaultAsset {
  const canonicalType: CanonicalVaultAssetType = asset?.canonical_type === 'memory'
    ? 'memory'
    : asset?.asset_type === 'nft'
      ? 'memory'
      : (asset?.asset_type || 'token');

  return {
    id: asset.id,
    user_id: asset.user_id,
    canonical_type: canonicalType,
    asset_name: asset.asset_name || asset.name || (canonicalType === 'memory' ? 'Memory' : 'Retained object'),
    asset_symbol: canonicalType === 'memory' ? 'MEMORY' : (asset.asset_symbol || canonicalType.toUpperCase()),
    balance: canonicalType === 'memory' ? 1 : Number(asset.balance || 0),
    metadata: {
      ...(asset.metadata || {}),
      canonical_type: canonicalType,
    },
    acquired_at: asset.acquired_at || asset.created_at || '',
    expires_at: asset.expires_at || null,
    legacy_score: Number(asset.legacy_score || asset.metadata?.legacy_score || 0),
    financial_value_recorded: Boolean(asset.financial_value_recorded),
    value_note: asset.value_note,
  };
}

export function useVaultAssets() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<CanonicalVaultAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAssets = useCallback(async () => {
    if (!user) {
      setAssets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await vaultApi.getAssets();
      setAssets((response.data || []).map(canonicalizeAsset));
      setError(null);
    } catch (e) {
      setAssets([]);
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void fetchAssets();
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
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await vaultApi.getTransactions(limit);
      setTransactions(response.data || []);
      setError(null);
    } catch (e) {
      setTransactions([]);
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [user, limit]);

  useEffect(() => {
    void fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, error, refetch: fetchTransactions };
}

export function useVaultSummary() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<VaultSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!user) {
      setSummary(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await vaultApi.getSummary();
      const raw = response.data as any;
      const memoryCount = Number(raw?.asset_counts?.memory || raw?.asset_counts?.nft || raw?.total_memories || 0);
      setSummary({
        total_value_usd: Number(raw?.total_value_usd || 0),
        total_legacy_score: Number(raw?.total_legacy_score || 0),
        value_source: raw?.value_source,
        value_note: raw?.value_note,
        asset_counts: {
          ...(raw?.asset_counts || {}),
          memory: memoryCount,
        },
      });
      setError(null);
    } catch (e) {
      setSummary(null);
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void fetchSummary();
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
      setMemories([]);
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
    void fetchMemories();
  }, [fetchMemories]);

  return { memories, loading, error, refetch: fetchMemories };
}
