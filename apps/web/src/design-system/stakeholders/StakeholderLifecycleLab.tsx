import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Banknote,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  FolderKanban,
  HandCoins,
  IdCard,
  MapPin,
  Megaphone,
  PackageCheck,
  QrCode,
  ReceiptText,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Stamp,
  Store,
  TicketCheck,
  UserRoundCheck,
  Users2,
  Video,
} from "lucide-react";

type Role = "Creator" | "Host" | "Merchant" | "Brand" | "Agency" | "Admin";

type RoleConfig = {
  color: string;
  tint: string;
  material: string;
  states: string[];
  job: string;
  outcome: string;
  proof: string;
  decision: string;
};

const roleOrder: Role[] = ["Creator", "Host", "Merchant", "Brand", "Agency", "Admin"];

const cfg: Record<Role, RoleConfig> = {
  Creator: {
    color: "#b58cff",
    tint: "#16101d",
    material: "Production brief + submission folder",
    states: ["Opportunity", "Brief", "Accepted", "Creating", "Submitted", "Approved", "Settled"],
    job: "Choose worthwhile work, create it, prove it, get approved and build reputation.",
    outcome: "Useful distribution that creates attributable action.",
    proof: "Approved deliverable + attributable action evidence.",
    decision: "Settle, improve reputation and unlock stronger work.",
  },
  Host: {
    color: "#f6c453",
    tint: "#171307",
    material: "Run sheet + arrival ledger",
    states: ["Plan", "Publish", "Invite", "Doors", "Live", "Proof Close", "Return"],
    job: "Fill it, run it and prove who came.",
    outcome: "Verified attendance and useful participation.",
    proof: "Verified arrivals, participation records and proof close.",
    decision: "Build the return audience, repeat or improve the Moment.",
  },
  Merchant: {
    color: "#ff6a00",
    tint: "#170d08",
    material: "Offer stock + validation terminal",
    states: ["Inventory", "Published", "Claimed", "Presented", "Validated", "Transaction", "Repeat"],
    job: "Turn attention into visits, redemptions, purchases and returns.",
    outcome: "Verified customer action at a real place.",
    proof: "Visit, redemption or transaction evidence at the correct strength.",
    decision: "Replenish, change, repeat or retarget.",
  },
  Brand: {
    color: "#4cc6f0",
    tint: "#071319",
    material: "Activation dossier + evidence binder",
    states: ["Outcome", "Ready", "Funded", "Live", "Evidence", "Decision", "Scale"],
    job: "Create measurable customer movement and know what actually happened.",
    outcome: "Attributable trial, visit, purchase, review, referral or repeat.",
    proof: "Evidence pack with source, strength and attribution confidence.",
    decision: "Repeat, change, stop or scale.",
  },
  Agency: {
    color: "#d6c0ff",
    tint: "#15101c",
    material: "Client folio + managed result pack",
    states: ["Portfolio", "Selected", "Preparing", "Approval", "Live", "Proof", "Expansion"],
    job: "Produce an undeniable client result without losing client attribution.",
    outcome: "Measured movement tied to the correct client workspace.",
    proof: "Client-attributed evidence plus managed result pack.",
    decision: "Package the result and expand the account.",
  },
  Admin: {
    color: "#22c55e",
    tint: "#07120b",
    material: "Exception case + chain-of-custody record",
    states: ["Queue", "Case", "Evidence", "Decision", "Resolution", "Audit", "Closed"],
    job: "Resolve the highest-priority exception with evidence and an audit trail.",
    outcome: "Healthy, trustworthy platform operation.",
    proof: "Resolution record, evidence trail and immutable audit event.",
    decision: "Restore operation, escalate or change controls.",
  },
};

function SmallLabel({ children, color = "#ff6a00" }: { children: React.ReactNode; color?: string }) {
  return <p className="text-[9px] font-black uppercase tracking-[.18em]" style={{ color }}>{children}</p>;
}

