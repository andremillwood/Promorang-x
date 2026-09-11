const AFTRHRS_MOMENT_SLUG = 'aftrhrs';
const SEA_DECK_VENUE_SLUG = 'sea-deck';
const AFTRHRS_SCENE_SLUG = 'kingston-after-dark';
const AFTRHRS_MOMENT_ID = '00000000-0000-0000-0002-000000000080';
const SEA_DECK_VENUE_ID = '00000000-0000-0000-0003-000000000080';
const AFTRHRS_PATHS = {
  landing: '/aftrhrs',
  moment: '/moments/aftrhrs',
  venue: '/venues/sea-deck',
  pass: '/moments/aftrhrs/pass',
  passAlias: '/aftrhrs/pass',
  ticket: '/aftrhrs/ticket',
  ambassador: '/moments/aftrhrs/ambassador',
  door: '/moments/aftrhrs/door',
  admin: '/admin/aftrhrs',
  claimReturn: '/moments/aftrhrs?claim=1',
};

const AFTRHRS_CLAIM_ERRORS = {
  unauthenticated: 'Sign in to claim a Digital Free Pass.',
  already_claimed: 'This account already holds this Friday’s AftrHrs Digital Free Pass.',
  identity_claimed: 'A Digital Free Pass for this Friday is already attached to this verified email or telephone number.',
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

const AFTRHRS_GUEST_ERRORS = {
  name: 'Tell us your name.',
  email: 'Use a real email so we can confirm your place.',
  phone: 'Add a telephone number we can reach.',
  terms: 'Confirm the door terms to continue.',
  already_rsvp: 'You are already on this Friday’s list.',
  already_pass: 'A digital pass is already attached to this email or telephone.',
  rsvp_full: 'This Friday’s list is full.',
  pass_closed: 'The digital pass drop is closed.',
  unpublished: 'AftrHrs is not currently published.',
  not_found: 'That door code was not found.',
};

function remainingDigitalPasses(edition) {
  return Math.max(0, Number(edition.digitalAllocation || edition.digital_allocation || 0) - Number(edition.digitalClaimed || edition.digital_claimed || 0));
}

function remainingGuestSlots(allocation, claimed) {
  return Math.max(0, Number(allocation || 0) - Number(claimed || 0));
}

function normalizeAftrHrsIdentity(value) {
  if (!value) return null;
  const trimmed = String(value).trim().toLowerCase();
  return trimmed || null;
}

function normalizeAftrHrsPhone(value) {
  if (!value) return null;
  const digits = String(value).replace(/\D/g, '');
  if (digits.length < 7) return null;
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1);
  return digits;
}

function normalizeAftrHrsName(value) {
  const name = String(value || '').trim().replace(/\s+/g, ' ');
  return name.length >= 2 ? name.slice(0, 80) : null;
}

function isValidAftrHrsEmail(value) {
  const email = normalizeAftrHrsIdentity(value);
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function aftrHrsTicketPath(code) {
  const unique = String(code || '').trim().toUpperCase();
  return unique ? `${AFTRHRS_PATHS.ticket}/${encodeURIComponent(unique)}` : AFTRHRS_PATHS.ticket;
}

function aftrHrsMonthKey(now = new Date()) {
  return jamaicaDateParts(now instanceof Date ? now : new Date(now)).ymd.slice(0, 7);
}

const AFTRHRS_PUBLIC_REMAINING_SKEW_POINTS = 10;
const AFTRHRS_PUBLIC_REMAINING_TRUTH_AT = 70;
const AFTRHRS_FREE_ARRIVAL_CUTOFF = '11:30 PM';
const AFTRHRS_ADMIN_EMAILS = ['admin@promorang.co', 'andre@promorang.co'];
const AFTRHRS_DIGITAL_PASS_LIMIT = 30;
const AFTRHRS_RSVP_LIMIT = 30;
const AFTRHRS_DIGITAL_PASS_BATCH = 50;
const AFTRHRS_TIMEZONE = 'America/Jamaica';
const AFTRHRS_START_ISO = '2026-09-11T22:00:00-05:00';
const AFTRHRS_FIRST_FRIDAY = '2026-09-11';
const AFTRHRS_WEEK_ROLLOVER_HOUR = 6;
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
  { question: 'I signed up for Promorang. Where is my pass?', answer: 'The public AftrHrs page does not need a Promorang account. If you claimed inside Promorang, your pass is at /aftrhrs/pass or the top of your wallet. Friday guests RSVP on /aftrhrs with name, email, and telephone.' },
  { question: 'What is Kingston After Dark?', answer: 'Kingston After Dark is the nightlife scene. AftrHrs is the Friday moment at Sea Deck inside that scene. RSVP on /aftrhrs.' },
  { question: 'How will my Digital Free Pass be verified?', answer: 'Digital pass holders show the unique QR from the email ticket. Friday RSVP guests give their name at the door. Staff scan a pass once. A redeemed pass cannot be scanned again.' },
  { question: 'Can I transfer my pass?', answer: 'Each Digital Free Pass is for one person and cannot be transferred.' },
  { question: 'Is my pass good every Friday?', answer: 'A Friday RSVP is for that Friday only. Unused list spots open again next week. A digital pass works like a physical invite for the month.' },
  { question: 'What happens if the venue reaches capacity?', answer: 'Admission remains subject to venue capacity and Sea Deck entry policies even with a valid pass or invitation.' },
];

