import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MasonryGrid } from "@/components/MasonryGrid";
import { MomentCard } from "@/components/MomentCard";
import { DemoEventBanner } from "@/components/DemoEventBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Calendar, Sparkles, TrendingUp, Clock, MapPin } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { useTour } from "@/contexts/TourContext";
import ProductTour from "@/components/tours/ProductTour";
import { momentArchetypes, venueCategories } from "@/lib/moment-taxonomy";
import { SuggestedMoments } from "@/components/discovery/SuggestedMoments";
import FeaturedMomentCard, { FeaturedMomentGrid } from "@/components/featured/FeaturedMomentCard";

type Moment = Tables<"moments"> & {
  participant_count?: number;
  is_saved?: boolean;
  host?: {
    full_name: string;
    avatar_url: string | null;
  };
};

const categories = [
  { value: "all", label: "All Categories", emoji: "✨" },
  { value: "social", label: "Social", emoji: "🎉" },
  { value: "workshop", label: "Workshop", emoji: "🎨" },
  { value: "fitness", label: "Fitness", emoji: "🧘" },
  { value: "food", label: "Food & Drink", emoji: "🍽️" },
  { value: "music", label: "Music", emoji: "🎵" },
  { value: "networking", label: "Networking", emoji: "🤝" },
  { value: "outdoor", label: "Outdoor", emoji: "🌳" },
  { value: "arts", label: "Arts", emoji: "🎭" },
];

const archetypeFilters = [
  { value: "all", label: "All Formats" },
  ...momentArchetypes.map((item) => ({ value: item.value, label: item.label })),
];

const venueFilters = [
  { value: "all", label: "All Places" },
  ...venueCategories.map((item) => ({ value: item.value, label: item.label })),
];

