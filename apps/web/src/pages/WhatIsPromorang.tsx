import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Users,
  Building2,
  Megaphone,
  CheckCircle2,
  Flame,
  KeyRound,
  QrCode,
  Compass,
  DollarSign,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import SEO from "@/components/SEO";

const audiences = [
  {
    id: "participants",
    title: "For Foodies & Community Members",
    subtitle: "Turn opinions and outings into VIP perks",
    icon: Users,
    color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
    badge: "Locals & Explorers",
    points: [
      "Vote in weekly Monday city debates on local food, drinks, and hidden gems.",
      "Unlock exclusive PromoKey tasting passes every Wednesday at 6 PM.",
      "Check in at partner venues on weekends to redeem VIP perks and earn Gems.",
      "Level up your Access Rank for bigger perks and direct brand bounties.",
    ],
    cta: "Start Exploring",
    href: "/discover",
  },
  {
    id: "venues",
    title: "For Venues & Merchants",
    subtitle: "Guaranteed foot traffic with zero upfront risk",
    icon: Building2,
    color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
    badge: "Restaurants, Cafes & Bars",
    points: [
      "Tap into verified, pre-committed local crowds wanting to visit your spot.",
      "Verify visits seamlessly with contactless countertop QR codes.",
      "Pay only for verified physical patrons who actually walk through the door.",
      "Turn first-time visitors into repeat regulars through loyalty boosts.",
    ],
    cta: "Partner as a Venue",
    href: "/for-merchants",
  },
  {
    id: "creators",
    title: "For Creators & Tastemakers",
    subtitle: "Get paid for real foot traffic, not vanity metrics",
    icon: Sparkles,
    color: "from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400",
    badge: "Content Creators & Hosts",
    points: [
      "Claim brand-funded bounties for spotlighting local venues and cultural moments.",
      "Host your own community activations with built-in sponsorship funding.",
      "Earn attributable commission when your followers attend and check in.",
      "Build tangible Pieces and ownership in recurring community growth.",
    ],
    cta: "Creator Workspace",
    href: "/for-creators",
  },
  {
    id: "brands",
    title: "For Brands & Enterprise Sponsors",
    subtitle: "Measurable real-world activations at scale",
    icon: Megaphone,
    color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400",
    badge: "Brands & Marketers",
    points: [
      "Sponsor high-energy city debates and exclusive weekly VIP PromoKeys.",
      "Receive real-time GPS & receipt verification of every customer interaction.",
      "Generate organic UGC and authentic tastemaker recommendations.",
      "Replace expensive digital impressions with guaranteed real-world action.",
    ],
    cta: "Brand Solutions",
    href: "/for-brands",
  },
];

const coreMechanics = [
  {
    icon: Flame,
    title: "The Weekly City Rhythm",
    description: "Every Monday, the city debates the best spots. On Wednesday, exclusive PromoKeys drop. On Friday and Saturday, locals move to verified venues.",
  },
  {
    icon: KeyRound,
    title: "PromoKeys",
    description: "Digital VIP passes funded by brands that grant complimentary tastings, secret menu items, or special experiences at winning venues.",
  },
  {
    icon: QrCode,
    title: "Proof-of-Visit Verification",
    description: "Patrons verify attendance on-site using GPS geofencing or physical countertop QR scans, ensuring 100% genuine attribution.",
  },
  {
    icon: DollarSign,
    title: "Bounties & Gems",
    description: "Perform valuable community moves (hosting, content creation, check-ins) to earn Gems and cash bounties redeemable in your digital wallet.",
  },
];

