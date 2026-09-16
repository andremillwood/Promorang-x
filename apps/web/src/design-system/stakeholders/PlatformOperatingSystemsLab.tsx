import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BellRing,
  Command,
  KeyRound,
  Network,
  RefreshCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  SignalLow,
  Sparkles,
  UserCog,
  UsersRound,
  WifiOff,
} from "lucide-react";

type SystemKey = "Context" | "Attention" | "Reversal" | "Permissions" | "Risk" | "Cold start" | "Offline" | "Search";

const systems: Array<{key:SystemKey; icon:any; title:string; job:string; rule:string}> = [
  {key:"Context",icon:UsersRound,title:"Multi-role + organization context",job:"Let one person operate several legitimate roles without leaking ownership or authority.",rule:"Identity is the person. Role grant is authorization. Active context is a view."},
  {key:"Attention",icon:BellRing,title:"Actionable attention system",job:"Tell each stakeholder what requires action now without forcing them to remember every surface.",rule:"An attention item references a canonical object, owner, urgency, due time and resolution state."},
  {key:"Reversal",icon:RefreshCcw,title:"Reversal + dispute system",job:"Correct reality without deleting the event that originally happened.",rule:"Corrections append events and reconcile projections; they do not erase source history."},
  {key:"Permissions",icon:UserCog,title:"Delegation + permissions",job:"Make capability explicit for owners, staff, agencies and temporary operators.",rule:"Role names do not imply every capability. Decisions require explicit grants."},
  {key:"Risk",icon:ShieldAlert,title:"Fraud + risk holds",job:"Detect suspicious behavior, hold irreversible consequences and preserve appeal/review paths.",rule:"A risk signal is not guilt. Holds pause downstream effects while evidence is reviewed."},
  {key:"Cold start",icon:Sparkles,title:"Sparse-network / cold-start",job:"Remain useful when the city, merchant, creator or participant has very little history.",rule:"Empty states must not fabricate density, social proof, market value or demand."},
  {key:"Offline",icon:WifiOff,title:"Offline + shared-device operations",job:"Keep doors, validation and live operations understandable under poor connectivity or shared hardware.",rule:"Pending local writes are not verified truth until server acknowledgement."},
  {key:"Search",icon:Command,title:"Global search + command",job:"Find objects and actions across the platform in the current role/context.",rule:"Search returns typed objects and legitimate actions, not an unstructured pile of links."},
];

function ContextStudy(){
  const [ctx,setCtx]=useState("Participant");
  const contexts=[
    ["Participant","Andre","Personal","Use access, discover, keep proof"],
    ["Creator","Andre · Creator Studio","Owned studio","Accept briefs, submit proof, view settlement"],
    ["Host","Simple Leisure","Operator","Run Moments, arrivals and proof close"],
    ["Merchant","Sea Deck","Venue manager","Publish offers, validate uses, view results"],
    ["Agency","Pandxtra","Managed operator","Operate client workspaces; client owns evidence"],
  ];
  const selected=contexts.find(x=>x[0]===ctx)!;
  return <div className="grid gap-5 xl:grid-cols-[.72fr_1.28fr]">
    <div className="overflow-hidden border border-white/10 bg-[#0d0d0f]">{contexts.map(([role,name,ownership])=><button key={role} onClick={()=>setCtx(role)} aria-pressed={ctx===role} className={`grid w-full grid-cols-[1fr_auto] gap-4 border-b border-white/8 p-5 text-left last:border-0 ${ctx===role?"bg-[#170c07]":"hover:bg-white/[.025]"}`}><span><b>{role}</b><span className="mt-1 block text-xs text-white/38">{name}</span></span><span className="text-[9px] font-black uppercase tracking-[.13em] text-[#ff8b3d]">{ownership}</span></button>)}</div>
    <div className="rounded-[2rem] border border-[#ff6a00]/25 bg-[#130b07] p-7"><p className="text-[10px] font-black uppercase tracking-[.17em] text-[#ff8b3d]">Active context</p><h3 className="mt-3 font-serif text-4xl font-bold">{selected[1]}</h3><p className="mt-2 text-sm text-white/45">{selected[0]} · {selected[2]}</p><p className="mt-6 max-w-2xl text-sm leading-6 text-white/56">{selected[3]}</p><div className="mt-7 grid gap-3 sm:grid-cols-3">{[["Identity","Andre"],["Acting as",selected[1]],["Authority",selected[2]]].map(([a,b])=><div key={a} className="border border-white/10 bg-black/20 p-4"><p className="text-[9px] uppercase tracking-[.13em] text-white/28">{a}</p><p className="mt-2 text-sm font-bold">{b}</p></div>)}</div><p className="mt-6 border-t border-white/10 pt-5 text-xs leading-5 text-white/38">Every write event stores the acting organization/role grant separately from the underlying person identity.</p></div>
  </div>;
}

