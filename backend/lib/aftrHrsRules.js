const AFTRHRS_MOMENT_SLUG = 'aftrhrs';
const SEA_DECK_VENUE_SLUG = 'sea-deck';
const AFTRHRS_MOMENT_ID = '00000000-0000-0000-0002-000000000080';
const SEA_DECK_VENUE_ID = '00000000-0000-0000-0003-000000000080';
const AFTRHRS_PATHS = {
  landing: '/aftrhrs',
  moment: '/moments/aftrhrs',
  venue: '/venues/sea-deck',
  pass: '/moments/aftrhrs/pass',
  passAlias: '/aftrhrs/pass',
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
const AFTRHRS_TIMEZONE = 'America/Jamaica';
const AFTRHRS_START_ISO = '2026-09-11T22:00:00-05:00';
const AFTRHRS_WEEKDAY = 5;
const AFTRHRS_RECURRENCE = {
  recurrence_enabled: true,
  recurrence_frequency: 'weekly',
  recurrence_interval: 1,
  recurrence_by_weekday: [AFTRHRS_WEEKDAY],
  recurrence_timezone: AFTRHRS_TIMEZONE,
  recurrence_until: null,
  recurrence_count: null,
};
const DEFAULT_AFTRHRS_FAQS = [
  { question: 'When is AftrHrs?', answer: 'Every Friday from 10:00 PM at Sea Deck.' },
  { question: 'Are Digital Free Passes still available?', answer: 'Digital Free Passes are limited and go quickly. Claim yours while they last.' },
  { question: 'What time must I arrive to get in free?', answer: 'RSVP and Digital Free Pass holders must arrive before 11:30 PM to get in free.' },
  { question: 'What happens when the Digital Free Passes are claimed?', answer: 'Find an AftrHrs Ambassador for a physical invitation. Paid entry stays open.' },
  { question: 'How do I obtain a physical invitation?', answer: 'Connect with an approved AftrHrs Ambassador. They distribute the remaining free invitations in person.' },
  { question: 'Does a physical invitation guarantee entry?', answer: 'A valid invitation or RSVP covers admission, subject to Sea Deck capacity, entry policies, and successful verification at the door.' },
  { question: 'What is the cost without an invitation or RSVP?', answer: 'Entry without an invitation or RSVP is JMD $2,000.' },
  { question: 'What does the paid admission include?', answer: 'Paid patrons receive complimentary drink and wings.' },
  { question: 'Where is Sea Deck?', answer: 'Orchid Village, 20 Barbican Road, Kingston.' },
  { question: 'I signed up for Promorang. Where is my pass?', answer: 'Signing up creates your Promorang account. Your AftrHrs Digital Free Pass is a separate door pass. Open /aftrhrs/pass or the top of your wallet. If it is not there yet, claim it on the AftrHrs page and the QR appears in both places.' },
  { question: 'How will my Digital Free Pass be verified?', answer: 'Present the unique QR code from your AftrHrs pass at Sea Deck. Open it from /aftrhrs/pass or the top of your wallet. Staff scan it once. A redeemed pass cannot be scanned again.' },
  { question: 'Can I transfer my pass?', answer: 'Each Digital Free Pass is for one person and cannot be transferred.' },
  { question: 'What happens if the venue reaches capacity?', answer: 'Admission remains subject to venue capacity and Sea Deck entry policies even with a valid pass or invitation.' },
];

function hasAftrHrsFridayRecurrence(moment) {
  if (!moment || !moment.recurrence_enabled) return false;
  if (String(moment.recurrence_frequency || '').toLowerCase() !== 'weekly') return false;
  if (Number(moment.recurrence_interval || 1) !== 1) return false;
  const weekdays = Array.isArray(moment.recurrence_by_weekday)
    ? moment.recurrence_by_weekday.map((day) => Number(day))
    : [];
  if (!weekdays.includes(AFTRHRS_WEEKDAY)) return false;
  return (moment.recurrence_timezone || AFTRHRS_TIMEZONE) === AFTRHRS_TIMEZONE;
}

function isAftrHrsFirstNightClaimClose(value) {
  if (!value) return false;
  const close = new Date(value).getTime();
  const firstNight = new Date(AFTRHRS_START_ISO).getTime();
  return Number.isFinite(close) && close === firstNight;
}

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
  AFTRHRS_TIMEZONE,
  AFTRHRS_START_ISO,
  AFTRHRS_WEEKDAY,
  AFTRHRS_RECURRENCE,
  DEFAULT_AFTRHRS_FAQS,
  remainingDigitalPasses,
  publicRemainingPercent,
  hasAftrHrsFridayRecurrence,
  isAftrHrsFirstNightClaimClose,
  decodeAftrHrsPassPayload,
};