function StateRail({ role, index, setIndex }: { role: Role; index: number; setIndex: (i: number) => void }) {
  const c = cfg[role];
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max items-center gap-1">
        {c.states.map((s, i) => (
          <button
            type="button"
            key={s}
            onClick={() => setIndex(i)}
            className="group flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-bold transition"
            style={{
              borderColor: i === index ? `${c.color}88` : "rgba(255,255,255,.10)",
              background: i === index ? `${c.color}12` : "transparent",
              color: i === index ? c.color : "rgba(255,255,255,.42)",
            }}
          >
            <span className="grid h-5 w-5 place-items-center rounded-full border border-current text-[8px]">{String(i + 1).padStart(2, "0")}</span>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function LifecycleContract({ role }: { role: Role }) {
  const c = cfg[role];
  return (
    <div className="grid gap-3 border-y border-white/10 py-5 sm:grid-cols-4">
      {[["JOB", c.job], ["OUTCOME", c.outcome], ["PROOF", c.proof], ["DECISION", c.decision]].map(([k, v]) => (
        <div key={k} className="border-white/10 px-4 sm:border-r sm:last:border-r-0">
          <SmallLabel color={c.color}>{k}</SmallLabel>
          <p className="mt-2 text-xs leading-5 text-white/55">{v}</p>
        </div>
      ))}
    </div>
  );
}

function EvidenceReceipt({ title, rows, stampText, color }: { title: string; rows: [string, string][]; stampText: string; color: string }) {
  return (
    <article className="relative overflow-hidden bg-[#eadcc6] p-6 text-[#16120e] shadow-[0_28px_80px_rgba(0,0,0,.28)]" style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent 0 24px,rgba(25,18,9,.045) 25px)" }}>
      <div className="absolute inset-x-0 top-0 h-3" style={{ backgroundImage: "radial-gradient(circle at 6px 0,#0b0b0c 0 4px,transparent 4.5px)", backgroundSize: "12px 12px" }} />
      <div className="absolute inset-x-0 bottom-0 h-3 rotate-180" style={{ backgroundImage: "radial-gradient(circle at 6px 0,#0b0b0c 0 4px,transparent 4.5px)", backgroundSize: "12px 12px" }} />
      <p className="text-center text-[9px] font-black uppercase tracking-[.24em] text-black/45">PROMORANG · PROOF</p>
      <h4 className="mt-3 text-center font-serif text-2xl font-bold">{title}</h4>
      <div className="mt-5 border-y border-black/15 py-2">
        {rows.map(([a, b]) => <div key={a} className="flex justify-between gap-5 border-b border-dotted border-black/10 py-2 text-xs last:border-0"><span className="text-black/45">{a}</span><b className="text-right">{b}</b></div>)}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3"><span className="text-[9px] uppercase tracking-[.18em] text-black/40">Record retained</span><span className="rotate-[-3deg] border-2 px-3 py-2 text-[10px] font-black uppercase tracking-[.15em]" style={{ borderColor: color, color }}>{stampText}</span></div>
    </article>
  );
}

function CreatorLifecycle({ index }: { index: number }) {
  const states = cfg.Creator.states;
  const submitted = index >= 4;
  const approved = index >= 5;
  const settled = index >= 6;
  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
      <div className="overflow-hidden rounded-[1.5rem] border border-[#b58cff]/30 bg-[#17111f] shadow-[0_28px_90px_rgba(181,140,255,.08)]">
        <div className="relative border-b border-[#b58cff]/20 p-6">
          <div className="absolute right-5 top-5 rotate-3 border border-[#b58cff]/35 px-3 py-2 text-[10px] font-black uppercase tracking-[.18em] text-[#b58cff]">{states[index]}</div>
          <SmallLabel color="#b58cff">Creator brief · CB-0421 · Flash Motors</SmallLabel>
          <h3 className="mt-4 max-w-2xl font-serif text-4xl font-bold leading-[.95]">Drive verified test-drive interest.</h3>
          <p className="mt-3 text-sm text-white/42">Move Jamaica · due Friday 4 PM · accepted by Andre</p>
        </div>
        <div className="p-6">
          <div className="grid gap-3 sm:grid-cols-2">{[["DELIVERABLE", "1 vertical video + tracked booking link"], ["AUDIENCE", "Kingston auto / lifestyle"], ["PROOF CONTRACT", "Approved post + attributable booking"], ["SETTLEMENT", "40 Gems after approval"]].map(([a, b]) => <div key={a} className="border border-white/10 p-4"><SmallLabel color="#ff9a4d">{a}</SmallLabel><p className="mt-2 text-sm font-bold">{b}</p></div>)}</div>
          <div className="mt-6 border-t border-dashed border-[#b58cff]/25 pt-5">
            <SmallLabel color="#b58cff">Production residue</SmallLabel>
            <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3"><p>Draft v3 uploaded</p><p>{submitted ? "Proof package attached" : "Proof not submitted"}</p><p>{approved ? "Approval stamp present" : "Approval pending"}</p></div>
          </div>
        </div>
      </div>
      <div className="grid gap-4">
        <div className="rounded-[1.5rem] border border-white/10 bg-[#0d0d0f] p-6"><div className="flex items-center gap-2 text-[#b58cff]"><Video className="h-5 w-5"/><SmallLabel color="#b58cff">Submission folder · PS-0421</SmallLabel></div><div className="mt-5 space-y-3">{[["Asset", submitted ? "VID-0421-FINAL.mp4" : "Draft only"], ["Tracked action", submitted ? "3 bookings attributed" : "0 submitted"], ["Review", approved ? "Approved · 2:18 PM" : submitted ? "Awaiting review" : "Not started"], ["Settlement", settled ? "40 Gems released · ST-2291" : approved ? "Ready to settle" : "Held"]].map(([a,b]) => <div key={a} className="flex justify-between border-b border-white/8 pb-3 text-sm"><span className="text-white/35">{a}</span><b>{b}</b></div>)}</div></div>
        {approved && <EvidenceReceipt title="CREATOR WORK VERIFIED" color="#8d5fd3" stampText={settled ? "SETTLED" : "APPROVED"} rows={[["Brief", "CB-0421"], ["Creator", "Andre"], ["Deliverable", "Approved"], ["Bookings", "3 attributable"], ["Reward", settled ? "40 Gems paid" : "40 Gems due"]]} />}
      </div>
    </div>
  );
}

function HostLifecycle({ index }: { index: number }) {
  const proofClosed = index >= 5;
  const returning = index >= 6;
  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_.92fr]">
      <div className="rounded-[1.5rem] border border-[#f6c453]/25 bg-[#151106] p-6 shadow-[0_28px_90px_rgba(246,196,83,.06)]">
        <div className="flex items-start justify-between"><div><SmallLabel color="#f6c453">Run sheet · Moment M-0918</SmallLabel><h3 className="mt-3 font-serif text-4xl font-bold">AFTRHRS · Sea Deck</h3><p className="mt-2 text-sm text-white/40">Host desk copy · Wednesday · 10 PM</p></div><ClipboardCheck className="text-[#f6c453]"/></div>
        <div className="mt-7 space-y-2">{[["8:00 PM", "Venue prep", index >= 1 ? "complete" : "pending"], ["9:30 PM", "RSVP arrival window", index >= 3 ? "open" : "scheduled"], ["10:00 PM", "Moment live", index >= 4 ? "live" : "scheduled"], ["11:30 PM", "RSVP cutoff", index >= 4 ? "monitor" : "scheduled"], ["1:30 AM", "Proof close", proofClosed ? "closed" : "pending"]].map(([t,a,s]) => <div key={t} className="grid grid-cols-[85px_1fr_auto] gap-4 border-b border-white/8 py-3 text-sm"><b>{t}</b><span>{a}</span><span className="text-[#f6c453]">{s}</span></div>)}</div>
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 p-4"><TicketCheck className="text-[#22c55e]"/><div><p className="font-bold">Attendance truth</p><p className="text-xs text-white/42">RSVP expresses intent. Door verification creates attendance proof.</p></div></div>
      </div>
      <div className="grid gap-4">
        <div className="rounded-[1.5rem] border border-[#22c55e]/20 bg-[#07120b] p-6"><div className="flex items-center gap-2"><ScanLine className="text-[#22c55e]"/><SmallLabel color="#22c55e">Arrival ledger · AL-0918</SmallLabel></div><div className="mt-5 grid grid-cols-3 gap-3">{[["RSVP", "42"], ["VERIFIED", index >= 4 ? "28" : "0"], ["WALK-IN", index >= 4 ? "7" : "0"]].map(([a,b]) => <div key={a} className="border border-white/10 p-4"><p className="text-[9px] text-white/30">{a}</p><p className="mt-2 text-2xl font-bold">{b}</p></div>)}</div>{proofClosed && <div className="mt-5 border-t border-white/10 pt-4 text-sm"><p className="flex justify-between"><span className="text-white/40">Proof close</span><b>35 verified arrivals</b></p><p className="mt-3 flex justify-between"><span className="text-white/40">Exceptions</span><b>2 unresolved → 0</b></p></div>}</div>
        {returning && <EvidenceReceipt title="MOMENT ATTENDANCE CLOSED" color="#b48d24" stampText="RETURN LIST READY" rows={[["Moment", "M-0918"], ["Verified", "35 arrivals"], ["RSVP only", "7 not attendance"], ["Return audience", "29 eligible"]]} />}
      </div>
    </div>
  );
}

function MerchantLifecycle({ index }: { index: number }) {
  const validated = index >= 4;
  const transaction = index >= 5;
  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
      <div className="rounded-[1.5rem] border border-[#ff6a00]/25 bg-[#140c07] p-6">
        <div className="flex items-start justify-between"><div><SmallLabel color="#ff9a4d">Offer stock · OF-2031</SmallLabel><h3 className="mt-3 font-serif text-4xl font-bold">20% off chef&apos;s lunch menu</h3><p className="mt-2 text-sm text-white/42">Broken Plate · Liguanea · 12–3 PM</p></div><Store className="text-[#ff6a00]"/></div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">{[["INVENTORY", index === 0 ? "24 uses staged" : "18 remaining"], ["CLAIM STATE", index >= 2 ? "PC-004218 claimed" : "No claim yet"], ["PRESENTED", index >= 3 ? "1:14 PM" : "—"], ["PROOF TYPE", "Merchant-validated redemption"]].map(([a,b]) => <div key={a} className="border border-white/10 p-4"><SmallLabel color="#ff9a4d">{a}</SmallLabel><p className="mt-2 font-bold">{b}</p></div>)}</div>
      </div>
      <div className="grid gap-4">
        <div className="rounded-[1.5rem] border border-white/10 p-6"><div className="flex items-center gap-2"><QrCode className="text-[#22c55e]"/><SmallLabel color="#22c55e">Validation terminal · VL-1182</SmallLabel></div><h4 className="mt-4 font-serif text-3xl font-bold">{validated ? "Use verified." : "Waiting for presentation."}</h4><div className="mt-5 space-y-3">{[["PromoCard", "PC-004218"], ["Offer", "OF-2031"], ["Validation", validated ? "Verified · 1:14 PM" : "Not yet"], ["Paid order", transaction ? "POS-8831 · JMD 3,400" : "Not proven"]].map(([a,b]) => <div key={a} className="flex justify-between border-b border-white/8 pb-3 text-sm"><span className="text-white/35">{a}</span><b>{b}</b></div>)}</div><p className="mt-5 text-xs leading-5 text-white/40">A redemption is not silently upgraded into a paid order. Transaction proof appears only when separately recorded.</p></div>
        {validated && <EvidenceReceipt title={transaction ? "PURCHASE + REDEMPTION VERIFIED" : "REDEMPTION VERIFIED"} color="#c65508" stampText={transaction ? "PAID ORDER PROVEN" : "REDEMPTION ONLY"} rows={[["Validation", "VL-1182"], ["Offer", "20% lunch"], ["Place", "Broken Plate"], ["Order", transaction ? "POS-8831" : "Not proven"]]} />}
      </div>
    </div>
  );
}

