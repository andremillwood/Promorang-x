// MARK TERMINOLOGY SYSTEM
// Warm, human language replacing clinical "participant" and "proof" terms

// Core Concept: "Mark" = Your verified presence, signature, badge of attendance

export const markCopy = {
  // Actions
  actions: {
    checkIn: 'Leave your Mark',
    checkedIn: "You've been Marked",
    verify: 'Make your Mark',
    verified: 'Mark verified',
    pending: 'Awaiting your Mark',
    submit: 'Submit your Mark',
    captured: 'Mark captured',
    required: 'Mark required',
    optional: 'Optional Mark',
  },
  
  // Nouns - The Mark itself
  nouns: {
    mark: 'Mark',
    marks: 'Marks',
    markSingular: 'a Mark',
    markPlural: 'Marks',
    locationMark: 'Location Mark',
    photoMark: 'Photo Mark',
    qrMark: 'QR Mark',
    codeMark: 'Code Mark',
    visualMark: 'Visual Mark',
    digitalMark: 'Digital Mark',
  },
  
  // Status/States
  status: {
    pending: 'Mark pending',
    verified: 'Mark verified',
    confirmed: 'Mark confirmed',
    invalid: 'Mark invalid',
    retry: 'Mark again',
    expired: 'Mark expired',
  },
  
  // Messaging
  messages: {
    welcome: (venue: string) => `Leave your Mark at ${venue}`,
    success: "Your Mark has been captured",
    alreadyMarked: "You've already left your Mark here",
    requiredForReward: "A Mark is required to unlock your reward",
    streak: (count: number) => `${count}-Mark streak`,
    collection: (count: number) => `${count} Marks collected`,
    firstMark: "Your first Mark! Welcome to the community.",
    landmark: "Landmark Mark - You've Marked 10 moments here!",
    signature: "This is your signature Mark style",
  },
  
  // Mastery/Legacy
  legacy: {
    marksThisYear: (count: number) => `${count} Marks this year`,
    totalMarks: (count: number) => `${count} lifetime Marks`,
    uniqueVenues: (count: number) => `Marked at ${count} venues`,
    mostMarked: 'Most Marked venue',
    markArc: 'Your Mark arc',
    markPattern: 'Your Marking pattern',
  },
};

// TIERED IDENTITY SYSTEM
// Guest → Regular → Mover → Host
// Progresses based on behavior, creates dynamic relationships

export type UserTier = 'guest' | 'regular' | 'mover' | 'host';

export interface TierDefinition {
  level: number;
  label: string;
  description: string;
  article: string; // "a Guest" vs "an Mover"
  icon: string;
  color: string;
  
  // Thresholds for achieving this tier
  requirements: {
    minMoments?: number;
    minVenues?: number;
    minStreak?: number;
    hasHosted?: boolean;
    minFrequencyDays?: number; // How often they attend
  };
  
  // Relationship dynamics
  relationships: {
    toHost: string; // How they relate to hosts
    toVenue: string; // How they relate to venues  
    toBrand: string; // How they relate to brands
    toCommunity: string; // How they relate to other users
  };
  
  // Capabilities unlocked
  capabilities: string[];
}

export const userTiers: Record<UserTier, TierDefinition> = {
  guest: {
    level: 1,
    label: 'Guest',
    description: 'New to the moment, discovering the community',
    article: 'a',
    icon: '👋',
    color: 'bg-blue-100 text-blue-800',
    requirements: {
      minMoments: 0,
      minVenues: 0,
    },
    relationships: {
      toHost: 'Welcomed visitor',
      toVenue: 'First-time guest',
      toBrand: 'Curious explorer',
      toCommunity: 'New face',
    },
    capabilities: [
      'Attend moments',
      'Leave Marks',
      'Connect with others',
    ],
  },
  
  regular: {
    level: 2,
    label: 'Regular',
    description: 'Returns to familiar places, building connections',
    article: 'a',
    icon: '🏠',
    color: 'bg-green-100 text-green-800',
    requirements: {
      minMoments: 5,
      minVenues: 2,
      minFrequencyDays: 30, // Attended within last 30 days
    },
    relationships: {
      toHost: 'Recognized face',
      toVenue: 'Familiar regular',
      toBrand: 'Engaged customer',
      toCommunity: 'Known member',
    },
    capabilities: [
      'All Guest capabilities',
      'Early access to moments',
      'Regular perks',
      'Recognized by hosts',
    ],
  },
  
  mover: {
    level: 3,
    label: 'Mover',
    description: 'Creates momentum, shapes moments, leads community',
    article: 'a',
    icon: '⚡',
    color: 'bg-purple-100 text-purple-800',
    requirements: {
      minMoments: 20,
      minVenues: 5,
      minStreak: 3,
      minFrequencyDays: 14, // Active within last 2 weeks
    },
    relationships: {
      toHost: 'Collaborative partner',
      toVenue: 'Community pillar',
      toBrand: 'Vocal advocate',
      toCommunity: 'Leader, mentor',
    },
    capabilities: [
      'All Regular capabilities',
      'Co-host moments',
      'Mentor new Guests',
      'Curate recommendations',
      'Shape moment culture',
    ],
  },
  
  host: {
    level: 4,
    label: 'Host',
    description: 'Creates the moments others Mark',
    article: 'a',
    icon: '✨',
    color: 'bg-amber-100 text-amber-800',
    requirements: {
      hasHosted: true,
      minMoments: 10, // As a participant first
    },
    relationships: {
      toHost: 'Peer collaborator',
      toVenue: 'Venue partner',
      toBrand: 'Brand ambassador',
      toCommunity: 'Community architect',
    },
    capabilities: [
      'All Mover capabilities',
      'Create moments',
      'Own venue relationships',
      'Build brand partnerships',
      'Define community culture',
    ],
  },
};

