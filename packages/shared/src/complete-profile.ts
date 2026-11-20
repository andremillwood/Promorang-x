/** Stable route the capped-drop claim redirects to when age or country is missing. */
export const COMPLETE_PROFILE_PATH = "/complete-profile";

/** Query param. Value is a same-origin path the page returns to after a successful save. */
export const COMPLETE_PROFILE_NEXT_PARAM = "next";

export function sanitizeCompleteProfileNext(next?: string | null): string | null {
  if (!next) return null;
  let trimmed = next.trim();
  try {
    trimmed = decodeURIComponent(trimmed);
  } catch {
    return null;
  }
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("\\")) return null;
  const pathOnly = trimmed.split("?")[0]?.split("#")[0] || "";
  if (pathOnly === COMPLETE_PROFILE_PATH || pathOnly.startsWith(`${COMPLETE_PROFILE_PATH}/`)) return null;
  return trimmed;
}

export function completeProfileHref(next?: string | null): string {
  const safe = sanitizeCompleteProfileNext(next);
  if (!safe) return COMPLETE_PROFILE_PATH;
  return `${COMPLETE_PROFILE_PATH}?${COMPLETE_PROFILE_NEXT_PARAM}=${encodeURIComponent(safe)}`;
}
