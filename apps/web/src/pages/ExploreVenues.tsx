import { useState } from "react";
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
import { Building2, ChevronLeft, ChevronRight, LayoutGrid, MapPin, Search, Star, Users } from "lucide-react";
import { getSiteUrl } from "@/lib/discovery";
import { useI18n } from "@/i18n/I18nContext";

type PublicVenue = Tables<"view_public_venue_directory"> & {
  listing_status?: "claimed" | "unclaimed" | null;
  attribution_text?: string | null;
  parish?: string | null;
  parish_slug?: string | null;
};

const jamaicaParishes = ["Kingston", "Saint Andrew", "Saint Thomas", "Portland", "Saint Mary", "Saint Ann", "Trelawny", "Saint James", "Hanover", "Westmoreland", "Saint Elizabeth", "Manchester", "Clarendon", "Saint Catherine"];
const pageSize = 48;

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
  const { t, formatNumber } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeVenueType, setActiveVenueType] = useState("all");
  const [activeParish, setActiveParish] = useState("all");
  const [page, setPage] = useState(0);

  const venuesQuery = useQuery({
    queryKey: ["explore-venues", activeVenueType, activeParish, searchQuery, page],
    queryFn: async () => {
      let query = (supabase as any)
        .from("view_public_venue_directory")
        .select("*", { count: "exact" })
        .order("popularity_score", { ascending: false, nullsFirst: false })
        .range(page * pageSize, page * pageSize + pageSize - 1);

      if (activeVenueType !== "all") {
        query = query.eq("venue_type", activeVenueType);
      }
      if (activeParish !== "all") query = query.eq("parish", activeParish);
      const search = searchQuery.trim().replace(/[,%()]/g, " ");
      if (search) query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,parish.ilike.%${search}%,venue_type.ilike.%${search}%`);

      const { data, error, count } = await query;
      if (error) throw error;
      return { venues: (data || []) as PublicVenue[], count: count || 0 };
    },
  });
  const filteredVenues = venuesQuery.data?.venues || [];
  const totalVenues = venuesQuery.data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalVenues / pageSize));

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t("venues.seoTitle")}
        description={t("venues.seoCopy")}
        url={getSiteUrl("/explore/venues")}
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: t("venues.seoTitle"),
          description: t("venues.seoCopy"),
        }}
      />

      <section className="px-4 pb-10 pt-24 sm:pt-28">
        <div className="mx-auto max-w-7xl">
          <Card className="border-primary/10 bg-gradient-to-r from-primary/5 via-background to-background shadow-soft">
            <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  {t("venues.eyebrow")}
                </div>
                <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                  {t("venues.title")}
                </h1>
                <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                  {t("venues.copy")}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link to="/explore/moments">{t("venues.browseMoments")}</Link>
                </Button>
                <Button asChild>
                  <Link to="/hosts">{t("venues.seeHosts")}</Link>
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
                onChange={(event) => { setSearchQuery(event.target.value); setPage(0); }}
                placeholder={t("venues.search")}
                className="h-12 pl-11"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {venueTypes.map((venueType) => (
                <button
                  key={venueType.value}
                  type="button"
                  onClick={() => { setActiveVenueType(venueType.value); setPage(0); }}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] ${
                    activeVenueType === venueType.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {venueType.value === "all" ? t("venues.allTypes") : venueType.label}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <label htmlFor="parish-filter" className="sr-only">{t("venues.allParishes")}</label>
              <select id="parish-filter" value={activeParish} onChange={(event) => { setActiveParish(event.target.value); setPage(0); }} className="h-10 w-full max-w-xs rounded-xl border border-border bg-background px-3 text-sm font-semibold">
                <option value="all">{t("venues.allParishes")}</option>
                {jamaicaParishes.map((parish) => <option key={parish} value={parish}>{parish}</option>)}
              </select>
              <span className="hidden text-xs text-muted-foreground sm:inline">{t("venues.inventory")}</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold">{t("venues.browse")}</h2>
              <p className="text-sm text-muted-foreground">{t("venues.browseCopy")}</p>
            </div>
            {!venuesQuery.isLoading ? (
              <Badge variant="outline" className="rounded-full">
                {t("venues.count", { count: formatNumber(totalVenues) })}
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
                        <Badge variant="secondary" className="rounded-full">{t("venues.verified")}</Badge>
                      ) : venue.listing_status === "unclaimed" ? (
                        <Badge variant="outline" className="rounded-full">{t("venues.unclaimed")}</Badge>
                      ) : (
                        <Badge variant="outline" className="rounded-full">{t("venues.unverified")}</Badge>
                      )}
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
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t("venues.hosted")}</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">{venue.total_moments_hosted || 0}</p>
                      </div>
                      <div className="rounded-2xl bg-muted/40 p-3">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t("venues.checkins")}</p>
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
                    {venue.listing_status === "unclaimed" ? (
                      <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                        Public-source listing · {venue.attribution_text || "ownership not yet verified"}
                      </p>
                    ) : null}
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
          {totalPages > 1 ? (
            <nav aria-label="Venue pages" className="mt-8 flex items-center justify-center gap-3">
              <Button variant="outline" disabled={page === 0 || venuesQuery.isFetching} onClick={() => setPage((value) => Math.max(0, value - 1))}><ChevronLeft className="mr-1 h-4 w-4" />Previous</Button>
              <span className="text-sm font-semibold">Page {page + 1} of {totalPages}</span>
              <Button variant="outline" disabled={page + 1 >= totalPages || venuesQuery.isFetching} onClick={() => setPage((value) => value + 1)}>Next<ChevronRight className="ml-1 h-4 w-4" /></Button>
            </nav>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default ExploreVenues;
