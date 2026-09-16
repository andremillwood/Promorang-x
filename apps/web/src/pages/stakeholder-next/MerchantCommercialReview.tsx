import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Clock3, PackageCheck, QrCode, ReceiptText, RotateCcw, ScanLine, ShoppingBag, Store } from "lucide-react";
import SEO from "@/components/SEO";
import { PaperReceipt } from "@/components/promorang/SignatureObjects";
import { PromorangSemanticMark } from "@/components/promorang/PromorangSemanticMark";

const foodImage = "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&dpr=1&w=1400";

type MerchantStage = "offer" | "validate" | "validated" | "fulfillment" | "return";

const stages: MerchantStage[] = ["offer", "validate", "validated", "fulfillment", "return"];

const stageMeta: Record<MerchantStage, { label: string; title: string; detail: string }> = {
  offer: {
    label: "Offer",
    title: "Keep the Wing Key available.",
    detail: "The commercial instrument defines inventory, validity and rules before anyone presents a key.",
  },
  validate: {
    label: "Validate",
    title: "Confirm one legitimate use.",
    detail: "The counter checks the entitlement. Nothing has been recorded until the validation write succeeds.",
  },
  validated: {
    label: "Validated",
    title: "The use is now proof.",
    detail: "A successful validation creates durable evidence of use. It still does not create a purchase record.",
  },
  fulfillment: {
    label: "Fulfillment",
    title: "Finish what the offer promised.",
    detail: "Operational completion follows its own state. Purchase and fulfillment remain separate from validation.",
  },
  return: {
    label: "Return",
    title: "Use history becomes useful context.",
    detail: "Verified uses can inform repeat behavior and place history without pretending every validation became revenue.",
  },
};

function ReviewSwitcher({ stage, onChange }: { stage: MerchantStage; onChange: (stage: MerchantStage) => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 hidden max-w-[420px] rounded-[1.4rem] border border-white/10 bg-black/86 p-2 shadow-[0_24px_70px_rgba(0,0,0,.48)] backdrop-blur-xl lg:block" aria-label="Illustrative Merchant state switcher">
      <p className="px-2 pb-2 text-[8px] font-black uppercase tracking-[.18em] text-white/30">Review state</p>
      <div className="flex flex-wrap gap-1">
        {stages.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={`rounded-full px-3 py-2 text-[9px] font-black uppercase tracking-[.12em] ${stage === item ? "bg-[#eadcc6] text-black" : "text-white/45 hover:bg-white/[.05] hover:text-white"}`}
          >
            {stageMeta[item].label}
          </button>
        ))}
      </div>
    </div>
  );
}

function CounterHeader({ stage }: { stage: MerchantStage }) {
  const meta = stageMeta[stage];
  return (
    <section className="border-b border-white/10 bg-[#0a0a0a]">
      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[1.08fr_.72fr_.58fr]">
        <div className="border-b border-white/10 px-6 py-7 lg:border-b-0 lg:border-r lg:px-8">
          <p className="text-[9px] font-black uppercase tracking-[.2em] text-[#d8a74b]">MERCHANT COUNTER · SEA DECK</p>
          <h1 className="mt-2 max-w-2xl font-serif text-4xl font-bold leading-[.92] tracking-[-.04em] lg:text-5xl">Operate the promise. Record only what happened.</h1>
        </div>
        <div className="border-b border-white/10 px-6 py-7 lg:border-b-0 lg:border-r lg:px-7">
          <p className="text-[9px] font-black uppercase tracking-[.18em] text-white/30">CURRENT OPERATION</p>
          <h2 className="mt-3 text-lg font-black">{meta.title}</h2>
          <p className="mt-2 text-xs leading-5 text-white/42">{meta.detail}</p>
        </div>
        <div className="px-6 py-7 lg:px-7">
          <p className="text-[9px] font-black uppercase tracking-[.18em] text-white/30">COUNTER STATUS</p>
          <div className="mt-3 flex items-center gap-2 text-sm font-black text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Validation online</div>
          <p className="mt-2 text-xs text-white/38">23 remaining · 17 validated · 1 open fulfillment</p>
        </div>
      </div>
    </section>
  );
}

