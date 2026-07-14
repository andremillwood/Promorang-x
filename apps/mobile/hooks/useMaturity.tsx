import { useState, useEffect, useCallback, createContext, useContext, createElement } from 'react';
import { maturityApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { MaturityStateData, VisibilityRules, MaturityState } from '@/types';

// Context for global maturity state
interface MaturityContextType {
  state: MaturityState;
  stateName: string;
  visibility: VisibilityRules | null;
  loading: boolean;
  error: Error | null;
  recordAction: (actionType: string, metadata?: Record<string, any>) => Promise<void>;
  markRewardReceived: () => Promise<void>;
  checkFeatureAccess: (feature: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

const MaturityContext = createContext<MaturityContextType | undefined>(undefined);

export function MaturityProvider({ children }: { children: React.JSX.Element }) {
  const { user } = useAuth();
  const [data, setData] = useState<(MaturityStateData & { visibility: VisibilityRules }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchState = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await maturityApi.getState();
      setData(response.data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const recordAction = useCallback(async (actionType: string, metadata?: Record<string, any>) => {
    try {
      await maturityApi.recordAction(actionType, metadata);
      // Refetch to get updated state
      await fetchState();
    } catch (e) {
      console.error('Failed to record action:', e);
      throw e;
    }
  }, [fetchState]);

  const markRewardReceived = useCallback(async () => {
    try {
      await maturityApi.markRewardReceived();
      await fetchState();
    } catch (e) {
      console.error('Failed to mark reward received:', e);
      throw e;
    }
  }, [fetchState]);

  const checkFeatureAccess = useCallback(async (feature: string) => {
    try {
      const response = await maturityApi.checkFeatureAccess(feature);
      return response.data.accessible;
    } catch (e) {
      console.error('Failed to check feature access:', e);
      return false;
    }
  }, []);

  const stateNames: Record<MaturityState, string> = {
    0: 'FIRST_TIME',
    1: 'ACTIVE',
    2: 'REWARDED',
    3: 'POWER_USER',
    4: 'OPERATOR_PRO',
  };

  const value: MaturityContextType = {
    state: (data?.state ?? 0) as MaturityState,
    stateName: data ? stateNames[data.state as MaturityState] : 'FIRST_TIME',
    visibility: data?.visibility ?? null,
    loading,
    error,
    recordAction,
    markRewardReceived,
    checkFeatureAccess,
    refetch: fetchState,
  };

  return createElement(MaturityContext.Provider as any, { value }, children) as React.JSX.Element;
}

export function useMaturity() {
  const context = useContext(MaturityContext);
  if (context === undefined) {
    throw new Error('useMaturity must be used within a MaturityProvider');
  }
  return context;
}

// Hook for checking if a feature is visible
export function useFeatureVisible(feature: string) {
  const { visibility, loading } = useMaturity();
  
  if (loading || !visibility) {
    return { visible: false, loading: true };
  }

  const visibilityMap: Record<string, keyof VisibilityRules> = {
    'balance': 'show_balance',
    'promoshare_badge': 'show_promoshare_badge',
    'social_shield_badge': 'show_social_shield_badge',
    'growth_hub': 'show_growth_hub',
    'forecasts': 'show_forecasts',
    'matrix': 'show_matrix',
    'history': 'show_history',
  };

  const key = visibilityMap[feature];
  if (!key) {
    return { visible: true, loading: false }; // Unknown features default to visible
  }

  return { visible: visibility[key] ?? false, loading: false };
}

// Hook for getting copy tier
export function useCopyTier() {
  const { visibility, loading } = useMaturity();
  return { 
    tier: visibility?.copy_tier ?? 'early', 
    loading 
  };
}

// Simplified hook that just returns the state number
export function useMaturityState() {
  const { state, loading } = useMaturity();
  return { state, loading };
}
