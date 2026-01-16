/**
 * PROMORANG DAILY LAYER SERVICE
 * 
 * Core service for the Daily Layer system.
 * Handles headline initialization, draw management, state generation, and leaderboard snapshots.
 * 
 * Key principles:
 * - DailyState is ON-DEMAND (upsert on first visit, not precomputed)
 * - Reset time: 10:00 UTC (5:00 AM Jamaica)
 * - Phase 0: No gems in draw (Keys/boosts/access/badges only)
 * - Auto-enter draw at 1+ ticket (not 3/3 requirement)
 */


const supabaseModule = require('../lib/supabase');
// Handle both export styles: module.exports = supabase AND module.exports.supabase = supabase
const supabase = supabaseModule?.supabase || supabaseModule || null;

// =============================================
// CONFIGURATION
// =============================================

const PROMORANG_DAY_RESET_HOUR = 10; // 10:00 UTC = 5:00 AM Jamaica

// Multiplier rules with welcome_boost included in types
const MULTIPLIER_RULES = {
    streak_30_plus: { type: 'streak_bonus', value: 2.0, reason: 'Monthly streak master!' },
    streak_14_plus: { type: 'streak_bonus', value: 1.75, reason: '14+ day streak!' },
    streak_7_plus: { type: 'streak_bonus', value: 1.5, reason: '7+ day streak bonus!' },
    catchup_3_days: { type: 'catchup_boost', value: 2.0, reason: 'Welcome back! Catch-up boost active' },
    weekend: { type: 'weekend_wave', value: 1.25, reason: 'Weekend wave bonus!' },
    welcome_boost: { type: 'welcome_boost', value: 1.5, reason: 'New user welcome boost!' },
};

// Phase 0 prize pool: NO GEMS
const PHASE_0_PRIZE_POOL = [
    { tier: 'grand', type: 'keys', amount: 10, quantity: 1, description: '10 PromoKeys' },
    { tier: 'major', type: 'boost', amount: 1.5, quantity: 5, description: '1.5x Boost Tomorrow' },
    { tier: 'minor', type: 'keys', amount: 2, quantity: 20, description: '2 PromoKeys' },
    { tier: 'minor', type: 'badge', amount: 1, quantity: 50, description: 'Lucky Winner Badge' },
];

// Valid dynamic point sources (convertible to Keys)
const DYNAMIC_SOURCES = [
    'drop_engagement',
    'proof_verified',
    'streak_bonus',
    'quest_complete',
    'social_action',
    'daily_visit',
    'draw_ticket',
];

// =============================================
// DATE UTILITIES
// =============================================

/**
 * Get current Promorang Date (accounts for 10:00 UTC reset)
 * Before 10:00 UTC = still "yesterday" in Promorang time
 */
function getPromorangDate(date = new Date()) {
    const d = new Date(date);
    const utcHour = d.getUTCHours();
    if (utcHour < PROMORANG_DAY_RESET_HOUR) {
        d.setUTCDate(d.getUTCDate() - 1);
    }
    return d.toISOString().split('T')[0];
}

/**
 * Get previous Promorang Date
 */
function getPreviousPromorangDate(dateStr) {
    const d = new Date(dateStr);
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().split('T')[0];
}

/**
 * Get next Promorang Date
 */
function getNextPromorangDate(dateStr) {
    const d = new Date(dateStr);
    d.setUTCDate(d.getUTCDate() + 1);
    return d.toISOString().split('T')[0];
}

// =============================================
// HEADLINE / FEATURED INITIALIZATION
// =============================================

/**
 * Select headline type based on day rotation (Phase 0: reward or multiplier only)
 */
function selectHeadlineType(date) {
    const d = new Date(date);
    const dayOfWeek = d.getUTCDay();

    // Simple rotation for Phase 0:
    // Monday, Wednesday, Friday: reward (drop-based)
    // Tuesday, Thursday: multiplier (2x day)
    // Saturday, Sunday: chance (weekend = extra tickets)
    if ([1, 3, 5].includes(dayOfWeek)) return 'reward';
    if ([2, 4].includes(dayOfWeek)) return 'multiplier';
    return 'chance';
}

/**
 * Select featured drop for reward headlines
 * NO gem_pool_remaining dependency for Phase 0
 */
async function selectFeaturedDrop() {
    if (!supabase) return null;

    try {
        // Get active drops sorted by freshness and participation
        const { data: drops, error } = await supabase
            .from('drops')
            .select('id, title, description, image_url, current_participants')
            .eq('status', 'active')
            .eq('is_paid_drop', false)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error || !drops || drops.length === 0) return null;

        // Select least participated for fair distribution
        const sorted = [...drops].sort((a, b) =>
            (a.current_participants || 0) - (b.current_participants || 0)
        );

        return sorted[0];
    } catch (error) {
        console.error('[DailyLayer] Error selecting featured drop:', error);
        return null;
    }
}

