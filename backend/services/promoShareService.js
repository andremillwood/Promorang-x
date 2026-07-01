const { supabase } = require('../lib/supabase');
const promoShareEntryService = require('./promoShareEntryService');
const promoShareQualificationService = require('./promoShareQualificationService');
const promoShareAuditService = require('./promoShareAuditService');
const offerService = require('./offerService');

// ============================================
// DEFAULT CONFIGURATION (can be overridden per cycle)
// ============================================
const DEFAULT_ELIGIBILITY_RULES = {
    min_verified_moves: 3,
    min_moments_joined: 1,
    min_referrals: 1,
    min_proofs_approved: 1,
    subscription_qualifies: true,
    min_activity_score: 10,
    min_streak_days: 0
};

const DEFAULT_WEIGHT_CONFIG = {
    base_entry: 1,
    move_weight: 1,
    moment_weight: 2,
    proof_weight: 1,
    referral_weight: 3,
    streak_weight: 2,
    subscription_multiplier: 1.5,
    free_tier_multiplier: 1.0,
    paid_tier_multiplier: 1.5,
    risk_penalty_per_flag: 10
};

// Subscription tier multipliers for PromoShare Boost
const SUBSCRIPTION_TIERS = {
    free: { multiplier: 1.0, name: 'Free', early_access: false },
    pro: { multiplier: 1.5, name: 'Pro', price: 9.99, early_access: true, early_hours: 24 },
    power: { multiplier: 2.0, name: 'Power', price: 29.99, early_access: true, early_hours: 48, exclusive_pools: true }
};

const DEFAULT_DISTRIBUTION_BUCKETS = {
    top_performers: { percentage: 40, count: 5, min_weight_percentile: 90 },
    weighted_random: { percentage: 30, count: 10, eligible: true },
    newcomers: { percentage: 20, count: 5, max_cycles_participated: 2 },
    loyalty: { percentage: 10, count: 5, min_streak_days: 7 }
};

// User state constants
const USER_STATES = {
    NOT_QUALIFIED: 'not_qualified',
    QUALIFIED: 'qualified',
    BOOSTED: 'boosted',
    WINNER: 'winner',
    SPOTLIGHTED: 'spotlighted',
    DISQUALIFIED: 'disqualified',
    UNDER_REVIEW: 'under_review'
};