function BrandLifecycle({ index }: { index: number }) {
  const live = index >= 3;
  const proof = index >= 4;
  const decided = index >= 5;
  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
      <div className="overflow-hidden rounded-[1.5rem] border border-[#4cc6f0]/25 bg-[#071319]">
        <div className="border-b border-[#4cc6f0]/20 p-6"><div className="flex justify-between"><div><SmallLabel color="#4cc6f0">Activation dossier · AC-5021</SmallLabel><h3 className="mt-3 font-serif text-4xl font-bold">First 50 for Flash Motors</h3></div><Megaphone className="text-[#4cc6f0]"/></div></div>
        <div className="p-6"><div className="space-y-4">{[["OUTCOME", "50 attributable test-drive actions"], ["AUDIENCE", "Kingston auto-curious adults"], ["ACTION", "Book and attend a test drive"], ["PROOF CONTRACT", "Booking + venue validation"], ["FUNDING", index >= 2 ? "Reward commitment approved" : "Awaiting commitment"]].map(([a,b]) => <div key={a} className="grid grid-cols-[125px_1fr] border-b border-white/8 pb-4 text-sm"><SmallLabel color="#4cc6f0">{a}</SmallLabel><b>{b}</b></div>)}</div>{live && <div className="mt-6 grid grid-cols-3 gap-3">{[["BOOKINGS", "18"], ["ATTENDED", "11"], ["CREATOR PROOF", "4"]].map(([a,b]) => <div key={a} className="border border-[#4cc6f0]/16 p-4"><p className="text-[9px] text-white/30">{a}</p><p className="mt-2 text-2xl font-bold text-[#4cc6f0]">{b}</p></div>)}</div>}</div>
      </div>
      <div className="grid gap-4">
        <div className="rounded-[1.5rem] border border-white/10 p-6"><div className="flex items-center gap-2"><FolderKanban className="text-[#f6c453]"/><SmallLabel color="#f6c453">Evidence binder · EP-5021</SmallLabel></div><div className="mt-5 space-y-3">{[["Verified booking", proof ? "18 records" : "Collecting"], ["Verified attendance", proof ? "11 records" : "Collecting"], ["Creator deliverables", proof ? "4 approved" : "Collecting"], ["Attribution", proof ? "Direct link + validation" : "Pending evidence"], ["Conclusion", decided ? "Increase creator coverage" : "Not yet decided"]].map(([a,b]) => <div key={a} className="flex justify-between border-b border-white/8 pb-3 text-sm"><span className="text-white/35">{a}</span><b>{b}</b></div>)}</div></div>
        {decided && <EvidenceReceipt title="ACTIVATION EVIDENCE PACK" color="#2789a7" stampText={index >= 6 ? "SCALE APPROVED" : "DECISION RECORDED"} rows={[["Activation", "AC-5021"], ["Target", "50 actions"], ["Verified attendance", "11"], ["Can claim", "11 verified test drives"], ["Cannot claim", "50 customers"]]} />}
      </div>
    </div>
  );
}

