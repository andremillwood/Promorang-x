export const OFFER_FULFILLMENT_TYPES = [
  "code",
  "qr",
  "merchant_validation",
  "automatic",
  "manual",
  "shipping",
] as const;

export type OfferFulfillmentType = (typeof OFFER_FULFILLMENT_TYPES)[number];

export type ShippingAddress = {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postal_code: string;
  country: string;
  phone?: string;
};

export type OfferFulfillmentData = {
  coupon_id?: string;
  merchant_product_id?: string;
  shipping_address?: Partial<ShippingAddress> | null;
  shipping_stage?: "awaiting_address" | "ready_to_ship" | "shipped" | "delivered" | "confirmed" | null;
  tracking_number?: string | null;
  carrier?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  notes?: string | null;
  automatic?: {
    delivered_at?: string;
    reward_type?: string;
    amount?: number | null;
    wallet?: string | null;
  };
  [key: string]: unknown;
};

export type ClaimPlan = {
  nextStatus: "claimed" | "fulfillment_pending";
  autoRedeem: boolean;
  requiresShippingAddress: boolean;
  shippingStage: OfferFulfillmentData["shipping_stage"];
};

export type FulfillPlan = {
  redeem: boolean;
  event: "redeemed" | "fulfillment_updated";
  stage: NonNullable<OfferFulfillmentData["shipping_stage"]>;
};

export function encodeOfferRedeemPayload(code: string): string {
  return `promorang://offer/redeem/${String(code || "").trim().toUpperCase()}`;
}

export function decodeOfferRedeemPayload(raw: string | null | undefined): string {
  if (raw == null) return "";
  const text = String(raw).trim();
  if (!text) return "";

  const urlMatch = text.match(/(?:promorang:\/\/offer\/redeem\/|\/offers\/redeem\?code=|[?&]code=)([A-Z0-9-]+)/i);
  if (urlMatch?.[1]) return urlMatch[1].toUpperCase();

  if (text.startsWith("{")) {
    try {
      const parsed = JSON.parse(text) as { code?: string; redemption_code?: string; redemptionCode?: string };
      const nested = parsed.code || parsed.redemption_code || parsed.redemptionCode;
      if (nested) return String(nested).trim().toUpperCase();
    } catch {
      // keep raw text
    }
  }

  return text.toUpperCase();
}

export function isShippingAddressComplete(address?: Partial<ShippingAddress> | null): address is ShippingAddress {
  if (!address || typeof address !== "object") return false;
  return ["name", "line1", "city", "postal_code", "country"].every((key) => String(address[key as keyof ShippingAddress] || "").trim());
}

export function resolveClaimPlan(fulfillmentType?: string | null, fulfillmentData: OfferFulfillmentData = {}): ClaimPlan {
  const type = fulfillmentType || "code";
  if (type === "automatic") {
    return { nextStatus: "claimed", autoRedeem: true, requiresShippingAddress: false, shippingStage: null };
  }
  if (type === "manual") {
    return { nextStatus: "fulfillment_pending", autoRedeem: false, requiresShippingAddress: false, shippingStage: null };
  }
  if (type === "shipping") {
    const complete = isShippingAddressComplete(fulfillmentData.shipping_address);
    return {
      nextStatus: "fulfillment_pending",
      autoRedeem: false,
      requiresShippingAddress: !complete,
      shippingStage: complete ? "ready_to_ship" : "awaiting_address",
    };
  }
  return { nextStatus: "claimed", autoRedeem: false, requiresShippingAddress: false, shippingStage: null };
}

export function resolveFulfillPlan(
  fulfillmentType: string | null | undefined,
  action: string,
  fulfillmentData: OfferFulfillmentData = {},
): FulfillPlan {
  const type = fulfillmentType || "code";
  if (type === "manual" && (action === "confirm" || action === "redeem")) {
    return { redeem: true, event: "redeemed", stage: "confirmed" };
  }
  if (type === "shipping" && action === "ship") {
    if (!isShippingAddressComplete(fulfillmentData.shipping_address)) {
      throw new Error("A delivery address is required before shipping");
    }
    if (!String(fulfillmentData.tracking_number || "").trim()) {
      throw new Error("Add a tracking number to mark this shipped");
    }
    return { redeem: false, event: "fulfillment_updated", stage: "shipped" };
  }
  if (type === "shipping" && action === "deliver") {
    return { redeem: true, event: "redeemed", stage: "delivered" };
  }
  throw new Error("This fulfillment action is not available");
}

export function requiresOwnerToRedeem(fulfillmentType?: string | null): boolean {
  return fulfillmentType === "merchant_validation" || fulfillmentType === "qr";
}