function AttentionStudy(){
  const items=[
    ["URGENT","Door exception","AFTRHRS · guest identity mismatch","Host","Now"],
    ["ACTION","Creator revision","CB-0421 · disclosure missing","Creator","Today 4 PM"],
    ["EXPIRING","PromoKey","Sea Deck wings · expires tonight","Participant","11:59 PM"],
    ["BLOCKED","Client approval","Manchester Hills Foods activation","Agency","18h overdue"],
    ["FINANCIAL","Settlement hold","Duplicate merchant validation EX-7712","Admin","Review"],
  ];
  return <div className="grid gap-5 xl:grid-cols-[1.18fr_.82fr]">
    <div className="overflow-hidden border border-white/10 bg-[#0d0d0f]">{items.map(([kind,title,detail,owner,due])=><button key={title} className="grid w-full gap-3 border-b border-white/8 p-5 text-left last:border-0 sm:grid-cols-[auto_1fr_auto] sm:items-center hover:bg-white/[.025]"><span className={`rounded-full border px-3 py-1 text-[9px] font-black tracking-[.12em] ${kind==="URGENT"||kind==="BLOCKED"?"border-[#ef4444]/30 text-[#f87171]":"border-[#f6c453]/25 text-[#f6c453]"}`}>{kind}</span><span><b>{title}</b><span className="mt-1 block text-xs text-white/38">{detail}</span></span><span className="text-right text-[10px] text-white/35"><b className="block text-white/65">{owner}</b>{due}</span></button>)}</div>
    <div className="rounded-[1.75rem] border border-[#f6c453]/25 bg-[#151006] p-6"><BellRing className="h-6 w-6 text-[#f6c453]"/><h3 className="mt-4 font-serif text-3xl font-bold">Attention is a work queue, not a notification feed.</h3><p className="mt-4 text-sm leading-6 text-white/50">Every item must answer: what object needs attention, why now, who owns the next action, when it is due, and what event resolves it.</p></div>
  </div>;
}