function AgencyLifecycle({ index }: { index: number }) {
  const proof = index >= 5;
  const expansion = index >= 6;
  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_.92fr]">
      <div className="rounded-[1.5rem] border border-[#b58cff]/22 bg-[#15101c] p-6"><div className="flex items-start justify-between"><div><SmallLabel color="#d6c0ff">Client folio · Pandxtra</SmallLabel><h3 className="mt-3 font-serif text-4xl font-bold">Managed work without losing client truth.</h3></div><IdCard className="text-[#d6c0ff]"/></div><div className="mt-7 space-y-3">{[["Manchester Hills Foods", "Brand", index >= 5 ? "Proof ready" : "Live", "Client owns result"], ["Flash Motors", "Brand", "Live", "Client owns result"], ["Sea Deck", "Venue", "Preparing", "Missing inventory"]].map(([n,t,s,o]) => <div key={n} className="grid grid-cols-[1fr_75px_95px_120px] gap-3 border-b border-white/8 pb-4 text-sm"><b>{n}</b><span className="text-white/35">{t}</span><span className="text-[#d6c0ff]">{s}</span><span className="text-white/35">{o}</span></div>)}</div><div className="mt-6 rounded-xl border border-[#d6c0ff]/18 bg-[#d6c0ff]/5 p-4 text-xs leading-5 text-white/52">Operating context: <b className="text-white">Manchester Hills Foods</b> · managed by Pandxtra · evidence and attribution remain with the client.</div></div>
      <div className="grid gap-4"><div className="rounded-[1.5rem] border border-white/10 p-6"><SmallLabel color="#f6c453">Managed result pack · MR-117</SmallLabel><h4 className="mt-4 font-serif text-3xl font-bold">{proof ? "37 verified offer redemptions." : "Result pack not ready."}</h4><div className="mt-5 space-y-3">{[["Client", "Manchester Hills Foods"], ["Manager", "Pandxtra"], ["Attribution owner", "Manchester Hills Foods"], ["Proof state", proof ? "Ready for client review" : "Collecting"], ["Expansion", expansion ? "Repeat with larger audience" : "Not proposed"]].map(([a,b]) => <div key={a} className="flex justify-between border-b border-white/8 pb-3 text-sm"><span className="text-white/35">{a}</span><b>{b}</b></div>)}</div></div>{proof && <EvidenceReceipt title="MANAGED RESULT PACK" color="#7658a7" stampText={expansion ? "EXPANSION PROPOSED" : "CLIENT PROOF READY"} rows={[["Client", "Manchester Hills Foods"], ["Manager", "Pandxtra"], ["Verified result", "37 redemptions"], ["Ownership", "Client retained"]]} />}</div>
    </div>
  );
}

