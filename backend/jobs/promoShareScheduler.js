/**
 * PROMOSHARE AUTOMATED SCHEDULER
 * Cron jobs for automated cycle management and draw execution
 */

const cron = require('node-cron');
const promoShareService = require('../services/promoShareService');
const promoShareWebSocket = require('../services/promoShareWebSocket');
const { supabase } = require('../lib/supabase');

// =============================================================================
// SCHEDULED JOBS
// =============================================================================

/**
 * Create new daily cycle
 * Runs at midnight (00:00) to start the new day
 */
const createDailyCycleJob = cron.schedule('0 0 * * *', async () => {
    console.log('[PromoShare Scheduler] Creating new daily cycle...');
    try {
        const result = await promoShareService.createCycle({
            cycle_type: 'daily',
            start_at: new Date().toISOString(),
            end_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            config: {
                jackpot_amount: 50,
                auto_close: true
            },
            rewards: [
                { type: 'gem', amount: 50, description: 'Daily Gem Prize' }
            ]
        });

        if (result) {
            console.log(`[PromoShare Scheduler] Daily cycle created: ${result.id}`);
            // Emit WebSocket event
            promoShareWebSocket.emitCycleCreated({
                id: result.id,
                cycle_name: result.cycle_name || 'Daily Draw',
                cycle_type: 'daily',
                start_at: result.start_at,
                end_at: result.end_at,
                jackpot_amount: 50
            });
        }
    } catch (error) {
        console.error('[PromoShare Scheduler] Daily cycle creation error:', error);
    }
}, { scheduled: false });

/**
 * Create new weekly cycle
 * Runs on Sunday at midnight to start the new week
 */
const createWeeklyCycleJob = cron.schedule('0 0 * * 0', async () => {
    console.log('[PromoShare Scheduler] Creating new weekly cycle...');
    try {
        const result = await promoShareService.createCycle({
            cycle_type: 'weekly',
            start_at: new Date().toISOString(),
            end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            config: {
                jackpot_amount: 500,
                auto_close: true
            },
            rewards: [
                { type: 'gem', amount: 500, description: 'Weekly Jackpot' }
            ]
        });

        if (result) {
            console.log(`[PromoShare Scheduler] Weekly cycle created: ${result.id}`);
            // Emit WebSocket event
            promoShareWebSocket.emitCycleCreated({
                id: result.id,
                cycle_name: result.cycle_name || 'Weekly Draw',
                cycle_type: 'weekly',
                start_at: result.start_at,
                end_at: result.end_at,
                jackpot_amount: 500
            });
        }
    } catch (error) {
        console.error('[PromoShare Scheduler] Weekly cycle creation error:', error);
    }
}, { scheduled: false });

/**
 * Create new monthly cycle
 * Runs on 1st of month at midnight
 */
const createMonthlyCycleJob = cron.schedule('0 0 1 * *', async () => {
    console.log('[PromoShare Scheduler] Creating new monthly cycle...');
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const result = await promoShareService.createCycle({
            cycle_type: 'monthly',
            start_at: startOfMonth.toISOString(),
            end_at: startOfNextMonth.toISOString(),
            config: {
                jackpot_amount: 2500,
                auto_close: true
            },
            rewards: [
                { type: 'gem', amount: 2500, description: 'Monthly Grand Prize' }
            ]
        });

        if (result) {
            console.log(`[PromoShare Scheduler] Monthly cycle created: ${result.id}`);
            // Emit WebSocket event
            promoShareWebSocket.emitCycleCreated({
                id: result.id,
                cycle_name: result.cycle_name || 'Monthly Draw',
                cycle_type: 'monthly',
                start_at: result.start_at,
                end_at: result.end_at,
                jackpot_amount: 2500
            });
        }
    } catch (error) {
        console.error('[PromoShare Scheduler] Monthly cycle creation error:', error);
    }
}, { scheduled: false });

/**
 * Close expired cycles and execute draws
 * Runs every hour to check for cycles that ended
 */
