import React from "react";
import { NavLink, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  Activity,
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
  Fingerprint,
  FolderKanban,
  History,
  MapPin,
  Megaphone,
  MessageSquare,
  PackageCheck,
  Paperclip,
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
import "@/stakeholder-next-v3.css";

type RoleKey = "creator" | "host" | "merchant" | "brand" | "agency" | "admin";
type Surface = { key: string; label: string; hint: string; icon: React.ComponentType<{ className?: string }> };
type RoleConfig = {
  label: string;
  context: string;
  job: string;
  move: string;
  moveDetail: string;
  status: string;
  surfaces: Surface[];
};

const roles: Record<RoleKey, RoleConfig> = {
  creator: {
    label: "Creator",
    context: "Creator workspace · Kingston",
    job: "Make useful work. Prove what it moved.",
    move: "Finish Broken Plate revision",
    moveDetail: "Draft 03 · due 6:00 PM · action evidence still required",
    status: "1 revision · 2 open opportunities · 1 proof waiting",
    surfaces: [
      { key: "today", label: "Today", hint: "What needs you", icon: Sparkles },
      { key: "work", label: "Work", hint: "Briefs + opportunities", icon: Target },
      { key: "create", label: "Create", hint: "Production + submission", icon: WandSparkles },
      { key: "proof", label: "Proof", hint: "Evidence + review", icon: FileCheck2 },
      { key: "value", label: "Value", hint: "Ledger + reputation", icon: CircleDollarSign },
    ],
  },
  host: {
    label: "Host",
    context: "Host workspace · Kingston After Dark",
    job: "Fill it. Run it. Prove who came.",
    move: "Open AFTRHRS door board",
    moveDetail: "Doors 9:00 PM · 84 RSVP intent · one unresolved pass mismatch",
    status: "1 live Moment · 6 proofs waiting · 1 door exception",
    surfaces: [
      { key: "today", label: "Today", hint: "Run the next move", icon: Sparkles },
      { key: "moments", label: "Moments", hint: "Plan + publish", icon: CalendarDays },
      { key: "live", label: "Live", hint: "Arrivals + exceptions", icon: Radio },
      { key: "proof", label: "Proof", hint: "Review + close", icon: ShieldCheck },
      { key: "results", label: "Results", hint: "Attendance + return", icon: BarChart3 },
    ],
  },
  merchant: {
    label: "Merchant / Venue",
    context: "Merchant workspace · Sea Deck",
    job: "Turn customer action into repeat business.",
    move: "Keep Wing Key available",
    moveDetail: "17 validated · 23 remaining · purchase remains a separate record",
    status: "2 active offers · 3 paid orders · 1 validation exception",
    surfaces: [
      { key: "today", label: "Today", hint: "Operate now", icon: Sparkles },
      { key: "offers", label: "Offers", hint: "Commercial instruments", icon: Store },
      { key: "verify", label: "Verify", hint: "Claims + redemptions", icon: QrCode },
      { key: "orders", label: "Orders", hint: "Payment + fulfillment", icon: ShoppingBag },
      { key: "places", label: "Places", hint: "Venue + repeat", icon: MapPin },
    ],
  },
  brand: {
    label: "Brand",
    context: "Brand workspace · Manchester Hills Foods",
    job: "Turn marketing activity into a decision.",
    move: "Resolve First 50 proof gap",
    moveDetail: "47 attributed · 34 verified · 13 unresolved before scale decision",
    status: "1 evidence pack open · 2 concepts awaiting approval · 1 decision due Friday",
    surfaces: [
      { key: "today", label: "Today", hint: "What needs a decision", icon: Sparkles },
      { key: "activations", label: "Activations", hint: "Outcome + execution", icon: Megaphone },
      { key: "people", label: "People", hint: "Creators + hosts + places", icon: Users },
      { key: "evidence", label: "Evidence", hint: "Sources + proof strength", icon: FileCheck2 },
      { key: "decisions", label: "Decisions", hint: "Stop, change or scale", icon: TrendingUp },
    ],
  },
  agency: {
    label: "Agency",
    context: "Agency workspace · Pandxtra",
    job: "Operate clients without losing client truth.",
    move: "Package Manchester Hills recommendation",
    moveDetail: "Client context locked · evidence ready · recommendation still required",
    status: "3 clients · 1 approval blocker · 1 result pack ready",
    surfaces: [
      { key: "today", label: "Today", hint: "Portfolio attention", icon: Sparkles },
      { key: "clients", label: "Clients", hint: "Accounts + context", icon: Building2 },
      { key: "work", label: "Work", hint: "Execution + approvals", icon: FolderKanban },
      { key: "proof", label: "Proof", hint: "Managed result packs", icon: FileCheck2 },
      { key: "growth", label: "Growth", hint: "Expansion + proposal", icon: TrendingUp },
    ],
  },
  admin: {
    label: "Admin",
    context: "PROMORANG operations · Admin",
    job: "Resolve exceptions. Preserve the record.",
    move: "Resolve attendance reversal AC-1182",
    moveDetail: "Original record remains intact · correction must append",
    status: "3 priority exceptions · 6 proof reviews · 1 settlement blocker",
    surfaces: [
      { key: "today", label: "Today", hint: "Priority queue", icon: Sparkles },
      { key: "cases", label: "Cases", hint: "Exceptions + support", icon: Briefcase },
      { key: "review", label: "Review", hint: "Proof + KYC + moderation", icon: ShieldCheck },
      { key: "economy", label: "Economy", hint: "Payouts + disputes", icon: CircleDollarSign },
      { key: "health", label: "Health", hint: "Audit + system integrity", icon: Fingerprint },
    ],
  },
};

const roleOrder: RoleKey[] = ["creator", "host", "merchant", "brand", "agency", "admin"];

function StatePill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warn" | "bad" }) {
  return <span className={`sn3-pill sn3-pill-${tone}`}>{children}</span>;
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="sn3-metric"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>;
}