function AdminLifecycle({ index }: { index: number }) {
  const evidence = index >= 2;
  const resolved = index >= 4;
  const audited = index >= 5;
  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
      <div className="rounded-[1.5rem] border border-[#ff6a00]/30 bg-[#130b07] p-6"><div className="flex items-start justify-between"><div><SmallLabel color="#ff9a4d">Exception case · EX-7712</SmallLabel><h3 className="mt-3 font-serif text-4xl font-bold">Proof conflict needs review.</h3></div><AlertTriangle className="text-[#ff6a00]"/></div><div className="mt-7 space-y-4">{[["SEVERITY", "High"], ["OBJECT", "Merchant validation VL-1182"], ["CONFLICT", "Duplicate validation timestamp"], ["IMPACT", "1 settlement held"], ["OWNER", "Admin · Operations"]].map(([a,b]) => <div key={a} className="grid grid-cols-[110px_1fr] border-b border-white/8 pb-4 text-sm"><SmallLabel color="#ff9a4d">{a}</SmallLabel><b>{b}</b></div>)}</div>{evidence && <div className="mt-6 border border-white/10 bg-black/20 p-4"><SmallLabel color="#22c55e">Chain of custody</SmallLabel><div className="mt-3 space-y-2 text-xs"><p>1:14:02 PM · original merchant scan captured</p><p>1:14:02 PM · duplicate event received</p><p>1:14:03 PM · settlement automatically held</p></div></div>}</div>
      <div className="grid gap-4"><div className="rounded-[1.5rem] border border-white/10 p-6"><div className="flex items-center gap-2"><FileCheck2 className="text-[#22c55e]"/><SmallLabel color="#22c55e">Resolution record · RR-7712</SmallLabel></div><div className="mt-5 space-y-3">{[["Decision", resolved ? "Duplicate rejected" : "Pending"], ["Evidence", resolved ? "Original scan retained" : evidence ? "Reviewed" : "Not reviewed"], ["Settlement", resolved ? "Released" : "Held"], ["Audit", audited ? "AE-7712 · immutable" : "Not written"]].map(([a,b]) => <div key={a} className="flex justify-between border-b border-white/8 pb-3 text-sm"><span className="text-white/35">{a}</span><b>{b}</b></div>)}</div></div>{audited && <EvidenceReceipt title="EXCEPTION RESOLVED" color="#13833c" stampText="AUDIT WRITTEN" rows={[["Case", "EX-7712"], ["Decision", "Duplicate rejected"], ["Settlement", "Released"], ["Audit event", "AE-7712"]]} />}</div>
    </div>
  );
}