export function isPresentablePass(fulfillmentType?: string | null, status?: string | null): boolean {
  const type = fulfillmentType || "code";
  return ["claimed", "issued"].includes(status || "") && ["code", "qr", "merchant_validation"].includes(type);
}

export type PromoCardPerkIssuance = {
  id: string;
  status: string;
  redemption_code: string;
  issued_at?: string;
  claimed_at?: string | null;
  redeemed_at?: string | null;
  expires_at?: string | null;
  fulfillment_data?: OfferFulfillmentData;
  offers: {
    id?: string;
    title: string;
    description?: string | null;
    reward_type?: string;
    fulfillment_type?: string | null;
    value_amount?: number | null;
    value_currency?: string | null;
  };
};

export type PromoCardPerk = {
  id: string;
  source?: string;
  title: string;
  detail?: string;
  kind?: string;
  status: string;
  redemptionCode?: string | null;
  expiresAt?: string | null;
  fulfillmentType?: string | null;
  fulfillmentData?: OfferFulfillmentData;
  valueAmount?: number | null;
  valueCurrency?: string | null;
  issuance?: PromoCardPerkIssuance | null;
};

export function promoCardPerkFromIssuance(row: {
  id: string;
  status: string;
  redemption_code?: string | null;
  issued_at?: string;
  claimed_at?: string | null;
  redeemed_at?: string | null;
  expires_at?: string | null;
  fulfillment_data?: OfferFulfillmentData | null;
  offers?: PromoCardPerkIssuance["offers"] | null;
}): PromoCardPerk {
  const issuance: PromoCardPerkIssuance = {
    id: row.id,
    status: row.status,
    redemption_code: row.redemption_code || "",
    issued_at: row.issued_at,
    claimed_at: row.claimed_at,
    redeemed_at: row.redeemed_at,
    expires_at: row.expires_at,
    fulfillment_data: row.fulfillment_data || {},
    offers: {
      id: row.offers?.id,
      title: row.offers?.title || "Perk",
      description: row.offers?.description,
      reward_type: row.offers?.reward_type,
      fulfillment_type: row.offers?.fulfillment_type || "code",
      value_amount: row.offers?.value_amount ?? null,
      value_currency: row.offers?.value_currency ?? null,
    },
  };
  return {
    id: row.id,
    source: "offer_issuance",
    title: issuance.offers.title,
    detail: issuance.offers.description || "",
    kind: issuance.offers.reward_type || "custom",
    status: row.status,
    redemptionCode: issuance.redemption_code || null,
    expiresAt: row.expires_at || null,
    fulfillmentType: issuance.offers.fulfillment_type || "code",
    fulfillmentData: issuance.fulfillment_data,
    valueAmount: issuance.offers.value_amount ?? null,
    valueCurrency: issuance.offers.value_currency ?? null,
    issuance,
  };
}

export function issuanceFromPromoCardPerk(perk: PromoCardPerk | PromoCardPerkIssuance): PromoCardPerkIssuance | null {
  if ("offers" in perk && "redemption_code" in perk && perk.redemption_code) {
    return perk as PromoCardPerkIssuance;
  }
  const wrapped = perk as PromoCardPerk;
  if (wrapped.issuance?.redemption_code) return wrapped.issuance;
  if (!wrapped.redemptionCode) return null;
  return {
    id: wrapped.id,
    status: wrapped.status,
    redemption_code: wrapped.redemptionCode,
    expires_at: wrapped.expiresAt,
    fulfillment_data: wrapped.fulfillmentData || {},
    offers: {
      title: wrapped.title,
      description: wrapped.detail,
      reward_type: wrapped.kind,
      fulfillment_type: wrapped.fulfillmentType || "code",
      value_amount: wrapped.valueAmount ?? null,
      value_currency: wrapped.valueCurrency ?? null,
    },
  };
}

export function participantJourneyLabel(fulfillmentType?: string | null, status?: string | null, fulfillmentData: OfferFulfillmentData = {}): string {
  const type = fulfillmentType || "code";
  if (status === "redeemed") {
    if (type === "automatic") return "Already in your wallet";
    if (type === "shipping") return "Delivered";
    if (type === "manual") return "Confirmed";
    return "Redeemed";
  }
  if (type === "automatic") return "Ready to receive";
  if (type === "manual" && status === "fulfillment_pending") return "Waiting for confirmation";
  if (type === "shipping") {
    const stage = fulfillmentData.shipping_stage;
    if (stage === "shipped") return "On the way";
    if (stage === "ready_to_ship") return "Address received — packing";
    if (status === "fulfillment_pending" || stage === "awaiting_address") return "Needs a delivery address";
  }
  if (isPresentablePass(type, status)) return type === "qr" ? "Show this pass" : "Show this code";
  return (status || "issued").replaceAll("_", " ");
}
