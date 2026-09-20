const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { supabase: serviceSupabase } = require('../lib/supabase');
const coreParticipation = require('./participation-core');
const proofService = require('../services/proofService');
const promoPushTrackingService = require('../services/promoPushTrackingService');

const supabase = global.supabase || serviceSupabase || null;

function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== '';
}

function coordinatesFrom(bundle = {}) {
  const lat = Number(bundle.latitude ?? bundle.lat ?? bundle.coords?.lat ?? bundle.location?.lat);
  const lng = Number(bundle.longitude ?? bundle.lng ?? bundle.coords?.lng ?? bundle.location?.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

function distanceKm(a, b) {
  const toRad = (value) => value * Math.PI / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const haversine = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

async function getRequiredProof(momentId) {
  if (!supabase || !momentId) throw new Error('Proof verification source unavailable');
  const { data, error } = await supabase
    .from('proof_requirements')
    .select('id, requirement_type, label, instructions, is_required')
    .eq('moment_id', momentId)
    .eq('is_required', true)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

async function requireRecordedMoment(req, res, next) {
  if (req.method !== 'POST') return next();

  const actionMatch = req.path.match(/^\/moments\/([^/]+)\/(join|complete|checkin)\/?$/);
  if (!actionMatch) return next();

  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Moment source unavailable',
        code: 'MOMENT_SOURCE_UNAVAILABLE',
      });
    }

    const momentId = actionMatch[1];
    const { data, error } = await supabase
      .from('moments')
      .select('id, latitude, longitude, metadata')
      .eq('id', momentId)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(410).json({
        success: false,
        error: 'This Moment is unavailable for participation',
        code: 'MOMENT_UNAVAILABLE',
      });
    }

    req.recordedMoment = data;
    return next();
  } catch (error) {
    console.error('[Participation Moment Boundary] lookup error:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to confirm this Moment for participation',
      code: 'MOMENT_LOOKUP_FAILED',
    });
  }
}

async function enforceProofBoundary(req, res, next) {
  if (req.method !== 'POST') return next();

  const completeMatch = req.path.match(/^\/moments\/([^/]+)\/complete\/?$/);
  const checkinMatch = req.path.match(/^\/moments\/([^/]+)\/checkin\/?$/);
  if (!completeMatch && !checkinMatch) return next();

  try {
    const momentId = (completeMatch || checkinMatch)[1];
    const requirements = await getRequiredProof(momentId);

    // Direct check-in is valid only when the Moment has no required proof.
    // Required-proof Moments must create a reviewable proof submission through /complete.
    if (checkinMatch && requirements.length) {
      return res.status(409).json({
        success: false,
        error: 'This Moment requires proof before verification can be completed',
        code: 'PROOF_SUBMISSION_REQUIRED',
        required_proof: requirements.map((requirement) => ({
          id: requirement.id,
          type: requirement.requirement_type,
          label: requirement.label || requirement.requirement_type,
          instructions: requirement.instructions || null,
        })),
      });
    }

    if (!completeMatch) return next();

    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const bundle = {
      ...(body.proof_bundle && typeof body.proof_bundle === 'object' ? body.proof_bundle : {}),
    };

    if (hasValue(body.proof_code) && !hasValue(bundle.proof_code)) bundle.proof_code = String(body.proof_code).trim();
    if (hasValue(body.evidence_url) && !hasValue(bundle.evidence_url)) bundle.evidence_url = String(body.evidence_url).trim();

    const missing = [];
    for (const requirement of requirements) {
      const type = String(requirement.requirement_type || '').toLowerCase();
      let satisfied = false;
      let reason = null;

      if (type === 'venue_qr' || type === 'rotating_code') {
        satisfied = hasValue(bundle.proof_code) || hasValue(bundle.qr_code) || hasValue(bundle.code);
      } else if (type === 'timestamped_media' || type === 'receipt') {
        satisfied = hasValue(bundle.evidence_url) || hasValue(bundle.media_url) || hasValue(bundle.receipt_url);
      } else if (type === 'geofence') {
        const participantCoordinates = coordinatesFrom(bundle);
        const momentCoordinates = coordinatesFrom({
          latitude: req.recordedMoment?.latitude,
          longitude: req.recordedMoment?.longitude,
        });
        const radiusMeters = Number(req.recordedMoment?.metadata?.geofence_radius_m || 200);

        if (!participantCoordinates) {
          reason = 'location_not_submitted';
        } else if (!momentCoordinates) {
          reason = 'moment_location_not_configured';
        } else {
          const measuredDistanceKm = distanceKm(participantCoordinates, momentCoordinates);
          bundle.geofence_distance_m = Math.round(measuredDistanceKm * 1000);
          bundle.geofence_radius_m = radiusMeters;
          satisfied = measuredDistanceKm * 1000 <= radiusMeters;
          if (!satisfied) reason = 'outside_geofence';
        }
      } else if (type === 'merchant_confirm') {
        // Merchant confirmation is a reviewer-side verification requirement.
        // It must keep direct check-in closed, but it does not prevent the participant
        // from creating a pending, reviewable proof submission.
        satisfied = true;
      }

      if (!satisfied) {
        missing.push({
          id: requirement.id,
          type,
          label: requirement.label || type,
          instructions: requirement.instructions || null,
          reason,
        });
      }
    }

    if (missing.length) {
      return res.status(422).json({
        success: false,
        error: 'Required proof is incomplete',
        code: 'PROOF_REQUIREMENTS_INCOMPLETE',
        missing_requirements: missing,
      });
    }

    req.body = { ...body, proof_bundle: bundle };
    return next();
  } catch (error) {
    console.error('[Participation Proof Boundary] validation error:', error);
    return res.status(500).json({ success: false, error: 'Unable to validate proof requirements' });
  }
}

