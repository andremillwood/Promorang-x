const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');
const { sendSupportTicketCreatedEmail } = require('../services/resendService');

router.use(requireAuth);

/**
 * GET /api/support/my-tickets
 * Get tickets for the current user
 */
router.get('/my-tickets', async (req, res) => {
    try {
        if (!supabase) {
            return res.json([
                {
                    id: 'demo-ticket-1',
                    subject: 'Problem with payment',
                    status: 'in_progress',
                    category: 'billing',
                    created_at: new Date().toISOString()
                }
            ]);
        }

        const { data: tickets, error } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(tickets);
    } catch (error) {
        console.error('Fetch tickets error:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});

/**
 * GET /api/support/my-tickets/:id
 * Get a specific ticket for the current user
 */
router.get('/my-tickets/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!supabase) {
            return res.json({
                id,
                subject: 'Demo support ticket',
                status: 'open',
                category: 'other',
                message: 'This is a demo support ticket.',
                admin_notes: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });
        }

        const { data: ticket, error } = await supabase
            .from('support_tickets')
            .select('*, events:support_ticket_events(*)')
            .eq('id', id)
            .eq('user_id', req.user.id)
            .maybeSingle();

        if (error) throw error;
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        res.json(ticket);
    } catch (error) {
        console.error('Fetch ticket detail error:', error);
        res.status(500).json({ error: 'Failed to fetch ticket' });
    }
});

/**
 * POST /api/support
 * Create a new support ticket
 */
router.post('/', async (req, res) => {
    try {
        const { subject, category, message, priority = 'medium' } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ error: 'Subject and message are required' });
        }

        if (!supabase) {
            return res.json({ success: true, message: 'Ticket created (Mock)' });
        }

        const createdAt = new Date();
        const slaHours = priority === 'high' ? 8 : priority === 'low' ? 72 : 24;
        const { data: ticket, error } = await supabase
            .from('support_tickets')
            .insert({
                user_id: req.user.id,
                subject,
                category,
                message,
                priority,
                last_user_reply_at: createdAt.toISOString(),
                sla_due_at: new Date(createdAt.getTime() + slaHours * 60 * 60 * 1000).toISOString(),
            })
            .select()
            .single();

        if (error) throw error;

        await supabase.from('support_ticket_events').insert({
            ticket_id: ticket.id,
            actor_id: req.user.id,
            actor_type: 'user',
            event_type: 'created',
            new_status: ticket.status,
            message,
            metadata: { subject, category, priority },
        });

        // Send confirmation email (async)
        try {
            const { data: user } = await supabase
                .from('users')
                .select('email, display_name, username')
                .eq('id', req.user.id)
                .single();

            if (user?.email && ticket) {
                sendSupportTicketCreatedEmail(user.email, user.display_name || user.username, {
                    ticketId: ticket.id,
                    subject: subject,
                    category: category || 'General',
                }).catch(err => console.error('Failed to send support ticket email:', err));
            }
        } catch (emailErr) {
            console.error('Error sending support ticket email:', emailErr);
        }

        res.json({ success: true, message: 'Ticket submitted successfully', ticketId: ticket?.id });

    } catch (error) {
        console.error('Create ticket error:', error);
        res.status(500).json({ error: 'Failed to submit ticket' });
    }
});

module.exports = router;
