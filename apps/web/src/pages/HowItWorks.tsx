import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Building2,
  CheckCircle2,
  ChevronDown,
  Coins,
  Compass,
  Flame,
  Gem,
  Gift,
  HelpCircle,
  KeyRound,
  LineChart,
  Lock,
  MapPin,
  Megaphone,
  QrCode,
  Repeat2,
  Rocket,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Ticket,
  Trophy,
  Users,
  WalletCards,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SEO from "@/components/SEO";
import { useI18n } from "@/i18n/I18nContext";

type RoleId = "member" | "creator" | "merchant" | "brand" | "promoter";

const valueTypes = [
  {
    icon: Banknote,
    label: "Earn Cash",
    sub: "Direct Bounties",
    detail: "Withdrawable USD and cash rewards for attending sponsored drops, creating content, or hosting.",
    badge: "$25–$150 Bounty",
    accent: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  },
  {
    icon: Gift,
    label: "Claim Perks",
    sub: "Gems & Menus",
    detail: "Redeem Gems for secret menu tastings, complimentary craft cocktails, merchandise, and discounts.",
    badge: "Free Tasting",
    accent: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  },
  {
    icon: Ticket,
    label: "VIP Access",
    sub: "PromoKeys",
    detail: "Exclusive Wednesday pass drops granting guaranteed entry, skip-the-line privileges, and private tastings.",
    badge: "PromoKey Drop",
    accent: "border-sky-500/30 bg-sky-500/10 text-sky-400",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  },
  {
    icon: Trophy,
    label: "Build Status",
    sub: "Explorer Rank",
    detail: "On-chain & verified participation reputation unlocking access to invite-only drops and tastemaker status.",
    badge: "Level Up Tier",
    accent: "border-violet-500/30 bg-violet-500/10 text-violet-400",
    badgeColor: "bg-violet-500/20 text-violet-300 border-violet-500/40",
  },
  {
    icon: Gem,
    label: "Own Pieces",
    sub: "Moment Equity",
    detail: "Co-own stakes in iconic moments, recurring city events, and creator activations with shared upside.",
    badge: "Piece Staking",
    accent: "border-orange-500/30 bg-orange-500/10 text-orange-400",
    badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  },
];

const rolesData: Record<
  RoleId,
  {
    id: RoleId;
    label: string;
    icon: typeof Users;
    tagline: string;
    promise: string;
    previewMock: {
      tag: string;
      title: string;
      subtitle: string;
      stat: string;
      statLabel: string;
      actionText: string;
    };
    steps: Array<{
      stepNum: string;
      title: string;
      detail: string;
      href: string;
      cta: string;
      badgeText: string;
    }>;
  }
