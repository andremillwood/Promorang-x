const AFTRHRS_MOMENT_SLUG = 'aftrhrs';
const SEA_DECK_VENUE_SLUG = 'sea-deck';
const AFTRHRS_MOMENT_ID = '00000000-0000-0000-0002-000000000080';
const SEA_DECK_VENUE_ID = '00000000-0000-0000-0003-000000000080';
const AFTRHRS_PATHS = {
  landing: '/aftrhrs',
  moment: '/moments/aftrhrs',
  venue: '/venues/sea-deck',
  pass: '/moments/aftrhrs/pass',
  ambassador: '/moments/aftrhrs/ambassador',
  door: '/moments/aftrhrs/door',
  admin: '/admin/aftrhrs',
  claimReturn: '/aftrhrs?claim=1',
};

const AFTRHRS_CLAIM_ERRORS = {
  unauthenticated: 'Sign in to claim a Digital Free Pass.',
  already_claimed: 'This account already holds an AftrHrs Digital Free Pass.',
  identity_claimed: 'A Digital Free Pass is already attached to this verified email or telephone number.',
  sold_out: 'The 20 Digital Free Passes have been secured.',
  closed: 'Digital Free Pass claims are closed.',
  unpublished: 'AftrHrs is not currently published.',
  deadline: 'Digital Free Pass claims closed at the configured deadline.',
  terms: 'Confirm the event terms to claim a pass.',
  allocation: 'Ambassador allocation cannot fall below zero.',
  not_found: 'Pass not found.',
  already_redeemed: 'This pass has already been validated.',
  not_redeemable: 'This pass cannot be validated.',
  forbidden: 'You do not have permission to manage AftrHrs.',
};

function remainingDigitalPasses(edition) {
  return Math.max(0, Number(edition.digitalAllocation || edition.digital_allocation || 0) - Number(edition.digitalClaimed || edition.digital_claimed || 0));
}

function decodeAftrHrsPassPayload(raw) {
  if (raw == null) return '';
  const text = String(raw).trim();
  if (!text) return '';
  const urlMatch = text.match(/(?:promorang:\/\/aftrhrs\/redeem\/|\/moments\/aftrhrs\/door\?code=|[?&]code=)([A-Z0-9-]+)/i);
  if (urlMatch?.[1]) return urlMatch[1].toUpperCase();
  return text.toUpperCase();
}

module.exports = {
  AFTRHRS_MOMENT_SLUG,
  SEA_DECK_VENUE_SLUG,
  AFTRHRS_MOMENT_ID,
  SEA_DECK_VENUE_ID,
  AFTRHRS_PATHS,
  AFTRHRS_CLAIM_ERRORS,
  remainingDigitalPasses,
  decodeAftrHrsPassPayload,
};
