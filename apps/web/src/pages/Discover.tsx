import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Bookmark,
  Calendar,
  Compass,
  Gift,
  Heart,
  HelpCircle,
  LayoutGrid,
  Map,
  MapPin,
  MessageSquare,
  Plus,
  Radio,
  Search,
  Sparkles,
  Ticket,
  Users,
  Zap,
} from "lucide-react";
import { getSiteUrl } from "@/lib/discovery";
import { SubmitDiscoveryModal } from "@/components/discovery/SubmitDiscoveryModal";
import { PromorangMap } from "@/components/PromorangMap";
import { StoryGamificationRail } from "@/components/StoryGamificationRail";
import { SpinWheelModal } from "@/components/SpinWheelModal";
import { TeamSlashModal } from "@/components/TeamSlashModal";
import { DailyRewardsModal } from "@/components/DailyRewardsModal";
import { RightUtilityRail } from "@/components/RightUtilityRail";
import { SocialGraphFacepile } from "@/components/SocialGraphFacepile";
import { useI18n } from "@/i18n/I18nContext";

import { CURATED_KINGSTON_MOMENTS } from "@/lib/curated-radar";
import { DiscoveryWidget, DiscoveryProps } from "@/components/radar/DiscoveryWidget";
import { AskQuestionModal } from "@/components/discovery/AskQuestionModal";
import { DISCOVERY_POLLS } from "@/data/discoveriesData";

type PublicMoment = Tables<"view_public_moment_directory">;

const categoryFilters = [
  { id: "all", label: "All Events", icon: Sparkles },
  { id: "questions", label: "Discovery Polls 🔥", icon: HelpCircle },
  { id: "music", label: "Music & Parties", icon: Radio },
  { id: "food", label: "Food & Drinks", icon: Gift },
  { id: "community", label: "Gatherings & Culture", icon: Users },
];

const DISCOVERY_QUESTIONS_FEED: DiscoveryProps[] = [...DISCOVERY_POLLS];

const formatMomentDate = (value?: string | null) => {
  if (!value) return "TBA";
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "TBA";
  }
};

