import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Target,
  Sparkles,
  MapPin,
  Users,
  Calendar,
  ArrowRight,
  Flame,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Filter,
  Layers,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CURATED_KINGSTON_MOMENTS } from "@/lib/curated-radar";

export function BrandOpportunityRadar() {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("all");
  const [sponsoredMoments, setSponsoredMoments] = useState<string[]>([]);

  const handleSponsor = (momentTitle: string, momentId: string) => {
    setSponsoredMoments((prev) => [...prev, momentId]);
    toast({
      title: "Sponsorship Offer Dispatched! 🎯",
      description: `Dispatched brand offer to '${momentTitle}'. Host notified for escrow lock.`,
    });
  };

  const opportunities = [
    {
      id: "opp-1",
      title: "Kingston Creative Art & Mural Walk",
      host: "Downtown Kingston Arts District",
      venue: "Water Lane, Downtown Kingston",
      category: "Art & Culture",
      expectedAttendance: 450,
      fitScore: 98,
      matchReasons: ["High Gen-Z Demographic", "High Instagram Reel Velocity", "Downtown Footfall Anchor"],
      sponsorshipTier: "$1,200 (Stage & Perk Partner)",
      date: "This Saturday, 4:00 PM",
      image: "/assets/moments/street-art.jpg",
    },
    {
      id: "opp-2",
      title: "Kingston Sunset Acoustic & Food Truck Stage",
      host: "Dub Club & Echoes Lounge",
      venue: "Skyline Drive, Kingston",
      category: "Music & Dining",
      expectedAttendance: 320,
      fitScore: 94,
      matchReasons: ["Culinary Pairing Opportunity", "Sunset Photography Reach", "High Creator Concentration"],
      sponsorshipTier: "$850 (Exclusive Welcome Perk)",
      date: "Sunday, 5:30 PM",
      image: "/assets/moments/sunset-photo.jpg",
    },
    {
      id: "opp-3",
      title: "Kingston Tech & Creators Brunch",
      host: "Kingston Tech Collective",
      venue: "Hope Road Innovation Hub",
      category: "Community & Tech",
      expectedAttendance: 180,
      fitScore: 91,
      matchReasons: ["High-Income Explorer Segment", "High App Check-in Propensity", "B2B Brand Lift"],
      sponsorshipTier: "$600 (Perk & Key Drop Sponsor)",
      date: "Next Thursday, 10:00 AM",
      image: "/assets/moments/coffee-code.jpg",
    },
  ];

  const filteredOpportunities = opportunities.filter((opp) => {
    if (activeCategory === "all") return true;
    return opp.category.toLowerCase().includes(activeCategory.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Simple Finder */}
      <div className="p-6 rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-black to-black backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-black font-black shadow-lg shadow-primary/20 shrink-0">
            <Target className="h-7 w-7 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">Find Events & Places to Sponsor</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-[10px] font-extrabold uppercase">
                Curated Opportunities
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              Connect your brand with popular local festivals, art walks, dining hubs, and concerts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/60">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Recommended for Your Brand</span>
        </div>
      </div>

      {/* 2. Category Filter Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: "All Opportunities" },
          { id: "art", label: "Art & Culture" },
          { id: "music", label: "Music & Dining" },
          { id: "tech", label: "Community & Tech" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition shrink-0 ${
              activeCategory === tab.id
                ? "bg-primary text-black shadow-md shadow-primary/20"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Opportunities Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {filteredOpportunities.map((opp) => {
          const isSponsored = sponsoredMoments.includes(opp.id);

          return (
            <div
              key={opp.id}
              className="rounded-3xl border border-white/10 bg-[#0e1015] overflow-hidden group hover:border-primary/40 transition-all duration-300 shadow-xl flex flex-col justify-between"
            >
              {/* Photo & Fit Score Badge */}
              <div className="relative h-44 w-full overflow-hidden bg-black">
                <img
                  src={opp.image}
                  alt={opp.title}
                  className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e1015] via-black/40 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary text-black font-black text-[10px] uppercase tracking-wider shadow-md">
                    {opp.fitScore}% Fit Match
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-[10px]">
                    {opp.category}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-lg font-black text-white group-hover:text-primary transition leading-tight line-clamp-1">
                    {opp.title}
                  </h3>
                  <p className="text-xs text-white/70 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-primary shrink-0" />
                    <span className="truncate">{opp.venue}</span>
                  </p>
                </div>
              </div>

              {/* Body: Match Signals & Details */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between text-xs text-white/70 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <span>~{opp.expectedAttendance} Attendees</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    <span>{opp.date}</span>
                  </div>
                </div>

                {/* 3 Match Signals */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                    Why It Matches Your Brand:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {opp.matchReasons.map((reason, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-semibold"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sponsorship Slot & Trigger */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-white/40">Sponsor Tier</p>
                    <p className="text-xs font-black text-white">{opp.sponsorshipTier}</p>
                  </div>

                  {isSponsored ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Offer Sent
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleSponsor(opp.title, opp.id)}
                      className="h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-black font-extrabold text-xs shadow-md"
                    >
                      <DollarSign className="h-3.5 w-3.5 mr-1" />
                      Sponsor Slot
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BrandOpportunityRadar;
