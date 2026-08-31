import { describe, expect, it } from "vitest";
import {
  CREATE_INTENTS,
  accountStakeholderOutcomes,
  classifyExperienceRole,
  classifyHappenedBucket,
  contributorValueScore,
  dropShareCopy,
  resolveCreateIntent,
} from "@promorang/shared";

describe("simplified PROMORANG experience", () => {
  it("never asks a creator to pick Moment vs Mission vs Discovery first", () => {
    expect(CREATE_INTENTS.every((item) => !/moment|mission|discovery|campaign/i.test(item.label))).toBe(true);
    expect(resolveCreateIntent("answer").mapsTo).toBe("Discovery");
    expect(resolveCreateIntent("attend").href).toContain("/create/moment");
  });

  it("lets people contribute without owning a hub", () => {
    expect(classifyExperienceRole({ contributorHubs: 1, operatesHubs: 0 })).toBe("contributor");
  });

  it("scores verified value over recruitment depth", () => {
    expect(
      contributorValueScore({ peopleBrought: 20, activePeople: 15, verifiedActions: 18, attributedValue: 3200 }),
    ).toBeGreaterThan(contributorValueScore({ peopleBrought: 80, activePeople: 1, verifiedActions: 0 }));
  });

  it("keeps live check-ins and claims in human buckets", () => {
    expect(classifyHappenedBucket("moment_join_verified")).toBe("went");
    expect(classifyHappenedBucket("deal_claimed")).toBe("claimed");
    expect(classifyHappenedBucket("PERK_REDEMPTION")).toBe("used");
    expect(dropShareCopy("Ada", "Free entry")).toBe("Ada just dropped Free entry on your PromoCard.");
  });

  it("does not show merchant inventory outcomes as a member's people count", () => {
    const member = accountStakeholderOutcomes({ role: "member", people: 0, cardPerks: 4, memberships: 1 });
    expect(member.cards.some((card) => card.key === "people")).toBe(false);
    expect(member.cards[0].key).toBe("cardPerks");
  });
});
