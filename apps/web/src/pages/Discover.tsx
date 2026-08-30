import { Link, useSearchParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Compass,
  Gift,
  MapPin,
  Plus,
  Radio,
  Sparkles,
  Store,
  Ticket,
  Users,
  Share2,
} from "lucide-react";
import { getSiteUrl } from "@/lib/discovery";
import { PromorangMap, MapMarkerItem } from "@/components/PromorangMap";
import { StoryGamificationRail } from "@/components/StoryGamificationRail";
import { SpinWheelModal } from "@/components/SpinWheelModal";
import { DailyRewardsModal } from "@/components/DailyRewardsModal";
import { DiscoverRightRail } from "@/components/discovery/DiscoverRightRail";
import { useMarket } from "@/contexts/MarketContext";
import { getCityHubCenter, getDefaultCityHub, matchesCityHub } from "@/lib/city-hubs";
import { CURATED_KINGSTON_MOMENTS } from "@/lib/curated-radar";
import { getMomentStatus } from "@/lib/moment-recurrence";
import { DISCOVERY_POLLS, type DiscoveryPoll } from "@/data/discoveriesData";
import { DiscoveryPath } from "@/components/discovery/DiscoveryPath";
import { filterDiscoveryPollsForHub, isDiscoverLensId, mergeDiscoveryPolls } from "@/lib/discovery-path";
import { toast } from "sonner";
import { castListingDiscoveryVote, useListingDiscoveryPolls } from "@/hooks/useListingDiscoveryPolls";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { VERIFIED_VENUES } from "@/data/venuesData";
import { usePerks } from "@/hooks/usePerks";
import { PerkCard } from "@/components/perks/PerkCard";
import { PostPerkModal } from "@/components/merchant/PostPerkModal";
import { ThingsWorthSharingFeed } from "@/components/creator/ThingsWorthSharingFeed";
import { GlobalTicketBalancePill } from "@/components/promoshare/GlobalTicketBalancePill";
import { EmptyState } from "@/components/ui/EmptyState";
import { NextMoveStrip } from "@/components/journey/NextMoveStrip";
import { getMemberNextMove } from "@/lib/member-next-move";
import { useI18n } from "@/i18n/I18nContext";
import { useAuth } from "@/contexts/AuthContext";

const categoryFilters = [
  { id: "all", label: "All Drops", icon: Sparkles },
  { id: "food", label: "Food & Drinks", icon: Gift },
  { id: "music", label: "Music & Nightlife", icon: Radio },
  { id: "community", label: "Gatherings & Culture", icon: Users },
];

const CURATED_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Kingston & St. Andrew
  "00000000-0000-0000-0002-000000000060": { lat: 18.0435, lng: -76.8123 },
  "00000000-0000-0000-0002-000000000001": { lat: 18.0267, lng: -76.7924 },
  "00000000-0000-0000-0002-000000000002": { lat: 18.0267, lng: -76.7924 },
  "00000000-0000-0000-0002-000000000025": { lat: 18.0270, lng: -76.7925 },
  "00000000-0000-0000-0002-000000000026": { lat: 18.0163, lng: -76.7915 },
  "00000000-0000-0000-0002-000000000022": { lat: 18.0163, lng: -76.7915 },
  "00000000-0000-0000-0002-000000000023": { lat: 18.0065, lng: -76.7865 },
  "00000000-0000-0000-0002-000000000017": { lat: 18.0210, lng: -76.7725 },
  "00000000-0000-0000-0002-000000000018": { lat: 18.0145, lng: -76.7842 },
  "00000000-0000-0000-0002-000000000004": { lat: 18.0489, lng: -76.7587 },
  "00000000-0000-0000-0002-000000000005": { lat: 18.0163, lng: -76.7915 },
  "00000000-0000-0000-0002-000000000006": { lat: 18.0038, lng: -76.7885 },
  "00000000-0000-0000-0002-000000000015": { lat: 17.9678, lng: -76.7910 },

  // Ocho Rios & St. Ann
  "00000000-0000-0000-0002-000000000051": { lat: 18.4356, lng: -77.1645 },
  "00000000-0000-0000-0002-000000000052": { lat: 18.4356, lng: -77.1645 },

  // Montego Bay (St. James)
  "00000000-0000-0000-0002-000000000071": { lat: 18.4716, lng: -77.9255 },
  "00000000-0000-0000-0002-000000000072": { lat: 18.4839, lng: -77.9272 },
  "00000000-0000-0000-0002-000000000073": { lat: 18.5208, lng: -77.8281 },
};

