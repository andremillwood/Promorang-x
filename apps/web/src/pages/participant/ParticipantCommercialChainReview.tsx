import { useState } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, Clock3, MapPin, ReceiptText, ShoppingBag, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { PaperReceipt } from "@/components/promorang/SignatureObjects";
import { PromorangSemanticMark } from "@/components/promorang/PromorangSemanticMark";

const foodImage = "https://images.pexels.com/photos/410648/pexels-photo-410648.jpeg?auto=compress&dpr=1&w=1800";

type CommercialStage = "available" | "held" | "presented" | "validated" | "fulfilled" | "returned";

const stageOrder: CommercialStage[] = ["available", "held", "presented", "validated", "fulfilled", "returned"];

const stageCopy: Record<CommercialStage, {
  label: string;
  state: string;
  eyebrow: string;
  title: string;
  copy: string;
  cta: string;
}> = {
  available: {
    label: "Available",
    state: "Perk · Available",
    eyebrow: "Something useful is open",
    title: "Complimentary wings, if you want them.",
    copy: "The benefit is the Perk. The rules behind when and where it can be used belong to the Offer. You do not need to read the merchant rulebook to understand what is useful to you.",
    cta: "Get the Wing Key",
  },
  held: {
    label: "Held",
    state: "PromoKey · Active",
    eyebrow: "You carry the entitlement",
    title: "The benefit is now yours to present.",
    copy: "Your PromoKey is the carried right to this benefit. It is not money, not a purchase and not proof that the wings were already received.",
    cta: "Show PromoKey",
  },
  presented: {
    label: "Presented",
    state: "PromoKey · Presented",
    eyebrow: "At the merchant boundary",
    title: "Sea Deck can now check it.",
    copy: "Presentation starts validation. Until the merchant confirms the code, nothing has been recorded as used.",
    cta: "Present to Sea Deck",
  },
  validated: {
    label: "Validated",
    state: "Use · Validated",
    eyebrow: "Use confirmed",
    title: "The Perk was used here.",
    copy: "Validation proves this offer use at Sea Deck. It still does not prove a paid purchase, revenue amount or fulfillment beyond the validated benefit.",
    cta: "See validation receipt",
  },
  fulfilled: {
    label: "Fulfilled",
    state: "Perk · Fulfilled",
    eyebrow: "Benefit delivered",
    title: "The wings were actually provided.",
    copy: "Fulfillment is its own operational outcome. A separate purchase can exist alongside it, but PROMORANG should never manufacture one from validation alone.",
    cta: "Keep receipt",
  },
  returned: {
    label: "Returned",
    state: "Return · Available",
    eyebrow: "Something useful came back",
    title: "One use can shape what returns next.",
    copy: "The validated history can now support a repeat benefit, recommendation, Scene history or another opening. Return is consequence, not a retroactive rewrite of what happened.",
    cta: "See what returned",
  },
};

const journey = [
  { label: "PERK", detail: "The benefit itself.", kind: "explore" as const },
  { label: "OFFER", detail: "Rules, inventory and validity behind it.", kind: "move" as const },
  { label: "PROMOKEY", detail: "The entitlement you carry.", kind: "move" as const },
  { label: "VALIDATION", detail: "Merchant confirms this use.", kind: "proof" as const },
  { label: "RECEIPT", detail: "Durable proof of what changed.", kind: "return" as const },
  { label: "RETURN", detail: "Useful consequence comes back.", kind: "kept" as const },
];

function ReviewStateSwitcher({ stage, onChange }: { stage: CommercialStage; onChange: (stage: CommercialStage) => void }) {
  return (
    <div className="fixed bottom-5 left-1/2 z-50 hidden -translate-x-1/2 rounded-full border border-white/10 bg-black/80 p-1.5 shadow-[0_18px_60px_rgba(0,0,0,.45)] backdrop-blur-xl lg:flex" aria-label="Illustrative commercial-chain state switcher">
      {stageOrder.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={`rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] transition ${stage === item ? "bg-[#eadcc6] text-black" : "text-white/45 hover:text-white"}`}
        >
          {stageCopy[item].label}
        </button>
      ))}
    </div>
  );
}

