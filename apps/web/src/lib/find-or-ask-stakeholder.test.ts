import { describe, expect, it } from "vitest";
import { stakeholderRoutes } from "./find-or-ask-stakeholder";

describe("stakeholderRoutes", () => {
  it("routes merchants through facts, Place and Offer workflows", () => {
    expect(stakeholderRoutes("merchant", "d-1").map((row) => [row.action, row.objectType])).toEqual([
      ["confirm_fact", "proof"], ["update_place", "place"], ["create_offer", "offer"],
    ]);
  });

  it("routes hosts, creators and brands through existing canonical workflows", () => {
    expect(stakeholderRoutes("host", "d-1")[0]?.objectType).toBe("moment");
    expect(stakeholderRoutes("creator", "d-1").map((row) => row.objectType)).toEqual(["proof", "content", "opportunity"]);
    expect(stakeholderRoutes("brand", "d-1").map((row) => row.action)).toEqual(["validate", "sponsor", "commission"]);
  });
});
