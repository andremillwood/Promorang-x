import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MasonryGrid } from "@/components/MasonryGrid";
import { MomentCard } from "@/components/MomentCard";
import { PublicContentCard, type PublicContentItem } from "@/components/content/PublicContentCard";
import { ArrowLeft, ExternalLink, Sparkles } from "lucide-react";
import { getSiteUrl } from "@/lib/discovery";

interface PublicBrandRow {
  id: string;
  slug: string | null;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  active_campaigns_count: number | null;
  associated_moments_count: number | null;
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
  associated_brand_slugs: string[] | null;
}

export default function BrandProfile() {
  const { slug = "" } = useParams<{ slug: string }>();

  const brandQuery = useQuery({
    queryKey: ["brand-profile", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("view_public_brand_directory")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return data as PublicBrandRow | null;
    },
    enabled: Boolean(slug),
  });

  const momentsQuery = useQuery({
    queryKey: ["brand-moments", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("view_public_moment_directory")
        .select("*")
        .contains("associated_brand_slugs", [slug])
        .eq("is_active", true)
        .order("starts_at", { ascending: true });

      if (error) throw error;
      return (data || []) as PublicMomentDirectoryRow[];
    },
    enabled: Boolean(slug),
  });

  const contentQuery = useQuery({
    queryKey: ["brand-content", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("view_public_content_directory")
        .select("*")
        .contains("associated_brand_slugs", [slug])
        .order("posted_at", { ascending: false, nullsFirst: false });

      if (error) throw error;
      return (data || []) as PublicContentItem[];
    },
    enabled: Boolean(slug),
  });

  const brand = brandQuery.data;
  const moments = momentsQuery.data || [];
  const content = contentQuery.data || [];
  const isLoading = brandQuery.isLoading || momentsQuery.isLoading || contentQuery.isLoading;

  if (!isLoading && !brand) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="font-serif text-3xl font-bold text-foreground">Brand not found</h1>
        <p className="mt-3 text-muted-foreground">This brand page is not available yet.</p>
        <Button asChild variant="hero" className="mt-6">
          <Link to="/brands">Browse brands</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      {brand && (
        <SEO
          title={brand.name}
          description={`View moments, campaigns, and linked creator content associated with ${brand.name}.`}
          url={getSiteUrl(`/brands/${slug}`)}
          schema={{
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": brand.name,
            "url": brand.website_url,
            "logo": brand.logo_url,
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
      ) : brand ? (
        <>
          <section className="rounded-[2rem] border border-border bg-card px-6 py-8 shadow-soft">
            <Button asChild variant="ghost" className="mb-5 w-fit">
              <Link to="/brands">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to brands
              </Link>
            </Button>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-border bg-muted">
                  {brand.logo_url ? (
                    <img src={brand.logo_url} alt={brand.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-primary">{brand.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <Badge variant="outline" className="mb-3 w-fit text-[11px] font-black uppercase tracking-[0.24em]">
                    Brand profile
                  </Badge>
                  <h1 className="font-serif text-4xl font-black text-foreground sm:text-5xl">{brand.name}</h1>
                  <p className="mt-3 max-w-3xl text-base text-muted-foreground">
                    A public page for exploring moments and creator content associated with this brand.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{brand.active_campaigns_count || 0} campaigns</Badge>
                <Badge variant="secondary">{brand.associated_moments_count || 0} associated moments</Badge>
                {brand.website_url && (
                  <Button asChild variant="outline" size="sm">
                    <a href={brand.website_url} target="_blank" rel="noreferrer">
                      Website
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </section>

          <div className="mt-10 space-y-12">
            <section>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-foreground">Associated moments</h2>
                  <p className="text-sm text-muted-foreground">Public experiences currently linked to this brand.</p>
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
                  No active moments are associated with this brand yet.
                </div>
              )}
            </section>

            <section>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-foreground">Linked content</h2>
                  <p className="text-sm text-muted-foreground">Creator media connected to this brand’s moments and campaigns.</p>
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
                  No linked content is associated with this brand yet.
                </div>
              )}
            </section>

            {moments.length === 0 && content.length === 0 && (
              <div className="rounded-3xl border border-primary/15 bg-primary/5 px-6 py-8 text-center">
                <Sparkles className="mx-auto h-8 w-8 text-primary" />
                <h3 className="mt-4 font-serif text-2xl font-bold text-foreground">The page is ready before the graph is full</h3>
                <p className="mt-2 text-muted-foreground">
                  This brand profile is indexed and routable now, and will strengthen as brand associations are added to moments and content.
                </p>
              </div>
            )}
          </div>
        </>
      ) : null}
    </main>
  );
}
