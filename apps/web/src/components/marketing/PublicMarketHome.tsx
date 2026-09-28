import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Home,
  Car,
  Drama,
  Flower2,
  MapPin,
  Mountain,
  Music2,
  Plus,
  Radio,
  Search,
  Sparkles,
  Users,
  Utensils,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";
import { discoveryLocation, formatDiscoveryCategory } from "@promorang/shared";
import { FindOrAskEntry } from "@/components/discovery/FindOrAskEntry";
import { PromoCardFace } from "@/components/promorang/SignatureObjects";
import { useAuth } from "@/contexts/AuthContext";
import { useMarket } from "@/contexts/MarketContext";
import { useCanonicalMomentFeed } from "@/hooks/useCanonicalMomentFeed";
import { useDiscoveries } from "@/hooks/useDiscoveries";
import { useDiscoveryDemand } from "@/hooks/useDiscoveryDemand";
import { useScenes } from "@/hooks/useScenes";
import { useI18n } from "@/i18n/I18nContext";
import { discoverPathHref } from "@/lib/discovery-path";
import type { CanonicalMoment } from "@/services/moment-feed";
import heroMoments from "@/assets/public-home-nightlife-hero.png";

const filters = [
  { href: "#feed-start", label: "publicHome.filterMoving" },
  { href: "/live", label: "publicHome.filterMoments" },
  { href: "/discover", label: "publicHome.filterDiscoveries" },
  { href: "/discover?tab=wants", label: "publicHome.filterWanted" },
  { href: "/discover?tab=scenes", label: "publicHome.filterScenes" },
];

const categories = [
  { key: "nightlife", icon: Music2 },
  { key: "food", icon: Utensils },
  { key: "wellness", icon: Flower2 },
  { key: "cars", icon: Car },
  { key: "culture", icon: Drama },
  { key: "outdoor", icon: Mountain },
  { key: "social", icon: Users },
];

function ScrollableRail({ children, ariaLabel, previousLabel, nextLabel, itemGap = "gap-5" }: { children: ReactNode; ariaLabel: string; previousLabel: string; nextLabel: string; itemGap?: string }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canMoveLeft, setCanMoveLeft] = useState(false);
  const [canMoveRight, setCanMoveRight] = useState(false);

  const updateControls = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setCanMoveLeft(rail.scrollLeft > 4);
    setCanMoveRight(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    updateControls();
    rail.addEventListener("scroll", updateControls, { passive: true });
    const observer = new ResizeObserver(updateControls);
    observer.observe(rail);
    if (rail.firstElementChild) observer.observe(rail.firstElementChild);
    return () => {
      rail.removeEventListener("scroll", updateControls);
      observer.disconnect();
    };
  }, [updateControls]);

  const move = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * Math.max(220, rail.clientWidth * 0.72), behavior: "smooth" });
  };

  return (
    <div className="relative mx-auto max-w-[1440px]" aria-label={ariaLabel}>
      {canMoveLeft ? <button type="button" onClick={() => move(-1)} aria-label={previousLabel} className="absolute left-0 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/90 text-white shadow-xl transition hover:border-orange-400 hover:text-orange-400"><ChevronLeft className="h-5 w-5" /></button> : null}
      <div ref={railRef} className="overflow-x-auto scroll-smooth px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className={`flex w-max min-w-full justify-start ${itemGap} ${canMoveLeft ? "pl-10" : ""} ${canMoveRight ? "pr-10" : ""} md:justify-center`}>
          {children}
        </div>
      </div>
      {canMoveRight ? <button type="button" onClick={() => move(1)} aria-label={nextLabel} className="absolute right-0 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-orange-400/55 bg-black/90 text-orange-400 shadow-xl transition hover:bg-orange-500 hover:text-black"><ChevronRight className="h-5 w-5" /></button> : null}
    </div>
  );
}

function momentHref(moment: CanonicalMoment) {
  return moment.slug ? `/moments/${moment.slug}` : `/moments/${moment.id}`;
}

function momentDate(moment: CanonicalMoment, locale: string) {
  if (!moment.starts_at) return null;
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(moment.starts_at));
}

