import { useMemo, useState } from "react";
import { BriefcaseBusiness, Building2, CircleAlert, Megaphone, ShieldCheck, Store, Users2 } from "lucide-react";
import { AuditStamp, ContextStrip, DecisionBar, EvidenceObject, ExceptionBanner, LifecycleRail, OperationalFacts, TruthBoundary, WorkObject, type Tone } from "./StakeholderComponentSystem";

type Role="Creator"|"Host"|"Merchant"|"Brand"|"Agency"|"Admin";
type RoleConfig={tone:Tone;states:string[];icon:any;workspace:string;current:string;failure:string};

const configs:Record<Role,RoleConfig>={
  Creator:{tone:"violet",states:["Offered","Accepted","Creating","Submitted","Revision","Approved","Settled"],icon:BriefcaseBusiness,workspace:"Creator Studio",current:"Submitted",failure:"Revision"},
  Host:{tone:"gold",states:["Plan","Published","Invites","Doors","Live","Exception","Proof close","Return"],icon:Users2,workspace:"Moment Ops",current:"Doors",failure:"Exception"},
  Merchant:{tone:"orange",states:["Inventory","Published","Claimed","Presented","Validated","Duplicate","Transaction","Repeat"],icon:Store,workspace:"Venue Console",current:"Presented",failure:"Duplicate"},
  Brand:{tone:"cyan",states:["Outcome","Ready","Funded","Live","Evidence","Weak proof","Decision","Scale"],icon:Megaphone,workspace:"Activation Room",current:"Evidence",failure:"Weak proof"},
  Agency:{tone:"violet",states:["Portfolio","Client","Preparing","Approval","Blocked","Live","Proof","Expansion"],icon:Building2,workspace:"Managed Client",current:"Approval",failure:"Blocked"},
  Admin:{tone:"red",states:["Queue","Case","Evidence","Escalated","Decision","Resolution","Audit","Closed"],icon:ShieldCheck,workspace:"Trust Operations",current:"Evidence",failure:"Escalated"},
};

function CreatorFlow({state,setState}:{state:string;setState:(s:string)=>void}){
  const revision=state==="Revision"; const approved=["Approved","Settled"].includes(state); const settled=state==="Settled";
  return <FlowFrame role="Creator" state={state} objectId="CB-0421" title="Flash Motors test-drive creator brief" subtitle="A creator should always know the work, proof requirement and reward before accepting." config={configs.Creator} setState={setState}>
    <div className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
      <WorkObject eyebrow="Creator brief · CB-0421" title="Drive verified test-drive interest." summary="Flash Motors · Move Jamaica · due Friday 4 PM" tone="violet" fields={[["Deliverable","1 vertical video + tracked booking link"],["Audience","Kingston auto / lifestyle"],["Proof contract","Approved post + attributable booking"],["Reward","40 Gems + reputation credit"]]}>
        <OperationalFacts items={[{icon:"clock",label:"Deadline",value:"Fri · 4:00 PM"},{icon:"person",label:"Reviewer",value:"Flash Motors"},{icon:"status",label:"Work state",value:state}]}/>
      </WorkObject>
      <EvidenceObject type={settled?"SETTLEMENT RECORD · SR-0421":approved?"APPROVAL RECORD · AR-0421":"PROOF SUBMISSION · PS-0421"} title={settled?"Work settled":approved?"Deliverable approved":"Submission under review"} state={settled?"settled":approved?"approved":revision?"revision required":"submitted"} tone="violet" rows={[["Deliverable","Video + tracked link"],["Action evidence","3 attributed bookings"],["Review",revision?"Revision: CTA disclosure missing":approved?"Approved · 3:22 PM":"Pending"],["Settlement",settled?"40 Gems posted":approved?"Queued":"Not available"]]}/>
    </div>
    {revision&&<ExceptionBanner title="Revision requested" detail="The tracked link works, but the required disclosure is missing from the published caption. Proof stays submitted; approval has not occurred." severity="Creator action required"/>}
    <TruthBoundary label="Truth boundary" left="Submission proves work was delivered" right="Approval proves the reviewer accepted it" tone="violet"/>
    <DecisionBar primary={revision?"Return to Creating":approved&&!settled?"Record settlement":"Advance state"} secondary="View brief" note="The interface must never imply creator earnings are settled merely because a deliverable was submitted." tone="violet" onPrimary={()=>setState(revision?"Creating":approved&&!settled?"Settled":next(configs.Creator.states,state))}/>
  </FlowFrame>;
}

