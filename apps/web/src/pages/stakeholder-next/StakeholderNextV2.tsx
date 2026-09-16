import React from "react";
import { NavLink, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  FileText,
  Fingerprint,
  FolderKanban,
  Handshake,
  MapPin,
  Megaphone,
  PackageCheck,
  QrCode,
  Radio,
  Scale,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Target,
  TrendingUp,
  UserRoundCheck,
  Users,
  WandSparkles,
} from "lucide-react";
import { PromorangMark } from "@/components/promorang/PromorangMark";
import "@/stakeholder-next-v2.css";

type RoleKey = "creator" | "host" | "merchant" | "brand" | "agency" | "admin";
type Surface = { key: string; label: string; hint: string; icon: React.ComponentType<{ className?: string }> };
type RoleConfig = {
  label: string;
  title: string;
  promise: string;
  context: string;
  move: string;
  moveDetail: string;
  surfaces: Surface[];
};

const roles: Record<RoleKey, RoleConfig> = {
  creator: {
    label: "Creator",
    title: "Make useful work. Prove what it moved.",
    promise: "From opportunity to approved work without turning creativity into dashboard administration.",
    context: "Creator workspace · Kingston",
    move: "Finish the Broken Plate brief",
    moveDetail: "1 reel due today · proof requires a published link + attributable action evidence",
    surfaces: [
      { key: "today", label: "Today", hint: "What needs you now", icon: Sparkles },
      { key: "work", label: "Work", hint: "Opportunities + briefs", icon: Target },
      { key: "create", label: "Create", hint: "Deliverables + submission", icon: WandSparkles },
      { key: "proof", label: "Proof", hint: "What your work caused", icon: FileCheck2 },
      { key: "value", label: "Value", hint: "Earnings + reputation", icon: CircleDollarSign },
    ],
  },
  host: {
    label: "Host",
    title: "Fill it. Run it. Prove who came.",
    promise: "Operate a Moment from run sheet to proof close without confusing demand with attendance.",
    context: "Host workspace · Kingston After Dark",
    move: "Prepare tonight's arrival window",
    moveDetail: "Doors 9:00 PM · 84 RSVP intent records · attendance starts at the door",
    surfaces: [
      { key: "today", label: "Today", hint: "Run the next move", icon: Sparkles },
      { key: "moments", label: "Moments", hint: "Plan + publish", icon: CalendarDays },
      { key: "live", label: "Live", hint: "Arrivals + room", icon: Radio },
      { key: "proof", label: "Proof", hint: "Review + close", icon: ShieldCheck },
      { key: "results", label: "Results", hint: "Attendance + return", icon: BarChart3 },
    ],
  },
  merchant: {
    label: "Merchant / Venue",
    title: "Turn customer action into repeat business.",
    promise: "Offers, validation, orders and place context without pretending a redemption is revenue.",
    context: "Merchant workspace · Sea Deck",
    move: "Keep tonight's Wing Key ready",
    moveDetail: "40 validations available · a verified use remains separate from a paid order",
    surfaces: [
      { key: "today", label: "Today", hint: "Operate now", icon: Sparkles },
      { key: "offers", label: "Offers", hint: "Products + perks", icon: Store },
      { key: "verify", label: "Verify", hint: "Claims + redemptions", icon: QrCode },
      { key: "orders", label: "Orders", hint: "Paid + fulfillment", icon: ShoppingBag },
      { key: "places", label: "Places", hint: "Venue + repeat", icon: MapPin },
    ],
  },
  brand: {
    label: "Brand",
    title: "Turn marketing activity into a decision.",
    promise: "Commission an outcome, inspect the evidence, then decide what deserves more budget.",
    context: "Brand workspace · Manchester Hills Foods",
    move: "Review the First 50 evidence pack",
    moveDetail: "47 attributed actions · 34 verified · 13 unresolved",
    surfaces: [
      { key: "today", label: "Today", hint: "What needs a decision", icon: Sparkles },
      { key: "activations", label: "Activations", hint: "Outcome + execution", icon: Megaphone },
      { key: "people", label: "People", hint: "Creators + hosts + places", icon: Users },
      { key: "evidence", label: "Evidence", hint: "What actually happened", icon: FileCheck2 },
      { key: "decisions", label: "Decisions", hint: "Stop, change or scale", icon: TrendingUp },
    ],
  },
  agency: {
    label: "Agency",
    title: "Operate clients without losing client truth.",
    promise: "Portfolio attention, explicit client context, managed execution and result packaging.",
    context: "Agency workspace · Pandxtra",
    move: "Package Manchester Hills result",
    moveDetail: "34 verified outcomes · client context locked · recommendation still required",
    surfaces: [
      { key: "today", label: "Today", hint: "Portfolio attention", icon: Sparkles },
      { key: "clients", label: "Clients", hint: "Accounts + context", icon: Building2 },
      { key: "work", label: "Work", hint: "Activations + approvals", icon: FolderKanban },
      { key: "proof", label: "Proof", hint: "Managed results", icon: FileCheck2 },
      { key: "growth", label: "Growth", hint: "Expansion + proposal", icon: TrendingUp },
    ],
  },
  admin: {
    label: "Admin",
    title: "Resolve exceptions. Preserve the record.",
    promise: "Cases, evidence, settlement exceptions and audit health without subsystem jargon taking over.",
    context: "PROMORANG operations · Admin",
    move: "Resolve attendance reversal case",
    moveDetail: "Case AC-1182 · original record remains intact · correction must append",
    surfaces: [
      { key: "today", label: "Today", hint: "Priority queue", icon: Sparkles },
      { key: "cases", label: "Cases", hint: "Exceptions + support", icon: Briefcase },
      { key: "review", label: "Review", hint: "Proof + KYC + moderation", icon: ShieldCheck },
      { key: "economy", label: "Economy", hint: "Payouts + disputes", icon: CircleDollarSign },
      { key: "health", label: "Health", hint: "System + audit", icon: Fingerprint },
    ],
  },
};

