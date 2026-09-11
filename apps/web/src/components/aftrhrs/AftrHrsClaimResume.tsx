import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AFTRHRS_PATHS, isAftrHrsPassPath } from "@promorang/shared";
import { useAuth } from "@/contexts/AuthContext";
import { hasAftrHrsClaimPending } from "@/lib/aftrhrs-claim";

const HOLD_PATHS = ["/auth", "/post-login", "/reset-password"];

export function AftrHrsClaimResume() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user || !hasAftrHrsClaimPending()) return;
    const path = location.pathname;
    if (HOLD_PATHS.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) return;
    if (path === AFTRHRS_PATHS.landing || path === AFTRHRS_PATHS.moment || isAftrHrsPassPath(path)) return;
    navigate(AFTRHRS_PATHS.claimReturn, { replace: true });
  }, [loading, user, location.pathname, navigate]);

  return null;
}
