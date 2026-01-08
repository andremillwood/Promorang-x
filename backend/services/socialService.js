/**
 * PROMORANG SOCIAL SERVICE
 * Comprehensive social features: follows, connections, feed, reactions, comments
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const economyService = require('./economyService');
const supabase = global.supabase || serviceSupabase || null;

/**
 * Follow a user
 */
async function followUser(followerId, followingId) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  if (followerId === followingId) {
    throw new Error('Cannot follow yourself');
  }

  try {
    const { data, error } = await supabase
      .from('user_follows')
      .insert({
        follower_id: followerId,
        following_id: followingId,
      })
      .select()
      .single();

    if (error) throw error;

    // Economy: Award points for following (10 points)
    try {
      await economyService.addCurrency(followerId, 'points', 10, 'social_registration', data.id, 'Followed user');
    } catch (ecoError) {
      console.error('[Social Service] Failed to award points for follow:', ecoError.message);
    }

    return data;
  } catch (error) {
    console.error('[Social Service] Error following user:', error);
    throw error;
  }
}

/**
 * Unfollow a user
 */
async function unfollowUser(followerId, followingId) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('[Social Service] Error unfollowing user:', error);
    throw error;
  }
}

/**
 * Get user's followers
 */
async function getFollowers(userId, options = {}) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  const { limit = 50, offset = 0 } = options;

  try {
    const { data, error, count } = await supabase
      .from('user_follows')
      .select(`
        *,
        follower:users!user_follows_follower_id_fkey(id, username, display_name, profile_image, is_verified)
      `, { count: 'exact' })
      .eq('following_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      followers: data.map(f => f.follower),
      total: count,
      limit,
      offset,
    };
  } catch (error) {
    console.error('[Social Service] Error getting followers:', error);
    throw error;
  }
}

/**
 * Get user's following
 */
async function getFollowing(userId, options = {}) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  const { limit = 50, offset = 0 } = options;

  try {
    const { data, error, count } = await supabase
      .from('user_follows')
      .select(`
        *,
        following:users!user_follows_following_id_fkey(id, username, display_name, profile_image, is_verified)
      `, { count: 'exact' })
      .eq('follower_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      following: data.map(f => f.following),
      total: count,
      limit,
      offset,
    };
  } catch (error) {
    console.error('[Social Service] Error getting following:', error);
    throw error;
  }
}

/**
 * Send connection request
 */
async function sendConnectionRequest(requesterId, receiverId) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  if (requesterId === receiverId) {
    throw new Error('Cannot connect with yourself');
  }

  try {
    const { data, error } = await supabase
      .from('user_connections')
      .insert({
        requester_id: requesterId,
        receiver_id: receiverId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Social Service] Error sending connection request:', error);
    throw error;
  }
}

/**
 * Accept connection request
 */
async function acceptConnectionRequest(connectionId, userId) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    const { data, error } = await supabase
      .from('user_connections')
      .update({ status: 'accepted' })
      .eq('id', connectionId)
      .eq('receiver_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Social Service] Error accepting connection:', error);
    throw error;
  }
}

/**
 * Reject connection request
 */
async function rejectConnectionRequest(connectionId, userId) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    const { data, error } = await supabase
      .from('user_connections')
      .update({ status: 'rejected' })
      .eq('id', connectionId)
      .eq('receiver_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Social Service] Error rejecting connection:', error);
    throw error;
  }
}

/**
 * Get user's connections
 */
async function getConnections(userId, options = {}) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  const { limit = 50, offset = 0 } = options;

  try {
    const { data, error, count } = await supabase
      .from('user_connections')
      .select(`
        *,
        requester:users!user_connections_requester_id_fkey(id, username, display_name, profile_image, is_verified),
        receiver:users!user_connections_receiver_id_fkey(id, username, display_name, profile_image, is_verified)
      `, { count: 'exact' })
      .eq('status', 'accepted')
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const connections = data.map(conn => {
      return conn.requester_id === userId ? conn.receiver : conn.requester;
    });

    return {
      connections,
      total: count,
      limit,
      offset,
    };
  } catch (error) {
    console.error('[Social Service] Error getting connections:', error);
    throw error;
  }
}

/**
 * Create a post
 */
async function createPost(userId, postData) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  const { content, images, link_url, post_type = 'text', visibility = 'public' } = postData;

  try {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        content,
        images: images || [],
        link_url,
        post_type,
        visibility,
      })
      .select()
      .single();

    if (error) throw error;

    // Create activity feed entry
    await createActivity(userId, {
      activity_type: 'post',
      source_id: data.id,
      source_table: 'posts',
      title: 'Created a post',
      description: content?.substring(0, 200),
      visibility,
    });

    // PromoShare Ticket
    try {
      const promoShareService = require('./promoShareService');
      await promoShareService.awardTicket(userId, 'create_post', data.id);
    } catch (promoError) {
      console.error('[Social Service] Failed to award ticket for post:', promoError.message);
    }

    return data;
  } catch (error) {
    console.error('[Social Service] Error creating post:', error);
    throw error;
  }
}

/**
 * Get user's posts
 */