const DEFAULT_DISCOVER_CENTER = { lat: 18.0179, lng: -76.8099 };


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

const HubEmptyState = ({
  cityName,
  noun,
  onShowLiveHub,
}: {
  cityName: string;
  noun: string;
  onShowLiveHub: () => void;
}) => {
  const { t } = useI18n();
  const { user } = useAuth();
  const isLiveHub = cityName.toLowerCase().includes("kingston");
  const nextMove = getMemberNextMove({
    signedIn: Boolean(user),
    emptyDiscover: true,
    canCreate: Boolean(user),
  });
  return (
    <div className="space-y-4">
      <NextMoveStrip move={nextMove} />
      <EmptyState
        icon={MapPin}
        title={
          isLiveHub
            ? t("empty.discoverQuietTitle", { city: cityName })
            : t("empty.discoverTitle", { noun, city: cityName })
        }
        description={isLiveHub ? t("empty.discoverQuietCopy") : t("empty.discoverCopy")}
        unlock={isLiveHub ? t("empty.discoverQuietUnlock") : t("empty.discoverUnlock")}
        actionLabel={isLiveHub ? undefined : t("empty.discoverCta")}
        onAction={isLiveHub ? undefined : onShowLiveHub}
        className="border-white/10 bg-white/[0.04] text-white"
      />
    </div>
  );
};

type DiscoverTab = "discoveries" | "perks" | "moments" | "distribute" | "places";

