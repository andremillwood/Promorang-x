/**
 * Last Night API
 * 
 * Provides yesterday's finalized outcomes.
 * This turns activity into memory.
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { getLastNight, recordDailyOutcome } = require('../services/lastNightService');

/**
 * GET /api/last-night
 * Returns yesterday's outcome
 */
router.get('/', optionalAuth, async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const data = await getLastNight(userId);

        res.json(data);
    } catch (error) {
        console.error('[LastNight API] Error:', error);
        res.status(500).json({ error: 'Failed to fetch last night data' });
    }
});

/**
 * POST /api/last-night/lock
 * Manually trigger day lock (for testing / admin)
 * In production, this would be called by a cron job at midnight
 */
router.post('/lock', authenticateToken, async (req, res) => {
    try {
        // TODO: Add admin check
        const result = await recordDailyOutcome();
        res.json(result);
    } catch (error) {
        console.error('[LastNight API] Lock error:', error);
        res.status(500).json({ error: 'Failed to lock day' });
    }
});

module.exports = router;