function HostFlow({state,setState}:{state:string;setState:(s:string)=>void}){
  const exception=state==="Exception"; const closed=["Proof close","Return"].includes(state);
  return <FlowFrame role="Host" state={state} objectId="M-0918" title="AFTRHRS · Sea Deck" subtitle="The host operates time, arrivals and exceptions. RSVP intent must never become attendance proof by accident." config={configs.Host} setState={setState}>
    <div className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
      <WorkObject eyebrow="Run of show · M-0918" title="Tonight’s operating sheet." tone="gold" summary="Sea Deck · Barbican · doors 9:30 PM" fields={[["Doors prep","8:45 PM · staff ready"],["RSVP arrival","9:30–11:30 PM"],["Live state",state],["Proof close","1:30 AM · reconcile arrivals"]]}>
        <OperationalFacts items={[{icon:"person",label:"RSVP intent",value:"42"},{icon:"proof",label:"Verified arrival",value:closed?"39":"28"},{icon:"status",label:"Walk-ins",value:"7"}]}/>
      </WorkObject>
      <EvidenceObject type={closed?"ATTENDANCE CLOSE · AC-0918":"ARRIVAL LEDGER · AL-0918"} title={closed?"Attendance proof closed":"Doors are live"} state={closed?"verified attendance":"operating"} tone="gold" rows={[["RSVP records","42 intent"],["Verified check-ins",closed?"39":"28"],["Walk-ins","7"],["Exceptions",exception?"1 unresolved":"0 unresolved"]]}/>
    </div>
    {exception&&<ExceptionBanner title="Guest claim does not match RSVP record" detail="Do not convert this guest into verified attendance until the host resolves identity or records an explicit walk-in." severity="Door exception"/>}
    <TruthBoundary label="Attendance boundary" left="RSVP = intent to attend" right="Verified arrival = attendance proof" tone="gold"/>
    <DecisionBar primary={exception?"Resolve as walk-in":"Advance operation"} secondary="View arrivals" note="Door speed matters, but proof integrity must survive busy live operations." tone="gold" onPrimary={()=>setState(exception?"Live":next(configs.Host.states,state))}/>
  </FlowFrame>;
}

function MerchantFlow({state,setState}:{state:string;setState:(s:string)=>void}){
  const duplicate=state==="Duplicate"; const validated=["Validated","Transaction","Repeat"].includes(state); const transaction=["Transaction","Repeat"].includes(state);
  return <FlowFrame role="Merchant" state={state} objectId="OF-2031" title="Broken Plate lunch activation" subtitle="The merchant surface must distinguish claim, presentation, redemption and paid transaction." config={configs.Merchant} setState={setState}>
    <div className="grid gap-6 xl:grid-cols-[1.02fr_.98fr]">
      <WorkObject eyebrow="Live offer · OF-2031" title="20% off chef’s lunch menu" summary="Broken Plate · Liguanea · 12–3 PM" tone="orange" fields={[["Inventory","18 uses remaining"],["Presented object","PromoCard PC-004218"],["Validation rule","One merchant validation per eligible use"],["State",state]]}/>
      <EvidenceObject type={transaction?"TRANSACTION RECORD · TX-8821":"VALIDATION SLIP · VL-1182"} title={transaction?"Purchase evidence attached":validated?"Use verified":"Awaiting valid use"} state={transaction?"transaction recorded":validated?"merchant validated":duplicate?"held for review":"not verified"} tone="orange" rows={[["PromoCard","PC-004218"],["Offer","OF-2031"],["Validation",duplicate?"Duplicate timestamp conflict":validated?"Verified · 1:14 PM":"Pending"],["Transaction",transaction?"POS reference attached":"Not claimed"]]}/>
    </div>
    {duplicate&&<ExceptionBanner title="Possible duplicate validation" detail="A second validation attempt arrived with the same PromoCard and offer inside the cooling window. Reward settlement is held; the original record remains intact." severity="Proof conflict"/>}
    <TruthBoundary label="Commercial truth" left="Validated redemption = offer was used" right="Transaction record = purchase evidence exists" tone="orange"/>
    <DecisionBar primary={duplicate?"Keep original validation":validated&&!transaction?"Attach transaction":"Advance state"} secondary="Inspect history" note="PROMORANG should never equate a validated offer with revenue unless transaction evidence actually exists." tone="orange" onPrimary={()=>setState(duplicate?"Validated":validated&&!transaction?"Transaction":next(configs.Merchant.states,state))}/>
  </FlowFrame>;
}

