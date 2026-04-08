import { create } from 'zustand';
import { api } from '@/lib/api';

export interface EventTicket {
    id: string;
    activation_code: string;
    status: 'valid' | 'used' | 'expired';
    activated_at: string | null;
    created_at: string;
    tier: {
        id: string;
        name: string;
        price_gems: number;
        price_gold: number;
        event: {
            id: string;
            title: string;
            event_date: string;
            location_name?: string;
            location_address?: string;
            banner_url?: string;
            flyer_url?: string;
            is_virtual: boolean;
            organizer_name?: string;
        };
    };
}

interface TicketState {
    tickets: EventTicket[];
    currentTicket: EventTicket | null;
    isLoading: boolean;
    fetchTickets: () => Promise<void>;
    fetchTicketById: (id: string) => Promise<void>;
}

export const useTicketStore = create<TicketState>((set) => ({
    tickets: [],
    currentTicket: null,
    isLoading: false,

    fetchTickets: async () => {
        set({ isLoading: true });
        try {
            const data = await api.get<any>('/api/users/me/tickets');
            if (data.status === 'success' || data.success) {
                set({ tickets: data.data?.tickets || data.tickets || [] });
            }
        } catch (error) {
            console.error('[TicketStore] Fetch tickets error:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchTicketById: async (id: string) => {
        set({ isLoading: true });
        try {
            const data = await api.get<any>(`/api/users/me/tickets/${id}`);
            if (data.status === 'success' || data.success) {
                set({ currentTicket: data.data?.ticket || data.ticket || data });
            }
        } catch (error) {
            console.error(`[TicketStore] Fetch ticket ${id} error:`, error);
        } finally {
            set({ isLoading: false });
        }
    },
}));
