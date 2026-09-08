import { describe, expect, it } from "vitest";
import {
  getStakeholderLens,
  normalizeStakeholderRole,
  resolveStakeholderHomeMove,
  stakeholderPrimaryDestinations,
} from "../src/stakeholder-lens";

const LOOP_ROLES = ["participant", "creator", "host", "merchant", "brand"] as const;

describe("stakeholder lens", () => {
  it("keeps the same five destinations across non-admin roles", () => {
    for (const role of LOOP_ROLES) {
      expect(stakeholderPrimaryDestinations(role).map((item) => item.id)).toEqual([
        "today",
        "world",
        "activity",
        "putIn",
        "promoCard",
      ]);
    }
  });

  it("changes put-in and activity meaning when the role changes", () => {
    const participant = getStakeholderLens("participant");
    const host = getStakeholderLens("host");
    const merchant = getStakeholderLens("merchant");
    const brand = getStakeholderLens("brand");

    expect(participant.putIn.href).toBe("/earn");
    expect(host.putIn.href).toBe("/create/moment");
    expect(merchant.putIn.href).toBe("/stock");
    expect(brand.putIn.href).toBe("/stock");

    expect(host.activity.href).toBe("/happened");
    expect(merchant.activity.label).toBe("Used");
    expect(brand.promise).toMatch(/recorded use/i);
    expect(merchant.promoCard.meaning).toMatch(/counter/i);
    expect(participant.promoCard.meaning).not.toBe(merchant.promoCard.meaning);
  });

  it("does not send hosts or merchants to the same first move as members", () => {
    expect(resolveStakeholderHomeMove("participant", { cardPerks: 0 }).href).toBe("/discover");
    expect(resolveStakeholderHomeMove("host", { communities: 0 }).href).toBe("/create/moment");
    expect(resolveStakeholderHomeMove("merchant", { hasInventory: false }).href).toBe("/stock");
    expect(resolveStakeholderHomeMove("brand", { perksGiven: 0 }).href).toBe("/stock");
  });

  it("treats explorer and member aliases as the people workspace", () => {
    expect(normalizeStakeholderRole("explorer")).toBe("participant");
    expect(normalizeStakeholderRole("member")).toBe("participant");
    expect(getStakeholderLens("guest").workspaceLabel).toBe("People");
  });

  it("keeps admin on a distinct operations loop", () => {
    const admin = getStakeholderLens("admin");
    expect(admin.destinations[0].href).toContain("/admin");
    expect(admin.putIn.href).toContain("/admin");
    expect(admin.destinations.map((item) => item.label)).not.toEqual(
      getStakeholderLens("participant").destinations.map((item) => item.label),
    );
  });

  it("surfaces merchant redeem and brand campaigns as extras, not a second product", () => {
    expect(getStakeholderLens("merchant").extras.map((item) => item.href)).toContain("/staff/scanner");
    expect(getStakeholderLens("brand").extras.map((item) => item.label)).toContain("Campaigns");
    expect(getStakeholderLens("host").extras.map((item) => item.label)).toContain("Door Check-Ins");
  });
});
