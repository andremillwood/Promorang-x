/**
 * Today Game Utilities
 * 
 * Client-side computations for the House War Meter game.
 * These drive the dynamic messaging and UX.
 */

import type { TodayGameState, TodayComputedState, WarScore } from '../types/todayGame';

/**
 * Compute derived game state from API response
 */
export function computeTodayState(state: TodayGameState): TodayComputedState {
    const { warScores, user, boost, primaryActivation, warWindow } = state;

    // Sort houses by score (descending)
    const sortedScores = [...warScores].sort((a, b) => b.score - a.score);

    const leaderScore = sortedScores[0]?.score ?? 0;
    const secondScore = sortedScores[1]?.score ?? 0;
    const leadMargin = leaderScore - secondScore;

    const leaderHouse = sortedScores[0];

    // Find user's house position
    const userHouseIndex = sortedScores.findIndex(s => s.houseId === user.houseId);
    const userHouseRank = userHouseIndex >= 0 ? userHouseIndex + 1 : 4;
    const userHouseScore = sortedScores[userHouseIndex]?.score ?? 0;

    // Compute flip estimate (only if not leading)
    let flipEstimate: number | null = null;
    if (userHouseRank > 1 && primaryActivation) {
        const requiredPoints = (leaderScore - userHouseScore) + 1;
        const multiplier = boost?.multiplier ?? 1;
        const perActivationPoints = primaryActivation.houseImpactPoints * multiplier;
        flipEstimate = Math.ceil(requiredPoints / perActivationPoints);
    }

    // Compute time remaining
    const now = new Date();
    const lockTime = new Date(warWindow.endsAt);
    const timeRemaining = Math.max(0, Math.floor((lockTime.getTime() - now.getTime()) / 1000));

    // Determine consequence text
    const inactivityConsequenceText = computeConsequenceText(
        userHouseRank,
        leadMargin,
        flipEstimate,
        user.houseId === leaderHouse?.houseId
    );

    return {
        leadMargin,
        leaderHouseId: leaderHouse?.houseId ?? '',
        leaderHouseName: leaderHouse?.houseName ?? 'Unknown',
        userHouseRank,
        userHouseScore,
        flipEstimate,
        inactivityConsequenceText,
        timeRemaining,
        isLive: warWindow.status === 'live'
    };
}

/**
 * Compute the consequence text based on game state
 */
function computeConsequenceText(
    userRank: number,
    leadMargin: number,
    flipEstimate: number | null,
    isLeading: boolean
): string {
    if (isLeading) {
        if (leadMargin < 50) {
            return "Lead is thin — don't sleep";
        } else if (leadMargin < 150) {
            return "Stay sharp, rivals are close";
        } else {
            return "Commanding lead — keep pushing";
        }
    }

    if (flipEstimate !== null) {
        if (flipEstimate <= 2) {
            return `${flipEstimate} activation${flipEstimate > 1 ? 's' : ''} could flip the lead`;
        } else if (flipEstimate <= 5) {
            return `${flipEstimate} activations to take the lead`;
        } else {
            return "Rally the House — every activation counts";
        }
    }

    return "Lock tonight decides the District";
}

/**
 * Format time remaining as human-readable string
 */
export function formatTimeRemaining(seconds: number): string {
    if (seconds <= 0) return 'Locked';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m`;
    } else {
        return `${seconds}s`;
    }
}

/**
 * Format delta with sign
 */
export function formatDelta(delta: number): string {
    if (delta > 0) return `+${delta}`;
    if (delta < 0) return `${delta}`;
    return '0';
}

/**
 * Get ordinal suffix for a number
 */
export function getOrdinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Compute house standings sorted by score
 */
export function getHouseStandings(warScores: WarScore[]): WarScore[] {
    return [...warScores].sort((a, b) => b.score - a.score);
}

/**
 * Check if a activation is still available based on time and slots
 */
export function isActivationAvailable(activation: {
    status: string;
    endsAt?: string;
    slots?: { total: number; taken: number };
}): boolean {
    if (activation.status !== 'available') return false;

    if (activation.endsAt) {
        const now = new Date();
        const endsAt = new Date(activation.endsAt);
        if (now > endsAt) return false;
    }

    if (activation.slots) {
        if (activation.slots.taken >= activation.slots.total) return false;
    }

    return true;
}

/**
 * Format slot availability
 */
export function formatSlots(slots?: { total: number; taken: number }): string | null {
    if (!slots) return null;
    const remaining = slots.total - slots.taken;
    return `${remaining}/${slots.total} slots left`;
}

/**
 * Compute percentage for progress bar
 */
export function computeHousePercentage(score: number, totalScores: number): number {
    if (totalScores === 0) return 25; // Equal split if no scores
    return Math.round((score / totalScores) * 100);
}
