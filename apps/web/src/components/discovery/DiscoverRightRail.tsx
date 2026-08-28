import React from "react";
import { Link } from "react-router-dom";
import { Map, MapPin, Flame, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DiscoverRightRailProps {
  onToggleMap: () => void;
  isMapMode: boolean;
  cityName?: string;
  moments?: Array<{ id: string; title?: string; venue_name?: string | null; location?: string | null }>;
}

export const DiscoverRightRail: React.FC<DiscoverRightRailProps> = ({
  onToggleMap,
  isMapMode,
  cityName = "this hub",
  moments = [],
}) => {
  const trendingMoments = moments.slice(0, 3);

  return (
    <aside className="hidden lg:flex flex-col gap-5 w-80 shrink-0 sticky top-20 h-fit">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] via-[#121316] to-black p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
            <Map className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{cityName} Map</h3>
            <p className="text-[11px] text-white/50">Moments and perks in this hub</p>
          </div>
        </div>
        <p className="text-xs text-white/70 mb-4 leading-relaxed">
          Switch to map view to see what is happening around {cityName}.
        </p>
        <Button
          onClick={onToggleMap}
          className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs gap-1.5 shadow-[0_0_15px_rgba(255,106,0,0.3)]"
        >
          <Map className="h-3.5 w-3.5" />
          <span>{isMapMode ? "Show Grid View" : "Explore on Map"}</span>
        </Button>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#111215] p-5 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-amber-400 fill-amber-400" />
            <h3 className="text-sm font-bold text-white">Trending in {cityName}</h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 font-bold text-[10px]">
            Hot
          </span>
        </div>

        <div className="space-y-2.5 pt-1">
          {trendingMoments.map((m) => (
            <Link
              key={m.id}
              to={`/moments/${m.id}`}
              className="p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05] transition flex items-center justify-between group"
            >
              <div className="space-y-0.5 min-w-0 pr-2">
                <p className="text-xs font-bold text-white group-hover:text-primary transition truncate">
                  {m.title}
                </p>
                <p className="text-[11px] text-white/50 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-primary shrink-0" />
                  <span className="truncate">{m.venue_name || m.location || cityName}</span>
                </p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-white/30 group-hover:text-primary group-hover:translate-x-0.5 transition shrink-0" />
            </Link>
          ))}
          {trendingMoments.length === 0 && (
            <p className="text-xs text-white/45">No live Moments in {cityName} yet.</p>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 text-xs text-white/60 space-y-1">
        <div className="flex items-center gap-1.5 text-white font-bold">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>PromoShare Tip</span>
        </div>
        <p className="text-[11px] leading-relaxed text-white/50">
          Share any moment with friends to earn 50 Gems ($0.50) + 10% commission when they RSVP.
        </p>
      </div>
    </aside>
  );
};
