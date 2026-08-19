import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { captureGrowthAttribution, flushGrowthAfterAuth, trackGrowthEvent, trackStoredReferralClick } from "@/lib/marketing-attribution";

export default function GrowthTracker() {
  const location = useLocation();
  const { user, loading } = useAuth();
  const lastPath = useRef("");

  useEffect(() => {
    captureGrowthAttribution();
  }, []);

  useEffect(() => {
    const path = `${location.pathname}${location.search}`;
    if (lastPath.current === path) return;
    lastPath.current = path;
    void trackStoredReferralClick();
    void trackGrowthEvent({
      eventName: "page_view",
      journey: location.pathname.startsWith("/for-brands") || location.pathname.startsWith("/for-communities") ? "commercial" : "participant",
      stage: "acquired",
      entityType: "route",
      entityId: location.pathname,
      properties: { search: location.search },
    });
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!loading && user) void flushGrowthAfterAuth();
  }, [loading, user]);

  return null;
}
