import { useMemo, useState } from "react";
import { Accessibility, Laptop2, Smartphone, Wifi, WifiOff } from "lucide-react";
import { ContextStrip, DecisionBar, EvidenceObject, ExceptionBanner, OperationalFacts, ResilienceBanner, TruthBoundary, WorkObject, type Tone } from "./StakeholderComponentSystem";

type Role = "Merchant"|"Host"|"Creator"|"Brand"|"Agency"|"Admin";
type Network = "online"|"stale"|"offline";
type Permission = "full"|"limited";

const roles: Role[] = ["Merchant","Host","Creator","Brand","Agency","Admin"];
const tone: Record<Role,Tone> = { Merchant:"orange", Host:"gold", Creator:"violet", Brand:"cyan", Agency:"violet", Admin:"red" };

const roleData: Record<Role,{workspace:string;objectId:string;title:string;summary:string;fields:Array<[string,string]>;mobileJob:string;desktopJob:string;truth:[string,string,string];failure:string}> = {
  Merchant:{workspace:"Venue Console",objectId:"VL-1182",title:"Validate a presented benefit",summary:"Fast enough for a lunch queue, strict enough that a claim cannot silently become a purchase.",fields:[["Presented","PromoCard PC-004218"],["Offer","OF-2031 · 20% lunch"],["Place","Broken Plate · Liguanea"],["Action","Validate eligible use"]],mobileJob:"Scan, validate, recover from duplicate/offline conflict with one hand.",desktopJob:"Inspect history, inventory, transaction evidence and unresolved conflicts.",truth:["Commercial truth","Validated redemption = offer used","Transaction record = purchase evidence exists"],failure:"Duplicate validation inside cooling window · settlement held"},
  Host:{workspace:"Moment Ops",objectId:"AL-0918",title:"Operate arrivals without weakening proof",summary:"The door experience must stay fast while keeping RSVP intent separate from verified attendance.",fields:[["Moment","AFTRHRS · Sea Deck"],["RSVP","42 intent records"],["Verified","28 arrivals"],["Window","9:30–11:30 PM"]],mobileJob:"Check in, resolve identity mismatch, record walk-ins and keep the line moving.",desktopJob:"Reconcile attendance, inspect exceptions and close participation proof.",truth:["Attendance truth","RSVP = intent","Verified arrival = attendance proof"],failure:"Guest claim does not match RSVP identity · unresolved arrival"},
  Creator:{workspace:"Creator Studio",objectId:"PS-0421",title:"Submit proof and understand what happens next",summary:"Submission, revision, approval and settlement must remain separate even on a small screen.",fields:[["Brief","CB-0421"],["Deliverable","Vertical video + tracked link"],["State","Submitted"],["Reward","40 Gems after approval"]],mobileJob:"Submit proof, read revision requirements and check settlement state.",desktopJob:"Compare brief requirements, evidence, revisions and work history.",truth:["Creator truth","Submitted = work delivered","Settled = approved value posted"],failure:"Revision requested · required disclosure missing"},
  Brand:{workspace:"Activation Room",objectId:"EP-5021",title:"Inspect evidence without turning uncertainty into success",summary:"The evidence pack should stay usable when attribution is partial, delayed or contested.",fields:[["Activation","First 50 for Flash Motors"],["Bookings","18 verified intent"],["Attendance","11 verified test drives"],["Confidence","Mixed / reviewable"]],mobileJob:"Read the headline evidence and approve a next decision.",desktopJob:"Compare attribution, creator proof, venue proof and unresolved actions side-by-side.",truth:["Decision truth","Evidence pack = observed proof","Scale decision = brand judgement"],failure:"Five claimed test drives remain unmatched"},
  Agency:{workspace:"Managed Client",objectId:"CL-PX-117",title:"Operate for a client without losing client truth",summary:"Context must remain persistent across approvals, proof and expansion decisions.",fields:[["Client","Manchester Hills Foods"],["Agency","Pandxtra"],["Activation","September retail sampling"],["Approval","Client-owned commitment"]],mobileJob:"Check approval blockers and urgent managed-client actions.",desktopJob:"Operate portfolio, evidence comparison and managed result packs.",truth:["Ownership truth","Agency manages execution","Client owns activation and evidence"],failure:"Client approval overdue · publish held"},
  Admin:{workspace:"Trust Operations",objectId:"EX-7712",title:"Resolve an exception without rewriting history",summary:"Urgent triage can happen on mobile; evidence review and overrides require explicit permission and audit residue.",fields:[["Severity","High"],["Object","Validation VL-1182"],["Impact","Reward settlement held"],["Owner","Operations trust queue"]],mobileJob:"Triage severity, assign owner, hold downstream action and escalate.",desktopJob:"Inspect evidence, compare chain-of-custody and record resolution.",truth:["Control truth","Decision changes downstream state","Audit records who changed it and why"],failure:"Evidence insufficient for automatic resolution"},
};

