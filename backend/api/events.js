const express = require('express');
const router = express.Router();
const { supabase: supabaseAdmin } = require('../lib/supabase');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const ticketService = require('../services/ticketService');
const dailyLayerService = require('../services/dailyLayerService');
const {
    DEFAULT_GENERATION_HORIZON_DAYS,
    buildOccurrenceEventPayload,
    buildSeriesTemplateFromEvent,
    generateFutureOccurrences,
    normalizeRecurrenceConfig,
    safeDate,
} = require('../services/eventRecurrenceService');

const EVENT_WRITE_FIELDS = [
    'title',
    'description',
    'category',
    'location_name',
    'location_address',
    'location_coordinates',
    'event_date',
    'event_end_date',
    'flyer_url',
    'banner_url',
    'is_virtual',
    'virtual_url',
    'ticketing_url',
    'ticketing_platform',
    'ticket_price_range',
    'max_attendees',
    'is_public',
    'is_featured',
    'status',
    'tags',
    'metadata',
    'total_rewards_pool',
    'total_verified_credits_pool',
];

function requireSupabase(res) {
    if (!supabaseAdmin) {
        res.status(503).json({ success: false, error: 'Database connection is not configured' });
        return false;
    }

    return true;
}

function pickEventWriteFields(payload = {}) {
    return EVENT_WRITE_FIELDS.reduce((acc, key) => {
        if (payload[key] !== undefined) {
            acc[key] = payload[key];
        }
        return acc;
    }, {});
}

