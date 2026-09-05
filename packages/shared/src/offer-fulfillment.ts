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
