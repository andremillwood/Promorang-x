import { useState, useEffect } from 'react';
import { useAuth } from '@/react-app/hooks/useAuth';
import { apiFetch } from '@/lib/api';

interface MoveCostBreakdown {
  baseCost: number;
  durationModifier: number;
  audienceModifier: number;
  premiumModifier: number;
  targetingCost: {
    audience: number;
    locations: number;
    interests: number;
  };
  totalCost: number;
}

export function useMoveCosts() {
  const { user } = useAuth();
  const [moveBalance, setMoveBalance] = useState(0);
  const [moveCost, setMoveCost] = useState<MoveCostBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's current move balance
  useEffect(() => {
    if (!user) return;
    
    const fetchMoveBalance = async () => {
      try {
        const response = await apiFetch('/api/users/me');
        if (!response.ok) throw new Error('Failed to load user');
        const data = await response.json();
        setMoveBalance(data.moves_balance || data.move_balance || 0);
      } catch (err) {
        console.error('Failed to fetch move balance:', err);
        setError('Failed to load move balance');
      }
    };

    fetchMoveBalance();
  }, [user]);

  // Calculate move cost for a campaign
  const calculateMoveCost = async (campaignData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiFetch('/api/campaigns/calculate-move-cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData),
      });
      if (!response.ok) throw new Error('Failed to calculate move cost');
      const data = await response.json();
      setMoveCost(data);
      return data;
    } catch (err) {
      console.error('Failed to calculate move cost:', err);
      setError('Failed to calculate move cost');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Check if user has enough moves for a campaign
  const hasEnoughMoves = (requiredMoves: number) => {
    return moveBalance >= requiredMoves;
  };

  return {
    moveBalance,
    moveCost,
    loading,
    error,
    calculateMoveCost,
    hasEnoughMoves,
    refreshBalance: () => {
      if (user) {
        apiFetch('/api/users/me')
          .then(async (response) => {
            if (!response.ok) throw new Error('Failed to refresh balance');
            const data = await response.json();
            setMoveBalance(data.moves_balance || data.move_balance || 0);
          })
          .catch(console.error);
      }
    }
  };
}
