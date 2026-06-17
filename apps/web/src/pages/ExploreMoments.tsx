import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { MasonryGrid } from "@/components/MasonryGrid";
import { MomentCard } from "@/components/MomentCard";
import { PublicContentCard, type PublicContentItem } from "@/components/content/PublicContentCard";
import { MomentValuePath } from "@/components/moments/MomentValuePath";
import { demoMoments } from "@/data/demo-moments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, BookOpen, Clock, Compass, MapPin, Repeat2, Search, Sparkles, TrendingUp } from "lucide-react";
import { getSiteUrl, slugifySegment } from "@/lib/discovery";

type PublicMoment = Tables<"view_public_moment_directory">;

const categories = [
  { value: "all", label: "All categories", emoji: "✨" },
  { value: "social", label: "Social", emoji: "🎉" },
  { value: "workshop", label: "Workshop", emoji: "🎨" },
  { value: "fitness", label: "Fitness", emoji: "🧘" },
  { value: "food", label: "Food & drink", emoji: "🍽️" },
  { value: "music", label: "Music", emoji: "🎵" },
  { value: "networking", label: "Networking", emoji: "🤝" },
  { value: "outdoor", label: "Outdoor", emoji: "🌳" },
  { value: "arts", label: "Arts", emoji: "🎭" },
];

const exampleMoments = demoMoments.slice(0, 3).map((moment) => ({
  ...moment,
  content_origin: "demo" as const,
}));