const promoShareService = {
    /**
     * Get the currently active cycle (legacy - returns first active)
     */
    async getActiveCycle() {
        const cycles = await this.getActiveCycles();
        return cycles.length > 0 ? cycles[0] : null;
    },

    /**
     * Get ALL currently active cycles (daily, weekly, monthly, grand)
     */
    async getActiveCycles() {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('promoshare_cycles')
            .select('*')
            .eq('status', 'active')
            .lte('start_at', new Date().toISOString())
            .gte('end_at', new Date().toISOString())
            .order('cycle_type', { ascending: true });

        if (error) {
            console.error('Error fetching active cycles:', error);
            return [];
        }

        return data || [];
    },

    /**
     * Get active cycle by type
     */
    async getActiveCycleByType(cycleType) {
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('promoshare_cycles')
            .select('*')
            .eq('status', 'active')
            .eq('cycle_type', cycleType)
            .lte('start_at', new Date().toISOString())
            .gte('end_at', new Date().toISOString())
            .order('end_at', { ascending: true })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error(`Error fetching ${cycleType} cycle:`, error);
            return null;
        }

        return data;
    },

    /**
     * Generate a ticket for a user action
     */
    async awardTicket(userId, actionType, sourceId, multiplier = 1.0) {
        if (!supabase) return null;

        try {
            // 1. Get active cycle
            const cycle = await this.getActiveCycle();
            if (!cycle) {
                console.log('No active PromoShare cycle found, skipping ticket generation');
                return null;
            }

            // 2. Check for duplicate ticket if action is unique (like drop completion)
            if (sourceId) {
                const { data: existing } = await supabase
                    .from('promoshare_tickets')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('cycle_id', cycle.id)
                    .eq('source_action', actionType)
                    .eq('source_id', sourceId)
                    .maybeSingle();

                if (existing) {
                    console.log('Ticket already exists for this action');
                    return null;
                }
            }

            // 3. Create ticket
            const { data: ticket, error } = await supabase
                .from('promoshare_tickets')
                .insert({
                    user_id: userId,
                    cycle_id: cycle.id,
                    source_action: actionType,
                    source_id: sourceId,
                    source_id: sourceId,
                    multiplier: multiplier,
                    // V2: Assign random ticket number (1-1,000,000)
                    ticket_number: Math.floor(Math.random() * 1000000) + 1
                })
                .select()
                .single();

            if (error) throw error;

            return ticket;
        } catch (error) {
            console.error('Error awarding ticket:', error);
            return null;
        }
    },

    /**
     * Get dashboard data for a user - now supports multiple concurrent draws
     */
    async getDashboardData(userId) {
        if (!supabase) {
            // Mock data for dev without DB - now includes all 4 draw types
            const now = Date.now();
            return {
                draws: [
                    {
                        id: 1,
                        cycle_type: 'daily',
                        end_at: new Date(now + 12 * 60 * 60 * 1000).toISOString(), // 12 hours
                        jackpot_amount: 50,
                        is_rollover: false,
                        userTickets: 3,
                        totalTickets: 89,
                        poolItems: [{ id: 'd1', reward_type: 'gem', amount: 50, description: 'Daily Gems' }]
                    },
                    {
                        id: 2,
                        cycle_type: 'weekly',
                        end_at: new Date(now + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days
                        jackpot_amount: 500,
                        is_rollover: false,
                        userTickets: 12,
                        totalTickets: 450,
                        poolItems: [{ id: 'w1', reward_type: 'gem', amount: 500, description: 'Weekly Jackpot' }]
                    },
                    {
                        id: 3,
                        cycle_type: 'monthly',
                        end_at: new Date(now + 18 * 24 * 60 * 60 * 1000).toISOString(), // 18 days
                        jackpot_amount: 2500,
                        is_rollover: false,
                        userTickets: 45,
                        totalTickets: 2100,
                        poolItems: [{ id: 'm1', reward_type: 'gem', amount: 2500, description: 'Monthly Grand Prize' }]
                    },
                    {
                        id: 4,
                        cycle_type: 'grand',
                        end_at: new Date(now + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days (weekly)
                        jackpot_amount: 10000,
                        is_rollover: true,
                        userTickets: 12,
                        totalTickets: 450,
                        poolItems: [{ id: 'g1', reward_type: 'gem', amount: 10000, description: 'GRAND JACKPOT' }]
                    }
                ],
                // Legacy fields for backward compatibility
                activeCycle: {
                    id: 2,
                    end_at: new Date(now + 4 * 24 * 60 * 60 * 1000).toISOString(),
                    cycle_type: 'weekly'
                },
                userTickets: 12,
                totalTickets: 450,
                poolItems: [{ id: 'w1', reward_type: 'gem', amount: 500, description: 'Weekly Jackpot' }],
                currentJackpot: 500,
                isRollover: false
            };
        }

        // Get all active cycles
        const cycles = await this.getActiveCycles();

        if (!cycles || cycles.length === 0) {
            return {
                draws: [],
                activeCycle: null,
                userTickets: 0,
                totalTickets: 0,
                poolItems: []
            };
        }

        // Build draw data for each cycle
        const draws = await Promise.all(cycles.map(async (cycle) => {
            // Get user tickets count for this cycle
            const { count: userTickets } = await supabase
                .from('promoshare_tickets')
                .select('*', { count: 'exact', head: true })
                .eq('cycle_id', cycle.id)
                .eq('user_id', userId);

            // Get total tickets count
            const { count: totalTickets } = await supabase
                .from('promoshare_tickets')
                .select('*', { count: 'exact', head: true })
                .eq('cycle_id', cycle.id);

            // Get pool items for this cycle
            const { data: poolItems } = await supabase
                .from('promoshare_pool_items')
                .select('*')
                .eq('cycle_id', cycle.id);

            // Get user ticket numbers for this cycle
            const { data: userTicketsData } = await supabase
                .from('promoshare_tickets')
                .select('ticket_number')
                .eq('cycle_id', cycle.id)
                .eq('user_id', userId);

            const ticketNumbers = userTicketsData ? userTicketsData.map(t => t.ticket_number) : [];

            return {
                id: cycle.id,
                cycle_type: cycle.cycle_type,
                status: cycle.status,
                start_at: cycle.start_at,
                end_at: cycle.end_at,
                jackpot_amount: Number(cycle.jackpot_amount) || 0,
                is_rollover: cycle.is_rollover || false,
                userTickets: userTickets || 0,
                totalTickets: totalTickets || 0,
                ticketNumbers,
                poolItems: poolItems || []
            };
        }));

        // Legacy support - use first cycle (or weekly if available)
        const primaryCycle = draws.find(d => d.cycle_type === 'weekly') || draws[0];

        return {
            draws,
            // Legacy fields
            activeCycle: primaryCycle ? {
                id: primaryCycle.id,
                cycle_type: primaryCycle.cycle_type,
                end_at: primaryCycle.end_at,
                status: primaryCycle.status
            } : null,
            userTickets: primaryCycle?.userTickets || 0,
            totalTickets: primaryCycle?.totalTickets || 0,
            ticketNumbers: primaryCycle?.ticketNumbers || [],
            poolItems: primaryCycle?.poolItems || [],
            currentJackpot: primaryCycle?.jackpot_amount || 0,
            isRollover: primaryCycle?.is_rollover || false
        };
    },

    /**
     * Create a new cycle (Admin)
     */
    async createCycle(cycleData) {
        if (!supabase) return null;

        try {
            const {
                cycle_type,
                cycle_name,
                start_at,
                end_at,
                config,
                rewards,
                eligibility_config,
                weight_config,
                selection_config,
                distribution_config,
                sponsor_config,
                funding_model
            } = cycleData;

            const configEligibility = config?.eligibility_config || {};
            const configWeight = config?.weight_config || {};

            // 1. Create Cycle
            const { data: cycle, error } = await supabase
                .from('promoshare_cycles')
                .insert({
                    cycle_type,
                    cycle_name,
                    start_at,
                    end_at,
                    config: config || {},
                    eligibility_config: eligibility_config || configEligibility,
                    weight_config: weight_config || configWeight,
                    selection_config: selection_config || {},
                    distribution_config: distribution_config || {},
                    sponsor_config: sponsor_config || {},
                    funding_model: funding_model || 'platform',
                    status: 'active'
                })
                .select()
                .single();

            if (error) throw error;

            // 2. Add Rewards to Pool
            if (rewards && rewards.length > 0) {
                const poolItems = rewards.map(r => ({
                    cycle_id: cycle.id,
                    reward_type: r.type,
                    amount: r.amount,
                    description: r.description,
                    image_url: r.image_url,
                    sponsor_id: r.sponsor_id
                }));

                const { error: poolError } = await supabase
                    .from('promoshare_pool_items')
                    .insert(poolItems);

                if (poolError) throw poolError;
            }

            return cycle;
        } catch (error) {
            console.error('Error creating cycle:', error);
            throw error;
        }
    },

    /**
     * End a cycle and execute the draw (Admin/System)
     */
    async executeDraw(cycleId) {
        if (!supabase) return null;

        try {
            // 1. Get Cycle and Validate
            const { data: cycle } = await supabase
                .from('promoshare_cycles')
                .select('*')
                .eq('id', cycleId)
                .single();

            if (!cycle) throw new Error('Cycle not found');
            if (cycle.status === 'completed') throw new Error('Draw already completed for this cycle');

            // 2. Get Pool Items
            const { data: poolItems } = await supabase
                .from('promoshare_pool_items')
                .select('*')
                .eq('cycle_id', cycleId);

            if (!poolItems || poolItems.length === 0) {
                await this.closeCycle(cycleId);
                return { winners: [], message: 'No rewards in pool, cycle closed.' };
            }

            // 3. LOTTERY DRAW LOGIC (V2)
            // Range 1 - 1,000,000
            const winningNumber = Math.floor(Math.random() * 1000000) + 1;
            console.log(`[PromoShare] Cycle ${cycleId} Winning Number: ${winningNumber}`);

            // Find tickets with this number
            const { data: winningTickets } = await supabase
                .from('promoshare_tickets')
                .select('*, users(user_tier)') // Join to check tier
                .eq('cycle_id', cycleId)
                .eq('ticket_number', winningNumber);

            // NO WINNER -> ROLLOVER
            if (!winningTickets || winningTickets.length === 0) {
                console.log(`[PromoShare] No winner for cycle ${cycleId}. Rolling over.`);

                // Calculate amount to rollover (Jackpot from pool items + accumulated revenue jackpot)
                // For simplicity, we assume 'gem' or 'cash' rewards can rollover. 
                // We look at the cycle.jackpot_amount (revenue share) + maybe generic pool value?
                // Let's just rollover the 'jackpot_amount' capable of rolling over.

                const rolloverAmount = Number(cycle.jackpot_amount) || 0;

                // Create Next Cycle (if not exists? admin usually creates. system should probably auto-create next if daily/weekly)
                // For this task, we just mark this cycle as 'completed_no_winner' or similar?
                // Requirement: "goes and goes until someone wins"

                // We need to find the "Next" cycle to add this amount to.
                // Assuming Admin or Scheduler creates cycles. We'll try to find the next 'active' cycle.
                const { data: nextCycle } = await supabase
                    .from('promoshare_cycles')
                    .select('*')
                    .eq('status', 'active')
                    .gt('start_at', cycle.end_at) // Starts after this one
                    .order('start_at', { ascending: true })
                    .limit(1)
                    .maybeSingle();

                if (nextCycle) {
                    await supabase
                        .from('promoshare_cycles')
                        .update({
                            jackpot_amount: (Number(nextCycle.jackpot_amount) || 0) + rolloverAmount,
                            is_rollover: true
                        })
                        .eq('id', nextCycle.id);
                }

                await this.closeCycle(cycleId);
                return { success: true, winners: [], message: 'No winner. Jackpot rolled over.' };
            }

            // WINNERS FOUND
            const winners = [];
            const winnerCount = winningTickets.length;

            // Determine Prize Pool Value (Jackpot + other items)
            // For V2 optimization, let's assume the "Jackpot" is what we are splitting based on ticket number.
            // Pool items (products, coupons) might be separate "Raffle" or "Guaranteed" logic? 
            // User said: "draws should be randomized... instances of no winners... sometimes multiple winners"
            // This implies the MAIN draw is this lottery.

            // We need to distribute the `jackpot_amount` (accumulated cash/gems).
            // And potentially `promoshare_pool_items`? 
            // Let's assume Pool Items are also awarded to these winners? Or are they separate side-prizes?
            // "Grand draw is the only one that can be won by anyone... free subscriber... 30%"
            // Let's assume this Ticket Number logic applies to the GRAND DRAW (Jackpot).

            const totalJackpot = Number(cycle.jackpot_amount) || 0;
            const baseShare = totalJackpot / winnerCount;

            for (const ticket of winningTickets) {
                let payout = baseShare;
                const userTier = ticket.users?.user_tier || 'free';

                // Tier Restriction: Free users get 30%
                if (userTier === 'free') {
                    payout = payout * 0.30;
                    // Remainder 70% goes back to pool/platform? Or next rollover?
                    // "remainder returns to pool" -> effectively rollover or burn. 
                    // Let's rollover the unpaid portion to next cycle? 
                    // Complex. Let's just burn/return to platform for now or rollover. 
                    // I'll rollover the difference.
                    const unpaid = baseShare - payout;
                    if (unpaid > 0) {
                        // Add to next cycle logic (simplified here)
                    }
                }

                // Record Winner
                const { data: winner_record } = await supabase
                    .from('promoshare_winners')
                    .insert({
                        cycle_id: cycleId,
                        user_id: ticket.user_id,
                        prize_description: `Grand Draw Jackpot Share`,
                        prize_data: { amount: payout, type: 'cash_value', tier: userTier, ticket_number: winningNumber }
                    })
                    .select()
                    .single();

                if (!winner_record) {
                    throw new Error(`Failed to record PromoShare winner ${ticket.user_id}`);
                }

                const { data: credited, error: creditError } = await supabase.rpc('credit_user_earning', {
                    p_user_id: ticket.user_id,
                    p_earning_type: 'promoshare_winning',
                    p_amount: Number(payout.toFixed(2)),
                    p_currency: 'usd',
                    p_source_table: 'promoshare_winners',
                    p_source_transaction_id: winner_record.id,
                    p_metadata: {
                        cycle_id: cycleId,
                        ticket_number: winningNumber,
                        user_tier: userTier
                    }
                });

                if (creditError) {
                    // Do not close the cycle with a recorded but unpaid winner.
                    await supabase.from('promoshare_winners').delete().eq('id', winner_record.id);
                    throw creditError;
                }

                winner_record.prize_data = {
                    ...winner_record.prize_data,
                    currency: 'usd',
                    credited: Boolean(credited)
                };
                winners.push(winner_record);
            }

            await this.closeCycle(cycleId);
            return { success: true, winners };

        } catch (error) {
            console.error('Error executing draw:', error);
            throw error;
        }
    },

    async closeCycle(cycleId) {
        if (!supabase) return;
        await supabase.from('promoshare_cycles').update({ status: 'completed' }).eq('id', cycleId);
    },

    async distributePrize(userId, item) {
        // Basic distribution logic - integrating with economy service would go here
        const economyService = require('./economyService');
        try {
            if (item.reward_type === 'gem') {
                await economyService.addCurrency(userId, 'gems', item.amount, 'promoshare_win', item.id, item.description);
            } else if (item.reward_type === 'point') {
                await economyService.addCurrency(userId, 'points', item.amount, 'promoshare_win', item.id, item.description);
            }
            // Add other types as needed
        } catch (e) {
            console.error(`Failed to distribute prize ${item.id} to user ${userId}`, e);
        }
    },
    async sponsorCycle(advertiserId, data) {
        if (!supabase) return null;
        const { cycle_id, reward_type, amount, description } = data;

        const { data: sponsorship, error } = await supabase
            .from('promoshare_sponsorships')
            .insert({
                advertiser_id: advertiserId,
                cycle_id,
                reward_type,
                amount,
                description,
                status: 'pending' // Requires admin approval? Or auto-approve?
            })
            .select()
            .single();

        if (error) throw error;
        return sponsorship;
    },

    // ============================================
    // V2: EVENT-DRIVEN ACTIVITY TRACKING
    // ============================================

    /**
     * Record a verified user action and update PromoShare eligibility
     * Called by activity hooks when users complete verified actions
     */
    async recordVerifiedAction(userId, actionType, metadata = {}) {
        if (!supabase) return null;

        try {
            // Get active cycles
            const cycles = await this.getActiveCycles();
            if (!cycles || cycles.length === 0) {
                return { recorded: false, reason: 'no_active_cycles' };
            }

            const results = [];

            for (const cycle of cycles) {
                // Get or create user stats for this cycle
                const userStats = await this.getOrCreateUserStats(cycle.id, userId);

                // Record the entry
                const entryResult = await this.recordEntry(cycle.id, userId, {
                    source_type: metadata.source_type || 'move',
                    source_action: actionType,
                    source_id: metadata.source_id,
                    entry_count: metadata.entry_count || 1,
                    weight_value: metadata.weight_value || 1,
                    metadata: metadata
                });

                // Recalculate eligibility and weight
                const updatedStats = await this.recalculateUserStats(cycle.id, userId);

                // Audit log
                await this.auditLog(cycle.id, userId, 'action_recorded', 'system', null, {
                    action_type: actionType,
                    entry_id: entryResult?.id,
                    new_weight: updatedStats.final_weight,
                    new_status: updatedStats.status
                });

                results.push({
                    cycle_id: cycle.id,
                    cycle_type: cycle.cycle_type,
                    entry_recorded: !!entryResult,
                    new_weight: updatedStats.final_weight,
                    status: updatedStats.status,
                    became_eligible: !userStats.eligible && updatedStats.eligible
                });

                // If user became eligible, queue notification
                if (!userStats.eligible && updatedStats.eligible) {
                    await this.queueNotification(cycle.id, userId, 'became_eligible', {
                        title: 'You\'re Now PromoShare Eligible!',
                        message: `Your verified activity has earned you entry into the ${cycle.cycle_name || cycle.cycle_type} PromoShare draw.`,
                        action_url: '/promoshare'
                    });
                }
            }

            return { recorded: true, cycles_affected: results };
        } catch (error) {
            console.error('[PromoShare] Error recording verified action:', error);
            return { recorded: false, error: error.message };
        }
    },

    /**
     * Record an entry for a specific action
     */
    async recordEntry(cycleId, userId, entryData) {
        return promoShareEntryService.recordEntry(cycleId, userId, entryData);
    },

    /**
     * Get or create user stats for a cycle
     */
    async getOrCreateUserStats(cycleId, userId) {
        return promoShareQualificationService.getOrCreateUserStats(cycleId, userId);
    },

    /**
     * Recalculate user eligibility and weight for a cycle
     */
    async recalculateUserStats(cycleId, userId) {
        return promoShareQualificationService.recalculateUserStats(cycleId, userId);
    },

    /**
     * Calculate if user meets eligibility criteria
     */
    calculateEligibility(stats, rules, isPaidSubscriber) {
        return promoShareQualificationService.calculateEligibility(stats, rules, isPaidSubscriber);
    },

    /**
     * Calculate user's weight score
     */
    calculateWeight(stats, config, tierMultiplier) {
        return promoShareQualificationService.calculateWeight(stats, config, tierMultiplier);
    },

    // ============================================
    // V2: TIERED WINNER SELECTION
    // ============================================

    /**
     * Execute tiered draw with multiple winner buckets
     */
    async executeTieredDraw(cycleId, distributionConfig = DEFAULT_DISTRIBUTION_BUCKETS) {
        if (!supabase) return null;

        try {
            // 1. Get cycle and validate
            const { data: cycle } = await supabase
                .from('promoshare_cycles')
                .select('*, promoshare_pool_items(*)')
                .eq('id', cycleId)
                .single();

            if (!cycle) throw new Error('Cycle not found');
            if (cycle.status === 'completed') throw new Error('Cycle already completed');

            // 2. Get all eligible users with their weights
            const { data: eligibleUsers } = await supabase
                .from('promoshare_user_stats')
                .select('*, users:user_id(user_tier)')
                .eq('cycle_id', cycleId)
                .eq('eligible', true)
                .eq('disqualified', false)
                .order('final_weight', { ascending: false });

            if (!eligibleUsers || eligibleUsers.length === 0) {
                await this.closeCycle(cycleId);
                await this.auditLog(cycleId, null, 'draw_executed_no_eligible', 'system', null, { reason: 'no_eligible_users' });
                return { success: true, winners: [], message: 'No eligible users' };
            }

            // 3. Freeze cycle - mark as settling
            await supabase
                .from('promoshare_cycles')
                .update({ status: 'settling' })
                .eq('id', cycleId);

            // 4. Get pool items organized by bucket
            const poolItems = cycle.promoshare_pool_items || [];
            const itemsByBucket = {};
            poolItems.forEach(item => {
                const bucket = item.distribution_bucket || 'general';
                if (!itemsByBucket[bucket]) itemsByBucket[bucket] = [];
                itemsByBucket[bucket].push(item);
            });

            // 5. Select winners by bucket
            const allWinners = [];
            const excludedWinnerUserIds = new Set();
            const oneWinPerUser =
                cycle.draw_policy?.one_win_per_user_per_draw !== false &&
                cycle.selection_config?.one_win_per_user_per_draw !== false;

            for (const [bucketName, config] of Object.entries(distributionConfig)) {
                const bucketWinners = await this.selectWinnersForBucket(
                    cycleId,
                    bucketName,
                    config,
                    eligibleUsers,
                    itemsByBucket[bucketName] || itemsByBucket['general'] || [],
                    { excludedUserIds: excludedWinnerUserIds, oneWinPerUser }
                );
                allWinners.push(...bucketWinners);
                if (oneWinPerUser) {
                    bucketWinners.forEach((winner) => {
                        if (winner?.user_id) excludedWinnerUserIds.add(winner.user_id);
                    });
                }
            }

            // 6. Update user statuses to winner
            for (const winner of allWinners) {
                await supabase
                    .from('promoshare_user_stats')
                    .update({
                        status: USER_STATES.WINNER,
                        rank_at_selection: winner.rank_at_selection
                    })
                    .eq('cycle_id', cycleId)
                    .eq('user_id', winner.user_id);

                // Queue winner notification
                await this.queueNotification(cycleId, winner.user_id, 'winner_announcement', {
                    title: '🎉 You Won in PromoShare!',
                    message: `You've won ${winner.prize_description}! Claim your reward now.`,
                    action_url: '/promoshare/winnings'
                });
            }

            // 7. Close cycle and audit log
            const drawAudit = await this.createDrawAudit(cycle, {
                distributionConfig,
                eligibleUsers,
                winners: allWinners,
                excludedUserIds: Array.from(excludedWinnerUserIds),
                oneWinPerUser,
                selectionMethod: 'random_weighted_by_entries'
            });

            if (drawAudit?.id && allWinners.length > 0) {
                await supabase
                    .from('promoshare_winners')
                    .update({ draw_audit_id: drawAudit.id })
                    .in('id', allWinners.map((winner) => winner.id).filter(Boolean));
            }

            await this.closeCycle(cycleId);
            await this.auditLog(cycleId, null, 'draw_executed', 'system', null, {
                total_eligible: eligibleUsers.length,
                total_winners: allWinners.length,
                buckets: Object.keys(distributionConfig),
                one_win_per_user: oneWinPerUser,
                draw_audit_id: drawAudit?.id || null
            });

            return {
                success: true,
                cycle_id: cycleId,
                total_eligible: eligibleUsers.length,
                total_winners: allWinners.length,
                winners: allWinners
            };

        } catch (error) {
            console.error('[PromoShare] Error executing tiered draw:', error);
            throw error;
        }
    },

    /**
     * Select winners for a specific distribution bucket
     */
    async selectWinnersForBucket(cycleId, bucketName, config, eligibleUsers, poolItems, options = {}) {
        const winners = [];
        const count = config.count || 5;
        const excludedUserIds = options.excludedUserIds || new Set();
        const oneWinPerUser = options.oneWinPerUser !== false;

        // Filter users based on bucket criteria
        let candidateUsers = [...eligibleUsers].filter((user) => !excludedUserIds.has(user.user_id));

        if (bucketName === 'top_performers' && config.min_weight_percentile) {
            // Take top X% by weight
            const cutoffIndex = Math.ceil(candidateUsers.length * (config.min_weight_percentile / 100));
            candidateUsers = candidateUsers.slice(0, Math.max(1, candidateUsers.length - cutoffIndex + 1));
        }

        if (bucketName === 'newcomers' && config.max_cycles_participated) {
            // Filter to users with limited history (would need to query past cycles)
            // For now, use a simple random subset
        }

        if (bucketName === 'loyalty' && config.min_streak_days) {
            // Filter to users with streak >= min_streak_days
            candidateUsers = candidateUsers.filter(u => (u.streak_days || 0) >= config.min_streak_days);
        }

        const selectedCount = Math.min(count, candidateUsers.length);
        const selectedUserIds = new Set();

        while (winners.length < selectedCount && candidateUsers.length > 0) {
            const totalWeight = candidateUsers.reduce((sum, user) => sum + Math.max(1, Number(user.final_weight || 1)), 0);
            let random = Math.random() * totalWeight;
            let selectedIndex = 0;

            for (let i = 0; i < candidateUsers.length; i++) {
                random -= Math.max(1, Number(candidateUsers[i].final_weight || 1));
                if (random <= 0) {
                    selectedIndex = i;
                    break;
                }
            }

            const [user] = candidateUsers.splice(selectedIndex, 1);
            if (!user || selectedUserIds.has(user.user_id) || excludedUserIds.has(user.user_id)) continue;

            selectedUserIds.add(user.user_id);
            if (oneWinPerUser) excludedUserIds.add(user.user_id);

            const rank = winners.length + 1;

            // Assign prize from pool
            const prize = poolItems[winners.length % Math.max(1, poolItems.length)];

            // Record winner
            const { data: winnerRecord } = await supabase
                .from('promoshare_winners')
                .insert({
                    cycle_id: cycleId,
                    user_id: user.user_id,
                    pool_id: prize?.id,
                    prize_description: prize?.description || `${bucketName} Prize`,
                    prize_data: {
                        amount: prize?.amount,
                        reward_type: prize?.reward_type,
                        bucket: bucketName,
                        one_win_per_user: oneWinPerUser
                    },
                    selection_bucket: bucketName,
                    selection_method: 'weighted_random',
                    selection_reason: `Selected from ${bucketName} bucket`,
                    final_weight_at_selection: user.final_weight,
                    rank_at_selection: rank,
                    announced: false,
                    claimed: false,
                    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
                })
                .select()
                .single();

            winners.push(winnerRecord);

            try {
                await offerService.issueForEvent({
                    userId: user.user_id,
                    channel: 'promoshare',
                    event: 'winner',
                    sourceId: cycleId,
                    sourceEventId: winnerRecord?.id || `${cycleId}:${user.user_id}:${bucketName}`,
                    context: { cycle_id: cycleId, bucket: bucketName, winner_id: winnerRecord?.id, rank }
                });
            } catch (offerError) {
                console.warn('[PromoShare] unified offer issuance skipped:', offerError.message);
            }
        }

        return winners;
    },

    async createDrawAudit(cycle, { distributionConfig, eligibleUsers, winners, excludedUserIds, oneWinPerUser, selectionMethod }) {
        if (!supabase) return null;

        try {
            const selectedUserIds = (winners || []).map((winner) => winner.user_id).filter(Boolean);
            const { count: eligibleEntriesCount } = await supabase
                .from('promoshare_entries')
                .select('id', { count: 'exact', head: true })
                .eq('cycle_id', cycle.id)
                .eq('proof_status', 'verified');

            const { data, error } = await supabase
                .from('promoshare_draw_audits')
                .insert({
                    cycle_id: cycle.id,
                    draw_type: cycle.cycle_type || 'cycle',
                    selection_method: selectionMethod,
                    eligible_entries_count: eligibleEntriesCount || 0,
                    eligible_users_count: eligibleUsers.length,
                    requested_winner_count: Object.values(distributionConfig || {}).reduce((sum, config) => sum + Number(config.count || 0), 0),
                    selected_winner_count: winners.length,
                    one_win_per_user: oneWinPerUser,
                    excluded_user_ids: excludedUserIds || [],
                    selected_user_ids: selectedUserIds,
                    selected_entry_ids: [],
                    random_seed: null,
                    rules_snapshot: {
                        draw_policy: cycle.draw_policy || {},
                        selection_config: cycle.selection_config || {},
                        distribution_config: distributionConfig || {},
                        pool_rule_config: cycle.pool_rule_config || {},
                    },
                    executed_by_type: 'system'
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.warn('[PromoShare] draw audit skipped:', error.message);
            return null;
        }
    },

    // ============================================
    // V2: ADMIN & SIMULATION TOOLS
    // ============================================

    /**
     * Simulate a draw without executing it (admin preview)
     */
    async simulateDraw(cycleId, distributionConfig = DEFAULT_DISTRIBUTION_BUCKETS) {
        if (!supabase) return this.mockSimulation();

        try {
            // Get eligible users
            const { data: eligibleUsers } = await supabase
                .from('promoshare_user_stats')
                .select('user_id, final_weight, eligible, status, verified_moves_count, moments_joined_count, referral_count')
                .eq('cycle_id', cycleId)
                .eq('eligible', true)
                .eq('disqualified', false)
                .order('final_weight', { ascending: false });

            if (!eligibleUsers || eligibleUsers.length === 0) {
                return {
                    eligible_users: 0,
                    projected_winners: 0,
                    buckets: [],
                    weight_distribution: {},
                    message: 'No eligible users for this cycle'
                };
            }

            // Calculate statistics
            const weights = eligibleUsers.map(u => u.final_weight);
            const totalWeight = weights.reduce((a, b) => a + b, 0);
            const avgWeight = totalWeight / weights.length;

            // Simulate bucket selections
            const bucketResults = [];
            let projectedWinners = 0;

            for (const [bucketName, config] of Object.entries(distributionConfig)) {
                const count = Math.min(config.count || 5, eligibleUsers.length);
                projectedWinners += count;

                // Calculate who would likely win
                let candidates = [...eligibleUsers];

                if (bucketName === 'top_performers') {
                    candidates = candidates.slice(0, Math.max(1, count * 2));
                }

                bucketResults.push({
                    name: bucketName,
                    projected_winners: count,
                    candidate_pool: candidates.length,
                    top_candidates: candidates.slice(0, 3).map(u => ({
                        user_id: u.user_id,
                        weight: u.final_weight
                    }))
                });
            }

            // Weight distribution analysis
            const weightDistribution = {
                high: eligibleUsers.filter(u => u.final_weight >= avgWeight * 1.5).length,
                medium: eligibleUsers.filter(u => u.final_weight >= avgWeight && u.final_weight < avgWeight * 1.5).length,
                low: eligibleUsers.filter(u => u.final_weight < avgWeight).length
            };

            return {
                cycle_id: cycleId,
                eligible_users: eligibleUsers.length,
                projected_winners: projectedWinners,
                weight_stats: {
                    total: totalWeight,
                    average: Math.round(avgWeight),
                    highest: Math.max(...weights),
                    lowest: Math.min(...weights)
                },
                weight_distribution: weightDistribution,
                buckets: bucketResults,
                can_execute: true
            };

        } catch (error) {
            console.error('[PromoShare] Simulation error:', error);
            return { error: error.message };
        }
    },

    mockSimulation() {
        return {
            eligible_users: 150,
            projected_winners: 25,
            weight_stats: { total: 3500, average: 23, highest: 85, lowest: 1 },
            weight_distribution: { high: 30, medium: 80, low: 40 },
            buckets: [
                { name: 'top_performers', projected_winners: 5, candidate_pool: 15 },
                { name: 'weighted_random', projected_winners: 10, candidate_pool: 150 },
                { name: 'newcomers', projected_winners: 5, candidate_pool: 50 },
                { name: 'loyalty', projected_winners: 5, candidate_pool: 30 }
            ],
            mock: true
        };
    },

    /**
     * Get detailed user stats for admin review
     */
    async getQualifiedUsers(cycleId, options = {}) {
        if (!supabase) return [];

        let query = supabase
            .from('promoshare_user_stats')
            .select('*, users:user_id(username, email, user_tier)')
            .eq('cycle_id', cycleId)
            .eq('eligible', true)
            .order('final_weight', { ascending: false });

        if (options.status) {
            query = query.eq('status', options.status);
        }

        if (options.min_weight) {
            query = query.gte('final_weight', options.min_weight);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[PromoShare] Error fetching qualified users:', error);
            return [];
        }

        return data || [];
    },

    /**
     * Admin: Override user eligibility or status
     */
    async overrideUserStatus(cycleId, userId, overrideData, adminId) {
        if (!supabase) return null;

        const { eligible, status, reason } = overrideData;

        const { data, error } = await supabase
            .from('promoshare_user_stats')
            .update({
                eligible: eligible,
                status: status || (eligible ? USER_STATES.QUALIFIED : USER_STATES.DISQUALIFIED),
                disqualified: !eligible,
                disqualified_reason: !eligible ? reason : null,
                manual_review_required: false
            })
            .eq('cycle_id', cycleId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;

        // Audit log
        await this.auditLog(cycleId, userId, 'manual_override', 'admin', adminId, {
            new_eligible: eligible,
            new_status: status,
            reason: reason
        });

        return data;
    },

    /**
     * Admin: Force recalculate all user stats for a cycle
     */
    async recalculateAllStats(cycleId) {
        if (!supabase) return null;

        const { data: allUsers } = await supabase
            .from('promoshare_user_stats')
            .select('user_id')
            .eq('cycle_id', cycleId);

        const results = [];
        for (const { user_id } of (allUsers || [])) {
            const updated = await this.recalculateUserStats(cycleId, user_id);
            results.push({ user_id, success: !!updated });
        }

        await this.auditLog(cycleId, null, 'mass_recalculation', 'admin', null, {
            users_processed: results.length
        });

        return { processed: results.length, results };
    },

    // ============================================
    // V2: USER-FACING DASHBOARD DATA
    // ============================================

    /**
     * Get enhanced dashboard data with user stats
     */
    async getUserDashboardData(userId) {
        const basicData = await this.getDashboardData(userId);

        if (!supabase) {
            return {
                ...basicData,
                user_stats: {
                    total_entries: 12,
                    verified_actions: 8,
                    moments_joined: 3,
                    referrals: 1,
                    streak_days: 5,
                    current_weight: 25,
                    rank: 45
                }
            };
        }

        // Get user's stats for all active cycles
        const cycles = await this.getActiveCycles();
        const userStatsByCycle = [];

        for (const cycle of cycles) {
            const stats = await this.getOrCreateUserStats(cycle.id, userId);
            const entries = await this.getUserEntries(cycle.id, userId);

            userStatsByCycle.push({
                cycle_id: cycle.id,
                cycle_type: cycle.cycle_type,
                cycle_name: cycle.cycle_name,
                eligible: stats?.eligible || false,
                status: stats?.status || USER_STATES.NOT_QUALIFIED,
                weight: stats?.final_weight || 0,
                total_entries: stats?.total_entries || 0,
                verified_moves: stats?.verified_moves_count || 0,
                moments_joined: stats?.moments_joined_count || 0,
                referrals: stats?.referral_count || 0,
                entries_breakdown: entries.reduce((acc, e) => {
                    acc[e.source_type] = (acc[e.source_type] || 0) + e.entry_count;
                    return acc;
                }, {}),
                progress_to_qualify: this.calculateProgressToQualify(stats, cycle.eligibility_config)
            });
        }

        return {
            ...basicData,
            user_stats_by_cycle: userStatsByCycle,
            recent_entries: await this.getRecentEntries(userId, 10),
            history: await this.getUserHistory(userId, 5)
        };
    },

    /**
     * Calculate progress to qualification
     */
    calculateProgressToQualify(stats, eligibilityConfig) {
        return promoShareQualificationService.calculateProgressToQualify(stats, eligibilityConfig);
    },

    async getUserEntries(cycleId, userId) {
        return promoShareEntryService.getUserEntries(cycleId, userId);
    },

    async getRecentEntries(userId, limit = 10) {
        return promoShareEntryService.getRecentEntries(userId, limit);
    },

    async getUserHistory(userId, limit = 5) {
        if (!supabase) return [];

        const { data } = await supabase
            .from('promoshare_winners')
            .select('*, cycles:cycle_id(cycle_type, cycle_name)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        return data || [];
    },

    // ============================================
    // V2: AUDIT LOGGING & NOTIFICATIONS
    // ============================================

    /**
     * Write audit log entry
     */
    async auditLog(cycleId, userId, actionType, actorType, actorId, payload) {
        return promoShareAuditService.auditLog(cycleId, userId, actionType, actorType, actorId, payload);
    },

    /**
     * Queue a notification for a user
     */
    async queueNotification(cycleId, userId, notificationType, data) {
        return promoShareAuditService.queueNotification(cycleId, userId, notificationType, data);
    },

    /**
     * Get audit log for a cycle (admin)
     */
    async getAuditLog(cycleId, options = {}) {
        return promoShareAuditService.getAuditLog(cycleId, options);
    },

    // ============================================
    // V2: SUBSCRIPTION & TIER MANAGEMENT
    // ============================================

    /**
     * Get user's subscription tier info for PromoShare
     */
    async getUserSubscriptionTier(userId) {
        if (!supabase) return SUBSCRIPTION_TIERS.free;

        try {
            const { data: user } = await supabase
                .from('users')
                .select('user_tier, subscription_status, subscription_type')
                .eq('id', userId)
                .single();

            if (!user || user.subscription_status !== 'active') {
                return SUBSCRIPTION_TIERS.free;
            }

            // Map user tier to subscription config
            const tier = user.user_tier?.toLowerCase() || 'free';
            return SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS.free;
        } catch (error) {
            console.error('[PromoShare] Error getting subscription tier:', error);
            return SUBSCRIPTION_TIERS.free;
        }
    },

    /**
     * Calculate weight with subscription multiplier
     */
    calculateWeightWithSubscription(stats, weightConfig, subscriptionTier) {
        let weight = weightConfig.base_entry;

        // Activity weights
        weight += stats.verified_moves_count * weightConfig.move_weight;
        weight += stats.moments_joined_count * weightConfig.moment_weight;
        weight += stats.proofs_approved_count * weightConfig.proof_weight;
        weight += stats.referral_count * weightConfig.referral_weight;

        // Apply subscription tier multiplier
        const tierConfig = SUBSCRIPTION_TIERS[subscriptionTier?.toLowerCase()] || SUBSCRIPTION_TIERS.free;
        weight = Math.floor(weight * tierConfig.multiplier);

        return weight;
    },

    /**
     * Check if user has early access to a pool based on subscription
     */
    async hasEarlyAccess(userId, cycleStartAt) {
        const tier = await this.getUserSubscriptionTier(userId);
        if (!tier.early_access) return false;

        const cycleStart = new Date(cycleStartAt);
        const earlyAccessStart = new Date(cycleStart.getTime() - (tier.early_hours * 60 * 60 * 1000));
        const now = new Date();

        return now >= earlyAccessStart && now < cycleStart;
    },

    /**
     * Get subscription pricing tiers
     */
    getSubscriptionTiers() {
        return SUBSCRIPTION_TIERS;
    },

    // ============================================
    // V2: WINNER CLAIM & PRIZE MANAGEMENT
    // ============================================

    /**
     * Get user's unclaimed prizes
     */
    async getUnclaimedPrizes(userId) {
        if (!supabase) return [];

        try {
            const { data: winners, error } = await supabase
                .from('promoshare_winners')
                .select(`
                    *,
                    cycles:cycle_id (cycle_type, cycle_name, end_at)
                `)
                .eq('user_id', userId)
                .eq('claimed', false)
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;
            return winners || [];
        } catch (error) {
            console.error('[PromoShare] Error getting unclaimed prizes:', error);
            return [];
        }
    },

    /**
     * Claim a prize
     * @param {string} userId - User claiming the prize
     * @param {string} winnerId - Winner record ID
     * @returns {Object} Claim result
     */
    async claimPrize(userId, winnerId) {
        if (!supabase) {
            return { success: false, error: 'Database not available' };
        }

        try {
            // Get the winner record
            const { data: winner, error: winnerError } = await supabase
                .from('promoshare_winners')
                .select(`
                    *,
                    cycles:cycle_id (cycle_type, status)
                `)
                .eq('id', winnerId)
                .eq('user_id', userId)
                .single();

            if (winnerError || !winner) {
                return { success: false, error: 'Prize not found or already claimed' };
            }

            // Check if already claimed
            if (winner.claimed) {
                return { success: false, error: 'Prize already claimed' };
            }

            // Check if expired
            const now = new Date();
            const expiresAt = new Date(winner.expires_at);
            if (now > expiresAt) {
                return { success: false, error: 'Prize has expired', expired: true };
            }

            // Update winner record
            const { data: updated, error: updateError } = await supabase
                .from('promoshare_winners')
                .update({
                    claimed: true,
                    claimed_at: now.toISOString()
                })
                .eq('id', winnerId)
                .select()
                .single();

            if (updateError) throw updateError;

            // Distribute the actual prize
            const prizeData = winner.prize_data || {};
            const distribution = await this.distributeClaimedPrize(userId, {
                type: prizeData.type || 'gem',
                amount: prizeData.amount,
                description: winner.prize_description,
                reward_type: prizeData.reward_type
            });

            // Audit log
            await this.auditLog(winner.cycle_id, userId, 'prize_claimed', 'user', userId, {
                winner_id: winnerId,
                prize_amount: prizeData.amount,
                prize_type: prizeData.type
            });

            return {
                success: true,
                message: `Successfully claimed ${winner.prize_description}`,
                prize: updated,
                distribution
            };
        } catch (error) {
            console.error('[PromoShare] Error claiming prize:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Distribute claimed prize to user
     */
    async distributeClaimedPrize(userId, prize) {
        try {
            const economyService = require('./economyService');

            switch (prize.type || prize.reward_type) {
                case 'gem':
                    await economyService.addCurrency(userId, 'gems', prize.amount, 'promoshare_claim', null, prize.description);
                    return { type: 'gems', amount: prize.amount };

                case 'point':
                case 'points':
                    await economyService.addCurrency(userId, 'points', prize.amount, 'promoshare_claim', null, prize.description);
                    return { type: 'points', amount: prize.amount };

                case 'key':
                case 'keys':
                    await economyService.addCurrency(userId, 'keys', prize.amount, 'promoshare_claim', null, prize.description);
                    return { type: 'keys', amount: prize.amount };

                case 'coupon':
                    // Assign coupon to user
                    const { data: assignment } = await supabase
                        .from('user_coupons')
                        .insert({
                            user_id: userId,
                            coupon_id: prize.coupon_id,
                            status: 'active',
                            assigned_reason: 'promoshare_win'
                        })
                        .select()
                        .single();
                    return { type: 'coupon', coupon_id: prize.coupon_id, assignment };

                case 'cash':
                case 'usd':
                    // Add to payout queue
                    await supabase
                        .from('payout_queue')
                        .insert({
                            user_id: userId,
                            amount: prize.amount,
                            currency: 'USD',
                            source: 'promoshare_win',
                            status: 'pending'
                        });
                    return { type: 'cash', amount: prize.amount, status: 'pending_payout' };

                default:
                    return { type: 'unknown', message: 'Prize type not recognized for auto-distribution' };
            }
        } catch (error) {
            console.error('[PromoShare] Error distributing prize:', error);
            return { error: error.message };
        }
    },

    /**
     * Handle expired unclaimed prizes
     * Called by cron job periodically
     */
    async processExpiredPrizes() {
        if (!supabase) return { processed: 0 };

        try {
            const now = new Date().toISOString();

            // Find expired unclaimed prizes
            const { data: expired, error } = await supabase
                .from('promoshare_winners')
                .select('id, cycle_id, user_id, prize_data, expires_at')
                .eq('claimed', false)
                .lt('expires_at', now);

            if (error) throw error;
            if (!expired || expired.length === 0) {
                return { processed: 0 };
            }

            let rollovers = 0;
            let forfeited = 0;

            for (const prize of expired) {
                try {
                    // Mark as expired/forfeited
                    await supabase
                        .from('promoshare_winners')
                        .update({
                            claimed: false,
                            status: 'expired',
                            expires_at: prize.expires_at
                        })
                        .eq('id', prize.id);

                    // Get cycle info for rollover decision
                    const { data: cycle } = await supabase
                        .from('promoshare_cycles')
                        .select('cycle_type')
                        .eq('id', prize.cycle_id)
                        .single();

                    // Rollover logic: 60% to next cycle, 40% to platform
                    const prizeAmount = prize.prize_data?.amount || 0;
                    if (prizeAmount > 0 && cycle?.cycle_type === 'grand') {
                        // Find next grand cycle
                        const { data: nextCycle } = await supabase
                            .from('promoshare_cycles')
                            .select('id, jackpot_amount')
                            .eq('cycle_type', 'grand')
                            .eq('status', 'active')
                            .order('start_at', { ascending: true })
                            .limit(1)
                            .maybeSingle();

                        if (nextCycle) {
                            const rolloverAmount = prizeAmount * 0.6;
                            await supabase
                                .from('promoshare_cycles')
                                .update({
                                    jackpot_amount: (nextCycle.jackpot_amount || 0) + rolloverAmount
                                })
                                .eq('id', nextCycle.id);
                            rollovers++;
                        }
                    }

                    // Audit log
                    await this.auditLog(prize.cycle_id, prize.user_id, 'prize_expired', 'system', null, {
                        winner_id: prize.id,
                        amount: prizeAmount,
                        rollover: rollovers > 0
                    });

                    forfeited++;
                } catch (prizeError) {
                    console.error('[PromoShare] Error processing expired prize:', prizeError);
                }
            }

            return {
                processed: expired.length,
                rollovers,
                forfeited
            };
        } catch (error) {
            console.error('[PromoShare] Error processing expired prizes:', error);
            return { processed: 0, error: error.message };
        }
    },

    /**
     * Get claim statistics for admin
     */
    async getClaimStats(cycleId = null) {
        if (!supabase) return null;

        try {
            let query = supabase
                .from('promoshare_winners')
                .select('claimed, expires_at, created_at');

            if (cycleId) {
                query = query.eq('cycle_id', cycleId);
            }

            const { data, error } = await query;
            if (error) throw error;

            const stats = {
                total: data?.length || 0,
                claimed: data?.filter(w => w.claimed).length || 0,
                unclaimed: data?.filter(w => !w.claimed && new Date(w.expires_at) > new Date()).length || 0,
                expired: data?.filter(w => !w.claimed && new Date(w.expires_at) <= new Date()).length || 0
            };

            stats.claimRate = stats.total > 0 ? Math.round((stats.claimed / stats.total) * 100) : 0;

            return stats;
        } catch (error) {
            console.error('[PromoShare] Error getting claim stats:', error);
            return null;
        }
    },

    // ============================================
    // ANTI-FRAUD INTEGRATION
    // ============================================

    /**
     * Check user fraud risk score before draw inclusion
     * Returns risk assessment for filtering out fraudulent users
     */
    async checkUserFraudRisk(userId) {
        if (!supabase) return { risk_score: 0, is_allowed: true };

        try {
            // Get user's fraud alerts in last 30 days
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

            const { data: fraudAlerts, error: alertError } = await supabase
                .from('fraud_alerts')
                .select('severity, alert_type, created_at')
                .eq('user_id', userId)
                .gte('created_at', thirtyDaysAgo)
                .in('status', ['open', 'investigating']);

            if (alertError) {
                console.error('[PromoShare] Error fetching fraud alerts:', alertError);
                return { risk_score: 0, is_allowed: true };
            }

            // Calculate risk score based on alerts
            let risk_score = 0;
            const severityWeights = {
                'critical': 100,
                'high': 50,
                'medium': 20,
                'low': 5,
                'none': 0
            };

            const alertTypes = new Set();

            for (const alert of fraudAlerts || []) {
                risk_score += severityWeights[alert.severity] || 0;
                alertTypes.add(alert.alert_type);
            }

            // Cap at 100
            risk_score = Math.min(risk_score, 100);

            // Determine if user is allowed in draws
            // Critical: Blocked entirely
            // High: Blocked from Grand draws only
            // Medium: Weight penalty
            let is_blocked = fraudAlerts?.some(a => a.severity === 'critical');
            let is_grand_blocked = fraudAlerts?.some(a => a.severity === 'high' || a.severity === 'critical');

            // Check device fingerprint risk
            const { data: deviceRisk, error: deviceError } = await supabase
                .from('device_fingerprints')
                .select('is_blocked')
                .contains('associated_user_ids', [userId])
                .eq('is_blocked', true)
                .limit(1);

            if (deviceError) {
                console.error('[PromoShare] Error checking device risk:', deviceError);
            }

            if (deviceRisk && deviceRisk.length > 0) {
                is_blocked = true;
                is_grand_blocked = true;
                risk_score = 100;
            }

            return {
                risk_score,
                is_allowed: !is_blocked,
                is_grand_allowed: !is_grand_blocked,
                alert_types: Array.from(alertTypes),
                weight_penalty: risk_score > 50 ? Math.floor((risk_score - 50) / 10) : 0
            };
        } catch (error) {
            console.error('[PromoShare] Error checking fraud risk:', error);
            return { risk_score: 0, is_allowed: true };
        }
    },

    /**
     * Get all qualified users with fraud filtering for a cycle
     * Enhanced version that filters out high-risk users
     */
    async getQualifiedUsersWithFraudCheck(cycleId, options = {}) {
        if (!supabase) return [];

        try {
            // Get base qualified users
            let query = supabase
                .from('promoshare_user_stats')
                .select(`
                    *,
                    users:user_id (id, display_name, user_tier)
                `)
                .eq('cycle_id', cycleId)
                .eq('eligible', true);

            if (options.min_weight) {
                query = query.gte('final_weight', options.min_weight);
            }

            const { data: users, error } = await query;

            if (error) throw error;
            if (!users) return [];

            // Apply fraud filtering if requested
            if (options.filter_fraud !== false) {
                const filteredUsers = [];

                for (const user of users) {
                    const fraudCheck = await this.checkUserFraudRisk(user.user_id);

                    // Skip blocked users
                    if (!fraudCheck.is_allowed) {
                        await this.auditLog(cycleId, user.user_id, 'user_filtered_fraud', 'system', null, {
                            risk_score: fraudCheck.risk_score,
                            reason: 'Critical fraud risk'
                        });
                        continue;
                    }

                    // For grand draws, also check grand-specific allowance
                    if (options.cycle_type === 'grand' && !fraudCheck.is_grand_allowed) {
                        await this.auditLog(cycleId, user.user_id, 'user_filtered_fraud', 'system', null, {
                            risk_score: fraudCheck.risk_score,
                            reason: 'High risk - excluded from Grand draw'
                        });
                        continue;
                    }

                    // Apply weight penalty for medium risk users
                    if (fraudCheck.weight_penalty > 0) {
                        user.final_weight = Math.max(0, user.final_weight - fraudCheck.weight_penalty);
                        user.fraud_penalty_applied = fraudCheck.weight_penalty;
                    }

                    user.risk_score = fraudCheck.risk_score;
                    filteredUsers.push(user);
                }

                return filteredUsers;
            }

            return users;
        } catch (error) {
            console.error('[PromoShare] Error getting qualified users with fraud check:', error);
            return [];
        }
    },

    /**
     * Validate draw execution for fraud patterns
     * Checks for suspicious draw patterns (e.g., same user winning too frequently)
     */
    async validateDrawForFraud(cycleId, winners) {
        if (!supabase) return { valid: true };

        try {
            const issues = [];

            // Check for repeat winners in recent cycles
            for (const winner of winners) {
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

                const { data: recentWins, error } = await supabase
                    .from('promoshare_winners')
                    .select('id, cycle_id, created_at')
                    .eq('user_id', winner.user_id)
                    .gte('created_at', thirtyDaysAgo)
                    .neq('cycle_id', cycleId);

                if (error) {
                    console.error('[PromoShare] Error checking recent wins:', error);
                    continue;
                }

                if (recentWins && recentWins.length >= 3) {
                    issues.push({
                        type: 'frequent_winner',
                        user_id: winner.user_id,
                        recent_wins: recentWins.length,
                        message: `User has won ${recentWins.length} times in last 30 days`
                    });
                }
            }

            // Check for device clustering (multiple winners from same device)
            const deviceChecks = winners.map(async (winner) => {
                const { data: fingerprints } = await supabase
                    .from('device_fingerprints')
                    .select('fingerprint_hash')
                    .contains('associated_user_ids', [winner.user_id])
                    .limit(1);

                return { user_id: winner.user_id, fingerprint: fingerprints?.[0]?.fingerprint_hash };
            });

            const deviceResults = await Promise.all(deviceChecks);
            const fingerprintCounts = {};

            for (const result of deviceResults) {
                if (result.fingerprint) {
                    fingerprintCounts[result.fingerprint] = (fingerprintCounts[result.fingerprint] || 0) + 1;
                }
            }

            for (const [fingerprint, count] of Object.entries(fingerprintCounts)) {
                if (count > 2) {
                    issues.push({
                        type: 'device_clustering',
                        fingerprint: fingerprint.substring(0, 8) + '...',
                        winner_count: count,
                        message: `${count} winners associated with same device fingerprint`
                    });
                }
            }

            // Log any issues
            if (issues.length > 0) {
                await this.auditLog(cycleId, null, 'draw_fraud_check', 'system', null, {
                    issues,
                    winner_count: winners.length
                });
            }

            return {
                valid: issues.length === 0,
                issues,
                requires_review: issues.some(i => i.type === 'device_clustering')
            };
        } catch (error) {
            console.error('[PromoShare] Error validating draw for fraud:', error);
            return { valid: true, error: error.message };
        }
    }
};

// Export constants for use in other modules
promoShareService.SUBSCRIPTION_TIERS = SUBSCRIPTION_TIERS;
promoShareService.SPONSOR_TIERS = {
    daily: { min_pool: 50, max_pool: 200, platform_fee_percent: 20, max_winners: 5, min_win_value: 10, duration_days: 1 },
    weekly: { min_pool: 200, max_pool: 1000, platform_fee_percent: 15, max_winners: 15, min_win_value: 8, duration_days: 7 },
    monthly: { min_pool: 1000, max_pool: 5000, platform_fee_percent: 12, max_winners: 20, min_win_value: 15, duration_days: 30 },
    grand: { min_pool: 5000, max_pool: 25000, platform_fee_percent: 10, max_winners: 50, min_win_value: 50, duration_days: 90 }
};

module.exports = promoShareService;
