import { authEntryHref, rememberIntendedStakeholder } from "@promorang/shared";

export type CommercialRole = "participant" | "creator" | "host" | "brand" | "merchant";

export const BRAND_LANDING_PATH = "/for-brands?from=sponsor";
export const BRAND_CAMPAIGN_PATH = "/create/campaign?from=sponsor";

const SPONSOR_BRIEF_KEY = "promorang_sponsor_brief";
const MARKETING_INTENT_KEY = "promorang_marketing_intent";
const ACTIVE_ROLE_KEY = "promorang_active_role";

export type SponsorBrief = {
  human?: string;
  action?: string;
  role?: string;
  proof?: string;
  insight?: string;
  name?: string;
  capturedAt: string;
};

const COMMERCIAL_ROLES: CommercialRole[] = ["participant", "creator", "host", "brand", "merchant"];

function isCommercialRole(value: string | null | undefined): value is CommercialRole {
  return Boolean(value && COMMERCIAL_ROLES.includes(value as CommercialRole));
}

export function writeSponsorBrief(brief: Omit<SponsorBrief, "capturedAt"> & { capturedAt?: string }) {
  if (typeof window === "undefined") return;
  const payload: SponsorBrief = { ...brief, capturedAt: brief.capturedAt || new Date().toISOString() };
  sessionStorage.setItem(SPONSOR_BRIEF_KEY, JSON.stringify(payload));
}

export function readSponsorBrief(): SponsorBrief | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SPONSOR_BRIEF_KEY);
    return raw ? (JSON.parse(raw) as SponsorBrief) : null;
  } catch {
    sessionStorage.removeItem(SPONSOR_BRIEF_KEY);
    return null;
  }
}

export function readStoredCommercialAudience(): CommercialRole | null {
  if (typeof window === "undefined") return null;
  if (readSponsorBrief()) return "brand";
  try {
    const intent = JSON.parse(sessionStorage.getItem(MARKETING_INTENT_KEY) || "null");
    return isCommercialRole(intent?.audience) ? intent.audience : null;
  } catch {
    return null;
  }
}

export function persistPreferredRole(role: CommercialRole) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_ROLE_KEY, role);
}

export function inferAuthRole(
  pathname: string,
  search = "",
  storedAudience?: string | null,
): CommercialRole | null {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const explicit = params.get("role") || params.get("audience");
  if (isCommercialRole(explicit)) return explicit;

  if (
    pathname.startsWith("/onboarding/brand") ||
    pathname.startsWith("/create/campaign") ||
    pathname.startsWith("/for-brands") ||
    pathname.startsWith("/free/sponsor") ||
    pathname.startsWith("/offers")
  ) {
    return "brand";
  }

  if (pathname.startsWith("/create/moment") || pathname.startsWith("/hosting") || pathname.startsWith("/organizer")) {
    return "host";
  }

  if (pathname.startsWith("/stock") || pathname.startsWith("/for-merchants")) {
    return "merchant";
  }

  if (pathname.startsWith("/propose")) {
    return storedAudience === "brand" ? "brand" : "host";
  }

  return null;
}

export function buildAuthHref(next?: string | null, role?: string | null, mode?: "login" | "signup") {
  const params = new URLSearchParams();
  if (mode) params.set("mode", mode);
  if (role) params.set("role", role);
  if (next && next.startsWith("/") && !next.startsWith("//")) params.set("next", next);
  const query = params.toString();
  return query ? `/auth?${query}` : "/auth";
}

export function safeNextPath(value?: string | null) {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export function splitPathAndSearch(value?: string | null) {
  const next = safeNextPath(value);
  if (!next) return { pathname: "", search: "" };
  const index = next.indexOf("?");
  return index === -1
    ? { pathname: next, search: "" }
    : { pathname: next.slice(0, index), search: next.slice(index) };
}

export function rememberBrandEntry(next = BRAND_CAMPAIGN_PATH) {
  persistPreferredRole("brand");
  if (typeof sessionStorage === "undefined") return;
  rememberIntendedStakeholder(sessionStorage, { role: "brand", next });
}

export function brandAuthHref(user: unknown, next = BRAND_CAMPAIGN_PATH) {
  return user ? next : authEntryHref({ mode: "signup", role: "brand", next });
}

export function mapSponsorActionToOutcome(action?: string) {
  const value = (action || "").toLowerCase();
  if (value.includes("visit") || value.includes("redeem")) return "visits";
  if (value.includes("creator")) return "content";
  if (value.includes("repeat")) return "community";
  if (value.includes("attendance")) return "gather";
  return "";
}
