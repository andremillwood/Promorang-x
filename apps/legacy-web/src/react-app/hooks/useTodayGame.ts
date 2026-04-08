/**
 * useTodayGame Hook
 * 
 * State management and polling for the House War Meter game.
 * Uses SWR-style caching with optimistic updates.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { TodayGameState, TodayComputedState } from '../types/todayGame';
import { computeTodayState } from '../lib/todayGameUtils';
import { fetchTodayState, completeActivation as apiCompleteActivation } from '../lib/mockTodayApi';

const POLL_INTERVAL_LIVE = 60_000;    // 60 seconds during live window
const POLL_INTERVAL_LOCKED = 300_000; // 5 minutes when locked
const STORAGE_KEY = 'promorang_today_state_v2';

interface UseTodayGameResult {
    // State
    gameState: TodayGameState | null;
    computed: TodayComputedState | null;
    isLoading: boolean;
    error: Error | null;

    // Actions
    refresh: () => Promise<void>;
    completeActivation: (activationId: string) => Promise<boolean>;

    // UI state
    isRefreshing: boolean;
    lastUpdated: Date | null;
}

export function useTodayGame(): UseTodayGameResult {
    const [gameState, setGameState] = useState<TodayGameState | null>(null);
    const [computed, setComputed] = useState<TodayComputedState | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Load cached state on mount
    useEffect(() => {
        try {
            const cached = localStorage.getItem(STORAGE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached) as TodayGameState;
                // Only use cache if it's from today
                if (parsed.date === new Date().toISOString().split('T')[0]) {
                    setGameState(parsed);
                    setComputed(computeTodayState(parsed));
                }
            }
        } catch (e) {
            console.warn('Failed to load cached today state:', e);
        }
    }, []);

    // Fetch state from API
    const fetchState = useCallback(async (isInitial = false) => {
        if (isInitial) {
            setIsLoading(true);
        } else {
            setIsRefreshing(true);
        }
        setError(null);

        try {
            const state = await fetchTodayState();
            setGameState(state);
            setComputed(computeTodayState(state));
            setLastUpdated(new Date());

            // Cache in localStorage
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            } catch (e) {
                console.warn('Failed to cache today state:', e);
            }
        } catch (e) {
            setError(e instanceof Error ? e : new Error('Failed to fetch game state'));
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchState(true);
    }, [fetchState]);

    // Setup polling based on war window status
    useEffect(() => {
        if (!gameState) return;

        const interval = gameState.warWindow.status === 'live'
            ? POLL_INTERVAL_LIVE
            : POLL_INTERVAL_LOCKED;

        // Clear existing interval
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
        }

        // Setup new interval
        pollIntervalRef.current = setInterval(() => {
            fetchState(false);
        }, interval);

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [gameState?.warWindow.status, fetchState]);

    // Complete activation with optimistic update
    const completeActivation = useCallback(async (activationId: string): Promise<boolean> => {
        if (!gameState) return false;

        // Find the activation
        const activation = gameState.activations.find(q => q.id === activationId);
        if (!activation) return false;

        // Optimistic update
        const optimisticState: TodayGameState = {
            ...gameState,
            user: {
                ...gameState.user,
                contributionToday: gameState.user.contributionToday + activation.houseImpactPoints,
                activationsCompletedToday: gameState.user.activationsCompletedToday + 1
            },
            warScores: gameState.warScores.map(score => {
                if (score.houseId === gameState.user.houseId) {
                    return {
                        ...score,
                        score: score.score + activation.houseImpactPoints
                    };
                }
                return score;
            }),
            activations: gameState.activations.map(q => {
                if (q.id === activationId) {
                    return { ...q, status: 'completed' as const };
                }
                return q;
            }),
            draw: {
                ...gameState.draw,
                entryCount: gameState.draw.entryCount + 1
            }
        };

        setGameState(optimisticState);
        setComputed(computeTodayState(optimisticState));

        try {
            const result = await apiCompleteActivation(activationId);

            if (result.success) {
                // Update with server response
                const serverState: TodayGameState = {
                    ...gameState,
                    user: result.updatedUser,
                    warScores: result.updatedWarScores,
                    activations: gameState.activations.map(q => {
                        if (q.id === activationId) {
                            return { ...q, status: 'completed' as const };
                        }
                        return q;
                    }),
                    draw: {
                        ...gameState.draw,
                        entryCount: result.newDrawEntries
                    }
                };

                setGameState(serverState);
                setComputed(computeTodayState(serverState));

                // Update cache
                localStorage.setItem(STORAGE_KEY, JSON.stringify(serverState));

                return true;
            }

            // Rollback on failure
            setGameState(gameState);
            setComputed(computeTodayState(gameState));
            return false;

        } catch (e) {
            // Rollback on error
            setGameState(gameState);
            setComputed(computeTodayState(gameState));
            console.error('Failed to complete activation:', e);
            return false;
        }
    }, [gameState]);

    const refresh = useCallback(async () => {
        await fetchState(false);
    }, [fetchState]);

    return {
        gameState,
        computed,
        isLoading,
        error,
        refresh,
        completeActivation,
        isRefreshing,
        lastUpdated
    };
}

/**
 * Hook for countdown timer
 */
export function useCountdown(endTime: string | undefined): {
    timeRemaining: number;
    formatted: string;
    isExpired: boolean;
} {
    const [timeRemaining, setTimeRemaining] = useState(0);

    useEffect(() => {
        if (!endTime) {
            setTimeRemaining(0);
            return;
        }

        const update = () => {
            const now = Date.now();
            const end = new Date(endTime).getTime();
            const remaining = Math.max(0, Math.floor((end - now) / 1000));
            setTimeRemaining(remaining);
        };

        update();
        const interval = setInterval(update, 1000);

        return () => clearInterval(interval);
    }, [endTime]);

    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;

    let formatted: string;
    if (timeRemaining <= 0) {
        formatted = 'Locked';
    } else if (hours > 0) {
        formatted = `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        formatted = `${minutes}m ${seconds}s`;
    } else {
        formatted = `${seconds}s`;
    }

    return {
        timeRemaining,
        formatted,
        isExpired: timeRemaining <= 0
    };
}