function MomentTile({ moment, locale, labels }: { moment: CanonicalMoment; locale: string; labels: { live: string; soon: string; upcoming: string; moment: string; going: string; open: string } }) {
  const lifecycle = moment.lifecycle === "live" ? labels.live : moment.lifecycle === "upcoming" ? labels.upcoming : labels.soon;
  return (
    <Link to={momentHref(moment)} className="group relative block min-w-[82vw] snap-start overflow-hidden rounded-[1.35rem] border border-white/15 bg-[#121212] sm:min-w-[23rem]">
      <div className="relative aspect-[1.45/1] overflow-hidden">
        {moment.image_url ? <img src={moment.image_url} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="h-full w-full bg-[radial-gradient(circle_at_25%_20%,rgba(249,115,22,.45),transparent_42%),linear-gradient(140deg,#23150d,#080808)]" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.08em] text-black">{lifecycle}</span>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-[10px] font-black uppercase tracking-[.12em] text-orange-300">{moment.category || labels.moment}</p>
          <h3 className="mt-1 text-xl font-black leading-tight text-white">{moment.title}</h3>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/75">
            {momentDate(moment, locale) ? <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{momentDate(moment, locale)}</span> : null}
            {moment.venue_name || moment.location ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{moment.venue_name || moment.location}</span> : null}
            {moment.participant_count > 0 ? <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{moment.participant_count} {labels.going}</span> : null}
          </div>
        </div>
      </div>
      <span className="flex min-h-11 items-center justify-between border-t border-white/10 px-4 text-xs font-black uppercase tracking-[.08em] text-white">{labels.open}<ArrowRight className="h-4 w-4 text-orange-400" /></span>
    </Link>
  );
}

