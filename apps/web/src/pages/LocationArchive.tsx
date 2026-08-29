import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MasonryGrid } from "@/components/MasonryGrid";
import { MomentCard } from "@/components/MomentCard";
import { PublicContentCard, type PublicContentItem } from "@/components/content/PublicContentCard";
import { buildLocationPath, buildVenuePath, deslugifySegment, getSiteUrl } from "@/lib/discovery";
import { ArrowRight, Building2, CalendarDays, Compass, MapPin, Radio, ShieldCheck, Users, Vote } from "lucide-react";
import { PromorangMap } from "@/components/PromorangMap";
import { useScenes } from "@/hooks/useScenes";
import { useDiscoveries } from "@/hooks/useDiscoveries";
import { generateLocationCollectionSchema } from "@/lib/seo-schemas";
import { COUNTRY_MARKETS, getCityMarket, getCountryMarket } from "@promorang/shared";
import { useCityDiscoveryPolls } from "@/hooks/useCityDiscoveryPolls";
import { useI18n } from "@/i18n/I18nContext";
import { SwipeRail } from "@/components/ui/SwipeRail";

interface PublicMomentDirectoryRow {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  category: string | null;
  city: string | null;
  city_slug: string | null;
  country: string | null;
  country_slug: string | null;
  location: string | null;
  venue_id: string | null;
  venue_name: string | null;
  venue_slug: string | null;
  image_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  reward: string | null;
  host_id: string | null;
  is_active: boolean;
  participant_count: number;
  latitude?: number | null;
  longitude?: number | null;
}

interface PublicVenueDirectoryRow {
  id: string;
  slug: string | null;
  name: string;
  city: string | null;
  city_slug: string | null;
  country: string | null;
  country_slug: string | null;
  venue_type: string | null;
}

