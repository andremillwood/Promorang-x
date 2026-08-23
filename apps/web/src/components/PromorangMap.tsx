import React, { useState, useEffect } from 'react';
import { APIProvider, Map, Marker, InfoWindow } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, ExternalLink, Compass } from 'lucide-react';

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

const DEFAULT_CENTER = { lat: 18.0179, lng: -76.8099 }; // Kingston fallback

// High-contrast, CORS-safe dark map style for raster tiles
const DARK_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#18181b" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#18181b" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#a1a1aa" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f97316" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d4d4d8" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#1c2421" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4ade80" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#27272a" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#18181b" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#71717a" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#3f3f46" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#27272a" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#fdba74" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#27272a" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#fb923c" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#090d16" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#38bdf8" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#090d16" }],
  },
];

const PIN_PATH = "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z";

export const PromorangMap: React.FC<PromorangMapProps> = ({
  center = DEFAULT_CENTER,
  zoom = 13,
  markers = [],
  className = "w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative bg-[#09090b]",
  height = "320px",
  interactive = true,
  showCurrentLocationBtn = true,
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerItem | null>(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (center?.lat && center?.lng) {
      setMapCenter(center);
    }
  }, [center?.lat, center?.lng]);

  const handleGeolocate = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMapCenter({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
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
        style={{ height }}
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
    <div className={className} style={{ height }}>
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={mapCenter}
          center={mapCenter}
          defaultZoom={zoom}
          gestureHandling={interactive ? "greedy" : "none"}
          disableDefaultUI={!interactive}
          zoomControl={interactive}
          styles={DARK_MAP_STYLES}
          className="w-full h-full"
        >
          {/* User Location Button Overlay */}
          {showCurrentLocationBtn && (
            <button
              onClick={handleGeolocate}
              disabled={isLocating}
              type="button"
              className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-white hover:bg-black hover:text-[#ff5500] transition shadow-lg disabled:opacity-50"
              title="Center on my location"
            >
              <Compass className={`h-5 w-5 ${isLocating ? 'animate-spin text-[#ff5500]' : ''}`} />
            </button>
          )}

          {/* Primary Center Marker if no specific markers passed */}
          {markers.length === 0 && (
            <Marker
              position={mapCenter}
              icon={{
                path: PIN_PATH,
                fillColor: "#ff5500",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 1.5,
                scale: 1.6,
                anchor: { x: 12, y: 22 } as google.maps.Point,
              }}
            />
          )}

          {/* Dynamic Markers */}
          {markers.map((marker) => {
            const isSelected = selectedMarker?.id === marker.id;
            return (
              <Marker
                key={marker.id}
                position={{ lat: marker.lat, lng: marker.lng }}
                onClick={() => setSelectedMarker(marker)}
                title={marker.title}
                icon={{
                  path: PIN_PATH,
                  fillColor: isSelected ? "#22c55e" : "#ff5500",
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 1.5,
                  scale: isSelected ? 1.9 : 1.6,
                  anchor: { x: 12, y: 22 } as google.maps.Point,
                }}
              />
            );
          })}

          {/* Info Window */}
          {selectedMarker && (
            <InfoWindow
              position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-2.5 max-w-xs space-y-2 text-zinc-900">
                {selectedMarker.category && (
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-100 text-orange-700">
                    {selectedMarker.category}
                  </span>
                )}
                <h4 className="font-bold text-sm text-zinc-900 leading-tight">{selectedMarker.title}</h4>
                {selectedMarker.subtitle && (
                  <p className="text-xs text-zinc-600">{selectedMarker.subtitle}</p>
                )}
                {selectedMarker.reward && (
                  <p className="text-xs font-bold text-emerald-600">🏆 {selectedMarker.reward}</p>
                )}
                <div className="flex items-center gap-3 pt-1 border-t border-zinc-200">
                  <a
                    href={`/moments/${selectedMarker.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:underline"
                  >
                    View Details & RSVP →
                  </a>
                  <a
                    href={`https://maps.google.com/?q=${selectedMarker.lat},${selectedMarker.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:underline"
                  >
                    Directions <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
};
