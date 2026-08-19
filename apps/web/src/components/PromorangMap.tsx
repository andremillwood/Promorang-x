import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
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
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarkerItem[];
  className?: string;
  height?: string;
  interactive?: boolean;
  showCurrentLocationBtn?: boolean;
}

// Dark style map ID or custom styles
const DEFAULT_CENTER = { lat: 40.7128, lng: -74.0060 }; // NYC fallback

export const PromorangMap: React.FC<PromorangMapProps> = ({
  center = DEFAULT_CENTER,
  zoom = 14,
  markers = [],
  className = "w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative bg-[#09090b]",
  height = "320px",
  interactive = true,
  showCurrentLocationBtn = true,
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || "";
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerItem | null>(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [isLocating, setIsLocating] = useState(false);

  const handleGeolocate = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMapCenter({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
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
          mapId={mapId || undefined}
          className="w-full h-full"
          colorScheme="DARK"
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
            <AdvancedMarker position={mapCenter}>
              <Pin background="#ff5500" borderColor="#ffffff" glyphColor="#ffffff" />
            </AdvancedMarker>
          )}

          {/* Dynamic Markers */}
          {markers.map((marker) => (
            <AdvancedMarker
              key={marker.id}
              position={{ lat: marker.lat, lng: marker.lng }}
              onClick={() => setSelectedMarker(marker)}
            >
              <Pin 
                background={selectedMarker?.id === marker.id ? "#22c55e" : "#ff5500"} 
                borderColor="#ffffff" 
                glyphColor="#ffffff" 
              />
            </AdvancedMarker>
          ))}

          {/* Info Window */}
          {selectedMarker && (
            <InfoWindow
              position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-2 max-w-xs space-y-1.5 text-zinc-900">
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
                <a
                  href={`https://maps.google.com/?q=${selectedMarker.lat},${selectedMarker.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:underline pt-1"
                >
                  Get Directions <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
};