function parseNumeric(value, fallback = 0) {
    if (value === undefined || value === null || value === '') return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeEventWritePayload(payload = {}) {
    const eventPayload = pickEventWriteFields(payload);

    if (eventPayload.tags !== undefined) {
        eventPayload.tags = Array.isArray(eventPayload.tags)
            ? [...new Set(eventPayload.tags.map((tag) => String(tag).trim()).filter(Boolean))]
            : [];
    }

    if (eventPayload.total_rewards_pool !== undefined) {
        eventPayload.total_rewards_pool = parseNumeric(eventPayload.total_rewards_pool, 0);
    }

    if (eventPayload.total_verified_credits_pool !== undefined) {
        eventPayload.total_verified_credits_pool = parseNumeric(eventPayload.total_verified_credits_pool, 0);
    }

    if (eventPayload.max_attendees !== undefined) {
        eventPayload.max_attendees = eventPayload.max_attendees === null || eventPayload.max_attendees === ''
            ? null
            : Math.max(1, parseInt(eventPayload.max_attendees, 10));
    }

    if (eventPayload.is_virtual !== undefined) {
        eventPayload.is_virtual = Boolean(eventPayload.is_virtual);
    }

    if (eventPayload.is_public !== undefined) {
        eventPayload.is_public = Boolean(eventPayload.is_public);
    }

    if (eventPayload.is_featured !== undefined) {
        eventPayload.is_featured = Boolean(eventPayload.is_featured);
    }

    return eventPayload;
}

function buildRecurrenceColumns(recurrence) {
    if (!recurrence) {
        return {
            recurrence_enabled: false,
            recurrence_frequency: null,
            recurrence_interval: 1,
            recurrence_by_weekday: [],
            recurrence_day_of_month: null,
            recurrence_timezone: 'UTC',
            recurrence_until: null,
            recurrence_count: null,
            generation_horizon_days: DEFAULT_GENERATION_HORIZON_DAYS,
            series_snapshot: {},
        };
    }

    return {
        recurrence_enabled: true,
        recurrence_frequency: recurrence.frequency,
        recurrence_interval: recurrence.interval,
        recurrence_by_weekday: recurrence.byWeekday || [],
        recurrence_day_of_month: recurrence.dayOfMonth || null,
        recurrence_timezone: recurrence.timezone || 'UTC',
        recurrence_until: recurrence.until || null,
        recurrence_count: recurrence.count || null,
        generation_horizon_days: recurrence.generationHorizonDays || DEFAULT_GENERATION_HORIZON_DAYS,
    };
}

function buildCloneTitle(title) {
    if (!title) return 'Untitled Event Copy';
    return title.toLowerCase().includes('copy') ? title : `${title} Copy`;
}

function shiftClonedEventDate(eventDateValue, eventEndDateValue) {
    const startDate = safeDate(eventDateValue);
    if (!startDate) {
        return {
            event_date: eventDateValue,
            event_end_date: eventEndDateValue || null,
        };
    }

    const endDate = safeDate(eventEndDateValue);
    const duration = endDate ? Math.max(0, endDate.getTime() - startDate.getTime()) : null;
    const now = new Date();
    const shiftedStart = startDate > now
        ? startDate
        : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    return {
        event_date: shiftedStart.toISOString(),
        event_end_date: duration != null ? new Date(shiftedStart.getTime() + duration).toISOString() : null,
    };
}

async function getCreatorProfile(userId) {
    const { data: user } = await supabaseAdmin
        .from('users')
        .select('display_name, username, profile_image')
        .eq('id', userId)
        .single();

    return user || null;
}

async function getOwnedEventOrThrow(eventId, userId) {
    const { data: event, error } = await supabaseAdmin
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

    if (error || !event) {
        const notFound = new Error('Event not found');
        notFound.statusCode = 404;
        throw notFound;
    }

    if (event.creator_id !== userId) {
        const forbidden = new Error('Not authorized to modify this event');
        forbidden.statusCode = 403;
        throw forbidden;
    }

    return event;
}

async function loadSeriesBundle(seriesId) {
    if (!seriesId) return { series: null, occurrences: [] };

    const [{ data: series }, { data: occurrences }] = await Promise.all([
        supabaseAdmin
            .from('event_series')
            .select('*')
            .eq('id', seriesId)
            .single(),
        supabaseAdmin
            .from('events')
            .select('id, title, event_date, event_end_date, status, occurrence_index, location_name, is_virtual')
            .eq('series_id', seriesId)
            .order('event_date', { ascending: true }),
    ]);

    return {
        series: series || null,
        occurrences: occurrences || [],
    };
}

async function createRecurringSeriesForEvent({ creatorId, sourceEventId = null, eventPayload, recurrence }) {
    const templatePayload = buildSeriesTemplateFromEvent(eventPayload, recurrence);

    const { data: series, error } = await supabaseAdmin
        .from('event_series')
        .insert({
            creator_id: creatorId,
            source_event_id: sourceEventId,
            title: eventPayload.title,
            description: eventPayload.description || null,
            timezone: recurrence.timezone || 'UTC',
            frequency: recurrence.frequency,
            recurrence_interval: recurrence.interval,
            recurrence_by_weekday: recurrence.byWeekday || [],
            recurrence_day_of_month: recurrence.dayOfMonth || null,
            recurrence_until: recurrence.until || null,
            recurrence_count: recurrence.count || null,
            generation_horizon_days: recurrence.generationHorizonDays || DEFAULT_GENERATION_HORIZON_DAYS,
            template_payload: templatePayload,
        })
        .select()
        .single();

    if (error) throw error;

    const futureOccurrences = generateFutureOccurrences(
        eventPayload.event_date,
        eventPayload.event_end_date,
        recurrence,
    );

    if (futureOccurrences.length > 0) {
        const futureRows = futureOccurrences.map((occurrence) => buildOccurrenceEventPayload(
            templatePayload,
            occurrence,
            {
                creator_id: creatorId,
                organizer_name: eventPayload.organizer_name,
                organizer_avatar: eventPayload.organizer_avatar,
                total_attendees: 0,
                total_rsvps: 0,
                total_check_ins: 0,
                series_id: series.id,
                source_event_id: sourceEventId,
                clone_source_event_id: sourceEventId,
                status: eventPayload.status || 'draft',
            },
        ));

        const { error: futureError } = await supabaseAdmin
            .from('events')
            .insert(futureRows);

        if (futureError) throw futureError;
    }

    return series;
}

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
        if (!requireSupabase(res)) return;

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

        const { series, occurrences } = await loadSeriesBundle(event.series_id);

        let sourceEvent = null;
        if (event.source_event_id || event.clone_source_event_id) {
            const { data } = await supabaseAdmin
                .from('events')
                .select('id, title, event_date, event_end_date, status')
                .eq('id', event.clone_source_event_id || event.source_event_id)
                .single();
            sourceEvent = data || null;
        }

        res.json({
            status: 'success',
            data: {
                event,
                hasRsvp,
                tasks: tasks || [],
                sponsors: sponsors || [],
                series,
                occurrences,
                sourceEvent,
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
        if (!requireSupabase(res)) return;

        const userId = req.user?.id || req.user?.sub;
        const {
            clone_from_event_id,
            convert_to_series_from_event_id,
            recurrence: recurrenceInput,
        } = req.body || {};

        const sourceEventId = clone_from_event_id || convert_to_series_from_event_id || null;
        const sourceEvent = sourceEventId
            ? await getOwnedEventOrThrow(sourceEventId, userId)
            : null;

        const user = await getCreatorProfile(userId);
        const sourcePayload = sourceEvent ? pickEventWriteFields(sourceEvent) : {};
        const mergedPayload = normalizeEventWritePayload({
            ...sourcePayload,
            ...req.body,
        });

        if (clone_from_event_id && req.body?.title === undefined) {
            mergedPayload.title = buildCloneTitle(sourceEvent.title);
        }

        if (clone_from_event_id && req.body?.event_date === undefined) {
            const shiftedDates = shiftClonedEventDate(sourceEvent.event_date, sourceEvent.event_end_date);
            mergedPayload.event_date = shiftedDates.event_date;
            mergedPayload.event_end_date = shiftedDates.event_end_date;
        }

        const recurrence = normalizeRecurrenceConfig(
            recurrenceInput,
            mergedPayload.event_date,
        );

        const eventData = {
            ...mergedPayload,
            creator_id: userId,
            organizer_name: user?.display_name || user?.username || 'Unknown',
            organizer_avatar: user?.profile_image || null,
            total_attendees: 0,
            total_rsvps: 0,
            total_check_ins: 0,
            total_verified_credits_pool: parseNumeric(mergedPayload.total_verified_credits_pool, 0),
            clone_source_event_id: clone_from_event_id || null,
            source_event_id: sourceEventId,
            occurrence_index: 0,
            ...buildRecurrenceColumns(recurrence),
        };

        const { data: insertedEvent, error } = await supabaseAdmin
            .from('events')
            .insert(eventData)
            .select()
            .single();

        if (error) {
            console.error('Error creating event:', error);
            return res.status(500).json({ success: false, error: 'Failed to create event' });
        }

        let event = insertedEvent;
        let series = null;

        if (recurrence) {
            series = await createRecurringSeriesForEvent({
                creatorId: userId,
                sourceEventId: sourceEventId || insertedEvent.id,
                eventPayload: eventData,
                recurrence,
            });

            const templatePayload = buildSeriesTemplateFromEvent(eventData, recurrence);
            const { data: updatedEvent, error: seriesLinkError } = await supabaseAdmin
                .from('events')
                .update({
                    series_id: series.id,
                    source_event_id: sourceEventId || insertedEvent.id,
                    series_snapshot: templatePayload,
                    ...buildRecurrenceColumns(recurrence),
                })
                .eq('id', insertedEvent.id)
                .select()
                .single();

            if (seriesLinkError) {
                console.error('Error linking event to series:', seriesLinkError);
                return res.status(500).json({ success: false, error: 'Event created but recurring series linkage failed' });
            }

            event = updatedEvent;
        }

        res.status(201).json({
            status: 'success',
            data: { event, series },
            message: 'Event created successfully',
        });
    } catch (error) {
        console.error('Error in POST /events:', error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message || 'Internal server error' });
    }
});

