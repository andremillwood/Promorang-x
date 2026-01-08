const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

/**
 * @route   GET /api/search/public
 * @desc    Public global search across drops, products, content, and forecasts
 * @access  Public
 */
router.get('/public', async (req, res) => {
    const { q } = req.query;

    if (!q || q.length < 2) {
        return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    try {
        const searchTerm = `%${q}%`;

        // Parallel searches for better performance
        const [dropsRes, productsRes, contentRes, forecastsRes] = await Promise.all([
            // 1. Search Drops
            supabase
                .from('drops')
                .select('id, title, promo_points_reward, preview_image')
                .ilike('title', searchTerm)
                .limit(5),

            // 2. Search Products
            supabase
                .from('marketplace_products')
                .select('id, name, price, images')
                .ilike('name', searchTerm)
                .limit(5),

            // 3. Search Content (Shares)
            supabase
                .from('content')
                .select('id, title, media_url, engagement_rate')
                .ilike('title', searchTerm)
                .limit(5),

            // 4. Search Forecasts
            supabase
                .from('social_forecasts')
                .select('id, content_title, odds, media_url')
                .ilike('content_title', searchTerm)
                .limit(5)
        ]);

        // Format results for frontend consumption
        const results = [
            ...(dropsRes.data || []).map(d => ({
                id: d.id,
                title: d.title,
                type: 'drop',
                meta: `${d.promo_points_reward} PP`,
                image: d.preview_image,
                link: `/d/${d.id}`
            })),
            ...(productsRes.data || []).map(p => ({
                id: p.id,
                title: p.name,
                type: 'product',
                meta: `$${p.price}`,
                image: p.images?.[0],
                link: `/p/${p.id}`
            })),
            ...(contentRes.data || []).map(c => ({
                id: c.id,
                title: c.title,
                type: 'content',
                meta: `${(c.engagement_rate * 100).toFixed(1)}% Engagement`,
                image: c.media_url,
                link: `/c/${c.id}`
            })),
            ...(forecastsRes.data || []).map(f => ({
                id: f.id,
                title: f.content_title,
                type: 'forecast',
                meta: `${f.odds}x Odds`,
                image: f.media_url,
                link: `/f/${f.id}`
            }))
        ];

        res.json(results);
    } catch (error) {
        console.error('Public search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

module.exports = router;
