import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MasonryGrid } from "@/components/MasonryGrid";
import { MomentCard } from "@/components/MomentCard";
import { PublicContentCard, type PublicContentItem } from "@/components/content/PublicContentCard";
import { buildLocationPath, formatLocationLabel, getSiteUrl } from "@/lib/discovery";
import { ArrowLeft, CalendarDays, MapPin, ShoppingBag, Star } from "lucide-react";

type CommerceListing = Tables<"view_public_commerce_directory">;

interface PublicVenueRow {
  id: string;
  slug: string | null;
  name: string;
  description: string | null;
  location: string | null;
  city: string | null;
  city_slug: string | null;
  country: string | null;
  country_slug: string | null;
  address: string | null;
  venue_type: string | null;
  avg_rating: number | null;
  popularity_score: number | null;
  active_moments_count: number | null;
}

interface PublicMomentDirectoryRow {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  category: string | null;
  city: string | null;
  country: string | null;
  location: string | null;
  venue_name: string | null;
  image_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  reward: string | null;
  host_id: string | null;
  is_active: boolean;
  participant_count: number;
}

export default function VenueProfile() {
  const { slug = "" } = useParams<{ slug: string }>();

  const venueQuery = useQuery({
    queryKey: ["venue-profile", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("view_public_venue_directory")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return data as PublicVenueRow | null;
    },
    enabled: Boolean(slug),
  });

  const momentsQuery = useQuery({
    queryKey: ["venue-moments", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("view_public_moment_directory")
        .select("*")
        .eq("venue_slug", slug)
        .eq("is_active", true)
        .order("starts_at", { ascending: true });

      if (error) throw error;
      return (data || []) as PublicMomentDirectoryRow[];
    },
    enabled: Boolean(slug),
  });

  const contentQuery = useQuery({
    queryKey: ["venue-content", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("view_public_content_directory")
        .select("*")
        .eq("venue_slug", slug)
        .order("posted_at", { ascending: false, nullsFirst: false });

      if (error) throw error;
      return (data || []) as PublicContentItem[];
    },
    enabled: Boolean(slug),
  });

  const commerceQuery = useQuery({
    queryKey: ["venue-commerce", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("view_public_commerce_directory")
        .select("*")
        .eq("venue_slug", slug)
        .eq("is_active", true)
        .order("created_at", { ascending: false, nullsFirst: false })
        .limit(12);

      if (error) throw error;
      return (data || []) as CommerceListing[];
    },
    enabled: Boolean(slug),
  });

  const venue = venueQuery.data;
  const moments = momentsQuery.data || [];
  const content = contentQuery.data || [];
  const commerceListings = commerceQuery.data || [];
  const isLoading = venueQuery.isLoading || momentsQuery.isLoading || contentQuery.isLoading || commerceQuery.isLoading;

  if (!isLoading && !venue) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="font-serif text-3xl font-bold text-foreground">Venue not found</h1>
        <p className="mt-3 text-muted-foreground">This venue profile is not available yet.</p>
        <Button asChild variant="hero" className="mt-6">
          <Link to="/explore/moments">Browse moments</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      {venue && (
        <SEO
          title={venue.name}
          description={venue.description || `View moments and creator content connected to ${venue.name}.`}
          url={getSiteUrl(`/venues/${slug}`)}
          schema={{
            "@context": "https://schema.org",
            "@type": "Place",
            "name": venue.name,
            "description": venue.description,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": venue.address,
              "addressLocality": venue.city,
              "addressCountry": venue.country,
            },
          }}
        />
      )}

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-56 rounded-[2rem]" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-80 rounded-3xl" />
            ))}
          </div>
        </div>
      ) : venue ? (
        <>
          <section className="rounded-[2rem] border border-border bg-card px-6 py-8 shadow-soft">
            <Button asChild variant="ghost" className="mb-5 w-fit">
              <Link to={venue.country_slug ? buildLocationPath(venue.country_slug, venue.city_slug) : "/explore/moments"}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to location
              </Link>
            </Button>

            <div className="flex flex-col gap-4">
              <Badge variant="outline" className="w-fit text-[11px] font-black uppercase tracking-[0.24em]">
                Venue profile
              </Badge>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="font-serif text-4xl font-black text-foreground sm:text-5xl">{venue.name}</h1>
                  <p className="mt-3 max-w-3xl text-base text-muted-foreground">
                    {venue.description || "A public venue page for browsing moments and linked content happening here."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {venue.venue_type && <Badge variant="secondary">{venue.venue_type}</Badge>}
                  {venue.avg_rating ? (
                    <Badge variant="secondary">
                      <Star className="mr-1 h-3.5 w-3.5" />
                      {venue.avg_rating.toFixed(1)}
                    </Badge>
                  ) : null}
                  <Badge variant="secondary">{venue.active_moments_count || 0} active moments</Badge>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {formatLocationLabel(venue.city, venue.country) || venue.location || "Location pending"}
                </span>
                {venue.address && <span>{venue.address}</span>}
              </div>
            </div>
          </section>

          <div className="mt-10 space-y-12">
            <section>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-foreground">Moments at this venue</h2>
                  <p className="text-sm text-muted-foreground">Public experiences tied to this place.</p>
                </div>
                <Badge variant="secondary">{moments.length}</Badge>
              </div>
              {moments.length > 0 ? (
                <MasonryGrid columns={{ sm: 1, md: 2, lg: 3 }} gap={24}>
                  {moments.map((moment) => (
                    <MomentCard
                      key={moment.id}
                      moment={{
                        ...(moment as any),
                        slug: moment.slug,
                        participant_count: moment.participant_count,
                      }}
                    />
                  ))}
                </MasonryGrid>
              ) : (
                <div className="rounded-3xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center text-muted-foreground">
                  No active moments are linked to this venue yet.
                </div>
              )}
            </section>

            <section>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-foreground">Products and services</h2>
                  <p className="text-sm text-muted-foreground">Public offers, redemptions, and bookable services tied to this place.</p>
                </div>
                <Badge variant="secondary">{commerceListings.length}</Badge>
              </div>
              {commerceListings.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {commerceListings.map((listing) => (
                    <div key={listing.listing_id} className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
                      <div className="aspect-[4/3] bg-muted">
                        {listing.image_url ? (
                          <img src={listing.image_url} alt={listing.name || "Venue offer"} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <ShoppingBag className="h-10 w-10 opacity-30" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-4 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-serif text-xl font-bold text-foreground">{listing.name}</h3>
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                              {listing.description || "Available through this venue."}
                            </p>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {listing.listing_kind || "product"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {listing.category ? <Badge variant="secondary" className="capitalize">{listing.category}</Badge> : null}
                          {listing.points_cost ? <Badge variant="secondary">{listing.points_cost} pts</Badge> : null}
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-lg font-bold text-foreground">
                            {typeof listing.price === "number"
                              ? new Intl.NumberFormat(undefined, { style: "currency", currency: listing.currency || "USD" }).format(listing.price)
                              : "Open"}
                          </p>
                          {listing.booking_url ? (
                            <Button asChild size="sm">
                              <a href={listing.booking_url} target="_blank" rel="noreferrer">
                                <CalendarDays className="mr-2 h-4 w-4" />
                                Book
                              </a>
                            </Button>
                          ) : (
                            <Button asChild size="sm" variant="outline">
                              <Link to="/marketplace">View</Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center text-muted-foreground">
                  No public products or services are attached to this venue yet.
                </div>
              )}
            </section>

            <section>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-foreground">Linked content</h2>
                  <p className="text-sm text-muted-foreground">Content that resolves into venue-based experiences.</p>
                </div>
                <Badge variant="secondary">{content.length}</Badge>
              </div>
              {content.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {content.map((item) => (
                    <PublicContentCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center text-muted-foreground">
                  No linked content is attached to this venue yet.
                </div>
              )}
            </section>
          </div>
        </>
      ) : null}
    </main>
  );
}
