const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

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

        const { error } = await supabase
            .from('support_tickets')
            .insert({
                user_id: req.user.id,
                subject,
                category,
                message,
                priority
            });

        if (error) throw error;

        res.json({ success: true, message: 'Ticket submitted successfully' });

    } catch (error) {
        console.error('Create ticket error:', error);
        res.status(500).json({ error: 'Failed to submit ticket' });
    }
});

module.exports = router;
