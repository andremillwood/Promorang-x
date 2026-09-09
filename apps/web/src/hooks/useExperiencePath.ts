import { useLocation } from "react-router-dom";

const PREVIEW_PATHS = new Set([
  "/people",
  "/give",
  "/create",
  "/create/moment",
  "/earn",
  "/happened",
  "/progress",
  "/card",
  "/crews",
  "/guilds",
  "/start",
  "/stock",
]);

export function experiencePathFor(currentPathname: string, currentSearch: string, path: string): string {
  const preview = currentPathname.startsWith("/app-preview");
  const role = new URLSearchParams(currentSearch.startsWith("?") ? currentSearch.slice(1) : currentSearch).get("role");
  if (!preview) return path;

  const [pathname, existingQuery = ""] = path.split("?");
  const params = new URLSearchParams(existingQuery);
  if (role && !params.has("role")) params.set("role", role);
  const qs = params.toString();
  const suffix = qs ? `?${qs}` : "";

  if (pathname === "/dashboard" || pathname === "/home") return `/app-preview${suffix}`;
  if (PREVIEW_PATHS.has(pathname)) return `/app-preview${pathname}${suffix}`;
  return `${pathname}${suffix}`;
}

export function useExperiencePath() {
  const location = useLocation();
  return (path: string) => experiencePathFor(location.pathname, location.search, path);
}
