import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { persistPostAuthNext } from "@/lib/post-auth-next";
import {
  publicObjectReturnPath,
  shouldCapturePublicObjectAuthReturn,
  type PublicObjectLocation,
} from "@/lib/public-object-continuity";

export default function RouteScrollManager() {
  const location = useLocation();
  const previousLocationRef = useRef<PublicObjectLocation>({
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
  });

  useEffect(() => {
    const nextLocation: PublicObjectLocation = {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    };
    const previousLocation = previousLocationRef.current;

    if (shouldCapturePublicObjectAuthReturn({ previous: previousLocation, next: nextLocation })) {
      persistPostAuthNext(publicObjectReturnPath(previousLocation));
    }

    previousLocationRef.current = nextLocation;
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    if (location.hash) return;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, [location.pathname, location.hash]);

  return null;
}