/**
 * Initialize daily headline (runs at day reset - 10:00 UTC)
 */
async function initDailyHeadline() {
    if (!supabase) {
        console.log('[DailyLayer] Demo mode - skipping headline init');
        return null;
    }

    const today = getPromorangDate();
    console.log(`[DailyLayer] Initializing headline for ${today}`);

    try {
        // Check if already initialized
        const { data: existing } = await supabase
            .from('daily_featured')
            .select('*')
            .eq('feature_date', today)
            .single();

        if (existing) {
            console.log(`[DailyLayer] Headline already exists for ${today}`);
            return existing;
        }

        // Select headline type
        const headlineType = selectHeadlineType(today);
        let headlineDrop = null;
        let payload = {};

        if (headlineType === 'reward') {
            headlineDrop = await selectFeaturedDrop();
            payload = {
                title: headlineDrop?.title || "Today's Featured Opportunity",
                subtitle: headlineDrop?.description || "Explore today's featured drop",
                cta_text: "Explore",
                cta_action: '/today/opportunity', // Dedicated wrapper page
                drop_id: headlineDrop?.id || null,
                reward_amount: headlineDrop?.gem_reward_base || 0,
            };
        } else if (headlineType === 'multiplier') {
            payload = {
                title: "2× Points Day!",
                subtitle: "All dynamic points doubled today. Get ahead of the pack!",
                multiplier: 2.0,
                cta_text: "Start Earning",
                cta_action: '/today/opportunity', // Multiplier missions also go here
            };
        } else if (headlineType === 'chance') {
            payload = {
                title: "Lucky Weekend!",
                subtitle: "Earn bonus draw tickets today. Higher chance of winning!",
                extra_tickets: 1,
                cta_text: "Get Tickets",
                cta_action: '/today/opportunity', // Chance missions also go here
            };
        }

        // Create headline
        const { data: featured, error } = await supabase
            .from('daily_featured')
            .insert({
                feature_date: today,
                headline_type: headlineType,
                headline_drop_id: headlineDrop?.id || null,
                headline_payload: payload,
                selection_method: 'rotation',
            })
            .select()
            .single();

        if (error) throw error;

        console.log(`[DailyLayer] Created headline: ${headlineType} for ${today}`);
        return featured;
    } catch (error) {
        console.error('[DailyLayer] Error initializing headline:', error);
        throw error;
    }
}

// =============================================
// DRAW INITIALIZATION & EXECUTION
// =============================================

/**
 * Initialize daily draw (runs at day reset - 10:00 UTC)
 * Phase 0: NO GEMS in prize pool
 */
async function initDailyDraw() {
    if (!supabase) {
        console.log('[DailyLayer] Demo mode - skipping draw init');
        return null;
    }

    const today = getPromorangDate();
    console.log(`[DailyLayer] Initializing draw for ${today}`);

    try {
        // Check if already initialized
        const { data: existing } = await supabase
            .from('daily_draw')
            .select('*')
            .eq('draw_date', today)
            .single();

        if (existing) {
            console.log(`[DailyLayer] Draw already exists for ${today}`);
            return existing;
        }

        // Create draw with Phase 0 prizes (NO GEMS)
        const { data: draw, error } = await supabase
            .from('daily_draw')
            .insert({
                draw_date: today,
                prize_pool: PHASE_0_PRIZE_POOL,
                status: 'open',
            })
            .select()
            .single();

        if (error) throw error;

        console.log(`[DailyLayer] Created draw for ${today}`);
        return draw;
    } catch (error) {
        console.error('[DailyLayer] Error initializing draw:', error);
        throw error;
    }
}

/**
 * Execute daily draw (runs at day close - 09:59 UTC)
 * CRITICAL: Stores total_entries BEFORE winner selection
 */