// A proof submission is a claim awaiting review, not verified attendance.
// Keep the participant in the joined state here; proofService.reviewProofSubmission
// owns the transition to checked_in plus memory/reward/payout issuance on approval.
async function submitPendingProof(req, res) {
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

    const { data: participation, error: participationError } = await supabase
      .from('moment_participants')
      .select('*')
      .eq('moment_id', momentId)
      .eq('user_id', userId)
      .maybeSingle();

    if (participationError) throw participationError;
    if (!participation) {
      return res.status(409).json({
        success: false,
        error: 'RSVP before submitting proof for this Moment',
        code: 'RSVP_REQUIRED',
      });
    }

    const normalizedBundle = {
      ...proof_bundle,
      ...(source_content_id ? { source_content_id } : {}),
      ...(source_mission_id ? { source_mission_id } : {}),
      ...(promopush_campaign_id ? { promopush_campaign_id } : {}),
      ...(promopush_channel_id ? { promopush_channel_id } : {}),
      ...(promopush_tracking_code ? { promopush_tracking_code } : {}),
      ...(review_reason ? { review_reason } : {}),
    };

    const submission = await proofService.submitProofSubmission({
      momentId,
      userId,
      proofBundle: normalizedBundle,
      momentMoveId: moment_move_id,
    });

    try {
      await supabase.from('participation_events').insert({
        moment_id: momentId,
        user_id: userId,
        event_type: 'verification_submitted',
        evidence_url: evidence_url || normalizedBundle.evidence_url || null,
        metadata: {
          ...normalizedBundle,
          proof_submission_id: submission.id,
          verification_status: 'pending',
          submitted_at: new Date().toISOString(),
        },
      });
    } catch (eventError) {
      console.warn('[Participation API] pending proof event skipped:', eventError.message);
    }

    try {
      await promoPushTrackingService.trackPromoPushEvent({
        eventType: 'proof_submitted',
        momentId,
        userId,
        moveId: moment_move_id,
        proofSubmissionId: submission.id,
        metadata: normalizedBundle,
        request: req,
      });
    } catch (trackingError) {
      console.warn('[Participation API] pending proof tracking skipped:', trackingError.message);
    }

    return res.status(201).json({
      success: true,
      submission,
      checkin: {
        participation,
        verification_status: 'pending',
        reward_pending: true,
        reward: null,
        memory: null,
        piece_awards: [],
        consequence: null,
      },
    });
  } catch (error) {
    console.error('[Participation API] pending proof error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Unable to submit proof',
      code: error.code,
      ...(error.payload || {}),
    });
  }
}

router.use(requireRecordedMoment);
router.use(enforceProofBoundary);
router.post('/moments/:id/complete', requireAuth, submitPendingProof);
router.use(coreParticipation);

module.exports = router;