> = {
  member: {
    id: "member",
    label: "Patron & Foodie",
    icon: Users,
    tagline: "For Locals & Explorers",
    promise: "Vote on city debates, unlock Wednesday PromoKeys, check in at top venues on weekends, and earn instant perks.",
    previewMock: {
      tag: "Live Weekend Drop",
      title: "Kingston Secret Tasting",
      subtitle: "Friday 8 PM • Verified Countertop Scan",
      stat: "+50 Gems",
      statLabel: "+ Free VIP Drink",
      actionText: "Check In via QR",
    },
    steps: [
      {
        stepNum: "01",
        title: "Spot a Drop or Debate",
        detail: "Vote every Monday in high-energy neighborhood debates on the best food, cocktails, and cultural moments.",
        href: "/radar?tab=discover",
        cta: "Explore Drops",
        badgeText: "Mon–Tue",
      },
      {
        stepNum: "02",
        title: "Claim Your PromoKey",
        detail: "Grab exclusive brand-sponsored Wednesday digital passes for free tastings and secret menu perks.",
        href: "/discover",
        cta: "See Active Keys",
        badgeText: "Wednesday",
      },
      {
        stepNum: "03",
        title: "Show Up & Check In",
        detail: "Arrive at the venue, scan the contactless countertop QR or verify with GPS to prove your presence.",
        href: "/missions",
        cta: "Browse Missions",
        badgeText: "Fri–Sat",
      },
      {
        stepNum: "04",
        title: "Keep the Value & Level Up",
        detail: "Receive Gems and cash bounties in your wallet while boosting your City Explorer Rank for bigger unlocks.",
        href: "/wallet",
        cta: "Open Wallet",
        badgeText: "Instant Unlock",
      },
    ],
  },
  creator: {
    id: "creator",
    label: "Creator & Host",
    icon: Sparkles,
    tagline: "For Tastemakers & Curators",
    promise: "Monetize real-world movement instead of vanity views. Get brand sponsors, launch drops, and earn per check-in.",
    previewMock: {
      tag: "Creator Activation",
      title: "Downtown Food Crawl",
      subtitle: "Attributed Link • 142 Patrons Moved",
      stat: "$480.00",
      statLabel: "Earned Foot Traffic Payout",
      actionText: "View Activation Stats",
    },
    steps: [
      {
        stepNum: "01",
        title: "Curate a Moment",
        detail: "Create an activation, tasting tour, or cultural gathering centered around the city's best hidden gems.",
        href: "/create/moment",
        cta: "Create a Moment",
        badgeText: "Publish",
      },
      {
        stepNum: "02",
        title: "Attach Bounties & PromoKeys",
        detail: "Partner with brands or venues to attach funded incentives and exclusive access for your audience.",
        href: "/content-drops",
        cta: "Open Content Drops",
        badgeText: "Funded",
      },
      {
        stepNum: "03",
        title: "Activate Tracked Distribution",
        detail: "Share your attributed smart link. Every follower who attends and checks in generates verifiable data.",
        href: "/promopush/creator",
        cta: "Launch PromoPush",
        badgeText: "Tracked",
      },
      {
        stepNum: "04",
        title: "Collect Direct Payouts",
        detail: "Earn real cash commissions, keep Piece equity in the Moment, and build a recurring loyal community.",
        href: "/portfolio",
        cta: "View Pieces & Payouts",
        badgeText: "Commission",
      },
    ],
  },
  merchant: {
    id: "merchant",
    label: "Venue & Merchant",
    icon: Building2,
    tagline: "For Restaurants, Bars & Venues",
    promise: "Zero upfront advertising risk. Get pre-committed crowds through the door and pay only for verified physical visits.",
    previewMock: {
      tag: "Venue Countertop Live",
      title: "Speakeasy Friday Rush",
      subtitle: "68 Verified Check-Ins • 0% Fake Clicks",
      stat: "+32%",
      statLabel: "Off-Peak Revenue Lift",
      actionText: "Manage QR Terminals",
    },
    steps: [
      {
        stepNum: "01",
        title: "Establish Your Venue",
        detail: "Claim your venue profile, set your capacity, and link your menu and exclusive tasting offerings.",
        href: "/dashboard/venues",
        cta: "Register Venue",
        badgeText: "Profile",
      },
      {
        stepNum: "02",
        title: "Confirm Demand Slots",
        detail: "Review Monday city debate demand and approve Friday/Saturday PromoKey tasting allocations.",
        href: "/marketplace",
        cta: "Set Capacity",
        badgeText: "Demand Match",
      },
      {
        stepNum: "03",
        title: "Countertop QR Verification",
        detail: "Patrons scan your tamper-proof counter QR code or check in via GPS. Seamless, fast, and 100% fraud-free.",
        href: "/create/moment",
        cta: "Get Countertop QR",
        badgeText: "Instant Scan",
      },
      {
        stepNum: "04",
        title: "Attributable ROI",
        detail: "Track actual spend, turn first-time guests into repeat regulars, and only pay for verified attendees.",
        href: "/dashboard/analytics",
        cta: "View Analytics",
        badgeText: "Zero Ad Waste",
      },
    ],
  },
  brand: {
    id: "brand",
    label: "Brand & Enterprise",
    icon: Megaphone,
    tagline: "For Marketers & Sponsors",
    promise: "Replace useless banner impressions with guaranteed real-world customer interactions and verified receipts.",
    previewMock: {
      tag: "Brand Campaign",
      title: "Summer Spritz Tasting Campaign",
      subtitle: "GPS Geofenced • 1,200 Verified Tastings",
      stat: "100%",
      statLabel: "Verified Foot Traffic",
      actionText: "Launch Sponsor Campaign",
    },
    steps: [
      {
        stepNum: "01",
        title: "Select Campaign Target",
        detail: "Choose your desired metric: physical attendance, product trial, UGC creation, or weekend foot traffic.",
        href: "/create/campaign",
        cta: "Build Campaign",
        badgeText: "Goal",
      },
      {
        stepNum: "02",
        title: "Fund PromoKeys & Bounties",
        detail: "Deposit rewards into an automated escrow that only unlocks when participants complete proof criteria.",
        href: "/dashboard/campaigns",
        cta: "Set Escrow Budget",
        badgeText: "Escrowed",
      },
      {
        stepNum: "03",
        title: "Mobilize Tastemakers",
        detail: "Enlist high-credibility local creators and promoters to activate their communities organically.",
        href: "/promopush",
        cta: "Open PromoPush",
        badgeText: "Distribution",
      },
      {
        stepNum: "04",
        title: "Real-Time Verified Proof",
        detail: "Audit live GPS timestamps, countertop scans, and authentic UGC with zero intermediary leakage.",
        href: "/dashboard/analytics",
        cta: "View Audit Logs",
        badgeText: "Audited",
      },
    ],
  },
  promoter: {
    id: "promoter",
    label: "Promoter & Growth",
    icon: Rocket,
    tagline: "For Connectors & Marketers",
    promise: "Distribute high-demand moments to your network and earn automated commissions on every verified attendee.",
    previewMock: {
      tag: "Promoter Network",
      title: "Nightlife VIP Key Push",
      subtitle: "Smart Link • 89 Attendees Checked In",
      stat: "$267.00",
      statLabel: "Automated Commission",
      actionText: "Copy Smart Links",
    },
    steps: [
      {
        stepNum: "01",
        title: "Pick High-Converting Drops",
        detail: "Browse curated campaigns with high payouts, compelling member perks, and strong demand.",
        href: "/growth",
        cta: "Open Growth Hub",
        badgeText: "Select",
      },
      {
        stepNum: "02",
        title: "Generate Tracked Smart Links",
        detail: "Create unique attributable links and promotional assets tailored to your specific audience channels.",
        href: "/promopush/promoter",
        cta: "Promoter Hub",
        badgeText: "Tracked URL",
      },
      {
        stepNum: "03",
        title: "Drive Real Movement",
        detail: "Invite friends and community members to claim PromoKeys and check in at partner destinations.",
        href: "/discover",
        cta: "Browse Venues",
        badgeText: "Attribution",
      },
      {
        stepNum: "04",
        title: "Collect Automated Commission",
        detail: "Receive automated payouts directly to your wallet the moment patrons verify on-site.",
        href: "/wallet",
        cta: "View Wallet",
        badgeText: "Instant Pay",
      },
    ],
  },
};

