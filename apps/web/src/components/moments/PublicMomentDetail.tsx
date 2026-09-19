import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, Clock, Gift, MapPin, Share2, Users, WalletCards } from "lucide-react";
import SEO from "@/components/SEO";
import { useCanonicalMomentFeed } from "@/hooks/useCanonicalMomentFeed";
import { CurrentArc } from "@/components/marketing/MarketingPhysics";
import { momentLifecycleLabel, type CanonicalMoment } from "@/services/moment-feed";
import { getSiteUrl } from "@/lib/discovery";

function formatDate(value?: string | null) {
  if (!value) return "Time on Moment";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time on Moment";
  return new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

function MomentCard({ moment }: { moment: CanonicalMoment }) {
  return <Link to={`/moments/${moment.slug || moment.id}`} className="public-object-related group">
    <div className="public-object-related__media">{moment.image_url ? <img src={moment.image_url} alt="" /> : <div className="grid h-full place-items-center bg-white/[.04]"><CalendarDays className="h-7 w-7 text-white/20" /></div>}<span>{momentLifecycleLabel(moment.lifecycle)}</span></div>
    <div className="p-4"><p className="text-[9px] font-black uppercase tracking-[.14em] text-orange-300">{moment.category || "Moment"}</p><h3 className="mt-2 text-xl font-black leading-tight">{moment.title}</h3><p className="mt-2 flex items-start gap-1.5 text-[11px] text-white/45"><MapPin className="mt-0.5 h-3 w-3 shrink-0 text-orange-400" />{moment.venue_name || moment.location || "Location on Moment"}</p></div>
  </Link>;
}

export function PublicMomentDetail() {
  const { id } = useParams<{ id: string }>();
  const query = useCanonicalMomentFeed();
  const moments = query.data?.moments || [];
  const moment = moments.find((item) => item.id === id || item.slug === id) || null;

  if (query.isLoading) return <main className="grid min-h-screen place-items-center bg-[#050505] text-white"><div className="h-9 w-9 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" /></main>;
  if (query.isError || !moment) return <main className="grid min-h-screen place-items-center bg-[#050505] px-6 text-center text-white"><div className="max-w-xl"><CalendarDays className="mx-auto h-9 w-9 text-orange-400" /><h1 className="mt-5 text-4xl font-black">{query.isError ? "Moment unavailable" : "This is not a current public Moment."}</h1><p className="mt-3 text-sm leading-6 text-white/50">{query.isError ? "We couldn’t load this Moment right now." : "This Moment is not available at this link."}</p><Link to="/discover/moments" className="mt-6 inline-flex items-center gap-2 font-black text-orange-300"><ArrowLeft className="h-4 w-4" />Browse Moments</Link></div></main>;

  const href = `/moments/${moment.slug || moment.id}`;
  const authHref = `/auth?mode=signup&next=${encodeURIComponent(href)}`;
  const related = moments.filter((item) => item.id !== moment.id && (item.category === moment.category || (item.location && item.location === moment.location) || (item.venue_name && item.venue_name === moment.venue_name))).slice(0, 4);
  const more = moments.filter((item) => item.id !== moment.id && !related.some((r) => r.id === item.id)).slice(0, 4);
  const hostId = moment.host_id || moment.organizer_id || null;
  const linkedBrands = (moment.associated_brands || []).filter((brand) => brand.slug);
  const linkedOffers = moment.associated_offers || [];
  const primaryOffer = linkedOffers[0] || null;
  const hasRelationships = Boolean(moment.venue_slug || moment.scene_slug || hostId || linkedBrands.length || linkedOffers.length);
  const share = () => navigator.share?.({ title: moment.title, text: moment.description || undefined, url: window.location.href }).catch(() => undefined);

  return <main className="marketing-cinematic public-object-page min-h-screen bg-[#050505] text-white">
    <SEO title={`${moment.title} — PROMORANG Moment`} description={moment.description || `Open ${moment.title} on PROMORANG.`} image={moment.image_url || undefined} url={getSiteUrl(href)} />

    <section className="public-object-hero border-b border-white/10 px-5 pb-8 pt-12 sm:px-6 md:pb-10 md:pt-16">
      <CurrentArc variant="hero" className="marketing-hero-current" />
      <div className="relative mx-auto max-w-[1440px]">
        <div className="mb-5 flex items-center justify-between"><Link to="/discover/moments" className="inline-flex items-center gap-2 text-xs font-bold text-white/50 hover:text-white"><ArrowLeft className="h-4 w-4" />All Moments</Link><button type="button" onClick={share} className="grid h-10 w-10 place-items-center border border-white/15 bg-black/40"><Share2 className="h-4 w-4" /></button></div>
        <div className="grid overflow-hidden border border-white/10 bg-[#090909] lg:grid-cols-[1.08fr_.92fr_330px]">
          <div className="public-object-hero__media">{moment.image_url ? <img src={moment.image_url} alt="" /> : <div className="grid h-full min-h-[420px] place-items-center bg-[radial-gradient(circle_at_50%_20%,rgba(255,90,0,.18),transparent_40%),#0a0a0a]"><CalendarDays className="h-12 w-12 text-orange-400/35" /></div>}<span className="public-object-hero__state">{momentLifecycleLabel(moment.lifecycle)}</span></div>
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <p className="text-[9px] font-black uppercase tracking-[.16em] text-orange-300">{moment.category || "Moment"}</p>
            <h1 className="mt-4 text-4xl font-black leading-[.9] tracking-[-.05em] sm:text-5xl xl:text-6xl">{moment.title}</h1>
            {moment.description ? <p className="mt-5 text-sm leading-7 text-white/58">{moment.description}</p> : null}
            <div className="mt-6 grid gap-3 border-t border-white/10 pt-5 text-xs font-bold text-white/65">
              <span className="flex items-start gap-2"><CalendarDays className="mt-0.5 h-4 w-4 text-orange-400" />{formatDate(moment.starts_at)}</span>
              <span className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-orange-400" />{moment.venue_name || moment.location || "Location on Moment"}</span>
              {moment.participant_count > 0 ? <span className="flex items-center gap-2"><Users className="h-4 w-4 text-orange-400" />{moment.participant_count} participant{moment.participant_count === 1 ? "" : "s"}</span> : null}
            </div>
          </div>
          <aside className="border-t border-white/10 bg-black/35 p-6 lg:border-l lg:border-t-0">
            <p className="text-[9px] font-black uppercase tracking-[.16em] text-orange-300">Get in</p>
            <h2 className="mt-3 text-2xl font-black">Keep your place in this Moment.</h2>
            {moment.reward ? <div className="mt-5 border border-orange-400/25 bg-orange-500/[.08] p-4"><p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.14em] text-orange-300"><Gift className="h-3.5 w-3.5" />Access / perk</p><p className="mt-2 text-sm font-bold text-white/78">{moment.reward}</p></div> : null}
            <Link to={authHref} className="mt-5 inline-flex min-h-12 w-full items-center justify-between bg-orange-500 px-5 text-xs font-black uppercase tracking-[.08em] text-black">Keep on PromoCard <ArrowRight className="h-4 w-4" /></Link>
            <p className="mt-3 text-[10px] leading-5 text-white/35">Keeping this saves it to your PromoCard. It does not RSVP or claim anything for you.</p>
          </aside>
        </div>
      </div>
    </section>

    <nav className="public-object-tabs border-b border-white/10 bg-black/92 px-5 sm:px-6"><div className="mx-auto flex max-w-[1440px] gap-7 overflow-x-auto py-4 text-[10px] font-black uppercase tracking-[.12em] text-white/48"><a href="#about" className="text-orange-300">About</a>{moment.reward ? <a href="#access">Access</a> : null}<a href="#place">Place</a>{hasRelationships ? <a href="#around">Around</a> : null}{related.length ? <a href="#related">Related</a> : null}<a href="#more">More Moments</a></div></nav>

    <section id="about" className="px-5 py-14 sm:px-6 md:py-20"><div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[1fr_.75fr]">
      <div><p className="marketing-kicker">About</p><h2 className="mt-3 text-4xl font-black">What you should know.</h2><p className="mt-5 max-w-2xl text-base leading-8 text-white/58">{moment.description || "Check the place and time above, then decide whether this Moment is for you."}</p>{moment.associated_brand_names?.length ? <p className="mt-5 text-xs text-white/42">Associated: {moment.associated_brand_names.join(" · ")}</p> : null}</div>
      {moment.venue_slug ? <Link id="place" to={`/venues/${moment.venue_slug}`} className="group border border-white/10 bg-white/[.025] p-6 transition hover:border-orange-400/35"><p className="text-[9px] font-black uppercase tracking-[.15em] text-orange-300">Happening here</p><div className="mt-3 flex items-center justify-between gap-4"><h3 className="text-2xl font-black">{moment.venue_name || moment.location || "Location on Moment"}</h3><ArrowRight className="h-5 w-5 text-white/30 transition group-hover:text-orange-300" /></div><p className="mt-4 flex items-center gap-2 text-sm text-white/55"><Clock className="h-4 w-4 text-orange-400" />{formatDate(moment.starts_at)}</p>{moment.ends_at ? <p className="mt-2 text-xs text-white/38">Ends {formatDate(moment.ends_at)}</p> : null}</Link> : <div id="place" className="border border-white/10 bg-white/[.025] p-6"><p className="text-[9px] font-black uppercase tracking-[.15em] text-orange-300">Place & time</p><h3 className="mt-3 text-2xl font-black">{moment.venue_name || moment.location || "Location on Moment"}</h3><p className="mt-4 flex items-center gap-2 text-sm text-white/55"><Clock className="h-4 w-4 text-orange-400" />{formatDate(moment.starts_at)}</p>{moment.ends_at ? <p className="mt-2 text-xs text-white/38">Ends {formatDate(moment.ends_at)}</p> : null}</div>}
    </div></section>

    {moment.reward || primaryOffer ? <section id="access" className="border-y border-white/10 bg-[#090909] px-5 py-14 sm:px-6"><div className="mx-auto max-w-[1180px]"><p className="marketing-kicker"><Gift className="h-3.5 w-3.5" /> Access</p><div className="mt-5 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center"><div><h2 className="text-3xl font-black">{primaryOffer?.title || moment.reward}</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-white/48">{primaryOffer?.description || "Open the details, then continue if you want to claim or use what’s included."}</p></div><Link to={primaryOffer ? `/offers/${primaryOffer.id}` : authHref} className="inline-flex min-h-12 items-center gap-2 bg-orange-500 px-5 text-xs font-black uppercase tracking-[.08em] text-black">{primaryOffer ? "Open Offer" : "Continue"} <ArrowRight className="h-4 w-4" /></Link></div></div></section> : null}

    {hasRelationships ? <section id="around" className="border-b border-white/10 px-5 py-14 sm:px-6 md:py-18"><div className="mx-auto max-w-[1180px]"><div className="marketing-section-head"><div><p className="marketing-kicker">Around this Moment</p><h2 className="mt-3 text-4xl font-black">Keep exploring what connects to this Moment.</h2></div></div><div className="grid gap-3 md:grid-cols-3">{moment.venue_slug ? <Link to={`/venues/${moment.venue_slug}`} className="group border border-white/10 p-5 transition hover:border-orange-400/35"><p className="text-[9px] font-black uppercase tracking-[.14em] text-orange-300">Happening here</p><h3 className="mt-3 text-xl font-black">{moment.venue_name || "Open place"}</h3><div className="mt-5 flex items-center justify-between text-xs text-white/42"><span>Place</span><ArrowRight className="h-4 w-4 transition group-hover:text-orange-300" /></div></Link> : null}{moment.scene_slug ? <Link to={`/scenes/${moment.scene_slug}`} className="group border border-white/10 p-5 transition hover:border-orange-400/35"><p className="text-[9px] font-black uppercase tracking-[.14em] text-orange-300">In this Scene</p><h3 className="mt-3 text-xl font-black">{moment.scene_title || "Open Scene"}</h3><div className="mt-5 flex items-center justify-between text-xs text-white/42"><span>Scene</span><ArrowRight className="h-4 w-4 transition group-hover:text-orange-300" /></div></Link> : null}{hostId ? <Link to={`/profile/${hostId}`} className="group border border-white/10 p-5 transition hover:border-orange-400/35"><p className="text-[9px] font-black uppercase tracking-[.14em] text-orange-300">More from this host</p><h3 className="mt-3 text-xl font-black">Open host profile</h3><div className="mt-5 flex items-center justify-between text-xs text-white/42"><span>Person</span><ArrowRight className="h-4 w-4 transition group-hover:text-orange-300" /></div></Link> : null}{linkedOffers.map((offer) => <Link key={offer.id} to={`/offers/${offer.id}`} className="group border border-white/10 p-5 transition hover:border-orange-400/35"><p className="text-[9px] font-black uppercase tracking-[.14em] text-orange-300">Available with this Moment</p><h3 className="mt-3 text-xl font-black">{offer.title}</h3><div className="mt-5 flex items-center justify-between text-xs text-white/42"><span>Offer</span><ArrowRight className="h-4 w-4 transition group-hover:text-orange-300" /></div></Link>)}{linkedBrands.map((brand) => <Link key={brand.slug} to={`/brands/${brand.slug}`} className="group border border-white/10 p-5 transition hover:border-orange-400/35"><p className="text-[9px] font-black uppercase tracking-[.14em] text-orange-300">Made possible by</p><h3 className="mt-3 text-xl font-black">{brand.name}</h3><div className="mt-5 flex items-center justify-between text-xs text-white/42"><span>Brand</span><ArrowRight className="h-4 w-4 transition group-hover:text-orange-300" /></div></Link>)}</div></div></section> : null}

    {related.length ? <section id="related" className="px-5 py-14 sm:px-6 md:py-20"><div className="mx-auto max-w-[1440px]"><div className="marketing-section-head"><div><p className="marketing-kicker">Related</p><h2 className="mt-3 text-4xl font-black">More around this Moment.</h2></div></div><div className="public-object-related-grid">{related.map((item) => <MomentCard key={item.id} moment={item} />)}</div></div></section> : null}

    <section id="more" className="border-t border-white/10 px-5 py-14 sm:px-6 md:py-20"><div className="mx-auto max-w-[1440px]"><div className="marketing-section-head"><div><p className="marketing-kicker">Keep exploring</p><h2 className="mt-3 text-4xl font-black">Other Moments you might want to know about.</h2></div><Link to="/discover/moments" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.1em] text-orange-300">All Moments <ArrowRight className="h-4 w-4" /></Link></div>{more.length ? <div className="public-object-related-grid">{more.map((item) => <MomentCard key={item.id} moment={item} />)}</div> : <p className="text-sm text-white/45">No more Moments to show right now.</p>}</div></section>

    <section className="border-t border-white/10 bg-[#090909] px-5 py-10 sm:px-6"><div className="mx-auto flex max-w-[1180px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.15em] text-orange-300"><WalletCards className="h-3.5 w-3.5" />PromoCard</p><h2 className="mt-2 text-2xl font-black">Want to remember this?</h2><p className="mt-2 text-xs text-white/42">Keep the relationship. Come back when something actually changes.</p></div><Link to={authHref} className="inline-flex min-h-11 items-center gap-2 border border-orange-400/40 px-5 text-xs font-black uppercase tracking-[.08em] text-orange-300">Keep this Moment <ArrowRight className="h-4 w-4" /></Link></div></section>
  </main>;
}
