const express = require('express');
const router = express.Router();
const supabaseAdmin = require('../lib/supabase');
const { requireAuth, optionalAuth } = require('../middleware/auth');

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

        const eventsWithImages = (data || []).map((event, index) => ({
            ...event,
            banner_url: event.banner_url || (index % 2 === 0 ? '/assets/demo/neon-festival.png' : '/assets/demo/tech-summit.png'),
            flyer_url: event.flyer_url || (index % 2 === 0 ? '/assets/demo/neon-festival.png' : '/assets/demo/tech-summit.png'),
        }));

        res.json({
            status: 'success',
            data: { events: eventsWithImages },
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
router.get('/:id', optionalAuth, async (req, res) => {
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
                status: 'going',
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

// ============================================
// SUBMIT TASK PROOF (requires auth)
// ============================================
router.post('/:id/tasks/:taskId/submit', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.sub;
        const { id: eventId, taskId } = req.params;
        const { submission_url, proof_text } = req.body;

        // Check if task exists and belongs to event
        const { data: task } = await supabaseAdmin
            .from('event_tasks')
            .select('*')
            .eq('id', taskId)
            .eq('event_id', eventId)
            .single();

        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        // Check if already submitted
        const { data: existingSubmission } = await supabaseAdmin
            .from('event_task_submissions')
            .select('id')
            .eq('task_id', taskId)
            .eq('user_id', userId)
            .single();

        if (existingSubmission) {
            return res.status(400).json({ success: false, error: 'Already submitted proof for this task' });
        }

        const { data: submission, error } = await supabaseAdmin
            .from('event_task_submissions')
            .insert({
                task_id: taskId,
                event_id: eventId,
                user_id: userId,
                submission_url,
                proof_text,
                status: 'pending',
                points_awarded: task.points_reward || 0,
                gems_awarded: task.gems_reward || 0,
            })
            .select()
            .single();

        if (error) {
            console.error('Error submitting task proof:', error);
            return res.status(500).json({ success: false, error: 'Failed to submit proof' });
        }

        res.status(201).json({
            status: 'success',
            data: { submission },
            message: 'Proof submitted successfully, awaiting review',
        });
    } catch (error) {
        console.error('Error in POST /events/:id/tasks/:taskId/submit:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ============================================
// LIST MEDIA (Gallery)
// ============================================
router.get('/:id/media', async (req, res) => {
    try {
        const eventId = req.params.id;

        const { data: media, error } = await supabaseAdmin
            .from('event_media')
            .select('*')
            .eq('event_id', eventId)
            .eq('is_approved', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching event media:', error);
            return res.status(500).json({ success: false, error: 'Failed to fetch media' });
        }

        res.json({
            status: 'success',
            data: { media: media || [] },
        });
    } catch (error) {
        console.error('Error in GET /events/:id/media:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ============================================
// UPLOAD MEDIA (requires auth)
// ============================================
router.post('/:id/media', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.sub;
        const eventId = req.params.id;
        const { media_url, media_type, caption } = req.body;

        if (!media_url) {
            return res.status(400).json({ success: false, error: 'Media URL is required' });
        }

        const { data: media, error } = await supabaseAdmin
            .from('event_media')
            .insert({
                event_id: eventId,
                user_id: userId,
                media_url,
                media_type: media_type || 'image',
                caption,
                is_approved: true, // Default to true for now
            })
            .select()
            .single();

        if (error) {
            console.error('Error uploading community media:', error);
            return res.status(500).json({ success: false, error: 'Failed to upload media' });
        }

        // Increment UGC count in events table
        const { data: event } = await supabaseAdmin
            .from('events')
            .select('total_ugc_submissions')
            .eq('id', eventId)
            .single();

        if (event) {
            await supabaseAdmin
                .from('events')
                .update({ total_ugc_submissions: (event.total_ugc_submissions || 0) + 1 })
                .eq('id', eventId);
        }

        res.status(201).json({
            status: 'success',
            data: { media },
            message: 'Media added to gallery',
        });
    } catch (error) {
        console.error('Error in POST /events/:id/media:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ============================================
// LIST UPDATES
// ============================================
router.get('/:id/updates', async (req, res) => {
    try {
        const eventId = req.params.id;

        const { data: updates, error } = await supabaseAdmin
            .from('event_updates')
            .select('*')
            .eq('event_id', eventId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching event updates:', error);
            return res.status(500).json({ success: false, error: 'Failed to fetch updates' });
        }

        res.json({
            status: 'success',
            data: { updates: updates || [] },
        });
    } catch (error) {
        console.error('Error in GET /events/:id/updates:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ============================================
// POST UPDATE (Organizer Only)
// ============================================
router.post('/:id/updates', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.sub;
        const eventId = req.params.id;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ success: false, error: 'Update content is required' });
        }

        // Check ownership
        const { data: event } = await supabaseAdmin
            .from('events')
            .select('creator_id')
            .eq('id', eventId)
            .single();

        if (!event || event.creator_id !== userId) {
            return res.status(403).json({ success: false, error: 'Only the organizer can post updates' });
        }

        const { data: update, error } = await supabaseAdmin
            .from('event_updates')
            .insert({
                event_id: eventId,
                content,
            })
            .select()
            .single();

        if (error) {
            console.error('Error posting update:', error);
            return res.status(500).json({ success: false, error: 'Failed to post update' });
        }

        res.status(201).json({
            status: 'success',
            data: { update },
            message: 'Update posted successfully',
        });
    } catch (error) {
        console.error('Error in POST /events/:id/updates:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ============================================
// LIST ATTENDEES (Organizer Only)
// ============================================
router.get('/:id/attendees', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.sub;
        const eventId = req.params.id;

        // Check ownership
        const { data: event } = await supabaseAdmin
            .from('events')
            .select('creator_id')
            .eq('id', eventId)
            .single();

        if (!event || event.creator_id !== userId) {
            return res.status(403).json({ success: false, error: 'Only the organizer can view the attendee list' });
        }

        const { data: attendees, error } = await supabaseAdmin
            .from('event_rsvps')
            .select(`
                id,
                user_id,
                status,
                created_at,
                checked_in_at,
                check_in_code,
                users:user_id (
                    display_name,
                    username,
                    profile_image
                )
            `)
            .eq('event_id', eventId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching attendees:', error);
            return res.status(500).json({ success: false, error: 'Failed to fetch attendees' });
        }

        res.json({
            status: 'success',
            data: { attendees: attendees || [] },
        });
    } catch (error) {
        console.error('Error in GET /events/:id/attendees:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ============================================
// CHECK IN USER (Organizer Only)
// ============================================
router.patch('/:id/check-in', requireAuth, async (req, res) => {
    try {
        const organizerId = req.user?.id || req.user?.sub;
        const eventId = req.params.id;
        const { user_id, check_in_code } = req.body;

        // Check if event exists and if requester is the creator
        const { data: event } = await supabaseAdmin
            .from('events')
            .select('creator_id, total_check_ins')
            .eq('id', eventId)
            .single();

        if (!event || event.creator_id !== organizerId) {
            return res.status(403).json({ success: false, error: 'Only the organizer can check in attendees' });
        }

        // Find RSVP
        let query = supabaseAdmin
            .from('event_rsvps')
            .select('*')
            .eq('event_id', eventId);

        if (user_id) {
            query = query.eq('user_id', user_id);
        } else if (check_in_code) {
            query = query.eq('check_in_code', check_in_code);
        } else {
            return res.status(400).json({ success: false, error: 'user_id or check_in_code is required' });
        }

        const { data: rsvp, error: rsvpError } = await query.single();

        if (rsvpError || !rsvp) {
            return res.status(404).json({ success: false, error: 'RSVP not found' });
        }

        if (rsvp.checked_in_at) {
            return res.status(400).json({ success: false, error: 'User already checked in' });
        }

        // Update RSVP
        const { error: updateError } = await supabaseAdmin
            .from('event_rsvps')
            .update({
                checked_in_at: new Date().toISOString(),
                checked_in_by: organizerId,
            })
            .eq('id', rsvp.id);

        if (updateError) {
            console.error('Error updating RSVP for check-in:', updateError);
            return res.status(500).json({ success: false, error: 'Failed to complete check-in' });
        }

        // Increment check-in count
        await supabaseAdmin
            .from('events')
            .update({ total_check_ins: (event.total_check_ins || 0) + 1 })
            .eq('id', eventId);

        res.json({
            status: 'success',
            message: 'User successfully checked in',
        });
    } catch (error) {
        console.error('Error in PATCH /events/:id/check-in:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;
