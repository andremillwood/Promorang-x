import {
  Archive,
  BadgeCheck,
  CheckCircle2,
  FileCheck2,
  FileText,
  FolderKanban,
  History,
  ReceiptText,
  ShieldCheck,
  Stamp,
} from "lucide-react";
import SEO from "@/components/SEO";
import { PaperReceipt } from "@/components/promorang/SignatureObjects";
import { PromorangSemanticMark } from "@/components/promorang/PromorangSemanticMark";

export type ProofRole = "creator" | "host" | "merchant" | "brand" | "agency" | "admin";

const roleMeta: Record<ProofRole, { kicker: string; title: string; subtitle: string; accent: string }> = {
  creator: {
    kicker: "CREATOR PROOF DOSSIER · CB-0421",
    title: "Show what the work moved — without calling approval payment.",
    subtitle: "Broken Plate · Draft 03 · proof family review",
    accent: "text-[#b58cff]",
  },
  host: {
    kicker: "HOST PROOF CLOSE · AFTRHRS",
    title: "Close the Moment without rewriting who actually arrived.",
    subtitle: "Sea Deck · Kingston After Dark · proof family review",
    accent: "text-[#ff9a4d]",
  },
  merchant: {
    kicker: "MERCHANT VALIDATION SLIP · PK-8841",
    title: "Print the use. Keep purchase and fulfillment separate.",
    subtitle: "Sea Deck · Counter 01 · proof family review",
    accent: "text-emerald-300",
  },
  brand: {
    kicker: "BRAND EVIDENCE PACK · EP-5021",
    title: "Compose evidence without flattening its source or strength.",
    subtitle: "First 50 · Manchester Hills Foods · proof family review",
    accent: "text-[#d8a74b]",
  },
  agency: {
    kicker: "MANAGED RESULT PACK · MR-117",
    title: "Package the result. Preserve who owns the truth.",
    subtitle: "Manchester Hills Foods · operated by agency · proof family review",
    accent: "text-[#f0cf89]",
  },
  admin: {
    kicker: "SOURCE / CORRECTION ARCHIVE · AC-1182",
    title: "Correct the record without erasing the record.",
    subtitle: "Attendance reversal · forensic archive review",
    accent: "text-[#ff9a4d]",
  },
};

