import React from "react";
import {
  Aperture,
  BadgeCheck,
  Compass,
  CreditCard,
  FileCheck2,
  Gem,
  Gift,
  KeyRound,
  Layers3,
  MapPin,
  Radio,
  ReceiptText,
  Sparkles,
  Store,
  Ticket,
  Trophy,
  Users,
  WandSparkles,
} from "lucide-react";
import { PromorangMark } from "@/components/promorang/PromorangMark";
import { PromorangSemanticMark, type PromorangSemanticMarkKind } from "@/components/promorang/PromorangSemanticMark";
import { CollectibleRelic, PaperReceipt, TicketPass } from "@/components/promorang/SignatureObjects";

type Role = "participant" | "host" | "merchant" | "creator" | "brand" | "agency" | "admin";
type ObjectKey = "moment" | "scene" | "discovery" | "perk" | "offer" | "promokey" | "pass" | "opportunity" | "proof" | "receipt" | "piece" | "promoshare" | "savewin" | "value";

type Lens = { job: string; action: string; evidence: string; consequence: string };
type ObjectDefinition = {
  key: ObjectKey;
  label: string;
  family: string;
  summary: string;
  owner: string;
  icon: React.ComponentType<{ className?: string }>;
  mark: PromorangSemanticMarkKind;
  lifecycle: Array<{ label: string; detail: string; mark: PromorangSemanticMarkKind }>;
  lenses: Record<Role, Lens>;
};

const roles: Array<{ key: Role; label: string }> = [
  { key: "participant", label: "Participant" },
  { key: "host", label: "Host" },
  { key: "merchant", label: "Merchant" },
  { key: "creator", label: "Creator" },
  { key: "brand", label: "Brand" },
  { key: "agency", label: "Agency" },
  { key: "admin", label: "Admin" },
];

const lens = (job: string, action: string, evidence: string, consequence: string): Lens => ({ job, action, evidence, consequence });