export default function WhatIsPromorang() {
  const [selectedAudience, setSelectedAudience] = useState(audiences[0].id);
  const activeAudience = audiences.find((a) => a.id === selectedAudience) || audiences[0];

  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <SEO
        title="What is Promorang? — The Real-World Experiential Commerce Network"
        description="Promorang turns weekly city buzz and local debates into brand-funded foot traffic, VIP perks for locals, and verified revenue for venues."
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/10 px-5 pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,107,0,0.22),transparent_40%),radial-gradient(circle_at_80%_60%,rgba(147,51,234,0.12),transparent_35%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:36px_36px]" />
        
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary">
            <Sparkles className="h-3.5 w-3.5" /> What is Promorang?
          </div>
          
          <h1 className="mt-6 text-4xl font-black uppercase leading-[0.9] tracking-tight sm:text-6xl md:text-7xl">
            Where City Buzz Turns Into <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-primary bg-clip-text text-transparent">Real-World Movement</span>
          </h1>
          
          <p className="mx-auto mt-7 max-w-3xl text-lg leading-relaxed text-white/70 sm:text-xl">
            Promorang is the participation network connecting <strong>curious locals</strong>, <strong>thriving venues</strong>, <strong>tastemakers</strong>, and <strong>brands</strong>. We replace passive digital ads with brand-funded real-world experiences, VIP tasting keys, and verified foot traffic.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/discover"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-black text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-105"
            >
              Explore Discoveries <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/[0.05] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              How the 7-Day Cycle Works <Compass className="h-4 w-4 text-primary" />
            </Link>
            <Link
              to="/help"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/10 bg-transparent px-5 py-3.5 text-sm font-medium text-white/60 transition hover:text-white"
            >
              Knowledge Base & FAQs <BookOpen className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* The 60-Second Explanation in 3 Steps */}
      <section className="border-b border-white/10 px-5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-widest text-primary">In 60 Seconds</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl md:text-5xl">How Promorang Connects the City</h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-primary/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-xl font-black text-primary">
                1
              </div>
              <h3 className="mt-6 text-xl font-black">1. Vote & Shape the City</h3>
              <p className="mt-3 text-sm leading-6 text-white/65">
                Every Monday, locals vote on city debates (e.g. &quot;Best Smash Burger in Town&quot;). Your vote signals real community demand directly to venues and sponsors.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-primary/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-xl font-black text-amber-400">
                2
              </div>
              <h3 className="mt-6 text-xl font-black">2. Unlock Brand-Funded Keys</h3>
              <p className="mt-3 text-sm leading-6 text-white/65">
                Corporate sponsors and local brands fund limited <strong>PromoKeys</strong> every Wednesday at 6 PM. Winning voters claim free tastings and VIP passes.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-primary/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-xl font-black text-purple-400">
                3
              </div>
              <h3 className="mt-6 text-xl font-black">3. Move, Verify & Earn</h3>
              <p className="mt-3 text-sm leading-6 text-white/65">
                On weekends, patrons show up, scan the venue’s countertop QR code, enjoy their tasting, and earn Gems. Creators earn bounties for driving foot traffic.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Role Breakdown */}
      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-primary">Built For Everyone</p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl md:text-5xl">Who Is Promorang For?</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {audiences.map((aud) => (
                <button
                  key={aud.id}
                  onClick={() => setSelectedAudience(aud.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition ${
                    selectedAudience === aud.id
                      ? "bg-primary text-black"
                      : "border border-white/10 bg-white/[0.04] text-white/60 hover:text-white"
                  }`}
                >
                  <aud.icon className="h-3.5 w-3.5" />
                  {aud.badge}
                </button>
              ))}
            </div>
          </div>

          <div className={`mt-8 rounded-3xl border bg-gradient-to-br p-8 md:p-12 ${activeAudience.color}`}>
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-white/50">{activeAudience.badge}</span>
                <h3 className="mt-1 text-2xl font-black md:text-3xl text-white">{activeAudience.title}</h3>
                <p className="mt-1 text-base text-white/70">{activeAudience.subtitle}</p>
              </div>
              <Link
                to={activeAudience.href}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-black transition hover:bg-white/90"
              >
                {activeAudience.cta} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {activeAudience.points.map((point, index) => (
                <div key={index} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/40 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm leading-6 text-white/80">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Mechanics Explained */}
      <section className="border-b border-white/10 px-5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-widest text-primary">Core Mechanics</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl md:text-5xl">The Engine Behind Promorang</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/60">
              Unlike traditional social media or digital advertising networks, Promorang is built on verifiable real-world action.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {coreMechanics.map((mech) => (
              <div key={mech.title} className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-white/20">
                <mech.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-6 text-lg font-black">{mech.title}</h3>
                <p className="mt-2 text-xs leading-5 text-white/60">{mech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick FAQ / Still Confused Callout */}
      <section className="px-5 py-16 md:py-24">
        <div className="mx-auto max-w-5xl rounded-[2.5rem] border border-primary/30 bg-gradient-to-b from-primary/15 to-transparent p-8 md:p-14 text-center">
          <HelpCircle className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-4 text-3xl font-black uppercase sm:text-4xl md:text-5xl">Got More Questions?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/75">
            Dive into our step-by-step guides, search our complete knowledge base, or contact our community team directly.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/help"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black text-black transition hover:scale-105"
            >
              Browse How-To Library & FAQs <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/[0.05] px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
