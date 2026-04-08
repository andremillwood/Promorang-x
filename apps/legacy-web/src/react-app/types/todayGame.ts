/**
 * Today Game Types
 * 
 * Core entities for the House War Meter game mechanics.
 * These types drive the game state view on /today.
 */

// =============================================
// CORE ENTITIES
// =============================================

export interface House {
    id: string;
    name: string;
    color: string;       // Hex color for UI
    icon: string;        // Emoji or icon name
    motto: string;
}

export interface District {
    id: string;
    name: string;
    seasonId: string;
    description?: string;
    icon?: string;
}

export interface Season {
    id: string;
    name: string;
    startAt: string;     // ISO date
    endAt: string;       // ISO date
    theme: string;       // e.g., "Food & Beverage"
    bannerUrl?: string;
}

export type WarWindowStatus = 'live' | 'locked' | 'upcoming';

export interface WarWindow {
    id: string;
    districtId: string;
    startsAt: string;    // ISO datetime
    endsAt: string;      // ISO datetime
    status: WarWindowStatus;
}

export interface WarScore {
    warWindowId: string;
    houseId: string;
    houseName: string;
    houseColor: string;
    houseIcon: string;
    score: number;
    deltaSinceYesterday: number;
}

export type ActivationStatus = 'available' | 'in_progress' | 'completed' | 'expired' | 'locked';

export interface Activation {
    id: string;
    districtId: string;
    title: string;
    description: string;
    ctaLabel: string;
    reward: {
        type: 'verified_credits' | 'keys' | 'boost' | 'tickets';
        amount: number;
    };
    houseImpactPoints: number;
    slots?: {
        total: number;
        taken: number;
    };
    endsAt?: string;     // ISO datetime
    status: ActivationStatus;
    isPrimary?: boolean;
}

export interface Boost {
    id: string;
    multiplier: number;  // e.g., 1.5, 2.0
    reason: string;
    endsAt: string;      // ISO datetime
    appliesToActivationIds?: string[];  // null = all activations
}

export interface DrawPrize {
    tier: 'grand' | 'major' | 'minor';
    type: string;
    amount: number;
    description: string;
}

export interface Draw {
    id: string;
    warWindowId: string;
    entryCount: number;
    nextEntryRule?: string;  // e.g., "Complete 1 more activation"
    prizes: DrawPrize[];
    status: 'open' | 'locked' | 'drawn';
}

export interface Crew {
    id: string;
    name: string;
    houseId: string;
    memberCount: number;
    contributionToday: number;
}

export interface LastNightRecap {
    winningHouseId: string;
    winningHouseName: string;
    winningHouseColor: string;
    userHousePlacement: number;  // 1-4
    historyLine: string;         // e.g., "House Sauce claimed Food District • Day 3"
    userWonPrize?: {
        type: string;
        amount: number;
    };
}

// =============================================
// USER STATE
// =============================================

export interface TodayUserState {
    id: string;
    houseId: string | null;
    houseName?: string;
    houseColor?: string;
    houseIcon?: string;
    crewId?: string;
    rank: number;           // Navigator level
    contributionToday: number;
    activationsCompletedToday: number;
}

// =============================================
// FULL API RESPONSE
// =============================================

export interface TodayGameState {
    // Meta
    date: string;           // YYYY-MM-DD
    timestamp: string;      // ISO datetime

    // World state
    district: District;
    season: Season;
    warWindow: WarWindow;
    warScores: WarScore[];

    // User state
    user: TodayUserState;
    crew?: Crew;

    // Actions
    primaryActivation: Activation | null;
    activations: Activation[];
    boost?: Boost;

    // Draw
    draw: Draw;

    // Recap
    lastNightRecap?: LastNightRecap;
}

// =============================================
// COMPUTED VALUES (client-side)
// =============================================

export interface TodayComputedState {
    leadMargin: number;
    leaderHouseId: string;
    leaderHouseName: string;
    userHouseRank: number;         // 1-4
    userHouseScore: number;
    flipEstimate: number | null;   // null if user house is leading
    inactivityConsequenceText: string;
    timeRemaining: number;         // seconds until lock
    isLive: boolean;
}

// =============================================
// HOUSES METADATA (static)
// =============================================

export const HOUSES: House[] = [
    {
        id: 'sauce',
        name: 'House Sauce',
        color: '#F97316',  // Orange
        icon: '🔥',
        motto: 'Burn bright or fade away'
    },
    {
        id: 'luna',
        name: 'House Luna',
        color: '#8B5CF6',  // Purple
        icon: '🌙',
        motto: 'Rise in the dark'
    },
    {
        id: 'tide',
        name: 'House Tide',
        color: '#06B6D4',  // Cyan
        icon: '🌊',
        motto: 'Flow, adapt, conquer'
    },
    {
        id: 'stone',
        name: 'House Stone',
        color: '#84CC16',  // Lime
        icon: '🏔️',
        motto: 'Unmoved, unbroken'
    }
];

export function getHouseById(id: string): House | undefined {
    return HOUSES.find(h => h.id === id);
}
