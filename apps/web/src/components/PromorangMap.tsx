import React, { useEffect, useRef, useState, useCallback } from "react";
import { Compass, MapPin } from "lucide-react";

export interface MapMarkerItem {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  category?: string;
  reward?: string;
  imageUrl?: string;
}

interface PromorangMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarkerItem[];
  className?: string;
  height?: string;
  interactive?: boolean;
  showCurrentLocationBtn?: boolean;
}

const DEFAULT_CENTER = { lat: 18.0179, lng: -76.8099 }; // Kingston, Jamaica

// Google Maps "Night" JSON style — works without mapId, zero CORS, zero cloud config
const DARK_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
];

/* ------------------------------------------------------------------ */
/*  Script loader — idempotent, callback-based, no importLibrary      */
/* ------------------------------------------------------------------ */
let mapsReady: Promise<void> | null = null;

const ensureGoogleMaps = (apiKey: string): Promise<void> => {
  if (mapsReady) return mapsReady;

  mapsReady = new Promise<void>((resolve, reject) => {
    // Already present (e.g. loaded by another component)
    if (window.google?.maps?.Map) {
      resolve();
      return;
    }

    // Callback approach — Google populates the global before calling it
    const cbName = "__promorangGMapsInit";
    (window as any)[cbName] = () => {
      delete (window as any)[cbName];
      resolve();
    };

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${apiKey}` +
      `&libraries=places,geometry` +
      `&callback=${cbName}` +
      `&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onerror = (e) => {
      mapsReady = null;
      reject(e);
    };
    document.head.appendChild(script);
  });

  return mapsReady;
};

/* ------------------------------------------------------------------ */
/*  SVG pin icon (data-uri, no external assets)                        */
/* ------------------------------------------------------------------ */
const PIN_SVG = (color: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="${color}" stroke="#fff" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="#fff"/></svg>`
  )}`;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export const PromorangMap: React.FC<PromorangMapProps> = ({
  center = DEFAULT_CENTER,
  zoom = 12,
  markers = [],
  className = "w-full h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative bg-[#09090b]",
  height = "600px",
  interactive = true,
  showCurrentLocationBtn = true,
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const gmMarkersRef = useRef<google.maps.Marker[]>([]);
  const infoRef = useRef<google.maps.InfoWindow | null>(null);
  const [ready, setReady] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  /* ---------- 1. Load SDK & create map ---------- */
  useEffect(() => {
    if (!containerRef.current || !apiKey) return;
    let cancelled = false;

    ensureGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !containerRef.current) return;

        const map = new google.maps.Map(containerRef.current, {
          center: {
            lat: center?.lat ?? DEFAULT_CENTER.lat,
            lng: center?.lng ?? DEFAULT_CENTER.lng,
          },
          zoom,
          styles: DARK_STYLE,
          disableDefaultUI: !interactive,
          zoomControl: interactive,
          mapTypeControl: interactive,
          streetViewControl: false,
          fullscreenControl: interactive,
          gestureHandling: interactive ? "greedy" : "none",
        });

        mapRef.current = map;
        setReady(true);
      })
      .catch((err) => console.error("Google Maps init failed:", err));

    return () => {
      cancelled = true;
    };
    // Only run once per mount — apiKey won't change at runtime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  /* ---------- 2. Pan when center prop changes ---------- */
  useEffect(() => {
    if (!mapRef.current || !center?.lat || !center?.lng) return;
    mapRef.current.panTo({ lat: center.lat, lng: center.lng });
  }, [center?.lat, center?.lng]);

  /* ---------- 3. Sync markers ---------- */
  useEffect(() => {
    if (!mapRef.current || !ready) return;
    const map = mapRef.current;

    // Clear old markers
    gmMarkersRef.current.forEach((m) => m.setMap(null));
    gmMarkersRef.current = [];

    const icon = {
      url: PIN_SVG("#ff5500"),
      scaledSize: new google.maps.Size(36, 36),
      anchor: new google.maps.Point(18, 33),
    };

    // Fallback single pin when no markers
    if (markers.length === 0 && center) {
      const m = new google.maps.Marker({
        position: { lat: center.lat, lng: center.lng },
        map,
        icon,
      });
      gmMarkersRef.current.push(m);
      return;
    }

    markers.forEach((item) => {
      const marker = new google.maps.Marker({
        position: { lat: item.lat, lng: item.lng },
        map,
        title: item.title,
        icon,
      });

      const html = `
<div style="padding:12px;min-width:220px;max-width:280px;font-family:system-ui,sans-serif;color:#18181b">
  ${item.category ? `<span style="display:inline-block;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;padding:2px 8px;border-radius:9999px;background:#ffedd5;color:#c2410c;margin-bottom:6px">${item.category}</span>` : ""}
  <h4 style="margin:0 0 4px;font-size:14px;font-weight:800;line-height:1.25;color:#09090b">${item.title}</h4>
  ${item.subtitle ? `<p style="margin:0 0 6px;font-size:11px;color:#52525b;line-height:1.3">${item.subtitle}</p>` : ""}
  ${item.reward ? `<p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#059669">🏆 ${item.reward}</p>` : ""}
  <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid #e4e4e7;padding-top:8px;margin-top:6px">
    <a href="/moments/${item.id}" style="font-size:11px;font-weight:800;color:#ff5500;text-decoration:none">View &amp; RSVP →</a>
    <a href="https://maps.google.com/?q=${item.lat},${item.lng}" target="_blank" rel="noopener noreferrer" style="font-size:10px;font-weight:600;color:#71717a;text-decoration:none">Directions ↗</a>
  </div>
</div>`;

      const iw = new google.maps.InfoWindow({ content: html });

      marker.addListener("click", () => {
        infoRef.current?.close();
        iw.open(map, marker);
        infoRef.current = iw;
      });

      gmMarkersRef.current.push(marker);
    });

    // Auto-fit bounds if we have multiple markers
    if (markers.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach((m) => {
        bounds.extend(new google.maps.LatLng(m.lat, m.lng));
      });
      map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
    } else if (markers.length === 1) {
      map.setCenter({ lat: markers[0].lat, lng: markers[0].lng });
      map.setZoom(zoom || 12);
    }
  }, [markers, ready, center, zoom]);

  /* ---------- 4. Geolocation ---------- */
  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation || !mapRef.current) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        mapRef.current?.setZoom(14);
        setIsLocating(false);
      },
      () => setIsLocating(false),
    );
  }, []);

  /* ---------- Render ---------- */
  if (!apiKey) {
    return (
      <div
        style={{ height, minHeight: "450px" }}
        className="flex flex-col items-center justify-center p-6 bg-zinc-900/80 rounded-3xl border border-white/10 text-center space-y-3"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-[#ff5500]">
          <MapPin className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-white">Google Maps API key not configured</p>
        <p className="text-xs text-white/50 max-w-xs">
          Add VITE_GOOGLE_MAPS_API_KEY to your environment settings to enable live interactive maps.
        </p>
      </div>
    );
  }

  return (
    <div className={className} style={{ height, minHeight: "450px" }}>
      {showCurrentLocationBtn && (
        <button
          onClick={handleGeolocate}
          disabled={isLocating}
          type="button"
          className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-white hover:bg-black hover:text-primary transition shadow-xl disabled:opacity-50"
          title="Center on my location"
        >
          <Compass className={`h-5 w-5 ${isLocating ? "animate-spin text-primary" : ""}`} />
        </button>
      )}

      <div
        ref={containerRef}
        className="w-full h-full relative"
        style={{ width: "100%", height: "100%", minHeight: "450px" }}
      />
    </div>
  );
};
