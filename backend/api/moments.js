const express = require('express');
const router = express.Router();
const momentService = require('../services/momentService');
const { requireAuth } = require('../middleware/auth');
const { supabase } = require('../lib/supabase');

// GET /api/moments/me/history - User's verified moment history
router.get('/me/history', requireAuth, async (req, res) => {
    try {
        const history = await momentService.getUserMomentHistory(req.user.id);
        res.json(history);
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
            .eq('status', 'live')
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
