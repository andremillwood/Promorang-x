import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Compass } from "lucide-react";

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

const createPinIcon = (isSelected: boolean) => {
  const bg = isSelected ? "#22c55e" : "#ff5500";
  const glow = isSelected ? "rgba(34, 197, 94, 0.6)" : "rgba(255, 85, 0, 0.6)";
  
  return L.divIcon({
    className: "promorang-map-pin",
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        <div style="
          position: absolute;
          width: 28px;
          height: 28px;
          background: ${bg};
          border: 2.5px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 0 16px ${glow}, 0 4px 10px rgba(0,0,0,0.6);
          transition: transform 0.2s ease;
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
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 30],
    popupAnchor: [0, -30],
  });
};

export const PromorangMap: React.FC<PromorangMapProps> = ({
  center = DEFAULT_CENTER,
  zoom = 12,
  markers = [],
  className = "w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative bg-[#09090b]",
  height = "320px",
  interactive = true,
  showCurrentLocationBtn = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // 1. Initialize Leaflet Map instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter: [number, number] = [
      center?.lat ?? DEFAULT_CENTER.lat,
      center?.lng ?? DEFAULT_CENTER.lng,
    ];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: zoom,
      zoomControl: false,
      dragging: interactive,
      touchZoom: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      attributionControl: false,
    });

    // Dark Matter high-contrast tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    if (interactive) {
      L.control.zoom({ position: "bottomright" }).addTo(map);
    }

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Trigger multiple invalidates to ensure tiles load during flex/transition rendering
    const t1 = setTimeout(() => map.invalidateSize(), 50);
    const t2 = setTimeout(() => map.invalidateSize(), 200);
    const t3 = setTimeout(() => map.invalidateSize(), 500);

    // ResizeObserver catches all container dimension changes
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // 2. Sync center and zoom when props change
  useEffect(() => {
    if (!mapInstanceRef.current || !center?.lat || !center?.lng) return;
    mapInstanceRef.current.setView([center.lat, center.lng], zoom, {
      animate: true,
    });
  }, [center?.lat, center?.lng, zoom]);

  // 3. Render dynamic markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (markers.length === 0 && center) {
      const fallbackMarker = L.marker([center.lat, center.lng], {
        icon: createPinIcon(false),
      });
      markersLayerRef.current.addLayer(fallbackMarker);
      return;
    }

    markers.forEach((m) => {
      const marker = L.marker([m.lat, m.lng], {
        icon: createPinIcon(false),
        title: m.title,
      });

      const popupContent = `
        <div style="
          padding: 14px 16px;
          min-width: 220px;
          max-width: 280px;
          background: #18181b;
          color: #ffffff;
          border-radius: 1.25rem;
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
              background: rgba(255, 85, 0, 0.15);
              color: #ff6a00;
              border: 1px solid rgba(255, 85, 0, 0.3);
              margin-bottom: 8px;
            ">${m.category}</span>
          ` : ''}
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 800; line-height: 1.25; color: #ffffff;">
            ${m.title}
          </h4>
          ${m.subtitle ? `
            <p style="margin: 0 0 6px 0; font-size: 11px; color: rgba(255,255,255,0.6); line-height: 1.3;">
              ${m.subtitle}
            </p>
          ` : ''}
          ${m.reward ? `
            <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: 700; color: #34d399;">
              🏆 ${m.reward}
            </p>
          ` : ''}
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; margin-top: 6px;">
            <a href="/moments/${m.id}" style="
              font-size: 11px;
              font-weight: 800;
              color: #ff6a00;
              text-decoration: none;
            ">
              View & RSVP →
            </a>
            <a href="https://maps.google.com/?q=${m.lat},${m.lng}" target="_blank" rel="noopener noreferrer" style="
              font-size: 10px;
              font-weight: 600;
              color: rgba(255,255,255,0.5);
              text-decoration: none;
            ">
              Directions ↗
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: "promorang-custom-leaflet-popup",
        closeButton: true,
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [markers, center]);

  const handleGeolocate = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          mapInstanceRef.current?.flyTo(
            [pos.coords.latitude, pos.coords.longitude],
            14,
            { duration: 1.2 }
          );
          setIsLocating(false);
        },
        (err) => {
          console.warn("Geolocation error:", err);
          setIsLocating(false);
        }
      );
    }
  };

  return (
    <div className={className} style={{ height }}>
      {/* Geolocation Button Overlay */}
      {showCurrentLocationBtn && (
        <button
          onClick={handleGeolocate}
          disabled={isLocating}
          type="button"
          className="absolute top-4 right-4 z-[400] flex h-10 w-10 items-center justify-center rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-white hover:bg-black hover:text-primary transition shadow-xl disabled:opacity-50"
          title="Center on my location"
        >
          <Compass className={`h-5 w-5 ${isLocating ? "animate-spin text-primary" : ""}`} />
        </button>
      )}

      {/* Leaflet DOM container */}
      <div ref={mapContainerRef} className="w-full h-full relative z-0" />
    </div>
  );
};
