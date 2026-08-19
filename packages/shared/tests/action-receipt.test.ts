import { describe, expect, it } from "vitest";
import { resolveCommerceReceiptPresentation } from "../src";

describe("commerce action receipt", () => {
  it("shows every durable consequence recorded by commerce", () => {
    const result = resolveCommerceReceiptPresentation({ receiptType: "purchase", status: "fulfilled", productName: "Aqua Fest Meal", attribution: { commerce_outcomes: { promoshare_ticket: { awarded: true }, moment_piece: { awarded: true } } } });
    expect(result.headline).toBe("It counted");
    expect(result.outcomes.map((outcome) => outcome.id)).toEqual(["commerce", "promoshare", "moment_piece"]);
  });

  it("keeps a truthful record when value is refunded", () => {
    const result = resolveCommerceReceiptPresentation({ receiptType: "refund", status: "refunded" });
    expect(result.counted).toBe(false);
    expect(result.headline).toBe("Value returned");
  });
});
