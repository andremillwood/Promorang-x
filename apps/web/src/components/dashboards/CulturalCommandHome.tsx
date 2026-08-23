import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Compass,
  Gem,
  KeyRound,
  Layers,
  MapPin,
  Search,
  Sparkles,
  Trophy,
  UserRoundPlus,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useForYouFeed } from "@/hooks/useFeed";
import { useHostedMoments, useJoinedMoments, useParticipantStats } from "@/hooks/useMoments";
import { useUserBalance } from "@/hooks/useEconomy";
import { FeedStream } from "@/components/feed/FeedStream";
import type { FeedIntent } from "@/services/feed";
import { cn } from "@/lib/utils";
import { useMomentJourney } from "@/hooks/useMomentJourney";
import { HomeFeedToggle } from "@/components/feed/HomeFeedToggle";
import { DiscoveriesFeedSection } from "@/components/discovery/DiscoveriesFeedSection";
import { useI18n } from "@/i18n/I18nContext";

import { CURATED_KINGSTON_MOMENTS } from "@/lib/curated-radar";

const CulturalCommandHome = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const { data: balance } = useUserBalance();
  const { data: stats } = useParticipantStats();
  const { data: joinedMoments = [] } = useJoinedMoments();
  const { data: hostedMoments = [] } = useHostedMoments();
  const [activeIntent, setActiveIntent] = useState<FeedIntent | null>(null);
  const feedQuery = useForYouFeed(activeIntent);
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "Explorer";

  const feedLenses: Array<{ label: string; value: FeedIntent | null; description: string }> = [
    { label: t("feed.forYou"), value: null, description: "The strongest mix across your world" },
    { label: t("feed.nearYou"), value: "nearby", description: "People, places, and Moments within reach" },
    { label: t("feed.tonight"), value: "tonight", description: "What is live or starting soon" },
    { label: t("feed.earn"), value: "earn", description: "Drops, proof, offers, and value to unlock" },
  ];

  const upcoming = useMemo(
    () => joinedMoments.filter((moment) => new Date(moment.starts_at) > new Date()).slice(0, 3),
    [joinedMoments],
  );
  const ownedMoments = useMemo(() => {
    const seen = new Set<string>();
    const userMoments = [...hostedMoments, ...joinedMoments].filter((moment) => {
      if (seen.has(moment.id)) return false;
      seen.add(moment.id);
      return true;
    });

    if (userMoments.length > 0) return userMoments;

    // Fallback to top curated Kingston network moments (FAT Wednesdays, Chandon Open House, etc.)
    return CURATED_KINGSTON_MOMENTS.map((cm) => ({
      id: cm.id,
      host_id: "editorial",
      title: cm.title,
      description: cm.description,
      category: cm.intentType === "ATTEND" ? "Music & Parties" : cm.intentType === "TRY" ? "Food & Drinks" : "Gatherings & Culture",
      location: cm.location,
      venue_name: cm.venueName,
      starts_at: new Date().toISOString(),
      ends_at: null,
      max_participants: 50,
      reward: `${cm.pointsReward} Points`,
      image_url: cm.image,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }, [hostedMoments, joinedMoments]);
  const heroMoment = ownedMoments[0] || null;
  const heroJourney = useMomentJourney(heroMoment?.id || null).data;
  const featuredMoments = ownedMoments.slice(0, 6);
  const feedItems = feedQuery.data?.feed || [];

  const trail = [
    { label: "Showed Up", value: stats?.checkedIn || 0, detail: "Moments attended", icon: Check, href: "/profile" },
    { label: "Gems Kept", value: balance?.gems || 0, detail: "Available balance", icon: Gem, href: "/vault" },
    { label: "Access Keys", value: balance?.promokeys || 0, detail: "Invitations & passes", icon: KeyRound, href: "/vault" },
    { label: "Proof Points", value: balance?.points || 0, detail: "Signals created", icon: Sparkles, href: "/growth" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0C] pb-16 text-white selection:bg-amber-400 selection:text-black">
      <HomeFeedToggle />
      {/* Sticky Glass Navigation Bar */}
      <header className="sticky top-0 z-40 mb-6 border-b border-white/10 bg-black/60 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
              <Zap className="h-5 w-5 text-black" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">{t("commandHome.eyebrow")}</p>
              <p className="text-xs font-semibold text-white/70">{t("commandHome.welcome", { name: firstName })}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Balance Pill Badges */}
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/vault" className="flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300 transition hover:bg-amber-400/20">
                <Gem className="h-3.5 w-3.5 text-amber-400" />
                <span>{balance?.gems || 0}</span>
              </Link>
              <Link to="/vault" className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold text-white/80 transition hover:border-white/30">
                <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                <span>{balance?.promokeys || 0}</span>
              </Link>
            </div>

            <Link
              to="/growth/referrals"
              className="hidden h-9 items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 px-4 text-xs font-extrabold text-black shadow-md shadow-amber-500/20 transition hover:scale-[1.02] sm:inline-flex"
            >
              <UserRoundPlus className="h-3.5 w-3.5" />
              {t("commandHome.inviteFriends")}
            </Link>

            <Link
              to="/search"
              aria-label="Search Promorang"
              className="group flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition hover:border-amber-400 hover:text-white sm:h-9 sm:w-48 sm:justify-start sm:px-3"
            >
              <Search className="h-4 w-4 transition group-hover:text-amber-400" />
              <span className="ml-2 hidden text-xs text-white/40 sm:inline">{t("commandHome.searchPlatform")}</span>
            </Link>

            <Link
              to="/activity"
              aria-label="View activity"
              className="relative grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 text-white/70 transition hover:border-amber-400 hover:text-white"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-400" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:space-y-10">
        {/* Hero & Command Suite Section (12-Column Grid Layout) */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
          {/* Main Hero Card (8 Columns) */}
          <div className="relative isolate flex flex-col justify-between overflow-hidden rounded-2xl border border-white/12 bg-[#121317] shadow-2xl lg:col-span-8 min-h-[420px] sm:min-h-[460px]">
            {heroMoment?.image_url ? (
              <img src={heroMoment.image_url} alt="" className="absolute inset-0 h-full w-full object-cover object-center transition duration-700 hover:scale-105" />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.25),transparent_50%),linear-gradient(135deg,#1f140e,#0b0b0e_70%)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
            <div className="absolute left-0 top-0 h-1 w-32 bg-gradient-to-r from-amber-400 to-orange-500" />

            <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8 lg:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-300 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  {heroMoment && hostedMoments.some((item) => item.id === heroMoment.id) ? t("commandHome.hostedByYou") : t("commandHome.featuredMoment")}
                </span>
                <span className="text-xs font-semibold text-white/50">
                  {heroMoment?.venue_name || heroMoment?.location || "Live Access"}
                </span>
              </div>

              <div className="my-6">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <MapPin className="h-3.5 w-3.5" /> {heroMoment?.venue_name || heroMoment?.location || "Global Signal"}
                </p>
                <h1 className="max-w-2xl font-sans text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {heroMoment?.title || "Your next story starts with something real."}
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
                  {heroJourney?.body || heroMoment?.description || "Joined and hosted Moments are synced here in real-time. Connect, participate, and build your digital trail."}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    to={heroJourney?.action.href || (heroMoment ? `/moments/${heroMoment.id}` : "/discover")}
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 px-6 text-xs font-extrabold text-black shadow-lg shadow-amber-500/20 transition hover:scale-[1.02] hover:brightness-110"
                  >
                    {heroJourney?.action.label || (heroMoment ? t("commandHome.openMoment") : t("commandHome.discoverMoments"))} <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/discover"
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 text-xs font-bold text-white backdrop-blur-md transition hover:border-white/40 hover:bg-white/10"
                  >
                    {t("commandHome.explorePlatform")}
                  </Link>
                </div>
              </div>

              {heroMoment && (
                <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-white/15 pt-4 text-xs text-white/60">
                  <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-amber-400" /> {new Date(heroMoment.starts_at).toLocaleString()}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-amber-400" /> {heroMoment.venue_name || heroMoment.location}</span>
                  {heroMoment.reward && <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-amber-400" /> {heroMoment.reward}</span>}
                </div>
              )}
            </div>
          </div>

          {/* Command Side Suite Widget (4 Columns) */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl shadow-xl lg:col-span-4 min-h-[420px]">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">{t("commandHome.commandSuite")}</p>
                  <h3 className="text-base font-extrabold text-white">{t("commandHome.accessAssets")}</h3>
                </div>
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-amber-300">
                  {t("commandHome.proLevel")}
                </span>
              </div>

              {/* Balance & Progress Breakdown */}
              <div className="mt-5 space-y-3">
                <Link to="/vault" className="group flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-3.5 transition hover:border-amber-400/40 hover:bg-white/[0.05]">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
                      <Gem className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{t("commandHome.gemsVault")}</p>
                      <p className="text-[11px] text-white/40">{t("commandHome.gemsVaultDesc")}</p>
                    </div>
                  </div>
                  <span className="text-base font-extrabold text-amber-400">{balance?.gems || 0}</span>
                </Link>

                <Link to="/vault" className="group flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-3.5 transition hover:border-amber-400/40 hover:bg-white/[0.05]">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{t("commandHome.promokeys")}</p>
                      <p className="text-[11px] text-white/40">{t("commandHome.promokeysDesc")}</p>
                    </div>
                  </div>
                  <span className="text-base font-extrabold text-orange-400">{balance?.promokeys || 0}</span>
                </Link>

                <Link to="/growth" className="group flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-3.5 transition hover:border-amber-400/40 hover:bg-white/[0.05]">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{t("commandHome.proofSignals")}</p>
                      <p className="text-[11px] text-white/40">{t("commandHome.proofSignalsDesc")}</p>
                    </div>
                  </div>
                  <span className="text-base font-extrabold text-yellow-400">{balance?.points || 0}</span>
                </Link>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="mt-6 border-t border-white/10 pt-4">
              <p className="mb-3 text-[10px] font-black uppercase tracking-wider text-white/40">Quick Commands</p>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/vault" className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs font-bold text-white/80 transition hover:border-amber-400/40 hover:text-white">
                  <span>Open Vault</span>
                  <ChevronRight className="h-3.5 w-3.5 text-amber-400" />
                </Link>
                <Link to="/missions" className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs font-bold text-white/80 transition hover:border-amber-400/40 hover:text-white">
                  <span>Missions</span>
                  <ChevronRight className="h-3.5 w-3.5 text-amber-400" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Compact Trail / Metrics Cards Grid */}
        <section aria-labelledby="trail-heading">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">Activity Overview</p>
              <h2 id="trail-heading" className="text-xl font-extrabold text-white sm:text-2xl">What Stayed With You</h2>
            </div>
            <Link to="/vault" className="text-xs font-bold text-white/50 transition hover:text-amber-400">
              View All <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {trail.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md transition-all duration-300 hover:border-amber-400/40 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-amber-500/5 min-h-[120px]"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-8 w-8 place-items-center rounded-lg border border-amber-400/20 bg-amber-400/10 text-amber-400">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <ChevronRight className="h-4 w-4 text-white/20 transition group-hover:translate-x-1 group-hover:text-amber-400" />
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-extrabold tracking-tight text-white group-hover:text-amber-300 sm:text-3xl">
                    {item.value.toLocaleString()}
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-white/80">{item.label}</p>
                  <p className="text-[11px] text-white/40">{item.detail}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Stakeholder Role Archetypes Console */}
        <section aria-labelledby="archetypes-heading" className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#181920] to-[#0d0e12] p-5 sm:p-7 shadow-xl">
          <div className="flex flex-col justify-between gap-3 border-b border-white/10 pb-5 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">{t("archetypes.eyebrow")}</p>
              <h2 id="archetypes-heading" className="text-2xl font-extrabold text-white sm:text-3xl">{t("archetypes.title")}</h2>
              <p className="mt-1 text-xs text-white/50">{t("archetypes.subtitle")}</p>
            </div>
            <Link to="/missions" className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:underline">
              {t("archetypes.browseAll")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                id: "scout",
                title: t("archetypes.scoutTitle"),
                role: t("archetypes.scoutRole"),
                desc: t("archetypes.scoutDesc"),
                perk: t("archetypes.scoutPerk"),
                color: "border-amber-400/30 bg-amber-400/5 text-amber-300",
                href: "/missions?role=scout",
              },
              {
                id: "catalyst",
                title: t("archetypes.catalystTitle"),
                role: t("archetypes.catalystRole"),
                desc: t("archetypes.catalystDesc"),
                perk: t("archetypes.catalystPerk"),
                color: "border-orange-500/30 bg-orange-500/5 text-orange-400",
                href: "/missions?role=catalyst",
              },
              {
                id: "anchor",
                title: t("archetypes.anchorTitle"),
                role: t("archetypes.anchorRole"),
                desc: t("archetypes.anchorDesc"),
                perk: t("archetypes.anchorPerk"),
                color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
                href: "/missions?role=anchor",
              },
              {
                id: "hype",
                title: t("archetypes.hypeTitle"),
                role: t("archetypes.hypeRole"),
                desc: t("archetypes.hypeDesc"),
                perk: t("archetypes.hypePerk"),
                color: "border-purple-500/30 bg-purple-500/5 text-purple-400",
                href: "/missions?role=hype",
              },
              {
                id: "pulse",
                title: t("archetypes.pulseTitle"),
                role: t("archetypes.pulseRole"),
                desc: t("archetypes.pulseDesc"),
                perk: t("archetypes.pulsePerk"),
                color: "border-cyan-500/30 bg-cyan-500/5 text-cyan-400",
                href: "/missions?role=pulse",
              },
            ].map((arch) => (
              <Link
                key={arch.id}
                to={arch.href}
                className={`group flex flex-col justify-between rounded-xl border p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${arch.color}`}
              >
                <div>
                  <span className="text-xs font-black uppercase tracking-wider">{arch.title}</span>
                  <p className="mt-1 text-sm font-bold text-white group-hover:text-amber-300">{arch.role}</p>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-white/60">{arch.desc}</p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] font-black uppercase tracking-wider">
                  <span>{arch.perk}</span>
                  <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Discoveries / Scout Section */}
        <DiscoveriesFeedSection />

        {/* Living Feed Stream */}
        <section aria-labelledby="feed-heading" className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-7 backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">{t("commandHome.liveStream")}</p>
              <h2 id="feed-heading" className="text-2xl font-extrabold text-white sm:text-3xl">{t("commandHome.streamTitle")}</h2>
              <p className="mt-1 text-xs text-white/50">{t("commandHome.streamSubtitle")}</p>
            </div>
            <Link to="/for-you" className="inline-flex items-center gap-1.5 text-xs font-bold text-white/60 transition hover:text-amber-400">
              {t("commandHome.openFullFeed")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Pill Intent Filters */}
          <div className="mt-5 flex flex-wrap gap-2">
            {feedLenses.map((lens) => {
              const isActive = activeIntent === lens.value;
              return (
                <button
                  key={lens.label}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveIntent(lens.value)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider transition-all",
                    isActive
                      ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-md shadow-amber-500/20 scale-[1.02]"
                      : "border border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <span>{lens.label}</span>
                </button>
              );
            })}
          </div>

          {/* Feed Stream Content */}
          <div className="pt-6">
            <FeedStream
              items={feedItems}
              isLoading={feedQuery.isLoading && !feedItems.length}
              isRefreshing={feedQuery.isFetching}
              onRefresh={() => void feedQuery.refetch()}
            />
          </div>
        </section>

        {/* Hosted and Joined Moments Showcase */}
        <section aria-labelledby="moments-heading">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">Moments Gallery</p>
              <h2 id="moments-heading" className="text-xl font-extrabold text-white sm:text-2xl">Hosted & Joined by You</h2>
            </div>
            <Link to="/explore/moments" className="text-xs font-bold text-white/50 transition hover:text-amber-400">
              Manage All <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </Link>
          </div>

          {featuredMoments.length ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {featuredMoments.map((moment) => (
                <Link
                  key={moment.id}
                  to={`/moments/${moment.id}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-[#121317] p-5 shadow-xl transition-all duration-300 hover:border-amber-400/40 hover:scale-[1.01] min-h-[260px]"
                >
                  {moment.image_url ? (
                    <img src={moment.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50 transition duration-500 group-hover:scale-105 group-hover:opacity-70" />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(245,158,11,0.2),transparent_40%),linear-gradient(145deg,#1f1510,#0c0c0e)]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-amber-300 backdrop-blur-md">
                      {hostedMoments.some((item) => item.id === moment.id) ? "Host" : "Joined"}
                    </span>
                    <span className="grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition group-hover:border-amber-400 group-hover:bg-amber-400 group-hover:text-black">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  <div className="relative z-10 mt-auto pt-8">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80">{moment.category || "Moment"}</span>
                    <h3 className="mt-1 font-sans text-xl font-bold leading-snug text-white transition group-hover:text-amber-300">
                      {moment.title}
                    </h3>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-white/60">
                      <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{moment.venue_name || moment.location}</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-12 text-center backdrop-blur-md">
              <CalendarDays className="mx-auto h-8 w-8 text-amber-400" />
              <h3 className="mt-3 text-lg font-bold text-white">No recorded Moments yet.</h3>
              <p className="mx-auto mt-1 max-w-md text-xs text-white/50">Moments you host or join will appear here in your dashboard.</p>
              <Link to="/discover" className="mt-4 inline-flex h-9 items-center gap-2 rounded-full bg-amber-400 px-4 text-xs font-extrabold text-black transition hover:bg-amber-300">
                Explore Moments
              </Link>
            </div>
          )}
        </section>

        {/* Quick Trail Links Bar */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-md">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Upcoming", upcoming.length ? `${upcoming.length} waiting` : "Find moments", "/discover", Compass],
              ["Missions", "Complete proof tasks", "/missions", Trophy],
              ["Vault", "Access & memories", "/vault", Layers],
              ["Referrals", "Invite your friends", "/growth/referrals", UserRoundPlus],
            ].map(([label, text, href, IconComponent]) => (
              <Link
                key={label as string}
                to={href as string}
                className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] p-3.5 transition hover:border-amber-400/40 hover:bg-white/[0.06]"
              >
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-400">{label as string}</p>
                  <p className="mt-0.5 text-xs font-semibold text-white/80">{text as string}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-white/20 transition group-hover:translate-x-1 group-hover:text-amber-400" />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CulturalCommandHome;
