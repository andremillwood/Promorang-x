import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, MapPin, Share2, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { CollectibleRelic, PaperReceipt, TicketPass } from "@/components/promorang/SignatureObjects";
import { PromorangSemanticMark } from "@/components/promorang/PromorangSemanticMark";

const aftrhrsImage = "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&dpr=1&w=1800";

type MomentStage = "before" | "ready" | "arriving" | "attended" | "kept";

const stageOrder: MomentStage[] = ["before", "ready", "arriving", "attended", "kept"];

const stageCopy: Record<MomentStage, {
  label: string;
  heroState: string;
  eyebrow: string;
  cta: string;
  ctaHref: string;
  secondary: string;
  accessTitle: string;
  accessCopy: string;
}> = {
  before: {
    label: "Before",
    heroState: "Moment · Open",
    eyebrow: "Tonight is forming",
    cta: "Get access",
    ctaHref: "/card/promokey",
    secondary: "Save Moment",
    accessTitle: "Decide if this is worth moving toward.",
    accessCopy: "See the place, the room, what opens it and what you can carry into the night. Nothing at the door has happened yet.",
  },
  ready: {
    label: "Ready",
    heroState: "Moment · Ready",
    eyebrow: "Your access is ready",
    cta: "View your pass",
    ctaHref: "/card/promokey",
    secondary: "Share Moment",
    accessTitle: "You have what you need for tonight.",
    accessCopy: "Your pass gets you to the door. Your Wing Key carries a separate benefit. They travel with the same Moment, but they are not the same object.",
  },
  arriving: {
    label: "Arriving",
    heroState: "Moment · Arriving",
    eyebrow: "You are at the boundary",
    cta: "Present your pass",
    ctaHref: "/card/promokey",
    secondary: "Open directions",
    accessTitle: "The door is the real boundary.",
    accessCopy: "Being interested, holding a pass and standing outside are not attendance. The Moment changes only when a valid arrival is recorded.",
  },
  attended: {
    label: "Attended",
    heroState: "Moment · You were here",
    eyebrow: "Arrival recorded",
    cta: "See what was recorded",
    ctaHref: "/vault",
    secondary: "Keep exploring",
    accessTitle: "Now the Moment can give something back.",
    accessCopy: "Your arrival is part of the Moment history. A receipt can return to you, a Piece can emerge, and the Scene can remember that you moved through it.",
  },
  kept: {
    label: "Kept",
    heroState: "Moment · Kept",
    eyebrow: "Part of your trail",
    cta: "Open kept Moment",
    ctaHref: "/vault",
    secondary: "Return to the Scene",
    accessTitle: "The night is over. The useful residue remains.",
    accessCopy: "You no longer need a live-event page. What remains is your proof, the Scene it belonged to, what you kept, and what PROMORANG can return to you next.",
  },
};

const journey = [
  { label: "DISCOVER", detail: "You find something worth moving toward.", kind: "explore" as const },
  { label: "ACCESS", detail: "A Pass or PromoKey gets you ready.", kind: "move" as const },
  { label: "ARRIVE", detail: "The real-world boundary is crossed.", kind: "proof" as const },
  { label: "PROVE", detail: "What happened can now return as evidence.", kind: "return" as const },
  { label: "KEEP", detail: "Useful residue remains in your trail.", kind: "kept" as const },
];

function ReviewStateSwitcher({ stage, onChange }: { stage: MomentStage; onChange: (stage: MomentStage) => void }) {
  return (
    <div className="fixed bottom-5 left-1/2 z-50 hidden -translate-x-1/2 rounded-full border border-white/10 bg-black/80 p-1.5 shadow-[0_18px_60px_rgba(0,0,0,.45)] backdrop-blur-xl lg:flex" aria-label="Illustrative Moment state switcher">
      {stageOrder.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={`rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] transition ${stage === item ? "bg-[#eadcc6] text-black" : "text-white/45 hover:text-white"}`}
        >
          {stageCopy[item].label}
        </button>
      ))}
    </div>
  );
}

