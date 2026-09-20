import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Gem,
  KeyRound,
  Layers3,
  LockKeyhole,
  MapPin,
  PackageCheck,
  Radio,
  ReceiptText,
  Share2,
  ShieldCheck,
  Sparkles,
  Store,
  Ticket,
  Trophy,
  Vote,
  WalletCards,
} from "lucide-react";
import { PromorangMark } from "@/components/promorang/PromorangMark";

const C = {
  ink: "#080809",
  raised: "#0d0d0f",
  clay: "#7A2E17",
  ochre: "#FF6A00",
  sand: "#EADCC6",
  gold: "#F6C453",
  water: "#4CC6F0",
  leaf: "#22C55E",
  violet: "#B58CFF",
} as const;

function Section({ number, kicker, title, copy, children }: { number: string; kicker: string; title: string; copy: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-white/10 pt-20">
      <div className="mb-12 grid gap-7 lg:grid-cols-[1fr_.5fr] lg:items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff6a00]">{number} · {kicker}</p>
          <h2 className="mt-4 max-w-5xl font-serif text-5xl font-bold leading-[0.9] tracking-[-0.055em] text-white md:text-7xl">{title}</h2>
        </div>
        <div className="border-l border-[#ff6a00]/35 pl-5"><p className="text-sm leading-6 text-white/48">{copy}</p></div>
      </div>
      {children}
    </section>
  );
}

function Spec({ noun, material, edge, residue, trust }: { noun: string; material: string; edge: string; residue: string; trust: string }) {
  return (
    <div className="mt-8 grid border border-white/10 md:grid-cols-5">
      {[["Noun", noun],["Material", material],["Edge", edge],["Residue", residue],["Trust ritual", trust]].map(([label, value]) => (
        <div key={label} className="border-white/10 p-5 md:border-r md:last:border-r-0">
          <p className="text-[9px] font-black uppercase tracking-[.18em] text-[#ff6a00]">{label}</p>
          <p className="mt-3 font-serif text-lg font-bold">{value}</p>
        </div>
      ))}
    </div>
  );
}

function Perforation() {
  return <div className="h-3 w-full" style={{ backgroundImage: "radial-gradient(circle at 6px 6px, #080809 0 4px, transparent 4.5px)", backgroundSize: "12px 12px" }} />;
}

