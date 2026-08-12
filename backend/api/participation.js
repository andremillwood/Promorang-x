const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { supabase: serviceSupabase } = require('../lib/supabase');
const pulseService = require('../services/pulseService');
const impactService = require('../services/impactService');
const missionAttributionService = require('../services/missionAttributionService');
const creatorEconomicsService = require('../services/creatorEconomicsService');
const momentEconomyService = require('../services/momentEconomyService');
const pieceEarningService = require('../services/pieceEarningService');
const promoPushTrackingService = require('../services/promoPushTrackingService');
const promoShareService = require('../services/promoShareService');
const accessRulesService = require('../services/accessRulesService');
const memoryService = require('../services/memoryService');
const offerService = require('../services/offerService');
const growthOperatingService = require('../services/growthOperatingService');
const masterKeyService = require('../services/masterKeyService');
const demandEventService = require('../services/demandEventService');

const supabase = global.supabase || serviceSupabase || null;

async function getMoment(momentId) {
  if (!supabase) throw new Error('Database not available');

  const { data, error } = await supabase
    .from('moments')
    .select('*')
    .eq('id', momentId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Moment not found');
  return data;
}

async function getParticipation(momentId, userId) {
  const { data, error } = await supabase
    .from('moment_participants')
    .select('*')
    .eq('moment_id', momentId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

function getMomentFallbackKeyCost(moment) {
  const metadata = moment?.metadata || {};
  return Number(
    moment?.key_cost
      ?? moment?.access_key_cost
      ?? metadata.key_cost
      ?? metadata.access_key_cost
      ?? 0
  ) || 0;
}

async function ensureReward(moment, userId) {
  if (!moment?.reward) return null;

  const { data: existing, error: existingError } = await supabase
    .from('rewards')
    .select('id')
    .eq('user_id', userId)
    .eq('moment_id', moment.id)
    .eq('status', 'earned')
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing;

  const { data, error } = await supabase
    .from('rewards')
    .insert({
      user_id: userId,
      moment_id: moment.id,
      reward_type: 'freebie',
      reward_value: moment.reward,
      status: 'earned',
      redemption_code: `RWD-${Date.now().toString(36).toUpperCase()}`,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function performCheckIn({
  momentId,
  userId,
  evidenceUrl = null,
  metadata = {},
  finalizeRewards = true,
  verificationStatus = 'verified',
}) {
  const moment = await getMoment(momentId);
  let participation = await getParticipation(momentId, userId);

  if (!participation) {
    const eligibility = await pulseService.getParticipationEligibility(momentId);
    if (!eligibility.can_join) {
      const error = new Error('This moment is not currently check-in eligible');
      error.statusCode = 409;
      error.payload = { eligibility };
      throw error;
    }

    const { data, error } = await supabase
      .from('moment_participants')
      .insert({
        moment_id: momentId,
        user_id: userId,
        status: 'joined',
      })
      .select()
      .single();

    if (error) throw error;
    participation = data;

    try {
      await promoShareService.recordVerifiedAction(userId, 'moment_join_verified', {
        source_type: 'moment',
        source_id: momentId,
        weight_value: 2,
        moment_id: momentId,
        moment_title: moment?.title || null,
      });
    } catch (promoShareError) {
      console.warn('[Participation API] moment join PromoShare recording skipped:', promoShareError.message);
    }
  }

  const { data: updatedParticipation, error: updateError } = await supabase
    .from('moment_participants')
    .update({
      status: 'checked_in',
      checked_in_at: new Date().toISOString(),
    })
    .eq('moment_id', momentId)
    .eq('user_id', userId)
    .select()
    .single();

  if (updateError) throw updateError;

  try {
    await demandEventService.recordEvent({
      campaignId: metadata?.campaign_id || null,
      momentId,
      actorUserId: userId,
      eventType: 'checked_in',
      sourceSystem: 'moment_participants',
      sourceReference: updatedParticipation.id || `${momentId}:${userId}`,
      channel: metadata?.utm_medium || (metadata?.promopush_tracking_code ? 'promopush' : 'promorang'),
      verified: true,
      properties: { verification_status: verificationStatus },
    });
  } catch (demandError) {
    console.warn('[Participation API] demand check-in mirror skipped:', demandError.message);
  }

  try {
    await supabase.from('participation_events').insert({
      moment_id: momentId,
      user_id: userId,
      event_type: finalizeRewards ? 'verification' : 'verification_submitted',
      evidence_url: evidenceUrl,
      metadata: {
        ...metadata,
        verification_status: verificationStatus,
        ...(finalizeRewards
          ? { verified_at: new Date().toISOString() }
          : { submitted_at: new Date().toISOString() }),
      },
    });
  } catch (eventError) {
    console.warn('[Participation API] participation_events insert skipped:', eventError.message);
  }

  const pulse = await pulseService.recalculateMomentPulse(momentId);
  let reward = null;
  let pieceAwards = [];
  let memory = null;

  if (finalizeRewards) {
    try {
      const proofSourceId = metadata?.proof_submission_id || `${momentId}:${userId}:verified`;
      await demandEventService.recordEvent({
        idempotencyKey: `demand:proof-verified:${proofSourceId}`,
        campaignId: metadata?.campaign_id || null,
        momentId,
        actorUserId: userId,
        eventType: 'proof_verified',
        sourceSystem: 'proof_submissions',
        sourceReference: String(proofSourceId),
        channel: metadata?.utm_medium || (metadata?.promopush_tracking_code ? 'promopush' : 'promorang'),
        verified: true,
        properties: { verification_status: verificationStatus },
      });
    } catch (demandError) {
      console.warn('[Participation API] demand proof mirror skipped:', demandError.message);
    }
    try {
      const proofSourceId = metadata?.proof_submission_id || `${momentId}:${userId}:verified`;
      await masterKeyService.recordVerifiedFreeProof({
        userId,
        sourceType: metadata?.proof_submission_id ? 'proof_submission' : 'participation_verification',
        sourceId: proofSourceId,
        metadata: { ...metadata, moment_id: momentId },
      });
    } catch (masterKeyError) {
      console.warn('[Participation API] daily Master Key credit skipped:', masterKeyError.message);
    }

    reward = await ensureReward(moment, userId);
    await promoPushTrackingService.trackPromoPushEvent({
      eventType: 'proof_verified',
      momentId,
      userId,
      proofSubmissionId: metadata?.proof_submission_id || null,
      rewardId: reward?.id || null,
      metadata,
    });
    try {
      const proofSourceId = metadata?.proof_submission_id || `${momentId}:${userId}`;
      await growthOperatingService.recordEvent({
        eventName: 'verified_outcome', journey: 'participant', stage: 'outcome',
        userId, momentId, entityType: 'participation', entityId: proofSourceId,
        source: metadata?.utm_source || (metadata?.promopush_tracking_code ? 'promopush' : 'product'),
        medium: metadata?.utm_medium || (metadata?.promopush_tracking_code ? 'attributed_link' : 'organic'),
        campaign: metadata?.utm_campaign || null,
        referralCode: metadata?.referral_code || null,
        promoPushCampaignId: metadata?.promopush_campaign_id || null,
        promoPushChannelId: metadata?.promopush_channel_id || null,
        idempotencyKey: `growth:verified-proof:${proofSourceId}`,
      });
    } catch (growthError) {
      console.warn('[Participation API] growth outcome mirror skipped:', growthError.message);
    }
    if (reward?.id) {
      await promoPushTrackingService.trackPromoPushEvent({
        eventType: 'reward_issued',
        momentId,
        userId,
        proofSubmissionId: metadata?.proof_submission_id || null,
        rewardId: reward.id,
        metadata,
      });
    }
    try {
      pieceAwards = await pieceEarningService.awardMomentCheckIn({
        momentId,
        userId,
        invitedByUserId: metadata?.invited_by_user_id || metadata?.referrer_id || null,
        sourceContentId: metadata?.source_content_id || null,
        metadata,
      });
    } catch (earningError) {
      console.warn('[Participation API] check-in piece awards skipped:', earningError.message);
    }

    try {
      const proofSourceId = metadata?.proof_submission_id || `${momentId}:${userId}:verified`;
      await promoShareService.recordVerifiedAction(userId, 'proof_verified', {
        source_type: 'proof',
        source_id: String(proofSourceId),
        weight_value: 3,
        moment_id: momentId,
        reward_id: reward?.id || null,
        ...metadata,
      });
    } catch (promoShareError) {
      console.warn('[Participation API] proof verification PromoShare recording skipped:', promoShareError.message);
    }

    try {
      const proofSourceId = metadata?.proof_submission_id || `${momentId}:${userId}:verified`;
      await offerService.issueForEvent({
        userId,
        channel: 'moment',
        event: verificationStatus === 'verified' ? 'proof_verified' : 'checkin',
        sourceId: momentId,
        sourceEventId: String(proofSourceId),
        context: { proof_verified: verificationStatus === 'verified', moment_id: momentId, ...metadata },
      });
    } catch (offerError) {
      console.warn('[Participation API] unified offer issuance skipped:', offerError.message);
    }

    try {
      memory = await memoryService.issueMemoryForMoment({
        userId,
        momentId,
        proofSubmissionId: metadata?.proof_submission_id || null,
        reviewerId: metadata?.reviewer_id || null,
        source: 'moment_checkin',
        metadata: {
          ...metadata,
          artifact_type: 'i_was_there',
          issued_from: 'checkin',
        },
      });
    } catch (memoryError) {
      console.warn('[Participation API] check-in memory issuance skipped:', memoryError.message);
    }
  }

  return {
    participation: updatedParticipation,
    reward,
    memory,
    pulse,
    piece_awards: pieceAwards,
    verification_status: verificationStatus,
    reward_pending: !finalizeRewards,
  };
}

async function getParticipationFeed(userId) {
  const { data: participations, error } = await supabase
    .from('moment_participants')
    .select('moment_id, status, joined_at, checked_in_at')
    .eq('user_id', userId)
    .order('joined_at', { ascending: false });

  if (error) throw error;
  if (!participations || participations.length === 0) return [];

  const momentIds = participations.map((row) => row.moment_id);
  const { data: moments, error: momentsError } = await supabase
    .from('moments')
    .select('*')
    .in('id', momentIds);

  if (momentsError) throw momentsError;

  return (moments || []).map((moment) => {
    const participation = participations.find((row) => row.moment_id === moment.id);
    return {
      ...moment,
      participation_status: participation?.status || null,
      joined_at: participation?.joined_at || null,
      checked_in_at: participation?.checked_in_at || null,
    };
  }).sort((a, b) => new Date(b.joined_at || 0).getTime() - new Date(a.joined_at || 0).getTime());
}

router.get('/me', requireAuth, async (req, res) => {
  try {
    const moments = await getParticipationFeed(req.user.id);
    res.json({ success: true, moments });
  } catch (error) {
    console.error('[Participation API] me error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/moments/:id/status', requireAuth, async (req, res) => {
  try {
    const moment = await getMoment(req.params.id);
    const participation = await getParticipation(req.params.id, req.user.id);
    const accessQuote = await accessRulesService.getAccessQuote({
      userId: req.user.id,
      objectType: 'moment',
      objectId: req.params.id,
      accessType: 'join',
      fallbackKeyCost: getMomentFallbackKeyCost(moment),
    });

    res.json({
      success: true,
      participation: participation || null,
      joined: !!participation,
      checked_in: !!participation?.checked_in_at,
      access_quote: accessQuote,
    });
  } catch (error) {
    console.error('[Participation API] status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// One source-backed set of journey facts for web, mobile, notifications, and support.
// Human copy and presentation are resolved by the shared package so every client
// gives these facts the same meaning.
router.get('/moments/:id/journey', requireAuth, async (req, res) => {
  try {
    const moment = await getMoment(req.params.id);
    const participation = await getParticipation(req.params.id, req.user.id);
    const [requirementsResult, proofResult, memoryResult, openingResult] = await Promise.all([
      supabase.from('proof_requirements').select('id', { count: 'exact', head: true }).eq('moment_id', req.params.id).eq('is_required', true),
      supabase.from('proof_submissions').select('id,submission_state,created_at').eq('moment_id', req.params.id).eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('memories').select('id,issued_at').eq('moment_id', req.params.id).eq('user_id', req.user.id).maybeSingle(),
      supabase.from('opportunity_openings').select('id,destination_url,status,opened_at').eq('moment_id', req.params.id).eq('beneficiary_user_id', req.user.id).eq('status', 'open').order('opened_at', { ascending: false }).limit(1).maybeSingle(),
    ]);
    const sourceError = requirementsResult.error || proofResult.error || memoryResult.error || openingResult.error;
    if (sourceError) throw sourceError;
    const proofState = proofResult.data?.submission_state || ((requirementsResult.count || 0) > 0 ? 'needed' : 'not_required');
    res.json({
      success: true,
      facts: {
        moment_id: moment.id,
        joined_at: participation?.joined_at || null,
        checked_in_at: participation?.checked_in_at || null,
        participation_status: participation?.status || null,
        proof_required: (requirementsResult.count || 0) > 0,
        proof_submission_id: proofResult.data?.id || null,
        proof_state: proofState,
        memory_id: memoryResult.data?.id || null,
        return_opening_id: openingResult.data?.id || null,
        return_destination: openingResult.data?.destination_url || null,
        starts_at: moment.starts_at || null,
        ends_at: moment.ends_at || null,
        blocker: null,
      },
    });
  } catch (error) {
    console.error('[Participation API] journey error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/moments/:id/join', requireAuth, async (req, res) => {
  try {
    const momentId = req.params.id;
    const userId = req.user.id;
    const {
      source_content_id = null,
      source_mission_id = null,
      invited_by_user_id = null,
      referrer_id = null,
      entry_payment_reference = null,
      entry_amount_jmd = null,
      promopush_campaign_id = null,
      promopush_channel_id = null,
      promopush_tracking_code = null,
    } = req.body || {};

    const moment = await getMoment(momentId);
    const eligibility = await pulseService.getParticipationEligibility(momentId);
    if (!eligibility.can_join) {
      return res.status(409).json({
        success: false,
        error: eligibility.reasons?.is_full
          ? 'This moment has reached capacity'
          : eligibility.reasons?.cooldown_active
            ? 'This moment is in a cooldown window'
            : 'This moment is not currently joinable',
        eligibility,
      });
    }

    const existing = await getParticipation(momentId, userId);
    if (existing) {
      const pulse = await pulseService.recalculateMomentPulse(momentId);
      return res.json({ success: true, participation: existing, pulse, already_joined: true });
    }

    const economy = await momentEconomyService.getMomentEconomy(momentId);
    let entryEconomics = null;
    if (economy.economics?.money_source === 'entry' || economy.economics?.money_source === 'hybrid') {
      entryEconomics = await momentEconomyService.recordEntryPayment({
        momentId,
        userId,
        amountJmd: entry_amount_jmd,
        reference: entry_payment_reference,
      });
    } else if (Number(economy.economics?.reward_pool_jmd || 0) > 0 && economy.economics?.funding_status !== 'locked') {
      return res.status(409).json({
        success: false,
        error: 'This Moment is not funded and locked yet',
        economics: economy.economics,
      });
    }

    const accessResult = await accessRulesService.consumeAccess({
      userId,
      objectType: 'moment',
      objectId: momentId,
      accessType: 'join',
      fallbackKeyCost: getMomentFallbackKeyCost(moment),
      source: 'moment_join',
      description: `Joined moment: ${moment.title || moment.name || momentId}`,
      metadata: {
        moment_title: moment.title || moment.name || null,
        money_source: economy.economics?.money_source || null,
      },
    });

    const { data, error } = await supabase
      .from('moment_participants')
      .insert({
        moment_id: momentId,
        user_id: userId,
        status: 'joined',
        entry_paid_jmd: economy.economics?.money_source === 'entry' || economy.economics?.money_source === 'hybrid'
          ? Number(economy.economics?.entry_fee_jmd || 0)
          : 0,
        entry_payment_reference,
      })
      .select()
      .single();

    if (error) throw error;
    try {
      await demandEventService.recordEvent({
        idempotencyKey: `demand:joined:${momentId}:${userId}`,
        momentId,
        promoPushCampaignId: promopush_campaign_id,
        actorUserId: userId,
        eventType: 'joined',
        sourceSystem: 'moment_participants',
        sourceReference: data.id,
        channel: promopush_tracking_code ? 'promopush' : (source_content_id ? 'creator_content' : 'promorang'),
        verified: true,
        properties: { source_content_id, source_mission_id, invited_by_user_id: invited_by_user_id || referrer_id || null },
      });
    } catch (demandError) {
      console.warn('[Participation API] demand join mirror skipped:', demandError.message);
    }
    if (source_content_id || source_mission_id) {
      try {
        await supabase.from('participation_events').insert({
          moment_id: momentId,
          user_id: userId,
          event_type: 'join',
          metadata: {
            source_content_id,
            source_mission_id,
            source: 'o2o_mission',
            joined_at: new Date().toISOString(),
          },
        });
      } catch (eventError) {
        console.warn('[Participation API] join attribution insert skipped:', eventError.message);
      }

      try {
        const attribution = await missionAttributionService.recordMissionJoin({
          userId,
          contentItemId: source_content_id,
          missionLinkId: source_mission_id,
          momentId,
          metadata: {
            source: 'o2o_mission',
          },
        });
        if (attribution?.host_id) {
          await creatorEconomicsService.recordCreatorLedgerEntry({
            creatorId: attribution.host_id,
            missionAttributionId: attribution.id,
            missionLinkId: attribution.mission_link_id || source_mission_id || null,
            contentItemId: attribution.content_item_id || source_content_id || null,
            momentId,
            brandId: attribution.brand_id || null,
            sourceType: 'mission_join',
            metadata: {
              attribution_source: 'participation_join',
              participant_user_id: userId,
            },
          });
        }
      } catch (attributionError) {
        console.warn('[Participation API] mission attribution join skipped:', attributionError.message);
      }
    }
    const pulse = await pulseService.recalculateMomentPulse(momentId);
    const promoMetadata = {
      promopush_campaign_id,
      promopush_channel_id,
      promopush_tracking_code,
      source_content_id,
      source_mission_id,
    };
    await promoPushTrackingService.trackPromoPushEvent({
      eventType: 'join',
      momentId,
      userId,
      metadata: promoMetadata,
      request: req,
    });
    try {
      await growthOperatingService.recordEvent({
        eventName: 'moment_joined', journey: 'participant', stage: 'activated',
        userId, momentId, entityType: 'moment_participation', entityId: data.id,
        source: promopush_tracking_code ? 'promopush' : (source_content_id ? 'content' : 'product'),
        medium: promopush_tracking_code ? 'attributed_link' : (source_content_id ? 'o2o_content' : 'organic'),
        promoPushCampaignId: promopush_campaign_id,
        promoPushChannelId: promopush_channel_id,
        idempotencyKey: `growth:moment-joined:${data.id}`,
        properties: { source_content_id, source_mission_id, invited_by_user_id: invited_by_user_id || referrer_id || null },
      });
    } catch (growthError) {
      console.warn('[Participation API] growth join mirror skipped:', growthError.message);
    }
    await impactService.processJoinImpact({ momentId, userId });
    await impactService.processGatheringActivationImpact({ momentId });
    let pieceAwards = [];
    try {
      pieceAwards = await pieceEarningService.awardMomentJoin({
        momentId,
        userId,
        invitedByUserId: invited_by_user_id || referrer_id || null,
        sourceContentId: source_content_id,
        metadata: {
          source_content_id,
          source_mission_id,
          promopush_campaign_id,
          promopush_channel_id,
          promopush_tracking_code,
          invited_by_user_id: invited_by_user_id || referrer_id || null,
        },
      });
    } catch (earningError) {
      console.warn('[Participation API] join piece awards skipped:', earningError.message);
    }
    res.status(201).json({ success: true, participation: data, pulse, economics: entryEconomics || economy.economics, piece_awards: pieceAwards, access: accessResult });
  } catch (error) {
    console.error('[Participation API] join error:', error);
    res.status(error.statusCode || (error.message === 'Moment not found' ? 404 : 500)).json({
      success: false,
      error: error.message,
      code: error.code,
      ...(error.payload || {}),
    });
  }
});

router.delete('/moments/:id/join', requireAuth, async (req, res) => {
  try {
    const momentId = req.params.id;
    const userId = req.user.id;

    const { error } = await supabase
      .from('moment_participants')
      .delete()
      .eq('moment_id', momentId)
      .eq('user_id', userId);

    if (error) throw error;
    const pulse = await pulseService.recalculateMomentPulse(momentId);
    res.json({ success: true, pulse });
  } catch (error) {
    console.error('[Participation API] leave error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/moments/:id/checkin', requireAuth, async (req, res) => {
  try {
    const momentId = req.params.id;
    const userId = req.user.id;
    const { evidence_url = null, metadata = {} } = req.body || {};
    const result = await performCheckIn({ momentId, userId, evidenceUrl: evidence_url, metadata });
    if (metadata?.source_content_id || metadata?.source_mission_id) {
      try {
        const attribution = await missionAttributionService.recordMissionVerification({
          userId,
          contentItemId: metadata?.source_content_id || null,
          missionLinkId: metadata?.source_mission_id || null,
          momentId,
          metadata,
        });
        if (attribution?.host_id) {
          await creatorEconomicsService.recordCreatorLedgerEntry({
            creatorId: attribution.host_id,
            missionAttributionId: attribution.id,
            missionLinkId: attribution.mission_link_id || metadata?.source_mission_id || null,
            contentItemId: attribution.content_item_id || metadata?.source_content_id || null,
            momentId,
            brandId: attribution.brand_id || null,
            sourceType: 'mission_verification',
            metadata: {
              attribution_source: 'participation_checkin',
              participant_user_id: userId,
            },
          });
        }
      } catch (attributionError) {
        console.warn('[Participation API] mission attribution verification skipped:', attributionError.message);
      }
    }
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('[Participation API] checkin error:', error);
    const statusCode = error.statusCode || (error.message === 'Moment not found' ? 404 : 500);
    res.status(statusCode).json({ success: false, error: error.message, ...(error.payload || {}) });
  }
});

router.post('/moments/:id/complete', requireAuth, async (req, res) => {
  try {
    const momentId = req.params.id;
    const userId = req.user.id;
    const {
      proof_bundle = {},
      evidence_url = null,
      review_reason = null,
      source_content_id = null,
      source_mission_id = null,
      moment_move_id = null,
      promopush_campaign_id = null,
      promopush_channel_id = null,
      promopush_tracking_code = null,
    } = req.body || {};

    const proofService = require('../services/proofService');
    const submission = await proofService.submitProofSubmission({
      momentId,
      userId,
      proofBundle: {
        ...proof_bundle,
        source_content_id,
        source_mission_id,
        promopush_campaign_id,
        promopush_channel_id,
        promopush_tracking_code,
      },
      momentMoveId: moment_move_id,
    });
    const checkin = await performCheckIn({
      momentId,
      userId,
      evidenceUrl: evidence_url,
      metadata: {
        ...proof_bundle,
        proof_submission_id: submission.id,
        review_reason,
        source_content_id,
        source_mission_id,
        promopush_campaign_id,
        promopush_channel_id,
        promopush_tracking_code,
      },
      finalizeRewards: false,
      verificationStatus: 'pending',
    });

    await promoPushTrackingService.trackPromoPushEvent({
      eventType: 'proof_submitted',
      momentId,
      userId,
      moveId: moment_move_id,
      proofSubmissionId: submission.id,
      metadata: {
        ...proof_bundle,
        source_content_id,
        source_mission_id,
        promopush_campaign_id,
        promopush_channel_id,
        promopush_tracking_code,
      },
      request: req,
    });

    if (moment_move_id) {
      await promoPushTrackingService.trackPromoPushEvent({
        eventType: 'move_completed',
        momentId,
        userId,
        moveId: moment_move_id,
        proofSubmissionId: submission.id,
        metadata: {
          ...proof_bundle,
          source_content_id,
          source_mission_id,
          promopush_campaign_id,
          promopush_channel_id,
          promopush_tracking_code,
        },
        request: req,
      });
    }

    res.json({ success: true, submission, checkin });
  } catch (error) {
    console.error('[Participation API] complete error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
