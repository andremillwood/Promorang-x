// Move costs for different campaign types and actions
const MOVE_COSTS = {
  // Base cost per campaign type
  campaign: {
    proof: 10,        // Moves to create a proof drop
    standard: 50,     // Moves to create a standard campaign
    premium: 100,     // Moves to create a premium campaign
    boost: 25,        // Moves per boost action
    extend: 20,       // Moves to extend a campaign
    target: {
      perAudience: 0.1,  // Moves per targeted audience member
      perLocation: 5,    // Moves per location targeting
      perInterest: 3     // Moves per interest targeting
    }
  },
  
  // Cost modifiers based on campaign scope
  modifiers: {
    duration: 1.2,    // 20% more moves per day of campaign duration
    audience: 1.5,    // 50% more for larger audiences
    premium: 2.0      // 2x cost for premium features
  },
  
  // Tier-based move allocations
  tiers: {
    free: 50,         // Monthly moves for free tier
    premium: 200,     // Weekly moves for premium tier
    super: 500        // Weekly moves for super tier
  }
};

// Calculate move cost for a new campaign
function calculateCampaignCost(campaignType, options = {}) {
  const {
    duration = 7,      // days
    audienceSize = 1000,
    locations = [],
    interests = [],
    isPremium = false
  } = options;
  
  // Base cost based on campaign type
  let cost = MOVE_COSTS.campaign[campaignType] || MOVE_COSTS.campaign.standard;
  
  // Apply duration modifier (20% more per day)
  cost *= Math.pow(MOVE_COSTS.modifiers.duration, Math.ceil(duration / 7));
  
  // Apply audience size modifier (50% more for larger audiences)
  if (audienceSize > 10000) {
    cost *= MOVE_COSTS.modifiers.audience;
  }
  
  // Add targeting costs
  cost += MOVE_COSTS.campaign.target.perAudience * audienceSize;
  cost += MOVE_COSTS.campaign.target.perLocation * locations.length;
  cost += MOVE_COSTS.campaign.target.perInterest * interests.length;
  
  // Apply premium modifier if applicable
  if (isPremium) {
    cost *= MOVE_COSTS.modifiers.premium;
  }
  
  // Round to nearest whole number
  return Math.round(cost);
}

// Check if user has enough moves
function hasEnoughMoves(userTier, currentMoves, requiredMoves) {
  const maxMoves = MOVE_COSTS.tiers[userTier] || MOVE_COSTS.tiers.free;
  return currentMoves + requiredMoves <= maxMoves;
}

// Get move cost breakdown for UI
function getMoveCostBreakdown(campaignType, options) {
  const cost = calculateCampaignCost(campaignType, options);
  return {
    baseCost: MOVE_COSTS.campaign[campaignType] || MOVE_COSTS.campaign.standard,
    durationModifier: Math.pow(MOVE_COSTS.modifiers.duration, Math.ceil((options.duration || 7) / 7)) - 1,
    audienceModifier: options.audienceSize > 10000 ? MOVE_COSTS.modifiers.audience - 1 : 0,
    premiumModifier: options.isPremium ? MOVE_COSTS.modifiers.premium - 1 : 0,
    targetingCost: {
      audience: MOVE_COSTS.campaign.target.perAudience * (options.audienceSize || 0),
      locations: MOVE_COSTS.campaign.target.perLocation * ((options.locations || []).length),
      interests: MOVE_COSTS.campaign.target.perInterest * ((options.interests || []).length)
    },
    totalCost: cost
  };
}

module.exports = {
  MOVE_COSTS,
  calculateCampaignCost,
  hasEnoughMoves,
  getMoveCostBreakdown
};
