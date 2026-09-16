import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CircleDollarSign,
  FileCheck2,
  MapPin,
  Network,
  PackageCheck,
  ScanLine,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

const hierarchy = [
  ["Organization", "ORG-FM-01", "Owns commitments, permissions and customer relationships."],
  ["Place", "PLC-NEWK-04", "Where service, attendance or validation can occur."],
  ["Campaign", "AC-5021", "Objective, audience, commitments, proof policy and governance."],
  ["Experience", "M-0918", "The public promise participants can discover and act on."],
  ["Action", "ACT-8821", "A booking, signal, RSVP, presentation, scan or purchase attempt."],
  ["Proof", "PRF-1182", "Evidence supporting or challenging what the action means."],
  ["Outcome", "OUT-1182", "A verified result derived from action + proof."],
  ["Relationship", "REL-2204", "Durable person↔organization/place/community history."],
  ["Incentive", "INC-4412", "Value, access, status, ticket, perk or collectible."],
  ["Distribution", "DST-2018", "How the opportunity reached the participant."],
  ["Learning", "LRN-5021", "Attribution, cohort behavior, benchmark and next action."],
] as const;

const chain = [
  { icon: Building2, label: "Brand commits", id: "AC-5021", kind: "canonical", text: "Outcome contract + proof policy" },
  { icon: Sparkles, label: "Experience published", id: "M-0918", kind: "canonical", text: "Participant-facing Moment" },
  { icon: UserRound, label: "Participant books", id: "ACT-8821", kind: "observed", text: "Intent recorded" },
  { icon: ScanLine, label: "Venue validates", id: "PRF-1182", kind: "verified", text: "Attendance evidence" },
  { icon: PackageCheck, label: "Outcome created", id: "OUT-1182", kind: "verified", text: "Verified attendance" },
  { icon: FileCheck2, label: "Evidence projected", id: "EP-5021", kind: "projection", text: "Brand/agency view" },
  { icon: ShieldCheck, label: "Admin correction", id: "AE-7712", kind: "audit", text: "Append-only override residue" },
] as const;

const projections = [
  ["Participant", "Proof Receipt", "What I did and what returned to me."],
  ["Creator", "Approval / Settlement", "Whether submitted work was accepted and settled."],
  ["Host", "Attendance Close", "Who was actually verified as present."],
  ["Merchant", "Validation Slip", "What entitlement was presented and validated."],
  ["Brand", "Evidence Pack", "Which outcomes are supported and with what limits."],
  ["Agency", "Managed Result Pack", "Client-owned evidence in managed context."],
  ["Admin", "Case + Audit", "Disputes, reversals and who changed downstream state."],
] as const;

const truthClasses = [
  ["Observed", "We saw an event or intent."],
  ["Attributed", "We can connect it to a source/campaign."],
  ["Verified", "Evidence supports that the outcome occurred."],
  ["Incremental", "A method supports that it would not otherwise have happened."],
] as const;

