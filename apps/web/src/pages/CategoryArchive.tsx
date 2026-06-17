import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MasonryGrid } from "@/components/MasonryGrid";
import { MomentCard } from "@/components/MomentCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin } from "lucide-react";
import { buildLocationPath, deslugifySegment, getSiteUrl, slugifySegment } from "@/lib/discovery";

interface PublicMomentDirectoryRow {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  category: string | null;
  category_slug: string | null;
  city: string | null;
  city_slug: string | null;
  country: string | null;
  country_slug: string | null;
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

export default function CategoryArchive() {
  const { categorySlug = "" } = useParams<{ categorySlug: string }>();
  const categoryLabel = deslugifySegment(categorySlug);

  const { data, isLoading } = useQuery({
    queryKey: ["category-archive", categorySlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("view_public_moment_directory")
        .select("*")
        .eq("category_slug", categorySlug)
        .eq("is_active", true)
        .order("starts_at", { ascending: true });

      if (error) throw error;
      return (data || []) as PublicMomentDirectoryRow[];
    },
    enabled: Boolean(categorySlug),
  });

  const moments = data || [];

  const locationLinks = useMemo(() => {
    const seen = new Set<string>();
    return moments
      .map((moment) => ({
        city: moment.city,
        citySlug: moment.city_slug || slugifySegment(moment.city),
        country: moment.country,
        countrySlug: moment.country_slug || slugifySegment(moment.country),
      }))
      .filter((entry) => entry.countrySlug)
      .filter((entry) => {
        const key = `${entry.countrySlug}:${entry.citySlug || ""}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 8);
  }, [moments]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <SEO
        title={`${categoryLabel} Moments`}
        description={`Browse ${categoryLabel.toLowerCase()} moments, activations, and creator-led experiences on Promorang.`}
        url={getSiteUrl(`/categories/${categorySlug}`)}
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": `${categoryLabel} moments`,
          "description": `Browse ${categoryLabel.toLowerCase()} moments on Promorang.`,
        }}
      />

      <div className="mb-10 flex flex-col gap-5 rounded-[2rem] border border-border bg-card px-6 py-8 shadow-soft">
        <Badge variant="outline" className="w-fit text-[11px] font-black uppercase tracking-[0.24em]">
          Category archive
        </Badge>
        <div className="space-y-3">
          <h1 className="font-serif text-4xl font-black text-foreground sm:text-5xl">
            {categoryLabel} moments
          </h1>
          <p className="max-w-3xl text-base text-muted-foreground">
            A public archive for browsing {categoryLabel.toLowerCase()} experiences, locations, and related venue activity.
          </p>
        </div>

        {locationLinks.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {locationLinks.map((entry) => (
              <Button
                key={`${entry.countrySlug}-${entry.citySlug || "all"}`}
                asChild
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                <Link to={buildLocationPath(entry.countrySlug!, entry.citySlug)}>
                  <MapPin className="mr-2 h-3.5 w-3.5" />
                  {[entry.city, entry.country].filter(Boolean).join(", ")}
                </Link>
              </Button>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-80 rounded-3xl" />
          ))}
        </div>
      ) : moments.length > 0 ? (
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
        <div className="rounded-3xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
          <h2 className="font-serif text-2xl font-bold text-foreground">No moments here yet</h2>
          <p className="mt-2 text-muted-foreground">
            This category page is live, but it does not have active moments yet.
          </p>
          <Button asChild variant="hero" className="mt-6">
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
