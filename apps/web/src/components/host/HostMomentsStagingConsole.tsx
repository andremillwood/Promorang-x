import React from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Plus,
  MapPin,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  Share2,
  ExternalLink,
  DollarSign,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHostedMoments } from "@/hooks/useMoments";
import { CURATED_KINGSTON_MOMENTS } from "@/lib/curated-radar";

export function HostMomentsStagingConsole() {
  const { data: rawHosted = [], isLoading } = useHostedMoments();

  const moments = rawHosted.length > 0 ? rawHosted : [
    {
      id: "curated-1",
      title: "Kingston Sunset Acoustic & Food Truck Stage",
      description: "Live roots reggae acoustics, artisan street bites, and sunset photo sessions overlooking the city.",
      venue_name: "Skyline Drive Terrace",
      location: "Skyline Drive, Kingston",
      starts_at: new Date(Date.now() + 86400000).toISOString(),
      participant_count: 85,
      capacity: 120,
      reward: "150 Points + 1 PromoKey",
      image_url: "/assets/moments/sunset-photo.jpg",
      is_active: true,
      category: "Music & Sunset",
    },
    {
      id: "curated-2",
      title: "Downtown Street Art & Craft Cocktail Walk",
      description: "Guided mural showcase through Water Lane ending with artisan rum cocktails and DJ set.",
      venue_name: "Water Lane Arts District",
      location: "Downtown Kingston",
      starts_at: new Date(Date.now() + 172800000).toISOString(),
      participant_count: 64,
      capacity: 90,
      reward: "200 Points",
      image_url: "/assets/moments/street-art.jpg",
      is_active: true,
      category: "Art & Nightlife",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header & Stage Identity */}
      <div className="p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-black to-black backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/20 shrink-0">
            <Calendar className="h-7 w-7 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">Live Moments & Stage Lineup</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-extrabold uppercase">
                {moments.length} Staged Stages
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              Publish gatherings, manage RSVP capacity, configure door rewards, and broadcast sub-moments.
            </p>
          </div>
        </div>

        <Button
          asChild
          className="h-11 px-5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20"
        >
          <Link to="/create/moment">
            <Plus className="h-4 w-4 mr-1.5" />
            Stage New Moment
          </Link>
        </Button>
      </div>

      {/* 2. Moments Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {moments.map((moment: any) => {
          const capacity = moment.capacity || 100;
          const rsvps = moment.participant_count || 45;
          const occupancy = Math.min(100, Math.round((rsvps / capacity) * 100));

          return (
            <div
              key={moment.id}
              className="rounded-3xl border border-white/10 bg-[#0e1015] overflow-hidden group hover:border-amber-500/40 transition-all duration-300 shadow-xl flex flex-col justify-between"
            >
              {/* Photo & Header */}
              <div className="relative h-48 w-full overflow-hidden bg-black">
                <img
                  src={moment.image_url || "/assets/moments/sunset-photo.jpg"}
                  alt={moment.title}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e1015] via-black/40 to-transparent" />

                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-black font-black text-[10px] uppercase tracking-wider shadow-md">
                    {moment.category || "Live Moment"}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-[10px] flex items-center gap-1">
                    <Clock className="h-3 w-3 text-amber-400" />
                    {new Date(moment.starts_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-black text-white group-hover:text-amber-300 transition leading-tight">
                    {moment.title}
                  </h3>
                  <p className="text-xs text-white/70 flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{moment.venue_name || moment.location}</span>
                  </p>
                </div>
              </div>

              {/* Body & Capacity Dials */}
              <div className="p-6 space-y-5">
                <p className="text-xs text-white/70 line-clamp-2">
                  {moment.description}
                </p>

                {/* RSVP Capacity Progress Meter */}
                <div className="space-y-1.5 p-3.5 rounded-2xl bg-black/40 border border-white/5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-white/60">Stage Capacity / RSVPs</span>
                    <span className="text-white font-mono font-bold">
                      {rsvps} / {capacity} Guests ({occupancy}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                      style={{ width: `${occupancy}%` }}
                    />
                  </div>
                </div>

                {/* Reward & Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
                  <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                    Reward: {moment.reward}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-9 px-3 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xs"
                    >
                      <Link to={`/moments/${moment.id}`}>
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        Preview
                      </Link>
                    </Button>

                    <Button
                      asChild
                      size="sm"
                      className="h-9 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-xs"
                    >
                      <Link to={`/dashboard/moments/${moment.id}`}>
                        <span>Stage Controls</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HostMomentsStagingConsole;
