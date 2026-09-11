import {
  AFTRHRS_CLAIM_ERRORS,
  AFTRHRS_DIGITAL_PASS_BATCH,
  AFTRHRS_DIGITAL_PASS_LIMIT,
  AFTRHRS_FIRST_FRIDAY,
  AFTRHRS_EDITION_ID,
  AFTRHRS_MOMENT_ID,
  AFTRHRS_MOMENT_SLUG,
  AFTRHRS_RSVP_LIMIT,
  SEA_DECK_VENUE_ID,
  aftrHrsClaimFriday,
  aftrHrsEditionSlug,
  aftrHrsMonthKey,
  ambassadorRemaining,
  canDistributeInvitation,
  canRedeemPass,
  decodeAftrHrsPassPayload,
  encodeAftrHrsPassPayload,
  evaluateDigitalPassClaim,
  evaluateGuestEntry,
  nextParticipationState,
  normalizeAftrHrsIdentity,
  normalizeAftrHrsName,
  normalizeAftrHrsPhone,
  participationAfterPassType,
  remainingDigitalPasses,
  remainingGuestSlots,
  type AftrHrsEditionSnapshot,
  type AftrHrsGuestKind,
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
  weekFriday: string;
  editionId: string;
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
    claimClosesAt: null,
    pageMode: "live",
    weekFriday: AFTRHRS_FIRST_FRIDAY,
    rsvpAllocation: AFTRHRS_RSVP_LIMIT,
    rsvpClaimed: 0,
    ...overrides,
  };
}

export type StoredGuestEntry = {
  id: string;
  kind: AftrHrsGuestKind;
  name: string;
  email: string;
  phone: string;
  uniqueCode: string;
  qrPayload: string;
  status: EventPassStatus;
  weekFriday: string | null;
  monthKey: string | null;
  releaseId: string | null;
  claimedAt: string;
  redeemedAt: string | null;
};

export type StoredDigitalRelease = {
  id: string;
  monthKey: string;
  allocation: number;
  claimed: number;
  claimsOpen: boolean;
};

