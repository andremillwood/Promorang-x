import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Building2, Compass, CreditCard, FileCheck2, Search, ShieldCheck, Sparkles, Users } from "lucide-react";
import SEO from "@/components/SEO";

type HelpCategory = "all" | "people" | "operators" | "proof" | "safety";

type Guide = {
  id: string;
  category: Exclude<HelpCategory, "all">;
  eyebrow: string;
  title: string;
  summary: string;
  steps: string[];
  href?: string;
  action?: string;
};

type Faq = {
  category: Exclude<HelpCategory, "all">;
  q: string;
  a: string;
};

const guides: Guide[] = [
  {
    id: "discover-want",
    category: "people",
    eyebrow: "Discovery → Want",
    title: "Start even when you do not know what you want",
    summary: "Browse approved Discoveries, notice what matters to you, then express or join demand only when there is something you actually care about.",
    steps: [
      "Open Discover to browse approved things worth knowing about.",
      "If something is relevant, open it, share it, or watch it on your PromoCard.",
      "If what you need is not there, tell PROMORANG what you are looking for.",
      "PROMORANG should check related Discoveries and recorded Demand before adding another ask.",
    ],
    href: "/discover",
    action: "Explore Discoveries",
  },
  {
    id: "demand",
    category: "people",
    eyebrow: "Want → Signal",
    title: "What recorded Demand actually means",
    summary: "A Demand question records interest, preference or an ask. It does not create inventory, attendance, a deal or a purchase.",
    steps: [
      "An ask may stay as an unresolved intent until it matches a live question.",
      "Votes are recorded answers to a Demand question.",
      "A threshold means the configured signal target was met; it does not automatically unlock supply.",
      "A business, creator, host or community still has to create a separate response object.",
    ],
    href: "/discover/rewards#wanted",
    action: "See recorded Demand",
  },
  {
    id: "promocard",
    category: "people",
    eyebrow: "Keep",
    title: "What PromoCard is for",
    summary: "PromoCard is your continuity surface: what you are watching, what access has actually been issued, and what source-backed history stayed with you.",
    steps: [
      "Watch a Discovery, Demand question, Moment or eligible market object.",
      "Watched objects are relationships, not entitlements.",
      "Actual issued offers or access can appear separately when the source record exists.",
      "Verified or redeemed history stays distinct from things you merely watched or wanted.",
    ],
    href: "/card",
    action: "Open PromoCard",
  },
  {
    id: "respond",
    category: "operators",
    eyebrow: "Signal → Response",
    title: "How operators respond to demand",
    summary: "Brands, merchants, hosts, creators and communities can inspect recorded demand and decide whether to answer it with something real.",
    steps: [
      "Read the underlying question, vote count, unmatched asks and market context.",
      "Decide whether the signal is relevant to your role or inventory.",
      "Create a distinct response: a Moment, offer, inventory, content or approved Discovery as appropriate.",
      "Do not treat the demand threshold as proof that the response will convert.",
    ],
    href: "/demand",
    action: "Open Opportunity Inbox",
  },
  {
    id: "moment",
    category: "people",
    eyebrow: "Response → Action",
    title: "What a Moment means",
    summary: "A Moment is an actual actionable record. Opening or RSVPing to one is still not the same as verified attendance.",
    steps: [
      "Open the Moment and review the real access requirements.",
      "If authentication interrupts the action, PROMORANG returns you to the same object.",
      "RSVP or join creates participation intent only when the authoritative write succeeds.",
      "Attendance is only advanced by the required proof/check-in path.",
    ],
    href: "/discover/moments",
    action: "Browse Moments",
  },
  {
    id: "proof",
    category: "proof",
    eyebrow: "Act → Prove",
    title: "Why proof is a separate state",
    summary: "PROMORANG separates a claim from verification so a submission cannot silently become attendance, purchase, value or payout.",
    steps: [
      "Complete the action first: attend, redeem, submit evidence or perform the required move.",
      "Submit the required proof through the canonical flow.",
      "Pending proof remains pending; it is not attendance or verified value.",
      "Approval is the transition that can create downstream retained consequences such as memory, issued value or eligible attribution.",
    ],
  },
  {
    id: "truth",
    category: "safety",
    eyebrow: "Trust",
    title: "How PROMORANG handles empty or uncertain states",
    summary: "The product is designed to leave a stage empty rather than invent activity, rewards, supply or outcomes.",
    steps: [
      "Pending proposal does not appear as approved Discovery.",
      "Failed demand writes are not displayed as public recorded demand.",
      "A local browser state is not presented as durable history.",
      "A response, payout, settlement or reward is only shown when the corresponding source record exists.",
    ],
  },
];

