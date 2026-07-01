import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Compass, Sparkles, Trophy, Zap } from "lucide-react";
import SEO from "@/components/SEO";
import HomeActionStrip from "@/components/HomeActionStrip";
import MomentsSection from "@/components/MomentsSection";
import StakeholderPaths from "@/components/StakeholderPaths";
import EconomyLoop from "@/components/EconomyLoop";
import { ValueProposition } from "@/components/ValueProposition";
import FeaturedHeroBanner from "@/components/featured/FeaturedHeroBanner";
import FeaturedSection from "@/components/featured/FeaturedSection";
import { StandingLeaderboard } from "@/components/StandingLeaderboard";
import ForCreatorsSection from "@/components/ForCreatorsSection";
import { VaultTeaser } from "@/components/VaultTeaser";
import ForBrands from "@/components/ForBrands";
import heroImage from "@/assets/hero-moments.jpg";

const ladder = [
  {
    icon: Compass,
    title: "Orientation",
    text: "Understand how real participation turns into proof, rewards, status, and retained value.",
  },
  {
    icon: Zap,
    title: "First Value",
    text: "Find one moment, mission, offer, creator drop, or place worth acting on.",
  },
  {
    icon: CheckCircle2,
    title: "Proof",
    text: "Show up, check in, submit, share, attend, verify, or help move the moment.",
  },
  {
    icon: Sparkles,
    title: "Unlock",
    text: "Earn eligibility, rewards, access, Vault memories, campaign proof, or future opportunities.",
  },
  {
    icon: Trophy,
    title: "Mastery",
    text: "Host, launch, sponsor, promote, back, build reputation, and repeat what works.",
  },
];

export default function HowItWorks() {
  return (
    <main className="min-h-screen bg-background">
      <SEO
        title="How Promorang Works - From Showing Up To Unlocking More"
        description="Learn how Promorang turns real participation into proof, rewards, access, status, Vault memories, and repeatable value for participants, creators, hosts, brands, and merchants."
      />

      <section className="relative overflow-hidden bg-black pt-28 text-white md:pt-36">
        <img
          src={heroImage}
          alt="A real-world Promorang moment"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,106,0,0.18),transparent_32%),linear-gradient(90deg,rgba(0,0,0,0.96)_0%,rgba(0,0,0,0.82)_48%,rgba(0,0,0,0.48)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="container relative z-10 px-6 pb-20">
          <div className="max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">
              How it works
            </p>
            <h1 className="mt-5 max-w-4xl font-sans text-5xl font-black uppercase leading-[0.85] tracking-[-0.075em] md:text-7xl lg:text-8xl">
              Show up.
              <span className="block text-primary">Prove it.</span>
              <span className="block">Unlock more.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/75">
              The homepage lets people feel the culture first. This page teaches the system behind it: how a moment becomes proof, how proof becomes status, and how status opens rewards, access, memory, and repeatable value.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/discover/moments"
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-primary px-6 py-4 text-sm font-black uppercase text-white transition hover:bg-primary/90"
              >
                Find your first moment
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/create/moment"
                className="inline-flex items-center justify-center gap-3 rounded-xl border border-white/25 bg-white/5 px-6 py-4 text-sm font-black uppercase text-white transition hover:border-primary hover:text-primary"
              >
                Create a moment
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="mt-14 grid gap-3 md:grid-cols-5">
            {ladder.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h2 className="mt-5 text-lg font-black text-white">{step.title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/62">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomeActionStrip />
      <MomentsSection />

      <div className="container max-w-6xl mx-auto px-4 relative z-10">
        <FeaturedHeroBanner />
      </div>

      <StakeholderPaths />
      <EconomyLoop />
      <ValueProposition />

      <div className="container max-w-6xl mx-auto px-4">
        <FeaturedSection />
      </div>

      <StandingLeaderboard />
      <ForCreatorsSection />
      <VaultTeaser />
      <ForBrands />
    </main>
  );
}