function ReversalStudy(){
  const [state,setState]=useState("Verified");
  const states=["Verified","Disputed","Held","Resolved","Reversed"];
  return <div className="space-y-5"><div className="flex flex-wrap gap-2">{states.map(s=><button key={s} onClick={()=>setState(s)} aria-pressed={state===s} className={`min-h-11 rounded-full border px-4 text-xs font-black ${state===s?"border-[#ef4444]/40 bg-[#180909] text-[#f87171]":"border-white/10 text-white/40"}`}>{s}</button>)}</div><div className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]"><div className="border border-white/10 bg-[#0d0d0f] p-6"><p className="font-mono text-[9px] text-white/28">VALIDATION · VL-1182</p><h3 className="mt-3 font-serif text-3xl font-bold">20% lunch offer</h3><div className="mt-6 space-y-3">{[["1:14:02 PM","merchant_validation_recorded","Canonical event retained"],["1:14:09 PM","duplicate_attempt_observed","No second outcome created"],["1:16:11 PM",state==="Verified"?"—":`validation_${state.toLowerCase()}`,state==="Verified"?"No correction":"Correction appended"]].map(([t,e,n])=><div key={t} className="grid grid-cols-[6rem_1fr] gap-3 border-t border-white/8 pt-3 text-xs"><span className="font-mono text-white/28">{t}</span><span><b>{e}</b><span className="block text-white/35">{n}</span></span></div>)}</div></div><div className="rounded-[1.75rem] border border-[#ef4444]/25 bg-[#180909] p-6"><RefreshCcw className="h-6 w-6 text-[#f87171]"/><p className="mt-5 text-[10px] font-black uppercase tracking-[.16em] text-[#f87171]">Current interpretation</p><h3 className="mt-2 font-serif text-4xl font-bold">{state}</h3><p className="mt-4 text-sm leading-6 text-white/50">Participant Proof, rewards, brand evidence and settlement eligibility reconcile from the correction event. The original validation event stays in history.</p></div></div></div>;
}

function PermissionStudy(){
  const rows=[
    ["Venue owner","offer.publish · offer.validate · staff.invite · results.view","Full venue authority"],
    ["Door staff","moment.checkin · exception.create","Cannot publish offers or view financials"],
    ["Cashier","offer.validate · transaction.attach","Cannot change campaign commitments"],
    ["Agency operator","campaign.propose · evidence.view","Client approval required for publish/fund"],
    ["Brand approver","campaign.approve · campaign.fund","Client-owned commitment authority"],
  ];
  return <div className="overflow-hidden border border-white/10 bg-[#0d0d0f]"><div className="hidden grid-cols-[.8fr_1.25fr_1fr] border-b border-white/10 p-4 text-[9px] font-black uppercase tracking-[.14em] text-white/28 md:grid"><span>Grant</span><span>Capabilities</span><span>Boundary</span></div>{rows.map(([r,c,b])=><div key={r} className="grid gap-3 border-b border-white/8 p-5 last:border-0 md:grid-cols-[.8fr_1.25fr_1fr]"><b>{r}</b><span className="font-mono text-[11px] leading-5 text-[#f6c453]">{c}</span><span className="text-xs leading-5 text-white/42">{b}</span></div>)}</div>;
}

function RiskStudy(){
  const [held,setHeld]=useState(true);
  return <div className="grid gap-5 xl:grid-cols-[1fr_1fr]"><div className="rounded-[1.75rem] border border-[#ef4444]/25 bg-[#180909] p-6"><div className="flex items-center justify-between"><ShieldAlert className="h-6 w-6 text-[#f87171]"/><span className="font-mono text-[9px] text-white/28">RISK-3308</span></div><p className="mt-5 text-[10px] font-black uppercase tracking-[.16em] text-[#f87171]">Possible collusive validation</p><h3 className="mt-2 font-serif text-3xl font-bold">4 redemptions · same device · 62 seconds</h3><p className="mt-4 text-sm leading-6 text-white/48">This is a signal for review—not a fraud verdict. Existing proof remains visible while downstream reward settlement is {held?"held":"released"}.</p><button onClick={()=>setHeld(!held)} className="mt-6 min-h-11 rounded-full border border-[#f87171]/35 px-4 text-xs font-black text-[#f87171]">{held?"Release hold":"Place hold"}</button></div><div className="border border-white/10 bg-[#0d0d0f] p-6"><p className="text-[10px] font-black uppercase tracking-[.16em] text-white/30">Review evidence</p><div className="mt-5 space-y-3">{[["Signal","Same device fingerprint"],["Signal","High-frequency validation"],["Counter-evidence","Different PromoCard holders"],["Required action","Review venue context"],["Appeal","Merchant may submit explanation"]].map(([a,b])=><div key={a} className="flex justify-between gap-6 border-b border-white/8 pb-3 text-xs"><span className="text-white/35">{a}</span><b className="text-right">{b}</b></div>)}</div></div></div>;
}