const ExploreMoments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"soonest" | "popular">("soonest");
  const [momentMode, setMomentMode] = useState<"live" | "recurring" | "examples">("live");

  const momentsQuery = useQuery({
    queryKey: ["explore-moments", activeCategory],
    queryFn: async () => {
      let query = supabase
        .from("view_public_moment_directory")
        .select("*")
        .eq("is_active", true)
        .gte("starts_at", new Date().toISOString())
        .limit(72);

      if (activeCategory !== "all") {
        query = query.eq("category", activeCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as PublicMoment[];
    },
  });

  const linkedContentQuery = useQuery({
    queryKey: ["explore-moments-linked-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("view_public_content_directory")
        .select("*")
        .order("posted_at", { ascending: false, nullsFirst: false })
        .limit(6);

      if (error) throw error;
      return (data || []) as PublicContentItem[];
    },
  });

  const filteredMoments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const base = (momentsQuery.data || []).filter((moment) => {
      if (momentMode === "recurring" && !moment.recurrence_enabled) return false;
      if (!query) return true;

      const brands = Array.isArray(moment.associated_brand_names) ? moment.associated_brand_names.join(" ") : "";
      return [
        moment.title,
        moment.description,
        moment.location,
        moment.venue_name,
        moment.city,
        moment.country,
        moment.category,
        brands,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });

    return [...base].sort((a, b) => {
      if (sortBy === "popular") {
        return (b.participant_count || 0) - (a.participant_count || 0);
      }

      return new Date(a.starts_at || "").getTime() - new Date(b.starts_at || "").getTime();
    });
  }, [momentsQuery.data, momentMode, searchQuery, sortBy]);

  const featuredLocations = Array.from(
    new Map(
      filteredMoments
        .filter((moment) => Boolean(moment.country_slug))
        .map((moment) => {
          const href = moment.country_slug
            ? moment.city_slug
              ? `/locations/${moment.country_slug}/${moment.city_slug}`
              : `/locations/${moment.country_slug}`
            : null;

          return [
            href || moment.location,
            {
              label: [moment.city, moment.country].filter(Boolean).join(", ") || moment.location || "Location",
              href,
            },
          ];
        })
    ).values()
  )
    .filter((entry) => Boolean(entry.href))
    .slice(0, 6);

  const isLoading = momentsQuery.isLoading || linkedContentQuery.isLoading;
  const liveCount = momentsQuery.data?.length || 0;
  const recurringCount = (momentsQuery.data || []).filter((moment) => moment.recurrence_enabled).length;
  const activeModeLabel =
    momentMode === "examples" ? "Example playbooks" : momentMode === "recurring" ? "Recurring moments" : "Moments to join";

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Explore Moments"
        description="Browse upcoming moments, public activations, and linked content across Promorang."
        url={getSiteUrl("/explore/moments")}
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Explore Moments",
          description: "Browse upcoming moments, public activations, and linked content across Promorang.",
        }}
      />

      <section className="px-4 pb-8 pt-24 sm:pt-28">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[2rem] border border-border bg-charcoal text-white shadow-elevated">
            <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="relative overflow-hidden p-6 sm:p-8 lg:p-10">
                <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-primary/20 blur-[100px]" />
                <div className="relative z-10">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5">
                    <Compass className="h-4 w-4 text-primary" />
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-200">Moment discovery</span>
                  </div>
                  <h1 className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl">
                    Find the next room worth entering.
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
                    Search live moments first. Switch to recurring when you want reliable rituals, or examples when you want to learn the pattern before creating one.
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">Live</p>
                      <p className="mt-1 font-serif text-2xl font-bold text-white">{liveCount}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">Recurring</p>
                      <p className="mt-1 font-serif text-2xl font-bold text-white">{recurringCount}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">Examples</p>
                      <p className="mt-1 font-serif text-2xl font-bold text-white">{exampleMoments.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 bg-white/[0.04] p-5 lg:border-l lg:border-t-0 sm:p-6 lg:p-8">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4 backdrop-blur">
                  <MomentValuePath
                    variant="detail"
                    className="border-white/10 bg-white/[0.06]"
                    steps={[
                      { label: "Choose", detail: "Moment, ritual, playbook" },
                      { label: "Prove", detail: "Code, GPS, host, media" },
                      { label: "Unlock", detail: "Mark, access, reward" },
                    ]}
                  />
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Button asChild variant="hero">
                      <Link to="/for-you">
                        Open For You
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="border-white/20 bg-white/[0.06] text-white hover:bg-white/[0.12] hover:text-white">
                      <Link to="/create/moment">Create a moment</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky top-20 z-20 mt-5 rounded-[1.5rem] border border-border bg-background/95 p-3 shadow-soft backdrop-blur">
            <div className="grid gap-3 xl:grid-cols-[minmax(280px,0.9fr)_1.35fr_auto] xl:items-center">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search title, place, host, brand..."
                  className="h-12 rounded-2xl pl-11"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 xl:pb-0">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setActiveCategory(category.value)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                      activeCategory === category.value
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                    }`}
                  >
                    <span className="mr-1.5">{category.emoji}</span>
                    {category.label}
                  </button>
                ))}
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => setSortBy("soonest")}
                  className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition-all ${
                    sortBy === "soonest" ? "bg-primary text-primary-foreground shadow-soft" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Clock className="mr-1.5 h-4 w-4" />
                  Soonest
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("popular")}
                  className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition-all ${
                    sortBy === "popular" ? "bg-primary text-primary-foreground shadow-soft" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <TrendingUp className="mr-1.5 h-4 w-4" />
                  Popular
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-serif text-2xl font-bold">{activeModeLabel}</h2>
                {momentMode !== "examples" && !momentsQuery.isLoading ? (
                  <Badge variant="outline" className="rounded-full">{filteredMoments.length} shown</Badge>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">
                {momentMode === "examples"
                  ? "Examples explain how a moment can work without pretending to be live supply."
                  : momentMode === "recurring"
                    ? "Weekly, monthly, and repeatable moments build familiarity, standing, and return behavior."
                    : "Browse what people can join, attend, prove, and turn into value."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 rounded-full border border-border bg-card p-1 shadow-sm">
              {[
                { value: "live", label: "Live", icon: Sparkles },
                { value: "recurring", label: "Recurring", icon: Repeat2 },
                { value: "examples", label: "Examples", icon: BookOpen },
              ].map((mode) => {
                const Icon = mode.icon;
                const active = momentMode === mode.value;
                return (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setMomentMode(mode.value as typeof momentMode)}
                    className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition ${
                      active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            {isLoading ? (
              <MasonryGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }} gap={20}>
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="overflow-hidden rounded-2xl border border-border bg-card">
                    <Skeleton className={`w-full ${index % 3 === 0 ? "h-64" : index % 2 === 0 ? "h-56" : "h-48"}`} />
                    <div className="p-4">
                      <Skeleton className="mb-2 h-5 w-3/4" />
                      <Skeleton className="mb-3 h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </MasonryGrid>
            ) : momentMode === "examples" ? (
              <section className="rounded-[1.75rem] border border-dashed border-primary/30 bg-primary/5 p-5 shadow-soft">
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Example playbook</p>
                    <h2 className="mt-2 font-serif text-2xl font-bold text-foreground">Learn the pattern before taking action</h2>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                      These examples teach action, proof, reward, and memory patterns. They are not counted as live supply.
                    </p>
                  </div>
                  <Button asChild variant="outline">
                    <Link to="/create/moment">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Build from a pattern
                    </Link>
                  </Button>
                </div>
                <MasonryGrid columns={{ sm: 1, md: 2, lg: 3 }} gap={20}>
                  {exampleMoments.map((moment) => (
                    <MomentCard key={moment.id} moment={moment as any} />
                  ))}
                </MasonryGrid>
              </section>
            ) : filteredMoments.length > 0 ? (
              <MasonryGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }} gap={20}>
                {filteredMoments.map((moment) => (
                  <MomentCard
                    key={moment.id}
                    moment={{
                      ...(moment as any),
                      id: moment.id || "",
                      title: moment.title || "Untitled moment",
                      location: moment.location || [moment.city, moment.country].filter(Boolean).join(", "),
                      content_origin: "stakeholder_created",
                    }}
                    onSave={(id) => console.log("Saved:", id)}
                  />
                ))}
              </MasonryGrid>
            ) : (
              <div className="rounded-3xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  <Sparkles className="h-10 w-10" />
                </div>
                <h3 className="font-serif text-2xl font-semibold">No moments matched</h3>
                <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                  Try a broader search or switch categories. If you want the system to do the ranking for you instead, open the personalized feed.
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button asChild variant="outline">
                    <Link to="/for-you">Open For You</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/create/moment">Create a moment</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {!isLoading && filteredMoments.length > 0 ? (
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild variant="outline">
                <Link to="/explore/venues">
                  <MapPin className="mr-2 h-4 w-4" />
                  Browse venues
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/explore/rewards">Browse rewards</Link>
              </Button>
            </div>
          ) : null}

          <div className="mt-10 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[1.5rem] border border-border bg-card/80 p-5 shadow-soft">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Archive paths</p>
              <h2 className="mt-2 font-serif text-xl font-bold text-foreground">Browse by category and place</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Use archives when you want a direct path into cities, countries, venues, and category pages.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.filter((category) => category.value !== "all").slice(0, 6).map((category) => (
                  <Button key={category.value} asChild variant="outline" size="sm" className="rounded-full">
                    <Link to={`/categories/${slugifySegment(category.value)}`}>{category.label}</Link>
                  </Button>
                ))}
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link to="/explore/content">Content</Link>
                </Button>
              </div>
              {featuredLocations.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {featuredLocations.map((location) => (
                    <Button key={location.href!} asChild variant="outline" size="sm" className="rounded-full">
                      <Link to={location.href!}>{location.label}</Link>
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>

            {linkedContentQuery.data && linkedContentQuery.data.length > 0 && !searchQuery && activeCategory === "all" ? (
              <div className="rounded-[1.5rem] border border-border bg-card/80 p-5 shadow-soft">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Linked content</p>
                    <h2 className="mt-2 font-serif text-xl font-bold text-foreground">Media with a moment path</h2>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                      Content belongs here when it points people toward a place, activity, or proof path.
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link to="/explore/content">Browse all</Link>
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {linkedContentQuery.data.slice(0, 2).map((item) => (
                    <PublicContentCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ExploreMoments;