function jamaicaDateParts(now = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: AFTRHRS_TIMEZONE,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  });
  const parts = Object.fromEntries(formatter.formatToParts(now).map((part) => [part.type, part.value]));
  const weekdays = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    ymd: `${parts.year}-${parts.month}-${parts.day}`,
    weekday: weekdays[parts.weekday] ?? now.getDay(),
    hour: Number(parts.hour),
  };
}

function addAftrHrsCalendarDays(ymd, days) {
  const [year, month, day] = ymd.split('-').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  return utc.toISOString().slice(0, 10);
}

function aftrHrsClaimFriday(now = new Date()) {
  const parts = jamaicaDateParts(now instanceof Date ? now : new Date(now));
  if (parts.weekday === 6 && parts.hour < AFTRHRS_WEEK_ROLLOVER_HOUR) return addAftrHrsCalendarDays(parts.ymd, -1);
  if (parts.weekday === AFTRHRS_WEEKDAY) return parts.ymd;
  if (parts.weekday === 6) return addAftrHrsCalendarDays(parts.ymd, 6);
  return addAftrHrsCalendarDays(parts.ymd, AFTRHRS_WEEKDAY - parts.weekday);
}

function aftrHrsEditionSlug(weekFriday) {
  return weekFriday === AFTRHRS_FIRST_FRIDAY ? AFTRHRS_MOMENT_SLUG : `${AFTRHRS_MOMENT_SLUG}-${weekFriday}`;
}

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
  const urlMatch = text.match(/(?:promorang:\/\/aftrhrs\/redeem\/|\/moments\/aftrhrs\/door\?code=|\/aftrhrs\/ticket\/|[?&]code=)([A-Z0-9-]+)/i);
  if (urlMatch?.[1]) return urlMatch[1].toUpperCase();
  return text.toUpperCase();
}

module.exports = {
  AFTRHRS_MOMENT_SLUG,
  SEA_DECK_VENUE_SLUG,
  AFTRHRS_SCENE_SLUG,
  AFTRHRS_MOMENT_ID,
  SEA_DECK_VENUE_ID,
  AFTRHRS_PATHS,
  AFTRHRS_CLAIM_ERRORS,
  AFTRHRS_GUEST_ERRORS,
  AFTRHRS_FREE_ARRIVAL_CUTOFF,
  AFTRHRS_ADMIN_EMAILS,
  AFTRHRS_DIGITAL_PASS_LIMIT,
  AFTRHRS_RSVP_LIMIT,
  AFTRHRS_DIGITAL_PASS_BATCH,
  AFTRHRS_TIMEZONE,
  AFTRHRS_START_ISO,
  AFTRHRS_FIRST_FRIDAY,
  AFTRHRS_WEEK_ROLLOVER_HOUR,
  AFTRHRS_WEEKDAY,
  AFTRHRS_RECURRENCE,
  DEFAULT_AFTRHRS_FAQS,
  aftrHrsClaimFriday,
  aftrHrsEditionSlug,
  remainingDigitalPasses,
  remainingGuestSlots,
  normalizeAftrHrsIdentity,
  normalizeAftrHrsPhone,
  normalizeAftrHrsName,
  isValidAftrHrsEmail,
  aftrHrsTicketPath,
  aftrHrsMonthKey,
  publicRemainingPercent,
  hasAftrHrsFridayRecurrence,
  isAftrHrsFirstNightClaimClose,
  decodeAftrHrsPassPayload,
};