function RoleBody({ role, index }: { role: Role; index: number }) {
  switch (role) {
    case "Creator": return <CreatorLifecycle index={index} />;
    case "Host": return <HostLifecycle index={index} />;
    case "Merchant": return <MerchantLifecycle index={index} />;
    case "Brand": return <BrandLifecycle index={index} />;
    case "Agency": return <AgencyLifecycle index={index} />;
    case "Admin": return <AdminLifecycle index={index} />;
  }
}

function CrossRoleMatrix() {
  const rows = [
    ["Creator", "Brief / submission folder", "Approved deliverable + action", "Approval + settlement"],
    ["Host", "Run sheet / arrival ledger", "Verified arrival", "Proof close + return audience"],
    ["Merchant", "Offer stock / terminal", "Redemption / transaction", "Replenish / retarget"],
    ["Brand", "Activation dossier / binder", "Evidence pack", "Repeat / change / scale"],
    ["Agency", "Client folio / result pack", "Client-attributed proof", "Expansion decision"],
    ["Admin", "Case file / custody record", "Resolution + audit", "Restore / escalate / control"],
  ];
  return <div className="mt-16 overflow-hidden rounded-[1.5rem] border border-white/10"><div className="grid grid-cols-[110px_1fr_1fr_1fr] bg-white/[.03] px-5 py-4 text-[9px] font-black uppercase tracking-[.17em] text-white/30"><span>Role</span><span>Work object</span><span>Proof object</span><span>Decision residue</span></div>{rows.map(r => <div key={r[0]} className="grid grid-cols-[110px_1fr_1fr_1fr] gap-3 border-t border-white/8 px-5 py-4 text-sm"><b>{r[0]}</b><span>{r[1]}</span><span className="text-white/55">{r[2]}</span><span className="text-white/40">{r[3]}</span></div>)}</div>;
}

