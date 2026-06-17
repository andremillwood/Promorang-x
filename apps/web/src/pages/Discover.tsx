import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Building2,
  Compass,
  Film,
  Gift,
  MapPin,
  Sparkles,
} from "lucide-react";
import { getSiteUrl } from "@/lib/discovery";

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

const discoverSections = [
  {
    title: "Moments",
    description: "Browse public moments, creator missions, and live opportunities in a compare-friendly catalog.",
    href: "/discover/moments",
    cta: "Browse moments",
    icon: Compass,
  },
  {
    title: "Venues",
    description: "See the physical places and operators that anchor local participation and reward loops.",
    href: "/discover/venues",
    cta: "Browse venues",
    icon: MapPin,
  },
  {
    title: "Rewards",
    description: "Understand the offers, proof loops, and public reward surfaces tied to places and campaigns.",
    href: "/discover/rewards",
    cta: "Browse rewards",
    icon: Gift,
  },
  {
    title: "Content",
    description: "Browse story-led media connected to moments, venues, and public discovery archives.",
    href: "/discover/content",
    cta: "Browse content",
    icon: Film,
  },
];

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
  const rewardsUnavailable = discoveryQuery.data?.rewardsUnavailable || false;

  return (
    <div className="min-h-screen bg-background">
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

      <section className="px-4 pb-12 pt-24 sm:pt-28">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="rounded-[2rem] border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-accent/10 p-6 shadow-soft sm:p-8 lg:p-10">
            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:gap-8">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/70 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
                  <Compass className="h-3.5 w-3.5" />
                  Structured Discovery
                </div>
                <h1 className="max-w-4xl font-serif text-4xl font-black tracking-tight text-foreground sm:text-5xl">
                  Explore what is live, local, and worth acting on.
                </h1>
                <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
                  Pulse shows urgency. Discover gives you the broader map: moments, venues, rewards, and content you can compare without relying on the feed to rank everything first.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild size="lg" variant="hero">
                    <Link to="/discover/moments">Start with moments</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/pulse">Open Pulse</Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-[1.5rem] border border-border/70 bg-card/80 p-5 shadow-soft">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">Use Discover for</p>
                  <p className="mt-3 text-sm font-medium text-foreground">Category browsing, place-based exploration, and compare-friendly scanning.</p>
                </div>
                <div className="rounded-[1.5rem] border border-border/70 bg-card/80 p-5 shadow-soft">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">Use Pulse for</p>
                  <p className="mt-3 text-sm font-medium text-foreground">Live density, forming rooms, and moments that already feel urgent enough to move on.</p>
                </div>
                <div className="rounded-[1.5rem] border border-border/70 bg-card/80 p-5 shadow-soft">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">Quick path</p>
                  <Button asChild variant="ghost" className="-ml-3 mt-2 px-3 text-primary">
                    <Link to="/search">
                      Global Search
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {discoverSections.map((section) => (
              <Card key={section.title} className="border-border/70 shadow-soft transition-transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <section.icon className="h-5 w-5" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-foreground">{section.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{section.description}</p>
                  <Button asChild variant="ghost" className="-ml-3 mt-4 px-3 text-primary">
                    <Link to={section.href}>
                      {section.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
            <Card className="shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">How this differs from Pulse</p>
                    <h2 className="mt-3 font-serif text-2xl font-bold text-foreground">A calmer way to browse the graph</h2>
                  </div>
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                    <p className="font-semibold text-foreground">Moments</p>
                    <p className="mt-2 text-sm text-muted-foreground">Browse upcoming opportunities without depending on urgency signals.</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                    <p className="font-semibold text-foreground">Places</p>
                    <p className="mt-2 text-sm text-muted-foreground">Understand where the activity happens and which locations carry repeat value.</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                    <p className="font-semibold text-foreground">Value</p>
                    <p className="mt-2 text-sm text-muted-foreground">See how rewards and content connect back into real-world participation loops.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-6">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Fast paths</p>
                <h2 className="mt-3 font-serif text-2xl font-bold text-foreground">Jump directly</h2>
                <div className="mt-5 space-y-3">
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link to="/discover/moments">
                      Moments
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link to="/discover/venues">
                      Venues
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link to="/discover/rewards">
                      Rewards
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link to="/discover/content">
                      Content
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <Card className="shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Upcoming moments</p>
                    <h2 className="mt-3 font-serif text-2xl font-bold text-foreground">Start with real opportunities</h2>
                  </div>
                  <Compass className="h-5 w-5 text-primary" />
                </div>
                <div className="mt-5 space-y-3">
                  {discoveryQuery.isLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={index} className="h-24 rounded-2xl" />
                    ))
                  ) : moments.length > 0 ? (
                    moments.map((moment) => (
                      <Link
                        key={moment.id}
                        to={`/moments/${moment.id}`}
                        className="group block rounded-2xl border border-border/70 bg-background/80 p-4 transition-all hover:border-primary/25 hover:shadow-soft"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate font-semibold text-foreground group-hover:text-primary">{moment.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {moment.venue_name || [moment.city, moment.country].filter(Boolean).join(", ") || "Location coming soon"}
                            </p>
                          </div>
                          <Badge variant="outline" className="rounded-full">
                            {moment.participant_count || 0} joined
                          </Badge>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                          <span>{formatMomentDate(moment.starts_at)}</span>
                          {moment.category ? <span className="capitalize">{moment.category}</span> : null}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border bg-background/60 p-6 text-sm text-muted-foreground">
                      No upcoming moments available right now.
                    </div>
                  )}
                </div>
                <Button asChild variant="ghost" className="-ml-3 mt-4 px-3 text-primary">
                  <Link to="/discover/moments">
                    Browse all moments
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <div className="grid gap-5">
              <Card className="shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Top venues</p>
                      <h2 className="mt-3 font-serif text-2xl font-bold text-foreground">Places worth revisiting</h2>
                    </div>
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="mt-5 space-y-3">
                    {discoveryQuery.isLoading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="h-20 rounded-2xl" />
                      ))
                    ) : venues.length > 0 ? (
                      venues.map((venue) => (
                        <Link
                          key={venue.id}
                          to={`/venues/${venue.slug || venue.id}`}
                          className="group flex items-start justify-between gap-3 rounded-2xl border border-border/70 bg-background/80 p-4 transition-all hover:border-primary/25 hover:shadow-soft"
                        >
                          <div className="min-w-0">
                            <h3 className="truncate font-semibold text-foreground group-hover:text-primary">{venue.name || "Unnamed venue"}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {[venue.city, venue.country].filter(Boolean).join(", ") || venue.location || "Location coming soon"}
                            </p>
                          </div>
                          <Badge variant="outline" className="rounded-full">
                            {venue.total_moments_hosted || 0} hosted
                          </Badge>
                        </Link>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border bg-background/60 p-6 text-sm text-muted-foreground">
                        No public venues available right now.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardContent className="p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Public rewards</p>
                      {rewardsUnavailable ? (
                        <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-muted-foreground">
                          Public rewards are temporarily unavailable in this environment because the reward discovery view has not been provisioned yet.
                        </div>
                      ) : null}
                      <div className="mt-4 space-y-3">
                        {discoveryQuery.isLoading ? (
                          Array.from({ length: 2 }).map((_, index) => (
                            <Skeleton key={index} className="h-16 rounded-2xl" />
                          ))
                        ) : rewards.length > 0 ? (
                          rewards.map((reward) => (
                            <div key={reward.id} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                              <p className="font-semibold text-foreground">{reward.name || "Untitled reward"}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{formatRewardValue(reward)}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {[reward.brand_name, reward.venue_name].filter(Boolean).join(" · ") ||
                                  [reward.city, reward.country].filter(Boolean).join(", ")}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-dashed border-border bg-background/60 p-4 text-sm text-muted-foreground">
                            No public rewards available right now.
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Recent content</p>
                      <div className="mt-4 space-y-3">
                        {discoveryQuery.isLoading ? (
                          Array.from({ length: 2 }).map((_, index) => (
                            <Skeleton key={index} className="h-16 rounded-2xl" />
                          ))
                        ) : content.length > 0 ? (
                          content.map((item) => (
                            <div key={item.id} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                              <p className="font-semibold text-foreground">{item.title || "Untitled content"}</p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {item.platform || "Content"} · {[item.city, item.country].filter(Boolean).join(", ") || item.venue_name || "Location coming soon"}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-dashed border-border bg-background/60 p-4 text-sm text-muted-foreground">
                            No public content available right now.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-soft sm:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">If you already know what you want</p>
                <h2 className="mt-3 font-serif text-3xl font-bold text-foreground">Use the direct tools</h2>
                <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                  Discovery is the broad browse layer. If you already have intent, jump directly into search, pulse, or creation.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link to="/search">Search</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/pulse">Pulse</Link>
                </Button>
                <Button asChild variant="hero">
                  <Link to="/create/moment">Create</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};

export default Discover;
