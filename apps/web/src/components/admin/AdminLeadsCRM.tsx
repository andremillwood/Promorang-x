import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CalendarClock, Check, CircleDollarSign, Filter, Mail, MessageSquarePlus, Search, Target, UserRound, Users } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

const stages = ["new", "qualified", "contacted", "discovery", "proposal", "won", "lost", "nurture"];
const STAGE_LABEL: Record<string, TranslationKey> = {
  new: "leadsDesk.stNew",
  qualified: "leadsDesk.stQualified",
  contacted: "leadsDesk.stContacted",
  discovery: "leadsDesk.stDiscovery",
  proposal: "leadsDesk.stProposal",
  won: "leadsDesk.stWon",
  lost: "leadsDesk.stLost",
  nurture: "leadsDesk.stNurture",
};
const STAKEHOLDER_LABEL: Record<string, TranslationKey> = {
  participant: "leadsDesk.shPart",
  host: "leadsDesk.shHost",
  merchant: "leadsDesk.shMerch",
  creator: "leadsDesk.shCre",
  brand: "leadsDesk.shBrand",
  agency: "leadsDesk.shAgency",
};
const FUNNEL_LABEL: Record<string, TranslationKey> = {
  scene: "leadsDesk.fnScene",
  moment: "leadsDesk.fnMoment",
  demand: "leadsDesk.fnDemand",
  creator: "leadsDesk.fnCreator",
  sponsor: "leadsDesk.fnSponsor",
};

async function crmRequest(path: string, options: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const response = await fetch(`${API_BASE_URL}/leads/admin${path}`, { ...options, headers: { Authorization:`Bearer ${data.session?.access_token}`,"Content-Type":"application/json",...(options.headers||{}) } });
  const payload = await response.json(); if (!response.ok) throw new Error(payload.error || "CRM request failed"); return payload.data;
}

