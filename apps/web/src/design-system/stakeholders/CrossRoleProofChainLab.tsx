import { useState } from "react";
import { ArrowRight, BadgeCheck, Building2, FileCheck2, Megaphone, ShieldCheck, Store, UserRound, WandSparkles } from "lucide-react";

const steps=[
  {role:"Brand",icon:Megaphone,title:"Activation committed",object:"AC-5021",truth:"Outcome, audience, reward inventory and proof contract become canonical."},
  {role:"Creator",icon:WandSparkles,title:"Distribution work accepted",object:"CB-0421",truth:"Creator sees only the brief and commitments that apply to their work."},
  {role:"Participant",icon:UserRound,title:"Test drive booked",object:"MOVE-8821",truth:"Booking proves intent. It does not yet prove attendance."},
  {role:"Merchant / Venue",icon:Store,title:"Attendance validated",object:"VL-1182",truth:"Venue validation upgrades intent into verified attendance."},
  {role:"Brand / Agency",icon:Building2,title:"Evidence pack updated",object:"EP-5021",truth:"Verified attendance can now support the activation result; unresolved claims remain separate."},
  {role:"Admin",icon:ShieldCheck,title:"Exception resolved",object:"EX-7712",truth:"If proof conflicts, intervention changes downstream state and writes an audit event."},
];

export function CrossRoleProofChainLab(){
  const [active,setActive]=useState(3);
  return <div className="space-y-10">
    <div className="grid gap-6 lg:grid-cols-[1fr_.55fr] lg:items-end"><div><p className="text-[10px] font-black uppercase tracking-[.28em] text-[#ff6a00]">Cross-role proof chain · system integrity study</p><h2 className="mt-4 max-w-5xl font-serif text-5xl font-bold leading-[.9] tracking-[-.05em] sm:text-7xl">One action. Many views. One truth.</h2></div><p className="border-l border-[#ff6a00]/30 pl-5 text-sm leading-6 text-white/45">The role experiences are allowed to look different. The underlying event identity, proof strength and audit history are not allowed to fork.</p></div>

    <div className="overflow-x-auto pb-2"><div className="flex min-w-[1120px] items-stretch gap-3">{steps.map((s,i)=>{const Icon=s.icon;const selected=i===active;return <button key={s.object} onClick={()=>setActive(i)} className={`min-w-[170px] flex-1 border p-5 text-left transition ${selected?"border-[#ff6a00]/50 bg-[#170c07]":"border-white/10 bg-[#0d0d0f] hover:border-white/20"}`}><div className="flex items-center justify-between"><Icon className={`h-5 w-5 ${selected?"text-[#ff6a00]":"text-white/28"}`}/><span className="font-mono text-[9px] text-white/25">{s.object}</span></div><p className="mt-5 text-[9px] font-black uppercase tracking-[.14em] text-white/30">{s.role}</p><p className="mt-2 font-serif text-xl font-bold">{s.title}</p>{i<steps.length-1&&<ArrowRight className="mt-5 h-4 w-4 text-white/16"/>}</button>})}</div></div>

    <div className="grid gap-6 xl:grid-cols-[.82fr_1.18fr]">
      <div className="rounded-[1.75rem] border border-[#ff6a00]/25 bg-[#130b07] p-7"><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#ff8b3d]">Selected truth boundary</p><h3 className="mt-3 font-serif text-4xl font-bold">{steps[active].title}</h3><p className="mt-4 text-sm leading-6 text-white/52">{steps[active].truth}</p><div className="mt-7 border-t border-white/10 pt-5"><p className="text-[9px] font-black uppercase tracking-[.14em] text-white/28">Canonical event chain</p><p className="mt-2 font-mono text-xs leading-6 text-white/58">AC-5021 → CB-0421 → MOVE-8821 → VL-1182 → EP-5021 → EX/AE when required</p></div></div>
      <div className="overflow-hidden border border-white/10 bg-[#0d0d0f]"><div className="grid gap-px bg-white/8 sm:grid-cols-2">{[["Identity","Every downstream artifact references the same activation/action lineage."],["Proof strength","Intent, attendance, redemption and transaction remain different evidence classes."],["Permissions","Roles can only transform states they are authorized to own."],["Auditability","Overrides append decisions; they do not erase the original event history."],["Attribution","Agency management never replaces client/brand ownership."],["Participant return","Verified outcomes can return to the participant as Proof, Kept objects, access or history."]].map(([a,b])=><div key={a} className="bg-[#0b0b0c] p-6"><div className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-[#22c55e]"/><p className="text-[9px] font-black uppercase tracking-[.15em] text-[#22c55e]">{a}</p></div><p className="mt-3 text-sm leading-6 text-white/50">{b}</p></div>)}</div></div>
    </div>

    <div className="border border-[#f1e5cf]/25 bg-[#f1e5cf] p-6 text-[#17130f]"><div className="flex items-start gap-3"><FileCheck2 className="mt-1 h-5 w-5 text-[#9d3f1f]"/><div><p className="font-mono text-[9px] uppercase tracking-[.2em] text-[#8a5e48]">SYSTEM RULE · SR-001</p><h4 className="mt-2 font-serif text-2xl font-black">Different stakeholder interfaces may interpret the work. They may not invent different facts.</h4><p className="mt-2 text-sm leading-6 text-black/58">If a merchant validation is reversed, participant Proof, brand evidence, agency result packs and settlement eligibility must all reconcile to the same canonical event history.</p></div></div></div>
  </div>;
}
