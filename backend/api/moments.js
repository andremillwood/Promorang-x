const express = require('express');
const router = express.Router();
const momentService = require('../services/momentService');
const { requireAuth } = require('../middleware/auth');
const { supabase } = require('../lib/supabase');
const { buildMomentFeed } = require('../services/momentFeedService');

// GET /api/moments/feed - Canonical, time-aware public inventory for every surface
router.get('/feed', async (req, res) => {
    try {
        const { data: moments, error } = await supabase
            .from('moments')
            .select('*')
            .eq('is_active', true)
            .order('starts_at', { ascending: true })
            .limit(500);

        if (error) throw error;

        const momentIds = (moments || []).map((moment) => moment.id);
        const venueIds = [...new Set((moments || []).map((moment) => moment.venue_id).filter(Boolean))];
        const sceneIdsOnMoment = [...new Set((moments || []).map((moment) => moment.scene_id).filter(Boolean))];

        const [{ data: venues }, { data: sceneLinks }] = await Promise.all([
            venueIds.length
                ? supabase.from('view_public_venue_directory').select('id,slug,name').in('id', venueIds)
                : Promise.resolve({ data: [] }),
            momentIds.length
                ? supabase.from('moment_scene_links').select('moment_id,scene_id').in('moment_id', momentIds)
                : Promise.resolve({ data: [] }),
        ]);

        const linkedSceneIds = (sceneLinks || []).map((link) => link.scene_id).filter(Boolean);
        const allSceneIds = [...new Set([...sceneIdsOnMoment, ...linkedSceneIds])];
        const { data: scenes } = allSceneIds.length
            ? await supabase.from('scenes').select('id,slug,title').in('id', allSceneIds)
            : { data: [] };

        const venueById = Object.fromEntries((venues || []).map((venue) => [venue.id, venue]));
        const sceneById = Object.fromEntries((scenes || []).map((scene) => [scene.id, scene]));
        const linkedSceneByMoment = {};
        (sceneLinks || []).forEach((link) => {
            if (!linkedSceneByMoment[link.moment_id] && link.scene_id) linkedSceneByMoment[link.moment_id] = link.scene_id;
        });

        const enrichedMoments = (moments || []).map((moment) => {
            const venue = moment.venue_id ? venueById[moment.venue_id] : null;
            const sceneId = moment.scene_id || linkedSceneByMoment[moment.id] || null;
            const scene = sceneId ? sceneById[sceneId] : null;
            return {
                ...moment,
                venue_name: moment.venue_name || venue?.name || null,
                venue_slug: venue?.slug || null,
                scene_id: sceneId,
                scene_slug: scene?.slug || null,
                scene_title: scene?.title || null,
            };
        });

        const brandNamesByMoment = {};
        if (momentIds.length > 0) {
            const { data: associations } = await supabase
                .from('view_moment_brand_associations')
                .select('moment_id,brand_id')
                .in('moment_id', momentIds);

            const brandIds = [...new Set((associations || []).map((association) => association.brand_id).filter(Boolean))];
            const { data: brands } = brandIds.length
                ? await supabase.from('organizations').select('id,name').in('id', brandIds)
                : { data: [] };
            const brandNameById = Object.fromEntries((brands || []).map((brand) => [brand.id, brand.name]));

            (associations || []).forEach((association) => {
                const brandName = brandNameById[association.brand_id];
                if (!brandName) return;
                brandNamesByMoment[association.moment_id] ||= [];
                if (!brandNamesByMoment[association.moment_id].includes(brandName)) {
                    brandNamesByMoment[association.moment_id].push(brandName);
                }
            });
        }

        const feed = buildMomentFeed(enrichedMoments, brandNamesByMoment);
        res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
        res.json({ success: true, data: feed });
    } catch (err) {
        console.error('Canonical moment feed error:', err);
        res.status(500).json({ success: false, error: 'Failed to load current moment inventory' });
    }
});

// GET /api/moments/me/history - User's verified moment history
router.get('/me/history', requireAuth, async (req, res) => {
    try {
        const history = await momentService.getUserMomentHistory(req.user.id);
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/moments/:id - Get a specific moment by UUID, slug, or title search
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        let moment = null;

        if (UUID_PATTERN.test(id)) {
            const { data } = await supabase.from('moments').select('*').eq('id', id).maybeSingle();
            moment = data;
        } else {
            const { data: slugData } = await supabase.from('moments').select('*').eq('slug', id).maybeSingle();
            if (slugData) {
                moment = slugData;
            } else {
                const { data: titleData } = await supabase.from('moments').select('*').ilike('title', `%${id.replace(/-/g, ' ')}%`).maybeSingle();
                moment = titleData;
            }
        }

        if (!moment) {
            return res.status(404).json({ error: 'Moment not found' });
        }

        res.json(moment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/moments - List active moments
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('moments')
            .select('*')
            .order('starts_at', { ascending: true });

        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/moments - Create (Organizer Only)
router.post('/', requireAuth, async (req, res) => {
    try {
        // Basic role check
        // if (req.user.user_type !== 'advertiser') ...

        const moment = await momentService.createMoment(req.user.id, req.body);
        res.json(moment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/moments/:id/close - Seal the moment
router.post('/:id/close', requireAuth, async (req, res) => {
    try {
        const result = await momentService.closeMoment(req.params.id, req.user.id);
        res.json(result);
    } catch (err) {
        console.error('Close Moment Error:', err);
        res.status(403).json({ error: err.message });
    }
});

// POST /api/moments/:id/check-in - Verify and Check-in User
router.post('/:id/check-in', requireAuth, async (req, res) => {
    try {
        const { ticket_id } = req.body;
        // ticket_id is the entitlement ID or a special token
        if (!ticket_id) return res.status(400).json({ error: 'Missing ticket_id' });

        const result = await momentService.checkInUser(ticket_id, req.user.id);
        res.json(result);
    } catch (err) {
        console.error('Check-in Error:', err);
        res.status(400).json({ error: err.message });
    }
});

// GET /api/moments/managed/list - List moments created by the authenticated user
router.get('/managed/list', requireAuth, async (req, res) => {
    try {
        // Use Supabase directly here for listing
        // Note: Joining entitlements count is complex in Supabase JS without rpc or view
        // We'll just fetch moments first
        const { data: moments, error } = await supabase
            .from('moments')
            .select('*') // rsvps_count would need a view or separate query
            .eq('organizer_id', req.user.id)
            .order('starts_at', { ascending: false });

        if (error) throw error;

        // Basic stats
        const activeMoments = moments ? moments.filter(m => m.status === 'live' || m.status === 'scheduled').length : 0;

        res.json({
            moments: moments || [],
            stats: {
                activeMoments,
                totalParticipants: 0, // Placeholder
                avgReliability: 98
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Check-in / Join a Moment
router.post('/check-in', async (req, res) => {
    try {
        const { ticketId, code } = req.body;
        // Support Ticket ID or Raw Code (if we implement code lookup)
        // For now, scan sends ticketId (from QR)

        // Mock user for now if middleware not fully rigorous, but assuming req.user.id
        const userId = req.user.id;

        await momentService.checkInUser(ticketId, userId);
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
