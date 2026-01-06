const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

// ============================================
// LIST EVENTS (public)
// ============================================
router.get('/', async (req, res) => {
    try {
        const { status = 'published', limit = 20, offset = 0, upcoming, featured } = req.query;

        let query = supabaseAdmin
            .from('events')
            .select('*')
            .eq('is_public', true)
            .order('event_date', { ascending: true })
            .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

        if (status !== 'all') {
            query = query.eq('status', status);
        }

        if (upcoming === 'true') {
            query = query.gte('event_date', new Date().toISOString());
        }

        if (featured === 'true') {
            query = query.eq('is_featured', true);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching events:', error);
            return res.status(500).json({ success: false, error: 'Failed to fetch events' });
        }

        res.json({
            status: 'success',
            data: { events: data || [] },
        });
    } catch (error) {
        console.error('Error in GET /events:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ============================================
// GET MY CREATED EVENTS (requires auth)
// ============================================
router.get('/me/created', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.sub;

        const { data: events, error } = await supabaseAdmin
            .from('events')
            .select('*')
            .eq('creator_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching my events:', error);
            return res.status(500).json({ success: false, error: 'Failed to fetch events' });
        }

        res.json({
            status: 'success',
            data: { events: events || [] },
        });
    } catch (error) {
        console.error('Error in GET /events/me/created:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ============================================
// GET MY RSVPs (requires auth)
// ============================================
router.get('/me/rsvps', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.sub;

        const { data: rsvps, error } = await supabaseAdmin
            .from('event_rsvps')
            .select(`*, event:events(*)`)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching RSVPs:', error);
            return res.status(500).json({ success: false, error: 'Failed to fetch RSVPs' });
        }

        const events = (rsvps || []).map(r => ({
            ...r.event,
            rsvp_status: r.status,
            rsvp_date: r.created_at,
        }));

        res.json({
            status: 'success',
            data: { events },
        });
    } catch (error) {
        console.error('Error in GET /events/me/rsvps:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ============================================
// GET SINGLE EVENT
// ============================================
router.get('/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user?.id || req.user?.sub;

        const { data: event, error } = await supabaseAdmin
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();

        if (error || !event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        // Check if user has RSVP'd
        let hasRsvp = false;
        if (userId) {
            const { data: rsvp } = await supabaseAdmin
                .from('event_rsvps')
                .select('id')
                .eq('event_id', eventId)
                .eq('user_id', userId)
                .single();

            hasRsvp = !!rsvp;
        }

        // Get event tasks
        const { data: tasks } = await supabaseAdmin
            .from('event_tasks')
            .select('*')
            .eq('event_id', eventId)
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        // Get sponsors
        const { data: sponsors } = await supabaseAdmin
            .from('event_sponsors')
            .select('*')
            .eq('event_id', eventId);

        res.json({
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
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ============================================
// CREATE EVENT (requires auth)
// ============================================
router.post('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.sub;

        // Get user info for organizer fields
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('display_name, username, profile_image')
            .eq('id', userId)
            .single();

        const eventData = {
            ...req.body,
            creator_id: userId,
            organizer_name: user?.display_name || user?.username || 'Unknown',
            organizer_avatar: user?.profile_image || null,
            total_attendees: 0,
            total_rsvps: 0,
            total_check_ins: 0,
        };

        const { data: event, error } = await supabaseAdmin
            .from('events')
            .insert(eventData)
            .select()
            .single();

        if (error) {
            console.error('Error creating event:', error);
            return res.status(500).json({ success: false, error: 'Failed to create event' });
        }

        res.status(201).json({
            status: 'success',
            data: { event },
            message: 'Event created successfully',
        });
    } catch (error) {
        console.error('Error in POST /events:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ============================================
// UPDATE EVENT (requires auth)
// ============================================
router.patch('/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.sub;
        const eventId = req.params.id;

        // Check ownership
        const { data: existingEvent } = await supabaseAdmin
            .from('events')
            .select('creator_id')
            .eq('id', eventId)
            .single();

        if (!existingEvent || existingEvent.creator_id !== userId) {
            return res.status(403).json({ success: false, error: 'Not authorized to update this event' });
        }

        const { data: event, error } = await supabaseAdmin
            .from('events')
            .update(req.body)
            .eq('id', eventId)
            .select()
            .single();

        if (error) {
            console.error('Error updating event:', error);
            return res.status(500).json({ success: false, error: 'Failed to update event' });
        }

        res.json({
            status: 'success',
            data: { event },
            message: 'Event updated successfully',
        });
    } catch (error) {
        console.error('Error in PATCH /events/:id:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ============================================
// DELETE EVENT (requires auth)
// ============================================
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.sub;
        const eventId = req.params.id;

        // Check ownership
        const { data: existingEvent } = await supabaseAdmin
            .from('events')
            .select('creator_id')
            .eq('id', eventId)
            .single();

        if (!existingEvent || existingEvent.creator_id !== userId) {
            return res.status(403).json({ success: false, error: 'Not authorized to delete this event' });
        }

        const { error } = await supabaseAdmin
            .from('events')
            .delete()
            .eq('id', eventId);

        if (error) {
            console.error('Error deleting event:', error);
            return res.status(500).json({ success: false, error: 'Failed to delete event' });
        }

        res.json({
            status: 'success',
            message: 'Event deleted successfully',
        });
    } catch (error) {
        console.error('Error in DELETE /events/:id:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ============================================
// RSVP TO EVENT (requires auth)
// ============================================
router.post('/:id/rsvp', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.sub;
        const eventId = req.params.id;

        // Check if event exists
        const { data: event } = await supabaseAdmin
            .from('events')
            .select('id, max_attendees, total_rsvps, status')
            .eq('id', eventId)
            .single();

        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        if (event.status !== 'published') {
            return res.status(400).json({ success: false, error: 'Event is not open for registration' });
        }

        if (event.max_attendees && event.total_rsvps >= event.max_attendees) {
            return res.status(400).json({ success: false, error: 'Event is at full capacity' });
        }

        // Check if already RSVP'd
        const { data: existingRsvp } = await supabaseAdmin
            .from('event_rsvps')
            .select('id')
            .eq('event_id', eventId)
            .eq('user_id', userId)
            .single();

        if (existingRsvp) {
            return res.status(400).json({ success: false, error: 'Already RSVP\'d to this event' });
        }

        // Create RSVP
        const { data: rsvp, error } = await supabaseAdmin
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
            return res.status(500).json({ success: false, error: 'Failed to RSVP' });
        }

        // Increment RSVP count
        await supabaseAdmin
            .from('events')
            .update({ total_rsvps: (event.total_rsvps || 0) + 1 })
            .eq('id', eventId);

        res.json({
            status: 'success',
            data: { rsvp },
            message: 'Successfully RSVP\'d to event',
        });
    } catch (error) {
        console.error('Error in POST /events/:id/rsvp:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ============================================
// CANCEL RSVP (requires auth)
// ============================================
router.delete('/:id/rsvp', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.sub;
        const eventId = req.params.id;

        // Check if RSVP'd
        const { data: rsvp } = await supabaseAdmin
            .from('event_rsvps')
            .select('id')
            .eq('event_id', eventId)
            .eq('user_id', userId)
            .single();

        if (!rsvp) {
            return res.status(400).json({ success: false, error: 'Not RSVP\'d to this event' });
        }

        // Remove RSVP
        const { error } = await supabaseAdmin
            .from('event_rsvps')
            .delete()
            .eq('event_id', eventId)
            .eq('user_id', userId);

        if (error) {
            console.error('Error cancelling RSVP:', error);
            return res.status(500).json({ success: false, error: 'Failed to cancel RSVP' });
        }

        // Decrement RSVP count
        const { data: event } = await supabaseAdmin
            .from('events')
            .select('total_rsvps')
            .eq('id', eventId)
            .single();

        if (event) {
            await supabaseAdmin
                .from('events')
                .update({ total_rsvps: Math.max(0, (event.total_rsvps || 1) - 1) })
                .eq('id', eventId);
        }

        res.json({
            status: 'success',
            message: 'RSVP cancelled',
        });
    } catch (error) {
        console.error('Error in DELETE /events/:id/rsvp:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;
