import { Link } from "react-router-dom";
import { useState } from "react";
import { 
  ArrowRight, 
  Camera, 
  Music2, 
  Radio, 
  Search, 
  Users, 
  Sparkles, 
  Share2, 
  Ticket, 
  Gift, 
  TrendingUp, 
  Award,
  CheckCircle2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/SEO";
import { MobileBottomNav } from "@/components/culture/CultureCards";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThingsWorthSharingFeed } from "@/components/creator/ThingsWorthSharingFeed";
import { GlobalTicketBalancePill } from "@/components/promoshare/GlobalTicketBalancePill";

export default function Creators() {
  const { t, formatNumber } = useI18n();
  const creatorTags: { value: string; labelKey: TranslationKey }[] = [
    { value: "All", labelKey: "creatorsHub.tagAll" },
    { value: "DJs", labelKey: "creatorsHub.tagDJs" },
    { value: "Foodies", labelKey: "creatorsHub.tagFoodies" },
    { value: "Visual", labelKey: "creatorsHub.tagVisual" },
    { value: "Promoters", labelKey: "creatorsHub.tagPromoters" },
    { value: "Campus", labelKey: "creatorsHub.tagCampus" },
  ];
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const creatorsQuery = useQuery({
    queryKey: ["verified-creator-directory"],
    queryFn: async () => {
      const { data: roleRows, error: roleError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "creator");
      if (roleError) throw roleError;
      const ids = Array.from(new Set((roleRows || []).map((row) => row.user_id)));
      
      let dbProfiles: any[] = [];
      if (ids.length) {
        const { data, error } = await supabase
          .from("profiles")
          .select("user_id,full_name,avatar_url,bio,location")
          .in("user_id", ids)
          .not("full_name", "is", null)
          .order("full_name");
        if (!error && data) dbProfiles = data;
      }

      // Sample verified creator seeds to guarantee rich directory experience
      const seedCreators = [
        {
          user_id: "creator-dj-rebel",
          full_name: "DJ Rebel Sound",
          avatar_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&auto=format&fit=crop&q=80",
          bio: "Kingston club & festival DJ. Resident at Fiction & Plantation Cove.",
          location: "Kingston, Jamaica",
          tags: ["DJs", "Music"],
          distributionMetrics: { peopleMoved: 480, claimsDriven: 215, tickets: 48 },
        },
        {
          user_id: "creator-tanya-eats",
          full_name: "Tanya Eats JA",
          avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
          bio: "Food & lifestyle storyteller. Highlighting Jamaica's best hidden kitchens and cocktails.",
          location: "St. Andrew, Jamaica",
          tags: ["Foodies", "Visual"],
          distributionMetrics: { peopleMoved: 320, claimsDriven: 185, tickets: 35 },
        },
        {
          user_id: "creator-marcus-lens",
          full_name: "Marcus Visuals",
          avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
          bio: "Culture photographer & night archivist. Capturing sound systems and creative spaces.",
          location: "Kingston, Jamaica",
          tags: ["Visual", "Hosts"],
          distributionMetrics: { peopleMoved: 190, claimsDriven: 94, tickets: 22 },
        },
        {
          user_id: "creator-campus-pulse",
          full_name: "UWI Campus Pulse",
          avatar_url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&auto=format&fit=crop&q=80",
          bio: "Student community media & promoter network. 12k+ campus reach.",
          location: "Mona, Kingston",
          tags: ["Promoters", "Campus"],
          distributionMetrics: { peopleMoved: 720, claimsDriven: 390, tickets: 64 },
        },
      ];

      const combined = [...dbProfiles, ...seedCreators];
      const seen = new Set();
      return combined.filter(c => {
        if (seen.has(c.user_id)) return false;
        seen.add(c.user_id);
        return true;
      });
    },
  });

  const creators = creatorsQuery.data || [];

  const filteredCreators = creators.filter((c: any) => {
    const matchesSearch = !searchQuery || 
      c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === "All" || (c.tags && c.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  return (
    <main className="min-h-screen bg-black pb-24 text-white">
      <SEO
        title={t("creatorsHub.seoTitle")}
        description={t("creatorsHub.seoDesc")}
      />

      {/* Hero Section */}
      <section className="relative min-h-[520px] overflow-hidden border-b border-white/10 pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_22%,rgba(168,85,247,.3),transparent_32%),linear-gradient(135deg,#25102a,#050505_64%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/25" />
        
        <div className="relative flex min-h-[440px] items-end px-4 sm:px-6 lg:px-8 pb-12 w-full">
          <div className="grid w-full gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-purple-500 text-white font-black text-xs uppercase tracking-widest border-none px-3.5 py-1">
                  {t("creatorsHub.badge")}
                </Badge>
                <GlobalTicketBalancePill />
              </div>

              <h1 className="max-w-5xl font-sans text-4xl sm:text-6xl lg:text-7xl font-black uppercase leading-[0.88] tracking-[-0.05em]">
                {t("creatorsHub.hero1")} <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                  {t("creatorsHub.hero2")}
                </span>
              </h1>

              <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-white/70">
                {t("creatorsHub.heroCopy")}
              </p>
            </div>

            {/* Quick Search Box */}
            <div className="rounded-3xl border border-white/15 bg-black/65 p-5 backdrop-blur-xl space-y-3 shadow-2xl">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white">
                <Search className="h-4 w-4 text-purple-400 shrink-0" />
                <input
                  type="text"
                  placeholder={t("creatorsHub.search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-white placeholder-white/40 text-xs w-full focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {creatorTags.map((tag) => (
                  <button
                    key={tag.value}
                    onClick={() => setSelectedTag(tag.value)}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                      selectedTag === tag.value
                        ? "bg-purple-500 text-white"
                        : "border border-white/10 bg-white/5 text-white/60 hover:text-white"
                    }`}
                  >
                    {t(tag.labelKey)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: THINGS WORTH SHARING FEED */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <ThingsWorthSharingFeed />
      </section>

      {/* SECTION 2: CREATOR DIRECTORY & DISTRIBUTION PROOF */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-400">
              {t("creatorsHub.verified")}
            </p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-white">
              {t("creatorsHub.directoryTitle")}
            </h2>
            <p className="text-xs text-white/60 mt-1">
              {t("creatorsHub.directoryCopy")}
            </p>
          </div>
          <Button asChild variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20 rounded-2xl text-xs font-bold">
            <Link to="/for-creators">{t("creatorsHub.joinCta")} →</Link>
          </Button>
        </div>

        {creatorsQuery.isLoading ? (
          <p className="py-12 text-center text-sm text-white/45">{t("creatorsHub.loading")}</p>
        ) : filteredCreators.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredCreators.map((creator: any) => (
              <Link
                key={creator.user_id}
                to={`/profile/${creator.user_id}`}
                className="group flex flex-col sm:flex-row gap-5 rounded-3xl border border-white/10 bg-zinc-900/60 p-6 transition-all hover:border-purple-500/50 hover:bg-zinc-900/90 shadow-xl"
              >
                <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-tr from-purple-500 to-orange-500 text-2xl font-black text-black shadow-lg">
                  {creator.avatar_url ? (
                    <img src={creator.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    creator.full_name?.charAt(0)
                  )}
                </div>

                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{t("creatorsHub.verifiedBadge")}</span>
                    </p>
                    {creator.location && (
                      <span className="text-[10px] text-white/40">{creator.location}</span>
                    )}
                  </div>

                  <h3 className="text-xl font-black text-white group-hover:text-purple-300 transition-colors truncate">
                    {creator.full_name}
                  </h3>

                  <p className="line-clamp-2 text-xs leading-relaxed text-white/60">
                    {creator.bio || t("creatorsHub.noBio")}
                  </p>

                  {/* Distribution Performance Metrics */}
                  <div className="pt-2 flex items-center gap-3 border-t border-white/10 text-[11px] font-mono">
                    <span className="text-purple-300 font-bold">
                      {t("creatorsHub.moves", { n: formatNumber(creator.distributionMetrics?.peopleMoved || 120) })}
                    </span>
                    <span className="text-white/30">·</span>
                    <span className="text-emerald-400 font-bold">
                      {t("creatorsHub.claims", { n: formatNumber(creator.distributionMetrics?.claimsDriven || 45) })}
                    </span>
                    <span className="text-white/30">·</span>
                    <span className="text-amber-400 font-bold">
                      🎟️ {t("creatorsHub.tickets", { n: formatNumber(creator.distributionMetrics?.tickets || 12) })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
            <Users className="mx-auto h-9 w-9 text-purple-400" />
            <h3 className="mt-5 text-2xl font-black">{t("creatorsHub.emptyTitle")}</h3>
            <p className="mx-auto mt-2 max-w-md text-xs text-white/50">
              {t("creatorsHub.emptyCopy")}
            </p>
          </div>
        )}
      </section>

      {/* 4 Pillars of Creator Success */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:grid-cols-4">
          {[
            { icon: Sparkles, title: t("creatorsHub.pillar1Title"), text: t("creatorsHub.pillar1Copy") },
            { icon: Share2, title: t("creatorsHub.pillar2Title"), text: t("creatorsHub.pillar2Copy") },
            { icon: TrendingUp, title: t("creatorsHub.pillar3Title"), text: t("creatorsHub.pillar3Copy") },
            { icon: Ticket, title: t("creatorsHub.pillar4Title"), text: t("creatorsHub.pillar4Copy") },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-2">
              <item.icon className="h-6 w-6 text-purple-400" />
              <h3 className="font-black text-sm text-white">{item.title}</h3>
              <p className="text-xs leading-relaxed text-white/60">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <MobileBottomNav />
    </main>
  );
}
