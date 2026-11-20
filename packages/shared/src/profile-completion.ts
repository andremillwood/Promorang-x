/**
 * Profile completion for the 18+ and country gates.
 * The country/DOB sibling owns the page. If that PR picks another path,
 * change this constant only.
 */
export const PROFILE_COMPLETION_PATH = "/complete-profile";

export const SIGN_IN_PATH = "/auth";

export const PROFILE_GATE_CODES = ["AGE_REQUIRED", "COUNTRY_REQUIRED"] as const;

export type ProfileGateCode = (typeof PROFILE_GATE_CODES)[number];

export function isProfileGateCode(code?: string | null): code is ProfileGateCode {
  return code === "AGE_REQUIRED" || code === "COUNTRY_REQUIRED";
}

function withNext(path: string, nextPath: string) {
  const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  return `${path}?next=${encodeURIComponent(next)}`;
}

/** Signed-in claim blocked on age or country. Return here after the profile page. */
export function profileCompletionHref(nextPath: string) {
  return withNext(PROFILE_COMPLETION_PATH, nextPath);
}

/** Signed-out claim. The next path is the drop, the same return the profile page uses. */
export function signInHref(nextPath: string) {
  return withNext(SIGN_IN_PATH, nextPath);
}
