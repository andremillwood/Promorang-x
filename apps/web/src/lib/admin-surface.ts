import { AFTRHRS_MOMENT_ID, AFTRHRS_MOMENT_SLUG, AFTRHRS_PATHS } from "@promorang/shared";

export const ADMIN_AFTRHRS_TAB_HREF = "/admin?tab=aftrhrs";

export const AFTRHRS_FUNNEL_LABELS: Record<string, string> = {
  landing_view: "Landing views",
  moment_join: "Moment joins",
  pass_secured: "RSVPs secured",
  checked_in: "Checked in",
};

export function isAftrHrsMoment(moment: {
  id?: string | null;
  slug?: string | null;
  title?: string | null;
}): boolean {
  const id = String(moment.id || "");
  const slug = String(moment.slug || "").trim().toLowerCase();
  const title = String(moment.title || "").replace(/\s+/g, "").toLowerCase();
  return id === AFTRHRS_MOMENT_ID || slug === AFTRHRS_MOMENT_SLUG || title === "aftrhrs";
}

export function adminChromePageMeta(pathname: string, search = ""): { label: string; description: string } | null {
  const tab = new URLSearchParams(search).get("tab");
  const onAftrHrs =
    pathname === AFTRHRS_PATHS.admin ||
    pathname.startsWith(`${AFTRHRS_PATHS.admin}/`) ||
    (pathname === "/admin" && tab === "aftrhrs");

  if (onAftrHrs) {
    return {
      label: "AftrHrs",
      description: "RSVPs, digital passes, and Sea Deck door controls.",
    };
  }

  if (pathname === "/admin" && tab === "moments") {
    return {
      label: "Moments",
      description: "Review Moments and open AftrHrs RSVPs from the list.",
    };
  }

  return null;
}