// ============================================
// UPDATE EVENT (requires auth)
// ============================================
router.patch('/:id', requireAuth, async (req, res) => {
    try {
        if (!requireSupabase(res)) return;

        const userId = req.user?.id || req.user?.sub;
        const eventId = req.params.id;

        const existingEvent = await getOwnedEventOrThrow(eventId, userId);
        const recurrence = req.body?.recurrence
            ? normalizeRecurrenceConfig(req.body.recurrence, req.body.event_date || existingEvent.event_date)
            : null;
        const eventUpdates = normalizeEventWritePayload(req.body || {});

        if (recurrence) {
            Object.assign(eventUpdates, buildRecurrenceColumns(recurrence));
            eventUpdates.series_snapshot = buildSeriesTemplateFromEvent(
                { ...existingEvent, ...eventUpdates },
                recurrence,
            );
        }

        const { data: event, error } = await supabaseAdmin
            .from('events')
            .update(eventUpdates)
            .eq('id', eventId)
            .select()
            .single();

        if (error) {
            console.error('Error updating event:', error);
            return res.status(500).json({ success: false, error: 'Failed to update event' });
        }

        if (recurrence && existingEvent.series_id) {
            const templatePayload = buildSeriesTemplateFromEvent(
                { ...existingEvent, ...eventUpdates },
                recurrence,
            );

            await supabaseAdmin
                .from('event_series')
                .update({
                    title: templatePayload.title,
                    description: templatePayload.description,
                    timezone: recurrence.timezone,
                    frequency: recurrence.frequency,
                    recurrence_interval: recurrence.interval,
                    recurrence_by_weekday: recurrence.byWeekday || [],
                    recurrence_day_of_month: recurrence.dayOfMonth || null,
                    recurrence_until: recurrence.until || null,
                    recurrence_count: recurrence.count || null,
                    generation_horizon_days: recurrence.generationHorizonDays || DEFAULT_GENERATION_HORIZON_DAYS,
                    template_payload: templatePayload,
                })
                .eq('id', existingEvent.series_id);
        }

        res.json({
            status: 'success',
            data: { event },
            message: 'Event updated successfully',
        });
    } catch (error) {
        console.error('Error in PATCH /events/:id:', error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message || 'Internal server error' });
    }
});

