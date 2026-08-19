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

/** POST /api/support/commerce-cases — report a problem against a durable receipt. */
router.post('/commerce-cases', async (req, res) => {
    try {
        const { receipt_id, reason, message, evidence = [] } = req.body || {};
        const allowedReasons = ['reward_not_honoured', 'code_failed', 'merchant_closed', 'offer_differed', 'purchase_problem', 'other'];
        if (!receipt_id || !allowedReasons.includes(reason) || !message) return res.status(422).json({ error: 'Receipt, valid reason, and details are required' });
        const { data: receipt, error: receiptError } = await supabase.from('commerce_receipts').select('id,user_id,merchant_id,listing_id,status,merchant_products:listing_id(name,merchant_id)').eq('id', receipt_id).eq('user_id', req.user.id).single();
        if (receiptError || !receipt) return res.status(404).json({ error: 'Receipt not found' });
        const now = new Date();
        const dueAt = new Date(now.getTime() + 18 * 60 * 60 * 1000).toISOString();
        const { data: ticket, error } = await supabase.from('support_tickets').insert({
            user_id: req.user.id, merchant_id: receipt.merchant_id || receipt.merchant_products?.merchant_id, receipt_id: receipt.id,
            category: 'billing', subject: `${receipt.merchant_products?.name || 'Commerce'} · ${reason.replaceAll('_', ' ')}`,
            message, priority: 'high', commerce_reason: reason, evidence, last_user_reply_at: now.toISOString(),
            sla_due_at: dueAt, merchant_response_due_at: dueAt,
        }).select().single();
        if (error) {
            if (error.code === '23505') return res.status(409).json({ error: 'An open case already exists for this receipt' });
            throw error;
        }
        await supabase.from('support_ticket_events').insert({ ticket_id: ticket.id, actor_id: req.user.id, actor_type: 'user', event_type: 'created', new_status: ticket.status, message, metadata: { receipt_id, reason, evidence } });
        res.status(201).json({ success: true, ticket });
    } catch (error) {
        console.error('Create commerce case error:', error);
        res.status(500).json({ error: error.message || 'Failed to create commerce case' });
    }
});

/** GET /api/support/merchant/commerce-cases — merchant response queue. */
router.get('/merchant/commerce-cases', async (req, res) => {
    try {
        const { data, error } = await supabase.from('support_tickets')
            .select('*, events:support_ticket_events(*), receipt:commerce_receipts(id,receipt_type,status,amount,currency,redemption_code,occurred_at,merchant_products:listing_id(name,image_url))')
            .eq('merchant_id', req.user.id).order('created_at', { ascending: false }).limit(50);
        if (error) throw error;
        res.json({ cases: data || [] });
    } catch (error) { res.status(500).json({ error: error.message || 'Failed to load merchant cases' }); }
});

/** POST /api/support/merchant/commerce-cases/:id/respond — auditable merchant response. */
router.post('/merchant/commerce-cases/:id/respond', async (req, res) => {
    try {
        const { message, proposed_resolution } = req.body || {};
        if (!message) return res.status(422).json({ error: 'A response is required' });
        const { data: ticket, error: fetchError } = await supabase.from('support_tickets').select('*').eq('id', req.params.id).eq('merchant_id', req.user.id).single();
        if (fetchError || !ticket) return res.status(404).json({ error: 'Case not found' });
        const now = new Date().toISOString();
        const resolution = { ...(ticket.resolution || {}), merchant_response: message, proposed_resolution: proposed_resolution || null, merchant_responded_at: now };
        const { data, error } = await supabase.from('support_tickets').update({ status: 'in_progress', resolution, last_admin_reply_at: now }).eq('id', ticket.id).eq('merchant_id', req.user.id).select().single();
        if (error) throw error;
        await supabase.from('support_ticket_events').insert({ ticket_id: ticket.id, actor_id: req.user.id, actor_type: 'system', event_type: 'note', previous_status: ticket.status, new_status: 'in_progress', message, metadata: { merchant_response: true, proposed_resolution } });
        res.json({ case: data });
    } catch (error) { res.status(500).json({ error: error.message || 'Failed to respond to case' }); }
});

/** POST /api/support/commerce-cases/:id/appeal — reopen the same auditable case once. */
router.post('/commerce-cases/:id/appeal', async (req, res) => {
    try {
        const { message } = req.body || {};
        if (!String(message || '').trim()) return res.status(422).json({ error: 'Tell us why the outcome needs another review' });
        const { data: ticket, error: fetchError } = await supabase.from('support_tickets').select('*').eq('id', req.params.id).eq('user_id', req.user.id).single();
        if (fetchError || !ticket || !ticket.receipt_id) return res.status(404).json({ error: 'Commerce case not found' });
        if (!['resolved','closed'].includes(ticket.status)) return res.status(409).json({ error: 'This case is already under review' });
        if (ticket.resolution?.appealed_at) return res.status(409).json({ error: 'This resolution has already been appealed' });
        const now = new Date().toISOString();
        const resolution = { ...(ticket.resolution || {}), appealed_at: now, appeal_message: message.trim() };
        const { data, error } = await supabase.from('support_tickets').update({ status: 'in_progress', resolution, resolved_at: null, last_user_reply_at: now, sla_due_at: new Date(Date.now() + 24*60*60*1000).toISOString(), updated_at: now }).eq('id', ticket.id).select().single();
        if (error) throw error;
        await supabase.from('support_ticket_events').insert({ ticket_id: ticket.id, actor_id: req.user.id, actor_type: 'user', event_type: 'user_reply', previous_status: ticket.status, new_status: 'in_progress', message: message.trim(), metadata: { appeal: true } });
        res.json({ success: true, ticket: data });
    } catch (error) { res.status(500).json({ error: error.message || 'Failed to appeal resolution' }); }
});

module.exports = router;