const Discover = () => {
  const { t } = useI18n();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const [wheelOpen, setWheelOpen] = useState(false);
  const [slashOpen, setSlashOpen] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);

  const discoveryQuery = useQuery({
    queryKey: ["discover-public-feed-v2"],
    queryFn: async () => {
      const { data: momentsData } = await supabase
        .from("moments")
        .select("*")
        .order("starts_at", { ascending: true })
        .limit(20);

      const dbMoments = momentsData || [];
      const curatedAsMoments = CURATED_KINGSTON_MOMENTS.map((cm) => ({
        id: cm.id,
        host_id: "editorial",
        title: cm.title,
        description: cm.description,
        category: cm.intentType === "ATTEND" ? "Music & Parties" : cm.intentType === "TRY" ? "Food & Drinks" : "Gatherings & Culture",
        location: cm.location,
        venue_name: cm.venueName,
        starts_at: new Date(Date.now() + 86400000).toISOString(),
        ends_at: null,
        max_participants: 50,
        reward: `${cm.pointsReward} Points + PromoKey`,
        image_url: cm.image,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      // Combine curated Kingston moments with any user-hosted DB moments
      const seenTitles = new Set(dbMoments.map(m => m.title.toLowerCase()));
      const filteredCurated = curatedAsMoments.filter(cm => !seenTitles.has(cm.title.toLowerCase()));

      return [...filteredCurated, ...dbMoments];
    },
  });

  const moments = discoveryQuery.data || [];
  const filteredMoments = moments.filter((m) => {
    const matchesCategory = activeCategory === "all" || (m.category || "").toLowerCase().includes(activeCategory);
    const matchesSearch = !searchQuery || (m.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || (m.location || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredMoment = moments[0] || null;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-[#ff5500] selection:text-white">
      <SEO
        title={`${t("discover.title")} — Promorang`}
        description={t("discover.copy")}
        url={getSiteUrl("/discover")}
      />

      {/* Main Container */}
      <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8 space-y-10">

        {/* Header Title & Search Row */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-white/10 pb-6 sm:pb-8">
          <div className="space-y-2">
            <Badge className="rounded-full bg-[#ff5500] text-white font-bold text-[10px] sm:text-xs px-3.5 py-1 uppercase tracking-wider border-none">
              {t("discover.badge")}
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              {t("discover.title")}
            </h1>
            <p className="text-white/60 text-sm sm:text-base max-w-xl font-normal">
              {t("discover.copy")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:min-w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                placeholder={t("discover.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl bg-white/5 border border-white/10 pl-11 pr-4 py-2.5 sm:py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#ff5500] transition"
              />
            </div>

            {/* View Mode Toggle Pill */}
            <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-1 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  viewMode === "grid" ? "bg-[#ff5500] text-white shadow-lg" : "text-white/60 hover:text-white"
                }`}
              >
                <LayoutGrid className="h-4 w-4" /> {t("discover.grid")}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  viewMode === "map" ? "bg-[#ff5500] text-white shadow-lg" : "text-white/60 hover:text-white"
                }`}
              >
                <Map className="h-4 w-4" /> {t("discover.map")}
              </button>
            </div>

            <SubmitDiscoveryModal />
          </div>
        </div>

        <div className="mb-6 grid gap-3 rounded-3xl border border-white/10 bg-white/[0.035] p-3.5 sm:p-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#ff5500]/25 bg-[#ff5500]/[0.07] p-3.5 sm:p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff8a50]">{t("discover.momentBadge")}</p>
            <p className="mt-1 text-sm font-bold text-white">{t("discover.momentDesc")}</p>
            <p className="mt-1 text-xs text-white/50">{t("discover.momentSub")}</p>
          </div>
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-3.5 sm:p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">{t("discover.discoveryBadge")}</p>
            <p className="mt-1 text-sm font-bold text-white">{t("discover.discoveryDesc")}</p>
            <p className="mt-1 text-xs text-white/50">{t("discover.discoverySub")}</p>
          </div>
        </div>

        {/* Top Story & Daily Gamification Rail */}
        <StoryGamificationRail
          onOpenWheel={() => setWheelOpen(true)}
          onOpenStreak={() => setStreakOpen(true)}
        />

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: "all", label: t("discover.filterAll"), icon: Sparkles },
            { id: "questions", label: t("discover.filterPolls"), icon: HelpCircle },
            { id: "music", label: t("discover.filterMusic"), icon: Radio },
            { id: "food", label: t("discover.filterFood"), icon: Gift },
            { id: "community", label: t("discover.filterCommunity"), icon: Users },
          ].map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                  isActive
                    ? "bg-[#ff5500] text-white shadow-lg shadow-[#ff5500]/20"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5"
                }`}
              >
                <cat.icon className="h-4 w-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Main Content Layout with 3-Column Desktop Right Rail */}
        <div className="flex gap-8 items-start">
          <div className="flex-1 space-y-8 sm:space-y-10 min-w-0">
            {/* Featured Hero Event Card */}
            {featuredMoment && !searchQuery && activeCategory === "all" && (
              <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-black min-h-[380px] sm:min-h-[440px] flex items-end p-5 sm:p-10 lg:p-12">
                {featuredMoment.image_url || featuredMoment.banner_image_url ? (
                  <img
                    src={featuredMoment.banner_image_url || featuredMoment.image_url}
                    alt={featuredMoment.title}
                    className="absolute inset-0 h-full w-full object-cover opacity-50 filter blur-[1px] scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#ff5500]/20 via-[#121214] to-black" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/60 to-transparent" />

                <div className="relative z-10 space-y-3 sm:space-y-4 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-[#ff5500] text-white font-bold text-[10px] sm:text-xs px-3 py-1">Featured Event</Badge>
                    <Badge variant="outline" className="border-white/20 text-white/80 bg-black/40 text-[10px] sm:text-xs">
                      {formatMomentDate(featuredMoment.starts_at)}
                    </Badge>
                  </div>

                  <h2 className="text-2xl font-extrabold text-white sm:text-4xl md:text-5xl leading-tight">
                    {featuredMoment.title}
                  </h2>

                  <p className="text-white/80 text-xs sm:text-base line-clamp-2 max-w-2xl font-medium">
                    {featuredMoment.description}
                  </p>

                  <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                    <Button asChild className="rounded-2xl bg-[#ff5500] hover:bg-[#e04b00] text-white font-bold px-5 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm shadow-lg shadow-[#ff5500]/25">
                      <Link to={`/moments/${featuredMoment.id}`}>
                        RSVP & Reserve Spot <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <span className="text-xs text-white/60 flex items-center gap-1.5 font-semibold truncate">
                      <MapPin className="h-3.5 w-3.5 text-[#ff5500] shrink-0" /> {featuredMoment.venue_name || featuredMoment.location}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Discovery Questions & Debate Polls Grid */}
            {(activeCategory === "all" || activeCategory === "questions") && !searchQuery && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/40 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                        <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        ⚡ Live City Drops & Community Unlocks
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-white mt-1.5">Rally & Unlock Secret Drops</h3>
                    <p className="text-xs text-white/60">Every vote charges the city battery. Clear the threshold to drop exclusive tasting passes and VIP access for everyone on the ballot.</p>
                  </div>
                  <AskQuestionModal
                    trigger={
                      <Button className="rounded-2xl bg-orange-500 hover:bg-orange-400 text-black font-black text-xs shadow-lg shadow-orange-500/20 flex items-center gap-1.5 px-4 h-10 shrink-0">
                        <Plus className="w-4 h-4" />
                        <span>Launch a Quest</span>
                      </Button>
                    }
                    onQuestionCreated={(newQ) => {
                      DISCOVERY_QUESTIONS_FEED.unshift(newQ);
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DISCOVERY_QUESTIONS_FEED.map((q) => (
                    <DiscoveryWidget
                      key={q.id}
                      {...q}
                      onVote={(qId, optId) => {
                        console.log('Voted on discover page:', qId, optId);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Events Content View */}
            {activeCategory !== "questions" && (viewMode === "map" ? (
              <div className="h-[600px] w-full rounded-3xl overflow-hidden border border-white/10">
                <PromorangMap />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-2xl font-bold text-white">{t("discover.upcoming")}</h3>
                  <span className="text-xs font-semibold text-white/50">{t("discover.found", { count: filteredMoments.length })}</span>
                </div>

                {discoveryQuery.isLoading ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {[1, 2, 3, 4].map((n) => (
                      <Skeleton key={n} className="h-80 w-full rounded-3xl bg-white/5" />
                    ))}
                  </div>
                ) : filteredMoments.length === 0 ? (
                  <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10 space-y-3">
                    <Compass className="h-10 w-10 text-white/30 mx-auto" />
                    <h4 className="text-lg font-bold text-white">{t("discover.empty")}</h4>
                    <p className="text-xs text-white/50">{t("discover.emptyHelp")}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {filteredMoments.map((item) => (
                      <div
                        key={item.id}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition-all hover:border-[#ff5500]/40 hover:bg-white/10 hover:shadow-2xl hover:shadow-[#ff5500]/10"
                      >
                        {/* Event Card Header Image */}
                        <div className="relative h-48 w-full overflow-hidden bg-black">
                          {item.image_url || item.banner_image_url ? (
                            <img
                              src={item.image_url || item.banner_image_url}
                              alt={item.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-tr from-[#ff5500]/20 via-[#121214] to-black" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white border border-white/10 text-[10px] font-bold uppercase">
                            {item.category || "Social"}
                          </Badge>
                        </div>

                        {/* Event Details Body */}
                        <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#ff5500]">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{formatMomentDate(item.starts_at)}</span>
                            </div>

                            <h3 className="text-xl font-bold text-white group-hover:text-[#ff5500] transition-colors line-clamp-1">
                              {item.title}
                            </h3>

                            <p className="text-xs text-white/60 flex items-center gap-1.5 line-clamp-1">
                              <MapPin className="h-3.5 w-3.5 text-white/40" />
                              {item.venue_name || item.location}
                            </p>

                            {item.reward && (
                              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400">
                                <Gift className="h-3.5 w-3.5" /> {item.reward}
                              </div>
                            )}

                            {/* Friend Facepile Social Proof */}
                            <SocialGraphFacepile claimedCount={18} />
                          </div>
                        </div>

                        {/* Card Action Footer */}
                        <div className="p-5 pt-0">
                          <Button asChild variant="outline" className="w-full rounded-2xl border-white/15 bg-white/5 text-white hover:bg-[#ff5500] hover:border-[#ff5500] font-bold transition-all">
                            <Link to={`/moments/${item.id}`}>View Event & RSVP</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Utility Rail */}
          <RightUtilityRail
            onOpenSlashModal={() => setSlashOpen(true)}
            onOpenStreakModal={() => setStreakOpen(true)}
          />
        </div>

        {/* Gamification & Viral Modals */}
        <SpinWheelModal isOpen={wheelOpen} onClose={() => setWheelOpen(false)} />
        <TeamSlashModal isOpen={slashOpen} onClose={() => setSlashOpen(false)} />
        <DailyRewardsModal isOpen={streakOpen} onClose={() => setStreakOpen(false)} />
      </div>
    </div>
  );
};

export default Discover;
