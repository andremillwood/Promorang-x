/**
 * Mock Today Game API
 * 
 * Deterministic fixtures for the House War Meter game.
 * Switch to real API by updating the import in useTodayGame.ts
 */

import type { TodayGameState, House, WarScore } from '../types/todayGame';
import { HOUSES } from '../types/todayGame';

// =============================================
// MOCK DATA
// =============================================

const MOCK_SEASON = {
    id: 'season-1',
    name: 'Season One',
    startAt: '2026-01-01T00:00:00Z',
    endAt: '2026-03-31T23:59:59Z',
    theme: 'Food & Beverage'
};

const MOCK_DISTRICT = {
    id: 'food-district',
    name: 'Food District',
    seasonId: 'season-1',
    description: 'Where taste meets territory',
    icon: '🍕'
};

function getWarWindow() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    return {
        id: `war-${today}`,
        districtId: 'food-district',
        startsAt: `${today}T00:00:00Z`,
        endsAt: endOfDay.toISOString(),
        status: 'live' as const
    };
}

function getMockWarScores(): WarScore[] {
    // Randomized but deterministic scores based on current hour
    const hour = new Date().getHours();
    const baseScores = [
        { base: 450, delta: 45 },   // Sauce
        { base: 520, delta: 62 },   // Luna (leading)
        { base: 380, delta: 28 },   // Tide
        { base: 410, delta: 35 }    // Stone
    ];

    return HOUSES.map((house, index) => ({
        warWindowId: getWarWindow().id,
        houseId: house.id,
        houseName: house.name,
        houseColor: house.color,
        houseIcon: house.icon,
        score: baseScores[index].base + (hour * 12),
        deltaSinceYesterday: baseScores[index].delta + (index * 5)
    }));
}

const MOCK_PRIMARY_ACTIVATION = {
    id: 'activation-coffee-moment',
    districtId: 'food-district',
    title: 'Share Your Coffee Moment ☕',
    description: 'Post a photo of your favorite local coffee spot and tag the location. Authentic vibes only!',
    ctaLabel: 'Start Activation',
    reward: {
        type: 'verified_credits' as const,
        amount: 50
    },
    houseImpactPoints: 25,
    slots: {
        total: 100,
        taken: 47
    },
    endsAt: getWarWindow().endsAt,
    status: 'available' as const,
    isPrimary: true
};

const MOCK_ACTIVATIONS = [
    MOCK_PRIMARY_ACTIVATION,
    {
        id: 'activation-lunch-review',
        districtId: 'food-district',
        title: 'Rate a Local Lunch Spot',
        description: 'Leave an honest review for a restaurant you visited today.',
        ctaLabel: 'Write Review',
        reward: {
            type: 'verified_credits' as const,
            amount: 30
        },
        houseImpactPoints: 15,
        status: 'available' as const,
        isPrimary: false
    },
    {
        id: 'activation-recipe-share',
        districtId: 'food-district',
        title: 'Share a Quick Recipe',
        description: 'Post a video of your favorite 5-minute recipe.',
        ctaLabel: 'Share Recipe',
        reward: {
            type: 'verified_credits' as const,
            amount: 75
        },
        houseImpactPoints: 40,
        slots: {
            total: 50,
            taken: 38
        },
        status: 'available' as const,
        isPrimary: false
    }
];

const MOCK_BOOST = {
    id: 'boost-rush-hour',
    multiplier: 1.5,
    reason: 'Rush Hour Bonus',
    endsAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    appliesToActivationIds: undefined // applies to all
};

const MOCK_DRAW = {
    id: 'draw-tonight',
    warWindowId: getWarWindow().id,
    entryCount: 3,
    nextEntryRule: 'Complete 1 more activation for bonus record',
    prizes: [
        { tier: 'grand' as const, type: 'Cash', amount: 500, description: '$500 Cash Prize' },
        { tier: 'major' as const, type: 'Verified Credits', amount: 1000, description: '1,000 Verified Credits Pack' },
        { tier: 'minor' as const, type: 'Keys', amount: 10, description: '10 Premium Keys' }
    ],
    status: 'open' as const
};

const MOCK_LAST_NIGHT = {
    winningHouseId: 'sauce',
    winningHouseName: 'House Sauce',
    winningHouseColor: '#F97316',
    userHousePlacement: 2,
    historyLine: 'House Sauce claimed Food District • Day 3',
    userWonPrize: undefined
};

const MOCK_USER = {
    id: 'user-123',
    houseId: 'luna',
    houseName: 'House Luna',
    houseColor: '#8B5CF6',
    houseIcon: '🌙',
    crewId: 'crew-alpha',
    rank: 2,
    contributionToday: 75,
    activationsCompletedToday: 2
};

const MOCK_CREW = {
    id: 'crew-alpha',
    name: 'Alpha Squad',
    houseId: 'luna',
    memberCount: 12,
    contributionToday: 340
};

// =============================================
// MOCK API ENDPOINTS
// =============================================

/**
 * GET /api/today/state
 */
export async function fetchTodayState(): Promise<TodayGameState> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const today = new Date().toISOString().split('T')[0];

    return {
        date: today,
        timestamp: new Date().toISOString(),
        district: MOCK_DISTRICT,
        season: MOCK_SEASON,
        warWindow: getWarWindow(),
        warScores: getMockWarScores(),
        user: MOCK_USER,
        crew: MOCK_CREW,
        primaryActivation: MOCK_PRIMARY_ACTIVATION,
        activations: MOCK_ACTIVATIONS,
        boost: MOCK_BOOST,
        draw: MOCK_DRAW,
        lastNightRecap: MOCK_LAST_NIGHT
    };
}

/**
 * POST /api/activation/complete
 */
export async function completeActivation(activationId: string): Promise<{
    success: boolean;
    updatedUser: typeof MOCK_USER;
    updatedWarScores: WarScore[];
    newDrawEntries: number;
}> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const activation = MOCK_ACTIVATIONS.find(q => q.id === activationId);
    if (!activation) {
        throw new Error('Activation not found');
    }

    // Update user contribution
    const updatedUser = {
        ...MOCK_USER,
        contributionToday: MOCK_USER.contributionToday + activation.houseImpactPoints,
        activationsCompletedToday: MOCK_USER.activationsCompletedToday + 1
    };

    // Update war scores
    const updatedWarScores = getMockWarScores().map(score => {
        if (score.houseId === MOCK_USER.houseId) {
            return {
                ...score,
                score: score.score + activation.houseImpactPoints
            };
        }
        return score;
    });

    return {
        success: true,
        updatedUser,
        updatedWarScores,
        newDrawEntries: MOCK_DRAW.entryCount + 1
    };
}

/**
 * GET /api/houses
 */
export async function fetchHouses(): Promise<House[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return HOUSES;
}

/**
 * POST /api/user/select-house
 */
export async function selectHouse(houseId: string): Promise<{
    success: boolean;
    user: typeof MOCK_USER;
}> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const house = HOUSES.find(h => h.id === houseId);
    if (!house) {
        throw new Error('House not found');
    }

    return {
        success: true,
        user: {
            ...MOCK_USER,
            houseId: house.id,
            houseName: house.name,
            houseColor: house.color,
            houseIcon: house.icon
        }
    };
}
