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
  { id: "today", href: "/", labelKey: "dest.today", questionKey: "dest.todayQuestion" },
  { id: "discover", href: "/discover", labelKey: "dest.discover", questionKey: "dest.discoverQuestion" },
  { id: "create", href: "/create", labelKey: "dest.create", questionKey: "dest.createQuestion" },
  { id: "progress", href: "/progress", labelKey: "dest.progress", questionKey: "dest.progressQuestion" },
  { id: "vault", href: "/vault", labelKey: "dest.vault", questionKey: "dest.vaultQuestion" },
] as const;

const TODAY_ALIASES = ["/", "/home", "/dashboard", "/app-preview"];
const PROGRESS_ALIASES = [
  "/progress",
  "/activity",
  "/notifications",
  "/dashboard/activity",
  "/happened",
  "/app-preview/happened",
  "/app-preview/progress",
];

function stripQuery(href: string) {
  return href.split("?")[0];
}

export function isPrimaryDestinationHref(href: string): boolean {
  const path = stripQuery(href);
  if (TODAY_ALIASES.includes(path)) return true;
  if (path === "/discover" || path.startsWith("/discover/")) return true;
  if (path === "/create" || path.startsWith("/create/") || path === "/app-preview/create") return true;
  if (PROGRESS_ALIASES.includes(path) || path.startsWith("/progress/")) return true;
  if (path === "/vault" || path.startsWith("/vault/")) return true;
  return false;
}

export function isPrimaryDestinationActive(pathname: string, href: string, search = ""): boolean {
  const path = stripQuery(href);
  if (path === "/" || path === "/home") {
    if (pathname === "/dashboard") return !search.includes("view=studio");
    return TODAY_ALIASES.includes(pathname);
  }
  if (path === "/progress") {
    return PROGRESS_ALIASES.includes(pathname) || pathname.startsWith("/progress/");
  }
  if (path === "/create") {
    return pathname === "/create" || pathname.startsWith("/create/") || pathname === "/app-preview/create";
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function matchPrimaryDestination(pathname: string): PrimaryDestinationId | null {
  if (TODAY_ALIASES.includes(pathname)) return "today";
  if (pathname === "/discover" || pathname.startsWith("/discover/")) return "discover";
  if (pathname === "/create" || pathname.startsWith("/create/") || pathname === "/app-preview/create") return "create";
  if (PROGRESS_ALIASES.includes(pathname) || pathname.startsWith("/progress/")) return "progress";
  if (pathname === "/vault" || pathname.startsWith("/vault/")) return "vault";
  return null;
}

export function destinationHrefForSession(href: string, signedIn: boolean, preview = false): string {
  if (href === "/" || href === "/home") {
    if (preview) return "/app-preview";
    return signedIn ? "/home" : "/";
  }
  if (href === "/progress") {
    if (preview) return "/app-preview/happened";
    if (!signedIn) return "/auth?next=/progress";
    return "/progress";
  }
  if (href === "/create" && preview) return "/app-preview/create";
  return href;
}