export function AdminLeadsCRM() {
  const { t, formatNumber, formatDate } = useI18n();
  const qc = useQueryClient();
  const [filters,setFilters] = useState({search:"",stage:"all",stakeholder:"all",funnel:"all"});
  const [selected,setSelected] = useState<string|null>(null);
  const [note,setNote] = useState(""); const [task,setTask] = useState("");
  const params = new URLSearchParams(filters).toString();
  const summary = useQuery({queryKey:["crm-summary"],queryFn:()=>crmRequest("/summary")});
  const leads = useQuery({queryKey:["crm-leads",filters],queryFn:()=>crmRequest(`?${params}`)});
  const detail = useQuery({queryKey:["crm-lead",selected],queryFn:()=>crmRequest(`/${selected}`),enabled:!!selected});
  const refresh = () => { qc.invalidateQueries({queryKey:["crm-summary"]}); qc.invalidateQueries({queryKey:["crm-leads"]}); qc.invalidateQueries({queryKey:["crm-lead",selected]}); };
  const update = useMutation({mutationFn:(body:Record<string,unknown>)=>crmRequest(`/${selected}`,{method:"PATCH",body:JSON.stringify(body)}),onSuccess:refresh});
  const addNote = useMutation({mutationFn:()=>crmRequest(`/${selected}/notes`,{method:"POST",body:JSON.stringify({body:note})}),onSuccess:()=>{setNote("");refresh();}});
  const addTask = useMutation({mutationFn:()=>crmRequest(`/${selected}/tasks`,{method:"POST",body:JSON.stringify({title:task,priority:"normal"})}),onSuccess:()=>{setTask("");refresh();}});
  const completeTask = useMutation({mutationFn:(taskId:string)=>crmRequest(`/${selected}/tasks/${taskId}`,{method:"PATCH",body:JSON.stringify({status:"complete"})}),onSuccess:refresh});
  const rows = useMemo(() => leads.data?.leads || [], [leads.data?.leads]);
  const pipeline = useMemo(()=>stages.slice(0,6).map(stage=>({stage,leads:rows.filter((lead:any)=>lead.lifecycle_stage===stage)})),[rows]);
  const money = (value: number) => formatNumber(value || 0, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const when = (value?: string) => value ? formatDate(value) : t("leadsDesk.notSet");

  if (summary.isLoading) return <div className="grid gap-4 md:grid-cols-4">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-32 rounded-2xl"/>)}</div>;
  if (summary.error) return <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">{(summary.error as Error).message}. Apply the lead CRM migration and deploy the leads API.</div>;
  const s=summary.data||{};

  return <div className="space-y-7">
    <header className="overflow-hidden rounded-[2rem] border bg-[radial-gradient(circle_at_85%_0%,hsl(var(--primary)/.2),transparent_34%),hsl(var(--card))] p-6 sm:p-8">
      <p className="text-xs font-black uppercase tracking-[.2em] text-primary">{t("leadsDesk.eyebrow")}</p>
      <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end"><div><h2 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">{t("leadsDesk.title")}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{t("leadsDesk.copy")}</p></div><div className="rounded-2xl border bg-background/80 px-5 py-4"><p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{t("leadsDesk.attention")}</p><p className="mt-1 text-3xl font-black text-primary">{s.overdue||0}</p><p className="text-xs text-muted-foreground">{t("leadsDesk.overdue")}</p></div></div>
    </header>

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[[t("leadsDesk.total"),s.total,Users],[t("leadsDesk.qualified"),s.qualified,Target],[t("leadsDesk.pipeline"),money(s.openPipelineValue),CircleDollarSign],[t("leadsDesk.won"),money(s.wonValue),Check]].map(([label,value,Icon]:any)=><article key={label} className="rounded-2xl border bg-card p-5"><Icon className="h-5 w-5 text-primary"/><p className="mt-6 text-3xl font-black">{value}</p><p className="text-xs text-muted-foreground">{label}</p></article>)}
    </section>

    <section className="rounded-2xl border bg-card p-4">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted-foreground"><Filter className="h-4 w-4"/>{t("leadsDesk.shape")}</div>
      <div className="mt-3 grid gap-3 md:grid-cols-[1fr_repeat(3,180px)]"><label className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground"/><Input aria-label={t("leadsDesk.searchAria")} className="pl-9" placeholder={t("leadsDesk.search")} value={filters.search} onChange={e=>setFilters({...filters,search:e.target.value})}/></label>
        <select aria-label={t("leadsDesk.allStages")} className="h-10 rounded-md border bg-background px-3 text-sm" value={filters.stage} onChange={e=>setFilters({...filters,stage:e.target.value})}><option value="all">{t("leadsDesk.allStages")}</option>{stages.map(v=><option key={v} value={v}>{t(STAGE_LABEL[v])}</option>)}</select>
        <select aria-label={t("leadsDesk.allStakeholders")} className="h-10 rounded-md border bg-background px-3 text-sm" value={filters.stakeholder} onChange={e=>setFilters({...filters,stakeholder:e.target.value})}><option value="all">{t("leadsDesk.allStakeholders")}</option>{Object.keys(STAKEHOLDER_LABEL).map(v=><option key={v} value={v}>{t(STAKEHOLDER_LABEL[v])}</option>)}</select>
        <select aria-label={t("leadsDesk.allFunnels")} className="h-10 rounded-md border bg-background px-3 text-sm" value={filters.funnel} onChange={e=>setFilters({...filters,funnel:e.target.value})}><option value="all">{t("leadsDesk.allFunnels")}</option>{Object.keys(FUNNEL_LABEL).map(v=><option key={v} value={v}>{t(FUNNEL_LABEL[v])}</option>)}</select>
      </div>
    </section>

    {leads.isLoading ? <Skeleton className="h-96 rounded-2xl"/> : !rows.length ? <section className="rounded-2xl border border-dashed p-16 text-center"><UserRound className="mx-auto h-8 w-8 text-primary"/><h3 className="mt-4 text-xl font-bold">{t("leadsDesk.empty")}</h3><p className="mt-2 text-sm text-muted-foreground">{t("leadsDesk.emptyCopy")}</p></section> : <section className="overflow-x-auto pb-3"><div className="grid min-w-[1180px] grid-cols-6 gap-3">{pipeline.map(column=><div key={column.stage} className="rounded-2xl bg-muted/45 p-2"><div className="flex items-center justify-between px-2 py-2"><p className="text-xs font-black uppercase tracking-wider">{t(STAGE_LABEL[column.stage])}</p><span className="rounded-full bg-background px-2 py-1 text-[10px] font-bold">{column.leads.length}</span></div><div className="space-y-2">{column.leads.map((lead:any)=><button key={lead.id} onClick={()=>setSelected(lead.id)} className="w-full rounded-xl border bg-card p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><div className="flex items-center justify-between gap-2"><span className="rounded-full bg-primary/10 px-2 py-1 text-[9px] font-black uppercase text-primary">{t("leadsDesk.fit", { n: lead.qualification_score })}</span><span className="text-[9px] text-muted-foreground">{when(lead.last_captured_at)}</span></div><h3 className="mt-3 truncate font-bold">{lead.full_name||lead.email.split("@")[0]}</h3><p className="truncate text-[11px] text-muted-foreground">{lead.organization_name||lead.email}</p><p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">{lead.result_insight}</p><div className="mt-3 border-t pt-2 text-[10px] font-bold text-muted-foreground">{t(STAKEHOLDER_LABEL[lead.stakeholder_type] || "leadsDesk.shPart")} · {t(FUNNEL_LABEL[lead.funnel_key] || "leadsDesk.fnScene")}</div></button>)}</div></div>)}</div></section>}

    <Sheet open={!!selected} onOpenChange={open=>!open&&setSelected(null)}><SheetContent className="w-[min(96vw,48rem)] sm:max-w-3xl"><SheetHeader><SheetTitle className="font-serif text-3xl">{detail.data?.lead?.full_name||detail.data?.lead?.email||t("leadsDesk.record")}</SheetTitle><SheetDescription>{detail.data?.lead?.organization_name||(detail.data?.lead?.funnel_key ? t(FUNNEL_LABEL[detail.data.lead.funnel_key] || "leadsDesk.fnScene") : "")} · {t("leadsDesk.qualRel")}</SheetDescription></SheetHeader>{detail.isLoading?<Skeleton className="mt-6 h-96"/>:detail.data&&<LeadDetail data={detail.data} update={update} note={note} setNote={setNote} task={task} setTask={setTask} addNote={addNote} addTask={addTask} completeTask={completeTask}/>}</SheetContent></Sheet>
  </div>;
}

