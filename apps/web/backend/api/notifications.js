/**
 * Notifications API
 * Push notifications and in-app notification management
 */

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { supabase } = require('../lib/supabase');

router.use(requireAuth);

/**
 * GET /api/notifications
 * Get all notifications for current user
 */
router.get('/', async (req, res) => {
    try {
        if (!supabase) {
            return res.status(503).json({ success: false, error: 'Notification source unavailable', code: 'NOTIFICATION_SOURCE_UNAVAILABLE' });
        }

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        const unread_count = (data || []).filter(n => !n.is_read).length;

        res.json({
            success: true,
            notifications: data || [],
            unread_count
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
});

/**
 * GET /api/notifications/unread-count
 */
router.get('/unread-count', async (req, res) => {
    try {
        if (!supabase) {
            return res.status(503).json({ success: false, error: 'Notification source unavailable', code: 'NOTIFICATION_SOURCE_UNAVAILABLE' });
        }

        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', req.user.id)
            .eq('is_read', false);

        if (error) throw error;

        res.json({ success: true, count: count || 0 });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch unread count' });
    }
});

/**
 * POST /api/notifications/:id/read
 * Mark a notification as read
 */
router.post('/:id/read', async (req, res) => {
    try {
        if (!supabase) {
            return res.status(503).json({ success: false, error: 'Notification source unavailable', code: 'NOTIFICATION_SOURCE_UNAVAILABLE' });
        }

        const { data, error } = await supabase
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .select('id')
            .maybeSingle();

        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, error: 'Notification not found' });

        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
    }
});

/**
 * POST /api/notifications/mark-all-read
 */
router.post('/mark-all-read', async (req, res) => {
    try {
        if (!supabase) {
            return res.status(503).json({ success: false, error: 'Notification source unavailable', code: 'NOTIFICATION_SOURCE_UNAVAILABLE' });
        }

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('user_id', req.user.id)
            .eq('is_read', false);

        if (error) throw error;

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ success: false, error: 'Failed to mark notifications as read' });
    }
});

/**
 * POST /api/notifications/push-token
 * Register push token for mobile notifications
 */
router.post('/push-token', async (req, res) => {
    try {
        const { push_token } = req.body;

        if (!push_token) {
            return res.status(400).json({ success: false, error: 'push_token is required' });
        }

        if (!supabase) {
            return res.status(503).json({ success: false, error: 'Notification source unavailable', code: 'NOTIFICATION_SOURCE_UNAVAILABLE' });
        }

        const { error } = await supabase
            .from('push_tokens')
            .upsert({
                user_id: req.user.id,
                token: push_token,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        if (error) throw error;

        res.json({ success: true, message: 'Push token registered' });
    } catch (error) {
        console.error('Error registering push token:', error);
        res.status(500).json({ success: false, error: 'Failed to register push token' });
    }
});

module.exports = router;
