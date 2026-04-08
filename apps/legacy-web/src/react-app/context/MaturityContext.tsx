/**
 * Maturity Context
 * 
 * Provides state-aware experience layer for progressive feature reveal.
 * Controls visibility of features based on user's maturity state.
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { useAuth } from '@/react-app/hooks/useAuth';
import { apiFetch } from '@/react-app/lib/api';

// Maturity state enum - matches backend
export enum UserMaturityState {
  FIRST_TIME = 0,
  ACTIVE = 1,
  REWARDED = 2,
  POWER_USER = 3,
  OPERATOR_PRO = 4
}

// Verified action types
export const VERIFIED_ACTION_TYPES = [
  'deal_claimed',
  'event_rsvp',
  'post_submitted',
  'share_completed',
  'content_created',
  'drop_completed',
  'coupon_redeemed',
  'referral_sent',
  'profile_completed',
  'social_connected',
  'page_view'
] as const;

export type VerifiedActionType = typeof VERIFIED_ACTION_TYPES[number];

// Visibility rules interface
export interface VisibilityRules {
  deals: boolean;
  events: boolean;
  post: boolean;
  history: boolean;
  balance_minimal: boolean;
  balance_full: boolean;
  promoshare_explainer: boolean;
  promoshare_badge: boolean;
  social_shield_explainer: boolean;
  social_shield_badge: boolean;
  wallet_full: boolean;
  growth_hub: boolean;
  forecasts: boolean;
  staking: boolean;
  matrix: boolean;
  referrals: boolean;
  useEarlyTerminology: boolean;
  labels: {
    rewards: string;
    activity: string;
    deals: string;
    verified: string;
    weeklyWins: string;
  };
}

// Maturity data interface
export interface MaturityData {
  maturity_state: UserMaturityState;
  verified_actions_count: number;
  first_reward_received_at: string | null;
  last_used_surface: string | null;
  visibility: VisibilityRules;
}

// Feature access result
export interface FeatureAccess {
  allowed: boolean;
  readOnly: boolean;
  redirectTo: string | null;
}

// Context value interface
interface MaturityContextValue {
  maturityState: UserMaturityState;
  actionsCount: number;
  visibility: VisibilityRules;
  isLoading: boolean;
  isDemoUser: boolean;
  recordAction: (actionType: VerifiedActionType, metadata?: Record<string, unknown>) => Promise<void>;
  checkAccess: (feature: string) => FeatureAccess;
  getLabel: (key: keyof VisibilityRules['labels']) => string;
  refreshMaturity: () => Promise<void>;
  setMaturityStateOverride: (state: UserMaturityState) => Promise<void>;
}

// Default visibility rules for unauthenticated/first-time users
const DEFAULT_VISIBILITY: VisibilityRules = {
  deals: true,
  events: true,
  post: true,
  history: false,
  balance_minimal: false,
  balance_full: false,
  promoshare_explainer: false,
  promoshare_badge: true,
  social_shield_explainer: false,
  social_shield_badge: true,
  wallet_full: false,
  growth_hub: false,
  forecasts: false,
  staking: false,
  matrix: false,
  referrals: false,
  useEarlyTerminology: true,
  labels: {
    rewards: 'Rewards',
    activity: 'Activity',
    deals: 'Deals',
    verified: 'Verified',
    weeklyWins: 'Weekly Wins'
  }
};

const MaturityContext = createContext<MaturityContextValue | undefined>(undefined);

export function MaturityProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [maturityState, setMaturityState] = useState<UserMaturityState>(UserMaturityState.FIRST_TIME);
  const [actionsCount, setActionsCount] = useState(0);
  const [visibility, setVisibility] = useState<VisibilityRules>(DEFAULT_VISIBILITY);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is a demo user (IDs starting with a0000000-)
  const isDemoUser = useMemo(() => {
    const userId = (user as any)?.id || '';
    return userId.startsWith('a0000000-') ||
      userId.startsWith('demo-') ||
      (user as any)?.email?.endsWith('@demo.com');
  }, [user]);

  // Fetch maturity state from API
  const fetchMaturityState = useCallback(async () => {
    try {
      const result = await apiFetch('/maturity/state');
      if (result && result.success && result.data) {
        setMaturityState(result.data.maturity_state ?? UserMaturityState.FIRST_TIME);
        setActionsCount(result.data.verified_actions_count ?? 0);
        setVisibility(result.data.visibility ?? DEFAULT_VISIBILITY);
      }
    } catch (error) {
      console.error('[MaturityContext] Error fetching state:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount and when user ID changes (not user object reference)
  useEffect(() => {
    if (!authLoading) {
      fetchMaturityState();
    }
  }, [user?.id, authLoading, fetchMaturityState]);

  // Record a verified action
  const recordAction = useCallback(async (actionType: VerifiedActionType, metadata: Record<string, unknown> = {}) => {
    if (!user) return;

    try {
      const result = await apiFetch('/maturity/action', {
        method: 'POST',
        body: JSON.stringify({
          action_type: actionType,
          metadata,
          surface: 'web' // Keep surface if it's a required payload field
        })
      });

      if (result && result.success) {
        // Refresh state after recording action
        fetchMaturityState();
      }
    } catch (error) {
      console.error('[MaturityContext] Error recording action:', error);
    }
  }, [user, maturityState, actionsCount, visibility]);

  // Check feature access
  const checkAccess = useCallback((feature: string): FeatureAccess => {
    const featureRequirements: Record<string, { minState: number; readOnly?: boolean }> = {
      deals: { minState: 0 },
      events: { minState: 0 },
      post: { minState: 0 },
      history: { minState: 1 },
      balance: { minState: 2 },
      promoshare: { minState: 2, readOnly: maturityState < 2 },
      social_shield: { minState: 1, readOnly: maturityState < 2 },
      wallet: { minState: 3 },
      growth_hub: { minState: 3, readOnly: maturityState < 3 },
      forecasts: { minState: 3 },
      staking: { minState: 3 },
      matrix: { minState: 3 },
      referrals: { minState: 3 },
      operator_tools: { minState: 4 }
    };

    const requirement = featureRequirements[feature];
    if (!requirement) {
      return { allowed: true, readOnly: false, redirectTo: null };
    }

    const allowed = maturityState >= requirement.minState;
    const readOnly = requirement.readOnly ?? false;

    let redirectTo: string | null = null;
    if (!allowed) {
      redirectTo = '/deals';
    }

    return { allowed, readOnly, redirectTo };
  }, [maturityState]);

  // Get state-aware label
  const getLabel = useCallback((key: keyof VisibilityRules['labels']): string => {
    return visibility.labels[key] ?? key;
  }, [visibility]);

  // Refresh maturity data
  const refreshMaturity = useCallback(async () => {
    setIsLoading(true);
    await fetchMaturityState();
  }, [fetchMaturityState]);

  // Override maturity state (for demo users)
  const setMaturityStateOverride = useCallback(async (state: UserMaturityState) => {
    if (!user) return;

    try {
      const result = await apiFetch('/maturity/override', {
        method: 'POST',
        body: JSON.stringify({ maturity_state: state })
      });

      if (result && result.success) {
        // Immediately update local state
        setMaturityState(state);
        // Also refresh from server to get updated visibility rules
        await fetchMaturityState();
      }
    } catch (error) {
      console.error('[MaturityContext] Error overriding state:', error);
      // Still update locally for demo purposes
      setMaturityState(state);
    }
  }, [user, fetchMaturityState]);

  const value = useMemo(() => ({
    maturityState,
    actionsCount,
    visibility,
    isLoading,
    isDemoUser,
    recordAction,
    checkAccess,
    getLabel,
    refreshMaturity,
    setMaturityStateOverride
  }), [maturityState, actionsCount, visibility, isLoading, isDemoUser, recordAction, checkAccess, getLabel, refreshMaturity, setMaturityStateOverride]);

  return (
    <MaturityContext.Provider value={value}>
      {children}
    </MaturityContext.Provider>
  );
}

// Hook to use maturity context
export function useMaturity() {
  const context = useContext(MaturityContext);
  if (context === undefined) {
    throw new Error('useMaturity must be used within a MaturityProvider');
  }
  return context;
}

// Hook for checking if a feature is visible (convenience)
export function useFeatureVisible(feature: string): boolean {
  const { checkAccess } = useMaturity();
  return checkAccess(feature).allowed;
}

// Hook for getting state-aware labels
export function useStateLabel(key: keyof VisibilityRules['labels']): string {
  const { getLabel } = useMaturity();
  return getLabel(key);
}

export default MaturityContext;
