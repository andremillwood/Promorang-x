/**
 * PROMORANG DAILY LAYER API
 * 
 * API routes for the Today Screen and Daily Layer system.
 * 
 * Endpoints:
 * - GET /api/today - Get user's complete Today Screen state
 * - POST /api/today/engage - Record engagement with headline
 * - GET /api/today/draw - Get draw status and prizes
 * - GET /api/today/points - Get dynamic points status
 */

const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const dailyLayerService = require('../services/dailyLayerService');
const dynamicPointsService = require('../services/dynamicPointsService');

// =============================================
// MIDDLEWARE
// =============================================

// Use the proper requireAuth middleware that parses JWT and populates req.user
router.use(requireAuth);

// =============================================
// GET /api/today - Main Today Screen endpoint
// =============================================

/**
 * Returns the user's complete Today Screen state.
 * Creates state ON-DEMAND if first visit of the day.
 * 
 * Response includes:
 * - headline (type + payload + optional drop)
 * - multiplier (type + value + reason)
 * - yesterday_rank (from snapshot)
 * - today_progress (tickets + dynamic points)
 * - draw (status + prizes + auto_entered)
 */
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;

        // Demo user detection - return mock data for state testing
        // UUIDs match the migration: 20260114_demo_state_users.sql
        const demoStateUserIds = {
            'a0000000-0000-0000-0000-000000000000': 0,
            'a0000000-0000-0000-0000-000000000001': 1,
            'a0000000-0000-0000-0000-000000000002': 2,
            'a0000000-0000-0000-0000-000000000003': 3,
        };

        if (userId in demoStateUserIds) {
            const stateNum = demoStateUserIds[userId];

            // Generate state-appropriate mock data
            const mockResponse = {
                headline: {
                    type: stateNum >= 2 ? 'reward' : 'multiplier',
                    payload: {
                        title: stateNum === 0
                            ? "Welcome to Promorang!"
                            : stateNum === 1
                                ? "Your First Opportunity"
                                : "Today's Featured Drop",
                        subtitle: stateNum === 0
                            ? "Complete your first drop to get started"
                            : stateNum === 1
                                ? "Start earning with this quick mission"
                                : "Complete this to boost your rank",
                        cta_text: stateNum <= 1 ? "Get Started" : "Complete Now",
                        cta_action: '/today/opportunity',
                        reward_amount: stateNum >= 2 ? 25 : 10,
                    },
                    drop: null,
                },
                multiplier: {
                    type: stateNum === 0 ? 'welcome' : stateNum === 1 ? 'streak' : 'activity',
                    value: stateNum === 0 ? 2.0 : stateNum === 1 ? 1.5 : 1.0 + (stateNum * 0.25),
                    reason: stateNum === 0
                        ? 'Welcome bonus - all points doubled!'
                        : stateNum === 1
                            ? 'Keep your streak alive'
                            : 'Based on your activity level',
                },
                yesterday_rank: {
                    rank: stateNum === 0 ? null : stateNum === 1 ? null : stateNum === 2 ? 847 : 156,
                    percentile: stateNum === 0 ? null : stateNum === 1 ? null : stateNum === 2 ? 65 : 92,
                    change: stateNum >= 2 ? (stateNum === 3 ? 12 : -3) : 0,
                    label: stateNum <= 1 ? 'Complete drops to rank' : 'Your ranking',
                },
                today_progress: {
                    tickets: stateNum === 0 ? 0 : stateNum === 1 ? 1 : stateNum === 2 ? 2 : 3,
                    dynamic_points: stateNum === 0 ? 0 : stateNum * 50,
                    label: 'Progress today',
                },
                draw: {
                    auto_entered: stateNum >= 1,
                    tickets: stateNum === 0 ? 0 : stateNum === 1 ? 1 : stateNum === 2 ? 2 : 3,
                    prizes: [
                        { tier: 'grand', prize: '100 PromoKeys', icon: 'key', winners: 1 },
                        { tier: 'major', prize: '50 Gems', icon: 'gem', winners: 5 },
                        { tier: 'minor', prize: '2x Multiplier', icon: 'zap', winners: 20 },
                    ],
                    status: 'open',
                    result: null,
                },
                reflections: stateNum >= 2 ? [
                    {
                        id: 'demo-reflection-1',
                        message: stateNum === 3 ? "You've been on fire this week!" : "You're building momentum",
                        category: 'activity',
                        icon: 'sparkles',
                        accent_color: 'blue',
                    },
                ] : stateNum === 1 ? [
                    {
                        id: 'demo-reflection-welcome',
                        message: "Welcome! Complete your first action to start earning.",
                        category: 'activity',
                        icon: 'sparkles',
                        accent_color: 'emerald',
                    },
                ] : [],
                featured_content: [
                    {
                        id: 'demo-featured-1',
                        type: 'promorang_drop',
                        title: stateNum === 0 ? 'Claim your first deal' : 'Share your favorite local spot',
                        preview: stateNum === 0 ? 'Start earning Gems today' : 'Join the conversation',
                        accent_color: 'emerald',
                    },
                    stateNum >= 1 ? {
                        id: 'demo-featured-2',
                        type: 'community',
                        title: 'Attend an event near you',
                        preview: 'Meet the community & earn keys',
                        accent_color: 'blue',
                    } : null,
                ].filter(Boolean),
                state_date: new Date().toISOString().split('T')[0],
                headline_viewed: stateNum >= 1,
                headline_engaged: stateNum >= 2,
            };

            return res.json(mockResponse);
        }

        // Get or create daily state ON-DEMAND
        const state = await dailyLayerService.getOrCreateDailyState(userId);

        // Format response according to API contract
        const response = {
            headline: {
                type: state.daily_featured?.headline_type || 'reward',
                payload: state.daily_featured?.headline_payload || {
                    title: "Today's Featured Opportunity",
                    subtitle: "Check back soon for today's headline",
                    cta_text: "Explore",
                },
                drop: state.daily_featured?.headline_drop_id
                    ? { id: state.daily_featured.headline_drop_id }
                    : null,
            },
            multiplier: {
                type: state.multiplier_type,
                value: state.multiplier_value,
                reason: state.multiplier_reason,
            },
            yesterday_rank: {
                rank: state.yesterday_rank,
                percentile: state.yesterday_percentile,
                change: state.yesterday_rank_change || 0,
                label: 'Rank (based on yesterday)',
            },
            today_progress: {
                tickets: state.tickets_earned || 0,
                dynamic_points: state.dynamic_points_earned || 0,
                label: 'Progress today',
            },
            draw: {
                auto_entered: state.draw_auto_entered || false,
                tickets: state.tickets_earned || 0,
                prizes: state.daily_draw?.prize_pool || [],
                status: state.daily_draw?.status || 'open',
                result: state.draw_result || null,
            },
            // Being Seen: Reflections & Featured (replaces checklist)
            reflections: await dailyLayerService.generateReflections(userId),
            featured_content: await dailyLayerService.getFeaturedContent(),
            // Additional context
            state_date: state.state_date,
            headline_viewed: state.headline_viewed,
            headline_engaged: state.headline_engaged,
        };

        res.json(response);
    } catch (error) {
        console.error('[API /today] Error:', error);
        res.status(500).json({ error: 'Failed to load Today Screen' });
    }
});

