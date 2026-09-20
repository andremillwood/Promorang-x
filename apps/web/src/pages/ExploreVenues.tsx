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
import { ArrowRight, Building2, ChevronLeft, ChevronRight, MapPin, Search, Star } from "lucide-react";
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
    <div className="min-h-screen bg-black text-white">
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
          <header className="border-b border-white/10 pb-9">
            <p className="text-[10px] font-black uppercase tracking-[.28em] text-primary">Places</p>
            <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
              <div><h1 className="font-serif text-6xl font-bold leading-[.88] tracking-[-.055em] sm:text-8xl">Where things<br/><em className="font-normal text-primary">happen.</em></h1><p className="mt-6 max-w-2xl text-base leading-7 text-white/55">Follow PROMORANG through the rooms, venues and physical places connected to Moments, offers and culture.</p></div>
              <div className="border-y border-white/15 py-5 text-sm text-white/50"><p>Follow a place to see what happens there, what’s nearby and what might bring you back.</p><Link to="/discover?tab=moments" className="mt-4 inline-flex items-center gap-2 font-bold text-primary">See what is happening <ArrowRight className="h-4 w-4"/></Link></div>
            </div>
          </header>

          <div className="mt-6 border-y border-white/10 bg-white/[.025] p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
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
                  className={` px-4 py-2 text-sm font-medium transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] ${
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
              <span className="hidden text-xs text-white/45 sm:inline">Places in this view</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold">{t("venues.browse")}</h2>
              <p className="text-sm text-white/45">{t("venues.browseCopy")}</p>
            </div>
            {!venuesQuery.isLoading ? (
              <Badge variant="outline" className="">
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
                    className="group  border border-white/10 bg-white/[.025] p-5 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] hover:-translate-y-1 hover:border-primary/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className=" bg-primary/10 p-3 text-primary">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-serif text-2xl font-bold text-white group-hover:text-primary">
                            {venue.name || "Unnamed venue"}
                          </p>
                          <p className="mt-1 text-sm text-white/45">
                            {[venue.city, venue.country].filter(Boolean).join(", ") || venue.location || "Location coming soon"}
                          </p>
                        </div>
                      </div>
                      {venue.verification_status === "verified" ? (
                        <Badge variant="secondary" className="">{t("venues.verified")}</Badge>
                      ) : venue.listing_status === "unclaimed" ? (
                        <Badge variant="outline" className="">{t("venues.unclaimed")}</Badge>
                      ) : (
                        <Badge variant="outline" className="">{t("venues.unverified")}</Badge>
                      )}
                    </div>

                    {venue.description ? (
                      <p className="mt-4 line-clamp-3 text-sm text-white/45">{venue.description}</p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {venue.venue_type ? (
                        <Badge variant="outline" className=" capitalize">{venue.venue_type.replace(/_/g, " ")}</Badge>
                      ) : null}
                      {typeof venue.active_moments_count === "number" ? (
                        <Badge variant="outline" className="">{venue.active_moments_count} active moments</Badge>
                      ) : null}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className=" bg-muted/40 p-3">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/45">{t("venues.hosted")}</p>
                        <p className="mt-2 text-lg font-semibold text-white">{venue.total_moments_hosted || 0}</p>
                      </div>
                      <div className=" bg-muted/40 p-3">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/45">{t("venues.checkins")}</p>
                        <p className="mt-2 text-lg font-semibold text-white">{venue.total_checkins || 0}</p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between text-sm text-white/45">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="truncate">{venue.location || venue.address || "View venue"}</span>
                      </div>
                      {ratingValue ? (
                        <div className="flex items-center gap-1 text-white">
                          <Star className="h-4 w-4 fill-current text-amber-500" />
                          <span>{ratingValue}</span>
                        </div>
                      ) : null}
                    </div>
                    {venue.listing_status === "unclaimed" ? (
                      <p className="mt-4 border-t border-border pt-3 text-xs text-white/45">
                        Listed from public information · {venue.attribution_text || "ownership not yet verified"}
                      </p>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
              <h3 className="font-serif text-2xl font-bold">No venues matched</h3>
              <p className="mt-2 text-sm text-white/45">
                Try a broader search or switch venue types to scan a different slice of the venue network.
              </p>
            </div>
          )}
          <section className="mt-12 grid gap-px border-y border-white/10 bg-white/10 md:grid-cols-3"><Link to="/scenes" className="group bg-black p-6"><p className="text-[10px] font-black uppercase tracking-[.18em] text-primary">Scenes</p><p className="mt-2 font-serif text-2xl font-bold">Find the culture around a place.</p><ArrowRight className="mt-5 h-4 w-4"/></Link><Link to="/discover?tab=moments" className="group bg-black p-6"><p className="text-[10px] font-black uppercase tracking-[.18em] text-primary">Moments</p><p className="mt-2 font-serif text-2xl font-bold">See what is happening next.</p><ArrowRight className="mt-5 h-4 w-4"/></Link><Link to="/explore/rewards" className="group bg-black p-6"><p className="text-[10px] font-black uppercase tracking-[.18em] text-primary">Available</p><p className="mt-2 font-serif text-2xl font-bold">Find something you can unlock.</p><ArrowRight className="mt-5 h-4 w-4"/></Link></section>
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
