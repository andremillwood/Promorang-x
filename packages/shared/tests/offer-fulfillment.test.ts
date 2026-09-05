import { describe, expect, it } from "vitest";

import {
  decodeOfferRedeemPayload,
  encodeOfferRedeemPayload,
  isPresentablePass,
  isShippingAddressComplete,
  issuanceFromPromoCardPerk,
  participantJourneyLabel,
  promoCardPerkFromIssuance,
  requiresOwnerToRedeem,
  resolveClaimPlan,
  resolveFulfillPlan,
} from "../src/offer-fulfillment";

describe("offer fulfillment journeys", () => {
  it("encodes and decodes a scannable offer payload", () => {
    expect(encodeOfferRedeemPayload("pr-ab12cd34")).toBe("promorang://offer/redeem/PR-AB12CD34");
    expect(decodeOfferRedeemPayload("promorang://offer/redeem/PR-AB12CD34")).toBe("PR-AB12CD34");
    expect(decodeOfferRedeemPayload('{"code":"pr-99aa"}')).toBe("PR-99AA");
    expect(decodeOfferRedeemPayload("https://promorang.co/offers/redeem?code=PR-HELLO1")).toBe("PR-HELLO1");
    expect(decodeOfferRedeemPayload("  pr-typed  ")).toBe("PR-TYPED");
  });

  it("treats automatic as a completed claim that redeems itself", () => {
    expect(resolveClaimPlan("automatic")).toEqual({
      nextStatus: "claimed",
      autoRedeem: true,
      requiresShippingAddress: false,
      shippingStage: null,
    });
  });

  it("keeps manual and shipping on a pending journey until someone finishes them", () => {
    expect(resolveClaimPlan("manual").nextStatus).toBe("fulfillment_pending");
    expect(resolveClaimPlan("manual").autoRedeem).toBe(false);
    expect(resolveClaimPlan("shipping").requiresShippingAddress).toBe(true);
    expect(resolveClaimPlan("shipping", {
      shipping_address: { name: "Ada", line1: "1 Harbour St", city: "Kingston", postal_code: "JMAAW01", country: "JM" },
    })).toMatchObject({ requiresShippingAddress: false, shippingStage: "ready_to_ship" });
  });

  it("requires a real address and tracking before a shipping mark-shipped action", () => {
    expect(isShippingAddressComplete({ name: "Ada", line1: "1 Harbour St", city: "Kingston" })).toBe(false);
    expect(() => resolveFulfillPlan("shipping", "ship", {})).toThrow(/delivery address/);
    expect(resolveFulfillPlan("manual", "confirm")).toEqual({ redeem: true, event: "redeemed", stage: "confirmed" });
    expect(resolveFulfillPlan("shipping", "ship", {
      shipping_address: { name: "Ada", line1: "1 Harbour St", city: "Kingston", postal_code: "JMAAW01", country: "JM" },
      tracking_number: "JM123456",
    })).toEqual({ redeem: false, event: "fulfillment_updated", stage: "shipped" });
    expect(resolveFulfillPlan("shipping", "deliver")).toEqual({ redeem: true, event: "redeemed", stage: "delivered" });
  });

  it("only treats QR and merchant validation as owner-gated scans", () => {
    expect(requiresOwnerToRedeem("qr")).toBe(true);
    expect(requiresOwnerToRedeem("merchant_validation")).toBe(true);
    expect(requiresOwnerToRedeem("code")).toBe(false);
    expect(isPresentablePass("qr", "claimed")).toBe(true);
    expect(isPresentablePass("automatic", "claimed")).toBe(false);
    expect(participantJourneyLabel("automatic", "redeemed")).toBe("Already in your wallet");
    expect(participantJourneyLabel("shipping", "fulfillment_pending", { shipping_stage: "shipped" })).toBe("On the way");
  });

  it("keeps offer journeys on the PromoCard perk object", () => {
    const perk = promoCardPerkFromIssuance({
      id: "iss-1",
      status: "claimed",
      redemption_code: "PR-CARD01",
      fulfillment_data: {},
      offers: { title: "Slow-hour coffee", fulfillment_type: "qr", reward_type: "coupon", value_amount: 10, value_currency: "JMD" },
    });
    expect(perk.fulfillmentType).toBe("qr");
    expect(issuanceFromPromoCardPerk(perk)?.redemption_code).toBe("PR-CARD01");
    expect(isPresentablePass(perk.fulfillmentType, perk.status)).toBe(true);
  });
});
