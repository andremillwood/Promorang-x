import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Coins,
  Gift,
  Handshake,
  Key,
  Lock,
  MapPin,
  Palette,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Users,
  Zap,
} from 'lucide-react';

const tiers = [
  {
    name: 'Guest',
    marks: 0,
    keys: 0,
    progress: 0,
    nextAction: 'Join one public moment and leave your first Mark.',
    nextHref: '/explore/moments',
    nextLabel: 'Find your first moment',
    color: 'bg-slate-50 border-slate-200 text-slate-950',
    iconColor: 'text-slate-600',
    selectedColor: 'bg-slate-900 text-white shadow-sm',
    earnings: 'Access starts here',
    description: 'Start your journey. Attend moments, leave Marks, earn points, and become eligible for your first complementary pieces.',
    benefits: [
      { icon: Calendar, text: 'Attend public moments' },
      { icon: ShieldCheck, text: 'Leave your Mark when you arrive' },
      { icon: Coins, text: 'Earn points for participation' },
      { icon: Star, text: 'Submit reviews and photos' },
    ],
  },
  {
    name: 'Regular',
    marks: 5,
    keys: 1,
    progress: 34,
    nextAction: 'Return to moments, review, upload proof, and become a familiar face.',
    nextHref: '/rewards',
    nextLabel: 'View reward path',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-950',
    iconColor: 'text-green-600',
    selectedColor: 'bg-emerald-600 text-white shadow-sm',
    earnings: 'Better access',
    description: 'Become a familiar face. Unlock early access, PromoShare relevance, and stronger piece eligibility.',
    benefits: [
      { icon: Lock, text: 'Early access, 24 hours before public release' },
      { icon: Gift, text: 'PromoShare qualification expands' },
      { icon: Zap, text: 'Performance weight and standing improve' },
      { icon: Target, text: 'Reserve limited spots' },
    ],
  },
  {
    name: 'Mover',
    marks: 20,
    keys: 2,
    progress: 67,
    nextAction: 'Co-host, refer people in, and help moments grow beyond attendance.',
    nextHref: '/promoshare',
    nextLabel: 'Open PromoShare',
    color: 'bg-violet-50 border-violet-200 text-violet-950',
    iconColor: 'text-purple-600',
    selectedColor: 'bg-violet-600 text-white shadow-sm',
    earnings: 'Power performer',
    description: 'A community pillar. Co-host moments, grow a network, and unlock stronger performer-linked upside.',
    benefits: [
      { icon: Users, text: 'Co-host moments with hosts' },
      { icon: Zap, text: 'Power performer weight increases' },
      { icon: Star, text: 'Priority standing and seating' },
      { icon: Calendar, text: 'Influence moment scheduling and network pull' },
    ],
  },
  {
    name: 'Host',
    marks: '∞',
    keys: 3,
    progress: 100,
    nextAction: 'Create moments, set the value pool, and turn verified turnout into a repeatable engine.',
    nextHref: '/create-moment',
    nextLabel: 'Create a moment',
    color: 'bg-amber-50 border-amber-200 text-amber-950',
    iconColor: 'text-amber-600',
    selectedColor: 'bg-amber-500 text-slate-950 shadow-sm',
    earnings: 'Create & compound',
    description: 'Lead the community. Create moments, shape piece issuance, and earn from verified participant momentum.',
    benefits: [
      { icon: Palette, text: 'Create your own moments' },
      { icon: Gift, text: 'Set value pools and rewards' },
      { icon: BarChart3, text: 'Full host dashboard' },
      { icon: Handshake, text: 'Brand partnership access' },
    ],
  },
];

const trustSignals = [
  {
    title: 'Verified',
    description: 'Marks, check-ins, referrals, and content only count when tied to real participation.',
    metric: 'Proof first',
  },
  {
    title: 'Funded',
    description: 'Rewards, pools, and PromoShare cycles are bounded by actual hosts, campaigns, and platform activity.',
    metric: 'No vague upside',
  },
  {
    title: 'Capped',
    description: 'Scarcity, access, and payouts have limits so rewards stay meaningful and sustainable.',
    metric: 'Trust protected',
  },
];

