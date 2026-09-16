import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Navigate, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  FileText,
  Fingerprint,
  FolderKanban,
  Handshake,
  Layers3,
  MapPin,
  Megaphone,
  PackageCheck,
  QrCode,
  Radio,
  Search,
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
import "./index.css";
import "./stakeholder-next.css";

type RoleKey = "creator" | "host" | "merchant" | "brand" | "agency" | "admin";
type Tone = "purple" | "amber" | "emerald" | "orange" | "blue" | "slate";
type SurfaceConfig = { key: string; label: string; hint: string; icon: React.ComponentType<{ className?: string }> };
type AttentionItem = { title: string; detail: string; state: string; surface: string };
type RoleConfig = {
  label: string;
  eyebrow: string;
  title: string;
  promise: string;
  tone: Tone;
  context: string;
  currentMove: string;
  currentMoveDetail: string;
  primaryAction: string;
  surfaces: SurfaceConfig[];
  attention: AttentionItem[];
  metrics: { label: string; value: string; note: string }[];
};

const roles: Record<RoleKey, RoleConfig> = {
  creator: {
    label: "Creator",
    eyebrow: "Creator Next",
    title: "Make useful work. Prove what it moved.",
    promise: "Opportunities, briefs, submissions, proof and value in one working rhythm.",
    tone: "purple",
    context: "Creator workspace · Kingston",
    currentMove: "Finish the Broken Plate brief",
    currentMoveDetail: "1 deliverable due today · proof requires published link + audience action screenshot",
    primaryAction: "Open active brief",
    surfaces: [
      { key: "today", label: "Today", hint: "What needs you now", icon: Sparkles },
      { key: "work", label: "Work", hint: "Opportunities + briefs", icon: Target },
      { key: "create", label: "Create", hint: "Deliverables + submissions", icon: WandSparkles },
      { key: "proof", label: "Proof", hint: "What your work caused", icon: FileCheck2 },
      { key: "value", label: "Value", hint: "Earnings + reputation", icon: CircleDollarSign },
    ],
    attention: [
      { title: "Revision requested", detail: "Opening Run reel · tighten CTA and resubmit", state: "Needs action", surface: "create" },
      { title: "Brief closes tonight", detail: "Kingston Food Drop · 2 creator slots remain", state: "Decision", surface: "work" },
      { title: "Proof approved", detail: "Sea Deck walkthrough · attributed actions confirmed", state: "Recorded", surface: "proof" },
    ],
    metrics: [
      { label: "Active work", value: "2", note: "1 due today" },
      { label: "Proof approved", value: "18", note: "Last 30 days" },
      { label: "Attributed actions", value: "147", note: "From your work" },
      { label: "Value recorded", value: "$84", note: "Illustrative" },
    ],
  },
  host: {
    label: "Host",
    eyebrow: "Host Next",
    title: "Fill it. Run it. Prove who came.",
    promise: "Moments, arrivals, live operation and proof close without dashboard theatre.",
    tone: "amber",
    context: "Host workspace · Kingston After Dark",
    currentMove: "Prepare tonight's arrival window",
    currentMoveDetail: "Doors 9:00 PM · 84 RSVPs · attendance only counts after check-in or explicit walk-in record",
    primaryAction: "Open live run sheet",
    surfaces: [
      { key: "today", label: "Today", hint: "Run the next move", icon: Sparkles },
      { key: "moments", label: "Moments", hint: "Plan + publish", icon: CalendarDays },
      { key: "live", label: "Live", hint: "Arrivals + room", icon: Radio },
      { key: "proof", label: "Proof", hint: "Review + close", icon: ShieldCheck },
      { key: "results", label: "Results", hint: "Attendance + return", icon: BarChart3 },
    ],
    attention: [
      { title: "Door exception", detail: "Pass belongs to another Moment · resolve before admitting", state: "Blocked", surface: "live" },
      { title: "6 proofs waiting", detail: "Participation evidence from last Thursday", state: "Review", surface: "proof" },
      { title: "Sponsor asset due", detail: "Flash Motors vehicle placement approval", state: "Today", surface: "moments" },
    ],
    metrics: [
      { label: "RSVP intent", value: "84", note: "Not attendance" },
      { label: "Verified arrivals", value: "0", note: "Doors not open" },
      { label: "Proof waiting", value: "6", note: "Needs review" },
      { label: "Return audience", value: "38%", note: "Illustrative" },
    ],
  },
  merchant: {
    label: "Merchant / Venue",
    eyebrow: "Merchant Next",
    title: "Give people a reason to come back.",
    promise: "Offers, validation, orders, places and repeat customers centered on actual customer action.",
    tone: "emerald",
    context: "Merchant workspace · Sea Deck",
    currentMove: "Keep tonight's Wing Key ready",
    currentMoveDetail: "PromoKey active · 40 redemptions available · validation proves use, not purchase revenue",
    primaryAction: "Open validation station",
    surfaces: [
      { key: "today", label: "Today", hint: "What needs operating", icon: Sparkles },
      { key: "offers", label: "Offers", hint: "Products + perks", icon: Store },
      { key: "verify", label: "Verify", hint: "Claims + redemptions", icon: QrCode },
      { key: "orders", label: "Orders", hint: "Paid + fulfillment", icon: ShoppingBag },
      { key: "places", label: "Places", hint: "Venue + repeat", icon: MapPin },
    ],
    attention: [
      { title: "Validation conflict", detail: "A code was already used 8 minutes ago", state: "Check", surface: "verify" },
      { title: "3 orders to fulfil", detail: "Two pickup · one delivery", state: "Action", surface: "orders" },
      { title: "Offer inventory low", detail: "12 Wing Keys remain for this run", state: "Watch", surface: "offers" },
    ],
    metrics: [
      { label: "Active offers", value: "4", note: "2 at this venue" },
      { label: "Verified uses", value: "31", note: "This week" },
      { label: "Paid orders", value: "9", note: "Separate evidence" },
      { label: "Repeat visitors", value: "22", note: "Illustrative" },
    ],
  },
  brand: {
    label: "Brand",
    eyebrow: "Brand Next",
    title: "Turn marketing activity into a decision.",
    promise: "Outcome, activation, people, evidence and scale decisions in one operating view.",
    tone: "orange",
    context: "Brand workspace · Manchester Hills Foods",
    currentMove: "Review the First 50 evidence pack",
    currentMoveDetail: "47 attributable actions · 34 verified · 13 unresolved · do not scale until proof gap is understood",
    primaryAction: "Open evidence pack",
    surfaces: [
      { key: "today", label: "Today", hint: "What needs a decision", icon: Sparkles },
      { key: "activations", label: "Activations", hint: "Outcome + execution", icon: Megaphone },
      { key: "people", label: "People", hint: "Creators + hosts + places", icon: Users },
      { key: "evidence", label: "Evidence", hint: "What actually happened", icon: FileCheck2 },
      { key: "decisions", label: "Decisions", hint: "Stop, change or scale", icon: TrendingUp },
    ],
    attention: [
      { title: "Evidence needs review", detail: "13 customer actions remain unresolved", state: "Decision", surface: "evidence" },
      { title: "Creator brief approval", detail: "2 creator concepts waiting for brand sign-off", state: "Approve", surface: "people" },
      { title: "Activation closes Friday", detail: "Decide whether to repeat in Montego Bay", state: "Upcoming", surface: "decisions" },
    ],
    metrics: [
      { label: "Live activations", value: "2", note: "One closes Friday" },
      { label: "Attributed actions", value: "47", note: "Not all verified" },
      { label: "Verified outcomes", value: "34", note: "Evidence-backed" },
      { label: "Unresolved", value: "13", note: "Needs review" },
    ],
  },
  agency: {
    label: "Agency",
    eyebrow: "Agency Next",
    title: "Operate clients without losing client truth.",
    promise: "Portfolio, client context, approvals, execution and result packaging without ownership ambiguity.",
    tone: "blue",
    context: "Agency workspace · Pandxtra",
    currentMove: "Package Manchester Hills result",
    currentMoveDetail: "Client context locked · 34 verified outcomes · evidence pack needs final recommendation",
    primaryAction: "Open managed result",
    surfaces: [
      { key: "today", label: "Today", hint: "Portfolio attention", icon: Sparkles },
      { key: "clients", label: "Clients", hint: "Accounts + context", icon: Building2 },
      { key: "work", label: "Work", hint: "Activations + approvals", icon: FolderKanban },
      { key: "proof", label: "Proof", hint: "Managed results", icon: FileCheck2 },
      { key: "growth", label: "Growth", hint: "Expansion + next proposal", icon: TrendingUp },
    ],
    attention: [
      { title: "Client approval blocked", detail: "Manchester Hills pricing copy requires sign-off", state: "Blocked", surface: "work" },
      { title: "Result pack ready", detail: "Sea Deck activation proof can be shared", state: "Package", surface: "proof" },
      { title: "Relationship request", detail: "New venue client invited agency access", state: "Review", surface: "clients" },
    ],
    metrics: [
      { label: "Managed clients", value: "5", note: "3 brand · 2 venue" },
      { label: "Live work", value: "4", note: "Across clients" },
      { label: "Proof ready", value: "2", note: "For client review" },
      { label: "Blocked", value: "1", note: "Needs client approval" },
    ],
  },
  admin: {
    label: "Admin",
    eyebrow: "Admin Next",
    title: "Resolve exceptions. Preserve the record.",
    promise: "Priority cases, evidence, interventions and platform health instead of telemetry theatre.",
    tone: "slate",
    context: "PROMORANG operations · Admin",
    currentMove: "Resolve attendance reversal case",
    currentMoveDetail: "Case AC-1182 · original attendance remains in history · correction must append an audit record",
    primaryAction: "Open priority case",
    surfaces: [
      { key: "today", label: "Today", hint: "Priority queue", icon: Sparkles },
      { key: "cases", label: "Cases", hint: "Exceptions + support", icon: Briefcase },
      { key: "review", label: "Review", hint: "Proof + KYC + moderation", icon: ShieldCheck },
      { key: "economy", label: "Economy", hint: "Payouts + disputes", icon: CircleDollarSign },
      { key: "health", label: "Health", hint: "System + audit", icon: Fingerprint },
    ],
    attention: [
      { title: "Attendance reversal", detail: "Host disputes one verified guest receipt", state: "Priority", surface: "cases" },
      { title: "Payout exception", detail: "Settlement queue item needs manual reference", state: "Action", surface: "economy" },
      { title: "KYC review", detail: "Merchant seller onboarding submitted", state: "Review", surface: "review" },
    ],
    metrics: [
      { label: "Priority cases", value: "3", note: "Needs intervention" },
      { label: "Proof queue", value: "6", note: "Across platform" },
      { label: "Payout exceptions", value: "1", note: "Manual action" },
      { label: "Audit health", value: "Stable", note: "Illustrative" },
    ],
  },
};