const closeExpiredCyclesJob = cron.schedule('5 * * * *', async () => {
    console.log('[PromoShare Scheduler] Checking for expired cycles...');

    if (!supabase) {
        console.log('[PromoShare Scheduler] No Supabase connection, skipping');
        return;
    }

    try {
        // Find cycles that have ended but not closed
        const { data: expiredCycles, error } = await supabase
            .from('promoshare_cycles')
            .select('id, cycle_type, status, end_at, jackpot_amount, is_rollover')
            .eq('status', 'active')
            .lt('end_at', new Date().toISOString());

        if (error) {
            console.error('[PromoShare Scheduler] Error fetching expired cycles:', error);
            return;
        }

        if (!expiredCycles || expiredCycles.length === 0) {
            console.log('[PromoShare Scheduler] No expired cycles to close');
            return;
        }

        console.log(`[PromoShare Scheduler] Found ${expiredCycles.length} expired cycles to process`);

        for (const cycle of expiredCycles) {
            try {
                console.log(`[PromoShare Scheduler] Processing cycle ${cycle.id} (${cycle.cycle_type})`);

                // Emit draw starting event for live updates
                promoShareWebSocket.emitDrawStarting(cycle.id, {
                    cycle_name: cycle.cycle_name,
                    cycle_type: cycle.cycle_type,
                    jackpot_amount: cycle.jackpot_amount
                });

                // Small delay for dramatic effect before executing
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Emit progress - selecting phase
                promoShareWebSocket.emitDrawProgress(cycle.id, {
                    stage: 'selecting',
                    total_tickets: cycle.total_tickets || 0,
                    elapsed_time_ms: 0
                });

                // Execute the draw
                const drawResult = await promoShareService.executeDraw(cycle.id);

                if (drawResult) {
                    console.log(`[PromoShare Scheduler] Draw executed for cycle ${cycle.id}:`,
                        drawResult.winners ? `${drawResult.winners.length} winners` : 'No winners (rollover)');

                    // Emit winner announcement if there are winners
                    if (drawResult.winners && drawResult.winners.length > 0) {
                        // Get full winner details
                        const { data: winnersWithDetails } = await supabase
                            .from('promoshare_winners')
                            .select(`
                                *,
                                users:user_id (display_name, avatar_url)
                            `)
                            .in('id', drawResult.winners.map(w => w.id));

                        const winnerData = {
                            cycle_name: cycle.cycle_name,
                            cycle_type: cycle.cycle_type,
                            winners: winnersWithDetails || drawResult.winners,
                            total_prize_pool: cycle.jackpot_amount,
                            cycle_id: cycle.id
                        };
                        promoShareWebSocket.emitWinnerAnnounced(cycle.id, winnerData);
                        // Persist announcement for users who missed live event
                        await promoShareWebSocket.persistAnnouncement('winner_announced', winnerData);

                        // Send email notifications
                        await notifyWinners(cycle.id, drawResult.winners);

                        // Emit draw completed
                        promoShareWebSocket.emitDrawCompleted(cycle.id, {
                            cycle_type: cycle.cycle_type,
                            status: 'completed',
                            winners: drawResult.winners
                        });
                    } else {
                        // No winners - rolled over
                        promoShareWebSocket.emitDrawCompleted(cycle.id, {
                            cycle_type: cycle.cycle_type,
                            status: 'rolled_over'
                        });
                    }
                }

                // Handle grand jackpot rollover
                if (cycle.cycle_type === 'grand' && (!drawResult?.winners || drawResult.winners.length === 0)) {
                    await handleGrandRollover(cycle);
                }

            } catch (cycleError) {
                console.error(`[PromoShare Scheduler] Error processing cycle ${cycle.id}:`, cycleError);
            }
        }

        console.log(`[PromoShare Scheduler] Processed ${expiredCycles.length} cycles`);
    } catch (error) {
        console.error('[PromoShare Scheduler] Close expired cycles error:', error);
    }
}, { scheduled: false });

/**
 * Handle grand jackpot rollover - increase jackpot for next cycle
 */
async function handleGrandRollover(cycle) {
    try {
        const rolloverAmount = cycle.jackpot_amount || 10000;
        const increaseAmount = rolloverAmount * 0.1; // 10% increase
        const newJackpot = rolloverAmount + increaseAmount;

        // Create new grand cycle with increased jackpot
        const newCycle = await promoShareService.createCycle({
            cycle_type: 'grand',
            start_at: new Date().toISOString(),
            end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            config: {
                jackpot_amount: newJackpot,
                is_rollover: true,
                previous_cycle_id: cycle.id,
                rollover_count: (cycle.rollover_count || 0) + 1,
                auto_close: true
            },
            rewards: [
                { type: 'gem', amount: newJackpot, description: `GRAND JACKPOT - Rolled over! Now ${newJackpot} Gems` }
            ]
        });

        if (newCycle) {
            console.log(`[PromoShare Scheduler] Grand jackpot rolled over to ${newJackpot} Gems: ${newCycle.id}`);

            // Emit WebSocket rollover event
            const rolloverData = {
                from_cycle_id: cycle.id,
                to_cycle_id: newCycle.id,
                rollover_amount: increaseAmount,
                new_jackpot_total: newJackpot,
                cycle_id: newCycle.id
            };
            promoShareWebSocket.emitJackpotRollover(cycle.id, newCycle.id, increaseAmount, newJackpot);
            await promoShareWebSocket.persistAnnouncement('jackpot_rollover', rolloverData);

            // Emit new cycle created
            promoShareWebSocket.emitCycleCreated(newCycle);
            await promoShareWebSocket.persistAnnouncement('cycle_created', {
                ...newCycle,
                cycle_id: newCycle.id
            });

            // Send rollover notification to all users
            await notifyGrandRollover(newCycle.id, newJackpot);
        }
    } catch (error) {
        console.error('[PromoShare Scheduler] Grand rollover error:', error);
    }
}

