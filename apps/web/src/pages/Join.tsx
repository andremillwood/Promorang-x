import { useState } from "react";
import { ArrowRight, Building2, CalendarDays, Megaphone, Store, Users, UserRound, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { CurrentArc } from "@/components/marketing/MarketingPhysics";
import heroMoments from "@/assets/hero-moments.jpg";
import participantImage from "@/assets/moments/sunset-photo.jpg";
import merchantImage from "@/assets/moments/coffee-code.jpg";
import brandImage from "@/assets/moments/street-art.jpg";
import creatorImage from "@/assets/moments/open-mic.jpg";
import hostImage from "@/assets/moment-concert.jpg";
import communityImage from "@/assets/moments/board-games.jpg";
import agencyImage from "@/assets/moments/pottery.jpg";
import enterpriseImage from "@/assets/moments/hiking.jpg";

const paths = [
  {
    eyebrow: "I want to find, ask or join",
    title: "Participant",
    description: "Discover things worth knowing, tell PROMORANG what you are looking for, join what other people want, and keep your place on PromoCard.",
    href: "/auth?mode=signup&role=participant&next=/home",
    cta: "Get my PromoCard",
    icon: UserRound,
    image: participantImage,
    proof: "Discovery → Want → PromoCard",
  },
  {
    eyebrow: "I run a place or business",
    title: "Merchant",
    description: "See relevant local demand, publish accurate place information, and respond with supply you can genuinely honor.",
    href: "/for-merchants",
    cta: "See the merchant path",
    icon: Store,
    image: merchantImage,
    proof: "Demand → Response → Visit",
  },
  {
    eyebrow: "I represent a brand",
    title: "Brand",
    description: "Read the market before spending, decide what outcome matters, respond with something real, and verify what followed.",
    href: "/for-brands",
    cta: "See the brand path",
    icon: Building2,
    image: brandImage,
    proof: "Signal → Activation → Evidence",
  },
  {
    eyebrow: "I create or influence",
    title: "Creator",
    description: "Help people notice things, make interest legible, and build proof around the actions your audience actually takes.",
    href: "/for-creators",
    cta: "Explore creator tools",
    icon: Megaphone,
    image: creatorImage,
    proof: "Attention → Action → Proof",
  },
  {
    eyebrow: "I bring people together",
    title: "Host",
    description: "Turn recurring interest into real Moments, coordinate participation, and keep attendance separate from intent.",
    href: "/hosting",
    cta: "Explore hosting",
    icon: CalendarDays,
    image: hostImage,
    proof: "Interest → Moment → Attendance",
  },
  {
    eyebrow: "I lead a community",
    title: "Community",
    description: "Give persistent context to shared interests, local rituals, places and people without forcing everything into one event.",
    href: "/for-communities",
    cta: "Explore community tools",
    icon: Users,
    image: communityImage,
    proof: "Scene → Continuity → Return",
  },
  {
    eyebrow: "I manage clients",
    title: "Agency",
    description: "Operate across client demand, responses and evidence while preserving the truth and history of each account.",
    href: "/for-agencies",
    cta: "Explore agency tools",
    icon: Briefcase,
    image: agencyImage,
    proof: "Client → Response → Evidence",
  },
  {
    eyebrow: "I represent a larger organization",
    title: "Enterprise",
    description: "Use PROMORANG across teams, locations, communities and programs without losing the object and evidence model underneath.",
    href: "/for-enterprise",
    cta: "Explore enterprise",
    icon: Building2,
    image: enterpriseImage,
    proof: "Market → Teams → Governance",
  },
];

export default function Join() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = paths[selectedIndex];
  const SelectedIcon = selected.icon;

  return (
    <main className="marketing-cinematic min-h-screen overflow-x-clip bg-[#050505] text-white">
      <SEO
        title="Build with PROMORANG — Choose how you enter the market"
        description="Choose what you are trying to make happen with PROMORANG. Different roles enter the same Discovery, Demand, Response and Proof market through different lenses."
      />

      <section className="marketing-join-hero relative overflow-hidden border-b border-white/10 px-5 pb-16 pt-16 sm:px-6 md:pb-20 md:pt-24">
        <CurrentArc variant="hero" className="marketing-hero-current" />
        <img src={heroMoments} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/50" />
        <div className="relative mx-auto max-w-[1440px]">
          <p className="marketing-kicker">Build with PROMORANG</p>
          <h1 className="mt-5 max-w-[11ch] text-5xl font-black sm:text-6xl lg:text-7xl">What are you trying to make happen?</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
            Start with the job, not the platform taxonomy. Every role enters the same market; the lens changes what you need to see, decide and prove.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/discover" className="inline-flex min-h-12 items-center gap-2 rounded-md bg-orange-500 px-5 text-xs font-black uppercase tracking-[0.08em] text-black">
              <UserRound className="h-4 w-4" /> Start as a participant
            </Link>
            <Link to="/how-it-works" className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/20 bg-black/40 px-5 text-xs font-black uppercase tracking-[0.08em] text-white">
              See the loop <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">Role imagery is editorial atmosphere · role capabilities are described below</p>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="marketing-section-head">
            <div>
              <p className="marketing-kicker">Choose your lens</p>
              <h2 className="mt-3 text-4xl font-black sm:text-5xl">Who are you here as?</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">Different doors. Same market underneath. Choose the role closest to the job you are responsible for.</p>
            </div>
          </div>

          <div className="marketing-role-rail" role="tablist" aria-label="PROMORANG role lenses">
            {paths.map((path, index) => {
              const Icon = path.icon;
              const active = index === selectedIndex;
              return (
                <button
                  key={path.title}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedIndex(index)}
                  className={`marketing-role-card group ${active ? "is-active" : ""}`}
                >
                  <img src={path.image} alt="" aria-hidden="true" />
                  <span className="marketing-role-card__veil" />
                  <span className="marketing-role-card__copy">
                    <span className="marketing-role-card__icon"><Icon className="h-4 w-4" /></span>
                    <strong>{path.title}</strong>
                    <small>{path.eyebrow}</small>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="marketing-role-detail mt-8" role="tabpanel">
            <div>
              <p className="marketing-kicker"><SelectedIcon className="h-3.5 w-3.5" /> {selected.eyebrow}</p>
              <h3 className="mt-4 text-3xl font-black sm:text-4xl">{selected.title}</h3>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">{selected.description}</p>
            </div>
            <div className="marketing-role-detail__route">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">Role truth path</p>
              <p className="mt-2 text-lg font-black text-white">{selected.proof}</p>
              <Link to={selected.href} className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-md bg-orange-500 px-5 text-xs font-black uppercase tracking-[0.08em] text-black">
                {selected.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-6 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 border-y border-white/10 py-10 md:grid-cols-2">
          <div>
            <p className="marketing-kicker">Not sure?</p>
            <h2 className="mt-3 text-3xl font-black">Start from the human side.</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/55">Explore, react, ask or join first. The quickest way to understand PROMORANG is to experience the market before operating one side of it.</p>
            <Link to="/discover" className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-orange-300">Explore PROMORANG <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div>
            <p className="marketing-kicker">Already responsible for an outcome?</p>
            <h2 className="mt-3 text-3xl font-black">Choose the party that can actually respond.</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/55">Visits, trials, attendance, referrals and repeat behavior should begin with the operator responsible for creating real supply—not with a marketing promise.</p>
            <Link to="/for-brands" className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-orange-300">See the business side <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
