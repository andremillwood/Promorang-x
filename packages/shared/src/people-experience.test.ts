import { describe, expect, it } from "vitest";
import {
  accountStakeholderOutcomes,
  classifyExperienceRole,
  classifyHappenedBucket,
  contributorValueScore,
  dropShareCopy,
  inventoryOpenCopy,
  opportunityRemainingCopy,
  opportunitySourceLabel,
  opportunityStubCode,
  happenedBuckets,
  resolveCreateIntent,
  slugifyCommunityName,
  STAKEHOLDER_OUTCOMES,
} from "./people-experience";

describe("people experience mapping", () => {
  it("maps human intent instead of product ontology", () => {
    expect(resolveCreateIntent("answer").mapsTo).toBe("Discovery");
    expect(resolveCreateIntent("attend").mapsTo).toBe("Moment");
    expect(resolveCreateIntent("bring").href).toContain("/people");
    expect(resolveCreateIntent("claim").mapsTo).toBe("Drop");
  });

  it("keeps hub ownership earned, not assumed", () => {
    expect(classifyExperienceRole({ contributorHubs: 3 })).toBe("contributor");
    expect(classifyExperienceRole({ operatesHubs: 1 })).toBe("operator");
  });

  it("values verified movement over empty accounts", () => {
    expect(
      contributorValueScore({ peopleBrought: 20, activePeople: 16, verifiedActions: 20, attributedValue: 8000 }),
    ).toBeGreaterThan(contributorValueScore({ peopleBrought: 100, activePeople: 0, verifiedActions: 0 }));
  });

  it("summarizes what people did without finance jargon", () => {
    expect(happenedBuckets([{ action_type: "MOMENT_ATTENDANCE" }, { action_type: "PURCHASE" }])).toMatchObject({
      went: 1,
      bought: 1,
    });
  });

  it("maps live product action types into the same human buckets", () => {
    expect(classifyHappenedBucket("moment_join_verified")).toBe("went");
    expect(classifyHappenedBucket("proof_verified")).toBe("went");
    expect(classifyHappenedBucket("deal_claimed")).toBe("claimed");
    expect(classifyHappenedBucket("referral_activated")).toBe("brought");
    expect(classifyHappenedBucket("organic_share")).toBe("shared");
    expect(classifyHappenedBucket("PERK_REDEMPTION")).toBe("used");
  });

  it("accounts for every designed stakeholder on one ledger", () => {
    expect(Object.keys(STAKEHOLDER_OUTCOMES)).toEqual(["member", "contributor", "operator", "merchant", "network"]);
    const operator = accountStakeholderOutcomes({ role: "operator", people: 40, happening: 6, perksGiven: 2 });
    expect(operator.cards.map((card) => card.key)).toContain("happening");
    const member = accountStakeholderOutcomes({ role: "member", cardPerks: 3, memberships: 2 });
    expect(member.cards.map((card) => card.key)).toEqual(["cardPerks", "memberships"]);
  });

  it("writes drop share copy people can send as-is", () => {
    expect(dropShareCopy("Mikey", "2-for-1 Friday")).toBe("Mikey just dropped 2-for-1 Friday on your PromoCard.");
  });

  it("writes inventory copy as a people offer, not a storefront", () => {
    expect(inventoryOpenCopy("Devon House", "free tasting")).toBe("Devon House just put free tasting up for your people.");
  });

  it("creates readable community slugs", () => {
    expect(slugifyCommunityName("Kingston After Dark")).toBe("kingston-after-dark");
  });

  it("labels opportunity sources in everyday words", () => {
    expect(opportunitySourceLabel("offer")).toBe("Merchant");
    expect(opportunitySourceLabel("campaign")).toBe("Brand");
    expect(opportunitySourceLabel("mission")).toBe("Ask");
    expect(opportunitySourceLabel("unknown")).toBe("Opportunity");
  });

  it("prints a short stub code and remaining copy for a job slip", () => {
    expect(opportunityStubCode("offer:ab12cd34")).toBe("CD34");
    expect(opportunityRemainingCopy(null)).toBe("Open");
    expect(opportunityRemainingCopy(1)).toBe("1 left");
    expect(opportunityRemainingCopy(12)).toBe("12 left");
    expect(opportunityRemainingCopy(0)).toBe("Gone");
  });
});