function Attention({ meta, title, detail, tone = "neutral" }: { meta: string; title: string; detail: string; tone?: "neutral" | "warn" | "bad" }) {
  return <button type="button" className="sn3-attention"><div><span className={`sn3-attention-${tone}`}>{meta}</span><strong>{title}</strong><p>{detail}</p></div><ArrowRight className="h-4 w-4" /></button>;
}

function ActivityRow({ time, title, detail }: { time: string; title: string; detail: string }) {
  return <div className="sn3-activity-row"><span>{time}</span><div><strong>{title}</strong><p>{detail}</p></div></div>;
}

function CreatorSurface({ surface }: { surface: string }) {
  if (surface === "today") return <div className="sn3-two-col">
    <section className="sn3-document sn3-document-cream">
      <div className="sn3-docline"><span>CREATOR BRIEF · CB-0421</span><StatePill tone="warn">REVISION</StatePill></div>
      <div className="sn3-document-title"><div><p className="sn3-kicker">Broken Plate</p><h2>One reel that moves people to the Moment.</h2></div><strong>Due 6:00 PM</strong></div>
      <div className="sn3-field-grid"><div><span>Deliverable</span><strong>Vertical reel · 15–30 sec</strong></div><div><span>Outcome</span><strong>Qualified Moment visits</strong></div><div><span>Proof</span><strong>Published URL + action evidence</strong></div><div><span>Reward state</span><strong>Pending approval</strong></div></div>
      <div className="sn3-revision-note"><MessageSquare className="h-4 w-4"/><div><strong>Revision 02 · Opening Run</strong><p>“Tighten the first three seconds and make the CTA explicit before resubmitting.”</p></div></div>
      <div className="sn3-action-row"><button type="button">Open Production Room</button><button type="button" className="sn3-secondary">View full brief</button></div>
    </section>
    <aside className="sn3-side-stack"><div><p className="sn3-kicker">Needs you</p><Attention meta="REVISION" title="Broken Plate" detail="Draft 03 is ready to resubmit." tone="warn"/><Attention meta="DECISION" title="Kingston Food Drop" detail="Two creator slots remain."/><Attention meta="PROOF" title="Sea Deck" detail="18 attributed actions awaiting final review."/></div><div className="sn3-mini-log"><p className="sn3-kicker">Today’s trace</p><ActivityRow time="1:18 PM" title="Draft 03 saved" detail="broken-plate-reel-v3.mp4"/><ActivityRow time="12:42 PM" title="Review note received" detail="Opening CTA requires revision"/><ActivityRow time="10:06 AM" title="Published link attached" detail="Instagram reel URL recorded"/></div></aside>
  </div>;

  if (surface === "work") return <section className="sn3-work-list"><div className="sn3-section-head"><div><p className="sn3-kicker">Opportunity desk</p><h2>Know the work before you accept it.</h2></div><span>Outcome · deliverable · proof · value · deadline</span></div>{[
    ["CB-0421","Broken Plate","Vertical reel","Qualified visits","Published URL + action evidence","Today 6 PM","Accepted"],
    ["CB-0430","Kingston Food Drop","1 short-form video","Trial intent","Post + attributable link","Tonight 9 PM","Open"],
    ["CB-0432","AFTRHRS Return","Story sequence","Return RSVP","Tracked link + story proof","Thu 3 PM","Recommended"],
  ].map(([id,title,deliverable,outcome,proof,due,state])=><article key={id}><div className="sn3-id"><span>{id}</span><StatePill tone={state==="Accepted"?"warn":"neutral"}>{state}</StatePill></div><div><h3>{title}</h3><p>{deliverable}</p></div><div><span>Outcome</span><strong>{outcome}</strong></div><div><span>Proof</span><strong>{proof}</strong></div><div><span>Due</span><strong>{due}</strong></div><button type="button">Open</button></article>)}</section>;

  if (surface === "create") return <div className="sn3-production">
    <section className="sn3-production-main"><div className="sn3-section-head"><div><p className="sn3-kicker">Production room · CB-0421</p><h2>Broken Plate · Draft 03</h2></div><StatePill tone="warn">REVISION REQUESTED</StatePill></div>
      <div className="sn3-production-grid"><div className="sn3-media-object"><WandSparkles className="h-8 w-8"/><strong>broken-plate-reel-v3.mp4</strong><span>0:21 · 1080×1920 · uploaded 1:18 PM</span><div className="sn3-media-meta"><span>Version 03</span><span>Published URL attached</span><span>Action evidence pending</span></div></div>
        <div className="sn3-requirements"><p className="sn3-kicker">Requirements</p>{[[true,"Vertical 9:16"],[true,"15–30 seconds"],[true,"PROMORANG CTA"],[true,"Published URL"],[false,"Attributable action evidence"]].map(([done,label])=><div key={String(label)}>{done?<CheckCircle2 className="h-4 w-4"/>:<Clock3 className="h-4 w-4"/>}<span>{label}</span></div>)}</div></div>
      <div className="sn3-production-bottom"><div><p className="sn3-kicker">Version history</p><ActivityRow time="v03" title="Current draft" detail="Saved 1:18 PM · not submitted"/><ActivityRow time="v02" title="Revision requested" detail="Opening CTA needs tightening"/><ActivityRow time="v01" title="Submitted" detail="Reviewed 11:52 AM"/></div><div><p className="sn3-kicker">Review thread</p><div className="sn3-thread"><MessageSquare className="h-4 w-4"/><div><strong>Brand reviewer · 12:42 PM</strong><p>Tighten the first three seconds. Keep the venue reveal, but make the action more explicit.</p></div></div><div className="sn3-thread"><Paperclip className="h-4 w-4"/><div><strong>Proof requirement</strong><p>Submission can close only after attributable action evidence is attached.</p></div></div></div></div>
    </section>
    <aside className="sn3-submit-panel"><p className="sn3-kicker">Submission folder</p><h3>CB-0421 · Revision 03</h3><div className="sn3-submit-state"><CheckCircle2/><span>Deliverable attached</span></div><div className="sn3-submit-state"><CheckCircle2/><span>Published URL recorded</span></div><div className="sn3-submit-state is-pending"><Clock3/><span>Action evidence pending</span></div><div className="sn3-submit-seal"><span>Last reviewer state</span><strong>Revision requested</strong><small>12:42 PM · reviewer note preserved</small></div><button type="button" disabled>Submit revision</button><small>Complete the missing evidence requirement to enable submission.</small></aside>
  </div>;

  if (surface === "proof") return <section className="sn3-proof-dossier"><div className="sn3-section-head"><div><p className="sn3-kicker">Proof dossier · CB-0421</p><h2>One chain. Different strengths of truth.</h2></div><StatePill>Submission ≠ approval ≠ settlement</StatePill></div><div className="sn3-proof-grid">{[
    ["Observed","Reel published","Instagram URL captured","10:06 AM","good"],
    ["Attributed","18 actions linked","Tracked PROMORANG link","12:30 PM","good"],
    ["Verified","18 actions confirmed","Awaiting reviewer close","Pending","warn"],
    ["Value","Creator ledger entry","Not automatically paid","Pending approval","neutral"],
  ].map(([stage,title,source,time,tone])=><article key={stage}><span>{stage}</span><strong>{title}</strong><p>{source}</p><StatePill tone={tone as "good"|"warn"|"neutral"}>{time}</StatePill></article>)}</div><div className="sn3-audit-strip"><History className="h-4 w-4"/><span>Evidence lineage:</span><strong>Published URL → attributed action → reviewer decision → ledger state</strong></div></section>;

  return <div className="sn3-ledger-layout"><section className="sn3-ledger"><div className="sn3-section-head"><div><p className="sn3-kicker">Value ledger</p><h2>Recorded creator value.</h2></div><span>Approved ≠ payout sent</span></div>{[
    ["VE-771","Mission verification","$34","Pending","Attribution recorded · review open"],
    ["VE-768","Sea Deck walkthrough","$28","Approved","Approved in ledger · no payment record"],
    ["VE-750","Opening Run","$22","Settled","Ledger settled · payment evidence separate"],
  ].map(([id,title,amount,state,note])=><div className="sn3-ledger-row" key={id}><span>{id}</span><div><strong>{title}</strong><p>{note}</p></div><b>{amount}</b><StatePill tone={state==="Approved"?"good":state==="Pending"?"warn":"neutral"}>{state}</StatePill></div>)}</section><aside className="sn3-reputation"><BadgeCheck className="h-6 w-6"/><p className="sn3-kicker">Reputation residue</p><h3>Rising creator</h3><Metric label="Approved proofs" value="18" note="recorded"/><Metric label="On-time delivery" value="92%" note="illustrative review"/><Metric label="Repeat invitations" value="3" note="illustrative review"/></aside></div>;
}

