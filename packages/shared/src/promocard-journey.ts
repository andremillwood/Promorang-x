/**
 * PromoCard journeys beyond the door scan.
 *
 * Same card. Different next verb:
 * place → show it, code → copy it, ship → address/track, credit → it’s in,
 * handoff → wait for confirmation.
 */

import type { OfferFulfillmentData } from "./offer-fulfillment";

export type ActableBenefit = {
  fulfillmentState?: string | null;
  fulfillmentType?: string | null;
  redemption?: { recorded?: boolean; code?: string | null } | null;
  expiresAt?: string | null;
  fulfillmentData?: OfferFulfillmentData | null;
};

export type InventoryNextAction = {
  id: string;
  label: string;
  href: string;
  why: string;
};

export type PromoCardJourneyKind = "place" | "code" | "ship" | "credit" | "handoff";

export type StockFulfillmentOption = {
  id: PromoCardJourneyKind;
  fulfillmentType: "merchant_validation" | "code" | "shipping" | "automatic";
  label: string;
  detail: string;
  proof: string;
};

export const STOCK_FULFILLMENT_OPTIONS: StockFulfillmentOption[] = [
  {
    id: "place",
    fulfillmentType: "merchant_validation",
    label: "Use at a place",
    detail: "They show the card. You scan or type the code.",
    proof: "Merchant records the use",
  },
  {
    id: "code",
    fulfillmentType: "code",
    label: "Digital code",
    detail: "A code they can paste — checkout, license, early access.",
    proof: "The code is claimed and used",
  },
  {
    id: "ship",
    fulfillmentType: "shipping",
    label: "Ship it",
    detail: "They leave an address. You pack, ship, then mark delivered.",
    proof: "Delivered",
  },
  {
    id: "credit",
    fulfillmentType: "automatic",
    label: "Credit on claim",
    detail: "Claiming puts Gems, points, or access on the card immediately.",
    proof: "The credit lands",
  },
];

export function journeyKindForFulfillment(fulfillmentType?: string | null): PromoCardJourneyKind {
  const type = fulfillmentType || "merchant_validation";
  if (type === "shipping") return "ship";
  if (type === "automatic") return "credit";
  if (type === "manual") return "handoff";
  if (type === "code") return "code";
  return "place";
}

export function isPlaceFulfillment(fulfillmentType?: string | null) {
  return journeyKindForFulfillment(fulfillmentType) === "place";
}

export function isExpiredBenefit(expiresAt?: string | null, now = Date.now()) {
  if (!expiresAt) return false;
  const expiry = Date.parse(expiresAt);
  return !Number.isFinite(expiry) || expiry <= now;
}

/** Next action exists on this benefit. Not the same as “copy a door code”. */
export function canActOnBenefit(benefit: ActableBenefit, now = Date.now()) {
  if (benefit.redemption?.recorded) return false;
  if (isExpiredBenefit(benefit.expiresAt, now)) return false;
  const type = benefit.fulfillmentType || "merchant_validation";
  const state = benefit.fulfillmentState;
  if (type === "shipping") return state === "claimed" || state === "pending";
  if (type === "manual") return state === "claimed" || state === "pending";
  if (type === "automatic") return state === "claimed";
  if (type === "qr") return state === "claimed";
  if (type === "code" || type === "merchant_validation") {
    return state === "claimed" && Boolean(benefit.redemption?.code);
  }
  return false;
}

export type JourneyFaceCopy = {
  headline: string;
  detail: string;
  action: string;
  places: string;
  footerCue: string;
};

