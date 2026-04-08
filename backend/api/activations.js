const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');
const economyService = require('../services/economyService');

// POST /api/activations
// Creates an Activation (Moment) with brand payment, not user gems
router.post('/', requireAuth, async (req, res) => {
    const {
        name,
        description,
        objective, // 'social_proof', 'engagement', 'referral'
        credits_per_action,
        total_budget,
        content_id, // optional content piece mapping
        media_url, // for new content
        sku_type = 'A2', // Default to Activation Moment
        participants = 50,
        payment_reference // Stripe payment ID or similar
    } = req.body;

    const userId = req.user.id;

    if (!name || !objective) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: name, objective'
        });
    }

    try {
        // Import services
        const momentPricingService = require('../services/momentPricingService');
        const momentEscrowService = require('../services/momentEscrowService');

        // 1. Calculate pricing based on SKU
        const pricing = momentPricingService.calculateMomentCost(sku_type, {
            participants,
            rewardPerParticipant: credits_per_action || 0,
            location: 'single',
            duration_days: 30
        });

        // 2. Validate brand eligibility for SKU
        const eligibility = await momentPricingService.validateSKUEligibility(userId, sku_type);
        if (!eligibility.eligible) {
            return res.status(403).json({
                success: false,
                error: eligibility.reason,
                unlock_requirement: eligibility.unlock_requirement
            });
        }

        // 3. Validate payment (in production, verify Stripe payment)
        // For now, we'll require payment_reference to be provided
        if (!payment_reference) {
            return res.status(400).json({
                success: false,
                error: 'Payment required to create activation',
                pricing: pricing,
                message: 'Please complete payment before creating activation'
            });
        }

        // 4. Create the Campaign (legacy table, may deprecate)
        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .insert({
                advertiser_id: userId,
                name,
                description: description || `${objective} Activation: ${name}`,
                status: 'active',
                total_gem_budget: pricing.reward_pool,
                start_date: new Date().toISOString(),
                end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            })
            .select()
            .single();

        if (campaignError) throw campaignError;

        // 5. Map Objective to Action Type
        let actionType = 'social_engagement';
        if (objective === 'social_proof') actionType = 'proof_submission';
        if (objective === 'referral') actionType = 'referral';

        // 6. Create the corresponding Drop (using new Moment-centric model)
        const { data: drop, error: dropError } = await supabase
            .from('drops')
            .insert({
                campaign_id: campaign.id,
                name: `${name} (Primary)`,
                description: `Perform the ${objective} action to earn rewards.`,
                action_type: actionType,
                reward_type: 'gems',
                reward_amount: credits_per_action || 0,
                max_completions: credits_per_action > 0 ? Math.floor(pricing.reward_pool / credits_per_action) : participants,
                status: 'active',
                content_id: content_id || null,
                media_url: media_url || null,
                // Add SKU pricing fields
                sku_type,
                brand_cost_usd: pricing.brand_cost,
                reward_pool_usd: pricing.reward_pool,
                platform_fee_usd: pricing.platform_fee,
                payment_status: 'paid',
                payment_reference
            })
            .select()
            .single();

        if (dropError) throw dropError;

        // 7. Create escrow pool for reward distribution
        if (pricing.reward_pool > 0) {
            await momentEscrowService.createEscrowPool(
                drop.id,
                pricing.reward_pool,
                {
                    sku_type,
                    reward_per_participant: credits_per_action,
                    max_participants: participants,
                    campaign_id: campaign.id
                }
            );
        }

        // 8. Update brand account stats
        try {
            const { data: brandAccount } = await supabase
                .from('brand_accounts')
                .select('*')
                .eq('brand_id', userId)
                .single();

            if (brandAccount) {
                await supabase
                    .from('brand_accounts')
                    .update({
                        total_spent_usd: parseFloat(brandAccount.total_spent_usd) + pricing.total,
                        moments_created: brandAccount.moments_created + 1,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', brandAccount.id);
            } else {
                // Create brand account if doesn't exist
                await supabase
                    .from('brand_accounts')
                    .insert({
                        brand_id: userId,
                        total_spent_usd: pricing.total,
                        moments_created: 1
                    });
            }
        } catch (accountError) {
            console.error('[Activations] Error updating brand account:', accountError);
            // Don't fail activation creation
        }

        res.status(201).json({
            success: true,
            data: {
                campaign_id: campaign.id,
                drop_id: drop.id,
                sku_type,
                pricing
            },
            message: `Activation created successfully. ${pricing.reward_pool > 0 ? `$${pricing.reward_pool} locked in escrow for participant rewards.` : ''}`
        });

    } catch (error) {
        console.error('[Activations API Error]', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create activation'
        });
    }
});

module.exports = router;
