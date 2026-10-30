import "@/components/marketing/MarketingStory.css";
import marketingPhoto from "@/assets/hero-moments.jpg";
import { useI18n as useWebI18n } from "@/i18n/I18nContext";
import { ArrowRight, Building2, CheckCircle2, Compass, Network, Sparkles, Store } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

const whatWeDo = [
  {
    icon: Compass,
    title: "Surface demand before the response",
    copy: "PROMORANG gives people a way to express what they want, back existing demand and surface what is still missing. That signal gives merchants, brands, hosts, creators and communities a clearer starting point before they decide what to make, offer or activate.",
  },
  {
    icon: Store,
    title: "Turn interest into real Offers and Moments",
    copy: "Stakeholders can answer demand with things people can actually access: Offers, Moments, reservations, experiences, commerce and other concrete responses. The goal is to move from vague attention to a next step someone can choose and fulfill.",
  },
  {
    icon: Network,
    title: "Connect distribution to participation",
    copy: "Creators, referrals, sharing and community distribution can help the right people discover what is available. PROMORANG keeps the response tied to a real object and a real next move rather than treating reach alone as the outcome.",
  },
  {
    icon: CheckCircle2,
    title: "Keep demand, action and proof distinct",
    copy: "A vote is not a purchase, an RSVP is not attendance, and a claim is not fulfillment. PROMORANG is designed to preserve those distinctions so stakeholders can understand what happened without inflating one signal into another.",
  },
];

const differentiators = [
  {
    title: "Demand is visible before activation",
    copy: "PROMORANG starts with what people are asking for or moving toward, not only with a campaign brief written inside a company. That gives the market a voice before money is committed to a response.",
  },
  {
    title: "PromoCard keeps the participant side continuous",
    copy: "People do not just disappear into campaign analytics. PromoCard keeps what they wanted, what opened for them, what they picked up and what they completed connected to their own experience.",
  },
  {
    title: "One network serves multiple stakeholder roles",
    copy: "Participants, merchants, brands, creators, hosts, agencies, communities and enterprise teams use different workflows but operate around the same underlying market objects. That reduces the usual fragmentation between promotion, fulfillment and proof.",
  },
  {
    title: "Real-world movement is treated as a lifecycle",
    copy: "PROMORANG separates discovery, interest, availability, commitment, participation, verification and retained history. This makes it possible to reason about what changed instead of collapsing the entire journey into impressions or clicks.",
  },
  {
    title: "Commercial scope follows the outcome",
    copy: "PROMORANG does not publish a single universal price or promise a guaranteed business result. Programme scope depends on the audience, geography, duration, participant value, distribution, operating support and evidence required.",
  },
];

const audiences = [
  "People who want a better way to discover, request, access and keep track of things worth doing or buying.",
  "Local merchants and venues deciding what to offer, promote or activate based on real demand.",
  "Brands and marketing teams that want to understand demand, create a response and measure what followed.",
  "Creators and tastemakers who move attention toward real places, products, offers and experiences.",
  "Hosts, event organizers and communities turning interest into Moments people can join.",
  "Agencies and enterprise teams coordinating market responses across clients, teams, partners or locations.",
];

const facts = [
  ["Company Name", "PROMORANG"],
  ["Type", "Market participation and activation platform"],
  ["Founder", "Andre Millwood"],
  ["Headquarters", "Jamaica"],
  ["Website", "https://promorang.co"],
  ["Core Offering", "A network connecting demand, Offers, Moments, participation, proof and PromoCard continuity"],
  ["Pricing", "Outcome- and scope-based; final commercial terms are set in the configured order or agreement"],
  ["Contract Terms", "Not published as a universal standard"],
  ["Services", "Demand discovery, Offers, Moments, distribution, participation workflows, verification, reporting and stakeholder operations"],
  ["Communication", "Web-based product workflows and direct commercial contact"],
  ["Social", "X/Twitter: @promorang · Instagram: @promorang · LinkedIn: /company/promorang"],
];

const faqs = [
  {
    q: "What is PROMORANG?",
    a: "PROMORANG is a market participation and activation platform. It connects what people want with the merchants, brands, creators, hosts and communities that can respond with something real.",
  },
  {
    q: "What is PromoCard?",
    a: "PromoCard is the participant-facing continuity layer. It keeps what someone wants, what becomes available, what they pick up and what they complete connected to their own history.",
  },
  {
    q: "Is PROMORANG an event platform or a rewards app?",
    a: "Those are parts of the network, not the whole product. PROMORANG can support events, Offers, commerce, referrals, creator distribution and rewards when they are part of a real market response.",
  },
  {
    q: "Who can use PROMORANG?",
    a: "PROMORANG supports participants, merchants, venues, brands, creators, hosts, communities, agencies and enterprise teams. Each role gets a different operating path around shared market activity.",
  },
  {
    q: "How does PROMORANG measure results?",
    a: "The platform keeps different stages separate: interest, availability, claim, attendance, purchase, fulfillment and verification are not treated as interchangeable. Reporting depends on the actual records available for the programme.",
  },
  {
    q: "How is PROMORANG priced?",
    a: "Pricing depends on the programme scope rather than a single universal rate. Geography, duration, distribution, participant value, operations and evidence requirements can all change the commercial structure.",
  },
  {
    q: "Where does PROMORANG operate?",
    a: "PROMORANG is based in Jamaica and is being built around real local market participation. The platform architecture is designed to support additional cities, communities and multi-market programmes.",
  },
];

