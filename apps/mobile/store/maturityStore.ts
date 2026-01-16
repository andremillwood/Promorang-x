/**
 * Maturity Store for Mobile
 * 
 * Manages user maturity state for progressive feature reveal.
 * States: 0=FIRST_TIME, 1=ACTIVE, 2=REWARDED, 3=POWER_USER, 4=OPERATOR_PRO
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Maturity state enum
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
  'social_connected'
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

// Default visibility rules
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

interface MaturityState {
  maturityState: UserMaturityState;
  actionsCount: number;
  visibility: VisibilityRules;
  isLoading: boolean;
  lastFetched: number | null;
  
  // Actions
  setMaturityState: (state: UserMaturityState) => void;
  setActionsCount: (count: number) => void;
  setVisibility: (visibility: VisibilityRules) => void;
  setLoading: (loading: boolean) => void;
  fetchMaturityState: (token?: string) => Promise<void>;
  recordAction: (actionType: VerifiedActionType, metadata?: Record<string, unknown>, token?: string) => Promise<void>;
  checkAccess: (feature: string) => { allowed: boolean; readOnly: boolean; redirectTo: string | null };
  getLabel: (key: keyof VisibilityRules['labels']) => string;
  reset: () => void;
}

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://api.promorang.co';

// Helper to calculate visibility from state
function calculateVisibility(state: UserMaturityState): VisibilityRules {
  return {
    deals: state >= UserMaturityState.FIRST_TIME,
    events: state >= UserMaturityState.FIRST_TIME,
    post: state >= UserMaturityState.FIRST_TIME,
    history: state >= UserMaturityState.ACTIVE,
    balance_minimal: state >= UserMaturityState.REWARDED,
    balance_full: state >= UserMaturityState.POWER_USER,
    promoshare_explainer: state >= UserMaturityState.REWARDED,
    promoshare_badge: true,
    social_shield_explainer: state >= UserMaturityState.ACTIVE,
    social_shield_badge: true,
    wallet_full: state >= UserMaturityState.POWER_USER,
    growth_hub: state >= UserMaturityState.POWER_USER,
    forecasts: state >= UserMaturityState.POWER_USER,
    staking: state >= UserMaturityState.POWER_USER,
    matrix: state >= UserMaturityState.POWER_USER,
    referrals: state >= UserMaturityState.POWER_USER,
    useEarlyTerminology: state < UserMaturityState.POWER_USER,
    labels: {
      rewards: state < UserMaturityState.POWER_USER ? 'Rewards' : 'Balance',
      activity: state < UserMaturityState.POWER_USER ? 'Activity' : 'Earnings',
      deals: state < UserMaturityState.POWER_USER ? 'Deals' : 'Drops',
      verified: state < UserMaturityState.POWER_USER ? 'Verified' : 'Social Shield',
      weeklyWins: state < UserMaturityState.POWER_USER ? 'Weekly Wins' : 'PromoShare'
    }
  };
}

export const useMaturityStore = create<MaturityState>()(
  persist(
    (set, get) => ({
      maturityState: UserMaturityState.FIRST_TIME,
      actionsCount: 0,
      visibility: DEFAULT_VISIBILITY,
      isLoading: false,
      lastFetched: null,

      setMaturityState: (state) => {
        set({ 
          maturityState: state,
          visibility: calculateVisibility(state)
        });
      },

      setActionsCount: (count) => set({ actionsCount: count }),

      setVisibility: (visibility) => set({ visibility }),

      setLoading: (loading) => set({ isLoading: loading }),

      fetchMaturityState: async (token) => {
        set({ isLoading: true });
        try {
          const headers: HeadersInit = {
            'Content-Type': 'application/json'
          };
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const response = await fetch(`${API_BASE}/api/maturity/state`, { headers });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              const newState = result.data.maturity_state ?? UserMaturityState.FIRST_TIME;
              set({
                maturityState: newState,
                actionsCount: result.data.verified_actions_count ?? 0,
                visibility: result.data.visibility ?? calculateVisibility(newState),
                lastFetched: Date.now()
              });
            }
          }
        } catch (error) {
          console.error('[MaturityStore] Error fetching state:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      recordAction: async (actionType, metadata = {}, token) => {
        if (!token) return;

        try {
          const response = await fetch(`${API_BASE}/api/maturity/action`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              action_type: actionType,
              metadata,
              surface: 'mobile'
            })
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data?.maturity) {
              const newState = result.data.maturity.maturity_state ?? get().maturityState;
              set({
                maturityState: newState,
                actionsCount: result.data.maturity.verified_actions_count ?? get().actionsCount,
                visibility: result.data.maturity.visibility ?? calculateVisibility(newState)
              });
            }
          }
        } catch (error) {
          console.error('[MaturityStore] Error recording action:', error);
        }
      },

      checkAccess: (feature) => {
        const state = get().maturityState;
        
        const featureRequirements: Record<string, { minState: number; readOnly?: boolean }> = {
          deals: { minState: 0 },
          events: { minState: 0 },
          post: { minState: 0 },
          history: { minState: 1 },
          balance: { minState: 2 },
          promoshare: { minState: 2, readOnly: state < 2 },
          social_shield: { minState: 1, readOnly: state < 2 },
          wallet: { minState: 3 },
          growth_hub: { minState: 3, readOnly: state < 3 },
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

        const allowed = state >= requirement.minState;
        const readOnly = requirement.readOnly ?? false;
        
        let redirectTo: string | null = null;
        if (!allowed) {
          redirectTo = '/(tabs)';
        }

        return { allowed, readOnly, redirectTo };
      },

      getLabel: (key) => {
        return get().visibility.labels[key] ?? key;
      },

      reset: () => {
        set({
          maturityState: UserMaturityState.FIRST_TIME,
          actionsCount: 0,
          visibility: DEFAULT_VISIBILITY,
          isLoading: false,
          lastFetched: null
        });
      }
    }),
    {
      name: 'maturity-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        maturityState: state.maturityState,
        actionsCount: state.actionsCount,
        visibility: state.visibility,
        lastFetched: state.lastFetched
      })
    }
  )
);
