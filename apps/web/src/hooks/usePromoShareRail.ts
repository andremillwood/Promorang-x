import { useState, useEffect, useCallback } from 'react';
import { getUnifiedBalances, updateUnifiedBalances, UnifiedBalances, calculateEventRewards, RewardEventType } from '@/lib/rewardEvents';
import { buildPromoShareUrl, getUserReferralCode, captureReferralFromUrl, ShareableObjectType } from '@/lib/promoShareRail';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function usePromoShareRail() {
  const { user } = useAuth();
  const [balances, setBalances] = useState<UnifiedBalances>(getUnifiedBalances());
  const referralCode = getUserReferralCode(user?.id);

  const refreshBalances = useCallback(() => {
    setBalances(getUnifiedBalances());
  }, []);

  useEffect(() => {
    captureReferralFromUrl();
    window.addEventListener('promorang-balances-changed', refreshBalances);
    return () => {
      window.removeEventListener('promorang-balances-changed', refreshBalances);
    };
  }, [refreshBalances]);

  const generateShareLink = useCallback(
    (objectType: ShareableObjectType, objectId: string, slugOrPath?: string) => {
      return buildPromoShareUrl(objectType, objectId, slugOrPath, referralCode);
    },
    [referralCode]
  );

  const recordAttributedAction = useCallback(
    (eventType: RewardEventType, targetTitle?: string) => {
      const rewards = calculateEventRewards(eventType);
      const updated = updateUnifiedBalances({
        promoPoints: rewards.promoPoints,
        gems: rewards.gems,
        promoShareTickets: rewards.promoShareTickets,
      });
      setBalances(updated);

      toast.success(
        `Action Verified! +${rewards.promoPoints} PromoPoints & +${rewards.promoShareTickets} PromoShare Ticket added to your Vault.`
      );
      return rewards;
    },
    []
  );

  return {
    balances,
    referralCode,
    generateShareLink,
    recordAttributedAction,
    refreshBalances,
  };
}
