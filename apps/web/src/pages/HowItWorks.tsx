import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Building2,
  CheckCircle2,
  Coins,
  Compass,
  Gem,
  Gift,
  LineChart,
  MapPin,
  Megaphone,
  Package,
  Repeat2,
  Rocket,
  ShoppingBag,
  Sparkles,
  Ticket,
  Trophy,
  Users,
  WalletCards,
} from "lucide-react";
import SEO from "@/components/SEO";
import { GuidanceDisclosure } from "@/components/guidance/GuidanceDisclosure";

type RoleId = "member" | "creator" | "merchant" | "brand" | "promoter";

const valueTypes = [
  { icon: Banknote, label: "Earn", detail: "Cash or disclosed withdrawable value", tone: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20" },
  { icon: Gift, label: "Reward", detail: "Gems, products, offers and coupons", tone: "text-amber-300 bg-amber-400/10 border-amber-400/20" },
  { icon: Ticket, label: "Access", detail: "Tickets, invitations and eligibility", tone: "text-sky-300 bg-sky-400/10 border-sky-400/20" },
  { icon: Trophy, label: "Reputation", detail: "Verified standing that unlocks more", tone: "text-violet-300 bg-violet-400/10 border-violet-400/20" },
  { icon: Gem, label: "Ownership", detail: "Pieces with disclosed rights and sources", tone: "text-orange-300 bg-orange-400/10 border-orange-400/20" },
];

const roles: Array<{
  id: RoleId;
  label: string;
  icon: typeof Users;
  promise: string;
  steps: Array<{ title: string; detail: string; href: string; cta: string }>;
}> = [
  {
    id: "member",
    label: "Member",
    icon: Users,
    promise: "Choose the kind of value you want, make a useful move, prove it, and keep what the action unlocks.",
    steps: [
      { title: "Choose an outcome", detail: "Browse moments, missions, places, products and rewards by what you want back.", href: "/discover", cta: "Open Discover" },
      { title: "Make and prove the move", detail: "Attend, buy, check in, share, create, review or complete the stated action.", href: "/missions", cta: "Browse missions" },
      { title: "Keep the value", detail: "See money, rewards, access, receipts and progression in their proper homes.", href: "/wallet", cta: "Open Wallet" },
      { title: "Unlock the next level", detail: "Use your verified record to qualify for stronger opportunities and benefits.", href: "/rewards", cta: "See rewards" },
    ],
  },
  {
    id: "creator",
    label: "Creator",
    icon: Sparkles,
    promise: "Turn a cultural signal into a Moment people can fund, move, attend, collect and remember.",
    steps: [
      { title: "Publish the signal", detail: "Create the content, Moment or mission people can gather around.", href: "/create/moment", cta: "Create a Moment" },
      { title: "Attach participation", detail: "Give supporters a specific action and a transparent reason to act.", href: "/content-drops", cta: "Open Content Drops" },
      { title: "Activate distribution", detail: "Use attributed sharing and promoters to carry the signal beyond your audience.", href: "/promopush/creator", cta: "Open PromoPush" },
      { title: "Keep the upside", detail: "Track proof, supporters, Pieces, earnings and the reusable audience created.", href: "/portfolio", cta: "View Pieces" },
    ],
  },
  {
    id: "merchant",
    label: "Venue / merchant",
    icon: MapPin,
    promise: "Turn a place, product or service into an experience that drives visits, sales, loyalty and visible local standing.",
    steps: [
      { title: "Create the place", detail: "Establish the venue or merchant identity where products, offers and Moments connect.", href: "/dashboard/venues", cta: "Manage venues" },
      { title: "List useful value", detail: "Add products, services, bookings, offers and reward inventory.", href: "/marketplace", cta: "Open marketplace" },
      { title: "Create a reason to visit", detail: "Run a Moment, event, mission or activation tied to a real commercial outcome.", href: "/create/moment", cta: "Create a Moment" },
      { title: "Measure return", detail: "Connect check-ins, proof, redemptions, purchases and repeat customers.", href: "/dashboard/analytics", cta: "View performance" },
    ],
  },
  {
    id: "brand",
    label: "Brand",
    icon: Building2,
    promise: "Buy a disclosed outcome, choose the right incentive mix and retain proof of what participants actually did.",
    steps: [
      { title: "Name the outcome", detail: "Choose awareness, content, trial, attendance, foot traffic, purchase or retention.", href: "/create/campaign", cta: "Create activation" },
      { title: "Design the return", detail: "Combine cash, Gems, coupons, access, reputation or Pieces appropriately.", href: "/dashboard/campaigns", cta: "Manage campaigns" },
      { title: "Reach qualified people", detail: "Use eligibility and promoter distribution instead of paying for vague impressions.", href: "/promopush", cta: "Open PromoPush" },
      { title: "Read the proof", detail: "Track action quality, attribution, content, commerce and repeatable audience value.", href: "/dashboard/analytics", cta: "View analytics" },
    ],
  },
  {
    id: "promoter",
    label: "Promoter",
    icon: Megaphone,
    promise: "Carry the right opportunity to the right people and build an attributed record of the activity you create.",
    steps: [
      { title: "Choose what deserves movement", detail: "Find campaigns, Moments, products and places with a clear participant return.", href: "/growth", cta: "Open Growth" },
      { title: "Create the tracked path", detail: "Use campaign-specific links and assets, not an unexplained generic invitation.", href: "/promopush/promoter", cta: "Promoter workspace" },
      { title: "Move qualified people", detail: "Match the opportunity to people likely to attend, buy, contribute or complete proof.", href: "/discover", cta: "Browse opportunities" },
      { title: "See attributable return", detail: "Track visits, activations, verified outcomes, revenue and earned commissions.", href: "/wallet", cta: "View earnings" },
    ],
  },
];

const systemLayers = [
  { number: "01", icon: Compass, title: "Discover", question: "What can I do or obtain?", detail: "Moments, missions, venues, merchants, products, services, events, offers and rewards live in one discovery system.", links: [["Browse all", "/discover"], ["Places", "/discover/venues"], ["Shop", "/marketplace"]] },
  { number: "02", icon: BadgeCheck, title: "Participation record", question: "What did I prove—and what did it unlock?", detail: "Check-ins, purchases, submissions and verified actions build eligibility, category standing and trusted history.", links: [["Missions", "/missions"], ["Profile", "/dashboard"]] },
  { number: "03", icon: WalletCards, title: "Value", question: "What do I hold and what can I do with it?", detail: "Money, Gems, rewards, access, receipts and Pieces remain distinct so users never have to guess what a balance means.", links: [["Wallet", "/wallet"], ["Rewards", "/rewards"], ["Vault", "/vault"]] },
  { number: "04", icon: LineChart, title: "Market", question: "What are Pieces and where does demand come from?", detail: "Content, Moment, Host and Venue Pieces stay connected to their source, benefits, risks, holders and funded value.", links: [["Pieces", "/portfolio"], ["Market", "/trading"], ["Liquidity", "/liquidity"]] },
  { number: "05", icon: Rocket, title: "Growth", question: "How do I create and benefit from movement?", detail: "Creators, promoters, brands and merchants publish signals, distribute tracked paths and measure the outcomes they generate.", links: [["Growth Hub", "/growth"], ["PromoShare", "/promoshare"], ["PromoPush", "/promopush"]] },
];

const commerceLoop = [
  { icon: Building2, title: "Place", detail: "A venue or merchant provides the real-world context." },
  { icon: Package, title: "Value", detail: "A product, service, ticket, offer or coupon creates utility." },
  { icon: Megaphone, title: "Move", detail: "A mission or campaign gives people a reason to act." },
  { icon: CheckCircle2, title: "Proof", detail: "Check-in, purchase, content or redemption verifies the outcome." },
  { icon: Repeat2, title: "Return", detail: "The member gains value; the merchant gains attributable growth." },
];

const liquidityTypes = [
  { icon: Compass, title: "Opportunity liquidity", detail: "Enough relevant, achievable opportunities for each audience and location." },
  { icon: ShoppingBag, title: "Commerce liquidity", detail: "Enough useful inventory, offers and redemption capacity to make rewards usable." },
  { icon: Coins, title: "Reward liquidity", detail: "Clear funding and reliable ways to spend, redeem or withdraw each form of value." },
  { icon: LineChart, title: "Market liquidity", detail: "Credible buyers, sellers, volume and pricing for each Piece—not just issued supply." },
  { icon: Megaphone, title: "Growth liquidity", detail: "Qualified promoters and participants available when operators need movement." },
];

export default function HowItWorks() {
  const [activeRole, setActiveRole] = useState<RoleId>("member");
  const selectedRole = roles.find((role) => role.id === activeRole) || roles[0];

  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <SEO
        title="How Promorang Works — Participation, Commerce, Pieces and Growth"
        description="See how Promorang connects Moments, venues, merchants, products, rewards, reputation, Pieces, referrals and verified growth in one participation economy."
      />

      <section className="relative overflow-hidden border-b border-white/10 px-5 pb-16 pt-28 md:pt-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(255,107,0,0.24),transparent_28%),radial-gradient(circle_at_15%_50%,rgba(79,70,229,0.14),transparent_32%),linear-gradient(180deg,#101010_0%,#070707_100%)]" />
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.055)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-primary">The Promorang operating map</p>
            <h1 className="mt-5 max-w-5xl text-5xl font-black uppercase leading-[0.84] tracking-[-0.075em] sm:text-6xl lg:text-[6.6rem]">
              Make a move.<br /><span className="text-primary">Keep the value.</span><br />Grow the network.
            </h1>
            <p className="mt-7 max-w-3xl text-base leading-8 text-white/66 md:text-lg">
              Promorang is a participation exchange. People turn useful action, influence and early support into money, rewards, access, reputation and ownership. Creators, venues, merchants and brands create the opportunities that make those outcomes possible.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/discover" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground transition hover:-translate-y-0.5">Find a move <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/growth" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/[0.04] px-5 py-3 text-sm font-black transition hover:border-primary/60">Create movement <Rocket className="h-4 w-4 text-primary" /></Link>
            </div>
          </div>
          <aside className="rounded-[2rem] border border-white/12 bg-black/55 p-5 shadow-2xl backdrop-blur-xl">
            <GuidanceDisclosure
              id="how-it-works:opportunity-questions"
              eyebrow="Opportunity guide"
              title="Every opportunity must answer"
              summary="Useful opportunities explain action, return, proof, funding, and the next unlock."
              className="mt-0"
            >
              <div className="space-y-2">
                {["What do I do?", "What do I receive?", "What proof is required?", "Who funds or provides the value?", "What does this unlock next?"].map((question, index) => (
                  <div key={question} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.045] p-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-xs font-black text-primary">{index + 1}</span>
                    <span className="text-sm font-bold text-white/78">{question}</span>
                  </div>
                ))}
              </div>
            </GuidanceDisclosure>
          </aside>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Five reasons to participate</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] md:text-5xl">Not every useful action pays cash. Every action should still explain its return.</h2>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {valueTypes.map((item) => (
              <article key={item.label} className={`rounded-2xl border p-5 ${item.tone}`}>
                <item.icon className="h-6 w-6" />
                <h3 className="mt-8 text-xl font-black text-white">{item.label}</h3>
                <p className="mt-2 text-sm leading-6 text-white/55">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div><p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Choose your role</p><h2 className="mt-2 text-4xl font-black tracking-[-0.05em]">See your complete journey.</h2></div>
            <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Promorang roles">
              {roles.map((role) => (
                <button key={role.id} type="button" role="tab" aria-selected={activeRole === role.id} onClick={() => setActiveRole(role.id)} className={`inline-flex min-h-11 whitespace-nowrap items-center gap-2 rounded-xl border px-4 py-2 text-sm font-black transition ${activeRole === role.id ? "border-primary bg-primary text-primary-foreground" : "border-white/10 bg-white/[0.04] text-white/58 hover:border-white/25 hover:text-white"}`}>
                  <role.icon className="h-4 w-4" />{role.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-7 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035]">
            <div className="border-b border-white/10 p-6 md:p-8">
              <p className="max-w-4xl text-xl font-bold leading-8 text-white/78 md:text-2xl">{selectedRole.promise}</p>
            </div>
            <div className="grid lg:grid-cols-4">
              {selectedRole.steps.map((step, index) => (
                <article key={step.title} className="border-b border-white/10 p-6 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
                  <span className="text-xs font-black text-primary">0{index + 1}</span>
                  <h3 className="mt-8 text-2xl font-black">{step.title}</h3>
                  <p className="mt-3 min-h-20 text-sm leading-6 text-white/52">{step.detail}</p>
                  <Link to={step.href} className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary">{step.cta}<ArrowRight className="h-4 w-4" /></Link>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0c0c0c] px-5 py-14">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">One system, five layers</p>
          <h2 className="mt-2 max-w-4xl text-4xl font-black tracking-[-0.05em]">The feature map—and the question each part answers.</h2>
          <div className="mt-8 space-y-3">
            {systemLayers.map((layer) => (
              <article key={layer.number} className="grid gap-5 rounded-2xl border border-white/10 bg-black/35 p-5 md:grid-cols-[70px_220px_1fr_auto] md:items-center">
                <div className="flex items-center gap-3 md:block"><span className="text-xs font-black text-white/28">{layer.number}</span><layer.icon className="mt-0 h-6 w-6 text-primary md:mt-4" /></div>
                <div><h3 className="text-2xl font-black">{layer.title}</h3><p className="mt-1 text-xs font-bold text-primary">{layer.question}</p></div>
                <p className="text-sm leading-6 text-white/54">{layer.detail}</p>
                <div className="flex flex-wrap gap-2 md:max-w-[240px] md:justify-end">
                  {layer.links.map(([label, href]) => <Link key={href} to={href} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-white/68 transition hover:border-primary/50 hover:text-primary">{label}</Link>)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div><p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Experience commerce</p><h2 className="mt-2 text-4xl font-black tracking-[-0.05em]">Places, products and offers are part of participation—not a side shop.</h2><p className="mt-5 text-sm leading-7 text-white/58">A venue can host a Moment, sell a product, issue a coupon, reward proof, build customer reputation and create a Piece-linked community. Every step should remain attributable.</p><div className="mt-6 flex flex-wrap gap-3"><Link to="/discover/venues" className="rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground">Explore places</Link><Link to="/marketplace" className="rounded-xl border border-white/15 px-5 py-3 text-sm font-black">Browse marketplace</Link></div></div>
            <div className="grid gap-3 sm:grid-cols-5">
              {commerceLoop.map((item, index) => (
                <article key={item.title} className="relative rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <item.icon className="h-5 w-5 text-primary" /><p className="mt-8 text-lg font-black">{item.title}</p><p className="mt-2 text-xs leading-5 text-white/48">{item.detail}</p>
                  {index < commerceLoop.length - 1 ? <ArrowRight className="absolute -right-2.5 top-5 z-10 hidden h-5 w-5 rounded-full bg-[#070707] text-primary sm:block" /> : null}
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0c0c0c] px-5 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl"><p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Liquidity, in plain language</p><h2 className="mt-2 text-4xl font-black tracking-[-0.05em]">More users is not the same as more liquidity.</h2><p className="mt-4 text-sm leading-7 text-white/58">Promorang has several kinds of liquidity. Each requires its own supply, demand, funding and health indicators.</p></div>
          <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {liquidityTypes.map((item) => <article key={item.title} className="rounded-2xl border border-white/10 bg-black/35 p-5"><item.icon className="h-6 w-6 text-primary" /><h3 className="mt-8 text-lg font-black">{item.title}</h3><p className="mt-3 text-sm leading-6 text-white/50">{item.detail}</p></article>)}
          </div>
          <Link to="/liquidity" className="mt-6 inline-flex items-center gap-2 text-sm font-black text-primary">Open liquidity dashboard <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <section className="px-5 py-16">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2">
          <article className="rounded-[2rem] border border-primary/25 bg-primary/[0.07] p-7">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Ready to participate</p><h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">Start with the outcome you want.</h2><p className="mt-4 text-sm leading-7 text-white/58">Browse money, rewards, access, reputation and ownership opportunities without needing to understand every Promorang mechanism first.</p><Link to="/discover" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground">Open Discover <ArrowRight className="h-4 w-4" /></Link>
          </article>
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-7">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Ready to create value</p><h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">Launch something people can act on.</h2><p className="mt-4 text-sm leading-7 text-white/58">Create a Moment, campaign, product, offer or distribution path with a clear action, return, proof rule and next unlock.</p><Link to="/growth" className="mt-7 inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-black">Open Growth Hub <ArrowRight className="h-4 w-4" /></Link>
          </article>
        </div>
      </section>
    </main>
  );
}