const roleOrder: RoleKey[] = ["creator", "host", "merchant", "brand", "agency", "admin"];

function toneClass(tone: Tone, suffix: string) {
  return `stakeholder-tone-${tone}-${suffix}`;
}

function RoleSwitcher({ activeRole }: { activeRole: RoleKey }) {
  const navigate = useNavigate();
  return (
    <div className="stakeholder-role-switcher" aria-label="Stakeholder review role">
      {roleOrder.map((roleKey) => (
        <button
          key={roleKey}
          type="button"
          onClick={() => navigate(`/${roleKey}/today`)}
          className={activeRole === roleKey ? "is-active" : ""}
        >
          {roles[roleKey].label}
        </button>
      ))}
    </div>
  );
}

function Artifact({ role, surface }: { role: RoleKey; surface: string }) {
  const config = roles[role];
  const artifactMap: Record<RoleKey, { noun: string; serial: string; icon: React.ComponentType<{ className?: string }>; rows: [string, string][]; stamp: string }> = {
    creator: {
      noun: "Creator Brief",
      serial: "CB-0421 · ACTIVE",
      icon: FileText,
      rows: [["Deliverable", "1 vertical reel"], ["Outcome", "Drive qualified Moment visits"], ["Proof", "Published link + action evidence"], ["Due", "Today · 6:00 PM"]],
      stamp: surface === "proof" ? "PROOF APPROVED" : surface === "value" ? "VALUE ATTRIBUTED" : "IN PRODUCTION",
    },
    host: {
      noun: "Run Sheet",
      serial: "MOMENT-0918 · DOORS",
      icon: CalendarDays,
      rows: [["Venue", "Sea Deck"], ["Doors", "9:00 PM"], ["RSVP", "84 intent records"], ["Attendance", "Requires arrival record"]],
      stamp: surface === "proof" ? "PROOF CLOSE" : surface === "live" ? "DOOR MODE" : "RUN READY",
    },
    merchant: {
      noun: "Validation Slip",
      serial: "VL-1182 · LIVE",
      icon: QrCode,
      rows: [["Offer", "AFTRHRS Wing Key"], ["Issuer", "Sea Deck"], ["State", "Ready to validate"], ["Boundary", "Use ≠ purchase"]],
      stamp: surface === "orders" ? "ORDER EVIDENCE" : surface === "verify" ? "VALIDATION READY" : "OFFER ACTIVE",
    },
    brand: {
      noun: "Activation Dossier",
      serial: "AC-5021 · EVIDENCE",
      icon: Megaphone,
      rows: [["Outcome", "50 attributable actions"], ["Observed", "47"], ["Verified", "34"], ["Unresolved", "13"]],
      stamp: surface === "decisions" ? "DECISION DUE" : surface === "evidence" ? "EVIDENCE OPEN" : "ACTIVATION LIVE",
    },
    agency: {
      noun: "Client Ledger",
      serial: "PANDXTRA · MH-005",
      icon: FolderKanban,
      rows: [["Client", "Manchester Hills Foods"], ["Ownership", "Client"], ["Operator", "Pandxtra"], ["Result", "34 verified outcomes"]],
      stamp: surface === "proof" ? "RESULT PACK" : surface === "growth" ? "EXPANSION READY" : "MANAGED CONTEXT",
    },
    admin: {
      noun: "Exception Case",
      serial: "CASE AC-1182 · OPEN",
      icon: ShieldCheck,
      rows: [["Type", "Attendance reversal"], ["Original", "Verified receipt retained"], ["Decision", "Pending review"], ["Audit", "Append-only correction"]],
      stamp: surface === "health" ? "AUDIT TRACE" : surface === "economy" ? "SETTLEMENT HOLD" : "CASE OPEN",
    },
  };
  const artifact = artifactMap[role];
  const Icon = artifact.icon;
  return (
    <article className={`stakeholder-artifact ${toneClass(config.tone, "artifact")}`}>
      <div className="stakeholder-artifact__topline">
        <span>{artifact.serial}</span>
        <Icon className="h-4 w-4" />
      </div>
      <h3>{artifact.noun}</h3>
      <div className="stakeholder-artifact__rows">
        {artifact.rows.map(([label, value]) => (
          <div key={label}><span>{label}</span><strong>{value}</strong></div>
        ))}
      </div>
      <div className="stakeholder-artifact__stamp">{artifact.stamp}</div>
    </article>
  );
}