const order: RoleKey[] = ["creator", "host", "merchant", "brand", "agency", "admin"];

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="sn2-metric"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>;
}

function Attention({ title, detail, meta, onClick }: { title: string; detail: string; meta: string; onClick?: () => void }) {
  return <button type="button" className="sn2-attention" onClick={onClick}><div><span>{meta}</span><strong>{title}</strong><p>{detail}</p></div><ArrowRight className="h-4 w-4" /></button>;
}

function CreatorSurface({ surface }: { surface: string }) {
  if (surface === "today") return <div className="sn2-layout sn2-layout-creator">
    <section className="sn2-brief sn2-paper"><div className="sn2-docline"><span>CREATOR BRIEF · CB-0421</span><span>ACTIVE</span></div><h2>Broken Plate — one reel that moves people to the Moment.</h2><dl><div><dt>Deliverable</dt><dd>1 vertical reel · 15–30 sec</dd></div><div><dt>Outcome</dt><dd>Qualified Moment visits</dd></div><div><dt>Proof</dt><dd>Published URL + attributable action evidence</dd></div><div><dt>Due</dt><dd>Today · 6:00 PM</dd></div></dl><div className="sn2-stamp">IN PRODUCTION</div></section>
    <aside className="sn2-queue"><p className="sn2-kicker">Needs you</p><Attention meta="REVISION" title="Opening Run" detail="Tighten CTA and resubmit."/><Attention meta="DECISION" title="Kingston Food Drop" detail="Two creator slots remain."/><Attention meta="RECORDED" title="Sea Deck proof" detail="18 attributed actions approved."/></aside>
  </div>;
  if (surface === "work") return <section className="sn2-opportunity-desk"><div className="sn2-section-head"><div><p className="sn2-kicker">Opportunity desk</p><h2>Take work worth proving.</h2></div><span>Reward and proof are visible before acceptance.</span></div><div className="sn2-opportunity-stack">{[
    ["CB-0421", "Broken Plate", "1 reel · due today", "Accepted"],
    ["CB-0430", "Kingston Food Drop", "2 creator slots · closes tonight", "Open"],
    ["CB-0432", "AftrHrs Return", "Audience overlap is strong", "Recommended"],
  ].map(([id,title,desc,state]) => <article key={id}><span>{id}</span><div><h3>{title}</h3><p>{desc}</p></div><strong>{state}</strong></article>)}</div></section>;
  if (surface === "create") return <div className="sn2-production-room"><section><p className="sn2-kicker">Production room</p><h2>One deliverable. One submission state.</h2><div className="sn2-media-frame"><WandSparkles className="h-8 w-8"/><strong>broken-plate-reel-v3.mp4</strong><span>0:21 · vertical · draft 03</span></div></section><aside className="sn2-submission-folder"><div className="sn2-folder-tab">SUBMISSION · CB-0421</div><ul><li><CheckCircle2/> Deliverable attached</li><li><CheckCircle2/> Published URL added</li><li><Clock3/> Action evidence pending</li></ul><button type="button">Complete submission</button></aside></div>;
  if (surface === "proof") return <div className="sn2-proof-chain"><div className="sn2-section-head"><div><p className="sn2-kicker">Proof dossier</p><h2>What the work actually caused.</h2></div><span>Submission ≠ approval ≠ settlement</span></div><div className="sn2-chain">{[["Published","Reel live","Observed"],["Attributed","18 actions linked","Attributed"],["Verified","18 actions confirmed","Verified"],["Value","Creator value recorded","Not automatically paid"]].map(([a,b,c])=><div key={a}><span>{a}</span><strong>{b}</strong><small>{c}</small></div>)}</div></div>;
  return <div className="sn2-ledger"><section><p className="sn2-kicker">Value ledger</p><h2>Recorded value without pretending it is already cash.</h2>{[["Mission verification","$34","Attributed"],["Sea Deck walkthrough","$28","Approved"],["Opening Run","$22","Revision"]].map(([a,b,c])=><div className="sn2-ledger-row" key={a}><strong>{a}</strong><span>{b}</span><small>{c}</small></div>)}</section><aside className="sn2-reputation"><BadgeCheck/><h3>Rising creator</h3><p>18 approved proofs · 92% on-time delivery · 3 repeat brand invitations.</p></aside></div>;
}