async function executeDailyDraw(date = null) {
    if (!supabase) {
        console.log('[DailyLayer] Demo mode - skipping draw execution');
        return null;
    }

    const drawDate = date || getPromorangDate();
    console.log(`[DailyLayer] Executing draw for ${drawDate}`);

    try {
        // Get draw
        const { data: draw, error: drawError } = await supabase
            .from('daily_draw')
            .select('*')
            .eq('draw_date', drawDate)
            .single();

        if (drawError || !draw || draw.status !== 'open') {
            console.log(`[DailyLayer] No open draw for ${drawDate}`);
            return null;
        }

        // Get all entries (users with 1+ tickets are auto-entered)
        const { data: entries, error: entriesError } = await supabase
            .from('draw_entries')
            .select('user_id, tickets_count')
            .eq('draw_id', draw.id);

        if (entriesError) throw entriesError;

        if (!entries || entries.length === 0) {
            console.log(`[DailyLayer] No entries for draw ${drawDate}`);
            await supabase
                .from('daily_draw')
                .update({ status: 'closed', total_entries: 0 })
                .eq('id', draw.id);
            return null;
        }

        // CRITICAL: Store total_entries BEFORE removing winners
        const totalEntries = entries.length;

        // Build weighted pool (more tickets = more entries in pool)
        let pool = [];
        entries.forEach(e => {
            for (let i = 0; i < e.tickets_count; i++) {
                pool.push({ user_id: e.user_id });
            }
        });

        const winners = [];
        const winnerUserIds = new Set();
        const prizePool = draw.prize_pool;

        // Select winners for each prize
        for (const prize of prizePool) {
            for (let i = 0; i < prize.quantity && pool.length > 0; i++) {
                // Random selection
                const randomIndex = Math.floor(Math.random() * pool.length);
                const winnerEntry = pool[randomIndex];

                // One prize per user per day
                if (winnerUserIds.has(winnerEntry.user_id)) {
                    i--; // Try again
                    continue;
                }

                winnerUserIds.add(winnerEntry.user_id);
                winners.push({
                    user_id: winnerEntry.user_id,
                    prize_tier: prize.tier,
                    prize_type: prize.type,
                    prize_amount: prize.amount,
                });

                // Remove this user from pool
                pool = pool.filter(e => e.user_id !== winnerEntry.user_id);
            }
        }

        // Award prizes
        for (const winner of winners) {
            try {
                if (winner.prize_type === 'keys') {
                    await supabase.rpc('add_keys', {
                        p_user_id: winner.user_id,
                        p_amount: winner.prize_amount,
                    });
                }
                // Boost prizes are applied to tomorrow's multiplier
                // Badge prizes would be handled by a badge service

                // Update winner's daily state with result
                await supabase
                    .from('daily_state')
                    .update({
                        draw_result: {
                            won: true,
                            prize_type: winner.prize_type,
                            prize_amount: winner.prize_amount,
                            prize_tier: winner.prize_tier,
                        },
                    })
                    .eq('user_id', winner.user_id)
                    .eq('state_date', drawDate);
            } catch (awardError) {
                console.error(`[DailyLayer] Error awarding prize to ${winner.user_id}:`, awardError);
            }
        }

        // Close draw with correct total_entries (stored BEFORE winner removal)
        await supabase
            .from('daily_draw')
            .update({
                status: 'drawn',
                winners,
                total_entries: totalEntries,
                drawn_at: new Date().toISOString(),
            })
            .eq('id', draw.id);

        console.log(`[DailyLayer] Draw complete: ${winners.length} winners from ${totalEntries} entries`);
        return winners;
    } catch (error) {
        console.error('[DailyLayer] Error executing draw:', error);
        throw error;
    }
}

// =============================================
// DAILY STATE (ON-DEMAND)
// =============================================

/**
 * Calculate multiplier for a user based on their status
 * Includes welcome_boost type for new users
 */
async function calculateMultiplier(userId) {
    if (!supabase) {
        return MULTIPLIER_RULES.welcome_boost;
    }

    try {
        // Get user data
        const { data: user } = await supabase
            .from('users')
            .select('created_at')
            .eq('id', userId)
            .single();

        // Get streak data
        const { data: streak } = await supabase
            .from('user_streaks')
            .select('current_streak, last_login_date')
            .eq('user_id', userId)
            .single();

        const now = new Date();
        const isWeekend = [0, 6].includes(now.getUTCDay());

        // Calculate account age
        const accountAgeDays = user?.created_at
            ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86400000)
            : 0;

        // Calculate days since last activity
        const daysSinceActivity = streak?.last_login_date
            ? Math.floor((Date.now() - new Date(streak.last_login_date).getTime()) / 86400000)
            : 999;

        const currentStreak = streak?.current_streak || 0;

        // Priority-ordered multiplier selection (highest wins)
        if (currentStreak >= 30) return MULTIPLIER_RULES.streak_30_plus;
        if (currentStreak >= 14) return MULTIPLIER_RULES.streak_14_plus;
        if (currentStreak >= 7) return MULTIPLIER_RULES.streak_7_plus;
        if (daysSinceActivity >= 3) return MULTIPLIER_RULES.catchup_3_days;
        if (accountAgeDays <= 7) return MULTIPLIER_RULES.welcome_boost;
        if (isWeekend) return MULTIPLIER_RULES.weekend;

        return { type: 'base', value: 1.0, reason: null };
    } catch (error) {
        console.error('[DailyLayer] Error calculating multiplier:', error);
        return { type: 'base', value: 1.0, reason: null };
    }
}

/**
 * Get yesterday's rank from snapshot
 */
