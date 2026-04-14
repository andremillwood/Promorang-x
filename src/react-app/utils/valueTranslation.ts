/**
 * VALUE TRANSLATION LAYER
 * 
 * Maps internal technical terminology to external commercial outcomes.
 * Use this throughout the UI to ensure consistent outcome-driven messaging.
 */

export const TerminologyMap = {
  // Core Units
  moves: {
    internal: 'Moves',
    external: 'Actions from real people',
    description: 'Verified engagements (likes, comments, shares, visits)'
  },
  drops: {
    internal: 'Drops',
    external: 'Campaigns',
    description: 'Structured marketing activations'
  },
  moments: {
    internal: 'Moments',
    external: 'Marketing Outcomes',
    description: 'High-impact results and use-case products'
  },
  gems: {
    internal: 'Gems',
    external: 'Earnings',
    description: 'Withdrawal-ready value earned from participation'
  },
  promopoints: {
    internal: 'PromoPoints',
    external: 'Progress',
    description: 'Points used for leveling and unlocking features'
  },
  promokeys: {
    internal: 'PromoKeys',
    external: 'Priority Access',
    description: 'Tokens used to unlock high-value campaign participation'
  },
  gold: {
    internal: 'Gold',
    external: 'Marketplace Credit',
    description: 'Special currency for high-value redemptions in the marketplace'
  }
};

/**
 * Translate an internal term to its external commercial equivalent
 */
export function translate(term: keyof typeof TerminologyMap, variant: 'external' | 'internal' | 'description' = 'external'): string {
  const mapping = TerminologyMap[term.toLowerCase() as keyof typeof TerminologyMap];
  if (!mapping) return term;
  return mapping[variant];
}

/**
 * Specifically format JMD pricing anchors
 */
export function formatJMDPricing(tierId: string): string {
  const anchors: Record<string, string> = {
    free: 'JMD $5K - $25K',
    starter: 'JMD $25,000',
    growth: 'JMD $120,000',
    premium: 'JMD $350,000 - $900,000+',
    enterprise: 'Custom Quote'
  };
  return anchors[tierId] || 'Inquire for pricing';
}

/**
 * Map technical SKUs to commercial campaign titles
 */
export function getOutcomeTitle(skuId: string): string {
  const outcomes: Record<string, string> = {
    'A1': 'Community Reach Campaign',
    'A2': 'In-Store Foot Traffic Campaign',
    'A3': 'UGC Explosion Campaign',
    'A4': 'Recurring Venue Anchor',
    'A5': 'Digital Social Blitz',
    'S1': 'Campaign Bundle Pack',
    'S2': 'Multi-Location Replication',
    'S3': 'Priority Activation'
  };

  // Handle both A1 and A1_COMMUNITY styles
  const cleanId = skuId.split('_')[0].toUpperCase();
  return outcomes[cleanId] || 'Custom Marketing Campaign';
}