export function CanonicalEventGraphLab() {
  const [selected, setSelected] = useState(5);
  const [truth, setTruth] = useState(2);

  return (
    <div className="space-y-12">
      <header className="grid gap-6 lg:grid-cols-[1fr_.55fr] lg:items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.28em] text-[#ff6a00]">Canonical object + event architecture · system spine</p>
          <h2 className="mt-4 max-w-5xl font-serif text-5xl font-bold leading-[.9] tracking-[-.055em] sm:text-7xl">Views can change. Facts cannot.</h2>
        </div>
        <div className="border-l border-[#ff6a00]/30 pl-5">
          <p className="font-serif text-2xl font-bold text-[#f6d48a]">Object → action → proof → outcome → projection</p>
          <p className="mt-3 text-sm leading-6 text-white/45">The participant, merchant, creator, brand, agency and admin can all see different interfaces without forking the event history underneath them.</p>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[.72fr_1.28fr]">
        <div className="overflow-hidden border border-white/10 bg-[#0d0d0f]">
          <div className="border-b border-white/10 p-5"><p className="text-[10px] font-black uppercase tracking-[.17em] text-white/35">Canonical hierarchy</p></div>
          <div>{hierarchy.map(([name,id,desc],i)=>{
            const active=i===selected;
            return <button key={name} onClick={()=>setSelected(i)} className={`grid w-full grid-cols-[2rem_1fr_auto] gap-3 border-b border-white/7 p-4 text-left transition last:border-b-0 ${active?"bg-[#170c07]":"hover:bg-white/[.025]"}`} aria-pressed={active}>
              <span className={`grid h-8 w-8 place-items-center rounded-full border text-[10px] font-black ${active?"border-[#ff6a00]/45 text-[#ff8b3d]":"border-white/10 text-white/28"}`}>{i+1}</span>
              <span><b className={active?"text-white":"text-white/72"}>{name}</b><span className="mt-1 block text-xs leading-5 text-white/36">{desc}</span></span>
              <span className="font-mono text-[9px] text-white/25">{id}</span>
            </button>;
          })}</div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-[#ff6a00]/25 bg-[#130b07] p-7 sm:p-8">
            <div className="flex items-center justify-between gap-5"><div><p className="text-[10px] font-black uppercase tracking-[.17em] text-[#ff8b3d]">Selected canonical object</p><h3 className="mt-3 font-serif text-4xl font-bold">{hierarchy[selected][0]}</h3></div><Network className="h-8 w-8 text-[#ff6a00]"/></div>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-white/52">{hierarchy[selected][2]}</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">{[["Canonical ID",hierarchy[selected][1]],["History","Append / reconcile"],["View rule","Role-specific projection"]].map(([a,b])=><div key={a} className="border border-white/10 bg-black/20 p-4"><p className="text-[9px] font-black uppercase tracking-[.14em] text-white/28">{a}</p><p className="mt-2 text-sm font-bold text-white/78">{b}</p></div>)}</div>
          </div>

          <div className="border border-[#f1e5cf]/20 bg-[#f1e5cf] p-6 text-[#17130f]">
            <div className="flex items-start gap-4"><FileCheck2 className="mt-1 h-5 w-5 text-[#9d3f1f]"/><div><p className="font-mono text-[9px] uppercase tracking-[.2em] text-[#8a5e48]">EVENT CONTRACT · EV-001</p><h4 className="mt-2 font-serif text-2xl font-black">State changes need identity, actor, time, source, lineage and verification class.</h4><p className="mt-2 text-sm leading-6 text-black/56">Retries use idempotency. Corrections append audit/reversal events. A projection may be rebuilt; canonical event history must survive.</p></div></div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center gap-3"><BadgeCheck className="h-5 w-5 text-[#22c55e]"/><h3 className="font-serif text-3xl font-bold">One demand chain</h3></div>
        <div className="overflow-x-auto pb-2"><div className="flex min-w-[1240px] gap-3">{chain.map((item,i)=>{const Icon=item.icon;return <div key={item.id} className="min-w-[160px] flex-1 border border-white/10 bg-[#0d0d0f] p-5"><div className="flex items-center justify-between"><Icon className="h-5 w-5 text-[#ff6a00]"/><span className="font-mono text-[9px] text-white/25">{item.id}</span></div><p className="mt-5 text-[9px] font-black uppercase tracking-[.14em] text-white/30">{item.kind}</p><p className="mt-2 font-serif text-xl font-bold">{item.label}</p><p className="mt-2 text-xs leading-5 text-white/40">{item.text}</p>{i<chain.length-1&&<ArrowRight className="mt-5 h-4 w-4 text-white/18"/>}</div>})}</div></div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.12fr_.88fr]">
        <div className="overflow-hidden border border-white/10 bg-[#0d0d0f]">
          <div className="border-b border-white/10 p-5"><p className="text-[10px] font-black uppercase tracking-[.17em] text-white/35">Stakeholder projections over the same truth</p></div>
          <div className="grid gap-px bg-white/8 sm:grid-cols-2">{projections.map(([role,artifact,meaning])=><div key={role} className="bg-[#0b0b0c] p-5"><div className="flex items-center justify-between gap-3"><p className="text-[9px] font-black uppercase tracking-[.14em] text-[#ff8b3d]">{role}</p><span className="font-mono text-[9px] text-white/22">VIEW</span></div><p className="mt-2 font-serif text-xl font-bold">{artifact}</p><p className="mt-2 text-xs leading-5 text-white/40">{meaning}</p></div>)}</div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.75rem] border border-[#4cc6f0]/25 bg-[#071318] p-6"><div className="flex items-center gap-3"><CircleDollarSign className="h-5 w-5 text-[#4cc6f0]"/><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#4cc6f0]">Separate ledgers</p></div><p className="mt-4 text-sm leading-6 text-white/52">Gems, Points, named-draw Tickets, access/perks, Pieces, parked principal, prize commitments and payouts do not share one balance semantic.</p></div>
          <div className="rounded-[1.75rem] border border-[#22c55e]/25 bg-[#07120b] p-6"><div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-[#22c55e]"/><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#22c55e]">Relationship graph</p></div><p className="mt-4 text-sm leading-6 text-white/52">Verified interactions strengthen person↔organization/place/community relationships; role context never replaces ownership or consent.</p></div>
        </div>
      </section>

      <section className="space-y-5">
        <div><p className="text-[10px] font-black uppercase tracking-[.17em] text-[#f6c453]">Semantic metrics</p><h3 className="mt-2 font-serif text-3xl font-bold">How strong is the claim?</h3></div>
        <div className="grid gap-3 md:grid-cols-4">{truthClasses.map(([name,desc],i)=>{const active=i===truth;return <button key={name} onClick={()=>setTruth(i)} aria-pressed={active} className={`min-h-[132px] border p-5 text-left transition ${active?"border-[#f6c453]/45 bg-[#151006]":"border-white/10 bg-[#0d0d0f] hover:border-white/20"}`}><p className={`text-[10px] font-black uppercase tracking-[.15em] ${active?"text-[#f6c453]":"text-white/28"}`}>0{i+1}</p><p className="mt-4 font-serif text-2xl font-bold">{name}</p><p className="mt-2 text-xs leading-5 text-white/42">{desc}</p></button>})}</div>
        <div className="border border-white/10 bg-black/20 p-5 text-sm leading-6 text-white/48"><b className="text-white/80">Current class: {truthClasses[truth][0]}.</b> {truthClasses[truth][1]} The interface and analytics layer should never silently promote a weaker class into a stronger one.</div>
      </section>

      <section className="border border-[#ef4444]/25 bg-[#180909] p-6 sm:p-7">
        <div className="flex gap-4"><ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-[#f87171]"/><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#f87171]">Reversal invariant</p><h4 className="mt-2 font-serif text-3xl font-bold">Corrections append history. They do not rewrite reality.</h4><p className="mt-3 max-w-4xl text-sm leading-6 text-white/50">If PRF-1182 is disputed or reversed, Participant Proof, rewards, Brand Evidence, Agency results and settlement eligibility all reconcile from the correction event. The original scan remains in the audit chain with its changed interpretation.</p></div></div>
      </section>
    </div>
  );
}
