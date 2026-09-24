import { describe, expect, it } from "vitest";

import {
  canCreateEarning,
  inventoryAvailability,
  isEvidenceAtLeast,
  validateActivationEconomics,
  type ActivationEconomics,
} from "../src/commercial-truth";

const amount = (value: number, currency = "EUR") => ({ amount: value, currency });

function economics(overrides: Partial<ActivationEconomics> = {}): ActivationEconomics {
  return {
    moneyIn: amount(500),
    platformRevenue: amount(40),
    participantValue: amount(20),
    distributionCost: amount(30),
    serviceProviderCost: amount(60),
    operatorProceeds: amount(350),
    reservedAmount: amount(100),
    earnedAmount: amount(60),
    paidAmount: amount(40),
    refundedAmount: amount(10),
    ...overrides,
  };
}

describe("commercial truth contract", () => {
  it("never lets finite inventory become negative", () => {
    expect(inventoryAvailability({
      id: "passes",
      ownerId: "host",
      type: "free",
      quantity: 5,
      reservedQuantity: 2,
      fulfilledQuantity: 2,
    }).availableQuantity).toBe(1);

    expect(() => inventoryAvailability({
      id: "passes",
      ownerId: "host",
      type: "free",
      quantity: 5,
      reservedQuantity: 4,
      fulfilledQuantity: 2,
    })).toThrow(/over-allocated/i);
  });

  it("requires unlimited inventory to be explicit", () => {
    expect(() => inventoryAvailability({
      id: "samples",
      ownerId: "brand",
      type: "brand",
      quantity: null,
      reservedQuantity: 0,
      fulfilledQuantity: 0,
    })).toThrow(/needs a quantity/i);
    expect(inventoryAvailability({
      id: "stream",
      ownerId: "host",
      type: "access",
      quantity: null,
      reservedQuantity: 12,
      fulfilledQuantity: 3,
      unlimited: true,
    }).isUnlimited).toBe(true);
  });

  it("keeps weak evidence distinct from commercial and fulfillment evidence", () => {
    expect(isEvidenceAtLeast("vote", "purchase")).toBe(false);
    expect(isEvidenceAtLeast("rsvp", "attendance")).toBe(false);
    expect(isEvidenceAtLeast("reservation", "redemption")).toBe(false);
    expect(isEvidenceAtLeast("attendance", "purchase")).toBe(true);
  });

  it("does not create earnings from attribution alone", () => {
    expect(canCreateEarning(null, "purchase")).toBe(false);
    expect(canCreateEarning({ funded: false, requiredEvidence: "purchase", amount: 5, currency: "GBP" }, "purchase")).toBe(false);
    expect(canCreateEarning({ funded: true, requiredEvidence: "purchase", amount: 5, currency: "GBP" }, "share")).toBe(false);
    expect(canCreateEarning({ funded: true, requiredEvidence: "purchase", amount: 5, currency: "GBP" }, "purchase")).toBe(true);
  });

  it("keeps reserves, earnings, payments, and refunds reconcilable", () => {
    expect(validateActivationEconomics(economics())).toBe(true);
    expect(() => validateActivationEconomics(economics({ paidAmount: amount(70) }))).toThrow(/exceed earned/i);
    expect(() => validateActivationEconomics(economics({ earnedAmount: amount(110) }))).toThrow(/exceed reserved/i);
    expect(() => validateActivationEconomics(economics({ paidAmount: amount(60), refundedAmount: amount(50), earnedAmount: amount(60) }))).toThrow(/exceed the reserve/i);
  });

  it("does not silently combine currencies", () => {
    expect(() => validateActivationEconomics(economics({ platformRevenue: amount(40, "USD") }))).toThrow(/one currency/i);
  });
});
