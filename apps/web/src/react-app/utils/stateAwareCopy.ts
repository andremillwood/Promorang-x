/**
 * State-Aware Copy Utility
 * 
 * Provides terminology that evolves based on user maturity state.
 * Early users see simpler terms, power users see full platform terminology.
 */

import { UserMaturityState } from '@/react-app/context/MaturityContext';

// Copy mappings: early term -> later term
const COPY_MAPPINGS = {
  // Navigation & Features
  rewards: { early: 'Rewards', later: 'Balance' },
  activity: { early: 'Activity', later: 'Earnings' },
  deals: { early: 'Deals', later: 'Drops' },
  verified: { early: 'Verified', later: 'Social Shield' },
  weeklyWins: { early: 'Weekly Wins', later: 'PromoShare' },
  
  // Actions
  claim: { early: 'Claim', later: 'Apply' },
  earn: { early: 'Earn', later: 'Earn' },
  share: { early: 'Share', later: 'Amplify' },
  
  // Descriptions
  rewardDescription: { 
    early: 'Get rewards for participating', 
    later: 'Earn gems and build your balance' 
  },
  verifiedDescription: { 
    early: 'Your content is verified', 
    later: 'Protected by Social Shield' 
  },
  weeklyWinsDescription: { 
    early: 'Enter weekly prize draws', 
    later: 'Contribute to PromoShare jackpot' 
  }
} as const;

type CopyKey = keyof typeof COPY_MAPPINGS;

/**
 * Get state-aware copy for a given key
 */
export function getStateAwareCopy(key: CopyKey, maturityState: UserMaturityState): string {
  const mapping = COPY_MAPPINGS[key];
  if (!mapping) return key;
  
  // Power users (state >= 3) see full terminology
  return maturityState >= UserMaturityState.POWER_USER ? mapping.later : mapping.early;
}

/**
 * Get all copy for current state
 */
export function getAllStateAwareCopy(maturityState: UserMaturityState): Record<CopyKey, string> {
  const result = {} as Record<CopyKey, string>;
  
  for (const key of Object.keys(COPY_MAPPINGS) as CopyKey[]) {
    result[key] = getStateAwareCopy(key, maturityState);
  }
  
  return result;
}

/**
 * Copy presets for common UI patterns
 */
export const CopyPresets = {
  // Deal/Drop card
  dealCard: (state: UserMaturityState) => ({
    title: getStateAwareCopy('deals', state),
    action: getStateAwareCopy('claim', state),
    rewardLabel: getStateAwareCopy('rewards', state)
  }),
  
  // Navigation labels
  navigation: (state: UserMaturityState) => ({
    deals: getStateAwareCopy('deals', state),
    activity: getStateAwareCopy('activity', state),
    rewards: getStateAwareCopy('rewards', state)
  }),
  
  // Badge labels
  badges: (state: UserMaturityState) => ({
    verified: getStateAwareCopy('verified', state),
    weeklyWins: getStateAwareCopy('weeklyWins', state)
  }),
  
  // Descriptions for tooltips/explainers
  descriptions: (state: UserMaturityState) => ({
    reward: getStateAwareCopy('rewardDescription', state),
    verified: getStateAwareCopy('verifiedDescription', state),
    weeklyWins: getStateAwareCopy('weeklyWinsDescription', state)
  })
};

export default getStateAwareCopy;
