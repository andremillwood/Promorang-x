const { supabase } = require('../lib/supabase'); // Fix: Destructure supabase from module

/**
 * MomentService
 * 
 * Manages the lifecycle of a Moment:
 * Draft -> Live -> Closed -> Recorded
 */
class MomentService {

    /**
     * Create a new Moment with SKU-based pricing
     */
    async createMoment(organizerId, data) {
        const {
            title,
            type,
            description,
            gate_rules,
            starts_at,
            ends_at,
            sponsor_id,
            host_id,
            distillation_source_id,
            sku_type = 'A1', // Default to Community Moment
            participants = 50,
            reward_per_participant = 0,
            status = 'draft',
            payment_reference = null
        } = data;

        // Import pricing services
        const momentPricingService = require('./momentPricingService');
        const momentEscrowService = require('./momentEscrowService');

        // 1. Validate SKU eligibility (for scale SKUs)
        const brandId = sponsor_id || organizerId;
        const eligibility = await momentPricingService.validateSKUEligibility(brandId, sku_type);

        if (!eligibility.eligible) {
            throw new Error(`SKU ${sku_type} not available: ${eligibility.reason}`);
        }

        // 2. Calculate pricing based on SKU
        const pricing = momentPricingService.calculateMomentCost(sku_type, {
            participants,
            rewardPerParticipant: reward_per_participant,
            location: data.location || 'single',
            duration_days: data.duration_days || 1,
            priority: data.priority || false
        });

        // 3. Determine verification level based on SKU
        let verificationLevel = 'standard';
        if (['A2', 'A3', 'S2'].includes(sku_type)) {
            verificationLevel = 'advanced';
        } else if (['S3'].includes(sku_type)) {
            verificationLevel = 'priority';
        }

        // 4. Set participant capacity based on reward pool
        const participantCap = reward_per_participant > 0
            ? Math.floor(pricing.reward_pool / reward_per_participant)
            : participants;

        // 5. Create Moment record
        const { data: moment, error } = await supabase
            .from('moments')
            .insert({
                organizer_id: organizerId,
                title,
                type,
                description,
                gate_rules,
                capacity: participantCap,
                participant_cap: participantCap,
                sku_type,
                brand_cost_usd: pricing.brand_cost,
                reward_pool_usd: pricing.reward_pool,
                platform_fee_usd: pricing.platform_fee,
                ops_buffer_usd: pricing.ops_buffer || 0,
                payment_status: payment_reference ? 'paid' : 'pending',
                payment_reference,
                pricing_metadata: pricing,
                verification_level: verificationLevel,
                billing_status: payment_reference ? 'paid' : 'pending',
                status,
                starts_at,
                ends_at,
                sponsor_id: brandId,
                host_id: host_id || organizerId,
                distillation_source_id
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        // 6. Create escrow pool if reward pool exists and payment is confirmed
        if (pricing.reward_pool > 0 && payment_reference) {
            try {
                await momentEscrowService.createEscrowPool(
                    moment.id,
                    pricing.reward_pool,
                    {
                        sku_type,
                        reward_per_participant,
                        max_participants: participantCap
                    }
                );
            } catch (escrowError) {
                console.error('[MomentService] Failed to create escrow pool:', escrowError);
                // Don't fail Moment creation, but log the issue
            }
        }

        console.log(`[MomentService] Created Moment ${moment.id} with SKU ${sku_type}: $${pricing.total}`);
        return moment;
    }

    /**
     * PROPOSAL ENGINE
     * Submit a Moment for funding/approval
     */
    async submitProposal(organizerId, data) {
        // Force status to 'submitted'
        return this.createMoment(organizerId, { ...data, status: 'submitted' });
    }

    /**
     * Approve and Fund a Moment
     * Transitions from 'approved_unfunded' to 'funded'/'joinable'
     */
    async fundMoment(momentId, sponsorId) {
        const { data, error } = await supabase
            .from('moments')
            .update({
                status: 'funded',
                sponsor_id: sponsorId,
                billing_status: 'paid'
            })
            .eq('id', momentId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    /**
     * Close a Moment and seal it
     * This is the critical "Closure" step.
     */
    async closeMoment(momentId, organizerId) {
        // 1. Verify ownership (can be organizer, host, or sponsor)
        const moment = await this.getMomentById(momentId);
        const canClose = moment && (
            moment.organizer_id === organizerId ||
            moment.host_id === organizerId ||
            moment.sponsor_id === organizerId
        );

        if (!canClose) {
            throw new Error('Unauthorized or Moment not found');
        }

        if (moment.status === 'closed') {
            throw new Error('Moment already closed');
        }

        // 2. Fetch Redemptions (via Entitlements)
        const { data: entitlements } = await supabase.from('entitlements').select('id').eq('moment_id', momentId);
        const entitlementIds = (entitlements || []).map(e => e.id);

        let participants = [];
        if (entitlementIds.length > 0) {
            const { data } = await supabase
                .from('redemptions')
                .select('*')
                .in('entitlement_id', entitlementIds);
            participants = data || [];
        }

        // 3. Generate Merkle Record
        const RecordService = require('./recordService');
        const metadata = {
            moment_id: momentId,
            organizer_id: organizerId,
            closed_at: new Date().toISOString()
        };
        const record = RecordService.generateRecord(participants, metadata);
        const hash = record.root;

        // 4. Update Moment
        const { error: updateError } = await supabase
            .from('moments')
            .update({
                status: 'closed',
                closed_at: new Date().toISOString(),
                record_hash: hash,
                participant_count: participants.length
            })
            .eq('id', momentId);

        if (updateError) throw new Error(updateError.message);

        // 5. Save Record
        const { error: recordError } = await supabase
            .from('moment_records')
            .insert({
                moment_id: momentId,
                data: record,
                hash
            });

        if (recordError) throw new Error('Failed to persist Moment Record: ' + recordError.message);

        // 6. Release unused escrow funds back to brand
        if (moment.sponsor_id) {
            try {
                const momentEscrowService = require('./momentEscrowService');
                const refund = await momentEscrowService.releaseUnusedFunds(momentId, moment.sponsor_id);

                if (refund.refunded_amount > 0) {
                    console.log(`[MomentService] Refunded $${refund.refunded_amount} to brand ${moment.sponsor_id}`);
                }
            } catch (escrowError) {
                console.error('[MomentService] Failed to release escrow funds:', escrowError);
                // Don't fail closure, but log the issue
            }
        }

        return { success: true, hash, count: record.count };
    }

    async getMomentById(id) {
        const { data, error } = await supabase
            .from('moments')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data;
    }

    /**
     * Internal: Validate Gate Rules
     */
    async checkGate(moment, userId) {
        // If no rules, open access
        if (!moment.gate_rules) return true;

        const rules = moment.gate_rules;

        // 1. Check Reliability Score (PRI)
        if (rules.min_pri) {
            const ReliabilityService = require('./reliabilityService');
            const profile = await ReliabilityService.getReliabilityProfile(userId);

            if (profile.score < rules.min_pri) {
                throw new Error(`Access Denied: Trust Score ${profile.score} does not meet minimum requirement of ${rules.min_pri}`);
            }
        }

        // 2. Geo-fencing (Future placeholder)
        // if (rules.geo) { ... }

        return true;
    }

    /**
     * Generate a human-readable, verifiable Moment Anchor
     */
    generateMomentAnchor(redemptionId, momentId, userId) {
        const dateStamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
        // Format: [MOMENT_SHORT] : [DATE] : [REDEMPTION_PART]
        const momentPart = momentId.slice(0, 4).toUpperCase();
        const userPart = userId.slice(0, 4).toUpperCase();
        const redemptionPart = redemptionId.toString().slice(-4);

        return `PROM : ${momentPart} : ${dateStamp} : ${userPart}${redemptionPart}`;
    }

    /**
     * Check-in a user via Ticket/QR
     */
    async checkInUser(ticketId, scannedByUserId) {
        // 1. Verify Ticket (Entitlement)
        const { data: entitlement, error: entError } = await supabase
            .from('entitlements')
            .select('*, moments(id, status, gate_rules)')
            .eq('id', ticketId)
            .single();

        if (entError || !entitlement) throw new Error('Invalid Ticket');

        const moment = entitlement.moments;
        if (!moment) throw new Error('Moment not found');
        if (moment.status !== 'live') throw new Error('Moment is not live');

        // 2. Enforce Gate Rules (Trust Score)
        await this.checkGate(moment, entitlement.user_id);

        // 3. Check overlap
        const { data: existing } = await supabase
            .from('redemptions')
            .select('id')
            .eq('entitlement_id', ticketId)
            .single();

        if (existing) throw new Error('Ticket already used');

        // 4. Record Redemption
        const { data: redemption, error: redeemError } = await supabase
            .from('redemptions')
            .insert({
                entitlement_id: ticketId,
                user_id: entitlement.user_id,
                moment_id: moment.id,
                redeemed_at: new Date().toISOString(),
                verification_proof: { method: 'scanner', scanned_by: scannedByUserId }
            })
            .select('id')
            .single();

        if (redeemError) throw new Error(redeemError.message);

        // 5. Generate Moment Anchor
        const anchor = this.generateMomentAnchor(redemption.id, moment.id, entitlement.user_id);

        // Update redemption with anchor (optional, but good for persistence)
        await supabase
            .from('redemptions')
            .update({ moment_anchor: anchor })
            .eq('id', redemption.id);

        // 6. Update Reliability (Reward for attendance)
        const ReliabilityService = require('./reliabilityService');
        await ReliabilityService.updateReliability(entitlement.user_id, 'ATTENDED', { momentId: moment.id });

        return { success: true, anchor };
    }

    async generateRecordData(momentId) {
        // Fetch entitlements
        const { data: entitlements } = await supabase
            .from('entitlements')
            .select('*')
            .eq('moment_id', momentId);

        // Fetch redemptions with user data
        // Note: Joins in Supabase JS rely on foreign keys
        const { data: redemptions } = await supabase
            .from('redemptions')
            .select(`
            *,
            users (
                username,
                mocha_user_id
            )
        `)
            .eq('moment_id', momentId);

        return {
            momentId,
            redemptions: redemptions || [],
        };
    }

    /**
     * Get a user's history of verified Moment Records
     */
    async getUserMomentHistory(userId) {
        // Redemptions link Users to Moments
        // We want the Moment Record (the artifact) for moments the user redeemed.
        // Join: Redemptions -> Moments -> MomentRecords

        const { data: redemptions, error } = await supabase
            .from('redemptions')
            .select(`
                redeemed_at,
                moment:moments (
                    title,
                    type,
                    closed_at,
                    record:moment_records (
                        hash,
                        data
                    )
                )
            `)
            .eq('user_id', userId)
            .not('moment.record_hash', 'is', null) // Only closed/recorded moments
            .order('redeemed_at', { ascending: false });

        if (error) {
            console.error('Error fetching moment history:', error);
            return [];
        }

        // Transform into a clean "Record" object for the UI
        return redemptions.map(r => ({
            momentTitle: r.moment?.title,
            momentType: r.moment?.type,
            redeemedAt: r.redeemed_at,
            closedAt: r.moment?.closed_at,
            recordHash: r.moment?.record?.[0]?.hash || 'PENDING_VERIFICATION', // Handle array return from join
            verificationStatus: 'VERIFIED'
        }));
    }
}


module.exports = new MomentService();