const faqs: Faq[] = [
  { category: "people", q: "What is a Discovery?", a: "Approved public knowledge about a place, thing, pattern or opportunity PROMORANG is willing to publish. Discovery tells you what exists or what is worth knowing; it is not automatically an offer or transaction." },
  { category: "people", q: "What is Demand?", a: "Recorded market interest: a question, vote or aggregated ask. Demand can help an operator decide whether to respond, but demand is not supply, attendance or a purchase." },
  { category: "people", q: "What is a Scene?", a: "Persistent cultural or market context where related people, Discoveries and Moments can belong. Scene membership is not attendance at any specific Moment." },
  { category: "people", q: "What is a Moment?", a: "A separate actionable record such as a gathering or experience. A Moment may be created in response to demand, but it does not exist merely because a threshold was reached." },
  { category: "people", q: "What does Watch on PromoCard do?", a: "It saves your relationship to that market object so you can find it again and PROMORANG can build a legitimate return experience around it. Watching does not issue access or reserve inventory." },
  { category: "people", q: "Does signing in complete the action I started?", a: "No. Authentication preserves your object and action intent, then returns you to continue. RSVP, claim, purchase, save and proof still require the real authoritative action afterward." },
  { category: "operators", q: "Does PROMORANG guarantee foot traffic or sales?", a: "No. PROMORANG can expose recorded demand, responses and verified outcomes where records exist. It does not turn interest or thresholds into guaranteed commercial performance." },
  { category: "operators", q: "What should a merchant or brand do with a strong signal?", a: "Treat it as evidence worth evaluating. Review volume, recency and context, then decide whether to put a separate offer, Moment or other response into market. Measure what happens afterward instead of assuming conversion." },
  { category: "proof", q: "Is an RSVP attendance?", a: "No. RSVP or join records intent to participate. Attendance requires the configured proof/check-in state to be verified." },
  { category: "proof", q: "Is a claim the same as receiving value?", a: "No. Claim, eligibility, issuance, redemption and fulfillment are separate states. The product should only show each when the underlying record supports it." },
  { category: "proof", q: "What is kept in Vault?", a: "Source-backed retained history and issued objects that legitimately persisted after an action. Vault should not treat a local click, unverified claim or illustrative score as financial value." },
  { category: "safety", q: "Why does PROMORANG sometimes show an empty state?", a: "Because absence is meaningful. If there is no approved Discovery, recorded Demand, response or verified outcome, the product should say so rather than manufacture network activity." },
];

const categories: Array<{ id: HelpCategory; label: string; icon: typeof Users }> = [
  { id: "all", label: "All", icon: BookOpen },
  { id: "people", label: "People", icon: Users },
  { id: "operators", label: "Operators", icon: Building2 },
  { id: "proof", label: "Proof", icon: FileCheck2 },
  { id: "safety", label: "Trust", icon: ShieldCheck },
];