// =============================================
// POST /api/today/engage - Record engagement
// =============================================

/**
 * Record user engagement with the daily headline.
 * Awards dynamic points + draw tickets.
 * Auto-enters draw at 1+ ticket.
 * 
 * Body:
 * - action: 'view' | 'engage' | 'complete'
 * - reference_id: optional drop_id or other reference
 */
router.post('/engage', async (req, res) => {
    try {
        const userId = req.user.id;
        const { action, reference_id } = req.body;

        // Validate action
        const validActions = ['view', 'engage', 'complete'];
        if (!action || !validActions.includes(action)) {
            return res.status(400).json({
                error: 'Invalid action',
                valid_actions: validActions
            });
        }

        // Record engagement
        const result = await dailyLayerService.recordEngagement(
            userId,
            action,
            reference_id
        );

        // Award dynamic points to ledger
        if (result.points_awarded > 0) {
            await dynamicPointsService.awardDynamicPoints(
                userId,
                action === 'view' ? 'headline_view' : 'headline_engage',
                result.points_awarded,
                reference_id,
                `Daily headline ${action}`
            );

            // Check for automatic Keys conversion
            await dynamicPointsService.autoConvertToKeys(userId);
        }

        res.json({
            success: true,
            points_awarded: result.points_awarded,
            tickets_earned: result.tickets_earned,
            new_ticket_total: result.new_ticket_total,
            auto_entered: result.auto_entered,
            message: result.points_awarded > 0
                ? `You earned ${result.points_awarded} points${result.tickets_earned > 0 ? ` and ${result.tickets_earned} draw ticket` : ''}!`
                : 'Engagement recorded',
        });
    } catch (error) {
        console.error('[API /today/engage] Error:', error);
        res.status(500).json({ error: 'Failed to record engagement' });
    }
});

// =============================================
// GET /api/today/draw - Draw status
// =============================================