function HostSurface({ surface }: { surface: string }) {
  if (surface === "today") return <div className="sn2-layout"><section className="sn2-runsheet sn2-paper"><div className="sn2-docline"><span>RUN SHEET · M-0918</span><span>TONIGHT</span></div><h2>AFTRHRS · Sea Deck</h2>{[["19:30","Staff call"],["20:30","Door ready"],["21:00","Doors"],["23:45","Proof close owner checks exceptions"]].map(([time,task])=><div className="sn2-runline" key={time}><strong>{time}</strong><span>{task}</span></div>)}</section><aside className="sn2-queue"><p className="sn2-kicker">Operational attention</p><Attention meta="BLOCKED" title="Door exception" detail="Pass belongs to another Moment."/><Attention meta="REVIEW" title="6 proofs waiting" detail="Last Thursday needs close."/><Attention meta="TODAY" title="Sponsor placement" detail="Vehicle asset needs venue sign-off."/></aside></div>;
  if (surface === "moments") return <section className="sn2-moment-files"><div className="sn2-section-head"><div><p className="sn2-kicker">Moment files</p><h2>Plan the experience like an operation.</h2></div><button type="button">+ New Moment</button></div>{[["M-0918","AFTRHRS","Sea Deck · Thu 9 PM","Ready"],["M-0925","Kingston After Dark","Barbican · Fri","Draft"],["M-1002","Late Food Run","Liguanea · demand-backed","Signal"]].map(([id,title,meta,state])=><article key={id}><span>{id}</span><div><h3>{title}</h3><p>{meta}</p></div><strong>{state}</strong></article>)}</section>;
  if (surface === "live") return <div className="sn2-door"><section className="sn2-door-board"><div className="sn2-section-head"><div><p className="sn2-kicker">Door board</p><h2>Arrivals, not vanity counts.</h2></div><strong>DOORS MODE</strong></div><div className="sn2-door-stats"><Metric label="RSVP intent" value="84" note="not attendance"/><Metric label="Checked in" value="0" note="doors closed"/><Metric label="Exceptions" value="1" note="must resolve"/></div><div className="sn2-scan-well"><QrCode className="h-10 w-10"/><h3>Ready for first arrival</h3><p>Scan a valid pass or create an explicit operational record.</p></div></section><aside className="sn2-exception"><AlertTriangle/><h3>Pass mismatch</h3><p>This pass belongs to another Moment. No attendance is recorded until resolved.</p><button type="button">Open exception</button></aside></div>;
  if (surface === "proof") return <section className="sn2-review-stack"><div className="sn2-section-head"><div><p className="sn2-kicker">Proof close</p><h2>Six decisions. No blanket “verified”.</h2></div><span>Review one record at a time</span></div>{["PS-1182","PS-1185","PS-1190"].map((id,i)=><article key={id}><div><span>{id}</span><strong>{i===0?"Arrival selfie + venue stamp":"Participation evidence"}</strong><p>{i===0?"Submitted 11:06 PM · requires host decision":"Submitted last run · evidence intact"}</p></div><div><button type="button">Reject</button><button type="button">Approve</button></div></article>)}</section>;
  return <div className="sn2-results-sheet"><div><p className="sn2-kicker">Attendance close</p><h2>What actually happened.</h2><div className="sn2-big-numbers"><Metric label="RSVP intent" value="84" note="demand"/><Metric label="Verified attendance" value="61" note="evidence-backed"/><Metric label="Return audience" value="38%" note="illustrative"/></div></div><aside><TrendingUp/><h3>Next decision</h3><p>Repeat the Thursday window, but tighten arrival staffing between 10:30 and 11:15.</p></aside></div>;
}

