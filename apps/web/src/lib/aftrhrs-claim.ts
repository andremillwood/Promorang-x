import { AFTRHRS_PATHS, AFTRHRS_PENDING_CLAIM_KEY } from "@promorang/shared";
import { persistPostAuthNext } from "@/lib/post-auth-next";

export function markAftrHrsClaimPending() {
  if (typeof window === "undefined") return;
  localStorage.setItem(AFTRHRS_PENDING_CLAIM_KEY, "1");
  persistPostAuthNext(AFTRHRS_PATHS.claimReturn);
}

export function hasAftrHrsClaimPending() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AFTRHRS_PENDING_CLAIM_KEY) === "1";
}

export function clearAftrHrsClaimPending() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AFTRHRS_PENDING_CLAIM_KEY);
}

export function aftrHrsResumePath() {
  return AFTRHRS_PATHS.claimReturn;
}
