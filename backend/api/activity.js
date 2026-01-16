/**
 * PROMORANG ACTIVITY API
 * Site-wide activity endpoints for social proof
 */

const express = require('express');
const router = express.Router();
const activityService = require('../services/activityService');

const sendSuccess = (res, data = {}, message) => {
    return res.json({ status: 'success', data, message });
};

const sendError = (res, statusCode, message, code) => {
    return res.status(statusCode).json({ status: 'error', message, code });
};

/**
 * GET /api/activity/recent
 * Public endpoint for site-wide activity toasts
 */
router.get('/recent', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const activity = await activityService.getRecentActivity(parseInt(limit));
        return sendSuccess(res, { activity });
    } catch (error) {
        console.error('[Activity API] Error getting activity:', error);
        return sendError(res, 500, 'Failed to get activity', 'SERVER_ERROR');
    }
});

module.exports = router;