function MerchantSurface({ surface }: { surface: string }) {
  if (surface === "today") return <div className="sn2-merchant-counter"><section><p className="sn2-kicker">Counter brief</p><h2>Tonight at Sea Deck</h2><div className="sn2-ticket"><span>OFFER · OF-2031</span><strong>AFTRHRS Wing Key</strong><p>Complimentary wings · 40 available · valid tonight</p><small>Issuer: Sea Deck · Barbican</small></div></section><aside><Attention meta="ACTION" title="3 orders to fulfil" detail="2 pickup · 1 delivery"/><Attention meta="CHECK" title="Validation conflict" detail="Code already used 8 minutes ago."/><Attention meta="WATCH" title="12 Keys remain" detail="Current allocation is running low."/></aside></div>;
  if (surface === "offers") return <section className="sn2-offer-stock"><div className="sn2-section-head"><div><p className="sn2-kicker">Offer stock</p><h2>Publish something worth acting on.</h2></div><button type="button">+ New offer</button></div><div className="sn2-stock-grid">{[["AFTRHRS Wing Key","40 allocated","Active"],["Late-night combo","24 units","Draft"],["Lunch return perk","Unlimited claim / capped use","Scheduled"]].map(([a,b,c])=><article key={a}><Store/><strong>{a}</strong><p>{b}</p><span>{c}</span></article>)}</div></section>;
  if (surface === "verify") return <div className="sn2-validator"><section className="sn2-validator-device"><div className="sn2-device-screen"><QrCode/><span>VALIDATION STATION</span><h2>Ready to scan</h2><p>Validation proves use of an offer. It does not create purchase revenue.</p><button type="button">Enter code manually</button></div></section><aside className="sn2-slip sn2-paper"><div className="sn2-docline"><span>VALIDATION SLIP</span><span>VL-1182</span></div><h3>Last confirmed use</h3><dl><div><dt>Offer</dt><dd>Wing Key</dd></div><div><dt>Venue</dt><dd>Sea Deck</dd></div><div><dt>Time</dt><dd>10:42 PM</dd></div><div><dt>State</dt><dd>Validated</dd></div></dl><div className="sn2-stamp">USE VERIFIED</div></aside></div>;
  if (surface === "orders") return <section className="sn2-order-board"><div className="sn2-section-head"><div><p className="sn2-kicker">Order board</p><h2>Paid orders need fulfillment, not another KPI.</h2></div><span>Purchase evidence is separate from redemption.</span></div>{[["ORD-1842","Pickup","Paid","Ready"],["ORD-1844","Delivery","Paid","Packing"],["ORD-1838","Pickup","Refunded","History retained"]].map(([id,mode,pay,state])=><article key={id}><strong>{id}</strong><span>{mode}</span><span>{pay}</span><b>{state}</b></article>)}</section>;
  return <div className="sn2-place-record"><section className="sn2-place-hero"><MapPin/><p className="sn2-kicker">Place record</p><h2>Sea Deck</h2><p>20 Barbican Road · active venue context</p><div><Metric label="Active offers" value="2" note="at this place"/><Metric label="Verified uses" value="31" note="this week"/><Metric label="Paid orders" value="9" note="separate evidence"/></div></section><aside><h3>What happens here</h3><p>AFTRHRS · Thursdays</p><p>Wing Key · active</p><p>22 repeat visitors · illustrative</p></aside></div>;
}

