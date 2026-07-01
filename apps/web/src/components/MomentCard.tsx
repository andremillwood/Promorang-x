import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark, MapPin, Calendar, Users, Clock, Flame, Sparkles, Repeat2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";
import { getTaxonomyLabel, momentArchetypes, venueCategories, conversionTypes } from "@/lib/moment-taxonomy";
import { buildMomentPath } from "@/lib/discovery";
import { MomentValuePath } from "@/components/moments/MomentValuePath";
import { PromoShareEligibilityPanel } from "@/components/promoshare/PromoShareEligibilityPanel";
import { ContentProvenanceBadge } from "@/components/content/ContentProvenance";
import { OpportunityTerms } from "@/components/economy/OpportunityTerms";
import { ValuePreview } from "@/components/value/ValueJourney";

type Moment = Tables<"moments"> & {
  participant_count?: number;
  is_saved?: boolean;
  isExample?: boolean;
  content_origin?: "stakeholder_created" | "platform_seed" | "demo" | "scraped" | "imported" | null;
  recurrence_enabled?: boolean | null;
  recurrence_frequency?: "daily" | "weekly" | "monthly" | null;
  recurrence_interval?: number | null;
  venue_category?: string | null;
  moment_archetype?: string | null;
  conversion_type?: string | null;
  proof_type?: string | null;
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

const getOriginLabel = (moment: Moment) => {
  if (moment.isExample || moment.content_origin === "demo" || moment.content_origin === "platform_seed") {
    return null;
  }

  if (moment.content_origin === "scraped" || moment.content_origin === "imported") {
    return { label: "Discovered listing", tone: "bg-sky-600/90 text-white", Icon: Sparkles };
  }

  return null;
};

const getRecurrenceLabel = (moment: Moment) => {
  if (!moment.recurrence_enabled || !moment.recurrence_frequency) return null;
  const frequency = moment.recurrence_frequency;
  const interval = Number(moment.recurrence_interval || 1);
  if (frequency === "daily") return interval > 1 ? `Every ${interval} days` : "Daily";
  if (frequency === "monthly") return interval > 1 ? `Every ${interval} months` : "Monthly";
  return interval > 1 ? `Every ${interval} weeks` : "Weekly";
};

const formActionLabel = (conversionType?: string | null) => {
  if (!conversionType) return null;
  return conversionType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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
  const archetypeLabel = getTaxonomyLabel(momentArchetypes, moment.moment_archetype);
  const venueCategoryLabel = getTaxonomyLabel(venueCategories, moment.venue_category);
  const conversionLabel = getTaxonomyLabel(conversionTypes, moment.conversion_type);
  const originLabel = getOriginLabel(moment);
  const recurrenceLabel = getRecurrenceLabel(moment);
  const isExampleMoment = Boolean(moment.isExample || moment.content_origin === "demo" || moment.content_origin === "platform_seed");
  const actionLabel = conversionLabel || formActionLabel(moment.conversion_type) || "Check-in";
  const unlockLabel = moment.reward ? "Reward available" : recurrenceLabel ? "Build standing" : "Earn a Mark";

  return (
    <Link
      to={buildMomentPath({ id: moment.id, slug: (moment as any).slug })}
      className={cn(
        "group relative block overflow-hidden rounded-2xl border border-border/50 bg-card touch-manipulation",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:border-primary/30 hover:shadow-elevated active:scale-[0.99]",
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
        {isExampleMoment && (
          <ContentProvenanceBadge className="absolute left-3 top-3 z-20" />
        )}
        {/* Moment Image or Background Pattern */}
        {moment.image_url ? (
          <img
            src={moment.image_url}
            alt={moment.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl opacity-40">
              {emoji}
            </div>
          </div>
        )}

        {/* Hover Overlay */}
        <div className={cn(
          "absolute inset-0 bg-black/0 transition-colors duration-200 z-10",
          isHovered && "bg-black/10"
        )} />

        {/* Top Actions */}
        <div className={cn(
          "absolute top-3 right-3 flex gap-2 transition-opacity duration-200 opacity-100",
          isHovered && "sm:opacity-100"
        )}>
          <Button
            variant="secondary"
            size="sm"
            className={cn(
              "rounded-full bg-background/90 p-0 shadow-soft backdrop-blur-sm transition-all",
              "hover:bg-background hover:scale-110",
              isSaved && "bg-primary text-primary-foreground hover:bg-primary"
            )}
            onClick={handleSave}
            aria-label={isSaved ? "Remove saved moment" : "Save moment"}
          >
            <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
          </Button>
        </div>

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {originLabel && (
            <span className={cn("px-2.5 py-1 backdrop-blur-sm text-xs font-semibold rounded-full shadow-md flex items-center gap-1", originLabel.tone)}>
              <originLabel.Icon className="h-3 w-3" />
              {originLabel.label}
            </span>
          )}
          {recurrenceLabel && (
            <span className="px-2.5 py-1 bg-background/92 backdrop-blur-sm text-foreground text-xs font-semibold rounded-full shadow-md flex items-center gap-1">
              <Repeat2 className="h-3 w-3 text-primary" />
              {recurrenceLabel}
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
            <span className="max-w-[13rem] truncate px-2.5 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full shadow-md">
              {moment.reward}
            </span>
          )}
          {moment.venue_name && (
            <span className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-md flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Venue
            </span>
          )}
        </div>

        {/* Bottom Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="px-2.5 py-1 bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium rounded-full shadow-sm">
            {(moment.category || "General").charAt(0).toUpperCase() + (moment.category || "General").slice(1)}
          </span>
          <span className="rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white backdrop-blur-sm">
            {isExampleMoment ? "Learn pattern" : "Join path"}
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

        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {archetypeLabel && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
              {archetypeLabel}
            </span>
          )}
          {venueCategoryLabel && (
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">
              {venueCategoryLabel}
            </span>
          )}
        </div>

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

        <MomentValuePath
          className="mt-4"
          steps={[
            { label: actionLabel },
            { label: moment.proof_type || "Proof" },
            { label: unlockLabel },
          ]}
        />

        <ValuePreview
          className="mt-3"
          humanValue={moment.reward || "Build your visible reputation by showing up"}
          proof={`${moment.proof_type || actionLabel} verifies participation`}
          reward={moment.reward ? "Reward after review" : "Mark, Points, and future access"}
        />

        <OpportunityTerms
          compact
          className="mt-3"
          cost="Free to join"
          reward={moment.reward || unlockLabel}
          funding={moment.reward ? "Host / sponsor" : "Progress mode"}
          proof={moment.proof_type || actionLabel}
          settlement={moment.reward ? "After proof review" : "Recorded immediately"}
        />

        <PromoShareEligibilityPanel variant="compact" className="mt-3" />

        {/* Footer - Social Proof + Points */}
        <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
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

          {/* Points Preview */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              Mark path
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/30 pt-3 sm:hidden">
          <span className="text-xs font-medium text-muted-foreground">Tap for details</span>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">Open moment</span>
        </div>
      </div>
    </Link>
  );
}

export default MomentCard;
