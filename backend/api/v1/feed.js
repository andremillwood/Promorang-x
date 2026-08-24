const express = require('express');
const router = express.Router();
const { requireApiKeyOrAuth } = require('../../middleware/apiKeyAuth');
const { supabase } = require('../../lib/supabase');

/**
 * GET /api/v1/feed
 * Query promotions, active drops, and live moments for agents and third-party devs.
 */
router.get('/', requireApiKeyOrAuth(['feed:read']), async (req, res) => {
  try {
    const { category, limit = 20, offset = 0, lat, lng, radiusKm } = req.query;
    const fetchLimit = Math.min(Number(limit) || 20, 50);

    if (!supabase) {
      // Mock data for headless testing
      return res.json({
        success: true,
        data: {
          items: [
            {
              id: 'deal-001',
              title: '20% Off Nitro Cold Brew at Devon House Cafe',
              type: 'coupon',
              category: 'dining',
              merchant: { id: 'm1', name: 'Devon House Cafe' },
              rewardGems: 50,
              remaining: 25,
              expiresAt: new Date(Date.now() + 86400000 * 3).toISOString()
            },
            {
              id: 'drop-002',
              title: 'Kingston Food Festival VIP Pass Drop',
              type: 'drop',
              category: 'events',
              merchant: { id: 'm2', name: 'Kingston Foodies' },
              rewardGems: 150,
              remaining: 8,
              expiresAt: new Date(Date.now() + 86400000 * 7).toISOString()
            }
          ],
          total: 2,
          page: 1
        }
      });
    }

    let query = supabase
      .from('drops')
      .select('id, title, description, drop_type, difficulty, max_participants, current_participants, gem_reward_base, created_at')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + fetchLimit - 1);

    const { data: drops, count, error } = await query;
    if (error) throw error;

    return res.json({
      success: true,
      data: {
        items: drops || [],
        total: count || (drops ? drops.length : 0),
        limit: fetchLimit,
        offset: Number(offset)
      }
    });
  } catch (err) {
    console.error('[API v1 /feed] Error:', err);
    return res.status(500).json({ success: false, error: err.message, code: 'FEED_FETCH_FAILED' });
  }
});

module.exports = router;
