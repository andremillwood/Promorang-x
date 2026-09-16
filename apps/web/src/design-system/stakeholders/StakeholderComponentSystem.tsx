import type { ReactNode } from "react";
import { AlertTriangle, ArrowRight, BadgeCheck, CircleDollarSign, Clock3, FileCheck2, MapPin, ShieldCheck, Sparkles, UserRoundCheck } from "lucide-react";

export type Tone = "orange" | "gold" | "green" | "cyan" | "violet" | "red" | "neutral";

const tones: Record<Tone,{border:string,text:string,bg:string}> = {
  orange:{border:"border-[#ff6a00]/30",text:"text-[#ff8b3d]",bg:"bg-[#160c07]"},
  gold:{border:"border-[#f6c453]/30",text:"text-[#f6c453]",bg:"bg-[#151006]"},
  green:{border:"border-[#22c55e]/30",text:"text-[#22c55e]",bg:"bg-[#07120b]"},
  cyan:{border:"border-[#4cc6f0]/30",text:"text-[#4cc6f0]",bg:"bg-[#071318]"},
  violet:{border:"border-[#b58cff]/30",text:"text-[#b58cff]",bg:"bg-[#15101c]"},
  red:{border:"border-[#ef4444]/30",text:"text-[#f87171]",bg:"bg-[#180909]"},
  neutral:{border:"border-white/12",text:"text-white/65",bg:"bg-[#0d0d0f]"},
};

export function ContextStrip({role,workspace,objectId,status,tone="orange"}:{role:string;workspace:string;objectId:string;status:string;tone?:Tone}) {
  const t=tones[tone];
  return <div className={`grid gap-3 border ${t.border} ${t.bg} px-4 py-3 text-xs sm:grid-cols-[auto_1fr_auto_auto] sm:items-center`}>
    <span className={`font-black uppercase tracking-[.16em] ${t.text}`}>{role}</span>
    <span className="text-white/55">{workspace}</span>
    <span className="font-mono text-[10px] text-white/32">{objectId}</span>
    <span className={`font-bold ${t.text}`}>{status}</span>
  </div>;
}

export function WorkObject({eyebrow,title,summary,fields,children,tone="neutral"}:{eyebrow:string;title:string;summary?:string;fields:Array<[string,string]>;children?:ReactNode;tone?:Tone}) {
  const t=tones[tone];
  return <section className={`overflow-hidden rounded-[1.75rem] border ${t.border} ${t.bg}`}>
    <div className="border-b border-white/8 p-6 sm:p-7">
      <p className={`text-[10px] font-black uppercase tracking-[.2em] ${t.text}`}>{eyebrow}</p>
      <h3 className="mt-3 max-w-3xl font-serif text-3xl font-bold leading-[1.02] sm:text-4xl">{title}</h3>
      {summary && <p className="mt-3 max-w-2xl text-sm leading-6 text-white/48">{summary}</p>}
    </div>
    <div className="grid gap-px bg-white/8 sm:grid-cols-2">
      {fields.map(([label,value])=><div key={label} className="bg-[#0b0b0c] p-5"><p className="text-[9px] font-black uppercase tracking-[.15em] text-white/28">{label}</p><p className="mt-2 text-sm font-bold text-white/86">{value}</p></div>)}
    </div>
    {children && <div className="border-t border-white/8 p-6">{children}</div>}
  </section>;
}

