import { journeyReadyCopy } from "./promocard-journey";
import { isPresentablePass } from "./offer-fulfillment";

export type PromoCardFaceState = "empty" | "nearby" | "ready" | "returned" | "used" | "expired";

export type PromoCardFaceSource = {
  title?: string;
  issuer?: { name?: string } | null;
  redemptionCode?: string | null;
  redemption?: { code?: string | null; recorded?: boolean } | null;
  expiresAt?: string | null;
  fulfillmentType?: string | null;
  fulfillmentState?: string | null;
  fulfillmentData?: { shipping_stage?: string | null } | null;
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
  const fulfillmentType = input.useThis?.fulfillmentType;
  const journeyReady = Boolean(
    input.useThis &&
    !recorded &&
    !expired &&
    (code || ["shipping", "automatic", "manual", "qr"].includes(String(fulfillmentType || ""))),
  );

  let state: PromoCardFaceState = "empty";
  if (journeyReady) state = "ready";
  else if (recorded) state = "used";
  else if (expired) state = "expired";
  else if (nearbyCount > 0) state = "nearby";
  else if (input.latestReturn) state = "returned";

  const readyCopy = journeyReadyCopy({
    title: input.useThis?.title,
    issuer,
    fulfillmentType,
    fulfillmentState: input.useThis?.fulfillmentState,
    shippingStage: input.useThis?.fulfillmentData?.shipping_stage || null,
  });

  const copy: Record<PromoCardFaceState, Pick<PromoCardFaceModel, "headline" | "detail" | "action" | "places" | "footerCue">> = {
    empty: {
      headline: "Nothing on this card yet",
      detail: "A perk is a real offer someone funded — a door pass, a code, a shipment, or a credit. Until one is on this card, there is nothing to use.",
      action: "Browse live perks",
      places: "No live benefit is on this card",
      footerCue: "This is your PromoCard",
    },
    nearby: {
      headline: "Available nearby",
      detail: input.nextBenefitTitle || "A participating place has something you can claim.",
      action: "Claim it first",
      places: `${nearbyCount} participating ${nearbyCount === 1 ? "place" : "places"}`,
      footerCue: "Claim, then use",
    },
    ready: readyCopy,
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
    credential: state === "ready" && isPresentablePass(fulfillmentType || "code", "claimed") ? code : null,
    sceneMark: input.sceneMark || undefined,
    crewMark: input.crewMark || undefined,
    returnStamp: input.latestReturn || undefined,
    returnDate: input.latestReturnAt || undefined,
    canFlip: state === "ready" && Boolean(code) && isPresentablePass(fulfillmentType || "code", "claimed"),
  };
}
