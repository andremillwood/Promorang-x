import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Calendar,
  Compass,
  Gift,
  HelpCircle,
  LayoutGrid,
  Map,
  MapPin,
  Plus,
  Radio,
  Search,
  Sparkles,
  Store,
  Ticket,
  Users,
  Zap,
} from "lucide-react";
import { getSiteUrl } from "@/lib/discovery";
import { SubmitDiscoveryModal } from "@/components/discovery/SubmitDiscoveryModal";
import { PromorangMap, MapMarkerItem } from "@/components/PromorangMap";
import { StoryGamificationRail } from "@/components/StoryGamificationRail";
import { SpinWheelModal } from "@/components/SpinWheelModal";
import { DailyRewardsModal } from "@/components/DailyRewardsModal";
import { DiscoverRightRail } from "@/components/discovery/DiscoverRightRail";
import { SocialGraphFacepile } from "@/components/SocialGraphFacepile";
import { useI18n } from "@/i18n/I18nContext";
import { CURATED_KINGSTON_MOMENTS } from "@/lib/curated-radar";
import { DiscoveryWidget, DiscoveryProps } from "@/components/radar/DiscoveryWidget";
import { AskQuestionModal } from "@/components/discovery/AskQuestionModal";
import { DISCOVERY_POLLS } from "@/data/discoveriesData";

const categoryFilters = [
  { id: "all", label: "All Events", icon: Sparkles },
  { id: "music", label: "Music & Parties", icon: Radio },
  { id: "food", label: "Food & Drinks", icon: Gift },
  { id: "community", label: "Gatherings & Culture", icon: Users },
];

const CURATED_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "00000000-0000-0000-0002-000000000060": { lat: 18.0435, lng: -76.8123 }, // PriceSmart Red Hills
  "00000000-0000-0000-0002-000000000051": { lat: 18.4554, lng: -77.2023 }, // Plantation Cove
  "00000000-0000-0000-0002-000000000052": { lat: 18.4554, lng: -77.2023 }, // Plantation Cove
  "00000000-0000-0000-0002-000000000001": { lat: 18.0267, lng: -76.7924 }, // Fiction Nightclub
  "00000000-0000-0000-0002-000000000002": { lat: 18.0267, lng: -76.7924 }, // Fiction Nightclub
  "00000000-0000-0000-0002-000000000025": { lat: 18.0270, lng: -76.7925 }, // Tracks & Records
  "00000000-0000-0000-0002-000000000026": { lat: 18.0163, lng: -76.7915 }, // Steakhouse Verandah Devon House
  "00000000-0000-0000-0002-000000000022": { lat: 18.0163, lng: -76.7915 }, // Tacbar Devon House
  "00000000-0000-0000-0002-000000000023": { lat: 18.0065, lng: -76.7865 }, // Pegasus
  "00000000-0000-0000-0002-000000000017": { lat: 18.0210, lng: -76.7725 }, // Chilitos JaMexican
  "00000000-0000-0000-0002-000000000018": { lat: 18.0145, lng: -76.7842 }, // AC Lounge
  "00000000-0000-0000-0002-000000000004": { lat: 18.0465, lng: -76.7582 }, // Kingston Dub Club
  "00000000-0000-0000-0002-000000000005": { lat: 18.0163, lng: -76.7915 }, // Devon House Gourmet
  "00000000-0000-0000-0002-000000000006": { lat: 18.0080, lng: -76.7890 }, // Janga's Soundbar
  "00000000-0000-0000-0002-000000000015": { lat: 17.9678, lng: -76.7910 }, // Downtown Art District
};

