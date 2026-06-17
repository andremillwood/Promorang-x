import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { MasonryGrid } from "@/components/MasonryGrid";
import { MomentCard } from "@/components/MomentCard";
import { PublicContentCard, type PublicContentItem } from "@/components/content/PublicContentCard";
import { demoMoments } from "@/data/demo-moments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock, MapPin, Search, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
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
  }, [momentsQuery.data, searchQuery, sortBy]);

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
          <div className="rounded-[2rem] border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-accent/10 p-6 shadow-soft sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <Badge variant="secondary" className="mb-4 rounded-full px-3 py-1">
                  Moment Discovery
                </Badge>
                <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  Browse moments without collapsing everything into the feed.
                </h1>
                <p className="mt-4 text-sm text-muted-foreground sm:text-base">
                  Live stakeholder-created moments carry the value. Example moments sit beside them as a playbook so people can learn what to do before they commit.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link to="/for-you">Open For You</Link>
                </Button>
                <Button asChild>
                  <Link to="/create-moment">Create a moment</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-border bg-card/80 p-4 shadow-soft">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search moments by title, location, venue, brand, or category..."
                className="h-12 pl-11"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setActiveCategory(category.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    activeCategory === category.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  <span className="mr-1.5">{category.emoji}</span>
                  {category.label}
                </button>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSortBy("soonest")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  sortBy === "soonest" ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                <Clock className="mr-1.5 inline h-4 w-4" />
                Soonest
              </button>
              <button
                type="button"
                onClick={() => setSortBy("popular")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  sortBy === "popular" ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                <TrendingUp className="mr-1.5 inline h-4 w-4" />
                Popular
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-border bg-card/80 p-4 shadow-soft">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Archive paths</p>
                <h2 className="mt-2 font-serif text-xl font-bold text-foreground">Browse by category and location</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Public archive pages let people move from a moment into cities, countries, venues, and connected content without relying on a single discovery page.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.filter((category) => category.value !== "all").slice(0, 6).map((category) => (
                  <Button key={category.value} asChild variant="outline" size="sm" className="rounded-full">
                    <Link to={`/categories/${slugifySegment(category.value)}`}>{category.label}</Link>
                  </Button>
                ))}
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link to="/explore/content">Content</Link>
                </Button>
              </div>
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

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-serif text-2xl font-bold">Live opportunities</h2>
                <Badge variant="secondary" className="rounded-full">
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  Real stakeholder content
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">These are the moments users can join, attend, prove, and turn into value.</p>
            </div>
            {!momentsQuery.isLoading ? (
              <Badge variant="outline" className="rounded-full">
                {filteredMoments.length} moments
              </Badge>
            ) : null}
          </div>

          {linkedContentQuery.data && linkedContentQuery.data.length > 0 && !searchQuery && activeCategory === "all" ? (
            <div className="mt-6 rounded-[1.75rem] border border-border bg-card/80 p-5 shadow-soft">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Linked content</p>
                  <h2 className="mt-2 font-serif text-2xl font-bold text-foreground">Media that points back into moments</h2>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    Content stays browseable in its own surface, but it should also remain visible here as proof that discovery objects connect to each other.
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link to="/explore/content">Browse all content</Link>
                </Button>
              </div>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {linkedContentQuery.data.map((item) => (
                  <PublicContentCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ) : null}

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
                    <Link to="/create-moment">Create a moment</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {!searchQuery && activeCategory === "all" ? (
            <section className="mt-10 rounded-[1.75rem] border border-dashed border-primary/30 bg-primary/5 p-5 shadow-soft">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Example playbook</p>
                  <h2 className="mt-2 font-serif text-2xl font-bold text-foreground">Learn the pattern before taking action</h2>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    Examples show how a moment converts attention into an action, proof, reward, and memory. They educate without being counted as live supply.
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link to="/create-moment">
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
          ) : null}

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
        </div>
      </section>
    </div>
  );
};

export default ExploreMoments;