async function getYesterdayRank(userId) {
    if (!supabase) {
        return { rank: null, percentile: null, change: 0 };
    }

    try {
        const today = getPromorangDate();
        const yesterday = getPreviousPromorangDate(today);

        const { data: snapshot } = await supabase
            .from('daily_leaderboard_snapshot')
            .select('ranks_data')
            .eq('snapshot_date', yesterday)
            .eq('segment', 'global')
            .single();

        if (!snapshot?.ranks_data) {
            return { rank: null, percentile: null, change: 0 };
        }

        const userRank = snapshot.ranks_data.find(r => r.user_id === userId);
        if (!userRank) {
            return { rank: null, percentile: null, change: 0 };
        }

        // Get day-before-yesterday rank for change calculation
        const dayBefore = getPreviousPromorangDate(yesterday);
        const { data: prevSnapshot } = await supabase
            .from('daily_leaderboard_snapshot')
            .select('ranks_data')
            .eq('snapshot_date', dayBefore)
            .eq('segment', 'global')
            .single();

        let change = 0;
        if (prevSnapshot?.ranks_data) {
            const prevRank = prevSnapshot.ranks_data.find(r => r.user_id === userId);
            if (prevRank) {
                change = prevRank.rank - userRank.rank; // Positive = moved up
            }
        }

        return {
            rank: userRank.rank,
            percentile: userRank.percentile,
            change,
        };
    } catch (error) {
        console.error('[DailyLayer] Error getting yesterday rank:', error);
        return { rank: null, percentile: null, change: 0 };
    }
}

/**
 * Record a verified user action and update daily state progress
 * This is the central ecosystem connector (Deals/Post/Events -> Today)
 */
async function recordVerifiedAction({ userId, actionType, verificationMode, actionLabel, referenceType, referenceId, metadata = {} }) {
    if (!supabase) {
        console.log('[DailyLayer] Demo mode - skipping verified action recording');
        return { success: true, demo: true };
    }

    try {
        console.log(`[DailyLayer] Recording verified action: ${actionType} for user ${userId}`);

        // 1. Insert into verified_actions
        const { data: action, error } = await supabase
            .from('verified_actions')
            .insert({
                user_id: userId,
                action_type: actionType,
                verification_mode: verificationMode,
                action_label: actionLabel,
                reference_type: referenceType,
                reference_id: referenceId,
                metadata,
                social_shield_eligible: true // Default to true for now
            })
            .select()
            .single();

        if (error) {
            console.error('[DailyLayer] Error inserting verified action:', error);
            // Don't throw, just log. We want resilience.
        }

        // 2. Update Daily State (Checklist Progress)
        const today = getPromorangDate();

        // Fetch current state
        const { data: currentState } = await supabase
            .from('daily_state')
            .select('*')
            .eq('user_id', userId)
            .eq('state_date', today)
            .single();

        if (currentState) {
            // Check if this action completes a specific checklist item
            // For now, we mainly check if headline_engaged should be set true
            // if the action matches the daily featured drop.

            let updates = {};

            // Auto-enter draw if not entered (1+ ticket logic handled by trigger or here)
            // If action earns points/tickets, update them. 
            // For now, verified actions don't DIRECTLY award tickets in this function, 
            // but the caller might trigger ticket awards.

            // SPECIFIC LOGIC: If action is participation in the featured drop
            if (currentState.featured_id) {
                const { data: featured } = await supabase
                    .from('daily_featured')
                    .select('*')
                    .eq('id', currentState.featured_id)
                    .single();

                if (featured && featured.headline_drop_id === referenceId && actionType === 'PROMORANG_DROP') {
                    updates.headline_engaged = true;
                }
            }

            if (Object.keys(updates).length > 0) {
                await supabase
                    .from('daily_state')
                    .update(updates)
                    .eq('id', currentState.id);
            }
        }

        // 3. Trigger Streak Update (Activity Recorded)
        try {
            const streakService = require('./streakService');
            await streakService.checkIn(userId);
        } catch (e) {
            // ignore streak error
        }

        return { success: true, action };
    } catch (error) {
        console.error('[DailyLayer] Error recording verified action:', error);
        return { success: false, error };
    }
}

/**
 * Get or create user's daily state ON-DEMAND (not precomputed)
 * This is called when user opens Today Screen
 */
