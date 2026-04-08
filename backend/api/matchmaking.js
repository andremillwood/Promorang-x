const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

/**
 * GET /api/matchmaking/suggestions
 * Returns suggested partners based on category and location.
 * Query Params: role, category, location
 */
router.get('/suggestions', async (req, res) => {
    try {
        const { role, category, location, limit = 5 } = req.query;

        if (!role) {
            return res.status(400).json({
                success: false,
                error: 'Target role is required'
            });
        }

        const { data, error } = await supabase.rpc('fn_get_matchmaking_suggestions', {
            target_role: role,
            target_category: category || null,
            target_location: location || null,
            limit_count: parseInt(limit)
        });

        if (error) throw error;

        res.json({
            success: true,
            suggestions: data || []
        });

    } catch (error) {
        console.error('Error in matchmaking suggestions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch suggestions'
        });
    }
});

module.exports = router;
