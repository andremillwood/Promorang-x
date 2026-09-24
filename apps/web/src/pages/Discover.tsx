import { DiscoveriesFeedSection } from "@/components/discovery/DiscoveriesFeedSection";
import { Link, useSearchParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
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
  Filter,
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
  Tag,
  Share2,
  X,
} from "lucide-react";
import { getSiteUrl } from "@/lib/discovery";
import { SubmitDiscoveryModal } from "@/components/discovery/SubmitDiscoveryModal";
import { PromorangMap, MapMarkerItem } from "@/components/PromorangMap";
import { applyEncoreSchedule, authEntryHref, ENCORE_END_ISO, ENCORE_RECURRENCE, ENCORE_START_ISO, getStakeholderLens, isEncoreRecord, worldObjectState } from "@promorang/shared";
import { DiscoverRightRail } from "@/components/discovery/DiscoverRightRail";
import { useMarket } from "@/contexts/MarketContext";
import { getCityHubCenter, getDefaultCityHub, matchesCityHub } from "@/lib/city-hubs";
import { CURATED_KINGSTON_MOMENTS } from "@/lib/curated-radar";
import { getMomentStatus } from "@/lib/moment-recurrence";
import type { DiscoveryPoll } from "@/data/discoveriesData";
import { AimedDiscoverLead } from "@/components/discovery/AimedDiscoverLead";
import { StakeholderSurfaceLead } from "@/components/people/StakeholderLoop";
import { DiscoveryPath } from "@/components/discovery/DiscoveryPath";
import { filterDiscoveryPollsForHub, isDiscoverLensId, mergeDiscoveryPolls } from "@/lib/discovery-path";
import { resolveStoredPromoCardAim, writePromoCardAim } from "@/lib/promocard-aim";
import { toast } from "sonner";
import { castListingDiscoveryVote } from "@/hooks/useListingDiscoveryPolls";
import { useDiscoveryDemand } from "@/hooks/useDiscoveryDemand";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useAuth } from "@/contexts/AuthContext";
import { useNearbyBenefits } from "@/hooks/usePeopleExperience";
import { LivePerkCard } from "@/components/perks/LivePerkCard";
import { ThingsWorthSharingFeed } from "@/components/creator/ThingsWorthSharingFeed";
import { GlobalTicketBalancePill } from "@/components/promoshare/GlobalTicketBalancePill";
import { useI18n } from "@/i18n/I18nContext";
import { merchantAuthHref } from "@/lib/merchant-demand";
import { useContentDrops } from "@/hooks/useContentDistribution";
import { LiveReleaseSignal } from "@/components/content/LiveReleaseSignal";
import { PublicDiscoverExperience } from "@/components/discovery/PublicDiscoverExperience";
import { TasteCalibration } from "@/components/promorang/TasteCalibration";