export default function ParticipantMomentReview() {
  const [stage, setStage] = useState<MomentStage>("ready");
  const copy = stageCopy[stage];
  const stageIndex = stageOrder.indexOf(stage);
  const hasArrival = stageIndex >= stageOrder.indexOf("attended");
  const isKept = stage === "kept";

  return (
    <main className="min-h-screen bg-[#080809] text-white">
      <SEO title="AFTRHRS Moment — Participant Next" description="Illustrative participant Moment convergence review." />
      <ReviewStateSwitcher stage={stage} onChange={setStage} />

      <section className={`relative min-h-[620px] overflow-hidden border-b border-white/10 transition-all duration-700 ${isKept ? "grayscale-[.22]" : ""}`}>
        <img src={aftrhrsImage} alt="Illustrative house music Moment" className="absolute inset-0 h-full w-full object-cover" />
        <div className={`absolute inset-0 transition-all duration-700 ${isKept ? "bg-[linear-gradient(180deg,rgba(0,0,0,.4),rgba(0,0,0,.42)_35%,#080809_96%)]" : "bg-[linear-gradient(180deg,rgba(0,0,0,.12),rgba(0,0,0,.22)_35%,#080809_96%)]"}`} />
        <div className={`absolute inset-0 transition-opacity duration-700 ${hasArrival ? "opacity-40" : "opacity-100"} bg-[radial-gradient(circle_at_68%_28%,rgba(255,106,0,.2),transparent_28%)]`} />

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
              <span className="rounded-full bg-[#ff6a00] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.15em] text-black">{copy.heroState}</span>
              <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.15em]">Kingston After Dark</span>
            </div>
            <p className="mt-5 text-xs font-black uppercase tracking-[.18em] text-white/64">Sea Deck · Barbican</p>
            <h1 className="mt-2 font-serif text-[3.4rem] font-bold leading-[.86] tracking-[-.055em] sm:text-[4.6rem] lg:text-[5.6rem]">AFTRHRS</h1>
            <p className="mt-4 max-w-2xl text-lg leading-7 text-white/72">Some nights should not end when they are supposed to. House music, late movement and one more place in Kingston.</p>

            <div className="mt-6 flex flex-wrap gap-3 text-xs font-bold text-white/75">
              <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#f6c453]" /> Tonight · 10 PM until</span>
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[#ff9a4d]" /> Sea Deck · Orchid Village Plaza</span>
              <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-[#b58cff]" /> {hasArrival ? "You moved through this room" : "Room forming"}</span>
            </div>

            <p className="mt-6 text-[10px] font-black uppercase tracking-[.18em] text-[#ff9a4d]">{copy.eyebrow}</p>
            <div className="mt-3 flex max-w-2xl flex-col gap-3 sm:flex-row">
              <Link to={copy.ctaHref} className="flex min-h-12 flex-1 items-center justify-between rounded-full bg-[#f6c453] px-5 text-sm font-black text-black">
                {copy.cta} <ArrowRight className="h-4 w-4" />
              </Link>
              <button type="button" className="min-h-12 rounded-full border border-white/18 bg-black/20 px-5 text-sm font-black backdrop-blur">{copy.secondary}</button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1500px] px-5 pb-24 sm:px-8 lg:px-10">
        <section className="grid gap-8 border-b border-white/10 py-9 lg:grid-cols-[1fr_.9fr] lg:items-center lg:py-12">
          <div>
            <div className="flex items-center gap-3"><PromorangSemanticMark kind={hasArrival ? "return" : "move"} size={34} /><div><p className="text-[10px] font-black uppercase tracking-[.17em] text-[#ff9a4d]">{copy.eyebrow}</p><h2 className="mt-1 max-w-2xl font-serif text-3xl font-bold lg:text-4xl">{copy.accessTitle}</h2></div></div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/50">{copy.accessCopy}</p>
          </div>

          {hasArrival ? (
            <div className="relative mx-auto w-full max-w-xl pb-7 lg:pb-2">
              <PaperReceipt
                className="relative z-20 ml-auto w-[82%] -rotate-1 shadow-[0_28px_80px_rgba(0,0,0,.42)]"
                heading="YOU WERE HERE"
                lines={[
                  { label: "Moment", value: "AFTRHRS", strong: true },
                  { label: "Place", value: "Sea Deck · Barbican" },
                  { label: "Arrival", value: "Recorded · 10:42 PM" },
                  { label: "Scene", value: "Kingston After Dark" },
                ]}
                footer={isKept ? "Kept in your trail. History remains even after the live Moment closes." : "A valid arrival can now return to you as durable proof."}
              />
              <div className="absolute bottom-0 left-0 z-10 w-[42%] -rotate-3 rounded-[28%_8%_28%_8%] border border-purple-300/15 bg-[#16111a] p-4 shadow-[0_18px_50px_rgba(0,0,0,.35)]">
                <p className="font-mono text-[9px] tracking-[.16em] text-purple-200/65">KEPT POSSIBILITY</p>
                <p className="mt-2 font-serif text-lg font-bold">Barbican Night Signal</p>
              </div>
            </div>
          ) : (
            <TicketPass kicker="AFTRHRS · TONIGHT" title="DIGITAL PASS" detail="Sea Deck · present at the door. This gets you to the boundary; arrival is written only after a valid door event." stub="M0918-084" stubLabel="ACCESS" imageUrl={aftrhrsImage} imageAlt="AFTRHRS Moment" />
          )}
        </section>

        <section className="py-10">
          <p className="text-[10px] font-black uppercase tracking-[.17em] text-[#ff9a4d]">Your path through the Moment</p>
          <h2 className="mt-2 font-serif text-3xl font-bold">It changes because you do.</h2>
          <div className="relative mt-8 grid gap-0 lg:grid-cols-5">
            <div className="absolute left-[8%] right-[8%] top-[23px] hidden h-px bg-gradient-to-r from-[#ff6a00]/10 via-[#f6c453]/55 to-[#b58cff]/20 lg:block" />
            {journey.map((step, index) => {
              const reached = index <= stageIndex;
              return (
                <article key={step.label} className={`relative border-l px-5 py-4 transition-opacity lg:border-l-0 lg:px-4 lg:pt-12 ${reached ? "border-white/16 opacity-100" : "border-white/5 opacity-35"}`}>
                  <div className="absolute -left-[17px] top-4 grid h-8 w-8 place-items-center rounded-full bg-[#080809] lg:left-4 lg:top-2"><PromorangSemanticMark kind={step.kind} size={28} /></div>
                  <p className="text-[9px] font-black tracking-[.15em] text-white/30">0{index + 1}</p>
                  <h3 className="mt-2 text-xs font-black tracking-[.12em] text-[#f6c453]">{step.label}</h3>
                  <p className="mt-2 text-xs leading-5 text-white/44">{step.detail}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="relative min-h-[460px] overflow-hidden border-y border-white/10 py-10 lg:min-h-[510px]">
          <div className="absolute -left-[8%] top-10 h-[330px] w-[58%] rounded-[48%_52%_41%_59%/58%_39%_61%_42%] border border-[#ff6a00]/10 bg-[radial-gradient(circle_at_34%_28%,rgba(255,106,0,.14),transparent_25%),radial-gradient(circle_at_68%_68%,rgba(181,140,255,.10),transparent_28%),#0b0b0c]" />
          <div className="absolute left-[9%] top-[92px] hidden h-[190px] w-[190px] rounded-full border border-dashed border-white/8 lg:block" />
          <div className="absolute left-[29%] top-[138px] hidden h-[120px] w-[120px] rounded-full border border-dashed border-white/8 lg:block" />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div className="max-w-xl py-6 lg:pl-10">
              <PromorangSemanticMark kind="explore" size={36} />
              <p className="mt-5 text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Scene · the room around the Moment</p>
              <h3 className="mt-2 font-serif text-4xl font-bold">Kingston After Dark</h3>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/48">AFTRHRS is one occurrence inside a larger cultural territory. Other Moments, places, people and kept history can return through the same Scene.</p>
              <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[.12em] text-white/45">
                <span className="rounded-full border border-white/10 px-3 py-2">Sea Deck</span>
                <span className="rounded-full border border-white/10 px-3 py-2">House music</span>
                <span className="rounded-full border border-white/10 px-3 py-2">Barbican</span>
                <span className="rounded-full border border-white/10 px-3 py-2">What forms next</span>
              </div>
            </div>

            <div className="relative mx-auto h-[380px] w-full max-w-[560px]">
              <article className="absolute left-[4%] top-[28px] z-20 h-[320px] w-[245px] [clip-path:polygon(18%_0,82%_0,100%_18%,100%_100%,0_100%,0_18%)] bg-[linear-gradient(160deg,#17130d,#0e0e0f_72%)] p-7 pt-16 shadow-[0_30px_80px_rgba(0,0,0,.5)] sm:w-[270px]">
                <div className="absolute left-1/2 top-5 h-8 w-8 -translate-x-1/2 rounded-full border border-[#f6c453]/30 shadow-[inset_0_0_0_8px_#080809]" />
                <p className="text-[9px] font-black uppercase tracking-[.18em] text-[#f6c453]">PromoKey · benefit entitlement</p>
                <h3 className="mt-4 font-serif text-2xl font-bold">AFTRHRS Wing Key</h3>
                <p className="mt-3 text-sm leading-6 text-white/48">Complimentary wings during the Moment window.</p>
                <p className="absolute bottom-7 left-7 right-7 border-t border-[#f6c453]/15 pt-4 text-[10px] font-bold text-[#f6c453]/70">Perk: complimentary wings<br />Not entry. Not payment.</p>
              </article>

              <div className="absolute right-[3%] top-[66px] z-10 w-[56%] rotate-2 opacity-90">
                {hasArrival ? (
                  <PaperReceipt
                    heading="MOMENT PROOF"
                    lines={[
                      { label: "Arrival", value: "Verified", strong: true },
                      { label: "Moment", value: "AFTRHRS" },
                      { label: "Place", value: "Sea Deck" },
                    ]}
                    footer="What happened can return without turning into another dashboard card."
                  />
                ) : (
                  <div className="min-h-[260px] rounded-[42%_11%_38%_14%/16%_45%_18%_40%] border border-white/8 bg-[#0d0d0e] p-6 pt-10">
                    <PromorangSemanticMark kind="kept" size={30} />
                    <p className="mt-5 text-[9px] font-black uppercase tracking-[.15em] text-[#b58cff]">Not written yet</p>
                    <h3 className="mt-2 font-serif text-2xl font-bold">Proof waits for reality.</h3>
                    <p className="mt-3 text-sm leading-6 text-white/45">Holding access does not create an attendance record. Something must actually happen first.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-11">
          <div className="flex items-start gap-3"><PromorangSemanticMark kind="proof" size={38} /><div><p className="text-[10px] font-black uppercase tracking-[.17em] text-[#ff9a4d]">How your status changes</p><h2 className="mt-1 font-serif text-3xl font-bold">Your pass gets you to the door. You become attended when you arrive.</h2></div></div>
          <div className="mt-7 grid gap-5 lg:grid-cols-4">
            {[
              ["Thinking about it", "RSVP", "You said you may come."],
              ["You are in", "PASS", "You hold a right to cross the access boundary."],
              ["At the door", "PRESENTED", "The venue checks that access."],
              ["You made it", "ARRIVED", "Your presence can now be recorded."],
            ].map(([title, label, detail], index) => {
              const reached = stageIndex >= Math.min(index, 2);
              return (
                <div key={label} className={`relative border-t pt-5 ${reached ? "border-[#f6c453]/45" : "border-white/10"}`}>
                  <span className={`absolute -top-1.5 left-0 h-3 w-3 rounded-full ${reached ? "bg-[#f6c453]" : "border border-white/20 bg-[#080809]"}`} />
                  <p className="text-[9px] font-black tracking-[.14em] text-white/28">0{index + 1} · {label}</p>
                  <h3 className="mt-2 font-serif text-xl font-bold">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-white/42">{detail}</p>
                </div>
              );
            })}
          </div>
        </section>

        {isKept ? (
          <section className="grid gap-7 border-t border-white/10 py-11 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
            <CollectibleRelic
              className="max-w-md rotate-1"
              serial="0118"
              title="Barbican Night Signal"
              origin="Created from verified movement through a Kingston After Dark Moment."
              perk="The Moment ended. The provenance did not."
              scene="Kingston After Dark"
              place="Barbican"
              verifiedDate="Sep 18"
            />
            <div>
              <div className="flex items-center gap-3"><Sparkles className="h-5 w-5 text-[#b58cff]" /><p className="text-[10px] font-black uppercase tracking-[.17em] text-[#b58cff]">What comes back</p></div>
              <h2 className="mt-3 max-w-2xl font-serif text-4xl font-bold">A kept Moment should make the next move more useful.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/48">PROMORANG can now understand that this Scene, place and kind of Moment mattered to you. The return is not another KPI. It is better access, better recommendations and a trail you can actually keep.</p>
              <div className="mt-6 inline-flex items-center gap-2 text-xs font-black text-[#f6c453]"><CheckCircle2 className="h-4 w-4" /> History retained without pretending everything became value.</div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
