import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Search,
  Users,
  Sparkles,
  Share2,
  Ticket,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/SEO";
import { MobileBottomNav } from "@/components/culture/CultureCards";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThingsWorthSharingFeed } from "@/components/creator/ThingsWorthSharingFeed";
import { GlobalTicketBalancePill } from "@/components/promoshare/GlobalTicketBalancePill";

export default function Creators() {
  const { t } = useI18n();
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
      
      if (!ids.length) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("user_id,full_name,avatar_url,bio,location")
        .in("user_id", ids)
        .not("full_name", "is", null)
        .order("full_name");

      if (error) throw error;
      return data || [];
    },
  });

  const creators = creatorsQuery.data || [];

  const filteredCreators = creators.filter((creator: any) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return creator.full_name?.toLowerCase().includes(query) ||
      creator.bio?.toLowerCase().includes(query) ||
      creator.location?.toLowerCase().includes(query);
  });

  return (
    <main className="min-h-screen bg-black pb-24 text-white">
      <SEO
        title="Creators & Distributors — Promorang"
        description="Get discovered. Find things worth sharing. Build proof that you move people."
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
                  Creators → Distribute
                </Badge>
                <GlobalTicketBalancePill />
              </div>

              <h1 className="max-w-5xl font-sans text-4xl sm:text-6xl lg:text-7xl font-black uppercase leading-[0.88] tracking-[-0.05em]">
                Get Discovered. <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                  Build Recorded Proof Over Time.
                </span>
              </h1>

              <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-white/70">
                Find things worth sharing and build a record around actions PROMORANG can actually verify. Eligible attribution, rewards, or draw entries appear only when their source records exist.
              </p>
            </div>

            {/* Quick Search Box */}
            <div className="rounded-3xl border border-white/15 bg-black/65 p-5 backdrop-blur-xl space-y-3 shadow-2xl">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white">
                <Search className="h-4 w-4 text-purple-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search creators, DJs, pages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-white placeholder-white/40 text-xs w-full focus:outline-none"
                />
              </div>

              <p className="pt-1 text-[11px] leading-5 text-white/45">
                Search recorded creator-role profiles by name, bio, or location.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: THINGS WORTH SHARING FEED */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <ThingsWorthSharingFeed />
      </section>

      {/* SECTION 2: RECORDED CREATOR DIRECTORY */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-400">
              Creator Directory
            </p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-white">
              Recorded Creator Profiles
            </h2>
            <p className="text-xs text-white/60 mt-1">
              Accounts with a recorded creator role and profile, ordered by profile name. Performance ranking is not inferred on this surface.
            </p>
          </div>
          <Button asChild variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20 rounded-2xl text-xs font-bold">
            <Link to="/for-creators">Join as a Creator →</Link>
          </Button>
        </div>

        {creatorsQuery.isLoading ? (
          <p className="py-12 text-center text-sm text-white/45">Loading creators...</p>
        ) : creatorsQuery.isError ? (
          <div role="alert" className="rounded-3xl border border-amber-300/15 bg-amber-300/[0.05] px-6 py-12 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-amber-300" />
            <h3 className="mt-4 text-xl font-black">Creator directory unavailable</h3>
            <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-white/50">
              PROMORANG could not read the creator-role directory, so the failure is not being replaced with sample creators.
            </p>
            <button type="button" onClick={() => void creatorsQuery.refetch()} className="mt-4 text-sm font-bold text-purple-300 hover:text-purple-200">
              Try again
            </button>
          </div>
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
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">
                      Creator role
                    </p>
                    {creator.location && (
                      <span className="text-[10px] text-white/40">{creator.location}</span>
                    )}
                  </div>

                  <h3 className="text-xl font-black text-white group-hover:text-purple-300 transition-colors truncate">
                    {creator.full_name}
                  </h3>

                  <p className="line-clamp-2 text-xs leading-relaxed text-white/60">
                    {creator.bio || "No profile bio recorded yet."}
                  </p>

                  <div className="border-t border-white/10 pt-2 text-[11px] leading-5 text-white/40">
                    Public performance proof is shown only when a dedicated recorded metric source is available.
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
            <Users className="mx-auto h-9 w-9 text-purple-400" />
            <h3 className="mt-5 text-2xl font-black">No creators found</h3>
            <p className="mx-auto mt-2 max-w-md text-xs text-white/50">
              Try adjusting your search query. If the directory source is healthy, only recorded creator-role profiles appear here.
            </p>
          </div>
        )}
      </section>

      {/* 4 Pillars of Creator Success */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:grid-cols-4">
          {[
            { icon: Sparkles, title: "1. Discover", text: "Find exciting Perks, moments, and cultural drops worth talking about." },
            { icon: Share2, title: "2. Distribute", text: "Share links can carry recorded attribution when an eligible referral source exists." },
            { icon: TrendingUp, title: "3. Build Proof", text: "Build reputation from actions and outcomes PROMORANG can actually record." },
            { icon: Ticket, title: "4. See Value", text: "See any recorded reward or draw entry when an eligible action qualifies." },
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