export default function HelpCenter() {
  const [category, setCategory] = useState<HelpCategory>("all");
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const normalized = search.trim().toLowerCase();
  const visibleGuides = useMemo(() => guides.filter((guide) => {
    if (category !== "all" && guide.category !== category) return false;
    if (!normalized) return true;
    return [guide.eyebrow, guide.title, guide.summary, ...guide.steps].join(" ").toLowerCase().includes(normalized);
  }), [category, normalized]);
  const visibleFaqs = useMemo(() => faqs.filter((faq) => {
    if (category !== "all" && faq.category !== category) return false;
    if (!normalized) return true;
    return `${faq.q} ${faq.a}`.toLowerCase().includes(normalized);
  }), [category, normalized]);

  return (
    <main className="min-h-screen bg-[#070707] px-5 pb-24 pt-24 text-white sm:px-6">
      <SEO title="PROMORANG Help" description="Plain-English guidance for Discovery, Demand, PromoCard, Moments, proof and operator responses." />
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-white/10 pb-10">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-primary">Help · one object system</p>
          <h1 className="mt-3 max-w-4xl font-serif text-5xl font-bold leading-[.94] tracking-[-.055em] sm:text-7xl">Understand what is true, what is wanted, and what actually happened.</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">PROMORANG keeps Discovery, Demand, responses, proof and retained history separate so the product can be useful without overstating what the market has done.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/what-is-promorang" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-xs font-black text-black">What is PROMORANG? <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/how-it-works" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-xs font-black text-white">See the full journey</Link>
          </div>
        </header>

        <section className="grid gap-4 border-b border-white/10 py-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="flex min-h-12 items-center gap-3 rounded-full border border-white/12 bg-white/[0.04] px-5">
            <Search className="h-4 w-4 text-primary" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Discovery, PromoCard, proof, demand…" className="w-full bg-transparent text-sm outline-none placeholder:text-white/25" />
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => {
              const Icon = item.icon;
              return <button key={item.id} type="button" onClick={() => setCategory(item.id)} className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-xs font-bold ${category === item.id ? "border-primary/40 bg-primary/10 text-primary" : "border-white/10 text-white/55"}`}><Icon className="h-3.5 w-3.5" />{item.label}</button>;
            })}
          </div>
        </section>

        <section className="py-12">
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div><p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-primary">Guides</p><h2 className="mt-2 font-serif text-4xl font-bold tracking-[-.04em]">The market journey.</h2></div>
            <Compass className="h-7 w-7 text-white/20" />
          </div>
          {visibleGuides.length ? <div className="grid gap-4 lg:grid-cols-2">{visibleGuides.map((guide) => (
            <article key={guide.id} className="rounded-[1.7rem] border border-white/10 bg-white/[0.025] p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">{guide.eyebrow}</p>
              <h3 className="mt-3 font-serif text-3xl font-bold tracking-[-.03em]">{guide.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/50">{guide.summary}</p>
              <ol className="mt-5 space-y-3">{guide.steps.map((step, index) => <li key={step} className="grid grid-cols-[28px_1fr] gap-3 text-sm leading-6 text-white/65"><span className="grid h-7 w-7 place-items-center rounded-full border border-white/10 font-mono text-[10px] text-primary">{index + 1}</span><span>{step}</span></li>)}</ol>
              {guide.href ? <Link to={guide.href} className="mt-6 inline-flex items-center gap-2 text-sm font-black text-primary">{guide.action || "Open"} <ArrowRight className="h-4 w-4" /></Link> : null}
            </article>
          ))}</div> : <p className="text-sm text-white/40">No guides match that search.</p>}
        </section>

        <section className="border-t border-white/10 py-12">
          <div className="mb-6"><p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-primary">FAQ</p><h2 className="mt-2 font-serif text-4xl font-bold tracking-[-.04em]">Keep the states separate.</h2></div>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {visibleFaqs.map((faq) => {
              const open = openFaq === faq.q;
              return <article key={faq.q}><button type="button" onClick={() => setOpenFaq(open ? null : faq.q)} className="flex w-full items-center justify-between gap-4 py-5 text-left"><span className="font-serif text-xl font-bold">{faq.q}</span><span className="text-xl text-primary">{open ? "−" : "+"}</span></button>{open ? <p className="max-w-3xl pb-6 text-sm leading-7 text-white/55">{faq.a}</p> : null}</article>;
            })}
          </div>
        </section>

        <section className="grid gap-4 border-t border-white/10 pt-10 sm:grid-cols-3">
          <Link to="/discover" className="rounded-[1.5rem] border border-white/10 p-5"><Compass className="h-5 w-5 text-primary" /><p className="mt-4 font-serif text-2xl font-bold">Discover</p><p className="mt-2 text-xs leading-5 text-white/45">Start with approved knowledge.</p></Link>
          <Link to="/card" className="rounded-[1.5rem] border border-white/10 p-5"><CreditCard className="h-5 w-5 text-primary" /><p className="mt-4 font-serif text-2xl font-bold">PromoCard</p><p className="mt-2 text-xs leading-5 text-white/45">Keep legitimate relationships and issued access.</p></Link>
          <Link to="/for-brands" className="rounded-[1.5rem] border border-white/10 p-5"><Sparkles className="h-5 w-5 text-primary" /><p className="mt-4 font-serif text-2xl font-bold">Respond</p><p className="mt-2 text-xs leading-5 text-white/45">See how operators turn signal into a separate response.</p></Link>
        </section>
      </div>
    </main>
  );
}