function BrandSurface({ surface }: { surface: string }) {
  if (surface === "today") return <div className="sn2-brand-desk"><section className="sn2-dossier"><div className="sn2-docline"><span>ACTIVATION DOSSIER · AC-5021</span><span>EVIDENCE OPEN</span></div><p className="sn2-kicker">First 50</p><h2>Can this activation create 50 real customer actions?</h2><div className="sn2-evidence-bands"><div><span>Observed</span><strong>47</strong></div><div><span>Verified</span><strong>34</strong></div><div><span>Unresolved</span><strong>13</strong></div></div><p className="sn2-note">Do not scale until the unresolved proof gap is understood.</p></section><aside className="sn2-queue"><Attention meta="APPROVE" title="2 creator concepts" detail="Brand sign-off required."/><Attention meta="DECISION" title="Evidence pack" detail="13 actions unresolved."/><Attention meta="FRIDAY" title="Montego Bay repeat" detail="Stop, change or scale."/></aside></div>;
  if (surface === "activations") return <section className="sn2-activation-rack"><div className="sn2-section-head"><div><p className="sn2-kicker">Activation rack</p><h2>Outcome first. Channels second.</h2></div><button type="button">+ New activation</button></div>{[["AC-5021","First 50","50 attributable actions","Live"],["AC-5033","Find Your Flavour","Choice signal + trial","Draft"],["AC-5040","Retail Return","Repeat visit","Planning"]].map(([id,title,outcome,state])=><article key={id}><span>{id}</span><div><h3>{title}</h3><p>{outcome}</p></div><strong>{state}</strong></article>)}</section>;
  if (surface === "people") return <div className="sn2-network-map"><section><p className="sn2-kicker">Delivery network</p><h2>Who is responsible for moving the activation?</h2><div className="sn2-network-line"><div><Users/><strong>4 creators</strong><span>distribution + content</span></div><ArrowRight/><div><CalendarDays/><strong>2 hosts</strong><span>experience + arrival</span></div><ArrowRight/><div><MapPin/><strong>3 places</strong><span>validation + transaction</span></div></div></section><aside><h3>Waiting on approval</h3><p>Creator concept CC-118 · pricing copy</p><button type="button">Review concept</button></aside></div>;
  if (surface === "evidence") return <div className="sn2-evidence-pack"><div className="sn2-pack-cover"><FileCheck2/><span>EVIDENCE PACK · EP-5021</span><h2>First 50</h2><p>Evidence is separated by strength so attribution is never presented as verification.</p></div><div className="sn2-pack-pages">{[["OBSERVED","47","Customer actions exist"],["ATTRIBUTED","47","Linked to activation"],["VERIFIED","34","Crossed proof boundary"],["UNRESOLVED","13","Still needs decision"]].map(([a,b,c])=><article key={a}><span>{a}</span><strong>{b}</strong><p>{c}</p></article>)}</div></div>;
  return <section className="sn2-decision-board"><p className="sn2-kicker">Decision record</p><h2>What happens next?</h2><div>{[["STOP","Evidence does not support another run."],["CHANGE","Adjust offer, place or creator mix."],["SCALE","Repeat only what the evidence supports."]].map(([a,b])=><button key={a} type="button"><strong>{a}</strong><span>{b}</span></button>)}</div><small>Choosing a direction should create a durable decision record, not only change a dashboard filter.</small></section>;
}

