/**
 * User Preferences API
 * Personalization settings for content recommendations
 */

const express = require('express');
const router = express.Router();
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { supabase } = require('../lib/supabase');

const VALID_INTERESTS = [
    'food', 'shopping', 'entertainment', 'fitness',
    'beauty', 'gaming', 'home', 'travel'
];

const PREFERENCES_COMPLETION_POINTS = 100;

/**
 * GET /api/preferences
 * Get current user preferences
 */
router.get('/', requireAuth, async (req, res) => {
    try {
        if (!supabase) {
            return res.json({ preferences: {}, completed: false });
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('preferences, preferences_completed_at')
            .eq('id', req.user.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        res.json({
            preferences: data?.preferences || {},
            completed: !!data?.preferences_completed_at,
            completed_at: data?.preferences_completed_at
        });
    } catch (error) {
        console.error('Error fetching preferences:', error);
        res.status(500).json({ error: 'Failed to fetch preferences' });
    }
});

/**
 * POST /api/preferences
 * Save user preferences
 */
router.post('/', requireAuth, async (req, res) => {
    try {
        const { interests, location, deal_types } = req.body;

        // Validate interests
        if (interests && Array.isArray(interests)) {
            const invalid = interests.filter(i => !VALID_INTERESTS.includes(i));
            if (invalid.length > 0) {
                return res.status(400).json({
                    error: 'Invalid interests',
                    invalid,
                    valid: VALID_INTERESTS
                });
            }
        }

        if (!supabase) {
            return res.json({
                success: true,
                preferences: { interests, location, deal_types },
                points_awarded: 0,
                message: 'Preferences saved (mock)'
            });
        }

        const now = new Date().toISOString();
        const preferences = {
            interests: interests || [],
            location: location || {},
            deal_types: deal_types || [],
            completed_at: now
        };

        const { data, error } = await supabase
            .from('profiles')
            .update({
                preferences,
                preferences_completed_at: now
            })
            .eq('id', req.user.id)
            .select('preferences, preferences_completed_at')
            .single();

        if (error) throw error;

        res.json({
            success: true,
            preferences: data.preferences,
            points_awarded: PREFERENCES_COMPLETION_POINTS,
            message: `Preferences saved! +${PREFERENCES_COMPLETION_POINTS} points`
        });
    } catch (error) {
        console.error('Error saving preferences:', error);
        res.status(500).json({ error: 'Failed to save preferences' });
    }
});

/**
 * GET /api/preferences/options
 * Get available preference options for UI
 */
router.get('/options', optionalAuth, (req, res) => {
    res.json({
        interests: [
            { id: 'food', label: 'Food & Dining', emoji: '🍔' },
            { id: 'shopping', label: 'Shopping & Retail', emoji: '🛍️' },
            { id: 'entertainment', label: 'Entertainment', emoji: '🎬' },
            { id: 'fitness', label: 'Fitness & Wellness', emoji: '💪' },
            { id: 'beauty', label: 'Beauty & Style', emoji: '💄' },
            { id: 'gaming', label: 'Gaming & Tech', emoji: '🎮' },
            { id: 'home', label: 'Home & Local', emoji: '🏠' },
            { id: 'travel', label: 'Travel', emoji: '✈️' }
        ],
        deal_types: [
            { id: 'samples', label: 'Free Samples', emoji: '🎁' },
            { id: 'discounts', label: 'Discounts & Coupons', emoji: '💰' },
            { id: 'events', label: 'Exclusive Events', emoji: '🎟️' },
            { id: 'paid', label: 'Paid Opportunities', emoji: '💵' }
        ],
        points_reward: PREFERENCES_COMPLETION_POINTS
    });
});

module.exports = router;
