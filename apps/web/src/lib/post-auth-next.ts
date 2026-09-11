import { inferStakeholderRoleFromPath } from "@promorang/shared";

export const POST_AUTH_NEXT_KEY = "promorang_post_auth_next";

const COMMERCIAL_PREFIXES = [
  "/propose",
  "/create",
  "/hosting",
  "/for-creators",
  "/for-merchants",
  "/for-brands",
  "/for-communities",
  "/for-agencies",
  "/for-enterprise",
  "/organizer",
  "/offers",
  "/dashboard/proposals",
];

export type PostAuthRole =
  | "participant"
  | "creator"
  | "host"
  | "brand"
  | "merchant"
  | "agency"
  | "promoter"
  | "marketing"
  | "admin"
  | null
  | undefined;

export function sanitizePostAuthNext(next?: string | null): string | null {
  if (!next) return null;
  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null;
  if (trimmed.startsWith("/auth") || trimmed.startsWith("/post-login")) return null;
  return trimmed;
}

function writePostAuthNext(value: string) {
  sessionStorage.setItem(POST_AUTH_NEXT_KEY, value);
  try {
    localStorage.setItem(POST_AUTH_NEXT_KEY, value);
  } catch {
    // Private mode can block localStorage; sessionStorage still resumes same-tab auth.
  }
}

function clearStoredPostAuthNext() {
  sessionStorage.removeItem(POST_AUTH_NEXT_KEY);
  try {
    localStorage.removeItem(POST_AUTH_NEXT_KEY);
  } catch {
    // ignore
  }
}

export function persistPostAuthNext(next?: string | null) {
  if (typeof window === "undefined") return;
  const safe = sanitizePostAuthNext(next);
  if (safe) writePostAuthNext(safe);
}

export function peekPostAuthNext(): string | null {
  if (typeof window === "undefined") return null;
  return sanitizePostAuthNext(sessionStorage.getItem(POST_AUTH_NEXT_KEY))
    || sanitizePostAuthNext(localStorage.getItem(POST_AUTH_NEXT_KEY));
}

export function consumePostAuthNext(): string | null {
  if (typeof window === "undefined") return null;
  const stored = peekPostAuthNext();
  clearStoredPostAuthNext();
  return stored;
}

export function isCommercialNext(next?: string | null): boolean {
  const path = sanitizePostAuthNext(next)?.split("?")[0] || "";
  return COMMERCIAL_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function roleFromNext(next?: string | null): Exclude<PostAuthRole, null | undefined> | null {
  const value = sanitizePostAuthNext(next);
  if (!value) return null;
  const inferred = inferStakeholderRoleFromPath(value);
  if (inferred && inferred !== "admin" && inferred !== "agency" && inferred !== "promoter" && inferred !== "marketing") {
    return inferred;
  }
  const params = new URLSearchParams(value.split("?")[1] || "");
  const requested = params.get("role") || params.get("audience");
  if (requested === "creator" || requested === "host" || requested === "brand" || requested === "merchant") {
    return requested;
  }
  const path = value.split("?")[0];
  if (params.get("from") === "sponsor") return "brand";
  if (path.startsWith("/for-creators")) return "creator";
  if (path.startsWith("/for-merchants")) return "merchant";
  if (path.startsWith("/for-brands")) return "brand";
  if (path.startsWith("/propose") || path.startsWith("/hosting") || path.startsWith("/for-communities")) return "host";
  return null;
}

export function defaultPostAuthPath(role: PostAuthRole): string {
  if (role === "admin") return "/admin?tab=command";
  if (role === "host" || role === "brand" || role === "merchant" || role === "creator" || role === "agency") {
    return "/dashboard?view=studio";
  }
  return "/dashboard";
}

export function resolvePostAuthPath({
  requestedNext,
  role,
  onboardingCompleted = true,
}: {
  requestedNext?: string | null;
  role: PostAuthRole;
  onboardingCompleted?: boolean;
}): string {
  const next = sanitizePostAuthNext(requestedNext);
  if (next) return next;
  if (!onboardingCompleted) return role === "brand" ? "/onboarding/brand" : "/onboarding";
  return defaultPostAuthPath(role);
}

export function authPathForReturn(returnTo: string, extras?: Record<string, string>) {
  const params = new URLSearchParams(extras);
  params.set("next", returnTo);
  if (!params.get("role")) {
    const inferred = roleFromNext(returnTo);
    if (inferred) params.set("role", inferred);
  }
  return `/auth?${params.toString()}`;
}
