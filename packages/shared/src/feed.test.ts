import { describe, expect, it } from "vitest";
import { feedObjectHref } from "./feed";

describe("feedObjectHref", () => {
  it("opens Releases, not the old watch-unlock list", () => {
    expect(feedObjectHref("drop", "drop-1", "web")).toBe("/content-drops");
    expect(feedObjectHref("content", "rel-1", "web")).toBe("/content-drops/rel-1");
  });
});
