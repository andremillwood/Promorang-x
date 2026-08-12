import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import {
  ArrowRight,
  BarChart3,
  Calculator,
  CheckCircle,
  Clock,
  Compass,
  Eye,
  Flame,
  Handshake,
  HelpCircle,
  Play,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import CollapsibleSection from '@/react-app/components/CollapsibleSection';
import ExplainerModal, { ExplainerContent } from '@/react-app/components/ExplainerModal';

const opportunityCards = [
  {
    label: 'Creator drop',
    title: 'Support an upcoming short video release before it goes viral',
    meta: 'Instant reward',
    signal: '+38% backers',
    action: 'Back this drop',
    tone: 'from-orange-500 to-red-500'
  },
  {
    label: 'Brand task',
    title: 'Try out a local product & share your honest feedback',
    meta: 'Proof needed',
    signal: '5 days left',
    action: 'Join task',
    tone: 'from-blue-500 to-cyan-500'
  },
  {
    label: 'Weekend place',
    title: 'Attend a live pop-up venue and get exclusive perks',
    meta: 'Limited spots',
    signal: '82% claimed',
    action: 'Claim perk',
    tone: 'from-emerald-500 to-teal-500'
  }
];

const stakeholderPaths = [
  {
    icon: Sparkles,
    title: 'Creators & Artists',
    outcome: 'Turn your passion and drops into early funding and real fans.',
    proof: 'Get backed before launching, grow repeat supporters, and share success.',
    cta: 'Share your drop'
  },
  {
    icon: Users,
    title: 'Community & Earners',
    outcome: 'Discover fun things to do, support creators, and earn real rewards.',
    proof: 'Simple tasks, instant perks, saved rewards, clear wallet balance.',
    cta: 'Browse tasks'
  },
  {
    icon: Target,
    title: 'Brands & Businesses',
    outcome: 'Get real people taking real actions instead of paying for fake clicks.',
    proof: 'Photo proof, completion dashboards, authentic user reviews.',
    cta: 'Start a campaign'
  },
  {
    icon: Handshake,
    title: 'Local Hosts & Venues',
    outcome: 'Bring foot traffic to your physical store or event venue.',
    proof: 'Check-in proof, coupon redemptions, returning customer rewards.',
    cta: 'List your venue'
  }
];

const successFactors = [
  { icon: Eye, label: 'Super Simple', text: 'Clear tasks so you always know what to do and what you get.' },
  { icon: Shield, label: 'Fair & Verified', text: 'Rules and rewards are shown upfront before you begin.' },
  { icon: BarChart3, label: 'Real Results', text: 'Creators and brands see authentic engagement from real people.' },
  { icon: CheckCircle, label: 'Keep What You Earn', text: 'Your rewards, gems, and perks are saved securely in your wallet.' }
];

const pathTabs = [
  {
    id: 'participants',
    label: 'Earners & Fans',
    headline: 'Find tasks, creator drops, and local spots that pay you back.',
    copy: 'Browse reward payouts, time limits, and simple proof steps before committing. It is as easy as choosing what sounds fun.',
    actions: ['Complete simple tasks', 'Support creator drops early', 'Save perks to your wallet'],
    cta: 'Start earning now'
  },
  {
    id: 'creators',
    label: 'Creators',
    headline: 'Launch your content with early support from real fans.',
    copy: 'Get funding before you publish, build a loyal community, and share the upside of your success.',
    actions: ['Fund upcoming content', 'Share growth with fans', 'Turn followers into true supporters'],
    cta: 'Share a project'
  },
  {
    id: 'brands',
    label: 'Brands',
    headline: 'Get real customer actions instead of hoping ads work.',
    copy: 'Know exactly what you spend: verified photos, real foot traffic, user reviews, and clear results dashboards.',
    actions: ['100 real people campaigns', 'Verified photo proof', 'User-generated content'],
    cta: 'Launch a campaign'
  },
  {
    id: 'hosts',
    label: 'Local Venues',
    headline: 'Turn foot traffic into loyal customers for your local business.',
    copy: 'Welcome new guests into your venue with check-in deals, instant digital coupons, and fun rewards.',
    actions: ['In-person check-ins', 'Redeemable venue perks', 'Community loyalty'],
    cta: 'Promote your venue'
  }
];

const earningMechanics = [
  {
    icon: Zap,
    title: 'Support Drops',
    description: 'Back upcoming creator videos or music and share the rewards.',
    signal: '$25 avg reward',
    tone: 'bg-blue-50 text-blue-700 border-blue-100'
  },
  {
    icon: TrendingUp,
    title: 'Share & Grow',
    description: 'Own pieces of popular creator drops and earn as they grow.',
    signal: 'High growth potential',
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-100'
  },
  {
    icon: Target,
    title: 'Spot Trends Early',
    description: 'Discover trending videos and tasks before everyone else.',
    signal: 'Easy start',
    tone: 'bg-violet-50 text-violet-700 border-violet-100'
  },
  {
    icon: Users,
    title: 'Complete Missions',
    description: 'Help local brands and hosts run successful community events.',
    signal: 'Instant payouts',
    tone: 'bg-orange-50 text-orange-700 border-orange-100'
  }
];

const calculatorPackages = [
  {
    id: 'starter',
    label: 'Starter Pack',
    price: 25000,
    actions: 100,
    ugc: '10-20 customer posts',
    delivery: '5 days',
    proof: 'Verified photo dashboard'
  },
  {
    id: 'growth',
    label: 'Growth Boost',
    price: 120000,
    actions: 750,
    ugc: 'Venue visits & posts',
    delivery: '7-14 days',
    proof: 'Targeted local reach'
  },
  {
    id: 'scale',
    label: 'City Takeover',
    price: 300000,
    actions: 2200,
    ugc: 'Full content library',
    delivery: '30 days',
    proof: 'Sales & loyalty analytics'
  }
];

const platformSignals = ['Instagram', 'TikTok', 'YouTube', 'X', 'LinkedIn', 'Facebook'];

const proofStories = [
  {
    name: 'Sarah Chen',
    role: 'Creator',
    result: '$247',
    label: 'first month',
    quote: 'I got funding from supporters before launching my first video. It gave me the confidence to create!'
  },
  {
    name: 'Mike Rodriguez',
    role: 'Earner',
    result: '$384',
    label: 'in 2 months',
    quote: 'I love seeing what tasks are available near me, completing them in minutes, and watching my earnings grow.'
  },
  {
    name: 'Local Coffee Co.',
    role: 'Local Merchant',
    result: '100+',
    label: 'real customers',
    quote: 'We got actual foot traffic into our cafe instead of spending money on online ads that bring no one in.'
  }
];

const howItWorksExplainer: ExplainerContent = {
  title: 'How Promorang Works',
  subtitle: 'A simple way to discover fun tasks, support creators, and get rewarded for real actions.',
  badge: 'Simple Step-by-Step Guide',
  steps: [
    {
      number: '1',
      title: 'Discover what is open',
      description: 'Browse tasks, creator drops, and local venue perks. Filter by what pays best or what sounds fun to you.',
      tip: 'New drops and local tasks are added daily!'
    },
    {
      number: '2',
      title: 'Pick an action',
      description: 'Choose a task you want to do: try out a product, check in at a venue, or support a creator video early.',
    },
    {
      number: '3',
      title: 'Show quick proof',
      description: 'Upload a quick screenshot, photo, or check-in to confirm you completed the action.',
      tip: 'Verification usually takes under 60 seconds.'
    },
    {
      number: '4',
      title: 'Collect & keep your rewards',
      description: 'Your cash earnings, gems, and perks land straight in your wallet. Use them or cash out whenever you like!',
    }
  ],
  ctaText: 'Start Exploring Now'
};

export default function Home() {
  const { user, isPending, redirectToLogin } = useAuth();
  const navigate = useNavigate();
  const [activePath, setActivePath] = useState(pathTabs[0]);
  const [selectedPackage, setSelectedPackage] = useState(calculatorPackages[0]);
  const [explainerOpen, setExplainerOpen] = useState(false);
  const [activeStats, setActiveStats] = useState({
    earners: 127,
    payout: 0.3,
    opportunities: 18
  });

  const marketStrip = useMemo(() => [
    { label: 'Open tasks now', value: activeStats.opportunities.toString(), change: '+4 added today' },
    { label: 'Active members', value: activeStats.earners.toLocaleString(), change: 'joining daily' },
    { label: 'Rewards paid', value: `${activeStats.payout.toFixed(1)}k gems`, change: 'to community' },
    { label: 'Proof success rate', value: '95%', change: 'verified' }
  ], [activeStats]);

  const calculatorResults = useMemo(() => {
    const costPerAction = Math.round(selectedPackage.price / selectedPackage.actions);
    const estimatedReach = selectedPackage.actions * 8;

    return {
      costPerAction,
      estimatedReach,
      proofValue: selectedPackage.actions >= 1000 ? 'Advanced' : 'Verified'
    };
  }, [selectedPackage]);

  useEffect(() => {
    if (!isPending && user) {
      navigate('/home');
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStats(prev => ({
        earners: prev.earners + Math.floor(Math.random() * 4),
        payout: prev.payout + Math.random() * 0.06,
        opportunities: Math.min(prev.opportunities + Math.floor(Math.random() * 2), 32)
      }));
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
          <p className="font-medium text-slate-300">Loading Promorang...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ec] text-slate-950">
      <ExplainerModal
        isOpen={explainerOpen}
        onClose={() => setExplainerOpen(false)}
        content={{
          ...howItWorksExplainer,
          onCtaClick: () => redirectToLogin()
        }}
      />

      <nav className="sticky top-0 z-50 border-b border-slate-900/10 bg-[#f7f3ec]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <img
            src="https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_extended-03.png"
            alt="Promorang"
            className="h-8 w-auto"
          />
          <div className="hidden items-center gap-7 md:flex">
            <a href="#discover" className="text-sm font-semibold text-slate-700 hover:text-slate-950">Live Tasks</a>
            <a href="#paths" className="text-sm font-semibold text-slate-700 hover:text-slate-950">Who it's for</a>
            <a href="#how-it-works" className="text-sm font-semibold text-slate-700 hover:text-slate-950">How it works</a>
            <a href="#calculator" className="text-sm font-semibold text-slate-700 hover:text-slate-950">For Business</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setExplainerOpen(true)} className="hidden sm:inline-flex items-center text-sm font-semibold text-orange-700 hover:text-orange-900 gap-1">
              <HelpCircle className="w-4 h-4" />
              How it works
            </button>
            <button onClick={() => redirectToLogin()} className="text-sm font-semibold text-slate-700 hover:text-slate-950">
              Sign in
            </button>
            <button
              onClick={() => redirectToLogin()}
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Start Earning
            </button>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative overflow-hidden border-b border-slate-900/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.22),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.18),transparent_30%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
            <div className="flex flex-col justify-center">
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-4 py-2 text-sm font-bold text-slate-800 shadow-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                Discover fun tasks, support creators, earn real rewards
              </div>
              <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                Get paid to do things you already love.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700 sm:text-xl">
                Explore local deals, back creators before they trend, complete quick tasks, and keep the money and perks you earn.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => redirectToLogin()}
                  className="group inline-flex items-center justify-center rounded-full bg-orange-600 px-7 py-4 text-base font-black text-white shadow-xl shadow-orange-600/20 transition hover:-translate-y-0.5 hover:bg-orange-700"
                >
                  Start earning now
                  <ArrowRight className="ml-2 h-5 w-5 transition group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => setExplainerOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-900/15 bg-white/80 px-6 py-4 text-base font-black text-slate-950 transition hover:bg-white"
                >
                  <HelpCircle className="h-5 w-5 text-orange-600" />
                  How it works
                </button>
              </div>
            </div>

            <div id="discover" className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-3 shadow-2xl shadow-slate-950/20">
              <div className="flex items-center justify-between border-b border-white/10 px-3 py-3 text-white">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-300">Live opportunities</p>
                  <h2 className="text-xl font-black">Open right now</h2>
                </div>
                <div className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 text-xs font-bold">
                  🔥 HOT
                </div>
              </div>
              <div className="space-y-3 p-2">
                {opportunityCards.map((card) => (
                  <article key={card.title} className="group rounded-3xl bg-white p-4 transition hover:-translate-y-1">
                    <div className={`mb-4 h-2 rounded-full bg-gradient-to-r ${card.tone}`} />
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
                        <h3 className="mt-2 text-xl font-black leading-tight text-slate-950">{card.title}</h3>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{card.signal}</span>
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-500">
                        <Clock className="h-4 w-4" />
                        {card.meta}
                      </span>
                      <button onClick={() => redirectToLogin()} className="inline-flex items-center text-sm font-black text-orange-700">
                        {card.action}
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="relative border-t border-slate-900/10 bg-white/60">
            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-4 sm:px-6 md:grid-cols-4 lg:px-8">
              {marketStrip.map((item) => (
                <div key={item.label} className="px-4 py-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">{item.value}</p>
                  <p className="text-sm font-bold text-emerald-700">{item.change}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Collapsible Explanations & Journeys */}
        <section id="paths" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <CollapsibleSection
              badge="Explore journeys"
              title="Four easy ways to join Promorang"
              subtitle="Whether you want to earn extra income, launch creative projects, or bring real customers to your store."
              promptText="Tap to view role details & options"
              defaultOpen={true}
              icon={Sparkles}
            >
              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] pt-2">
                <div>
                  <h4 className="text-2xl font-black text-slate-950">Choose what matches your goals</h4>
                  <p className="mt-3 text-base leading-relaxed text-slate-700">
                    You don't need a huge social following to start. Pick your path below to see what you get and how to start.
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-900/10 bg-[#f7f3ec] p-4">
                  <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                    {pathTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActivePath(tab)}
                        className={`rounded-2xl px-3 py-3 text-xs font-black transition ${
                          activePath.id === tab.id
                            ? 'bg-slate-950 text-white shadow-lg'
                            : 'bg-white text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
                    <h5 className="text-2xl font-black leading-tight text-slate-950">{activePath.headline}</h5>
                    <p className="mt-3 text-sm leading-relaxed text-slate-700">{activePath.copy}</p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {activePath.actions.map((action) => (
                        <div key={action} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                          <CheckCircle className="mb-2 h-4 w-4 text-emerald-600" />
                          <p className="text-xs font-bold leading-snug text-slate-800">{action}</p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => activePath.id === 'brands' || activePath.id === 'hosts' ? navigate('/activate') : redirectToLogin()}
                      className="mt-5 inline-flex items-center rounded-full bg-orange-600 px-6 py-3 text-xs font-black text-white transition hover:bg-orange-700"
                    >
                      {activePath.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {earningMechanics.map((mechanic) => {
                  const Icon = mechanic.icon;
                  return (
                    <article key={mechanic.title} className={`rounded-2xl border p-5 ${mechanic.tone}`}>
                      <Icon className="mb-3 h-6 w-6" />
                      <h5 className="text-lg font-black text-slate-950">{mechanic.title}</h5>
                      <p className="mt-2 text-xs leading-relaxed text-slate-700">{mechanic.description}</p>
                      <p className="mt-4 text-xs font-black">{mechanic.signal}</p>
                    </article>
                  );
                })}
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              id="how-it-works"
              badge="How it works"
              title="Simple 4-step process from discovery to payout"
              subtitle="No confusing rules. You see the reward upfront, complete the task, and keep the earnings."
              promptText="Tap to expand step-by-step breakdown"
              defaultOpen={false}
              icon={Compass}
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2">
                {[
                  ['1. Find a task', 'Browse open drops, venue check-ins, or brand missions.', Compass],
                  ['2. Complete action', 'Follow simple instructions like sharing a photo or checking in.', Play],
                  ['3. Show quick proof', 'Upload a simple screenshot or location confirmation.', Zap],
                  ['4. Collect rewards', 'Get your cash, gems, and perks deposited right into your wallet.', Flame]
                ].map(([title, text, Icon], index) => {
                  const StepIcon = Icon as typeof Compass;
                  return (
                    <div key={title as string} className="rounded-2xl border border-slate-900/10 bg-slate-50 p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <StepIcon className="h-6 w-6 text-orange-600" />
                        <span className="text-xs font-black text-slate-400">STEP 0{index + 1}</span>
                      </div>
                      <h5 className="text-lg font-black text-slate-950">{title as string}</h5>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600">{text as string}</p>
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              id="calculator"
              badge="For Businesses & Brands"
              title="Estimate your campaign results & pricing"
              subtitle="See how many real customer actions and verified posts your budget gets before committing."
              promptText="Tap to view package breakdown & calculator"
              defaultOpen={false}
              icon={Calculator}
            >
              <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr] pt-2">
                <div className="grid gap-4 md:grid-cols-3">
                  {calculatorPackages.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedPackage(item)}
                      className={`rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 ${
                        selectedPackage.id === item.id
                          ? 'border-orange-500 bg-orange-50 shadow-md'
                          : 'border-slate-900/10 bg-[#f7f3ec] hover:border-slate-900/25'
                      }`}
                    >
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{item.delivery}</p>
                      <h5 className="mt-2 text-xl font-black text-slate-950">{item.label}</h5>
                      <p className="mt-2 text-2xl font-black text-orange-700">JMD ${item.price.toLocaleString()}</p>
                      <div className="mt-4 space-y-2 text-xs font-bold text-slate-700">
                        <p>{item.actions.toLocaleString()} real customer actions</p>
                        <p>{item.ugc}</p>
                        <p>{item.proof}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-xl">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                      <Calculator className="h-5 w-5 text-orange-300" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">Package preview</p>
                      <h5 className="text-xl font-black">{selectedPackage.label}</h5>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-white/10 p-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Cost per action</p>
                      <p className="mt-1 text-2xl font-black">JMD ${calculatorResults.costPerAction}</p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Estimated audience</p>
                      <p className="mt-1 text-2xl font-black">{calculatorResults.estimatedReach.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Proof type</p>
                      <p className="mt-1 text-2xl font-black">{calculatorResults.proofValue}</p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Delivery time</p>
                      <p className="mt-1 text-2xl font-black">{selectedPackage.delivery}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => redirectToLogin()}
                    className="mt-5 flex w-full items-center justify-center rounded-full bg-white px-5 py-3 font-black text-slate-950 transition hover:bg-slate-100"
                  >
                    Launch this package
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        </section>

        {/* Social Proof */}
        <section className="bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-700">Real stories</p>
                <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Hear from everyday members and local partners.</h2>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                  <p className="text-2xl font-black text-emerald-700">{activeStats.earners.toLocaleString()}</p>
                  <p className="text-xs font-bold text-emerald-900">Active members</p>
                </div>
                <div className="rounded-2xl bg-orange-50 px-4 py-3">
                  <p className="text-2xl font-black text-orange-700">${activeStats.payout.toFixed(1)}k</p>
                  <p className="text-xs font-bold text-orange-900">Earned so far</p>
                </div>
                <div className="rounded-2xl bg-blue-50 px-4 py-3">
                  <p className="text-2xl font-black text-blue-700">4.8 / 5</p>
                  <p className="text-xs font-bold text-blue-900">Member rating</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {proofStories.map((story) => (
                <article key={story.name} className="rounded-3xl border border-slate-900/10 bg-[#f7f3ec] p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-slate-950">{story.name}</h3>
                      <p className="text-xs font-bold text-slate-500">{story.role}</p>
                    </div>
                    <div className="rounded-2xl bg-white px-3 py-2 text-right">
                      <p className="text-xl font-black text-orange-700">{story.result}</p>
                      <p className="text-[10px] font-bold text-slate-500">{story.label}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700">"{story.quote}"</p>
                  <div className="mt-4 flex text-orange-500">
                    {[...Array(5)].map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[2rem] bg-orange-600 px-6 py-10 text-white shadow-2xl shadow-orange-600/20 sm:px-10 lg:flex lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Ready to start earning?</h2>
              <p className="mt-2 max-w-2xl text-orange-50">Join thousands of creators, fans, and local venues already building together.</p>
            </div>
            <button
              onClick={() => redirectToLogin()}
              className="mt-6 inline-flex items-center rounded-full bg-white px-7 py-4 font-black text-orange-700 transition hover:-translate-y-0.5 lg:mt-0"
            >
              Get Started Free
              <TrendingUp className="ml-2 h-5 w-5" />
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-900/10 bg-white/50 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-slate-600 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-4">
            <img
              src="https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_extended-03.png"
              alt="Promorang"
              className="h-7 w-auto"
            />
            <span>Discover, act, and keep your rewards.</span>
          </div>
          <div className="flex gap-6 font-semibold text-xs">
            <a href="#discover" className="hover:text-slate-950">Live Tasks</a>
            <a href="#paths" className="hover:text-slate-950">Who it's for</a>
            <a href="#how-it-works" className="hover:text-slate-950">How it works</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
