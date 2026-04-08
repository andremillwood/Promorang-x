import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TourId } from '@/config/tour-config';

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

export function TourProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [activeTour, setActiveTour] = useState<TourId | null>(null);
    const [tourProgress, setTourProgress] = useState<Partial<Record<TourId, TourProgress>>>({});
    const [loading, setLoading] = useState(true);

    // Load user's tour progress from database
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const loadTourProgress = async () => {
            try {
                const { data, error } = await supabase
                    .from('user_tour_progress')
                    .select('*')
                    .eq('user_id', user.id);

                if (error) throw error;

                const progressMap: Record<TourId, TourProgress> = {};
                data?.forEach((record) => {
                    progressMap[record.tour_id as TourId] = {
                        tourId: record.tour_id as TourId,
                        completed: record.completed,
                        currentStep: record.current_step,
                        skipped: record.skipped,
                    };
                });

                setTourProgress(progressMap);
            } catch (error) {
                console.error('Error loading tour progress:', error);
            } finally {
                setLoading(false);
            }
        };

        loadTourProgress();
    }, [user]);

    const startTour = useCallback((tourId: TourId) => {
        setActiveTour(tourId);
    }, []);

    const stopTour = useCallback(() => {
        setActiveTour(null);
    }, []);

    const completeTour = useCallback(async (tourId: TourId) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('user_tour_progress')
                .upsert({
                    user_id: user.id,
                    tour_id: tourId,
                    completed: true,
                    completed_at: new Date().toISOString(),
                    current_step: 0,
                }, {
                    onConflict: 'user_id,tour_id'
                });

            if (error) throw error;

            setTourProgress(prev => ({
                ...prev,
                [tourId]: {
                    tourId,
                    completed: true,
                    currentStep: 0,
                    skipped: false,
                },
            }));

            setActiveTour(null);
        } catch (error) {
            console.error('Error completing tour:', error);
        }
    }, [user]);

    const skipTour = useCallback(async (tourId: TourId) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('user_tour_progress')
                .upsert({
                    user_id: user.id,
                    tour_id: tourId,
                    skipped: true,
                    completed: false,
                    current_step: 0,
                }, {
                    onConflict: 'user_id,tour_id'
                });

            if (error) throw error;

            setTourProgress(prev => ({
                ...prev,
                [tourId]: {
                    tourId,
                    completed: false,
                    currentStep: 0,
                    skipped: true,
                },
            }));

            setActiveTour(null);
        } catch (error) {
            console.error('Error skipping tour:', error);
        }
    }, [user]);

    const updateTourStep = useCallback(async (tourId: TourId, step: number) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('user_tour_progress')
                .upsert({
                    user_id: user.id,
                    tour_id: tourId,
                    current_step: step,
                    completed: false,
                }, {
                    onConflict: 'user_id,tour_id'
                });

            if (error) throw error;

            setTourProgress(prev => ({
                ...prev,
                [tourId]: {
                    ...prev[tourId],
                    tourId,
                    currentStep: step,
                    completed: false,
                    skipped: false,
                },
            }));
        } catch (error) {
            console.error('Error updating tour step:', error);
        }
    }, [user]);

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
