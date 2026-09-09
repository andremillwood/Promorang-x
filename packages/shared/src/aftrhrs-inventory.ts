import {
  AFTRHRS_CLAIM_ERRORS,
  AFTRHRS_DIGITAL_PASS_LIMIT,
  AFTRHRS_EDITION_ID,
  AFTRHRS_MOMENT_ID,
  AFTRHRS_MOMENT_SLUG,
  AFTRHRS_START_ISO,
  SEA_DECK_VENUE_ID,
  ambassadorRemaining,
  canDistributeInvitation,
  canRedeemPass,
  decodeAftrHrsPassPayload,
  encodeAftrHrsPassPayload,
  evaluateDigitalPassClaim,
  nextParticipationState,
  normalizeAftrHrsIdentity,
  normalizeAftrHrsPhone,
  participationAfterPassType,
  remainingDigitalPasses,
  type AftrHrsEditionSnapshot,
  type EventPassStatus,
  type EventPassType,
  type MomentParticipationState,
} from "./aftrhrs";

export type StoredPass = {
  id: string;
  eventId: string;
  userId: string;
  passType: EventPassType;
  uniqueCode: string;
  qrPayload: string;
  status: EventPassStatus;
  claimSource: string | null;
  ambassadorId: string | null;
  claimedAt: string;
  redeemedAt: string | null;
  email: string | null;
  phone: string | null;
  campaign: string | null;
  referrer: string | null;
};

export type StoredAmbassador = {
  ambassadorUserId: string;
  eventId: string;
  name: string;
  allocation: number;
  distributed: number;
  trackingCode: string;
  approved: boolean;
  active: boolean;
  contactPreference: string;
  publicContactHandle: string | null;
  contactConsent: boolean;
};

export type StoredRequest = {
  id: string;
  eventId: string;
  userId: string | null;
  ambassadorId: string | null;
  status: "open" | "assigned" | "fulfilled" | "cancelled";
  note: string | null;
  createdAt: string;
  fulfilledAt: string | null;
  passId: string | null;
};

export type StoredParticipation = {
  userId: string;
  eventId: string;
  state: MomentParticipationState;
  source: string | null;
  referrer: string | null;
  reminderOptIn: boolean;
};

type ClaimInput = {
  userId?: string | null;
  email?: string | null;
  phone?: string | null;
  authenticated?: boolean;
  termsAccepted?: boolean;
  now?: Date | string | number;
  source?: string | null;
  campaign?: string | null;
  referrer?: string | null;
};

type ClaimSuccess = { ok: true; pass: StoredPass; remaining: number };
type ClaimFailure = { ok: false; code: string; message: string; remaining: number };
export type ClaimResult = ClaimSuccess | ClaimFailure;

