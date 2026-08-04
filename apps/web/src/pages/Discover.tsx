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
  BriefcaseBusiness,
  CalendarDays,
  Film,
  Gift,
  Heart,
  Radio,
  Search,
  Share2,
  Ticket,
  MapPin,
} from "lucide-react";
import { getSiteUrl } from "@/lib/discovery";
import { ValueOutcomeChips, type ValueOutcome } from "@/components/economy/ValueOutcomes";

type PublicMoment = Tables<"view_public_moment_directory">;
type PublicVenue = Tables<"view_public_venue_directory">;

type PublicRewardRow = {
  id: string;
  name: string | null;
  venue_name: string | null;
  brand_name: string | null;
  city: string | null;
  country: string | null;
  discount_type: string | null;
  discount_value: number | null;
};

type PublicContentRow = {
  id: string;
  title: string | null;
  venue_name: string | null;
  city: string | null;
  country: string | null;
  platform: string | null;
};

const intentFilters = [
  {
    label: "Tonight",
    description: "Moments and scenes forming soon",
    href: "/pulse",
    icon: Radio,
  },
  {
    label: "Near me",
    description: "Places where attention can land",
    href: "/discover/venues",
    icon: MapPin,
  },
  {
    label: "Earnable",
    description: "Rewards, entries, and useful actions",
    href: "/discover/rewards",
    icon: Ticket,
  },
  {
    label: "Creator signals",
    description: "Content looking for movement",
    href: "/content-drops",
    icon: Film,
  },
];

const actionLabels = ["For you", "Near you", "Tonight", "Earnable", "Creators", "Offers", "Places"];

const formatRewardValue = (reward: PublicRewardRow) => {
  if (typeof reward.discount_value !== "number") return "Open reward";
  if (reward.discount_type?.includes("percentage")) return `${reward.discount_value}% off`;
  return `$${reward.discount_value} value`;
};

const formatMomentDate = (value?: string | null) => {
  if (!value) return "Date coming soon";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "Date coming soon";
  }
};

const isMissingSupabaseRelation = (error: unknown) => {
  if (!error || typeof error !== "object") return false;
  const relationError = error as { code?: string; message?: string; details?: string };
  return (
    relationError.code === "PGRST205" ||
    relationError.code === "42P01" ||
    relationError.message?.includes("Could not find the table") ||
    relationError.details?.includes("view_public_reward_directory")
  );
};

const looksLikeSampleContent = (...values: Array<unknown>) => {
  const text = values.filter((value) => typeof value === "string").join(" ").toLowerCase();
  return /(^|[\s_./@-])(demo|sample|example|mock|test|preview)([\s_./@-]|$)/i.test(text);
};

import { SubmitDiscoveryModal } from "@/components/discovery/SubmitDiscoveryModal";

