export const AFTRHRS_MOMENT_SLUG = "aftrhrs";
export const SEA_DECK_VENUE_SLUG = "sea-deck";
/** AftrHrs is a Moment inside this Scene — not a second scene. */
export const AFTRHRS_SCENE_SLUG = "kingston-after-dark";
export const AFTRHRS_SCENE_TITLE = "Kingston After Dark";
export const AFTRHRS_SCENE_PATH = `/scenes/${AFTRHRS_SCENE_SLUG}`;

export const AFTRHRS_MOMENT_ID = "00000000-0000-0000-0002-000000000080";
export const SEA_DECK_VENUE_ID = "00000000-0000-0000-0003-000000000080";
export const AFTRHRS_EDITION_ID = "00000000-0000-0000-0004-000000000080";

/** Weekly Promorang-account digital pass pool (the forked /moments/aftrhrs path). */
export const AFTRHRS_DIGITAL_PASS_LIMIT = 30;
/** Public Friday guest-list RSVP cap. Never print this number in guest copy. */
export const AFTRHRS_RSVP_LIMIT = 30;
/** Public digital-pass batch size. Admin closes a drop, then can open another. Never print this number. */
export const AFTRHRS_DIGITAL_PASS_BATCH = 50;
export const AFTRHRS_TIMEZONE = "America/Jamaica";
export const AFTRHRS_START_ISO = "2026-09-11T22:00:00-05:00";
export const AFTRHRS_FIRST_FRIDAY = "2026-09-11";
/** Unused passes from last Friday expire at this Jamaica hour on Saturday. */
export const AFTRHRS_WEEK_ROLLOVER_HOUR = 6;
/** JS weekday: Sunday = 0 … Friday = 5. */
export const AFTRHRS_WEEKDAY = 5;
export const AFTRHRS_DOORS = "10:00 PM until";
export const AFTRHRS_CADENCE = "Every Friday";
export const AFTRHRS_WHEN_LINE = "Every Friday · 10:00 PM until";
export const AFTRHRS_RECURRENCE = {
  recurrence_enabled: true,
  recurrence_frequency: "weekly" as const,
  recurrence_interval: 1,
  recurrence_by_weekday: [AFTRHRS_WEEKDAY],
  recurrence_timezone: AFTRHRS_TIMEZONE,
  recurrence_until: null,
  recurrence_count: null,
};
export const AFTRHRS_EVENT_SCHEDULE = {
  "@type": "Schedule",
  repeatFrequency: "P1W",
  byDay: "https://schema.org/Friday",
  startTime: "22:00",
  scheduleTimezone: AFTRHRS_TIMEZONE,
} as const;
export const AFTRHRS_FREE_ARRIVAL_CUTOFF = "11:30 PM";
export const AFTRHRS_PUBLIC_REMAINING_SKEW_POINTS = 10;
export const AFTRHRS_PUBLIC_REMAINING_TRUTH_AT = 70;
export const AFTRHRS_PAID_ENTRY_JMD = 2000;
export const PROMORANG_LOGO_PATH = "/email-assets/promorang-logo.png";
export const AFTRHRS_LOGO_PATH = "/campaigns/aftrhrs/logo.jpg";
export const AFTRHRS_OG_IMAGE_PATH = "/og/aftrhrs.jpg";
export const AFTRHRS_OG_IMAGE = {
  path: AFTRHRS_OG_IMAGE_PATH,
  alt: "AftrHrs at Sea Deck",
  type: "image/jpeg",
  width: 941,
  height: 1672,
} as const;

export const AFTRHRS_PATHS = {
  landing: "/aftrhrs",
  moment: "/moments/aftrhrs",
  venue: "/venues/sea-deck",
  pass: "/moments/aftrhrs/pass",
  passAlias: "/aftrhrs/pass",
  ticket: "/aftrhrs/ticket",
  ambassador: "/moments/aftrhrs/ambassador",
  door: "/moments/aftrhrs/door",
  admin: "/admin/aftrhrs",
  claimReturn: "/moments/aftrhrs?claim=1",
  wallet: "/wallet",
} as const;

export const AFTRHRS_GUEST_KINDS = ["rsvp", "digital-pass"] as const;
export type AftrHrsGuestKind = (typeof AFTRHRS_GUEST_KINDS)[number];

export const AFTRHRS_PENDING_CLAIM_KEY = "promorang_aftrhrs_pending_claim";

export const PASS_TYPES = ["digital-free", "physical-invitation", "paid", "guest-list"] as const;
export type EventPassType = (typeof PASS_TYPES)[number];

export const PASS_STATUSES = ["active", "redeemed", "cancelled", "expired", "transferred"] as const;
export type EventPassStatus = (typeof PASS_STATUSES)[number];

export const PARTICIPATION_STATES = [
  "discovered",
  "interested",
  "pass_requested",
  "digital_pass_claimed",
  "ambassador_request_submitted",
  "physical_invitation_secured",
  "checked_in",
  "attended",
  "shared_content",
  "completed",
] as const;
export type MomentParticipationState = (typeof PARTICIPATION_STATES)[number];

export const PARTICIPATION_RANK: Record<MomentParticipationState, number> = {
  discovered: 10,
  interested: 20,
  pass_requested: 30,
  digital_pass_claimed: 40,
  ambassador_request_submitted: 35,
  physical_invitation_secured: 45,
  checked_in: 80,
  attended: 90,
  shared_content: 95,
  completed: 100,
};

