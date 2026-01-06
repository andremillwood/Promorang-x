/**
 * Events service - handles all API calls for events functionality
 * Updated to match existing Supabase schema
 */

import { apiFetch } from '@/react-app/utils/api';
import type { EventType, EventTaskType, EventSponsorType } from '../../shared/types';

export interface EventsListResponse {
    events: EventType[];
}

export interface EventDetailResponse {
    event: EventType;
    hasRsvp: boolean;
    tasks: EventTaskType[];
    sponsors: EventSponsorType[];
}

export interface CreateEventPayload {
    title: string;
    description?: string;
    category?: string;
    location_name?: string;
    location_address?: string;
    event_date: string;
    event_end_date?: string;
    flyer_url?: string;
    banner_url?: string;
    is_virtual?: boolean;
    virtual_url?: string;
    ticketing_url?: string;
    ticketing_platform?: string;
    ticket_price_range?: string;
    max_attendees?: number;
    is_public?: boolean;
    is_featured?: boolean;
    status?: 'draft' | 'published';
    tags?: string[];
    total_rewards_pool?: number;
    total_gems_pool?: number;
}

class EventsService {
    private baseUrl = '/api/events';

    /**
     * List all public events
     */
    async listEvents(params?: {
        status?: string;
        upcoming?: boolean;
        featured?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<EventType[]> {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.upcoming) queryParams.append('upcoming', 'true');
        if (params?.featured) queryParams.append('featured', 'true');
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());

        const url = `${this.baseUrl}${queryParams.toString() ? `?${queryParams}` : ''}`;
        const response = await apiFetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }

        const result = await response.json();
        return result.data?.events || [];
    }

    /**
     * Get a single event by ID
     */
    async getEvent(eventId: string): Promise<EventDetailResponse> {
        const response = await apiFetch(`${this.baseUrl}/${eventId}`);

        if (!response.ok) {
            throw new Error('Failed to fetch event');
        }

        const result = await response.json();
        return result.data;
    }

    /**
     * Create a new event
     */
    async createEvent(payload: CreateEventPayload): Promise<EventType> {
        const response = await apiFetch(this.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create event');
        }

        const result = await response.json();
        return result.data.event;
    }

    /**
     * Update an event
     */
    async updateEvent(eventId: string, payload: Partial<CreateEventPayload>): Promise<EventType> {
        const response = await apiFetch(`${this.baseUrl}/${eventId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update event');
        }

        const result = await response.json();
        return result.data.event;
    }

    /**
     * Delete an event
     */
    async deleteEvent(eventId: string): Promise<void> {
        const response = await apiFetch(`${this.baseUrl}/${eventId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete event');
        }
    }

    /**
     * RSVP to an event
     */
    async rsvpEvent(eventId: string): Promise<void> {
        const response = await apiFetch(`${this.baseUrl}/${eventId}/rsvp`, {
            method: 'POST',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to RSVP');
        }
    }

    /**
     * Cancel RSVP
     */
    async cancelRsvp(eventId: string): Promise<void> {
        const response = await apiFetch(`${this.baseUrl}/${eventId}/rsvp`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to cancel RSVP');
        }
    }

    /**
     * Get events created by the current user
     */
    async getMyCreatedEvents(): Promise<EventType[]> {
        const response = await apiFetch(`${this.baseUrl}/me/created`);

        if (!response.ok) {
            throw new Error('Failed to fetch your events');
        }

        const result = await response.json();
        return result.data?.events || [];
    }

    /**
     * Get events the user has RSVP'd to
     */
    async getMyRsvps(): Promise<EventType[]> {
        const response = await apiFetch(`${this.baseUrl}/me/rsvps`);

        if (!response.ok) {
            throw new Error('Failed to fetch your RSVPs');
        }

        const result = await response.json();
        return result.data?.events || [];
    }

    /**
     * Format event date for display
     */
    formatEventDate(eventDate: string, eventEndDate?: string | null): string {
        const start = new Date(eventDate);
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        };

        if (eventEndDate) {
            const end = new Date(eventEndDate);
            if (start.toDateString() === end.toDateString()) {
                return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
            } else {
                return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
            }
        }

        return start.toLocaleDateString('en-US', options);
    }

    /**
     * Get category label with emoji
     */
    getCategoryLabel(category: string | null): string {
        const labels: Record<string, string> = {
            concert: '🎵 Concert',
            conference: '🎤 Conference',
            meetup: '🤝 Meetup',
            festival: '🎉 Festival',
            workshop: '🛠️ Workshop',
            party: '🎊 Party',
            sports: '⚽ Sports',
            art: '🎨 Art',
            food: '🍔 Food & Drink',
            nightlife: '🌙 Nightlife',
            other: '📅 Event',
        };
        return labels[category?.toLowerCase() || 'other'] || labels.other;
    }

    /**
     * Check if event is upcoming
     */
    isUpcoming(eventDate: string): boolean {
        return new Date(eventDate) > new Date();
    }

    /**
     * Check if event is happening now
     */
    isHappeningNow(eventDate: string, eventEndDate?: string | null): boolean {
        const now = new Date();
        const start = new Date(eventDate);
        const end = eventEndDate ? new Date(eventEndDate) : new Date(start.getTime() + 3 * 60 * 60 * 1000);
        return now >= start && now <= end;
    }
}

export const eventsService = new EventsService();
export default eventsService;