function CanonicalTrace() {
  const items = [
    ["SOURCE", "Something happened or was submitted."],
    ["CLAIM", "Someone says what it means."],
    ["VERIFY", "Evidence crosses a proof boundary."],
    ["DECIDE", "An authorized actor records a decision."],
    ["KEEP", "The decision and source remain inspectable."],
  ];
  return (
    <section className="border-y border-white/8 bg-black/20">
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 md:grid-cols-5">
        {items.map(([label, detail], index) => (
          <div key={label} className="relative border-b border-white/8 px-5 py-4 md:border-b-0 md:border-r md:last:border-r-0">
            <span className="text-[8px] font-black tracking-[.16em] text-white/22">0{index + 1}</span>
            <strong className="mt-1 block text-[10px] font-black tracking-[.16em] text-[#f6c453]">{label}</strong>
            <p className="mt-2 text-[10px] leading-4 text-white/34">{detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MerchantArtifact() {
  return (
    <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr]">
      <div className="relative min-h-[620px] overflow-hidden border-r border-white/8 bg-[#0b0d0c] p-7">
        <div className="absolute left-1/2 top-0 h-6 w-[72%] -translate-x-1/2 border-x border-b border-white/8 bg-[#060707]" />
        <p className="mt-7 text-[9px] font-black uppercase tracking-[.18em] text-emerald-300">THERMAL OUTPUT</p>
        <div className="mt-6 max-w-[340px]">
          <PaperReceipt
            heading="USE VALIDATED"
            lines={[
              { label: "Offer", value: "AFTRHRS Wing Key", strong: true },
              { label: "Issuance", value: "PK-8841" },
              { label: "Place", value: "Sea Deck" },
              { label: "Validated", value: "10:54 PM" },
              { label: "Purchase", value: "Not implied" },
              { label: "Fulfillment", value: "Separate state" },
            ]}
            footer="This slip proves one accepted entitlement use. It does not manufacture spend, revenue or fulfillment."
          />
        </div>
      </div>
      <div className="p-7 lg:p-9">
        <p className="text-[9px] font-black uppercase tracking-[.18em] text-white/30">WRITE BOUNDARY</p>
        <h2 className="mt-3 max-w-2xl font-serif text-4xl font-bold">The slip exists because validation succeeded.</h2>
        <div className="mt-8 grid gap-0 border-y border-white/8">
          {[
            ["Entitlement", "PK-8841 resolved to an active Offer", "verified"],
            ["Use", "One successful validation at Sea Deck", "written"],
            ["Purchase", "No commerce receipt attached", "not recorded"],
            ["Fulfillment", "Pending merchant completion", "separate"],
          ].map(([label, detail, state]) => (
            <div key={label} className="grid gap-2 border-b border-white/8 py-5 last:border-b-0 sm:grid-cols-[.55fr_1.2fr_.45fr]">
              <strong>{label}</strong><span className="text-sm text-white/45">{detail}</span><span className="text-[9px] font-black uppercase tracking-[.13em] text-emerald-300/70">{state}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HostArtifact() {
  const rows = [
    ["GR-771", "Arrival at 10:42 PM", "Door log + valid pass", "VERIFIED"],
    ["PS-1180", "Participation proof", "Photo + location evidence", "WAITING"],
    ["EX-91", "Pass mismatch", "Pass belongs to another Moment", "EXCEPTION"],
  ];
  return (
    <div className="grid gap-8 lg:grid-cols-[1.12fr_.58fr]">
      <section className="relative overflow-hidden bg-[#efe1c8] p-7 text-[#1b160f] shadow-[0_30px_90px_rgba(0,0,0,.3)]">
        <div className="absolute right-0 top-0 h-full w-3 bg-[repeating-linear-gradient(180deg,#ff6a00_0_6px,transparent_6px_14px)] opacity-30" />
        <div className="flex items-start justify-between gap-4 border-b border-dashed border-black/25 pb-5"><div><p className="text-[9px] font-black tracking-[.18em] text-[#8b5427]">RUN CLOSE · M-0918</p><h2 className="mt-2 font-serif text-4xl font-bold">AFTRHRS Proof Close</h2></div><Stamp className="h-10 w-10 text-[#8b5427]" /></div>
        <div className="mt-6 divide-y divide-black/12">
          {rows.map(([id, title, source, state]) => <div key={id} className="grid gap-3 py-5 sm:grid-cols-[.35fr_1fr_1.1fr_.45fr]"><b className="font-mono text-xs">{id}</b><strong>{title}</strong><span className="text-sm text-black/55">{source}</span><span className="text-[9px] font-black tracking-[.12em] text-[#8b5427]">{state}</span></div>)}
        </div>
        <p className="mt-8 border-t border-black/15 pt-5 text-sm text-black/55">Approval closes a proof decision. Rejection needs a reason and remains in history. Arrival truth does not disappear because a later submission fails.</p>
      </section>
      <aside className="bg-[#11100f] p-7">
        <PromorangSemanticMark kind="proof" size={42}/><p className="mt-5 text-[9px] font-black tracking-[.18em] text-[#ff9a4d]">CLOSE STATE</p><h3 className="mt-2 font-serif text-3xl font-bold">2 decisions remain.</h3>
        <div className="mt-7 space-y-4 text-sm text-white/48"><p>6 proofs in review</p><p>1 door exception</p><p>Original guest arrival ledger retained</p></div>
      </aside>
    </div>
  );
}

function CreatorArtifact() {
  return (
    <div className="relative grid gap-0 overflow-hidden border border-purple-300/12 bg-[#100d13] lg:grid-cols-[1.15fr_.55fr]">
      <section className="p-7 lg:p-9">
        <div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-black tracking-[.18em] text-purple-300">PROOF DOSSIER · CB-0421</p><h2 className="mt-2 font-serif text-4xl font-bold">Broken Plate</h2></div><FolderKanban className="h-8 w-8 text-purple-300/60" /></div>
        <div className="mt-8 grid gap-0 border-y border-purple-200/10 md:grid-cols-4">
          {[
            ["OBSERVED", "Reel published", "Instagram URL"],
            ["ATTRIBUTED", "18 actions linked", "Tracked PROMORANG link"],
            ["VERIFIED", "18 actions confirmed", "Reviewer close pending"],
            ["VALUE", "Ledger entry pending", "Approval is not payment"],
          ].map(([stage, title, source]) => <div key={stage} className="border-b border-purple-200/10 p-5 md:border-b-0 md:border-r md:last:border-r-0"><span className="text-[8px] font-black tracking-[.14em] text-purple-300/65">{stage}</span><strong className="mt-3 block">{title}</strong><p className="mt-2 text-xs leading-5 text-white/38">{source}</p></div>)}
        </div>
        <div className="mt-8 border-l-2 border-purple-300/35 bg-purple-300/[.04] p-5"><p className="text-[9px] font-black tracking-[.16em] text-purple-300">REVIEW NOTE</p><p className="mt-2 text-sm leading-6 text-white/54">Publishing proves a release exists. Attribution and verified outcomes need their own evidence. An approved proof dossier does not mean settlement was sent.</p></div>
      </section>
      <aside className="relative border-t border-purple-200/10 bg-[#17111b] p-7 lg:border-l lg:border-t-0">
        <div className="absolute right-5 top-5 rotate-6 border-2 border-purple-300/30 px-3 py-2 text-[9px] font-black tracking-[.16em] text-purple-200/65">REVIEW OPEN</div>
        <p className="mt-16 text-[9px] font-black tracking-[.18em] text-purple-300">SOURCE FOLDER</p><p className="mt-4 text-sm text-white/52">Published URL</p><p className="mt-2 text-sm text-white/52">Action evidence</p><p className="mt-2 text-sm text-white/52">Reviewer decision</p><p className="mt-2 text-sm text-white/52">Creator ledger state</p>
      </aside>
    </div>
  );
}

function BrandArtifact() {
  const evidence = [
    ["Creator tracked links", "29", "ATTRIBUTED"],
    ["Merchant validations", "12", "VERIFIED USE"],
    ["Host arrivals", "6", "VERIFIED ATTENDANCE"],
    ["Unmatched actions", "13", "UNRESOLVED"],
  ];
  return (
    <section className="relative overflow-hidden bg-[#15110c] p-7 shadow-[0_30px_90px_rgba(0,0,0,.3)] lg:p-10">
      <div className="absolute left-0 top-0 h-full w-3 bg-[#d8a74b]/30" />
      <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
        <div><p className="text-[9px] font-black tracking-[.18em] text-[#d8a74b]">EVIDENCE PACK · EP-5021</p><h2 className="mt-3 font-serif text-5xl font-bold">First 50</h2><p className="mt-4 max-w-md text-sm leading-6 text-white/48">Observed, attributed and verified remain separate. The pack should support a decision, not manufacture ROI or footfall.</p><div className="mt-8 grid grid-cols-2 gap-px bg-white/8">{[["47","Observed"],["47","Attributed"],["34","Verified"],["13","Unresolved"]].map(([value,label]) => <div key={label} className="bg-[#15110c] p-5"><strong className="font-serif text-3xl">{value}</strong><span className="mt-1 block text-[9px] font-black uppercase tracking-[.12em] text-white/30">{label}</span></div>)}</div></div>
        <div className="border-l border-[#d8a74b]/15 pl-6"><p className="text-[9px] font-black tracking-[.16em] text-white/30">SOURCE FRAGMENTS</p>{evidence.map(([source,count,state]) => <div key={source} className="mt-4 grid grid-cols-[1fr_.25fr_.6fr] gap-4 border-b border-white/8 pb-4"><strong>{source}</strong><b className="font-serif text-xl">{count}</b><span className="text-right text-[9px] font-black tracking-[.12em] text-[#f0cf89]">{state}</span></div>)}<div className="mt-6 border border-[#d8a74b]/18 bg-[#d8a74b]/[.04] p-4 text-sm text-[#f0cf89]">Decision gate: do not scale while 13 actions remain unresolved.</div></div>
      </div>
    </section>
  );
}

function AgencyArtifact() {
  return (
    <section className="relative overflow-hidden bg-[#111012] p-7 lg:p-10">
      <div className="absolute left-8 top-0 h-10 w-32 rounded-b-xl bg-[#f0cf89] text-center text-[9px] font-black leading-10 tracking-[.13em] text-black">CLIENT FOLIO</div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
        <div><p className="text-[9px] font-black tracking-[.18em] text-[#f0cf89]">MR-117 · MANCHESTER HILLS FOODS</p><h2 className="mt-3 font-serif text-4xl font-bold">Managed Result Pack</h2><div className="mt-7 space-y-4 text-sm"><div><span className="text-white/30">Owner</span><strong className="ml-3">Manchester Hills Foods</strong></div><div><span className="text-white/30">Operator</span><strong className="ml-3">Agency workspace</strong></div><div><span className="text-white/30">Verified result</span><strong className="ml-3">34 actions</strong></div><div><span className="text-white/30">Open issue</span><strong className="ml-3">13 unresolved</strong></div></div></div>
        <div className="border-l border-white/8 pl-6"><p className="text-[9px] font-black tracking-[.16em] text-white/30">RECOMMENDATION SLIP</p><div className="mt-4 -rotate-1 bg-[#efe1c8] p-6 text-[#1a120c] shadow-[0_20px_60px_rgba(0,0,0,.25)]"><p className="text-[9px] font-black tracking-[.14em] text-[#7a5527]">WORKING RECOMMENDATION</p><h3 className="mt-2 font-serif text-2xl font-bold">Change offer framing before the Montego Bay repeat.</h3><p className="mt-4 text-sm leading-6 text-black/55">The agency can package evidence and recommend an operating change. The client owns the commercial decision and underlying truth.</p></div><p className="mt-6 text-xs leading-5 text-white/35">Venue/merchant client evidence should hand off to the Merchant workspace when equivalent agency-side data does not exist. Do not display fabricated zero-results.</p></div>
      </div>
    </section>
  );
}

function AdminArtifact() {
  return (
    <div className="relative grid gap-8 lg:grid-cols-[1.15fr_.55fr]">
      <section className="relative bg-[#ddd5c5] p-7 text-[#191713] lg:p-9">
        <div className="absolute -left-1 top-14 h-28 w-7 rounded-r bg-[#9b7a42]" />
        <div className="flex items-start justify-between gap-4 border-b border-black/20 pb-5"><div><p className="text-[9px] font-black tracking-[.18em] text-[#7a2e17]">SOURCE RECORD · GR-771</p><h2 className="mt-2 font-serif text-4xl font-bold">Verified attendance</h2></div><Archive className="h-8 w-8 text-[#7a2e17]" /></div>
        <div className="mt-7 grid gap-5 sm:grid-cols-2"><div><span className="text-[9px] font-black tracking-[.14em] text-black/40">ORIGINAL</span><strong className="mt-2 block">Guest arrival · 10:44 PM</strong><p className="mt-2 text-sm text-black/55">Door log + receipt GR-771</p></div><div><span className="text-[9px] font-black tracking-[.14em] text-black/40">DISPUTE</span><strong className="mt-2 block">Duplicate scan reported</strong><p className="mt-2 text-sm text-black/55">Host note · 11:02 PM</p></div></div>
        <div className="mt-8 border-t border-black/18 pt-6"><span className="text-[9px] font-black tracking-[.14em] text-black/40">SOURCE EVIDENCE</span><p className="mt-3 text-sm">Receipt + door log + device trace remain attached to the original record.</p></div>
      </section>
      <aside className="relative min-h-[420px] bg-[#32110e] p-7 text-[#f0d7cc] shadow-[0_30px_90px_rgba(0,0,0,.3)]">
        <div className="absolute -left-5 top-16 h-10 w-10 rotate-45 bg-[#32110e]" />
        <History className="h-7 w-7 text-[#ff9a4d]" /><p className="mt-6 text-[9px] font-black tracking-[.18em] text-[#ff9a4d]">CORRECTION RECORD · CR-1182</p><h3 className="mt-3 font-serif text-3xl font-bold">Append-only reversal</h3><p className="mt-4 text-sm leading-6 text-white/55">A correction becomes a new record. It references the source and reason; it does not delete the original attendance event.</p><div className="mt-8 rotate-[-4deg] border-2 border-[#ff9a4d]/35 px-4 py-3 text-center text-[10px] font-black tracking-[.16em] text-[#ff9a4d]">PENDING OPERATOR DECISION</div>
      </aside>
    </div>
  );
}

export default function OperatorProofEvidenceReview({ role }: { role: ProofRole }) {
  const meta = roleMeta[role];
  const artifact = role === "merchant" ? <MerchantArtifact /> : role === "host" ? <HostArtifact /> : role === "creator" ? <CreatorArtifact /> : role === "brand" ? <BrandArtifact /> : role === "agency" ? <AgencyArtifact /> : <AdminArtifact />;
  return (
    <main className="min-h-screen bg-[#080809] text-white">
      <SEO title={`${meta.kicker} — PROMORANG`} description="Illustrative canonical proof, receipt and evidence family review." />
      <section className="border-b border-white/8 bg-[#0a0a0a]">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-5 py-8 sm:px-7 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div><p className={`text-[9px] font-black uppercase tracking-[.2em] ${meta.accent}`}>{meta.kicker}</p><h1 className="mt-3 max-w-4xl font-serif text-4xl font-bold leading-[.94] tracking-[-.035em] lg:text-5xl">{meta.title}</h1><p className="mt-4 text-sm text-white/40">{meta.subtitle}</p></div>
          <div className="flex items-center gap-3 border-l border-white/10 pl-4"><PromorangSemanticMark kind="proof" size={38}/><div><span className="text-[8px] font-black uppercase tracking-[.16em] text-white/25">Canonical family</span><strong className="mt-1 block text-xs">Proof / Receipt / Evidence</strong></div></div>
        </div>
      </section>
      <CanonicalTrace />
      <section className="mx-auto max-w-[1500px] px-5 py-9 sm:px-7 lg:px-8 lg:py-12">{artifact}</section>
      <section className="mx-auto max-w-[1500px] border-t border-white/8 px-5 py-8 sm:px-7 lg:px-8">
        <div className="flex max-w-4xl items-start gap-4"><ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[#f6c453]"/><div><p className="text-[9px] font-black uppercase tracking-[.16em] text-[#f6c453]">Family rule</p><p className="mt-2 text-sm leading-6 text-white/45">A proof artifact may change the state of a claim. It must not silently create attendance, purchase, fulfillment, payout, ROI or any other downstream fact that requires its own record.</p></div></div>
      </section>
    </main>
  );
}