/**
 * Get detailed draw status for current day.
 */
router.get('/draw', async (req, res) => {
    try {
        const userId = req.user.id;
        const state = await dailyLayerService.getOrCreateDailyState(userId);

        res.json({
            draw_id: state.draw_id,
            status: state.daily_draw?.status || 'open',
            prizes: state.daily_draw?.prize_pool || [],
            total_entries: state.daily_draw?.total_entries || 0,
            user_tickets: state.tickets_earned || 0,
            auto_entered: state.draw_auto_entered || false,
            result: state.draw_result || null,
            // Phase 0 note
            phase_note: 'Phase 0: Prizes are Keys, boosts, and badges only (no Gems)',
        });
    } catch (error) {
        console.error('[API /today/draw] Error:', error);
        res.status(500).json({ error: 'Failed to load draw status' });
    }
});

// =============================================
// GET /api/today/points - Points conversion status
// =============================================

/**
 * Get dynamic points and conversion status.
 * Shows how many points can be converted to Keys.
 */
router.get('/points', async (req, res) => {
    try {
        const userId = req.user.id;

        const conversionStatus = await dynamicPointsService.getConversionStatus(userId);

        res.json({
            ...conversionStatus,
            explanation: {
                static_points: 'Points from followers, signup, referrals (NOT convertible to Keys)',
                dynamic_points: 'Points from daily activity in Promorang (CAN be converted to Keys)',
                conversion_rate: `${conversionStatus.pointsPerKey} dynamic points = 1 PromoKey`,
            },
        });
    } catch (error) {
        console.error('[API /today/points] Error:', error);
        res.status(500).json({ error: 'Failed to load points status' });
    }
});

// =============================================
// POST /api/today/points/convert - Manual conversion
// =============================================

/**
 * Manually trigger points to Keys conversion.
 * Usually happens automatically, but user can trigger manually.
 */
router.post('/points/convert', async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await dynamicPointsService.autoConvertToKeys(userId);

        if (result.converted) {
            res.json({
                success: true,
                converted: true,
                points_used: result.points,
                keys_earned: result.keys,
                remaining_balance: result.remaining_balance,
                daily_remaining: result.daily_remaining,
                message: `Converted ${result.points} points to ${result.keys} PromoKeys!`,
            });
        } else {
            res.json({
                success: true,
                converted: false,
                reason: result.reason,
                capped: result.capped || false,
                message: result.capped
                    ? 'Daily conversion limit reached. Try again tomorrow!'
                    : 'Not enough points for conversion yet.',
            });
        }
    } catch (error) {
        console.error('[API /today/points/convert] Error:', error);
        res.status(500).json({ error: 'Failed to convert points' });
    }
});

// =============================================
// GET /api/today/leaderboard - Yesterday's leaderboard
// =============================================

/**
 * Get yesterday's final leaderboard (from snapshot).
 * Shows top users and current user's position.
 */
router.get('/leaderboard', async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;

        const today = dailyLayerService.getPromorangDate();
        const yesterday = dailyLayerService.getPreviousPromorangDate(today);

        // Get yesterday's rank for current user
        const userRank = await dailyLayerService.getYesterdayRank(userId);

        // Note: Full leaderboard would require fetching from snapshot
        // This is a simplified response
        res.json({
            date: yesterday,
            label: "Yesterday's Final Rankings",
            user_rank: userRank,
            note: 'Full leaderboard available at /leaderboard',
        });
    } catch (error) {
        console.error('[API /today/leaderboard] Error:', error);
        res.status(500).json({ error: 'Failed to load leaderboard' });
    }
});

// =============================================
// POST /api/today/init - DEV: Manual initialization
// =============================================

/**
 * DEV ONLY: Manually trigger headline and draw initialization
 * Useful for testing outside the cron schedule
 */
router.post('/init', async (req, res) => {
    try {
        console.log('[API /today/init] Manual initialization triggered by', req.user?.email);

        // Initialize headline
        const headline = await dailyLayerService.initDailyHeadline();

        // Initialize draw
        const draw = await dailyLayerService.initDailyDraw();

        res.json({
            success: true,
            message: 'Daily Layer initialized for today',
            headline: headline ? {
                id: headline.id,
                type: headline.headline_type,
                title: headline.headline_payload?.title,
            } : null,
            draw: draw ? {
                id: draw.id,
                date: draw.draw_date,
                status: draw.status,
                prize_count: draw.prize_pool?.length,
            } : null,
        });
    } catch (error) {
        console.error('[API /today/init] Error:', error);
        res.status(500).json({ error: 'Failed to initialize daily layer', details: error.message });
    }
});

module.exports = router;

