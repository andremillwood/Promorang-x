import { create } from 'zustand';
import { api } from '@/lib/api';

interface SearchResults {
    users: any[];
    drops: any[];
    products: any[];
    stores: any[];
    events: any[];
}

interface SearchState {
    results: SearchResults;
    query: string;
    isSearching: boolean;
    error: string | null;

    setQuery: (query: string) => void;
    performGlobalSearch: (query: string) => Promise<void>;
    clearResults: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
    results: { users: [], drops: [], products: [], stores: [], events: [] },
    query: '',
    isSearching: false,
    error: null,

    setQuery: (query: string) => set({ query }),

    performGlobalSearch: async (query: string) => {
        if (!query || query.length < 2) {
            set({ results: { users: [], drops: [], products: [], stores: [], events: [] }, error: null });
            return;
        }

        set({ isSearching: true, error: null });
        try {
            console.log('[SearchStore] Searching for:', query);
            const data = await api.get<any>(`/api/search?q=${encodeURIComponent(query)}`);
            console.log('[SearchStore] Response:', data);

            if (data.success || data.status === 'success') {
                set({ results: data.data || data });
            } else {
                set({ error: data.error || data.message || 'Search failed' });
            }
        } catch (error: any) {
            console.error('[SearchStore] Error:', error);
            set({ error: error.message || 'Failed to perform search' });
        } finally {
            set({ isSearching: false });
        }
    },

    clearResults: () => set({
        results: { users: [], drops: [], products: [], stores: [], events: [] },
        query: '',
        error: null
    })
}));
