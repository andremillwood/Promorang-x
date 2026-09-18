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
    eyebrow: "Discover → Want",
    title: "Start with what catches your attention",
    summary: "Browse what is around you, follow what feels relevant, and tell PROMORANG when you are looking for something you cannot find.",
    steps: [
      "Open Discover and look around.",
      "If something matters to you, open it, share it, or keep it on your PromoCard.",
      "If what you want is missing, tell PROMORANG what you are looking for.",
      "If other people want something similar, that shared interest becomes easier to see.",
    ],
    href: "/discover",
    action: "Explore Discoveries",
  },
  {
    id: "demand",
    category: "people",
    eyebrow: "Want → Signal",
    title: "What Demand means",
    summary: "Demand is a way to show what people want. It can help businesses, hosts and creators decide what to respond to—but it is not a reservation, purchase or promise.",
    steps: [
      "Tell PROMORANG what you want, or vote on something already being asked for.",
      "Your answer joins the visible interest around that question.",
      "A strong signal can attract attention from people who may be able to respond.",
      "Something becomes available only when a business, creator, host or community actually puts it up.",
    ],
    href: "/discover/rewards#wanted",
    action: "See what people want",
  },
  {
    id: "promocard",
    category: "people",
    eyebrow: "Keep",
    title: "What PromoCard is for",
    summary: "PromoCard keeps your PROMORANG life in one place: what you are watching, access you have, and the things you have been part of.",
    steps: [
      "Watch a Discovery, something people want, or a Moment you care about.",
      "Come back to your PromoCard instead of losing the thread.",
      "When you receive access or claim an offer, it can live there too.",
      "Your completed and confirmed activity stays separate from things you are only watching.",
    ],
    href: "/card",
    action: "Open PromoCard",
  },
  {
    id: "respond",
    category: "operators",
    eyebrow: "Signal → Response",
    title: "How to respond when people want something",
    summary: "Brands, merchants, hosts, creators and communities can see where interest is forming and decide whether it is worth answering.",
    steps: [
      "Read what people are asking for and where the interest is coming from.",
      "Decide whether it fits your audience, location, capacity or goals.",
      "If it does, put up something useful: an offer, Moment, product, access or content.",
      "Then measure what people actually do instead of assuming interest will convert.",
    ],
    href: "/demand",
    action: "Open Opportunity Inbox",
  },
  {
    id: "moment",
    category: "people",
    eyebrow: "Response → Action",
    title: "What a Moment means",
    summary: "A Moment is something you can actually join: a gathering, experience or other time-bound opportunity.",
    steps: [
      "Open the Moment and see what it is, where it happens and what you need to join.",
      "If you need to sign in, PROMORANG brings you back so you can continue.",
      "RSVP or join when you are ready.",
      "If attendance matters, the Moment will tell you how it is confirmed.",
    ],
    href: "/discover/moments",
    action: "Browse Moments",
  },
  {
    id: "proof",
    category: "proof",
    eyebrow: "Act → Prove",
    title: "Why PROMORANG uses proof",
    summary: "Some actions matter more when they can be confirmed. Proof helps distinguish “I meant to” from “I did.”",
    steps: [
      "Do the action first: attend, redeem, buy, submit or complete the required move.",
      "Provide proof only when the experience asks for it.",
      "While proof is being checked, it stays pending.",
      "Once confirmed, the action can become part of your history, rewards or reputation where applicable.",
    ],
  },
  {
    id: "truth",
    category: "safety",
    eyebrow: "Trust",
    title: "Why PROMORANG sometimes shows less",
    summary: "If nothing is available, we say so. We would rather show an honest empty state than make the market look busier than it is.",
    steps: [
      "A Discovery appears publicly only when it is ready to be shown.",
      "A request only counts when it is successfully saved.",
      "A click on your device is not treated as completed history by itself.",
      "Offers, rewards and outcomes appear when they actually exist.",
    ],
  },
];

const faqs: Faq[] = [
  { category: "people", q: "What is a Discovery?", a: "A Discovery is something worth knowing about: a place, product, person, pattern, idea or opportunity. It helps you notice what is out there; it is not automatically an offer or event." },
  { category: "people", q: "What is Demand?", a: "Demand is visible interest: people asking for, choosing or voting for something. It can help someone decide what to put into market, but it does not guarantee that anything will be created." },
  { category: "people", q: "What is a Scene?", a: "A Scene is an ongoing world around shared culture, places, people and Moments. Joining a Scene keeps you close to it; it does not mean you attended every Moment inside it." },
  { category: "people", q: "What is a Moment?", a: "A Moment is something happening that you can actually join, such as a gathering, experience or activation." },
  { category: "people", q: "What does Watch on PromoCard do?", a: "It keeps something close so you can find it again and see relevant changes. Watching does not reserve a spot or give you access by itself." },
  { category: "people", q: "Does signing in complete the action I started?", a: "No. Signing in brings you back to continue. You still choose whether to RSVP, claim, buy, save or submit proof." },
  { category: "operators", q: "Does PROMORANG guarantee foot traffic or sales?", a: "No. PROMORANG can show where interest is forming and what happened after a response, but a signal is not a promise of customers or revenue." },
  { category: "operators", q: "What should a merchant or brand do with a strong signal?", a: "Look at the size, timing, location and context. If it fits, put up something you can genuinely honor and then see what people do next." },
  { category: "proof", q: "Is an RSVP attendance?", a: "No. RSVP means someone intends to participate. Attendance is confirmed separately when the Moment uses check-in or another proof method." },
  { category: "proof", q: "Is a claim the same as using an offer?", a: "No. Claiming puts the offer in your hands. You still need to follow the terms and redeem it with the merchant or host." },
  { category: "proof", q: "What is kept in Vault?", a: "Vault is where lasting PROMORANG history and value can live after an action: memories, confirmed activity, access or rewards that were actually earned or issued." },
  { category: "safety", q: "Why does PROMORANG sometimes show an empty state?", a: "Because sometimes nothing is there yet. PROMORANG would rather tell you that clearly and give you a next move than fill the screen with made-up activity." },
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
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-primary">Help · start here</p>
          <h1 className="mt-3 max-w-4xl font-serif text-5xl font-bold leading-[.94] tracking-[-.055em] sm:text-7xl">Find your way around PROMORANG.</h1>
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
