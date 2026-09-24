import { describe, expect, it } from "vitest";
import { findOrAskRecoveryHref, findOrAskSearchHref } from "../src/find-or-ask";

describe("find or ask intent URLs", () => {
  it("preserves the query, city, and source when search starts", () => {
    expect(findOrAskSearchHref({
      query: " Is this place open? ",
      city: "Kingston & St. Andrew",
      source: "home",
    })).toBe("/search?q=Is+this+place+open%3F&source=home&city=Kingston+%26+St.+Andrew");
  });

  it("records an explicit recovery choice without changing the original query", () => {
    expect(findOrAskRecoveryHref("ask_people", {
      query: "late-night café",
      source: "search",
    })).toBe("/search?q=late-night+caf%C3%A9&source=search&recovery=ask_people");
  });
});
