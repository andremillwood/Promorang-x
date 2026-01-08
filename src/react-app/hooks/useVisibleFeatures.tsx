import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface VisibleFeaturesState {
    onboarding_week: number;
    show_all_features: boolean;
    visible_features: string[];
    hidden_features: string[];
    tour_completed: boolean;
    next_features_unlock_week: number | null;
    features_by_tier: {
        week_1: string[];
        week_2: string[];
        week_3: string[];
    };
}

interface VisibleFeaturesContextType {
    features: VisibleFeaturesState | null;
    loading: boolean;
    isVisible: (featureKey: string) => boolean;
    unlockAll: () => Promise<void>;
    refresh: () => Promise<void>;
}

const defaultState: VisibleFeaturesState = {
    onboarding_week: 3,
    show_all_features: true,
    visible_features: [],
    hidden_features: [],
    tour_completed: true,
    next_features_unlock_week: null,
    features_by_tier: {
        week_1: ['points', 'daily_unlock', 'gems_earned', 'drops_basic', 'profile_basic'],
        week_2: ['promokeys', 'conversion_rates', 'master_key', 'drops_advanced', 'sponsorships_basic'],
        week_3: ['leaderboard_math', 'advanced_analytics', 'content_shares', 'predictions', 'relay_system']
    }
};

const VisibleFeaturesContext = createContext<VisibleFeaturesContextType>({
    features: defaultState,
    loading: false,
    isVisible: () => true,
    unlockAll: async () => { },
    refresh: async () => { }
});

export function VisibleFeaturesProvider({ children }: { children: ReactNode }) {
    const [features, setFeatures] = useState<VisibleFeaturesState | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchFeatures = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/users/visible-features', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setFeatures({
                        onboarding_week: data.onboarding_week,
                        show_all_features: data.show_all_features,
                        visible_features: data.visible_features,
                        hidden_features: data.hidden_features,
                        tour_completed: data.tour_completed,
                        next_features_unlock_week: data.next_features_unlock_week,
                        features_by_tier: data.features_by_tier
                    });
                }
            } else {
                // Use default (show all) if API fails
                setFeatures(defaultState);
            }
        } catch (error) {
            console.error('Error fetching visible features:', error);
            setFeatures(defaultState);
        } finally {
            setLoading(false);
        }
    };

    const isVisible = (featureKey: string): boolean => {
        if (!features) return true; // Default to visible while loading
        if (features.show_all_features) return true;
        return features.visible_features.includes(featureKey);
    };

    const unlockAll = async () => {
        try {
            const response = await fetch('/api/users/unlock-all-features', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                await fetchFeatures();
            }
        } catch (error) {
            console.error('Error unlocking features:', error);
        }
    };

    useEffect(() => {
        fetchFeatures();
    }, []);

    return (
        <VisibleFeaturesContext.Provider value={{
            features,
            loading,
            isVisible,
            unlockAll,
            refresh: fetchFeatures
        }}>
            {children}
        </VisibleFeaturesContext.Provider>
    );
}

export function useVisibleFeatures() {
    const context = useContext(VisibleFeaturesContext);
    if (!context) {
        throw new Error('useVisibleFeatures must be used within a VisibleFeaturesProvider');
    }
    return context;
}

// Convenience component for conditional rendering
interface FeatureGateProps {
    feature: string;
    children: ReactNode;
    fallback?: ReactNode;
}

export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
    const { isVisible, loading } = useVisibleFeatures();

    if (loading) {
        return null; // Or a loading skeleton
    }

    if (isVisible(feature)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
}

export default useVisibleFeatures;
