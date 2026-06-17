import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { PublicContentCard, type PublicContentItem } from "@/components/content/PublicContentCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Film, Search, Sparkles } from "lucide-react";
import { getSiteUrl } from "@/lib/discovery";

interface ExploreContentRow extends PublicContentItem {
  posted_at?: string | null;
  category?: string | null;
  city?: string | null;
  country?: string | null;
  associated_brand_names?: string[] | null;
}

const ExploreContent = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const contentQuery = useQuery({
    queryKey: ["explore-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("view_public_content_directory")
        .select("*")
        .order("posted_at", { ascending: false, nullsFirst: false })
        .limit(48);

      if (error) throw error;
      return (data || []) as ExploreContentRow[];
    },
  });

  const filteredContent = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return contentQuery.data || [];

    return (contentQuery.data || []).filter((item) => {
      const brands = Array.isArray(item.associated_brand_names) ? item.associated_brand_names.join(" ") : "";
      return [
        item.title,
        item.description,
        item.platform,
        item.venue_name,
        item.location,
        item.city,
        item.country,
        item.category,
        brands,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [contentQuery.data, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Explore Content"
        description="Browse creator stories that can stand alone, launch moments, support places, or become missions on Promorang."
        url={getSiteUrl("/explore/content")}
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Explore Content",
          description: "Browse creator stories that can stand alone, launch moments, support places, or become missions on Promorang.",
        }}
      />

      <section className="px-4 pb-10 pt-24 sm:pt-28">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-accent/10 p-6 shadow-soft sm:p-8">
            <Badge variant="secondary" className="mb-4 rounded-full px-3 py-1">
              Content Discovery
            </Badge>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
                  Explore content in the discovery graph.
                </h1>
                <p className="mt-4 text-sm text-muted-foreground sm:text-base">
                  Stories are a starting point, not just proof after the fact. A piece of content can stand alone, launch a moment, support a venue or brand, or become the mission that sends people somewhere real.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link to="/for-you">Open For You</Link>
                </Button>
                <Button asChild>
                  <Link to="/explore/moments">Browse moments</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <Film className="mb-3 h-5 w-5 text-primary" />
              <p className="font-semibold text-foreground">Creator media</p>
              <p className="mt-2 text-sm text-muted-foreground">Browse public stories that can live independently or become the beginning of a moment, mission, or offer.</p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <Sparkles className="mb-3 h-5 w-5 text-primary" />
              <p className="font-semibold text-foreground">Linked discovery</p>
              <p className="mt-2 text-sm text-muted-foreground">Cards can route into linked moments when they exist, but content does not need a moment before it has value.</p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <Search className="mb-3 h-5 w-5 text-primary" />
              <p className="font-semibold text-foreground">Searchable browse</p>
              <p className="mt-2 text-sm text-muted-foreground">This page is for explicit browsing. The feed stays responsible for personalized ranking and surprise.</p>
            </div>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-border bg-card/80 p-4 shadow-soft">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search content by title, platform, place, brand, or category..."
                className="h-12 pl-11"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold">Browseable content</h2>
              <p className="text-sm text-muted-foreground">Public stories in the Promorang discovery graph.</p>
            </div>
            {!contentQuery.isLoading ? (
              <Badge variant="outline" className="rounded-full">
                {filteredContent.length} items
              </Badge>
            ) : null}
          </div>

          {contentQuery.isLoading ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-80 rounded-3xl" />
              ))}
            </div>
          ) : filteredContent.length > 0 ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredContent.map((item) => (
                <PublicContentCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
              <h3 className="font-serif text-2xl font-bold">No content matched</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a broader search term or move into the personalized feed for a mixed recommendation stream.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Button asChild variant="outline">
                  <Link to="/for-you">Open For You</Link>
                </Button>
                <Button asChild>
                  <Link to="/explore/moments">Browse moments</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ExploreContent;