async function getOrCreateDailyState(userId) {
    if (!supabase) {
        // Demo mode
        const demoState = {
            id: 1,
            user_id: userId,
            state_date: getPromorangDate(),
            headline_viewed: false,
            headline_engaged: false,
            multiplier_type: 'welcome_boost',
            multiplier_value: 1.5,
            multiplier_reason: 'New user welcome boost!',
            tickets_earned: 0,
            dynamic_points_earned: 0,
            draw_auto_entered: false,
            yesterday_rank: null,
            yesterday_percentile: null,
        };
        demoState.daily_checklist = getDailyChecklist(demoState, 1, []);
        demoState.potential_earnings = calculatePotentialEarnings(demoState);
        return demoState;
    }

    const today = getPromorangDate();

    try {
        // Try to get existing state
        let { data: state, error: selectError } = await supabase
            .from('daily_state')
            .select(`
        *,
        daily_featured(*),
        daily_draw(*)
      `)
            .eq('user_id', userId)
            .eq('state_date', today)
            .single();

        if (!state) {
            // First visit of the day - create state ON-DEMAND
            console.log(`[DailyLayer] Creating on-demand state for user ${userId} on ${today}`);

            // Get global daily artifacts - auto-create if missing
            let { data: featured } = await supabase
                .from('daily_featured')
                .select('*')
                .eq('feature_date', today)
                .single();

            // On-demand headline creation if missing
            if (!featured) {
                console.log(`[DailyLayer] No headline for ${today}, creating on-demand...`);
                featured = await initDailyHeadline();
            }

            let { data: draw } = await supabase
                .from('daily_draw')
                .select('*')
                .eq('draw_date', today)
                .single();

            // On-demand draw creation if missing
            if (!draw) {
                console.log(`[DailyLayer] No draw for ${today}, creating on-demand...`);
                draw = await initDailyDraw();
            }

            // Calculate multiplier for this user
            const multiplier = await calculateMultiplier(userId);

            // Create state
            const { data: newState, error: insertError } = await supabase
                .from('daily_state')
                .insert({
                    user_id: userId,
                    state_date: today,
                    featured_id: featured?.id || null,
                    draw_id: draw?.id || null,
                    multiplier_type: multiplier.type,
                    multiplier_value: multiplier.value,
                    multiplier_reason: multiplier.reason,
                })
                .select(`
          *,
          daily_featured(*),
          daily_draw(*)
        `)
                .single();

            if (insertError) throw insertError;
            state = newState;

            // Trigger streak check-in (fire and forget)
            try {
                const streakService = require('./streakService');
                await streakService.checkIn(userId);
            } catch (streakError) {
                console.error('[DailyLayer] Streak check-in error:', streakError);
            }
        }

        // Fetch yesterday's rank from snapshot
        const yesterdayRank = await getYesterdayRank(userId);
        state.yesterday_rank = yesterdayRank.rank;
        state.yesterday_percentile = yesterdayRank.percentile;
        state.yesterday_rank_change = yesterdayRank.change;

        // Fetch Verified Actions for Today
        // We use this to check off checklist items dynamically
        let todayActions = [];
        try {
            // Start of today (UTC)
            const todayStart = new Date(today);
            // Correct for 10am reset if needed, but simple date string match on created_at is safer if we trust server time
            // Better: select actions created after the 'start of Promorang day'

            // Simplified: Fetch checked actions from verified_actions created >= today 00:00 UTC? 
            // Actually, we should match the 'Promorang Day' window.
            // For now, let's just fetch last 24h actions to simple-check.

            const { data: actions } = await supabase
                .from('verified_actions')
                .select('action_type, verification_mode, action_label, reference_id')
                .eq('user_id', userId)
                .gte('created_at', today); // Postgres handles date string ('YYYY-MM-DD') as midnight that day

            todayActions = actions || [];
        } catch (actionError) {
            console.error('[DailyLayer] Error fetching verified actions:', actionError);
        }

        // Add daily checklist and potential earnings
        // Pass maturity state (default to 1 if not available)
        const maturityState = state.user_maturity_state || 1;
        state.daily_checklist = getDailyChecklist(state, maturityState, todayActions);
        state.potential_earnings = calculatePotentialEarnings(state);

        return state;
    } catch (error) {
        console.error('[DailyLayer] Error getting/creating daily state:', error);
        throw error;
    }
}

/**
 * Generate a personalized daily checklist based on user state and maturity
 * @param {object} state - The daily state object
 * @param {number} maturityState - User maturity level (0-3)
 * @param {Array} todayActions - List of verified actions for today
 */
