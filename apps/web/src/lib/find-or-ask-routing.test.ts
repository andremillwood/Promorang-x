import { describe, expect, it } from "vitest";
import { FIND_OR_ASK_STAKEHOLDER_ACTIONS, findOrAskPostKind, isDemandTargetAllowed } from "@promorang/shared";

describe("find-or-ask canonical routing", () => {
  it("keeps a community question out of demand mechanics", () => {
    expect(findOrAskPostKind("ask_people")).toBe("question");
    expect(isDemandTargetAllowed("question")).toBe(false);
  });

  it("only creates demand semantics after the explicit unmet-demand choice", () => {
    expect(findOrAskPostKind("request_something")).toBe("demand");
    expect(isDemandTargetAllowed("demand")).toBe(true);
  });

  it("routes stakeholders to canonical response families", () => {
    expect(FIND_OR_ASK_STAKEHOLDER_ACTIONS.merchant).toEqual(["confirm_fact", "update_place", "create_offer"]);
    expect(FIND_OR_ASK_STAKEHOLDER_ACTIONS.host).toEqual(["create_moment"]);
    expect(FIND_OR_ASK_STAKEHOLDER_ACTIONS.creator).toEqual(["answer", "create_content", "accept_opportunity"]);
    expect(FIND_OR_ASK_STAKEHOLDER_ACTIONS.brand).toEqual(["validate", "sponsor", "commission"]);
  });
});