const Discover = () => {
  const [showSamples, setShowSamples] = useState(false);
  const discoveryQuery = useQuery({
    queryKey: ["discover-overview"],
    queryFn: async () => {
      const [momentsResult, venuesResult, rewardsResult, contentResult] = await Promise.all([
        supabase
          .from("view_public_moment_directory")
          .select("*")
          .eq("is_active", true)
          .gte("starts_at", new Date().toISOString())
          .order("starts_at", { ascending: true, nullsFirst: false })
          .limit(4),
        supabase
          .from("view_public_venue_directory")
          .select("*")
          .order("popularity_score", { ascending: false, nullsFirst: false })
          .limit(3),
        supabase
          .from("view_public_reward_directory" as never)
          .select("id,name,venue_name,brand_name,city,country,discount_type,discount_value")
          .limit(3),
        supabase
          .from("view_public_content_directory" as never)
          .select("id,title,venue_name,city,country,platform")
          .order("posted_at", { ascending: false, nullsFirst: false })
          .limit(3),
      ]);

      if (momentsResult.error) throw momentsResult.error;
      if (venuesResult.error) throw venuesResult.error;
      if (rewardsResult.error && !isMissingSupabaseRelation(rewardsResult.error)) throw rewardsResult.error;
      if (contentResult.error) throw contentResult.error;

      return {
        moments: (momentsResult.data || []) as PublicMoment[],
        venues: (venuesResult.data || []) as PublicVenue[],
        rewards: (rewardsResult.data || []) as PublicRewardRow[],
        content: (contentResult.data || []) as PublicContentRow[],
        rewardsUnavailable: Boolean(rewardsResult.error && isMissingSupabaseRelation(rewardsResult.error)),
      };
    },
  });

  const allMoments = discoveryQuery.data?.moments || [];
  const allVenues = discoveryQuery.data?.venues || [];
  const allRewards = discoveryQuery.data?.rewards || [];
  const allContent = discoveryQuery.data?.content || [];
  const sampleMoments = allMoments.filter((moment) => looksLikeSampleContent(moment.id, moment.slug, moment.title, moment.description, moment.host_id));
  const sampleVenues = allVenues.filter((venue) => looksLikeSampleContent(venue.id, venue.slug, venue.name, venue.description, venue.location));
  const sampleRewards = allRewards.filter((reward) => looksLikeSampleContent(reward.id, reward.name, reward.venue_name, reward.brand_name));
  const sampleContent = allContent.filter((item) => looksLikeSampleContent(item.id, item.title, item.venue_name));
  const moments = allMoments.filter((moment) => !sampleMoments.includes(moment));
  const venues = allVenues.filter((venue) => !sampleVenues.includes(venue));
  const rewards = allRewards.filter((reward) => !sampleRewards.includes(reward));
  const content = allContent.filter((item) => !sampleContent.includes(item));
  const hasSamples = sampleMoments.length + sampleVenues.length + sampleRewards.length + sampleContent.length > 0;
  const featuredMoment = moments[0];
  const secondaryMoments = moments.slice(1, 4);
  const featuredVenue = venues[0];
  const feedItems = [
    ...secondaryMoments.map((moment) => ({
      id: `moment-${moment.id}`,
      kind: "Moment",
      tone: "bg-primary/[0.09] border-primary/35",
      eyebrow: formatMomentDate(moment.starts_at),
      title: moment.title,
      body: moment.venue_name || [moment.city, moment.country].filter(Boolean).join(", ") || "Location coming soon",
      href: `/moments/${moment.id}`,
      action: "Join path",
      metric: `${moment.participant_count || 0} people joining`,
      secondaryMetric: "Show up and be counted",
      icon: CalendarDays,
      image: moment.image_url || null,
      outcomes: [
        { kind: "access", label: "Moment access" },
        ...(moment.reward ? [{ kind: "reward", label: String(moment.reward) }] : []),
      ] as ValueOutcome[],
      isSample: false,
    })),
    ...content.map((item) => ({
      id: `content-${item.id}`,
      kind: "Creator signal",
      tone: "bg-violet-500/[0.08] border-violet-500/25",
      eyebrow: item.platform || "Content",
      title: item.title || "Untitled content",
      body: [item.city, item.country].filter(Boolean).join(", ") || item.venue_name || "Location coming soon",
      href: "/content-drops",
      action: "Move signal",
      metric: "Ready to travel",
      secondaryMetric: "Help the creator reach people",
      icon: Film,
      image: null,
      outcomes: [] as ValueOutcome[],
      isSample: false,
    })),
    ...rewards.map((reward) => ({
      id: `reward-${reward.id}`,
      kind: "Reward",
      tone: "bg-amber-500/[0.08] border-amber-500/25",
      eyebrow: formatRewardValue(reward),
      title: reward.name || "Untitled reward",
      body: [reward.brand_name, reward.venue_name].filter(Boolean).join(" · ") ||
        [reward.city, reward.country].filter(Boolean).join(", ") ||
        "Claimable value",
      href: "/discover/rewards",
      action: "Claim",
      metric: "Something useful to keep",
      secondaryMetric: "See how it opens",
      icon: Gift,
      image: null,
      outcomes: [{ kind: "reward", label: formatRewardValue(reward) }] as ValueOutcome[],
      isSample: false,
    })),
    ...venues.slice(1, 3).map((venue) => ({
      id: `venue-${venue.id}`,
      kind: "Place",
      tone: "bg-emerald-500/[0.08] border-emerald-500/25",
      eyebrow: `${venue.total_moments_hosted || 0} hosted`,
      title: venue.name || "Unnamed venue",
      body: [venue.city, venue.country].filter(Boolean).join(", ") || venue.location || "Location coming soon",
      href: `/venues/${venue.slug || venue.id}`,
      action: "Visit",
      metric: "A place people return to",
      secondaryMetric: "Visit and be remembered",
      icon: MapPin,
      image: Array.isArray(venue.images) && typeof venue.images[0] === "string" ? venue.images[0] : null,
      outcomes: [{ kind: "access", label: "Place access" }] as ValueOutcome[],
      isSample: false,
    })),
  ];
  const sampleFeedItems = [
    ...sampleMoments.map((moment) => ({
      id: `sample-moment-${moment.id}`, kind: "Sample Moment", tone: "bg-primary/[0.09] border-primary/35",
      eyebrow: formatMomentDate(moment.starts_at), title: moment.title, body: moment.venue_name || moment.location || "Sample location",
      href: `/moments/${moment.id}`, action: "Preview", metric: "sample only", secondaryMetric: "not live", icon: CalendarDays,
      image: moment.image_url || null, outcomes: [] as ValueOutcome[], isSample: true,
    })),
    ...sampleContent.map((item) => ({
      id: `sample-content-${item.id}`, kind: "Sample Creator signal", tone: "bg-violet-500/[0.08] border-violet-500/25",
      eyebrow: item.platform || "Sample", title: item.title || "Sample content", body: item.venue_name || "Sample content",
      href: "/content-drops", action: "Preview", metric: "sample only", secondaryMetric: "not live", icon: Film,
      image: null, outcomes: [] as ValueOutcome[], isSample: true,
    })),
    ...sampleRewards.map((reward) => ({
      id: `sample-reward-${reward.id}`, kind: "Sample Reward", tone: "bg-amber-500/[0.08] border-amber-500/25",
      eyebrow: formatRewardValue(reward), title: reward.name || "Sample reward", body: reward.brand_name || reward.venue_name || "Sample reward",
      href: "/discover/rewards", action: "Preview", metric: "sample only", secondaryMetric: "not claimable", icon: Gift,
      image: null, outcomes: [] as ValueOutcome[], isSample: true,
    })),
    ...sampleVenues.map((venue) => ({
      id: `sample-venue-${venue.id}`, kind: "Sample Place", tone: "bg-emerald-500/[0.08] border-emerald-500/25",
      eyebrow: "Sample place", title: venue.name || "Sample venue", body: venue.location || venue.city || "Sample location",
      href: `/venues/${venue.slug || venue.id}`, action: "Preview", metric: "sample only", secondaryMetric: "not live", icon: MapPin,
      image: Array.isArray(venue.images) && typeof venue.images[0] === "string" ? venue.images[0] : null,
      outcomes: [] as ValueOutcome[], isSample: true,
    })),
  ];
  const visibleFeedItems = showSamples && !feedItems.length ? sampleFeedItems : feedItems;

  return (
    <div className="min-h-screen bg-[#070707] text-white">
      <SEO
        title="Discover Promorang"
        description="Browse moments, venues, rewards, and content across Promorang without relying only on live urgency or ranked feeds."
        url={getSiteUrl("/discover")}
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Discover Promorang",
          description:
            "Browse moments, venues, rewards, and content across Promorang without relying only on live urgency or ranked feeds.",
        }}
      />

      <section className="px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:px-8 xl:px-12 2xl:px-16">
        <div className="mx-auto max-w-[1600px]">
          <section className="sticky top-0 z-20 -mx-4 border-b border-white/10 bg-black/90 px-4 py-3 backdrop-blur-xl sm:top-2 sm:mx-0 sm:rounded-2xl sm:border">
            <div className="pr-scroll-rail flex gap-3 overflow-x-auto">
              <Link to="/search" className="flex min-w-[240px] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm font-bold text-white/50">
                <Search className="h-4 w-4 text-primary" />
                Search moments, scenes, offers
              </Link>
              {actionLabels.map((label) => (
                <Link
                  key={label}
                  to={label === "Creators" ? "/content-drops" : label === "Places" ? "/discover/venues" : label === "Offers" ? "/discover/rewards" : "/discover"}
                  className="whitespace-nowrap rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white/60 transition hover:border-primary/60 hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </div>
          </section>

          {/* Unified Cinematic Hero Experience */}
          <section className="pb-10 pt-6">
            <div className="relative overflow-hidden rounded-[2rem] border border-primary/30 bg-gradient-to-br from-[#1F140E] via-[#0D0D0E] to-[#120B07] p-6 sm:p-10 shadow-2xl text-white">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

              {/* Integrated Top Live Wins Pill */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center space-x-2 bg-primary/10 border border-primary/25 px-3 py-1.5 rounded-full text-xs text-orange-200">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="font-bold text-primary">Live Win:</span>
                  <span className="font-medium text-white truncate max-w-xs sm:max-w-md">
                    Sarah M. just snagged <strong className="text-primary">$45 Instant Cash & Treats</strong> via Venmo (14s ago)
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs text-white/60">
                  <span className="rounded-full bg-primary/20 px-3 py-1 text-primary font-bold border border-primary/30">
                    ⚡ 3x Early Bird Boost Active
                  </span>
                </div>
              </div>

              {/* Main Hero Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Hero Message & Actions (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Free Community Perks & Local Drops</span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[0.95]">
                    Turn Social Posts into <span className="bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent">Free Coffee, Cash & Perks.</span>
                  </h1>

                  <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-xl">
                    Discover local brand drops, free food & drink vouchers, and easy tasks. Share on Instagram or TikTok, get instant cash, and unlock community perks in 30 seconds.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <Button asChild size="lg" className="bg-primary text-primary-foreground font-extrabold hover:bg-primary/90 shadow-xl shadow-primary/30 text-sm px-7 py-6 rounded-2xl">
                      <Link to="/content-drops" className="flex items-center space-x-2">
                        <span>Tap to Grab $12 Instant Perk 🚀</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>

                    <SubmitDiscoveryModal />
                  </div>
                </div>

                {/* Right Hero Perks Vault Card (5 cols) */}
                <div className="lg:col-span-5">
                  <div className="rounded-2xl border border-white/10 bg-black/60 p-6 backdrop-blur-xl space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Season 1 Treat Vault</span>
                      <span className="text-xs font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">72% Unlocked</span>
                    </div>

                    <div>
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-2xl font-black text-white">$10,000</span>
                        <span className="text-xs text-white/50">320 more friends needed</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10 p-0.5 border border-white/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary via-amber-400 to-primary transition-all duration-500" style={{ width: '72%' }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10 text-xs">
                      <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5">
                        <p className="text-white/40 font-medium">Your Boost</p>
                        <p className="text-sm font-bold text-primary mt-0.5">3.0x Multiplier</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5">
                        <p className="text-white/40 font-medium">Active Treats</p>
                        <p className="text-sm font-bold text-white mt-0.5">14 Drops Near You</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <main className="space-y-6">
              {discoveryQuery.isLoading ? (
                <>
                  <Skeleton className="h-[520px] rounded-[32px]" />
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-72 rounded-[28px]" />
                  ))}
                </>
              ) : (
                <>
                  {featuredMoment ? (
                    <article className="relative min-h-[520px] overflow-hidden rounded-3xl border border-white/10 bg-black md:min-h-[600px] xl:min-h-[700px]">
                      {featuredMoment.image_url ? (
                        <img src={featuredMoment.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-75" />
                      ) : (
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(249,115,22,0.3),transparent_34%),linear-gradient(135deg,#21150f,#070707_62%)]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/55 to-black/20" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/25" />
                      <div className="relative flex min-h-[520px] flex-col justify-between p-5 sm:min-h-[600px] sm:p-8 lg:p-10 xl:min-h-[700px] xl:p-14">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                            <Badge className="border-white/15 bg-black/45 text-white">Moment</Badge>
                            <Badge className="border-white/15 bg-black/45 text-white">{formatMomentDate(featuredMoment.starts_at)}</Badge>
                          </div>
                          <div className="flex gap-2">
                            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white transition hover:border-primary hover:text-primary" aria-label="Save featured moment">
                              <Bookmark className="h-4 w-4" />
                            </button>
                            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white transition hover:border-primary hover:text-primary" aria-label="Share featured moment">
                              <Share2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-12">
                          <Link to={`/moments/${featuredMoment.id}`} className="group block">
                            <p className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-white/70">
                              <MapPin className="h-4 w-4 text-primary" />
                              {featuredMoment.venue_name || [featuredMoment.city, featuredMoment.country].filter(Boolean).join(", ") || "Location coming soon"}
                            </p>
                            <h2 className="max-w-4xl font-sans text-5xl font-black uppercase leading-[0.88] tracking-[-0.06em] group-hover:text-primary sm:text-6xl xl:text-8xl">
                            {featuredMoment.title}
                            </h2>
                          </Link>
                          <div className="rounded-2xl border border-white/15 bg-black/65 p-4 backdrop-blur-xl">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">If this feels like your Scene</p>
                            <div className="mt-4 space-y-3">
                              {[
                                [`${featuredMoment.participant_count || 0} people are already connected`, "You will not be walking into an empty room."],
                                ["Show up and be counted", "Your check-in keeps the Moment and your place in it."],
                                ["See what opens afterward", "A memory, invitation, reward, or reason to return can follow."],
                              ].map(([title, detail], index) => (
                                <div key={title} className="grid grid-cols-[22px_1fr] gap-3 border-t border-white/10 pt-3 first:border-0 first:pt-0">
                                  <span className="font-mono text-[10px] font-black text-primary">0{index + 1}</span>
                                  <div><p className="text-sm font-black text-white">{title}</p><p className="mt-0.5 text-xs leading-5 text-white/45">{detail}</p></div>
                                </div>
                              ))}
                            </div>
                            <Button asChild className="mt-4 w-full justify-between">
                              <Link to={`/moments/${featuredMoment.id}`}>Enter the Moment <ArrowRight className="h-4 w-4" /></Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ) : null}

                  <div>
                    <div className="mb-4 flex items-end justify-between gap-4">
                      <div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Recommended</p><h2 className="mt-1 text-3xl font-black">Worth acting on</h2></div>
                      <Link to="/discover/moments" className="text-sm font-bold text-primary">View all</Link>
                    </div>
                    {!feedItems.length && !showSamples && (
                      <div className="mb-4 rounded-2xl border border-dashed border-white/15 px-5 py-8 text-center text-sm text-white/50">
                        <p>Nothing live is ready to recommend yet. New stakeholder-created Moments, content, rewards, and places will appear here.</p>
                        {hasSamples ? (
                          <Button type="button" variant="outline" className="mt-4" onClick={() => setShowSamples(true)}>
                            Show sample previews
                          </Button>
                        ) : null}
                      </div>
                    )}
                    {showSamples && !feedItems.length ? (
                      <div className="mb-4 flex items-center justify-between gap-4 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-xs text-amber-100/75">
                        <span>Showing labeled samples because no live recommendations are available.</span>
                        <button type="button" className="shrink-0 font-black text-amber-200 hover:text-white" onClick={() => setShowSamples(false)}>Hide samples</button>
                      </div>
                    ) : null}
                    <div className="pr-scroll-rail -mx-4 flex gap-4 overflow-x-auto px-4 pb-3 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 xl:grid-cols-3 xl:gap-5">
                    {visibleFeedItems.map((item) => (
                      <article
                        key={item.id}
                        className={`group w-[82vw] max-w-[360px] shrink-0 overflow-hidden rounded-2xl border transition hover:-translate-y-1 hover:border-primary/60 md:w-auto md:max-w-none ${item.tone}`}
                      >
                        <Link to={item.href} className="relative block aspect-[4/3] overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt="" className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100" />
                          ) : (
                            <div className="h-full w-full bg-[radial-gradient(circle_at_70%_20%,rgba(249,115,22,0.25),transparent_36%),linear-gradient(145deg,#251811,#090909_64%)]" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
                          <Badge className="absolute left-3 top-3 bg-black/65 text-white">{item.kind}</Badge>
                          {item.isSample ? <Badge className="absolute right-3 top-3 border border-amber-300/25 bg-black/75 text-amber-200">Sample preview</Badge> : null}
                        </Link>
                        <div className="p-4">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.07] text-primary">
                              <item.icon className="h-6 w-6" />
                            </div>
                            <div className="flex gap-2">
                              <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background/75 transition hover:border-primary hover:text-primary" aria-label={`Save ${item.title}`}>
                                <Heart className="h-4 w-4" />
                              </button>
                              <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background/75 transition hover:border-primary hover:text-primary" aria-label={`Share ${item.title}`}>
                                <Share2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-white/50">{item.eyebrow}</span>
                          </div>
                          <Link to={item.href} className="block">
                            <h3 className="mt-2 text-2xl font-black leading-none tracking-tight hover:text-primary">
                              {item.title}
                            </h3>
                          </Link>
                          <p className="mt-2 text-sm leading-6 text-white/50">{item.body}</p>
                          <ValueOutcomeChips outcomes={item.outcomes} className="mt-4" />
                        </div>

                        <div className="mt-8 space-y-3">
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-white/[0.07] px-3 py-1.5 text-xs font-bold text-white/55">{item.metric}</span>
                            <span className="rounded-full bg-white/[0.07] px-3 py-1.5 text-xs font-bold text-white/55">{item.secondaryMetric}</span>
                          </div>
                              <Link to={item.href} className="inline-flex min-h-11 items-center gap-2 text-sm font-black text-primary">
                            {item.action}
                            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                          </Link>
                        </div>
                        </div>
                      </article>
                    ))}
                    </div>
                  </div>

                  <section className="grid gap-4 md:grid-cols-12 xl:gap-5">
                    {featuredVenue ? (
                      <Link to={`/venues/${featuredVenue.slug || featuredVenue.id}`} className="group rounded-[28px] border border-emerald-500/25 bg-emerald-500/[0.08] p-5 transition hover:-translate-y-1 hover:border-primary/60 md:col-span-6 xl:p-7">
                        <MapPin className="h-6 w-6 text-primary" />
                        <p className="mt-10 text-xs font-black uppercase tracking-[0.2em] text-primary">Local place</p>
                        <h3 className="mt-2 text-3xl font-black leading-none group-hover:text-primary">{featuredVenue.name || "Unnamed venue"}</h3>
                        <p className="mt-3 text-sm text-muted-foreground">
                          {[featuredVenue.city, featuredVenue.country].filter(Boolean).join(", ") || featuredVenue.location || "Location coming soon"}
                        </p>
                      </Link>
                    ) : null}
                    <Link to="/pulse" className="group rounded-[28px] border border-border/70 bg-card/75 p-5 transition hover:-translate-y-1 hover:border-primary/60 md:col-span-3 xl:p-7">
                      <Radio className="h-6 w-6 text-primary" />
                      <p className="mt-10 text-xs font-black uppercase tracking-[0.2em] text-primary">Live now</p>
                      <h3 className="mt-2 text-3xl font-black leading-none group-hover:text-primary">See what is forming</h3>
                    </Link>
                    <Link to="/content-drops" className="group rounded-[28px] border border-border/70 bg-card/75 p-5 transition hover:-translate-y-1 hover:border-primary/60 md:col-span-3 xl:p-7">
                      <BriefcaseBusiness className="h-6 w-6 text-primary" />
                      <p className="mt-10 text-xs font-black uppercase tracking-[0.2em] text-primary">Creator work</p>
                      <h3 className="mt-2 text-3xl font-black leading-none group-hover:text-primary">Distribute and earn</h3>
                    </Link>
                  </section>
                </>
              )}
            </main>
          </section>
        </div>
      </section>
    </div>
  );
};

export default Discover;
