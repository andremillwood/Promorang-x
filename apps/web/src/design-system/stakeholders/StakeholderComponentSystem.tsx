import type { ReactNode } from "react";
import { AlertTriangle, ArrowRight, BadgeCheck, CircleDollarSign, Clock3, FileCheck2, MapPin, ShieldCheck, Sparkles, UserRoundCheck, WifiOff } from "lucide-react";

export type Tone = "orange" | "gold" | "green" | "cyan" | "violet" | "red" | "neutral";

const tones: Record<Tone,{border:string;text:string;bg:string}> = {
  orange:{border:"border-[#ff6a00]/30",text:"text-[#ff8b3d]",bg:"bg-[#160c07]"},
  gold:{border:"border-[#f6c453]/30",text:"text-[#f6c453]",bg:"bg-[#151006]"},
  green:{border:"border-[#22c55e]/30",text:"text-[#22c55e]",bg:"bg-[#07120b]"},
  cyan:{border:"border-[#4cc6f0]/30",text:"text-[#4cc6f0]",bg:"bg-[#071318]"},
  violet:{border:"border-[#b58cff]/30",text:"text-[#b58cff]",bg:"bg-[#15101c]"},
  red:{border:"border-[#ef4444]/30",text:"text-[#f87171]",bg:"bg-[#180909]"},
  neutral:{border:"border-white/12",text:"text-white/65",bg:"bg-[#0d0d0f]"},
};

const focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6c453] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0c]";

export function ContextStrip({role,workspace,objectId,status,tone="orange"}:{role:string;workspace:string;objectId:string;status:string;tone?:Tone}) {
  const t=tones[tone];
  return <div className={`grid gap-3 border ${t.border} ${t.bg} px-4 py-3 text-xs sm:grid-cols-[auto_1fr_auto_auto] sm:items-center`} aria-label={`${role} workspace context`}>
    <span className={`font-black uppercase tracking-[.16em] ${t.text}`}>{role}</span>
    <span className="text-white/70">{workspace}</span>
    <span className="font-mono text-[11px] text-white/50">{objectId}</span>
    <span className={`font-bold ${t.text}`} role="status">{status}</span>
  </div>;
}

