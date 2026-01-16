import { create } from 'zustand';
import { useAuthStore } from './authStore';

// Use local API in development, production API otherwise
const API_URL = 'https://promorang-api.vercel.app';

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
            console.log('Searching for:', query);
            const token = useAuthStore.getState().token;

            const url = `${API_URL}/api/search?q=${encodeURIComponent(query)}`;
            console.log('Search URL:', url);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            console.log('Search Response:', data);

            if (data.success) {
                set({ results: data.data });
            } else {
                set({ error: data.error || 'Search failed' });
            }
        } catch (error) {
            console.error('Search error:', error);
            set({ error: 'Failed to perform search' });
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
