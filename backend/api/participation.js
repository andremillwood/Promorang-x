const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { supabase: serviceSupabase } = require('../lib/supabase');
const pulseService = require('../services/pulseService');
const impactService = require('../services/impactService');
const missionAttributionService = require('../services/missionAttributionService');
const creatorEconomicsService = require('../services/creatorEconomicsService');

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

async function performCheckIn({ momentId, userId, evidenceUrl = null, metadata = {} }) {
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
    await supabase.from('participation_events').insert({
      moment_id: momentId,
      user_id: userId,
      event_type: 'verification',
      evidence_url: evidenceUrl,
      metadata: {
        ...metadata,
        verified_at: new Date().toISOString(),
      },
    });
  } catch (eventError) {
    console.warn('[Participation API] participation_events insert skipped:', eventError.message);
  }

  const reward = await ensureReward(moment, userId);
  const pulse = await pulseService.recalculateMomentPulse(momentId);

  return {
    participation: updatedParticipation,
    reward,
    pulse,
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
    const participation = await getParticipation(req.params.id, req.user.id);
    res.json({
      success: true,
      participation: participation || null,
      joined: !!participation,
      checked_in: !!participation?.checked_in_at,
    });
  } catch (error) {
    console.error('[Participation API] status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/moments/:id/join', requireAuth, async (req, res) => {
  try {
    const momentId = req.params.id;
    const userId = req.user.id;
    const { source_content_id = null, source_mission_id = null } = req.body || {};

    await getMoment(momentId);
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
    await impactService.processJoinImpact({ momentId, userId });
    await impactService.processGatheringActivationImpact({ momentId });
    res.status(201).json({ success: true, participation: data, pulse });
  } catch (error) {
    console.error('[Participation API] join error:', error);
    res.status(error.message === 'Moment not found' ? 404 : 500).json({ success: false, error: error.message });
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
    const { proof_bundle = {}, evidence_url = null, review_reason = null, source_content_id = null, source_mission_id = null } = req.body || {};

    const proofService = require('../services/proofService');
    const submission = await proofService.submitProofSubmission({
      momentId,
      userId,
      proofBundle: proof_bundle,
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
      },
    });

    res.json({ success: true, submission, checkin });
  } catch (error) {
    console.error('[Participation API] complete error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
