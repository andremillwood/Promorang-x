import { useCallback, useMemo, useState } from "react";
import { describeMembershipStanding, type StandingPackage } from "@promorang/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useReferralStats } from "@/hooks/useReferrals";
import { openStandingPackage, readStandingGrants } from "@/lib/standing/standingGrants";

export function useMembershipStanding() {
  const { user } = useAuth();
  const referralStats = useReferralStats();
  const [grants, setGrants] = useState(() => readStandingGrants(user?.id));

  const standing = useMemo(() => {
    const signups = Number(referralStats.data?.referrals.totalSignups || 0);
    const activated = Number(referralStats.data?.referrals.totalConversions || 0);
    return describeMembershipStanding({
      paidTier: user?.user_metadata?.membership_tier || user?.user_metadata?.user_tier,
      paidActive: Boolean(user?.user_metadata?.membership_active),
      activatedReferrals: activated,
      pendingReferrals: Math.max(0, signups - activated),
      commissionUsd: Number(referralStats.data?.earnings.usd || 0),
      openedGrants: user?.id ? grants : [],
    });
  }, [grants, referralStats.data, user]);

  const openPackage = useCallback((pack: StandingPackage) => {
    if (!user?.id) return standing;
    const next = openStandingPackage(user.id, pack);
    setGrants(next);
    return describeMembershipStanding({
      paidTier: user.user_metadata?.membership_tier || user.user_metadata?.user_tier,
      paidActive: Boolean(user.user_metadata?.membership_active),
      activatedReferrals: standing.pot.activatedReferrals,
      pendingReferrals: standing.pot.pendingReferrals,
      commissionUsd: standing.pot.commissionUsd,
      openedGrants: next,
    });
  }, [standing, user]);

  return {
    standing,
    isLoading: referralStats.isLoading,
    openPackage,
  };
}
