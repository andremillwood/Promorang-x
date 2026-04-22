/**
 * PromoShare WebSocket Service
 * Handles real-time updates for live draws and winner announcements
 */

const promoShareWebSocket = {
    /**
     * Emit draw starting event
     * Called when a draw is about to begin
     */
    emitDrawStarting(cycleId, cycleData) {
        if (!global.io) return;

        const event = {
            type: 'draw_starting',
            cycle_id: cycleId,
            cycle_name: cycleData.cycle_name,
            cycle_type: cycleData.cycle_type,
            jackpot_amount: cycleData.jackpot_amount,
            timestamp: new Date().toISOString(),
            countdown_seconds: 30 // 30 second countdown before draw
        };

        // Emit to cycle-specific room
        global.io.to(`cycle:${cycleId}`).emit('promoshare:draw', event);
        // Also emit to global promoshare room
        global.io.to('promoshare').emit('promoshare:draw', event);

        console.log(`[PromoShare WebSocket] Draw starting announced for cycle ${cycleId}`);
    },

    /**
     * Emit draw in progress with ticket selection animation
     * Called during the draw execution for live ticket number reveals
     */
    emitDrawProgress(cycleId, data) {
        if (!global.io) return;

        const event = {
            type: 'draw_progress',
            cycle_id: cycleId,
            stage: data.stage, // 'selecting', 'verifying', 'announcing'
            current_ticket: data.current_ticket,
            total_tickets: data.total_tickets,
            elapsed_time_ms: data.elapsed_time_ms,
            timestamp: new Date().toISOString()
        };

        global.io.to(`cycle:${cycleId}`).emit('promoshare:draw', event);
        global.io.to('promoshare').emit('promoshare:draw', event);
    },

    /**
     * Emit winner announcement
     * Called when winners are determined
     */
    emitWinnerAnnounced(cycleId, winnerData) {
        if (!global.io) return;

        const event = {
            type: 'winner_announced',
            cycle_id: cycleId,
            cycle_name: winnerData.cycle_name,
            cycle_type: winnerData.cycle_type,
            winners: winnerData.winners.map(w => ({
                user_id: w.user_id,
                display_name: w.display_name || 'Anonymous',
                prize_description: w.prize_description,
                prize_amount: w.prize_data?.amount,
                prize_type: w.prize_data?.type,
                avatar_url: w.avatar_url
            })),
            total_winners: winnerData.winners.length,
            total_prize_pool: winnerData.total_prize_pool,
            timestamp: new Date().toISOString()
        };

        // Emit to all promoshare subscribers
        global.io.to('promoshare').emit('promoshare:winner', event);
        global.io.to(`cycle:${cycleId}`).emit('promoshare:winner', event);

        console.log(`[PromoShare WebSocket] Winner announced for cycle ${cycleId}: ${winnerData.winners.length} winners`);
    },

    /**
     * Emit draw completed event
     * Called when draw is fully complete
     */
    emitDrawCompleted(cycleId, drawResult) {
        if (!global.io) return;

        const event = {
            type: 'draw_completed',
            cycle_id: cycleId,
            cycle_type: drawResult.cycle_type,
            status: drawResult.status, // 'completed', 'no_winners', 'rolled_over'
            winners_count: drawResult.winners?.length || 0,
            next_cycle_start: drawResult.next_cycle_start,
            timestamp: new Date().toISOString()
        };

        global.io.to(`cycle:${cycleId}`).emit('promoshare:draw', event);
        global.io.to('promoshare').emit('promoshare:draw', event);

        console.log(`[PromoShare WebSocket] Draw completed for cycle ${cycleId}`);
    },

    /**
     * Emit cycle status update
     * Called when cycle state changes (active -> closing -> completed)
     */
    emitCycleStatus(cycleId, statusData) {
        if (!global.io) return;

        const event = {
            type: 'cycle_status',
            cycle_id: cycleId,
            status: statusData.status,
            time_remaining_seconds: statusData.time_remaining,
            participant_count: statusData.participant_count,
            ticket_count: statusData.ticket_count,
            timestamp: new Date().toISOString()
        };

        global.io.to(`cycle:${cycleId}`).emit('promoshare:status', event);
        global.io.to('promoshare').emit('promoshare:status', event);
    },

    /**
     * Emit new cycle created event
     * Called when a new cycle is created
     */
    emitCycleCreated(cycleData) {
        if (!global.io) return;

        const event = {
            type: 'cycle_created',
            cycle_id: cycleData.id,
            cycle_name: cycleData.cycle_name,
            cycle_type: cycleData.cycle_type,
            start_at: cycleData.start_at,
            end_at: cycleData.end_at,
            jackpot_amount: cycleData.jackpot_amount,
            timestamp: new Date().toISOString()
        };

        global.io.to('promoshare').emit('promoshare:cycle', event);

        console.log(`[PromoShare WebSocket] New cycle announced: ${cycleData.cycle_name}`);
    },

    /**
     * Emit jackpot rollover announcement
     * Called when grand jackpot rolls over
     */
    emitJackpotRollover(fromCycleId, toCycleId, rolloverAmount, newTotal) {
        if (!global.io) return;

        const event = {
            type: 'jackpot_rollover',
            from_cycle_id: fromCycleId,
            to_cycle_id: toCycleId,
            rollover_amount: rolloverAmount,
            new_jackpot_total: newTotal,
            timestamp: new Date().toISOString()
        };

        global.io.to('promoshare').emit('promoshare:rollover', event);

        console.log(`[PromoShare WebSocket] Jackpot rollover: $${rolloverAmount} -> cycle ${toCycleId}`);
    },

    /**
     * Emit ticket purchase/award notification
     * Called when a user receives tickets
     */
    emitTicketAwarded(userId, ticketData) {
        if (!global.io) return;

        const event = {
            type: 'ticket_awarded',
            user_id: userId,
            cycle_id: ticketData.cycle_id,
            ticket_count: ticketData.ticket_count,
            reason: ticketData.reason,
            timestamp: new Date().toISOString()
        };

        // Emit to user's personal room (if implemented) or cycle room
        global.io.to(`cycle:${ticketData.cycle_id}`).emit('promoshare:ticket', event);
    },

    /**
     * Broadcast system message
     * For general announcements about PromoShare
     */
    broadcast(message, type = 'info') {
        if (!global.io) return;

        const event = {
            type: 'system_message',
            message_type: type,
            message: message,
            timestamp: new Date().toISOString()
        };

        global.io.to('promoshare').emit('promoshare:system', event);
    },

    /**
     * Get current subscriber count
     */
    getSubscriberCount() {
        if (!global.io) return { promoshare: 0 };

        const promoshareRoom = global.io.sockets.adapter.rooms.get('promoshare');
        return {
            promoshare: promoshareRoom ? promoshareRoom.size : 0
        };
    },

    /**
     * Persist announcement to database for users who missed the live event
     */
    async persistAnnouncement(type, data) {
        if (!global.supabase) return;

        try {
            await global.supabase
                .from('promoshare_announcements')
                .insert({
                    announcement_type: type,
                    title: data.title || this.getAnnouncementTitle(type, data),
                    content: data,
                    cycle_id: data.cycle_id || null,
                    is_global: true,
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
                });
        } catch (error) {
            console.error('[PromoShare WebSocket] Error persisting announcement:', error);
        }
    },

    /**
     * Get announcement title based on type and data
     */
    getAnnouncementTitle(type, data) {
        switch (type) {
            case 'winner_announced':
                return `🎉 ${data.cycle_name} Winners Announced!`;
            case 'jackpot_rollover':
                return `🚀 Jackpot Rollover! Now ${data.new_jackpot_total} Gems`;
            case 'cycle_created':
                return `✨ New ${data.cycle_type} Cycle Started`;
            case 'draw_starting':
                return `🎰 ${data.cycle_name} Draw Starting Soon!`;
            default:
                return 'PromoShare Update';
        }
    }
};

module.exports = promoShareWebSocket;
