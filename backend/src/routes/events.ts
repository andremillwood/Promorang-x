import { Hono } from 'hono';
import { supabase } from '../db';
import { z } from 'zod';

export const eventsRouter = new Hono();

// Helper to get userId from context
const getUserId = (c: any): string | null => {
    const user = c.get('user') as { id?: string; sub?: string } | undefined;
    return user?.id || user?.sub || null;
};

// ============================================
// VALIDATION SCHEMAS
// ============================================

const CreateEventSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    category: z.string().optional(),
    location_name: z.string().optional(),
    location_address: z.string().optional(),
    event_date: z.string(),
    event_end_date: z.string().optional(),
    flyer_url: z.string().url().optional(),
    banner_url: z.string().url().optional(),
    is_virtual: z.boolean().default(false),
    virtual_url: z.string().url().optional(),
    ticketing_url: z.string().url().optional(),
    ticketing_platform: z.string().optional(),
    ticket_price_range: z.string().optional(),
    max_attendees: z.number().int().positive().optional(),
    is_public: z.boolean().default(true),
    is_featured: z.boolean().default(false),
    status: z.enum(['draft', 'published', 'cancelled', 'completed']).default('draft'),
    tags: z.array(z.string()).optional(),
    total_rewards_pool: z.number().optional(),
    total_gems_pool: z.number().optional(),
    metadata: z.record(z.unknown()).optional(),
});

const UpdateEventSchema = CreateEventSchema.partial();

