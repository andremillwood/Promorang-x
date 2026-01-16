/**
 * VisibilityWrapper Component
 * 
 * Conditionally renders content based on user maturity state.
 * Supports hidden, read-only, and full access modes.
 */

import { type ReactNode } from 'react';
import { useMaturity, UserMaturityState } from '@/react-app/context/MaturityContext';

type VisibilityMode = 'hidden' | 'readonly' | 'full';

interface VisibilityWrapperProps {
  children: ReactNode;
  feature: string;
  fallback?: ReactNode;
  readOnlyFallback?: ReactNode;
}

/**
 * Feature visibility configuration
 * Maps features to their visibility at each maturity state
 */
const FEATURE_VISIBILITY: Record<string, Record<UserMaturityState, VisibilityMode>> = {
  // Entry features - always visible
  deals: {
    [UserMaturityState.FIRST_TIME]: 'full',
    [UserMaturityState.ACTIVE]: 'full',
    [UserMaturityState.REWARDED]: 'full',
    [UserMaturityState.POWER_USER]: 'full',
    [UserMaturityState.OPERATOR_PRO]: 'full'
  },
  events: {
    [UserMaturityState.FIRST_TIME]: 'full',
    [UserMaturityState.ACTIVE]: 'full',
    [UserMaturityState.REWARDED]: 'full',
    [UserMaturityState.POWER_USER]: 'full',
    [UserMaturityState.OPERATOR_PRO]: 'full'
  },
  post: {
    [UserMaturityState.FIRST_TIME]: 'full',
    [UserMaturityState.ACTIVE]: 'full',
    [UserMaturityState.REWARDED]: 'full',
    [UserMaturityState.POWER_USER]: 'full',
    [UserMaturityState.OPERATOR_PRO]: 'full'
  },
  
  // History - visible after first actions
  history: {
    [UserMaturityState.FIRST_TIME]: 'hidden',
    [UserMaturityState.ACTIVE]: 'full',
    [UserMaturityState.REWARDED]: 'full',
    [UserMaturityState.POWER_USER]: 'full',
    [UserMaturityState.OPERATOR_PRO]: 'full'
  },
  
  // Balance - minimal at rewarded, full at power user
  balance: {
    [UserMaturityState.FIRST_TIME]: 'hidden',
    [UserMaturityState.ACTIVE]: 'hidden',
    [UserMaturityState.REWARDED]: 'readonly',
    [UserMaturityState.POWER_USER]: 'full',
    [UserMaturityState.OPERATOR_PRO]: 'full'
  },
  
  // PromoShare badge - always visible, explainer at rewarded+
  promoshare_badge: {
    [UserMaturityState.FIRST_TIME]: 'readonly',
    [UserMaturityState.ACTIVE]: 'readonly',
    [UserMaturityState.REWARDED]: 'full',
    [UserMaturityState.POWER_USER]: 'full',
    [UserMaturityState.OPERATOR_PRO]: 'full'
  },
  
  // Social Shield badge - always visible, explainer at active+
  social_shield_badge: {
    [UserMaturityState.FIRST_TIME]: 'readonly',
    [UserMaturityState.ACTIVE]: 'full',
    [UserMaturityState.REWARDED]: 'full',
    [UserMaturityState.POWER_USER]: 'full',
    [UserMaturityState.OPERATOR_PRO]: 'full'
  },
  
  // Wallet - full at power user only
  wallet: {
    [UserMaturityState.FIRST_TIME]: 'hidden',
    [UserMaturityState.ACTIVE]: 'hidden',
    [UserMaturityState.REWARDED]: 'hidden',
    [UserMaturityState.POWER_USER]: 'full',
    [UserMaturityState.OPERATOR_PRO]: 'full'
  },
  
  // Growth Hub - readonly preview at rewarded, full at power user
  growth_hub: {
    [UserMaturityState.FIRST_TIME]: 'hidden',
    [UserMaturityState.ACTIVE]: 'hidden',
    [UserMaturityState.REWARDED]: 'readonly',
    [UserMaturityState.POWER_USER]: 'full',
    [UserMaturityState.OPERATOR_PRO]: 'full'
  },
  
  // Forecasts - power user only (web-first)
  forecasts: {
    [UserMaturityState.FIRST_TIME]: 'hidden',
    [UserMaturityState.ACTIVE]: 'hidden',
    [UserMaturityState.REWARDED]: 'hidden',
    [UserMaturityState.POWER_USER]: 'full',
    [UserMaturityState.OPERATOR_PRO]: 'full'
  },
  
  // Staking - power user only
  staking: {
    [UserMaturityState.FIRST_TIME]: 'hidden',
    [UserMaturityState.ACTIVE]: 'hidden',
    [UserMaturityState.REWARDED]: 'hidden',
    [UserMaturityState.POWER_USER]: 'full',
    [UserMaturityState.OPERATOR_PRO]: 'full'
  },
  
  // Matrix/Referrals - power user only
  matrix: {
    [UserMaturityState.FIRST_TIME]: 'hidden',
    [UserMaturityState.ACTIVE]: 'hidden',
    [UserMaturityState.REWARDED]: 'hidden',
    [UserMaturityState.POWER_USER]: 'full',
    [UserMaturityState.OPERATOR_PRO]: 'full'
  },
  referrals: {
    [UserMaturityState.FIRST_TIME]: 'hidden',
    [UserMaturityState.ACTIVE]: 'hidden',
    [UserMaturityState.REWARDED]: 'hidden',
    [UserMaturityState.POWER_USER]: 'full',
    [UserMaturityState.OPERATOR_PRO]: 'full'
  },
  
  // Operator tools - operator pro only
  operator_tools: {
    [UserMaturityState.FIRST_TIME]: 'hidden',
    [UserMaturityState.ACTIVE]: 'hidden',
    [UserMaturityState.REWARDED]: 'hidden',
    [UserMaturityState.POWER_USER]: 'hidden',
    [UserMaturityState.OPERATOR_PRO]: 'full'
  }
};