async function getUserPosts(userId, options = {}) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  const { limit = 20, offset = 0 } = options;

  try {
    const { data, error, count } = await supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      posts: data,
      total: count,
      limit,
      offset,
    };
  } catch (error) {
    console.error('[Social Service] Error getting posts:', error);
    throw error;
  }
}

/**
 * Create activity
 */
async function createActivity(userId, activityData) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    const { data, error } = await supabase
      .from('activity_feed')
      .insert({
        user_id: userId,
        ...activityData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Social Service] Error creating activity:', error);
    throw error;
  }
}

/**
 * Get personalized feed
 */
async function getFeed(userId, options = {}) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  const { limit = 50, offset = 0 } = options;

  try {
    // Get activities from user and followed users
    const { data, error, count } = await supabase
      .rpc('get_user_feed', {
        p_user_id: userId,
        p_limit: limit,
      });

    if (error) throw error;

    // Enrich with user data
    const enrichedData = await Promise.all(
      data.map(async (activity) => {
        const { data: user } = await supabase
          .from('users')
          .select('id, username, display_name, profile_image, is_verified')
          .eq('id', activity.user_id)
          .single();

        return {
          ...activity,
          user,
        };
      })
    );

    return {
      activities: enrichedData,
      total: count || data.length,
      limit,
      offset,
    };
  } catch (error) {
    console.error('[Social Service] Error getting feed:', error);
    throw error;
  }
}

/**
 * Add reaction
 */
async function addReaction(userId, reactionData) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  const { target_type, target_id, reaction_type = 'like' } = reactionData;

  try {
    const { data, error } = await supabase
      .from('reactions')
      .insert({
        user_id: userId,
        target_type,
        target_id,
        reaction_type,
      })
      .select()
      .single();

    if (error) throw error;

    // Economy: Award points for like (1 point)
    try {
      const points = reaction_type === 'like' ? 1 : 0;
      if (points > 0) {
        await economyService.addCurrency(userId, 'points', points, 'moves', data.id, `Reaction: ${reaction_type}`);

        // PromoShare Ticket
        const promoShareService = require('./promoShareService');
        await promoShareService.awardTicket(userId, 'social_reaction', data.id);
      }
    } catch (ecoError) {
      console.error('[Social Service] Failed to award rewards for reaction:', ecoError.message);
    }

    return data;
  } catch (error) {
    console.error('[Social Service] Error adding reaction:', error);
    throw error;
  }
}

/**
 * Remove reaction
 */
async function removeReaction(userId, targetType, targetId, reactionType = 'like') {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('user_id', userId)
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .eq('reaction_type', reactionType);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('[Social Service] Error removing reaction:', error);
    throw error;
  }
}

/**
 * Add comment
 */
async function addComment(userId, commentData) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  const { target_type, target_id, comment_text, parent_comment_id } = commentData;

  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: userId,
        target_type,
        target_id,
        comment_text,
        parent_comment_id,
      })
      .select()
      .single();

    if (error) throw error;

    // Economy: Award points for comment (5 points)
    try {
      await economyService.addCurrency(userId, 'points', 5, 'moves', data.id, 'Commented on content');

      // PromoShare Ticket
      const promoShareService = require('./promoShareService');
      await promoShareService.awardTicket(userId, 'social_comment', data.id);
    } catch (ecoError) {
      console.error('[Social Service] Failed to award rewards for comment:', ecoError.message);
    }

    return data;
  } catch (error) {
    console.error('[Social Service] Error adding comment:', error);
    throw error;
  }
}

/**
 * Get comments
 */
async function getComments(targetType, targetId, options = {}) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  const { limit = 50, offset = 0 } = options;

  try {
    const { data, error, count } = await supabase
      .from('comments')
      .select(`
        *,
        user:users(id, username, display_name, profile_image, is_verified)
      `, { count: 'exact' })
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .eq('is_deleted', false)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      comments: data,
      total: count,
      limit,
      offset,
    };
  } catch (error) {
    console.error('[Social Service] Error getting comments:', error);
    throw error;
  }
}

/**
 * Get user notifications
 */
async function getNotifications(userId, options = {}) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  const { limit = 50, offset = 0, unread_only = false } = options;

  try {
    let query = supabase
      .from('notifications')
      .select(`
        *,
        actor:users!notifications_actor_id_fkey(id, username, display_name, profile_image)
      `, { count: 'exact' })
      .eq('user_id', userId);

    if (unread_only) {
      query = query.eq('is_read', false);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      notifications: data,
      total: count,
      unread_count: unread_only ? count : await getUnreadCount(userId),
      limit,
      offset,
    };
  } catch (error) {
    console.error('[Social Service] Error getting notifications:', error);
    throw error;
  }
}

/**
 * Get unread notifications count
 */
async function getUnreadCount(userId) {
  if (!supabase) {
    return 0;
  }

  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('[Social Service] Error getting unread count:', error);
    return 0;
  }
}

/**
 * Mark notification as read
 */
async function markNotificationRead(notificationId, userId) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Social Service] Error marking notification read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 */
async function markAllNotificationsRead(userId) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('[Social Service] Error marking all notifications read:', error);
    throw error;
  }
}

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getConnections,
  createPost,
  getUserPosts,
  createActivity,
  getFeed,
  addReaction,
  removeReaction,
  addComment,
  getComments,
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
};
