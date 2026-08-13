import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const META_PIXEL_ID = "1016273502380998";
const META_PIXEL_SRC = "https://connect.facebook.net/en_US/fbevents.js";

type MetaPixelFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded: boolean;
  push: MetaPixelFunction;
  version: string;
};

declare global {
  interface Window {
    fbq?: MetaPixelFunction;
    _fbq?: MetaPixelFunction;
  }
}

const initializeMetaPixel = () => {
  if (window.fbq) return window.fbq;

  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
    } else {
      fbq.queue.push(args);
    }
  } as MetaPixelFunction;

  window.fbq = fbq;
  window._fbq = fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];

  const script = document.createElement("script");
  script.async = true;
  script.src = META_PIXEL_SRC;
  script.dataset.metaPixel = META_PIXEL_ID;
  document.head.appendChild(script);

  fbq("init", META_PIXEL_ID);
  return fbq;
};

export default function MetaPixel() {
  const location = useLocation();
  const lastTrackedLocation = useRef<string | null>(null);

  useEffect(() => {
    const currentLocation = `${location.pathname}${location.search}`;
    if (lastTrackedLocation.current === currentLocation) return;

    const fbq = initializeMetaPixel();
    fbq("track", "PageView");
    lastTrackedLocation.current = currentLocation;
  }, [location.pathname, location.search]);

  return null;
}
