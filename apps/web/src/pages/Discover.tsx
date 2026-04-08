import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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

const Discover = () => {
  const { user } = useAuth();
  const { startTour, isTourCompleted } = useTour();
  const navigate = useNavigate();
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "popular" | "nearby">("date");

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

  const filteredMoments = moments.filter(
    (moment) =>
      moment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      moment.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      moment.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section - Pinterest/Airbnb inspired */}
      <section className="pt-24 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Headline */}
          <div className="text-center mb-8">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              Discover your next{" "}
              <span className="text-gradient-primary">moment</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find experiences worth sharing. Join gatherings that bring people together.
            </p>
          </div>

          {/* Search Bar - Airbnb style */}
          <div className="max-w-3xl mx-auto" data-tour="discover-search">
            <div className="flex flex-col sm:flex-row gap-3 p-3 bg-card border border-border rounded-2xl shadow-soft">
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
              <Button
                variant="hero"
                size="lg"
                className="h-12 px-6"
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

          {/* Quick Filters - Pinterest style pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6" data-tour="discover-sort">
            <button
              onClick={() => setSortBy("date")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${sortBy === "date"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/80"
                }`}
            >
              <Clock className="w-4 h-4 inline mr-1.5" />
              Upcoming
            </button>
            <button
              onClick={() => setSortBy("popular")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${sortBy === "popular"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/80"
                }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-1.5" />
              Trending
            </button>
            <button
              onClick={() => setSortBy("nearby")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${sortBy === "nearby"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/80"
                }`}
            >
              <MapPin className="w-4 h-4 inline mr-1.5" />
              Nearby
            </button>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Demo Event Banner - shown when there are moments */}
          {!loading && filteredMoments.length > 0 && (
            <div className="mb-8">
              <DemoEventBanner variant="discover" />
            </div>
          )}

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
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
          </div>

          {/* Results Grid */}
          <div data-tour="discover-moments">
            {loading ? (
              <MasonryGrid columns={4}>
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
              <div className="text-center py-20">
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
              <MasonryGrid columns={4} gap={20}>
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