const objects: ObjectDefinition[] = [
  {
    key: "moment", label: "Moment", family: "Experience", icon: Aperture, mark: "move",
    summary: "A bounded thing happening in the world that people can anticipate, access, attend, prove and remember.", owner: "Host / commissioning operator",
    lifecycle: [
      { label: "FORMING", detail: "Demand, place and intent are gathering.", mark: "explore" },
      { label: "OPEN", detail: "The Moment can be discovered and accessed.", mark: "move" },
      { label: "LIVE", detail: "Arrivals and actions are being written.", mark: "proof" },
      { label: "CLOSED", detail: "Exceptions and evidence are reconciled.", mark: "return" },
      { label: "KEPT", detail: "Attendance, proof and cultural residue remain.", mark: "kept" },
    ],
    lenses: {
      participant: lens("Decide whether this is worth moving toward.", "Discover → RSVP/access → arrive → keep proof.", "Pass, arrival, participation receipt.", "The Moment becomes part of personal trail and future recommendations."),
      host: lens("Turn intent into an operated experience.", "Plan → publish → door → live → proof close.", "Run sheet, arrival ledger, exception trail.", "Host learns what filled, who came and what should return."),
      merchant: lens("Attach commercial value to an experience.", "Attach offer → validate → fulfill → retain place history.", "Validation and transaction remain distinct.", "Moment can create visits, orders and repeat behavior."),
      creator: lens("Create useful distribution around something real.", "Accept brief → create → publish → attribute → prove.", "Published asset + attributable action evidence.", "Work becomes proof, value and portfolio residue."),
      brand: lens("Commission customer movement through a real experience.", "Fund/activate → coordinate network → inspect evidence.", "Creator, host and merchant evidence stay source-distinct.", "Evidence informs stop/change/scale decision."),
      agency: lens("Operate the Moment for a client without owning the client's decision.", "Prepare → coordinate → collect proof → package result.", "Managed result pack with client ownership boundary.", "Client receives evidence and next-action recommendation."),
      admin: lens("Resolve disputed state without erasing history.", "Inspect source records → review → correct append-only.", "Original Moment, attendance and correction chain.", "System remains explainable after intervention."),
    },
  },
  {
    key: "scene", label: "Scene", family: "Belonging", icon: Users, mark: "explore",
    summary: "A durable cultural or interest territory that organizes people, Moments, demand, places and kept history.", owner: "PROMORANG / community stewards",
    lifecycle: [
      { label: "SIGNAL", detail: "People repeatedly express related interest.", mark: "explore" },
      { label: "FORMING", detail: "A recognizable room starts to exist.", mark: "move" },
      { label: "ACTIVE", detail: "Moments, people, places and offers accumulate.", mark: "proof" },
      { label: "RETURNING", detail: "Participation repeats over time.", mark: "return" },
      { label: "CULTURAL RECORD", detail: "Pieces and history remain attached.", mark: "kept" },
    ],
    lenses: {
      participant: lens("Find a room that feels like yours.", "Follow → signal demand → attend → collect history.", "Scene participation and kept Pieces.", "Belonging becomes discoverable identity rather than a profile badge."),
      host: lens("Know where a Moment belongs and what demand exists.", "Publish into Scene → read demand → invite relevant people.", "Moment performance within Scene.", "Host can build returning rooms, not isolated events."),
      merchant: lens("Connect a place or offer to an active cultural territory.", "Attach place/offer → observe verified use.", "Scene-tagged validations and visits.", "Merchant learns which communities actually return."),
      creator: lens("Understand cultural context before creating.", "Join Scene → find briefs → distribute to relevant people.", "Scene-linked content and attributed movement.", "Creator builds contextual credibility."),
      brand: lens("Understand a market as a living territory, not a demographic segment.", "Observe Scene → activate respectfully → inspect evidence.", "Demand, participation and verified actions.", "Brand learns whether it belongs and how to show up."),
      agency: lens("Plan client work inside a real context.", "Map client objective to Scene → coordinate stakeholders.", "Managed evidence by Scene.", "Agency can recommend where the client should or should not enter."),
      admin: lens("Maintain integrity of community classification and safety.", "Moderate → merge/split only with evidence.", "Scene history and moderation records.", "Cultural history remains coherent."),
    },
  },
  {
    key: "discovery", label: "Discovery", family: "Demand", icon: Compass, mark: "explore",
    summary: "A signal that something may be worth forming, supplying, activating or moving toward.", owner: "Market / participants",
    lifecycle: [
      { label: "SIGNAL", detail: "One person expresses interest.", mark: "explore" },
      { label: "DEMAND", detail: "More people align around it.", mark: "move" },
      { label: "THRESHOLD", detail: "Enough signal exists to act.", mark: "proof" },
      { label: "ACTIVATED", detail: "A Moment, offer or opportunity is created.", mark: "return" },
      { label: "ARCHIVED", detail: "The signal remains as market memory.", mark: "kept" },
    ],
    lenses: Object.fromEntries(roles.map(({ key }) => [key, lens(
      key === "participant" ? "Help shape what exists next." : "Read demand before committing resources.",
      key === "participant" ? "Vote/signal → watch it form → act when activated." : "Inspect signal → decide whether to supply or activate.",
      "Demand count, location, timing and eventual activation link.",
      "Discovery either becomes something real or remains a transparent unmet signal.",
    )])) as Record<Role, Lens>,
  },
  {
    key: "perk", label: "Perk", family: "Benefit", icon: Gift, mark: "return",
    summary: "The benefit itself: what a person gets, not the campaign, access token or proof of use.", owner: "Merchant / Brand / Host",
    lifecycle: [
      { label: "DEFINED", detail: "Benefit and eligibility are explicit.", mark: "move" },
      { label: "AVAILABLE", detail: "It can be unlocked or issued.", mark: "explore" },
      { label: "UNLOCKED", detail: "Participant has entitlement.", mark: "proof" },
      { label: "USED", detail: "Benefit is consumed or applied.", mark: "return" },
      { label: "REMEMBERED", detail: "Use remains in proof/place history.", mark: "kept" },
    ],
    lenses: Object.fromEntries(roles.map(({ key }) => [key, lens(
      key === "participant" ? "Understand what you actually receive." : "Define or support a benefit without confusing it with payment.",
      key === "merchant" ? "Define → attach to offer → fulfill when valid." : key === "participant" ? "Unlock → present → use." : "Attach/support → observe verified use.",
      "Entitlement, validation and fulfillment evidence.",
      "A Perk can return as repeat behavior, proof or future eligibility.",
    )])) as Record<Role, Lens>,
  },
  {
    key: "offer", label: "Offer", family: "Commerce", icon: Store, mark: "move",
    summary: "The commercial configuration around a benefit: rules, inventory, validity, place, price/requirement and fulfillment conditions.", owner: "Merchant / Brand",
    lifecycle: [
      { label: "DRAFT", detail: "Commercial rules are being configured.", mark: "explore" },
      { label: "PUBLISHED", detail: "Eligible people can act on it.", mark: "move" },
      { label: "CLAIMED", detail: "Intent exists; no use is implied.", mark: "proof" },
      { label: "VALIDATED", detail: "Use is verified; purchase still separate.", mark: "return" },
      { label: "CLOSED", detail: "Inventory/history remain auditable.", mark: "kept" },
    ],
    lenses: Object.fromEntries(roles.map(({ key }) => [key, lens(
      key === "merchant" ? "Operate a commercial instrument." : "Understand or support the rules surrounding a benefit.",
      key === "merchant" ? "Publish → pause/edit → validate → fulfill separately." : key === "participant" ? "Read rules → claim/unlock → present." : "Attach/distribute/measure within role boundary.",
      "Offer state, allocation, claims, validations, orders and refunds remain separate.",
      "Offer history becomes place and customer-return intelligence.",
    )])) as Record<Role, Lens>,
  },
  {
    key: "promokey", label: "PromoKey", family: "Access", icon: KeyRound, mark: "move",
    summary: "A specific entitlement object that unlocks or carries access to a Perk, Moment, gated opportunity or funded drop.", owner: "Issuer → holder",
    lifecycle: [
      { label: "LOCKED", detail: "Requirements are not yet satisfied.", mark: "explore" },
      { label: "UNLOCKED", detail: "Holder has earned or received entitlement.", mark: "move" },
      { label: "ACTIVE", detail: "Can be presented within validity window.", mark: "proof" },
      { label: "USED", detail: "Use has been validated.", mark: "return" },
      { label: "KEPT PROOF", detail: "The key's history remains visible.", mark: "kept" },
    ],
    lenses: Object.fromEntries(roles.map(({ key }) => [key, lens(
      key === "participant" ? "Know what this Key opens and when." : "Issue, distribute or verify entitlement without confusing it with payment.",
      key === "merchant" ? "Issue/stock → validate → fulfill separately." : key === "participant" ? "Unlock → present → use → keep proof." : "Fund/attach/distribute/audit according to role.",
      "Serial, issuer, holder, validity, requirements and validation receipt.",
      "A used Key leaves proof and can influence future access/return.",
    )])) as Record<Role, Lens>,
  },
  {
    key: "pass", label: "Pass / Ticket", family: "Attendance", icon: Ticket, mark: "move",
    summary: "A serialized right or reservation to cross an access boundary; intent is not attendance.", owner: "Moment / issuer → holder",
    lifecycle: [
      { label: "ISSUED", detail: "Access right exists.", mark: "move" },
      { label: "HELD", detail: "Participant possesses the pass.", mark: "explore" },
      { label: "PRESENTED", detail: "Door attempts validation.", mark: "proof" },
      { label: "CHECKED IN", detail: "Arrival is written when valid.", mark: "return" },
      { label: "ARCHIVED", detail: "Attendance or exception remains.", mark: "kept" },
    ],
    lenses: Object.fromEntries(roles.map(({ key }) => [key, lens(
      key === "host" ? "Operate the access boundary." : key === "participant" ? "Carry access into a Moment." : "Understand or audit the access record.",
      key === "host" ? "Issue → scan → check in / exception." : key === "participant" ? "Hold → present → arrive." : "Attach/distribute/review according to role.",
      "Pass serial, Moment, scan result and attendance record.",
      "Valid access can become verified attendance; mismatch remains an exception, not attendance.",
    )])) as Record<Role, Lens>,
  },
  {
    key: "opportunity", label: "Opportunity / Mission", family: "Work", icon: WandSparkles, mark: "explore",
    summary: "A bounded ask for useful action with explicit outcome, deliverable, proof requirement and value terms.", owner: "Commissioner / operator",
    lifecycle: [
      { label: "OPEN", detail: "Worthwhile work is available.", mark: "explore" },
      { label: "ACCEPTED", detail: "A creator/operator commits.", mark: "move" },
      { label: "SUBMITTED", detail: "Deliverable exists; approval not implied.", mark: "proof" },
      { label: "APPROVED", detail: "Work crosses review boundary.", mark: "return" },
      { label: "SETTLED / KEPT", detail: "Value and reputation become durable residue.", mark: "kept" },
    ],
    lenses: Object.fromEntries(roles.map(({ key }) => [key, lens(
      key === "creator" ? "Find work worth doing and know what success means." : "Commission, support or review useful work.",
      key === "creator" ? "Accept → create → submit → revise → prove." : "Define/approve/fund/audit according to role.",
      "Brief, deliverable, review state, attribution and settlement ledger.",
      "Useful work becomes proof, value and reputation only after real boundaries are crossed.",
    )])) as Record<Role, Lens>,
  },
  {
    key: "proof", label: "Proof", family: "Trust", icon: BadgeCheck, mark: "proof",
    summary: "Evidence that an action crossed a defined verification boundary; proof is contextual, not a generic badge.", owner: "Source system / reviewer",
    lifecycle: [
      { label: "OBSERVED", detail: "Something appears to have happened.", mark: "explore" },
      { label: "ATTRIBUTED", detail: "It is linked to an object/activation/person.", mark: "move" },
      { label: "VERIFIED", detail: "Required evidence passes review/rules.", mark: "proof" },
      { label: "CONSEQUENCE", detail: "Decision/value can now occur.", mark: "return" },
      { label: "AUDITABLE", detail: "Source and decision remain inspectable.", mark: "kept" },
    ],
    lenses: Object.fromEntries(roles.map(({ key }) => [key, lens(
      key === "participant" ? "Understand what was actually verified." : "Use evidence to make the role's next legitimate decision.",
      "Inspect source → verify/reject/revise → preserve result.",
      "Source, time, object, reviewer/rule and consequence.",
      "Proof unlocks only the consequences it actually supports.",
    )])) as Record<Role, Lens>,
  },
  {
    key: "receipt", label: "Receipt", family: "Residue", icon: ReceiptText, mark: "kept",
    summary: "A durable human-readable record of a confirmed action, state change or consequence.", owner: "System / issuing operator",
    lifecycle: [
      { label: "WRITE", detail: "A confirmed event occurs.", mark: "move" },
      { label: "IDENTIFY", detail: "Who/what/where/when are captured.", mark: "proof" },
      { label: "CONSEQUENCE", detail: "The write may create value, access or decision residue.", mark: "return" },
      { label: "RETAIN", detail: "Record stays readable after the moment passes.", mark: "kept" },
    ],
    lenses: Object.fromEntries(roles.map(({ key }) => [key, lens(
      "See exactly what the system says happened.",
      "Open receipt → inspect source and consequence.",
      "Identity, timestamp, issuer, state, amount/access/proof where relevant.",
      "Receipt becomes the shared trust object across roles.",
    )])) as Record<Role, Lens>,
  },
  {
    key: "piece", label: "Piece", family: "Provenance", icon: Layers3, mark: "kept",
    summary: "A kept cultural/provenance object created by meaningful verified participation, with history that survives transfer.", owner: "Current holder; provenance is immutable",
    lifecycle: [
      { label: "EARNED", detail: "A qualifying event creates the Piece.", mark: "move" },
      { label: "KEPT", detail: "Holder retains it with provenance.", mark: "kept" },
      { label: "LISTED", detail: "Holder may offer transfer.", mark: "explore" },
      { label: "TRANSFERRED", detail: "Ownership changes, history does not.", mark: "return" },
      { label: "PROVENANCE", detail: "Origin remains inspectable forever.", mark: "proof" },
    ],
    lenses: Object.fromEntries(roles.map(({ key }) => [key, lens(
      key === "participant" ? "Keep a meaningful artifact of participation." : "Understand what event/utility/provenance created the object.",
      key === "participant" ? "Earn → keep → optionally list/transfer." : "Issue/attach utility/audit according to role.",
      "Origin event, holder chain, utility and transfer history.",
      "The Piece becomes cultural memory without implying investment return.",
    )])) as Record<Role, Lens>,
  },
  {
    key: "promoshare", label: "PromoShare", family: "Draw", icon: Gift, mark: "return",
    summary: "A named promotional draw with serialized tickets, committed prize terms, visible close/draw/result states and auditable fulfillment.", owner: "Sponsor / operator",
    lifecycle: [
      { label: "OPEN", detail: "Tickets can be earned/issued.", mark: "explore" },
      { label: "CLOSING", detail: "Entry window is ending.", mark: "move" },
      { label: "DRAWING", detail: "Result process is locked/auditable.", mark: "proof" },
      { label: "RESULT", detail: "Winner/result is recorded.", mark: "return" },
      { label: "FULFILLED", detail: "Prize outcome remains visible.", mark: "kept" },
    ],
    lenses: Object.fromEntries(roles.map(({ key }) => [key, lens(
      key === "participant" ? "Know what draw your tickets belong to and what happened." : "Fund, distribute, fulfill or audit a named draw.",
      key === "participant" ? "Earn ticket → see serial → await result → keep history." : "Configure/support/fulfill/audit according to role.",
      "Ticket serial/source, draw state, prize commitment, result and fulfillment.",
      "Promotional participation remains auditable instead of disappearing after the draw.",
    )])) as Record<Role, Lens>,
  },
  {
    key: "savewin", label: "Save & Win", family: "Value", icon: Trophy, mark: "return",
    summary: "A protected-value mechanic where parked Gems remain the participant's principal while promotional prize eligibility is tracked separately.", owner: "Participant principal + sponsor prize pool",
    lifecycle: [
      { label: "CHOOSE", detail: "Participant selects amount/window.", mark: "explore" },
      { label: "PARKED", detail: "Principal is reserved, not spent.", mark: "move" },
      { label: "DRAW", detail: "Promotional eligibility is resolved.", mark: "proof" },
      { label: "RETURNED", detail: "Principal returns/remains available.", mark: "return" },
      { label: "HISTORY", detail: "Tickets/results stay visible.", mark: "kept" },
    ],
    lenses: Object.fromEntries(roles.map(({ key }) => [key, lens(
      key === "participant" ? "Park value without confusing it with spending or investment." : "Understand/fund/audit the promotional layer without touching participant principal.",
      key === "participant" ? "Choose → park → draw → principal remains/returns." : "Fund prize/support/audit according to role.",
      "Principal ledger separate from promotional prize pool and tickets.",
      "The mechanic can create retention without misrepresenting principal or yield.",
    )])) as Record<Role, Lens>,
  },
  {
    key: "value", label: "Gems / Points", family: "Economy", icon: Gem, mark: "return",
    summary: "Distinct value species: Gems are spendable platform value; Points record participation/progression; Tickets belong to specific draws.", owner: "Account / ledger",
    lifecycle: [
      { label: "EARN / BUY", detail: "Value enters through explicit source.", mark: "move" },
      { label: "HELD", detail: "Balance remains attributable.", mark: "kept" },
      { label: "SPENT / CONVERTED", detail: "A defined action transforms value.", mark: "proof" },
      { label: "RETURN", detail: "Use may unlock access, reward or history.", mark: "return" },
    ],
    lenses: Object.fromEntries(roles.map(({ key }) => [key, lens(
      key === "participant" ? "Know what each balance can and cannot do." : "Issue, fund, settle or audit the correct value species.",
      "Inspect ledger → perform allowed action → see resulting object/receipt.",
      "Source, amount, species, conversion/use and resulting object.",
      "Economy remains understandable because species do not collapse into one balance.",
    )])) as Record<Role, Lens>,
  },
];

