import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MasterKeyPulseState {
  isActive: boolean;
  streakDays: number;
  hoursRemaining: number;
  proofDropsCompleted: number;
  proofDropsRequired: number;
  multiplier: number;
  tierName: string;
  lastActivatedAt: string | null;
  expiresAt: string | null;
}

export function useMasterKey(userTier: string = 'starter') {
  const [loading, setLoading] = useState(true);
  const [pulseState, setPulseState] = useState<MasterKeyPulseState>({
    isActive: false,
    streakDays: 3,
    hoursRemaining: 18,
    proofDropsCompleted: 1,
    proofDropsRequired: 5,
    multiplier: 1.0,
    tierName: 'Starter',
    lastActivatedAt: null,
    expiresAt: null
  });

  const getTierRequirements = useCallback((tier: string) => {
    const normalized = (tier || 'starter').toLowerCase();
    switch (normalized) {
      case 'power_user':
      case 'super':
        return { name: 'Power User', required: 1, multiplier: 2.0 };
      case 'professional':
      case 'premium':
        return { name: 'Professional', required: 2, multiplier: 1.5 };
      case 'starter':
      case 'free':
      default:
        return { name: 'Starter', required: 5, multiplier: 1.0 };
    }
  }, []);

  const fetchMasterKeyPulse = useCallback(async () => {
    setLoading(true);
    try {
      const tierConfig = getTierRequirements(userTier);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Query user tier tracking / activities in last 24h
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: activities } = await supabase
          .from('activities')
          .select('id, created_at')
          .eq('user_id', user.id)
          .gte('created_at', yesterday);

        const count = activities ? activities.length : 1;
        const isActive = count >= tierConfig.required;

        setPulseState({
          isActive,
          streakDays: 4,
          hoursRemaining: 16,
          proofDropsCompleted: count,
          proofDropsRequired: tierConfig.required,
          multiplier: isActive ? tierConfig.multiplier : 1.0,
          tierName: tierConfig.name,
          lastActivatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString()
        });
      } else {
        // Guest or simulated preview state
        const tierConfig = getTierRequirements(userTier);
        setPulseState({
          isActive: true,
          streakDays: 3,
          hoursRemaining: 14,
          proofDropsCompleted: tierConfig.required,
          proofDropsRequired: tierConfig.required,
          multiplier: tierConfig.multiplier,
          tierName: tierConfig.name,
          lastActivatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString()
        });
      }
    } catch (err) {
      console.warn('Master key pulse fetch fallback:', err);
    } finally {
      setLoading(false);
    }
  }, [userTier, getTierRequirements]);

  useEffect(() => {
    fetchMasterKeyPulse();
  }, [fetchMasterKeyPulse]);

  return {
    loading,
    pulseState,
    refreshPulse: fetchMasterKeyPulse
  };
}
