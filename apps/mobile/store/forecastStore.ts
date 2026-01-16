import { create } from 'zustand';
import { useAuthStore } from './authStore';

const API_URL = 'https://promorang-api.vercel.app';

export interface Forecast {
    id: string;
    title: string;
    description: string;
    contentId?: string;
    creator: {
        id: string;
        name: string;
        avatar: string;
    };
    target: {
        platform: string;
        metric: string;
        value: number;
    };
    currentValue: number;
    odds: number;
    pool: number;
    participants: number;
    expiresAt: string;
    status: 'active' | 'completed' | 'expired' | 'pending';
    createdAt: string;
}

interface ForecastState {
    forecasts: Forecast[];
    myForecasts: Forecast[];
    isLoading: boolean;
    fetchForecasts: () => Promise<void>;
    fetchMyForecasts: () => Promise<void>;
    makePrediction: (forecastId: string, amount: number, prediction: boolean) => Promise<void>;
}

// Demo forecasts for testing
function generateDemoForecasts(): Forecast[] {
    const now = new Date();
    return [
        {
            id: 'demo-forecast-1',
            title: 'Will @creator_mike hit 10K views?',
            description: 'Predict if this viral TikTok video will reach 10,000 views before the deadline.',
            contentId: 'content-1',
            creator: {
                id: 'demo-creator-1',
                name: 'Sarah Chen',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
            },
            target: {
                platform: 'tiktok',
                metric: 'views',
                value: 10000,
            },
            currentValue: 7250,
            odds: 1.8,
            pool: 500,
            participants: 24,
            expiresAt: new Date(now.getTime() + 3 * 86400000).toISOString(),
            status: 'active',
            createdAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
        },
        {
            id: 'demo-forecast-2',
            title: 'Instagram Reel: 5K Likes Challenge',
            description: 'Will this summer vibes reel hit 5,000 likes by the weekend?',
            contentId: 'content-2',
            creator: {
                id: 'demo-creator-2',
                name: 'Marcus Johnson',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
            },
            target: {
                platform: 'instagram',
                metric: 'likes',
                value: 5000,
            },
            currentValue: 3100,
            odds: 2.2,
            pool: 320,
            participants: 18,
            expiresAt: new Date(now.getTime() + 5 * 86400000).toISOString(),
            status: 'active',
            createdAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
        },
        {
            id: 'demo-forecast-3',
            title: 'Twitter Thread Goes Viral?',
            description: 'Can this tech explainer thread reach 1,000 retweets?',
            contentId: 'content-3',
            creator: {
                id: 'demo-creator-3',
                name: 'Alex Rivera',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
            },
            target: {
                platform: 'twitter',
                metric: 'shares',
                value: 1000,
            },
            currentValue: 450,
            odds: 3.5,
            pool: 180,
            participants: 12,
            expiresAt: new Date(now.getTime() + 7 * 86400000).toISOString(),
            status: 'active',
            createdAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
        },
        {
            id: 'demo-forecast-4',
            title: 'YouTube Short: 50K Views',
            description: 'Will this cooking tutorial short break 50K views in a week?',
            contentId: 'content-4',
            creator: {
                id: 'demo-creator-4',
                name: 'Chef Maria',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
            },
            target: {
                platform: 'youtube',
                metric: 'views',
                value: 50000,
            },
            currentValue: 32000,
            odds: 1.5,
            pool: 750,
            participants: 42,
            expiresAt: new Date(now.getTime() + 2 * 86400000).toISOString(),
            status: 'active',
            createdAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
        },
    ];
}

export const useForecastStore = create<ForecastState>((set, get) => ({
    forecasts: [],
    myForecasts: [],
    isLoading: false,

    fetchForecasts: async () => {
        set({ isLoading: true });

        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/social-forecasts`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            const data = await response.json();

            const mappedForecasts: Forecast[] = Array.isArray(data) ? data.map((item: any) => ({
                id: item.id?.toString(),
                title: item.content_title || 'Untitled Forecast',
                description: item.content_title || 'No description',
                contentId: item.content_id?.toString(),
                creator: {
                    id: item.creator_id,
                    name: item.creator_name || 'Creator',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + item.creator_id,
                },
                target: {
                    platform: item.platform || 'instagram',
                    metric: item.forecast_type || 'views',
                    value: item.target_value || 0,
                },
                currentValue: item.current_value || 0,
                odds: item.odds || 1.5,
                pool: item.pool_size || 0,
                participants: item.participants || 0,
                expiresAt: item.expires_at || new Date().toISOString(),
                status: item.status || 'active',
                createdAt: item.created_at || new Date().toISOString(),
            })) : [];

            // If no forecasts from API, use demo data
            const finalForecasts = mappedForecasts.length > 0 ? mappedForecasts : generateDemoForecasts();
            set({ forecasts: finalForecasts });
        } catch (error) {
            console.error('Fetch forecasts error:', error);
            // Fallback to demo data on error
            set({ forecasts: generateDemoForecasts() });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchMyForecasts: async () => {
        set({ isLoading: true });

        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/portfolio/predictions`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            const data = await response.json();
            const predictions = data.predictions || [];

            const mappedMyForecasts: Forecast[] = predictions.map((p: any) => ({
                id: p.forecast_id?.toString(),
                title: p.content_title || 'My Prediction',
                description: `You predicted: ${p.prediction_side}`,
                creator: { id: 'unknown', name: 'Unknown', avatar: '' },
                target: { platform: p.platform || 'unknown', metric: 'unknown', value: 0 },
                currentValue: 0,
                odds: 0,
                pool: 0,
                participants: 0,
                expiresAt: new Date().toISOString(),
                status: p.status || 'pending',
                createdAt: p.created_at || new Date().toISOString(),
            }));

            set({ myForecasts: mappedMyForecasts });
        } catch (error) {
            console.error('Fetch my forecasts error:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    makePrediction: async (forecastId: string, amount: number, prediction: boolean) => {
        set({ isLoading: true });

        try {
            const token = useAuthStore.getState().token;

            const payload = {
                prediction_amount: amount,
                prediction_side: prediction ? 'over' : 'under'
            };

            const response = await fetch(`${API_URL}/api/social-forecasts/${forecastId}/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.error);

            // Optimistic update - Add to myForecasts
            const forecast = get().forecasts.find(f => f.id === forecastId);
            if (forecast) {
                set({ myForecasts: [...get().myForecasts, forecast] });
            }
        } catch (error) {
            console.error('Make prediction error:', error);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },
}));

// Export alias for backward compatibility during migration
export const useBetStore = useForecastStore;
