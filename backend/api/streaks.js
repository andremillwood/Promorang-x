/**
 * PROMORANG STREAKS API
 * Daily login streak endpoints
 */

const express = require('express');
const router = express.Router();
const streakService = require('../services/streakService');
const { requireAuth } = require('../middleware/auth');

// Helper functions
const sendSuccess = (res, data = {}, message) => {
    return res.json({ status: 'success', data, message });
};

const sendError = (res, statusCode, message, code) => {
    return res.status(statusCode).json({ status: 'error', message, code });
};

// All routes require auth
router.use(requireAuth);

/**
 * GET /api/streaks/status
 * Get current user's streak status
 */
router.get('/status', async (req, res) => {
    try {
        const status = await streakService.getStreakStatus(req.user.id);
        return sendSuccess(res, status);
    } catch (error) {
        console.error('[Streaks API] Error getting status:', error);
        return sendError(res, 500, 'Failed to get streak status', 'SERVER_ERROR');
    }
});

/**
 * POST /api/streaks/checkin
 * Daily check-in to maintain/increase streak
 */
router.post('/checkin', async (req, res) => {
    try {
        const result = await streakService.checkIn(req.user.id);
        return sendSuccess(res, result, result.message);
    } catch (error) {
        console.error('[Streaks API] Error checking in:', error);
        return sendError(res, 500, 'Failed to check in', 'SERVER_ERROR');
    }
});

/**
 * GET /api/streaks/leaderboard
 * Get top streak holders
 */
router.get('/leaderboard', async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        const leaderboard = await streakService.getStreakLeaderboard(parseInt(limit));
        return sendSuccess(res, { leaderboard });
    } catch (error) {
        console.error('[Streaks API] Error getting leaderboard:', error);
        return sendError(res, 500, 'Failed to get leaderboard', 'SERVER_ERROR');
    }
});

/**
 * GET /api/streaks/rewards
 * Get streak reward tiers
 */
router.get('/rewards', (req, res) => {
    return sendSuccess(res, {
        rewards: streakService.STREAK_REWARDS,
        base_reward: 5,
    });
});

module.exports = router;