const systemLayers = [
  {
    number: "01",
    icon: Compass,
    title: "Discover",
    question: "What can I do or explore right now?",
    detail: "A unified feed of weekly drops, tasting battles, hidden gems, merchant offers, and sponsored bounties in your city.",
    links: [
      ["Browse All", "/discover"],
      ["Food & Drink", "/discover/venues"],
      ["Marketplace", "/marketplace"],
    ],
  },
  {
    number: "02",
    icon: BadgeCheck,
    title: "Participation & Proof",
    question: "How do I prove I was actually there?",
    detail: "Anti-fraud verification via countertop QR codes, GPS geofencing, and verified receipts. Zero bots, 100% real humans.",
    links: [
      ["Active Missions", "/missions"],
      ["My Standing", "/dashboard"],
    ],
  },
  {
    number: "03",
    icon: WalletCards,
    title: "Multi-Value Wallet",
    question: "Where are my earnings and rewards stored?",
    detail: "Clearly segregated balances for withdrawable USD cash, spendable Gems, VIP PromoKeys, and digital receipt memories.",
    links: [
      ["Open Wallet", "/wallet"],
      ["Rewards Shop", "/rewards"],
      ["Vault", "/vault"],
    ],
  },
  {
    number: "04",
    icon: LineChart,
    title: "Pieces & Community Equity",
    question: "How can I share in recurring upside?",
    detail: "Fractional co-ownership in high-performing Moments and venue activations. Earn recurring perks as the community expands.",
    links: [
      ["My Pieces", "/portfolio"],
      ["Moments Market", "/trading"],
      ["Ecosystem Health", "/liquidity"],
    ],
  },
  {
    number: "05",
    icon: Rocket,
    title: "Growth & PromoPush",
    question: "How do I amplify and mobilize crowds?",
    detail: "Attributable distribution engine letting creators, venues, and promoters collaborate on tracked marketing campaigns.",
    links: [
      ["Growth Hub", "/growth"],
      ["PromoShare", "/promoshare"],
      ["PromoPush", "/promopush"],
    ],
  },
];