function AgencySurface({ surface }: { surface: string }) {
  if (surface === "today") return <div className="sn2-agency-portfolio"><section><p className="sn2-kicker">Portfolio attention</p><h2>Which client needs you?</h2>{[["Manchester Hills","Result pack needs recommendation","Proof ready"],["Sea Deck","Activation live tonight","Operate"],["Flash Motors","Creative approval blocked","Client action"]].map(([a,b,c])=><article key={a}><Building2/><div><strong>{a}</strong><p>{b}</p></div><span>{c}</span></article>)}</section><aside className="sn2-client-context"><span>ACTIVE CLIENT CONTEXT</span><h3>Manchester Hills Foods</h3><p>Owner: Manchester Hills · Operator: Pandxtra</p><button type="button">Open client workspace</button></aside></div>;
  if (surface === "clients") return <section className="sn2-client-ledger"><div className="sn2-section-head"><div><p className="sn2-kicker">Client ledger</p><h2>Context is part of the work.</h2></div><button type="button">+ Connect client</button></div>{[["MH-005","Manchester Hills Foods","Brand","Active"],["SD-002","Sea Deck","Venue","Active"],["FM-011","Flash Motors","Brand","Pending approval"]].map(([id,name,type,state])=><article key={id}><span>{id}</span><div><h3>{name}</h3><p>{type} client · ownership remains client</p></div><strong>{state}</strong></article>)}</section>;
  if (surface === "work") return <div className="sn2-managed-work"><section><p className="sn2-kicker">Managed work</p><h2>Manchester Hills · First 50</h2><div className="sn2-work-columns">{[["Preparing","Creator concept"],["Approval","Pricing copy blocked"],["Live","Retail QR activation"],["Proof","34 verified outcomes"]].map(([a,b])=><div key={a}><span>{a}</span><strong>{b}</strong></div>)}</div></section><aside><AlertTriangle/><h3>Client approval blocker</h3><p>The agency cannot approve pricing claims on the client's behalf.</p><button type="button">Request sign-off</button></aside></div>;
  if (surface === "proof") return <section className="sn2-result-pack"><div className="sn2-docline"><span>MANAGED RESULT PACK · MR-117</span><span>CLIENT OWNED</span></div><h2>Manchester Hills — First 50</h2><div className="sn2-result-sections"><div><span>Outcome</span><strong>34 verified actions</strong></div><div><span>Agency role</span><strong>Managed activation + evidence packaging</strong></div><div><span>Client truth</span><strong>Manchester Hills retains campaign ownership</strong></div><div><span>Recommendation</span><strong>Change offer framing before Montego Bay repeat</strong></div></div></section>;
  return <div className="sn2-growth-brief"><section><p className="sn2-kicker">Expansion brief</p><h2>Turn a proven result into the next proposal.</h2><p>Do not pitch “more activity.” Pitch the next measurable customer outcome using what was learned.</p></section><aside><TrendingUp/><h3>Montego Bay pilot</h3><p>Recommended: 75 attributable actions · revised offer · 2 retail locations.</p><button type="button">Prepare proposal</button></aside></div>;
}

