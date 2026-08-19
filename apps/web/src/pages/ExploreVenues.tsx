import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, LayoutGrid, MapPin, Search, Star, Users } from "lucide-react";
import { getSiteUrl } from "@/lib/discovery";

type PublicVenue = Tables<"view_public_venue_directory">;

const venueTypes = [
  { value: "all", label: "All venue types" },
  { value: "restaurant", label: "Restaurants" },
  { value: "bar", label: "Bars & nightlife" },
  { value: "retail", label: "Retail" },
  { value: "fitness", label: "Fitness" },
  { value: "wellness", label: "Wellness" },
  { value: "cafe", label: "Cafes" },
];

const ExploreVenues = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeVenueType, setActiveVenueType] = useState("all");

  const venuesQuery = useQuery({
    queryKey: ["explore-venues", activeVenueType],
    queryFn: async () => {
      let query = supabase
        .from("view_public_venue_directory")
        .select("*")
        .order("popularity_score", { ascending: false, nullsFirst: false })
        .limit(48);

      if (activeVenueType !== "all") {
        query = query.eq("venue_type", activeVenueType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as PublicVenue[];
    },
  });

  const filteredVenues = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return venuesQuery.data || [];

    return (venuesQuery.data || []).filter((venue) =>
      [venue.name, venue.description, venue.city, venue.country, venue.location, venue.venue_type]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [venuesQuery.data, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Explore Venues"
        description="Browse venues and local operators hosting moments and reward-bearing activity across Promorang."
        url={getSiteUrl("/explore/venues")}
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Explore Venues",
          description: "Browse venues and local operators hosting moments and reward-bearing activity across Promorang.",
        }}
      />

      <section className="px-4 pb-10 pt-24 sm:pt-28">
        <div className="mx-auto max-w-7xl">
          <Card className="border-primary/10 bg-gradient-to-r from-primary/5 via-background to-background shadow-soft">
            <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  Venue Discovery
                </div>
                <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                  Explore venues and operators.
                </h1>
                <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                  Browse the physical spaces where Promorang activity happens, then trace into the moments and reward loops attached to those places.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link to="/explore/moments">Browse moments</Link>
                </Button>
                <Button asChild>
                  <Link to="/hosts">See hosts</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Card className="shadow-soft">
              <CardContent className="flex items-start gap-3 p-5">
                <LayoutGrid className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Compare by category</p>
                  <p className="mt-1 text-sm text-muted-foreground">Retail, nightlife, wellness, food, and other venue types each behave differently in discovery.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-soft">
              <CardContent className="flex items-start gap-3 p-5">
                <Users className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Find hostable places</p>
                  <p className="mt-1 text-sm text-muted-foreground">The venue is infrastructure. Some venues also act as Hosts when they actively operate moments.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-soft">
              <CardContent className="flex items-start gap-3 p-5">
                <Building2 className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Connect place to behavior</p>
                  <p className="mt-1 text-sm text-muted-foreground">Use venue discovery to understand where check-ins, proofs, spend, and social participation are likely to happen.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-border bg-card/80 p-4 shadow-soft">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search venues by name, type, city, or country..."
                className="h-12 pl-11"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {venueTypes.map((venueType) => (
                <button
                  key={venueType.value}
                  type="button"
                  onClick={() => setActiveVenueType(venueType.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] ${
                    activeVenueType === venueType.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {venueType.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold">Browseable venues</h2>
              <p className="text-sm text-muted-foreground">Places and operators with public discovery context.</p>
            </div>
            {!venuesQuery.isLoading ? (
              <Badge variant="outline" className="rounded-full">
                {filteredVenues.length} venues
              </Badge>
            ) : null}
          </div>

          {venuesQuery.isLoading ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-72 rounded-3xl" />
              ))}
            </div>
          ) : filteredVenues.length > 0 ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredVenues.map((venue) => {
                const venuePath = `/venues/${venue.slug || venue.id}`;
                const ratingValue = typeof venue.avg_rating === "number" ? venue.avg_rating.toFixed(1) : null;

                return (
                  <Link
                    key={venue.id}
                    to={venuePath}
                    className="group rounded-[1.75rem] border border-border bg-card p-5 shadow-soft transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] hover:-translate-y-1 hover:border-primary/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-serif text-2xl font-bold text-foreground group-hover:text-primary">
                            {venue.name || "Unnamed venue"}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {[venue.city, venue.country].filter(Boolean).join(", ") || venue.location || "Location coming soon"}
                          </p>
                        </div>
                      </div>
                      {venue.verification_status === "verified" ? (
                        <Badge variant="secondary" className="rounded-full">Verified</Badge>
                      ) : null}
                    </div>

                    {venue.description ? (
                      <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">{venue.description}</p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {venue.venue_type ? (
                        <Badge variant="outline" className="rounded-full capitalize">{venue.venue_type.replace(/_/g, " ")}</Badge>
                      ) : null}
                      {typeof venue.active_moments_count === "number" ? (
                        <Badge variant="outline" className="rounded-full">{venue.active_moments_count} active moments</Badge>
                      ) : null}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-muted/40 p-3">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Hosted</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">{venue.total_moments_hosted || 0}</p>
                      </div>
                      <div className="rounded-2xl bg-muted/40 p-3">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Check-ins</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">{venue.total_checkins || 0}</p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="truncate">{venue.location || venue.address || "View venue"}</span>
                      </div>
                      {ratingValue ? (
                        <div className="flex items-center gap-1 text-foreground">
                          <Star className="h-4 w-4 fill-current text-amber-500" />
                          <span>{ratingValue}</span>
                        </div>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
              <h3 className="font-serif text-2xl font-bold">No venues matched</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a broader search or switch venue types to scan a different slice of the venue network.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ExploreVenues;
