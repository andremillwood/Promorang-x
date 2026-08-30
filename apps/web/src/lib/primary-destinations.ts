export const PRIMARY_DESTINATION_IDS = ["today", "discover", "create", "progress", "vault"] as const;

export type PrimaryDestinationId = (typeof PRIMARY_DESTINATION_IDS)[number];

export type PrimaryDestination = {
  id: PrimaryDestinationId;
  href: string;
  labelKey: "dest.today" | "dest.discover" | "dest.create" | "dest.progress" | "dest.vault";
  questionKey:
    | "dest.todayQuestion"
    | "dest.discoverQuestion"
    | "dest.createQuestion"
    | "dest.progressQuestion"
    | "dest.vaultQuestion";
};

export const PRIMARY_DESTINATIONS: readonly PrimaryDestination[] = [
  { id: "today", href: "/today", labelKey: "dest.today", questionKey: "dest.todayQuestion" },
  { id: "discover", href: "/discover", labelKey: "dest.discover", questionKey: "dest.discoverQuestion" },
  { id: "create", href: "/create", labelKey: "dest.create", questionKey: "dest.createQuestion" },
  { id: "progress", href: "/progress", labelKey: "dest.progress", questionKey: "dest.progressQuestion" },
  { id: "vault", href: "/vault", labelKey: "dest.vault", questionKey: "dest.vaultQuestion" },
] as const;

const PROGRESS_ALIASES = ["/progress", "/activity", "/notifications", "/dashboard/activity"];

export function isPrimaryDestinationHref(href: string): boolean {
  const path = href.split("?")[0];
  if (path === "/today" || path.startsWith("/today/")) return true;
  if (path === "/discover" || path.startsWith("/discover/")) return true;
  if (path === "/create" || path.startsWith("/create/")) return true;
  if (PROGRESS_ALIASES.includes(path)) return true;
  if (path === "/vault" || path.startsWith("/vault/")) return true;
  return false;
}

export function isPrimaryDestinationActive(pathname: string, href: string): boolean {
  const path = href.split("?")[0];
  if (path === "/") return pathname === "/";
  if (path === "/progress") {
    return PROGRESS_ALIASES.includes(pathname) || pathname.startsWith("/progress/");
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function matchPrimaryDestination(pathname: string): PrimaryDestinationId | null {
  if (pathname === "/today" || pathname.startsWith("/today/")) return "today";
  if (pathname === "/discover" || pathname.startsWith("/discover/")) return "discover";
  if (pathname === "/create" || pathname.startsWith("/create/")) return "create";
  if (PROGRESS_ALIASES.includes(pathname) || pathname.startsWith("/progress/")) return "progress";
  if (pathname === "/vault" || pathname.startsWith("/vault/")) return "vault";
  return null;
}

export function isSharedPrimaryNavHref(href: string): boolean {
  const [path, query] = href.split("?");
  if (query) return false;
  return path === "/" || path === "/today" || path === "/discover" || path === "/create" || path === "/progress" || path === "/vault";
}

export function destinationHrefForSession(href: string, signedIn: boolean): string {
  if (href === "/" && signedIn) return "/today";
  if (href === "/progress" && !signedIn) return "/auth?next=/progress";
  return href;
}
