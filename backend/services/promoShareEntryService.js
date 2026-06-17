const { supabase } = require('../lib/supabase');

const promoShareEntryService = {
    async recordEntry(cycleId, userId, entryData) {
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('promoshare_entries')
            .upsert({
                cycle_id: cycleId,
                user_id: userId,
                source_type: entryData.source_type,
                source_action: entryData.source_action,
                source_id: entryData.source_id,
                entry_count: entryData.entry_count || 1,
                weight_value: entryData.weight_value || 1,
                metadata: entryData.metadata || {}
            }, {
                onConflict: 'cycle_id,user_id,source_type,source_id',
                ignoreDuplicates: false
            })
            .select()
            .single();

        if (error) {
            console.error('[PromoShare] Error recording entry:', error);
            return null;
        }

        return data;
    },

    async getUserEntries(cycleId, userId) {
        if (!supabase) return [];

        const { data } = await supabase
            .from('promoshare_entries')
            .select('*')
            .eq('cycle_id', cycleId)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        return data || [];
    },

    async getRecentEntries(userId, limit = 10) {
        if (!supabase) return [];

        const { data } = await supabase
            .from('promoshare_entries')
            .select('*, cycles:cycle_id(cycle_type, cycle_name)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        return data || [];
    }
};

module.exports = promoShareEntryService;