function ObjectSpecimen({ object }: { object: ObjectDefinition }) {
  if (object.key === "moment") return <article className="cos-moment"><div className="cos-photo"><span>AFTRHRS · SEA DECK</span></div><div className="cos-paper"><p>MOMENT · M-0918</p><h3>AFTRHRS</h3><strong>Tonight · doors 9 PM</strong><div className="cos-mini-path"><span>FORMING</span><span>OPEN</span><span>LIVE</span><span>KEPT</span></div></div></article>;
  if (object.key === "promokey" || object.key === "offer" || object.key === "perk") return <article className="cos-key"><div><p>{object.key === "offer" ? "OFFER · OF-2031" : object.key === "perk" ? "PERK" : "PROMOKEY · PK-2031"}</p><h3>AFTRHRS Wing Key</h3><strong>Complimentary wings · Sea Deck</strong></div><div className="cos-key-notch"/><footer><span>Tonight 9 PM–1 AM</span><b>23 remaining</b></footer></article>;
  if (object.key === "pass") return <TicketPass kicker="AFTRHRS · TONIGHT" title="ENTRY PASS" detail="Sea Deck · present at door. RSVP intent is not attendance." stub="M0918-084" stubLabel="PASS"/>;
  if (object.key === "receipt" || object.key === "proof") return <PaperReceipt heading={object.key === "proof" ? "PROOF VERIFIED" : "RETURN RECORDED"} lines={[{label:"Object",value:"AFTRHRS Wing Key",strong:true},{label:"Place",value:"Sea Deck"},{label:"State",value:object.key === "proof" ? "Verified" : "Validated"},{label:"Time",value:"10:42 PM"}]} footer="A durable record of what crossed the boundary."/>;
  if (object.key === "piece") return <CollectibleRelic serial="0042" title="Food & Taste Opening Run" origin="Created from verified movement through Kingston." perk="Provenance stays even if ownership changes." scene="Food & Taste" place="Liguanea" verifiedDate="Sep 16"/>;
  if (object.key === "promoshare") return <article className="cos-draw"><Gift/><p>PROMOSHARE · DRAW 021</p><h3>Kingston Food Drop</h3><div><strong>6</strong><span>your tickets</span></div><footer>Closes tonight · named prize · auditable result</footer></article>;
  if (object.key === "savewin") return <article className="cos-vault"><Trophy/><p>SAVE & WIN</p><h3>Weekend 100 Gem Pot</h3><strong>25 Gems parked</strong><small>Principal and promotional prize pool stay separate.</small></article>;
  if (object.key === "value") return <article className="cos-value"><div><Gem/><strong>74</strong><span>Gems</span></div><div><Sparkles/><strong>1,840</strong><span>Points</span></div><div><Ticket/><strong>11</strong><span>Tickets</span></div></article>;
  if (object.key === "scene") return <article className="cos-scene"><span>SCENE</span><h3>Kingston After Dark</h3><p>Moments · people · places · demand · kept history</p><div className="cos-scene-orbit"><i/><i/><i/><i/></div></article>;
  if (object.key === "discovery") return <article className="cos-discovery"><Radio/><p>DISCOVERY SIGNAL</p><h3>What should Kingston get next?</h3><strong>812 signals · live music session leads</strong><div className="cos-progress"><span/></div></article>;
  if (object.key === "opportunity") return <article className="cos-brief"><p>CREATOR BRIEF · CB-0421</p><h3>One reel that moves people to the Moment.</h3><div><span>Deliverable</span><b>Vertical reel · 15–30 sec</b></div><div><span>Proof</span><b>Published URL + attributable action evidence</b></div><footer>SUBMITTED ≠ APPROVED ≠ SETTLED</footer></article>;
  return <article className="cos-object-generic"><PromorangSemanticMark kind={object.mark} size={48}/><p>{object.family}</p><h3>{object.label}</h3><span>{object.summary}</span></article>;
}

