import { useState, useEffect, useCallback, useMemo } from 'react';
import { buildPromoShareUrl, captureReferralFromUrl, ShareableObjectType } from '@/lib/promoShareRail';
import { useAuth } from '@/contexts/AuthContext';
import { useMyPromoCard } from '@/hooks/usePeopleExperience';
import { API_BASE_URL } from '@/lib/api';
import { toast } from 'sonner';
import type { RewardEventType } from '@/lib/rewardEvents';
import { useReferralCodes } from '@/hooks/useReferrals';

export interface PromoShareBalances {
  promoPoints: number;
  gems: number;
  promoShareTickets: number;
  claimedPerksCount: number;
  nextDrawDate: string;
  promoShareSourceRecorded: boolean;
}

type PromoShareDashboard = {
  user_stats_by_cycle?: Array<{ total_entries?: number }>;
  draws?: Array<{ end_at?: string }>;
};

function formatNextDraw(draws: PromoShareDashboard['draws']) {
  const next = (draws || [])
    .map((draw) => draw.end_at)
    .filter(Boolean)
    .map((value) => new Date(value as string))
    .filter((date) => !Number.isNaN(date.getTime()) && date.getTime() > Date.now())
    .sort((a, b) => a.getTime() - b.getTime())[0];

  return next
    ? next.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : '';
}

export function usePromoShareRail() {
  const { user, profile, session } = useAuth();
  const card = useMyPromoCard();
  const referralCodes = useReferralCodes();
  const referralCode = referralCodes.data?.find((code) => code.is_active)?.code || null;
  const [promoShareStanding, setPromoShareStanding] = useState({
    entries: 0,
    nextDrawDate: '',
    recorded: false,
  });

  useEffect(() => {
    captureReferralFromUrl();
  }, []);

  const refreshBalances = useCallback(async () => {
    if (!session?.access_token) {
      setPromoShareStanding({ entries: 0, nextDrawDate: '', recorded: false });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/promoshare/dashboard`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) throw new Error(`PromoShare dashboard request failed with ${response.status}`);
      const payload = await response.json();
      if (!payload?.success) throw new Error(payload?.error || 'PromoShare dashboard unavailable');

      const dashboard: PromoShareDashboard = payload.data || {};
      const entries = (dashboard.user_stats_by_cycle || []).reduce(
        (sum, cycle) => sum + Math.max(0, Number(cycle.total_entries || 0)),
        0,
      );
      setPromoShareStanding({
        entries,
        nextDrawDate: formatNextDraw(dashboard.draws),
        recorded: true,
      });
    } catch (error) {
      console.error('Failed to load authoritative PromoShare standing', error);
      setPromoShareStanding({ entries: 0, nextDrawDate: '', recorded: false });
    }
  }, [session?.access_token]);

  useEffect(() => {
    void refreshBalances();
  }, [refreshBalances]);

  const liveClaimedCount = (card.data?.benefits || []).filter(
    (benefit: { redemption?: { recorded?: boolean } }) => !benefit.redemption?.recorded,
  ).length;

  const balances = useMemo<PromoShareBalances>(() => {
    if (!user) {
      return {
        promoPoints: 0,
        gems: 0,
        promoShareTickets: 0,
        claimedPerksCount: 0,
        nextDrawDate: '',
        promoShareSourceRecorded: false,
      };
    }

    const points = typeof profile?.points === 'number'
      ? profile.points
      : (typeof profile?.promo_points === 'number' ? profile.promo_points : Number(card.data?.points || 0));
    const gems = typeof profile?.gems === 'number' ? profile.gems : Number(card.data?.gems || 0);

    return {
      promoPoints: Number(points || 0),
      gems: Number(gems || 0),
      promoShareTickets: promoShareStanding.recorded ? promoShareStanding.entries : 0,
      claimedPerksCount: liveClaimedCount,
      nextDrawDate: promoShareStanding.nextDrawDate,
      promoShareSourceRecorded: promoShareStanding.recorded,
    };
  }, [user, profile?.points, profile?.promo_points, profile?.gems, card.data?.points, card.data?.gems, liveClaimedCount, promoShareStanding]);

  const generateShareLink = useCallback(
    (objectType: ShareableObjectType, objectId: string, slugOrPath?: string) => {
      return buildPromoShareUrl(objectType, objectId, slugOrPath, referralCode || undefined);
    },
    [referralCode],
  );

  /**
   * Compatibility boundary for older callers.
   * The action itself may already have been persisted by its owning feature, but
   * this helper no longer mints client-side points, Gems, or PromoShare entries.
   * Reward state must arrive from an authoritative issuance / cycle record.
   */
  const recordAttributedAction = useCallback(
    (_eventType: RewardEventType, targetTitle?: string) => {
      toast.success(targetTitle ? `${targetTitle} recorded.` : 'Action recorded.', {
        description: 'Any reward or PromoShare entry appears only after the platform records the corresponding issuance.',
      });
      void refreshBalances();
      return null;
    },
    [refreshBalances],
  );

  return {
    balances,
    referralCode,
    referralCodeRecorded: Boolean(referralCode),
    referralCodeLoading: referralCodes.isLoading,
    referralCodeError: referralCodes.error,
    generateShareLink,
    recordAttributedAction,
    refreshBalances,
  };
}
