import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search as SearchIcon,
  Calendar,
  Building2,
  Store,
  Users,
  ArrowRight,
  Loader2,
  Frown,
  Sparkles,
  Zap,
  Flame,
  Compass,
  MapPin,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nContext";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  result_type: 'moment' | 'brand' | 'merchant' | 'host' | 'user';
  image_url: string;
  path: string;
  relevance_score: number;
}

const SearchPage = () => {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "all";

  const [inputValue, setInputValue] = useState(query);
  const [activeTab, setActiveTab] = useState(initialCategory);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Auto detect user location for distance ranking
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => null
      );
    }
  }, []);

  const { data: results, isLoading } = useQuery({
    queryKey: ["global-search", query],
    enabled: query.length >= 2,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('fn_global_search', {
        search_term: query
      });
      if (error) throw error;
      return (data as SearchResult[]) || [];
    },
  });

  // Fetch trending moments for zero-state recommendation
  const { data: trendingMoments } = useQuery({
    queryKey: ["trending-moments-search-hub"],
    queryFn: async () => {
      const { data, error } = await supabase.from("moments").select("id, title, location, venue_name, reward, image_url, category").limit(4);
      if (error) return [];
      return data || [];
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim(), category: activeTab });
    }
  };

  const filteredResults = results?.filter(r =>
    activeTab === "all" ? true : r.result_type === activeTab
  ) || [];

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (initialCategory !== "all") {
      if (a.result_type === initialCategory && b.result_type !== initialCategory) return -1;
      if (b.result_type === initialCategory && a.result_type !== initialCategory) return 1;
    }
    return b.relevance_score - a.relevance_score;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'moment': return <Calendar className="w-4 h-4" />;
      case 'brand': return <Building2 className="w-4 h-4" />;
      case 'merchant': return <Store className="w-4 h-4" />;
      case 'host': return <Users className="w-4 h-4" />;
      case 'user': return <Users className="w-4 h-4" />;
      default: return <SearchIcon className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'moment': return "text-primary bg-primary/10";
      case 'brand': return "text-blue-500 bg-blue-500/10";
      case 'merchant': return "text-emerald-500 bg-emerald-500/10";
      case 'host': return "text-orange-500 bg-orange-500/10";
      case 'user': return "text-violet-500 bg-violet-500/10";
      default: return "text-muted-foreground bg-muted";
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 text-white">
      <SEO
        title={t("search.seoTitle")}
        description={t("search.seoDescription")}
      />

      <section className="mb-10 overflow-hidden rounded-[2.5rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,85,0,0.2),transparent_40%),linear-gradient(135deg,rgba(15,15,18,0.98),rgba(9,9,11,0.95))] p-6 sm:p-10 shadow-2xl xl:mb-14 xl:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ff5500]/30 bg-[#ff5500]/10 px-3.5 py-1 text-xs font-black uppercase tracking-[0.2em] text-[#ff5500]">
            <Zap className="h-3.5 w-3.5" />
            {t("search.eyebrow")}
          </div>
          <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl xl:text-7xl">
            {t("search.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
            {t("search.copy")}
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative mx-auto mt-8 flex max-w-3xl flex-col gap-3 sm:block">
          <SearchIcon className="absolute left-4 top-7 h-5 w-5 -translate-y-1/2 text-white/40" />
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t("search.placeholder")}
            className="h-14 rounded-2xl border-white/15 bg-white/[0.08] pl-12 text-base text-white shadow-2xl placeholder:text-white/40 sm:pr-32 sm:text-lg focus:border-[#ff5500]"
          />
          <Button
            type="submit"
            className="h-11 w-full rounded-xl bg-[#ff5500] text-white font-bold hover:bg-[#e04b00] sm:absolute sm:right-2 sm:top-1/2 sm:h-10 sm:w-auto sm:-translate-y-1/2"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("search.button")}
          </Button>
        </form>

        <div className="mx-auto mt-5 flex max-w-3xl flex-wrap justify-center gap-2">
          {([
            ["Kingston", "search.chipKingston"],
            ["Reward Perks", "search.chipPerks"],
            ["Creators", "search.chipCreators"],
            ["Music Festivals", "search.chipFestivals"],
            ["Merchant Deals", "search.chipDeals"],
            ["Venues", "search.chipVenues"],
          ] as const).map(([term, labelKey]) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setInputValue(term);
                setSearchParams({ q: term, category: activeTab });
              }}
              className="rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-xs font-bold text-white/80 transition hover:border-[#ff5500] hover:text-[#ff5500]"
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8 w-full justify-start gap-4 rounded-none border-b border-white/10 bg-transparent p-0 sm:gap-8">
          <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#ff5500] data-[state=active]:text-[#ff5500] data-[state=active]:bg-transparent pb-4 px-1 text-white/60">{t("search.all")}</TabsTrigger>
          <TabsTrigger value="moment" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#ff5500] data-[state=active]:text-[#ff5500] data-[state=active]:bg-transparent pb-4 px-1 text-white/60">{t("search.moments")}</TabsTrigger>
          <TabsTrigger value="brand" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#ff5500] data-[state=active]:text-[#ff5500] data-[state=active]:bg-transparent pb-4 px-1 text-white/60">{t("search.brands")}</TabsTrigger>
          <TabsTrigger value="merchant" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#ff5500] data-[state=active]:text-[#ff5500] data-[state=active]:bg-transparent pb-4 px-1 text-white/60">{t("search.merchants")}</TabsTrigger>
          <TabsTrigger value="host" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#ff5500] data-[state=active]:text-[#ff5500] data-[state=active]:bg-transparent pb-4 px-1 text-white/60">{t("search.hosts")}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#ff5500] animate-spin mb-4" />
              <p className="text-white/60 text-sm font-medium">{t("search.searching")}</p>
            </div>
          ) : query.length < 2 ? (
            <div className="space-y-10">
              <div className="rounded-[2.5rem] border border-dashed border-[#ff5500]/30 bg-[#ff5500]/5 px-6 py-12 text-center">
                <Sparkles className="w-12 h-12 text-[#ff5500] mx-auto mb-4 opacity-90" />
                <h3 className="text-xl font-bold tracking-tight text-white">{t("search.start")}</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-white/60">
                  {t("search.startCopy")}
                </p>
              </div>

              {/* Zero state: Trending Moments Grid */}
              {trendingMoments && trendingMoments.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/70">
                    <Flame className="h-4 w-4 text-[#ff5500]" /> {t("search.trending")}
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {trendingMoments.map((item: any) => (
                      <Link
                        key={item.id}
                        to={`/moments/${item.id}`}
                        className="group rounded-2xl border border-white/10 bg-[#121214] p-4 transition hover:border-[#ff5500]/50 hover:bg-[#18181c]"
                      >
                        <div className="h-32 w-full rounded-xl bg-white/5 overflow-hidden mb-3">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-white/30">
                              <Calendar className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <h4 className="font-bold text-white text-base truncate group-hover:text-[#ff5500]">{item.title}</h4>
                        <p className="text-xs text-white/50 truncate flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 text-[#ff5500]" /> {item.venue_name || item.location || t("search.fallbackCity")}
                        </p>
                        {item.reward && (
                          <span className="inline-block mt-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            🏆 {t("search.rewardBadge", { reward: item.reward })}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : sortedResults.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:gap-5">
              {sortedResults.map((result) => (
                <Link
                  key={`${result.result_type}-${result.id}`}
                  to={result.path}
                  className="group flex min-w-0 flex-col gap-4 rounded-2xl border border-white/10 bg-[#121214] p-4 transition hover:border-[#ff5500]/40 hover:bg-[#18181c] sm:flex-row sm:items-center"
                >
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                    {result.image_url ? (
                      <img
                        src={result.image_url}
                        alt={result.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/40">
                        {getTypeIcon(result.result_type)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex min-w-0 flex-wrap items-center gap-2">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1",
                        getTypeColor(result.result_type)
                      )}>
                        {getTypeIcon(result.result_type)}
                        {{ moment: t("search.typeMoment"), brand: t("search.typeBrand"), merchant: t("search.typeMerchant"), host: t("search.typeHost"), user: t("search.typeUser") }[result.result_type] || result.result_type}
                      </span>
                      <span className="text-xs text-white/40">•</span>
                      <span className="min-w-0 truncate text-xs text-white/50">{result.subtitle}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#ff5500] transition truncate">
                      {result.title}
                    </h3>
                    <p className="text-sm text-white/60 line-clamp-1">
                      {result.description}
                    </p>
                  </div>
                  <div className="hidden sm:block shrink-0">
                    <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-[#ff5500] group-hover:translate-x-1 transition" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#121214] rounded-3xl border border-dashed border-white/10">
              <Frown className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white">{t("search.noResults", { query })}</h3>
              <p className="text-white/50 text-sm mt-1 max-w-sm mx-auto">
                {t("search.noResultsCopy")}
              </p>
              <Button variant="link" className="mt-3 text-[#ff5500]" onClick={() => setInputValue("")}>
                {t("search.clear")}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SearchPage;
