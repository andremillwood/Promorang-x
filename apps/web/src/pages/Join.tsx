import { ArrowRight, Building2, CalendarDays, Megaphone, Store, Users, UserRound, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { PromoCardFace, TicketPass } from "@/components/promorang/SignatureObjects";

const paths = [
  {
    eyebrow: "I want to find, ask or join",
    title: "Participate",
    description: "Discover things worth knowing, put something missing into the market, join what other people want, and keep your place on PromoCard.",
    href: "/auth?mode=signup&role=participant&next=/home",
    cta: "Get my PromoCard",
    icon: UserRound,
    stub: "JOIN",
  },
  {
    eyebrow: "I run a place or business",
    title: "Merchant or venue",
    description: "See relevant local demand, publish accurate place information, and respond with supply you can genuinely honor.",
    href: "/for-merchants",
    cta: "See the merchant path",
    icon: Store,
    stub: "SUPPLY",
  },
  {
    eyebrow: "I represent a brand",
    title: "Brand",
    description: "Read the market before spending, decide what outcome matters, respond with something real, and verify what followed.",
    href: "/for-brands",
    cta: "See the brand path",
    icon: Building2,
    stub: "MOVE",
  },
  {
    eyebrow: "I create or influence",
    title: "Creator",
    description: "Help people notice things, make interest legible, and build proof around the actions your audience actually takes.",
    href: "/for-creators",
    cta: "Explore creator tools",
    icon: Megaphone,
    stub: "CREATE",
  },
  {
    eyebrow: "I bring people together",
    title: "Host or organizer",
    description: "Turn recurring interest into real Moments, coordinate participation, and keep attendance separate from intent.",
    href: "/hosting",
    cta: "Explore hosting",
    icon: CalendarDays,
    stub: "HOST",
  },
  {
    eyebrow: "I lead a community",
    title: "Community or Scene lead",
    description: "Give persistent context to shared interests, local rituals, places and people without forcing everything into one event.",
    href: "/for-communities",
    cta: "Explore community tools",
    icon: Users,
    stub: "SCENE",
  },
  {
    eyebrow: "I manage clients",
    title: "Agency",
    description: "Operate across client demand, responses and evidence while preserving the truth and history of each account.",
    href: "/for-agencies",
    cta: "Explore agency tools",
    icon: Briefcase,
    stub: "MANAGE",
  },
  {
    eyebrow: "I represent a larger organization",
    title: "Enterprise",
    description: "Use PROMORANG across teams, locations, communities and programs without losing the object and evidence model underneath.",
    href: "/for-enterprise",
    cta: "Explore enterprise",
    icon: Building2,
    stub: "SCALE",
  },
];

export default function Join() {
  return (
    <main className="marketing-cinematic min-h-screen overflow-x-clip bg-[#070707] text-white">
      <SEO
        title="Build with PROMORANG — Start with the outcome"
        description="Choose what you are trying to make happen with PROMORANG. Start with the job, then enter the same market through the role that fits."
      />

      <section className="relative overflow-hidden border-b border-white/10 px-5 pb-16 pt-28 sm:px-6 md:pb-24 md:pt-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(249,115,22,.18),transparent_38%),radial-gradient(circle_at_85%_55%,rgba(255,255,255,.05),transparent_32%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-300">Build with PROMORANG</p>
            <h1 className="mt-5 max-w-4xl font-serif text-5xl font-bold leading-[.92] tracking-[-0.055em] sm:text-6xl">What are you trying to make happen?</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/65 sm:text-lg">Do not start by learning a platform taxonomy. Start with the job. PROMORANG should route you into the same Discovery → Demand → Response → Proof market through the lens that fits what you are actually trying to do.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/discover" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-black text-black"><UserRound className="h-4 w-4" /> I want to participate</Link>
              <Link to="/how-it-works" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black text-white/80">Show me the loop <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
          <PromoCardFace holder="Your entry point" available="One market" limit="Many roles · one history" places="The role changes what you need to see and do. It should not create a different truth underneath." action="Choose your job" variant="membership" interactive={false} />
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Choose by job</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Different doors. Same market underneath.</h2>
          </div>

          <div className="marketing-role-grid mt-10 grid gap-4 md:grid-cols-2">
            {paths.map((path) => {
              const Icon = path.icon;
              return (
                <Link key={path.title} to={path.href} className="group block">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/40"><Icon className="h-3.5 w-3.5 text-orange-300" /> {path.eyebrow}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-black text-orange-300 transition group-hover:translate-x-1">{path.cta} <ArrowRight className="h-3.5 w-3.5" /></span>
                  </div>
                  <TicketPass kicker={path.eyebrow} title={path.title} detail={path.description} stub={path.stub} stubLabel="Path" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
          <TicketPass kicker="Not sure which role fits?" title="Start as a participant." detail="Explore, react, ask or join first. The quickest way to understand PROMORANG is to experience the market from the human side before choosing an operator path." stub="START" stubLabel="People" />
          <TicketPass kicker="Already have an outcome in mind?" title="Start with the response you need to create." detail="If you need visits, trials, attendance, referrals, repeat behavior or another measurable outcome, choose the operator role closest to the party responsible for supplying it." stub="BUILD" stubLabel="Operator" />
        </div>
      </section>
    </main>
  );
}