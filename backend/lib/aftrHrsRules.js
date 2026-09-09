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
  sold_out: 'The digital free release has been secured.',
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

const AFTRHRS_PUBLIC_REMAINING_SKEW_POINTS = 10;
const AFTRHRS_PUBLIC_REMAINING_TRUTH_AT = 70;
const AFTRHRS_FREE_ARRIVAL_CUTOFF = '11:30 PM';
const AFTRHRS_ADMIN_EMAILS = ['admin@promorang.co', 'andre@promorang.co'];
const AFTRHRS_DIGITAL_PASS_LIMIT = 30;
const DEFAULT_AFTRHRS_FAQS = [
  { question: 'Are Digital Free Passes still available?', answer: 'Digital Free Passes are limited and go quickly. Claim yours while they last.' },
  { question: 'What time must I arrive to get in free?', answer: 'RSVP and Digital Free Pass holders must arrive before 11:30 PM to get in free.' },
  { question: 'What happens when the Digital Free Passes are claimed?', answer: 'Find an AftrHrs Ambassador for a physical invitation. Paid entry stays open.' },
  { question: 'How do I obtain a physical invitation?', answer: 'Connect with an approved AftrHrs Ambassador. They distribute the remaining free invitations in person.' },
  { question: 'Does a physical invitation guarantee entry?', answer: 'A valid invitation or RSVP covers admission, subject to Sea Deck capacity, entry policies, and successful verification at the door.' },
  { question: 'What is the cost without an invitation or RSVP?', answer: 'Entry without an invitation or RSVP is JMD $2,000.' },
  { question: 'What does the paid admission include?', answer: 'Paid patrons receive complimentary drink and wings.' },
  { question: 'Where is Sea Deck?', answer: 'Orchid Village, 20 Barbican Road, Kingston.' },
  { question: 'How will my Digital Free Pass be verified?', answer: 'Present the unique QR code from your Promorang pass at Sea Deck. Staff scan it once. A redeemed pass cannot be scanned again.' },
  { question: 'Can I transfer my pass?', answer: 'Each Digital Free Pass is for one person and cannot be transferred.' },
  { question: 'What happens if the venue reaches capacity?', answer: 'Admission remains subject to venue capacity and Sea Deck entry policies even with a valid pass or invitation.' },
];

function publicRemainingPercent(remaining, allocation) {
  const capacity = Number(allocation || 0);
  if (capacity <= 0) return 0;
  const actual = (Math.max(0, Number(remaining || 0)) / capacity) * 100;
  if (actual <= 0) return 0;
  if (actual <= AFTRHRS_PUBLIC_REMAINING_TRUTH_AT) return Math.round(actual);
  return Math.min(100, Math.round(actual + AFTRHRS_PUBLIC_REMAINING_SKEW_POINTS));
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
  AFTRHRS_FREE_ARRIVAL_CUTOFF,
  AFTRHRS_ADMIN_EMAILS,
  AFTRHRS_DIGITAL_PASS_LIMIT,
  DEFAULT_AFTRHRS_FAQS,
  remainingDigitalPasses,
  publicRemainingPercent,
  decodeAftrHrsPassPayload,
};
