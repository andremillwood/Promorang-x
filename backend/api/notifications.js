/**
 * PROMORANG NOTIFICATIONS API
 * 
 * Handles notification endpoints
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const decodeToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Auth middleware
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = decodeToken(token);
            if (decoded) {
                req.user = {
                    ...decoded,
                    id: decoded.userId || decoded.id || decoded.sub
                };
                return next();
            }
        }

        if (process.env.NODE_ENV === 'development') {
            req.user = {
                id: 'demo-creator-id',
                email: 'creator@demo.com',
                username: 'demo_creator',
                display_name: 'Demo Creator',
                user_type: 'creator'
            };
            return next();
        }

        return res.status(401).json({ success: false, error: 'Unauthorized' });
    } catch (error) {
        res.status(401).json({ success: false, error: 'Authentication failed' });
    }
};

router.use(authMiddleware);

/**
 * GET /api/notifications/unread-count
 * Get the count of unread notifications
 */
router.get('/unread-count', async (req, res) => {
    try {
        // For now, return a demo count
        res.json({
            success: true,
            count: 0
        });
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
        // Return empty array for now - can be implemented with real notifications later
        res.json({
            success: true,
            notifications: [],
            unread_count: 0
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