export function EvidenceObject({type,title,rows,state="recorded",tone="green"}:{type:string;title:string;rows:Array<[string,string]>;state?:string;tone?:Tone}) {
  const t=tones[tone];
  return <section className={`relative overflow-hidden border ${t.border} bg-[#f1e5cf] text-[#17130f] shadow-[0_24px_70px_rgba(0,0,0,.28)]`}>
    <div className="absolute inset-x-0 top-0 h-2 bg-[radial-gradient(circle_at_6px_-1px,transparent_6px,#f1e5cf_6px)] bg-[length:12px_12px]"/>
    <div className="p-6 pt-8 sm:p-7 sm:pt-9">
      <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[9px] uppercase tracking-[.22em] text-[#8a5e48]">{type}</p><h3 className="mt-2 font-serif text-3xl font-black">{title}</h3></div><FileCheck2 className="h-6 w-6 text-[#9d3f1f]"/></div>
      <div className="my-5 border-t border-dashed border-black/20"/>
      <div className="space-y-2 font-mono text-[11px]">{rows.map(([a,b])=><div key={a} className="flex justify-between gap-6 border-b border-black/8 pb-2"><span className="text-black/48">{a}</span><b className="text-right">{b}</b></div>)}</div>
      <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4"><span className="text-[9px] font-black uppercase tracking-[.16em] text-black/42">State residue</span><span className="font-mono text-[10px] font-bold uppercase">{state}</span></div>
    </div>
  </section>;
}

export function LifecycleRail({states,active,onSelect,tone="orange"}:{states:string[];active:string;onSelect?:(s:string)=>void;tone?:Tone}) {
  const t=tones[tone];
  return <div className="overflow-x-auto"><div className="flex min-w-max items-center gap-2 py-1">
    {states.map((s,i)=>{const current=s===active; return <button key={s} onClick={()=>onSelect?.(s)} className={`group flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[.13em] transition ${current?`${t.border} ${t.bg} ${t.text}`:"border-white/10 text-white/32 hover:text-white/65"}`}><span className={`grid h-5 w-5 place-items-center rounded-full border text-[9px] ${current?t.border:"border-white/12"}`}>{i+1}</span>{s}</button>})}
  </div></div>;
}

export function TruthBoundary({label,left,right,tone="gold"}:{label:string;left:string;right:string;tone?:Tone}) {
  const t=tones[tone];
  return <div className={`rounded-[1.25rem] border ${t.border} ${t.bg} p-5`}><p className={`text-[9px] font-black uppercase tracking-[.16em] ${t.text}`}>{label}</p><div className="mt-4 grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]"><div className="rounded-xl border border-white/8 p-4 text-sm font-bold">{left}</div><ArrowRight className={`hidden h-4 w-4 sm:block ${t.text}`}/><div className="rounded-xl border border-white/8 p-4 text-sm font-bold">{right}</div></div></div>;
}

export function ExceptionBanner({title,detail,severity="Needs review"}:{title:string;detail:string;severity?:string}) {
  return <div className="flex gap-4 rounded-[1.25rem] border border-[#ef4444]/30 bg-[#170909] p-5"><AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-[#f87171]"/><div><p className="text-[9px] font-black uppercase tracking-[.16em] text-[#f87171]">{severity}</p><p className="mt-1 font-bold">{title}</p><p className="mt-1 text-sm leading-5 text-white/45">{detail}</p></div></div>;
}

export function DecisionBar({primary,secondary,note,tone="orange",onPrimary,onSecondary}:{primary:string;secondary?:string;note:string;tone?:Tone;onPrimary?:()=>void;onSecondary?:()=>void}) {
  const t=tones[tone];
  return <div className="grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-[1fr_auto]"><p className="text-xs leading-5 text-white/38">{note}</p><div className="flex flex-wrap gap-2">{secondary&&<button onClick={onSecondary} className="rounded-full border border-white/14 px-4 py-2 text-xs font-bold text-white/70">{secondary}</button>}<button onClick={onPrimary} className={`rounded-full border px-4 py-2 text-xs font-black ${t.border} ${t.bg} ${t.text}`}>{primary}</button></div></div>;
}

export function OperationalFacts({items}:{items:Array<{icon?:"clock"|"place"|"proof"|"money"|"person"|"status";label:string;value:string}>}) {
  const icons={clock:Clock3,place:MapPin,proof:ShieldCheck,money:CircleDollarSign,person:UserRoundCheck,status:BadgeCheck};
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{items.map((item)=>{const Icon=item.icon?icons[item.icon]:Sparkles; return <div key={item.label} className="rounded-xl border border-white/8 bg-black/15 p-4"><div className="flex items-center gap-2 text-white/28"><Icon className="h-4 w-4"/><span className="text-[9px] font-black uppercase tracking-[.14em]">{item.label}</span></div><p className="mt-2 text-sm font-bold">{item.value}</p></div>})}</div>;
}

export function AuditStamp({label,time,actor}:{label:string;time:string;actor:string}) { return <div className="inline-flex items-center gap-3 rounded-full border border-[#22c55e]/25 bg-[#07120b] px-4 py-2 text-[10px]"><BadgeCheck className="h-4 w-4 text-[#22c55e]"/><span className="font-black uppercase tracking-[.13em] text-[#22c55e]">{label}</span><span className="text-white/34">{time}</span><span className="text-white/50">{actor}</span></div>; }