const categoryFilters = [
  { id: "all", key: "discover.filterAllDrops" as const, icon: Sparkles },
  { id: "food", key: "discover.filterFood" as const, icon: Gift },
  { id: "music", key: "discover.filterMusic" as const, icon: Radio },
  { id: "community", key: "discover.filterCommunity" as const, icon: Users },
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

type PublicVenue = {
  id: string;
  slug?: string | null;
  name?: string | null;
  description?: string | null;
  location?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  venue_type?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  image_url?: string | null;
  verification_status?: string | null;
  listing_status?: string | null;
};

const formatMomentDate = (value: string | null | undefined, locale: string, tba: string) => {
  if (!value) return tba;
  try {
    return new Intl.DateTimeFormat(locale === "es-419" ? "es-419" : locale === "pt-BR" ? "pt-BR" : "en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return tba;
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
  const isLiveHub = cityName.toLowerCase().includes("kingston");
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 text-center">
      <MapPin className="mx-auto h-8 w-8 text-primary" />
      <h3 className="mt-4 text-lg font-black text-white">{t("discover.emptyTitle", { noun, city: cityName })}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-white/60">
        {isLiveHub ? t("discover.emptyLive") : t("discover.emptyWarming")}
      </p>
      {!isLiveHub && (
        <Button onClick={onShowLiveHub} className="mt-5 rounded-2xl bg-primary text-white font-bold">
          {t("discover.browseKingston")}
        </Button>
      )}
    </div>
  );
};

type DiscoverTab = "discoveries" | "perks" | "moments" | "distribute" | "places";

const SignedInDiscover = () => {
  const { t, locale, formatNumber } = useI18n();
  const { user, activeRole } = useAuth();
  const { city, country, setCity } = useMarket();
  const { data: preferences } = useUserPreferences();
  const demand = useDiscoveryDemand(
    city.name,
    country.slug || "jamaica",
    city.id === "all-jamaica" ? undefined : city.id,
  );
  const marketPolls = demand.polls as DiscoveryPoll[];
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: DiscoverTab = ["discoveries", "perks", "moments", "distribute", "places"].includes(tabParam || "") ? tabParam as DiscoverTab : "discoveries";
  const lensParam = searchParams.get("lens");
  const aim = resolveStoredPromoCardAim(searchParams);

  useEffect(() => {
    if (aim) writePromoCardAim(aim);
  }, [aim]);

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") || "");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [livePolls, setLivePolls] = useState<DiscoveryPoll[]>([]);

  const nearby = useNearbyBenefits();
  const contentDrops = useContentDrops("active");
  const releaseDrops = contentDrops.data || [];
  const perksLoading = nearby.isLoading;
  const livePerks = useMemo(() => nearby.data || [], [nearby.data]);
  const stake = getStakeholderLens(searchParams.get("role") || activeRole);
  const putPerkUpHref = merchantAuthHref(user, "/stock");
  const putInHref = user ? stake.putIn.href : authEntryHref({ next: stake.putIn.href });

  const handleTabChange = (tab: DiscoverTab) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    setSearchParams(next);
  };

  const discoveryQuery = useQuery({
    queryKey: ["discover-public-feed-v3"],
    queryFn: async () => {
      const { data: momentsData, error } = await supabase
        .from("moments")
        .select("*")
        .order("starts_at", { ascending: true })
        .limit(100);

      if (error) throw error;
      const scheduledDbMoments = (momentsData || []).map((moment) => applyEncoreSchedule(moment));

      // Editorial fixtures are a design/dev aid only. Production discovery is
      // intentionally empty when authoritative Moment inventory is empty.
      const curatedAsMoments = import.meta.env.DEV
        ? CURATED_KINGSTON_MOMENTS.map((cm) => {
            const coords = CURATED_COORDINATES[cm.id] || DEFAULT_DISCOVER_CENTER;
            const isEncore = isEncoreRecord(cm);
            return applyEncoreSchedule({
              id: cm.id,
              host_id: "editorial",
              title: cm.title,
              description: cm.description,
              category: cm.intentType === "ATTEND" ? "Music & Parties" : cm.intentType === "TRY" ? "Food & Drinks" : "Gatherings & Culture",
              location: cm.location,
              venue_name: cm.venueName,
              latitude: coords.lat,
              longitude: coords.lng,
              starts_at: isEncore ? ENCORE_START_ISO : new Date(Date.now() + 86400000).toISOString(),
              ends_at: isEncore ? ENCORE_END_ISO : null,
              max_participants: 50,
              reward: null,
              image_url: cm.image,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...(isEncore ? ENCORE_RECURRENCE : {}),
            });
          })
        : [];

      const seenTitles = new Set(scheduledDbMoments.map((m) => m.title.toLowerCase()));
      const hasDbEncore = scheduledDbMoments.some((moment) => isEncoreRecord(moment));
      const filteredCurated = curatedAsMoments.filter((cm) => {
        if (hasDbEncore && isEncoreRecord(cm)) return false;
        if (seenTitles.has(cm.title.toLowerCase())) return false;
        const hay = `${cm.title} ${cm.description}`.toLowerCase();
        return !hay.includes("arla");
      });

      return [...filteredCurated, ...scheduledDbMoments];
    },
  });

  const venuesQuery = useQuery({
    queryKey: ["discover-public-venues-v1"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("view_public_venue_directory")
        .select("*")
        .order("popularity_score", { ascending: false, nullsFirst: false })
        .limit(200);
      if (error) throw error;
      return (data || []) as PublicVenue[];
    },
  });

  const moments = useMemo(() => discoveryQuery.data || [], [discoveryQuery.data]);
  const hubMoments = useMemo(
    () => moments.filter((m) => matchesCityHub(m, city)),
    [moments, city],
  );
  const hubVenues = useMemo(
    () => (venuesQuery.data || []).filter((venue) => matchesCityHub(venue, city)),
    [venuesQuery.data, city],
  );
  const catalog = useMemo(
    () => mergeDiscoveryPolls(livePolls, marketPolls),
    [livePolls, marketPolls],
  );
  const hubDiscoveries = useMemo(
    () => filterDiscoveryPollsForHub(catalog, city),
    [catalog, city],
  );
  const hubPerks = useMemo(
    () =>
      livePerks.filter((perk) => {
        const needle = searchQuery.trim().toLowerCase();
        if (needle) {
          const haystack = `${perk.title || ""} ${perk.detail || ""} ${perk.issuer?.type || ""} ${perk.surface || ""}`.toLowerCase();
          if (!needle.split(/\s+/).every((token) => haystack.includes(token))) return false;
        }
        if (activeCategory !== "all") {
          const haystack = `${perk.title || ""} ${perk.detail || ""} ${perk.issuer?.type || ""} ${perk.surface || ""}`.toLowerCase();
          if (!haystack.includes(activeCategory.toLowerCase())) return false;
        }
        return true;
      }),
    [livePerks, activeCategory, searchQuery],
  );
  const filteredVenues = useMemo(() => {
    const tokens = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return hubVenues.filter((venue) => {
      const haystack = `${venue.name || ""} ${venue.description || ""} ${venue.location || ""} ${venue.address || ""} ${venue.city || ""} ${venue.venue_type || ""}`.toLowerCase();
      const matchesSearch = tokens.length === 0 || tokens.every((token) => haystack.includes(token));
      const matchesCategory = activeCategory === "all" || haystack.includes(activeCategory);
      return matchesSearch && matchesCategory;
    });
  }, [hubVenues, searchQuery, activeCategory]);
  const localPerks = useMemo(
    () => hubPerks.filter((perk) => perk.availability !== "anywhere"),
    [hubPerks],
  );
  const anywherePerks = useMemo(
    () => hubPerks.filter((perk) => perk.availability === "anywhere"),
    [hubPerks],
  );
  const filteredMoments = useMemo(() => {
    const matched = hubMoments.filter((m) => {
      const matchesCategory = activeCategory === "all" || (m.category || "").toLowerCase().includes(activeCategory);
      const haystack = `${m.title || ""} ${m.description || ""} ${m.category || ""} ${m.location || ""} ${m.venue_name || ""} ${m.reward || ""}`.toLowerCase();
      const tokens = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
      const matchesSearch = tokens.length === 0 || tokens.every((token) => haystack.includes(token));
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

  const nextMoment = filteredMoments[0] || null;

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
            actionLabel: t("discover.viewRsvpArrow"),
          });
        }
      }
    });

    filteredVenues.forEach((v) => {
      const lat = Number(v.latitude);
      const lng = Number(v.longitude);
      if (
        !seenIds.has(v.id) &&
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        !(Math.abs(lat) < 0.5 && Math.abs(lng) < 0.5)
      ) {
        seenIds.add(v.id);
        markers.push({
          id: v.id,
          lat,
          lng,
          title: v.name || "Place",
          subtitle: [v.city, v.venue_type].filter(Boolean).join(" · ") || undefined,
          category: v.verification_status === "verified" ? t("discover.verifiedVenue") : "Place",
          imageUrl: v.image_url || undefined,
          url: `/venues/${v.slug || v.id}`,
          actionLabel: t("discover.viewVenue"),
        });
      }
    });

    return markers;
  }, [filteredMoments, filteredVenues, t]);

  const mapCenter = useMemo(() => {
    if (mapMarkers.length > 0) {
      return { lat: mapMarkers[0].lat, lng: mapMarkers[0].lng };
    }
    return getCityHubCenter(city);
  }, [mapMarkers, city]);

  const isPathExperience = activeTab === "discoveries";

  const path = (
    <DiscoveryPath
      surface="page"
      polls={hubDiscoveries}
      cityName={city.name}
      preferredCategories={preferences?.preferred_categories || []}
      initialLens={isDiscoverLensId(lensParam) ? lensParam : null}
      initialQuery={searchParams.get("q")}
      aim={aim}
      onQuestionCreated={(newQ) => {
        setLivePolls((prev) => [newQ as DiscoveryPoll, ...prev]);
      }}
      onCastVote={async (poll, optionId) => {
        if (!user) {
          toast.info(t("discover.signInVote"));
          throw new Error("Sign in to record this vote.");
        }
        try {
          await castListingDiscoveryVote(poll.id, optionId);
        } catch (error: any) {
          toast.error(error?.message?.includes("duplicate") ? t("discover.alreadyVoted") : t("discover.voteFailed"));
          throw error;
        }
      }}
    />
  );

  if (isPathExperience) {
    return (
      <div className="relative min-h-screen bg-[#0a0a0b] text-white selection:bg-primary selection:text-white">
        <SEO
          title={`${aim ? aim.cardLine.replace(/\.$/, "") : t("discover.pathPageTitle")} | Promorang`}
          description="Discover what is worth knowing, then find something you can do."
          url={getSiteUrl("/discover")}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[46rem] bg-[radial-gradient(circle_at_12%_0%,rgba(255,106,0,.16),transparent_42%),radial-gradient(circle_at_90%_10%,rgba(80,160,140,.08),transparent_34%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-5 sm:px-6 lg:px-8">
          <header className="pb-5 pt-6 sm:pt-10">
            <p className="pr-world-kicker">Discover · {city.name}</p>
            <h1 className="mt-5 max-w-3xl font-serif text-5xl font-bold leading-[.95] tracking-[-.045em] sm:text-7xl">Something worth<br />knowing. Or doing.</h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/60">Follow what catches your eye. Explore local knowledge, see what people want, and find your next move.</p>
          </header>
          <div className="grid gap-5 border-y border-white/15 py-6 sm:grid-cols-2">
            <a href="#discovery-signals" className="group min-h-16"><p className="pr-world-kicker">01 · Signal</p><p className="mt-2 font-serif text-2xl font-bold">What’s worth noticing ↓</p><p className="mt-2 text-sm text-white/55">Discoveries and questions from the community.</p></a>
            <div><p className="pr-world-kicker">02 · Action</p><p className="mt-2 font-serif text-2xl font-bold">Find something to do</p><div className="mt-2 flex flex-wrap gap-5"><button type="button" onClick={() => handleTabChange("moments")} className="min-h-11 text-sm font-bold text-primary">Explore Moments →</button><button type="button" onClick={() => handleTabChange("perks")} className="min-h-11 text-sm text-white/70">Available offers →</button><Link to="/scenes" className="min-h-11 inline-flex items-center text-sm text-white/70">Enter a Scene →</Link></div></div>
          </div>
          <nav aria-label={t("discover.pathPageTitle")} className="mt-6 flex flex-wrap gap-2">
            <p className="w-full text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
              {t("discover.pathAlsoInCity")} · {city.name}
            </p>
            <button type="button" onClick={() => handleTabChange("perks")} className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white/70 hover:border-emerald-400/50 hover:text-white">
              {t("discover.tabPerks")}
            </button>
            <button type="button" onClick={() => handleTabChange("moments")} className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white/70 hover:border-primary/50 hover:text-white">
              {t("discover.tabMoments")}
            </button>
            <button type="button" onClick={() => handleTabChange("distribute")} className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white/70 hover:border-purple-400/50 hover:text-white">
              {t("discover.tabShare")}
            </button>
            <button type="button" onClick={() => handleTabChange("places")} className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white/70 hover:border-primary/50 hover:text-white">
              {t("discover.tabPlaces")}
            </button>
          </nav>
          <div id="discovery-signals" className="mt-8 scroll-mt-8 sm:mt-10 space-y-6">
            <DiscoveriesFeedSection />
            {aim ? <details className="border-t border-white/10 py-4"><summary className="cursor-pointer min-h-11 py-3 text-sm">Explore your interests · {aim.label}</summary><AimedDiscoverLead aim={aim} authenticated={Boolean(user)} />{path}</details> : null}
            <div className="border-b border-white/10 pb-8">
          <TasteCalibration marketLabel={city.name} compact />
        </div>

        <LiveReleaseSignal drops={releaseDrops} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="participant-world min-h-screen bg-[#0a0a0b] text-white selection:bg-primary selection:text-white pb-16">
      <SEO
        title={t("discover.seoTitle")}
        description={stake.world.meaning}
        url={getSiteUrl("/discover")}
      />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between border-b border-white/10 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge className="rounded-full bg-primary text-white font-black text-[10px] uppercase tracking-wider border-none">
                {t("discover.worldBadge", { workspace: stake.workspaceLabel })}
              </Badge>
              <span className="text-xs text-white/50 font-semibold">{city.name}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {stake.world.label === "World" ? t("discover.heroFallback") : stake.world.label}
            </h1>
            <p className="text-white/60 text-xs sm:text-sm max-w-xl">
              {stake.world.meaning}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <Link to="/card" className="inline-flex min-h-11 items-center text-sm text-white/65">Your PromoCard →</Link>
            <Button
              asChild
              className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-black font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 h-10 px-4"
            >
              <Link to={putInHref}>
                <Store className="w-4 h-4" />
                <span>{stake.putIn.label}</span>
              </Link>
            </Button>
          </div>
        </div>

        <LiveReleaseSignal drops={releaseDrops} />

        <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => handleTabChange("discoveries")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
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
            <span>{t("discover.tabPerks")}</span>
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
            <span>{t("discover.tabMoments")}</span>
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
            <span>{t("discover.tabShare")}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">
              Share
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
            <span>{t("discover.tabPlaces")}</span>
          </button>
        </div>

        {activeTab !== "distribute" && (
          <section aria-label="Search and filters" className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-3 shadow-xl shadow-black/10 sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <label className="relative min-w-0 flex-1" htmlFor="signed-in-discover-search">
                <span className="sr-only">Search Discover</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                <input
                  id="signed-in-discover-search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search food, Chinese cuisine, egg fried rice…"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 pl-11 pr-11 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-primary/70 focus:ring-4 focus:ring-primary/10"
                />
                {searchQuery ? <button type="button" onClick={() => setSearchQuery("")} aria-label="Clear search" className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-white/40 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button> : null}
              </label>
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none" aria-label="Filter by category">
                <span className="flex shrink-0 items-center gap-1.5 px-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/35"><Filter className="h-3.5 w-3.5" /> Filter</span>
                {categoryFilters.map((cat) => {
                  const Icon = cat.icon;
                  return <button key={cat.id} type="button" onClick={() => setActiveCategory(cat.id)} aria-pressed={activeCategory === cat.id} className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 text-xs font-bold transition ${activeCategory === cat.id ? "border-primary bg-primary text-white" : "border-white/10 bg-white/[0.04] text-white/55 hover:border-white/25 hover:text-white"}`}><Icon className="h-3.5 w-3.5" />{t(cat.key)}</button>;
                })}
              </div>
            </div>
            {(searchQuery || activeCategory !== "all") && (
              <div className="mt-3 flex flex-col gap-3 border-t border-white/10 px-1 pt-3 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span>Matches in {city.name}:</span>
                  <button type="button" onClick={() => handleTabChange("moments")} className={`rounded-full border px-2.5 py-1 font-bold transition ${activeTab === "moments" ? "border-primary bg-primary/15 text-primary" : "border-white/10 text-white/65 hover:border-primary/50 hover:text-white"}`}>
                    {filteredMoments.length} Moments
                  </button>
                  <button type="button" onClick={() => handleTabChange("places")} className={`rounded-full border px-2.5 py-1 font-bold transition ${activeTab === "places" ? "border-primary bg-primary/15 text-primary" : "border-white/10 text-white/65 hover:border-primary/50 hover:text-white"}`}>
                    {filteredVenues.length} Places
                  </button>
                  <button type="button" onClick={() => handleTabChange("perks")} className={`rounded-full border px-2.5 py-1 font-bold transition ${activeTab === "perks" ? "border-emerald-400 bg-emerald-400/10 text-emerald-300" : "border-white/10 text-white/65 hover:border-emerald-400/50 hover:text-white"}`}>
                    {hubPerks.length} Perks
                  </button>
                </div>
                <button type="button" onClick={() => { setSearchQuery(""); setActiveCategory("all"); }} className="self-start font-bold text-primary hover:text-white sm:self-auto">Reset filters</button>
              </div>
            )}
          </section>
        )}

        <div className="flex gap-8 items-start">
          <div className="flex-1 space-y-8 min-w-0">

            {/* TAB 2: PERKS & DROPS (BUSINESS OFFER WEDGE) */}
            {activeTab === "perks" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                      <Store className="w-3.5 h-3.5" />
                      <span>{t("discover.businessOffer")}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1.5">
                      {t("discover.livePerksIn", { city: city.name })}
                    </h3>
                    <p className="text-xs text-white/60">
                      {t("discover.livePerksCopy")}
                    </p>
                  </div>

                  <Button
                    asChild
                    className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-black font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 h-10 px-4 shrink-0"
                  >
                    <Link to={putPerkUpHref}>
                      <Plus className="w-4 h-4" />
                      <span>{t("discover.putPerkUp")}</span>
                    </Link>
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
                        <span>{t(cat.key)}</span>
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
                ) : nearby.isError ? (
                  <div role="alert" className="border-y border-white/10 py-8"><p>Offers couldn’t load.</p><button type="button" onClick={() => void nearby.refetch()} className="min-h-11 text-primary">Try again</button></div>
                ) : (
                  <div className="space-y-8">
                    {localPerks.length > 0 && (
                      <div className="space-y-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/40">
                          {t("discover.inCity", { city: city.name })}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {localPerks.map((perk) => (
                            <LivePerkCard key={perk.id} perk={perk} />
                          ))}
                        </div>
                      </div>
                    )}
                    {anywherePerks.length > 0 && (
                      <div className="space-y-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/40">
                          {t("discover.anywhere")}
                        </p>
                        <p className="text-xs text-white/50">
                          {t("discover.anywhereCopy")}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {anywherePerks.map((perk) => (
                            <LivePerkCard key={perk.id} perk={perk} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {!perksLoading && !nearby.isError && hubPerks.length === 0 && (
                  <div className="space-y-4">
                    <HubEmptyState
                      cityName={city.name}
                      noun={t("discover.nounPerks")}
                      onShowLiveHub={() => setCity(getDefaultCityHub())}
                    />
                    <Link to={putPerkUpHref} className="block text-center text-sm font-black text-emerald-400">
                      {t("discover.putPerkUpArrow")}
                    </Link>
                  </div>
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
                        <span>{t(cat.key)}</span>
                      </button>
                    );
                  })}
                </div>

                {discoveryQuery.isError ? <div role="alert" className="border-y border-white/10 py-6"><p>Moments couldn’t load.</p><button type="button" onClick={() => void discoveryQuery.refetch()} className="min-h-11 text-primary">Try again</button></div> : discoveryQuery.isLoading ? <p role="status" className="py-6 text-white/60">Loading Moments…</p> : null}
                {nextMoment && !searchQuery && activeCategory === "all" && viewMode === "grid" && (
                  <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-black min-h-[340px] sm:min-h-[380px] flex items-end p-5 sm:p-8">
                    <img
                      src={nextMoment.image_url || undefined}
                      alt={nextMoment.title}
                      className="absolute inset-0 h-full w-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="relative z-10 space-y-3 max-w-xl">
                      <Badge className="bg-primary text-white font-bold text-xs">Up next</Badge>
                      <h2 className="text-2xl sm:text-4xl font-black text-white">{nextMoment.title}</h2>
                      <p className="text-xs sm:text-sm text-white/70">{nextMoment.description}</p>
                      <Button asChild className="rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-xs px-6 py-2.5">
                        <Link to={`/moments/${nextMoment.id}`}>{t("discover.viewRsvp")}</Link>
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
                    const chips = item.host_id === "editorial"
                      ? []
                      : worldObjectState({
                          pulseState: item.pulse_state,
                          startsAt: item.starts_at,
                          sceneTitle: item.scene_title,
                        });
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
                            {item.category || t("discover.gathering")}
                          </Badge>
                        </div>

                        <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{formatMomentDate(status.displayStartsAt, locale, t("discover.tba"))}</span>
                            </div>
                            <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                              {item.title}
                            </h3>
                            <p className="text-xs text-white/60 flex items-center gap-1.5 line-clamp-1">
                              <MapPin className="h-3.5 w-3.5 text-white/40 shrink-0" />
                              <span>{item.venue_name || item.location}</span>
                            </p>
                            {chips.length ? (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {chips.map((chip) => (
                                  <span key={chip} className="rounded-full border border-white/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/55">
                                    {chip}
                                  </span>
                                ))}
                              </div>
                            ) : null}
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
                    noun={t("discover.nounMoments")}
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
                    <h3 className="text-xl font-bold text-white">{t("discover.placesTitle")}</h3>
                    <p className="text-xs text-white/50">{t("discover.placesCopy", { city: city.name })}</p>
                  </div>
                  <span className="text-xs font-semibold text-white/50">{formatNumber(filteredVenues.length)} places</span>
                </div>

                {venuesQuery.isLoading ? (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-56 rounded-3xl bg-white/5" />)}
                  </div>
                ) : venuesQuery.isError ? (
                  <div role="alert" className="rounded-3xl border border-red-400/20 bg-red-400/5 p-6">
                    <p className="text-sm font-bold text-white">Places couldn’t load.</p>
                    <p className="mt-1 text-xs text-white/45">Static venue fixtures are not being substituted.</p>
                    <button type="button" onClick={() => void venuesQuery.refetch()} className="mt-3 min-h-11 text-primary">Try again</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {filteredVenues.map((venue) => (
                      <div
                        key={venue.id}
                        className="group p-5 rounded-3xl border border-white/10 bg-white/5 hover:border-primary/40 transition flex flex-col justify-between space-y-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="h-16 w-16 rounded-2xl overflow-hidden bg-black shrink-0 relative">
                            {venue.image_url ? <img src={venue.image_url} alt={venue.name || ""} className="h-full w-full object-cover" /> : <Store className="m-5 h-6 w-6 text-white/20" />}
                          </div>
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {venue.city ? <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-bold">{venue.city}</Badge> : null}
                              {venue.venue_type ? <Badge variant="outline" className="border-white/15 text-white/60 text-[10px] capitalize">{venue.venue_type.replaceAll("_", " ")}</Badge> : null}
                            </div>
                            <h4 className="text-base font-bold text-white truncate">{venue.name || "Place"}</h4>
                            <p className="text-xs text-white/60 flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-primary shrink-0" />
                              <span className="truncate">{venue.location || venue.address || "Location coming soon"}</span>
                            </p>
                          </div>
                        </div>
                        {venue.description ? <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">{venue.description}</p> : null}
                        <Button asChild variant="outline" className="w-full rounded-2xl border-white/15 bg-white/5 text-white hover:bg-primary hover:border-primary font-bold text-xs">
                          <Link to={`/venues/${venue.slug || venue.id}`}>{t("discover.viewVenue")}</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {!venuesQuery.isLoading && !venuesQuery.isError && filteredVenues.length === 0 && (
                  <HubEmptyState
                    cityName={city.name}
                    noun={t("discover.nounVenues")}
                    onShowLiveHub={() => setCity(getDefaultCityHub())}
                  />
                )}
              </div>
            )}

          </div>

          <DiscoverRightRail
            onToggleMap={() => setViewMode((v) => (v === "map" ? "grid" : "map"))}
            isMapMode={viewMode === "map"}
            moments={filteredMoments}
            cityName={city.name}
          />
        </div>

      </div>
    </div>
  );
};


const Discover = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen bg-[#050505]" />;
  }
  return user ? <SignedInDiscover /> : <PublicDiscoverExperience />;
};

export default Discover;
