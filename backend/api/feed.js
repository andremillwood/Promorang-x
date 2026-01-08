const express = require('express');
const router = express.Router();
const supabaseAdmin = require('../lib/supabase'); // Using admin client for broader access
const { requireAuth } = require('../middleware/auth');

// ============================================
// HELPER: SCORING ALGORITHM
// ============================================
const calculateScore = (item, userPrefs, interactions) => {
    let score = 0;
    const now = new Date();

    // Defensive check for date fields across different item types
    const dateValue = item.posted_at || item.created_at || item.start_date || item.assigned_at;
    const itemDate = dateValue ? new Date(dateValue) : now;

    // Handle invalid dates
    if (isNaN(itemDate.getTime())) {
        return 0; // Fallback for corrupted data
    }

    // 1. RECENCY (Decay)
    // Items lose 1 point every 24 hours
    const daysOld = (now - itemDate) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 100 - (daysOld * 5)); // Freshness boost up to 100

    // 2. INTEREST MATCHING
    // If item tags match user interests
    if (userPrefs?.interests && item.tags) {
        const matches = userPrefs.interests.filter(i => item.tags.includes(i));
        score += matches.length * 20; // +20 per matched interest
    }

    // 3. GEOGRAPHY (Simple filter/boost)
    // If exact city match +50
    if (userPrefs?.location_data?.city && item.location_city) {
        if (userPrefs.location_data.city.toLowerCase() === item.location_city.toLowerCase()) {
            score += 50;
        }
    }

    // 4. PREVIOUS INTERACTIONS (Affinity)
    // If user has interacted with this creator before
    // (Simplification: assuming item has creator_id)
    if (item.creator_id) {
        // Find interactions with this creator's other items
        // This is expensive to calculate real-time without aggregation, 
        // so we'll skip complex creator affinity for v1 and just look at item type affinity
        // e.g., if user clicks a lot of 'events', boost 'events'
    }

    return score;
};

// ============================================
// GET FOR YOU FEED
// ============================================
router.get('/for-you', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { limit = 20, offset = 0 } = req.query;

        // 1. Fetch User Preferences
        let userPrefs = {};
        if (userId) {
            const { data: prefs } = await supabaseAdmin
                .from('user_preferences')
                .select('*')
                .eq('user_id', userId)
                .single();
            userPrefs = prefs || {};
        }

        // 2. Fetch Candidates (Parallel)
        const [events, drops, content, forecasts, coupons, relays] = await Promise.all([
            supabaseAdmin.from('events').select('*').eq('status', 'published').order('created_at', { ascending: false }).limit(30),
            supabaseAdmin.from('drops').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(30),
            supabaseAdmin.from('content_items').select('*').eq('status', 'published').order('posted_at', { ascending: false }).limit(30),
            supabaseAdmin.from('social_forecasts').select('*, creator:creator_id(display_name, avatar_url)').eq('status', 'active').order('created_at', { ascending: false }).limit(20),
            supabaseAdmin.from('advertiser_coupon_assignments').select('*, advertiser_coupons(title, description, reward_type, value, value_unit, end_date)').eq('user_id', userId).eq('is_redeemed', false).order('assigned_at', { ascending: false }).limit(10),
            supabaseAdmin.from('relays').select('*, relayer:relayer_user_id(username, avatar_url), content:object_id(*)').eq('object_type', 'content').order('created_at', { ascending: false }).limit(20)
        ]);

        // 3. Normalize & Score
        let feedItems = [];

        if (events.data) {
            feedItems.push(...events.data.map(i => ({ ...i, type: 'event', score: calculateScore(i, userPrefs) })));
        }
        if (drops.data) {
            feedItems.push(...drops.data.map(i => ({ ...i, type: 'drop', score: calculateScore(i, userPrefs) })));
        }
        if (content.data) {
            feedItems.push(...content.data.map(i => ({ ...i, type: 'content', score: calculateScore(i, userPrefs) })));
        }
        if (forecasts.data) {
            feedItems.push(...forecasts.data.map(i => ({
                ...i,
                type: 'prediction',
                creator_name: i.creator?.display_name || 'Anonymous Creator',
                creator_avatar: i.creator?.avatar_url,
                score: calculateScore(i, userPrefs) + 10
            }))); // Boost predictions slightly
        }
        if (coupons.data) {
            feedItems.push(...coupons.data.map(i => ({
                ...i,
                type: 'coupon',
                title: i.advertiser_coupons?.title || 'Exclusive Reward',
                description: i.advertiser_coupons?.description,
                reward_type: i.advertiser_coupons?.reward_type,
                value: i.advertiser_coupons?.value,
                value_unit: i.advertiser_coupons?.value_unit,
                expires_at: i.advertiser_coupons?.end_date,
                earned_at: i.assigned_at,
                score: calculateScore(i, userPrefs) + 20
            }))); // High boost for coupons
        }
        if (relays.data) {
            feedItems.push(...relays.data.map(i => ({ ...i, type: 'movement', score: calculateScore(i, userPrefs) })));
        }

        // 4. Sort & Paginate
        feedItems.sort((a, b) => b.score - a.score);
        const pagedItems = feedItems.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

        res.json({
            status: 'success',
            data: {
                feed: pagedItems,
                meta: {
                    user_interests: userPrefs.interests || []
                }
            }
        });

    } catch (error) {
        console.error('Error fetching feed:', error);
        res.status(500).json({ success: false, error: 'Failed to generate feed' });
    }
});

// ============================================
// LOG INTERACTION
// ============================================
router.post('/interaction', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { item_type, item_id, interaction_type, meta_data } = req.body;

        if (!item_type || !item_id || !interaction_type) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const { error } = await supabaseAdmin
            .from('user_interactions')
            .insert({
                user_id: userId,
                item_type,
                item_id,
                interaction_type,
                meta_data: meta_data || {},
                weight: interaction_type === 'click' ? 5 : 1 // Simple weighting
            });

        if (error) {
            console.error('Error logging interaction:', error);
            // Don't block client on logging error, just log it
            return res.status(200).json({ success: false, warning: 'Failed to save interaction' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error in POST /interaction:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ============================================
// MANAGE PREFERENCES
// ============================================
router.get('/preferences', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { data, error } = await supabaseAdmin
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
            console.error('Error fetching preferences:', error);
            return res.status(500).json({ success: false, error: 'Failed to fetch preferences' });
        }

        res.json({
            status: 'success',
            data: data || { interests: [], location_data: {}, demographics: {} }
        });
    } catch (error) {
        console.error('Error in GET /preferences:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

router.put('/preferences', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { interests, location_data, demographics } = req.body;

        // Upsert
        const { data, error } = await supabaseAdmin
            .from('user_preferences')
            .upsert({
                user_id: userId,
                interests,
                location_data,
                demographics,
                updated_at: new Date()
            })
            .select()
            .single();

        if (error) {
            console.error('Error updating preferences:', error);
            return res.status(500).json({ success: false, error: 'Failed to update preferences' });
        }

        res.json({
            status: 'success',
            data,
            message: 'Preferences updated'
        });
    } catch (error) {
        console.error('Error in PUT /preferences:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;