function HostSurface({ surface }: { surface: string }) {
  if (surface === "today") return <div className="sn3-two-col"><section className="sn3-document sn3-document-cream"><div className="sn3-docline"><span>RUN SHEET · M-0918</span><StatePill tone="good">TONIGHT</StatePill></div><div className="sn3-document-title"><div><p className="sn3-kicker">AFTRHRS · Sea Deck</p><h2>Door operation</h2></div><strong>Doors 9:00 PM</strong></div>{[["19:30","Staff call","Owner: Patrice"],["20:30","Door device check","Owner: Andre"],["21:00","Doors open","Attendance starts here"],["23:45","Proof close","Exceptions assigned before close"]].map(([time,task,note])=><div className="sn3-run-row" key={time}><strong>{time}</strong><div><b>{task}</b><p>{note}</p></div></div>)}</section><aside className="sn3-side-stack"><div><p className="sn3-kicker">Operational attention</p><Attention meta="BLOCKED" title="Pass mismatch" detail="Belongs to another Moment. No attendance recorded." tone="bad"/><Attention meta="REVIEW" title="6 proofs waiting" detail="Last Thursday still needs close." tone="warn"/><Attention meta="SIGN-OFF" title="Sponsor placement" detail="Vehicle asset needs venue approval."/></div><div className="sn3-mini-log"><p className="sn3-kicker">Live readiness</p><Metric label="RSVP intent" value="84" note="not attendance"/><Metric label="Door devices" value="2/2" note="ready"/></div></aside></div>;
  if (surface === "moments") return <section className="sn3-work-list"><div className="sn3-section-head"><div><p className="sn3-kicker">Moment files</p><h2>Plan the experience like an operation.</h2></div><button type="button">+ New Moment</button></div>{[["M-0918","AFTRHRS","Sea Deck","Thu 9 PM","Ready"],["M-0925","Kingston After Dark","Barbican","Fri 10 PM","Draft"],["M-1002","Late Food Run","Liguanea","Demand-backed","Signal"]].map(([id,title,place,time,state])=><article key={id}><div className="sn3-id"><span>{id}</span><StatePill>{state}</StatePill></div><div><h3>{title}</h3><p>{place}</p></div><div><span>Window</span><strong>{time}</strong></div><div><span>Owner</span><strong>Host team</strong></div><div><span>Close</span><strong>Proof + exceptions</strong></div><button type="button">Open</button></article>)}</section>;
  if (surface === "live") return <div className="sn3-live-layout"><section className="sn3-door-board"><div className="sn3-section-head"><div><p className="sn3-kicker">Door board · M-0918</p><h2>Record arrivals, not vanity counts.</h2></div><StatePill tone="good">ONLINE · READY</StatePill></div><div className="sn3-metric-row"><Metric label="RSVP intent" value="84" note="demand only"/><Metric label="Checked in" value="0" note="doors closed"/><Metric label="Walk-ins" value="0" note="explicit records"/><Metric label="Exceptions" value="1" note="must resolve"/></div><div className="sn3-scanner"><QrCode className="h-8 w-8"/><div><strong>Arrival scanner ready</strong><p>Successful scan writes an attendance record. Duplicate or mismatched passes remain visibly unresolved.</p></div><button type="button">Enter pass code</button></div><div className="sn3-ledger-head"><span>Arrival ledger</span><span>No arrivals yet</span></div></section><aside className="sn3-exception-card"><AlertTriangle className="h-5 w-5"/><p className="sn3-kicker">Open exception · EX-91</p><h3>Pass belongs to another Moment</h3><p>No attendance has been recorded. Resolve, redirect or document the exception before proceeding.</p><div><span>Scanned</span><strong>8:44 PM</strong></div><div><span>Pass Moment</span><strong>M-0904</strong></div><button type="button">Open exception case</button></aside></div>;
  if (surface === "proof") return <section className="sn3-review-list"><div className="sn3-section-head"><div><p className="sn3-kicker">Proof close</p><h2>Each record needs its own decision.</h2></div><StatePill tone="warn">6 WAITING</StatePill></div>{[["PS-1182","Arrival selfie + venue stamp","11:06 PM","Complete evidence","Review"],["PS-1185","Participation evidence","10:52 PM","Location proof intact","Review"],["PS-1190","Creator-host handoff","10:44 PM","One source missing","Needs evidence"]].map(([id,title,time,note,state])=><article key={id}><div className="sn3-id"><span>{id}</span><StatePill tone={state==="Needs evidence"?"warn":"neutral"}>{state}</StatePill></div><div><strong>{title}</strong><p>{note}</p></div><span>{time}</span><div className="sn3-inline-actions"><button type="button">Reject</button><button type="button">Approve</button></div></article>)}</section>;
  return <div className="sn3-results"><section><p className="sn3-kicker">Attendance close · M-0911</p><h2>What actually happened.</h2><div className="sn3-metric-row"><Metric label="RSVP intent" value="84" note="demand"/><Metric label="Verified attendance" value="61" note="evidence-backed"/><Metric label="Walk-ins" value="7" note="explicit"/><Metric label="Exceptions" value="2" note="closed"/></div><div className="sn3-timeline"><ActivityRow time="9:00" title="Doors opened" detail="0 attendance records before opening"/><ActivityRow time="10:30" title="Peak arrival window" detail="22 verified arrivals in 45 minutes"/><ActivityRow time="11:48" title="Last exception closed" detail="duplicate record reversed with audit trail"/></div></section><aside className="sn3-decision-card"><TrendingUp className="h-5 w-5"/><p className="sn3-kicker">Next decision</p><h3>Repeat Thursday window</h3><p>Keep the format. Add one more door operator between 10:30 and 11:15.</p><button type="button">Record decision</button></aside></div>;
}