function getDailyChecklist(state, maturityState = 1, todayActions = []) {
    const checklist = [];

    // Helper to check if specific action exists
    const hasAction = (type) => todayActions.some(a => a.action_type === type);
    const hasProof = hasAction('CONTENT_CONTRIBUTION') || hasAction('CONTENT_PARTICIPATION');
    const proofCount = todayActions.filter(a => a.action_type === 'CONTENT_CONTRIBUTION' || a.action_type === 'CONTENT_PARTICIPATION').length;

    // --------------------------------------------------
    // STATE 0-1: ONBOARDING MISSIONS
    // Focus: Get started, complete first actions
    // --------------------------------------------------
    if (maturityState <= 1) {
        checklist.push({
            id: 'view_headline',
            label: "View Today's Headline",
            completed: state.headline_viewed,
            points: 5,
            priority: 1,
            cta_action: '/today/opportunity',
            subtitle: "See what's new today"
        });

        checklist.push({
            id: 'complete_first_drop',
            label: "Complete Your First Drop",
            completed: state.headline_engaged || hasProof,
            points: 50,
            priority: 2,
            cta_action: '/today/opportunity',
            subtitle: "Earn your first reward!"
        });

        checklist.push({
            id: 'draw_entry',
            label: "Enter Daily Draw",
            completed: state.tickets_earned >= 1,
            subtitle: state.tickets_earned >= 1 ? "Entered!" : "Complete a drop to enter",
            priority: 3
        });
    }

    // --------------------------------------------------
    // STATE 2: ENGAGEMENT MISSIONS
    // Focus: Regular activity, building habits
    // --------------------------------------------------
    else if (maturityState === 2) {
        checklist.push({
            id: 'view_headline',
            label: "Check Today's Opportunity",
            completed: state.headline_viewed,
            points: 5,
            priority: 1,
            cta_action: '/today/opportunity',
            subtitle: "A special opportunity awaits"
        });

        if (state.daily_featured && state.daily_featured.headline_type === 'reward') {
            checklist.push({
                id: 'complete_mission',
                label: "Complete Featured Mission",
                completed: state.headline_engaged,
                points: 25,
                priority: 2,
                cta_action: '/today/opportunity',
                subtitle: state.daily_featured.headline_payload?.title
            });
        }

        checklist.push({
            id: 'submit_proof',
            label: "Submit a Proof Today",
            completed: hasProof,
            points: 100,
            priority: 3,
            cta_action: '/post',
            subtitle: "Engage with content"
        });

        checklist.push({
            id: 'check_leaderboard',
            label: "Check Leaderboard",
            completed: todayActions.some(a => a.action_label === 'view_leaderboard'), // requires frontend tracking
            points: 5,
            priority: 4,
            cta_action: '/leaderboard',
            subtitle: "See where you stand"
        });

        checklist.push({
            id: 'draw_entry',
            label: "Enter Daily Draw",
            completed: state.tickets_earned >= 1,
            subtitle: state.tickets_earned >= 1 ? "Entered!" : "Earn 1+ ticket to enter",
            priority: 5
        });
    }

    // --------------------------------------------------
    // STATE 3: COMPETITIVE MISSIONS
    // Focus: Maintain rank, advanced features
    // --------------------------------------------------
    else if (maturityState >= 3) {
        checklist.push({
            id: 'view_headline',
            label: "Today's Mission",
            completed: state.headline_viewed,
            points: 5,
            priority: 1,
            cta_action: '/today/opportunity',
            subtitle: "Keep your streak alive"
        });

        if (state.daily_featured) {
            checklist.push({
                id: 'complete_mission',
                label: "Complete Daily Mission",
                completed: state.headline_engaged,
                points: 25,
                priority: 2,
                cta_action: '/today/opportunity',
                subtitle: state.daily_featured.headline_payload?.title
            });
        }

        // Leaderboard defense mission
        if (state.yesterday_rank && state.yesterday_rank <= 100) {
            checklist.push({
                id: 'defend_rank',
                label: "Defend Your Top 100 Rank",
                completed: state.dynamic_points_earned >= 50,
                points: 50,
                priority: 3,
                subtitle: `You're #${state.yesterday_rank} - earn 50+ pts to hold`
            });
        }

        checklist.push({
            id: 'staking_check',
            label: "Check Growth Hub",
            completed: todayActions.some(a => a.action_label === 'view_growth_hub'),
            points: 10,
            priority: 4,
            cta_action: '/growth-hub',
            subtitle: "Review your staking positions"
        });

        checklist.push({
            id: 'submit_multiple',
            label: "Submit 3 Proofs",
            completed: proofCount >= 3,
            points: 150,
            priority: 5,
            cta_action: '/earn',
            subtitle: "Power user activity"
        });

        checklist.push({
            id: 'draw_entry',
            label: "Max Draw Tickets",
            completed: state.tickets_earned >= 3,
            subtitle: `${state.tickets_earned}/3 tickets earned`,
            priority: 6
        });
    }

    return checklist.sort((a, b) => a.priority - b.priority);
}

/**
 * Calculate potential earnings for display
 */
function calculatePotentialEarnings(state) {
    if (!state.daily_checklist) return 0;
    return state.daily_checklist
        .filter(item => !item.completed && item.points)
        .reduce((sum, item) => sum + item.points, 0);
}

// =============================================
// LEADERBOARD SNAPSHOT
// =============================================

/**
 * Snapshot leaderboard at day close (runs at 09:59 UTC)
 * Creates "yesterday's final rank" for next day display
 */
