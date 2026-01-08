const express = require('express');
const router = express.Router();
const relayService = require('../services/relayService');
const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;

// Auth Helper
const getUserFromRequest = (req) => {
    // In dev, fallback to demo user if not authenticated
    if (process.env.NODE_ENV === 'development' && !req.user) {
        return { id: 'demo-user-1', user_tier: 'premium', trust_score: 85, is_verified: true };
    }
    return req.user;
};

// GET /api/relays/check-eligibility?objectType=content&objectId=123
router.get('/check-eligibility', async (req, res) => {
    try {
        const user = getUserFromRequest(req);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const { objectType, objectId } = req.query;
        if (!objectType || !objectId) return res.status(400).json({ error: 'Missing parameters' });

        const result = await relayService.validateRelayEligibility(user.id, objectType, objectId);
        res.json(result);
    } catch (error) {
        console.error('Check eligibility error:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/relays
// Body: { objectType, objectId, parentRelayId, context }
router.post('/', async (req, res) => {
    try {
        const user = getUserFromRequest(req);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const { objectType, objectId, parentRelayId, context } = req.body;

        const relay = await relayService.createRelay(user.id, objectType, objectId, parentRelayId, context);
        res.status(201).json({ success: true, data: relay });
    } catch (error) {
        console.error('Create relay error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

// GET /api/relays/:id/lineage
router.get('/:id/lineage', async (req, res) => {
    try {
        const { id } = req.params;
        const lineage = await relayService.getRelayLineage(id);
        res.json({ success: true, data: lineage });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/relays/:id/engage
router.post('/:id/engage', async (req, res) => {
    try {
        const { id } = req.params;
        const { actionType } = req.body; // 'view', 'click', etc.

        await relayService.trackRelayEngagement(id, actionType);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