function MerchantSurface({ surface }: { surface: string }) {
  if (surface === "today") return <div className="sn3-two-col"><section className="sn3-document sn3-document-dark"><div className="sn3-docline"><span>COUNTER BRIEF · SEA DECK</span><StatePill tone="good">OPEN</StatePill></div><div className="sn3-document-title"><div><p className="sn3-kicker">Tonight</p><h2>Wing Key</h2></div><strong>23 remaining</strong></div><div className="sn3-field-grid"><div><span>Offer state</span><strong>Active</strong></div><div><span>Valid window</span><strong>9 PM–1 AM</strong></div><div><span>Validated uses</span><strong>17</strong></div><div><span>Paid orders</span><strong>9 · separate records</strong></div></div><div className="sn3-action-row"><button type="button">Open validator</button><button type="button" className="sn3-secondary">View offer</button></div></section><aside className="sn3-side-stack"><div><p className="sn3-kicker">Counter attention</p><Attention meta="FULFILL" title="3 paid orders" detail="2 pickup · 1 delivery"/><Attention meta="EXCEPTION" title="Duplicate validation" detail="Code used 8 minutes ago." tone="bad"/><Attention meta="STOCK" title="23 Keys remain" detail="Allocation is below 60%." tone="warn"/></div></aside></div>;
  if (surface === "offers") return <section className="sn3-offer-instruments"><div className="sn3-section-head"><div><p className="sn3-kicker">Offer instruments</p><h2>Publish commercial rules, not generic cards.</h2></div><button type="button">+ New offer</button></div><div className="sn3-offer-grid">{[
    ["OF-2031","AFTRHRS Wing Key","ACTIVE","40","17","23","Tonight · 9 PM–1 AM","Sea Deck","1 per PromoCard · present before order"],
    ["OF-2044","Late-night combo","DRAFT","24","0","24","Not published","Sea Deck","Purchase required · one use per order"],
    ["OF-2050","Lunch return perk","SCHEDULED","∞","0","—","Mon–Fri · 11 AM–3 PM","Sea Deck","Claim unlimited · use capped to 1/day"],
  ].map(([id,title,state,allocated,used,remaining,window,place,rules])=><article key={id}><div className="sn3-offer-head"><span>{id}</span><StatePill tone={state==="ACTIVE"?"good":state==="DRAFT"?"warn":"neutral"}>{state}</StatePill></div><h3>{title}</h3><div className="sn3-offer-counts"><div><span>Allocated</span><strong>{allocated}</strong></div><div><span>Validated</span><strong>{used}</strong></div><div><span>Remaining</span><strong>{remaining}</strong></div></div><dl><div><dt>Validity</dt><dd>{window}</dd></div><div><dt>Place</dt><dd>{place}</dd></div><div><dt>Rules</dt><dd>{rules}</dd></div></dl><div className="sn3-action-row"><button type="button">Open instrument</button><button type="button" className="sn3-secondary">{state==="ACTIVE"?"Pause":"Edit"}</button></div></article>)}</div></section>;
  if (surface === "verify") return <div className="sn3-validator-layout"><section className="sn3-validator-device"><div className="sn3-device-top"><span>VALIDATION DEVICE · SEA DECK</span><StatePill tone="good">ONLINE</StatePill></div><div className="sn3-device-screen"><QrCode className="h-9 w-9"/><h2>Ready to validate</h2><p>A successful validation proves use of the offer. It does not create a purchase or fulfillment record.</p><button type="button">Enter code manually</button></div><div className="sn3-device-rule"><AlertTriangle className="h-4 w-4"/><span>Duplicate, invalid and offline attempts remain unrecorded.</span></div></section><aside className="sn3-document sn3-document-cream"><div className="sn3-docline"><span>VALIDATION SLIP</span><span>VL-1182</span></div><h3>Last confirmed use</h3><div className="sn3-field-list"><div><span>Offer</span><strong>Wing Key</strong></div><div><span>Venue</span><strong>Sea Deck</strong></div><div><span>Time</span><strong>10:42 PM</strong></div><div><span>State</span><strong>Validated</strong></div><div><span>Purchase</span><strong>Not recorded here</strong></div></div><div className="sn3-seal">USE VERIFIED</div></aside></div>;
  if (surface === "orders") return <section className="sn3-order-board"><div className="sn3-section-head"><div><p className="sn3-kicker">Order board</p><h2>Payment, fulfillment and refund stay distinct.</h2></div><StatePill>3 active orders</StatePill></div><div className="sn3-order-head"><span>Order</span><span>Mode</span><span>Payment</span><span>Fulfillment</span><span>Next action</span></div>{[["ORD-1842","Pickup","Paid","Ready","Handover"],["ORD-1844","Delivery","Paid","Packing","Dispatch"],["ORD-1838","Pickup","Refunded","Closed","History"]].map(([id,mode,payment,fulfillment,next])=><article key={id}><strong>{id}</strong><span>{mode}</span><StatePill tone={payment==="Paid"?"good":"neutral"}>{payment}</StatePill><span>{fulfillment}</span><button type="button">{next}</button></article>)}</section>;
  return <div className="sn3-place-layout"><section className="sn3-place-record"><div className="sn3-section-head"><div><p className="sn3-kicker">Place record · PL-002</p><h2>Sea Deck</h2></div><StatePill tone="good">ACTIVE VENUE</StatePill></div><p>20 Barbican Road · Kingston</p><div className="sn3-metric-row"><Metric label="Active offers" value="2" note="at this place"/><Metric label="Verified uses" value="31" note="this week"/><Metric label="Paid orders" value="9" note="separate evidence"/><Metric label="Return visitors" value="22" note="illustrative review"/></div><div className="sn3-timeline"><ActivityRow time="Thu" title="AFTRHRS" detail="Recurring Moment · 10 PM"/><ActivityRow time="Now" title="Wing Key active" detail="23 validations remain"/><ActivityRow time="Next" title="Lunch return perk" detail="Scheduled for Monday"/></div></section><aside className="sn3-decision-card"><MapPin className="h-5 w-5"/><p className="sn3-kicker">Place decision</p><h3>Keep Thursday, test lunch</h3><p>The place record should accumulate operating history rather than act like a venue profile page.</p><button type="button">Record place note</button></aside></div>;
}

