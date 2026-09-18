import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, Compass, MapPin, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type PublicVenue = Tables<"view_public_venue_directory"> & {
  listing_status?: "claimed" | "unclaimed" | null;
};

type SelectedVenue = {
  id: string;
  name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  capacity: number | null;
};

interface SmartVenuePickerProps {
  selectedVenueName: string;
  selectedAddress: string;
  onSelectVenue: (venue: SelectedVenue) => void;
  onManualNameChange?: (name: string) => void;
  onManualAddressChange?: (address: string) => void;
}

function firstImage(images: unknown): string | null {
  if (!images) return null;
  let value = images;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return value.startsWith("http") ? value : null;
    }
  }
  if (!Array.isArray(value)) return null;
  for (const item of value) {
    if (typeof item === "string" && item.startsWith("http")) return item;
    if (item && typeof item === "object") {
      const record = item as Record<string, unknown>;
      const candidate = String(record.url || record.src || "");
      if (candidate.startsWith("http")) return candidate;
    }
  }
  return null;
}

function venueLocation(venue: PublicVenue): string {
  return String(
    venue.address ||
      venue.location ||
      [venue.city, venue.country].filter(Boolean).join(", "),
  ).trim();
}

function venueLabel(venue: PublicVenue): string {
  if (venue.verification_status === "verified") return "Verified record";
  if (venue.listing_status === "claimed") return "Claimed record";
  return "Directory record";
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
  const [activeType, setActiveType] = useState("all");
  const [showExploreGallery, setShowExploreGallery] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const venuesQuery = useQuery({
    queryKey: ["create-moment-public-venue-directory"],
    queryFn: async (): Promise<PublicVenue[]> => {
      const { data, error } = await (supabase as any)
        .from("view_public_venue_directory")
        .select("*")
        .order("popularity_score", { ascending: false, nullsFirst: false })
        .limit(80);
      if (error) throw error;
      return ((data || []) as PublicVenue[]).filter((venue) => Boolean(venue.id && venue.name));
    },
    staleTime: 60_000,
  });

  const directoryVenues = venuesQuery.data || [];

  useEffect(() => {
    setSearchTerm(selectedVenueName);
  }, [selectedVenueName]);

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
    const query = searchTerm.trim().toLowerCase();
    const rows = query
      ? directoryVenues.filter((venue) =>
          [venue.name, venue.city, venue.address, venue.location, venue.venue_type]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query)),
        )
      : directoryVenues;
    return rows.slice(0, 8);
  }, [directoryVenues, searchTerm]);

  const galleryVenues = useMemo(() => {
    if (activeType === "all") return directoryVenues.slice(0, 16);
    return directoryVenues.filter((venue) => venue.venue_type === activeType).slice(0, 16);
  }, [activeType, directoryVenues]);

  const handlePick = (venue: PublicVenue) => {
    const name = String(venue.name || "").trim();
    if (!venue.id || !name) return;
    setSearchTerm(name);
    setIsOpen(false);
    setShowExploreGallery(false);
    onSelectVenue({
      id: venue.id,
      name,
      location: venueLocation(venue),
      latitude: null,
      longitude: null,
      capacity: null,
    });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    setIsOpen(true);
    onManualNameChange?.(value);
  };

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="relative space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-1.5 text-xs font-bold text-white/80">
            <Building2 className="h-3.5 w-3.5 text-primary" />
            <span>Venue or space name *</span>
          </label>
          <button
            type="button"
            onClick={() => setShowExploreGallery((previous) => !previous)}
            className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
          >
            <Compass className="h-3 w-3" />
            <span>{showExploreGallery ? "Hide venue directory" : "Browse recorded venues"}</span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search the recorded venue directory or type a custom venue"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-xs text-white placeholder-white/40 transition focus:border-primary focus:outline-none"
            required
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                onManualNameChange?.("");
                setIsOpen(true);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-white/40 hover:text-white"
            >
              &times;
            </button>
          ) : null}
        </div>

        {isOpen ? (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-white/15 bg-[#14151a] shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] p-2.5 text-[10px] font-bold uppercase tracking-wider text-white/50">
              <span>Recorded venue directory</span>
              <span>No capacity or coordinates are inferred</span>
            </div>
            <div className="max-h-64 divide-y divide-white/5 overflow-y-auto">
              {venuesQuery.isLoading ? (
                <div className="p-4 text-center text-xs text-white/50">Loading recorded venues…</div>
              ) : venuesQuery.isError ? (
                <div className="p-4 text-center text-xs leading-5 text-amber-100/70">
                  Venue directory is unavailable. You can still enter a venue and address manually.
                </div>
              ) : filteredSuggestions.length === 0 ? (
                <div className="p-4 text-center text-xs text-white/50">
                  <p>No recorded venue matches “{searchTerm}”.</p>
                  <p className="mt-1 text-[11px] text-primary">Continue with the custom venue name and address below.</p>
                </div>
              ) : (
                filteredSuggestions.map((venue) => {
                  const imageUrl = firstImage(venue.images);
                  return (
                    <button
                      key={String(venue.id)}
                      type="button"
                      onClick={() => handlePick(venue)}
                      className="group flex w-full items-start gap-3 p-3 text-left transition hover:bg-white/5"
                    >
                      {imageUrl ? (
                        <img src={imageUrl} alt="" className="h-11 w-11 shrink-0 rounded-xl border border-white/10 object-cover" />
                      ) : (
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04]">
                          <Building2 className="h-4 w-4 text-white/30" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-xs font-bold text-white transition group-hover:text-primary">{venue.name}</p>
                          <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[9px] font-bold text-white/50">
                            {venueLabel(venue)}
                          </span>
                        </div>
                        <p className="flex items-center gap-1 truncate text-[11px] text-white/50">
                          <MapPin className="h-3 w-3 shrink-0 text-primary" />
                          <span>{venueLocation(venue) || "Location not recorded"}</span>
                        </p>
                        <p className="truncate text-[10px] text-white/35">
                          {venue.venue_type || "Venue"} · {venue.city || venue.country || "Location not recorded"}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ) : null}
      </div>

      {showExploreGallery ? (
        <div className="space-y-4 rounded-3xl border border-primary/30 bg-white/[0.02] p-4 sm:p-5">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h4 className="flex items-center gap-1.5 text-sm font-black text-white">
                <Compass className="h-4 w-4 text-primary" />
                <span>Browse recorded venues</span>
              </h4>
              <p className="mt-1 text-[11px] text-white/50">
                These are directory records. Selecting one fills recorded identity/location only; capacity and coordinates remain unset.
              </p>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: "all", label: "All" },
                { id: "restaurant", label: "Restaurants" },
                { id: "bar", label: "Bars" },
                { id: "cafe", label: "Cafes" },
                { id: "retail", label: "Retail" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setActiveType(pill.id)}
                  className={`shrink-0 rounded-xl px-2.5 py-1 text-[11px] font-bold transition ${
                    activeType === pill.id
                      ? "bg-primary text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {venuesQuery.isError ? (
            <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] p-4 text-xs leading-5 text-amber-100/70">
              The venue directory could not be loaded. Manual venue entry remains available.
            </div>
          ) : galleryVenues.length ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {galleryVenues.map((venue) => {
                const imageUrl = firstImage(venue.images);
                return (
                  <button
                    key={String(venue.id)}
                    type="button"
                    onClick={() => handlePick(venue)}
                    className="group relative flex h-40 flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#121316] text-left transition duration-200 hover:border-primary/40"
                  >
                    {imageUrl ? (
                      <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40 transition group-hover:opacity-60" />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
                    <div className="relative z-10 flex items-start justify-between p-2.5">
                      <span className="rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[9px] font-bold text-white/70 backdrop-blur-md">
                        {venue.venue_type || "Venue"}
                      </span>
                      <span className="rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white/65">
                        {venueLabel(venue)}
                      </span>
                    </div>
                    <div className="relative z-10 space-y-0.5 p-3">
                      <p className="truncate text-xs font-black text-white transition group-hover:text-primary">{venue.name}</p>
                      <p className="flex items-center gap-1 truncate text-[10px] text-white/60">
                        <MapPin className="h-2.5 w-2.5 shrink-0 text-primary" />
                        <span>{venueLocation(venue) || "Location not recorded"}</span>
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/45">
              No recorded venue directory entries are available for this filter.
            </div>
          )}
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-bold text-white/80">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span>Street address or location *</span>
        </label>
        <input
          type="text"
          placeholder="Enter the location exactly as you want it recorded"
          value={selectedAddress}
          onChange={(event) => onManualAddressChange?.(event.target.value)}
          className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-white/40 transition focus:border-primary focus:outline-none"
          required
        />
      </div>
    </div>
  );
};

export default SmartVenuePicker;
