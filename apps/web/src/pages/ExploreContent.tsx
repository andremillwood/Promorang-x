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
import { useI18n } from "@/i18n/I18nContext";

interface ExploreContentRow extends PublicContentItem {
  posted_at?: string | null;
  category?: string | null;
  city?: string | null;
  country?: string | null;
  associated_brand_names?: string[] | null;
}

const ExploreContent = () => {
  const { t, formatNumber } = useI18n();
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
        title={t("contentExplore.seoTitle")}
        description={t("contentExplore.seoDescription")}
        url={getSiteUrl("/explore/content")}
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: t("contentExplore.seoTitle"),
          description: t("contentExplore.seoDescription"),
        }}
      />

      <section className="px-4 pb-10 pt-24 sm:pt-28">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-accent/10 p-6 shadow-soft sm:p-8">
            <Badge variant="secondary" className="mb-4 rounded-full px-3 py-1">
              {t("contentExplore.badge")}
            </Badge>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
                  {t("contentExplore.title")}
                </h1>
                <p className="mt-4 text-sm text-muted-foreground sm:text-base">
                  {t("contentExplore.copy")}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link to="/for-you">{t("contentExplore.forYou")}</Link>
                </Button>
                <Button asChild>
                  <Link to="/explore/moments">{t("contentExplore.browseMoments")}</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <Film className="mb-3 h-5 w-5 text-primary" />
              <p className="font-semibold text-foreground">{t("contentExplore.media")}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t("contentExplore.mediaCopy")}</p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <Sparkles className="mb-3 h-5 w-5 text-primary" />
              <p className="font-semibold text-foreground">{t("contentExplore.linked")}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t("contentExplore.linkedCopy")}</p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <Search className="mb-3 h-5 w-5 text-primary" />
              <p className="font-semibold text-foreground">{t("contentExplore.searchable")}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t("contentExplore.searchableCopy")}</p>
            </div>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-border bg-card/80 p-4 shadow-soft">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t("contentExplore.search")}
                className="h-12 pl-11"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold">{t("contentExplore.browseTitle")}</h2>
              <p className="text-sm text-muted-foreground">{t("contentExplore.browseCopy")}</p>
            </div>
            {!contentQuery.isLoading ? (
              <Badge variant="outline" className="rounded-full">
                {t("contentExplore.count", { count: formatNumber(filteredContent.length) })}
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
              <h3 className="font-serif text-2xl font-bold">{t("contentExplore.empty")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("contentExplore.emptyCopy")}
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Button asChild variant="outline">
                  <Link to="/for-you">{t("contentExplore.forYou")}</Link>
                </Button>
                <Button asChild>
                  <Link to="/explore/moments">{t("contentExplore.browseMoments")}</Link>
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