async function snapshotLeaderboard(date = null) {
    if (!supabase) {
        console.log('[DailyLayer] Demo mode - skipping leaderboard snapshot');
        return null;
    }

    const snapshotDate = date || getPromorangDate();
    console.log(`[DailyLayer] Creating leaderboard snapshot for ${snapshotDate}`);

    try {
        // Check if already exists
        const { data: existing } = await supabase
            .from('daily_leaderboard_snapshot')
            .select('id')
            .eq('snapshot_date', snapshotDate)
            .eq('segment', 'global')
            .single();

        if (existing) {
            console.log(`[DailyLayer] Snapshot already exists for ${snapshotDate}`);
            return existing;
        }

        // Get all users' dynamic points for the day
        const { data: dailyStates, error } = await supabase
            .from('daily_state')
            .select('user_id, dynamic_points_earned')
            .eq('state_date', snapshotDate)
            .order('dynamic_points_earned', { ascending: false });

        if (error) throw error;

        const totalUsers = dailyStates?.length || 0;

        // Build ranks array
        const ranksData = (dailyStates || []).map((row, index) => ({
            user_id: row.user_id,
            rank: index + 1,
            dynamic_points: row.dynamic_points_earned,
            percentile: totalUsers > 0
                ? ((totalUsers - (index + 1)) / totalUsers) * 100
                : 0,
        }));

        // Create snapshot
        const { data: snapshot, error: insertError } = await supabase
            .from('daily_leaderboard_snapshot')
            .insert({
                snapshot_date: snapshotDate,
                segment: 'global',
                total_users: totalUsers,
                ranks_data: ranksData,
            })
            .select()
            .single();

        if (insertError) throw insertError;

        console.log(`[DailyLayer] Created snapshot with ${totalUsers} users`);
        return snapshot;
    } catch (error) {
        console.error('[DailyLayer] Error creating leaderboard snapshot:', error);
        throw error;
    }
}

// =============================================
// ENGAGEMENT & POINTS
// =============================================

/**
 * Record user engagement with headline
 */
async function recordEngagement(userId, action, referenceId = null) {
    if (!supabase) return { success: true };

    const today = getPromorangDate();

    try {
        // Get current state
        const state = await getOrCreateDailyState(userId);

        const updates = {};
        let pointsToAward = 0;
        let ticketsToAward = 0;

        if (action === 'view' && !state.headline_viewed) {
            updates.headline_viewed = true;
            pointsToAward = 5;
        } else if (action === 'engage' && !state.headline_engaged) {
            updates.headline_engaged = true;
            pointsToAward = 25;
            ticketsToAward = 1;
        } else if (action === 'complete') {
            pointsToAward = 100;
            ticketsToAward = 1;
        }

        // Apply multiplier to points
        const multipliedPoints = Math.floor(pointsToAward * state.multiplier_value);

        // Update state
        if (Object.keys(updates).length > 0 || multipliedPoints > 0) {
            updates.dynamic_points_earned = (state.dynamic_points_earned || 0) + multipliedPoints;
            updates.tickets_earned = (state.tickets_earned || 0) + ticketsToAward;
            updates.updated_at = new Date().toISOString();

            await supabase
                .from('daily_state')
                .update(updates)
                .eq('user_id', userId)
                .eq('state_date', today);
        }

        // Auto-enter draw if user has tickets
        const newTicketTotal = (state.tickets_earned || 0) + ticketsToAward;
        if (newTicketTotal >= 1 && !state.draw_auto_entered && state.draw_id) {
            await autoEnterDraw(userId, state.draw_id, newTicketTotal);
        }

        return {
            success: true,
            points_awarded: multipliedPoints,
            tickets_earned: ticketsToAward,
            new_ticket_total: newTicketTotal,
            auto_entered: newTicketTotal >= 1,
        };
    } catch (error) {
        console.error('[DailyLayer] Error recording engagement:', error);
        throw error;
    }
}

/**
 * Auto-enter user in draw (at 1+ ticket, not 3/3)
 */
async function autoEnterDraw(userId, drawId, ticketsCount) {
    if (!supabase) return;

    try {
        // Upsert draw entry
        await supabase
            .from('draw_entries')
            .upsert({
                draw_id: drawId,
                user_id: userId,
                tickets_count: ticketsCount,
                auto_entered: true,
                earned_via: 'daily_activity',
            }, { onConflict: 'draw_id,user_id' });

        // Update daily state
        await supabase
            .from('daily_state')
            .update({ draw_auto_entered: true })
            .eq('user_id', userId)
            .eq('draw_id', drawId);

        console.log(`[DailyLayer] Auto-entered user ${userId} in draw with ${ticketsCount} tickets`);
    } catch (error) {
        console.error('[DailyLayer] Error auto-entering draw:', error);
    }
}

// =============================================
// BEING SEEN: REFLECTIONS & FEATURED CONTENT
// =============================================

/**
 * Generate reflection events for a user based on their verified actions
 * Reflections are system-generated recognition (no CTA, no tasks)
 */