const schema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PROMORANG",
  url: "https://promorang.co",
  founder: {
    "@type": "Person",
    name: "Andre Millwood",
  },
  foundingLocation: {
    "@type": "Country",
    name: "Jamaica",
  },
  sameAs: [
    "https://twitter.com/promorang",
    "https://instagram.com/promorang",
    "https://linkedin.com/company/promorang",
  ],
  description:
    "PROMORANG is a market participation and activation platform connecting demand, Offers, Moments, participation, proof and PromoCard continuity.",
};

export default function AboutPromorang() {
  const { t: webT } = useWebI18n();
  return (
    <main className="marketing-story min-h-screen overflow-x-clip bg-[#070707] text-white">
      <SEO
        title="About PROMORANG — Market participation, activation and PromoCard"
        description="Learn what PROMORANG does, who it serves, how the platform works, the team behind it, key company facts and frequently asked questions."
        schema={schema}
      />

      <section className="marketing-legacy-hero marketing-legacy-hero--panorama relative overflow-hidden border-b border-white/10 px-5 pb-16 pt-28 sm:px-6 md:pb-24 md:pt-36">
        <img className="marketing-legacy-photo" src={marketingPhoto} alt="" loading="eager" />
        <div className="relative mx-auto max-w-6xl">
          <p className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">
            <Sparkles className="h-4 w-4" /> About PROMORANG
          </p>
          <h1 className="mt-6 max-w-5xl font-serif text-5xl font-bold leading-[.91] tracking-[-0.055em] sm:text-6xl lg:text-7xl">{webT("marketing.aboutTitle")}</h1>
          <p className="mt-7 max-w-3xl text-base leading-8 text-white/65 sm:text-lg">{webT("marketing.aboutIntro")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/what-is-promorang" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-black text-black transition hover:bg-orange-400">
              See the product <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/contact" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 text-sm font-black text-white transition hover:bg-white/[0.08]">
              Work with PROMORANG
            </Link>
          </div>
        </div>
      </section>

      <section className="marketing-content-section marketing-content-section--paper border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Make demand legible. Make the response real. Keep the outcome connected.</h2>
          <div className="marketing-explainer-rows">
            {whatWeDo.map(({ icon: Icon, title, copy }) => (
              <article key={title} className="marketing-explainer-row">
                <Icon className="h-5 w-5 text-orange-300" />
                <h3 className="mt-4 font-serif text-2xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/50">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-content-section marketing-content-section--ink border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">The market starts before the campaign brief and continues after the click.</h2>
          <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
            {differentiators.map((item) => (
              <article key={item.title} className="grid gap-4 py-6 ">
                <div>
                  <h3 className="font-serif text-2xl font-bold">{item.title}</h3>
                  <p className="mt-3 max-w-4xl text-sm leading-7 text-white/50">{item.copy}</p>
                </div>
              </article>
            ))}
          </div>

        </div>
      </section>

      <section className="marketing-content-section marketing-content-section--paper border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Different roles. One market.</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {audiences.map((audience) => (
              <li key={audience} className="flex gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.025] p-5 text-sm leading-7 text-white/55">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-orange-300" />
                <span>{audience}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="marketing-content-section marketing-content-section--ink border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Built in Jamaica around a simple market problem.</h2>
          </div>
          <div className="space-y-6 text-sm leading-7 text-white/55">
            <div>
              <h3 className="font-serif text-2xl font-bold text-white">Andre Millwood · Founder & CEO</h3>
              <p className="mt-2">Andre Millwood is the founder of PROMORANG. The platform grew from work across marketing, technology, promotions and real-world customer activation, where the gap between attention and actual movement kept appearing.</p>
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-white">Why PROMORANG exists</h3>
              <p className="mt-2">PROMORANG was built around the idea that markets work better when people can express demand before organizations decide what to push, and when the resulting response can be followed through to real participation and proof.</p>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <a href="https://twitter.com/promorang" target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-4 py-2 text-xs font-black text-white/70">X / Twitter</a>
              <a href="https://instagram.com/promorang" target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-4 py-2 text-xs font-black text-white/70">Instagram</a>
              <a href="https://linkedin.com/company/promorang" target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-4 py-2 text-xs font-black text-white/70">LinkedIn</a>
            </div>
          </div>
        </div>
      </section>



      <section className="marketing-content-section marketing-content-section--paper border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">PROMORANG at a glance.</h2>
          <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-white/10">
            <table className="w-full border-collapse text-left text-sm">
              <tbody>
                {facts.map(([label, value]) => (
                  <tr key={label} className="border-b border-white/10 last:border-b-0">
                    <th scope="row" className="w-[32%] bg-white/[0.025] px-5 py-4 align-top font-black text-white/75">{label}</th>
                    <td className="px-5 py-4 leading-6 text-white/50">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 text-xs leading-6 text-white/35">Where PROMORANG has not publicly established a factual number or term, this table says so explicitly rather than presenting an estimate as company fact.</p>
        </div>
      </section>

      <section className="marketing-content-section marketing-content-section--ink px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">The short answers.</h2>
          <div className="mt-9 divide-y divide-white/10 border-y border-white/10">
            {faqs.map((faq) => (
              <details key={faq.q} className="marketing-story-faq">
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>

          <div className="marketing-about-close">
            <Building2 className="h-6 w-6 text-orange-300" />
            <h2 className="mt-4 max-w-3xl font-serif text-3xl font-bold tracking-[-0.035em]">Want to understand the product, use the network, or scope a programme?</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/what-is-promorang" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-orange-400 px-5 text-xs font-black text-black">{webT("web.whatIs")} <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/business/start" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-xs font-black">Start a business brief</Link>
              <Link to="/contact" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-xs font-black">Contact PROMORANG</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
