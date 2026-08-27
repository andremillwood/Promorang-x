import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Store,
  MapPin,
  Plus,
  Star,
  Users,
  Calendar,
  Sparkles,
  ExternalLink,
  Edit3,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useMerchantVenues } from "@/hooks/useVenues";
import { useToast } from "@/hooks/use-toast";

export function MerchantVenueStudio({
  onOpenMoments,
}: {
  onOpenMoments?: () => void;
}) {
  const { toast } = useToast();
  const { data: rawVenues = [], isLoading } = useMerchantVenues();

  // Fallback demo venues if merchant has none yet
  const venues = rawVenues.length > 0 ? rawVenues : [
    {
      id: "venue-kgn-1",
      name: "The Kingston Culture Lounge & Cafe",
      location: "14 Hope Road, Kingston 6, Jamaica",
      address: "14 Hope Road, Kingston 6",
      city: "Kingston",
      is_active: true,
      rating: 4.9,
      image_url: "/assets/moments/coffee-code.jpg",
      capacity: 85,
      currentOccupancy: 42,
      activeMomentsCount: 2,
    },
    {
      id: "venue-kgn-2",
      name: "Harbour View Rooftop Terrace",
      location: "Ocean Boulevard, Downtown Kingston",
      address: "Ocean Boulevard, Downtown Kingston",
      city: "Kingston",
      is_active: true,
      rating: 4.8,
      image_url: "/assets/moments/sunset-photo.jpg",
      capacity: 150,
      currentOccupancy: 88,
      activeMomentsCount: 1,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header & Venue Ops Banner */}
      <div className="p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-black to-black backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-black font-black shadow-lg shadow-emerald-500/20 shrink-0">
            <Store className="h-7 w-7 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">Venue & Physical Spaces Studio</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold uppercase">
                {venues.length} Locations Linked
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              Manage operating status, on-site cultural drops, table QR signage, and capacity limits.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <Button
            asChild
            className="h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20"
          >
            <Link to="/dashboard/venues/add">
              <Plus className="h-4 w-4 mr-1.5" />
              Add New Location
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-10 px-4 rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-white font-bold text-xs"
          >
            <Link to="/create/moment">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
              Host On-Site Moment
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Venue Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {venues.map((venue: any) => (
          <div
            key={venue.id}
            className="rounded-3xl border border-white/10 bg-[#0e1015] overflow-hidden group hover:border-emerald-500/40 transition-all duration-300 shadow-xl flex flex-col justify-between"
          >
            {/* Top Photo & Status Header */}
            <div className="relative h-48 w-full overflow-hidden bg-black">
              <img
                src={venue.image_url || "/assets/moments/coffee-code.jpg"}
                alt={venue.name}
                className="w-full h-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e1015] via-black/40 to-transparent" />

              {/* Status Badges on Image */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500 text-black font-black text-[10px] uppercase tracking-wider shadow-md">
                  Active Venue
                </span>
                <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-[10px] flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                  {venue.rating || 4.9}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <h3 className="text-xl font-black text-white group-hover:text-emerald-400 transition leading-tight">
                    {venue.name}
                  </h3>
                  <p className="text-xs text-white/70 flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{venue.address || venue.location}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Venue Telemetry Body */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] font-bold uppercase text-white/50">Capacity</p>
                  <p className="text-lg font-black text-white">{venue.capacity || 80}</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] font-bold uppercase text-white/50">Live Occupancy</p>
                  <p className="text-lg font-black text-emerald-400">{venue.currentOccupancy || 35}</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] font-bold uppercase text-white/50">Linked Moments</p>
                  <p className="text-lg font-black text-amber-400">{venue.activeMomentsCount || 1}</p>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-white/5">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex-1"
                >
                  <Link to={`/moments?venue=${venue.id}`}>
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                    Scheduled Moments
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex-1"
                >
                  <Link to={`/discover/venues`}>
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    Public Page
                  </Link>
                </Button>

                <Button
                  asChild
                  size="sm"
                  className="h-9 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs"
                >
                  <Link to={`/create/moment`}>
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Drop Perk
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MerchantVenueStudio;