function OfferInstrument({ active }: { active: boolean }) {
  return (
    <article className={`relative overflow-hidden border-y border-[#d8a74b]/20 bg-[#11100d] px-6 py-7 transition lg:px-8 ${active ? "shadow-[inset_5px_0_0_#d8a74b]" : "opacity-65"}`}>
      <div className="absolute right-0 top-0 h-full w-[26%] bg-[linear-gradient(135deg,transparent_0_22%,rgba(216,167,75,.06)_22%_24%,transparent_24%_48%,rgba(216,167,75,.05)_48%_50%,transparent_50%)]" />
      <div className="relative grid gap-7 lg:grid-cols-[1.1fr_.7fr] lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2"><span className="text-[9px] font-black uppercase tracking-[.18em] text-[#d8a74b]">OFFER INSTRUMENT · OF-2031</span><span className="rounded-full border border-emerald-400/20 bg-emerald-400/[.06] px-2 py-1 text-[8px] font-black uppercase tracking-[.12em] text-emerald-300">Active</span></div>
          <h2 className="mt-3 font-serif text-4xl font-bold">AFTRHRS Wing Key</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/48">Complimentary wings when a valid PromoKey is presented during the Moment window.</p>
          <div className="mt-6 grid grid-cols-3 border-y border-white/10">
            {[['40','Allocated'],['17','Validated'],['23','Remaining']].map(([value,label]) => <div key={label} className="border-r border-white/10 px-3 py-4 last:border-r-0"><p className="font-serif text-3xl font-bold">{value}</p><p className="mt-1 text-[9px] font-black uppercase tracking-[.12em] text-white/30">{label}</p></div>)}
          </div>
        </div>
        <dl className="grid gap-3 text-xs">
          <div className="border-t border-white/10 pt-3"><dt className="text-[8px] font-black uppercase tracking-[.16em] text-white/28">Validity</dt><dd className="mt-1 font-bold">Tonight · 9 PM–1 AM</dd></div>
          <div className="border-t border-white/10 pt-3"><dt className="text-[8px] font-black uppercase tracking-[.16em] text-white/28">Place</dt><dd className="mt-1 font-bold">Sea Deck · Barbican</dd></div>
          <div className="border-t border-white/10 pt-3"><dt className="text-[8px] font-black uppercase tracking-[.16em] text-white/28">Rule</dt><dd className="mt-1 font-bold">1 use per issuance · present before order</dd></div>
        </dl>
      </div>
    </article>
  );
}

