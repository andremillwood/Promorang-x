const express = require('express');
const router = express.Router();
const { supabase: serviceSupabase } = require('../lib/supabase');
const coreParticipation = require('./participation-core');

const supabase = global.supabase || serviceSupabase || null;

function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== '';
}

function hasCoordinates(bundle = {}) {
  const lat = Number(bundle.latitude ?? bundle.lat ?? bundle.coords?.lat ?? bundle.location?.lat);
  const lng = Number(bundle.longitude ?? bundle.lng ?? bundle.coords?.lng ?? bundle.location?.lng);
  return Number.isFinite(lat) && Number.isFinite(lng);
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

      if (type === 'venue_qr' || type === 'rotating_code') {
        satisfied = hasValue(bundle.proof_code) || hasValue(bundle.qr_code) || hasValue(bundle.code);
      } else if (type === 'timestamped_media' || type === 'receipt') {
        satisfied = hasValue(bundle.evidence_url) || hasValue(bundle.media_url) || hasValue(bundle.receipt_url);
      } else if (type === 'geofence') {
        satisfied = hasCoordinates(bundle);
      } else if (type === 'merchant_confirm') {
        satisfied = hasValue(bundle.merchant_confirmation_id) || hasValue(bundle.merchant_confirmed_at);
      }

      if (!satisfied) {
        missing.push({
          id: requirement.id,
          type,
          label: requirement.label || type,
          instructions: requirement.instructions || null,
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

router.use(enforceProofBoundary);
router.use(coreParticipation);

module.exports = router;