const Discover = () => {
  const { user } = useAuth();
  const { startTour, isTourCompleted } = useTour();
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArchetype, setSelectedArchetype] = useState("all");
  const [selectedVenueCategory, setSelectedVenueCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "popular" | "nearby">("date");
  const [featuredMoments, setFeaturedMoments] = useState<any[]>([]);

  // Fetch featured moments
  useEffect(() => {
    fetchFeaturedMoments();
  }, []);

  const fetchFeaturedMoments = async () => {
    try {
      const response = await fetch('/api/featured-marketplace/active?placement_type=moment_featured&limit=4');
      const data = await response.json();
      if (data.success && data.placements.length > 0) {
        // Transform placements to moment format
        const moments = data.placements.map((placement: any) => ({
          id: placement.entity_id,
          name: placement.entity_data?.title || 'Featured Moment',
          description: placement.entity_data?.description,
          image_url: placement.entity_data?.image_url,
          location: placement.entity_data?.location,
          participant_count: placement.entity_data?.participant_count || 0,
          max_participants: placement.entity_data?.max_participants,
          prize_pool: placement.entity_data?.prize_pool,
          sponsor_name: placement.user?.display_name,
          sponsor_logo: placement.user?.profile_image,
          featured_placement_id: placement.id,
          status: 'upcoming',
        }));
        setFeaturedMoments(moments);
      }
    } catch (error) {
      console.error('Error fetching featured moments:', error);
    }
  };

  // Auto-start discover tour for new users
  useEffect(() => {
    if (user && !isTourCompleted('discover')) {
      // Delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        startTour('discover');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, isTourCompleted, startTour]);

  useEffect(() => {
    fetchMoments();
  }, [selectedCategory, sortBy]);

  const fetchMoments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("moments")
        .select("*")
        .eq("is_active", true)
        .gte("starts_at", new Date().toISOString());

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      if (sortBy === "date") {
        query = query.order("starts_at", { ascending: true });
      } else if (sortBy === "popular") {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get participant counts
      const momentsWithCounts = await Promise.all(
        (data || []).map(async (moment) => {
          const { count } = await supabase
            .from("moment_participants")
            .select("*", { count: "exact", head: true })
            .eq("moment_id", moment.id);

          return { ...moment, participant_count: count || 0 };
        })
      );

      setMoments(momentsWithCounts);
    } catch (error) {
      console.error("Error fetching moments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMoments = moments.filter((moment) => {
    const matchesTaxonomy =
      (selectedArchetype === "all" || (moment as any).moment_archetype === selectedArchetype) &&
      (selectedVenueCategory === "all" || (moment as any).venue_category === selectedVenueCategory);

    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query.length === 0 ||
      moment.title.toLowerCase().includes(query) ||
      moment.description?.toLowerCase().includes(query) ||
      moment.location.toLowerCase().includes(query) ||
      ((moment as any).venue_name || "").toLowerCase().includes(query);

    return matchesTaxonomy && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section - Pinterest/Airbnb inspired */}
      <section className="px-4 pb-8 pt-20 sm:pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Headline */}
          <div className="text-center mb-8">
            <h1 className="mb-4 font-serif text-3xl font-bold text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
              Discover your next{" "}
              <span className="text-gradient-primary">moment</span>
            </h1>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
              Find creator missions, retail drops, service rituals, community gatherings, and everyday visits worth turning into something bigger.
            </p>
          </div>

          {/* Featured Moments Section - Moment Discovery Boost ($100/day) */}
          {featuredMoments.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Featured Moments</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredMoments.map((moment) => (
                  <FeaturedMomentCard 
                    key={moment.id} 
                    moment={moment}
                    variant="default"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Search Bar - Airbnb style */}
          <div className="max-w-3xl mx-auto" data-tour="discover-search">
            <div className="rounded-[1.75rem] border border-border bg-card p-3 shadow-soft sm:rounded-2xl">
              <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search moments, locations, or activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 border-0 bg-transparent text-base focus-visible:ring-0"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48 h-12 border-0 bg-secondary" data-tour="discover-category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <span className="flex items-center gap-2">
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedArchetype} onValueChange={setSelectedArchetype}>
                <SelectTrigger className="w-full sm:w-48 h-12 border-0 bg-secondary">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  {archetypeFilters.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="hero"
                size="lg"
                className="h-12 px-6 sm:min-w-[132px]"
                onClick={() => {
                  if (searchQuery.trim()) {
                    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}&category=moment`;
                  }
                }}
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              </div>
            </div>
          </div>

          {/* Quick Filters - Pinterest style pills */}
          <div className="mt-6 -mx-4 overflow-x-auto px-4 pb-2 touch-pan-x snap-x-mandatory scrollbar-none" data-tour="discover-sort">
            <div className="flex min-w-max items-center justify-start gap-2 sm:min-w-0 sm:flex-wrap sm:justify-center">
            <button
              onClick={() => setSortBy("date")}
              className={`snap-start rounded-full px-4 py-2 text-sm font-medium transition-all touch-manipulation ${sortBy === "date"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/80"
                }`}
            >
              <Clock className="w-4 h-4 inline mr-1.5" />
              Upcoming
            </button>
            <button
              onClick={() => setSortBy("popular")}
              className={`snap-start rounded-full px-4 py-2 text-sm font-medium transition-all touch-manipulation ${sortBy === "popular"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/80"
                }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-1.5" />
              Trending
            </button>
            <button
              onClick={() => setSortBy("nearby")}
              className={`snap-start rounded-full px-4 py-2 text-sm font-medium transition-all touch-manipulation ${sortBy === "nearby"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/80"
                }`}
            >
              <MapPin className="w-4 h-4 inline mr-1.5" />
              Nearby
            </button>
            </div>
          </div>
          <div className="mt-4 -mx-4 overflow-x-auto px-4 pb-2 touch-pan-x snap-x-mandatory scrollbar-none">
            <div className="flex min-w-max items-center gap-2">
              {venueFilters.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setSelectedVenueCategory(item.value)}
                  className={`snap-start rounded-full px-4 py-2 text-sm font-medium transition-all touch-manipulation ${
                    selectedVenueCategory === item.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 -mx-4 overflow-x-auto px-4 touch-pan-x snap-x-mandatory scrollbar-none sm:hidden">
            <div className="flex gap-3 pb-1">
              <div className="min-w-[240px] snap-start rounded-2xl border border-primary/15 bg-primary/5 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Flow</p>
                <p className="mt-2 text-sm font-medium text-foreground">Search, swipe filters, tap a card, then join with the sticky action flow.</p>
              </div>
              <div className="min-w-[220px] snap-start rounded-2xl border border-border bg-card p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">Mobile tip</p>
                <p className="mt-2 text-sm text-muted-foreground">The filter rail is built for thumb scrolling, so it stays fast even on smaller screens.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-primary/15 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-5 shadow-soft sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Watch & Unlock</p>
                <h2 className="mt-2 font-serif text-2xl font-bold text-foreground">Creator stories that turn into physical missions</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Start with digital content, pick up the unlock clue, then move into the linked retail, service, or community moment to verify the real-world action.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="outline" className="sm:min-w-[160px]">
                  <Link to="/pulse">See Live Pulse</Link>
                </Button>
                <Button asChild variant="hero" className="sm:min-w-[180px]">
                  <Link to="/watch-unlock">Open Watch & Unlock</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="px-4 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Suggested Moments for New Users */}
          {user && !loading && filteredMoments.length === 0 && searchQuery === "" && selectedCategory === "all" && (
            <SuggestedMoments limit={3} />
          )}

          {/* Demo Event Banner - shown when there are moments */}
          {!loading && filteredMoments.length > 0 && (
            <div className="mb-8">
              <DemoEventBanner variant="discover" />
            </div>
          )}

          {/* Results Header */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground">
              {loading ? (
                "Loading..."
              ) : (
                <>
                  <span className="font-semibold text-foreground">{filteredMoments.length}</span>
                  {" moment"}{filteredMoments.length !== 1 ? "s" : ""} found
                </>
              )}
            </p>
            {!loading && filteredMoments.length > 0 && (
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Fresh moments sorted for quick mobile scanning.
              </div>
            )}
          </div>

          {/* Results Grid */}
          <div data-tour="discover-moments">
            {loading ? (
              <MasonryGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }} gap={20}>
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border">
                    <Skeleton className={`w-full ${i % 3 === 0 ? "h-64" : i % 2 === 0 ? "h-56" : "h-48"}`} />
                    <div className="p-4">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </MasonryGrid>
            ) : filteredMoments.length === 0 ? (
              /* Empty State */
              <div className="py-16 text-center sm:py-20">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="font-serif text-2xl font-semibold mb-3">No moments found</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  {searchQuery || selectedCategory !== "all"
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : "There are no live moments yet. Be the first to create something amazing!"}
                </p>
                {!searchQuery && selectedCategory === "all" && (
                  <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
                    Create your first moment and start bringing people together in your community.
                  </p>
                )}
                {user && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button asChild variant="hero" size="lg">
                      <Link to="/create-moment">Create a Moment</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link to="/for-brands">For Businesses</Link>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              /* Masonry Grid */
              <MasonryGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }} gap={20}>
                {filteredMoments.map((moment) => (
                  <MomentCard
                    key={moment.id}
                    moment={moment}
                    onSave={(id) => console.log("Saved:", id)}
                  />
                ))}
              </MasonryGrid>
            )
            }
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced for stakeholders */}
      < section className="py-16 px-4 bg-gradient-to-br from-primary/5 to-accent/10" >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Ready to bring people together?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Whether you're hosting an event, running a campaign, or offering your venue, Promorang makes it easy to create memorable moments.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild variant="hero" size="lg">
              <Link to="/create-moment">Host a Moment</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/for-brands">For Brands</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/for-merchants">For Venues</Link>
            </Button>
          </div>
        </div>
      </section >

      {/* Product Tour */}
      <ProductTour tourId="discover" />
    </div >
  );
};

export default Discover;
