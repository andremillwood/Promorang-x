const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const vectorService = require('../services/vectorService');

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

/**
 * GET /api/matchmaking/semantic-suggestions
 * Uses vector similarity to find semantically relevant partners.
 * Query Params:
 *   - query (required): Free-text description of desired partner
 *   - role (optional): Filter by organization type (brand, merchant, host)
 *   - topK (optional): Number of results (default: 5)
 */
router.get('/semantic-suggestions', async (req, res) => {
    try {
        const { query, role, topK = 5 } = req.query;

        if (!query || query.trim().length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Query parameter is required (min 2 characters)'
            });
        }

        // Build metadata filters
        const filters = {};
        if (role) filters.type = role;

        const results = await vectorService.search(
            'organizations',
            query.trim(),
            parseInt(topK),
            filters
        );

        // Transform results to match the existing suggestions format
        const suggestions = results.map(r => ({
            id: r.id,
            name: r.metadata.name || 'Unknown',
            subtitle: r.metadata.type || '',
            description: r.metadata.description || r.text,
            logo_url: r.metadata.logo_url || null,
            match_reason: `Semantic match (${Math.round(r.score * 100)}% relevance)`,
            compatibility_score: r.score,
            search_method: 'vector'
        }));

        res.json({
            success: true,
            suggestions,
            stats: vectorService.getStats()
        });

    } catch (error) {
        console.error('Error in semantic matchmaking:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch semantic suggestions'
        });
    }
});

module.exports = router;

