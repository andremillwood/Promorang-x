import type { PostAuthRole } from "@/lib/post-auth-next";

export interface StartPageOption {
  label: string;
  route: string;
}

const START_PAGE_OPTIONS: Record<string, StartPageOption[]> = {
  participant: [
    { label: "Home", route: "/dashboard" },
    { label: "Discover", route: "/discover" },
    { label: "PromoCard", route: "/card" },
  ],
  creator: [
    { label: "Home", route: "/dashboard?view=studio" },
    { label: "Opportunities", route: "/earn" },
    { label: "Earnings", route: "/wallet" },
  ],
  host: [
    { label: "Home", route: "/dashboard?view=studio" },
    { label: "Create", route: "/create" },
    { label: "What happened", route: "/happened" },
  ],
  merchant: [
    { label: "Home", route: "/dashboard?view=studio&tab=home" },
    { label: "Promotions", route: "/dashboard?view=studio&tab=promotions" },
    { label: "Sales & Results", route: "/dashboard?view=studio&tab=results" },
  ],
  brand: [
    { label: "Home", route: "/dashboard?view=studio" },
    { label: "Campaigns", route: "/dashboard/campaigns" },
    { label: "Analytics", route: "/dashboard/analytics" },
  ],
  agency: [
    { label: "Home", route: "/dashboard?view=studio" },
    { label: "Proposals", route: "/dashboard/proposals" },
    { label: "Analytics", route: "/dashboard/analytics" },
  ],
  promoter: [
    { label: "Home", route: "/dashboard?view=studio" },
    { label: "Create", route: "/create" },
    { label: "Results", route: "/happened" },
  ],
  marketing: [
    { label: "Home", route: "/dashboard?view=studio" },
    { label: "Demand", route: "/demand" },
    { label: "Results", route: "/happened" },
  ],
  admin: [
    { label: "Command Center", route: "/admin?tab=command" },
    { label: "Users & KYC", route: "/admin?tab=users" },
    { label: "Moments & Venues", route: "/admin?tab=moments" },
  ],
};

const storageKey = (userId: string, role: string) => `promorang:start-page:${userId}:${role}`;

const normalizedRole = (role: PostAuthRole): string => role || "participant";

export function getStartPageOptions(role: PostAuthRole): StartPageOption[] {
  return START_PAGE_OPTIONS[normalizedRole(role)] || START_PAGE_OPTIONS.participant;
}

export function isValidWorkspaceStartPage(role: PostAuthRole, route?: string | null): route is string {
  if (!route) return false;
  return getStartPageOptions(role).some((option) => option.route === route);
}

export function readWorkspaceStartPage(userId: string, role: PostAuthRole): string | null {
  if (typeof window === "undefined" || !userId) return null;
  try {
    const value = localStorage.getItem(storageKey(userId, normalizedRole(role)));
    return isValidWorkspaceStartPage(role, value) ? value : null;
  } catch {
    return null;
  }
}

export function writeWorkspaceStartPage(userId: string, role: PostAuthRole, route: string): boolean {
  if (typeof window === "undefined" || !userId || !isValidWorkspaceStartPage(role, route)) return false;
  try {
    localStorage.setItem(storageKey(userId, normalizedRole(role)), route);
    return true;
  } catch {
    return false;
  }
}

export function clearWorkspaceStartPage(userId: string, role: PostAuthRole) {
  if (typeof window === "undefined" || !userId) return;
  try {
    localStorage.removeItem(storageKey(userId, normalizedRole(role)));
  } catch {
    // Best-effort local preference only.
  }
}
