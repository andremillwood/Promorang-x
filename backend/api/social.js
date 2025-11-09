/**
 * PROMORANG SOCIAL API
 * RESTful endpoints for social features
 */

const express = require('express');
const router = express.Router();
const socialService = require('../services/socialService');

// Helper functions
const sendSuccess = (res, data = {}, message) => {
  return res.json({ status: 'success', data, message });
};

const sendError = (res, statusCode, message, code) => {
  return res.status(statusCode).json({ status: 'error', message, code });
};

// Auth middleware
router.use((req, res, next) => {
  if (!req.user && process.env.NODE_ENV === 'development') {
    req.user = { id: 'demo-user-id' };
  }
  if (!req.user) {
    return sendError(res, 401, 'Unauthorized', 'UNAUTHENTICATED');
  }
  next();
});

/**
 * POST /api/social/follow/:userId
 * Follow a user
 */
router.post('/follow/:userId', async (req, res) => {
  try {
    const follow = await socialService.followUser(req.user.id, req.params.userId);
    return sendSuccess(res, { follow }, 'User followed successfully');
  } catch (error) {
    console.error('[Social API] Error following user:', error);
    return sendError(res, 500, error.message || 'Failed to follow user', 'SERVER_ERROR');
  }
});

/**
 * DELETE /api/social/follow/:userId
 * Unfollow a user
 */
router.delete('/follow/:userId', async (req, res) => {
  try {
    await socialService.unfollowUser(req.user.id, req.params.userId);
    return sendSuccess(res, {}, 'User unfollowed successfully');
  } catch (error) {
    console.error('[Social API] Error unfollowing user:', error);
    return sendError(res, 500, error.message || 'Failed to unfollow user', 'SERVER_ERROR');
  }
});

/**
 * GET /api/social/followers/:userId
 * Get user's followers
 */
router.get('/followers/:userId', async (req, res) => {
  try {
    const result = await socialService.getFollowers(req.params.userId, req.query);
    return sendSuccess(res, result);
  } catch (error) {
    console.error('[Social API] Error getting followers:', error);
    return sendError(res, 500, 'Failed to get followers', 'SERVER_ERROR');
  }
});

/**
 * GET /api/social/following/:userId
 * Get user's following
 */
router.get('/following/:userId', async (req, res) => {
  try {
    const result = await socialService.getFollowing(req.params.userId, req.query);
    return sendSuccess(res, result);
  } catch (error) {
    console.error('[Social API] Error getting following:', error);
    return sendError(res, 500, 'Failed to get following', 'SERVER_ERROR');
  }
});

/**
 * POST /api/social/connect/:userId
 * Send connection request
 */
router.post('/connect/:userId', async (req, res) => {
  try {
    const connection = await socialService.sendConnectionRequest(req.user.id, req.params.userId);
    return sendSuccess(res, { connection }, 'Connection request sent');
  } catch (error) {
    console.error('[Social API] Error sending connection request:', error);
    return sendError(res, 500, error.message || 'Failed to send connection request', 'SERVER_ERROR');
  }
});

/**
 * PATCH /api/social/connections/:connectionId/accept
 * Accept connection request
 */
router.patch('/connections/:connectionId/accept', async (req, res) => {
  try {
    const connection = await socialService.acceptConnectionRequest(req.params.connectionId, req.user.id);
    return sendSuccess(res, { connection }, 'Connection accepted');
  } catch (error) {
    console.error('[Social API] Error accepting connection:', error);
    return sendError(res, 500, error.message || 'Failed to accept connection', 'SERVER_ERROR');
  }
});

/**
 * PATCH /api/social/connections/:connectionId/reject
 * Reject connection request
 */
router.patch('/connections/:connectionId/reject', async (req, res) => {
  try {
    const connection = await socialService.rejectConnectionRequest(req.params.connectionId, req.user.id);
    return sendSuccess(res, { connection }, 'Connection rejected');
  } catch (error) {
    console.error('[Social API] Error rejecting connection:', error);
    return sendError(res, 500, error.message || 'Failed to reject connection', 'SERVER_ERROR');
  }
});

/**
 * GET /api/social/connections
 * Get user's connections
 */
router.get('/connections', async (req, res) => {
  try {
    const result = await socialService.getConnections(req.user.id, req.query);
    return sendSuccess(res, result);
  } catch (error) {
    console.error('[Social API] Error getting connections:', error);
    return sendError(res, 500, 'Failed to get connections', 'SERVER_ERROR');
  }
});