function ColdStartStudy(){
  return <div className="grid gap-5 md:grid-cols-3">{[["Participant","3 useful things near you","No fake trending counts. Offer explicit ways to widen location/category and signal demand."],["Merchant","No redemptions yet","Show first-success path: publish one offer → validate one use → bring them back."],["Marketplace","No active Piece listings","Show owned Pieces, provenance and listing education. Do not invent market value or liquidity."]].map(([who,title,body])=><div key={who} className="rounded-[1.75rem] border border-white/10 bg-[#0d0d0f] p-6"><p className="text-[9px] font-black uppercase tracking-[.14em] text-[#ff8b3d]">{who}</p><h3 className="mt-3 font-serif text-2xl font-bold">{title}</h3><p className="mt-4 text-sm leading-6 text-white/45">{body}</p><button className="mt-6 min-h-11 rounded-full border border-white/15 px-4 text-xs font-black">Useful next action</button></div>)}</div>;
}

function OfflineStudy(){
  const [online,setOnline]=useState(false);
  return <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]"><div className={`rounded-[1.75rem] border p-6 ${online?"border-[#22c55e]/25 bg-[#07120b]":"border-[#f6c453]/25 bg-[#151006]"}`}><div className="flex items-center justify-between"><WifiOff className={`h-6 w-6 ${online?"text-[#22c55e]":"text-[#f6c453]"}`}/><button onClick={()=>setOnline(!online)} className="min-h-11 rounded-full border border-white/15 px-4 text-xs font-black">Go {online?"offline":"online"}</button></div><h3 className="mt-5 font-serif text-3xl font-bold">{online?"Connected · writes can verify":"Offline · read-only truth"}</h3><p className="mt-4 text-sm leading-6 text-white/48">{online?"Validation actions can be submitted and become verified only after server acknowledgement.":"Last confirmed records remain visible. New scans can be captured as pending only if the workflow supports safe reconciliation; they must not appear as verified."}</p></div><div className="border border-white/10 bg-[#0d0d0f] p-6"><p className="text-[10px] font-black uppercase tracking-[.16em] text-white/30">Shared-device operating rules</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{["Show current staff identity","Fast lock/switch operator","No cached financial data beyond permission","Camera permission recovery","Large one-handed actions","Stale/sync timestamp always visible"].map(x=><div key={x} className="border border-white/8 bg-black/20 p-4 text-sm font-bold text-white/70">{x}</div>)}</div></div></div>;
}

function SearchStudy(){
  const [query,setQuery]=useState("sea deck");
  const results=useMemo(()=>[
    ["Place","Sea Deck","20 Barbican Road · venue"],
    ["Moment","AFTRHRS","Hosted at Sea Deck · Sep 18"],
    ["PromoKey","Complimentary wings","Sea Deck · active tonight"],
    ["Proof","Return R-1182","Sea Deck validation · verified"],
  ].filter(r=>r.join(" ").toLowerCase().includes(query.toLowerCase())||query.length<2),[query]);
  return <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]"><div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0d0d0f]"><div className="flex items-center gap-3 border-b border-white/10 p-4"><Search className="h-5 w-5 text-white/35"/><input value={query} onChange={e=>setQuery(e.target.value)} className="min-h-11 flex-1 bg-transparent text-base outline-none placeholder:text-white/25" placeholder="Find a place, object, campaign or action…"/></div>{results.map(([type,title,meta])=><button key={type+title} className="grid w-full grid-cols-[5rem_1fr_auto] items-center gap-3 border-b border-white/8 p-5 text-left last:border-0 hover:bg-white/[.025]"><span className="text-[9px] font-black uppercase tracking-[.13em] text-[#4cc6f0]">{type}</span><span><b>{title}</b><span className="mt-1 block text-xs text-white/35">{meta}</span></span><ArrowRight className="h-4 w-4 text-white/20"/></button>)}</div><div className="rounded-[1.75rem] border border-[#4cc6f0]/25 bg-[#071318] p-6"><Command className="h-6 w-6 text-[#4cc6f0]"/><h3 className="mt-4 font-serif text-3xl font-bold">Search becomes command when authority permits.</h3><p className="mt-4 text-sm leading-6 text-white/48">A Merchant may search “validate promo key”; an Admin may search an object ID and open its case history. Suggested actions are filtered by active context and capability.</p></div></div>;
}