export default function PublicMarketHome() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const { city, country } = useMarket();
  const marketName = city.name === "All Jamaica" ? "Jamaica" : city.name;
  const cityFilter = city.id === "all-jamaica" ? undefined : city.name;
  const { data: momentFeed, isLoading: momentsLoading } = useCanonicalMomentFeed();
  const { data: discoveries = [], isLoading: discoveriesLoading } = useDiscoveries({ city: cityFilter, limit: 12 });
  const { data: scenes = [], isLoading: scenesLoading } = useScenes({ city: cityFilter, country: country.slug || "jamaica", limit: 8 });
  const { inbox, isLoading: demandLoading } = useDiscoveryDemand(city.name, country.slug || "jamaica", city.id === "all-jamaica" ? undefined : city.id);
  const moments = useMemo(() => (momentFeed?.moments || []).filter((moment) => !cityFilter || [moment.location, moment.venue_name].some((value) => value?.toLowerCase().includes(cityFilter.toLowerCase()))).slice(0, 10), [momentFeed?.moments, cityFilter]);
  const wants = useMemo(() => inbox.questions.slice(0, 8), [inbox.questions]);
  const hasContent = moments.length + discoveries.length + wants.length + scenes.length > 0;
  const isLoading = momentsLoading || discoveriesLoading || demandLoading || scenesLoading;
  const loginHref = (next: string) => user ? next : `/auth?mode=login&role=participant&next=${encodeURIComponent(next)}`;

  return (
    <main className="min-h-screen overflow-x-clip bg-[#050505] pb-24 text-white selection:bg-orange-500 selection:text-black md:pb-0">
      <section className="relative isolate overflow-hidden border-b border-white/10 px-4 pb-7 pt-7 sm:px-6 sm:pb-12 sm:pt-10" style={{ backgroundImage: `linear-gradient(90deg,rgba(0,0,0,.96) 0%,rgba(0,0,0,.8) 48%,rgba(0,0,0,.18) 100%),url("${heroMoments}")`, backgroundPosition: "62% center", backgroundSize: "cover" }}>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-transparent to-[#050505]" />
        <div className="mx-auto max-w-[1440px]">
          <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.18em] text-orange-300"><Radio className="h-3.5 w-3.5" />{t("publicHome.rightNow", { market: marketName })}</p>
          <h1 className="mt-4 max-w-[11ch] font-sans text-[clamp(2.65rem,12vw,5.8rem)] font-black leading-[.92] tracking-[-.055em]">{t("publicHome.title")}</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/68 sm:text-lg">{t("publicHome.copy", { market: marketName })}</p>
          <FindOrAskEntry source="home" city={marketName} compact className="mt-6 max-w-3xl" />
          <div className="mt-7 max-w-2xl border-t border-white/20 pt-5"><h2 className="font-serif text-2xl font-bold sm:text-3xl">{t("launch.title")}</h2><p className="mt-3 text-sm leading-6 text-white/70">{t("launch.copy")}</p><div className="mt-4 flex flex-wrap gap-3"><Link to="/scenes" className="inline-flex min-h-12 items-center bg-primary px-5 py-3 text-sm font-bold text-black">{t("launch.explore")}</Link><Link to="/start" className="inline-flex min-h-12 items-center border border-white/25 px-5 py-3 text-sm font-bold">{t("launch.start")}</Link></div></div>
        </div>
      </section>

      <nav aria-label={t("publicHome.categoryNavigation")} className="border-b border-white/10 bg-[#050505] px-4 py-4 sm:px-6">
        <ScrollableRail ariaLabel={t("publicHome.categoryNavigation")} previousLabel={t("publicHome.scrollPrevious")} nextLabel={t("publicHome.scrollNext")}>
          {categories.map(({ key, icon: Icon }, index) => <Link key={key} to={`/discover?category=${key}`} className="group flex min-w-[4.4rem] shrink-0 flex-col items-center gap-2 text-center"><span className={`grid h-14 w-14 place-items-center rounded-full border bg-white/[.025] transition group-hover:border-orange-400 group-hover:text-orange-400 ${index === 0 ? "border-orange-500 text-orange-400" : "border-white/25 text-white"}`}><Icon className="h-5 w-5" /></span><span className="text-[10px] font-semibold text-white/72">{t(`publicHome.category.${key}`)}</span></Link>)}
        </ScrollableRail>
      </nav>

      <nav aria-label={t("publicHome.feedNavigation")} className="sticky top-14 z-30 border-b border-white/10 bg-[#050505]/95 px-4 py-3 backdrop-blur-xl sm:px-6 md:top-16">
        <ScrollableRail ariaLabel={t("publicHome.feedNavigation")} previousLabel={t("publicHome.scrollPrevious")} nextLabel={t("publicHome.scrollNext")} itemGap="gap-2">
          {filters.map((item, index) => <Link key={item.href} to={item.href} className={`shrink-0 rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[.08em] transition ${index === 0 ? "border-orange-500 bg-orange-500 text-black" : "border-white/15 bg-white/[.04] text-white/65 hover:border-orange-400/50 hover:text-white"}`}>{t(item.label)}</Link>)}
        </ScrollableRail>
      </nav>

      <div id="feed-start" className="mx-auto max-w-[1440px] scroll-mt-32 space-y-12 px-4 py-9 sm:px-6 sm:py-12 md:space-y-16">
        {moments.length ? <section id="moments" className="scroll-mt-40">
          <header className="mb-5 flex items-end justify-between gap-4"><div><h2 className="text-3xl font-black tracking-[-.04em] sm:text-4xl">{t("publicHome.happening")}</h2><p className="mt-1 text-sm text-white/50">{t("publicHome.happeningCopy", { market: marketName })}</p></div><Link to="/live" className="shrink-0 text-xs font-black uppercase tracking-[.08em] text-orange-400">{t("publicHome.seeAll")} <ArrowRight className="ml-1 inline h-4 w-4" /></Link></header>
          <div className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{moments.slice(0, 7).map((moment) => <MomentTile key={moment.id} moment={moment} locale={locale} labels={{ live: t("publicHome.lifecycleLive"), soon: t("publicHome.lifecycleSoon"), upcoming: t("publicHome.lifecycleUpcoming"), moment: t("publicHome.moment"), going: t("publicHome.going"), open: t("publicHome.openMoment") }} />)}</div>
        </section> : null}

        {discoveries.length ? <section id="discoveries" className="scroll-mt-40">
          <header className="mb-5 flex items-end justify-between gap-4"><div><h2 className="text-3xl font-black tracking-[-.04em] sm:text-4xl">{t("publicHome.forYou")}</h2><p className="mt-1 text-sm text-white/50">{t("publicHome.forYouCopy")}</p></div><Link to="/discover" className="shrink-0 text-xs font-black uppercase tracking-[.08em] text-orange-400">{t("publicHome.seeAll")} <ArrowRight className="ml-1 inline h-4 w-4" /></Link></header>
          <div className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{discoveries.slice(0, 8).map((item) => <Link key={item.id} to={`/discoveries/${item.slug}`} className="group min-w-[68vw] snap-start overflow-hidden rounded-[1.2rem] border border-white/12 bg-[#101010] sm:min-w-[18rem]"><div className="relative aspect-[1.35/1] overflow-hidden">{item.cover_image ? <img src={item.cover_image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="h-full w-full bg-gradient-to-br from-orange-500/30 to-black" />}<div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" /><span className="absolute left-3 top-3 rounded-full bg-orange-500 px-2.5 py-1 text-[9px] font-black uppercase text-black">{formatDiscoveryCategory(item.category)}</span></div><div className="p-4"><h3 className="text-lg font-black">{item.title}</h3><p className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/55"><MapPin className="h-3.5 w-3.5" />{discoveryLocation(item)}</p>{item.save_count > 0 ? <p className="mt-3 text-[11px] font-bold text-white/45">{item.save_count} {t("publicHome.saved")}</p> : null}</div></Link>)}</div>
        </section> : null}

        {wants.length ? <section id="wanted" className="scroll-mt-40">
          <header className="mb-5 flex items-end justify-between gap-4"><div><h2 className="text-3xl font-black tracking-[-.04em] sm:text-4xl">{t("publicHome.peopleWant", { market: marketName })}</h2><p className="mt-1 text-sm text-white/50">{t("publicHome.peopleWantCopy")}</p></div><Link to="/discover" className="shrink-0 text-xs font-black uppercase tracking-[.08em] text-orange-400">{t("publicHome.seeAll")} <ArrowRight className="ml-1 inline h-4 w-4" /></Link></header>
          <div className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{wants.map((signal) => { const href = discoverPathHref(signal.poll.question); return <Link key={signal.poll.id} to={loginHref(href)} className="min-w-[72vw] snap-start rounded-[1.2rem] border border-white/12 bg-[linear-gradient(135deg,rgba(249,115,22,.15),rgba(255,255,255,.035))] p-4 sm:min-w-[19rem]"><div className="flex items-start justify-between gap-4"><span className="rounded-full border border-orange-400/35 px-2.5 py-1 text-[9px] font-black uppercase tracking-[.08em] text-orange-300">{t("publicHome.wanted")}</span><Sparkles className="h-4 w-4 text-orange-400" /></div><h3 className="mt-5 text-xl font-black leading-tight">{signal.poll.question}</h3><p className="mt-3 text-xs text-white/50">{signal.poll.totalVotes || 0} {t("publicHome.people")}</p><span className="mt-5 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[.08em] text-orange-300">{t("publicHome.wantThis")}<ArrowRight className="h-3.5 w-3.5" /></span></Link>; })}</div>
        </section> : null}

        {scenes.length ? <section id="scenes" className="scroll-mt-40">
          <header className="mb-5"><h2 className="text-3xl font-black tracking-[-.04em] sm:text-4xl">{t("publicHome.scenes")}</h2><p className="mt-1 text-sm text-white/50">{t("publicHome.scenesCopy", { market: marketName })}</p></header>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{scenes.slice(0, 8).map((scene) => <Link key={scene.id} to={`/scenes/${scene.slug}`} className="group relative min-h-56 overflow-hidden rounded-[1.2rem] border border-white/12 bg-[#111]">{scene.image_url ? <img src={scene.image_url} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : null}<div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-4"><p className="text-[9px] font-black uppercase tracking-[.12em] text-orange-300">{t("publicHome.scene")}</p><h3 className="mt-1 text-xl font-black">{scene.title}</h3><p className="mt-2 line-clamp-2 text-xs text-white/60">{scene.metadata?.tagline || scene.description}</p><span className="mt-3 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.08em]">{t("publicHome.enterScene")}<ArrowRight className="h-3.5 w-3.5 text-orange-400" /></span></div></Link>)}</div>
        </section> : null}

        {!hasContent && !isLoading ? <section className="rounded-[1.5rem] border border-white/12 bg-white/[.035] px-5 py-9 text-left"><p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">{t("publicHome.noLiveListings")}</p><h2 className="mt-3 font-sans text-2xl font-black">{t("publicHome.sparseTitle", { market: marketName })}</h2><p className="mt-2 max-w-lg text-sm leading-6 text-white/50">{t("publicHome.sparseCopy")}</p><div className="mt-5 flex flex-wrap gap-2"><Link to="/live" className="rounded-full border border-white/20 px-4 py-2 text-[10px] font-black uppercase tracking-[.08em]">{t("publicHome.browseMoments")}</Link><Link to="/discover" className="rounded-full bg-orange-500 px-4 py-2 text-[10px] font-black uppercase tracking-[.08em] text-black">{t("publicHome.browseDiscoveries")}</Link></div></section> : null}

        <section className="relative overflow-hidden rounded-[1.6rem] border border-white/12 bg-[radial-gradient(circle_at_85%_10%,rgba(249,115,22,.22),transparent_35%),#0c0c0c] p-5 sm:p-8">
          <div className="grid items-center gap-7 lg:grid-cols-[1fr_.85fr]"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">{t("publicHome.keepIt")}</p><h2 className="mt-3 max-w-xl text-3xl font-black tracking-[-.04em] sm:text-4xl">{t("publicHome.cardTitle")}</h2><p className="mt-3 max-w-xl text-sm leading-7 text-white/55">{t("publicHome.cardCopy")}</p><Link to={user ? "/card" : "/auth?mode=signup&role=participant&next=/card"} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-orange-500 px-5 text-xs font-black uppercase tracking-[.08em] text-black">{t("publicHome.navCard")}<ArrowRight className="h-4 w-4" /></Link></div><div className="mx-auto w-full max-w-md"><PromoCardFace holder={t("clarity.yourPromoCard")} available={t("clarity.whatOpens")} limit={t("clarity.cardStates")} places={t("clarity.cardSummary")} action={user ? t("clarity.openMyCard") : t("clarity.getMyCard")} variant="membership" interactive={false} /></div></div>
        </section>
      </div>

      <nav aria-label={t("publicHome.mobileNavigation")} className="fixed inset-x-3 bottom-[calc(.75rem+env(safe-area-inset-bottom))] z-50 grid grid-cols-5 items-end rounded-[1.6rem] border border-white/15 bg-[#101010]/95 px-2 pb-2 pt-3 shadow-2xl backdrop-blur-xl md:hidden">
        <Link to="/" className="flex flex-col items-center gap-1 text-[10px] font-bold text-orange-400"><Home className="h-5 w-5" />{t("publicHome.navHome")}</Link>
        <Link to="/discover" className="flex flex-col items-center gap-1 text-[10px] font-bold text-white/65"><Search className="h-5 w-5" />{t("publicHome.navExplore")}</Link>
        <Link to="/discover" className="-mt-7 flex flex-col items-center gap-1 text-[10px] font-bold text-white"><span className="grid h-14 w-14 place-items-center rounded-full bg-orange-500 text-black shadow-[0_0_28px_rgba(249,115,22,.3)]"><Plus className="h-7 w-7" /></span>{t("publicHome.navAsk")}</Link>
        <a href="#moments" className="flex flex-col items-center gap-1 text-[10px] font-bold text-white/65"><Clock3 className="h-5 w-5" />{t("publicHome.navMoving")}</a>
        <Link to={user ? "/card" : "/auth?mode=signup&role=participant&next=/card"} className="flex flex-col items-center gap-1 text-[10px] font-bold text-white/65"><WalletCards className="h-5 w-5" />{t("publicHome.navCard")}</Link>
      </nav>
    </main>
  );
}
