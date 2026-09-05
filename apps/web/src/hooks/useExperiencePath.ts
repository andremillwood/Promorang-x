import { useLocation } from "react-router-dom";

const PREVIEW_PATHS = new Set(["/people", "/give", "/create", "/earn", "/happened", "/card", "/start", "/stock"]);

export function useExperiencePath() {
  const location = useLocation();
  const preview = location.pathname.startsWith("/app-preview");
  return (path: string) => {
    if (!preview) return path;
    const pathname = path.split("?")[0];
    if (pathname === "/dashboard" || pathname === "/home") return "/app-preview";
    if (PREVIEW_PATHS.has(pathname)) return `/app-preview${path}`;
    return path;
  };
}