function BrandSurface({ surface }: { surface: string }) {
  if (surface === "today") return <div className="sn3-two-col"><section className="sn3-dossier"><div className="sn3-docline"><span>ACTIVATION DOSSIER · AC-5021</span><StatePill tone="warn">EVIDENCE OPEN</StatePill></div><div className="sn3-document-title"><div><p className="sn3-kicker">First 50</p><h2>Can this activation create 50 real customer actions?</h2></div><strong>Decision due Friday</strong></div><div className="sn3-metric-row"><Metric label="Observed" value="47" note="actions exist"/><Metric label="Attributed" value="47" note="linked to activation"/><Metric label="Verified" value="34" note="crossed proof boundary"/><Metric label="Unresolved" value="13" note="decision required"/></div><div className="sn3-evidence-sources"><p className="sn3-kicker">Evidence sources</p><span>Tracked creator links · 29</span><span>Merchant validations · 12</span><span>Host arrivals · 6</span><span>Unresolved · 13</span></div><div className="sn3-dossier-warning"><AlertTriangle className="h-4 w-4"/><strong>Do not scale while 13 actions remain unresolved.</strong></div></section><aside className="sn3-side-stack"><div><p className="sn3-kicker">Decision queue</p><Attention meta="APPROVAL" title="2 creator concepts" detail="Pricing language needs sign-off."/><Attention meta="EVIDENCE" title="13 unresolved actions" detail="Review source strength before decision." tone="warn"/><Attention meta="FRIDAY" title="Montego Bay repeat" detail="Stop, change or scale."/></div><div className="sn3-mini-log"><p className="sn3-kicker">Evidence trace</p><ActivityRow time="1:06 PM" title="2 merchant validations added" detail="Verified source"/><ActivityRow time="12:18 PM" title="Creator attribution batch linked" detail="7 actions attributed"/><ActivityRow time="11:02 AM" title="Evidence pack opened" detail="Reviewer: Brand workspace"/></div></aside></div>;
  if (surface === "activations") return <section className="sn3-work-list"><div className="sn3-section-head"><div><p className="sn3-kicker">Activation rack</p><h2>Outcome first. Channels second.</h2></div><button type="button">+ New activation</button></div>{[["AC-5021","First 50","50 attributable customer actions","47 / 34 verified","Live"],["AC-5033","Find Your Flavour","Choice signal + product trial","Not started","Draft"],["AC-5040","Retail Return","Repeat store visit","Planning","Planning"]].map(([id,title,outcome,proof,state])=><article key={id}><div className="sn3-id"><span>{id}</span><StatePill>{state}</StatePill></div><div><h3>{title}</h3><p>{outcome}</p></div><div><span>Evidence</span><strong>{proof}</strong></div><div><span>Budget state</span><strong>Committed</strong></div><div><span>Decision</span><strong>{state==="Live"?"Open":"Not due"}</strong></div><button type="button">Open</button></article>)}</section>;
  if (surface === "people") return <div className="sn3-network-layout"><section><div className="sn3-section-head"><div><p className="sn3-kicker">Delivery network</p><h2>Who owns each part of the outcome?</h2></div><StatePill>AC-5021</StatePill></div>{[["Creators","4","Distribution + content","2 concepts need approval"],["Hosts","2","Experience + arrivals","Ready"],["Places","3","Validation + transaction","1 merchant setup incomplete"]].map(([label,count,job,state])=><div className="sn3-network-row" key={label}><strong>{count}</strong><div><h3>{label}</h3><p>{job}</p></div><span>{state}</span><button type="button">Open</button></div>)}</section><aside className="sn3-decision-card"><Users className="h-5 w-5"/><p className="sn3-kicker">Approval boundary</p><h3>Pricing copy requires brand sign-off</h3><p>Creator and agency operators can prepare work. They cannot approve the brand’s commercial claim on its behalf.</p><button type="button">Review concept</button></aside></div>;
  if (surface === "evidence") return <section className="sn3-evidence-pack"><div className="sn3-section-head"><div><p className="sn3-kicker">Evidence pack · EP-5021</p><h2>First 50</h2></div><StatePill tone="warn">13 UNRESOLVED</StatePill></div><div className="sn3-evidence-ledger">{[
    ["EV-901","Creator tracked link","Observed → Attributed","18","Strong","12:18 PM"],
    ["EV-907","Merchant validation","Verified use","12","Verified","1:06 PM"],
    ["EV-912","Host arrival","Verified attendance","6","Verified","12:42 AM"],
    ["EV-920","Unmatched action batch","Observed only","13","Needs review","11:34 AM"],
  ].map(([id,source,type,count,strength,time])=><article key={id}><span>{id}</span><div><strong>{source}</strong><p>{type}</p></div><b>{count}</b><StatePill tone={strength==="Verified"?"good":strength==="Needs review"?"warn":"neutral"}>{strength}</StatePill><small>{time}</small></article>)}</div><div className="sn3-audit-strip"><History className="h-4 w-4"/><span>Evidence changes append to the pack. The decision record should cite the evidence state it used.</span></div></section>;
  return <section className="sn3-decision-board"><div className="sn3-section-head"><div><p className="sn3-kicker">Decision record · AC-5021</p><h2>Stop, change or scale—with a reason.</h2></div><StatePill>NOT RECORDED</StatePill></div><div className="sn3-decision-options">{[["STOP","Evidence does not justify another run."],["CHANGE","Adjust offer, place or creator mix, then test again."],["SCALE","Repeat only what the verified evidence supports."]].map(([title,detail])=><button type="button" key={title}><strong>{title}</strong><span>{detail}</span><ArrowRight className="h-4 w-4"/></button>)}</div><div className="sn3-decision-footer"><span>Decision must preserve:</span><strong>Evidence pack version · owner · time · rationale · next operating change</strong></div></section>;
}

