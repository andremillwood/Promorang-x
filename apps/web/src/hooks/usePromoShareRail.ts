import { useState, useEffect, useCallback, useMemo } from 'react';
import { getUnifiedBalances, updateUnifiedBalances, UnifiedBalances, calculateEventRewards, RewardEventType } from '@/lib/rewardEvents';
import { buildPromoShareUrl, getUserReferralCode, captureReferralFromUrl, ShareableObjectType } from '@/lib/promoShareRail';
import { getLocalClaimedPerkIds } from '@/lib/perks';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function usePromoShareRail() {
  const { user, profile } = useAuth();
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

  const claimedPerksList = getLocalClaimedPerkIds();

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
      : (typeof profile?.promo_points === 'number' ? profile.promo_points : (storedBalances.promoPoints || 0));

    const gems = typeof profile?.gems === 'number' ? profile.gems : (storedBalances.gems || 0);
    const claimedCount = claimedPerksList.length || storedBalances.claimedPerksCount || 0;

    return {
      promoPoints: points || 0,
      gems: gems || 0,
      promoShareTickets: storedBalances.promoShareTickets || 0,
      claimedPerksCount: claimedCount,
      nextDrawDate: storedBalances.nextDrawDate,
    };
  }, [user, profile?.points, profile?.promo_points, profile?.gems, storedBalances, claimedPerksList.length]);

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