function BrandFlow({state,setState}:{state:string;setState:(s:string)=>void}){
  const weak=state==="Weak proof"; const evidence=["Evidence","Weak proof","Decision","Scale"].includes(state);
  return <FlowFrame role="Brand" state={state} objectId="AC-5021" title="First 50 for Flash Motors" subtitle="A brand needs a clear outcome contract before launch and an honest evidence pack afterward." config={configs.Brand} setState={setState}>
    <div className="grid gap-6 xl:grid-cols-[1.02fr_.98fr]">
      <WorkObject eyebrow="Activation dossier · AC-5021" title="Move 50 people into verified test drives." summary="Flash Motors · Kingston · creator-assisted activation" tone="cyan" fields={[["Outcome","50 attributable test-drive actions"],["Audience","Kingston auto-curious adults"],["Proof contract","Booking + verified attendance"],["Funding","Reward inventory committed"]]}/>
      <EvidenceObject type="EVIDENCE PACK · EP-5021" title={weak?"Evidence is not strong enough yet":evidence?"What happened, with limits":"Evidence not available yet"} state={weak?"insufficient proof":evidence?"evidence assembled":"not started"} tone="cyan" rows={[["Bookings","18 verified intent records"],["Attendance",weak?"6 verified / 5 unmatched":"11 verified test drives"],["Creator proof","4 approved deliverables"],["Attribution",weak?"Mixed confidence":"Direct link + venue validation"]]}/>
    </div>
    {weak&&<ExceptionBanner title="Evidence confidence is below the decision threshold" detail="Five claimed test drives cannot yet be matched to a booking or venue validation. Show them as unresolved, not as completed outcomes." severity="Attribution limit"/>}
    <TruthBoundary label="Decision boundary" left="Evidence pack = observed proof" right="Scale decision = brand judgement" tone="cyan"/>
    <DecisionBar primary={weak?"Request evidence review":state==="Decision"?"Scale with changes":"Advance state"} secondary="Change activation" note="The system should support repeat/change/stop/scale without manufacturing a single success score." tone="cyan" onPrimary={()=>setState(weak?"Evidence":next(configs.Brand.states,state))}/>
  </FlowFrame>;
}

function AgencyFlow({state,setState}:{state:string;setState:(s:string)=>void}){
  const blocked=state==="Blocked";
  return <FlowFrame role="Agency" state={state} objectId="CL-PX-117" title="Pandxtra · managed client activation" subtitle="Agency control must stay explicit while client ownership and attribution remain intact." config={configs.Agency} setState={setState}>
    <div className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
      <WorkObject eyebrow="Client folio · CL-PX-117" title="Manchester Hills Foods" summary="Managed by Pandxtra · client workspace remains canonical" tone="violet" fields={[["Activation","September retail sampling"],["Client owner","Manchester Hills Foods"],["Agency role","Managed operator"],["Approval",blocked?"Blocked · client approval overdue":state]]}/>
      <EvidenceObject type="MANAGED RESULT PACK · MR-117" title={blocked?"Result pack cannot proceed":"Client proof remains attributable"} state={blocked?"blocked":"managed proof"} tone="violet" rows={[["Verified redemptions","37"],["Client attribution","Manchester Hills Foods"],["Managed by","Pandxtra"],["Next decision",blocked?"Obtain client approval":"Repeat with larger audience"]]}/>
    </div>
    {blocked&&<ExceptionBanner title="Client approval is overdue" detail="The agency can prepare the activation, but it cannot publish or alter client commitments until the client approval object is recorded." severity="Approval blocker"/>}
    <TruthBoundary label="Ownership boundary" left="Agency manages execution" right="Client owns activation and evidence" tone="violet"/>
    <DecisionBar primary={blocked?"Record client approval":"Advance client work"} secondary="Switch client" note="Persistent client context is a safety mechanism, not merely a breadcrumb." tone="violet" onPrimary={()=>setState(blocked?"Live":next(configs.Agency.states,state))}/>
  </FlowFrame>;
}

function AdminFlow({state,setState}:{state:string;setState:(s:string)=>void}){
  const escalated=state==="Escalated"; const resolved=["Resolution","Audit","Closed"].includes(state);
  return <FlowFrame role="Admin" state={state} objectId="EX-7712" title="Proof conflict · duplicate validation" subtitle="Admin opens on a case requiring intervention—not on generic telemetry." config={configs.Admin} setState={setState}>
    <div className="grid gap-6 xl:grid-cols-[1.04fr_.96fr]">
      <WorkObject eyebrow="Exception case · EX-7712" title="Duplicate merchant validation requires a decision." summary="One downstream reward settlement is held until proof is resolved." tone="red" fields={[["Severity","High"],["Object","Validation VL-1182"],["Conflict","Duplicate timestamp + same PromoCard"],["Owner","Operations trust queue"]]}>
        <OperationalFacts items={[{icon:"clock",label:"Opened",value:"9:18 AM"},{icon:"person",label:"Assigned",value:"Admin · Ops"},{icon:"status",label:"Case state",value:state}]}/>
      </WorkObject>
      <EvidenceObject type="CHAIN OF CUSTODY · EX-7712" title={resolved?"Resolution recorded":"Evidence preserved"} state={resolved?"resolved + audited":escalated?"escalated":"under review"} tone="red" rows={[["Original scan","1:14:02 PM · retained"],["Second scan","1:14:09 PM · conflicting"],["Reward settlement",resolved?"Released":"Held"],["Audit event",resolved?"AE-7712 written":"Pending"]]}/>
    </div>
    {escalated&&<ExceptionBanner title="Merchant evidence is insufficient for automatic resolution" detail="The case remains open and has been escalated. No reward or transaction state should silently change while evidence is incomplete." severity="Escalated case"/>}
    {resolved&&<AuditStamp label="Resolution written" time="9:41 AM" actor="Admin · Ops"/>}
    <TruthBoundary label="Control boundary" left="Admin decision changes downstream state" right="Audit event records who changed it and why" tone="red"/>
    <DecisionBar primary={escalated?"Resolve with original scan":resolved?"Close case":"Advance case"} secondary="Escalate" note="A resolution without an audit event is incomplete." tone="red" onPrimary={()=>setState(escalated?"Resolution":resolved?"Closed":next(configs.Admin.states,state))} onSecondary={()=>setState("Escalated")}/>
  </FlowFrame>;
}

