export const PUBLIC_PROMOCARD_PATH = "/promocard";

export function promoCardActionHref(signedIn: boolean) {
  return signedIn ? "/wallet" : "/auth?mode=signup&next=/wallet";
}
