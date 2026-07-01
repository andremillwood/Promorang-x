import { describe, expect, it } from "vitest";
import { possessiveLocation } from "./useVisitorLocation";

describe("possessiveLocation", () => {
  it("adds an apostrophe and s to most locations", () => {
    expect(possessiveLocation("Jamaica")).toBe("Jamaica's");
  });

  it("adds only an apostrophe to locations ending in s", () => {
    expect(possessiveLocation("Paris")).toBe("Paris'");
  });
});