// Helper to get user's current tier
export function getUserTier(
  totalMoments: number,
  uniqueVenues: number,
  currentStreak: number,
  hasHosted: boolean,
  daysSinceLastMark: number | null
): UserTier {
  if (hasHosted) return 'host';
  
  const moverReqs = userTiers.mover.requirements;
  if (
    totalMoments >= (moverReqs.minMoments || 0) &&
    uniqueVenues >= (moverReqs.minVenues || 0) &&
    currentStreak >= (moverReqs.minStreak || 0) &&
    (daysSinceLastMark === null || daysSinceLastMark <= (moverReqs.minFrequencyDays || 14))
  ) {
    return 'mover';
  }
  
  const regularReqs = userTiers.regular.requirements;
  if (
    totalMoments >= (regularReqs.minMoments || 0) &&
    uniqueVenues >= (regularReqs.minVenues || 0) &&
    (daysSinceLastMark === null || daysSinceLastMark <= (regularReqs.minFrequencyDays || 30))
  ) {
    return 'regular';
  }
  
  return 'guest';
}

// Get tier progression info
export function getTierProgress(
  currentTier: UserTier,
  totalMoments: number,
  uniqueVenues: number,
  currentStreak: number
) {
  const tiers = ['guest', 'regular', 'mover', 'host'] as UserTier[];
  const currentIndex = tiers.indexOf(currentTier);
  const nextTier = currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  
  if (!nextTier) {
    return { complete: true, nextTier: null, requirements: [] };
  }
  
  const reqs = userTiers[nextTier].requirements;
  const requirements = [];
  
  if (reqs.minMoments && totalMoments < reqs.minMoments) {
    requirements.push({
      type: 'moments',
      label: `${reqs.minMoments - totalMoments} more moments`,
      current: totalMoments,
      target: reqs.minMoments,
    });
  }
  
  if (reqs.minVenues && uniqueVenues < reqs.minVenues) {
    requirements.push({
      type: 'venues',
      label: `${reqs.minVenues - uniqueVenues} more venues`,
      current: uniqueVenues,
      target: reqs.minVenues,
    });
  }
  
  if (reqs.minStreak && currentStreak < reqs.minStreak) {
    requirements.push({
      type: 'streak',
      label: `${reqs.minStreak - currentStreak} more streak days`,
      current: currentStreak,
      target: reqs.minStreak,
    });
  }
  
  return {
    complete: requirements.length === 0,
    nextTier,
    requirements,
  };
}

// Dynamic relationship descriptions
export function getRelationshipDescription(
  userTier: UserTier,
  entityType: 'host' | 'venue' | 'brand' | 'community',
  context?: { name?: string; visits?: number; marks?: number }
): string {
  const tier = userTiers[userTier];
  const baseRelationship = tier.relationships[`to${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`];
  
  if (!context) return baseRelationship;
  
  // Enhance with specific context
  switch (entityType) {
    case 'venue':
      if (context.visits && context.visits > 5) {
        return `${baseRelationship} • ${context.visits} visits`;
      }
      return baseRelationship;
      
    case 'host':
      if (context.marks && context.marks > 3) {
        return `${baseRelationship} • ${context.marks} Marks left`;
      }
      return baseRelationship;
      
    default:
      return baseRelationship;
  }
}

// Mark celebration messages based on tier
export function getMarkCelebration(tier: UserTier, markNumber: number): string {
  if (markNumber === 1) return "Your first Mark! Welcome.";
  if (markNumber === 10) return "Landmark Mark! You're now a Regular.";
  if (markNumber === 25) return "You're a Mover now. Leading the way.";
  if (markNumber === 50) return "Half-century of Marks. Community pillar.";
  if (markNumber === 100) return "Century Mark. You're legendary.";
  
  const tierCelebrations: Record<UserTier, string[]> = {
    guest: ["Mark captured!", "Welcome to the moment.", "You're here."],
    regular: ["Your Mark!", "Back again—love it.", "Regular Mark confirmed."],
    mover: ["Mover's Mark!", "Creating momentum.", "Your signature Mark."],
    host: ["Host's Mark.", "Leading by example.", "Setting the standard."],
  };
  
  const celebrations = tierCelebrations[tier];
  return celebrations[markNumber % celebrations.length];
}

// Get tier badge info for UI display
export function getTierBadge(tier: UserTier) {
  const tierConfig = userTiers[tier];
  return {
    label: tierConfig.label,
    description: tierConfig.description,
    color: tierConfig.color,
    icon: tier,
    level: tierConfig.level
  };
}
