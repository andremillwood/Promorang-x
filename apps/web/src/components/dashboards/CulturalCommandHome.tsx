import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Bell,
  Bookmark,
  Calendar,
  CheckCircle,
  Coins,
  Compass,
  Heart,
  Key,
  MessageCircle,
  Play,
  Search,
  Share2,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useForYouFeed } from "@/hooks/useFeed";
import { useJoinedMoments, useParticipantStats } from "@/hooks/useMoments";
import { useUserBalance } from "@/hooks/useEconomy";
import { cultureCreators, cultureEvents, cultureImages, cultureScenes } from "@/data/culture-demo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tabs = ["For You", "Following", "Scenes", "Drops", "Updates"];

const CulturalCommandHome = () => {
  const { user } = useAuth();
  const { data: balance } = useUserBalance();
  const { data: stats } = useParticipantStats();
  const { data: joinedMoments = [] } = useJoinedMoments();
  const feedQuery = useForYouFeed(null);
  const [activeTab, setActiveTab] = useState("For You");
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "Explorer";

  const upcoming = useMemo(
    () => joinedMoments.filter((moment) => new Date(moment.starts_at) > new Date()).slice(0, 3),
    [joinedMoments],
  );
  const feedItem = feedQuery.data?.feed?.[0];
  const hasPromoShare = (balance?.gems || 0) > 0 || (stats?.rewardsClaimed || 0) > 0;

  const metrics = [
    { label: "Upcoming", value: upcoming.length, helper: upcoming.length ? "Moments" : "Find your next moment", icon: Calendar, color: "text-orange-500" },
    { label: "Check-ins", value: stats?.checkedIn || 0, helper: (stats?.checkedIn || 0) ? "Verified" : "Build your proof", icon: CheckCircle, color: "text-emerald-400" },
    { label: "Points", value: balance?.points || 0, helper: "Status progress", icon: Sparkles, color: "text-amber-400" },
    { label: "Keys", value: balance?.promokeys || 0, helper: "Access", icon: Key, color: "text-fuchsia-400" },
    { label: "Wallet", value: balance?.gems || 0, helper: "Gems available", icon: Wallet, color: "text-orange-500" },
  ];

  const sceneRail = [
    { label: "Your Story", sub: "Add a moment", image: cultureCreators[0]?.avatar, href: "/profile", icon: UserRound },
    { label: cultureScenes[0]?.title, sub: "Scene", image: cultureScenes[0]?.image, href: `/scenes/${cultureScenes[0]?.slug}`, icon: Users },
    { label: cultureEvents[0]?.shortTitle, sub: "Live now", image: cultureEvents[0]?.image, href: "/pulse", icon: Activity },
    { label: "Content Drops", sub: "New proof", image: cultureImages.streetArt, href: "/content-drops", icon: Play },
    { label: cultureCreators[0]?.name, sub: "Creator", image: cultureCreators[0]?.avatar, href: `/creators/${cultureCreators[0]?.handle}`, icon: UserRound },
    { label: cultureScenes[1]?.title, sub: "Tonight", image: cultureScenes[1]?.image, href: `/scenes/${cultureScenes[1]?.slug}`, icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Your Promorang</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-4xl">Welcome back, {firstName}.</h1>
          <p className="mt-2 text-sm text-white/52">Your scene is moving. Find the signal, show up, and keep what your action creates.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/search" className="flex h-11 min-w-64 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.045] px-4 text-sm text-white/45">
            <Search className="h-4 w-4" /> Search Promorang
          </Link>
          <Link to="/activity" className="relative grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.045]">
            <Bell className="h-4 w-4" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
          </Link>
        </div>
      </header>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <main className="min-w-0 space-y-5">
          <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {metrics.map((metric) => (
              <Link key={metric.label} to={metric.label === "Wallet" ? "/wallet" : metric.label === "Upcoming" ? "/discover" : "/profile"} className="rounded-2xl border border-white/[0.07] bg-white/[0.045] p-4 transition hover:border-primary/35 hover:bg-white/[0.07]">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-black/45 p-2"><metric.icon className={cn("h-5 w-5", metric.color)} /></div>
                  <div><p className="text-xs text-white/55">{metric.label}</p><p className="text-2xl font-semibold">{metric.value.toLocaleString()}</p></div>
                </div>
                <p className="mt-2 truncate text-[11px] text-white/38">{metric.helper}</p>
              </Link>
            ))}
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.035]">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
              <h2 className="font-bold">What’s happening in your scene</h2>
              <Link to="/discover" className="text-xs font-bold text-primary">Customize feed</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto p-4">
              {sceneRail.map((item) => (
                <Link key={item.label} to={item.href} className="w-28 shrink-0 rounded-2xl border border-white/[0.07] bg-black/35 p-2 text-center transition hover:border-primary/45">
                  <div className="relative mx-auto h-20 overflow-hidden rounded-xl">
                    <img src={item.image} alt="" className="h-full w-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                    <item.icon className="absolute bottom-2 left-2 h-4 w-4 text-primary" />
                  </div>
                  <p className="mt-2 truncate text-xs font-bold">{item.label}</p>
                  <p className="truncate text-[10px] text-white/40">{item.sub}</p>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-1 overflow-x-auto rounded-xl border border-white/[0.07] bg-white/[0.035] p-1">
              <span className="mr-auto px-3 text-sm font-bold">Feed</span>
              {tabs.map((tab) => (
                <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={cn("rounded-lg px-3 py-2 text-xs transition", activeTab === tab ? "bg-primary/15 font-bold text-primary" : "text-white/45 hover:text-white")}>{tab}</button>
              ))}
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              <article className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]">
                <div className="flex items-center gap-3 p-4">
                  <img src={cultureCreators[0]?.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                  <div><p className="text-sm font-bold">{feedItem?.subtitle || cultureCreators[0]?.name}</p><p className="text-xs text-white/40">Culture moving now</p></div>
                  <span className="ml-auto text-xs font-bold text-primary">PromoShare eligible</span>
                </div>
                <div className="px-4 pb-4">
                  <h3 className="text-lg font-bold">{feedItem?.title || "The city showed up. Keep the moment moving."}</h3>
                  <p className="mt-1 text-sm text-white/55">{feedItem?.description || "Share the signal, join the scene, or save it for when you are ready to move."}</p>
                </div>
                <Link to={feedItem?.primary_cta.href || `/moments/${cultureEvents[0]?.momentId}`} className="block aspect-[16/9] overflow-hidden">
                  <img src={feedItem?.image_url || cultureEvents[0]?.image} alt="" className="h-full w-full object-cover" />
                </Link>
                <div className="flex items-center gap-6 p-4 text-sm text-white/55">
                  <button className="flex items-center gap-2 hover:text-white"><Heart className="h-4 w-4" /> Like</button>
                  <button className="flex items-center gap-2 hover:text-white"><MessageCircle className="h-4 w-4" /> Discuss</button>
                  <Link to="/promoshare" className="flex items-center gap-2 hover:text-primary"><Share2 className="h-4 w-4" /> Earn from shares</Link>
                  <button className="ml-auto"><Bookmark className="h-4 w-4" /></button>
                </div>
              </article>

              <div className="space-y-4">
                <article className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]">
                  <div className="p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">New content drop</p><h3 className="mt-1 text-xl font-bold">Turn attention into proof.</h3></div>
                  <Link to="/content-drops" className="relative block aspect-[2/1] overflow-hidden">
                    <img src={cultureImages.jazzNight} alt="" className="h-full w-full object-cover opacity-75" />
                    <span className="absolute inset-0 grid place-items-center"><span className="grid h-14 w-14 place-items-center rounded-full border border-white/40 bg-black/45"><Play className="h-5 w-5 fill-white" /></span></span>
                  </Link>
                  <div className="flex items-center gap-4 p-4 text-sm text-white/55"><Play className="h-4 w-4" /> 5.2K <MessageCircle className="h-4 w-4" /> 56 <Share2 className="h-4 w-4" /> 132</div>
                </article>
                <Link to="/pulse" className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 text-sm font-bold hover:border-primary/40">
                  <CheckCircle className="h-5 w-5 text-primary" /> Check what is live and verify your presence <ArrowRight className="ml-auto h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
            <h2 className="font-bold">Pick up where you left off</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {[
                ["Content Drop", "Join a creator signal", "/content-drops", Play],
                ["Mission", "Complete proof and unlock", "/missions", CheckCircle],
                ["Piece", "Pieces unlock as you grow", "/portfolio", Coins],
                ["Vault", "Keep memories and access", "/vault", Key],
                ["Growth Hub", "Track, earn, grow", "/growth", TrendingUp],
              ].map(([label, text, href, Icon]) => (
                <Link key={String(label)} to={String(href)} className="rounded-xl border border-white/[0.07] bg-black/30 p-3 hover:border-primary/35">
                  <Icon className="h-4 w-4 text-primary" /><p className="mt-3 text-xs text-white/40">{String(label)}</p><p className="mt-1 text-sm font-bold">{String(text)}</p>
                </Link>
              ))}
            </div>
          </section>
        </main>

        <aside className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-primary/45 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,.18),transparent_42%),linear-gradient(135deg,rgba(255,106,0,.13),rgba(255,255,255,.035))] p-5">
            <p className="text-xs font-black text-primary">PromoShare Spotlight</p>
            <h2 className="mt-3 text-2xl font-bold">{hasPromoShare ? `${balance?.gems || 0} Gems available` : "Make your next share count"}</h2>
            <p className="mt-2 text-sm text-white/55">{hasPromoShare ? "Your verified movement is building recurring value." : "Share a moment or content drop to activate PromoShare."}</p>
            <Button asChild className="mt-5 w-full"><Link to="/promoshare">View PromoShare</Link></Button>
          </section>

          <section className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4">
            <div className="flex items-center justify-between"><h2 className="font-bold">Upcoming for you</h2><Link to="/discover" className="text-xs font-bold text-primary">View all</Link></div>
            <div className="mt-3 divide-y divide-white/[0.07]">
              {(upcoming.length ? upcoming : cultureEvents.slice(0, 3)).map((item: any) => (
                <Link key={item.id || item.momentId} to={`/moments/${item.id || item.momentId}`} className="flex gap-3 py-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-xs font-black">{item.date?.slice(0, 6) || "NEXT"}</div>
                  <div className="min-w-0"><p className="truncate text-sm font-bold">{item.title}</p><p className="mt-1 truncate text-xs text-white/40">{item.venue_name || item.place || item.location}</p></div>
                  <Bookmark className="ml-auto h-4 w-4 text-white/30" />
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4">
            <div className="flex items-center justify-between"><h2 className="font-bold">Live now</h2><Link to="/pulse" className="text-xs font-bold text-primary">View all</Link></div>
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {cultureEvents.slice(0, 3).map((event) => (
                <Link key={event.momentId} to={`/moments/${event.momentId}`} className="w-28 shrink-0 overflow-hidden rounded-xl border border-white/[0.07] bg-black/35">
                  <img src={event.image} alt="" className="h-20 w-full object-cover" /><div className="p-2"><p className="truncate text-xs font-bold">{event.shortTitle}</p><p className="text-[10px] text-primary">Live signal</p></div>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4">
            <div className="flex items-center justify-between"><h2 className="font-bold">Your growth</h2><Link to="/growth" className="text-xs font-bold text-primary">Open hub</Link></div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[["Proof", stats?.checkedIn || 0], ["Rewards", stats?.rewardsClaimed || 0], ["Shares", 0], ["Earnings", balance?.gems || 0]].map(([label, value]) => (
                <div key={String(label)} className="rounded-xl bg-black/30 p-3"><p className="text-xs text-white/40">{label}</p><p className="mt-1 text-xl font-bold">{Number(value).toLocaleString()}</p><p className="mt-1 text-[10px] text-emerald-400">Ready to grow</p></div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default CulturalCommandHome;