export function createAftrHrsInventory(initial?: {
  edition?: Partial<AftrHrsEditionSnapshot>;
  ambassadors?: StoredAmbassador[];
}) {
  let edition = defaultAftrHrsEdition(initial?.edition);
  const passes = new Map<string, StoredPass>();
  const participations = new Map<string, StoredParticipation>();
  const ambassadors = new Map<string, StoredAmbassador>();
  const requests = new Map<string, StoredRequest>();
  const guests = new Map<string, StoredGuestEntry>();
  let digitalRelease: StoredDigitalRelease = {
    id: "release-1",
    monthKey: aftrHrsMonthKey(AFTRHRS_FIRST_FRIDAY),
    allocation: AFTRHRS_DIGITAL_PASS_BATCH,
    claimed: 0,
    claimsOpen: true,
  };
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

  function applyWeeklyRollover(now?: Date | string | number) {
    const friday = aftrHrsClaimFriday(now ?? new Date());
    if (edition.weekFriday === friday) return friday;
    if (edition.weekFriday && friday < edition.weekFriday) return edition.weekFriday;
    for (const pass of passes.values()) {
      if (pass.status === "active" && pass.weekFriday && pass.weekFriday < friday) {
        passes.set(pass.id, { ...pass, status: "expired" });
      }
    }
    for (const guest of guests.values()) {
      if (guest.kind === "rsvp" && guest.status === "active" && guest.weekFriday && guest.weekFriday < friday) {
        guests.set(guest.id, { ...guest, status: "expired" });
      }
    }
    edition = defaultAftrHrsEdition({
      id: `edition-${friday}`,
      slug: aftrHrsEditionSlug(friday),
      weekFriday: friday,
      digitalClaimed: 0,
      rsvpClaimed: 0,
    });
    return friday;
  }

  function expireStaleGuestPasses(now?: Date | string | number) {
    const month = aftrHrsMonthKey(now ?? new Date());
    for (const guest of guests.values()) {
      if (guest.kind === "digital-pass" && guest.status === "active" && guest.monthKey && guest.monthKey < month) {
        guests.set(guest.id, { ...guest, status: "expired" });
      }
    }
  }

  function guestHeld(kind: AftrHrsGuestKind, email: string | null, phone: string | null) {
    return [...guests.values()].some((guest) => {
      if (guest.kind !== kind) return false;
      if (guest.status !== "active" && guest.status !== "redeemed") return false;
      if (kind === "rsvp" && guest.weekFriday !== edition.weekFriday) return false;
      if (kind === "digital-pass" && guest.monthKey !== digitalRelease.monthKey) return false;
      return (email && guest.email === email) || (phone && guest.phone === phone);
    });
  }

  function identityTaken(email: string | null, phone: string | null, exceptUserId?: string) {
    for (const pass of passes.values()) {
      if (pass.passType !== "digital-free") continue;
      if (pass.status !== "active" && pass.status !== "redeemed") continue;
      if (pass.weekFriday !== edition.weekFriday) continue;
      if (exceptUserId && pass.userId === exceptUserId) continue;
      if (email && pass.email && pass.email === email) return true;
      if (phone && pass.phone && pass.phone === phone) return true;
    }
    return false;
  }

  function userDigitalPass(userId: string) {
    return [...passes.values()].find(
      (pass) =>
        pass.userId === userId
        && pass.passType === "digital-free"
        && (pass.status === "active" || pass.status === "redeemed")
        && pass.weekFriday === edition.weekFriday,
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
      applyWeeklyRollover(input.now);
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
        weekFriday: edition.weekFriday || aftrHrsClaimFriday(input.now),
        editionId: edition.id,
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
        weekFriday: edition.weekFriday || aftrHrsClaimFriday(input.now),
        editionId: edition.id,
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
      applyWeeklyRollover(now);
      expireStaleGuestPasses(now);
      const uniqueCode = decodeAftrHrsPassPayload(rawCode);
      const pass = [...passes.values()].find((item) => item.uniqueCode === uniqueCode);
      if (pass) {
        const allowed = canRedeemPass(pass.status);
        if (!allowed.ok) return { ok: false as const, code: allowed.code, message: allowed.message };
        const redeemed: StoredPass = { ...pass, status: "redeemed", redeemedAt: parseNow(now) };
        passes.set(pass.id, redeemed);
        setParticipation(pass.userId, "checked_in", "door");
        return { ok: true as const, pass: redeemed };
      }
      const guest = [...guests.values()].find((item) => item.uniqueCode === uniqueCode);
      if (!guest) return { ok: false as const, code: "not_found", message: AFTRHRS_CLAIM_ERRORS.not_found };
      const allowed = canRedeemPass(guest.status);
      if (!allowed.ok) return { ok: false as const, code: allowed.code, message: allowed.message };
      const redeemed: StoredGuestEntry = { ...guest, status: "redeemed", redeemedAt: parseNow(now) };
      guests.set(guest.id, redeemed);
      return { ok: true as const, pass: redeemed };
    });
  }

  function guestRsvp(input: {
    kind: AftrHrsGuestKind;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    termsAccepted?: boolean;
    now?: Date | string | number;
  }) {
    return enqueue(() => {
      applyWeeklyRollover(input.now);
      expireStaleGuestPasses(input.now);
      const name = normalizeAftrHrsName(input.name);
      const email = normalizeAftrHrsIdentity(input.email);
      const phone = normalizeAftrHrsPhone(input.phone);
      const remaining = input.kind === "rsvp"
        ? remainingGuestSlots(edition.rsvpAllocation || AFTRHRS_RSVP_LIMIT, edition.rsvpClaimed || 0)
        : remainingGuestSlots(digitalRelease.allocation, digitalRelease.claimed);
      const laneOpen = input.kind === "rsvp"
        ? remaining > 0
        : digitalRelease.claimsOpen && remaining > 0;
      const decision = evaluateGuestEntry({
        kind: input.kind,
        name,
        email,
        phone,
        termsAccepted: Boolean(input.termsAccepted),
        published: edition.published,
        laneOpen,
        remaining,
        alreadyHeld: guestHeld(input.kind, email, phone),
      });
      if (!decision.ok) {
        return { ok: false as const, code: decision.code, message: decision.message, remaining };
      }
      const uniqueCode = code();
      const friday = edition.weekFriday || aftrHrsClaimFriday(input.now);
      const monthKey = aftrHrsMonthKey(input.now);
      const entry: StoredGuestEntry = {
        id: id("guest"),
        kind: input.kind,
        name: name!,
        email: email!,
        phone: phone!,
        uniqueCode,
        qrPayload: encodeAftrHrsPassPayload(uniqueCode),
        status: "active",
        weekFriday: input.kind === "rsvp" ? friday : null,
        monthKey: input.kind === "digital-pass" ? monthKey : null,
        releaseId: input.kind === "digital-pass" ? digitalRelease.id : null,
        claimedAt: parseNow(input.now),
        redeemedAt: null,
      };
      guests.set(entry.id, entry);
      if (input.kind === "rsvp") {
        edition = { ...edition, rsvpClaimed: Number(edition.rsvpClaimed || 0) + 1 };
      } else {
        digitalRelease = { ...digitalRelease, claimed: digitalRelease.claimed + 1 };
        if (digitalRelease.claimed >= digitalRelease.allocation) {
          digitalRelease = { ...digitalRelease, claimsOpen: false };
        }
      }
      return {
        ok: true as const,
        entry,
        remaining: input.kind === "rsvp"
          ? remainingGuestSlots(edition.rsvpAllocation || AFTRHRS_RSVP_LIMIT, edition.rsvpClaimed || 0)
          : remainingGuestSlots(digitalRelease.allocation, digitalRelease.claimed),
      };
    });
  }

  function closeDigitalRelease() {
    return enqueue(() => {
      digitalRelease = { ...digitalRelease, claimsOpen: false };
      return { ...digitalRelease };
    });
  }

  function openDigitalRelease(now?: Date | string | number) {
    return enqueue(() => {
      digitalRelease = {
        id: id("release"),
        monthKey: aftrHrsMonthKey(now ?? new Date()),
        allocation: AFTRHRS_DIGITAL_PASS_BATCH,
        claimed: 0,
        claimsOpen: true,
      };
      return { ...digitalRelease };
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
    guestRsvp,
    closeDigitalRelease,
    openDigitalRelease,
    joinMoment,
    markAttended,
    snapshot() {
      return {
        edition: { ...edition },
        remaining: remainingDigitalPasses(edition),
        soldOut: remainingDigitalPasses(edition) <= 0,
        rsvpRemaining: remainingGuestSlots(edition.rsvpAllocation || AFTRHRS_RSVP_LIMIT, edition.rsvpClaimed || 0),
        digitalRemaining: remainingGuestSlots(digitalRelease.allocation, digitalRelease.claimed),
        digitalRelease: { ...digitalRelease },
        passes: [...passes.values()],
        guests: [...guests.values()],
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