function Lifecycle({ object }: { object: ObjectDefinition }) {
  return <div className="cos-lifecycle">{object.lifecycle.map((step, index) => <div className="cos-life-step" key={step.label}><div><PromorangSemanticMark kind={step.mark} size={28}/><span>{String(index + 1).padStart(2,"0")}</span></div><b>{step.label}</b><p>{step.detail}</p></div>)}</div>;
}

export default function CanonicalObjectSystemV1() {
  const [activeKey, setActiveKey] = React.useState<ObjectKey>("moment");
  const [role, setRole] = React.useState<Role>("participant");
  const object = objects.find((item) => item.key === activeKey) ?? objects[0];
  const activeLens = object.lenses[role];
  const Icon = object.icon;

  return <div className="cos-root">
    <header className="cos-topbar"><div className="cos-brand"><PromorangMark size={34}/><div><b>PROMORANG</b><span>Canonical Object System · review</span></div></div><div className="cos-thesis">ONE OBJECT · MANY LENSES</div><span className="cos-review">ILLUSTRATIVE REVIEW DATA</span></header>

    <div className="cos-shell">
      <aside className="cos-object-nav"><p>OBJECT ATLAS</p>{objects.map((item) => { const ItemIcon=item.icon; return <button key={item.key} className={activeKey===item.key?"active":""} onClick={()=>setActiveKey(item.key)}><ItemIcon className="h-4 w-4"/><span>{item.label}</span><small>{item.family}</small></button>; })}</aside>

      <main className="cos-main">
        <section className="cos-hero"><div><p>{object.family.toUpperCase()} · CANONICAL OBJECT</p><h1>{object.label}</h1><span>{object.summary}</span></div><div className="cos-object-owner"><Icon/><span>Canonical owner</span><strong>{object.owner}</strong></div></section>

        <section className="cos-specimen-grid"><div className="cos-specimen"><div className="cos-section-label">SIGNATURE FORM</div><ObjectSpecimen object={object}/></div><div className="cos-definition"><div className="cos-section-label">WHAT MUST STAY TRUE</div><h2>The object survives every stakeholder view.</h2><p>Role changes can alter controls, language and evidence emphasis. They must not silently change the object's identity, lifecycle truth or historical record.</p><div className="cos-mark-row"><PromorangSemanticMark kind="move" size={26}/><span>Move</span><PromorangSemanticMark kind="explore" size={26}/><span>Explore</span><PromorangSemanticMark kind="proof" size={26}/><span>Proof</span><PromorangSemanticMark kind="return" size={26}/><span>Return</span><PromorangSemanticMark kind="kept" size={26}/><span>Kept</span></div></div></section>

        <section className="cos-section"><div className="cos-section-head"><div><p>OBJECT LIFECYCLE</p><h2>What this object can become.</h2></div></div><Lifecycle object={object}/></section>

        <section className="cos-section"><div className="cos-section-head"><div><p>ROLE LENS</p><h2>Same object. Different job.</h2></div><div className="cos-role-tabs">{roles.map((item)=><button key={item.key} className={role===item.key?"active":""} onClick={()=>setRole(item.key)}>{item.label}</button>)}</div></div><article className={`cos-role-card cos-role-${role}`}><div className="cos-role-title"><span>{role.toUpperCase()}</span><h3>{activeLens.job}</h3></div><div className="cos-role-fields"><div><span>ACTION</span><strong>{activeLens.action}</strong></div><div><span>EVIDENCE</span><strong>{activeLens.evidence}</strong></div><div><span>CONSEQUENCE</span><strong>{activeLens.consequence}</strong></div></div></article></section>

        <section className="cos-cross-role"><div><p>CROSS-ROLE CONTRACT</p><h2>No stakeholder gets a private version of truth.</h2></div><div className="cos-cross-grid">{roles.map((item)=>{ const l=object.lenses[item.key]; return <article key={item.key}><span>{item.label}</span><strong>{l.job}</strong><small>{l.evidence}</small></article>; })}</div></section>
      </main>
    </div>
  </div>;
}
