import { useLocation } from "react-router-dom";

export function useExperiencePath() {
  const location = useLocation();
  const preview = location.pathname.startsWith("/app-preview");
  return (path: string) => {
    if (!preview) return path;
    if (path === "/dashboard" || path === "/home") return "/app-preview";
    if (path === "/progress") return "/app-preview/happened";
    return `/app-preview${path}`;
  };
}