// ============================================
// CLONE EVENT INTO A NEW DRAFT (requires auth)
// ============================================
router.post('/:id/clone', requireAuth, async (req, res) => {
    try {
        if (!requireSupabase(res)) return;

        const userId = req.user?.id || req.user?.sub;
        const sourceEvent = await getOwnedEventOrThrow(req.params.id, userId);
        const user = await getCreatorProfile(userId);
        const recurrence = req.body?.recurrence
            ? normalizeRecurrenceConfig(req.body.recurrence, sourceEvent.event_date)
            : null;

        const shiftedDates = shiftClonedEventDate(sourceEvent.event_date, sourceEvent.event_end_date);
        const clonePayload = normalizeEventWritePayload({
            ...pickEventWriteFields(sourceEvent),
            ...req.body,
            title: req.body?.title || buildCloneTitle(sourceEvent.title),
            event_date: req.body?.event_date || shiftedDates.event_date,
            event_end_date: req.body?.event_end_date || shiftedDates.event_end_date,
            status: req.body?.status || 'draft',
        });

        const { data: insertedEvent, error } = await supabaseAdmin
            .from('events')
            .insert({
                ...clonePayload,
                creator_id: userId,
                organizer_name: user?.display_name || user?.username || sourceEvent.organizer_name || 'Unknown',
                organizer_avatar: user?.profile_image || sourceEvent.organizer_avatar || null,
                total_attendees: 0,
                total_rsvps: 0,
                total_check_ins: 0,
                source_event_id: sourceEvent.id,
                clone_source_event_id: sourceEvent.id,
                occurrence_index: 0,
                ...buildRecurrenceColumns(recurrence),
            })
            .select()
            .single();

        if (error) {
            console.error('Error cloning event:', error);
            return res.status(500).json({ success: false, error: 'Failed to clone event' });
        }

        let event = insertedEvent;
        let series = null;

        if (recurrence) {
            series = await createRecurringSeriesForEvent({
                creatorId: userId,
                sourceEventId: sourceEvent.id,
                eventPayload: {
                    ...clonePayload,
                    organizer_name: insertedEvent.organizer_name,
                    organizer_avatar: insertedEvent.organizer_avatar,
                },
                recurrence,
            });

            const templatePayload = buildSeriesTemplateFromEvent(
                {
                    ...clonePayload,
                    organizer_name: insertedEvent.organizer_name,
                    organizer_avatar: insertedEvent.organizer_avatar,
                },
                recurrence,
            );

            const { data: updatedEvent } = await supabaseAdmin
                .from('events')
                .update({
                    series_id: series.id,
                    series_snapshot: templatePayload,
                    ...buildRecurrenceColumns(recurrence),
                })
                .eq('id', insertedEvent.id)
                .select()
                .single();

            event = updatedEvent || insertedEvent;
        }

        res.status(201).json({
            status: 'success',
            data: { event, series },
            message: 'Event cloned successfully',
        });
    } catch (error) {
        console.error('Error in POST /events/:id/clone:', error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message || 'Internal server error' });
    }
});

