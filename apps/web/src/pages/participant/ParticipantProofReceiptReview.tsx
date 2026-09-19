import { useState } from "react";
import { ArrowLeft, Clock3, MapPin, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { CollectibleRelic, PaperReceipt } from "@/components/promorang/SignatureObjects";
import { PromorangSemanticMark } from "@/components/promorang/PromorangSemanticMark";

const aftrhrsImage = "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&dpr=1&w=1800";

type ProofState = "recorded" | "returned" | "kept";
const states: ProofState[] = ["recorded", "returned", "kept"];

const copy: Record<ProofState, { label: string; eyebrow: string; title: string; detail: string }> = {
  recorded: {
    label: "Recorded",
    eyebrow: "Your arrival came back",
    title: "You were there.",
    detail: "A real arrival was recorded at Sea Deck. That is enough to give you a receipt of the Moment without pretending anything else happened.",
  },
  returned: {
    label: "Returned",
    eyebrow: "Useful proof returned to you",
    title: "What happened now has a form you can keep.",
    detail: "The receipt remembers the Moment, place, Scene and arrival. A separate Wing Key validation can sit beside it without turning into a purchase claim.",
  },
  kept: {
    label: "Kept",
    eyebrow: "Part of your trail",
    title: "The night ended. Your history did not.",
    detail: "Kept proof can become part of your personal trail and, when the product rules allow it, provenance for a Piece or another useful return.",
  },
};

function ReviewSwitcher({ state, onChange }: { state: ProofState; onChange: (state: ProofState) => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 hidden rounded-full border border-white/10 bg-black/82 p-1.5 shadow-[0_20px_70px_rgba(0,0,0,.45)] backdrop-blur-xl lg:flex">
      {states.map((item) => <button key={item} type="button" onClick={() => onChange(item)} className={`rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-[.12em] ${state === item ? "bg-[#eadcc6] text-black" : "text-white/40"}`}>{copy[item].label}</button>)}
    </div>
  );
}

export default function ParticipantProofReceiptReview() {
  const [state, setState] = useState<ProofState>("returned");
  const meta = copy[state];
  const kept = state === "kept";

  return (
    <main className="min-h-screen bg-[#080809] text-white">
      <SEO title="AFTRHRS kept proof — Participant Next" description="Illustrative participant receipt and kept-proof convergence review." />
      <ReviewSwitcher state={state} onChange={setState} />

      <section className="relative min-h-[500px] overflow-hidden border-b border-white/10">
        <img src={aftrhrsImage} alt="Illustrative AFTRHRS Moment" className={`absolute inset-0 h-full w-full object-cover transition ${kept ? "grayscale-[.25] opacity-45" : "opacity-58"}`} />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#080809_8%,rgba(8,8,9,.6)_48%,#080809_100%)]" />
        <div className="relative mx-auto grid min-h-[500px] max-w-[1500px] gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_.8fr] lg:items-center lg:px-10">
          <div>
            <Link to="/moment/aftrhrs" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/12 bg-black/25 px-4 text-xs font-black backdrop-blur"><ArrowLeft className="h-4 w-4"/>AFTRHRS</Link>
            <div className="mt-12 flex items-center gap-3"><PromorangSemanticMark kind={kept ? "kept" : "return"} size={40}/><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#ff9a4d]">{meta.eyebrow}</p></div>
            <h1 className="mt-4 max-w-3xl font-serif text-[3.6rem] font-bold leading-[.88] tracking-[-.055em] sm:text-[4.8rem]">{meta.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/56">{meta.detail}</p>
            <div className="mt-7 flex flex-wrap gap-4 text-xs font-bold text-white/55"><span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[#ff9a4d]"/>Sea Deck · Barbican</span><span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#f6c453]"/>Arrival · 10:42 PM</span></div>
          </div>

          <div className="relative mx-auto w-full max-w-md pb-10">
            <PaperReceipt
              className="relative z-20 mx-auto w-[84%] -rotate-1 shadow-[0_30px_90px_rgba(0,0,0,.48)]"
              heading="YOU WERE HERE"
              pictures={[{ kind: "moment", title: "AFTRHRS", url: aftrhrsImage }]}
              lines={[
                { label: "Moment", value: "AFTRHRS", strong: true },
                { label: "Place", value: "Sea Deck · Barbican" },
                { label: "Scene", value: "Kingston After Dark" },
                { label: "Arrival", value: "Recorded · 10:42 PM" },
                { label: "Wing Key", value: "Validated separately" },
                { label: "Purchase", value: "Not implied" },
              ]}
              footer={kept ? "Kept in your trail. This receipt remembers what was actually recorded." : "This came back because a real arrival was recorded. Nothing more is assumed."}
            />
            {state !== "recorded" ? <div className="absolute -bottom-1 left-0 z-10 w-[48%] rotate-[-4deg] rounded-[32%_10%_28%_12%] border border-[#ff6a00]/18 bg-[#17100b] p-4"><PromorangSemanticMark kind="return" size={28}/><p className="mt-2 text-[9px] font-black uppercase tracking-[.15em] text-[#ff9a4d]">Returned proof</p><p className="mt-1 font-serif text-lg font-bold">AFTRHRS · Sep 18</p></div> : null}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1500px] px-5 pb-24 sm:px-8 lg:px-10">
        <section className="grid gap-10 border-b border-white/10 py-11 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div><p className="text-[10px] font-black uppercase tracking-[.17em] text-[#f6c453]">What this receipt means</p><h2 className="mt-2 font-serif text-4xl font-bold">Proof should feel useful, not bureaucratic.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-white/46">You do not need the operator's review queue, evidence strength labels or audit controls. You need a truthful object that tells you what PROMORANG knows happened and what it can safely remember.</p></div>
          <div className="relative min-h-[250px] overflow-hidden rounded-[48%_52%_44%_56%/58%_42%_58%_42%] border border-[#ff6a00]/12 bg-[radial-gradient(circle_at_30%_30%,rgba(255,106,0,.13),transparent_30%),#0c0c0d] p-8"><p className="text-[9px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Kingston After Dark</p><h3 className="mt-3 font-serif text-3xl font-bold">The Scene remembers the Moment around you.</h3><p className="mt-4 max-w-xl text-sm leading-6 text-white/42">Your receipt can reconnect to the Scene, place and future openings without converting attendance into spend, status or value that was never recorded.</p></div>
        </section>

        {kept ? <section className="grid gap-8 py-12 lg:grid-cols-[.7fr_1.3fr] lg:items-center"><CollectibleRelic className="max-w-md rotate-1" serial="0118" title="Barbican Night Signal" origin="Possible provenance from verified movement through AFTRHRS." perk="The receipt can support provenance; it does not automatically mint or award a Piece." scene="Kingston After Dark" place="Barbican" verifiedDate="Sep 18"/><div><div className="flex items-center gap-3"><Sparkles className="h-5 w-5 text-purple-300"/><p className="text-[10px] font-black uppercase tracking-[.17em] text-purple-300">Kept possibility</p></div><h2 className="mt-3 font-serif text-4xl font-bold">Proof can become provenance without becoming fiction.</h2><p className="mt-4 max-w-2xl text-sm leading-6 text-white/46">A kept receipt may support a future Piece, recommendation or return when the real product rules permit it. The receipt itself remains the evidence of what happened.</p></div></section> : null}
      </div>
    </main>
  );
}