function AdminSurface({ surface }: { surface: string }) {
  if (surface === "today") return <div className="sn2-admin-queue"><section><p className="sn2-kicker">Priority queue</p><h2>Intervene where truth or money is blocked.</h2>{[["P1","Attendance reversal","Guest receipt disputed","Cases"],["P1","Payout exception","Manual reference missing","Economy"],["P2","KYC review","Merchant seller submitted","Review"]].map(([p,a,b,c])=><article key={a}><span>{p}</span><div><strong>{a}</strong><p>{b}</p></div><b>{c}</b></article>)}</section><aside className="sn2-admin-rule"><ShieldCheck/><h3>Admin rule</h3><p>Resolve the authoritative domain state first. Audit history stays intact.</p></aside></div>;
  if (surface === "cases") return <section className="sn2-case-file"><div className="sn2-docline"><span>EXCEPTION CASE · AC-1182</span><span>OPEN</span></div><h2>Attendance reversal</h2><div className="sn2-case-grid"><div><span>Original</span><strong>Verified guest attendance</strong></div><div><span>Dispute</span><strong>Host says duplicate scan</strong></div><div><span>Evidence</span><strong>Receipt + door log</strong></div><div><span>Decision</span><strong>Pending operator review</strong></div></div><div className="sn2-case-actions"><button type="button">Escalate</button><button type="button">Resolve case</button></div></section>;
  if (surface === "review") return <div className="sn2-review-desks"><section><FileCheck2/><h3>Proof review</h3><strong>6 waiting</strong><p>Participation evidence requiring a decision.</p></section><section><UserRoundCheck/><h3>KYC review</h3><strong>2 waiting</strong><p>Seller onboarding and payout eligibility.</p></section><section><Scale/><h3>Moderation</h3><strong>1 flagged</strong><p>Content or marketplace integrity review.</p></section></div>;
  if (surface === "economy") return <section className="sn2-settlement-ledger"><div className="sn2-section-head"><div><p className="sn2-kicker">Settlement exceptions</p><h2>Queued is not paid.</h2></div><span>Money states stay explicit</span></div>{[["PQ-118","$120 JMD","Queued","Reference required"],["PQ-121","$84 USD","Paid","Recorded"],["PQ-127","$36 USD","Held","KYC blocker"]].map(([id,amt,state,note])=><article key={id}><strong>{id}</strong><span>{amt}</span><b>{state}</b><small>{note}</small></article>)}</section>;
  return <div className="sn2-health"><section><p className="sn2-kicker">Operational health</p><h2>Can the system explain what happened?</h2><div className="sn2-health-grid"><Metric label="Audit lineage" value="Stable" note="illustrative"/><Metric label="Exception backlog" value="3" note="priority"/><Metric label="Settlement blockers" value="1" note="manual action"/></div></section><aside><Fingerprint/><h3>Traceability</h3><p>Corrections append. Original events remain inspectable. Unknown actors are not invented.</p></aside></div>;
}

function SurfaceRenderer({ role, surface }: { role: RoleKey; surface: string }) {
  if (role === "creator") return <CreatorSurface surface={surface}/>;
  if (role === "host") return <HostSurface surface={surface}/>;
  if (role === "merchant") return <MerchantSurface surface={surface}/>;
  if (role === "brand") return <BrandSurface surface={surface}/>;
  if (role === "agency") return <AgencySurface surface={surface}/>;
  return <AdminSurface surface={surface}/>;
}

function Workspace() {
  const params = useParams();
  const navigate = useNavigate();
  const role = (params.role || "creator") as RoleKey;
  const config = roles[role] || roles.creator;
  const surface = params.surface || "today";
  const validSurface = config.surfaces.some((item) => item.key === surface) ? surface : "today";

  return <div className={`sn2-root sn2-role-${role}`}>
    <header className="sn2-header">
      <div className="sn2-brand"><PromorangMark size={34}/><div><span>PROMORANG</span><small>Stakeholder Next · review</small></div></div>
      <div className="sn2-role-tabs" aria-label="Stakeholder role review">{order.map((item)=><button key={item} type="button" className={item===role?"is-active":""} onClick={()=>navigate(`/${item}/today`)}>{roles[item].label}</button>)}</div>
      <span className="sn2-review-badge">Illustrative review data</span>
    </header>

    <main className="sn2-shell">
      <section className="sn2-hero"><div><p>{config.context}</p><h1>{config.title}</h1><span>{config.promise}</span></div><aside><small>CURRENT MOVE</small><strong>{config.move}</strong><p>{config.moveDetail}</p></aside></section>
      <nav className="sn2-nav" aria-label={`${config.label} navigation`}>{config.surfaces.map((item)=>{const Icon=item.icon; return <NavLink key={item.key} to={`/${role}/${item.key}`} className={item.key===validSurface?"is-active":""}><Icon className="h-4 w-4"/><span><strong>{item.label}</strong><small>{item.hint}</small></span></NavLink>})}</nav>
      <section className="sn2-workspace"><SurfaceRenderer role={role} surface={validSurface}/></section>
    </main>
  </div>;
}

export default function StakeholderNextV2() {
  return <Routes><Route path="/:role/:surface" element={<Workspace/>}/><Route path="/:role" element={<Navigate to="/creator/today" replace/>}/><Route path="/" element={<Navigate to="/creator/today" replace/>}/><Route path="*" element={<Navigate to="/creator/today" replace/>}/></Routes>;
}