function AgencySurface({ surface }: { surface: string }) {
  if (surface === "today") return <div className="sn3-two-col"><section className="sn3-portfolio"><div className="sn3-section-head"><div><p className="sn3-kicker">Portfolio attention</p><h2>Which client needs you now?</h2></div><StatePill>3 CLIENTS</StatePill></div>{[["Manchester Hills Foods","Result pack needs recommendation","Proof ready","Brand"],["Sea Deck","Activation live tonight","Operate","Venue"],["Flash Motors","Creative approval blocked","Client action","Brand"]].map(([client,detail,state,type])=><article key={client}><Building2 className="h-4 w-4"/><div><strong>{client}</strong><p>{detail}</p></div><StatePill tone={state==="Client action"?"warn":"neutral"}>{state}</StatePill><span>{type}</span><button type="button">Open</button></article>)}</section><aside className="sn3-client-context"><p className="sn3-kicker">Active client context</p><h3>Manchester Hills Foods</h3><div><span>Owner</span><strong>Manchester Hills</strong></div><div><span>Operator</span><strong>Pandxtra</strong></div><div><span>Current work</span><strong>First 50 · AC-5021</strong></div><div><span>Boundary</span><strong>Agency manages; client owns</strong></div><button type="button">Open client workspace</button></aside></div>;
  if (surface === "clients") return <section className="sn3-work-list"><div className="sn3-section-head"><div><p className="sn3-kicker">Client ledger</p><h2>Context is part of the work.</h2></div><button type="button">+ Connect client</button></div>{[["MH-005","Manchester Hills Foods","Brand","Active","1 live activation"],["SD-002","Sea Deck","Venue","Active","Live venue tonight"],["FM-011","Flash Motors","Brand","Pending","Relationship approval"]].map(([id,name,type,state,note])=><article key={id}><div className="sn3-id"><span>{id}</span><StatePill>{state}</StatePill></div><div><h3>{name}</h3><p>{type} client</p></div><div><span>Ownership</span><strong>Client retained</strong></div><div><span>Attention</span><strong>{note}</strong></div><div><span>Context</span><strong>Explicit workspace</strong></div><button type="button">Open</button></article>)}</section>;
  if (surface === "work") return <div className="sn3-network-layout"><section><div className="sn3-section-head"><div><p className="sn3-kicker">Managed work · Manchester Hills</p><h2>First 50</h2></div><StatePill tone="warn">1 BLOCKER</StatePill></div><div className="sn3-kanban">{[["Preparing","Creator concept","Agency"],["Approval","Pricing copy","Client"],["Live","Retail QR activation","Agency"],["Proof","34 verified outcomes","Shared"]].map(([state,item,owner])=><div key={state}><span>{state}</span><strong>{item}</strong><small>Owner: {owner}</small></div>)}</div><div className="sn3-timeline"><ActivityRow time="12:42" title="Client approval requested" detail="Pricing language sent to Manchester Hills"/><ActivityRow time="11:18" title="Evidence pack updated" detail="34 verified outcomes"/></div></section><aside className="sn3-exception-card"><AlertTriangle className="h-5 w-5"/><p className="sn3-kicker">Approval blocker</p><h3>Agency cannot approve pricing claims</h3><p>The client must sign off. This boundary should remain visible in the work object.</p><button type="button">Request sign-off</button></aside></div>;
  if (surface === "proof") return <section className="sn3-dossier"><div className="sn3-docline"><span>MANAGED RESULT PACK · MR-117</span><StatePill>CLIENT OWNED</StatePill></div><div className="sn3-document-title"><div><p className="sn3-kicker">Manchester Hills · First 50</p><h2>Result pack</h2></div><strong>Recommendation required</strong></div><div className="sn3-field-grid"><div><span>Outcome</span><strong>34 verified actions</strong></div><div><span>Agency role</span><strong>Managed activation + evidence packaging</strong></div><div><span>Client truth</span><strong>Manchester Hills retains ownership</strong></div><div><span>Open issue</span><strong>13 unresolved actions</strong></div></div><div className="sn3-recommendation"><TrendingUp className="h-4 w-4"/><div><span>Working recommendation</span><strong>Change offer framing before Montego Bay repeat.</strong></div></div><div className="sn3-action-row"><button type="button">Record recommendation</button><button type="button" className="sn3-secondary">Open evidence</button></div></section>;
  return <div className="sn3-growth-layout"><section><p className="sn3-kicker">Expansion brief</p><h2>Use the proven result to define the next test.</h2><div className="sn3-field-grid"><div><span>Target</span><strong>75 attributable actions</strong></div><div><span>Market</span><strong>Montego Bay</strong></div><div><span>Operating change</span><strong>Revised offer framing</strong></div><div><span>Locations</span><strong>2 retail sites</strong></div></div><div className="sn3-dossier-warning"><AlertTriangle className="h-4 w-4"/><strong>Proposal should cite the evidence pack, not promise projected ROI.</strong></div></section><aside className="sn3-decision-card"><TrendingUp className="h-5 w-5"/><p className="sn3-kicker">Next proposal</p><h3>Montego Bay pilot</h3><p>Outcome-led expansion based on what the First 50 run actually proved.</p><button type="button">Prepare proposal</button></aside></div>;
}

