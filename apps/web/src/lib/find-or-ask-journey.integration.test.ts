import { describe, expect, it } from "vitest";
import { findOrAskPostKind, findOrAskRecoveryHref, findOrAskSearchHref } from "@promorang/shared";
import { stakeholderRoutes } from "./find-or-ask-stakeholder";

describe("Find-or-Ask journey integration", () => {
  it("carries one need from lookup through explicit question recovery into a canonical response route", () => {
    const start = findOrAskSearchHref({
      query: "Is the cafe open late?",
      city: "Kingston",
      language: "en",
      source: "home",
    });
    expect(start).toContain("q=Is+the+cafe+open+late%3F");
    expect(start).toContain("city=Kingston");
    expect(start).toContain("lang=en");
    expect(start).toContain("source=home");

    const recovery = findOrAskRecoveryHref("ask_people", {
      query: "Is the cafe open late?",
      city: "Kingston",
      language: "en",
      source: "home",
    });
    expect(recovery).toContain("recovery=ask_people");
    expect(findOrAskPostKind("ask_people")).toBe("question");

    const merchant = stakeholderRoutes("merchant", "question-123");
    const placeUpdate = merchant.find((row) => row.action === "update_place");
    expect(placeUpdate?.objectType).toBe("place");
    expect(placeUpdate?.href).toContain("origin_discovery=question-123");
    expect(placeUpdate?.href).toContain("origin_action=update_place");
  });

  it("keeps unmet demand distinct and routes a Host response to a Moment", () => {
    expect(findOrAskPostKind("request_something")).toBe("demand");
    const host = stakeholderRoutes("host", "demand-456")[0];
    expect(host.objectType).toBe("moment");
    expect(host.href).toContain("/create/moment");
    expect(host.href).toContain("origin_discovery=demand-456");
  });
});