export const AFTRHRS_CLAIM_ERRORS = {
  unauthenticated: "Sign in to claim a Digital Free Pass.",
  already_claimed: "This account already holds this Friday’s AftrHrs Digital Free Pass.",
  identity_claimed: "A Digital Free Pass for this Friday is already attached to this verified email or telephone number.",
  sold_out: "The digital free release has been secured.",
  closed: "Digital Free Pass claims are closed.",
  unpublished: "AftrHrs is not currently published.",
  deadline: "Digital Free Pass claims closed at the configured deadline.",
  terms: "Confirm the event terms to claim a pass.",
  allocation: "Ambassador allocation cannot fall below zero.",
  not_found: "Pass not found.",
  already_redeemed: "This pass has already been validated.",
  not_redeemable: "This pass cannot be validated.",
  forbidden: "You do not have permission to manage AftrHrs.",
} as const;

export const AFTRHRS_GUEST_ERRORS = {
  name: "Tell us your name.",
  email: "Use a real email so we can confirm your place.",
  phone: "Add a telephone number we can reach.",
  terms: "Confirm the door terms to continue.",
  already_rsvp: "You are already on this Friday’s list.",
  already_pass: "A digital pass is already attached to this email or telephone.",
  rsvp_full: "This Friday’s list is full.",
  pass_closed: "The digital pass drop is closed.",
  unpublished: "AftrHrs is not currently published.",
  not_found: "That door code was not found.",
} as const;

export type AftrHrsGuestErrorCode = keyof typeof AFTRHRS_GUEST_ERRORS;

export type AftrHrsClaimErrorCode = keyof typeof AFTRHRS_CLAIM_ERRORS;

export type AftrHrsClaimDecision =
  | { ok: true }
  | { ok: false; code: AftrHrsClaimErrorCode; message: string };

export type AftrHrsEditionSnapshot = {
  id: string;
  momentId: string;
  venueId: string;
  slug: string;
  published: boolean;
  claimsOpen: boolean;
  digitalAllocation: number;
  digitalClaimed: number;
  claimOpensAt: string | null;
  claimClosesAt: string | null;
  pageMode: "live" | "post-event";
  weekFriday?: string | null;
  rsvpAllocation?: number;
  rsvpClaimed?: number;
};

