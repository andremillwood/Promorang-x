import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    image: string;
    organizer: {
        name: string;
        avatar: string;
    };
    attendees: number;
    type: 'live' | 'creator' | 'drop' | 'community';
    isRegistered: boolean;
    status?: 'draft' | 'published' | 'cancelled';
    category?: string;
    isVirtual?: boolean;
}

interface EventState {
    events: Event[];
    myEvents: any[];
    currentEvent: any | null;
    ticketTiers: any[];
    isLoading: boolean;
    fetchEvents: () => Promise<void>;
    fetchMyEvents: () => Promise<void>;
    fetchEventById: (id: string) => Promise<void>;
    fetchTicketTiers: (id: string) => Promise<void>;
    purchaseTicket: (eventId: string, tierId: string) => Promise<{ success: boolean; error?: string }>;
    rsvpToEvent: (eventId: string, isUnRsvp?: boolean) => Promise<{ success: boolean; error?: string }>;
    deleteEvent: (eventId: string) => Promise<{ success: boolean; error?: string }>;
    updateEvent: (eventId: string, data: any) => Promise<{ success: boolean; error?: string }>;
    activateTicket: (eventId: string, code: string) => Promise<{ success: boolean; message?: string }>;
}

const mapApiEventToStoreEvent = (e: any): Event => ({
    id: e.id,
    title: e.title || e.name || 'Untitled Event',
    description: e.description || '',
    date: e.event_date || e.date || new Date().toISOString(),
    location: e.location_name || e.location || 'Online',
    image: e.banner_url || e.flyer_url || e.image || 'https://images.unsplash.com/photo-1540575861501-7ad060e39fe1?w=800&auto=format&fit=crop&q=60',
    organizer: {
        name: e.organizer_name || (e.organizer?.name) || 'Promorang',
        avatar: e.organizer_avatar || (e.organizer?.avatar) || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Promorang'
    },
    attendees: e.total_rsvps || e.total_attendees || e.attendees || 0,
    type: (e.category || e.type || 'community') as any,
    isRegistered: e.hasRsvp || e.isRegistered || false,
    status: e.status,
    category: e.category,
    isVirtual: e.is_virtual || e.isVirtual || false,
});

