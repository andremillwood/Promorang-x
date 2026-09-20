import { useState } from "react";
import { ArrowRight, Briefcase, CalendarDays, Megaphone, Sparkles, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { CurrentArc } from "@/components/marketing/MarketingPhysics";
import heroMoments from "@/assets/hero-moments.jpg";
import participantImage from "@/assets/moments/sunset-photo.jpg";
import creatorImage from "@/assets/moments/open-mic.jpg";
import hostImage from "@/assets/moment-concert.jpg";
import agencyImage from "@/assets/moments/pottery.jpg";

const specialistPaths = [
  {
    eyebrow: "I create or influence",
    title: "Creator",
    description: "Share what deserves attention, move people toward something real, and build reputation around what happened.",
    href: "/for-creators",
    cta: "Explore creator tools",
    icon: Megaphone,
    image: creatorImage,
    proof: "Attention → Action → Reputation",
  },
  {
    eyebrow: "I bring people together",
    title: "Host",
    description: "Turn interest into Moments people can actually attend, manage access, and learn who showed up.",
    href: "/hosting",
    cta: "Explore hosting",
    icon: CalendarDays,
    image: hostImage,
    proof: "Interest → Moment → Attendance",
  },
  {
    eyebrow: "I manage clients",
    title: "Agency",
    description: "Start from each client's outcome, coordinate the response, and keep evidence clear across accounts.",
    href: "/for-agencies",
    cta: "Explore agency tools",
    icon: Briefcase,
    image: agencyImage,
    proof: "Outcome → Client response → Evidence",
  },
];

export default function Join() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = specialistPaths[selectedIndex];
  const SelectedIcon = selected.icon;

  return (
    <main className="marketing-cinematic min-h-screen overflow-x-clip bg-[#050505] text-white">
      <SEO title="Join PROMORANG — Start from what you need to do" description="Participate in the market, start from a business outcome, or enter through a specialist role." />

      <section className="marketing-join-hero relative overflow-hidden border-b border-white/10 px-5 pb-16 pt-16 sm:px-6 md:pb-20 md:pt-24">
        <CurrentArc variant="hero" className="marketing-hero-current" />
        <img src={heroMoments} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/50" />
        <div className="relative mx-auto max-w-[1440px]">
          <p className="marketing-kicker">Enter PROMORANG</p>
          <h1 className="mt-5 max-w-[12ch] text-5xl font-black sm:text-6xl lg:text-7xl">What brings you here?</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">You do not need to learn the product map first. Start as a person looking for something, a business trying to change something, or a specialist with a clear operating role.</p>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-14 sm:px-6 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-2">
          <Link to="/auth?mode=signup&role=participant&next=/home" className="group relative min-h-[25rem] overflow-hidden rounded-[2rem] border border-white/10">
            <img src={participantImage} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />
            <div className="absolute inset-x-0 bottom-0 p-7 sm:p-9">
              <p className="marketing-kicker"><UserRound className="h-3.5 w-3.5" /> I want to find, ask or join</p>
              <h2 className="mt-3 text-4xl font-black">Start as a participant.</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/60">Discover what is happening, tell PROMORANG what you want, add your voice and keep useful things on PromoCard.</p>
              <span className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-orange-300">Get my PromoCard <ArrowRight className="h-4 w-4" /></span>
            </div>
          </Link>

          <Link to="/business/start" className="group relative min-h-[25rem] overflow-hidden rounded-[2rem] border border-orange-300/20 bg-[radial-gradient(circle_at_80%_15%,rgba(251,146,60,.22),transparent_30%),linear-gradient(145deg,#1b1712,#080808)]">
            <div className="absolute inset-x-0 bottom-0 p-7 sm:p-9">
              <p className="marketing-kicker"><Sparkles className="h-3.5 w-3.5" /> I need to accomplish something for a business</p>
              <h2 className="mt-3 max-w-xl text-4xl font-black">Start from the outcome.</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/60">More visits. Product trial. A launch. Repeat customers. Demand learning. Tell PROMORANG what needs to change and get a recommended route.</p>
              <div className="mt-6 flex flex-wrap gap-2">{["Bring people in","Launch something","Move this","Bring them back"].map((item) => <span key={item} className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[10px] font-black text-white/55">{item}</span>)}</div>
              <span className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-orange-300">Choose my outcome <ArrowRight className="h-4 w-4" /></span>
            </div>
          </Link>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="marketing-section-head">
            <div>
              <p className="marketing-kicker">Specialist entry</p>
              <h2 className="mt-3 text-4xl font-black sm:text-5xl">Already know the role you are here to operate?</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">Creators, hosts and agencies can go directly to the workspace language that fits their responsibility.</p>
            </div>
          </div>

          <div className="marketing-role-rail" role="tablist" aria-label="PROMORANG specialist roles">
            {specialistPaths.map((path, index) => {
              const Icon = path.icon;
              const active = index === selectedIndex;
              return (
                <button key={path.title} type="button" role="tab" aria-selected={active} onClick={() => setSelectedIndex(index)} className={`marketing-role-card group ${active ? "is-active" : ""}`}>
                  <img src={path.image} alt="" aria-hidden="true" />
                  <span className="marketing-role-card__veil" />
                  <span className="marketing-role-card__copy"><span className="marketing-role-card__icon"><Icon className="h-4 w-4" /></span><strong>{path.title}</strong><small>{path.eyebrow}</small></span>
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
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">Your path</p>
              <p className="mt-2 text-lg font-black text-white">{selected.proof}</p>
              <Link to={selected.href} className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-md bg-orange-500 px-5 text-xs font-black uppercase tracking-[0.08em] text-black">{selected.cta} <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-6 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 border-y border-white/10 py-10 md:grid-cols-2">
          <div>
            <p className="marketing-kicker">Not sure?</p>
            <h2 className="mt-3 text-3xl font-black">Experience PROMORANG first.</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/55">Explore the participant side and see how Discoveries, Wants, Moments and PromoCard fit together.</p>
            <Link to="/discover" className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-orange-300">Explore PROMORANG <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div>
            <p className="marketing-kicker">Already have a brief?</p>
            <h2 className="mt-3 text-3xl font-black">Build it directly.</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/55">Power users can still describe the activation directly and move into PromoPilot without taking the guided outcome route.</p>
            <Link to="/create/campaign" className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-orange-300">Open campaign planner <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
