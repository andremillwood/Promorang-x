/**
 * PROMORANG ACHIEVEMENTS API
 * User milestone and sharing endpoints
 */

const express = require('express');
const router = express.Router();
const achievementService = require('../services/achievementService');
const { requireAuth } = require('../middleware/auth');

const sendSuccess = (res, data = {}, message) => {
    return res.json({ status: 'success', data, message });
};

const sendError = (res, statusCode, message, code) => {
    return res.status(statusCode).json({ status: 'error', message, code });
};

// Most routes require auth
router.get('/', requireAuth, async (req, res) => {
    try {
        const achievements = await achievementService.getUserAchievements(req.user.id);
        return res.json(achievements); // Compatibility with existing frontend expectation
    } catch (error) {
        return sendError(res, 500, 'Failed to fetch achievements');
    }
});

/**
 * GET /api/achievements/share/:userId/:badgeKey
 * Public endpoint for OG image preview or share page
 */
router.get('/share/:userId/:badgeKey', async (req, res) => {
    const { userId, badgeKey } = req.params;
    const achievement = achievementService.ACHIEVEMENTS.find(a => a.key === badgeKey);

    if (!achievement) return res.status(404).send('Achievement not found');

    // For real OG tags, this should return an HTML page
    return res.send(`
    <html>
      <head>
        <title>Promorang Achievement Unlocked!</title>
        <meta property="og:title" content="I just unlocked ${achievement.name} on Promorang!" />
        <meta property="og:description" content="${achievement.description}" />
        <meta property="og:image" content="https://promorang.co/api/achievements/card/${badgeKey}.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </head>
      <body>
        <h1>Achievement Unlocked: ${achievement.name}</h1>
        <p>${achievement.description}</p>
        <button onclick="window.location.href='https://promorang.co/auth?ref=${userId}'">Join me on Promorang</button>
      </body>
    </html>
  `);
});

module.exports = router;