function PerkToken({ dim = false }: { dim?: boolean }) {
  return (
    <div className={`relative grid aspect-square w-44 place-items-center rounded-full border border-[#f6c453]/30 bg-[radial-gradient(circle_at_38%_30%,rgba(246,196,83,.28),transparent_34%),#17120b] text-center shadow-[0_24px_70px_rgba(0,0,0,.4)] transition ${dim ? "opacity-45" : "opacity-100"}`}>
      <div className="absolute inset-3 rounded-full border border-dashed border-[#f6c453]/18" />
      <div className="relative px-5">
        <Sparkles className="mx-auto h-5 w-5 text-[#f6c453]" />
        <p className="mt-3 text-[9px] font-black uppercase tracking-[.18em] text-[#f6c453]">Perk</p>
        <p className="mt-1 font-serif text-xl font-bold">Wings</p>
        <p className="mt-1 text-[10px] leading-4 text-white/45">Complimentary</p>
      </div>
    </div>
  );
}

function OfferInstrument({ active }: { active: boolean }) {
  return (
    <div className={`relative w-full max-w-xl overflow-hidden border-y border-[#d49a35]/20 bg-[#100f0c] py-6 pl-6 pr-20 transition ${active ? "opacity-100" : "opacity-45"}`}>
      <div className="absolute right-0 top-0 h-full w-16 border-l border-dashed border-[#d49a35]/25 bg-[#17130d]" />
      <div className="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-[#080809]" />
      <p className="text-[9px] font-black uppercase tracking-[.16em] text-[#d49a35]">Offer · OF-2031</p>
      <h3 className="mt-2 font-serif text-2xl font-bold">AFTRHRS Wing Offer</h3>
      <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
        <div><p className="text-white/28">Place</p><p className="mt-1 font-bold">Sea Deck</p></div>
        <div><p className="text-white/28">Window</p><p className="mt-1 font-bold">10 PM–12 AM</p></div>
        <div><p className="text-white/28">Remaining</p><p className="mt-1 font-bold">23</p></div>
      </div>
      <p className="mt-4 border-t border-white/8 pt-3 text-[11px] leading-5 text-white/42">1 Perk · one use per participant · valid during AFTRHRS · merchant validation required</p>
    </div>
  );
}

function PromoKeyObject({ used = false, presented = false }: { used?: boolean; presented?: boolean }) {
  return (
    <div className={`relative min-h-[330px] w-[230px] [clip-path:polygon(16%_0,84%_0,100%_13%,100%_100%,0_100%,0_13%)] bg-[linear-gradient(160deg,#1a160f,#0c0c0d_74%)] p-7 pt-14 shadow-[0_30px_90px_rgba(0,0,0,.45)] transition ${used ? "rotate-[-2deg] opacity-65" : "rotate-1 opacity-100"}`}>
      <div className="absolute left-1/2 top-4 h-8 w-8 -translate-x-1/2 rounded-full border border-[#f6c453]/30 shadow-[inset_0_0_0_8px_#080809]" />
      <p className="text-[9px] font-black uppercase tracking-[.17em] text-[#f6c453]">PromoKey · PK-084</p>
      <h3 className="mt-4 font-serif text-3xl font-bold leading-[.92]">AFTRHRS<br/>Wing Key</h3>
      <p className="mt-4 text-sm leading-6 text-white/48">Unlocks the complimentary wings Perk at Sea Deck during the Moment window.</p>
      <div className="mt-6 border-t border-white/10 pt-4">
        <p className="text-[9px] font-black uppercase tracking-[.15em] text-white/30">State</p>
        <p className="mt-1 text-sm font-bold text-[#ff9a4d]">{used ? "USED" : presented ? "PRESENTED" : "ACTIVE"}</p>
      </div>
      <div className="absolute bottom-6 right-6"><PromorangSemanticMark kind={used ? "kept" : presented ? "proof" : "move"} size={34} /></div>
    </div>
  );
}