function next(states:string[],state:string){const i=states.indexOf(state);return states[Math.min(i+1,states.length-1)];}

function FlowFrame({role,state,objectId,title,subtitle,config,setState,children}:{role:Role;state:string;objectId:string;title:string;subtitle:string;config:RoleConfig;setState:(s:string)=>void;children:any}){
  const Icon=config.icon;
  return <div className="space-y-6">
    <ContextStrip role={role} workspace={config.workspace} objectId={objectId} status={state} tone={config.tone}/>
    <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end"><div><div className="flex items-center gap-3"><Icon className="h-5 w-5 text-[#ff6a00]"/><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#ff6a00]">Workflow proof</p></div><h3 className="mt-3 max-w-4xl font-serif text-4xl font-bold leading-[.98] sm:text-5xl">{title}</h3><p className="mt-3 max-w-3xl text-sm leading-6 text-white/45">{subtitle}</p></div><CircleAlert className="hidden h-8 w-8 text-white/12 lg:block"/></div>
    <LifecycleRail states={config.states} active={state} onSelect={setState} tone={config.tone}/>
    {children}
  </div>;
}

function RoleFlow({role}:{role:Role}){
  const config=configs[role]; const [state,setState]=useState(config.current);
  const component=useMemo(()=>{switch(role){case"Creator":return <CreatorFlow state={state} setState={setState}/>;case"Host":return <HostFlow state={state} setState={setState}/>;case"Merchant":return <MerchantFlow state={state} setState={setState}/>;case"Brand":return <BrandFlow state={state} setState={setState}/>;case"Agency":return <AgencyFlow state={state} setState={setState}/>;case"Admin":return <AdminFlow state={state} setState={setState}/>;}},[role,state]);
  return component;
}

export function StakeholderWorkflowProofLab(){
  const roles:Role[]=["Creator","Host","Merchant","Brand","Agency","Admin"]; const [role,setRole]=useState<Role>("Creator");
  return <div className="space-y-10">
    <div className="grid gap-6 lg:grid-cols-[1fr_.55fr] lg:items-end"><div><p className="text-[10px] font-black uppercase tracking-[.28em] text-[#ff6a00]">Stakeholder workflow proof · iteration 03</p><h2 className="mt-4 max-w-5xl font-serif text-5xl font-bold leading-[.9] tracking-[-.05em] sm:text-7xl">Can the object survive the actual job?</h2></div><p className="border-l border-[#ff6a00]/30 pl-5 text-sm leading-6 text-white/45">This pass tests operations, failure states, truth boundaries and residue. It is intentionally less like a brand presentation and more like working software.</p></div>
    <div className="flex flex-wrap gap-2">{roles.map(r=><button key={r} onClick={()=>setRole(r)} className={`rounded-full border px-4 py-2 text-xs font-black ${r===role?"border-[#ff6a00]/45 bg-[#241108] text-[#ff8b3d]":"border-white/10 text-white/38"}`}>{r}</button>)}</div>
    <RoleFlow key={role} role={role}/>
    <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-4">{[["Recognition","The role-specific work object should remain identifiable without its page title."],["Truth","UI states cannot claim stronger proof than the underlying record."],["Failure","Every flow must have a believable blocked/revision/exception state."],["Residue","Completed work leaves an evidence, settlement, attendance, attribution or audit artifact."]].map(([a,b])=><div key={a} className="bg-[#0b0b0c] p-5"><p className="text-[9px] font-black uppercase tracking-[.15em] text-[#ff6a00]">{a}</p><p className="mt-2 text-sm leading-6 text-white/52">{b}</p></div>)}</div>
  </div>;
}