/**
 * Notify winners of their prizes
 */
async function notifyWinners(cycleId, winners) {
    try {
        const { resendService } = require('../services/resendService');

        for (const winner of winners) {
            try {
                // Get user details
                const { data: user } = await supabase
                    .from('users')
                    .select('email, display_name')
                    .eq('id', winner.user_id)
                    .single();

                if (user?.email) {
                    await resendService.sendWinnerNotification({
                        to: user.email,
                        userName: user.display_name || 'Promorang User',
                        prizeDescription: winner.prize_description,
                        cycleType: winner.cycle_type
                    });
                }
            } catch (notifyError) {
                console.error(`[PromoShare Scheduler] Error notifying winner ${winner.user_id}:`, notifyError);
            }
        }
    } catch (error) {
        console.error('[PromoShare Scheduler] Winner notification error:', error);
    }
}

/**
 * Notify users about grand jackpot rollover
 */
async function notifyGrandRollover(cycleId, newJackpot) {
    try {
        // This could be an in-app notification, email, or push
        // For now, just log it - could expand to use notificationService
        console.log(`[PromoShare Scheduler] Grand rollover notification: Jackpot now ${newJackpot} Gems`);

        // Could add to notification queue for users
        if (supabase) {
            await supabase
                .from('promoshare_notifications')
                .insert({
                    cycle_id: cycleId,
                    user_id: null, // Broadcast to all
                    notification_type: 'grand_rollover',
                    title: '🎰 Grand Jackpot Rollover!',
                    message: `The Grand Jackpot has rolled over and is now ${newJackpot.toLocaleString()} Gems!`,
                    channels: ['in_app'],
                    scheduled_at: new Date().toISOString()
                });
        }
    } catch (error) {
        console.error('[PromoShare Scheduler] Grand rollover notification error:', error);
    }
}

/**
 * Clean up old completed cycles (archive data older than 90 days)
 * Runs weekly on Sundays at 3 AM
 */
const cleanupOldCyclesJob = cron.schedule('0 3 * * 0', async () => {
    console.log('[PromoShare Scheduler] Running cleanup job...');

    if (!supabase) return;

    try {
        const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

        // Archive old audit logs
        const { data: oldLogs, error: logError } = await supabase
            .from('promoshare_audit_log')
            .select('id')
            .lt('created_at', cutoffDate)
            .limit(1000);

        if (logError) {
            console.error('[PromoShare Scheduler] Error fetching old audit logs:', logError);
        } else if (oldLogs && oldLogs.length > 0) {
            // Could move to archive table or delete
            console.log(`[PromoShare Scheduler] Found ${oldLogs.length} old audit logs to archive`);
        }

        // Clean up old notifications (older than 30 days)
        const notificationCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { data: oldNotifications, error: notifError } = await supabase
            .from('promoshare_notifications')
            .select('id')
            .lt('created_at', notificationCutoff)
            .eq('read', true)
            .limit(1000);

        if (notifError) {
            console.error('[PromoShare Scheduler] Error fetching old notifications:', notifError);
        } else if (oldNotifications && oldNotifications.length > 0) {
            console.log(`[PromoShare Scheduler] Found ${oldNotifications.length} old notifications to clean up`);
        }

        console.log('[PromoShare Scheduler] Cleanup job completed');
    } catch (error) {
        console.error('[PromoShare Scheduler] Cleanup job error:', error);
    }
}, { scheduled: false });

/**
 * Process expired unclaimed prizes
 * Runs daily at 2 AM
 */
const processExpiredPrizesJob = cron.schedule('0 2 * * *', async () => {
    console.log('[PromoShare Scheduler] Processing expired prizes...');
    try {
        const result = await promoShareService.processExpiredPrizes();
        console.log(`[PromoShare Scheduler] Processed ${result.processed} expired prizes, ${result.rollovers} rollovers`);
    } catch (error) {
        console.error('[PromoShare Scheduler] Error processing expired prizes:', error);
    }
}, { scheduled: false });

