const express = require('express');
const router = express.Router();
const soundService = require('../services/soundService');
const { requireAuth } = require('../middleware/auth');

// ============================================
// LIST SOUNDS (public)
// ============================================
router.get('/', async (req, res) => {
    try {
        const { limit = 20, verified = 'false' } = req.query;
        const sounds = await soundService.listSounds({
            limit: parseInt(limit),
            verifiedOnly: verified === 'true'
        });
        res.json({ status: 'success', data: { sounds } });
    } catch (error) {
        console.error('Error in GET /sounds:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch sounds' });
    }
});

// ============================================
// GET SINGLE SOUND
// ============================================
router.get('/:id', async (req, res) => {
    try {
        const sound = await soundService.getSound(req.params.id);
        res.json({ status: 'success', data: { sound } });
    } catch (error) {
        console.error('Error in GET /sounds/:id:', error);
        res.status(500).json({ success: false, error: 'Sound not found' });
    }
});

// ============================================
// REGISTER SOUND (requires auth)
// ============================================
router.post('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.sub;
        const { title, audio_url, waveform_data, duration } = req.body;

        if (!title || !audio_url) {
            return res.status(400).json({ success: false, error: 'Title and audio URL are required' });
        }

        const sound = await soundService.registerSound({
            creatorId: userId,
            title,
            audioUrl: audio_url,
            waveformData: waveform_data,
            duration
        });

        res.status(201).json({
            status: 'success',
            data: { sound },
            message: 'Sound registered successfully'
        });
    } catch (error) {
        console.error('Error in POST /sounds:', error);
        res.status(500).json({ success: false, error: 'Failed to register sound' });
    }
});

module.exports = router;
