import { create } from 'zustand';
import { ContentShare, ShareOwnership, DividendEvent } from '@/types';
import { useAuthStore } from './authStore';

const API_URL = 'https://promorang-api.vercel.app';

interface ContentShareState {
  contentShares: ContentShare[];
  myOwnerships: ShareOwnership[];
  dividendEvents: DividendEvent[];
  isLoading: boolean;
  fetchContentShares: () => Promise<void>;
  fetchMyOwnerships: () => Promise<void>;
  fetchDividendEvents: (shareId?: string) => Promise<void>;
  buyShares: (shareId: string, amount: number, pricePerShare: number) => Promise<void>;
  sellShares: (shareId: string, amount: number) => Promise<void>;
  claimDividends: (shareId: string) => Promise<void>;
}

export const useContentShareStore = create<ContentShareState>((set, get) => ({
  contentShares: [],
  myOwnerships: [],
  dividendEvents: [],
  isLoading: false,
  fetchContentShares: async () => {
    set({ isLoading: true });

    try {
      const token = useAuthStore.getState().token;
      // Fetch content items that can be treated as shares.
      // In reality we should filter by ?type=investable or check available_shares > 0
      const response = await fetch(`${API_URL}/api/content?limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      const mappedShares: ContentShare[] = Array.isArray(data) ? data.map((item: any) => ({
        id: item.id?.toString(),
        content: {
          id: item.id?.toString(),
          creator: {
            id: item.creator_id,
            name: item.creator_name,
            username: item.creator_username,
            avatar: item.creator_avatar
          },
          content: {
            type: 'image', // simplified
            media: item.media_url ? [item.media_url] : [],
            text: item.description
          },
          likes: item.likes_count,
          comments: item.comments_count,
          shares: item.reposts_count,
          createdAt: item.created_at,
          isLiked: false,
          isShared: false,
          isBacked: false
        },
        totalShares: item.total_shares || 100,
        founderShares: 50, // Assumption
        publicShares: 50,
        availableShares: item.available_shares || 0,
        currentPrice: item.share_price || 10,
        priceChange: 0, // Need historical data
        priceChangePercent: 0,
        dividendPool: 0,
        totalDividendsPaid: item.total_dividends_paid || 0,
        holders: 0,
        createdAt: item.created_at,
        sourceUrl: item.platform_url,
        platform: item.platform,
        category: 'General',
        views: item.views_count,
        engagement: item.likes_count + item.comments_count
      })) : [];

      set({ contentShares: mappedShares });
    } catch (error) {
      console.error('Fetch content shares error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  fetchMyOwnerships: async () => {
    set({ isLoading: true });

    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_URL}/api/portfolio/holdings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      const holdings = data.holdings || [];

      const mappedOwnerships: ShareOwnership[] = holdings.map((h: any) => ({
        id: `own-${h.content_id}`,
        userId: data.user_id,
        contentShareId: h.content_id,
        sharesOwned: h.owned_shares,
        avgBuyPrice: h.avg_cost,
        totalInvested: h.owned_shares * h.avg_cost, // Approximate
        dividendsEarned: 0, // Not in mock holdings
        purchaseDate: h.last_trade_at
      }));

      set({ myOwnerships: mappedOwnerships });
    } catch (error) {
      console.error('Fetch my ownerships error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  fetchDividendEvents: async (shareId?: string) => {
    set({ isLoading: true });

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const events = shareId
        ? mockDividendEvents.filter(e => e.contentShareId === shareId)
        : mockDividendEvents;
      set({ dividendEvents: events });
    } catch (error) {
      console.error('Fetch dividend events error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  buyShares: async (shareId: string, amount: number, pricePerShare: number) => {
    set({ isLoading: true });

    try {
      const token = useAuthStore.getState().token;
      // Using 'amount' as share count based on previous analysis
      const response = await fetch(`${API_URL}/api/content/buy-shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content_id: shareId,
          shares_count: amount
        })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      // Optimistic logic (Simplified from original)
      const existingOwnership = get().myOwnerships.find(o => o.contentShareId === shareId);
      const totalCost = amount * pricePerShare;

      if (existingOwnership) {
        set({
          myOwnerships: get().myOwnerships.map(o =>
            o.contentShareId === shareId ? {
              ...o,
              sharesOwned: o.sharesOwned + amount,
              totalInvested: o.totalInvested + totalCost
            } : o
          )
        });
      } else {
        const newOwnership: ShareOwnership = {
          id: `ownership_${Date.now()}`,
          userId: 'user-me',
          contentShareId: shareId,
          sharesOwned: amount,
          avgBuyPrice: pricePerShare,
          totalInvested: totalCost,
          dividendsEarned: 0,
          purchaseDate: new Date().toISOString(),
        };
        set({ myOwnerships: [...get().myOwnerships, newOwnership] });
      }

      // Update available shares
      set({
        contentShares: get().contentShares.map(share =>
          share.id === shareId
            ? { ...share, availableShares: share.availableShares - amount }
            : share
        )
      });

    } catch (error) {
      console.error('Buy shares error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  sellShares: async (shareId: string, amount: number) => {
    set({ isLoading: true });

    try {
      const token = useAuthStore.getState().token;
      // We are creating a listing to sell
      // Need price... the signature doesn't provide it.
      // We will assume market price or just call it a "Limit Sell" at default.
      // But wait, the backend `POST /listings` needs `ask_price`.
      // I'll assume current price from store.
      const share = get().contentShares.find(s => s.id === shareId);
      const askPrice = share?.currentPrice || 10;

      const response = await fetch(`${API_URL}/api/shares/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content_id: shareId,
          quantity: amount,
          ask_price: askPrice
        })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      // Optimistic update
      const ownership = get().myOwnerships.find(o => o.contentShareId === shareId);
      if (ownership) {
        const newAmount = ownership.sharesOwned - amount;
        if (newAmount <= 0) {
          set({ myOwnerships: get().myOwnerships.filter(o => o.contentShareId !== shareId) });
        } else {
          set({ myOwnerships: get().myOwnerships.map(o => o.contentShareId === shareId ? { ...o, sharesOwned: newAmount } : o) });
        }
      }

    } catch (error) {
      console.error('Sell shares error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  claimDividends: async (shareId: string) => {
    set({ isLoading: true });

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const ownership = get().myOwnerships.find(o => o.contentShareId === shareId);
      const share = get().contentShares.find(s => s.id === shareId);

      if (ownership && share) {
        const dividendPerShare = share.dividendPool / (share.totalShares - share.availableShares);
        const userDividend = dividendPerShare * ownership.sharesOwned;

        const updatedOwnership: ShareOwnership = {
          ...ownership,
          dividendsEarned: ownership.dividendsEarned + userDividend,
        };

        set({
          myOwnerships: get().myOwnerships.map(o =>
            o.contentShareId === shareId ? updatedOwnership : o
          ),
          contentShares: get().contentShares.map(s =>
            s.id === shareId
              ? {
                ...s,
                dividendPool: 0,
                totalDividendsPaid: s.totalDividendsPaid + share.dividendPool
              }
              : s
          )
        });
      }
    } catch (error) {
      console.error('Claim dividends error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));