export function StakeholderLifecycleLab() {
  const [role, setRole] = useState<Role>("Creator");
  const [index, setIndex] = useState(0);
  const c = cfg[role];
  const state = c.states[index];
  const next = c.states[Math.min(index + 1, c.states.length - 1)];
  const progress = useMemo(() => Math.round(((index + 1) / c.states.length) * 100), [index, c.states.length]);

  function chooseRole(r: Role) { setRole(r); setIndex(0); }

  return (
    <section className="border-t border-white/10 pt-24">
      <div className="grid gap-8 lg:grid-cols-[1fr_.48fr] lg:items-end">
        <div>
          <SmallLabel>Stakeholder lifecycle lab · iteration 02</SmallLabel>
          <h2 className="mt-4 max-w-5xl font-serif text-5xl font-bold leading-[.9] tracking-[-.055em] md:text-7xl">Different jobs deserve different operating objects.</h2>
        </div>
        <div className="border-l border-[#ff6a00]/35 pl-5"><p className="font-serif text-2xl font-bold text-[#f6d48a]">Work object → proof object → decision residue</p><p className="mt-3 text-sm leading-6 text-white/46">This pass designs the lifecycle, not merely the home screen. Each stakeholder gets a material metaphor, state progression, proof contract and visible consequence.</p></div>
      </div>

      <div className="mt-10 flex flex-wrap gap-2">{roleOrder.map(r => <button key={r} onClick={() => chooseRole(r)} className="rounded-full border px-4 py-2 text-xs font-black" style={{ borderColor: role === r ? cfg[r].color : "rgba(255,255,255,.10)", background: role === r ? `${cfg[r].color}12` : "transparent", color: role === r ? cfg[r].color : "rgba(255,255,255,.42)" }}>{r}</button>)}</div>

      <div className="mt-8 rounded-[2rem] border border-white/10 p-5 md:p-7" style={{ background: `linear-gradient(135deg,${c.tint},#0b0b0c 62%)` }}>
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end"><div><SmallLabel color={c.color}>{role} · {c.material}</SmallLabel><h3 className="mt-3 font-serif text-4xl font-bold">{state}</h3><p className="mt-2 max-w-2xl text-sm text-white/45">Current state {index + 1} of {c.states.length}. Next meaningful state: <b className="text-white/70">{next}</b>.</p></div><div className="min-w-[190px]"><div className="flex justify-between text-[9px] uppercase tracking-[.15em] text-white/30"><span>Lifecycle</span><span>{progress}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8"><div className="h-full" style={{ width: `${progress}%`, background: c.color }}/></div></div></div>
        <div className="mt-6"><StateRail role={role} index={index} setIndex={setIndex}/></div>
        <div className="mt-6"><LifecycleContract role={role}/></div>
        <div className="mt-7"><RoleBody role={role} index={index}/></div>
      </div>

      <CrossRoleMatrix />

      <div className="mt-8 grid gap-4 md:grid-cols-4">{[
        ["01", "Identity continuity", "The operator always knows whose work, venue, campaign, client or case they are operating."],
        ["02", "Proof before vanity", "The interface promotes evidence states before charts, scores, badges or decorative performance theatre."],
        ["03", "State leaves residue", "Approval, validation, settlement, transfer, proof close and resolution visibly alter the object."],
        ["04", "Decision is product", "The lifecycle does not end at reporting; proof leads to repeat, change, scale, retarget, settle or resolve."],
      ].map(([n,t,b]) => <div key={n} className="border border-white/10 p-5"><SmallLabel>{n}</SmallLabel><h4 className="mt-4 font-serif text-xl font-bold">{t}</h4><p className="mt-2 text-xs leading-5 text-white/42">{b}</p></div>)}</div>
    </section>
  );
}