const valuePillars = [
  {
    icon: ShieldCheck,
    title: "Verified Foot Traffic",
    detail: "Venues and sponsors only pay when patrons physically walk through the door and scan on-site. Zero ad fraud or fake clicks.",
  },
  {
    icon: Lock,
    title: "Escrowed Reward Guarantee",
    detail: "All bounties, PromoKey tastings, and Gem payouts are pre-funded in secure smart escrows before campaigns go live.",
  },
  {
    icon: Sparkles,
    title: "Weekly Fresh Drops",
    detail: "Every week brings new neighborhood debates, fresh food & cocktail drops, and dynamic weekend missions.",
  },
  {
    icon: Coins,
    title: "Instant Multi-Currency Payouts",
    detail: "Withdrawable USD, spendable Gems, and VIP access passes are delivered directly to your wallet the second proof is confirmed.",
  },
];

const faqs = [
  {
    q: "How does Promorang verify I actually visited a venue?",
    a: "We use a dual-layer proof system: on-site countertop QR code scans and GPS geofencing. When you arrive at a partner venue, simply tap 'Check In' and scan the physical counter terminal. The app verifies your location in under 2 seconds.",
  },
  {
    q: "What is a PromoKey and how do I redeem it?",
    a: "A PromoKey is a digital VIP pass funded by brands and venues. Every Wednesday at 6 PM, limited PromoKeys drop for active community voters. You present the pass on your phone upon arrival to unlock complimentary tastings, secret items, or skip-the-line privileges.",
  },
  {
    q: "How do cash bounties and Gems work?",
    a: "Cash bounties (USD) are funded rewards for specific actions like attending exclusive drops or creating verified content, and can be withdrawn directly to your bank account or debit card. Gems are spendable platform reward points used in the Rewards Shop for perks, discounts, and merchandise.",
  },
  {
    q: "How can my restaurant or bar get listed as a venue?",
    a: "Venue registration takes under 5 minutes. You create your venue profile, upload your countertop QR sticker kit, and set available capacity for Friday/Saturday drops. You only pay when verified guests actually visit.",
  },
  {
    q: "Can creators collaborate directly with local brands?",
    a: "Yes! Creators can browse brand-sponsored bounties in the Growth Hub, attach brand sponsors to their own curated Moments, and earn automated commissions on every follower who attends.",
  },
];