export function journeyReadyCopy(input: {
  title?: string | null;
  issuer?: string | null;
  fulfillmentType?: string | null;
  fulfillmentState?: string | null;
  shippingStage?: string | null;
}): JourneyFaceCopy {
  const title = input.title || "A live perk";
  const issuer = input.issuer || "The issuer";
  const kind = journeyKindForFulfillment(input.fulfillmentType);
  const stage = input.shippingStage || "";

  if (kind === "ship") {
    if (stage === "shipped") {
      return {
        headline: "On the way",
        detail: title,
        action: "Track this",
        places: issuer,
        footerCue: "Use is recorded when it is delivered",
      };
    }
    if (stage === "ready_to_ship") {
      return {
        headline: "Packing",
        detail: title,
        action: "Address received",
        places: issuer,
        footerCue: "They ship next. Nothing to show at a door.",
      };
    }
    return {
      headline: "Needs your address",
      detail: title,
      action: "Add a delivery address",
      places: issuer,
      footerCue: "This perk ships. It is not a door pass.",
    };
  }

  if (kind === "credit") {
    return {
      headline: "Credited",
      detail: title,
      action: "It’s on the card",
      places: issuer,
      footerCue: "Claiming put this value in. No scan.",
    };
  }

  if (kind === "handoff") {
    return {
      headline: "Waiting",
      detail: title,
      action: "Issuer confirms next",
      places: issuer,
      footerCue: "Not used until they confirm the handoff",
    };
  }

  if (kind === "code") {
    return {
      headline: "Code ready",
      detail: title,
      action: "Copy this code",
      places: issuer,
      footerCue: "Paste it where the issuer said — not necessarily a door",
    };
  }

  return {
    headline: "Show this",
    detail: title,
    action: input.fulfillmentType === "qr" ? "Show the merchant this QR" : "Show the merchant this code",
    places: issuer,
    footerCue: "Nothing is used until they validate it",
  };
}

export function journeyStatusLabel(benefit?: ActableBenefit | null) {
  if (!benefit) return "Waiting";
  if (benefit.redemption?.recorded) {
    const kind = journeyKindForFulfillment(benefit.fulfillmentType);
    if (kind === "ship") return "Delivered";
    if (kind === "credit") return "Credited";
    if (kind === "handoff") return "Confirmed";
    return "Used";
  }
  if (isExpiredBenefit(benefit.expiresAt)) return "Expired";
  const kind = journeyKindForFulfillment(benefit.fulfillmentType);
  const stage = benefit.fulfillmentData?.shipping_stage;
  if (kind === "ship") {
    if (stage === "shipped") return "On the way";
    if (stage === "ready_to_ship") return "Packing";
    return "Needs address";
  }
  if (kind === "credit") return "On the card";
  if (kind === "handoff") return "Waiting for confirmation";
  if (kind === "code") return canActOnBenefit(benefit) ? "Code ready" : "Claimed";
  return canActOnBenefit(benefit) ? "Ready to use" : benefit.fulfillmentState || "Claimed";
}

export function inventoryPostedNext(
  fulfillmentType?: string | null,
  offerId?: string | null,
): InventoryNextAction[] {
  const shareHref = offerId ? `/give?offer=${encodeURIComponent(offerId)}` : "/give";
  const share: InventoryNextAction = {
    id: "share-perk",
    label: "Share this perk",
    href: shareHref,
    why: "Hand the live drop to a host, creator, or the room.",
  };
  const kind = journeyKindForFulfillment(fulfillmentType);
  if (kind === "ship") {
    return [
      share,
      {
        id: "watch-attributed",
        label: "Watch claimed and shipped",
        href: "/happened",
        why: "Address in, then mark shipped. Delivery is the completion.",
      },
    ];
  }
  if (kind === "credit") {
    return [
      share,
      {
        id: "watch-attributed",
        label: "Watch claimed credits",
        href: "/happened",
        why: "Claiming is the use. No counter scan.",
      },
    ];
  }
  if (kind === "code") {
    return [
      share,
      {
        id: "watch-attributed",
        label: "Watch claimed codes",
        href: "/happened",
        why: "They paste the code. Recorded use follows that, not a door.",
      },
    ];
  }
  return [
    share,
    {
      id: "validate",
      label: "Validate at the counter",
      href: "/staff/scanner",
      why: "When someone uses it, record the code. That is the completion.",
    },
  ];
}

export function inventoryOpenFollowCopy(fulfillmentType?: string | null) {
  const kind = journeyKindForFulfillment(fulfillmentType);
  if (kind === "ship") return "Contributors will see this under Earn. The loop finishes when you mark it delivered.";
  if (kind === "credit") return "Contributors will see this under Earn. Claiming puts the value on their PromoCard.";
  if (kind === "code") return "Contributors will see this under Earn. They use the code where you said — not only at a counter.";
  return "Contributors will see this under Earn. The loop finishes only when you validate the code at the counter.";
}
