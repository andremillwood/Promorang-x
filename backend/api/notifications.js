/**
 * PROMORANG NOTIFICATIONS API
 * 
 * Handles notification endpoints
 */

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { supabase } = require('../lib/supabase');

router.use(requireAuth);
router.use((req, res, next) => {
    if (!supabase) {
        return res.status(503).json({ success: false, error: 'Notification source unavailable', code: 'NOTIFICATION_SOURCE_UNAVAILABLE' });
    }
    next();
});

/**
 * GET /api/notifications/unread-count
 * Get the count of unread notifications
 */
router.get('/unread-count', async (req, res) => {
    try {
        const { count, error } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', req.user.id).eq('is_read', false);
        if (error) throw error;
        res.json({ success: true, count: count || 0 });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch unread count' });
    }
});

/**
 * GET /api/notifications
 * Get all notifications for the current user
 */
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase.from('notifications').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(50);
        if (error) throw error;
        const notifications = data || [];
        res.json({
            success: true,
            notifications,
            unread_count: notifications.filter(notification => !notification.is_read).length
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
});

/**
 * POST /api/notifications/:id/read
 * Mark a notification as read
 */
router.post('/:id/read', async (req, res) => {
    try {
        const { data, error } = await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', req.params.id).eq('user_id', req.user.id).select('id').maybeSingle();
        if (error) throw error;
        if (!data) return res.status(404).json({ success: false, error: 'Notification not found' });
        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
    }
});

/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read
 */
router.post('/mark-all-read', async (req, res) => {
    try {
        const { error } = await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('user_id', req.user.id).eq('is_read', false);
        if (error) throw error;
        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ success: false, error: 'Failed to mark notifications as read' });
    }
});

/**
 * POST /api/notifications/push-token
 * Register or update push token for push notifications
 */
router.post('/push-token', async (req, res) => {
    try {
        const userId = req.user.id;
        const { push_token } = req.body;

        if (!push_token) {
            return res.status(400).json({ success: false, error: 'push_token is required' });
        }

        // Validate Expo token format
        if (!push_token.startsWith('ExponentPushToken')) {
            return res.status(400).json({ success: false, error: 'Invalid push token format' });
        }

        const notificationService = require('../services/notificationService');
        const result = await notificationService.registerPushToken(userId, push_token);

        if (result.success) {
            res.json({ success: true, message: 'Push token registered' });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        console.error('Error registering push token:', error);
        res.status(500).json({ success: false, error: 'Failed to register push token' });
    }
});

/**
 * GET /api/notifications/preferences
 * Get user notification preferences
 */
router.get('/preferences', async (req, res) => {
    try {
        const notificationPreferencesService = require('../services/notificationPreferencesService');
        const preferences = await notificationPreferencesService.getPreferences(req.user.id);
        res.json({ success: true, preferences });
    } catch (error) {
        console.error('Error fetching preferences:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch preferences' });
    }
});

/**
 * PUT /api/notifications/preferences
 * Update notification preferences
 */
router.put('/preferences', async (req, res) => {
    try {
        const notificationPreferencesService = require('../services/notificationPreferencesService');
        const preferences = await notificationPreferencesService.updatePreferences(
            req.user.id,
            req.body
        );
        res.json({ success: true, preferences });
    } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({ success: false, error: 'Failed to update preferences' });
    }
});

/**
 * GET /api/notifications/history
 * Get email history
 */
router.get('/history', async (req, res) => {
    try {
        const { limit, offset, emailType } = req.query;
        const notificationPreferencesService = require('../services/notificationPreferencesService');

        const history = await notificationPreferencesService.getEmailHistory(
            req.user.id,
            {
                limit: parseInt(limit) || 50,
                offset: parseInt(offset) || 0,
                emailType
            }
        );

        res.json({ success: true, history });
    } catch (error) {
        console.error('Error fetching email history:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch email history' });
    }
});

module.exports = router;
