const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

/**
 * GET /api/search
 * Global search across moments, brands, merchants, and hosts.
 * Query Params: q (search term)
 */
router.get('/', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.json({
                success: true,
                results: []
            });
        }

        const { data, error } = await supabase.rpc('fn_global_search', {
            search_term: q.trim()
        });

        if (error) throw error;

        res.json({
            success: true,
            results: data || []
        });

    } catch (error) {
        console.error('Error performing global search:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to perform search'
        });
    }
});

module.exports = router;
