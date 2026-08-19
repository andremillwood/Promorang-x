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
import { ArrowRight, Building2, Compass, MapPin, Users } from "lucide-react";
import { PromorangMap } from "@/components/PromorangMap";
import { useScenes } from "@/hooks/useScenes";
import { useDiscoveries } from "@/hooks/useDiscoveries";
import { generateLocationCollectionSchema } from "@/lib/seo-schemas";

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
  const { countrySlug = "", citySlug } = useParams<{ countrySlug: string; citySlug?: string }>();
  const countryLabel = deslugifySegment(countrySlug);
  const cityLabel = citySlug ? deslugifySegment(citySlug) : "";
  const pageTitle = cityLabel ? `${cityLabel}, ${countryLabel}` : countryLabel;
  const pagePath = buildLocationPath(countrySlug, citySlug);

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

  const moments = momentsQuery.data || [];
  const content = contentQuery.data || [];
  const venues = venuesQuery.data || [];
  const scenes = scenesQuery.data || [];
  const discoveries = discoveriesQuery.data || [];
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

  const isLoading = momentsQuery.isLoading || contentQuery.isLoading || venuesQuery.isLoading || scenesQuery.isLoading || discoveriesQuery.isLoading;
  const canonicalUrl = getSiteUrl(pagePath);
  const schemaItems = [
    ...scenes.map((item) => ({ title: item.title, url: getSiteUrl(`/scenes/${item.slug}`) })),
    ...moments.map((item) => ({ title: item.title, url: getSiteUrl(`/moments/${item.slug || item.id}`) })),
    ...discoveries.map((item) => ({ title: item.title, url: getSiteUrl(`/discoveries/${item.slug}`) })),
    ...venues.map((item) => ({ title: item.name, url: getSiteUrl(buildVenuePath(item)) })),
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <SEO
        title={`Moments in ${pageTitle}`}
        description={`Browse moments, venue activity, and linked creator content in ${pageTitle}.`}
        url={canonicalUrl}
        schema={generateLocationCollectionSchema(pageTitle, canonicalUrl, schemaItems)}
      />

      <section className="rounded-[2rem] border border-border bg-card px-6 py-8 shadow-soft">
        <Badge variant="outline" className="mb-4 w-fit text-[11px] font-black uppercase tracking-[0.24em]">
          Location archive
        </Badge>
        <h1 className="font-serif text-4xl font-black text-foreground sm:text-5xl">
          Discover {pageTitle}
        </h1>
        <p className="mt-3 max-w-3xl text-base text-muted-foreground">
          Find local Scenes, upcoming Moments, trusted Discoveries, venues, and stories around {pageTitle}.
        </p>

        {citySlug && (
          <div className="mt-5">
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link to={buildLocationPath(countrySlug)}>
                <MapPin className="mr-2 h-3.5 w-3.5" />
                View all of {countryLabel}
              </Link>
            </Button>
          </div>
        )}

        {!citySlug && siblingCities.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {siblingCities.map((city) => (
              <Button key={city.citySlug} asChild variant="outline" size="sm" className="rounded-full">
                <Link to={buildLocationPath(countrySlug, city.citySlug)}>{city.city}</Link>
              </Button>
            ))}
          </div>
        )}
      </section>

      {/* Interactive City Hub Map */}
      {mapCenter && mappedMoments.length > 0 && (
        <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> {pageTitle} Interactive Map
            </h3>
            <span className="text-xs text-muted-foreground">{mappedMoments.length} verified locations</span>
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
              reward: m.reward ? `$${m.reward}` : undefined,
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
          <section>
            <div className="mb-5 flex items-center justify-between"><div><h2 className="font-serif text-2xl font-bold text-foreground">Scenes</h2><p className="text-sm text-muted-foreground">Communities and cultural circles rooted in this location.</p></div><Badge variant="secondary">{scenes.length}</Badge></div>
            {scenes.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{scenes.map((scene) => <Link key={scene.id} to={`/scenes/${scene.slug}`} className="group overflow-hidden rounded-3xl border border-border bg-card"><div className="h-44 bg-muted">{scene.image_url ? <img src={scene.image_url} alt={scene.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/> : <div className="grid h-full place-items-center"><Users className="h-8 w-8 text-muted-foreground"/></div>}</div><div className="p-5"><h3 className="font-serif text-xl font-bold group-hover:text-primary">{scene.title}</h3><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{scene.description}</p></div></Link>)}</div> : <div className="rounded-3xl border border-dashed border-border px-6 py-10 text-center text-muted-foreground">No public Scenes are based here yet.</div>}
          </section>

          <section>
            <div className="mb-5 flex items-center justify-between"><div><h2 className="font-serif text-2xl font-bold text-foreground">Local discoveries</h2><p className="text-sm text-muted-foreground">Scout-recommended places and cultural finds.</p></div><Badge variant="secondary">{discoveries.length}</Badge></div>
            {discoveries.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{discoveries.map((item) => <Link key={item.id} to={`/discoveries/${item.slug}`} className="group overflow-hidden rounded-3xl border border-border bg-card"><div className="h-44 bg-muted">{item.cover_image ? <img src={item.cover_image} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/> : <div className="grid h-full place-items-center"><Compass className="h-8 w-8 text-muted-foreground"/></div>}</div><div className="p-5"><h3 className="font-serif text-xl font-bold group-hover:text-primary">{item.title}</h3><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.description}</p></div></Link>)}</div> : <div className="rounded-3xl border border-dashed border-border px-6 py-10 text-center text-muted-foreground">No verified Discoveries are tagged here yet.</div>}
          </section>
          <section>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground">Active moments</h2>
                <p className="text-sm text-muted-foreground">Public experiences currently discoverable in this location.</p>
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
                No active moments are tagged to this location yet.
              </div>
            )}
          </section>

          <section>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground">Linked content</h2>
                <p className="text-sm text-muted-foreground">Creator media connected to moments and places in this area.</p>
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
                No linked content is available for this location yet.
              </div>
            )}
          </section>

          <section>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground">Venues</h2>
                <p className="text-sm text-muted-foreground">Ground anchors and hosted places discoverable here.</p>
              </div>
              <Badge variant="secondary">{venues.length}</Badge>
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
                No venue profiles are available for this location yet.
              </div>
            )}
          </section>
        </div>
      )}

      {!isLoading && moments.length === 0 && content.length === 0 && venues.length === 0 && scenes.length === 0 && discoveries.length === 0 && (
        <div className="mt-10 text-center">
          <Button asChild variant="hero">
            <Link to="/explore/moments">
              Browse all moments
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </main>
  );
}