function LeadDetail({data,update,note,setNote,task,setTask,addNote,addTask,completeTask}:any){
  const { t, formatDate } = useI18n();
  const lead=data.lead;
  const when = (value?: string) => value ? formatDate(value) : t("leadsDesk.notSet");
  return <div className="mt-6 space-y-6 pb-8">
  <div className="grid grid-cols-3 gap-2"><div className="rounded-xl bg-primary p-4 text-primary-foreground"><p className="text-3xl font-black">{lead.qualification_score}</p><p className="text-[10px] font-black uppercase">{t("leadsDesk.qualification")}</p></div><div className="rounded-xl border p-4"><p className="text-3xl font-black">{lead.diagnostic_score}</p><p className="text-[10px] font-black uppercase text-muted-foreground">{t("leadsDesk.diagnostic")}</p></div><div className="rounded-xl border p-4"><p className="text-3xl font-black">{lead.capture_count}</p><p className="text-[10px] font-black uppercase text-muted-foreground">{t("leadsDesk.captures")}</p></div></div>
  <section className="rounded-2xl border p-5"><div className="flex flex-wrap items-center gap-2"><a href={`mailto:${lead.email}`} className="inline-flex items-center gap-2 font-bold text-primary"><Mail className="h-4 w-4"/>{lead.email}</a>{lead.phone&&<span className="text-sm text-muted-foreground">· {lead.phone}</span>}</div><h3 className="mt-5 font-serif text-2xl font-bold">{lead.result_name}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{lead.result_insight}</p><div className="mt-4 flex flex-wrap gap-2">{Object.entries(lead.answers||{}).map(([key,value])=><span key={key} className="rounded-full bg-muted px-3 py-1 text-[11px]"><b className="capitalize">{key}:</b> {String(value)}</span>)}</div></section>
  <section className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold">{t("leadsDesk.stage")}<select className="mt-1 h-11 w-full rounded-lg border bg-background px-3 text-sm" value={lead.lifecycle_stage} onChange={e=>update.mutate({lifecycleStage:e.target.value})}>{stages.map(s=><option key={s} value={s}>{t(STAGE_LABEL[s])}</option>)}</select></label><label className="text-xs font-bold">{t("leadsDesk.followUp")}<Input className="mt-1" type="datetime-local" defaultValue={lead.next_follow_up_at?.slice(0,16)||""} onBlur={e=>update.mutate({nextFollowUpAt:e.target.value?new Date(e.target.value).toISOString():null})}/></label><label className="text-xs font-bold">{t("leadsDesk.estValue")}<Input className="mt-1" type="number" min="0" defaultValue={lead.estimated_value||""} onBlur={e=>update.mutate({estimatedValue:e.target.value})}/></label><label className="text-xs font-bold">{t("leadsDesk.realized")}<Input className="mt-1" type="number" min="0" defaultValue={lead.realized_value||""} onBlur={e=>update.mutate({realizedValue:e.target.value})}/></label></section>
  <section className="rounded-2xl border p-5"><h3 className="flex items-center gap-2 font-bold"><MessageSquarePlus className="h-4 w-4 text-primary"/>{t("leadsDesk.notes")}</h3><form className="mt-3 flex gap-2" onSubmit={(e:FormEvent)=>{e.preventDefault();addNote.mutate();}}><Input value={note} onChange={e=>setNote(e.target.value)} placeholder={t("leadsDesk.notePh")} required/><Button disabled={addNote.isPending}>{t("leadsDesk.add")}</Button></form></section>
  <section className="rounded-2xl border p-5"><h3 className="flex items-center gap-2 font-bold"><CalendarClock className="h-4 w-4 text-primary"/>{t("leadsDesk.next")}</h3><form className="mt-3 flex gap-2" onSubmit={(e:FormEvent)=>{e.preventDefault();addTask.mutate();}}><Input value={task} onChange={e=>setTask(e.target.value)} placeholder={t("leadsDesk.taskPh")} required/><Button disabled={addTask.isPending}>{t("leadsDesk.create")}</Button></form><div className="mt-3 space-y-2">{data.tasks.map((item:any)=><div key={item.id} className="flex items-center justify-between rounded-xl bg-muted/50 p-3 text-sm"><span className={item.status==="complete"?"line-through text-muted-foreground":"font-medium"}>{item.title}</span>{item.status==="open"&&<button onClick={()=>completeTask.mutate(item.id)} className="text-xs font-bold text-primary">{t("leadsDesk.complete")}</button>}</div>)}</div></section>
  <section><h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">{t("leadsDesk.timeline")}</h3><div className="mt-3 border-l pl-5">{data.activities.map((a:any)=><article key={a.id} className="relative border-b py-3 before:absolute before:-left-[25px] before:top-5 before:h-2 before:w-2 before:rounded-full before:bg-primary"><div className="flex justify-between gap-3"><p className="text-sm font-bold">{a.title}</p><time className="text-[10px] text-muted-foreground">{when(a.created_at)}</time></div>{a.body&&<p className="mt-1 text-xs leading-5 text-muted-foreground">{a.body}</p>}</article>)}</div></section>
  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-5 text-muted-foreground"><AlertCircle className="mb-2 h-4 w-4 text-amber-600"/>{t("leadsDesk.consent")} <b>{lead.marketing_consent?t("leadsDesk.granted"):t("leadsDesk.notGranted")}</b>. {t("leadsDesk.consentNote")}</div>
  </div>;
}
