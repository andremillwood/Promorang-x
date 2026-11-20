const { MECHANIC_PROOF_TYPES } = require('../lib/jamaicaGeo');

const PROOF_TYPE_ALIASES = new Map([
  ['qr', 'QR'],
  ['gps', 'GPS'],
  ['photo', 'Photo'],
  ['image', 'Photo'],
  ['video', 'Video'],
  ['api', 'API'],
  ['code', 'Code'],
  ['referral', 'Code'],
  ['share', 'Share'],
  ['screenshot', 'Screenshot'],
  ['link', 'Link'],
  ['url', 'Link'],
]);

const REQUIREMENT_PROOF_TYPES = {
  geofence: ['GPS'],
  venue_qr: ['QR'],
  rotating_code: ['Code'],
  timestamped_media: ['Photo', 'Video', 'Screenshot'],
  receipt: ['Screenshot'],
  merchant_confirm: ['API'],
};

function strictProofType(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  if (MECHANIC_PROOF_TYPES.includes(raw)) return raw;
  return PROOF_TYPE_ALIASES.get(raw.toLowerCase()) || null;
}

function allowedProofTypes(moment = {}, requirements = []) {
  const allowed = new Set();
  const momentType = strictProofType(moment.proof_type);
  if (momentType) allowed.add(momentType);

  const multi = String(moment.proof_mode || 'single') === 'multi_modal';
  if (multi || allowed.size === 0) {
    for (const requirement of requirements || []) {
      if (requirement && requirement.is_required === false) continue;
      const mapped = REQUIREMENT_PROOF_TYPES[String(requirement?.requirement_type || '').toLowerCase()] || [];
      for (const type of mapped) allowed.add(type);
    }
  }

  return allowed;
}

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function inferredProofTypes(bundle = {}) {
  const types = new Set();
  if (bundle.share_url || bundle.share_proof || bundle.shared === true || bundle.proof_kind === 'share') {
    types.add('Share');
  }
  if (bundle.screenshot_url || bundle.proof_kind === 'screenshot') types.add('Screenshot');
  if (bundle.link || bundle.url || bundle.proof_url || bundle.proof_kind === 'link') types.add('Link');
  if (hasValue(bundle.proof_code) || hasValue(bundle.qr_code) || hasValue(bundle.code)) {
    types.add('QR');
    types.add('Code');
  }
  if (bundle.latitude != null && bundle.longitude != null && bundle.latitude !== '' && bundle.longitude !== '') {
    types.add('GPS');
  }
  if (bundle.video_url || bundle.proof_kind === 'video') types.add('Video');
  if (hasValue(bundle.evidence_url) || hasValue(bundle.media_url) || hasValue(bundle.photo_url)) {
    types.add('Photo');
    types.add('Screenshot');
  }
  return types;
}

/**
 * A submission must use one of the moment's allowed mechanic proof types.
 * Single-mode moments allow their proof_type. multi_modal also allows the
 * types implied by proof_requirements (Capleton: Share plus venue presence).
 * Moments with no proof type and no requirements stay open for older flows.
 */
function evaluateProofSubmission(moment, requirements, proofBundle = {}) {
  const allowed = allowedProofTypes(moment, requirements);
  const explicit = strictProofType(proofBundle.proof_type);
  const explicitInvalid = hasValue(proofBundle.proof_type) && !explicit;

  if (allowed.size === 0) {
    return { ok: true, matchedType: explicit, allowed: [] };
  }

  if (explicitInvalid || (explicit && !allowed.has(explicit))) {
    return {
      ok: false,
      code: 'PROOF_TYPE_MISMATCH',
      message: `This Moment accepts ${[...allowed].join(', ')} proof`,
      allowed: [...allowed],
      matchedType: null,
    };
  }

  if (explicit) {
    return { ok: true, matchedType: explicit, allowed: [...allowed] };
  }

  const inferred = inferredProofTypes(proofBundle);
  const overlap = [...inferred].filter((type) => allowed.has(type));
  if (overlap.length === 0) {
    return {
      ok: false,
      code: 'PROOF_TYPE_REQUIRED',
      message: `Submit ${[...allowed].join(' or ')} proof for this Moment`,
      allowed: [...allowed],
      matchedType: null,
    };
  }

  const momentType = strictProofType(moment.proof_type);
  const matchedType = momentType && overlap.includes(momentType) ? momentType : overlap[0];
  return { ok: true, matchedType, allowed: [...allowed] };
}

function proofTypeError(result) {
  const error = new Error(result.message);
  error.code = result.code;
  error.statusCode = 422;
  error.payload = { allowed_proof_types: result.allowed };
  return error;
}

module.exports = {
  MECHANIC_PROOF_TYPES,
  strictProofType,
  allowedProofTypes,
  inferredProofTypes,
  evaluateProofSubmission,
  proofTypeError,
};