function ValidationTerminal({ stage }: { stage: MerchantStage }) {
  const stageIndex = stages.indexOf(stage);
  const hasValidated = stageIndex >= stages.indexOf("validated");
  return (
    <section className="grid overflow-hidden border-b border-white/10 bg-[#0b0d0c] lg:grid-cols-[.72fr_1.28fr]">
      <div className="border-b border-white/10 bg-black/25 p-6 lg:border-b-0 lg:border-r lg:p-8">
        <div className="flex items-center justify-between gap-3"><div><p className="text-[9px] font-black uppercase tracking-[.18em] text-emerald-300">VALIDATION DEVICE</p><h2 className="mt-2 font-serif text-3xl font-bold">Counter 01</h2></div><span className="rounded-full border border-emerald-400/20 px-3 py-2 text-[8px] font-black uppercase tracking-[.14em] text-emerald-300">Write boundary</span></div>
        <div className="relative mt-7 aspect-square max-w-[300px] overflow-hidden border border-emerald-300/15 bg-[#111]">
          <div className="absolute inset-[12%] border border-dashed border-emerald-300/25" />
          <div className="absolute inset-0 grid place-items-center"><ScanLine className="h-20 w-20 text-emerald-300/60" /></div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[8px] font-black uppercase tracking-[.12em] text-white/30"><span>QR / manual</span><span>online</span></div>
        </div>
        <p className="mt-4 max-w-sm text-xs leading-5 text-white/38">A failed or duplicate check leaves no successful validation record. The device must make non-writes visible.</p>
      </div>

      <div className="p-6 lg:p-8">
        <p className="text-[9px] font-black uppercase tracking-[.18em] text-white/30">CURRENT BOUNDARY</p>
        <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_.72fr]">
          <div className="relative min-h-[300px] overflow-hidden bg-[#15120d] p-6 [clip-path:polygon(0_0,92%_0,100%_10%,100%_100%,0_100%)]">
            <div className="absolute right-5 top-5 h-8 w-8 rounded-full border border-[#d8a74b]/30 shadow-[inset_0_0_0_8px_#0b0d0c]" />
            <p className="text-[9px] font-black uppercase tracking-[.18em] text-[#d8a74b]">PROMOKEY · ISSUANCE PK-8841</p>
            <h3 className="mt-5 font-serif text-3xl font-bold">AFTRHRS Wing Key</h3>
            <p className="mt-3 text-sm leading-6 text-white/45">Presented by participant · valid at this station · one use available.</p>
            <div className="mt-7 border-t border-[#d8a74b]/15 pt-5 font-mono text-xl font-black tracking-[.14em] text-[#f2d18c]">PR-AF84-91Q</div>
            <div className="absolute bottom-5 left-6 flex items-center gap-2 text-[9px] font-black uppercase tracking-[.13em] text-white/35"><QrCode className="h-4 w-4" /> entitlement to inspect</div>
          </div>

          <div className="flex min-h-[300px] flex-col justify-between border-l border-white/10 pl-5">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.15em] text-white/30">CHECKS</p>
              {['Correct merchant / place','Within validity window','Issuance unused','Code resolves to active Offer'].map((item,index) => <div key={item} className="mt-4 flex items-center gap-3 border-b border-white/8 pb-3 text-xs"><CheckCircle2 className={`h-4 w-4 ${stage === 'offer' ? 'text-white/20' : 'text-emerald-300'}`} /><span className={stage === 'offer' ? 'text-white/30' : 'text-white/70'}>{item}</span></div>)}
            </div>
            <button type="button" className={`mt-6 flex min-h-12 items-center justify-between px-4 text-sm font-black ${hasValidated ? "bg-emerald-300/15 text-emerald-200" : stage === "validate" ? "bg-emerald-400 text-black" : "bg-white/[.06] text-white/35"}`}>
              {hasValidated ? "Use validated" : stage === "validate" ? "Validate use" : "Waiting for presentation"}<ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function EvidenceAndFulfillment({ stage }: { stage: MerchantStage }) {
  const stageIndex = stages.indexOf(stage);
  const hasValidated = stageIndex >= stages.indexOf("validated");
  const hasFulfilled = stageIndex >= stages.indexOf("fulfillment");
  const hasReturn = stage === "return";

  return (
    <section className="grid gap-0 border-b border-white/10 lg:grid-cols-[.78fr_1.22fr]">
      <div className="relative min-h-[420px] overflow-hidden border-b border-white/10 bg-[#0a0a0a] p-6 lg:border-b-0 lg:border-r lg:p-8">
        <p className="text-[9px] font-black uppercase tracking-[.18em] text-[#d8a74b]">VALIDATION SLIP</p>
        {hasValidated ? (
          <div className="mt-6 max-w-[330px] rotate-[-1.5deg]">
            <PaperReceipt
              heading="USE VALIDATED"
              lines={[
                { label: "Offer", value: "AFTRHRS Wing Key", strong: true },
                { label: "Place", value: "Sea Deck" },
                { label: "Issuance", value: "PK-8841" },
                { label: "Validated", value: "10:54 PM" },
              ]}
              footer="This proves offer use. Purchase and fulfillment remain separate records."
            />
          </div>
        ) : (
          <div className="mt-7 h-[280px] max-w-[310px] border border-dashed border-white/10 p-6 text-white/25"><ReceiptText className="h-8 w-8" /><p className="mt-5 font-serif text-2xl font-bold">Nothing printed yet.</p><p className="mt-2 text-xs leading-5">A receipt appears only after the validation write succeeds.</p></div>
        )}
      </div>

      <div className="bg-[#0d0d0d] p-6 lg:p-8">
        <div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-black uppercase tracking-[.18em] text-white/30">AFTER VALIDATION</p><h2 className="mt-2 font-serif text-3xl font-bold">Separate operational records.</h2></div><PackageCheck className="h-6 w-6 text-[#d8a74b]" /></div>
        <div className="mt-7 divide-y divide-white/8 border-y border-white/8">
          <div className="grid gap-3 py-5 sm:grid-cols-[.9fr_1.2fr_.6fr]"><div><span className="text-[8px] font-black uppercase tracking-[.15em] text-white/25">Purchase</span><p className="mt-2 font-bold">Not recorded</p></div><p className="text-xs leading-5 text-white/38">Validation alone does not prove spend or revenue.</p><span className="self-center justify-self-start border border-white/10 px-2 py-1 text-[8px] font-black uppercase tracking-[.12em] text-white/35">Separate</span></div>
          <div className="grid gap-3 py-5 sm:grid-cols-[.9fr_1.2fr_.6fr]"><div><span className="text-[8px] font-black uppercase tracking-[.15em] text-white/25">Fulfillment</span><p className="mt-2 font-bold">{hasFulfilled ? "Confirmed" : hasValidated ? "Open" : "Waiting"}</p></div><p className="text-xs leading-5 text-white/38">Did the merchant actually complete what the Offer promised?</p><span className={`self-center justify-self-start border px-2 py-1 text-[8px] font-black uppercase tracking-[.12em] ${hasFulfilled ? "border-emerald-300/20 text-emerald-300" : "border-[#d8a74b]/20 text-[#d8a74b]"}`}>{hasFulfilled ? "Complete" : "Queue"}</span></div>
          <div className="grid gap-3 py-5 sm:grid-cols-[.9fr_1.2fr_.6fr]"><div><span className="text-[8px] font-black uppercase tracking-[.15em] text-white/25">Return</span><p className="mt-2 font-bold">{hasReturn ? "History available" : "Not yet"}</p></div><p className="text-xs leading-5 text-white/38">Repeat context can only emerge after verified history exists.</p><span className={`self-center justify-self-start border px-2 py-1 text-[8px] font-black uppercase tracking-[.12em] ${hasReturn ? "border-purple-300/20 text-purple-200" : "border-white/10 text-white/30"}`}>{hasReturn ? "Retained" : "Future"}</span></div>
        </div>
      </div>
    </section>
  );
}

function ReturnLedger({ stage }: { stage: MerchantStage }) {
  const active = stage === "return";
  return (
    <section className={`relative overflow-hidden px-6 py-9 lg:px-8 ${active ? "bg-[radial-gradient(circle_at_82%_50%,rgba(181,140,255,.08),transparent_22%),#090909]" : "bg-[#090909]"}`}>
      <div className="absolute left-[8%] right-[8%] top-1/2 hidden h-px bg-gradient-to-r from-transparent via-[#d8a74b]/20 to-transparent lg:block" />
      <div className="relative grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-center">
        <div><div className="flex items-center gap-3"><PromorangSemanticMark kind="return" size={36} /><div><p className="text-[9px] font-black uppercase tracking-[.17em] text-[#d8a74b]">RETURN / PLACE HISTORY</p><h2 className="mt-1 font-serif text-3xl font-bold">A counter can remember without inventing revenue.</h2></div></div><p className="mt-4 max-w-xl text-sm leading-6 text-white/42">Repeated verified uses can become useful place history. Purchase, fulfillment and repeat behavior stay source-distinct.</p></div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[['17','validated uses',ScanLine],['1','fulfilled tonight',ShoppingBag],['4','prior verified returns',RotateCcw]].map(([value,label,Icon]) => { const C = Icon as typeof Store; return <div key={String(label)} className="border-l border-white/10 pl-5"><C className={`h-5 w-5 ${active ? "text-[#d8a74b]" : "text-white/25"}`} /><p className="mt-4 font-serif text-4xl font-bold">{String(value)}</p><p className="mt-1 text-xs text-white/35">{String(label)}</p></div>; })}
        </div>
      </div>
    </section>
  );
}

