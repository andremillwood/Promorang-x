import { create } from 'zustand';
import { api } from '@/lib/api';
import { ContentShare, ShareOwnership, DividendEvent } from '@/types';

interface ContentShareState {
  contentShares: ContentShare[];
  myOwnerships: ShareOwnership[];
  dividendEvents: DividendEvent[];
  isLoading: boolean;
  fetchContentShares: () => Promise<void>;
  fetchContentShareById: (id: string) => Promise<void>;
  fetchMyOwnerships: () => Promise<void>;
  fetchDividendEvents: (shareId?: string) => Promise<void>;
  buyShares: (shareId: string, amount: number, pricePerShare: number) => Promise<void>;
  sellShares: (shareId: string, amount: number) => Promise<void>;
  claimDividends: (shareId: string) => Promise<void>;
}

// Mock dividend events for fallbacks
const mockDividendEvents: DividendEvent[] = [];

export const useContentShareStore = create<ContentShareState>((set, get) => ({
  contentShares: [],
  myOwnerships: [],
  dividendEvents: [],
  isLoading: false,

  fetchContentShares: async () => {
    set({ isLoading: true });

    try {
      const data = await api.get<any>('/api/content?limit=50');
      const dataArray = Array.isArray(data) ? data : (data.data || []);

      const mappedShares: ContentShare[] = dataArray.map((item: any) => ({
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
      }));

      set({ contentShares: mappedShares });
    } catch (error) {
      console.error('Fetch content shares error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchContentShareById: async (id: string) => {
    set({ isLoading: true });
    try {
      const response = await api.get<any>(`/api/content/${id}`);
      const item = response.data || response;

      if (item && item.id) {
        const share: ContentShare = {
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
              type: 'image',
              media: item.media_url ? [item.media_url] : [],
              text: item.description
            },
            likes: item.likes_count || 0,
            comments: item.comments_count || 0,
            shares: item.reposts_count || 0,
            createdAt: item.created_at,
            isLiked: false,
            isShared: false,
            isBacked: false
          },
          totalShares: item.total_shares || 100,
          founderShares: 50,
          publicShares: 50,
          availableShares: item.available_shares || 0,
          currentPrice: item.share_price || 10,
          priceChange: 0,
          priceChangePercent: 0,
          dividendPool: 0,
          totalDividendsPaid: item.total_dividends_paid || 0,
          holders: 0,
          createdAt: item.created_at,
          sourceUrl: item.platform_url,
          platform: item.platform,
          category: 'General',
          views: item.views_count,
          engagement: (item.likes_count || 0) + (item.comments_count || 0)
        };

        set(state => ({
          contentShares: state.contentShares.some(s => s.id === share.id)
            ? state.contentShares.map(s => s.id === share.id ? share : s)
            : [...state.contentShares, share]
        }));
      }
    } catch (error) {
      console.error('Fetch content share by id error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyOwnerships: async () => {
    set({ isLoading: true });

    try {
      const data = await api.get<any>('/api/portfolio/holdings');
      const holdings = data.holdings || data.data || [];

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
      // In a real app we'd fetch this from the API
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
      const data = await api.post<any>('/api/content/buy-shares', {
        content_id: shareId,
        shares_count: amount
      });

      if (!data.success && data.status !== 'success') throw new Error(data.error || 'Purchase failed');

      // Optimistic logic
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
      const share = get().contentShares.find(s => s.id === shareId);
      const askPrice = share?.currentPrice || 10;

      const data = await api.post<any>('/api/shares/listings', {
        content_id: shareId,
        quantity: amount,
        ask_price: askPrice
      });

      if (!data.success && data.status !== 'success') throw new Error(data.error || 'Sale failed');

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
      // Assuming there's a claim dividends endpoint in a real scenario
      // For now, keeping the demo logic as in the original
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