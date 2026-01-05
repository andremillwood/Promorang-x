const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../lib/auth');

// Apply auth middleware
router.use(authMiddleware);

// Get all notifications for the current user
router.get('/', async (req, res) => {
    try {
        const { limit = 20, offset = 0, unread_only } = req.query;

        if (!supabase) {
            // Return demo notifications
            const now = Date.now();
            return res.json({
                success: true,
                notifications: [
                    {
                        id: 1,
                        user_id: req.user.id,
                        type: 'drop_approved',
                        title: 'Drop Application Approved!',
                        message: 'Your application for "Instagram Post Review" has been approved. You earned 25 gems!',
                        read: false,
                        metadata: { drop_id: 123, gems_earned: 25 },
                        created_at: new Date(now - 2 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: 2,
                        user_id: req.user.id,
                        type: 'reward_earned',
                        title: 'Milestone Reward!',
                        message: 'Congratulations! You reached 1,000 followers and earned 50 bonus gems.',
                        read: false,
                        metadata: { milestone: 'followers', threshold: 1000, gems: 50 },
                        created_at: new Date(now - 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: 3,
                        user_id: req.user.id,
                        type: 'content_share',
                        title: 'Someone invested in your content!',
                        message: 'A user purchased 10 shares of your viral video.',
                        read: true,
                        metadata: { content_id: 456, shares: 10 },
                        created_at: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString()
                    }
                ],
                total: 3,
                unread_count: 2
            });
        }

        let query = supabase
            .from('notifications')
            .select('*', { count: 'exact' })
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

        if (unread_only === 'true') {
            query = query.eq('read', false);
        }

        const { data: notifications, error, count } = await query;

        if (error) {
            console.error('Database error fetching notifications:', error);
            return res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
        }

        // Get unread count
        const { count: unreadCount } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', req.user.id)
            .eq('read', false);

        res.json({
            success: true,
            notifications: notifications || [],
            total: count || 0,
            unread_count: unreadCount || 0
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
});

// Mark notification as read
router.post('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;

        if (!supabase) {
            return res.json({
                success: true,
                message: 'Notification marked as read'
            });
        }

        const { error } = await supabase
            .from('notifications')
            .update({ read: true, read_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', req.user.id);

        if (error) {
            console.error('Database error marking notification as read:', error);
            return res.status(500).json({ success: false, error: 'Failed to update notification' });
        }

        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ success: false, error: 'Failed to update notification' });
    }
});

// Mark all notifications as read
router.post('/read-all', async (req, res) => {
    try {
        if (!supabase) {
            return res.json({
                success: true,
                message: 'All notifications marked as read'
            });
        }

        const { error } = await supabase
            .from('notifications')
            .update({ read: true, read_at: new Date().toISOString() })
            .eq('user_id', req.user.id)
            .eq('read', false);

        if (error) {
            console.error('Database error marking all notifications as read:', error);
            return res.status(500).json({ success: false, error: 'Failed to update notifications' });
        }

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ success: false, error: 'Failed to update notifications' });
    }
});

// Get unread notification count
router.get('/unread-count', async (req, res) => {
    try {
        if (!supabase) {
            return res.json({ success: true, count: 2 });
        }

        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', req.user.id)
            .eq('read', false);

        if (error) {
            console.error('Database error fetching unread count:', error);
            return res.status(500).json({ success: false, error: 'Failed to fetch count' });
        }

        res.json({ success: true, count: count || 0 });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch count' });
    }
});

module.exports = router;