function id(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function code() {
  return `AH-${Math.random().toString(36).slice(2, 6).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function defaultAftrHrsEdition(overrides: Partial<AftrHrsEditionSnapshot> = {}): AftrHrsEditionSnapshot {
  return {
    id: AFTRHRS_EDITION_ID,
    momentId: AFTRHRS_MOMENT_ID,
    venueId: SEA_DECK_VENUE_ID,
    slug: AFTRHRS_MOMENT_SLUG,
    published: true,
    claimsOpen: true,
    digitalAllocation: AFTRHRS_DIGITAL_PASS_LIMIT,
    digitalClaimed: 0,
    claimOpensAt: null,
    claimClosesAt: AFTRHRS_START_ISO,
    pageMode: "live",
    ...overrides,
  };
}

export function createAftrHrsInventory(initial?: {
  edition?: Partial<AftrHrsEditionSnapshot>;
  ambassadors?: StoredAmbassador[];
}) {
  let edition = defaultAftrHrsEdition(initial?.edition);
  const passes = new Map<string, StoredPass>();
  const participations = new Map<string, StoredParticipation>();
  const ambassadors = new Map<string, StoredAmbassador>();
  const requests = new Map<string, StoredRequest>();
  let tail: Promise<unknown> = Promise.resolve();

  for (const ambassador of initial?.ambassadors || []) {
    ambassadors.set(ambassador.ambassadorUserId, { ...ambassador, eventId: edition.momentId });
  }

  function enqueue<T>(work: () => T): Promise<T> {
    const run = tail.then(() => work());
    tail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  function identityTaken(email: string | null, phone: string | null, exceptUserId?: string) {
    for (const pass of passes.values()) {
      if (pass.passType !== "digital-free") continue;
      if (pass.status === "cancelled") continue;
      if (exceptUserId && pass.userId === exceptUserId) continue;
      if (email && pass.email && pass.email === email) return true;
      if (phone && pass.phone && pass.phone === phone) return true;
    }
    return false;
  }

  function userDigitalPass(userId: string) {
    return [...passes.values()].find(
      (pass) => pass.userId === userId && pass.passType === "digital-free" && pass.status !== "cancelled",
    );
  }

  function setParticipation(userId: string, state: MomentParticipationState, source?: string | null, referrer?: string | null) {
    const current = participations.get(userId);
    participations.set(userId, {
      userId,
      eventId: edition.momentId,
      state: nextParticipationState(current?.state, state),
      source: source ?? current?.source ?? null,
      referrer: referrer ?? current?.referrer ?? null,
      reminderOptIn: current?.reminderOptIn ?? true,
    });
    return participations.get(userId)!;
  }

  function claimDigitalPass(input: ClaimInput): Promise<ClaimResult> {
    return enqueue(() => {
      const email = normalizeAftrHrsIdentity(input.email);
      const phone = normalizeAftrHrsPhone(input.phone);
      const existing = input.userId ? userDigitalPass(input.userId) : undefined;
      const decision = evaluateDigitalPassClaim({
        edition,
        identity: { userId: input.userId, email, phone },
        authenticated: Boolean(input.authenticated && input.userId),
        termsAccepted: Boolean(input.termsAccepted),
        now: input.now,
        existingDigitalPass: Boolean(existing),
        identityAlreadyClaimed: identityTaken(email, phone, input.userId || undefined),
      });

      if (!decision.ok) {
        return { ok: false, code: decision.code, message: decision.message, remaining: remainingDigitalPasses(edition) };
      }

      const uniqueCode = code();
      const pass: StoredPass = {
        id: id("pass"),
        eventId: edition.momentId,
        userId: input.userId!,
        passType: "digital-free",
        uniqueCode,
        qrPayload: encodeAftrHrsPassPayload(uniqueCode),
        status: "active",
        claimSource: input.source || "landing",
        ambassadorId: null,
        claimedAt: parseNow(input.now),
        redeemedAt: null,
        email,
        phone,
        campaign: input.campaign || null,
        referrer: input.referrer || null,
      };
      passes.set(pass.id, pass);
      edition = { ...edition, digitalClaimed: edition.digitalClaimed + 1 };
      setParticipation(input.userId!, "digital_pass_claimed", input.source, input.referrer);
      return { ok: true, pass, remaining: remainingDigitalPasses(edition) };
    });
  }

  function requestAmbassador(input: {
    userId?: string | null;
    ambassadorId?: string | null;
    note?: string | null;
    now?: Date | string | number;
  }) {
    return enqueue(() => {
      const request: StoredRequest = {
        id: id("req"),
        eventId: edition.momentId,
        userId: input.userId || null,
        ambassadorId: input.ambassadorId || null,
        status: input.ambassadorId ? "assigned" : "open",
        note: input.note || null,
        createdAt: parseNow(input.now),
        fulfilledAt: null,
        passId: null,
      };
      requests.set(request.id, request);
      if (input.userId) setParticipation(input.userId, "ambassador_request_submitted", "ambassador");
      return request;
    });
  }

  function fulfillInvitation(input: {
    ambassadorId: string;
    requestId?: string | null;
    userId?: string | null;
    phone?: string | null;
    uniqueCode?: string | null;
    now?: Date | string | number;
  }) {
    return enqueue(() => {
      const ambassador = ambassadors.get(input.ambassadorId);
      if (!ambassador || !ambassador.approved || !ambassador.active) {
        return { ok: false as const, code: "not_found", message: "Ambassador not found.", remaining: 0 };
      }
      const allowed = canDistributeInvitation(ambassador.allocation, ambassador.distributed, 1);
      if (!allowed.ok) {
        return { ok: false as const, code: allowed.code, message: allowed.message, remaining: ambassadorRemaining(ambassador.allocation, ambassador.distributed) };
      }

      const uniqueCode = input.uniqueCode || code();
      const pass: StoredPass = {
        id: id("pass"),
        eventId: edition.momentId,
        userId: input.userId || input.ambassadorId,
        passType: "physical-invitation",
        uniqueCode,
        qrPayload: encodeAftrHrsPassPayload(uniqueCode),
        status: "active",
        claimSource: "ambassador",
        ambassadorId: input.ambassadorId,
        claimedAt: parseNow(input.now),
        redeemedAt: null,
        email: null,
        phone: normalizeAftrHrsPhone(input.phone),
        campaign: ambassador.trackingCode,
        referrer: input.ambassadorId,
      };
      passes.set(pass.id, pass);
      ambassadors.set(input.ambassadorId, { ...ambassador, distributed: ambassador.distributed + 1 });
      if (input.requestId) {
        const request = requests.get(input.requestId);
        if (request) {
          requests.set(input.requestId, {
            ...request,
            status: "fulfilled",
            fulfilledAt: pass.claimedAt,
            passId: pass.id,
            ambassadorId: input.ambassadorId,
          });
        }
      }
      if (input.userId) setParticipation(input.userId, participationAfterPassType("physical-invitation"), "ambassador", input.ambassadorId);
      return {
        ok: true as const,
        pass,
        remaining: ambassadorRemaining(ambassador.allocation, ambassador.distributed + 1),
      };
    });
  }

  function redeemPass(rawCode: string, now?: Date | string | number) {
    return enqueue(() => {
      const uniqueCode = decodeAftrHrsPassPayload(rawCode);
      const pass = [...passes.values()].find((item) => item.uniqueCode === uniqueCode);
      if (!pass) return { ok: false as const, code: "not_found", message: AFTRHRS_CLAIM_ERRORS.not_found };
      const allowed = canRedeemPass(pass.status);
      if (!allowed.ok) return { ok: false as const, code: allowed.code, message: allowed.message };
      const redeemed: StoredPass = { ...pass, status: "redeemed", redeemedAt: parseNow(now) };
      passes.set(pass.id, redeemed);
      setParticipation(pass.userId, "checked_in", "door");
      return { ok: true as const, pass: redeemed };
    });
  }

  function joinMoment(userId: string, source?: string | null, referrer?: string | null) {
    return enqueue(() => setParticipation(userId, "interested", source, referrer));
  }

  function markAttended(userId: string) {
    return enqueue(() => setParticipation(userId, "attended", "door"));
  }

  return {
    claimDigitalPass,
    requestAmbassador,
    fulfillInvitation,
    redeemPass,
    joinMoment,
    markAttended,
    snapshot() {
      return {
        edition: { ...edition },
        remaining: remainingDigitalPasses(edition),
        soldOut: remainingDigitalPasses(edition) <= 0,
        passes: [...passes.values()],
        ambassadors: [...ambassadors.values()],
        requests: [...requests.values()],
        participations: [...participations.values()],
      };
    },
    setEdition(overrides: Partial<AftrHrsEditionSnapshot>) {
      edition = { ...edition, ...overrides };
    },
  };
}

function parseNow(value?: Date | string | number) {
  if (value instanceof Date) return value.toISOString();
  if (value == null) return new Date().toISOString();
  return new Date(value).toISOString();
}

export type AftrHrsInventory = ReturnType<typeof createAftrHrsInventory>;
