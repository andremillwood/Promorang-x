/**
 * VERIFICATION SERVICE
 * Coordinates AI analysis and manual review for Side Quest (Drop) proofs.
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;
const aiVerificationService = require('./aiVerificationService');

/**
 * Process a proof submission (e.g. receipt for a Buy Mission)
 * @param {string} applicationId - ID from drop_applications
 * @param {string|Array} proofs - URL of the proof image OR array of {url, type} objects
 * @param {Object} context - { dropType, expectedMerchant, etc. }
 */
async function processProof(applicationId, proofs, context = {}) {
    console.log(`[VerificationService] Processing proof for application: ${applicationId}`);

    if (!supabase) {
        return { status: 'auto_verified', confidence: 0.99 };
    }

    try {
        const proofArray = Array.isArray(proofs)
            ? proofs
            : (typeof proofs === 'string' ? [{ url: proofs, type: 'image' }] : []);

        if (proofArray.length === 0) {
            throw new Error('No proofs provided for verification');
        }

        // 1. Run AI analysis for each proof
        const results = await Promise.all(proofArray.map(async (proof) => {
            try {
                return await aiVerificationService.analyzeProof(proof.url, {
                    ...context,
                    proofType: proof.type
                });
            } catch (err) {
                console.warn(`[VerificationService] AI analysis failed for proof ${proof.url}:`, err);
                return { success: false, confidence: 0, error: err.message };
            }
        }));

        // 2. Aggregate results
        const successfulResults = results.filter(r => r.success);
        const avgConfidence = successfulResults.length > 0
            ? successfulResults.reduce((sum, r) => sum + r.confidence, 0) / successfulResults.length
            : 0;

        const needsManualReview = results.some(r => r.needsManualReview) || successfulResults.length === 0;

        // 3. Determine final status based on aggregated confidence
        let finalStatus = 'pending';
        let logAction = 'submitted';

        if (successfulResults.length > 0 && avgConfidence > 0.90 && !needsManualReview) {
            finalStatus = 'verified';
            logAction = 'auto_verified';
        } else if (avgConfidence < 0.30) {
            finalStatus = 'pending'; // Keep as pending for manual review even if low
        }

        // 4. Update drop_applications
        const { error: updateError } = await supabase
            .from('drop_applications')
            .update({
                verification_status: finalStatus,
                status: finalStatus === 'verified' ? 'approved' : 'submitted',
                reviewed_at: finalStatus !== 'pending' ? new Date().toISOString() : null,
                review_notes: successfulResults.length > 0
                    ? `AI Confidence (Avg): ${avgConfidence.toFixed(2)} across ${successfulResults.length} proofs`
                    : 'AI analysis failed or found no verifiable content',
                metadata: {
                    ...(context.metadata || {}),
                    ai_results: results,
                    ai_confidence_avg: avgConfidence,
                    ai_auto_verified: finalStatus === 'verified',
                    location_verified: !!context.metadata?.location
                }
            })
            .eq('id', applicationId);

        if (updateError) throw updateError;

        // 5. Log the action
        await supabase
            .from('verification_log')
            .insert({
                application_id: applicationId,
                action: logAction,
                reason: successfulResults.length > 0
                    ? `AI Verified ${successfulResults.length}/${results.length} proofs`
                    : 'AI verification failed',
                metadata: {
                    ai_results: results,
                    context: context
                }
            });

        return {
            status: finalStatus,
            results
        };
    } catch (error) {
        console.error('[VerificationService] Error processing proof:', error);
        return { status: 'pending', error: error.message };
    }
}

/**
 * Handle manual verification by admin or merchant
 */
async function manualVerify(applicationId, reviewerId, status, notes = '') {
    if (!supabase) return { success: true };

    try {
        const { error } = await supabase
            .from('drop_applications')
            .update({
                verification_status: status,
                reviewed_by: reviewerId,
                reviewed_at: new Date().toISOString(),
                review_notes: notes
            })
            .eq('id', applicationId);

        if (error) throw error;

        await supabase
            .from('verification_log')
            .insert({
                application_id: applicationId,
                action: status === 'verified' ? 'verified' : 'rejected',
                actor_id: reviewerId,
                reason: notes
            });

        return { success: true };
    } catch (error) {
        console.error('[VerificationService] Error in manual verification:', error);
        throw error;
    }
}

module.exports = {
    processProof,
    manualVerify
};
