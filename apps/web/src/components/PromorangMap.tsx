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

// High-contrast, vibrant dark map style
const DARK_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }]
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }]
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }]
  }
];

const createSvgPinUrl = (color: string, size: number) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="#ffffff"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
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
                url: createSvgPinUrl("#ff5500", 34),
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
                  url: createSvgPinUrl(isSelected ? "#22c55e" : "#ff5500", isSelected ? 40 : 32),
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
