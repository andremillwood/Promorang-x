import { describe, expect, it } from "vitest";
import {
  findOrAskPostKind,
  findOrAskRecoveryHref,
  findOrAskSearchHref,
  isDemandTargetAllowed,
} from "../src/find-or-ask";

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

  it("preserves language with the recovery choice", () => {
    expect(findOrAskRecoveryHref("request_something", {
      query: "late-night café",
      city: "Kingston",
      language: "es-419",
      source: "discover",
    })).toBe("/search?q=late-night+caf%C3%A9&source=discover&recovery=request_something&city=Kingston&lang=es-419");
  });

  it("maps recovery choices to distinct post semantics", () => {
    expect(findOrAskPostKind("ask_people")).toBe("question");
    expect(findOrAskPostKind("request_something")).toBe("demand");
    expect(findOrAskPostKind("search_again")).toBeNull();
    expect(isDemandTargetAllowed("question")).toBe(false);
    expect(isDemandTargetAllowed("demand")).toBe(true);
  });
});
