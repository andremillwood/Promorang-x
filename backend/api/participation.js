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

async function normalizeAndValidateProof(req, res, next) {
  if (req.method !== 'POST' || !/\/moments\/[^/]+\/complete\/?$/.test(req.path)) return next();

  try {
    const momentId = req.params?.id || req.path.split('/')[2];
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const bundle = {
      ...(body.proof_bundle && typeof body.proof_bundle === 'object' ? body.proof_bundle : {}),
    };

    if (hasValue(body.proof_code) && !hasValue(bundle.proof_code)) bundle.proof_code = String(body.proof_code).trim();
    if (hasValue(body.evidence_url) && !hasValue(bundle.evidence_url)) bundle.evidence_url = String(body.evidence_url).trim();

    if (!supabase || !momentId) {
      return res.status(503).json({ success: false, error: 'Proof verification source unavailable' });
    }

    const { data: requirements, error } = await supabase
      .from('proof_requirements')
      .select('id, requirement_type, label, instructions, is_required')
      .eq('moment_id', momentId)
      .eq('is_required', true)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const missing = [];
    for (const requirement of requirements || []) {
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

router.use(normalizeAndValidateProof);
router.use(coreParticipation);

module.exports = router;