const Discover = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const { city, setCity } = useMarket();
  const { data: preferences } = useUserPreferences();
  const { data: listingPolls = [] } = useListingDiscoveryPolls(12);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as DiscoverTab) || "discoveries";
  const lensParam = searchParams.get("lens");

  const [activeTab, setActiveTab] = useState<DiscoverTab>(initialTab);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [livePolls, setLivePolls] = useState<DiscoveryPoll[]>(DISCOVERY_POLLS);

  const [wheelOpen, setWheelOpen] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);
  const [postPerkOpen, setPostPerkOpen] = useState(false);

  const { perks, isLoading: perksLoading } = usePerks(activeCategory);

  useEffect(() => {
    const tabParam = searchParams.get("tab") as DiscoverTab;
    if (tabParam && ["discoveries", "perks", "moments", "distribute", "places"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: DiscoverTab) => {
    setActiveTab(tab);
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    setSearchParams(next);
  };

  const discoveryQuery = useQuery({
    queryKey: ["discover-public-feed-v3"],
    queryFn: async () => {
      const { data: momentsData } = await supabase
        .from("moments")
        .select("*")
        .order("starts_at", { ascending: true })
        .limit(100);

      const dbMoments = (momentsData || []).map((m) => {
        let lat = Number(m.latitude);
        let lng = Number(m.longitude);

        const isInvalid = !Number.isFinite(lat) || !Number.isFinite(lng) || (Math.abs(lat) < 1 && Math.abs(lng) < 1);
        if (isInvalid) {
          const curated = CURATED_COORDINATES[m.id];
          if (curated) {
            lat = curated.lat;
            lng = curated.lng;
          } else {
            const venue = VERIFIED_VENUES.find(
              (v) =>
                v.name.toLowerCase() === (m.venue_name || "").toLowerCase() ||
                (m.location || "").toLowerCase().includes(v.name.toLowerCase()) ||
                (m.title || "").toLowerCase().includes(v.name.toLowerCase())
            );
            if (venue) {
              lat = venue.latitude;
              lng = venue.longitude;
            } else {
              lat = DEFAULT_DISCOVER_CENTER.lat;
              lng = DEFAULT_DISCOVER_CENTER.lng;
            }
          }
        }

        return {
          ...m,
          latitude: lat,
          longitude: lng,
        };
      });

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

  const moments = useMemo(() => discoveryQuery.data || [], [discoveryQuery.data]);
  const hubMoments = useMemo(
    () => moments.filter((m) => matchesCityHub(m, city)),
    [moments, city],
  );
  const hubVenues = useMemo(
    () => VERIFIED_VENUES.filter((venue) => matchesCityHub(venue, city)),
    [city],
  );
  const catalog = useMemo(
    () => mergeDiscoveryPolls(livePolls, listingPolls),
    [livePolls, listingPolls],
  );
  const hubDiscoveries = useMemo(
    () => filterDiscoveryPollsForHub(catalog, city),
    [catalog, city],
  );
  const hubPerks = useMemo(
    () =>
      perks.filter((perk) =>
        matchesCityHub(
          {
            title: perk.title,
            description: perk.description,
            location: perk.merchantLocation,
            venue_name: perk.merchantName,
          },
          city,
        ),
      ),
    [perks, city],
  );
  const filteredMoments = useMemo(() => {
    const matched = hubMoments.filter((m) => {
      const matchesCategory = activeCategory === "all" || (m.category || "").toLowerCase().includes(activeCategory);
      const matchesSearch =
        !searchQuery ||
        (m.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.location || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    return [...matched].sort((a, b) => {
      const statusA = getMomentStatus(a);
      const statusB = getMomentStatus(b);
      if (statusA.isPast !== statusB.isPast) {
        return statusA.isPast ? 1 : -1;
      }
      return new Date(statusA.displayStartsAt).getTime() - new Date(statusB.displayStartsAt).getTime();
    });
  }, [hubMoments, activeCategory, searchQuery]);

  const featuredMoment = filteredMoments[0] || null;

  const mapMarkers = useMemo<MapMarkerItem[]>(() => {
    const markers: MapMarkerItem[] = [];
    const seenIds = new Set<string>();

    filteredMoments.forEach((m) => {
      const lat = Number(m.latitude);
      const lng = Number(m.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng) && !(Math.abs(lat) < 0.5 && Math.abs(lng) < 0.5)) {
        if (!seenIds.has(m.id)) {
          seenIds.add(m.id);
          markers.push({
            id: m.id,
            lat,
            lng,
            title: m.title,
            subtitle: m.venue_name || m.location || undefined,
            category: m.category || "Moment & Event",
            reward: m.reward || undefined,
            imageUrl: m.image_url || undefined,
            url: `/moments/${m.slug || m.id}`,
            actionLabel: "View & RSVP →",
          });
        }
      }
    });

    hubVenues.forEach((v) => {
      const matchesSearch =
        !searchQuery ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.location.toLowerCase().includes(searchQuery.toLowerCase());

      if (matchesSearch && !seenIds.has(v.id)) {
        seenIds.add(v.id);
        markers.push({
          id: v.id,
          lat: v.latitude,
          lng: v.longitude,
          title: v.name,
          subtitle: `${v.city} · ${v.venue_type_label}`,
          category: "Verified Partner Venue",
          reward: "Member Perks Available",
          imageUrl: v.image_url,
          url: `/venues/${v.id}`,
          actionLabel: "View Venue →",
        });
      }
    });

    return markers;
  }, [filteredMoments, hubVenues, searchQuery]);

  const mapCenter = useMemo(() => {
    if (mapMarkers.length > 0) {
      return { lat: mapMarkers[0].lat, lng: mapMarkers[0].lng };
    }
    return getCityHubCenter(city);
  }, [mapMarkers, city]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-primary selection:text-white pb-16">
      <SEO
        title="Discover Culture, Perks & Opportunities — Promorang"
        description="Discover what is worth doing, choosing, and sharing. Vote on community demand signals, unlock verified perks, and promote culture drops."
        url={getSiteUrl("/discover")}
      />

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        
        {/* Market Architecture Header Row */}
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between border-b border-white/10 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge className="rounded-full bg-primary text-white font-black text-[10px] uppercase tracking-wider border-none">
                People → Discover
              </Badge>
              <span className="text-xs text-white/50 font-semibold">{city.name}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {activeTab === "discoveries"
                ? t("discover.pathPageTitle")
                : "Discover What's Worth Doing & Choosing"}
            </h1>
            <p className="text-white/60 text-xs sm:text-sm max-w-xl">
              {activeTab === "discoveries"
                ? t("discover.pathPageCopy")
                : "Answer one relevant choice, unlock partner Perks, RSVP to live moments, or share them to earn draw tickets."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Global Ticket & Points Balance Ticker */}
            <GlobalTicketBalancePill />

            {/* Merchant Post a Perk Quick Button */}
            <Button
              onClick={() => setPostPerkOpen(true)}
              className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-black font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 h-10 px-4"
            >
              <Store className="w-4 h-4" />
              <span>Post a Perk</span>
            </Button>
          </div>
        </div>

        {/* 3-Sided Market Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => handleTabChange("discoveries")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === "discoveries"
                ? "bg-primary text-white shadow-lg shadow-primary/25"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Compass className="h-4 w-4 text-amber-400" />
            <span>{t("discover.pathTab")}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold">
              {t("discover.pathTabBadge")}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("perks")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === "perks"
                ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/25 font-black"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Gift className="h-4 w-4" />
            <span>2. Perks & Drops</span>
            <span className="px-1.5 py-0.5 rounded-full bg-black/30 text-[10px]">
              {hubPerks.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("moments")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === "moments"
                ? "bg-primary text-white shadow-lg shadow-primary/25"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Ticket className="h-4 w-4" />
            <span>3. Moments & Events</span>
            <span className="px-1.5 py-0.5 rounded-full bg-black/30 text-[10px]">
              {hubMoments.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("distribute")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === "distribute"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25 font-black"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Share2 className="h-4 w-4 text-purple-300" />
            <span>4. Things to Share</span>
            <span className="px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">
              Earn Tickets
            </span>
          </button>

          <button
            onClick={() => handleTabChange("places")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === "places"
                ? "bg-primary text-white shadow-lg shadow-primary/25"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Store className="h-4 w-4" />
            <span>Places & Venues</span>
          </button>
        </div>

        {/* Gamification Highlights */}
        <StoryGamificationRail
          onOpenWheel={() => setWheelOpen(true)}
          onOpenStreak={() => setStreakOpen(true)}
        />

        {/* Main Content Layout with Right Rail */}
        <div className="flex gap-8 items-start">
          <div className="flex-1 space-y-8 min-w-0">

            {activeTab === "discoveries" && (
              <div className="space-y-6">
                {hubDiscoveries.length > 0 ? (
                  <DiscoveryPath
                    polls={hubDiscoveries}
                    cityName={city.name}
                    preferredCategories={preferences?.preferred_categories || []}
                    initialLens={isDiscoverLensId(lensParam) ? lensParam : null}
                    initialQuery={searchParams.get("q")}
                    onQuestionCreated={(newQ) => {
                      setLivePolls((prev) => [newQ as DiscoveryPoll, ...prev]);
                    }}
                    onCastVote={async (poll, optionId) => {
                      if (!poll.detailUrl) return;
                      if (!user) {
                        toast.info("Sign in to verify local place information.");
                        return;
                      }
                      try {
                        await castListingDiscoveryVote(poll.id, optionId);
                      } catch (error: any) {
                        toast.error(error?.message?.includes("duplicate") ? "You already voted on this place." : "We couldn't record that vote.");
                      }
                    }}
                  />
                ) : (
                  <HubEmptyState
                    cityName={city.name}
                    noun="choices for you"
                    onShowLiveHub={() => setCity(getDefaultCityHub())}
                  />
                )}
              </div>
            )}

            {/* TAB 2: PERKS & DROPS (BUSINESS OFFER WEDGE) */}
            {activeTab === "perks" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                      <Store className="w-3.5 h-3.5" />
                      <span>Businesses → Offer</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1.5">
                      Verified Perks, Discounts & Complimentary Drops
                    </h3>
                    <p className="text-xs text-white/60">
                      Claim passes, discounts, and VIP upgrades. Show your QR code at the merchant to redeem in real life.
                    </p>
                  </div>

                  <Button
                    onClick={() => setPostPerkOpen(true)}
                    className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-black font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 h-10 px-4 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post a Perk</span>
                  </Button>
                </div>

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
                            ? "bg-emerald-500 text-black shadow-md font-black"
                            : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                {perksLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((n) => (
                      <Skeleton key={n} className="h-80 w-full rounded-3xl bg-white/5" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {hubPerks.map((perk) => (
                      <PerkCard key={perk.id} perk={perk} />
                    ))}
                  </div>
                )}
                {!perksLoading && hubPerks.length === 0 && (
                  <HubEmptyState
                    cityName={city.name}
                    noun="perks"
                    onShowLiveHub={() => setCity(getDefaultCityHub())}
                  />
                )}
              </div>
            )}

            {/* TAB 3: MOMENTS & EVENTS */}
            {activeTab === "moments" && (
              <>
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

                {featuredMoment && !searchQuery && activeCategory === "all" && viewMode === "grid" && (
                  <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-black min-h-[340px] sm:min-h-[380px] flex items-end p-5 sm:p-8">
                    <img
                      src={featuredMoment.image_url || undefined}
                      alt={featuredMoment.title}
                      className="absolute inset-0 h-full w-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="relative z-10 space-y-3 max-w-xl">
                      <Badge className="bg-primary text-white font-bold text-xs">Featured Moment</Badge>
                      <h2 className="text-2xl sm:text-4xl font-black text-white">{featuredMoment.title}</h2>
                      <p className="text-xs sm:text-sm text-white/70">{featuredMoment.description}</p>
                      <Button asChild className="rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-xs px-6 py-2.5">
                        <Link to={`/moments/${featuredMoment.id}`}>View Moment &amp; RSVP →</Link>
                      </Button>
                    </div>
                  </div>
                )}

                {viewMode === "map" ? (
                  <div className="overflow-hidden rounded-3xl border border-white/10">
                    <PromorangMap
                      center={mapCenter}
                      zoom={city.id === "all-jamaica" ? 8 : 12}
                      markers={mapMarkers}
                      height="520px"
                    />
                  </div>
                ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {filteredMoments.map((item) => {
                    const status = getMomentStatus(item);
                    return (
                      <div
                        key={item.id}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition-all hover:border-primary/40 hover:bg-white/10 hover:shadow-xl"
                      >
                        <div className="relative h-44 w-full overflow-hidden bg-black">
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white border border-white/10 text-[10px] font-bold uppercase">
                            {item.category || "Gathering"}
                          </Badge>
                        </div>

                        <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{formatMomentDate(status.displayStartsAt)}</span>
                            </div>
                            <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                              {item.title}
                            </h3>
                            <p className="text-xs text-white/60 flex items-center gap-1.5 line-clamp-1">
                              <MapPin className="h-3.5 w-3.5 text-white/40 shrink-0" />
                              <span>{item.venue_name || item.location}</span>
                            </p>
                          </div>
                        </div>

                        <div className="p-4 pt-0">
                          <Button asChild variant="outline" className="w-full rounded-2xl border-white/15 bg-white/5 text-white hover:bg-primary hover:border-primary font-bold text-xs">
                            <Link to={`/moments/${item.id}`}>{status.actionLabel}</Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                )}
                {filteredMoments.length === 0 && (
                  <HubEmptyState
                    cityName={city.name}
                    noun="Moments"
                    onShowLiveHub={() => setCity(getDefaultCityHub())}
                  />
                )}
              </>
            )}

            {/* TAB 4: THINGS WORTH SHARING (CREATOR / DISTRIBUTOR WEDGE) */}
            {activeTab === "distribute" && (
              <ThingsWorthSharingFeed />
            )}

            {/* TAB 5: PLACES & VENUES */}
            {activeTab === "places" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">Curated Places & Cultural Venues</h3>
                    <p className="text-xs text-white/50">Verified partner venues in {city.name}.</p>
                  </div>
                  <span className="text-xs font-semibold text-white/50">{hubVenues.length} verified spots</span>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {hubVenues.map((venue) => (
                    <div
                      key={venue.id}
                      className="group p-5 rounded-3xl border border-white/10 bg-white/5 hover:border-primary/40 transition flex flex-col justify-between space-y-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-2xl overflow-hidden bg-black shrink-0 relative">
                          <img src={venue.image_url} alt={venue.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-bold">
                              {venue.city}
                            </Badge>
                            <Badge variant="outline" className="border-white/15 text-white/60 text-[10px]">
                              {venue.venue_type_label}
                            </Badge>
                          </div>
                          <h4 className="text-base font-bold text-white truncate">{venue.name}</h4>
                          <p className="text-xs text-white/60 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-primary shrink-0" />
                            <span className="truncate">{venue.location}</span>
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                        {venue.vibe}
                      </p>
                      <Button asChild variant="outline" className="w-full rounded-2xl border-white/15 bg-white/5 text-white hover:bg-primary hover:border-primary font-bold text-xs">
                        <a href={`https://maps.google.com/?q=${venue.latitude},${venue.longitude}`} target="_blank" rel="noopener noreferrer">
                          View Location &amp; Directions ↗
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
                {hubVenues.length === 0 && (
                  <HubEmptyState
                    cityName={city.name}
                    noun="venues"
                    onShowLiveHub={() => setCity(getDefaultCityHub())}
                  />
                )}
              </div>
            )}

          </div>

          {/* Right Discovery Rail */}
          <DiscoverRightRail
            onToggleMap={() => setViewMode((v) => (v === "map" ? "grid" : "map"))}
            isMapMode={viewMode === "map"}
            moments={filteredMoments}
            cityName={city.name}
          />
        </div>

        {/* Modals */}
        <PostPerkModal
          open={postPerkOpen}
          onOpenChange={setPostPerkOpen}
          onCreated={() => handleTabChange("perks")}
        />
        <SpinWheelModal isOpen={wheelOpen} onClose={() => setWheelOpen(false)} />
        <DailyRewardsModal isOpen={streakOpen} onClose={() => setStreakOpen(false)} />
      </div>
    </div>
  );
};

export default Discover;