function DiscoveryInstrument() {
  const [selected, setSelected] = useState("live");
  const [submitted, setSubmitted] = useState(false);
  const lanes = [
    ["live", "LIVE MUSIC AFTER DARK", 812, "New Kingston", "+18% today"],
    ["food", "LATE-NIGHT FOOD MARKET", 621, "Liguanea", "+9% today"],
    ["creator", "CREATOR WORKSHOP", 428, "Barbican", "+6% today"],
  ] as const;
  return (
    <Section number="12C" kicker="Discovery · material depth" title="A signal should feel measured, not merely selected." copy="The Discovery object becomes a civic signal instrument: an open field with calibration marks, geography, momentum and response readiness. It should feel unfinished because the market itself is still forming.">
      <div className="grid gap-8 xl:grid-cols-[520px_1fr]">
        <div className="overflow-hidden rounded-[2rem] border border-[#ff6a00]/35 bg-[#120b08] shadow-[0_30px_90px_rgba(255,106,0,.08)]">
          <div className="relative overflow-hidden border-b border-[#ff6a00]/20 p-6" style={{ backgroundImage: "radial-gradient(circle at 85% 20%, rgba(255,106,0,.18), transparent 24%), linear-gradient(135deg,#1b0e08,#0a0909 65%)" }}>
            <div className="absolute right-6 top-5 h-24 w-24 rounded-full border border-[#ff6a00]/20" />
            <div className="absolute right-10 top-9 h-16 w-16 rounded-full border border-[#ff6a00]/15" />
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#ff9a4d]">KSN-SIGNAL · 0916 · LIVE FIELD</p>
            <h3 className="mt-3 max-w-[360px] font-serif text-4xl font-bold leading-[.92]">What should the city get next?</h3>
            <div className="mt-5 grid grid-cols-3 gap-3 text-[10px] uppercase tracking-[.14em] text-white/42"><span>1,861 signals</span><span>closes 8 PM</span><span>Kingston</span></div>
          </div>
          <div className="px-6 py-5">
            <div className="mb-4 flex items-center justify-between"><p className="text-[10px] font-black uppercase tracking-[.17em] text-white/38">Demand lanes</p><Radio className="h-4 w-4 text-[#22c55e]" /></div>
            {lanes.map(([id,label,count,place,velocity]) => {
              const active = selected === id;
              const pct = Math.round((count / 900) * 100);
              return (
                <button key={id} type="button" onClick={() => !submitted && setSelected(id)} className={`mb-3 w-full overflow-hidden rounded-xl border text-left ${active ? "border-[#ff6a00]/55 bg-[#ff6a00]/6" : "border-white/10"}`}>
                  <div className="grid grid-cols-[1fr_auto] gap-4 p-4">
                    <div><p className="text-sm font-black tracking-[.04em]">{label}</p><p className="mt-1 text-xs text-white/42">{place} · {velocity}</p></div>
                    <div className="text-right"><p className="font-serif text-2xl font-bold text-[#f6c453]">{count}</p><p className="text-[9px] uppercase tracking-[.15em] text-white/30">signals</p></div>
                  </div>
                  <div className="h-1 bg-white/5"><div className="h-full bg-gradient-to-r from-[#7a2e17] to-[#ff6a00]" style={{ width: `${pct}%` }} /></div>
                </button>
              );
            })}
            <div className="mt-5 grid grid-cols-[1fr_auto] items-center gap-4 border-t border-dashed border-[#ff6a00]/30 pt-5">
              <div><p className="text-[9px] font-black uppercase tracking-[.15em] text-[#ff9a4d]">Calibration</p><p className="mt-1 text-xs text-white/46">2 host responses · threshold 1,200 · supply not yet confirmed</p></div>
              <button type="button" onClick={() => setSubmitted(true)} className="rounded-full bg-[#f6c453] px-5 py-3 text-xs font-black text-black">{submitted ? "Signal recorded" : "Signal demand"}</button>
            </div>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-[#4cc6f0]/22 bg-[#071319] p-6"><MapPin className="h-5 w-5 text-[#4cc6f0]"/><p className="mt-6 text-[10px] font-black uppercase tracking-[.17em] text-[#4cc6f0]">Field location</p><h4 className="mt-2 font-serif text-3xl font-bold">Demand belongs somewhere.</h4><div className="mt-6 space-y-4 border-l border-[#4cc6f0]/25 pl-5 text-sm"><p><b>New Kingston</b> · strongest pull</p><p><b>Liguanea</b> · accelerating</p><p><b>Barbican</b> · smaller but rising</p></div></div>
          <div className="rounded-[2rem] border border-[#22c55e]/20 bg-[#07120b] p-6"><Sparkles className="h-5 w-5 text-[#22c55e]"/><p className="mt-6 text-[10px] font-black uppercase tracking-[.17em] text-[#22c55e]">Response bay</p><h4 className="mt-2 font-serif text-3xl font-bold">Supply answers here.</h4><div className="mt-6 rounded-xl border border-white/10 p-4"><p className="text-xs text-white/36">HOST RESPONSE · HR-0021</p><p className="mt-2 font-bold">2 hosts considering activation</p><p className="mt-2 text-xs leading-5 text-white/46">Nothing becomes a Moment until an issuer/host commits.</p></div></div>
        </div>
      </div>
      <Spec noun="Signal instrument" material="Civic field board" edge="Calibration rails" residue="Recorded signal + host response" trust="Demand never masquerades as supply" />
    </Section>
  );
}

function PieceArtifact() {
  const [side, setSide] = useState<"artifact"|"provenance">("artifact");
  return (
    <Section number="13C" kicker="Pieces · material depth" title="A Piece should feel archived, handled and carried forward." copy="The Piece becomes an archival artifact rather than a premium card: edition code, acquisition stamp, provenance spine, utility annotation, transfer seal and collection identity all leave visible residue.">
      <div className="grid gap-8 xl:grid-cols-[1.1fr_.9fr]">
        <div>
          <div className="mb-4 flex gap-2">{(["artifact","provenance"] as const).map(v => <button key={v} onClick={() => setSide(v)} className={`rounded-full border px-4 py-2 text-xs font-bold ${side===v?"border-[#b58cff]/55 bg-[#b58cff]/10 text-[#d6c0ff]":"border-white/10 text-white/45"}`}>{v}</button>)}</div>
          <article className="relative min-h-[430px] overflow-hidden rounded-[1.4rem] border border-[#b58cff]/28 bg-[#17111f] p-8 shadow-[0_30px_90px_rgba(181,140,255,.12)]" style={{ backgroundImage: "linear-gradient(115deg,rgba(181,140,255,.08),transparent 34%), repeating-linear-gradient(0deg,transparent 0 27px,rgba(255,255,255,.025) 28px)" }}>
            <div className="absolute right-6 top-6 grid h-20 w-20 place-items-center rounded-full border-[7px] border-double border-[#f6c453]/35 text-[#f6c453]"><Layers3 className="h-7 w-7"/></div>
            <div className="absolute bottom-0 left-14 top-0 w-px bg-[#b58cff]/18" />
            {side === "artifact" ? <>
              <p className="pl-12 text-[10px] font-black uppercase tracking-[.2em] text-[#b58cff]">ARCHIVE · KEPT · 0042</p>
              <p className="mt-1 pl-12 text-xs text-white/35">Acquisition: EARNED · holder: Andre</p>
              <div className="mt-20 pl-12"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Food & Taste · Opening Run</p><h3 className="mt-3 max-w-xl font-serif text-4xl font-bold">Piece 0042 — Liguanea return</h3><p className="mt-4 text-sm leading-6 text-white/48">A verified lunch benefit used at Broken Plate became a durable record of participation.</p></div>
              <div className="absolute inset-x-8 bottom-8 grid grid-cols-3 gap-6 border-t border-dashed border-white/12 pt-5 text-xs"><div><p className="text-white/28">ORIGIN</p><p className="mt-1 font-bold">Broken Plate</p></div><div><p className="text-white/28">PROOF</p><p className="mt-1 font-bold">Merchant verified</p></div><div><p className="text-white/28">UTILITY</p><p className="mt-1 font-bold">Food Scene access</p></div></div>
            </> : <>
              <p className="pl-12 text-[10px] font-black uppercase tracking-[.2em] text-[#b58cff]">PROVENANCE SPINE · P-0042-A</p>
              <div className="mt-12 pl-12">
                {[ ["MOVE","Lunch offer surfaced","Sep 18 · 12:04 PM"],["RETURN","20% benefit used","Sep 18 · 1:14 PM"],["PROOF","Merchant validation recorded","Sep 18 · 1:15 PM"],["KEPT","Piece 0042 minted into Vault","Sep 18 · 1:15 PM"] ].map(([k,t,m],i)=><div key={k} className="relative border-l border-white/10 pb-8 pl-8 last:pb-0"><span className="absolute -left-2 top-0 grid h-4 w-4 place-items-center rounded-full border border-[#b58cff]/50 bg-[#17111f] text-[7px]">{i+1}</span><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#ff9a4d]">{k}</p><p className="mt-1 font-bold">{t}</p><p className="mt-1 text-xs text-white/34">{m}</p></div>)}
              </div>
            </>}
          </article>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-[#0d0d0f] p-7"><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#b58cff]">Archive annotations</p><h4 className="mt-3 font-serif text-3xl font-bold">Ownership can move. The story cannot disappear.</h4><div className="mt-8 space-y-4">{[["ORIGIN STAMP","Earned through participation, not bought"],["COLLECTION","Food & Taste · Opening Run"],["TRANSFER SEAL","Not transferred"],["UTILITY NOTE","Scene access · valid through Oct 31"]].map(([a,b])=><div key={a} className="grid grid-cols-[130px_1fr] border-b border-white/8 pb-4 text-sm"><span className="text-[9px] font-black tracking-[.15em] text-white/28">{a}</span><span>{b}</span></div>)}</div></div>
      </div>
      <Spec noun="Kept artifact" material="Archival board / certificate" edge="Spine + seal" residue="Acquisition + transfer stamps" trust="Provenance persists across ownership" />
    </Section>
  );
}

function MarketplaceExchange() {
  const [selected, setSelected] = useState(0);
  const pieces = [
    ["P-0118","Barbican Night Signal","36 Gems","Kingston After Dark"],
    ["P-0207","Move Jamaica First Drive","42 Gems","Move Jamaica"],
    ["P-0315","New Kingston Room","24 Gems","Community"],
  ];
  return (
    <Section number="14C" kicker="Marketplace · material depth" title="The market should feel curated on one side and contractual on the other." copy="Browse is gallery-like; settlement is explicit. The acquisition sheet behaves like a sale document with holder, provenance, utility, ask, fee, balance and transfer result—not a generic ecommerce card.">
      <div className="grid gap-8 xl:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-[2rem] border border-white/10 bg-[#0b0b0c] p-6"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#b58cff]">Piece exchange · curated shelf</p><h3 className="mt-2 font-serif text-3xl font-bold">Available now</h3></div><div className="rounded-full border border-[#4cc6f0]/25 px-4 py-2 text-sm font-black text-[#4cc6f0]">74 Gems</div></div><div className="mt-6 grid gap-4 md:grid-cols-3">{pieces.map(([id,name,price,collection],i)=><button key={id} onClick={()=>setSelected(i)} className={`relative min-h-[250px] overflow-hidden rounded-[1.2rem] border p-5 text-left ${selected===i?"border-[#b58cff]/50 bg-[#b58cff]/7":"border-white/10 bg-[#111013]"}`}><div className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-[#b58cff]/25"><Layers3 className="h-4 w-4 text-[#b58cff]"/></div><p className="text-[9px] font-black uppercase tracking-[.17em] text-[#b58cff]">{id}</p><div className="mt-16"><p className="text-xs text-white/34">{collection}</p><h4 className="mt-2 font-serif text-xl font-bold">{name}</h4></div><div className="absolute inset-x-5 bottom-5 border-t border-dashed border-white/10 pt-4 text-sm font-black text-[#4cc6f0]">{price}</div></button>)}</div></div>
        <div className="overflow-hidden rounded-[1.2rem] bg-[#eadcc6] text-black shadow-[0_28px_80px_rgba(0,0,0,.28)]"><Perforation/><div className="p-6"><div className="flex items-center justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#7a2e17]">ACQUISITION SHEET · {pieces[selected][0]}</p><h3 className="mt-2 font-serif text-3xl font-bold">{pieces[selected][1]}</h3></div><ShieldCheck className="h-6 w-6 text-[#7a2e17]"/></div><div className="mt-7 space-y-3 border-y border-black/12 py-5 text-sm">{[["PROVENANCE","Verified"],["CURRENT HOLDER","Public seller · verified"],["UTILITY","Collection-specific access"],["ASK",pieces[selected][2]],["MARKET FEE","2 Gems"],["YOUR BALANCE","74 Gems"]].map(([a,b])=><div key={a} className="flex items-center justify-between"><span className="text-[10px] font-black tracking-[.12em] text-black/45">{a}</span><span className="font-bold">{b}</span></div>)}</div><button className="mt-6 flex w-full items-center justify-between rounded-full bg-black px-5 py-4 text-sm font-black text-white"><span>Review transfer</span><ArrowRight className="h-4 w-4"/></button><p className="mt-4 text-[10px] leading-4 text-black/50">Ownership transfer updates the provenance record. Price does not imply future appreciation.</p></div><Perforation/></div>
      </div>
      <Spec noun="Curated exchange" material="Gallery + settlement sheet" edge="Mounted artifact / perforated contract" residue="Transfer receipt + holder change" trust="Provenance before ask" />
    </Section>
  );
}

function PromoKeyInstrument() {
  const states = ["Locked","Unlocked","Active","Expiring","Used"] as const;
  const [state,setState] = useState<typeof states[number]>("Active");
  const used = state === "Used";
  return (
    <Section number="15C" kicker="PromoKeys · material depth" title="A Key should have a threshold, a notch and a memory of being used." copy="The Key becomes a compact access instrument with its own silhouette and validation ritual. Locked explains the threshold; Active feels ready; Expiring changes urgency; Used carries a permanent validation punch rather than remaining usable access.">
      <div className="grid gap-8 xl:grid-cols-[520px_1fr]">
        <div><div className="mb-5 flex flex-wrap gap-2">{states.map(s=><button key={s} onClick={()=>setState(s)} className={`rounded-full border px-4 py-2 text-xs font-bold ${state===s?"border-[#ff6a00]/55 bg-[#ff6a00]/10 text-[#ff9a4d]":"border-white/10 text-white/40"}`}>{s}</button>)}</div><div className="relative overflow-hidden border border-[#f6c453]/35 bg-[#0d0b09] p-7 shadow-[0_30px_90px_rgba(246,196,83,.08)]" style={{ clipPath: "polygon(0 0, 88% 0, 88% 9%, 100% 9%, 100% 91%, 88% 91%, 88% 100%, 0 100%)", backgroundImage: "linear-gradient(120deg,rgba(255,106,0,.12),transparent 38%), repeating-linear-gradient(90deg,transparent 0 27px,rgba(246,196,83,.025) 28px)" }}><div className="flex items-start justify-between"><PromorangMark size={42}/><div className={`grid h-14 w-14 place-items-center rounded-full border-2 ${used?"border-[#22c55e] text-[#22c55e]":"border-[#f6c453]/40 text-[#f6c453]"}`}><KeyRound className="h-5 w-5"/></div></div><p className="mt-14 text-[9px] font-black uppercase tracking-[.19em] text-[#ff9a4d]">PROMOKEY · PK-0916-SEA</p><h3 className="mt-3 font-serif text-4xl font-bold">AFTRHRS Wing Key</h3><p className="mt-2 text-sm text-white/48">Sea Deck · complimentary wings</p><div className="mt-8 grid grid-cols-2 gap-4 border-y border-dashed border-[#f6c453]/25 py-5 text-xs"><div><p className="text-white/28">STATE</p><p className="mt-1 font-black text-[#22c55e]">{state.toUpperCase()}</p></div><div><p className="text-white/28">VALID</p><p className="mt-1 font-bold">Wed · 10 PM–12 AM</p></div><div><p className="text-white/28">ISSUER</p><p className="mt-1 font-bold">Sea Deck</p></div><div><p className="text-white/28">REQUIRES</p><p className="mt-1 font-bold">Merchant validation</p></div></div><div className="mt-6 flex items-center justify-between"><p className="text-xs text-white/42">{used?"Validated 11:08 PM · proof returned":"One use · opens a real threshold"}</p><button className={`rounded-full px-5 py-3 text-xs font-black ${used?"bg-white/8 text-white/35":"bg-[#eadcc6] text-black"}`}>{used?"View proof":"Show Key"}</button></div>{used?<div className="absolute right-28 top-24 grid h-20 w-20 rotate-[-12deg] place-items-center rounded-full border-4 border-[#22c55e]/40 text-[9px] font-black uppercase tracking-[.16em] text-[#22c55e]">USED</div>:null}</div></div>
        <div className="rounded-[2rem] border border-white/10 bg-[#0d0d0f] p-7"><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#f6c453]">Threshold ritual</p><h4 className="mt-3 font-serif text-3xl font-bold">The object changes meaning as you cross the threshold.</h4><div className="mt-8 grid gap-3 md:grid-cols-5">{states.map((s,i)=><div key={s} className={`rounded-xl border p-4 ${state===s?"border-[#f6c453]/35 bg-[#f6c453]/5":"border-white/8"}`}><p className="text-[9px] font-black text-[#ff9a4d]">0{i+1}</p><p className="mt-5 font-bold">{s}</p><p className="mt-2 text-xs leading-5 text-white/40">{["Requirement visible","Object becomes yours","Ready to cross","Urgency appears","Access becomes Proof"][i]}</p></div>)}</div></div>
      </div>
      <Spec noun="Access instrument" material="Matte polymer / gate tag" edge="Notched threshold" residue="Validation punch / used stamp" trust="Issuer + validity before reveal" />
    </Section>
  );
}

function PromoShareTheatre() {
  const states = ["Open","Closing","Drawing","Result"] as const;
  const [state,setState] = useState<typeof states[number]>("Open");
  const tickets = ["PS-KFD-18321","PS-KFD-18322","PS-KFD-18323","PS-KFD-18324","PS-KFD-18325","PS-KFD-18326"];
  return (
    <Section number="16C" kicker="PromoShare · material depth" title="A draw should have a stage, tickets and a permanent result." copy="PromoShare becomes a named event object rather than a black campaign panel. Serialized tickets, close ritual, locked entry set, draw state and result record make the excitement auditable.">
      <div className="grid gap-8 xl:grid-cols-[1.05fr_.95fr]">
        <div className="overflow-hidden rounded-[2rem] border border-[#f6c453]/35 bg-[#110e07] shadow-[0_30px_100px_rgba(246,196,83,.1)]"><div className="relative border-b border-[#f6c453]/20 px-7 py-8" style={{ backgroundImage:"radial-gradient(circle at 90% 0%,rgba(246,196,83,.18),transparent 28%),linear-gradient(145deg,#1d1305,#0b0a08 65%)" }}><div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#f6c453]">PROMOSHARE · KFD-0916</p><h3 className="mt-3 font-serif text-4xl font-bold">Kingston Food Drop</h3><p className="mt-2 text-sm text-white/50">Dinner for two + AFTRHRS PromoKey</p></div><Trophy className="h-8 w-8 text-[#f6c453]"/></div><div className="mt-7 flex flex-wrap gap-2">{states.map(s=><button key={s} onClick={()=>setState(s)} className={`rounded-full border px-4 py-2 text-xs font-bold ${state===s?"border-[#f6c453]/55 bg-[#f6c453]/10 text-[#f6c453]":"border-white/10 text-white/40"}`}>{s}</button>)}</div></div><div className="p-7"><div className="grid grid-cols-2 gap-4"><div className="rounded-xl border border-white/10 p-4"><p className="text-[9px] font-black uppercase tracking-[.15em] text-white/28">Your entry set</p><p className="mt-2 font-serif text-3xl font-bold text-[#f6c453]">6 tickets</p></div><div className="rounded-xl border border-white/10 p-4"><p className="text-[9px] font-black uppercase tracking-[.15em] text-white/28">Status</p><p className="mt-2 font-bold">{state==="Open"?"Closes tonight · 8 PM":state==="Closing"?"Entries locking":state==="Drawing"?"Drawing now":"Result recorded"}</p></div></div><div className="mt-6 grid gap-2 md:grid-cols-2">{tickets.map((ticket,i)=><div key={ticket} className="relative overflow-hidden rounded-lg bg-[#eadcc6] text-black"><Perforation/><div className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-3"><div><p className="text-[8px] font-black tracking-[.14em] text-black/45">KINGSTON FOOD DROP</p><p className="mt-1 font-mono text-xs font-bold">{ticket}</p></div><div className="text-right"><p className="text-[8px] text-black/40">SOURCE</p><p className="text-[10px] font-bold">{["participation","share","share","partner","share","participation"][i]}</p></div></div><Perforation/></div>)}</div>{state==="Result"?<div className="mt-6 rounded-xl border border-[#22c55e]/25 bg-[#22c55e]/5 p-5"><p className="text-[9px] font-black uppercase tracking-[.17em] text-[#22c55e]">RESULT RECORD · RR-KFD-0916</p><p className="mt-2 font-serif text-2xl font-bold">Winning ticket: PS-KFD-18324</p><p className="mt-2 text-xs text-white/46">Draw closed 8:00 PM · result timestamp 8:02 PM · claim status pending</p></div>:null}</div></div>
        <div className="rounded-[2rem] border border-white/10 bg-[#0d0d0f] p-7"><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#f6c453]">Draw audit rail</p><h4 className="mt-3 font-serif text-3xl font-bold">Theatre with a paper trail.</h4><div className="mt-8 space-y-5">{[["NAMED DRAW","Kingston Food Drop · KFD-0916"],["PRIZE","Dinner for two + AFTRHRS PromoKey"],["TICKET SET","6 entries · provenance visible"],["CLOSE","8:00 PM · entries lock"],["DRAW","8:02 PM · recorded"],["CLAIM","winner collects with verification"]].map(([a,b])=><div key={a} className="grid grid-cols-[120px_1fr] border-b border-white/8 pb-4"><span className="text-[9px] font-black tracking-[.15em] text-white/28">{a}</span><span className="text-sm">{b}</span></div>)}</div></div>
      </div>
      <Spec noun="Named draw" material="Marquee + serialized ticket stock" edge="Perforated entry set" residue="Locked ticket batch + result record" trust="Every ticket maps to one draw" />
    </Section>
  );
}

function SaveWinVault() {
  const [parked,setParked] = useState(25);
  return (
    <Section number="17C" kicker="Save & Win · material depth" title="Protected principal should feel physically separate from promotional prize." copy="Save & Win gets two chambers with different materials and emotional temperatures. Principal lives in a protected reserve object; the prize lives in a distinct committed pool. The interface should make it hard to confuse the two.">
      <div className="grid gap-8 xl:grid-cols-[1.05fr_.95fr]">
        <div className="rounded-[2rem] border border-[#22c55e]/22 bg-[#07120b] p-7 shadow-[inset_0_0_0_1px_rgba(34,197,94,.04),0_30px_90px_rgba(34,197,94,.06)]"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#22c55e]">Protected reserve · Andre</p><h3 className="mt-3 font-serif text-4xl font-bold">Your principal chamber.</h3></div><LockKeyhole className="h-8 w-8 text-[#22c55e]"/></div><div className="mt-8 rounded-[1.3rem] border-2 border-[#22c55e]/20 bg-black/20 p-6"><p className="text-[9px] font-black uppercase tracking-[.15em] text-white/28">Gems available</p><p className="mt-1 font-serif text-5xl font-bold">74</p><div className="mt-6 grid grid-cols-3 gap-3">{[10,25,50].map(v=><button key={v} onClick={()=>setParked(v)} className={`rounded-xl border py-4 text-lg font-black ${parked===v?"border-[#4cc6f0]/50 bg-[#4cc6f0]/10 text-[#4cc6f0]":"border-white/10"}`}>{v}</button>)}</div><div className="mt-6 border-t border-dashed border-[#22c55e]/20 pt-5"><div className="flex items-center justify-between"><span className="text-xs text-white/40">PARKED PRINCIPAL</span><span className="font-serif text-2xl font-bold text-[#22c55e]">{parked} Gems</span></div><p className="mt-2 text-xs leading-5 text-white/42">Still attributable to you. Not spent. Not part of the prize pool.</p></div></div></div>
        <div className="rounded-[2rem] border border-[#4cc6f0]/25 bg-[#071218] p-7"><Trophy className="h-7 w-7 text-[#4cc6f0]"/><p className="mt-6 text-[10px] font-black uppercase tracking-[.18em] text-[#4cc6f0]">Committed promotional pool</p><h3 className="mt-3 font-serif text-4xl font-bold">100 extra Gems.</h3><p className="mt-3 text-sm leading-6 text-white/50">Funded separately from participant principal. Your parked amount determines entries into the named draw.</p><div className="mt-8 overflow-hidden rounded-[1.2rem] border border-[#4cc6f0]/15"><div className="grid grid-cols-2 border-b border-[#4cc6f0]/15 p-4 text-sm"><span className="text-white/35">Named draw</span><b>Weekend 100</b></div><div className="grid grid-cols-2 border-b border-[#4cc6f0]/15 p-4 text-sm"><span className="text-white/35">Your tickets</span><b>{Math.max(1,Math.floor(parked/5))}</b></div><div className="grid grid-cols-2 p-4 text-sm"><span className="text-white/35">Prize source</span><b>Committed partner pool</b></div></div></div>
      </div>
      <Spec noun="Protected parking draw" material="Reserve chamber + prize chamber" edge="Sealed custody frame" residue="Park / return ledger + draw result" trust="Principal never visually merges with prize" />
    </Section>
  );
}

function ValueSpecies() {
  const [active,setActive] = useState<"gems"|"points"|"tickets">("gems");
  return (
    <Section number="18C" kicker="Value species · material depth" title="Different value should obey different physics." copy="Gems move through a ledger. Points accumulate as participation traces. Tickets exist only inside named draws. Their shapes, records and actions should communicate those differences before the user reads explanatory copy.">
      <div className="mb-6 flex flex-wrap gap-2">{(["gems","points","tickets"] as const).map(v=><button key={v} onClick={()=>setActive(v)} className={`rounded-full border px-4 py-2 text-xs font-bold ${active===v?"border-[#ff6a00]/55 bg-[#ff6a00]/10 text-[#ff9a4d]":"border-white/10 text-white/40"}`}>{v}</button>)}</div>
      {active === "gems" ? <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]"><div className="rounded-[2rem] border border-[#4cc6f0]/30 bg-[#071319] p-7 shadow-[inset_0_0_50px_rgba(76,198,240,.04)]"><Gem className="h-7 w-7 text-[#4cc6f0]"/><p className="mt-6 text-[10px] font-black uppercase tracking-[.17em] text-[#4cc6f0]">GEMS LEDGER · GL-ANDRE</p><p className="mt-2 font-serif text-6xl font-bold">74</p><p className="mt-2 text-sm text-white/40">Spendable platform value</p></div><div className="rounded-[2rem] border border-white/10 bg-[#0d0d0f] p-6"><p className="text-[10px] font-black uppercase tracking-[.17em] text-white/34">Source → destination ledger</p>{[["Piece purchase","Marketplace","-36"],["Save & Win return","Reserve","+25"],["Merchant reward","Broken Plate","+10"]].map(([a,b,c])=><div key={a} className="grid grid-cols-[1fr_130px_auto] items-center border-b border-white/8 py-5 last:border-b-0"><div><p className="font-bold">{a}</p><p className="mt-1 text-xs text-white/34">{b}</p></div><span className="text-xs text-white/28">posted</span><span className="font-mono font-bold text-[#4cc6f0]">{c}</span></div>)}</div></div> : null}
      {active === "points" ? <div className="grid gap-6 lg:grid-cols-[.65fr_1.35fr]"><div className="rounded-[2rem] border border-[#ff6a00]/25 bg-[#120b08] p-7"><Sparkles className="h-7 w-7 text-[#ff6a00]"/><p className="mt-6 text-[10px] font-black uppercase tracking-[.17em] text-[#ff9a4d]">PARTICIPATION TRACE</p><p className="mt-2 font-serif text-6xl font-bold">1,840</p><p className="mt-2 text-sm text-white/40">Proof of participation, not money</p></div><div className="rounded-[2rem] border border-white/10 bg-[#0d0d0f] p-7"><div className="relative border-l border-[#ff6a00]/20 pl-8">{[["+120","Workshop attendance verified"],["+80","Discovery signal answered"],["+60","Merchant action completed"],["+40","Share caused a move"]].map(([p,t],i)=><div key={t} className="relative pb-7 last:pb-0"><span className="absolute -left-[37px] top-0 h-4 w-4 rounded-full border border-[#ff6a00]/50 bg-[#0d0d0f]"/><p className="text-sm font-bold">{t}</p><p className="mt-1 text-xs text-[#ff9a4d]">{p} points · participation reason recorded</p></div>)}</div></div></div> : null}
      {active === "tickets" ? <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{[["Kingston Food Drop","6","KFD-0916"],["Weekend 100","5","SW-100"],["Creator Drop","2","CD-0920"]].map(([name,count,id])=><div key={id} className="overflow-hidden rounded-xl bg-[#eadcc6] text-black shadow-[0_22px_60px_rgba(0,0,0,.2)]"><Perforation/><div className="p-5"><div className="flex items-center justify-between"><Ticket className="h-5 w-5 text-[#7a2e17]"/><span className="font-mono text-[10px] text-black/45">{id}</span></div><p className="mt-8 text-[9px] font-black uppercase tracking-[.16em] text-[#7a2e17]">NAMED DRAW</p><h4 className="mt-2 font-serif text-2xl font-bold">{name}</h4><p className="mt-5 font-serif text-5xl font-bold">{count}</p><p className="mt-1 text-xs text-black/45">entries attached to this draw only</p></div><Perforation/></div>)}</div> : null}
      <Spec noun={active === "gems" ? "Spendable value" : active === "points" ? "Participation trace" : "Named draw entry"} material={active === "gems" ? "Ledger glass / value sheet" : active === "points" ? "Progress path / activity trace" : "Perforated serialized ticket stock"} edge={active === "gems" ? "Ledger frame" : active === "points" ? "Open-ended path" : "Perforated stub"} residue={active === "gems" ? "Source/destination transaction" : active === "points" ? "Reason-earned history" : "Draw result / expiry"} trust={active === "gems" ? "Every change has source + destination" : active === "points" ? "Never styled as cash" : "Every ticket belongs to one named draw"} />
    </Section>
  );
}

export function PromorangEconomyLabV3() {
  return (
    <div className="space-y-28">
      <DiscoveryInstrument />
      <PieceArtifact />
      <MarketplaceExchange />
      <PromoKeyInstrument />
      <PromoShareTheatre />
      <SaveWinVault />
      <ValueSpecies />
    </div>
  );
}