/**
 * Get visibility mode for a feature at a given maturity state
 */
export function getFeatureVisibility(feature: string, state: UserMaturityState): VisibilityMode {
  const config = FEATURE_VISIBILITY[feature];
  if (!config) return 'full'; // Default to full if not configured
  return config[state] ?? 'hidden';
}

/**
 * VisibilityWrapper - Conditionally renders based on maturity state
 */
export function VisibilityWrapper({ 
  children, 
  feature,
  fallback = null,
  readOnlyFallback
}: VisibilityWrapperProps) {
  const { maturityState } = useMaturity();
  const visibility = getFeatureVisibility(feature, maturityState);

  switch (visibility) {
    case 'hidden':
      return <>{fallback}</>;
    case 'readonly':
      return <>{readOnlyFallback ?? children}</>;
    case 'full':
    default:
      return <>{children}</>;
  }
}

/**
 * Hook to check feature visibility
 */
export function useFeatureVisibility(feature: string): {
  mode: VisibilityMode;
  isHidden: boolean;
  isReadOnly: boolean;
  isFull: boolean;
} {
  const { maturityState } = useMaturity();
  const mode = getFeatureVisibility(feature, maturityState);
  
  return {
    mode,
    isHidden: mode === 'hidden',
    isReadOnly: mode === 'readonly',
    isFull: mode === 'full'
  };
}

/**
 * Prebuilt visibility wrappers for common features
 */
export const Visibility = {
  History: ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
    <VisibilityWrapper feature="history" fallback={fallback}>{children}</VisibilityWrapper>
  ),
  
  Balance: ({ children, fallback, readOnlyFallback }: { children: ReactNode; fallback?: ReactNode; readOnlyFallback?: ReactNode }) => (
    <VisibilityWrapper feature="balance" fallback={fallback} readOnlyFallback={readOnlyFallback}>{children}</VisibilityWrapper>
  ),
  
  Wallet: ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
    <VisibilityWrapper feature="wallet" fallback={fallback}>{children}</VisibilityWrapper>
  ),
  
  GrowthHub: ({ children, fallback, readOnlyFallback }: { children: ReactNode; fallback?: ReactNode; readOnlyFallback?: ReactNode }) => (
    <VisibilityWrapper feature="growth_hub" fallback={fallback} readOnlyFallback={readOnlyFallback}>{children}</VisibilityWrapper>
  ),
  
  Forecasts: ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
    <VisibilityWrapper feature="forecasts" fallback={fallback}>{children}</VisibilityWrapper>
  ),
  
  Matrix: ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
    <VisibilityWrapper feature="matrix" fallback={fallback}>{children}</VisibilityWrapper>
  ),
  
  Referrals: ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
    <VisibilityWrapper feature="referrals" fallback={fallback}>{children}</VisibilityWrapper>
  ),
  
  OperatorTools: ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
    <VisibilityWrapper feature="operator_tools" fallback={fallback}>{children}</VisibilityWrapper>
  )
};

export default VisibilityWrapper;
