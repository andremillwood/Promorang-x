import React, { useEffect, useRef, useState } from "react";
import { Compass, MapPin, ExternalLink } from "lucide-react";

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

const GOOGLE_DARK_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

const loadGoogleMapsScript = (apiKey: string): Promise<typeof google.maps> => {
  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  const existingScript = document.getElementById("google-maps-script") as HTMLScriptElement | null;
  if (existingScript) {
    return new Promise((resolve) => {
      if (window.google?.maps) {
        resolve(window.google.maps);
      } else {
        existingScript.addEventListener("load", () => resolve(window.google.maps));
      }
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,marker&loading=async&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error("Google Maps SDK not found on window"));
      }
    };
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
};

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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const activeMarkersRef = useRef<any[]>([]);
  const activeInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // 1. Initialize Google Map
  useEffect(() => {
    if (!mapContainerRef.current || !apiKey) return;

    let isMounted = true;

    loadGoogleMapsScript(apiKey)
      .then(async () => {
        if (!isMounted || !mapContainerRef.current) return;

        const { Map } = (await google.maps.importLibrary("maps")) as google.maps.MapsLibrary;

        if (!isMounted || !mapContainerRef.current) return;

        const map = new Map(mapContainerRef.current, {
          center: { lat: center?.lat ?? DEFAULT_CENTER.lat, lng: center?.lng ?? DEFAULT_CENTER.lng },
          zoom: zoom,
          mapId: "DEMO_MAP_ID",
          styles: GOOGLE_DARK_STYLES,
          disableDefaultUI: !interactive,
          zoomControl: interactive,
          mapTypeControl: interactive,
          streetViewControl: false,
          fullscreenControl: interactive,
          gestureHandling: interactive ? "greedy" : "none",
        });

        mapInstanceRef.current = map;
        setMapLoaded(true);
      })
      .catch((err) => {
        console.error("Google Maps load error:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [apiKey]);

  // 2. Sync Map Center and Zoom
  useEffect(() => {
    if (!mapInstanceRef.current || !center?.lat || !center?.lng) return;
    mapInstanceRef.current.panTo({ lat: center.lat, lng: center.lng });
  }, [center?.lat, center?.lng]);

  // 3. Render Google Maps Markers (using modern AdvancedMarkerElement)
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || !window.google?.maps) return;

    let isMounted = true;

    const renderMarkers = async () => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear previous markers
      activeMarkersRef.current.forEach((m) => {
        if (m.map) m.map = null;
        if (typeof m.setMap === "function") m.setMap(null);
      });
      activeMarkersRef.current = [];

      const createPinElement = (isSelected: boolean) => {
        const pinDiv = document.createElement("div");
        pinDiv.className = "promorang-map-pin-el";
        pinDiv.style.cursor = "pointer";
        pinDiv.innerHTML = `
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              position: absolute;
              width: 28px;
              height: 28px;
              background: ${isSelected ? "#22c55e" : "#ff5500"};
              border: 2.5px solid #ffffff;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 0 16px ${isSelected ? "rgba(34, 197, 94, 0.7)" : "rgba(255, 85, 0, 0.7)"}, 0 4px 10px rgba(0,0,0,0.6);
            "></div>
            <div style="
              position: absolute;
              width: 8px;
              height: 8px;
              background: #ffffff;
              border-radius: 50%;
              z-index: 2;
            "></div>
          </div>
        `;
        return pinDiv;
      };

      let AdvancedMarkerElement: any = null;
      try {
        const markerLib = (await google.maps.importLibrary("marker")) as any;
        AdvancedMarkerElement = markerLib?.AdvancedMarkerElement;
      } catch (e) {
        console.warn("AdvancedMarkerElement not available, using fallback", e);
      }

      if (!isMounted) return;

      if (markers.length === 0 && center) {
        if (AdvancedMarkerElement) {
          const fallbackMarker = new AdvancedMarkerElement({
            map,
            position: { lat: center.lat, lng: center.lng },
            content: createPinElement(false),
          });
          activeMarkersRef.current.push(fallbackMarker);
        } else {
          const fallbackMarker = new google.maps.Marker({
            position: { lat: center.lat, lng: center.lng },
            map,
          });
          activeMarkersRef.current.push(fallbackMarker);
        }
        return;
      }

      markers.forEach((m) => {
        let marker: any;

        if (AdvancedMarkerElement) {
          marker = new AdvancedMarkerElement({
            map,
            position: { lat: m.lat, lng: m.lng },
            title: m.title,
            content: createPinElement(false),
          });
        } else {
          marker = new google.maps.Marker({
            position: { lat: m.lat, lng: m.lng },
            map,
            title: m.title,
          });
        }

        const popupContent = `
          <div style="
            padding: 12px;
            min-width: 220px;
            max-width: 280px;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #18181b;
          ">
            ${m.category ? `
              <span style="
                display: inline-block;
                font-size: 9px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                padding: 2px 8px;
                border-radius: 9999px;
                background: #ffedd5;
                color: #c2410c;
                margin-bottom: 6px;
              ">${m.category}</span>
            ` : ''}
            <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 800; line-height: 1.25; color: #09090b;">
              ${m.title}
            </h4>
            ${m.subtitle ? `
              <p style="margin: 0 0 6px 0; font-size: 11px; color: #52525b; line-height: 1.3;">
                ${m.subtitle}
              </p>
            ` : ''}
            ${m.reward ? `
              <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; color: #059669;">
                🏆 ${m.reward}
              </p>
            ` : ''}
            <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #e4e4e7; padding-top: 8px; margin-top: 6px;">
              <a href="/moments/${m.id}" style="
                font-size: 11px;
                font-weight: 800;
                color: #ff5500;
                text-decoration: none;
              ">
                View & RSVP →
              </a>
              <a href="https://maps.google.com/?q=${m.lat},${m.lng}" target="_blank" rel="noopener noreferrer" style="
                font-size: 10px;
                font-weight: 600;
                color: #71717a;
                text-decoration: none;
              ">
                Directions ↗
              </a>
            </div>
          </div>
        `;

        const infoWindow = new google.maps.InfoWindow({
          content: popupContent,
        });

        marker.addListener("click", () => {
          if (activeInfoWindowRef.current) {
            activeInfoWindowRef.current.close();
          }
          if (AdvancedMarkerElement && marker instanceof AdvancedMarkerElement) {
            infoWindow.open({
              anchor: marker,
              map,
            });
          } else {
            infoWindow.open(map, marker);
          }
          activeInfoWindowRef.current = infoWindow;
        });

        activeMarkersRef.current.push(marker);
      });
    };

    renderMarkers();

    return () => {
      isMounted = false;
    };
  }, [markers, mapLoaded, center]);

  const handleGeolocate = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          mapInstanceRef.current?.panTo({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          mapInstanceRef.current?.setZoom(14);
          setIsLocating(false);
        },
        (err) => {
          console.warn("Geolocation error:", err);
          setIsLocating(false);
        }
      );
    }
  };

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
        <p className="text-xs text-white/50 max-w-xs">Add VITE_GOOGLE_MAPS_API_KEY to your environment settings to enable live interactive maps.</p>
      </div>
    );
  }

  return (
    <div className={className} style={{ height, minHeight: "450px" }}>
      {/* Geolocation Button Overlay */}
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

      {/* Google Maps DOM container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full relative" 
        style={{ width: "100%", height: "100%", minHeight: "450px" }}
      />
    </div>
  );
};
