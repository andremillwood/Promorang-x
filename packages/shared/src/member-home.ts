/**
 * Person home loop
 *
 * Vault is where a person lands after sign-in: the PromoCard they hold.
 * Today is the process that teaches and operates that card.
 */

export const PERSON_HOME_PATH = "/vault";
export const PERSON_TODAY_PATH = "/today";
export const PERSON_TODAY_ALIASES = ["/today", "/dashboard"] as const;

export type PersonSignInInput = {
  role?: string | null;
  hasCompletedOnboarding: boolean;
  requestedNext?: string | null;
  demoPath?: string | null;
};

export function isSafeInternalPath(path?: string | null): path is string {
  return Boolean(path && path.startsWith("/") && !path.startsWith("//"));
}

export function isOperatorRole(role?: string | null) {
  return role === "admin" || role === "brand" || role === "merchant" || role === "host" || role === "creator" || role === "agency";
}

export function getPersonSignInPath(input: PersonSignInInput): string {
  if (isSafeInternalPath(input.requestedNext)) return input.requestedNext;
  if (isSafeInternalPath(input.demoPath)) return input.demoPath;
  if (!input.hasCompletedOnboarding && !isOperatorRole(input.role)) return "/onboarding";
  if (!isOperatorRole(input.role)) return PERSON_HOME_PATH;
  return PERSON_TODAY_PATH;
}

export const PROMOCARD_HOME_LOOP = {
  vaultJob: "Show the PromoCard a person already holds, in promotional Gems and local money.",
  todayJob: "Name one move that uses or recharges that PromoCard today.",
  carry: "Vault answers what you hold. Today answers what to do with it.",
} as const;
