import { describe, expect, it } from "vitest";
import { canPresentPerk, perkSection, type CardPerk } from "./benefits";

const now = Date.parse("2026-09-05T12:00:00Z");
const perk: CardPerk = { id: "issued-1", title: "Entry", status: "claimed", fulfillmentType: "code", redemptionCode: "PR-REAL" };

describe("PromoCard presentation boundaries", () => {
  it("presents only a claimed code-backed benefit", () => {
    expect(canPresentPerk(perk, now)).toBe(true);
    expect(canPresentPerk({ ...perk, redemptionCode: null }, now)).toBe(false);
    expect(canPresentPerk({ ...perk, status: "issued" }, now)).toBe(false);
  });
  it("hides codes that expire while the page is open", () => {
    const expiring = { ...perk, expiresAt: "2026-09-05T12:00:00Z" };
    expect(canPresentPerk(expiring, now - 1)).toBe(true);
    expect(canPresentPerk(expiring, now)).toBe(false);
    expect(perkSection(expiring, now)).toBe("history");
  });
  it("fails closed for an invalid expiry", () => {
    expect(canPresentPerk({ ...perk, expiresAt: "invalid" }, now)).toBe(false);
    expect(perkSection({ ...perk, expiresAt: "invalid" }, now)).toBe("history");
  });
  it("keeps delivery and confirmation separate from ready-to-use benefits", () => {
    expect(perkSection({ ...perk, fulfillmentType: "shipping" }, now)).toBe("pending");
    expect(perkSection({ ...perk, status: "fulfillment_pending" }, now)).toBe("pending");
    expect(perkSection({ ...perk, status: "redeemed" }, now)).toBe("history");
  });
});
