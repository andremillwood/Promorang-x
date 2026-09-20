import { Link } from "react-router-dom";
import { ArrowRight, Building2, CreditCard, Receipt, ShieldCheck, Store, Ticket, Users } from "lucide-react";
import SEO from "@/components/SEO";
import { PaperReceipt, TicketPass } from "@/components/promorang/SignatureObjects";

const paidResponseTypes = [
  {
    icon: Ticket,
    title: "Funded response",
    payer: "Brand, agency, host or sponsor",
    copy: "Commercial scope may cover configuring, operating, distributing, verifying and reporting a Moment, offer or other supported response. Any participant reward pool or committed value remains a separate amount from PROMORANG's fee.",
  },
  {
    icon: Store,
    title: "Operator plan",
    payer: "Merchant or repeat operator",
    copy: "Recurring operator capability can be sold as a plan where a configured subscription actually exists. The current order or checkout is the authority for scope and amount.",
  },
  {
    icon: CreditCard,
    title: "Commerce / booking",
    payer: "Buyer, seller or merchant as disclosed",
    copy: "A transaction or service fee may apply to a real purchase, booking, ticket or fulfilled offer. Any fee must be disclosed in the actual checkout or commercial agreement.",
  },
  {
    icon: Building2,
    title: "Sponsorship administration",
    payer: "Sponsor",
    copy: "Administration can cover eligibility, verification, issuance and reporting around a funded pool. Sponsor funding and platform revenue should remain legible as different money buckets.",
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <SEO title="PROMORANG Pricing — Pay for the response, measure the outcome" description="Understand what PROMORANG commercial fees can fund, what committed participant value is separate, and what no price can guarantee." />

      <section className="border-b border-white/10 px-5 pb-16 pt-24 sm:px-6 md:pb-24 md:pt-32">
        <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[1fr_380px] lg:items-center">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-primary">Commercial terms · truth before price</p>
            <h1 className="mt-5 max-w-5xl font-serif text-5xl font-bold leading-[.92] tracking-[-.055em] sm:text-7xl">Pay for a real response. Do not confuse the invoice with the outcome.</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/60">PROMORANG can charge for software, operating work, distribution, verification, commerce or administration. A fee pays for the agreed service; it does not guarantee demand, attendance, sales or ROI.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/join" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-black text-black">Choose your job <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/contact" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black">Discuss commercial scope</Link>
            </div>
          </div>
          <PaperReceipt heading="A price can fund" lines={[
            { label: "Platform", value: "software / workflow" },
            { label: "Operations", value: "configured service" },
            { label: "Distribution", value: "real placement / work" },
            { label: "Verification", value: "confirmation workflow", strong: true },
            { label: "Outcome", value: "not guaranteed" },
          ]} footer="The configured order or checkout is the authority for the amount." />
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-primary">Commercial response types</p>
          <h2 className="mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-.045em] sm:text-5xl">What PROMORANG may legitimately charge around.</h2>
          <div className="mt-9 divide-y divide-white/10 border-y border-white/10">
            {paidResponseTypes.map(({ icon: Icon, title, payer, copy }) => (
              <article key={title} className="grid gap-5 py-6 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                <div className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.03]"><Icon className="h-5 w-5 text-primary" /></div>
                <div>
                  <h3 className="font-serif text-2xl font-bold">{title}</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">{copy}</p>
                </div>
                <p className="max-w-[190px] text-right text-[10px] font-black uppercase tracking-[0.14em] text-white/30">Paid by<br/><span className="text-white/55">{payer}</span></p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-primary">Keep the money buckets separate</p>
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-.04em]">Revenue is not the same thing as committed participant value.</h2>
          <div className="mt-9 grid gap-5 lg:grid-cols-3">
            <TicketPass kicker="PROMORANG revenue" title="What the platform earns" detail="The disclosed platform, subscription, transaction or service fee actually charged under the order or checkout." stub="FEE" stubLabel="Revenue" />
            <TicketPass kicker="Committed value" title="What is reserved for a published response" detail="Reward pool, participant payout, prize, credit or other value remains separate from platform revenue unless the governing record says otherwise." stub="POOL" stubLabel="Value" />
            <TicketPass kicker="Operator proceeds" title="What remains with the operator" detail="Merchant, host, creator or seller proceeds are distinct again and depend on the actual transaction, fees, refunds and settlement state." stub="NET" stubLabel="Proceeds" />
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-primary">What the commercial process should do</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-.04em]">Scope first. Price second. Evidence afterward.</h2>
            <ol className="mt-7 divide-y divide-white/10 border-y border-white/10">
              {[
                "Choose the job and role you are trying to accomplish.",
                "Look at what people are asking for and what is already happening in the market.",
                "Shape the offer, Moment, service or activation and define what it will take to deliver.",
                "Review the actual fee and committed-value buckets before funding or approval.",
                "Run it, then measure what people actually did afterward.",
              ].map((step, index) => <li key={step} className="grid grid-cols-[36px_1fr] gap-4 py-5 text-sm leading-6 text-white/60"><span className="font-mono font-black text-primary">0{index + 1}</span><span>{step}</span></li>)}
            </ol>
          </div>
          <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-6">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h3 className="mt-4 font-serif text-2xl font-bold">Know what each number means</h3>
            <div className="mt-5 space-y-3 text-sm text-white/50">
              <p>Spending money does not create demand.</p>
              <p>Interest does not mean something is available.</p>
              <p>Putting something up does not mean someone bought it.</p>
              <p>An RSVP is not the same as attendance.</p>
              <p>Results need context before they become ROI.</p>
              <p>A queued payout is not the same as a completed payout.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 border-t border-white/10 pt-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-serif text-2xl font-bold">Need an actual number?</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">Use the configured commercial order, membership checkout or transaction checkout for the current amount. This page intentionally avoids turning stale marketing bands into contractual pricing.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/contact" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-xs font-black text-black">Request commercial scope <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/how-it-works" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-xs font-black">See the market loop</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