export default function MerchantCommercialReview() {
  const [stage, setStage] = useState<MerchantStage>("validate");
  const stageIndex = useMemo(() => stages.indexOf(stage), [stage]);

  return (
    <main className="min-h-screen bg-[#080809] text-white">
      <SEO title="Merchant Commercial Chain — Stakeholder Next" description="Illustrative Merchant expression of the canonical PROMORANG commercial chain." />
      <ReviewSwitcher stage={stage} onChange={setStage} />
      <CounterHeader stage={stage} />

      <div className="mx-auto max-w-[1500px] border-x border-white/[.06]">
        <nav className="grid border-b border-white/10 bg-[#090909] sm:grid-cols-5" aria-label="Merchant commercial chain">
          {stages.map((item,index) => <button key={item} type="button" onClick={() => setStage(item)} className={`relative min-h-16 border-b border-white/8 px-4 text-left sm:border-b-0 sm:border-r ${stage === item ? "bg-white/[.035]" : ""}`}><span className="text-[8px] font-black tracking-[.14em] text-white/25">0{index+1}</span><span className={`ml-3 text-[10px] font-black uppercase tracking-[.13em] ${index <= stageIndex ? "text-[#d8a74b]" : "text-white/28"}`}>{stageMeta[item].label}</span>{stage === item ? <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d8a74b]" /> : null}</button>)}
        </nav>
        <OfferInstrument active={stageIndex >= 0} />
        <ValidationTerminal stage={stage} />
        <EvidenceAndFulfillment stage={stage} />
        <ReturnLedger stage={stage} />
      </div>
    </main>
  );
}
