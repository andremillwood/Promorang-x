import { describe, expect, it } from "vitest";
import { pollHasRedeemablePerk, pollSignalKind } from "./discovery-signal";

describe("pollSignalKind", () => {
  it("treats editorial polls as demand unless a house has put a live offer up", () => {
    expect(pollSignalKind(undefined)).toBe("demand");
    expect(pollSignalKind({})).toBe("demand");
    expect(pollSignalKind({ signalKind: "demand" })).toBe("demand");
    expect(pollSignalKind({ signalKind: "live_offer" })).toBe("live_offer");
  });
});

describe("pollHasRedeemablePerk", () => {
  it("only lets a live house offer land as something you can show at a counter", () => {
    expect(pollHasRedeemablePerk({ signalKind: "demand" })).toBe(false);
    expect(pollHasRedeemablePerk({ signalKind: "live_offer" })).toBe(true);
  });
});
