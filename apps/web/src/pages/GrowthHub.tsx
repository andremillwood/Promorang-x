import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Coins, Gem, HandHeart, Megaphone, Radio, Rocket, Share2, Sparkles, Target, TrendingUp, Trophy } from "lucide-react";
import SEO from "@/components/SEO";
import { cultureCreators, cultureEvents } from "@/data/culture-demo";

const growthTiles = [
  { title: "Content", text: "Publish drops, recap moments, and turn attention into movement.", href: "/growth/content", icon: Radio },
  { title: "Promoshare", text: "Activate value where content, moments, and referrals create outcomes.", href: "/growth/promoshare", icon: Sparkles },
  { title: "Campaigns", text: "Compile creator, brand, and scene campaigns without losing proof.", href: "/growth/campaigns", icon: Megaphone },
  { title: "Referrals", text: "Track links, ambassadors, and promoter attribution.", href: "/growth/referrals", icon: Share2 },
  { title: "Pioneer Points", text: "See the verified record you build as a member, creator, host, venue, or connector.", href: "/growth/pioneer", icon: Trophy },
  { title: "Pieces", text: "Keep value objects contextual around culture and ownership.", href: "/growth/pieces", icon: Trophy },
  { title: "Analytics", text: "See reach, check-ins, proof quality, and conversion signals.", href: "/growth/analytics", icon: BarChart3 },
  { title: "Earnings", text: "Track payouts, value pools, withdrawals, and reward outcomes.", href: "/growth/earnings", icon: Coins },
  { title: "Membership", text: "See disclosed Gem allowances and pool-backed membership benefits.", href: "/wallet", icon: Gem },
  { title: "Resilience", text: "Request reviewed creator assistance from a funded reserve—not an insurance promise.", href: "/support", icon: HandHeart },
  { title: "Kickstart", text: "Back milestone-based projects through escrow, proof, release, and refund rules.", href: "/growth/kickstart", icon: Rocket },
];

const routeFallbacks: Record<string, string> = {
  "/growth/content": "/content-drops",
  "/growth/promoshare": "/promoshare",
  "/growth/campaigns": "/promopush",
  "/growth/referrals": "/promopush/promoter",
  "/growth/pieces": "/portfolio",
  "/growth/analytics": "/dashboard/analytics",
  "/growth/earnings": "/wallet",
  "/growth/pioneer": "/growth/pioneer",
  "/growth/kickstart": "/marketplace",
};