export default function LocationArchive() {
  const { t, formatNumber } = useI18n();
  const { countrySlug = "", citySlug } = useParams<{ countrySlug: string; citySlug?: string }>();
  const market = getCountryMarket(countrySlug);
  const cityMarket = getCityMarket(market, citySlug);
  const countryLabel = market.slug === countrySlug ? market.name : deslugifySegment(countrySlug);
  const cityLabel = cityMarket?.name || (citySlug ? deslugifySegment(citySlug) : "");
  const pageTitle = cityLabel ? `${cityLabel}, ${countryLabel}` : countryLabel;
  const pagePath = buildLocationPath(countrySlug, citySlug);
  const launchLabel = market.launchStage === "live" ? t("locationArchivePage.liveNow") : market.launchStage === "pilot" ? t("locationArchivePage.foundingPilot") : t("locationArchivePage.openingSoon");
  const heroHeadline = cityMarket?.headline || `Find what is moving ${countryLabel}.`;
  const heroDescription = cityMarket?.description || `Explore the Scenes, Moments, local places, and stories shaping ${countryLabel}.`;

  const momentsQuery = useQuery({
    queryKey: ["location-moments", countrySlug, citySlug],
    queryFn: async () => {
      let query = supabase
        .from("view_public_moment_directory")
        .select("*")
        .eq("country_slug", countrySlug)
        .eq("is_active", true)
        .order("starts_at", { ascending: true });

      if (citySlug) {
        query = query.eq("city_slug", citySlug);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as PublicMomentDirectoryRow[];
    },
    enabled: Boolean(countrySlug),
  });

  const contentQuery = useQuery({
    queryKey: ["location-content", countrySlug, citySlug],
    queryFn: async () => {
      let query = supabase
        .from("view_public_content_directory")
        .select("*")
        .eq("country_slug", countrySlug)
        .order("posted_at", { ascending: false, nullsFirst: false });

      if (citySlug) {
        query = query.eq("city_slug", citySlug);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as PublicContentItem[];
    },
    enabled: Boolean(countrySlug),
  });

  const venuesQuery = useQuery({
    queryKey: ["location-venues", countrySlug, citySlug],
    queryFn: async () => {
      let query = supabase
        .from("view_public_venue_directory")
        .select("*")
        .eq("country_slug", countrySlug)
        .order("name", { ascending: true });

      if (citySlug) {
        query = query.eq("city_slug", citySlug);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as PublicVenueDirectoryRow[];
    },
    enabled: Boolean(countrySlug),
  });

  const scenesQuery = useScenes({ city: cityLabel || undefined, country: countryLabel || undefined, limit: 12 });
  const discoveriesQuery = useDiscoveries({ city: cityLabel || undefined, country: countryLabel || undefined, limit: 12 });
  const pollsQuery = useCityDiscoveryPolls(countrySlug, citySlug, 8);

  const moments = momentsQuery.data || [];
  const content = contentQuery.data || [];
  const venues = venuesQuery.data || [];
  const scenes = scenesQuery.data || [];
  const discoveries = discoveriesQuery.data || [];
  const polls = pollsQuery.data || [];
  const mappedMoments = moments.filter((moment) => Number.isFinite(Number(moment.latitude)) && Number.isFinite(Number(moment.longitude)));
  const mapCenter = mappedMoments.length ? {
    lat: mappedMoments.reduce((sum, moment) => sum + Number(moment.latitude), 0) / mappedMoments.length,
    lng: mappedMoments.reduce((sum, moment) => sum + Number(moment.longitude), 0) / mappedMoments.length,
  } : null;

  const siblingCities = useMemo(() => {
    const unique = new Map<string, { city: string; citySlug: string }>();
    for (const moment of moments) {
      if (moment.city && moment.city_slug && !unique.has(moment.city_slug)) {
        unique.set(moment.city_slug, { city: moment.city, citySlug: moment.city_slug });
      }
    }
    return Array.from(unique.values()).slice(0, 8);
  }, [moments]);

  const isLoading = momentsQuery.isLoading || contentQuery.isLoading || venuesQuery.isLoading || scenesQuery.isLoading || discoveriesQuery.isLoading || pollsQuery.isLoading;
  const canonicalUrl = getSiteUrl(pagePath);
  const schemaItems = [
    ...scenes.map((item) => ({ title: item.title, url: getSiteUrl(`/scenes/${item.slug}`) })),
    ...moments.map((item) => ({ title: item.title, url: getSiteUrl(`/moments/${item.slug || item.id}`) })),
    ...discoveries.map((item) => ({ title: item.title, url: getSiteUrl(`/discoveries/${item.slug}`) })),
    ...venues.map((item) => ({ title: item.name, url: getSiteUrl(buildVenuePath(item)) })),
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <SEO
        title={`Moments in ${pageTitle}`}
        description={`Browse moments, venue activity, and linked creator content in ${pageTitle}.`}
        url={canonicalUrl}
        schema={generateLocationCollectionSchema(pageTitle, canonicalUrl, schemaItems)}
      />

      <section className="relative overflow-hidden rounded-[2.25rem] border border-primary/20 bg-[#0b0b0c] px-6 py-9 text-white shadow-soft sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,hsl(var(--primary)/0.24),transparent_28%),repeating-linear-gradient(135deg,transparent,transparent_22px,rgba(255,255,255,0.025)_23px,transparent_24px)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-end">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Badge className="w-fit bg-primary text-primary-foreground hover:bg-primary">{launchLabel}</Badge>
              <Badge variant="outline" className="border-white/20 text-white/70">{market.currency} · {cityMarket?.timezone || market.timezone}</Badge>
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-primary">{t("locationArchivePage.localSignal", { location: pageTitle })}</p>
            <h1 className="mt-4 max-w-4xl font-serif text-4xl font-black leading-[0.98] sm:text-6xl lg:text-7xl">{heroHeadline}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">{heroDescription}</p>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
            {[
              [scenes.length, t("locationArchivePage.statScenes")], [moments.length, t("locationArchivePage.statMoments")], [polls.length, t("locationArchivePage.statLivePolls")], [venues.length, t("locationArchivePage.statPlaces")],
            ].map(([value, label]) => <div key={label} className="bg-black/60 p-4"><p className="font-mono text-2xl font-black text-primary">{formatNumber(Number(value))}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/45">{label}</p></div>)}
          </div>
        </div>

        {citySlug && (
          <div className="relative mt-7">
            <Button asChild variant="outline" size="sm" className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
              <Link to={buildLocationPath(countrySlug)}>
                <MapPin className="mr-2 h-3.5 w-3.5" />
                {t("locationArchivePage.viewAllOf", { country: countryLabel })}
              </Link>
            </Button>
          </div>
        )}

        {!citySlug && (market.cities.length > 0 || siblingCities.length > 0) && (
          <div className="mt-6 flex flex-wrap gap-2">
            {(market.cities.length ? market.cities.map((city) => ({ city: city.name, citySlug: city.slug })) : siblingCities).map((city) => (
              <Button key={city.citySlug} asChild variant="outline" size="sm" className="rounded-full border-white/20 bg-white/5 text-white hover:bg-primary hover:text-primary-foreground">
                <Link to={buildLocationPath(countrySlug, city.citySlug)}><MapPin className="mr-2 h-3.5 w-3.5" />{city.city}</Link>
              </Button>
            ))}
          </div>
        )}
      </section>

      <SwipeRail compact fadeFrom="from-background" showDots={false} className="mt-5" scrollerClassName="gap-2 pb-2">
        {[["#polls", Vote, t("locationArchivePage.tabCityPolls")], ["#moments", CalendarDays, t("locationArchivePage.tabMoments")], ["#discoveries", Compass, t("locationArchivePage.tabDiscoveries")], ["#scenes", Users, t("locationArchivePage.tabScenes")], ["#places", MapPin, t("locationArchivePage.tabPlaces")]].map(([href, Icon, label]) => (
          <Button key={String(href)} asChild variant="outline" className="shrink-0 snap-start rounded-full"><a href={String(href)}><Icon className="mr-2 h-4 w-4" />{String(label)}</a></Button>
        ))}
      </SwipeRail>

      {/* Interactive City Hub Map */}
      {mapCenter && mappedMoments.length > 0 && (
        <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> {t("locationArchivePage.mapHeading", { location: pageTitle })}
            </h3>
            <span className="text-xs text-muted-foreground">{t("locationArchivePage.mapVerifiedCount", { count: formatNumber(mappedMoments.length) })}</span>
          </div>
          <PromorangMap
            center={mapCenter}
            zoom={12}
            height="380px"
            markers={mappedMoments.map((m) => ({
              id: m.id,
              lat: Number(m.latitude),
              lng: Number(m.longitude),
              title: m.title,
              subtitle: m.venue_name || m.location || undefined,
              category: m.category || undefined,
              reward: m.reward || undefined,
            }))}
          />
        </section>
      )}

      {isLoading ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-80 rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-12">
          <section id="polls" className="scroll-mt-24">
            <div className="mb-5 flex items-center justify-between"><div><h2 className="font-serif text-2xl font-bold text-foreground">{t("locationArchivePage.cityPollsTitle")}</h2><p className="text-sm text-muted-foreground">{t("locationArchivePage.cityPollsDesc")}</p></div><Badge variant="secondary">{formatNumber(polls.length)}</Badge></div>
            {polls.length ? <div className="grid gap-4 md:grid-cols-2">{polls.map((poll) => {
              const progress = Math.min(100, Math.round((Number(poll.total_votes || 0) / Number(poll.threshold_for_moment || 1)) * 100));
              return <Link key={poll.id} to={`/discoveries/${poll.id}`} className="group rounded-3xl border border-border bg-card p-5 transition hover:border-primary/30 hover:shadow-soft"><div className="flex items-center justify-between gap-3"><Badge variant="outline">{poll.category}</Badge><span className="font-mono text-xs text-muted-foreground">{poll.total_votes || 0}/{poll.threshold_for_moment}</span></div><h3 className="mt-4 font-serif text-xl font-bold group-hover:text-primary">{poll.question}</h3><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} /></div><p className="mt-3 text-xs text-muted-foreground">{progress}% of activation signal · {poll.options?.length || 0} choices</p></Link>;
            })}</div> : <div className="rounded-3xl border border-dashed border-border px-6 py-10 text-center text-muted-foreground">{t("locationArchivePage.noPolls")}</div>}
          </section>
          <section id="scenes" className="scroll-mt-24">
            <div className="mb-5 flex items-center justify-between"><div><h2 className="font-serif text-2xl font-bold text-foreground">{t("locationArchivePage.scenesTitle")}</h2><p className="text-sm text-muted-foreground">{t("locationArchivePage.scenesDesc")}</p></div><Badge variant="secondary">{formatNumber(scenes.length)}</Badge></div>
            {scenes.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{scenes.map((scene) => <Link key={scene.id} to={`/scenes/${scene.slug}`} className="group overflow-hidden rounded-3xl border border-border bg-card"><div className="h-44 bg-muted">{scene.image_url ? <img src={scene.image_url} alt={scene.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/> : <div className="grid h-full place-items-center"><Users className="h-8 w-8 text-muted-foreground"/></div>}</div><div className="p-5"><h3 className="font-serif text-xl font-bold group-hover:text-primary">{scene.title}</h3><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{scene.description}</p></div></Link>)}</div> : <div className="rounded-3xl border border-dashed border-border px-6 py-10 text-center text-muted-foreground">{t("locationArchivePage.noScenes")}</div>}
          </section>

          <section id="discoveries" className="scroll-mt-24">
            <div className="mb-5 flex items-center justify-between"><div><h2 className="font-serif text-2xl font-bold text-foreground">{t("locationArchivePage.discoveriesTitle")}</h2><p className="text-sm text-muted-foreground">{t("locationArchivePage.discoveriesDesc")}</p></div><Badge variant="secondary">{formatNumber(discoveries.length)}</Badge></div>
            {discoveries.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{discoveries.map((item) => <Link key={item.id} to={`/discoveries/${item.slug}`} className="group overflow-hidden rounded-3xl border border-border bg-card"><div className="h-44 bg-muted">{item.cover_image ? <img src={item.cover_image} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/> : <div className="grid h-full place-items-center"><Compass className="h-8 w-8 text-muted-foreground"/></div>}</div><div className="p-5"><h3 className="font-serif text-xl font-bold group-hover:text-primary">{item.title}</h3><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.description}</p></div></Link>)}</div> : <div className="rounded-3xl border border-dashed border-border px-6 py-10 text-center text-muted-foreground">{t("locationArchivePage.noDiscoveries")}</div>}
          </section>
          <section id="moments" className="scroll-mt-24">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground">{t("locationArchivePage.momentsTitle")}</h2>
                <p className="text-sm text-muted-foreground">{t("locationArchivePage.momentsDesc")}</p>
              </div>
              <Badge variant="secondary">{formatNumber(moments.length)}</Badge>
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
                {t("locationArchivePage.noMoments")}
              </div>
            )}
          </section>

          <section id="stories" className="scroll-mt-24">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground">{t("locationArchivePage.storiesTitle")}</h2>
                <p className="text-sm text-muted-foreground">{t("locationArchivePage.storiesDesc")}</p>
              </div>
              <Badge variant="secondary">{formatNumber(content.length)}</Badge>
            </div>
            {content.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {content.map((item) => (
                  <PublicContentCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center text-muted-foreground">
                {t("locationArchivePage.noStories")}
              </div>
            )}
          </section>

          <section id="places" className="scroll-mt-24">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground">{t("locationArchivePage.venuesTitle")}</h2>
                <p className="text-sm text-muted-foreground">{t("locationArchivePage.venuesDesc")}</p>
              </div>
              <Badge variant="secondary">{formatNumber(venues.length)}</Badge>
            </div>
            {venues.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {venues.map((venue) => (
                  <Link
                    key={venue.id}
                    to={buildVenuePath({ id: venue.id, slug: venue.slug })}
                    className="group rounded-3xl border border-border bg-card p-5 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold text-foreground group-hover:text-primary">
                          {venue.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {[venue.city, venue.country].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center text-muted-foreground">
                {t("locationArchivePage.noVenues")}
              </div>
            )}
          </section>
        </div>
      )}

      {!isLoading && moments.length === 0 && content.length === 0 && venues.length === 0 && scenes.length === 0 && discoveries.length === 0 && (
        <section className="mt-10 overflow-hidden rounded-[2rem] border border-primary/20 bg-primary/5 p-8 text-center">
          <Radio className="mx-auto h-8 w-8 text-primary" />
          <h2 className="mt-4 font-serif text-3xl font-bold">{t("locationArchivePage.emptyStateHeading")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{t("locationArchivePage.emptyStateDesc")}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="hero"><Link to="/city-stewards"><ShieldCheck className="mr-2 h-4 w-4" />{t("locationArchivePage.becomeSteward")}</Link></Button>
            <Button asChild variant="outline"><Link to="/explore/moments">{t("locationArchivePage.browseAllMoments")}<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </div>
        </section>
      )}

      <section className="mt-12 border-t border-border pt-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">{t("locationArchivePage.acrossRegions")}</p><h2 className="mt-2 font-serif text-2xl font-bold">{t("locationArchivePage.moveBetweenFeeds")}</h2></div>
          <SwipeRail compact fadeFrom="from-background" showDots={false} className="max-w-3xl" scrollerClassName="gap-2 pb-2">{COUNTRY_MARKETS.map((item) => <Button key={item.code} asChild variant={item.code === market.code ? "default" : "outline"} size="sm" className="shrink-0 snap-start rounded-full"><Link to={buildLocationPath(item.slug)}>{item.name}</Link></Button>)}</SwipeRail>
        </div>
      </section>
    </main>
  );
}

