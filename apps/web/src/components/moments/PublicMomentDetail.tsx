import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, Clock, Gift, MapPin, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import SEO from "@/components/SEO";
import { useCanonicalMomentFeed } from "@/hooks/useCanonicalMomentFeed";
import { CurrentArc } from "@/components/marketing/MarketingPhysics";
import { PromoCardFace, PaperReceipt, TicketPass } from "@/components/promorang/SignatureObjects";
import { momentLifecycleLabel } from "@/services/moment-feed";
import { getSiteUrl } from "@/lib/discovery";

function formatDate(value?: string | null) {
  if (!value) return "Time held on the Moment";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time held on the Moment";
  return new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

export function PublicMomentDetail() {
  const { id } = useParams<{ id: string }>();
  const query = useCanonicalMomentFeed();
  const moment = (query.data?.moments || []).find((item) => item.id === id || item.slug === id) || null;

  if (query.isLoading) return <main className="grid min-h-screen place-items-center bg-[#050505] text-white"><div className="h-9 w-9 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" /></main>;

  if (query.isError) {
    return <main className="grid min-h-screen place-items-center bg-[#050505] px-6 text-center text-white"><div className="max-w-xl"><CalendarDays className="mx-auto h-9 w-9 text-orange-400" /><h1 className="mt-5 text-4xl font-black">Moment unavailable</h1><p className="mt-3 text-sm leading-6 text-white/50">PROMORANG cannot confirm this Moment from the canonical public feed right now. No demo record is being substituted.</p><Link to="/discover/moments" className="mt-6 inline-flex items-center gap-2 font-black text-orange-300"><ArrowLeft className="h-4 w-4" />Back to Moments</Link></div></main>;
  }

  if (!moment) {
    return <main className="grid min-h-screen place-items-center bg-[#050505] px-6 text-center text-white"><div className="max-w-xl"><CalendarDays className="mx-auto h-9 w-9 text-orange-400" /><h1 className="mt-5 text-4xl font-black">This is not a current public Moment.</h1><p className="mt-3 text-sm leading-6 text-white/50">The URL does not resolve inside the canonical public Moment window. PROMORANG is not filling the gap with a curated or example event.</p><Link to="/discover/moments" className="mt-6 inline-flex items-center gap-2 font-black text-orange-300"><ArrowLeft className="h-4 w-4" />Browse current Moments</Link></div></main>;
  }

  const href = `/moments/${moment.slug || moment.id}`;
  const authHref = `/auth?mode=signup&next=${encodeURIComponent(href)}`;

  return (
    <main className="marketing-cinematic public-moment-detail min-h-screen bg-[#050505] text-white">
      <SEO title={`${moment.title} — PROMORANG Moment`} description={moment.description || `Open ${moment.title} on PROMORANG.`} image={moment.image_url || undefined} url={getSiteUrl(href)} />

      <section className="marketing-cinematic-hero public-moment-detail__hero border-b border-white/10 px-5 pb-14 pt-14 sm:px-6 md:pb-20 md:pt-20" style={moment.image_url ? { backgroundImage: `url("${moment.image_url}")` } : undefined}>
        <CurrentArc variant="hero" className="marketing-hero-current" />
        <div className="relative mx-auto flex min-h-[38rem] max-w-[1440px] items-end">
          <div className="grid w-full gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <Link to="/discover/moments" className="inline-flex items-center gap-2 text-xs font-black text-white/55 hover:text-white"><ArrowLeft className="h-4 w-4" />All Moments</Link>
              <div className="mt-8 flex flex-wrap gap-2"><span className="public-moment-poster__state !static">{momentLifecycleLabel(moment.lifecycle)}</span>{moment.category ? <span className="border border-white/15 bg-black/50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[.14em] text-orange-300">{moment.category}</span> : null}</div>
              <h1 className="mt-5 max-w-[11ch] text-5xl font-black leading-[.88] tracking-[-.055em] sm:text-7xl lg:text-[6rem]">{moment.title}</h1>
              {moment.description ? <p className="mt-6 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">{moment.description}</p> : null}
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-white/62"><span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-orange-400" />{formatDate(moment.starts_at)}</span><span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-orange-400" />{moment.venue_name || moment.location || "Location on Moment"}</span></div>
            </div>

            <aside className="border-t border-white/20 bg-black/45 p-5 backdrop-blur-md">
              <p className="text-[9px] font-black uppercase tracking-[.18em] text-orange-300">Your next move</p>
              <h2 className="mt-3 text-2xl font-black">Keep this Moment connected to you.</h2>
              <p className="mt-3 text-xs leading-6 text-white/52">Sign in continues back to this exact Moment. It does not count as attendance, proof, claim or redemption.</p>
              {moment.reward ? <div className="mt-5 border-l-2 border-orange-500 bg-orange-500/[.08] p-3"><p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.14em] text-orange-300"><Gift className="h-3.5 w-3.5" />Recorded access / perk</p><p className="mt-2 text-sm font-bold text-white/78">{moment.reward}</p></div> : null}
              <Link to={authHref} className="mt-5 inline-flex min-h-12 w-full items-center justify-between rounded-md bg-orange-500 px-5 text-xs font-black uppercase tracking-[.08em] text-black">Continue with PromoCard <ArrowRight className="h-4 w-4" /></Link>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-14 sm:px-6 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          <TicketPass kicker="Moment" title="Something real is available" detail="A Moment is distinct supply with its own time, place and operator-defined conditions." stub="OPEN" stubLabel="Supply" />
          <TicketPass kicker="Participation" title="Intent is not attendance" detail="Saving, signing in or expressing interest does not prove you arrived or completed the expected action." stub="ACT" stubLabel="Next" />
          <TicketPass kicker="After" title="Proof can become history" detail="When the required evidence exists, the verified consequence can return to PromoCard rather than disappearing." stub="KEEP" stubLabel="Proof" />
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#090909] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div>
            <p className="marketing-kicker"><WalletCards className="h-3.5 w-3.5" /> The Return</p>
            <h2 className="mt-3 text-4xl font-black sm:text-5xl">The useful consequence should come back to you.</h2>
            <p className="mt-4 text-sm leading-7 text-white/55">PromoCard is where watching, issued access and verified history can remain connected. It never upgrades an unverified action into proof.</p>
            <PaperReceipt heading="Moment truth" lines={[{label:"Moment",value:"Supply",strong:true},{label:"Interest / RSVP",value:"Intent"},{label:"Check-in / approved evidence",value:"Proof"},{label:"PromoCard",value:"Continuity",strong:true}]} footer="Each state advances only when its own source-backed record exists." />
          </div>
          <PromoCardFace holder="Your PromoCard" available={moment.reward || "Keep your place in this Moment"} limit="Watching · Access · Kept" places={moment.venue_name || moment.location || "This Moment stays connected to its recorded place and time."} action="See what changed" variant="membership" interactive={false} />
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-4xl text-center"><ShieldCheck className="mx-auto h-6 w-6 text-orange-300" /><h2 className="mt-4 text-3xl font-black">Open the Moment. Keep the truth.</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/50">Moment ≠ attendance · RSVP ≠ attendance · perk shown ≠ issuance · claim ≠ redemption · proof submission ≠ verification.</p><Link to={authHref} className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-md bg-orange-500 px-6 text-xs font-black uppercase tracking-[.08em] text-black">Continue with PromoCard <ArrowRight className="h-4 w-4" /></Link></div>
      </section>
    </main>
  );
}