/**
 * POST /api/social/posts
 * Create a post
 */
router.post('/posts', async (req, res) => {
  try {
    const post = await socialService.createPost(req.user.id, req.body);
    return sendSuccess(res, { post }, 'Post created successfully');
  } catch (error) {
    console.error('[Social API] Error creating post:', error);
    return sendError(res, 500, error.message || 'Failed to create post', 'SERVER_ERROR');
  }
});

/**
 * GET /api/social/posts/:userId
 * Get user's posts
 */
router.get('/posts/:userId', async (req, res) => {
  try {
    const result = await socialService.getUserPosts(req.params.userId, req.query);
    return sendSuccess(res, result);
  } catch (error) {
    console.error('[Social API] Error getting posts:', error);
    return sendError(res, 500, 'Failed to get posts', 'SERVER_ERROR');
  }
});

/**
 * GET /api/social/feed
 * Get personalized feed
 */
router.get('/feed', async (req, res) => {
  try {
    const result = await socialService.getFeed(req.user.id, req.query);
    return sendSuccess(res, result);
  } catch (error) {
    console.error('[Social API] Error getting feed:', error);
    return sendError(res, 500, 'Failed to get feed', 'SERVER_ERROR');
  }
});

/**
 * POST /api/social/reactions
 * Add reaction
 */
router.post('/reactions', async (req, res) => {
  try {
    const reaction = await socialService.addReaction(req.user.id, req.body);
    return sendSuccess(res, { reaction }, 'Reaction added');
  } catch (error) {
    console.error('[Social API] Error adding reaction:', error);
    return sendError(res, 500, error.message || 'Failed to add reaction', 'SERVER_ERROR');
  }
});

/**
 * DELETE /api/social/reactions
 * Remove reaction
 */
router.delete('/reactions', async (req, res) => {
  try {
    const { target_type, target_id, reaction_type } = req.query;
    await socialService.removeReaction(req.user.id, target_type, target_id, reaction_type);
    return sendSuccess(res, {}, 'Reaction removed');
  } catch (error) {
    console.error('[Social API] Error removing reaction:', error);
    return sendError(res, 500, error.message || 'Failed to remove reaction', 'SERVER_ERROR');
  }
});

/**
 * POST /api/social/comments
 * Add comment
 */
router.post('/comments', async (req, res) => {
  try {
    const comment = await socialService.addComment(req.user.id, req.body);
    return sendSuccess(res, { comment }, 'Comment added');
  } catch (error) {
    console.error('[Social API] Error adding comment:', error);
    return sendError(res, 500, error.message || 'Failed to add comment', 'SERVER_ERROR');
  }
});

/**
 * GET /api/social/comments
 * Get comments
 */
router.get('/comments', async (req, res) => {
  try {
    const { target_type, target_id } = req.query;
    const result = await socialService.getComments(target_type, target_id, req.query);
    return sendSuccess(res, result);
  } catch (error) {
    console.error('[Social API] Error getting comments:', error);
    return sendError(res, 500, 'Failed to get comments', 'SERVER_ERROR');
  }
});

/**
 * GET /api/social/notifications
 * Get user notifications
 */
router.get('/notifications', async (req, res) => {
  try {
    const result = await socialService.getNotifications(req.user.id, req.query);
    return sendSuccess(res, result);
  } catch (error) {
    console.error('[Social API] Error getting notifications:', error);
    return sendError(res, 500, 'Failed to get notifications', 'SERVER_ERROR');
  }
});

/**
 * PATCH /api/social/notifications/:notificationId/read
 * Mark notification as read
 */
router.patch('/notifications/:notificationId/read', async (req, res) => {
  try {
    const notification = await socialService.markNotificationRead(req.params.notificationId, req.user.id);
    return sendSuccess(res, { notification }, 'Notification marked as read');
  } catch (error) {
    console.error('[Social API] Error marking notification read:', error);
    return sendError(res, 500, 'Failed to mark notification read', 'SERVER_ERROR');
  }
});

/**
 * POST /api/social/notifications/read-all
 * Mark all notifications as read
 */
router.post('/notifications/read-all', async (req, res) => {
  try {
    await socialService.markAllNotificationsRead(req.user.id);
    return sendSuccess(res, {}, 'All notifications marked as read');
  } catch (error) {
    console.error('[Social API] Error marking all notifications read:', error);
    return sendError(res, 500, 'Failed to mark all notifications read', 'SERVER_ERROR');
  }
});

module.exports = router;
