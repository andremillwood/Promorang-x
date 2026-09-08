export type PromoCardFaceState = "empty" | "nearby" | "ready" | "returned" | "used" | "expired";

export type PromoCardFaceSource = {
  title?: string;
  issuer?: { name?: string } | null;
  redemptionCode?: string | null;
  redemption?: { code?: string | null; recorded?: boolean } | null;
  expiresAt?: string | null;
};

export type PromoCardFaceInput = {
  holder?: string;
  useThis?: PromoCardFaceSource | null;
  nearbyCount?: number;
  nextBenefitTitle?: string | null;
  latestReturn?: string | null;
  latestReturnAt?: string | null;
  sceneMark?: string | null;
  crewMark?: string | null;
  recordedUse?: boolean;
  expiredOnly?: boolean;
};

export type PromoCardFaceModel = {
  state: PromoCardFaceState;
  holder: string;
  headline: string;
  detail: string;
  places: string;
  action: string;
  footerCue: string;
  issuer?: string;
  issuerInitial?: string;
  credential?: string | null;
  sceneMark?: string;
  crewMark?: string;
  returnStamp?: string;
  returnDate?: string;
  canFlip: boolean;
};

export function issuerInitial(name?: string | null) {
  const letter = (name || "").trim().charAt(0);
  return letter ? letter.toUpperCase() : "";
}

export function credentialFromSource(source?: PromoCardFaceSource | null) {
  return source?.redemptionCode || source?.redemption?.code || null;
}

export function resolvePromoCardFace(input: PromoCardFaceInput = {}): PromoCardFaceModel {
  const holder = input.holder?.trim() || "Your card";
  const issuer = input.useThis?.issuer?.name?.trim() || "";
  const code = credentialFromSource(input.useThis);
  const recorded = Boolean(input.useThis?.redemption?.recorded || input.recordedUse);
  const expired = Boolean(input.expiredOnly);
  const nearbyCount = Number(input.nearbyCount || 0);

  let state: PromoCardFaceState = "empty";
  if (code && !recorded && !expired) state = "ready";
  else if (recorded) state = "used";
  else if (expired) state = "expired";
  else if (nearbyCount > 0) state = "nearby";
  else if (input.latestReturn) state = "returned";

  const copy: Record<PromoCardFaceState, Pick<PromoCardFaceModel, "headline" | "detail" | "action" | "places" | "footerCue">> = {
    empty: {
      headline: "Nothing to show at the door yet",
      detail: "A perk is a real offer a business put up — a free item, a deal, or entry. Until one is on this card, there is nothing to flash at a counter.",
      action: "Browse live perks",
      places: "No participating place is sharing a live benefit",
      footerCue: "This is your PromoCard",
    },
    nearby: {
      headline: "Available nearby",
      detail: input.nextBenefitTitle || "A participating place has something you can claim.",
      action: "Claim it first",
      places: `${nearbyCount} participating ${nearbyCount === 1 ? "place" : "places"}`,
      footerCue: "Claim, then show",
    },
    ready: {
      headline: "Show this",
      detail: input.useThis?.title || "A live perk",
      action: "Show the merchant this QR",
      places: issuer || "Participating business",
      footerCue: "Nothing is used until they validate it",
    },
    returned: {
      headline: "You came back",
      detail: input.latestReturn || "Eligible after a verified night.",
      action: "Eligibility only — not a refill",
      places: "No new perk to show yet",
      footerCue: "The Return is recorded. Value moves when a merchant can honor it.",
    },
    used: {
      headline: "Just used",
      detail: input.useThis?.title || "The merchant recorded this.",
      action: "Come back for the next one",
      places: issuer || "Recorded",
      footerCue: "Punched. The next benefit is a new claim.",
    },
    expired: {
      headline: "This one lapsed",
      detail: input.useThis?.title || "The window closed.",
      action: "Find another",
      places: issuer || "Expired",
      footerCue: "Expired. Not valid at the door.",
    },
  };

  return {
    state,
    holder,
    ...copy[state],
    issuer: issuer || undefined,
    issuerInitial: issuerInitial(issuer) || undefined,
    credential: state === "ready" ? code : null,
    sceneMark: input.sceneMark || undefined,
    crewMark: input.crewMark || undefined,
    returnStamp: input.latestReturn || undefined,
    returnDate: input.latestReturnAt || undefined,
    canFlip: state === "ready" && Boolean(code),
  };
}
