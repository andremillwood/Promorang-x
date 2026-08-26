/**
 * Unified Activity and Reward Event Model for Promorang
 *
 * Mental model:
 * PromoPoints = progress
 * Perks = utility
 * PromoShare Tickets = possibility
 * Gems = platform economic value
 */

export type RewardEventType =
  | 'user.signup'
  | 'discovery.completed'
  | 'perk.claimed'
  | 'perk.redeemed'
  | 'moment.rsvp'
  | 'moment.checkin'
  | 'mission.completed'
  | 'piece.unlocked'
  | 'purchase.completed'
  | 'promoshare.referral_created'
  | 'promoshare.attributed_action';

export interface RewardCalculationResult {
  promoPoints: number;
  gems: number;
  promoShareTickets: number;
  referralPromoPoints: number;
  referralGems: number;
  referralTickets: number;
}

export interface RewardPolicyConfig {
  userPoints: number;
  userGems: number;
  userTickets: number;
  referrerPoints: number;
  referrerGems: number;
  referrerTickets: number;
}

export const DEFAULT_REWARD_POLICIES: Record<RewardEventType, RewardPolicyConfig> = {
  'user.signup': {
    userPoints: 100,
    userGems: 1,
    userTickets: 2,
    referrerPoints: 100,
    referrerGems: 1,
    referrerTickets: 1,
  },
  'discovery.completed': {
    userPoints: 25,
    userGems: 0,
    userTickets: 1,
    referrerPoints: 15,
    referrerGems: 0,
    referrerTickets: 1,
  },
  'perk.claimed': {
    userPoints: 25,
    userGems: 0,
    userTickets: 1,
    referrerPoints: 10,
    referrerGems: 0,
    referrerTickets: 1,
  },
  'perk.redeemed': {
    userPoints: 100,
    userGems: 2,
    userTickets: 3,
    referrerPoints: 50,
    referrerGems: 1,
    referrerTickets: 3,
  },
  'moment.rsvp': {
    userPoints: 30,
    userGems: 0,
    userTickets: 1,
    referrerPoints: 15,
    referrerGems: 0,
    referrerTickets: 1,
  },
  'moment.checkin': {
    userPoints: 150,
    userGems: 3,
    userTickets: 2,
    referrerPoints: 75,
    referrerGems: 1,
    referrerTickets: 2,
  },
  'mission.completed': {
    userPoints: 200,
    userGems: 5,
    userTickets: 3,
    referrerPoints: 50,
    referrerGems: 1,
    referrerTickets: 3,
  },
  'piece.unlocked': {
    userPoints: 250,
    userGems: 5,
    userTickets: 5,
    referrerPoints: 100,
    referrerGems: 2,
    referrerTickets: 2,
  },
  'purchase.completed': {
    userPoints: 100,
    userGems: 0,
    userTickets: 3,
    referrerPoints: 50,
    referrerGems: 1,
    referrerTickets: 2,
  },
  'promoshare.referral_created': {
    userPoints: 50,
    userGems: 1,
    userTickets: 1,
    referrerPoints: 100,
    referrerGems: 1,
    referrerTickets: 2,
  },
  'promoshare.attributed_action': {
    userPoints: 50,
    userGems: 1,
    userTickets: 1,
    referrerPoints: 50,
    referrerGems: 1,
    referrerTickets: 2,
  },
};

/**
 * Calculate rewards for a given event, maintaining non-dilutive single level attribution.
 * User B receives 100% of their reward without deduction.
 * Referrer A receives separately minted referral bonus and PromoShare tickets.
 */
export function calculateEventRewards(
  eventType: RewardEventType,
  customOverrides?: Partial<RewardPolicyConfig>
): RewardCalculationResult {
  const policy = {
    ...DEFAULT_REWARD_POLICIES[eventType],
    ...customOverrides,
  };

  return {
    promoPoints: policy.userPoints,
    gems: policy.userGems,
    promoShareTickets: policy.userTickets,
    referralPromoPoints: policy.referrerPoints,
    referralGems: policy.referrerGems,
    referralTickets: policy.referrerTickets,
  };
}

const GLOBAL_WALLET_BALANCES_KEY = 'promorang_unified_balances';

export interface UnifiedBalances {
  promoPoints: number;
  gems: number;
  promoShareTickets: number;
  claimedPerksCount: number;
  nextDrawDate: string;
}

export function getUnifiedBalances(): UnifiedBalances {
  try {
    const raw = localStorage.getItem(GLOBAL_WALLET_BALANCES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  // Next Friday default
  const nextFriday = new Date();
  nextFriday.setDate(nextFriday.getDate() + ((7 - nextFriday.getDay() + 5) % 7 || 7));
  const nextDrawDate = nextFriday.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return {
    promoPoints: 0,
    gems: 0,
    promoShareTickets: 0,
    claimedPerksCount: 0,
    nextDrawDate: `Friday (${nextDrawDate})`,
  };
}

export function updateUnifiedBalances(deltas: Partial<UnifiedBalances>): UnifiedBalances {
  const current = getUnifiedBalances();
  const updated: UnifiedBalances = {
    ...current,
    promoPoints: Math.max(0, current.promoPoints + (deltas.promoPoints || 0)),
    gems: Math.max(0, current.gems + (deltas.gems || 0)),
    promoShareTickets: Math.max(0, current.promoShareTickets + (deltas.promoShareTickets || 0)),
    claimedPerksCount: Math.max(0, current.claimedPerksCount + (deltas.claimedPerksCount || 0)),
    nextDrawDate: deltas.nextDrawDate || current.nextDrawDate,
  };

  try {
    localStorage.setItem(GLOBAL_WALLET_BALANCES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('promorang-balances-changed'));
  } catch (err) {
    console.error('Failed to store unified balances', err);
  }

  return updated;
}