export function WorkObject({eyebrow,title,summary,fields,children,tone="neutral"}:{eyebrow:string;title:string;summary?:string;fields:Array<[string,string]>;children?:ReactNode;tone?:Tone}) {
  const t=tones[tone];
  return <section className={`overflow-hidden rounded-[1.75rem] border ${t.border} ${t.bg}`} aria-label={eyebrow}>
    <div className="border-b border-white/8 p-6 sm:p-7">
      <p className={`text-[11px] font-black uppercase tracking-[.18em] ${t.text}`}>{eyebrow}</p>
      <h3 className="mt-3 max-w-3xl font-serif text-3xl font-bold leading-[1.02] sm:text-4xl">{title}</h3>
      {summary && <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">{summary}</p>}
    </div>
    <dl className="grid gap-px bg-white/8 sm:grid-cols-2">
      {fields.map(([label,value])=><div key={label} className="bg-[#0b0b0c] p-5"><dt className="text-[10px] font-black uppercase tracking-[.14em] text-white/48">{label}</dt><dd className="mt-2 text-sm font-bold text-white/90">{value}</dd></div>)}
    </dl>
    {children && <div className="border-t border-white/8 p-6">{children}</div>}
  </section>;
}

export function EvidenceObject({type,title,rows,state="recorded",tone="green"}:{type:string;title:string;rows:Array<[string,string]>;state?:string;tone?:Tone}) {
  const t=tones[tone];
  return <section className={`relative overflow-hidden border ${t.border} bg-[#f1e5cf] text-[#17130f] shadow-[0_24px_70px_rgba(0,0,0,.28)]`} aria-label={type}>
    <div className="absolute inset-x-0 top-0 h-2 bg-[radial-gradient(circle_at_6px_-1px,transparent_6px,#f1e5cf_6px)] bg-[length:12px_12px]"/>
    <div className="p-6 pt-8 sm:p-7 sm:pt-9">
      <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#764b37]">{type}</p><h3 className="mt-2 font-serif text-3xl font-black">{title}</h3></div><FileCheck2 className="h-6 w-6 text-[#9d3f1f]" aria-hidden="true"/></div>
      <div className="my-5 border-t border-dashed border-black/20"/>
      <dl className="space-y-2 font-mono text-[12px]">{rows.map(([a,b])=><div key={a} className="flex justify-between gap-6 border-b border-black/8 pb-2"><dt className="text-black/58">{a}</dt><dd className="text-right font-bold">{b}</dd></div>)}</dl>
      <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4"><span className="text-[10px] font-black uppercase tracking-[.14em] text-black/52">State residue</span><span className="font-mono text-[11px] font-bold uppercase" role="status">{state}</span></div>
    </div>
  </section>;
}

export function LifecycleRail({states,active,onSelect,tone="orange"}:{states:string[];active:string;onSelect?:(s:string)=>void;tone?:Tone}) {
  const t=tones[tone];
  return <nav className="overflow-x-auto" aria-label="Workflow lifecycle"><div className="flex min-w-max items-center gap-2 py-2">
    {states.map((s,i)=>{const current=s===active; return <button key={s} type="button" onClick={()=>onSelect?.(s)} aria-current={current?"step":undefined} className={`group flex min-h-11 items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-black uppercase tracking-[.11em] transition motion-reduce:transition-none ${focus} ${current?`${t.border} ${t.bg} ${t.text}`:"border-white/12 text-white/55 hover:text-white"}`}><span className={`grid h-6 w-6 place-items-center rounded-full border text-[10px] ${current?t.border:"border-white/18"}`}>{i+1}</span>{s}</button>})}
  </div></nav>;
}

export function TruthBoundary({label,left,right,tone="gold"}:{label:string;left:string;right:string;tone?:Tone}) {
  const t=tones[tone];
  return <aside className={`rounded-[1.25rem] border ${t.border} ${t.bg} p-5`} aria-label={label}><p className={`text-[10px] font-black uppercase tracking-[.14em] ${t.text}`}>{label}</p><div className="mt-4 grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]"><div className="rounded-xl border border-white/10 p-4 text-sm font-bold">{left}</div><ArrowRight className={`hidden h-4 w-4 sm:block ${t.text}`} aria-hidden="true"/><div className="rounded-xl border border-white/10 p-4 text-sm font-bold">{right}</div></div></aside>;
}

export function ExceptionBanner({title,detail,severity="Needs review"}:{title:string;detail:string;severity?:string}) {
  return <div className="flex gap-4 rounded-[1.25rem] border border-[#ef4444]/35 bg-[#170909] p-5" role="alert"><AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-[#f87171]" aria-hidden="true"/><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#f87171]">{severity}</p><p className="mt-1 font-bold">{title}</p><p className="mt-1 text-sm leading-5 text-white/68">{detail}</p></div></div>;
}

export function ResilienceBanner({mode,detail}:{mode:"offline"|"stale"|"permission"|"loading";detail:string}) {
  const map={offline:["Offline · actions held","border-[#f6c453]/30 bg-[#151006] text-[#f6c453]"],stale:["Data may be stale","border-[#4cc6f0]/30 bg-[#071318] text-[#4cc6f0]"],permission:["Permission limited","border-[#b58cff]/30 bg-[#15101c] text-[#b58cff]"],loading:["Checking latest state","border-white/14 bg-[#0d0d0f] text-white/70"]} as const;
  const [label,classes]=map[mode];
  return <div className={`flex gap-3 rounded-[1.15rem] border p-4 ${classes}`} role="status" aria-live="polite"><WifiOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true"/><div><p className="text-[10px] font-black uppercase tracking-[.13em]">{label}</p><p className="mt-1 text-sm text-white/70">{detail}</p></div></div>;
}

export function DecisionBar({primary,secondary,note,tone="orange",onPrimary,onSecondary,primaryDisabled=false}:{primary:string;secondary?:string;note:string;tone?:Tone;onPrimary?:()=>void;onSecondary?:()=>void;primaryDisabled?:boolean}) {
  const t=tones[tone];
  return <div className="grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-[1fr_auto]"><p className="text-xs leading-5 text-white/60">{note}</p><div className="flex flex-wrap gap-2">{secondary&&<button type="button" onClick={onSecondary} className={`min-h-11 rounded-full border border-white/18 px-4 py-2 text-xs font-bold text-white/78 ${focus}`}>{secondary}</button>}<button type="button" onClick={onPrimary} disabled={primaryDisabled} className={`min-h-11 rounded-full border px-4 py-2 text-xs font-black ${t.border} ${t.bg} ${t.text} ${focus} disabled:cursor-not-allowed disabled:opacity-45`}>{primary}</button></div></div>;
}

export function OperationalFacts({items}:{items:Array<{icon?:"clock"|"place"|"proof"|"money"|"person"|"status";label:string;value:string}>}) {
  const icons={clock:Clock3,place:MapPin,proof:ShieldCheck,money:CircleDollarSign,person:UserRoundCheck,status:BadgeCheck};
  return <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{items.map((item)=>{const Icon=item.icon?icons[item.icon]:Sparkles; return <div key={item.label} className="rounded-xl border border-white/10 bg-black/15 p-4"><dt className="flex items-center gap-2 text-white/48"><Icon className="h-4 w-4" aria-hidden="true"/><span className="text-[10px] font-black uppercase tracking-[.12em]">{item.label}</span></dt><dd className="mt-2 text-sm font-bold">{item.value}</dd></div>})}</dl>;
}

export function AuditStamp({label,time,actor}:{label:string;time:string;actor:string}) { return <div className="inline-flex flex-wrap items-center gap-3 rounded-full border border-[#22c55e]/25 bg-[#07120b] px-4 py-2 text-[11px]"><BadgeCheck className="h-4 w-4 text-[#22c55e]" aria-hidden="true"/><span className="font-black uppercase tracking-[.11em] text-[#22c55e]">{label}</span><span className="text-white/52">{time}</span><span className="text-white/68">{actor}</span></div>; }
