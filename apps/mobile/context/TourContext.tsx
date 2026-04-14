import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

// Tour IDs - shared with web
export type TourId =
    | 'first-time-user'
    | 'create-proposal'
    | 'catalog'
    | 'check-in'
    | 'dashboard';

interface TourProgress {
    tourId: TourId;
    completed: boolean;
    currentStep: number;
    skipped: boolean;
}

interface TourContextType {
    activeTour: TourId | null;
    tourProgress: Partial<Record<TourId, TourProgress>>;
    startTour: (tourId: TourId) => void;
    stopTour: () => void;
    completeTour: (tourId: TourId) => Promise<void>;
    skipTour: (tourId: TourId) => Promise<void>;
    updateTourStep: (tourId: TourId, step: number) => Promise<void>;
    isTourCompleted: (tourId: TourId) => boolean;
    loading: boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

const STORAGE_KEY = '@promorang_tour_progress';

export function TourProvider({ children }: { children: React.ReactNode }) {
    const [userId, setUserId] = useState<string | null>(null);
    const [activeTour, setActiveTour] = useState<TourId | null>(null);
    const [tourProgress, setTourProgress] = useState<Partial<Record<TourId, TourProgress>>>({});
    const [loading, setLoading] = useState(true);

    // Get current user
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id || null);
        };
        getUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserId(session?.user?.id || null);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // Load tour progress from AsyncStorage and sync with Supabase
    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const loadTourProgress = async () => {
            try {
                // First, try to load from AsyncStorage (offline-first)
                const localData = await AsyncStorage.getItem(STORAGE_KEY);
                if (localData) {
                    setTourProgress(JSON.parse(localData));
                }

                // Then sync with Supabase
                const { data, error } = await supabase
                    .from('user_tour_progress')
                    .select('*')
                    .eq('user_id', userId);

                if (error) throw error;

                const progressMap: Partial<Record<TourId, TourProgress>> = {};
                data?.forEach((record) => {
                    progressMap[record.tour_id as TourId] = {
                        tourId: record.tour_id as TourId,
                        completed: record.completed,
                        currentStep: record.current_step,
                        skipped: record.skipped,
                    };
                });

                setTourProgress(progressMap);
                // Update AsyncStorage with server data
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progressMap));
            } catch (error) {
                console.error('Error loading tour progress:', error);
            } finally {
                setLoading(false);
            }
        };

        loadTourProgress();
    }, [userId]);

    const startTour = useCallback((tourId: TourId) => {
        setActiveTour(tourId);
    }, []);

    const stopTour = useCallback(() => {
        setActiveTour(null);
    }, []);

    const completeTour = useCallback(async (tourId: TourId) => {
        if (!userId) return;

        try {
            const newProgress = {
                ...tourProgress,
                [tourId]: {
                    tourId,
                    completed: true,
                    currentStep: 0,
                    skipped: false,
                },
            };

            // Update local state
            setTourProgress(newProgress);
            setActiveTour(null);

            // Save to AsyncStorage
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));

            // Sync to Supabase
            const { error } = await supabase
                .from('user_tour_progress')
                .upsert({
                    user_id: userId,
                    tour_id: tourId,
                    completed: true,
                    completed_at: new Date().toISOString(),
                    current_step: 0,
                }, {
                    onConflict: 'user_id,tour_id'
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error completing tour:', error);
        }
    }, [userId, tourProgress]);

    const skipTour = useCallback(async (tourId: TourId) => {
        if (!userId) return;

        try {
            const newProgress = {
                ...tourProgress,
                [tourId]: {
                    tourId,
                    completed: false,
                    currentStep: 0,
                    skipped: true,
                },
            };

            setTourProgress(newProgress);
            setActiveTour(null);

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));

            const { error } = await supabase
                .from('user_tour_progress')
                .upsert({
                    user_id: userId,
                    tour_id: tourId,
                    skipped: true,
                    completed: false,
                    current_step: 0,
                }, {
                    onConflict: 'user_id,tour_id'
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error skipping tour:', error);
        }
    }, [userId, tourProgress]);

    const updateTourStep = useCallback(async (tourId: TourId, step: number) => {
        if (!userId) return;

        try {
            const newProgress = {
                ...tourProgress,
                [tourId]: {
                    ...tourProgress[tourId],
                    tourId,
                    currentStep: step,
                    completed: false,
                    skipped: false,
                },
            };

            setTourProgress(newProgress);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));

            const { error } = await supabase
                .from('user_tour_progress')
                .upsert({
                    user_id: userId,
                    tour_id: tourId,
                    current_step: step,
                    completed: false,
                }, {
                    onConflict: 'user_id,tour_id'
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error updating tour step:', error);
        }
    }, [userId, tourProgress]);

    const isTourCompleted = useCallback((tourId: TourId) => {
        return tourProgress[tourId]?.completed || false;
    }, [tourProgress]);

    const value: TourContextType = {
        activeTour,
        tourProgress,
        startTour,
        stopTour,
        completeTour,
        skipTour,
        updateTourStep,
        isTourCompleted,
        loading,
    };

    return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour() {
    const context = useContext(TourContext);
    if (context === undefined) {
        throw new Error('useTour must be used within a TourProvider');
    }
    return context;
}
