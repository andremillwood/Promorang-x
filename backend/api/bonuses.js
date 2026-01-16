/**
 * PROMORANG BONUS API
 * Welcome bonus and claim endpoints
 */

const express = require('express');
const router = express.Router();
const bonusService = require('../services/bonusService');
const { requireAuth } = require('../middleware/auth');

const sendSuccess = (res, data = {}, message) => {
    return res.json({ status: 'success', data, message });
};

const sendError = (res, statusCode, message, code) => {
    return res.status(statusCode).json({ status: 'error', message, code });
};

router.use(requireAuth);

/**
 * GET /api/bonuses/status
 */
router.get('/status', async (req, res) => {
    try {
        const status = await bonusService.getBonusStatus(req.user.id);
        return sendSuccess(res, status);
    } catch (error) {
        return sendError(res, 500, 'Failed to get bonus status');
    }
});

/**
 * POST /api/bonuses/claim-welcome
 */
router.post('/claim-welcome', async (req, res) => {
    try {
        const result = await bonusService.claimWelcomeBonus(req.user.id);
        return sendSuccess(res, result, `Successfully claimed ${result.amount} gems!`);
    } catch (error) {
        return sendError(res, 400, error.message || 'Failed to claim bonus');
    }
});

module.exports = router;