function SurfaceWork({ role, surface }: { role: RoleKey; surface: string }) {
  const config = roles[role];
  const surfaceConfig = config.surfaces.find((item) => item.key === surface) || config.surfaces[0];
  const cardsByRole: Record<RoleKey, Record<string, { title: string; copy: string; meta: string; icon: React.ComponentType<{ className?: string }> }[]>> = {
    creator: {
      today: [
        { title: "Active brief", copy: "Broken Plate · finish one reel and submit proof before 6 PM.", meta: "Current move", icon: Target },
        { title: "Revision", copy: "Opening Run needs a clearer CTA before it can be approved.", meta: "Needs action", icon: AlertTriangle },
        { title: "New opportunity", copy: "Kingston Food Drop closes tonight. Review outcome and reward before accepting.", meta: "Decision", icon: Sparkles },
      ],
      work: [
        { title: "Broken Plate", copy: "Create one reel that moves qualified viewers toward the Moment.", meta: "Accepted · due today", icon: FileText },
        { title: "Kingston Food Drop", copy: "Two creator slots remain. Proof requires attributable action, not reach alone.", meta: "Open brief", icon: Target },
        { title: "AftrHrs return", copy: "Audience overlap is strong; reward becomes visible before acceptance.", meta: "Recommended", icon: Radio },
      ],
      create: [
        { title: "Draft deliverable", copy: "Vertical reel · 0:21 · link attached.", meta: "In production", icon: WandSparkles },
        { title: "Revision requested", copy: "CTA must point to the live Moment instead of profile bio.", meta: "1 change", icon: AlertTriangle },
        { title: "Submission folder", copy: "Deliverable, published URL and action evidence stay together.", meta: "Proof-ready", icon: FolderKanban },
      ],
      proof: [
        { title: "Sea Deck walkthrough", copy: "18 attributable actions confirmed from the published deliverable.", meta: "Approved", icon: BadgeCheck },
        { title: "Opening Run", copy: "Submission exists, but approval remains pending after revision request.", meta: "Not approved", icon: Clock3 },
        { title: "Proof history", copy: "Approval and rejection remain separate from settlement.", meta: "18 approved", icon: FileCheck2 },
      ],
      value: [
        { title: "Attributed value", copy: "Value recorded from verified mission actions; this is not automatically cash paid.", meta: "$84 illustrative", icon: CircleDollarSign },
        { title: "Reputation", copy: "Proven work, approval history and reliable delivery increase what unlocks next.", meta: "Rising", icon: TrendingUp },
        { title: "Settlement", copy: "Queued and paid states remain explicit when an actual payout path exists.", meta: "No false paid state", icon: CheckCircle2 },
      ],
    },
    host: {
      today: [
        { title: "Tonight's Moment", copy: "Doors at 9 PM. Confirm staff, arrival window and proof-close owner.", meta: "Current move", icon: CalendarDays },
        { title: "6 proofs waiting", copy: "Review participation evidence from the last run.", meta: "Review", icon: ShieldCheck },
        { title: "Sponsor placement", copy: "Flash Motors asset requires final venue approval.", meta: "Today", icon: Handshake },
      ],
      moments: [
        { title: "AFTRHRS", copy: "Published · Sea Deck · arrival window and host operating details attached.", meta: "Live this week", icon: CalendarDays },
        { title: "Create next Moment", copy: "Demand signal suggests a late-night food market in Liguanea.", meta: "Demand-backed", icon: Sparkles },
        { title: "Run sheet", copy: "Timeline, venue, staff, sponsor obligations and proof-close responsibilities.", meta: "Ready", icon: FileText },
      ],
      live: [
        { title: "Arrival board", copy: "RSVP means intent. Check-in and explicit walk-in records create attendance evidence.", meta: "Doors mode", icon: UserRoundCheck },
        { title: "Door exception", copy: "Pass belongs to another Moment. Hold until resolved.", meta: "Blocked", icon: AlertTriangle },
        { title: "Room message", copy: "Operational broadcast without invented delivery counts.", meta: "Available", icon: Radio },
      ],
      proof: [
        { title: "Proof queue", copy: "Six submissions need approve/reject decisions with an auditable reason.", meta: "6 pending", icon: ShieldCheck },
        { title: "Attendance close", copy: "Lock final verified attendance after unresolved door cases are handled.", meta: "After doors", icon: FileCheck2 },
        { title: "Rejected proof", copy: "Rejection changes current state but preserves the original submission.", meta: "History retained", icon: AlertTriangle },
      ],
      results: [
        { title: "Verified attendance", copy: "Show actual attendance separately from RSVP demand.", meta: "Evidence-backed", icon: BarChart3 },
        { title: "Return audience", copy: "Who came back to another Moment after the first visit.", meta: "38% illustrative", icon: TrendingUp },
        { title: "Next move", copy: "Use proof to decide what to repeat, change or stop.", meta: "Decision", icon: ArrowRight },
      ],
    },
    merchant: {
      today: [
        { title: "Validation station", copy: "AFTRHRS Wing Key is active. Keep the scanner ready for tonight.", meta: "Current move", icon: QrCode },
        { title: "Orders to fulfil", copy: "Two pickup orders and one delivery are waiting.", meta: "3 actions", icon: ShoppingBag },
        { title: "Inventory warning", copy: "12 Wing Keys remain in the current allocation.", meta: "Watch", icon: PackageCheck },
      ],
      offers: [
        { title: "AFTRHRS Wing Key", copy: "Complimentary wings · valid at Sea Deck · issuer and validity visible before claim.", meta: "Active", icon: Store },
        { title: "Late-night combo", copy: "Product offer with actual inventory and fulfillment mode.", meta: "Draft", icon: PackageCheck },
        { title: "Demand signal", copy: "People nearby are asking for a late-night food option.", meta: "621 signals", icon: Sparkles },
      ],
      verify: [
        { title: "Ready to scan", copy: "Validation confirms use of the offer; it does not manufacture purchase revenue.", meta: "Live", icon: QrCode },
        { title: "Duplicate conflict", copy: "Code was already validated. Show the previous confirmed receipt and stop the write.", meta: "Check", icon: AlertTriangle },
        { title: "Validation receipt", copy: "Issuer, time, offer and state become a durable proof object.", meta: "Proof", icon: FileCheck2 },
      ],
      orders: [
        { title: "Paid order", copy: "Purchase/payment evidence remains separate from redemption evidence.", meta: "Fulfil next", icon: ShoppingBag },
        { title: "Pickup ready", copy: "Customer order is paid and waiting for fulfillment confirmation.", meta: "2 orders", icon: PackageCheck },
        { title: "Refunded order", copy: "Refund appends a correction instead of erasing the original purchase.", meta: "History retained", icon: FileText },
      ],
      places: [
        { title: "Sea Deck", copy: "20 Barbican Road · active offers, Moments and validations in one place context.", meta: "Primary venue", icon: MapPin },
        { title: "Repeat audience", copy: "Customers with verified prior action who can be served again appropriately.", meta: "22 illustrative", icon: Users },
        { title: "Place performance", copy: "Use verified actions and paid orders, not vanity reach.", meta: "Review", icon: BarChart3 },
      ],
    },
    brand: {
      today: [
        { title: "Evidence pack", copy: "First 50 has 34 verified actions and 13 unresolved records.", meta: "Current decision", icon: FileCheck2 },
        { title: "Creator approvals", copy: "Two concepts need sign-off before production.", meta: "Approve", icon: Users },
        { title: "Scale decision", copy: "Montego Bay expansion waits on evidence review.", meta: "Friday", icon: TrendingUp },
      ],
      activations: [
        { title: "First 50", copy: "Outcome is defined before channels: create 50 attributable customer actions.", meta: "Live", icon: Megaphone },
        { title: "Find Your Flavour", copy: "Choice signal + offer + proof connected to one activation dossier.", meta: "Draft", icon: Target },
        { title: "Budget commitment", copy: "Funding and reward commitments remain visible alongside the outcome contract.", meta: "Committed", icon: CircleDollarSign },
      ],
      people: [
        { title: "Creators", copy: "Briefs, approvals and delivery state—not a follower-count directory.", meta: "4 active", icon: Users },
        { title: "Hosts", copy: "Moment owners responsible for arrivals, operation and proof close.", meta: "2 active", icon: CalendarDays },
        { title: "Places", copy: "Where customer action can actually occur and be validated.", meta: "3 places", icon: MapPin },
      ],
      evidence: [
        { title: "Observed", copy: "47 attributable customer actions exist in the activation record.", meta: "47", icon: Layers3 },
        { title: "Verified", copy: "34 have crossed the defined proof boundary.", meta: "34", icon: BadgeCheck },
        { title: "Unresolved", copy: "13 remain visible instead of being blended into success.", meta: "13", icon: AlertTriangle },
      ],
      decisions: [
        { title: "Scale", copy: "Repeat only the activation elements supported by the evidence.", meta: "Option", icon: TrendingUp },
        { title: "Change", copy: "Adjust offer, channel, creator mix or place when proof is weak.", meta: "Option", icon: WandSparkles },
        { title: "Stop", copy: "A clean stop is a valid outcome when the market does not move.", meta: "Option", icon: CheckCircle2 },
      ],
    },
    agency: {
      today: [
        { title: "Manchester Hills", copy: "Evidence pack needs final recommendation before client review.", meta: "Current move", icon: Building2 },
        { title: "Client approval blocked", copy: "Pricing copy cannot publish without client sign-off.", meta: "Blocked", icon: AlertTriangle },
        { title: "New relationship", copy: "Venue client invited Pandxtra to manage activation work.", meta: "Review", icon: Handshake },
      ],
      clients: [
        { title: "Manchester Hills Foods", copy: "Brand client · client owns the workspace and evidence; agency operates it.", meta: "Active", icon: Building2 },
        { title: "Sea Deck", copy: "Venue client · offers, Moments and place results remain attached to the venue.", meta: "Active", icon: Store },
        { title: "Client context", copy: "Switch explicitly so actions never land in the wrong account.", meta: "Required", icon: Fingerprint },
      ],
      work: [
        { title: "First 50", copy: "Managed activation · two creator approvals still waiting.", meta: "In motion", icon: FolderKanban },
        { title: "AFTRHRS", copy: "Venue activation · proof close scheduled after Thursday run.", meta: "Live", icon: Radio },
        { title: "Approval queue", copy: "Client-owned decisions remain visibly client-owned.", meta: "1 blocked", icon: ShieldCheck },
      ],
      proof: [
        { title: "Managed Result Pack", copy: "Outcome, evidence, unresolved items and recommendation in one client artifact.", meta: "Ready", icon: FileCheck2 },
        { title: "Evidence lineage", copy: "Agency presentation can change; underlying facts stay client/platform truth.", meta: "Preserved", icon: Fingerprint },
        { title: "Share with client", copy: "Package proof without rewriting who produced or verified it.", meta: "Next move", icon: ArrowRight },
      ],
      growth: [
        { title: "Expansion proposal", copy: "Use proven outcome to propose the next market, channel or activation.", meta: "Draft", icon: TrendingUp },
        { title: "Account health", copy: "Blocked approvals and weak proof matter more than vanity activity counts.", meta: "Stable", icon: BarChart3 },
        { title: "Next client move", copy: "Recommend based on evidence, not because the agency needs more activity.", meta: "Decision", icon: Target },
      ],
    },
    admin: {
      today: [
        { title: "Attendance reversal", copy: "One verified guest receipt is disputed. Original record must remain intact.", meta: "Priority case", icon: AlertTriangle },
        { title: "Payout exception", copy: "Queue item needs a real payment reference before it can be marked paid.", meta: "Action", icon: CircleDollarSign },
        { title: "Merchant KYC", copy: "Seller onboarding evidence is ready for review.", meta: "Review", icon: ShieldCheck },
      ],
      cases: [
        { title: "AC-1182", copy: "Attendance reversal · inspect source evidence, decide, append resolution.", meta: "Open", icon: Briefcase },
        { title: "PAY-044", copy: "Settlement exception · no payment proof yet.", meta: "Held", icon: CircleDollarSign },
        { title: "SUP-301", copy: "Account access issue · organization permission mismatch.", meta: "Assigned", icon: Users },
      ],
      review: [
        { title: "Proof review", copy: "Evidence decisions preserve submission history and reviewer reason.", meta: "6 waiting", icon: FileCheck2 },
        { title: "KYC", copy: "Merchant seller onboarding requires identity/business evidence review.", meta: "2 waiting", icon: ShieldCheck },
        { title: "Moderation", copy: "Content/offer cases stay separate from financial proof decisions.", meta: "1 case", icon: AlertTriangle },
      ],
      economy: [
        { title: "Payout queue", copy: "Queued is not paid. Payment state changes only after actual settlement evidence.", meta: "1 exception", icon: CircleDollarSign },
        { title: "Commerce refund", copy: "Refund appends correction lineage and preserves original purchase history.", meta: "Auditable", icon: ShoppingBag },
        { title: "Value systems", copy: "Gems, Points, Tickets and cash-equivalent obligations remain distinct.", meta: "Separated", icon: Layers3 },
      ],
      health: [
        { title: "Canonical reconciliation", copy: "Compare source records with cross-domain events before relying on projections.", meta: "System integrity", icon: Fingerprint },
        { title: "Permission health", copy: "Admin access is explicit; no universal mutation surface.", meta: "Guarded", icon: ShieldCheck },
        { title: "Audit residue", copy: "Corrections add history instead of rewriting what originally happened.", meta: "Append-only", icon: FileText },
      ],
    },
  };
  const entries = cardsByRole[role][surface] || cardsByRole[role].today;
  const Icon = surfaceConfig.icon;
  return (
    <section className="stakeholder-workspace-section">
      <div className="stakeholder-section-heading">
        <div className={`stakeholder-section-icon ${toneClass(config.tone, "soft")}`}><Icon className="h-5 w-5" /></div>
        <div>
          <p>{surfaceConfig.label}</p>
          <h2>{surfaceConfig.hint}</h2>
        </div>
      </div>
      <div className="stakeholder-work-grid">
        {entries.map((entry) => {
          const EntryIcon = entry.icon;
          return (
            <button key={entry.title} type="button" className="stakeholder-work-card">
              <div className="stakeholder-work-card__top"><EntryIcon className="h-4 w-4" /><span>{entry.meta}</span></div>
              <h3>{entry.title}</h3>
              <p>{entry.copy}</p>
              <div className="stakeholder-work-card__open">Open <ChevronRight className="h-4 w-4" /></div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function StakeholderExperience() {
  const params = useParams();
  const role = (roleOrder.includes(params.role as RoleKey) ? params.role : "creator") as RoleKey;
  const config = roles[role];
  const surfaceKeys = config.surfaces.map((item) => item.key);
  const surface = surfaceKeys.includes(params.surface || "") ? (params.surface as string) : "today";
  const navigate = useNavigate();

  return (
    <div className={`stakeholder-next stakeholder-tone-${config.tone}`}>
      <header className="stakeholder-topbar">
        <div className="stakeholder-topbar__brand">
          <PromorangMark size={32} />
          <div><span>PROMORANG</span><small>Stakeholder Next · illustrative review</small></div>
        </div>
        <RoleSwitcher activeRole={role} />
        <div className="stakeholder-topbar__context"><span>Context</span><strong>{config.context}</strong></div>
      </header>

      <div className="stakeholder-layout">
        <aside className="stakeholder-sidebar">
          <div className="stakeholder-sidebar__identity">
            <span className={`stakeholder-role-mark ${toneClass(config.tone, "solid")}`}>{config.label.slice(0, 1)}</span>
            <div><p>{config.label}</p><small>{config.eyebrow}</small></div>
          </div>
          <nav aria-label={`${config.label} Next navigation`}>
            {config.surfaces.map((item) => {
              const SurfaceIcon = item.icon;
              return (
                <NavLink key={item.key} to={`/${role}/${item.key}`} className={({ isActive }) => isActive ? "is-active" : ""}>
                  <SurfaceIcon className="h-4 w-4" />
                  <span><strong>{item.label}</strong><small>{item.hint}</small></span>
                </NavLink>
              );
            })}
          </nav>
          <div className="stakeholder-sidebar__truth">
            <Fingerprint className="h-4 w-4" />
            <p><strong>Truth boundary</strong><br />Review data is illustrative. Labels preserve the distinction between intent, proof, approval and settlement.</p>
          </div>
        </aside>

        <main className="stakeholder-main">
          <section className="stakeholder-hero">
            <div className="stakeholder-hero__copy">
              <p className="stakeholder-eyebrow">{config.eyebrow} · {surface.toUpperCase()}</p>
              <h1>{config.title}</h1>
              <p className="stakeholder-hero__promise">{config.promise}</p>
            </div>
            <button type="button" className={`stakeholder-primary-action ${toneClass(config.tone, "solid")}`}>{config.primaryAction}<ArrowRight className="h-4 w-4" /></button>
          </section>

          <section className="stakeholder-current-move">
            <div>
              <p>Current move</p>
              <h2>{config.currentMove}</h2>
              <span>{config.currentMoveDetail}</span>
            </div>
            <div className="stakeholder-current-move__status"><Clock3 className="h-4 w-4" />Needs attention now</div>
          </section>

          <section className="stakeholder-metrics" aria-label="Role snapshot">
            {config.metrics.map((item) => (
              <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong><small>{item.note}</small></div>
            ))}
          </section>

          <div className="stakeholder-content-grid">
            <div className="stakeholder-content-main">
              <SurfaceWork role={role} surface={surface} />
              <section className="stakeholder-attention">
                <div className="stakeholder-section-heading compact"><div><p>Attention</p><h2>What needs you next</h2></div></div>
                <div className="stakeholder-attention-list">
                  {config.attention.map((item) => (
                    <button key={item.title} type="button" onClick={() => navigate(`/${role}/${item.surface}`)}>
                      <div><span>{item.state}</span><strong>{item.title}</strong><p>{item.detail}</p></div><ArrowRight className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </section>
            </div>
            <aside className="stakeholder-artifact-rail">
              <p className="stakeholder-rail-label">Signature work object</p>
              <Artifact role={role} surface={surface} />
              <div className="stakeholder-rail-note">
                <Search className="h-4 w-4" />
                <div><strong>Design rule</strong><p>This object should eventually be composed from the role's existing production records, not a parallel Next-only data model.</p></div>
              </div>
            </aside>
          </div>
        </main>
      </div>

      <nav className="stakeholder-mobile-nav" aria-label={`${config.label} mobile navigation`}>
        {config.surfaces.map((item) => {
          const SurfaceIcon = item.icon;
          const active = item.key === surface;
          return <NavLink key={item.key} to={`/${role}/${item.key}`} className={active ? "is-active" : ""}><SurfaceIcon className="h-4 w-4" /><span>{item.label}</span></NavLink>;
        })}
      </nav>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/:role/:surface" element={<StakeholderExperience />} />
      <Route path="/:role" element={<Navigate to="today" replace />} />
      <Route path="/" element={<Navigate to="/creator/today" replace />} />
      <Route path="*" element={<Navigate to="/creator/today" replace />} />
    </Routes>
  );
}

const rootElement = document.getElementById("stakeholder-next-root");
if (!rootElement) throw new Error("Missing #stakeholder-next-root");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