export const useEventStore = create<EventState>((set, get) => ({
    events: [],
    myEvents: [],
    currentEvent: null,
    ticketTiers: [],
    isLoading: false,

    fetchEvents: async () => {
        set({ isLoading: true });
        try {
            const data = await api.get<any>('/api/events?limit=20&upcoming=true');
            const eventsRaw = Array.isArray(data) ? data : (data.data?.events || data.events || []);
            const mappedEvents: Event[] = eventsRaw.map(mapApiEventToStoreEvent);
            set({ events: mappedEvents });
        } catch (error) {
            console.error('[EventStore] Fetch events error:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchMyEvents: async () => {
        set({ isLoading: true });
        try {
            const data = await api.get<any>('/api/events/me/created');
            const eventsRaw = Array.isArray(data) ? data : (data.data?.events || data.events || []);
            const mappedEvents = eventsRaw.map(mapApiEventToStoreEvent);
            set({ myEvents: mappedEvents });
        } catch (error) {
            console.error('[EventStore] Fetch my events error:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchEventById: async (id: string) => {
        set({ isLoading: true });
        try {
            const data = await api.get<any>(`/api/events/${id}`);
            if (data.status === 'success' || data.success) {
                const eventData = data.data?.event || data.event || data;
                set({
                    currentEvent: {
                        ...eventData,
                        tasks: data.data?.tasks || data.tasks || [],
                        sponsors: data.data?.sponsors || data.sponsors || [],
                        hasRsvp: data.data?.hasRsvp || data.hasRsvp || false
                    }
                });
            }
        } catch (error) {
            console.error(`[EventStore] Fetch event ${id} error:`, error);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchTicketTiers: async (id: string) => {
        try {
            const data = await api.get<any>(`/api/events/${id}/ticket-tiers`);
            if (data.status === 'success' || data.success) {
                set({ ticketTiers: data.data?.tiers || data.tiers || [] });
            }
        } catch (error) {
            console.error(`[EventStore] Fetch ticket tiers for ${id} error:`, error);
        }
    },

    purchaseTicket: async (eventId: string, tierId: string) => {
        try {
            const data = await api.post<any>(`/api/events/${eventId}/tickets/purchase`, { tier_id: tierId });
            return {
                success: data.status === 'success' || data.success,
                error: data.error || data.message
            };
        } catch (error: any) {
            console.error('[EventStore] Purchase ticket error:', error);
            return { success: false, error: error.message || 'Network error' };
        }
    },

    rsvpToEvent: async (eventId: string, isUnRsvp: boolean = false) => {
        try {
            const data = isUnRsvp
                ? await api.delete<any>(`/api/events/${eventId}/rsvp`)
                : await api.post<any>(`/api/events/${eventId}/rsvp`, {});

            const success = data.status === 'success' || data.success;
            if (success) {
                // Update local list state if event is there
                set((state) => ({
                    events: state.events.map((e) =>
                        e.id === eventId ? { ...e, isRegistered: !isUnRsvp, attendees: isUnRsvp ? e.attendees - 1 : e.attendees + 1 } : e
                    ),
                    currentEvent: state.currentEvent?.id === eventId
                        ? { ...state.currentEvent, hasRsvp: !isUnRsvp, total_rsvps: isUnRsvp ? (state.currentEvent.total_rsvps || 0) - 1 : (state.currentEvent.total_rsvps || 0) + 1 }
                        : state.currentEvent
                }));
            }

            return {
                success,
                error: data.error || data.message
            };
        } catch (error: any) {
            console.error('[EventStore] RSVP error:', error);
            return { success: false, error: error.message || 'Network error' };
        }
    },

    deleteEvent: async (eventId: string) => {
        try {
            const data = await api.delete<any>(`/api/events/${eventId}`);
            const success = data.status === 'success' || data.success;
            if (success) {
                set((state) => ({
                    myEvents: state.myEvents.filter(e => e.id !== eventId),
                    events: state.events.filter(e => e.id !== eventId)
                }));
            }
            return { success, error: data.error || data.message };
        } catch (error: any) {
            console.error('[EventStore] Delete event error:', error);
            return { success: false, error: error.message || 'Network error' };
        }
    },

    updateEvent: async (eventId: string, eventData: any) => {
        try {
            const data = await api.put<any>(`/api/events/${eventId}`, eventData);
            const success = data.status === 'success' || data.success;
            if (success) {
                const updatedItem = data.data?.event || data.event || data;
                set((state) => ({
                    myEvents: state.myEvents.map(e => e.id === eventId ? { ...e, ...updatedItem } : e),
                    events: state.events.map(e => e.id === eventId ? { ...e, title: updatedItem.title, status: updatedItem.status } : e)
                }));
            }
            return { success, error: data.error || data.message };
        } catch (error: any) {
            console.error('[EventStore] Update event error:', error);
            return { success: false, error: error.message || 'Network error' };
        }
    },

    activateTicket: async (eventId: string, code: string) => {
        try {
            const data = await api.post<any>(`/api/events/${eventId}/tickets/activate`, {
                activation_code: code.trim().toUpperCase()
            });

            if (data.status === 'success' || data.success) {
                return { success: true, message: data.message || 'Ticket validated!' };
            } else {
                return { success: false, message: data.error || data.message || 'Invalid ticket code' };
            }
        } catch (error: any) {
            console.error('[EventStore] Activate ticket error:', error);
            return {
                success: false,
                message: error.response?.data?.error || error.message || 'Failed to validate ticket'
            };
        }
    },
}));