export default function GrowthHub() {
  return (
    <main className="min-h-screen bg-black pb-16 text-white">
      <SEO
        title="Growth Hub - Promorang"
        description="Creator, promoter, and ambassador workspace for content, Promoshare, referrals, Pieces, analytics, and earnings."
      />
      <section className="relative min-h-[560px] overflow-hidden border-b border-white/10 pt-24">
        <img src={cultureEvents[0].image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
        <div className="container relative grid min-h-[464px] gap-8 px-6 pb-12 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Growth layer</p>
            <h1 className="mt-4 max-w-5xl font-sans text-5xl font-black uppercase leading-[0.84] tracking-[-0.075em] md:text-8xl">
              Turn attention<br /><span className="text-primary">into movement.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/65">
              Publish the signal, move it through the right people, prove what happened, and keep the audience, status, and earnings your work creates.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/content-drops" className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground">Launch content <ArrowRight className="ml-2 h-4 w-4" /></Link>
              <Link to="/promoshare" className="inline-flex items-center rounded-xl border border-white/20 bg-black/30 px-5 py-3 text-sm font-black">Open PromoShare</Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/15 bg-black/55 p-5 backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Built for cultural operators</p>
            <div className="mt-4 flex items-center gap-4">
              <img src={cultureCreators[0].avatar} alt="" className="h-16 w-16 rounded-full object-cover" />
              <div>
                <p className="text-xl font-black">Your signal. Carried further.</p>
                <p className="text-sm text-white/55">For creators, promoters, and ambassadors</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[["Reach", "Connect"], ["Proof", "Build"], ["Earn", "Activate"]].map(([label, value]) => <div key={label} className="rounded-xl bg-white/[0.06] p-3"><p className="text-sm font-black">{value}</p><p className="text-[9px] uppercase text-white/35">{label}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="container px-6 py-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Priority queue</p><h2 className="mt-1 text-3xl font-black">What needs movement</h2></div>
          <Link to="/dashboard/analytics" className="text-sm font-bold text-primary">View analytics</Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            { title: "Publish your next signal", text: "Start with a creator drop, recap, or campaign asset people can actually move.", href: "/content-drops", icon: Radio, cta: "Open Content Drops" },
            { title: "Activate attributed sharing", text: "Give promoters and supporters a trackable path into the outcome.", href: "/promoshare", icon: Share2, cta: "Open PromoShare" },
            { title: "Complete the proof loop", text: "Connect attention to a moment, check-in, referral, sale, or verified action.", href: "/missions", icon: Target, cta: "Browse Missions" },
          ].map((item) => (
            <Link key={item.title} to={item.href} className="group rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition hover:border-primary/50">
              <item.icon className="h-6 w-6 text-primary" /><h3 className="mt-8 text-2xl font-black">{item.title}</h3><p className="mt-3 text-sm leading-6 text-white/52">{item.text}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary">{item.cta}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container px-6 pb-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Growth engines</p><h2 className="mt-1 text-3xl font-black">Build the loop</h2></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {growthTiles.map((tile) => (
            <Link key={tile.title} to={routeFallbacks[tile.href] || tile.href} className="group rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition hover:border-primary/50">
              <tile.icon className="mb-5 h-7 w-7 text-primary" />
              <h2 className="text-2xl font-black">{tile.title}</h2>
              <p className="mt-3 min-h-16 text-sm leading-6 text-white/58">{tile.text}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-primary">
                Open
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container px-6 pb-10">
        <div className="mb-5">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">How Growth Hub value works</p>
          <h2 className="mt-1 text-3xl font-black">Funded, disclosed, and earned.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/58">Promorang separates membership benefits, variable rewards, assistance, and project backing so no one has to guess what is guaranteed.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          {[
            { icon: Gem, title: "Membership allowance", label: "Defined benefit", text: "Plus, Pro, and Elite payments may issue 5, 15, or 30 Gems per paid period. This is a membership benefit, not investment yield." },
            { icon: Trophy, title: "Funded reward programs", label: "Reserve-backed", text: "Any commitment reward must disclose its reserve, rate, lock period, maximum commitment, and available capacity before entry." },
            { icon: HandHeart, title: "Creator Resilience", label: "Reviewed assistance", text: "Creators submit evidence to a funded assistance reserve. Approval is discretionary and capped; this is not insurance coverage." },
            { icon: Rocket, title: "Kickstart escrow", label: "Milestone release", text: "Pledges stay in escrow. Project owners receive funds only after milestone proof is approved; cancellation opens a refund path." },
          ].map((item) => (
            <article key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
              <div className="flex items-center justify-between gap-3"><item.icon className="h-6 w-6 text-primary" /><span className="rounded-full bg-primary/10 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-primary">{item.label}</span></div>
              <h3 className="mt-8 text-xl font-black">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/55">{item.text}</p>
            </article>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm leading-6 text-amber-100/75">
          Holding Gems alone does not earn a return. PromoShare prizes are variable. Piece revenue and funded commitment programs only distribute value when their disclosed source has actually been funded.
        </div>
      </section>

      <section className="container px-6 pb-12">
        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
          <div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /><p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Opportunities in motion</p></div>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">Attach growth to something real.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">Start from a moment people can attend, content they can move, or a scene they already care about. Growth tools become useful when the outcome is visible.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {cultureEvents.slice(0, 3).map((event) => (
              <Link key={event.slug} to={`/events/${event.slug}`} className="rounded-2xl border border-white/10 bg-black/35 p-3">
                <img src={event.image} alt="" className="h-28 w-full rounded-xl object-cover" />
                <p className="mt-3 font-black">{event.shortTitle}</p>
                <p className="text-xs text-primary">{event.proof}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
