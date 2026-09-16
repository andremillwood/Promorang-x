export type MobileRole = "participant" | "creator" | "host" | "brand" | "merchant" | "agency" | "admin" | string | null | undefined;

export type MobilePendingNavigation = {
  destination: string;
  capturedAt: number;
  expiresAt: number;
};

export const MOBILE_PENDING_NAVIGATION_TTL_MS = 24 * 60 * 60 * 1000;

const GATE_PATHS = new Set([
  "/",
  "/auth",
  "/auth/login",
  "/onboarding",
  "/dashboard",
  "/(tabs)",
  "/(tabs)/dashboard",
]);

function normalizedPath(value: string) {
  return value.split("?")[0].replace(/\/+$/, "") || "/";
}

export function safeMobileInternalDestination(value?: string | null): string | null {
  const destination = String(value || "").trim();
  if (!destination.startsWith("/") || destination.startsWith("//")) return null;
  if (destination.includes("\\") || /[\u0000-\u001F]/.test(destination)) return null;

  const path = normalizedPath(destination);
  if (GATE_PATHS.has(path)) return null;
  if (path.startsWith("/auth/") || path.startsWith("/onboarding/")) return null;
  return destination;
}

export function buildMobileInternalDestination(
  pathname?: string | null,
  params: Record<string, string | string[] | undefined> = {},
): string | null {
  const path = String(pathname || "").trim();
  if (!path.startsWith("/") || path.startsWith("//")) return null;

  const search = new URLSearchParams();
  for (const [key, rawValue] of Object.entries(params)) {
    const values = Array.isArray(rawValue) ? rawValue : rawValue == null ? [] : [rawValue];
    for (const value of values) search.append(key, String(value));
  }

  const query = search.toString();
  return safeMobileInternalDestination(query ? `${path}?${query}` : path);
}

export function createMobilePendingNavigation(
  destination: string,
  now = Date.now(),
  ttlMs = MOBILE_PENDING_NAVIGATION_TTL_MS,
): MobilePendingNavigation | null {
  const safeDestination = safeMobileInternalDestination(destination);
  if (!safeDestination || ttlMs <= 0) return null;
  return {
    destination: safeDestination,
    capturedAt: now,
    expiresAt: now + ttlMs,
  };
}

export function parseMobilePendingNavigation(
  value: string | MobilePendingNavigation | null | undefined,
  now = Date.now(),
): MobilePendingNavigation | null {
  let pending: MobilePendingNavigation | null = null;
  try {
    pending = typeof value === "string" ? JSON.parse(value) : value || null;
  } catch {
    return null;
  }

  if (!pending || typeof pending.destination !== "string") return null;
  const destination = safeMobileInternalDestination(pending.destination);
  if (!destination) return null;
  if (!Number.isFinite(pending.capturedAt) || !Number.isFinite(pending.expiresAt)) return null;
  if (pending.expiresAt <= now || pending.expiresAt <= pending.capturedAt) return null;
  return { ...pending, destination };
}

export function mobileRoleLanding(role: MobileRole): string {
  return role && role !== "participant" ? "/(tabs)/dashboard" : "/(tabs)";
}

export function resolveMobilePostGateDestination(input: {
  pending?: MobilePendingNavigation | null;
  role?: MobileRole;
  now?: number;
}): string {
  const pending = input.pending
    ? parseMobilePendingNavigation(input.pending, input.now ?? Date.now())
    : null;
  return pending?.destination || mobileRoleLanding(input.role);
}
