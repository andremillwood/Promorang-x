/**
 * User Preferences API
 * 
 * Handles saving and retrieving user preferences for personalization.
 * Preferences power content, deal, and drop recommendations.
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { optionalAuth, requireAuth } = require('../middleware/auth');

// Valid interest categories
const VALID_INTERESTS = [
    'food',
    'shopping',
    'entertainment',
    'fitness',
    'beauty',
    'gaming',
    'home',
    'travel'
];

// Valid deal types
const VALID_DEAL_TYPES = [
    'samples',
    'discounts',
    'events',
    'paid'
];

/**
 * GET /api/users/preferences
 * Get current user preferences
 */
router.get('/', requireAuth, async (req, res) => {
    try {
        if (!supabase) {
            return res.status(503).json({
                error: 'Preference source unavailable',
                code: 'PREFERENCE_SOURCE_UNAVAILABLE'
            });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('preferences, preferences_completed_at')
            .eq('id', req.user.id)
            .single();

        if (error) throw error;

        res.json({
            preferences: user?.preferences || {},
            completed: !!user?.preferences_completed_at,
            completed_at: user?.preferences_completed_at
        });
    } catch (error) {
        console.error('Error fetching preferences:', error);
        res.status(500).json({ error: 'Failed to fetch preferences' });
    }
});

/**
 * POST /api/users/preferences
 * Save user preferences and award points if first completion
 */
router.post('/', requireAuth, async (req, res) => {
    try {
        if (!supabase) {
            return res.status(503).json({
                error: 'Preference source unavailable',
                code: 'PREFERENCE_SOURCE_UNAVAILABLE'
            });
        }

        const { interests, location, deal_types } = req.body;

        // Validate interests
        if (interests && Array.isArray(interests)) {
            const invalidInterests = interests.filter(i => !VALID_INTERESTS.includes(i));
            if (invalidInterests.length > 0) {
                return res.status(400).json({
                    error: 'Invalid interests',
                    invalid: invalidInterests,
                    valid: VALID_INTERESTS
                });
            }
        }

        // Validate deal types
        if (deal_types && Array.isArray(deal_types)) {
            const invalidTypes = deal_types.filter(t => !VALID_DEAL_TYPES.includes(t));
            if (invalidTypes.length > 0) {
                return res.status(400).json({
                    error: 'Invalid deal types',
                    invalid: invalidTypes,
                    valid: VALID_DEAL_TYPES
                });
            }
        }

        // Check whether this is the first durable preference completion.
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('preferences_completed_at')
            .eq('id', req.user.id)
            .single();

        if (fetchError) throw fetchError;

        const isFirstCompletion = !existingUser?.preferences_completed_at;
        const now = new Date().toISOString();

        // Build preferences object
        const preferences = {
            interests: interests || [],
            location: location || {},
            deal_types: deal_types || [],
            completed_at: now
        };

        // Update user with preferences
        const updateData = {
            preferences,
            preferences_completed_at: now
        };

        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', req.user.id)
            .select('preferences, preferences_completed_at')
            .single();

        if (updateError) throw updateError;

        res.json({
            success: true,
            preferences: updatedUser.preferences,
            points_awarded: 0,
            message: isFirstCompletion
                ? 'Preferences saved!'
                : 'Preferences updated!'
        });
    } catch (error) {
        console.error('Error saving preferences:', error);
        res.status(500).json({ error: 'Failed to save preferences' });
    }
});

/**
 * GET /api/users/preferences/options
 * Get available preference options (for frontend dropdowns/chips)
 */
router.get('/options', optionalAuth, async (req, res) => {
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
            { id: 'samples', label: 'Free Samples', emoji: '🎁', description: 'Try products at no cost' },
            { id: 'discounts', label: 'Discounts & Coupons', emoji: '💰', description: 'Percentage off deals' },
            { id: 'events', label: 'Exclusive Events', emoji: '🎟️', description: 'VIP access, meetups' },
            { id: 'paid', label: 'Paid Opportunities', emoji: '💵', description: 'Earn money for actions' }
        ],
        points_reward: 0
    });
});

module.exports = router;
