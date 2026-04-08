/**
 * ManyChat Integration API
 * Syncs Instagram follower data and awards points
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

const MANYCHAT_SECRET = process.env.MANYCHAT_SECRET;
const COOLDOWN_DAYS = parseInt(process.env.MANYCHAT_COOLDOWN_DAYS || '30', 10);
const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

/**
 * GET /api/manychat/followers
 * Status check endpoint
 */
router.get('/followers', (req, res) => {
    res.json({
        success: true,
        message: 'ManyChat follower webhook endpoint is active',
        usage: 'POST to this endpoint with Authorization: Bearer <MANYCHAT_SECRET>',
        required_fields: ['instagram', 'followers']
    });
});

/**
 * POST /api/manychat/followers
 * Webhook for ManyChat to sync follower counts
 */
router.post('/followers', async (req, res) => {
    try {
        // Verify ManyChat secret
        const authHeader = (req.headers.authorization || '').trim();
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const token = authHeader.substring(7);
        if (!MANYCHAT_SECRET || token !== MANYCHAT_SECRET) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        if (!supabase) {
            return res.status(500).json({ error: 'Database not configured' });
        }

        const { name, email, instagram, followers } = req.body || {};

        // Normalize inputs
        const normalizedInstagram = (instagram || '').trim().replace(/^@/, '').toLowerCase();
        const normalizedEmail = email ? email.trim().toLowerCase() : null;
        const followerCount = Number(followers);

        if (!normalizedInstagram || isNaN(followerCount)) {
            return res.status(400).json({ error: 'Missing instagram or follower count' });
        }

        // Calculate points (10 points per follower)
        const followerPoints = Math.max(0, followerCount * 10);

        // Find user by email or instagram username
        let user = null;

        if (normalizedEmail) {
            const { data } = await supabase
                .from('profiles')
                .select('id, full_name')
                .ilike('email', normalizedEmail)
                .limit(1)
                .single();
            user = data;
        }

        if (!user) {
            const { data } = await supabase
                .from('profiles')
                .select('id, full_name')
                .ilike('instagram_username', normalizedInstagram)
                .limit(1)
                .single();
            user = data;
        }

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'No user found with that email or Instagram username'
            });
        }

        // Check cooldown (last sync within 30 days)
        const { data: lastSync } = await supabase
            .from('manychat_syncs')
            .select('synced_at')
            .eq('user_id', user.id)
            .order('synced_at', { ascending: false })
            .limit(1)
            .single();

        if (lastSync) {
            const timeSince = Date.now() - new Date(lastSync.synced_at).getTime();
            if (timeSince < COOLDOWN_MS) {
                const nextSync = new Date(new Date(lastSync.synced_at).getTime() + COOLDOWN_MS);
                return res.status(429).json({
                    error: 'Too many syncs',
                    message: `Followers can only be synced once every ${COOLDOWN_DAYS} days`,
                    next_available_sync_at: nextSync.toISOString()
                });
            }
        }

        // Award points (would need user_brand_points or similar table)
        // For now, just log the sync
        await supabase.from('manychat_syncs').insert({
            user_id: user.id,
            follower_count: followerCount,
            points_awarded: followerPoints,
            instagram: normalizedInstagram,
            email: normalizedEmail,
            synced_at: new Date().toISOString()
        });

        res.json({
            success: true,
            user_id: user.id,
            follower_count: followerCount,
            points_awarded: followerPoints,
            cooldown_days: COOLDOWN_DAYS
        });
    } catch (error) {
        console.error('ManyChat webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