const rewardTypes = [
  {
    icon: Coins,
    title: 'Points',
    value: 'Always',
    description: 'Earn points as you join moments, check in, share, refer, and keep showing up.',
    example: '+50 points per Mark',
    action: 'Join and verify a moment',
    unlocks: ['Participation record', 'Visible progress', 'Reward eligibility'],
    nextHref: '/explore/moments',
    nextLabel: 'Find a moment',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100',
    textColor: 'text-blue-950',
    mutedColor: 'text-blue-900/70',
  },
  {
    icon: Key,
    title: 'Keys',
    value: 'Tier Up',
    description: 'Use Keys to access better moments, limited spots, and experiences that open later.',
    example: '1 Key at 5 Marks',
    action: 'Build enough Marks to tier up',
    unlocks: ['Limited spots', 'Early access', 'Higher-intent offers'],
    nextHref: '/rewards',
    nextLabel: 'See rewards',
    color: 'text-violet-700',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-100',
    textColor: 'text-violet-950',
    mutedColor: 'text-violet-900/70',
  },
  {
    icon: Sparkles,
    title: 'Pieces',
    value: 'Complementary',
    description: 'Moments and content can issue complementary pieces to early participants and power performers based on verified movement and contribution.',
    example: 'Early participant and power performer pieces',
    action: 'Show up early or contribute signal',
    unlocks: ['Collectible participation', 'Moment identity', 'Performer-linked upside'],
    nextHref: '/pieces',
    nextLabel: 'Explore pieces',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-100',
    textColor: 'text-emerald-950',
    mutedColor: 'text-emerald-900/70',
  },
  {
    icon: Gift,
    title: 'PromoShare & Gems',
    value: 'Recurring',
    description: 'PromoShare turns verified actions into recurring reward eligibility, while Gems become the spendable and payout-safe unit across the platform.',
    example: 'Reward cycles, Gems, perks, VIP access',
    action: 'Complete qualified actions',
    unlocks: ['Reward cycles', 'Gems', 'Sponsor-funded upside'],
    nextHref: '/promoshare',
    nextLabel: 'Open PromoShare',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-100',
    textColor: 'text-amber-950',
    mutedColor: 'text-amber-900/70',
  },
];