// ============================================
// LIST EVENTS
// ============================================
eventsRouter.get('/', async (c) => {
    try {
        const url = new URL(c.req.url);
        const status = url.searchParams.get('status') || 'published';
        const limit = parseInt(url.searchParams.get('limit') || '20', 10);
        const offset = parseInt(url.searchParams.get('offset') || '0', 10);
        const upcoming = url.searchParams.get('upcoming') === 'true';
        const featured = url.searchParams.get('featured') === 'true';

        let query = supabase
            .from('events')
            .select('*')
            .eq('is_public', true)
            .order('event_date', { ascending: true })
            .range(offset, offset + limit - 1);

        if (status !== 'all') {
            query = query.eq('status', status);
        }

        if (upcoming) {
            query = query.gte('event_date', new Date().toISOString());
        }

        if (featured) {
            query = query.eq('is_featured', true);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching events:', error);
            return c.json({ error: 'Failed to fetch events' }, 500);
        }

        return c.json({
            status: 'success',
            data: { events: data || [] },
        });
    } catch (error) {
        console.error('Error in GET /events:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// ============================================
// GET SINGLE EVENT
// ============================================
eventsRouter.get('/:id', async (c) => {
    try {
        const eventId = c.req.param('id');
        const userId = getUserId(c);

        const { data: event, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();

        if (error || !event) {
            return c.json({ error: 'Event not found' }, 404);
        }

        // Check if user has RSVP'd (using existing event_rsvps table)
        let hasRsvp = false;
        if (userId) {
            const { data: rsvp } = await supabase
                .from('event_rsvps')
                .select('id')
                .eq('event_id', eventId)
                .eq('user_id', userId)
                .single();

            hasRsvp = !!rsvp;
        }

        // Get event tasks
        const { data: tasks } = await supabase
            .from('event_tasks')
            .select('*')
            .eq('event_id', eventId)
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        // Get sponsors
        const { data: sponsors } = await supabase
            .from('event_sponsors')
            .select('*')
            .eq('event_id', eventId);

        return c.json({
            status: 'success',
            data: {
                event,
                hasRsvp,
                tasks: tasks || [],
                sponsors: sponsors || [],
            },
        });
    } catch (error) {
        console.error('Error in GET /events/:id:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// ============================================
// CREATE EVENT
// ============================================
eventsRouter.post('/', async (c) => {
    try {
        const userId = getUserId(c);
        if (!userId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const body = await c.req.json();
        const parsed = CreateEventSchema.safeParse(body);

        if (!parsed.success) {
            return c.json({ error: 'Invalid request', details: parsed.error.errors }, 400);
        }

        // Get user info for organizer fields
        const { data: user } = await supabase
            .from('users')
            .select('display_name, username, profile_image')
            .eq('id', userId)
            .single();

        const eventData = {
            ...parsed.data,
            creator_id: userId,
            organizer_name: user?.display_name || user?.username || 'Unknown',
            organizer_avatar: user?.profile_image || null,
            total_attendees: 0,
            total_rsvps: 0,
            total_check_ins: 0,
        };

        const { data: event, error } = await supabase
            .from('events')
            .insert(eventData)
            .select()
            .single();

        if (error) {
            console.error('Error creating event:', error);
            return c.json({ error: 'Failed to create event' }, 500);
        }

        return c.json({
            status: 'success',
            data: { event },
            message: 'Event created successfully',
        }, 201);
    } catch (error) {
        console.error('Error in POST /events:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// ============================================
// UPDATE EVENT
// ============================================
eventsRouter.patch('/:id', async (c) => {
    try {
        const userId = getUserId(c);
        const eventId = c.req.param('id');

        if (!userId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        // Check ownership
        const { data: existingEvent } = await supabase
            .from('events')
            .select('creator_id')
            .eq('id', eventId)
            .single();

        if (!existingEvent || existingEvent.creator_id !== userId) {
            return c.json({ error: 'Not authorized to update this event' }, 403);
        }

        const body = await c.req.json();
        const parsed = UpdateEventSchema.safeParse(body);

        if (!parsed.success) {
            return c.json({ error: 'Invalid request', details: parsed.error.errors }, 400);
        }

        const { data: event, error } = await supabase
            .from('events')
            .update(parsed.data)
            .eq('id', eventId)
            .select()
            .single();

        if (error) {
            console.error('Error updating event:', error);
            return c.json({ error: 'Failed to update event' }, 500);
        }

        return c.json({
            status: 'success',
            data: { event },
            message: 'Event updated successfully',
        });
    } catch (error) {
        console.error('Error in PATCH /events/:id:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// ============================================
// DELETE EVENT
// ============================================
eventsRouter.delete('/:id', async (c) => {
    try {
        const userId = getUserId(c);
        const eventId = c.req.param('id');

        if (!userId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        // Check ownership
        const { data: existingEvent } = await supabase
            .from('events')
            .select('creator_id')
            .eq('id', eventId)
            .single();

        if (!existingEvent || existingEvent.creator_id !== userId) {
            return c.json({ error: 'Not authorized to delete this event' }, 403);
        }

        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', eventId);

        if (error) {
            console.error('Error deleting event:', error);
            return c.json({ error: 'Failed to delete event' }, 500);
        }

        return c.json({
            status: 'success',
            message: 'Event deleted successfully',
        });
    } catch (error) {
        console.error('Error in DELETE /events/:id:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// ============================================
// RSVP TO EVENT
// ============================================
eventsRouter.post('/:id/rsvp', async (c) => {
    try {
        const userId = getUserId(c);
        const eventId = c.req.param('id');

        if (!userId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        // Check if event exists
        const { data: event } = await supabase
            .from('events')
            .select('id, max_attendees, total_rsvps, status')
            .eq('id', eventId)
            .single();

        if (!event) {
            return c.json({ error: 'Event not found' }, 404);
        }

        if (event.status !== 'published') {
            return c.json({ error: 'Event is not open for registration' }, 400);
        }

        if (event.max_attendees && event.total_rsvps >= event.max_attendees) {
            return c.json({ error: 'Event is at full capacity' }, 400);
        }

        // Check if already RSVP'd
        const { data: existingRsvp } = await supabase
            .from('event_rsvps')
            .select('id')
            .eq('event_id', eventId)
            .eq('user_id', userId)
            .single();

        if (existingRsvp) {
            return c.json({ error: 'Already RSVP\'d to this event' }, 400);
        }

        // Create RSVP
        const { data: rsvp, error } = await supabase
            .from('event_rsvps')
            .insert({
                event_id: eventId,
                user_id: userId,
                status: 'confirmed',
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating RSVP:', error);
            return c.json({ error: 'Failed to RSVP' }, 500);
        }

        // Increment RSVP count
        await supabase
            .from('events')
            .update({ total_rsvps: (event.total_rsvps || 0) + 1 })
            .eq('id', eventId);

        return c.json({
            status: 'success',
            data: { rsvp },
            message: 'Successfully RSVP\'d to event',
        });
    } catch (error) {
        console.error('Error in POST /events/:id/rsvp:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// ============================================
// CANCEL RSVP
// ============================================
eventsRouter.delete('/:id/rsvp', async (c) => {
    try {
        const userId = getUserId(c);
        const eventId = c.req.param('id');

        if (!userId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        // Check if RSVP'd
        const { data: rsvp } = await supabase
            .from('event_rsvps')
            .select('id')
            .eq('event_id', eventId)
            .eq('user_id', userId)
            .single();

        if (!rsvp) {
            return c.json({ error: 'Not RSVP\'d to this event' }, 400);
        }

        // Remove RSVP
        const { error } = await supabase
            .from('event_rsvps')
            .delete()
            .eq('event_id', eventId)
            .eq('user_id', userId);

        if (error) {
            console.error('Error cancelling RSVP:', error);
            return c.json({ error: 'Failed to cancel RSVP' }, 500);
        }

        // Decrement RSVP count
        const { data: event } = await supabase
            .from('events')
            .select('total_rsvps')
            .eq('id', eventId)
            .single();

        if (event) {
            await supabase
                .from('events')
                .update({ total_rsvps: Math.max(0, (event.total_rsvps || 1) - 1) })
                .eq('id', eventId);
        }

        return c.json({
            status: 'success',
            message: 'RSVP cancelled',
        });
    } catch (error) {
        console.error('Error in DELETE /events/:id/rsvp:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// ============================================
// MY EVENTS (created by user)
// ============================================
eventsRouter.get('/me/created', async (c) => {
    try {
        const userId = getUserId(c);

        if (!userId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const { data: events, error } = await supabase
            .from('events')
            .select('*')
            .eq('creator_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching my events:', error);
            return c.json({ error: 'Failed to fetch events' }, 500);
        }

        return c.json({
            status: 'success',
            data: { events: events || [] },
        });
    } catch (error) {
        console.error('Error in GET /events/me/created:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// ============================================
// MY RSVPs (events user is attending)
// ============================================
eventsRouter.get('/me/rsvps', async (c) => {
    try {
        const userId = getUserId(c);

        if (!userId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const { data: rsvps, error } = await supabase
            .from('event_rsvps')
            .select(`
        *,
        event:events(*)
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching RSVPs:', error);
            return c.json({ error: 'Failed to fetch RSVPs' }, 500);
        }

        const events = (rsvps || []).map(r => ({
            ...r.event,
            rsvp_status: r.status,
            rsvp_date: r.created_at,
        }));

        return c.json({
            status: 'success',
            data: { events },
        });
    } catch (error) {
        console.error('Error in GET /events/me/rsvps:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});
