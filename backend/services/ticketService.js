const { supabase } = require('../lib/supabase');
const crypto = require('crypto');
const { sendTicketPurchaseEmail } = require('./resendService');

/**
 * Ticket Service - Manages Activation Keys and Event Access
 */
const ticketService = {
    /**
     * Create ticket tiers for an event
     */
    async createTier(eventId, tierData) {
        const { data, error } = await supabase
            .from('event_ticket_tiers')
            .insert({
                event_id: eventId,
                name: tierData.name,
                price_gems: tierData.priceGems || 0,
                price_gold: tierData.priceGold || 0,
                max_quantity: tierData.maxQuantity,
                perks_json: tierData.perks || {}
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Issue a ticket to a user (Activation Key)
     */
    async issueTicket(userId, tierId) {
        // 1. Verify availability
        const { data: tier, error: tierError } = await supabase
            .from('event_ticket_tiers')
            .select('*, event:events(*)')
            .eq('id', tierId)
            .single();

        if (tierError) throw tierError;
        if (tier.sold_quantity >= tier.max_quantity) {
            throw new Error('Tier sold out');
        }

        // 2. Generate random activation code (QR source)
        const activationCode = crypto.randomBytes(4).toString('hex').toUpperCase();

        // 3. Create ticket
        const { data: ticket, error: ticketError } = await supabase
            .from('event_tickets')
            .insert({
                tier_id: tierId,
                user_id: userId,
                activation_code: activationCode,
                status: 'valid'
            })
            .select()
            .single();

        if (ticketError) throw ticketError;

        // 4. Update sold count
        await supabase
            .from('event_ticket_tiers')
            .update({ sold_quantity: tier.sold_quantity + 1 })
            .eq('id', tierId);

        // 5. Send ticket confirmation email (async)
        try {
            const { data: user } = await supabase
                .from('users')
                .select('email, display_name, username')
                .eq('id', userId)
                .single();

            if (user?.email && tier.event) {
                sendTicketPurchaseEmail(user.email, user.display_name || user.username, {
                    eventName: tier.event.title || tier.event.name,
                    tierName: tier.name,
                    activationCode: activationCode,
                    eventDate: tier.event.event_date || tier.event.start_date,
                    eventLocation: tier.event.location || 'TBD',
                }).catch(err => console.error('Failed to send ticket email:', err));
            }
        } catch (emailErr) {
            console.error('Error sending ticket confirmation email:', emailErr);
        }

        return ticket;
    },

    /**
     * Verify and activate a ticket (Check-in)
     */
    async activateTicket(activationCode, operatorId) {
        const { data, error } = await supabase.rpc('activate_event_ticket', {
            ticket_code: activationCode,
            check_in_by: operatorId
        });

        if (error) throw error;
        return data;
    },

    /**
     * Get user's active tickets with event info
     */
    async getUserTickets(userId) {
        const { data, error } = await supabase
            .from('event_tickets')
            .select(`
        *,
        tier:event_ticket_tiers (
          *,
          event:events (*)
        )
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }
};

module.exports = ticketService;
