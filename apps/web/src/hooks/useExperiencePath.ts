import { useLocation } from "react-router-dom";

export function useExperiencePath() {
  const location = useLocation();
  const preview = location.pathname.startsWith("/app-preview");
  return (path: string) => {
    if (!preview) return path;
    if (path === "/dashboard" || path === "/home") return "/app-preview";
    return `/app-preview${path}`;
  };
}
