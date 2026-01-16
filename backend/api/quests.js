/**
 * PROMORANG QUESTS API
 * Daily and weekly quest endpoints
 */

const express = require('express');
const router = express.Router();
const questService = require('../services/questService');
const { requireAuth } = require('../middleware/auth');

const sendSuccess = (res, data = {}, message) => {
    return res.json({ status: 'success', data, message });
};

const sendError = (res, statusCode, message, code) => {
    return res.status(statusCode).json({ status: 'error', message, code });
};

router.use(requireAuth);

/**
 * GET /api/quests/active
 * Get all active quests for user
 */
router.get('/active', async (req, res) => {
    try {
        const quests = await questService.getActiveQuests(req.user.id);
        return sendSuccess(res, quests);
    } catch (error) {
        console.error('[Quests API] Error getting quests:', error);
        return sendError(res, 500, 'Failed to get quests', 'SERVER_ERROR');
    }
});

/**
 * POST /api/quests/:questId/claim
 * Claim reward for completed quest
 */
router.post('/:questId/claim', async (req, res) => {
    try {
        const result = await questService.claimReward(req.user.id, req.params.questId);
        return sendSuccess(res, result, result.message);
    } catch (error) {
        console.error('[Quests API] Error claiming reward:', error);
        return sendError(res, 500, error.message || 'Failed to claim reward', 'SERVER_ERROR');
    }
});

/**
 * GET /api/quests/definitions
 * Get quest definitions
 */
router.get('/definitions', (req, res) => {
    return sendSuccess(res, { quests: questService.QUEST_DEFINITIONS });
});

module.exports = router;
