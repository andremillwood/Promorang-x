import { create } from 'zustand';
import { Bet } from '@/types';
import { useAuthStore } from './authStore';

const API_URL = 'https://promorang-api.vercel.app';

interface BetState {
  bets: Bet[];
  myBets: Bet[];
  isLoading: boolean;
  fetchBets: () => Promise<void>;
  fetchMyBets: () => Promise<void>;
  placeBet: (betId: string, amount: number, prediction: boolean) => Promise<void>;
}

export const useBetStore = create<BetState>((set, get) => ({
  bets: [],
  myBets: [],
  isLoading: false,
  fetchBets: async () => {
    set({ isLoading: true });

    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_URL}/api/social-forecasts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      const mappedBets: Bet[] = Array.isArray(data) ? data.map((item: any) => ({
        id: item.id?.toString(),
        title: item.content_title || 'Untitled',
        description: item.content_title || 'No description',
        contentId: item.content_id?.toString(),
        creator: {
          id: item.creator_id,
          name: item.creator_name || 'Creator',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + item.creator_id,
        },
        target: {
          platform: item.platform,
          metric: item.forecast_type,
          value: item.target_value,
        },
        currentValue: item.current_value || 0,
        odds: item.odds,
        pool: item.pool_size,
        participants: item.participants,
        expiresAt: item.expires_at,
        status: item.status,
        createdAt: item.created_at,
      })) : [];

      set({ bets: mappedBets });
    } catch (error) {
      console.error('Fetch bets error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  fetchMyBets: async () => {
    set({ isLoading: true });

    try {
      const token = useAuthStore.getState().token;
      // Using portfolio predictions as "My Bets"
      const response = await fetch(`${API_URL}/api/portfolio/predictions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      const predictions = data.predictions || [];

      // Map predictions to Bet structure (Note: this is imperfect as Prediction != Forecast/Bet, but good enough for list)
      const mappedMyBets: Bet[] = predictions.map((p: any) => ({
        id: p.forecast_id?.toString(), // Use forecast ID to link back to bet details
        title: p.content_title || 'Prediction',
        description: `You predicted: ${p.prediction_side}`,
        creator: { id: 'unknown', name: 'Unknown', avatar: '' }, // Missing in prediction list
        target: { platform: p.platform, metric: 'unknown', value: 0 },
        currentValue: 0,
        odds: 0, // In prediction detail
        pool: 0,
        participants: 0,
        expiresAt: new Date().toISOString(), // Mock
        status: p.status,
        createdAt: p.created_at
      }));

      set({ myBets: mappedMyBets });
    } catch (error) {
      console.error('Fetch my bets error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  placeBet: async (betId: string, amount: number, prediction: boolean) => {
    set({ isLoading: true });

    try {
      const token = useAuthStore.getState().token;

      const payload = {
        prediction_amount: amount,
        prediction_side: prediction ? 'over' : 'under'
      };

      const response = await fetch(`${API_URL}/api/social-forecasts/${betId}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      // Optimistic update - Add to myBets
      const bet = get().bets.find(b => b.id === betId);
      if (bet) {
        set({ myBets: [...get().myBets, bet] });
      }
    } catch (error) {
      console.error('Place bet error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));