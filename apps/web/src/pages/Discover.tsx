import { Link } from "react-router-dom";
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
  Users,
  MapPin,
} from "lucide-react";
import { getSiteUrl } from "@/lib/discovery";
import { cultureEvents, cultureScenes, cultureCreators } from "@/data/culture-demo";
import { ContentProvenanceBadge, SampleContentNotice } from "@/components/content/ContentProvenance";

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

const Discover = () => {
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

  const moments = discoveryQuery.data?.moments || [];
  const venues = discoveryQuery.data?.venues || [];
  const rewards = discoveryQuery.data?.rewards || [];
  const content = discoveryQuery.data?.content || [];
  const featuredMoment = moments[0];
  const secondaryMoments = moments.slice(1, 4);
  const featuredVenue = venues[0];
  const feedItems = [
    ...secondaryMoments.map((moment, index) => ({
      id: `moment-${moment.id}`,
      kind: "Moment",
      tone: "bg-primary/[0.09] border-primary/35",
      eyebrow: formatMomentDate(moment.starts_at),
      title: moment.title,
      body: moment.venue_name || [moment.city, moment.country].filter(Boolean).join(", ") || "Location coming soon",
      href: `/moments/${moment.id}`,
      action: "Join path",
      metric: `${moment.participant_count || 0} joined`,
      secondaryMetric: "proof eligible",
      icon: CalendarDays,
      image: cultureEvents[index % cultureEvents.length]?.image,
      isSample: false,
    })),
    ...content.map((item, index) => ({
      id: `content-${item.id}`,
      kind: "Creator signal",
      tone: "bg-violet-500/[0.08] border-violet-500/25",
      eyebrow: item.platform || "Content",
      title: item.title || "Untitled content",
      body: [item.city, item.country].filter(Boolean).join(", ") || item.venue_name || "Location coming soon",
      href: "/content-drops",
      action: "Move signal",
      metric: "distribution open",
      secondaryMetric: "creator upside",
      icon: Film,
      image: cultureCreators[index % cultureCreators.length]?.image,
      isSample: false,
    })),
    ...rewards.map((reward, index) => ({
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
      metric: "reward path",
      secondaryMetric: "wallet ready",
      icon: Gift,
      image: cultureScenes[index % cultureScenes.length]?.image,
      isSample: false,
    })),
    ...venues.slice(1, 3).map((venue, index) => ({
      id: `venue-${venue.id}`,
      kind: "Place",
      tone: "bg-emerald-500/[0.08] border-emerald-500/25",
      eyebrow: `${venue.total_moments_hosted || 0} hosted`,
      title: venue.name || "Unnamed venue",
      body: [venue.city, venue.country].filter(Boolean).join(", ") || venue.location || "Location coming soon",
      href: `/venues/${venue.slug || venue.id}`,
      action: "Visit",
      metric: "local signal",
      secondaryMetric: "check-in path",
      icon: MapPin,
      image: cultureScenes[index % cultureScenes.length]?.image,
      isSample: false,
    })),
  ];
  const visibleFeedItems = feedItems.length
    ? feedItems
    : cultureEvents.slice(1, 4).map((event) => ({
        id: `culture-${event.momentId}`,
        kind: "Moment",
        tone: "bg-white/[0.04] border-white/10",
        eyebrow: `${event.date} · ${event.time}`,
        title: event.shortTitle,
        body: event.place,
        href: `/moments/${event.momentId}`,
        action: "View moment",
        metric: `${event.attending} interested`,
        secondaryMetric: event.proof,
        icon: CalendarDays,
        image: event.image,
        isSample: true,
      }));

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

      <section className="px-4 pb-16 pt-20 sm:pt-24">
        <div className="mx-auto max-w-7xl">
          <section className="sticky top-0 z-20 -mx-4 border-b border-white/10 bg-black/90 px-4 py-3 backdrop-blur-xl sm:top-2 sm:mx-0 sm:rounded-2xl sm:border">
            <div className="flex gap-3 overflow-x-auto">
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

          <section className="grid gap-8 pb-8 pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:items-end">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-primary">Discover Promorang</p>
              <h1 className="mt-3 max-w-4xl font-sans text-5xl font-black uppercase leading-[0.88] tracking-[-0.065em] sm:text-6xl lg:text-7xl">
                Find what moves you next.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/55">
                Moments, scenes, creators, places, and drops with enough context to choose quickly. See the proof, understand the unlock, then move.
              </p>
            </div>

            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 lg:mx-0 lg:px-0">
              {intentFilters.map((filter) => (
                <Link
                  key={filter.label}
                  to={filter.href}
                  className="group min-w-52 rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition hover:-translate-y-0.5 hover:border-primary/60 hover:bg-white/[0.07]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <filter.icon className="h-5 w-5 text-primary" />
                    <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-1" />
                  </div>
                  <p className="mt-8 text-xl font-black">{filter.label}</p>
                  <p className="mt-1 text-sm leading-5 text-white/45">{filter.description}</p>
                </Link>
              ))}
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
                    <article className="relative min-h-[520px] overflow-hidden rounded-3xl border border-white/10 bg-black">
                      <img src={cultureEvents[0]?.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-75" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/55 to-black/20" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/25" />
                      <div className="relative flex min-h-[520px] flex-col justify-between p-5 sm:p-7 lg:p-9">
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

                        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
                          <Link to={`/moments/${featuredMoment.id}`} className="group block">
                            <p className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-white/70">
                              <MapPin className="h-4 w-4 text-primary" />
                              {featuredMoment.venue_name || [featuredMoment.city, featuredMoment.country].filter(Boolean).join(", ") || "Location coming soon"}
                            </p>
                            <h2 className="max-w-3xl font-sans text-5xl font-black uppercase leading-[0.88] tracking-[-0.06em] group-hover:text-primary sm:text-6xl">
                            {featuredMoment.title}
                            </h2>
                          </Link>
                          <div className="rounded-2xl border border-white/15 bg-black/65 p-4 backdrop-blur-xl">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">What your action creates</p>
                            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                              <div className="rounded-xl bg-white/[0.07] p-3">
                                <p className="text-xl font-black">{featuredMoment.participant_count || 0}</p>
                                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">joined</p>
                              </div>
                              <div className="rounded-xl bg-white/[0.07] p-3">
                                <p className="text-xl font-black">Proof</p>
                                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">eligible</p>
                              </div>
                              <div className="rounded-xl bg-white/[0.07] p-3">
                                <p className="text-xl font-black">Access</p>
                                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">can unlock</p>
                              </div>
                            </div>
                            <Button asChild className="mt-4 w-full justify-between">
                              <Link to={`/moments/${featuredMoment.id}`}>Join path <ArrowRight className="h-4 w-4" /></Link>
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
                    {!feedItems.length && <SampleContentNotice noun="moments" className="mb-4" />}
                    <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-3">
                    {visibleFeedItems.map((item) => (
                      <article
                        key={item.id}
                        className={`group w-[82vw] max-w-[360px] shrink-0 overflow-hidden rounded-2xl border transition hover:-translate-y-1 hover:border-primary/60 ${item.tone}`}
                      >
                        <Link to={item.href} className="relative block aspect-[4/3] overflow-hidden">
                          <img src={item.image} alt="" className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
                          <Badge className="absolute left-3 top-3 bg-black/65 text-white">{item.kind}</Badge>
                          {item.isSample && <ContentProvenanceBadge className="absolute right-3 top-3" compact />}
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
                        </div>

                        <div className="mt-8 space-y-3">
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-white/[0.07] px-3 py-1.5 text-xs font-bold text-white/55">{item.metric}</span>
                            <span className="rounded-full bg-white/[0.07] px-3 py-1.5 text-xs font-bold text-white/55">{item.secondaryMetric}</span>
                          </div>
                          <Link to={item.href} className="inline-flex items-center gap-2 text-sm font-black text-primary">
                            {item.action}
                            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                          </Link>
                        </div>
                        </div>
                      </article>
                    ))}
                    </div>
                  </div>

                  <section className="grid gap-4 md:grid-cols-3">
                    {featuredVenue ? (
                      <Link to={`/venues/${featuredVenue.slug || featuredVenue.id}`} className="group rounded-[28px] border border-emerald-500/25 bg-emerald-500/[0.08] p-5 transition hover:-translate-y-1 hover:border-primary/60">
                        <MapPin className="h-6 w-6 text-primary" />
                        <p className="mt-10 text-xs font-black uppercase tracking-[0.2em] text-primary">Local place</p>
                        <h3 className="mt-2 text-3xl font-black leading-none group-hover:text-primary">{featuredVenue.name || "Unnamed venue"}</h3>
                        <p className="mt-3 text-sm text-muted-foreground">
                          {[featuredVenue.city, featuredVenue.country].filter(Boolean).join(", ") || featuredVenue.location || "Location coming soon"}
                        </p>
                      </Link>
                    ) : null}
                    <Link to="/pulse" className="group rounded-[28px] border border-border/70 bg-card/75 p-5 transition hover:-translate-y-1 hover:border-primary/60">
                      <Radio className="h-6 w-6 text-primary" />
                      <p className="mt-10 text-xs font-black uppercase tracking-[0.2em] text-primary">Live now</p>
                      <h3 className="mt-2 text-3xl font-black leading-none group-hover:text-primary">See what is forming</h3>
                    </Link>
                    <Link to="/content-drops" className="group rounded-[28px] border border-border/70 bg-card/75 p-5 transition hover:-translate-y-1 hover:border-primary/60">
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
