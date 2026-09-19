import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Clock, Gift, MapPin, Search, Sparkles, WalletCards } from "lucide-react";
import SEO from "@/components/SEO";
import { useCanonicalMomentFeed } from "@/hooks/useCanonicalMomentFeed";
import { CurrentArc } from "@/components/marketing/MarketingPhysics";
import { PromoCardFace } from "@/components/promorang/SignatureObjects";
import { momentLifecycleLabel, type CanonicalMoment, type MomentLifecycle } from "@/services/moment-feed";
import { getSiteUrl } from "@/lib/discovery";
import heroMoments from "@/assets/hero-moments.jpg";

const lifecycleOrder: MomentLifecycle[] = ["live", "starting_soon", "upcoming", "recently_ended"];

const lifecycleHeading: Record<MomentLifecycle, string> = {
  live: "Live now",
  starting_soon: "Starting soon",
  upcoming: "Coming up",
  recently_ended: "Recently happened",
};

function formatMomentDate(value?: string | null) {
  if (!value) return "Time on Moment";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time on Moment";
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function PublicMomentPoster({ moment }: { moment: CanonicalMoment }) {
  return (
    <Link to={`/moments/${moment.slug || moment.id}`} className="public-moment-poster group">
      <div className="public-moment-poster__media">
        {moment.image_url ? (
          <img src={moment.image_url} alt="" />
        ) : (
          <div className="grid h-full place-items-center bg-[#111]"><CalendarDays className="h-8 w-8 text-white/15" /></div>
        )}
        <span className="public-moment-poster__scrim" />
        <span className="public-moment-poster__state">{momentLifecycleLabel(moment.lifecycle)}</span>
        {moment.reward ? <span className="public-moment-poster__reward"><Gift className="h-3 w-3" /> Access / perk attached</span> : null}
      </div>
      <div className="public-moment-poster__body">
        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-orange-300">{moment.category || "Moment"}</p>
        <h3>{moment.title}</h3>
        <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-5 text-white/50"><MapPin className="mt-0.5 h-3 w-3 shrink-0 text-orange-400" />{moment.venue_name || moment.location || "Location on Moment"}</p>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-white/62"><Clock className="h-3 w-3 text-orange-400" />{formatMomentDate(moment.starts_at)}</p>
        {moment.reward ? <p className="mt-3 border-l-2 border-orange-500 bg-orange-500/[0.07] px-3 py-2 text-[11px] leading-5 text-white/65">{moment.reward}</p> : null}
      </div>
    </Link>
  );
}

export function PublicMomentsExperience() {
  const momentsQuery = useCanonicalMomentFeed();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const moments = momentsQuery.data?.moments || [];
  const categories = useMemo(
    () => ["all", ...Array.from(new Set(moments.map((moment) => moment.category).filter(Boolean) as string[])).slice(0, 8)],
    [moments],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return moments.filter((moment) => {
      if (category !== "all" && moment.category !== category) return false;
      if (!q) return true;
      return [moment.title, moment.description, moment.category, moment.location, moment.venue_name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [moments, query, category]);

  const featured = filtered.find((moment) => moment.lifecycle === "live")
    || filtered.find((moment) => moment.lifecycle === "starting_soon")
    || filtered.find((moment) => moment.lifecycle === "upcoming")
    || filtered[0]
    || null;

  const heroImage = featured?.image_url || heroMoments;
  const heroIsEditorial = !featured?.image_url;
  const currentCount = filtered.filter((moment) => ["live", "starting_soon", "upcoming"].includes(moment.lifecycle)).length;
  const withRewards = filtered.filter((moment) => Boolean(moment.reward)).length;
  const recurring = filtered.filter((moment) => Boolean(moment.recurrence_enabled)).length;

  return (
    <main className="marketing-cinematic public-moments-world min-h-screen bg-[#050505] text-white">
      <SEO
        title="Moments on PROMORANG — What’s moving now"
        description="See what is happening now, what is coming up, and what is worth showing up for on PROMORANG."
        url={getSiteUrl("/discover/moments")}
      />

      <section
        className="marketing-cinematic-hero public-moments-hero border-b border-white/10 px-5 pb-16 pt-12 sm:px-6 md:pb-20 md:pt-20"
        style={{ backgroundImage: `url("${heroImage}")` }}
      >
        <CurrentArc variant="hero" className="marketing-hero-current" />
        <div className="relative mx-auto flex min-h-[34rem] max-w-[1440px] items-end">
          <div className="max-w-4xl pb-4 md:pb-8">
            <p className="marketing-kicker"><Sparkles className="h-3.5 w-3.5" /> Moments · what’s happening</p>
            <h1 className="mt-6 max-w-[9ch] text-5xl font-black sm:text-6xl lg:text-7xl xl:text-[5.8rem]">
              Show up to
              <br />
              <span className="text-orange-400">something.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
              Find what is live, starting soon, coming up or recurring—and choose what is worth showing up for.
            </p>

            {heroIsEditorial ? (
              <p className="mt-5 text-[9px] font-black uppercase tracking-[0.14em] text-white/38">What’s happening now and what’s coming next</p>
            ) : null}

            {featured ? (
              <Link to={`/moments/${featured.slug || featured.id}`} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-md bg-orange-500 px-5 text-xs font-black uppercase tracking-[0.08em] text-black">
                {featured.lifecycle === "live" ? "Open live Moment" : "Open featured Moment"} <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-6 border-l border-orange-500/55 pl-5">
              {[["Now & next", currentCount], ["With perks/access", withRewards], ["Recurring", recurring]].map(([label, value]) => (
                <div key={label}>
                  <p className="text-2xl font-black">{value}</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/40">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="public-moment-controls sticky top-14 z-30 border-b border-white/10 bg-black/92 px-5 py-3 backdrop-blur-xl sm:px-6 md:top-[4.25rem]">
        <div className="mx-auto grid max-w-[1440px] gap-3 lg:grid-cols-[minmax(260px,.72fr)_1.28fr] lg:items-center">
          <div className="flex min-h-11 items-center gap-3 border border-white/12 bg-white/[0.035] px-3">
            <Search className="h-4 w-4 text-orange-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Moments, places, music, food…" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30" />
            {query ? <button type="button" onClick={() => setQuery("")} className="text-[9px] font-black uppercase tracking-[0.12em] text-white/40">Clear</button> : null}
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`shrink-0 border px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.1em] transition ${category === item ? "border-orange-500 bg-orange-500 text-black" : "border-white/12 bg-white/[0.025] text-white/58 hover:border-orange-400/40 hover:text-white"}`}
              >
                {item === "all" ? "All Moments" : item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[1440px]">
          {momentsQuery.isLoading ? (
            <div className="public-moment-grid">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="public-moment-poster min-h-[24rem] animate-pulse bg-white/[0.04]" />)}</div>
          ) : momentsQuery.isError ? (
            <div className="marketing-compact-empty">
              <Clock className="h-5 w-5 text-orange-400" />
              <div><p className="text-sm font-black">We couldn’t load Moments right now.</p><p className="mt-1 text-xs leading-5 text-white/45">Try again in a moment.</p></div>
              <button type="button" onClick={() => momentsQuery.refetch()} className="ml-auto hidden text-xs font-black uppercase tracking-[0.1em] text-orange-300 sm:block">Try again</button>
            </div>
          ) : filtered.length ? (
            <div className="space-y-16">
              {lifecycleOrder.map((lifecycle) => {
                const items = filtered.filter((moment) => moment.lifecycle === lifecycle);
                if (!items.length) return null;
                return (
                  <section key={lifecycle} className="public-moment-lifecycle">
                    <div className="marketing-section-head">
                      <div>
                        <p className="marketing-kicker">{momentLifecycleLabel(lifecycle)}</p>
                        <h2 className="mt-3 text-3xl font-black sm:text-4xl">{lifecycleHeading[lifecycle]}</h2>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">{items.length} Moment{items.length === 1 ? "" : "s"}</span>
                    </div>
                    <div className="public-moment-grid">
                      {items.map((moment) => <PublicMomentPoster key={moment.id} moment={moment} />)}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="marketing-compact-empty">
              <Search className="h-5 w-5 text-orange-400" />
              <div><p className="text-sm font-black">Nothing matches this view yet.</p><p className="mt-1 text-xs leading-5 text-white/45">Clear the filter or try another category.</p></div>
              <button type="button" onClick={() => { setQuery(""); setCategory("all"); }} className="ml-auto hidden text-xs font-black uppercase tracking-[0.1em] text-orange-300 sm:block">Clear filters</button>
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#080808] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[.78fr_1.22fr] lg:items-center">
          <div>
            <p className="marketing-kicker"><WalletCards className="h-3.5 w-3.5" /> Keep the Moment with you</p>
            <h2 className="mt-3 text-4xl font-black sm:text-5xl">The night ends. The connection doesn’t have to.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/55">Keep Moments you care about close, carry access with you, and come back to what changed afterward.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/auth?mode=signup&next=/discover/moments" className="inline-flex min-h-12 items-center gap-2 rounded-md bg-orange-500 px-5 text-xs font-black uppercase tracking-[0.08em] text-black">Get PromoCard <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/discover" className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/15 px-5 text-xs font-black uppercase tracking-[0.08em] text-white">Back to Discover</Link>
            </div>
          </div>
          <div className="marketing-promocard-stage">
            <PromoCardFace
              holder="Your PromoCard"
              available="Moments that stayed with you"
              limit="Watching · Access · Kept"
              places="Keep the Moments, access and memories you want to come back to."
              action="See what changed"
              variant="membership"
              interactive={false}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
