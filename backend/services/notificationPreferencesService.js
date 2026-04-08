const { supabase } = require('../config/supabase');

/**
 * Notification Preferences Service
 * Manages user preferences for email notifications and digest frequency
 */

/**
 * Get user notification preferences
 * @param {string} userId - User ID
 * @returns {object} Notification preferences
 */
async function getPreferences(userId) {
    try {
        const { data, error } = await supabase
            .from('notification_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

        // If no preferences exist, create default ones
        if (error && error.code === 'PGRST116') {
            return await createDefaultPreferences(userId);
        }

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching notification preferences:', error);
        throw error;
    }
}

/**
 * Update user notification preferences
 * @param {string} userId - User ID
 * @param {object} preferences - Preference updates
 * @returns {object} Updated preferences
 */
async function updatePreferences(userId, preferences) {
    try {
        const { data, error } = await supabase
            .from('notification_preferences')
            .upsert({
                user_id: userId,
                ...preferences,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating notification preferences:', error);
        throw error;
    }
}

/**
 * Create default notification preferences for a user
 * @param {string} userId - User ID
 * @returns {object} Default preferences
 */
async function createDefaultPreferences(userId) {
    try {
        const { data, error } = await supabase
            .from('notification_preferences')
            .insert({
                user_id: userId,
                email_low_stock: true,
                email_redemptions: true,
                email_payouts: true,
                email_budget_alerts: true,
                email_weekly_summary: true,
                digest_frequency: 'immediate'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating default preferences:', error);
        throw error;
    }
}

/**
 * Check if user wants to receive a specific notification type
 * @param {string} userId - User ID
 * @param {string} notificationType - Type of notification
 * @returns {boolean} Whether user wants this notification
 */
async function shouldSendNotification(userId, notificationType) {
    try {
        const preferences = await getPreferences(userId);

        const preferenceMap = {
            'low_stock': preferences.email_low_stock,
            'redemption': preferences.email_redemptions,
            'payout': preferences.email_payouts,
            'budget_alert': preferences.email_budget_alerts,
            'weekly_summary': preferences.email_weekly_summary
        };

        return preferenceMap[notificationType] !== false;
    } catch (error) {
        console.error('Error checking notification preference:', error);
        // Default to true if we can't check preferences
        return true;
    }
}

/**
 * Get email history for a user
 * @param {string} userId - User ID
 * @param {object} options - Query options
 * @returns {array} Email logs
 */
async function getEmailHistory(userId, options = {}) {
    const { limit = 50, offset = 0, emailType } = options;

    try {
        let query = supabase
            .from('email_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (emailType) {
            query = query.eq('email_type', emailType);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Error fetching email history:', error);
        throw error;
    }
}

module.exports = {
    getPreferences,
    updatePreferences,
    createDefaultPreferences,
    shouldSendNotification,
    getEmailHistory
};
