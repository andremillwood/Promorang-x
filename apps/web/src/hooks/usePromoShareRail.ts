import { useState, useEffect, useCallback, useMemo } from 'react';
import { getUnifiedBalances, updateUnifiedBalances, UnifiedBalances, calculateEventRewards, RewardEventType } from '@/lib/rewardEvents';
import { buildPromoShareUrl, getUserReferralCode, captureReferralFromUrl, ShareableObjectType } from '@/lib/promoShareRail';
import { useAuth } from '@/contexts/AuthContext';
import { useMyPromoCard } from '@/hooks/usePeopleExperience';
import { toast } from 'sonner';

export function usePromoShareRail() {
  const { user, profile } = useAuth();
  const card = useMyPromoCard();
  const [storedBalances, setStoredBalances] = useState<UnifiedBalances>(getUnifiedBalances());
  const referralCode = getUserReferralCode(user?.id);

  const refreshBalances = useCallback(() => {
    setStoredBalances(getUnifiedBalances());
  }, []);

  useEffect(() => {
    captureReferralFromUrl();
    window.addEventListener('promorang-balances-changed', refreshBalances);
    return () => {
      window.removeEventListener('promorang-balances-changed', refreshBalances);
    };
  }, [refreshBalances]);

  const liveClaimedCount = (card.data?.benefits || []).filter((benefit: { redemption?: { recorded?: boolean } }) => !benefit.redemption?.recorded).length;

  const balances = useMemo<UnifiedBalances>(() => {
    if (!user) {
      return {
        promoPoints: 0,
        gems: 0,
        promoShareTickets: 0,
        claimedPerksCount: 0,
        nextDrawDate: storedBalances.nextDrawDate,
      };
    }

    const points = typeof profile?.points === 'number'
      ? profile.points
      : (typeof profile?.promo_points === 'number' ? profile.promo_points : 0);

    const gems = typeof profile?.gems === 'number' ? profile.gems : Number(card.data?.gems || 0);

    return {
      promoPoints: points || Number(card.data?.points || 0),
      gems: gems || 0,
      promoShareTickets: storedBalances.promoShareTickets || 0,
      claimedPerksCount: liveClaimedCount,
      nextDrawDate: storedBalances.nextDrawDate,
    };
  }, [user, profile?.points, profile?.promo_points, profile?.gems, storedBalances, liveClaimedCount, card.data?.gems, card.data?.points]);

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
      setStoredBalances(updated);

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
