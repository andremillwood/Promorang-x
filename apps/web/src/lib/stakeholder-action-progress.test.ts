import { describe, expect, it } from "vitest";
import { completedStakeholderActionIds } from "./stakeholder-action-progress";

const facts = {
  evidenceMatchesRole: true,
  suppliesInventory: true,
  perksGiven: 2,
  cardPerks: 1,
  verifiedActions: 3,
};

describe("completedStakeholderActionIds", () => {
  it("never applies evidence from another active role", () => {
    expect(completedStakeholderActionIds("creator", { ...facts, evidenceMatchesRole: false })).toEqual([]);
  });

  it("maps only evidence-backed merchant progress", () => {
    expect(completedStakeholderActionIds("merchant", facts)).toEqual(["put-perk-up", "share-perk", "validate"]);
  });

  it("does not claim a creator published a release without release ownership evidence", () => {
    expect(completedStakeholderActionIds("creator", facts)).toEqual(["attach-perk", "take-perk"]);
  });

  it("does not claim a host created a Moment without ownership evidence", () => {
    expect(completedStakeholderActionIds("host", facts)).toEqual(["attach-perk", "validate"]);
  });

  it("does not claim a brand launched a campaign without campaign evidence", () => {
    expect(completedStakeholderActionIds("brand", facts)).toEqual(["fund-perk", "watch-attributed"]);
  });
});