const DEFAULT_DISCOVER_CENTER = { lat: 18.0179, lng: -76.8099 };

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
  const [activeTab, setActiveTab] = useState<"events" | "places" | "polls">("events");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const [wheelOpen, setWheelOpen] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);

  const discoveryQuery = useQuery({
    queryKey: ["discover-public-feed-v3"],
    queryFn: async () => {
      const { data: momentsData } = await supabase
        .from("moments")
        .select("*")
        .order("starts_at", { ascending: true })
        .limit(20);

      const dbMoments = (momentsData || []).map((m) => ({
        ...m,
        latitude: m.latitude ?? null,
        longitude: m.longitude ?? null,
      }));

      const curatedAsMoments = CURATED_KINGSTON_MOMENTS.map((cm) => {
        const coords = CURATED_COORDINATES[cm.id] || DEFAULT_DISCOVER_CENTER;
        return {
          id: cm.id,
          host_id: "editorial",
          title: cm.title,
          description: cm.description,
          category: cm.intentType === "ATTEND" ? "Music & Parties" : cm.intentType === "TRY" ? "Food & Drinks" : "Gatherings & Culture",
          location: cm.location,
          venue_name: cm.venueName,
          latitude: coords.lat,
          longitude: coords.lng,
          starts_at: new Date(Date.now() + 86400000).toISOString(),
          ends_at: null,
          max_participants: 50,
          reward: `${cm.pointsReward} Points + PromoKey`,
          image_url: cm.image,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      const seenTitles = new Set(dbMoments.map((m) => m.title.toLowerCase()));
      const filteredCurated = curatedAsMoments.filter((cm) => !seenTitles.has(cm.title.toLowerCase()));

      return [...filteredCurated, ...dbMoments];
    },
  });

  const moments = discoveryQuery.data || [];
  const filteredMoments = moments.filter((m) => {
    const matchesCategory = activeCategory === "all" || (m.category || "").toLowerCase().includes(activeCategory);
    const matchesSearch =
      !searchQuery ||
      (m.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.location || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredMoment = moments[0] || null;

  const mapMarkers = useMemo<MapMarkerItem[]>(() => {
    return filteredMoments
      .map((m) => {
        const lat = Number(m.latitude);
        const lng = Number(m.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return {
          id: m.id,
          lat,
          lng,
          title: m.title,
          subtitle: m.venue_name || m.location || undefined,
          category: m.category || undefined,
          reward: m.reward || undefined,
          imageUrl: m.image_url || undefined,
        };
      })
      .filter((m): m is MapMarkerItem => m !== null);
  }, [filteredMoments]);

  const mapCenter = useMemo(() => {
    if (mapMarkers.length > 0) {
      const sumLat = mapMarkers.reduce((sum, m) => sum + m.lat, 0);
      const sumLng = mapMarkers.reduce((sum, m) => sum + m.lng, 0);
      return {
        lat: sumLat / mapMarkers.length,
        lng: sumLng / mapMarkers.length,
      };
    }
    return DEFAULT_DISCOVER_CENTER;
  }, [mapMarkers]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-primary selection:text-white">
      <SEO
        title={`${t("discover.title")} — Promorang`}
        description={t("discover.copy")}
        url={getSiteUrl("/discover")}
      />

      <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Header Title & Search Row */}
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between border-b border-white/10 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge className="rounded-full bg-primary text-white font-bold text-[10px] uppercase tracking-wider border-none">
                {t("discover.badge")}
              </Badge>
              <span className="text-xs text-white/50 font-semibold">Kingston, Jamaica</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {t("discover.title")}
            </h1>
            <p className="text-white/60 text-xs sm:text-sm max-w-xl">
              {t("discover.copy")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:min-w-[260px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                placeholder={t("discover.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-primary transition"
              />
            </div>

            {/* Grid / Map Toggle */}
            <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-1 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  viewMode === "grid" ? "bg-primary text-white shadow-lg" : "text-white/60 hover:text-white"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>{t("discover.grid")}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  viewMode === "map" ? "bg-primary text-white shadow-lg" : "text-white/60 hover:text-white"
                }`}
              >
                <Map className="h-3.5 w-3.5" />
                <span>{t("discover.map")}</span>
              </button>
            </div>

            <SubmitDiscoveryModal />
          </div>
        </div>

        {/* 3 High-Level Segmented Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("events")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === "events"
                ? "bg-primary text-white shadow-lg shadow-primary/25"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Ticket className="h-4 w-4" />
            <span>Moments & Events</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">
              {moments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("places")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === "places"
                ? "bg-primary text-white shadow-lg shadow-primary/25"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Store className="h-4 w-4" />
            <span>Places & Venues</span>
          </button>

          <button
            onClick={() => setActiveTab("polls")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === "polls"
                ? "bg-primary text-white shadow-lg shadow-primary/25"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Community Polls & Drops</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold">
              Hot
            </span>
          </button>
        </div>

        {/* Story & Streak Highlights */}
        <StoryGamificationRail
          onOpenWheel={() => setWheelOpen(true)}
          onOpenStreak={() => setStreakOpen(true)}
        />

        {/* Main Content Layout with Right Rail */}
        <div className="flex gap-8 items-start">
          <div className="flex-1 space-y-8 min-w-0">

            {/* TAB 1: MOMENTS & EVENTS */}
            {activeTab === "events" && (
              <>
                {/* Category Pills Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {categoryFilters.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all shrink-0 ${
                          isActive
                            ? "bg-white text-black shadow-md"
                            : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Featured Hero Event Card */}
                {featuredMoment && !searchQuery && activeCategory === "all" && viewMode === "grid" && (
                  <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-black min-h-[340px] sm:min-h-[380px] flex items-end p-5 sm:p-8">
                    {featuredMoment.image_url ? (
                      <img
                        src={featuredMoment.image_url}
                        alt={featuredMoment.title}
                        className="absolute inset-0 h-full w-full object-cover opacity-50 filter blur-[1px] scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-[#121214] to-black" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/60 to-transparent" />

                    <div className="relative z-10 space-y-3 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-primary text-white font-bold text-[10px] px-3 py-0.5">Featured Event</Badge>
                        <Badge variant="outline" className="border-white/20 text-white/80 bg-black/40 text-[10px]">
                          {formatMomentDate(featuredMoment.starts_at)}
                        </Badge>
                      </div>

                      <h2 className="text-2xl font-black text-white sm:text-4xl leading-tight">
                        {featuredMoment.title}
                      </h2>

                      <p className="text-white/80 text-xs sm:text-sm line-clamp-2 font-normal">
                        {featuredMoment.description}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <Button asChild className="rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2.5 text-xs shadow-lg shadow-primary/25">
                          <Link to={`/moments/${featuredMoment.id}`}>
                            <span>RSVP & Reserve Spot</span>
                            <ArrowRight className="ml-2 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <span className="text-xs text-white/60 flex items-center gap-1.5 font-medium truncate">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{featuredMoment.venue_name || featuredMoment.location}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Events Grid or Map View */}
                {viewMode === "map" ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <h3 className="text-lg sm:text-xl font-bold text-white">Live Discovery Map</h3>
                      </div>
                      <span className="text-xs font-semibold text-white/50">{mapMarkers.length} locations mapped</span>
                    </div>
                    <div className="h-[600px] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                      <PromorangMap
                        center={mapCenter}
                        zoom={13}
                        markers={mapMarkers}
                        height="100%"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h3 className="text-lg sm:text-xl font-bold text-white">Upcoming Events & Passes</h3>
                      <span className="text-xs font-semibold text-white/50">{filteredMoments.length} moments found</span>
                    </div>

                    {discoveryQuery.isLoading ? (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {[1, 2, 3, 4].map((n) => (
                          <Skeleton key={n} className="h-72 w-full rounded-3xl bg-white/5" />
                        ))}
                      </div>
                    ) : filteredMoments.length === 0 ? (
                      <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10 space-y-3">
                        <Compass className="h-10 w-10 text-white/30 mx-auto" />
                        <h4 className="text-lg font-bold text-white">No Moments Found</h4>
                        <p className="text-xs text-white/50">Try selecting a different category or search term.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        {filteredMoments.map((item) => (
                          <div
                            key={item.id}
                            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition-all hover:border-primary/40 hover:bg-white/10 hover:shadow-xl"
                          >
                            <div className="relative h-44 w-full overflow-hidden bg-black">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.title}
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              ) : (
                                <div className="h-full w-full bg-gradient-to-tr from-primary/20 via-[#121214] to-black" />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                              <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white border border-white/10 text-[10px] font-bold uppercase">
                                {item.category || "Social"}
                              </Badge>
                            </div>

                            <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>{formatMomentDate(item.starts_at)}</span>
                                </div>

                                <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                                  {item.title}
                                </h3>

                                <p className="text-xs text-white/60 flex items-center gap-1.5 line-clamp-1">
                                  <MapPin className="h-3.5 w-3.5 text-white/40 shrink-0" />
                                  <span>{item.venue_name || item.location}</span>
                                </p>

                                {item.reward && (
                                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                                    <Gift className="h-3 w-3" /> <span>{item.reward}</span>
                                  </div>
                                )}

                                <SocialGraphFacepile claimedCount={18} />
                              </div>
                            </div>

                            <div className="p-4 pt-0">
                              <Button asChild variant="outline" className="w-full rounded-2xl border-white/15 bg-white/5 text-white hover:bg-primary hover:border-primary font-bold text-xs transition-all">
                                <Link to={`/moments/${item.id}`}>View Event & RSVP</Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* TAB 2: PLACES & VENUES */}
            {activeTab === "places" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">Curated Places & Cultural Venues</h3>
                    <p className="text-xs text-white/50">Verified restaurants, lounges, and partner spots with member perks.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {CURATED_KINGSTON_MOMENTS.map((spot) => (
                    <div
                      key={spot.id}
                      className="group p-5 rounded-3xl border border-white/10 bg-white/5 hover:border-primary/40 transition flex flex-col justify-between space-y-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-2xl overflow-hidden bg-black shrink-0 relative">
                          <img src={spot.image} alt={spot.title} className="h-full w-full object-cover" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-bold">
                            Verified Venue
                          </Badge>
                          <h4 className="text-base font-bold text-white truncate">{spot.venueName}</h4>
                          <p className="text-xs text-white/60 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-primary shrink-0" />
                            <span className="truncate">{spot.location}</span>
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                        {spot.description}
                      </p>
                      <Button asChild variant="outline" className="w-full rounded-2xl border-white/15 bg-white/5 text-white hover:bg-primary hover:border-primary font-bold text-xs">
                        <Link to={`/moments/${spot.id}`}>Explore Venue Perks</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: COMMUNITY POLLS & DROPS */}
            {activeTab === "polls" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <span className="px-3 py-1 bg-gradient-to-r from-primary/20 to-amber-500/20 text-primary border border-primary/40 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm inline-flex">
                      <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      ⚡ Live City Drops & Community Unlocks
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1.5">Rally & Unlock Secret Drops</h3>
                    <p className="text-xs text-white/60">Every vote charges the city battery to unlock exclusive tasting passes and VIP access.</p>
                  </div>
                  <AskQuestionModal
                    trigger={
                      <Button className="rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs shadow-lg shadow-primary/20 flex items-center gap-1.5 px-4 h-10 shrink-0">
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
                        console.log("Voted on discover page:", qId, optId);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Discovery Rail */}
          <DiscoverRightRail
            onToggleMap={() => setViewMode((v) => (v === "map" ? "grid" : "map"))}
            isMapMode={viewMode === "map"}
          />
        </div>

        {/* Modals */}
        <SpinWheelModal isOpen={wheelOpen} onClose={() => setWheelOpen(false)} />
        <DailyRewardsModal isOpen={streakOpen} onClose={() => setStreakOpen(false)} />
      </div>
    </div>
  );
};

export default Discover;
