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
import { ArrowLeft, CalendarDays, CheckCircle2, Gem, MapPin, ShoppingBag, Star, Telescope } from "lucide-react";
import VerifiedPioneerBadge from "@/components/pioneer/VerifiedPioneerBadge";
import { ValueExchangeSummary, type ValueOutcome } from "@/components/economy/ValueOutcomes";
import { useClaimVenueEnrichment, useVenueEnrichment } from "@/hooks/useVenueEnrichment";
import { toast } from "sonner";
import { useI18n } from "@/i18n/I18nContext";

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
  verification_status: string | null;
  listing_status?: "claimed" | "unclaimed" | null;
  source_url?: string | null;
  attribution_text?: string | null;
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
  const { t } = useI18n();
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
  const enrichmentQuery = useVenueEnrichment(slug);
  const claimEnrichment = useClaimVenueEnrichment(slug);

  const venue = venueQuery.data;
  const moments = momentsQuery.data || [];
  const content = contentQuery.data || [];
  const commerceListings = commerceQuery.data || [];
  const enrichmentOpportunities = enrichmentQuery.data || [];
  const isLoading = venueQuery.isLoading || momentsQuery.isLoading || contentQuery.isLoading || commerceQuery.isLoading;
  const placeRail = [
    { label: t("venueProfile.arrive"), body: t("venueProfile.arriveCopy"), icon: MapPin },
    { label: t("venueProfile.checkIn"), body: t("venueProfile.checkInCopy"), icon: CheckCircle2 },
    { label: t("venueProfile.unlock"), body: t("venueProfile.unlockCopy"), icon: Gem },
  ];
  const venueOutcomes: ValueOutcome[] = [
    ...(commerceListings.length > 0 ? [{ kind: "reward" as const, label: `${commerceListings.length} offers or services` }] : []),
    ...(moments.length > 0 ? [{ kind: "access" as const, label: `${moments.length} active Moments` }] : []),
    ...(content.length > 0 ? [{ kind: "reputation" as const, label: "Proof-visible place" }] : []),
  ];

  if (!isLoading && !venue) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-3xl font-black uppercase tracking-[-0.04em] text-foreground">{t("venueProfile.notFound")}</h1>
        <p className="mt-3 text-muted-foreground">{t("venueProfile.notFoundCopy")}</p>
        <Button asChild variant="hero" className="mt-6">
          <Link to="/explore/moments">{t("venues.browseMoments")}</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      {venue && (
        <SEO
          title={venue.name}
          description={venue.description || t("venueProfile.seoCopy", { name: venue.name })}
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
          <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.2),transparent_34%),linear-gradient(135deg,rgba(9,9,9,0.98),rgba(22,22,22,0.94))] px-6 py-8 text-white shadow-2xl">
            <Button asChild variant="ghost" className="mb-5 w-fit">
              <Link to={venue.country_slug ? buildLocationPath(venue.country_slug, venue.city_slug) : "/explore/moments"}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("venueProfile.back")}
              </Link>
            </Button>

            <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
              <div className="flex flex-col gap-4">
                <Badge variant="outline" className="w-fit border-primary/35 bg-primary/10 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
                  {t("venueProfile.label")}
                </Badge>
                <div>
                  <div className="flex flex-wrap items-center gap-3"><h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.88] tracking-[-0.065em] sm:text-7xl">{venue.name}</h1><VerifiedPioneerBadge beneficiaryType="venue" beneficiaryId={venue.id} /></div>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-white/68">
                    {venue.description || t("venueProfile.fallback")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {venue.listing_status === "unclaimed" ? <Badge variant="outline">{t("venueProfile.unclaimed")}</Badge> : null}
                  {venue.venue_type && <Badge variant="secondary">{venue.venue_type}</Badge>}
                  {venue.avg_rating ? (
                    <Badge variant="secondary">
                      <Star className="mr-1 h-3.5 w-3.5" />
                      {venue.avg_rating.toFixed(1)}
                    </Badge>
                  ) : null}
                  <Badge variant="secondary">{t("venueProfile.activeMoments", { count: venue.active_moments_count || 0 })}</Badge>
                </div>
                {venue.listing_status === "unclaimed" ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/68">
                    <p>{t("venueProfile.unclaimedCopy")}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <Button asChild size="sm" variant="secondary"><Link to="/join/venue">{t("venueProfile.claim")}</Link></Button>
                      {venue.source_url ? <a href={venue.source_url} target="_blank" rel="noreferrer" className="text-xs underline">{venue.attribution_text || t("venueProfile.source")}</a> : null}
                    </div>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-4 text-sm text-white/62">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {formatLocationLabel(venue.city, venue.country) || venue.location || t("venueProfile.locationPending")}
                  </span>
                  {venue.address && <span>{venue.address}</span>}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">{t("venueProfile.proof")}</p>
                <p className="mt-3 text-sm leading-6 text-white/64">
                  {t("venueProfile.proofCopy")}
                </p>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[
                    [t("venueProfile.moments"), moments.length],
                    [t("venueProfile.offers"), commerceListings.length],
                    [t("venueProfile.content"), content.length],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-white/10 bg-black/25 p-3 text-center">
                      <p className="text-xl font-black">{value}</p>
                      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/42">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold">
                    <Link to="/explore/moments">{t("venueProfile.findMoment")}</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 font-bold">
                    <Link to="/rewards">Claim Perk to Wallet</Link>
                  </Button>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
                  <span>⚡ Powered by Community Vault Float</span>
                  <span className="text-emerald-400 font-semibold">100% Guaranteed</span>
                </div>
              </div>
            </div>
          </section>

          {venue.listing_status === "unclaimed" && enrichmentOpportunities.length > 0 ? (
            <section className="mt-8 rounded-[2rem] border border-primary/20 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.14),transparent_40%),rgba(255,255,255,0.025)] p-6 sm:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div><p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-primary"><Telescope className="h-4 w-4"/>Scout enrichment</p><h2 className="mt-2 font-serif text-3xl font-bold">Help complete this Discovery.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Claim one missing fact, submit local proof, and become part of this place’s verification record. This does not claim ownership of the business.</p></div>
                <Badge variant="outline" className="w-fit">{enrichmentOpportunities.length} open proofs</Badge>
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {enrichmentOpportunities.map((opportunity) => (
                  <article key={opportunity.id} className="flex min-h-48 flex-col justify-between rounded-2xl border border-border bg-card/80 p-5">
                    <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{opportunity.field_key.replace(/_/g, " ")}</p><h3 className="mt-2 text-lg font-bold">{opportunity.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{opportunity.instructions}</p></div>
                    <div className="mt-5 flex items-center justify-between gap-3"><span className="text-xs font-bold text-amber-500">Eligible for {opportunity.reward_points} points after approval</span><Button size="sm" disabled={opportunity.status !== "open" || claimEnrichment.isPending} onClick={() => claimEnrichment.mutate(opportunity.id,{onSuccess:()=>toast.success("Scout mission claimed. Open your field desk to submit proof."),onError:(error:any)=>toast.error(error.message)})}>{opportunity.status === "open" ? "Claim proof" : "In progress"}</Button></div>
                  </article>
                ))}
              </div>
              <Button asChild variant="outline" className="mt-5"><Link to="/scout/enrichment">Open my Scout field desk</Link></Button>
            </section>
          ) : null}

          <div className="mt-10 space-y-12">
            <ValueExchangeSummary
              action="Visit, attend, buy, book or contribute"
              proof="Check-in, receipt, redemption or approved contribution"
              outcomes={venueOutcomes}
            />
            <section className="grid gap-3 md:grid-cols-3">
              {placeRail.map((item) => (
                <div key={item.label} className="rounded-2xl border border-border bg-card/80 p-4 shadow-soft">
                  <item.icon className="h-5 w-5 text-primary" />
                  <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-primary">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </section>

            <section>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-[-0.035em] text-foreground">{t("venueProfile.momentsTitle")}</h2>
                  <p className="text-sm text-muted-foreground">{t("venueProfile.momentsCopy")}</p>
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
                  {t("venueProfile.noMoments")}
                </div>
              )}
            </section>

            <section>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-[-0.035em] text-foreground">{t("venueProfile.offersTitle")}</h2>
                  <p className="text-sm text-muted-foreground">{t("venueProfile.offersCopy")}</p>
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
                            <h3 className="text-xl font-black tracking-[-0.03em] text-foreground">{listing.name}</h3>
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
                  {t("venueProfile.noOffers")}
                </div>
              )}
            </section>

            <section>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-[-0.035em] text-foreground">{t("venueProfile.linkedContent")}</h2>
                  <p className="text-sm text-muted-foreground">{t("venueProfile.linkedContentCopy")}</p>
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
                  {t("venueProfile.noContent")}
                </div>
              )}
            </section>
          </div>
        </>
      ) : null}
    </main>
  );
}
