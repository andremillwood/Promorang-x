import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  MapPin,
  Search,
  Building2,
  Compass,
} from "lucide-react";
import { VERIFIED_VENUES, VenueItem } from "@/data/venuesData";
import { SwipeRail } from "@/components/ui/SwipeRail";

interface SmartVenuePickerProps {
  selectedVenueName: string;
  selectedAddress: string;
  onSelectVenue: (venue: {
    id: string;
    name: string;
    location: string;
    latitude: number;
    longitude: number;
    capacity: number;
  }) => void;
  onManualNameChange?: (name: string) => void;
  onManualAddressChange?: (address: string) => void;
}

export const SmartVenuePicker: React.FC<SmartVenuePickerProps> = ({
  selectedVenueName,
  selectedAddress,
  onSelectVenue,
  onManualNameChange,
  onManualAddressChange,
}) => {
  const [searchTerm, setSearchTerm] = useState(selectedVenueName || "");
  const [isOpen, setIsOpen] = useState(false);
  const [activeVibeFilter, setActiveVibeFilter] = useState<string>("all");
  const [showExploreGallery, setShowExploreGallery] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal search term when parent changes
  useEffect(() => {
    setSearchTerm(selectedVenueName);
  }, [selectedVenueName]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSuggestions = useMemo(() => {
    if (!searchTerm.trim()) {
      return VERIFIED_VENUES.slice(0, 5);
    }
    const query = searchTerm.toLowerCase();
    return VERIFIED_VENUES.filter(
      (v) =>
        v.name.toLowerCase().includes(query) ||
        v.neighborhood.toLowerCase().includes(query) ||
        v.location.toLowerCase().includes(query) ||
        v.vibe.toLowerCase().includes(query)
    );
  }, [searchTerm]);

  const galleryVenues = useMemo(() => {
    if (activeVibeFilter === "all") return VERIFIED_VENUES;
    return VERIFIED_VENUES.filter((v) => v.venue_type === activeVibeFilter);
  }, [activeVibeFilter]);

  const handlePick = (venue: VenueItem) => {
    setSearchTerm(venue.name);
    setIsOpen(false);
    setShowExploreGallery(false);
    onSelectVenue({
      id: venue.id,
      name: venue.name,
      location: venue.location,
      latitude: venue.latitude,
      longitude: venue.longitude,
      capacity: venue.capacity,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    setIsOpen(true);
    onManualNameChange?.(val);
  };

  return (
    <div ref={containerRef} className="space-y-4">
      {/* 1. Smart Autosuggest Search Input */}
      <div className="space-y-1.5 relative">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white/80 flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-primary" />
            <span>Venue or Space Name *</span>
          </label>
          <button
            type="button"
            onClick={() => setShowExploreGallery((prev) => !prev)}
            className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
          >
            <Compass className="h-3 w-3" />
            <span>{showExploreGallery ? "Hide Venue Explorer" : "Need Inspiration? Explore Venues"}</span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            placeholder="Type any venue name (e.g. Dub Club, PriceSmart, Sweetwood, Plantation)..."
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            className="w-full rounded-2xl bg-white/5 border border-white/10 pl-10 pr-10 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-primary transition h-11"
            required
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                onManualNameChange?.("");
                setIsOpen(true);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs font-bold"
            >
              &times;
            </button>
          )}
        </div>

        {/* Live Autosuggest Dropdown */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-white/15 bg-[#14151a] shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="p-2.5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between text-[10px] text-white/50 font-bold uppercase tracking-wider">
              <span>Verified Partner Venues ({filteredSuggestions.length})</span>
              <span>1-Tap Auto-Fills Address & Capacity</span>
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-white/5">
              {filteredSuggestions.length === 0 ? (
                <div className="p-4 text-center text-xs text-white/50">
                  <p>No verified venues matching "{searchTerm}".</p>
                  <p className="text-[11px] text-primary mt-1">You can proceed with this custom venue name below.</p>
                </div>
              ) : (
                filteredSuggestions.map((venue) => (
                  <button
                    key={venue.id}
                    type="button"
                    onClick={() => handlePick(venue)}
                    className="w-full p-3 hover:bg-white/5 text-left flex items-start gap-3 transition group"
                  >
                    <img
                      src={venue.image_url}
                      alt={venue.name}
                      className="h-11 w-11 rounded-xl object-cover shrink-0 border border-white/10"
                    />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-white group-hover:text-primary transition truncate">
                          {venue.name}
                        </p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                          Cap: {venue.capacity}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/50 flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 text-primary shrink-0" />
                        <span>{venue.location}</span>
                      </p>
                      <p className="text-[10px] text-white/40 truncate">{venue.vibe}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Visual "Explore & Discover Venues" Gallery for Undecided Hosts */}
      {showExploreGallery && (
        <div className="p-4 sm:p-5 rounded-3xl border border-primary/30 bg-white/[0.02] space-y-4 animate-in fade-in-50 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-primary" />
                <span>Explore Verified Spaces in Jamaica</span>
              </h4>
              <p className="text-[11px] text-white/50">Pick any space to auto-fill its address, coordinates, and door capacity.</p>
            </div>

            {/* Vibe Category Pills */}
            <SwipeRail compact fadeFrom="from-black" showDots={false} showChevrons={false} scrollerClassName="items-center gap-1.5 pb-1">
              {[
                { id: "all", label: "All Vibe Types" },
                { id: "soundstage", label: "🎵 Soundstages" },
                { id: "culinary", label: "🍹 Dining & Tasting" },
                { id: "rooftop", label: "👑 Rooftops & Lounges" },
                { id: "beach", label: "🌴 Beachfront" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setActiveVibeFilter(pill.id)}
                  aria-selected={activeVibeFilter === pill.id}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition shrink-0 snap-start ${
                    activeVibeFilter === pill.id
                      ? "bg-primary text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </SwipeRail>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {galleryVenues.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => handlePick(v)}
                className="group relative rounded-2xl overflow-hidden border border-white/10 bg-[#121316] text-left hover:border-primary/40 hover:scale-[1.02] transition duration-200 flex flex-col justify-between h-40"
              >
                <img
                  src={v.image_url}
                  alt={v.name}
                  className="absolute inset-0 h-full w-full object-cover opacity-40 group-hover:opacity-60 transition"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                <div className="relative z-10 p-2.5 flex justify-between items-start">
                  <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-bold text-primary border border-primary/20">
                    {v.venue_type_label}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-black/60 text-[9px] font-bold text-white/80">
                    {v.capacity} pax
                  </span>
                </div>

                <div className="relative z-10 p-3 space-y-0.5">
                  <p className="text-xs font-black text-white group-hover:text-primary transition truncate">
                    {v.name}
                  </p>
                  <p className="text-[10px] text-white/60 flex items-center gap-1 truncate">
                    <MapPin className="h-2.5 w-2.5 text-primary shrink-0" />
                    <span>{v.neighborhood}</span>
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Address & Location Field (Auto-Populated) */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-white/80 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span>Street Address & Coordinates *</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Skyline Dr, Jack's Hill, Kingston"
          value={selectedAddress}
          onChange={(e) => onManualAddressChange?.(e.target.value)}
          className="w-full rounded-2xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-primary transition h-11"
          required
        />
      </div>
    </div>
  );
};
export default SmartVenuePicker;
