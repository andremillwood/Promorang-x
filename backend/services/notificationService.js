/**
 * PROMORANG NOTIFICATION SERVICE
 * 
 * Service for sending push notifications to mobile users.
 * Uses Expo Push Notifications API.
 * 
 * In production, this would connect to:
 * - Expo Push Notifications (for Expo apps)
 * - Firebase Cloud Messaging (for Android)
 * - Apple Push Notification Service (for iOS)
 */

const supabase = require('../supabase');

// Expo Push API endpoint
const EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';

/**
 * Send a push notification to a single user
 * @param {string} userId - User ID
 * @param {object} notification - { title, body, data }
 */
async function sendToUser(userId, notification) {
    try {
        // Get user's push token
        const { data: user, error } = await supabase
            .from('users')
            .select('push_token, display_name')
            .eq('id', userId)
            .single();

        if (error || !user?.push_token) {
            console.log(`[Notifications] No push token for user ${userId}`);
            return { sent: false, reason: 'no_token' };
        }

        return await sendPushNotification(user.push_token, notification);
    } catch (err) {
        console.error('[Notifications] Error sending to user:', err);
        return { sent: false, reason: 'error', error: err.message };
    }
}

/**
 * Send push notification to an Expo push token
 */
async function sendPushNotification(pushToken, { title, body, data = {} }) {
    // Skip if not a valid Expo token
    if (!pushToken?.startsWith('ExponentPushToken')) {
        console.log('[Notifications] Invalid push token format');
        return { sent: false, reason: 'invalid_token' };
    }

    try {
        const response = await fetch(EXPO_PUSH_ENDPOINT, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: pushToken,
                title,
                body,
                data,
                sound: 'default',
                badge: 1,
                priority: 'high',
            }),
        });

        const result = await response.json();

        if (result.data?.status === 'ok') {
            console.log(`[Notifications] Sent: ${title}`);
            return { sent: true, ticketId: result.data.id };
        } else {
            console.log('[Notifications] Push failed:', result);
            return { sent: false, reason: 'expo_error', details: result };
        }
    } catch (err) {
        console.error('[Notifications] Push request failed:', err);
        return { sent: false, reason: 'request_failed', error: err.message };
    }
}

/**
 * Notify user about today's opportunity
 * Called when daily headline resets at 10:00 UTC
 */
async function notifyDailyReset(userId, headline) {
    const title = "Today's Opportunity";
    const body = headline?.title || "A new featured drop is waiting for you!";

    return await sendToUser(userId, {
        title,
        body,
        data: {
            type: 'daily_reset',
            route: '/today',
            headline_type: headline?.type,
        }
    });
}

/**
 * Notify user about draw results
 */
async function notifyDrawResult(userId, result) {
    if (!result.won) {
        // Only notify winners for now
        return { sent: false, reason: 'not_winner' };
    }

    const title = "🎉 You Won!";
    const body = `You won ${result.prize_amount} ${result.prize_type} in today's draw!`;

    return await sendToUser(userId, {
        title,
        body,
        data: {
            type: 'draw_result',
            route: '/today',
            prize_type: result.prize_type,
            prize_amount: result.prize_amount,
        }
    });
}

/**
 * Notify user about streak at risk
 */
async function notifyStreakAtRisk(userId, streakDays) {
    const title = "🔥 Streak at Risk!";
    const body = `Don't lose your ${streakDays}-day streak! Log in today.`;

    return await sendToUser(userId, {
        title,
        body,
        data: {
            type: 'streak_reminder',
            route: '/today',
        }
    });
}

/**
 * Batch notify all active users about daily reset
 * Called by cron job at 10:00 UTC
 */
async function notifyAllDailyReset(headline) {
    try {
        // Get users with push tokens who opted-in for notifications
        const { data: users, error } = await supabase
            .from('users')
            .select('id, push_token')
            .not('push_token', 'is', null)
            .eq('notifications_enabled', true)
            .limit(1000); // Process in batches

        if (error || !users?.length) {
            console.log('[Notifications] No users to notify');
            return { sent: 0 };
        }

        console.log(`[Notifications] Sending daily reset to ${users.length} users`);

        // Batch send (Expo supports up to 100 per request)
        const tokens = users.map(u => u.push_token).filter(t => t?.startsWith('ExponentPushToken'));

        if (tokens.length === 0) {
            return { sent: 0 };
        }

        const response = await fetch(EXPO_PUSH_ENDPOINT, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tokens.map(token => ({
                to: token,
                title: "Today's Opportunity",
                body: headline?.title || "A new featured drop is waiting!",
                data: { type: 'daily_reset', route: '/today' },
                sound: 'default',
            }))),
        });

        const result = await response.json();
        const sentCount = result.data?.filter(r => r.status === 'ok').length || 0;

        console.log(`[Notifications] Daily reset sent to ${sentCount}/${tokens.length} users`);
        return { sent: sentCount };
    } catch (err) {
        console.error('[Notifications] Batch send failed:', err);
        return { sent: 0, error: err.message };
    }
}

/**
 * Register/update a user's push token
 */
async function registerPushToken(userId, pushToken) {
    try {
        const { error } = await supabase
            .from('users')
            .update({
                push_token: pushToken,
                push_token_updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) throw error;

        console.log(`[Notifications] Token registered for user ${userId}`);
        return { success: true };
    } catch (err) {
        console.error('[Notifications] Token registration failed:', err);
        return { success: false, error: err.message };
    }
}

module.exports = {
    sendToUser,
    notifyDailyReset,
    notifyDrawResult,
    notifyStreakAtRisk,
    notifyAllDailyReset,
    registerPushToken,
};
