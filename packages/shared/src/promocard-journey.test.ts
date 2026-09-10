import { describe, expect, it } from "vitest";
import {
  canActOnBenefit,
  inventoryOpenFollowCopy,
  inventoryPostedNext,
  journeyKindForFulfillment,
  journeyReadyCopy,
  journeyStatusLabel,
  STOCK_FULFILLMENT_OPTIONS,
} from "./promocard-journey";

describe("PromoCard journeys", () => {
  it("maps fulfillment types to place, code, ship, credit, or handoff", () => {
    expect(journeyKindForFulfillment("merchant_validation")).toBe("place");
    expect(journeyKindForFulfillment("qr")).toBe("place");
    expect(journeyKindForFulfillment("code")).toBe("code");
    expect(journeyKindForFulfillment("shipping")).toBe("ship");
    expect(journeyKindForFulfillment("automatic")).toBe("credit");
    expect(journeyKindForFulfillment("manual")).toBe("handoff");
    expect(STOCK_FULFILLMENT_OPTIONS.map((item) => item.id)).toEqual(["place", "code", "ship", "credit"]);
  });

  it("lets a member act on ship, credit, and QR — not only a door code", () => {
    const base = { fulfillmentState: "claimed" as const, redemption: { recorded: false, code: null } };
    expect(canActOnBenefit({ ...base, fulfillmentType: "shipping" })).toBe(true);
    expect(canActOnBenefit({ ...base, fulfillmentType: "automatic" })).toBe(true);
    expect(canActOnBenefit({ ...base, fulfillmentType: "qr" })).toBe(true);
    expect(canActOnBenefit({ ...base, fulfillmentType: "code" })).toBe(false);
    expect(canActOnBenefit({ ...base, fulfillmentType: "code", redemption: { recorded: false, code: "PR-1" } })).toBe(true);
    expect(canActOnBenefit({ ...base, fulfillmentType: "shipping", redemption: { recorded: true, code: null } })).toBe(false);
  });

  it("writes the next stock step from the journey, not always the scanner", () => {
    expect(inventoryPostedNext("merchant_validation", "offer-1")[1].href).toBe("/staff/scanner");
    expect(inventoryPostedNext("shipping", "offer-1")[1].href).toBe("/happened");
    expect(inventoryPostedNext("automatic")[1].id).toBe("watch-attributed");
    expect(inventoryOpenFollowCopy("shipping")).toMatch(/delivered/i);
    expect(inventoryOpenFollowCopy("merchant_validation")).toMatch(/counter/i);
  });

  it("labels ship and credit on the card face and status", () => {
    expect(journeyReadyCopy({ title: "Sample", issuer: "Brand", fulfillmentType: "shipping", shippingStage: "shipped" }).headline).toBe("On the way");
    expect(journeyReadyCopy({ title: "50 Gems", fulfillmentType: "automatic" }).headline).toBe("Credited");
    expect(journeyStatusLabel({
      fulfillmentType: "shipping",
      fulfillmentState: "pending",
      redemption: { recorded: false, code: null },
      fulfillmentData: { shipping_stage: "shipped" },
    })).toBe("On the way");
  });
});
