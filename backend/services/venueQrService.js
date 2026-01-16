/**
 * PROMORANG VENUE QR SERVICE
 * Management of IRL onboarding QR codes and templates
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;
const referalService = require('./referralService');

/**
 * Create a new venue QR code
 */
async function createVenueQR(userId, data) {
    if (!supabase) throw new Error('Database not available');

    try {
        const {
            venue_name,
            venue_type,
            owner_type = 'merchant',
            referral_code,
            custom_message,
            call_to_action,
            primary_color
        } = data;

        // Use existing referral code or generate new one
        let finalReferralCode = referral_code;
        if (!finalReferralCode) {
            finalReferralCode = await referalService.generateReferralCode(userId, 'VNR');
        }

        // Prepare venue QR record
        const { data: vqr, error } = await supabase
            .from('venue_qr_codes')
            .insert({
                owner_id: userId,
                owner_type,
                venue_name,
                venue_type,
                referral_code: finalReferralCode,
                custom_message,
                call_to_action: call_to_action || 'Join Promorang & earn rewards!',
                primary_color: primary_color || '#8B5CF6',
                is_active: true
            })
            .select()
            .single();

        if (error) throw error;

        // TODO: Trigger QR image generation asset asynchronously
        // In a real system, we'd use a cloud function to generate a nice branded QR

        return vqr;
    } catch (error) {
        console.error('[Venue QR Service] Error creating venue QR:', error);
        throw error;
    }
}

/**
 * Get venue QR codes for a user
 */
async function listVenueQRs(userId) {
    if (!supabase) throw new Error('Database not available');

    try {
        const { data, error } = await supabase
            .from('venue_qr_codes')
            .select('*')
            .eq('owner_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('[Venue QR Service] Error listing venue QRs:', error);
        throw error;
    }
}

/**
 * Get single venue QR with analytics
 */
async function getVenueQR(userId, id) {
    if (!supabase) throw new Error('Database not available');

    try {
        const { data, error } = await supabase
            .from('venue_qr_codes')
            .select('*')
            .eq('id', id)
            .eq('owner_id', userId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('[Venue QR Service] Error getting venue QR:', error);
        throw error;
    }
}

/**
 * Track a venue QR scan
 */
async function trackSubScan(venueQrId, metadata = {}) {
    if (!supabase) return;

    try {
        // 1. Log the scan
        await supabase.from('venue_qr_scans').insert({
            venue_qr_id: venueQrId,
            ip_hash: metadata.ip_hash,
            user_agent: metadata.user_agent,
            device_type: metadata.device_type
        });

        // 2. Increment counter on main record
        await supabase.rpc('increment_venue_scan', { qr_id: venueQrId });

        // Fallback if RPC fails
        const { data: vqr } = await supabase.from('venue_qr_codes').select('total_scans').eq('id', venueQrId).single();
        if (vqr) {
            await supabase.from('venue_qr_codes').update({ total_scans: (vqr.total_scans || 0) + 1 }).eq('id', venueQrId);
        }
    } catch (error) {
        console.error('[Venue QR Service] Error tracking scan:', error);
    }
}

/**
 * Track conversion (signup) from a scan
 */
async function trackConversion(venueQrId, userId) {
    if (!supabase) return;

    try {
        // 1. Update the scan record (most recent scan from this ip/browser usually)
        // For simplicity, we just mark that a signup happened for this venue
        await supabase
            .rpc('increment_venue_signup', { qr_id: venueQrId });

        // Fallback
        const { data: vqr } = await supabase.from('venue_qr_codes').select('total_signups').eq('id', venueQrId).single();
        if (vqr) {
            await supabase.from('venue_qr_codes').update({ total_signups: (vqr.total_signups || 0) + 1 }).eq('id', venueQrId);
        }
    } catch (error) {
        console.error('[Venue QR Service] Error tracking conversion:', error);
    }
}

module.exports = {
    createVenueQR,
    listVenueQRs,
    getVenueQR,
    trackSubScan,
    trackConversion
};
