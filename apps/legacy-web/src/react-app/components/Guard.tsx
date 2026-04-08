/**
 * Guard Component
 * 
 * Route guard that controls visibility based on user maturity state.
 * Redirects users to appropriate entry surfaces if they don't meet requirements.
 * 
 * Usage:
 * <Guard minState={UserMaturityState.ACTIVE} redirectTo="/deals">
 *   <ProtectedContent />
 * </Guard>
 */

import React, { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useMaturity, UserMaturityState } from '@/react-app/context/MaturityContext';
import { useAuth } from '@/react-app/hooks/useAuth';

interface GuardProps {
  children: ReactNode;
  minState?: UserMaturityState;
  roles?: string[];
  redirectTo?: string;
  showInterstitial?: boolean;
  feature?: string;
}

/**
 * Interstitial component shown when user doesn't have access
 */
function AccessInterstitial({ 
  actionsNeeded, 
  feature,
  onContinue 
}: { 
  actionsNeeded: number;
  feature?: string;
  onContinue: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-pr-surface-1 rounded-2xl p-8 text-center shadow-lg">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h2 className="text-xl font-bold text-pr-text-1 mb-2">
          Almost There!
        </h2>
        
        <p className="text-pr-text-2 mb-6">
          {actionsNeeded > 0 ? (
            <>Complete <span className="font-semibold text-pr-text-1">{actionsNeeded} more verified action{actionsNeeded > 1 ? 's' : ''}</span> to unlock {feature || 'this feature'}.</>
          ) : (
            <>Keep participating to unlock {feature || 'this feature'}.</>
          )}
        </p>

        <div className="space-y-3">
          <p className="text-sm text-pr-text-2">
            Try claiming a deal, RSVPing to an event, or posting content.
          </p>
          
          <button
            onClick={onContinue}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            Explore Deals & Events
          </button>
        </div>
      </div>
    </div>
  );
}

export function Guard({ 
  children, 
  minState = UserMaturityState.FIRST_TIME,
  roles = [],
  redirectTo = '/deals',
  showInterstitial = false,
  feature
}: GuardProps) {
  const { maturityState, actionsCount, isLoading } = useMaturity();
  const { user, isLoading: authLoading } = useAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading || authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check role-based access if roles specified
  if (roles.length > 0 && user) {
    const userType = (user as any).user_type || (user as any).user_metadata?.user_type;
    if (!roles.includes(userType)) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }
  }

  // Check maturity state
  if (maturityState < minState) {
    // Calculate actions needed to reach next state
    let actionsNeeded = 0;
    if (minState >= UserMaturityState.ACTIVE && maturityState < UserMaturityState.ACTIVE) {
      actionsNeeded = Math.max(0, 3 - actionsCount);
    }

    // Show interstitial if enabled
    if (showInterstitial) {
      return (
        <AccessInterstitial 
          actionsNeeded={actionsNeeded}
          feature={feature}
          onContinue={() => window.location.href = redirectTo}
        />
      );
    }

    // Otherwise redirect
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

/**
 * Higher-order component version of Guard
 */
export function withGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardProps: Omit<GuardProps, 'children'>
) {
  return function GuardedComponent(props: P) {
    return (
      <Guard {...guardProps}>
        <Component {...props} />
      </Guard>
    );
  };
}

/**
 * Feature-specific guard presets
 */
export const FeatureGuards = {
  History: (props: { children: ReactNode }) => (
    <Guard minState={UserMaturityState.ACTIVE} feature="Activity History" {...props} />
  ),
  
  Balance: (props: { children: ReactNode }) => (
    <Guard minState={UserMaturityState.REWARDED} feature="Balance" {...props} />
  ),
  
  Wallet: (props: { children: ReactNode }) => (
    <Guard minState={UserMaturityState.POWER_USER} feature="Wallet" showInterstitial {...props} />
  ),
  
  GrowthHub: (props: { children: ReactNode }) => (
    <Guard minState={UserMaturityState.POWER_USER} feature="Growth Hub" showInterstitial {...props} />
  ),
  
  Forecasts: (props: { children: ReactNode }) => (
    <Guard minState={UserMaturityState.POWER_USER} feature="Forecasts" showInterstitial {...props} />
  ),
  
  Matrix: (props: { children: ReactNode }) => (
    <Guard minState={UserMaturityState.POWER_USER} feature="Growth Partner Program" showInterstitial {...props} />
  ),
  
  OperatorTools: (props: { children: ReactNode }) => (
    <Guard minState={UserMaturityState.OPERATOR_PRO} roles={['operator', 'admin']} feature="Operator Tools" {...props} />
  )
};

export default Guard;
