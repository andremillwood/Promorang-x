/**
 * PROMORANG PLATFORM DROPS API
 * 
 * Endpoints for buffer drops, community drops, and seasonal pools.
 * These provide supply stability regardless of advertiser activity.
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const decodeToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Auth middleware
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = decodeToken(token);
            if (decoded) {
                req.user = {
                    ...decoded,
                    id: decoded.userId || decoded.id || decoded.sub
                };
                return next();
            }
        }

        if (process.env.NODE_ENV === 'development') {
            req.user = {
                id: 'demo-creator-id',
                email: 'creator@demo.com',
                username: 'demo_creator',
                display_name: 'Demo Creator',
                user_type: 'creator'
            };
            return next();
        }

        return res.status(401).json({ success: false, error: 'Unauthorized' });
    } catch (error) {
        res.status(401).json({ success: false, error: 'Authentication failed' });
    }
};

// Apply auth to all routes
router.use(authMiddleware);

/**
 * GET /api/platform-drops
 * Get available buffer and platform drops
 */
router.get('/', async (req, res) => {
    try {
        const bufferDropService = require('../services/bufferDropService');
        const drops = await bufferDropService.getActiveBufferDrops();

        res.json({
            success: true,
            drops,
            count: drops.length
        });
    } catch (error) {
        console.error('Error fetching platform drops:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch platform drops' });
    }
});

/**
 * GET /api/platform-drops/availability
 * Get pool availability status
 */
router.get('/availability', async (req, res) => {
    try {
        const bufferDropService = require('../services/bufferDropService');
        const availability = await bufferDropService.getPoolAvailability();

        res.json({
            success: true,
            ...availability
        });
    } catch (error) {
        console.error('Error fetching pool availability:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch pool availability' });
    }
});

/**
 * GET /api/platform-drops/buffer-pool
 * Get buffer pool status (admin or analytics)
 */
router.get('/buffer-pool', async (req, res) => {
    try {
        const bufferDropService = require('../services/bufferDropService');
        const pool = await bufferDropService.getBufferPool();

        if (!pool) {
            return res.status(404).json({ success: false, error: 'Buffer pool not found' });
        }

        res.json({
            success: true,
            pool
        });
    } catch (error) {
        console.error('Error fetching buffer pool:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch buffer pool' });
    }
});

/**
 * POST /api/platform-drops/create-daily
 * Create daily buffer drops (for cron job or admin)
 * Should be called by a scheduled job, not usually by users
 */
router.post('/create-daily', async (req, res) => {
    try {
        // Check if user is admin (simplified check)
        if (req.user?.user_type !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin access required' });
        }

        const bufferDropService = require('../services/bufferDropService');
        const result = await bufferDropService.createDailyBufferDrops();

        res.json(result);
    } catch (error) {
        console.error('Error creating daily buffer drops:', error);
        res.status(500).json({ success: false, error: 'Failed to create buffer drops' });
    }
});

/**
 * POST /api/platform-drops/fund-buffer
 * Add funds to buffer pool (admin only)
 */
router.post('/fund-buffer', async (req, res) => {
    try {
        // Check if user is admin
        if (req.user?.user_type !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin access required' });
        }

        const { amount, source, description } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, error: 'Valid amount required' });
        }

        const bufferDropService = require('../services/bufferDropService');
        const result = await bufferDropService.fundBufferPool(
            parseFloat(amount),
            source || 'admin_deposit',
            description || ''
        );

        res.json(result);
    } catch (error) {
        console.error('Error funding buffer pool:', error);
        res.status(500).json({ success: false, error: 'Failed to fund buffer pool' });
    }
});

/**
 * POST /api/platform-drops/community
 * Create a community-funded drop
 * Allows creators/events/operators to fund their own gem pools
 */
router.post('/community', async (req, res) => {
    try {
        const {
            title,
            description,
            gem_pool_amount,
            max_participants,
            difficulty,
            platform,
            requirements,
            deliverables,
            time_commitment,
            deadline_at
        } = req.body;

        if (!title || !description || !gem_pool_amount) {
            return res.status(400).json({
                success: false,
                error: 'Title, description, and gem_pool_amount are required'
            });
        }

        const supabase = require('../lib/supabase');

        if (!supabase) {
            // Demo mode
            return res.status(201).json({
                success: true,
                drop: {
                    id: `community-${Date.now()}`,
                    creator_id: req.user.id,
                    title,
                    description,
                    drop_type: 'community',
                    drop_source: 'community',
                    gem_pool_total: gem_pool_amount,
                    gem_pool_remaining: gem_pool_amount,
                    max_participants: max_participants || 20,
                    current_participants: 0,
                    status: 'active',
                    created_at: new Date().toISOString()
                },
                message: 'Community drop created successfully'
            });
        }

        // Calculate gem reward per participant
        const participantCount = max_participants || 20;
        const gemRewardBase = gem_pool_amount / participantCount;

        // Create the drop
        const { data: drop, error } = await supabase
            .from('drops')
            .insert({
                creator_id: req.user.id,
                creator_name: req.user.display_name || req.user.username,
                title,
                description,
                drop_type: 'engagement',
                drop_source: 'community',
                is_buffer_drop: false,
                is_proof_drop: false,
                is_paid_drop: true,
                difficulty: difficulty || 'easy',
                key_cost: 1,
                gem_reward_base: gemRewardBase,
                gem_pool_total: gem_pool_amount,
                gem_pool_remaining: gem_pool_amount,
                max_participants: participantCount,
                current_participants: 0,
                platform: platform || 'any',
                requirements: requirements || 'Complete the task as described',
                deliverables: deliverables || 'Proof of completion',
                time_commitment: time_commitment || '15 minutes',
                deadline_at,
                status: 'active'
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating community drop:', error);
            return res.status(500).json({ success: false, error: 'Failed to create community drop' });
        }

        // Deduct gems from user's balance for funding
        const economyService = require('../services/economyService');
        await economyService.spendCurrency(
            req.user.id,
            'gems',
            gem_pool_amount,
            'community_drop_funding',
            drop.id,
            `Funded community drop: ${title}`
        );

        res.status(201).json({
            success: true,
            drop,
            message: 'Community drop created and funded successfully'
        });
    } catch (error) {
        console.error('Error creating community drop:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to create community drop' });
    }
});

/**
 * GET /api/platform-drops/community
 * Get community-created drops
 */
router.get('/community', async (req, res) => {
    try {
        const supabase = require('../lib/supabase');

        if (!supabase) {
            return res.json({
                success: true,
                drops: [],
                count: 0
            });
        }

        const { data: drops, error } = await supabase
            .from('drops')
            .select('*')
            .eq('drop_source', 'community')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error('Error fetching community drops:', error);
            return res.status(500).json({ success: false, error: 'Failed to fetch community drops' });
        }

        res.json({
            success: true,
            drops: drops || [],
            count: drops?.length || 0
        });
    } catch (error) {
        console.error('Error fetching community drops:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch community drops' });
    }
});

module.exports = router;
