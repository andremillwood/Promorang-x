import { describe, expect, it } from "vitest";
import {
  accountStakeholderOutcomes,
  classifyExperienceRole,
  classifyHappenedBucket,
  contributorValueScore,
  claimPingCopy,
  dropClaimDenial,
  dropShareCopy,
  inventoryOpenCopy,
  happenedBuckets,
  peopleNoticeHref,
  PEOPLE_NOTICE_TYPES,
  resolveCreateIntent,
  showedUpPingCopy,
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

  it("pings people in everyday language when a drop, claim, or show-up happens", () => {
    expect(claimPingCopy("Ada", "2-for-1 Friday")).toBe("Ada claimed 2-for-1 Friday.");
    expect(showedUpPingCopy("Devon")).toBe("Devon showed up.");
    expect(showedUpPingCopy("Devon", "Kingston After Dark")).toBe("Devon showed up at Kingston After Dark.");
    expect(peopleNoticeHref(PEOPLE_NOTICE_TYPES.drop, { slug: "jack-samples" })).toBe("/drop/jack-samples");
    expect(peopleNoticeHref(PEOPLE_NOTICE_TYPES.claim)).toBe("/happened");
    expect(peopleNoticeHref(PEOPLE_NOTICE_TYPES.showedUp)).toBe("/happened");
  });

  it("enforces drop audiences without inventing new rules for everyone", () => {
    expect(dropClaimDenial({ audience: "everyone", remaining: 3, claimerId: "u1" })).toBeNull();
    expect(dropClaimDenial({ audience: "first_x", remaining: 0, claimerId: "u1" })).toBe("It is already gone");
    expect(dropClaimDenial({
      audience: "specific",
      claimerId: "u2",
      specificUserIds: ["u1"],
    })).toBe("This one is for specific people");
    expect(dropClaimDenial({ audience: "most_active", claimerId: "u1", isMostActive: false }))
      .toBe("This one is for the people who show up most");
    expect(dropClaimDenial({ audience: "complete_something", claimerId: "u1", hasCompletedSomething: false }))
      .toBe("Show up or finish something first");
    expect(dropClaimDenial({ audience: "most_active", claimerId: "u1" })).toBeNull();
  });
});