export type AftrHrsIdentity = {
  userId?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type AftrHrsClaimContext = {
  edition: AftrHrsEditionSnapshot;
  identity: AftrHrsIdentity;
  authenticated: boolean;
  termsAccepted: boolean;
  now?: Date | string | number;
  existingDigitalPass?: boolean;
  identityAlreadyClaimed?: boolean;
};

export function normalizeAftrHrsIdentity(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = String(value).trim().toLowerCase();
  return trimmed || null;
}

export function normalizeAftrHrsPhone(value?: string | null): string | null {
  if (!value) return null;
  const digits = String(value).replace(/\D/g, "");
  if (digits.length < 7) return null;
  // Jamaica / NANP: +1 876 … and local 876-… must collide on the same key.
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return digits;
}

export function remainingDigitalPasses(edition: Pick<AftrHrsEditionSnapshot, "digitalAllocation" | "digitalClaimed">): number {
  return Math.max(0, Number(edition.digitalAllocation || 0) - Number(edition.digitalClaimed || 0));
}

export function remainingGuestSlots(allocation: number, claimed: number): number {
  return Math.max(0, Number(allocation || 0) - Number(claimed || 0));
}

export function isValidAftrHrsEmail(value?: string | null): boolean {
  const email = normalizeAftrHrsIdentity(value);
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function normalizeAftrHrsName(value?: string | null): string | null {
  const name = String(value || "").trim().replace(/\s+/g, " ");
  return name.length >= 2 ? name.slice(0, 80) : null;
}

export function aftrHrsTicketPath(code?: string | null): string {
  const unique = String(code || "").trim().toUpperCase();
  return unique ? `${AFTRHRS_PATHS.ticket}/${encodeURIComponent(unique)}` : AFTRHRS_PATHS.ticket;
}

export function guestGoingLine(count?: number | null): string | null {
  const going = Number(count || 0);
  if (going < 1) return null;
  if (going === 1) return AFTRHRS_COPY.guestGoingOne;
  return AFTRHRS_COPY.guestGoingMany.replace("{count}", String(going));
}

export function aftrHrsMonthKey(now: Date | string | number = new Date()): string {
  return jamaicaDateParts(parseAftrHrsTime(now)).ymd.slice(0, 7);
}

export function isDigitalPassSoldOut(edition: Pick<AftrHrsEditionSnapshot, "digitalAllocation" | "digitalClaimed">): boolean {
  return remainingDigitalPasses(edition) <= 0;
}

export function actualRemainingPercent(remaining: number, allocation: number): number {
  const capacity = Number(allocation || 0);
  if (capacity <= 0) return 0;
  return (Math.max(0, Number(remaining || 0)) / capacity) * 100;
}

/** Public remaining % is +10 points until actual remaining is 70% or below. Never name the raw count. */
export function publicRemainingPercent(remaining: number, allocation: number): number {
  const actual = actualRemainingPercent(remaining, allocation);
  if (actual <= 0) return 0;
  if (actual <= AFTRHRS_PUBLIC_REMAINING_TRUTH_AT) return Math.round(actual);
  return Math.min(100, Math.round(actual + AFTRHRS_PUBLIC_REMAINING_SKEW_POINTS));
}

export function formatPublicRemainingLabel(percent: number, soldOut = false): string {
  if (soldOut || Number(percent || 0) <= 0) return "Digital release claimed";
  return `${Math.max(0, Math.min(100, Math.round(Number(percent))))}%`;
}

export type AftrHrsCapacityMood = "closed" | "last" | "tight" | "filling" | "open";

export function remainingCapacityMood(percent: number, soldOut = false): {
  mood: AftrHrsCapacityMood;
  label: string;
  detail: string;
} {
  const value = Math.max(0, Math.min(100, Math.round(Number(percent || 0))));
  if (soldOut || value <= 0) {
    return { mood: "closed", label: "Closed", detail: "This lane is closed." };
  }
  if (value <= 20) {
    return { mood: "last", label: "Almost gone", detail: `${value}% still open` };
  }
  if (value <= 45) {
    return { mood: "tight", label: "Going fast", detail: `${value}% still open` };
  }
  if (value <= 75) {
    return { mood: "filling", label: "Filling up", detail: `${value}% still open` };
  }
  return { mood: "open", label: "Still room", detail: `${value}% still open` };
}

export function guestLaneCopy(kind: AftrHrsGuestKind, percent: number, soldOut = false) {
  const mood = remainingCapacityMood(percent, soldOut);
  if (kind === "rsvp") {
    if (mood.mood === "closed") {
      return {
        ...mood,
        eyebrow: "This Friday",
        title: "The list is full",
        body: "This Friday’s guest list is closed. A digital pass still covers the month if that drop is open.",
        cta: "List closed",
      };
    }
    return {
      ...mood,
      eyebrow: "This Friday",
      title: "Get on the list",
      body: "Name, email, telephone. Give your name at the door. Free if you arrive before 11:30 PM.",
      cta: "RSVP for Friday",
    };
  }
  if (mood.mood === "closed") {
    return {
      ...mood,
      eyebrow: "Digital pass",
      title: "This drop is closed",
      body: "The current digital pass drop is closed. Friday RSVP may still be open.",
      cta: "Drop closed",
    };
  }
  return {
    ...mood,
    eyebrow: "Digital pass",
    title: "Hold a month invite",
    body: "Like a physical invite. Gets you in free for the month. We email a door code — no account.",
    cta: "Get the digital pass",
  };
}

export type AftrHrsGuestEntryInput = {
  kind: AftrHrsGuestKind;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  termsAccepted?: boolean;
  published?: boolean;
  laneOpen?: boolean;
  remaining?: number;
  alreadyHeld?: boolean;
};

export function evaluateGuestEntry(input: AftrHrsGuestEntryInput): AftrHrsClaimDecision {
  if (input.published === false) {
    return { ok: false, code: "unpublished", message: AFTRHRS_GUEST_ERRORS.unpublished };
  }
  if (!normalizeAftrHrsName(input.name)) {
    return { ok: false, code: "terms", message: AFTRHRS_GUEST_ERRORS.name };
  }
  if (!isValidAftrHrsEmail(input.email)) {
    return { ok: false, code: "terms", message: AFTRHRS_GUEST_ERRORS.email };
  }
  if (!normalizeAftrHrsPhone(input.phone)) {
    return { ok: false, code: "terms", message: AFTRHRS_GUEST_ERRORS.phone };
  }
  if (!input.termsAccepted) {
    return { ok: false, code: "terms", message: AFTRHRS_GUEST_ERRORS.terms };
  }
  if (input.alreadyHeld) {
    return input.kind === "digital-pass"
      ? { ok: false, code: "already_claimed", message: AFTRHRS_GUEST_ERRORS.already_pass }
      : { ok: false, code: "already_claimed", message: AFTRHRS_GUEST_ERRORS.already_rsvp };
  }
  if (input.laneOpen === false) {
    return input.kind === "digital-pass"
      ? { ok: false, code: "closed", message: AFTRHRS_GUEST_ERRORS.pass_closed }
      : { ok: false, code: "sold_out", message: AFTRHRS_GUEST_ERRORS.rsvp_full };
  }
  if (Number(input.remaining ?? 1) <= 0) {
    return input.kind === "digital-pass"
      ? { ok: false, code: "closed", message: AFTRHRS_GUEST_ERRORS.pass_closed }
      : { ok: false, code: "sold_out", message: AFTRHRS_GUEST_ERRORS.rsvp_full };
  }
  return { ok: true };
}

export function guestPassStatus(status?: string | null): string {
  if (status === "redeemed") return "Used";
  if (status === "cancelled" || status === "expired") return "No longer valid";
  return "Ready";
}

export function guestPassType(type?: string | null): string {
  if (type === "digital-free" || type === "digital-pass") return "Digital free pass";
  if (type === "physical-invitation") return "Physical invitation";
  if (type === "paid") return "Paid entry";
  if (type === "guest-list" || type === "rsvp") return "On the guest list";
  return "Pass";
}

export function adminPassStatus(status?: string | null): string {
  if (status === "redeemed") return "Already used at the door";
  if (status === "cancelled") return "Cancelled — they cannot get in with this";
  if (status === "expired") return "Expired";
  if (status === "transferred") return "Moved to someone else";
  return "Ready for the door";
}

export function ambassadorInviteProgress(distributed?: number | null, allocation?: number | null): string {
  const given = Math.max(0, Number(distributed) || 0);
  const total = Math.max(0, Number(allocation) || 0);
  const left = Math.max(0, total - given);
  if (total === 0) return "No invitations assigned yet.";
  if (given === 0) return `None of ${total} invitations given out yet.`;
  if (left === 0) return `All ${total} invitations have been given out.`;
  return `${given} of ${total} invitations given out · ${left} left`;
}

export type AftrHrsFaq = { question: string; answer: string };

export function normalizeAftrHrsFaqs(value: unknown): AftrHrsFaq[] {
  const source = typeof value === "string"
    ? (() => {
      try {
        return JSON.parse(value) as unknown;
      } catch {
        return [];
      }
    })()
    : value;
  if (!Array.isArray(source)) return [];
  return source
    .map((item) => {
      const row = item && typeof item === "object" ? item as Record<string, unknown> : {};
      return {
        question: String(row.question || "").trim(),
        answer: String(row.answer || "").trim(),
      };
    })
    .filter((item) => item.question || item.answer);
}

export function readAftrHrsAdminEdition(edition?: Record<string, unknown> | null) {
  const row = edition || {};
  const policies = (row.venue_policies || row.venuePolicies || {}) as Record<string, unknown>;
  const pageMode = String(row.page_mode ?? row.pageMode ?? "live") === "post-event" ? "post-event" : "live";
  return {
    allocation: String(row.digital_allocation ?? row.digitalAllocation ?? ""),
    claimsOpen: Boolean(row.claims_open ?? row.claimsOpen ?? true),
    published: row.published !== false,
    pageMode: pageMode as "live" | "post-event",
    policy: String(policies.entry_policy ?? policies.entryPolicy ?? ""),
    faqs: normalizeAftrHrsFaqs(row.faqs),
  };
}

export const AFTRHRS_ADMIN_FUNNEL = [
  { key: "landing_view", label: "Opened the page", hint: "People who looked at AftrHrs" },
  { key: "moment_join", label: "Joined the night", hint: "People who said they want in" },
  { key: "pass_secured", label: "Have a pass", hint: "Passes that can still be used" },
  { key: "checked_in", label: "Checked in", hint: "Already scanned at the door" },
] as const;

export const AFTRHRS_ADMIN_COPY = {
  loading: "Loading the AftrHrs night desk…",
  accessTitle: "You need permission to run AftrHrs",
  accessBody: "Only approved Promorang staff can change tonight’s passes, door rules, or guest list.",
  eyebrow: "AftrHrs night desk",
  title: "Run tonight",
  remaining: (count: number) => (
    count <= 0
      ? "No free digital passes are left. Guests can still find an ambassador."
      : count === 1
        ? "1 free digital pass is still available for Sea Deck."
        : `${count} free digital passes are still available for Sea Deck.`
  ),
  settingsTitle: "Tonight’s settings",
  settingsHelp: "These controls change what guests see and whether they can still claim a free pass.",
  allocationLabel: "How many free digital passes can people claim?",
  allocationHelp: "This is the cap for this week. People already holding a pass keep it.",
  claimsLabel: "People can still claim a free digital pass",
  claimsHelp: "Turn this off to stop new claims. Existing passes stay valid.",
  publishedLabel: "Show AftrHrs to the public",
  publishedHelp: "When this is off, guests cannot open the night page.",
  pageModeLabel: "What should guests see right now?",
  pageModeLive: "Tonight is on — people can claim and check in",
  pageModeAfter: "The night is over — show the after-night page",
  policyLabel: "Door rules guests will read",
  policyHelp: "Plain language for who can come in, what they need, and anything Sea Deck wants guests to know.",
  policyPlaceholder: "Example: Arrive before 11:30 PM with your pass. Sea Deck may still turn people away if the room is full.",
  faqsTitle: "Questions guests ask",
  faqsHelp: "Write the question the way a guest would ask it, then the answer they should read.",
  faqQuestion: "Question",
  faqAnswer: "Answer",
  faqQuestionPlaceholder: "When should I arrive?",
  faqAnswerPlaceholder: "Before 11:30 PM to get in free.",
  addFaq: "Add a question",
  removeFaq: "Remove this question",
  save: "Save tonight’s settings",
  saved: "Saved. Guests will see the new settings.",
  saveFailed: "Could not save tonight’s settings.",
  guestLanding: "Public RSVP page",
  guestListTitle: "Who has a pass",
  guestListHelp: "Codes are for the door. The words tell you what kind of pass it is and whether it still works.",
  guestRsvpTitle: "Friday list and digital passes",
  guestRsvpHelp: "The public page captures name, email, and telephone. Friday RSVPs reset each week. Digital passes come in drops — close one, then open another.",
  closeDigital: "Close this digital drop",
  openDigital: "Open another digital drop",
  digitalClosed: "The digital drop is closed. Open another when you are ready.",
  digitalOpen: "A digital drop is open for guests.",
  downloadList: "Download guest list",
  downloadHint: "A spreadsheet for the door team.",
  emptyGuests: "Nobody has a pass yet.",
  passCode: "Door code",
  cancelPass: "Cancel this pass",
  cancelConfirm: "Cancel this pass? They will not be able to use it at the door.",
  restorePass: "Put this pass back on the list",
  ambassadorsTitle: "Who is giving out invitations",
  ambassadorsHelp: "Each ambassador has a handful of physical invitations to give in person.",
  emptyAmbassadors: "No ambassadors are set up yet.",
  doorCode: "Door code",
  publicPage: "See what guests see",
  doorPage: "Door check-in",
  venuePage: "Sea Deck venue",
  momentsAdmin: "All Moments",
} as const;

export type AftrHrsRecurrenceLike = {
  recurrence_enabled?: boolean | null;
  recurrence_frequency?: string | null;
  recurrence_interval?: number | null;
  recurrence_by_weekday?: Array<number | string> | null;
  recurrence_timezone?: string | null;
};

export function hasAftrHrsFridayRecurrence(moment?: AftrHrsRecurrenceLike | null): boolean {
  if (!moment?.recurrence_enabled) return false;
  if (String(moment.recurrence_frequency || "").toLowerCase() !== "weekly") return false;
  if (Number(moment.recurrence_interval || 1) !== 1) return false;
  const weekdays = Array.isArray(moment.recurrence_by_weekday)
    ? moment.recurrence_by_weekday.map((day) => Number(day))
    : [];
  if (!weekdays.includes(AFTRHRS_WEEKDAY)) return false;
  return (moment.recurrence_timezone || AFTRHRS_TIMEZONE) === AFTRHRS_TIMEZONE;
}

export function isAftrHrsFirstNightClaimClose(value?: string | null): boolean {
  if (!value) return false;
  const close = new Date(value).getTime();
  const firstNight = new Date(AFTRHRS_START_ISO).getTime();
  return Number.isFinite(close) && close === firstNight;
}

export function parseAftrHrsTime(value?: Date | string | number | null): Date {
  if (value instanceof Date) return value;
  if (value == null) return new Date();
  return new Date(value);
}

export function evaluateDigitalPassClaim(input: AftrHrsClaimContext): AftrHrsClaimDecision {
  const now = parseAftrHrsTime(input.now);
  const { edition } = input;

  if (!input.authenticated || !input.identity.userId) {
    return { ok: false, code: "unauthenticated", message: AFTRHRS_CLAIM_ERRORS.unauthenticated };
  }
  if (!edition.published) {
    return { ok: false, code: "unpublished", message: AFTRHRS_CLAIM_ERRORS.unpublished };
  }
  if (!edition.claimsOpen) {
    return { ok: false, code: "closed", message: AFTRHRS_CLAIM_ERRORS.closed };
  }
  if (edition.claimOpensAt && now < new Date(edition.claimOpensAt)) {
    return { ok: false, code: "closed", message: AFTRHRS_CLAIM_ERRORS.closed };
  }
  if (edition.claimClosesAt && now >= new Date(edition.claimClosesAt)) {
    return { ok: false, code: "deadline", message: AFTRHRS_CLAIM_ERRORS.deadline };
  }
  if (!input.termsAccepted) {
    return { ok: false, code: "terms", message: AFTRHRS_CLAIM_ERRORS.terms };
  }
  if (input.existingDigitalPass) {
    return { ok: false, code: "already_claimed", message: AFTRHRS_CLAIM_ERRORS.already_claimed };
  }
  if (input.identityAlreadyClaimed) {
    return { ok: false, code: "identity_claimed", message: AFTRHRS_CLAIM_ERRORS.identity_claimed };
  }
  if (isDigitalPassSoldOut(edition)) {
    return { ok: false, code: "sold_out", message: AFTRHRS_CLAIM_ERRORS.sold_out };
  }
  return { ok: true };
}

export function nextParticipationState(
  current: MomentParticipationState | null | undefined,
  incoming: MomentParticipationState,
): MomentParticipationState {
  if (!current) return incoming;
  return PARTICIPATION_RANK[incoming] >= PARTICIPATION_RANK[current] ? incoming : current;
}

export function participationAfterPassType(passType: EventPassType): MomentParticipationState {
  if (passType === "digital-free") return "digital_pass_claimed";
  if (passType === "physical-invitation") return "physical_invitation_secured";
  return "pass_requested";
}

export function encodeAftrHrsPassPayload(code: string): string {
  return `promorang://aftrhrs/redeem/${String(code || "").trim().toUpperCase()}`;
}

export function decodeAftrHrsPassPayload(raw: string | null | undefined): string {
  if (raw == null) return "";
  const text = String(raw).trim();
  if (!text) return "";

  const urlMatch = text.match(/(?:promorang:\/\/aftrhrs\/redeem\/|\/moments\/aftrhrs\/door\?code=|\/aftrhrs\/ticket\/|[?&]code=)([A-Z0-9-]+)/i);
  if (urlMatch?.[1]) return urlMatch[1].toUpperCase();

  if (text.startsWith("{")) {
    try {
      const parsed = JSON.parse(text) as { code?: string; unique_code?: string; uniqueCode?: string };
      const nested = parsed.code || parsed.unique_code || parsed.uniqueCode;
      if (nested) return String(nested).trim().toUpperCase();
    } catch {
      // keep raw text
    }
  }

  return text.toUpperCase();
}

export function authPathForAftrHrsClaim(returnTo = AFTRHRS_PATHS.claimReturn): string {
  const params = new URLSearchParams({
    mode: "signup",
    next: returnTo,
    intent: "aftrhrs_claim",
    role: "participant",
  });
  return `/auth?${params.toString()}`;
}

export function authPathForAftrHrsPass(returnTo = AFTRHRS_PATHS.passAlias): string {
  const params = new URLSearchParams({
    mode: "login",
    next: returnTo,
    intent: "aftrhrs_pass",
    role: "participant",
  });
  return `/auth?${params.toString()}`;
}

export function isAftrHrsPassPath(path?: string | null): boolean {
  if (!path) return false;
  const pathname = path.split("?")[0];
  return pathname === AFTRHRS_PATHS.pass || pathname === AFTRHRS_PATHS.passAlias;
}

export function isAftrHrsClaimReturn(path?: string | null): boolean {
  if (!path) return false;
  const [pathname, query = ""] = path.split("?");
  if (pathname !== AFTRHRS_PATHS.moment && pathname !== AFTRHRS_PATHS.landing) return false;
  const params = new URLSearchParams(query);
  return params.get("claim") === "1" || params.get("intent") === "aftrhrs_claim";
}

export function isAftrHrsAuthIntent(intent?: string | null, next?: string | null): boolean {
  if (intent === "aftrhrs_claim" || intent === "aftrhrs_pass") return true;
  const pathname = String(next || "").split("?")[0];
  return pathname === AFTRHRS_PATHS.landing
    || pathname.startsWith(`${AFTRHRS_PATHS.landing}/`)
    || pathname === AFTRHRS_PATHS.moment
    || pathname.startsWith(`${AFTRHRS_PATHS.moment}/`);
}

export function isAftrHrsSceneSlug(slug?: string | null): boolean {
  return String(slug || "").trim().toLowerCase() === AFTRHRS_SCENE_SLUG;
}

export function isAftrHrsMoment(moment?: { id?: string | null; slug?: string | null } | null): boolean {
  const id = String(moment?.id || "").trim().toLowerCase();
  const slug = String(moment?.slug || "").trim().toLowerCase();
  return id === AFTRHRS_MOMENT_ID || slug === AFTRHRS_MOMENT_SLUG;
}

export const AFTRHRS_SCENE_MOMENT = {
  id: AFTRHRS_MOMENT_ID,
  slug: AFTRHRS_MOMENT_SLUG,
  title: "AftrHrs",
  venue_name: "Sea Deck",
  location: "Orchid Village, 20 Barbican Road, Kingston",
  starts_at: AFTRHRS_START_ISO,
  image_url: "/campaigns/aftrhrs/flyer.jpg",
} as const;

export function sceneMomentsWithAftrHrs<T extends { id?: string | null; slug?: string | null }>(
  sceneSlug: string | null | undefined,
  moments: T[] | null | undefined,
): Array<T | typeof AFTRHRS_SCENE_MOMENT> {
  const list = Array.isArray(moments) ? [...moments] : [];
  if (!isAftrHrsSceneSlug(sceneSlug)) return list;
  const featured = list.find((row) => isAftrHrsMoment(row));
  const rest = list.filter((row) => !isAftrHrsMoment(row));
  return featured ? [featured, ...rest] : [AFTRHRS_SCENE_MOMENT, ...rest];
}

export function hrefForSceneMoment(moment?: { id?: string | null; slug?: string | null } | null): string {
  return isAftrHrsMoment(moment) ? AFTRHRS_PATHS.landing : `/moments/${moment?.id || ""}`;
}

export function jamaicaDateParts(now: Date = new Date()): {
  ymd: string;
  weekday: number;
  hour: number;
} {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: AFTRHRS_TIMEZONE,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(formatter.formatToParts(now).map((part) => [part.type, part.value]));
  const weekdays: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    ymd: `${parts.year}-${parts.month}-${parts.day}`,
    weekday: weekdays[parts.weekday] ?? now.getDay(),
    hour: Number(parts.hour),
  };
}

export function addAftrHrsCalendarDays(ymd: string, days: number): string {
  const [year, month, day] = ymd.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  return utc.toISOString().slice(0, 10);
}

/** Friday this claim, pass, and 30-pass pool belong to. Saturday 6:00 AM Jamaica opens the next Friday. */
export function aftrHrsClaimFriday(now: Date | string | number = new Date()): string {
  const parts = jamaicaDateParts(parseAftrHrsTime(now));
  if (parts.weekday === 6 && parts.hour < AFTRHRS_WEEK_ROLLOVER_HOUR) {
    return addAftrHrsCalendarDays(parts.ymd, -1);
  }
  if (parts.weekday === AFTRHRS_WEEKDAY) return parts.ymd;
  if (parts.weekday === 6) return addAftrHrsCalendarDays(parts.ymd, 6);
  return addAftrHrsCalendarDays(parts.ymd, AFTRHRS_WEEKDAY - parts.weekday);
}

export function aftrHrsEditionSlug(weekFriday: string): string {
  return weekFriday === AFTRHRS_FIRST_FRIDAY ? AFTRHRS_MOMENT_SLUG : `${AFTRHRS_MOMENT_SLUG}-${weekFriday}`;
}

export function isCurrentAftrHrsPass(
  pass: { status?: string | null; weekFriday?: string | null; editionWeekFriday?: string | null } | null | undefined,
  now: Date | string | number = new Date(),
): boolean {
  if (!pass) return false;
  if (pass.status !== "active" && pass.status !== "redeemed") return false;
  const friday = String(pass.weekFriday || pass.editionWeekFriday || "").slice(0, 10);
  return friday === aftrHrsClaimFriday(now);
}

export function jamaicaWeekday(now: Date = new Date()): number {
  return jamaicaDateParts(now).weekday;
}

export function isAftrHrsDoorNight(now: Date = new Date()): boolean {
  return jamaicaWeekday(now) === AFTRHRS_WEEKDAY;
}

export function shouldResumeAftrHrsClaim(input: {
  authenticated: boolean;
  hasPass: boolean;
  soldOut?: boolean;
  pendingTermsAccepted?: boolean;
}): boolean {
  if (!input.authenticated || input.hasPass || input.soldOut) return false;
  return Boolean(input.pendingTermsAccepted);
}

export function ambassadorRemaining(allocation: number, distributed: number): number {
  return Math.max(0, Number(allocation || 0) - Number(distributed || 0));
}

export function canDistributeInvitation(allocation: number, distributed: number, quantity = 1): AftrHrsClaimDecision {
  if (distributed + quantity > allocation) {
    return { ok: false, code: "allocation", message: AFTRHRS_CLAIM_ERRORS.allocation };
  }
  return { ok: true };
}

export function canRedeemPass(status: EventPassStatus): AftrHrsClaimDecision {
  if (status === "redeemed") {
    return { ok: false, code: "already_redeemed", message: AFTRHRS_CLAIM_ERRORS.already_redeemed };
  }
  if (status !== "active") {
    return { ok: false, code: "not_redeemable", message: AFTRHRS_CLAIM_ERRORS.not_redeemable };
  }
  return { ok: true };
}

export type AftrHrsFunnelStage =
  | "landing_view"
  | "moment_join"
  | "pass_secured"
  | "reminder_reached"
  | "checked_in"
  | "attended"
  | "retained";

export const AFTRHRS_FUNNEL_STAGES: AftrHrsFunnelStage[] = [
  "landing_view",
  "moment_join",
  "pass_secured",
  "reminder_reached",
  "checked_in",
  "attended",
  "retained",
];

export const AFTRHRS_COPY = {
  headline: "After hours is where house lives.",
  supporting:
    "AftrHrs brings Afro House, Classic House and House Fusion to Sea Deck for a carefully curated night powered by Origin: Alric & Boyd.",
  positioning: "Good music. Good people. After hours.",
  moment:
    "This is more than an event listing. Join the AftrHrs Moment to secure access, receive updates, connect with the experience and be first in line for what happens next.",
  venue:
    "Sea Deck is an open-air Barbican venue combining dining, drinks and nightlife in a distinctive deck-side setting. Follow Sea Deck on Promorang to discover upcoming experiences, offers and Moments.",
  soldOutHeadline: "Digital Free Passes Claimed",
  soldOutBody:
    "The digital free release has been secured. Physical invitations are still available through approved AftrHrs Ambassadors.",
  ambassador:
    "Missed the digital release? AftrHrs Ambassadors have the remaining physical invitations. Connect with an approved ambassador to secure yours.",
  confirmation:
    "Your AftrHrs Digital Free Pass is secured. Arrive at Sea Deck before 11:30 PM to get in free. Present this pass at the door for validation. Admission remains subject to venue capacity, entry policies and successful pass verification.",
  arrivalRule:
    "RSVP holders must arrive before 11:30 PM to get in free.",
  claimGuestCta: "Get my AftrHrs pass",
  guestRsvpCta: "RSVP for Friday",
  guestDigitalCta: "Get the digital pass",
  guestLandingHeadline: "AftrHrs at Sea Deck",
  guestLandingLead:
    "House on Friday — the AftrHrs Moment in Kingston After Dark. Put your name on the list — no Promorang account. Or hold a digital pass, like a physical invite, for the month.",
  guestMomentLine: "This Friday still lives in PROMORANG. Your RSVP counts as going on the AftrHrs Moment.",
  guestMomentCta: "Open the AftrHrs Moment",
  guestGoingOne: "1 already going",
  guestGoingMany: "{count} already going",
  guestSuccessRsvp: "You are on this Friday’s list. Give your name at the door before 11:30 PM.",
  guestSuccessPass: "Your digital pass is on the way. Open the email for your door code — it covers the month.",
  guestUpsell: "Want the rest of Kingston After Dark? The AftrHrs Moment is still in PROMORANG when you are ready.",
  guestTerms: "I understand free entry is before 11:30 PM and Sea Deck can still turn people away if the room is full.",
  guestNameLabel: "Name",
  guestEmailLabel: "Email",
  guestPhoneLabel: "Telephone",
  claimSignedInCta: "Claim My Free Pass",
  authHeadline: "Get your AftrHrs pass",
  authBody:
    "Create a Promorang account to receive your AftrHrs Digital Free Pass. After you join, the door pass opens automatically — it is not the Promorang membership card.",
  walletNeedClaim:
    "A Promorang account is not the AftrHrs door pass. Claim your Digital Free Pass here, then show the QR at Sea Deck.",
  walletHavePass:
    "This is this Friday’s AftrHrs door pass. Show this QR at Sea Deck — not the Promorang membership card. Unused passes expire after the night.",
  walletLoadError: "We could not load your AftrHrs pass. Try again.",
  findPass:
    "Your AftrHrs pass lives at the top of your Promorang wallet and at /aftrhrs/pass. The Promorang membership card is not the door pass.",
  sceneMomentLine: "Friday · AftrHrs at Sea Deck",
  sceneListBody: "AftrHrs is the Friday moment in this scene.",
  homepageHeroEyebrow: "Friday night",
  homepageHeroBody:
    "The Friday moment in Kingston After Dark. RSVP for Sea Deck — no account needed.",
  authSceneHint: "AftrHrs is Friday night in Kingston After Dark. RSVP for Sea Deck.",
  sceneCta: "RSVP for Friday",
  sceneFeaturedLabel: "Tonight in this scene",
  sceneFeaturedLine: "AftrHrs at Sea Deck",
  sceneAsideEyebrow: "Friday in this scene",
  sceneAsideTitle: "AftrHrs is the night on.",
  sceneAsideBody: "This is Kingston After Dark. AftrHrs is the Friday moment at Sea Deck.",
  poweredBy: "Powered by PROMORANG",
  when: AFTRHRS_CADENCE,
  doors: AFTRHRS_DOORS,
  whenLine: AFTRHRS_WHEN_LINE,
  metaTitle: "AftrHrs at Sea Deck | RSVP for Friday",
  metaDescription:
    "AftrHrs every Friday at Sea Deck. RSVP with your name, email, and telephone — or hold a digital pass for the month. Powered by Origin: Alric & Boyd.",
} as const;

export function aftrHrsDigitalReleaseView(input: { soldOut: boolean; hasPass: boolean }) {
  if (input.hasPass) {
    return {
      kind: "pass" as const,
      primaryCta: "Open my pass",
      eventUnavailable: false,
    };
  }
  if (input.soldOut) {
    return {
      kind: "sold_out" as const,
      headline: AFTRHRS_COPY.soldOutHeadline,
      body: AFTRHRS_COPY.soldOutBody,
      primaryCta: "Find an AftrHrs Ambassador",
      secondaryCta: "Join the AftrHrs Waitlist",
      eventUnavailable: false,
    };
  }
  return {
    kind: "claim" as const,
    primaryCta: AFTRHRS_COPY.claimGuestCta,
    eventUnavailable: false,
  };
}

export const DEFAULT_AFTRHRS_FAQS = [
  {
    question: "When is AftrHrs?",
    answer: "Every Friday from 10:00 PM at Sea Deck.",
  },
  {
    question: "Are Digital Free Passes still available?",
    answer: "Digital Free Passes are limited and go quickly. Claim yours while they last.",
  },
  {
    question: "What time must I arrive to get in free?",
    answer: "RSVP and Digital Free Pass holders must arrive before 11:30 PM to get in free.",
  },
  {
    question: "What happens when the Digital Free Passes are claimed?",
    answer: "Find an AftrHrs Ambassador for a physical invitation. Paid entry stays open.",
  },
  {
    question: "How do I obtain a physical invitation?",
    answer: "Connect with an approved AftrHrs Ambassador. They distribute the remaining free invitations in person.",
  },
  {
    question: "Does a physical invitation guarantee entry?",
    answer: "A valid invitation or RSVP covers admission, subject to Sea Deck capacity, entry policies, and successful verification at the door.",
  },
  {
    question: "What is the cost without an invitation or RSVP?",
    answer: "Entry without an invitation or RSVP is JMD $2,000.",
  },
  {
    question: "What does the paid admission include?",
    answer: "Paid patrons receive complimentary drink and wings.",
  },
  {
    question: "Where is Sea Deck?",
    answer: "Orchid Village, 20 Barbican Road, Kingston.",
  },
  {
    question: "I signed up for Promorang. Where is my pass?",
    answer: "The public AftrHrs page does not need a Promorang account. If you claimed inside Promorang, your pass is at /aftrhrs/pass or the top of your wallet. Friday guests RSVP on /aftrhrs with name, email, and telephone.",
  },
  {
    question: "What is Kingston After Dark?",
    answer: "Kingston After Dark is the nightlife scene. AftrHrs is the Friday moment at Sea Deck inside that scene. RSVP on /aftrhrs.",
  },
  {
    question: "How will my Digital Free Pass be verified?",
    answer: "Digital pass holders show the unique QR from the email ticket. Friday RSVP guests give their name at the door. Staff scan a pass once. A redeemed pass cannot be scanned again.",
  },
  {
    question: "Can I transfer my pass?",
    answer: "Each Digital Free Pass is for one person and cannot be transferred.",
  },
  {
    question: "Is my pass good every Friday?",
    answer: "A Friday RSVP is for that Friday only. Unused list spots open again next week. A digital pass works like a physical invite for the month.",
  },
  {
    question: "What happens if the venue reaches capacity?",
    answer: "Admission remains subject to venue capacity and Sea Deck entry policies even with a valid pass or invitation.",
  },
] as const;

export const DEFAULT_AFTRHRS_GUEST_FAQS = [
  {
    question: "Do I need a Promorang account?",
    answer: "No. This page is only the AftrHrs list. Name, email, and telephone are enough. Your RSVP still counts as going on the AftrHrs Moment.",
  },
  {
    question: "What is a Friday RSVP?",
    answer: "You are on this Friday’s door list and on the AftrHrs Moment. Give your name when you arrive before 11:30 PM.",
  },
  {
    question: "What is the digital pass?",
    answer: "It works like a physical invite. It gets you in free for the month. We email a door code and a ticket you can show.",
  },
  {
    question: "When is AftrHrs?",
    answer: "Every Friday from 10:00 PM at Sea Deck, Orchid Village, 20 Barbican Road, Kingston.",
  },
  {
    question: "What if the list or the drop is closed?",
    answer: "When a lane fills, it closes. Friday RSVP opens again next week. Digital passes open again when another drop is released.",
  },
] as const;