export default function HowItWorks() {
  const { t } = useI18n();
  const [activeRole, setActiveRole] = useState<RoleId>("member");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const currentRole = rolesData[activeRole];

  return (
    <main className="min-h-screen bg-[#070707] text-white selection:bg-primary selection:text-black">
      <SEO
        title={t("how.seoTitle") || "How Promorang Works — Real-World Movement & Verified Rewards"}
        description={
          t("how.seoCopy") ||
          "See how Promorang turns weekly city debates into verified foot traffic, VIP PromoKeys, instant creator bounties, and local commerce."
        }
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/10 px-5 pb-20 pt-28 md:pt-36">
        {/* Glow gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(255,107,0,0.22),transparent_35%),radial-gradient(circle_at_20%_50%,rgba(147,51,234,0.12),transparent_35%),linear-gradient(180deg,#121212_0%,#070707_100%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:40px_40px]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t("how.eyebrow") || "The 7-Day Operating Rhythm"}</span>
            </div>

            <h1 className="mt-6 text-5xl font-black uppercase leading-[0.88] tracking-[-0.06em] sm:text-6xl lg:text-[5.5rem]">
              Vote Monday.
              <br />
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-primary bg-clip-text text-transparent">
                Unlock Wednesday.
              </span>
              <br />
              Move Friday.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
              Promorang turns weekly city debates into verified real-world movement. Locals vote on top spots, venues fulfill demand, creators get paid for foot traffic, and brands sponsor VIP tasting keys.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/radar?tab=discover"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-orange-500 px-6 py-3 text-sm font-black text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-primary/40 active:scale-[0.98]"
              >
                <span>Vote on Drops</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/radar"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/[0.04] px-6 py-3 text-sm font-black text-white transition-all duration-200 hover:border-primary/60 hover:bg-white/[0.08] active:scale-[0.98]"
              >
                <span>Explore City Rhythm</span>
                <Flame className="h-4 w-4 text-primary" />
              </Link>
            </div>
          </div>

          {/* 7-Day Interactive Card */}
          <aside className="rounded-3xl border border-orange-500/30 bg-black/80 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-widest text-orange-400">The 7-Day Cycle</h3>
              </div>
              <span className="rounded-full bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-black text-orange-400 border border-orange-500/20">
                Weekly Loop
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {[
                { step: "01", day: "Mon–Tue: City Debate", desc: "Locals vote on weekly food, drink, and nightlife battles.", active: true },
                { step: "02", day: "Tue: Demand Confirmation", desc: "Top-voted venues confirm tasting and VIP slots.", active: false },
                { step: "03", day: "Wed: PromoKey Drop (6 PM)", desc: "Limited VIP tasting passes drop for active voters.", active: false },
                { step: "04", day: "Fri–Sat: Real Movement", desc: "Patrons arrive, check in on-site, and unlock perks.", active: false },
                { step: "05", day: "Sun: Settlement & Renewal", desc: "Gems lock, bounties pay out, and new debates begin.", active: false },
              ].map((item) => (
                <div
                  key={item.step}
                  className={`flex items-start gap-3 rounded-xl border p-3 transition-all duration-200 ${
                    item.active
                      ? "border-orange-500/40 bg-orange-500/10 shadow-sm"
                      : "border-white/5 bg-white/[0.02] hover:border-white/15"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                      item.active ? "bg-orange-500 text-black font-black" : "bg-white/10 text-white/70"
                    }`}
                  >
                    {item.step}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white">{item.day}</div>
                    <div className="text-[11px] leading-relaxed text-white/60">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {/* 5 Ways You Get Rewarded (Benefit-First) */}
      <section className="border-b border-white/10 px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">
                Transparent Value Structure
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl md:text-5xl">
                5 Ways You Get Rewarded
              </h2>
            </div>
            <p className="max-w-md text-sm text-white/60">
              Every action on Promorang is tied to a clear, disclosed return. No guessing what your activity is worth.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {valueTypes.map((item, idx) => (
              <motion.article
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${item.accent}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/40 border border-white/10">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-black text-white">{item.label}</h3>
                  <div className="text-xs font-bold opacity-80">{item.sub}</div>
                  <p className="mt-3 text-xs leading-relaxed text-white/65">{item.detail}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Complete Journey Interactive Stepper */}
      <section className="px-5 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">Interactive Journey</p>
              <h2 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                See Your Complete Journey
              </h2>
            </div>

            {/* Role Tabs */}
            <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 backdrop-blur-md">
              {(Object.keys(rolesData) as RoleId[]).map((roleKey) => {
                const role = rolesData[roleKey];
                const isActive = activeRole === roleKey;
                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => setActiveRole(roleKey)}
                    className={`relative inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all duration-200 active:scale-[0.97] ${
                      isActive ? "text-black font-black" : "text-white/60 hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeRoleTab"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-orange-500 shadow-md shadow-primary/20"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <role.icon className="h-3.5 w-3.5" />
                      {role.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Stepper & Live Preview */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/60 shadow-2xl"
            >
              {/* Header Promise Banner */}
              <div className="flex flex-col gap-4 border-b border-white/10 p-6 md:flex-row md:items-center md:justify-between md:p-8">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {currentRole.tagline}
                  </div>
                  <p className="mt-2 text-xl font-bold leading-relaxed text-white/90 md:text-2xl">
                    {currentRole.promise}
                  </p>
                </div>

                {/* Simulated Screen Preview Badge */}
                <div className="shrink-0 rounded-2xl border border-primary/30 bg-primary/10 p-4 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                      {currentRole.previewMock.tag}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-black text-white">{currentRole.previewMock.title}</div>
                  <div className="text-[11px] text-white/60">{currentRole.previewMock.subtitle}</div>
                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-2 text-xs">
                    <span className="font-black text-emerald-400">{currentRole.previewMock.stat}</span>
                    <span className="text-[10px] text-white/50">{currentRole.previewMock.statLabel}</span>
                  </div>
                </div>
              </div>

              {/* 4 Connected Step Cards */}
              <div className="grid divide-y divide-white/10 md:grid-cols-4 md:divide-x md:divide-y-0">
                {currentRole.steps.map((step, idx) => (
                  <article
                    key={step.stepNum}
                    className="group relative flex flex-col justify-between p-6 transition-colors duration-200 hover:bg-white/[0.02]"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-primary">{step.stepNum}</span>
                        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/50 border border-white/10">
                          {step.badgeText}
                        </span>
                      </div>
                      <h3 className="mt-6 text-xl font-black text-white">{step.title}</h3>
                      <p className="mt-3 text-xs leading-relaxed text-white/60 min-h-[50px]">{step.detail}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5">
                      <Link
                        to={step.href}
                        className="inline-flex items-center gap-1.5 text-xs font-black text-primary transition-transform duration-150 group-hover:translate-x-1"
                      >
                        <span>{step.cta}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 5 Integrated System Layers */}
      <section className="border-y border-white/10 bg-[#0c0c0c] px-5 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">Integrated Platform</p>
            <h2 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
              The 5 System Layers
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Each part of Promorang answers a specific question for the user while feeding directly into real commerce and community growth.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {systemLayers.map((layer) => (
              <article
                key={layer.number}
                className="group grid gap-4 rounded-2xl border border-white/10 bg-black/40 p-5 transition-all duration-200 hover:border-white/20 hover:bg-black/60 md:grid-cols-[60px_240px_1fr_auto] md:items-center"
              >
                <div className="flex items-center gap-3 md:block">
                  <span className="text-xs font-black text-white/30">{layer.number}</span>
                  <layer.icon className="h-5 w-5 text-primary md:mt-2" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{layer.title}</h3>
                  <p className="mt-0.5 text-xs font-bold text-primary">{layer.question}</p>
                </div>
                <p className="text-xs leading-relaxed text-white/60">{layer.detail}</p>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  {layer.links.map(([label, href]) => (
                    <Link
                      key={href}
                      to={href}
                      className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white/70 transition-colors duration-150 hover:border-primary/50 hover:text-primary active:scale-[0.97]"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Real-World Value Engine (Replacing raw Liquidity jargon) */}
      <section className="px-5 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">Trust & Sustainability</p>
              <h2 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                The Real-World Value Engine
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/65">
                Unlike ad platforms that sell fake clicks or speculative apps with zero real-world backing, Promorang guarantees genuine foot traffic, escrowed rewards, and transparent commerce.
              </p>
            </div>
            <Link
              to="/liquidity"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-black text-white transition-all duration-200 hover:border-primary/60 hover:text-primary"
            >
              <span>Operator & Liquidity Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {valuePillars.map((pillar) => (
              <article
                key={pillar.title}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all duration-200 hover:border-orange-500/30 hover:bg-white/[0.04]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  <pillar.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-black text-white">{pillar.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/60">{pillar.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive FAQ Accordion */}
      <section className="border-t border-white/10 bg-[#0a0a0a] px-5 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-primary">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Got Questions?</span>
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-sm text-white/60">
              Everything you need to know about participating, redeeming perks, and partnering with Promorang.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.q}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 transition-colors duration-200 hover:border-white/20"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-5 text-left text-base font-bold text-white transition-colors duration-150 focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-primary transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <div className="border-t border-white/5 p-5 pt-0 text-xs leading-relaxed text-white/65">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dual CTA Footer Deck */}
      <section className="border-t border-white/10 px-5 py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
          {/* For Explorers */}
          <article className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-black to-black p-8 md:p-10 shadow-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>For Explorers & Foodies</span>
            </div>
            <h3 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
              Ready to claim your first VIP tasting?
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Join the Monday debate, unlock Wednesday PromoKeys, and experience your city with instant rewards.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/discover"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <span>Start Exploring</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/radar"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/[0.04] px-6 py-3 text-sm font-black text-white hover:border-primary/60 active:scale-[0.98]"
              >
                <span>Vote on Discoveries</span>
              </Link>
            </div>
          </article>

          {/* For Venues & Creators */}
          <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] via-black to-black p-8 md:p-10 shadow-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-orange-400">
              <Building2 className="h-3.5 w-3.5" />
              <span>For Venues & Creators</span>
            </div>
            <h3 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
              Turn foot traffic into recurring revenue.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Host a drop, claim sponsor bounties, or verify physical visits with zero upfront advertising risk.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/for-merchants"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-black text-black shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <span>Partner as a Venue</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/for-creators"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/[0.04] px-6 py-3 text-sm font-black text-white hover:border-white/40 active:scale-[0.98]"
              >
                <span>Creator Hub</span>
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
