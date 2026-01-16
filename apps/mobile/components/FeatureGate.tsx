/**
 * FeatureGate Component
 * 
 * Mobile component for gating features based on user maturity state.
 * Shows interstitial when user doesn't have access.
 * 
 * IMPORTANT: For App Store compliance, this hides/disables features
 * that could be flagged (forecasts, staking, MLM visualization, yield language).
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMaturityStore, UserMaturityState } from '@/store/maturityStore';
import colors from '@/constants/colors';

interface FeatureGateProps {
  children: React.ReactNode;
  feature: string;
  minState?: UserMaturityState;
  showInterstitial?: boolean;
  fallback?: React.ReactNode;
}

interface InterstitialProps {
  visible: boolean;
  actionsNeeded: number;
  feature: string;
  onClose: () => void;
  onExplore: () => void;
}

/**
 * Interstitial modal shown when user tries to access gated feature
 */
function FeatureInterstitial({ 
  visible, 
  actionsNeeded, 
  feature, 
  onClose, 
  onExplore 
}: InterstitialProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.darkGray} />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={40} color={colors.white} />
          </View>

          <Text style={styles.title}>Almost There!</Text>
          
          <Text style={styles.message}>
            {actionsNeeded > 0 ? (
              `Complete ${actionsNeeded} more verified action${actionsNeeded > 1 ? 's' : ''} to unlock ${feature}.`
            ) : (
              `Keep participating to unlock ${feature}.`
            )}
          </Text>

          <Text style={styles.hint}>
            Try claiming a deal, RSVPing to an event, or posting content.
          </Text>

          <TouchableOpacity style={styles.primaryButton} onPress={onExplore}>
            <Text style={styles.primaryButtonText}>Explore Deals & Events</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
            <Text style={styles.secondaryButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

/**
 * FeatureGate - Wraps content and controls visibility based on maturity state
 */
export function FeatureGate({ 
  children, 
  feature,
  minState = UserMaturityState.FIRST_TIME,
  showInterstitial = false,
  fallback
}: FeatureGateProps) {
  const router = useRouter();
  const { maturityState, actionsCount, checkAccess } = useMaturityStore();
  const [showModal, setShowModal] = React.useState(false);

  const access = checkAccess(feature);
  const hasAccess = maturityState >= minState && access.allowed;

  // Calculate actions needed
  let actionsNeeded = 0;
  if (minState >= UserMaturityState.ACTIVE && maturityState < UserMaturityState.ACTIVE) {
    actionsNeeded = Math.max(0, 3 - actionsCount);
  }

  const handleExplore = () => {
    setShowModal(false);
    router.push('/(tabs)');
  };

  // If user has access, render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // If showing interstitial, render trigger with modal
  if (showInterstitial) {
    return (
      <>
        <TouchableOpacity onPress={() => setShowModal(true)}>
          {fallback || (
            <View style={styles.lockedContainer}>
              <Ionicons name="lock-closed" size={20} color={colors.darkGray} />
              <Text style={styles.lockedText}>Tap to unlock</Text>
            </View>
          )}
        </TouchableOpacity>
        <FeatureInterstitial
          visible={showModal}
          actionsNeeded={actionsNeeded}
          feature={feature}
          onClose={() => setShowModal(false)}
          onExplore={handleExplore}
        />
      </>
    );
  }

  // Otherwise render fallback or nothing
  return fallback ? <>{fallback}</> : null;
}

/**
 * useFeatureAccess hook - Check if user can access a feature
 */
export function useFeatureAccess(feature: string) {
  const { checkAccess, maturityState, actionsCount } = useMaturityStore();
  const access = checkAccess(feature);
  
  return {
    ...access,
    maturityState,
    actionsCount,
    actionsNeeded: maturityState < UserMaturityState.ACTIVE 
      ? Math.max(0, 3 - actionsCount) 
      : 0
  };
}

/**
 * Feature-specific gate presets
 */
export const FeatureGates = {
  History: ({ children }: { children: React.ReactNode }) => (
    <FeatureGate feature="Activity History" minState={UserMaturityState.ACTIVE}>
      {children}
    </FeatureGate>
  ),

  Balance: ({ children }: { children: React.ReactNode }) => (
    <FeatureGate feature="Balance" minState={UserMaturityState.REWARDED}>
      {children}
    </FeatureGate>
  ),

  Wallet: ({ children, showInterstitial = true }: { children: React.ReactNode; showInterstitial?: boolean }) => (
    <FeatureGate feature="Wallet" minState={UserMaturityState.POWER_USER} showInterstitial={showInterstitial}>
      {children}
    </FeatureGate>
  ),

  GrowthHub: ({ children, showInterstitial = true }: { children: React.ReactNode; showInterstitial?: boolean }) => (
    <FeatureGate feature="Growth Hub" minState={UserMaturityState.POWER_USER} showInterstitial={showInterstitial}>
      {children}
    </FeatureGate>
  ),

  // App Store sensitive features - always gated at POWER_USER
  Forecasts: ({ children, showInterstitial = true }: { children: React.ReactNode; showInterstitial?: boolean }) => (
    <FeatureGate feature="Forecasts" minState={UserMaturityState.POWER_USER} showInterstitial={showInterstitial}>
      {children}
    </FeatureGate>
  ),

  Staking: ({ children, showInterstitial = true }: { children: React.ReactNode; showInterstitial?: boolean }) => (
    <FeatureGate feature="Staking" minState={UserMaturityState.POWER_USER} showInterstitial={showInterstitial}>
      {children}
    </FeatureGate>
  ),

  Matrix: ({ children, showInterstitial = true }: { children: React.ReactNode; showInterstitial?: boolean }) => (
    <FeatureGate feature="Growth Partner Program" minState={UserMaturityState.POWER_USER} showInterstitial={showInterstitial}>
      {children}
    </FeatureGate>
  ),

  Referrals: ({ children, showInterstitial = true }: { children: React.ReactNode; showInterstitial?: boolean }) => (
    <FeatureGate feature="Referrals" minState={UserMaturityState.POWER_USER} showInterstitial={showInterstitial}>
      {children}
    </FeatureGate>
  )
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center'
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 12,
    textAlign: 'center'
  },
  message: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24
  },
  hint: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 24
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24
  },
  secondaryButtonText: {
    color: colors.darkGray,
    fontSize: 14,
    fontWeight: '500'
  },
  lockedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    gap: 8
  },
  lockedText: {
    color: colors.darkGray,
    fontSize: 14,
    fontWeight: '500'
  }
});

export default FeatureGate;
