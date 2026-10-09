import { matchesCityHub } from "@/lib/city-hubs";
import { HomeIntroduction } from "./HomeIntroduction";
import { HomeOpportunities } from "./HomeOpportunities";
import type { TranslationKey } from "@/i18n/translations";
import { useMemo } from "react";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Home,
  MapPin,
  Plus,
  ShoppingBag,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";
import { discoveryLocation, formatDiscoveryCategory } from "@promorang/shared";
import { FindOrAskEntry } from "@/components/discovery/FindOrAskEntry";
import { useAuth } from "@/contexts/AuthContext";
import { useMarket } from "@/contexts/MarketContext";
import { useCanonicalMomentFeed } from "@/hooks/useCanonicalMomentFeed";
import { useDiscoveries } from "@/hooks/useDiscoveries";
import { useDiscoveryDemand } from "@/hooks/useDiscoveryDemand";
import { useScenes } from "@/hooks/useScenes";
import { useI18n } from "@/i18n/I18nContext";
import { discoverPathHref } from "@/lib/discovery-path";
import type { CanonicalMoment } from "@/services/moment-feed";

const categories = [
  { key: "nightlife" },
  { key: "food" },
  { key: "wellness" },
  { key: "cars" },
  { key: "culture" },
  { key: "outdoor" },
  { key: "social", icon: Users },
];

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
  const { data: momentFeed, isLoading: momentsLoading, isError: momentsError, refetch: retryMoments } = useCanonicalMomentFeed();
  const { data: discoveries = [], isLoading: discoveriesLoading, isError: discoveriesError, refetch: retryDiscoveries } = useDiscoveries({ city: cityFilter, limit: 12 });
  const { data: scenes = [] } = useScenes({ city: cityFilter, country: country.slug || "jamaica", limit: 8 });
  const { inbox } = useDiscoveryDemand(city.name, country.slug || "jamaica", city.id === "all-jamaica" ? undefined : city.id);
  const moments = useMemo(() => (momentFeed?.moments || []).filter((moment) => moment.lifecycle !== "recently_ended").filter((moment) => matchesCityHub({ location: moment.location, venue_name: moment.venue_name }, city)).sort((a, b) => Number(b.lifecycle === "live") - Number(a.lifecycle === "live") || Date.parse(a.starts_at) - Date.parse(b.starts_at)).slice(0, 10), [momentFeed?.moments, city]);
  const wants = useMemo(() => inbox.questions.slice(0, 8), [inbox.questions]);
  const hasInventory = moments.length + discoveries.length > 0;
  const inventoryLoading = momentsLoading || discoveriesLoading;
  const inventoryError = momentsError || discoveriesError;
  const loginHref = (next: string) => user ? next : `/auth?mode=login&role=participant&next=${encodeURIComponent(next)}`;

  return (
    <main className="min-h-screen overflow-x-clip bg-[#111511] pb-0 text-white selection:bg-orange-500 selection:text-black md:pb-0">
      <HomeIntroduction opportunities={<HomeOpportunities market={marketName} moments={moments} momentsLoading={momentsLoading} momentsError={momentsError} retryMoments={retryMoments} />} />
      <section id="ask" className="scroll-mt-32 border-b border-white/15 bg-[#171d18] px-5 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-[1360px]">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-sans text-2xl font-semibold">{t("homeIntro.local")}</h2><p className="mt-2 text-sm leading-6 text-white/70">{t("homeIntro.localCopy", { market: marketName })}</p></div><Link to="/scenes" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-orange-300">{t("homeValue.allScenes")}<ArrowRight className="h-4 w-4" /></Link></div>
            <nav aria-label={t("publicHome.categoryNavigation")} className="mt-3 flex flex-wrap gap-2">
              {categories.map(({ key }) => <Link key={key} to={`/discover?category=${key}`} className="inline-flex min-h-11 items-center rounded-full border border-white/25 bg-black/40 px-4 text-sm font-semibold text-white hover:border-orange-400">{t(`publicHome.category.${key}` as TranslationKey)}</Link>)}
            </nav>
            <FindOrAskEntry source="home" city={marketName} compact className="mt-5 max-w-3xl" />
          </div>

        </div>
      </section>

      <div id="feed-start" className="mx-auto max-w-[1360px] scroll-mt-32 space-y-12 px-4 py-9 sm:px-6 sm:py-12 md:space-y-16">
        {inventoryLoading && !hasInventory ? <p role="status" className="text-sm text-white/60">{t("people.homeLoad")}</p> : null}
        {moments.length ? <section id="moments" className="scroll-mt-40">
          <header className="mb-5 flex items-end justify-between gap-4"><div><h2 className="font-sans text-2xl font-semibold tracking-[-.025em] sm:text-3xl">{t("publicHome.happening")}</h2><p className="mt-1 text-sm text-white/50">{t("publicHome.happeningCopy", { market: marketName })}</p></div><Link to="/live" className="shrink-0 text-xs font-black uppercase tracking-[.08em] text-orange-400">{t("publicHome.seeAll")} <ArrowRight className="ml-1 inline h-4 w-4" /></Link></header>
          <div className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{moments.slice(0, 7).map((moment) => <MomentTile key={moment.id} moment={moment} locale={locale} labels={{ live: t("publicHome.lifecycleLive"), soon: t("publicHome.lifecycleSoon"), upcoming: t("publicHome.lifecycleUpcoming"), moment: t("publicHome.moment"), going: t("publicHome.going"), open: t("publicHome.openMoment") }} />)}</div>
        </section> : null}

        {discoveries.length ? <section id="discoveries" className="scroll-mt-40">
          <header className="mb-5 flex items-end justify-between gap-4"><div><h2 className="font-sans text-2xl font-semibold tracking-[-.025em] sm:text-3xl">{t("publicHome.forYou")}</h2><p className="mt-1 text-sm text-white/50">{t("publicHome.forYouCopy")}</p></div><Link to="/discover" className="shrink-0 text-xs font-black uppercase tracking-[.08em] text-orange-400">{t("publicHome.seeAll")} <ArrowRight className="ml-1 inline h-4 w-4" /></Link></header>
          <div className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{discoveries.slice(0, 8).map((item) => <Link key={item.id} to={`/discoveries/${item.slug}`} className="group min-w-[68vw] snap-start overflow-hidden rounded-[1.2rem] border border-white/12 bg-[#101010] sm:min-w-[18rem]"><div className="relative aspect-[1.35/1] overflow-hidden">{item.cover_image ? <img src={item.cover_image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="h-full w-full bg-gradient-to-br from-orange-500/30 to-black" />}<div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" /><span className="absolute left-3 top-3 rounded-full bg-orange-500 px-2.5 py-1 text-[9px] font-black uppercase text-black">{formatDiscoveryCategory(item.category)}</span></div><div className="p-4"><h3 className="text-lg font-black">{item.title}</h3><p className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/55"><MapPin className="h-3.5 w-3.5" />{discoveryLocation(item)}</p>{item.save_count > 0 ? <p className="mt-3 text-[11px] font-bold text-white/45">{item.save_count} {t("publicHome.saved")}</p> : null}</div></Link>)}</div>
        </section> : null}

        {inventoryError ? <div role="status" className="rounded-xl border border-orange-300/20 p-4"><p className="text-sm text-white/65">{t("compression.inventoryError")}</p><button type="button" onClick={() => { void Promise.allSettled([retryMoments(), retryDiscoveries()]); }} className="mt-3 inline-flex min-h-11 items-center rounded-full border border-white/20 px-4 text-sm font-bold">{t("compression.retry")}</button></div> : null}
        {!hasInventory && !inventoryLoading && !inventoryError ? <section className="rounded-[1.5rem] border border-white/12 bg-white/[.035] px-5 py-9 text-left"><p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">{t("publicHome.noLiveListings")}</p><h2 className="mt-3 font-sans text-2xl font-black">{t("publicHome.sparseTitle", { market: marketName })}</h2><p className="mt-2 max-w-lg text-sm leading-6 text-white/50">{t("publicHome.sparseCopy")}</p><div className="mt-5 flex flex-wrap gap-2"><Link to="/live" className="rounded-full border border-white/20 px-4 py-2 text-[10px] font-black uppercase tracking-[.08em]">{t("publicHome.browseMoments")}</Link><Link to="/discover" className="rounded-full bg-orange-500 px-4 py-2 text-[10px] font-black uppercase tracking-[.08em] text-black">{t("publicHome.browseDiscoveries")}</Link></div></section> : null}

        {wants.length ? <section id="wanted" className="scroll-mt-40">
          <header className="mb-5 flex items-end justify-between gap-4"><div><h2 className="font-sans text-2xl font-semibold tracking-[-.025em] sm:text-3xl">{t("publicHome.peopleWant", { market: marketName })}</h2><p className="mt-1 text-sm text-white/50">{t("publicHome.peopleWantCopy")}</p></div><Link to="/discover?tab=wants" className="shrink-0 text-xs font-black uppercase tracking-[.08em] text-orange-400">{t("publicHome.seeAll")} <ArrowRight className="ml-1 inline h-4 w-4" /></Link></header>
          <div className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{wants.map((signal) => { const href = discoverPathHref(signal.poll.question); return <Link key={signal.poll.id} to={loginHref(href)} className="min-w-[72vw] snap-start rounded-[1.2rem] border border-white/12 bg-[linear-gradient(135deg,rgba(249,115,22,.15),rgba(255,255,255,.035))] p-4 sm:min-w-[19rem]"><div className="flex items-start justify-between gap-4"><span className="rounded-full border border-orange-400/35 px-2.5 py-1 text-[9px] font-black uppercase tracking-[.08em] text-orange-300">{t("publicHome.wanted")}</span><Sparkles className="h-4 w-4 text-orange-400" /></div><h3 className="mt-5 text-xl font-black leading-tight">{signal.poll.question}</h3><p className="mt-3 text-xs text-white/50">{signal.poll.totalVotes || 0} {t("publicHome.people")}</p><span className="mt-5 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[.08em] text-orange-300">{t("publicHome.wantThis")}<ArrowRight className="h-3.5 w-3.5" /></span></Link>; })}</div>
        </section> : null}

        {scenes.length ? <section id="scenes" className="scroll-mt-40">
          <header className="mb-5"><h2 className="font-sans text-2xl font-semibold tracking-[-.025em] sm:text-3xl">{t("publicHome.scenes")}</h2><p className="mt-1 text-sm text-white/50">{t("publicHome.scenesCopy", { market: marketName })}</p></header>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{scenes.slice(0, 8).map((scene) => <Link key={scene.id} to={`/scenes/${scene.slug}`} className="group relative min-h-56 overflow-hidden rounded-[1.2rem] border border-white/12 bg-[#111]">{scene.image_url ? <img src={scene.image_url} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : null}<div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-4"><p className="text-[9px] font-black uppercase tracking-[.12em] text-orange-300">{t("publicHome.scene")}</p><h3 className="mt-1 text-xl font-black">{scene.title}</h3><p className="mt-2 line-clamp-2 text-xs text-white/60">{scene.metadata?.tagline || scene.description}</p><span className="mt-3 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.08em]">{t("publicHome.enterScene")}<ArrowRight className="h-3.5 w-3.5 text-orange-400" /></span></div></Link>)}</div>
        </section> : null}



      <section aria-labelledby="public-shop-title" className="scroll-mt-40">
        <div className="rounded-3xl border border-orange-400/25 bg-orange-500/[.06] p-5 sm:p-8">
          <h2 id="public-shop-title" className="font-sans text-2xl font-semibold tracking-tight sm:text-3xl">{t("shopEntry.title")}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/80">{t("shopEntry.copy")}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {[["/shop", "shopEntry.browse"], ["/shop/category/products", "shopEntry.products"], ["/shop/category/services", "shopEntry.services"]].map(([href, label]) => <Link key={href} to={href} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 px-4 text-sm font-bold text-white hover:border-orange-300">{t(label as TranslationKey)}<ArrowRight className="h-4 w-4 text-orange-300" /></Link>)}
          </div>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/75">{t("shopEntry.account")}</p>
        </div>
      </section>

        <section className="relative overflow-hidden rounded-[1.6rem] border border-white/12 bg-[radial-gradient(circle_at_85%_10%,rgba(249,115,22,.22),transparent_35%),#0c0c0c] p-5 sm:p-8">
          <div className="max-w-3xl"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">{t("publicHome.keepIt")}</p><h2 className="mt-3 max-w-xl font-sans text-2xl font-semibold tracking-[-.025em] sm:text-3xl">{t("homeValue.accountTitle")}</h2><p className="mt-3 max-w-xl text-sm leading-7 text-white/55">{t("homeValue.accountCopy")}</p><Link to={user ? "/card" : "/auth?mode=signup&role=participant&next=/card"} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-orange-500 px-5 text-xs font-black uppercase tracking-[.08em] text-black">{user ? t("homeValue.open") : t("homeValue.join")}<ArrowRight className="h-4 w-4" /></Link></div></div>
        </section>
      </div>

      <nav aria-label={t("publicHome.mobileNavigation")} className="mx-auto flex max-w-[1360px] justify-around gap-2 border-t border-white/15 px-5 py-5 md:hidden">
        <Link to="/" className="flex flex-col items-center gap-1 text-[10px] font-bold text-orange-400"><Home className="h-5 w-5" />{t("publicHome.navHome")}</Link>
        <Link to="/shop" className="flex flex-col items-center gap-1 text-[10px] font-bold text-white/85"><ShoppingBag className="h-5 w-5" />{t("publicNav.shop")}</Link>
        <Link to="/discover?tab=wants" className="flex flex-col items-center gap-1 text-[10px] font-bold text-white"><span className="grid h-5 w-5 place-items-center text-orange-300"><Plus className="h-5 w-5" /></span>{t("publicHome.navAsk")}</Link>
        <Link to="/live" className="flex flex-col items-center gap-1 text-[10px] font-bold text-white/65"><Clock3 className="h-5 w-5" />{t("publicHome.navMoving")}</Link>
        <Link to={user ? "/card" : "/auth?mode=signup&role=participant&next=/card"} className="flex flex-col items-center gap-1 text-[10px] font-bold text-white/65"><WalletCards className="h-5 w-5" />{t("publicHome.navCard")}</Link>
      </nav>
    </main>
  );
}
