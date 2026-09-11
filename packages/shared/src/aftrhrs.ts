export const AFTRHRS_MOMENT_SLUG = "aftrhrs";
export const SEA_DECK_VENUE_SLUG = "sea-deck";
export const AFTRHRS_SCENE_SLUG = "kingston-after-dark";

export const AFTRHRS_MOMENT_ID = "00000000-0000-0000-0002-000000000080";
export const SEA_DECK_VENUE_ID = "00000000-0000-0000-0003-000000000080";
export const AFTRHRS_EDITION_ID = "00000000-0000-0000-0004-000000000080";

export const AFTRHRS_DIGITAL_PASS_LIMIT = 30;
export const AFTRHRS_TIMEZONE = "America/Jamaica";
export const AFTRHRS_START_ISO = "2026-09-11T22:00:00-05:00";
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
  ambassador: "/moments/aftrhrs/ambassador",
  door: "/moments/aftrhrs/door",
  admin: "/admin/aftrhrs",
  claimReturn: "/aftrhrs?claim=1",
  wallet: "/wallet",
} as const;

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
  already_claimed: "This account already holds an AftrHrs Digital Free Pass.",
  identity_claimed: "A Digital Free Pass is already attached to this verified email or telephone number.",
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

export function guestPassStatus(status?: string | null): string {
  if (status === "redeemed") return "Used";
  if (status === "cancelled" || status === "expired") return "No longer valid";
  return "Ready";
}

export function guestPassType(type?: string | null): string {
  if (type === "digital-free") return "Digital free pass";
  if (type === "physical-invitation") return "Physical invitation";
  if (type === "paid") return "Paid entry";
  if (type === "guest-list") return "On the guest list";
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
  guestListTitle: "Who has a pass",
  guestListHelp: "Codes are for the door. The words tell you what kind of pass it is and whether it still works.",
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

  const urlMatch = text.match(/(?:promorang:\/\/aftrhrs\/redeem\/|\/moments\/aftrhrs\/door\?code=|[?&]code=)([A-Z0-9-]+)/i);
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
  claimSignedInCta: "Claim My Free Pass",
  authHeadline: "Get your AftrHrs pass",
  authBody:
    "Create a Promorang account to receive your AftrHrs Digital Free Pass. After you join, the door pass opens automatically — it is not the Promorang membership card.",
  walletNeedClaim:
    "A Promorang account is not the AftrHrs door pass. Claim your Digital Free Pass here, then show the QR at Sea Deck.",
  walletHavePass:
    "This is your AftrHrs door pass. Show this QR at Sea Deck — not the Promorang membership card.",
  walletLoadError: "We could not load your AftrHrs pass. Try again.",
  findPass:
    "Your AftrHrs pass lives at the top of your Promorang wallet and at /aftrhrs/pass. The Promorang membership card is not the door pass.",
  poweredBy: "Powered by PROMORANG",
  when: AFTRHRS_CADENCE,
  doors: AFTRHRS_DOORS,
  whenLine: AFTRHRS_WHEN_LINE,
  metaTitle: "AftrHrs at Sea Deck | Limited Free Passes on Promorang",
  metaDescription:
    "Join AftrHrs every Friday at Sea Deck, powered by Origin: Alric & Boyd and PROMORANG. Claim a limited Digital Free Pass or connect with an AftrHrs Ambassador for a physical invitation.",
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
    primaryCta: "Claim My Free Pass",
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
    answer: "Signing up creates your Promorang account. Your AftrHrs Digital Free Pass is a separate door pass. Open /aftrhrs/pass or the top of your wallet. If it is not there yet, claim it on the AftrHrs page and the QR appears in both places.",
  },
  {
    question: "How will my Digital Free Pass be verified?",
    answer: "Present the unique QR code from your AftrHrs pass at Sea Deck. Open it from /aftrhrs/pass or the top of your wallet. Staff scan it once. A redeemed pass cannot be scanned again.",
  },
  {
    question: "Can I transfer my pass?",
    answer: "Each Digital Free Pass is for one person and cannot be transferred.",
  },
  {
    question: "What happens if the venue reaches capacity?",
    answer: "Admission remains subject to venue capacity and Sea Deck entry policies even with a valid pass or invitation.",
  },
] as const;
