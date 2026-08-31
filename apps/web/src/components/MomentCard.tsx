import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark, MapPin, Calendar, Users, Clock, Flame, Sparkles, Repeat2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";
import { taxonomyLabelKey } from "@/lib/moment-taxonomy";
import type { TranslationKey } from "@/i18n/translations";
import { buildMomentPath } from "@/lib/discovery";
import { MomentValuePath } from "@/components/moments/MomentValuePath";
import { ContentProvenanceBadge } from "@/components/content/ContentProvenance";
import { resolveMomentOccurrence, getMomentStatus } from "@/lib/moment-recurrence";
import { useI18n } from "@/i18n/I18nContext";

type Moment = Tables<"moments"> & {
  slug?: string | null;
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

const getOriginMeta = (moment: Moment) => {
  if (moment.isExample || moment.content_origin === "demo" || moment.content_origin === "platform_seed") {
    return null;
  }

  if (moment.content_origin === "scraped" || moment.content_origin === "imported") {
    return { tone: "bg-sky-600/90 text-white", Icon: Sparkles };
  }

  return null;
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
  const { t, formatDate, formatNumber } = useI18n();
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

  const formatCardDate = (dateString: string) => {
    return formatDate(dateString, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatCardTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, {
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
  const archKey = taxonomyLabelKey("arch", moment.moment_archetype);
  const venueKey = taxonomyLabelKey("venue", moment.venue_category);
  const convKey = taxonomyLabelKey("conv", moment.conversion_type);
  const momentCatKey = taxonomyLabelKey("moment", moment.category);
  const archetypeLabel = archKey ? t(archKey as TranslationKey) : "";
  const venueCategoryLabel = venueKey ? t(venueKey as TranslationKey) : "";
  const conversionLabel = convKey ? t(convKey as TranslationKey) : "";
  const originMeta = getOriginMeta(moment);
  const recurrenceEnabled = Boolean(moment.recurrence_enabled && moment.recurrence_frequency);
  const recurrenceInterval = Number(moment.recurrence_interval || 1);
  const recurrenceLabel = !recurrenceEnabled
    ? null
    : moment.recurrence_frequency === "daily"
      ? (recurrenceInterval > 1 ? t("momentCard.everyDays", { n: recurrenceInterval }) : t("momentCard.daily"))
      : moment.recurrence_frequency === "monthly"
        ? (recurrenceInterval > 1 ? t("momentCard.everyMonths", { n: recurrenceInterval }) : t("momentCard.monthly"))
        : (recurrenceInterval > 1 ? t("momentCard.everyWeeks", { n: recurrenceInterval }) : t("momentCard.weekly"));
  const momentStatus = getMomentStatus(moment);
  const occurrence = momentStatus.occurrence;
  const isPast = momentStatus.isPast;
  const isExampleMoment = Boolean(moment.isExample || moment.content_origin === "demo" || moment.content_origin === "platform_seed");
  const actionLabel = conversionLabel || t("momentCard.checkIn");
  const unlockLabel = moment.reward ? t("momentCard.rewardAvail") : recurrenceLabel ? t("momentCard.buildStanding") : t("momentCard.earnMark");

  return (
    <Link
      to={buildMomentPath({ id: moment.id, slug: moment.slug })}
      className={cn(
        "group relative block overflow-hidden rounded-2xl border border-border/50 bg-card touch-manipulation",
        "transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] duration-300 ease-out",
        "hover:-translate-y-1 hover:border-primary/30 hover:shadow-elevated active:scale-[0.99]",
        isPast && "opacity-85 hover:opacity-100",
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
              "rounded-full bg-background/90 p-0 shadow-soft backdrop-blur-sm transition-[color,background-color,border-color,opacity,box-shadow,transform,filter]",
              "hover:bg-background hover:scale-110",
              isSaved && "bg-primary text-primary-foreground hover:bg-primary"
            )}
            onClick={handleSave}
            aria-label={isSaved ? t("momentCard.unsaveAria") : t("momentCard.saveAria")}
          >
            <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
          </Button>
        </div>

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isPast ? (
            <span className="w-fit rounded-full border border-red-500/40 bg-red-500/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-md backdrop-blur-sm">
              {t("momentCard.concluded")}
            </span>
          ) : (
            <span className="w-fit rounded-full border border-white/15 bg-black/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-md backdrop-blur-sm">
              {t("momentCard.badge")}
            </span>
          )}
          {originMeta && (
            <span className={cn("px-2.5 py-1 backdrop-blur-sm text-xs font-semibold rounded-full shadow-md flex items-center gap-1", originMeta.tone)}>
              <originMeta.Icon className="h-3 w-3" />
              {t("momentCard.discovered")}
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
              {t("momentCard.spotsLeft", { count: formatNumber(spotsLeft) })}
            </span>
          )}
          {isHot && !isAlmostFull && (
            <span className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow-md">
              <Flame className="h-3 w-3" />
              {t("momentCard.trending")}
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
              {t("momentCard.venue")}
            </span>
          )}
        </div>

        {/* Bottom Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="px-2.5 py-1 bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium rounded-full shadow-sm">
            {momentCatKey ? t(momentCatKey as TranslationKey) : (moment.category || t("momentCard.categoryGeneral"))}
          </span>
          <span className="rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white backdrop-blur-sm">
            {isExampleMoment ? t("momentCard.learnPattern") : t("momentCard.joinPath")}
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
              {t("momentCard.hostedBy", { name: moment.host.full_name })}
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
            <span>{formatCardDate(occurrence.startsAt)}</span>
            <span className="text-muted-foreground/50">•</span>
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>{formatCardTime(occurrence.startsAt)}</span>
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
            { label: moment.proof_type || t("momentCard.proofFallback") },
            { label: unlockLabel },
          ]}
        />

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users className="h-3.5 w-3.5" />
            </span>
            <div className="text-xs font-semibold text-muted-foreground transition-colors group-hover:text-foreground">
              {(moment.participant_count || 0) > 0
                ? moment.participant_count === 1
                  ? t("momentCard.personJoining", { count: formatNumber(moment.participant_count) })
                  : t("momentCard.peopleJoining", { count: formatNumber(moment.participant_count) })
                : t("momentCard.firstToJoin")}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors",
              isPast
                ? "bg-zinc-800 text-zinc-300 group-hover:bg-zinc-700 group-hover:text-white"
                : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
            )}>
              {isPast ? t("momentCard.viewRecap") : t("momentCard.viewDetails")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default MomentCard;
