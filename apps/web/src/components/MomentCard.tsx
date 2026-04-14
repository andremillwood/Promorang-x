import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark, MapPin, Calendar, Users, Clock, Flame, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

type Moment = Tables<"moments"> & {
  participant_count?: number;
  is_saved?: boolean;
  isExample?: boolean;
  host?: {
    full_name: string;
    avatar_url: string | null;
  };
};

interface MomentCardProps {
  moment: Moment;
  variant?: "default" | "compact" | "featured";
  showHost?: boolean;
  onSave?: (momentId: string) => void;
  className?: string;
}

// Random heights for Pinterest-style variation
const heightVariants = [
  "h-48",
  "h-56",
  "h-64",
  "h-72",
];

const categoryEmojis: Record<string, string> = {
  fitness: "🧘",
  food: "🍽️",
  music: "🎵",
  social: "🎉",
  workshop: "🎨",
  networking: "🤝",
  outdoor: "🌳",
  arts: "🎭",
};

const categoryGradients: Record<string, string> = {
  fitness: "from-emerald-400/20 to-teal-500/30",
  food: "from-amber-400/20 to-orange-500/30",
  music: "from-purple-400/20 to-pink-500/30",
  social: "from-rose-400/20 to-red-500/30",
  workshop: "from-blue-400/20 to-indigo-500/30",
  networking: "from-slate-400/20 to-gray-500/30",
  outdoor: "from-green-400/20 to-lime-500/30",
  arts: "from-fuchsia-400/20 to-violet-500/30",
};

/**
 * Pinterest/Airbnb-inspired Moment Card
 * Features: Visual-first, hover effects, save button, urgency indicators
 */
export function MomentCard({
  moment,
  variant = "default",
  showHost = true,
  onSave,
  className
}: MomentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(moment.is_saved || false);

  const navigate = useNavigate();

  // Deterministic "random" height based on moment ID
  const heightIndex = moment.id.charCodeAt(0) % heightVariants.length;
  const imageHeight = variant === "compact" ? "h-40" : heightVariants[heightIndex];

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
    onSave?.(moment.id);
  };

  const handleHostClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/profile/${moment.host_id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Calculate urgency (spots left, time until start)
  const spotsLeft = moment.max_participants
    ? moment.max_participants - (moment.participant_count || 0)
    : null;
  const isAlmostFull = spotsLeft !== null && spotsLeft <= 5;
  const isHot = (moment.participant_count || 0) > 10;

  const gradient = categoryGradients[moment.category] || "from-primary/20 to-accent/30";
  const emoji = categoryEmojis[moment.category] || "✨";

  return (
    <Link
      to={`/moments/${moment.id}`}
      className={cn(
        "group relative block rounded-2xl overflow-hidden bg-card border border-border/50",
        "transition-all duration-300 ease-out",
        "hover:shadow-elevated hover:-translate-y-1 hover:border-primary/30",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Area */}
      <div className={cn(
        "relative overflow-hidden bg-gradient-to-br",
        gradient,
        imageHeight
      )}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl opacity-40">
            {emoji}
          </div>
        </div>

        {/* Hover Overlay */}
        <div className={cn(
          "absolute inset-0 bg-black/0 transition-colors duration-200",
          isHovered && "bg-black/10"
        )} />

        {/* Top Actions */}
        <div className={cn(
          "absolute top-3 right-3 flex gap-2 transition-opacity duration-200",
          isHovered ? "opacity-100" : "opacity-0 sm:opacity-100"
        )}>
          <Button
            variant="secondary"
            size="sm"
            className={cn(
              "h-9 w-9 p-0 rounded-full bg-background/90 backdrop-blur-sm shadow-soft transition-all",
              "hover:bg-background hover:scale-110",
              isSaved && "bg-primary text-primary-foreground hover:bg-primary"
            )}
            onClick={handleSave}
          >
            <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
          </Button>
        </div>

        {/* Urgency Badges - Groupon style */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {moment.isExample && (
            <span className="px-2.5 py-1 bg-slate-500/90 backdrop-blur-sm text-white text-xs font-medium rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Example
            </span>
          )}
          {isAlmostFull && (
            <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow-md animate-pulse">
              <Flame className="h-3 w-3" />
              {spotsLeft} spots left!
            </span>
          )}
          {isHot && !isAlmostFull && (
            <span className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow-md">
              <Flame className="h-3 w-3" />
              Trending
            </span>
          )}
          {moment.reward && (
            <span className="px-2.5 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full shadow-md">
              🎁 Reward
            </span>
          )}
          {moment.venue_name && (
            <span className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-md flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Ground Anchor
            </span>
          )}
        </div>

        {/* Bottom Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Category Badge - Bottom */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium rounded-full shadow-sm">
            {(moment.category || "General").charAt(0).toUpperCase() + (moment.category || "General").slice(1)}
          </span>
        </div>
      </div>

      {/* Content Area - Airbnb style */}
      <div className="p-4">
        {/* Host Info */}
        {showHost && moment.host && (
          <div
            className="flex items-center gap-2 mb-2 group/host cursor-pointer"
            onClick={handleHostClick}
          >
            <div className="h-6 w-6 rounded-full bg-gradient-primary flex items-center justify-center text-xs text-white">
              {moment.host.avatar_url ? (
                <img
                  src={moment.host.avatar_url}
                  alt=""
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                moment.host.full_name?.charAt(0) || "?"
              )}
            </div>
            <span className="text-xs text-muted-foreground group-hover/host:text-primary transition-colors">
              Hosted by {moment.host.full_name}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className={cn(
          "font-serif font-semibold text-foreground line-clamp-2 mb-2",
          "group-hover:text-primary transition-colors",
          variant === "compact" ? "text-base" : "text-lg"
        )}>
          {moment.title}
        </h3>

        {/* Meta Info */}
        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>{formatDate(moment.starts_at)}</span>
            <span className="text-muted-foreground/50">•</span>
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>{formatTime(moment.starts_at)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="truncate">{moment.venue_name || moment.location}</span>
          </div>
        </div>

        {/* Footer - Social Proof */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            {/* FOMO Facepile */}
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full border-2 border-card bg-emerald-500 overflow-hidden z-[3]"><img src={`https://i.pravatar.cc/100?u=${moment.id}1`} alt="Attendee" className="w-full h-full object-cover"/></div>
              <div className="w-6 h-6 rounded-full border-2 border-card bg-blue-500 overflow-hidden z-[2]"><img src={`https://i.pravatar.cc/100?u=${moment.id}2`} alt="Attendee" className="w-full h-full object-cover"/></div>
              <div className="w-6 h-6 rounded-full border-2 border-card bg-purple-500 overflow-hidden z-[1]"><img src={`https://i.pravatar.cc/100?u=${moment.id}3`} alt="Attendee" className="w-full h-full object-cover"/></div>
            </div>
            <div className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              {Math.max((moment.participant_count || 0), 3)} going
            </div>
          </div>

          {/* Quick Reactions Preview */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-muted-foreground/60 bg-muted/30 px-1.5 py-0.5 rounded-full">🔥 Hot</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default MomentCard;