export function PlatformOperatingSystemsLab(){
  const [active,setActive]=useState<SystemKey>("Context");
  const selected=systems.find(s=>s.key===active)!;
  const body=active==="Context"?<ContextStudy/>:active==="Attention"?<AttentionStudy/>:active==="Reversal"?<ReversalStudy/>:active==="Permissions"?<PermissionStudy/>:active==="Risk"?<RiskStudy/>:active==="Cold start"?<ColdStartStudy/>:active==="Offline"?<OfflineStudy/>:<SearchStudy/>;
  const Icon=selected.icon;
  return <div className="space-y-10">
    <header className="grid gap-6 lg:grid-cols-[1fr_.55fr] lg:items-end"><div><p className="text-[10px] font-black uppercase tracking-[.28em] text-[#ff6a00]">Platform operating systems · iteration 01</p><h2 className="mt-4 max-w-5xl font-serif text-5xl font-bold leading-[.9] tracking-[-.055em] sm:text-7xl">The invisible systems need design too.</h2></div><p className="border-l border-[#ff6a00]/30 pl-5 text-sm leading-6 text-white/45">Identity, attention, correction, permissions, risk, sparse markets, offline operation and search are part of the product—not implementation details hidden behind the visible objects.</p></header>
    <div className="flex flex-wrap gap-2">{systems.map(s=>{const I=s.icon;const on=s.key===active;return <button key={s.key} onClick={()=>setActive(s.key)} aria-pressed={on} className={`flex min-h-11 items-center gap-2 rounded-full border px-4 text-xs font-black ${on?"border-[#ff6a00]/40 bg-[#170c07] text-[#ff8b3d]":"border-white/10 text-white/45 hover:text-white/75"}`}><I className="h-4 w-4"/>{s.key}</button>})}</div>
    <div className="grid gap-5 lg:grid-cols-[.72fr_1.28fr] lg:items-start"><div className="rounded-[1.75rem] border border-[#ff6a00]/25 bg-[#130b07] p-6"><Icon className="h-6 w-6 text-[#ff6a00]"/><p className="mt-5 text-[10px] font-black uppercase tracking-[.16em] text-[#ff8b3d]">{selected.key}</p><h3 className="mt-2 font-serif text-3xl font-bold">{selected.title}</h3><p className="mt-4 text-sm leading-6 text-white/50">{selected.job}</p><div className="mt-6 border-t border-white/10 pt-5"><p className="text-[9px] font-black uppercase tracking-[.14em] text-white/28">System invariant</p><p className="mt-2 text-sm font-bold leading-6 text-white/72">{selected.rule}</p></div></div><div>{body}</div></div>
    <div className="border border-[#f1e5cf]/25 bg-[#f1e5cf] p-6 text-[#17130f]"><div className="flex gap-4"><BadgeCheck className="mt-1 h-5 w-5 text-[#9d3f1f]"/><div><p className="font-mono text-[9px] uppercase tracking-[.18em] text-[#8a5e48]">PLATFORM RULE · PR-008</p><h4 className="mt-2 font-serif text-2xl font-black">These systems must reuse canonical objects and events.</h4><p className="mt-2 text-sm leading-6 text-black/58">An inbox item, risk hold, permission grant, offline pending write, reversal or search result is never a new parallel truth. It references and transforms the same object graph.</p></div></div></div>
  </div>;
}
