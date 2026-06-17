const { supabase } = require('../lib/supabase');

const promoShareAuditService = {
    async auditLog(cycleId, userId, actionType, actorType, actorId, payload) {
        if (!supabase) return null;

        try {
            const { data } = await supabase
                .from('promoshare_audit_log')
                .insert({
                    cycle_id: cycleId,
                    user_id: userId,
                    action_type: actionType,
                    actor_type: actorType,
                    actor_id: actorId,
                    payload: payload || {}
                })
                .select()
                .single();

            return data;
        } catch (error) {
            console.error('[PromoShare] Audit log error:', error);
            return null;
        }
    },

    async queueNotification(cycleId, userId, notificationType, data) {
        if (!supabase) return null;

        try {
            const { data: notification } = await supabase
                .from('promoshare_notifications')
                .insert({
                    cycle_id: cycleId,
                    user_id: userId,
                    notification_type: notificationType,
                    title: data.title,
                    message: data.message,
                    action_url: data.action_url,
                    channels: data.channels || ['in_app'],
                    metadata: data.metadata || {}
                })
                .select()
                .single();

            return notification;
        } catch (error) {
            console.error('[PromoShare] Notification queue error:', error);
            return null;
        }
    },

    async getAuditLog(cycleId, options = {}) {
        if (!supabase) return [];

        let query = supabase
            .from('promoshare_audit_log')
            .select('*')
            .eq('cycle_id', cycleId)
            .order('created_at', { ascending: false });

        if (options.limit) {
            query = query.limit(options.limit);
        }

        if (options.action_type) {
            query = query.eq('action_type', options.action_type);
        }

        const { data } = await query;
        return data || [];
    }
};

module.exports = promoShareAuditService;
