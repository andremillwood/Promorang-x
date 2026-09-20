import { ArrowRight, Building2, CreditCard, ShieldCheck, Sparkles, Store } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { PaperReceipt, TicketPass } from "@/components/promorang/SignatureObjects";
import { PROGRAMMES } from "@/lib/business-outcomes";

const paidResponseTypes = [
  { icon: Sparkles, title: "Programme / service scope", payer: "Brand, merchant or operator", copy: "Configuration, operating support, distribution, verification and reporting can be scoped around a real programme. Participant value remains separate unless the agreement explicitly says otherwise." },
  { icon: Store, title: "Operator plan", payer: "Merchant or repeat operator", copy: "Recurring operator capability can be sold as a plan where a configured subscription actually exists. The active order or checkout remains the authority for amount and scope." },
  { icon: CreditCard, title: "Commerce / booking", payer: "Buyer, seller or merchant as disclosed", copy: "A transaction or service fee may apply to a real purchase, booking, ticket or fulfilled offer. The fee must be disclosed in the actual transaction." },
  { icon: Building2, title: "Sponsorship administration", payer: "Sponsor", copy: "Administration can cover eligibility, verification, issuance and reporting around a funded pool. Sponsor funding and PROMORANG revenue stay legible as different money buckets." },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <SEO title="PROMORANG Pricing — Scope the programme around the outcome" description="Start from the outcome, understand the programme scope, and keep PROMORANG fees, participant value and operator proceeds distinct." />

      <section className="border-b border-white/10 px-5 pb-16 pt-24 sm:px-6 md:pb-24 md:pt-32">
        <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[1fr_380px] lg:items-center">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-orange-300">Commercial scope · outcome first</p>
            <h1 className="mt-5 max-w-5xl font-serif text-5xl font-bold leading-[.92] tracking-[-.055em] sm:text-7xl">Start with the outcome. Scope the programme around it.</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/60">PROMORANG pricing depends on what needs to be configured, distributed, operated, verified and reported—not on pretending a fee can guarantee visits, sales or ROI.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/business/start" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-400 px-6 text-sm font-black text-black">Choose my outcome <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/contact" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black">Discuss commercial scope</Link>
            </div>
          </div>
          <PaperReceipt heading="A programme may include" lines={[
            { label: "PROMORANG", value: "software / service fee" },
            { label: "Participant value", value: "reward / perk pool", strong: true },
            { label: "Distribution", value: "creator / media / placement" },
            { label: "Operations", value: "delivery / verification" },
            { label: "Outcome", value: "measured, not guaranteed" },
          ]} footer="The configured order or agreement is the authority for the amount." />
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Programme scopes</p>
          <h2 className="mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-.045em] sm:text-5xl">The recipe explains the work before the price explains the cost.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/50">These programme names describe the commercial job. Final scope changes with geography, duration, audience, participant value, distribution, operating support and evidence requirements.</p>
          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {PROGRAMMES.map((programme) => (
              <article key={programme.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <Sparkles className="h-5 w-5 text-orange-300" />
                <h3 className="mt-4 font-serif text-2xl font-bold">{programme.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/45">{programme.promise}</p>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.12em] text-white/25">Scope after brief</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Keep the money buckets separate</p>
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-.04em]">What PROMORANG earns is not automatically what participants receive or what the operator keeps.</h2>
          <div className="mt-9 grid gap-5 lg:grid-cols-3">
            <TicketPass kicker="PROMORANG revenue" title="Platform / service fee" detail="The disclosed platform, subscription, transaction or service fee actually charged under the order or agreement." stub="FEE" stubLabel="Revenue" />
            <TicketPass kicker="Committed participant value" title="What is reserved for the response" detail="Reward pool, perk, prize, credit or other participant value remains separate from platform revenue unless the governing record says otherwise." stub="POOL" stubLabel="Value" />
            <TicketPass kicker="Operator proceeds" title="What remains with the operator" detail="Merchant, host, creator or seller proceeds depend on the actual transaction, fees, refunds and settlement state." stub="NET" stubLabel="Proceeds" />
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">What PROMORANG may charge around</p>
          <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {paidResponseTypes.map(({ icon: Icon, title, payer, copy }) => (
              <article key={title} className="grid gap-5 py-6 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                <div className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.03]"><Icon className="h-5 w-5 text-orange-300" /></div>
                <div><h3 className="font-serif text-2xl font-bold">{title}</h3><p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">{copy}</p></div>
                <p className="max-w-[190px] text-right text-[10px] font-black uppercase tracking-[0.14em] text-white/30">Paid by<br/><span className="text-white/55">{payer}</span></p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Commercial process</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-.04em]">Brief first. Scope second. Price third. Evidence afterward.</h2>
            <ol className="mt-7 divide-y divide-white/10 border-y border-white/10">
              {[
                "Choose the business outcome and the action that would prove it.",
                "Read the market and select a recommended programme route.",
                "Configure audience, value, distribution, terms and evidence.",
                "Review the actual PROMORANG fee and participant-value commitments.",
                "Launch only after the real response is approved and fundable.",
                "Measure what happened and choose the next move.",
              ].map((step,index) => <li key={step} className="grid grid-cols-[36px_1fr] gap-4 py-5 text-sm leading-6 text-white/60"><span className="font-mono font-black text-orange-300">0{index+1}</span><span>{step}</span></li>)}
            </ol>
          </div>
          <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-6">
            <ShieldCheck className="h-6 w-6 text-orange-300" />
            <h3 className="mt-4 font-serif text-2xl font-bold">Know what each number means</h3>
            <div className="mt-5 space-y-3 text-sm text-white/50">
              <p>Spending money does not create demand.</p>
              <p>A target is not a forecast.</p>
              <p>A claim is not a purchase.</p>
              <p>An RSVP is not attendance.</p>
              <p>Verification must match the action being claimed.</p>
              <p>Results need context before they become ROI.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 border-t border-white/10 pt-10 md:flex-row md:items-center md:justify-between">
          <div><p className="font-serif text-2xl font-bold">Need an actual number?</p><p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">Start the outcome brief so the scope can be tied to a real audience, geography, duration, participant value and evidence requirement.</p></div>
          <div className="flex flex-wrap gap-3"><Link to="/business/start" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-orange-400 px-5 text-xs font-black text-black">Build my brief <ArrowRight className="h-4 w-4" /></Link><Link to="/contact" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-xs font-black">Discuss commercial scope</Link></div>
        </div>
      </section>
    </main>
  );
}