// ============================================
// CONVERT AN EXISTING EVENT INTO A RECURRING SERIES
// ============================================
router.post('/:id/convert-to-recurring', requireAuth, async (req, res) => {
    try {
        if (!requireSupabase(res)) return;

        const userId = req.user?.id || req.user?.sub;
        const event = await getOwnedEventOrThrow(req.params.id, userId);

        if (event.series_id) {
            return res.status(400).json({ success: false, error: 'This event already belongs to a recurring series' });
        }

        const recurrence = normalizeRecurrenceConfig(req.body?.recurrence, event.event_date);
        if (!recurrence) {
            return res.status(400).json({ success: false, error: 'Recurrence settings are required to convert this event' });
        }

        const series = await createRecurringSeriesForEvent({
            creatorId: userId,
            sourceEventId: event.id,
            eventPayload: event,
            recurrence,
        });

        const templatePayload = buildSeriesTemplateFromEvent(event, recurrence);
        const { data: updatedEvent, error } = await supabaseAdmin
            .from('events')
            .update({
                series_id: series.id,
                source_event_id: event.id,
                series_snapshot: templatePayload,
                ...buildRecurrenceColumns(recurrence),
            })
            .eq('id', event.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating event after recurring conversion:', error);
            return res.status(500).json({ success: false, error: 'Recurring series created, but the source event could not be linked' });
        }

        res.json({
            status: 'success',
            data: { event: updatedEvent, series },
            message: 'Event converted to a recurring series',
        });
    } catch (error) {
        console.error('Error in POST /events/:id/convert-to-recurring:', error);
        res.status(error.statusCode || 500).json({ success: false, error: error.message || 'Internal server error' });
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

        // Record verified action for Daily Layer
        dailyLayerService.recordVerifiedAction({
            userId,
            actionType: 'CONTENT_PARTICIPATION',
            verificationMode: 'SYSTEM_EVENT',
            actionLabel: 'event_rsvp',
            referenceType: 'event',
            referenceId: eventId,
            metadata: { eventStatus: event.status }
        }).catch(err => console.warn('[Events] Failed to record verified action:', err));

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

// ============================================
// GET TICKET HOLDERS FOR EVENT (organizer only)
// ============================================
router.get('/:id/ticket-holders', requireAuth, async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user?.id || req.user?.sub;

        // Verify user is the event creator
        const { data: event, error: eventError } = await supabaseAdmin
            .from('events')
            .select('creator_id')
            .eq('id', eventId)
            .single();

        if (eventError || !event) {
            return res.status(404).json({ status: 'error', error: 'Event not found' });
        }

        if (event.creator_id !== userId) {
            return res.status(403).json({ status: 'error', error: 'Not authorized to view ticket holders' });
        }

        const { data: tickets, error } = await supabaseAdmin
            .from('event_tickets')
            .select(`
                *,
                tier:event_ticket_tiers!inner (*),
                user:users (id, display_name, username, profile_image)
            `)
            .eq('tier.event_id', eventId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ status: 'success', data: { tickets: tickets || [] } });
    } catch (error) {
        console.error('Error in GET /events/:id/ticket-holders:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch ticket holders' });
    }
});

// ============================================
// GET TICKET TIERS
// ============================================
router.get('/:id/ticket-tiers', async (req, res) => {
    try {
        const eventId = req.params.id;
        const { data: tiers, error } = await supabaseAdmin
            .from('event_ticket_tiers')
            .select('*')
            .eq('event_id', eventId);

        if (error) throw error;
        res.json({ status: 'success', data: { tiers: tiers || [] } });
    } catch (error) {
        console.error('Error in GET /events/:id/ticket-tiers:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch ticket tiers' });
    }
});

// ============================================
// PURCHASE TICKET (requires auth)
// ============================================
router.post('/:id/tickets/purchase', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.sub;
        const { tier_id } = req.body;

        if (!tier_id) {
            return res.status(400).json({ success: false, error: 'tier_id is required' });
        }

        const ticket = await ticketService.issueTicket(userId, tier_id);
        res.json({ status: 'success', data: { ticket }, message: 'Ticket purchased successfully' });
    } catch (error) {
        console.error('Error in POST /events/:id/tickets/purchase:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to purchase ticket' });
    }
});

// ============================================
// GET SINGLE TICKET BY ID
// ============================================
router.get('/tickets/:ticketId', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.sub;
        const { ticketId } = req.params;

        const { data: ticket, error } = await supabaseAdmin
            .from('event_tickets')
            .select(`
                *,
                tier:event_ticket_tiers (
                    *,
                    event:events (*)
                )
            `)
            .eq('id', ticketId)
            .eq('user_id', userId)
            .single();

        if (error || !ticket) {
            return res.status(404).json({ status: 'error', error: 'Ticket not found' });
        }

        res.json({ status: 'success', data: { ticket } });
    } catch (error) {
        console.error('Error in GET /events/tickets/:ticketId:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch ticket' });
    }
});

// ============================================
// ACTIVATE TICKET / CHECK-IN VIA CODE
// ============================================
router.post('/:id/tickets/activate', requireAuth, async (req, res) => {
    try {
        const organizerId = req.user?.id || req.user?.sub;
        const { activation_code } = req.body;

        if (!activation_code) {
            return res.status(400).json({ success: false, error: 'activation_code is required' });
        }

        const result = await ticketService.activateTicket(activation_code, organizerId);
        if (result.success) {
            res.json({ status: 'success', message: 'Ticket activated and user checked in' });
        } else {
            res.status(400).json({ success: false, error: result.error });
        }
    } catch (error) {
        console.error('Error in POST /events/:id/tickets/activate:', error);
        res.status(500).json({ success: false, error: 'Failed to activate ticket' });
    }
});

module.exports = router;
