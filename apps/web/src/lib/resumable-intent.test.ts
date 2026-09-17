import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  RESUMABLE_INTENT_KEY,
  clearResumableIntent,
  inferredResumableIntentForPath,
  readResumableIntent,
  rememberResumableIntent,
} from "./resumable-intent";

describe("resumable public action intent", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("infers an RSVP intent from a public Moment return path", () => {
    expect(inferredResumableIntentForPath("/moments/encore?campaign=abc#access")).toEqual({
      kind: "moment_join",
      returnPath: "/moments/encore?campaign=abc#access",
      targetId: "encore",
    });
  });

  it("does not invent action intent for a Discovery view", () => {
    expect(inferredResumableIntentForPath("/discoveries/night-market")).toBeNull();
  });

  it("returns a pending intent only on the same object path and query", () => {
    rememberResumableIntent({ kind: "offer_claim", returnPath: "/shop/offer-1?src=share", targetId: "offer-1" });
    expect(readResumableIntent("/shop/offer-1?src=share#claim")?.kind).toBe("offer_claim");
    expect(readResumableIntent("/shop/offer-1?src=other")).toBeNull();
  });

  it("expires stale intent rather than presenting it as current", () => {
    sessionStorage.setItem(RESUMABLE_INTENT_KEY, JSON.stringify({
      kind: "moment_join",
      returnPath: "/moments/encore",
      targetId: "encore",
      createdAt: Date.now() - 46 * 60 * 1000,
    }));
    expect(readResumableIntent("/moments/encore")).toBeNull();
    expect(sessionStorage.getItem(RESUMABLE_INTENT_KEY)).toBeNull();
  });

  it("clears only a matching intent when a match is supplied", () => {
    rememberResumableIntent({ kind: "commerce_purchase", returnPath: "/shop/item-1", targetId: "item-1" });
    clearResumableIntent({ kind: "offer_claim", targetId: "item-1" });
    expect(readResumableIntent("/shop/item-1")).not.toBeNull();
    clearResumableIntent({ kind: "commerce_purchase", targetId: "item-1" });
    expect(readResumableIntent("/shop/item-1")).toBeNull();
  });
});
