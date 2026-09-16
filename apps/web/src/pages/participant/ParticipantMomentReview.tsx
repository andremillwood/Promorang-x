import { ArrowLeft, ArrowRight, Clock3, MapPin, Share2, Ticket, Users } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { TicketPass } from "@/components/promorang/SignatureObjects";
import { PromorangSemanticMark } from "@/components/promorang/PromorangSemanticMark";

const aftrhrsImage = "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&dpr=1&w=1800";

const journey = [
  { label: "DISCOVER", detail: "You found a Moment worth considering.", kind: "explore" as const },
  { label: "ACCESS", detail: "A pass or PromoKey gets you ready.", kind: "move" as const },
  { label: "ARRIVE", detail: "Door validation turns intent into arrival.", kind: "proof" as const },
  { label: "RETURN", detail: "What happened comes back as proof.", kind: "return" as const },
  { label: "KEPT", detail: "The Moment remains in your trail.", kind: "kept" as const },
];

export default function ParticipantMomentReview() {
  return (
    <main className="min-h-screen bg-[#080809] text-white">
      <SEO title="AFTRHRS Moment — Participant Next" description="Illustrative participant Moment convergence review." />

      <section className="relative min-h-[620px] overflow-hidden border-b border-white/10">
        <img src={aftrhrsImage} alt="Illustrative house music Moment" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.12),rgba(0,0,0,.22)_35%,#080809_96%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_28%,rgba(255,106,0,.2),transparent_28%)]" />

        <div className="relative mx-auto flex min-h-[620px] max-w-[1500px] flex-col justify-between px-5 pb-8 pt-6 sm:px-8 lg:px-10 lg:pb-12">
          <div className="flex items-center justify-between gap-4">
            <Link to="/discover" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-black/25 px-4 text-xs font-black backdrop-blur">
              <ArrowLeft className="h-4 w-4" /> Discover
            </Link>
            <button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/25 backdrop-blur" aria-label="Share Moment">
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#ff6a00] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.15em] text-black">Moment · Open</span>
              <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.15em]">Kingston After Dark</span>
            </div>
            <p className="mt-5 text-xs font-black uppercase tracking-[.18em] text-white/64">Sea Deck · Barbican</p>
            <h1 className="mt-2 font-serif text-[3.4rem] font-bold leading-[.86] tracking-[-.055em] sm:text-[4.6rem] lg:text-[5.6rem]">AFTRHRS</h1>
            <p className="mt-4 max-w-2xl text-lg leading-7 text-white/72">Some nights should not end when they are supposed to. House music, late movement and one more place in Kingston.</p>

            <div className="mt-6 flex flex-wrap gap-3 text-xs font-bold text-white/75">
              <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#f6c453]" /> Tonight · 10 PM until</span>
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[#ff9a4d]" /> Sea Deck · Orchid Village Plaza</span>
              <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-[#b58cff]" /> Room forming</span>
            </div>

            <div className="mt-7 flex max-w-2xl flex-col gap-3 sm:flex-row">
              <Link to="/card/promokey" className="flex min-h-12 flex-1 items-center justify-between rounded-full bg-[#f6c453] px-5 text-sm font-black text-black">
                Get ready for tonight <ArrowRight className="h-4 w-4" />
              </Link>
              <button type="button" className="min-h-12 rounded-full border border-white/18 bg-black/20 px-5 text-sm font-black backdrop-blur">Save Moment</button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1500px] px-5 pb-20 sm:px-8 lg:px-10">
        <section className="grid gap-6 border-b border-white/10 py-8 lg:grid-cols-[1.12fr_.88fr] lg:py-10">
          <div>
            <div className="flex items-center gap-3"><PromorangSemanticMark kind="move" size={34} /><div><p className="text-[10px] font-black uppercase tracking-[.17em] text-[#ff9a4d]">What opens this Moment</p><h2 className="mt-1 font-serif text-3xl font-bold">Access, without operator noise.</h2></div></div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/50">Participant sees only what matters to moving: where, when, what gets them in, what is attached, and what will remain afterward. Door queues, reconciliation and exception tooling stay with the Host.</p>
          </div>
          <TicketPass kicker="AFTRHRS · TONIGHT" title="DIGITAL PASS" detail="Sea Deck · present at door. RSVP intent becomes attendance only after a valid arrival is recorded." stub="M0918-084" stubLabel="ACCESS" imageUrl={aftrhrsImage} imageAlt="AFTRHRS Moment" />
        </section>

        <section className="py-9">
          <p className="text-[10px] font-black uppercase tracking-[.17em] text-[#ff9a4d]">The participant journey</p>
          <h2 className="mt-2 font-serif text-3xl font-bold">The same Moment changes as you move through it.</h2>
          <div className="relative mt-7 grid gap-0 lg:grid-cols-5">
            <div className="absolute left-[8%] right-[8%] top-[23px] hidden h-px bg-gradient-to-r from-[#ff6a00]/10 via-[#f6c453]/55 to-[#b58cff]/20 lg:block" />
            {journey.map((step, index) => (
              <article key={step.label} className="relative border-l border-white/10 px-5 py-4 lg:border-l-0 lg:px-4 lg:pt-12">
                <div className="absolute -left-[17px] top-4 grid h-8 w-8 place-items-center rounded-full bg-[#080809] lg:left-4 lg:top-2"><PromorangSemanticMark kind={step.kind} size={28} /></div>
                <p className="text-[9px] font-black tracking-[.15em] text-white/30">0{index + 1}</p>
                <h3 className="mt-2 text-xs font-black tracking-[.12em] text-[#f6c453]">{step.label}</h3>
                <p className="mt-2 text-xs leading-5 text-white/44">{step.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-5 border-y border-white/10 py-9 lg:grid-cols-3">
          <article className="relative overflow-hidden rounded-[44%_12%_38%_16%/18%_44%_18%_40%] border border-[#d49a35]/20 bg-[radial-gradient(circle_at_30%_20%,rgba(255,106,0,.14),transparent_26%),#0d0d0e] p-6">
            <PromorangSemanticMark kind="explore" size={32} />
            <p className="mt-5 text-[10px] font-black uppercase tracking-[.15em] text-[#ff9a4d]">Scene</p>
            <h3 className="mt-2 font-serif text-2xl font-bold">Kingston After Dark</h3>
            <p className="mt-2 text-sm leading-6 text-white/48">This Moment belongs to a larger cultural room, not an isolated event listing.</p>
          </article>

          <article className="relative min-h-[240px] [clip-path:polygon(14%_0,86%_0,100%_16%,100%_100%,0_100%,0_16%)] bg-[linear-gradient(160deg,#17130d,#0e0e0f_72%)] p-7 pt-12 shadow-[0_24px_60px_rgba(0,0,0,.35)]">
            <div className="absolute left-1/2 top-4 h-7 w-7 -translate-x-1/2 rounded-full border border-[#f6c453]/30 shadow-[inset_0_0_0_7px_#080809]" />
            <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#f6c453]">PromoKey</p>
            <h3 className="mt-3 font-serif text-2xl font-bold">AFTRHRS Wing Key</h3>
            <p className="mt-2 text-sm leading-6 text-white/48">Complimentary wings · valid during the Moment window. Access benefit, not payment.</p>
          </article>

          <article className="rounded-[1.6rem] border border-white/10 bg-[#0d0d0e] p-6">
            <PromorangSemanticMark kind="kept" size={32} />
            <p className="mt-5 text-[10px] font-black uppercase tracking-[.15em] text-[#b58cff]">What can remain</p>
            <h3 className="mt-2 font-serif text-2xl font-bold">Proof becomes history.</h3>
            <p className="mt-2 text-sm leading-6 text-white/48">A valid arrival can become a retained Moment receipt or memory. RSVP alone cannot.</p>
          </article>
        </section>

        <section className="py-9">
          <div className="flex items-start gap-3"><PromorangSemanticMark kind="proof" size={38} /><div><p className="text-[10px] font-black uppercase tracking-[.17em] text-[#ff9a4d]">Canonical truth boundary</p><h2 className="mt-1 font-serif text-3xl font-bold">Intent is not attendance.</h2></div></div>
          <div className="mt-6 grid gap-3 lg:grid-cols-4">
            {[['RSVP','Intent exists.'],['PASS','Access right exists.'],['PRESENTED','Door attempts validation.'],['ARRIVED','Attendance can now be written.']].map(([label, detail], index) => <div key={label} className="border-t border-white/12 py-4"><p className="text-[9px] font-black tracking-[.14em] text-white/28">0{index + 1}</p><p className="mt-2 text-xs font-black text-[#f6c453]">{label}</p><p className="mt-2 text-xs leading-5 text-white/42">{detail}</p></div>)}
          </div>
        </section>
      </div>
    </main>
  );
}