export function ValueProposition() {
  const [activeTier, setActiveTier] = useState(0);
  const [activeReward, setActiveReward] = useState(0);
  const selectedReward = rewardTypes[activeReward];

  return (
    <section className="relative overflow-hidden bg-charcoal py-20 text-white md:py-32">
      <div className="absolute left-0 top-20 h-72 w-72 rounded-full bg-primary/20 blur-[100px]" />
      <div className="absolute bottom-40 right-0 h-80 w-80 rounded-full bg-accent/15 blur-[110px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="container relative z-10 px-6">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge className="mb-4 border border-primary/20 bg-primary/10 text-primary" variant="outline">
            <Sparkles className="w-3 h-3 mr-1" />
            The Value Engine
          </Badge>
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6 text-white">
            Real life should
            <br />
            <span className="text-gradient-primary">open doors for you.</span>
          </h2>
          <p className="text-lg leading-8 text-zinc-300">
            The places you visit, the moments you join, and the people you support should add up to something.
            Promorang turns showing up into a path toward perks, access, standing, complementary pieces, PromoShare entries, and Gems.
          </p>
        </div>

        <div className="mb-16 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur md:mb-20">
          <div className="grid lg:grid-cols-[0.42fr_0.58fr]">
            <div className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Choose a value layer</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {rewardTypes.map((reward, index) => (
                  <button
                    key={reward.title}
                    type="button"
                    onClick={() => setActiveReward(index)}
                    className={cn(
                      "flex items-center justify-between gap-4 rounded-2xl border p-4 text-left transition-[color,background-color,border-color,opacity,box-shadow,transform,filter]",
                      activeReward === index
                        ? "border-primary bg-primary text-primary-foreground shadow-glow"
                        : "border-white/10 bg-black/20 text-white hover:border-primary/40 hover:bg-white/[0.08]"
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", activeReward === index ? "bg-white/20" : "bg-black/30")}>
                        <reward.icon className={cn("h-5 w-5", activeReward === index ? "text-white" : reward.color)} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold">{reward.title}</p>
                        <p className={cn("text-xs", activeReward === index ? "text-primary-foreground/80" : "text-zinc-400")}>{reward.value}</p>
                      </div>
                    </div>
                    <ArrowRight className={cn("h-4 w-4 shrink-0 transition-transform", activeReward === index && "translate-x-1")} />
                  </button>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden p-6 sm:p-8">
              <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-primary/20 blur-[100px]" />
              <div className="relative z-10">
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className="border-white/15 bg-white/10 text-zinc-200">
                    {selectedReward.value}
                  </Badge>
                  <span className={`text-sm font-bold ${selectedReward.color}`}>{selectedReward.example}</span>
                </div>
                <h3 className="font-serif text-3xl font-bold text-white md:text-4xl">{selectedReward.title}</h3>
                <p className="mt-4 max-w-2xl text-base leading-8 text-zinc-300">{selectedReward.description}</p>

                <div className="mt-7 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">What you do</p>
                    <p className="mt-3 font-serif text-2xl font-bold text-white">{selectedReward.action}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">What opens</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedReward.unlocks.map((unlock) => (
                        <span key={unlock} className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-2 text-sm text-zinc-200">
                          {unlock}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Button variant="hero" className="mt-7" asChild>
                  <Link to={selectedReward.nextHref}>
                    {selectedReward.nextLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mb-16 max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-primary/80">Access Planner</p>
              <h3 className="mt-3 font-serif text-3xl font-bold text-white md:text-4xl">
                Choose where you are. See what moves you forward.
              </h3>
            </div>
            <p className="max-w-xl text-sm leading-7 text-zinc-300">
              Each tier shows what to do next, what opens now, and why higher-value rewards are protected.
            </p>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur">
            <div className="grid lg:grid-cols-[0.36fr_0.64fr]">
              <div className="border-b border-white/10 p-4 lg:border-b-0 lg:border-r">
                <div
                  className="grid gap-2 sm:grid-cols-4 lg:grid-cols-1"
                  role="tablist"
                  aria-label="Relationship tiers"
                >
                  {tiers.map((tier, index) => (
                    <button
                      key={tier.name}
                      type="button"
                      role="tab"
                      aria-selected={activeTier === index}
                      aria-controls="active-tier-panel"
                      onClick={() => setActiveTier(index)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        activeTier === index
                          ? "border-primary bg-primary text-primary-foreground shadow-glow"
                          : "border-white/10 bg-black/20 text-white hover:border-primary/40 hover:bg-white/[0.08]"
                      )}
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="font-bold">{tier.name}</span>
                        <span className={cn("rounded-full px-2.5 py-1 text-xs font-black", activeTier === index ? "bg-white/20" : "bg-white/10")}>
                          {typeof tier.marks === "number" ? `${tier.marks}+` : "Host"}
                        </span>
                      </div>
                      <p className={cn("text-xs leading-5", activeTier === index ? "text-primary-foreground/80" : "text-zinc-400")}>
                        {tier.earnings}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div id="active-tier-panel" role="tabpanel" className="relative overflow-hidden p-6 sm:p-8">
                <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-primary/20 blur-[100px]" />
                <div className="relative z-10">
                  <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                    <div>
                      <div className="mb-5 flex items-center gap-4">
                        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-primary ring-1 ring-white/15">
                          <Key className="h-8 w-8" />
                          {tiers[activeTier].keys > 0 && (
                            <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                              {tiers[activeTier].keys}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Current tier</p>
                          <h4 className="font-serif text-3xl font-bold text-white">{tiers[activeTier].name}</h4>
                        </div>
                      </div>

                      <p className="max-w-xl text-base leading-8 text-zinc-300">{tiers[activeTier].description}</p>

                      <div className="mt-7">
                        <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
                          <span>Access progress</span>
                          <span>{tiers[activeTier].progress}%</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-primary transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] duration-500"
                            style={{ width: `${tiers[activeTier].progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-5">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Next best move</p>
                        <p className="mt-3 font-serif text-2xl font-bold text-white">{tiers[activeTier].nextAction}</p>
                        <Button variant="hero" className="mt-5" asChild>
                          <Link to={tiers[activeTier].nextHref}>
                            {tiers[activeTier].nextLabel}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-5">
                        <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">What opens at this tier</p>
                        <div className="grid gap-3">
                          {tiers[activeTier].benefits.map((benefit) => (
                            <div key={benefit.text} className="flex items-start gap-3 rounded-xl bg-black/20 p-3 text-zinc-100">
                              <benefit.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                              <span className="text-sm leading-6">{benefit.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <Target className="mb-3 h-5 w-5 text-primary" />
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">Marks</p>
                          <p className="mt-1 text-sm text-zinc-200">You showed up</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <MapPin className="mb-3 h-5 w-5 text-primary" />
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">Venues</p>
                          <p className="mt-1 text-sm text-zinc-200">Places know you</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <Users className="mb-3 h-5 w-5 text-primary" />
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">Relations</p>
                          <p className="mt-1 text-sm text-zinc-200">People return</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 md:grid-cols-3">
                    {trustSignals.map((signal) => (
                      <div key={signal.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <p className="font-serif text-xl font-bold text-white">{signal.title}</p>
                          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                            {signal.metric}
                          </span>
                        </div>
                        <p className="text-sm leading-6 text-zinc-300">{signal.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-zinc-300 mb-4">
            Join your first moment. Leave your first Mark. Begin your story.
          </p>
          <Button size="lg" variant="hero" asChild>
            <Link to="/explore/moments">
              Explore Moments
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default ValueProposition;
