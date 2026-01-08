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

module.exports = router;