function AdminSurface({ surface }: { surface: string }) {
  if (surface === "today") return <div className="sn3-two-col"><section className="sn3-admin-queue"><div className="sn3-section-head"><div><p className="sn3-kicker">Priority queue</p><h2>Intervene where truth or money is blocked.</h2></div><StatePill tone="warn">3 PRIORITY</StatePill></div>{[["P1","AC-1182","Attendance reversal","Guest receipt disputed","Cases"],["P1","PQ-118","Payout exception","Manual reference missing","Economy"],["P2","KY-092","KYC review","Merchant seller submitted","Review"]].map(([p,id,title,detail,area])=><article key={id}><b>{p}</b><span>{id}</span><div><strong>{title}</strong><p>{detail}</p></div><StatePill>{area}</StatePill><button type="button">Open</button></article>)}</section><aside className="sn3-admin-rule"><ShieldCheck className="h-6 w-6"/><p className="sn3-kicker">Operator rule</p><h3>Resolve the authoritative state first.</h3><p>Corrections append. Original records remain inspectable. Unknown actors or outcomes are never invented.</p><div className="sn3-mini-log"><ActivityRow time="1:12" title="Payout exception opened" detail="Missing external reference"/><ActivityRow time="12:56" title="Proof decision recorded" detail="PS-1180 approved"/></div></aside></div>;
  if (surface === "cases") return <section className="sn3-case-file"><div className="sn3-docline"><span>EXCEPTION CASE · AC-1182</span><StatePill tone="warn">OPEN</StatePill></div><div className="sn3-document-title"><div><p className="sn3-kicker">Attendance reversal</p><h2>Duplicate scan dispute</h2></div><strong>Owner: Admin Ops</strong></div><div className="sn3-case-chain"><div><span>Original record</span><strong>Verified guest attendance</strong><p>10:44 PM · receipt GR-771</p></div><div><span>Dispute</span><strong>Host reports duplicate scan</strong><p>11:02 PM · host note attached</p></div><div><span>Evidence</span><strong>Receipt + door log + device trace</strong><p>All source records retained</p></div><div><span>Decision</span><strong>Pending operator review</strong><p>No reversal written yet</p></div></div><div className="sn3-action-row"><button type="button">Resolve with append-only reversal</button><button type="button" className="sn3-secondary">Escalate</button></div></section>;
  if (surface === "review") return <div className="sn3-review-desks">{[[FileCheck2,"Proof review","6","Participation evidence requiring a decision."],[UserRoundCheck,"KYC review","2","Seller onboarding and payout eligibility."],[Scale,"Moderation","1","Content or marketplace integrity review."]].map(([Icon,title,count,detail])=>{const I=Icon as React.ComponentType<{className?:string}>;return <section key={String(title)}><I className="h-5 w-5"/><StatePill tone="warn">{String(count)} waiting</StatePill><h3>{String(title)}</h3><p>{String(detail)}</p><button type="button">Open desk</button></section>})}</div>;
  if (surface === "economy") return <section className="sn3-settlement"><div className="sn3-section-head"><div><p className="sn3-kicker">Settlement exceptions</p><h2>Queued is not paid.</h2></div><StatePill>MONEY STATES EXPLICIT</StatePill></div><div className="sn3-order-head"><span>Record</span><span>Amount</span><span>State</span><span>Blocker / reference</span><span>Action</span></div>{[["PQ-118","JMD $120","Queued","External reference required","Resolve"],["PQ-121","USD $84","Paid","Reference PX-20418","Inspect"],["PQ-127","USD $36","Held","KYC blocker","Review KYC"]].map(([id,amount,state,note,action])=><article key={id}><strong>{id}</strong><span>{amount}</span><StatePill tone={state==="Paid"?"good":state==="Held"?"bad":"warn"}>{state}</StatePill><span>{note}</span><button type="button">{action}</button></article>)}</section>;
  return <div className="sn3-health-layout"><section><div className="sn3-section-head"><div><p className="sn3-kicker">Operational health</p><h2>Can the system explain what happened?</h2></div><StatePill tone="good">TRACEABLE</StatePill></div><div className="sn3-metric-row"><Metric label="Audit lineage" value="Stable" note="illustrative review"/><Metric label="Exception backlog" value="3" note="priority"/><Metric label="Settlement blockers" value="1" note="manual action"/><Metric label="Unknown writes" value="0" note="target"/></div><div className="sn3-timeline"><ActivityRow time="1:22" title="Audit sample complete" detail="Five corrections traced to original records"/><ActivityRow time="12:40" title="Commerce refund checked" detail="Original purchase retained"/><ActivityRow time="11:08" title="Attendance reversal traced" detail="Case AC-1182 remains open"/></div></section><aside className="sn3-admin-rule"><Fingerprint className="h-6 w-6"/><p className="sn3-kicker">Traceability</p><h3>Every correction should explain itself.</h3><p>Original event, actor, reason, correction and downstream state should remain inspectable.</p><button type="button">Open audit ledger</button></aside></div>;
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

  return <div className={`sn3-root sn3-role-${role}`}>
    <header className="sn3-header">
      <div className="sn3-brand"><PromorangMark size={30}/><div><span>PROMORANG</span><small>Stakeholder Next · operational review</small></div></div>
      <div className="sn3-role-tabs" aria-label="Stakeholder role review">{roleOrder.map((item)=><button key={item} type="button" className={item===role?"is-active":""} onClick={()=>navigate(`/${item}/today`)}>{roles[item].label}</button>)}</div>
      <span className="sn3-review-badge">Illustrative review data</span>
    </header>

    <main className="sn3-shell">
      <section className="sn3-operating-head">
        <div className="sn3-job"><p>{config.context}</p><h1>{config.job}</h1></div>
        <div className="sn3-current-move"><span>CURRENT MOVE</span><strong>{config.move}</strong><p>{config.moveDetail}</p></div>
        <div className="sn3-status"><span>WORKSPACE STATUS</span><strong>{config.status}</strong></div>
      </section>
      <nav className="sn3-nav" aria-label={`${config.label} navigation`}>{config.surfaces.map((item)=>{const Icon=item.icon;return <NavLink key={item.key} to={`/${role}/${item.key}`} className={item.key===validSurface?"is-active":""}><Icon className="h-4 w-4"/><span><strong>{item.label}</strong><small>{item.hint}</small></span></NavLink>})}</nav>
      <section className="sn3-workspace"><SurfaceRenderer role={role} surface={validSurface}/></section>
    </main>
  </div>;
}

export default function StakeholderNextV3() {
  return <Routes><Route path="/:role/:surface" element={<Workspace/>}/><Route path="/:role" element={<Navigate to="/creator/today" replace/>}/><Route path="/" element={<Navigate to="/creator/today" replace/>}/><Route path="*" element={<Navigate to="/creator/today" replace/>}/></Routes>;
}
