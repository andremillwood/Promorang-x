import { afterEach, describe, expect, it } from "vitest";
import { AFTRHRS_PATHS, AFTRHRS_PENDING_CLAIM_KEY } from "@promorang/shared";
import { POST_AUTH_NEXT_KEY } from "@/lib/post-auth-next";
import {
  clearAftrHrsClaimPending,
  hasAftrHrsClaimPending,
  markAftrHrsClaimPending,
} from "./aftrhrs-claim";

afterEach(() => {
  localStorage.removeItem(AFTRHRS_PENDING_CLAIM_KEY);
  localStorage.removeItem(POST_AUTH_NEXT_KEY);
  sessionStorage.removeItem(POST_AUTH_NEXT_KEY);
});

describe("AftrHrs pending claim", () => {
  it("remembers terms-accepted claim intent across a new tab", () => {
    expect(hasAftrHrsClaimPending()).toBe(false);
    markAftrHrsClaimPending();
    expect(hasAftrHrsClaimPending()).toBe(true);
    expect(localStorage.getItem(POST_AUTH_NEXT_KEY)).toBe(AFTRHRS_PATHS.claimReturn);
    sessionStorage.removeItem(POST_AUTH_NEXT_KEY);
    expect(localStorage.getItem(AFTRHRS_PENDING_CLAIM_KEY)).toBe("1");
    clearAftrHrsClaimPending();
    expect(hasAftrHrsClaimPending()).toBe(false);
  });
});
