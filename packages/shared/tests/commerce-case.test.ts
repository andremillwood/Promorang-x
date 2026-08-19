import { describe, expect, it } from "vitest";
import { resolveCommerceCaseJourney } from "../src";

describe("commerce case journey", () => {
  it("moves from merchant response into review", () => {
    expect(resolveCommerceCaseJourney("in_progress", true).steps.find((step) => step.id === "review")?.state).toBe("current");
  });
  it("completes every step after resolution", () => {
    expect(resolveCommerceCaseJourney("resolved", true).steps.every((step) => step.state === "complete")).toBe(true);
  });
});
