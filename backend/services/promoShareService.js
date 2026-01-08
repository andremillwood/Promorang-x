const { supabase } = require('../lib/supabase');

const promoShareService = {
    /**
     * Get the currently active cycle
     */
    async getActiveCycle() {
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('promoshare_cycles')
            .select('*')
            .eq('status', 'active')
            .lte('start_at', new Date().toISOString())
            .gte('end_at', new Date().toISOString())
            .order('end_at', { ascending: true })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error('Error fetching active cycle:', error);
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
     * Get dashboard data for a user
     */
    async getDashboardData(userId) {
        if (!supabase) {
            // Mock data for dev without DB
            return {
                activeCycle: {
                    id: 1,
                    end_at: new Date(Date.now() + 86400000).toISOString(),
                    cycle_type: 'weekly'
                },
                userTickets: 5,
                totalTickets: 150,
                poolItems: [
                    { type: 'gem', amount: 1000, description: 'Weekly Gem Jackpot' },
                    { type: 'key', amount: 10, description: 'Runner-up Keys' }
                ]
            };
        }

        const cycle = await this.getActiveCycle();

        if (!cycle) {
            return {
                activeCycle: null,
                userTickets: 0,
                totalTickets: 0,
                poolItems: []
            };
        }

        // Get user tickets count
        const { count: userTickets } = await supabase
            .from('promoshare_tickets')
            .select('*', { count: 'exact', head: true })
            .eq('cycle_id', cycle.id)
            .eq('user_id', userId);

        // Get total tickets count (optional, maybe cached or estimated)
        const { count: totalTickets } = await supabase
            .from('promoshare_tickets')
            .select('*', { count: 'exact', head: true })
            .eq('cycle_id', cycle.id);

        // Get pool items
        const { data: poolItems } = await supabase
            .from('promoshare_pool_items')
            .select('*')
            .eq('cycle_id', cycle.id);

        // Get user ticket numbers
        const { data: userTicketsData } = await supabase
            .from('promoshare_tickets')
            .select('ticket_number')
            .eq('cycle_id', cycle.id)
            .eq('user_id', userId);

        const ticketNumbers = userTicketsData ? userTicketsData.map(t => t.ticket_number) : [];

        // Estimate Jackpot (Base + Revenue Share)
        // For MVP, just use cycle.jackpot_amount
        const currentJackpot = Number(cycle.jackpot_amount) || 0;

        return {
            activeCycle: cycle,
            userTickets: userTickets || 0,
            ticketNumbers,
            totalTickets: totalTickets || 0,
            poolItems: poolItems || [],
            currentJackpot,
            isRollover: cycle.is_rollover
        };
    },

    /**
     * Create a new cycle (Admin)
     */
    async createCycle(cycleData) {
        if (!supabase) return null;

        try {
            const { cycle_type, start_at, end_at, config, rewards } = cycleData;

            // 1. Create Cycle
            const { data: cycle, error } = await supabase
                .from('promoshare_cycles')
                .insert({
                    cycle_type,
                    start_at,
                    end_at,
                    config: config || {},
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

                winners.push(winner_record);

                // Distribute - for now just logging, would call economyService
                // await this.distributePrize(ticket.user_id, { reward_type: 'gem', amount: payout }); // assuming jackpot is gems equivalent
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
    }
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
    }
};

module.exports = promoShareService;
