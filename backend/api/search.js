const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const vectorService = require('../services/vectorService');

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

/**
 * GET /api/search/semantic
 * Semantic search using vector similarity across all content types.
 * Query Params:
 *   - q (required): Natural language query
 *   - type (optional): Filter to 'moment', 'campaign', or 'organization'
 *   - topK (optional): Max results per type (default: 5)
 */
router.get('/semantic', async (req, res) => {
    try {
        const { q, type, topK = 5 } = req.query;

        if (!q || q.trim().length < 2) {
            return res.json({
                success: true,
                results: []
            });
        }

        const query = q.trim();
        const limit = parseInt(topK);

        // Determine which indexes to search
        const indexMap = {
            moment: 'moments',
            campaign: 'campaigns',
            organization: 'organizations'
        };

        const searchTargets = type && indexMap[type]
            ? [{ type, index: indexMap[type] }]
            : [
                { type: 'moment', index: 'moments' },
                { type: 'campaign', index: 'campaigns' },
                { type: 'organization', index: 'organizations' }
            ];

        // Search all target indexes in parallel
        const searchPromises = searchTargets.map(async ({ type: resultType, index }) => {
            const results = await vectorService.search(index, query, limit);
            return results.map(r => ({
                type: resultType,
                id: r.id,
                title: r.metadata.name || r.metadata.title || 'Untitled',
                description: r.metadata.description || r.text,
                score: r.score,
                metadata: r.metadata,
                search_method: 'vector'
            }));
        });

        const allResults = (await Promise.all(searchPromises)).flat();

        // Sort merged results by score descending
        allResults.sort((a, b) => b.score - a.score);

        res.json({
            success: true,
            results: allResults.slice(0, limit * searchTargets.length),
            stats: vectorService.getStats()
        });

    } catch (error) {
        console.error('Error performing semantic search:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to perform semantic search'
        });
    }
});

module.exports = router;

