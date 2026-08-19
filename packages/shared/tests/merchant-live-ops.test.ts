import { describe, expect, it } from "vitest";
import { summarizeMerchantLiveOps } from "../src";

describe("merchant live operations", () => {
  it("separates stock pressure, counter work, and fulfilled value", () => {
    const summary = summarizeMerchantLiveOps([
      { id: "1", name: "Meal", inventory_quantity: 3, is_active: true },
      { id: "2", name: "Drink", inventory_quantity: 0, is_active: true },
    ], [
      { id: "r1", receipt_type: "claim", status: "pending" },
      { id: "r2", receipt_type: "purchase", status: "fulfilled", amount: 2500 },
    ]);
    expect(summary).toMatchObject({ activeListings: 2, lowStock: 1, soldOut: 1, needsAction: 1, fulfilled: 1, attributedRevenue: 2500 });
  });
});
