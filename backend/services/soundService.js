const { supabase } = require('../lib/supabase');

/**
 * Sound Service - Manages executable distribution units (Sounds)
 * linked to Drops and Events.
 */
const soundService = {
    /**
     * Register a new Sound unit
     */
    async registerSound({ creatorId, title, audioUrl, waveformData, duration, isVerified = false }) {
        const { data, error } = await supabase
            .from('sounds')
            .insert({
                creator_id: creatorId,
                title,
                audio_url: audioUrl,
                waveform_data: waveformData,
                duration,
                is_verified: isVerified
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Get Sound details with usage stats
     */
    async getSound(soundId) {
        const { data, error } = await supabase
            .from('sounds')
            .select('*, creator:users(display_name, username)')
            .eq('id', soundId)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Track usage when a creator uses the sound in a Drop
     */
    async incrementUsage(soundId) {
        const { data, error } = await supabase.rpc('increment_sound_usage', { sound_id: soundId });
        if (error) {
            // Fallback if RPC doesn't exist yet
            await supabase
                .from('sounds')
                .update({ usage_count: supabase.raw('usage_count + 1') })
                .eq('id', soundId);
        }
        return true;
    },

    /**
     * List sounds available for a specific event or campaign
     */
    async listSounds({ limit = 20, verifiedOnly = false }) {
        let query = supabase.from('sounds').select('*').order('usage_count', { ascending: false });
        if (verifiedOnly) query = query.eq('is_verified', true);

        const { data, error } = await query.limit(limit);
        if (error) throw error;
        return data;
    }
};

module.exports = soundService;