/**
 * Send "cycle ending soon" reminders
 * Runs every 6 hours to notify users of upcoming draws
 */
const cycleEndingReminderJob = cron.schedule('0 */6 * * *', async () => {
    console.log('[PromoShare Scheduler] Sending cycle ending reminders...');

    if (!supabase) return;

    try {
        // Find cycles ending within 6 hours
        const sixHoursFromNow = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
        const now = new Date().toISOString();

        const { data: endingCycles, error } = await supabase
            .from('promoshare_cycles')
            .select('id, cycle_type, end_at, jackpot_amount')
            .eq('status', 'active')
            .lte('end_at', sixHoursFromNow)
            .gte('end_at', now);

        if (error) {
            console.error('[PromoShare Scheduler] Error fetching ending cycles:', error);
            return;
        }

        if (!endingCycles || endingCycles.length === 0) {
            console.log('[PromoShare Scheduler] No cycles ending soon');
            return;
        }

        for (const cycle of endingCycles) {
            // Get eligible users for this cycle
            const { data: eligibleUsers } = await supabase
                .from('promoshare_user_stats')
                .select('user_id, final_weight')
                .eq('cycle_id', cycle.id)
                .eq('eligible', true);

            if (eligibleUsers && eligibleUsers.length > 0) {
                console.log(`[PromoShare Scheduler] Cycle ${cycle.id} ending soon, ${eligibleUsers.length} eligible users`);

                // Could send push/email notifications here
                // For now, just create in-app notifications
                for (const user of eligibleUsers.slice(0, 100)) { // Limit to first 100 to avoid overload
                    await supabase
                        .from('promoshare_notifications')
                        .insert({
                            cycle_id: cycle.id,
                            user_id: user.user_id,
                            notification_type: 'cycle_ending',
                            title: `⏰ ${cycle.cycle_type.charAt(0).toUpperCase() + cycle.cycle_type.slice(1)} Draw Ending Soon!`,
                            message: `The ${cycle.cycle_type} draw ends in less than 6 hours. You have ${user.final_weight} entries!`,
                            channels: ['in_app'],
                            scheduled_at: new Date().toISOString()
                        });
                }
            }
        }

        console.log(`[PromoShare Scheduler] Sent reminders for ${endingCycles.length} cycles`);
    } catch (error) {
        console.error('[PromoShare Scheduler] Cycle ending reminder error:', error);
    }
}, { scheduled: false });

// =============================================================================
// SCHEDULER CONTROL
// =============================================================================

let jobsStarted = false;

const promoShareScheduler = {
    /**
     * Start all PromoShare scheduled jobs
     */
    start() {
        if (jobsStarted) {
            console.log('[PromoShare Scheduler] Already running');
            return;
        }

        createDailyCycleJob.start();
        createWeeklyCycleJob.start();
        createMonthlyCycleJob.start();
        closeExpiredCyclesJob.start();
        cleanupOldCyclesJob.start();
        processExpiredPrizesJob.start();
        cycleEndingReminderJob.start();

        jobsStarted = true;
        console.log('🎰 PromoShare scheduler started (7 jobs)');
    },

    /**
     * Stop all PromoShare scheduled jobs
     */
    stop() {
        createDailyCycleJob.stop();
        createWeeklyCycleJob.stop();
        createMonthlyCycleJob.stop();
        closeExpiredCyclesJob.stop();
        cleanupOldCyclesJob.stop();
        processExpiredPrizesJob.stop();
        cycleEndingReminderJob.stop();

        jobsStarted = false;
        console.log('🎰 PromoShare scheduler stopped');
    },

    /**
     * Get status of all jobs
     */
    getStatus() {
        return {
            running: jobsStarted,
            jobs: [
                { name: 'createDailyCycle', running: createDailyCycleJob.running },
                { name: 'createWeeklyCycle', running: createWeeklyCycleJob.running },
                { name: 'createMonthlyCycle', running: createMonthlyCycleJob.running },
                { name: 'closeExpiredCycles', running: closeExpiredCyclesJob.running },
                { name: 'cleanupOldCycles', running: cleanupOldCyclesJob.running },
                { name: 'processExpiredPrizes', running: processExpiredPrizesJob.running },
                { name: 'cycleEndingReminder', running: cycleEndingReminderJob.running }
            ]
        };
    },

    /**
     * Manual trigger for testing
     */
    async triggerCloseExpired() {
        console.log('[PromoShare Scheduler] Manual trigger: closeExpiredCycles');
        await closeExpiredCyclesJob.execute();
    }
};

module.exports = promoShareScheduler;