export default function ParticipantCommercialChainReview() {
  const [stage, setStage] = useState<CommercialStage>("held");
  const copy = stageCopy[stage];
  const stageIndex = stageOrder.indexOf(stage);
  const hasKey = stageIndex >= stageOrder.indexOf("held");
  const presented = stageIndex >= stageOrder.indexOf("presented");
  const validated = stageIndex >= stageOrder.indexOf("validated");
  const fulfilled = stageIndex >= stageOrder.indexOf("fulfilled");
  const returned = stage === "returned";

  return (
    <main className="min-h-screen bg-[#080809] text-white">
      <SEO title="AFTRHRS Wing Key — Participant Commercial Chain" description="Illustrative participant commercial-chain convergence review." />
      <ReviewStateSwitcher stage={stage} onChange={setStage} />

      <section className="relative overflow-hidden border-b border-white/10">
        <img src={foodImage} alt="Illustrative wings Perk" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#080809_18%,rgba(8,8,9,.78)_54%,#080809_100%)]" />
        <div className="relative mx-auto grid min-h-[610px] max-w-[1500px] gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:px-10 lg:py-12">
          <div>
            <Link to="/moment/aftrhrs" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/12 bg-black/25 px-4 text-xs font-black backdrop-blur"><ArrowLeft className="h-4 w-4"/>Back to AFTRHRS</Link>
            <p className="mt-10 text-[10px] font-black uppercase tracking-[.18em] text-[#ff9a4d]">{copy.state}</p>
            <h1 className="mt-3 max-w-3xl font-serif text-[3.6rem] font-bold leading-[.88] tracking-[-.055em] sm:text-[4.8rem]">{copy.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/58">{copy.copy}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs font-bold text-white/58">
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[#ff9a4d]"/>Sea Deck · Barbican</span>
              <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#f6c453]"/>Tonight · 10 PM–12 AM</span>
            </div>
            <button type="button" className="mt-7 flex min-h-12 w-full max-w-xl items-center justify-between rounded-full bg-[#f6c453] px-5 text-sm font-black text-black">{copy.cta}<ArrowRight className="h-4 w-4"/></button>
          </div>

          <div className="relative mx-auto flex min-h-[430px] w-full max-w-xl items-center justify-center">
            {!hasKey ? <PerkToken /> : null}
            {hasKey && !validated ? <PromoKeyObject presented={presented} /> : null}
            {validated ? (
              <div className="relative w-full max-w-md pb-8">
                <PaperReceipt
                  className="relative z-20 mx-auto w-[82%] -rotate-1 shadow-[0_28px_80px_rgba(0,0,0,.45)]"
                  heading={fulfilled ? "PERK FULFILLED" : "USE VALIDATED"}
                  lines={[
                    { label: "Perk", value: "Complimentary wings", strong: true },
                    { label: "Place", value: "Sea Deck" },
                    { label: "PromoKey", value: "PK-084" },
                    { label: "Validated", value: "10:51 PM" },
                    ...(fulfilled ? [{ label: "Fulfillment", value: "Provided" }] : []),
                    { label: "Purchase", value: "Not implied" },
                  ]}
                  footer={returned ? "This use remains in your trail and can shape what PROMORANG returns next." : fulfilled ? "The benefit was fulfilled. Any paid purchase remains a separate record." : "This proves the offer use. Purchase and fulfillment remain separate until their own records exist."}
                />
                {returned ? (
                  <div className="absolute bottom-0 left-0 z-10 w-[46%] rotate-[-3deg] rounded-[35%_12%_30%_12%] border border-[#ff6a00]/20 bg-[#17100b] p-4">
                    <PromorangSemanticMark kind="return" size={28}/>
                    <p className="mt-2 text-[9px] font-black uppercase tracking-[.15em] text-[#ff9a4d]">Returned</p>
                    <p className="mt-1 font-serif text-lg font-bold">Late-night return perk</p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1500px] px-5 pb-24 sm:px-8 lg:px-10">
        <section className="py-10">
          <p className="text-[10px] font-black uppercase tracking-[.17em] text-[#ff9a4d]">One chain · different objects</p>
          <h2 className="mt-2 max-w-3xl font-serif text-3xl font-bold lg:text-4xl">Do not collapse the benefit, the rules and the entitlement into one card.</h2>
          <div className="mt-10 grid gap-10 lg:grid-cols-[.6fr_1fr_.7fr] lg:items-center">
            <div className="flex justify-center"><PerkToken dim={stageIndex > 0}/></div>
            <OfferInstrument active={stage === "available" || stage === "held"}/>
            <div className="flex justify-center"><PromoKeyObject used={validated} presented={presented && !validated}/></div>
          </div>
        </section>

        <section className="border-y border-white/10 py-10">
          <p className="text-[10px] font-black uppercase tracking-[.17em] text-[#ff9a4d]">The participant path</p>
          <h2 className="mt-2 font-serif text-3xl font-bold">Useful first. Rules underneath. Proof only when real.</h2>
          <div className="relative mt-8 grid gap-0 lg:grid-cols-6">
            <div className="absolute left-[7%] right-[7%] top-[22px] hidden h-px bg-gradient-to-r from-[#ff6a00]/10 via-[#f6c453]/45 to-[#b58cff]/18 lg:block" />
            {journey.map((step, index) => {
              const reached = index <= stageIndex;
              return (
                <article key={step.label} className={`relative border-l px-5 py-4 transition-opacity lg:border-l-0 lg:px-4 lg:pt-12 ${reached ? "border-white/16 opacity-100" : "border-white/5 opacity-32"}`}>
                  <div className="absolute -left-[17px] top-4 grid h-8 w-8 place-items-center bg-[#080809] lg:left-4 lg:top-2"><PromorangSemanticMark kind={step.kind} size={28}/></div>
                  <p className="text-[9px] font-black tracking-[.15em] text-white/28">0{index + 1}</p>
                  <h3 className="mt-2 text-xs font-black tracking-[.12em] text-[#f6c453]">{step.label}</h3>
                  <p className="mt-2 text-xs leading-5 text-white/42">{step.detail}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-8 py-10 lg:grid-cols-[1fr_.9fr] lg:items-start">
          <div>
            <PromorangSemanticMark kind="proof" size={36}/>
            <p className="mt-4 text-[10px] font-black uppercase tracking-[.17em] text-[#ff9a4d]">What PROMORANG can truthfully say</p>
            <h2 className="mt-2 font-serif text-3xl font-bold">Each boundary proves only itself.</h2>
            <div className="mt-6 space-y-4 text-sm leading-6 text-white/50">
              <p><strong className="text-white/80">Claimed / held:</strong> you have an entitlement.</p>
              <p><strong className="text-white/80">Presented:</strong> the merchant has been asked to validate it.</p>
              <p><strong className="text-white/80">Validated:</strong> this offer use was confirmed at this merchant.</p>
              <p><strong className="text-white/80">Fulfilled:</strong> the benefit itself was delivered.</p>
              <p><strong className="text-white/80">Purchase:</strong> requires its own commerce record. It is never inferred from validation.</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d0d0e] p-6">
            <div className="flex items-center gap-3"><ShoppingBag className="h-5 w-5 text-[#f6c453]"/><div><p className="text-[10px] font-black uppercase tracking-[.17em] text-white/35">Separate commerce lane</p><h3 className="mt-1 font-serif text-2xl font-bold">A purchase may happen. It is not the same event.</h3></div></div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="border border-white/8 p-4"><ReceiptText className="h-4 w-4 text-[#ff9a4d]"/><p className="mt-3 text-xs font-black">VALIDATION RECEIPT</p><p className="mt-2 text-xs leading-5 text-white/42">Proves PromoKey use.</p></div>
              <div className="border border-white/8 p-4"><BadgeCheck className="h-4 w-4 text-emerald-300"/><p className="mt-3 text-xs font-black">COMMERCE RECEIPT</p><p className="mt-2 text-xs leading-5 text-white/42">Only exists if a purchase is actually recorded.</p></div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