async function generateReflections(userId) {
    if (!supabase) {
        // Demo mode reflections
        return [
            {
                id: 'demo-1',
                message: "You've been active this week",
                category: 'activity',
                icon: 'sparkles',
                accent_color: 'blue',
            },
        ];
    }

    const today = getPromorangDate();

    try {
        // Get recent verified actions (last 7 days)
        // Note: verified_actions table may not exist yet if migrations haven't been applied
        let actions = [];
        try {
            const { data, error: actionsError } = await supabase
                .from('verified_actions')
                .select('action_type, action_label, created_at')
                .eq('user_id', userId)
                .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
                .order('created_at', { ascending: false });

            if (!actionsError) {
                actions = data || [];
            }
        } catch (tableError) {
            // Table doesn't exist yet - that's OK, return streak-based reflections only
            console.log('[DailyLayer] verified_actions table not available, using fallback reflections');
        }

        const actionCount = actions?.length || 0;

        // Build reflections based on activity patterns
        const reflections = [];

        // Activity-based reflection
        if (actionCount >= 5) {
            reflections.push({
                id: `reflection-activity-${today}`,
                message: `You've engaged ${actionCount} times this week`,
                category: 'activity',
                icon: 'sparkles',
                accent_color: 'blue',
                priority: 1,
            });
        } else if (actionCount >= 1) {
            reflections.push({
                id: `reflection-activity-${today}`,
                message: `You participated in something new recently`,
                category: 'activity',
                icon: 'heart',
                accent_color: 'pink',
                priority: 0,
            });
        }

        // Check for contribution actions
        const contributions = actions?.filter(a =>
            a.action_type === 'CONTENT_CONTRIBUTION' || a.action_type === 'PROMORANG_DROP'
        ) || [];

        if (contributions.length > 0) {
            reflections.push({
                id: `reflection-contribution-${today}`,
                message: `Your voice was heard this week`,
                category: 'community',
                icon: 'mic',
                accent_color: 'purple',
                priority: 2,
            });
        }

        // Streak-based reflection (from user data)
        const { data: user } = await supabase
            .from('users')
            .select('points_streak_days')
            .eq('id', userId)
            .single();

        if (user?.points_streak_days >= 7) {
            reflections.push({
                id: `reflection-streak-${today}`,
                message: `${user.points_streak_days} days in a row - you're consistent`,
                category: 'streak',
                icon: 'flame',
                accent_color: 'orange',
                priority: 3,
            });
        }

        return reflections.sort((a, b) => b.priority - a.priority);
    } catch (error) {
        console.error('[DailyLayer] Error generating reflections:', error);
        return [];
    }
}

/**
 * Get featured internal content for Today screen (redistribute attention)
 * Returns 2-3 tiles of internal content
 */
async function getFeaturedContent() {
    if (!supabase) {
        // Demo mode content
        return [
            {
                id: 'featured-1',
                type: 'promorang_drop',
                title: 'Claim your first deal',
                preview: 'Start earning Gems today',
                accent_color: 'emerald',
            },
            {
                id: 'featured-2',
                type: 'community',
                title: 'Find events near you',
                preview: 'Meet the community & earn keys',
                accent_color: 'blue',
            },
        ];
    }

    try {
        // Get active Promorang drops for "Featured Today"
        // Note: promorang_drops table may not exist yet if migrations haven't been applied
        let drops = [];
        try {
            const { data, error } = await supabase
                .from('promorang_drops')
                .select('id, prompt_text, prompt_category, total_responses')
                .or('is_evergreen.eq.true,and(active_from.lte.now,active_until.gte.now)')
                .order('prompt_order', { ascending: true })
                .limit(3);

            if (!error) {
                drops = data || [];
            }
        } catch (tableError) {
            // Table doesn't exist yet - return starter content
            console.log('[DailyLayer] promorang_drops table not available, using starter content');
        }

        // If no drops available, return starter content for everyone
        if (drops.length === 0) {
            return [
                {
                    id: 'starter-featured-1',
                    type: 'promorang_drop',
                    title: 'Claim a deal today',
                    preview: 'Start earning Gems & keys',
                    accent_color: 'emerald',
                },
                {
                    id: 'starter-featured-2',
                    type: 'community',
                    title: 'Attend an event near you',
                    preview: 'Meet the community & level up',
                    accent_color: 'blue',
                },
            ];
        }

        const featured = (drops || []).map(drop => ({
            id: `promorang-drop-${drop.id}`,
            type: 'promorang_drop',
            title: drop.prompt_text,
            preview: drop.total_responses > 0 ? `${drop.total_responses} responses` : 'Be the first',
            accent_color: drop.prompt_category === 'cultural' ? 'emerald' : 'indigo',
            drop_id: drop.id,
        }));

        return featured.slice(0, 3);
    } catch (error) {
        console.error('[DailyLayer] Error getting featured content:', error);
        return [];
    }
}

// =============================================
// EXPORTS
// =============================================

module.exports = {
    // Configuration
    PROMORANG_DAY_RESET_HOUR,
    PHASE_0_PRIZE_POOL,
    DYNAMIC_SOURCES,

    // Date utilities
    getPromorangDate,
    getPreviousPromorangDate,
    getNextPromorangDate,

    // Initialization (cron jobs)
    initDailyHeadline,
    initDailyDraw,

    // Day close (cron jobs)
    executeDailyDraw,
    snapshotLeaderboard,

    // On-demand state
    getOrCreateDailyState,
    calculateMultiplier,
    getYesterdayRank,

    // Engagement
    recordEngagement,
    autoEnterDraw,

    // Being Seen
    generateReflections,
    getFeaturedContent,
};
