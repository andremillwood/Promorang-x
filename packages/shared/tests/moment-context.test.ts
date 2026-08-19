import { describe, expect, it } from "vitest";
import { resolveMomentCommerceAvailability, type MomentCommerceItem } from "../src";

const item = (overrides: Partial<MomentCommerceItem> = {}): MomentCommerceItem => ({
  listing_id: "listing-1", source_id: "product-1", kind: "product", name: "Festival meal",
  inventory_quantity: 20, available_now: true, fulfillment_mode: "onsite", ...overrides,
});

describe("Moment commerce availability", () => {
  it("makes scarce in-venue inventory explicit", () => {
    expect(resolveMomentCommerceAvailability(item({ inventory_quantity: 3 }))).toEqual({ state: "limited", label: "3 left here", actionLabel: "Buy now", canAct: true });
  });

  it("does not present sold-out inventory as purchasable", () => {
    expect(resolveMomentCommerceAvailability(item({ inventory_quantity: 0, available_now: false })).canAct).toBe(false);
  });

  it("uses the correct action for offers and services", () => {
    expect(resolveMomentCommerceAvailability(item({ kind: "offer" })).actionLabel).toBe("Claim offer");
    expect(resolveMomentCommerceAvailability(item({ kind: "service" })).actionLabel).toBe("Reserve");
  });
});