export function StakeholderResilienceLab(){
  const [role,setRole]=useState<Role>("Merchant");
  const [device,setDevice]=useState<"mobile"|"desktop">("mobile");
  const [network,setNetwork]=useState<Network>("online");
  const [permission,setPermission]=useState<Permission>("full");
  const data=roleData[role];
  const held=network==="offline" || permission==="limited";
  const resilience=useMemo(()=> network==="offline"?{mode:"offline" as const,detail:"Do not invent a successful action. Queue the attempt locally only if the production record model can reconcile it safely; otherwise hold and retry."}:network==="stale"?{mode:"stale" as const,detail:"The last confirmed server state is older than the operating threshold. Show the timestamp and require refresh before irreversible action."}:permission==="limited"?{mode:"permission" as const,detail:"This account may inspect the object but cannot perform the irreversible decision shown in the full-permission state."}:null,[network,permission]);

  return <section className="space-y-10 border-t border-white/10 pt-24">
    <div className="grid gap-7 lg:grid-cols-[1fr_.52fr] lg:items-end">
      <div><p className="text-[10px] font-black uppercase tracking-[.3em] text-[#ff6a00]">Stakeholder resilience lab · iteration 04</p><h2 className="mt-4 max-w-5xl font-serif text-5xl font-bold leading-[.9] tracking-[-.055em] md:text-7xl">The workflow must survive the real operating environment.</h2></div>
      <div className="border-l border-[#ff6a00]/35 pl-5"><p className="font-serif text-2xl font-bold text-[#f6d48a]">Mobile pressure → stale/offline truth → permissions → recovery</p><p className="mt-3 text-sm leading-6 text-white/55">This is not a visual variant study. It stress-tests the same canonical objects under the constraints that break real operational software.</p></div>
    </div>

    <div className="grid gap-4 xl:grid-cols-[1fr_auto_auto_auto] xl:items-end">
      <div><p className="mb-2 text-[10px] font-black uppercase tracking-[.14em] text-white/45">Role</p><div className="flex flex-wrap gap-2">{roles.map(r=><button key={r} type="button" onClick={()=>setRole(r)} className={`min-h-11 rounded-full border px-4 py-2 text-xs font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6c453] ${role===r?"border-[#ff6a00]/55 bg-[#ff6a00]/10 text-[#ff9a4d]":"border-white/12 text-white/60"}`}>{r}</button>)}</div></div>
      <div><p className="mb-2 text-[10px] font-black uppercase tracking-[.14em] text-white/45">Operating context</p><div className="flex gap-2"><button type="button" onClick={()=>setDevice("mobile")} aria-pressed={device==="mobile"} className={`min-h-11 rounded-full border px-4 py-2 text-xs font-bold ${device==="mobile"?"border-[#f6c453]/45 text-[#f6c453]":"border-white/12 text-white/55"}`}><Smartphone className="mr-2 inline h-4 w-4"/>Mobile</button><button type="button" onClick={()=>setDevice("desktop")} aria-pressed={device==="desktop"} className={`min-h-11 rounded-full border px-4 py-2 text-xs font-bold ${device==="desktop"?"border-[#f6c453]/45 text-[#f6c453]":"border-white/12 text-white/55"}`}><Laptop2 className="mr-2 inline h-4 w-4"/>Desktop</button></div></div>
      <div><p className="mb-2 text-[10px] font-black uppercase tracking-[.14em] text-white/45">Network</p><select value={network} onChange={e=>setNetwork(e.target.value as Network)} className="min-h-11 rounded-xl border border-white/14 bg-[#0d0d0f] px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6c453]"><option value="online">Online / current</option><option value="stale">Online / stale</option><option value="offline">Offline</option></select></div>
      <div><p className="mb-2 text-[10px] font-black uppercase tracking-[.14em] text-white/45">Permission</p><select value={permission} onChange={e=>setPermission(e.target.value as Permission)} className="min-h-11 rounded-xl border border-white/14 bg-[#0d0d0f] px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6c453]"><option value="full">Full role permission</option><option value="limited">View / propose only</option></select></div>
    </div>

    <div className={device==="mobile"?"mx-auto max-w-[430px]":"mx-auto max-w-[1320px]"}>
      <div className="space-y-5 rounded-[2rem] border border-white/10 bg-[#09090a] p-4 sm:p-6">
        <ContextStrip role={role} workspace={data.workspace} objectId={data.objectId} status={`${device} · ${network}`} tone={tone[role]}/>
        {resilience&&<ResilienceBanner mode={resilience.mode} detail={resilience.detail}/>} 
        <div className={device==="desktop"?"grid gap-6 lg:grid-cols-[1.05fr_.95fr]":"space-y-5"}>
          <WorkObject eyebrow={`${role} operating object`} title={data.title} summary={data.summary} tone={tone[role]} fields={data.fields}>
            <OperationalFacts items={[{icon:"status",label:"Operating job",value:device==="mobile"?data.mobileJob:data.desktopJob},{icon:"clock",label:"Last confirmed",value:network==="stale"?"7 min ago":"Now"},{icon:"proof",label:"Write permission",value:permission==="full"?"Allowed for this role":"View / propose only"}]}/>
          </WorkObject>
          <EvidenceObject type={`${role.toUpperCase()} EVIDENCE · ${data.objectId}`} title={network==="offline"?"No new proof has been committed":permission==="limited"?"Evidence visible · decision restricted":"Latest confirmed evidence"} state={network==="stale"?"stale · refresh required":network==="offline"?"offline · uncommitted":"server confirmed"} tone={tone[role]} rows={[["Object",data.objectId],["Network",network],["Permission",permission],["Failure rehearsal",data.failure]]}/>
        </div>
        <ExceptionBanner title={data.failure} detail="Failure states keep the last confirmed truth visible and make the recovery actor/action explicit. Unresolved state must not be silently promoted." severity="Failure rehearsal"/>
        <TruthBoundary label={data.truth[0]} left={data.truth[1]} right={data.truth[2]} tone={tone[role]}/>
        <DecisionBar primary={held?"Action held":"Commit next state"} secondary="Inspect evidence" note={held?"The irreversible action is unavailable until connectivity/permission is restored. The last confirmed record remains canonical.":"Keyboard focus, non-color state cues and a minimum 44px target are part of the component contract."} tone={tone[role]} primaryDisabled={held}/>
      </div>
    </div>

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-[1.5rem] border border-white/10 p-5"><Accessibility className="h-5 w-5 text-[#f6c453]"/><p className="mt-4 text-[10px] font-black uppercase tracking-[.14em] text-white/45">Accessibility contract</p><p className="mt-2 text-sm leading-6 text-white/68">Visible focus, semantic status/alert regions, non-color cues, readable metadata, reduced-motion-safe transitions and 44px operating targets.</p></div>
      <div className="rounded-[1.5rem] border border-white/10 p-5"><WifiOff className="h-5 w-5 text-[#f6c453]"/><p className="mt-4 text-[10px] font-black uppercase tracking-[.14em] text-white/45">Offline contract</p><p className="mt-2 text-sm leading-6 text-white/68">Never invent proof while disconnected. Preserve last confirmed truth, label pending local intent separately, and reconcile explicitly.</p></div>
      <div className="rounded-[1.5rem] border border-white/10 p-5"><Wifi className="h-5 w-5 text-[#4cc6f0]"/><p className="mt-4 text-[10px] font-black uppercase tracking-[.14em] text-white/45">Stale-data contract</p><p className="mt-2 text-sm leading-6 text-white/68">Operational states with financial, attendance or validation consequences carry a freshness timestamp and block risky writes when stale.</p></div>
      <div className="rounded-[1.5rem] border border-white/10 p-5"><Laptop2 className="h-5 w-5 text-[#b58cff]"/><p className="mt-4 text-[10px] font-black uppercase tracking-[.14em] text-white/45">Responsive contract</p><p className="mt-2 text-sm leading-6 text-white/68">Mobile optimizes the immediate operation. Desktop adds evidence comparison, history and batch context; neither is a scaled copy of the other.</p></div>
    </div>
  </section>;
}
