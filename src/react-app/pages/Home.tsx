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
  Play,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';

const opportunityCards = [
  {
    label: 'Creator moment',
    title: 'A short-form drop is gaining early velocity',
    meta: 'Open for backers',
    signal: '+38% saves',
    action: 'Back the moment',
    tone: 'from-orange-500 to-red-500'
  },
  {
    label: 'Brand mission',
    title: 'A local launch needs verified attention',
    meta: 'Proof required',
    signal: '5 day sprint',
    action: 'Join the mission',
    tone: 'from-blue-500 to-cyan-500'
  },
  {
    label: 'Place activation',
    title: 'A weekend experience is filling fast',
    meta: 'Limited spots',
    signal: '82% claimed',
    action: 'Reserve a role',
    tone: 'from-emerald-500 to-teal-500'
  }
];

const stakeholderPaths = [
  {
    icon: Sparkles,
    title: 'Creators',
    outcome: 'Turn attention into funded momentum.',
    proof: 'Pre-launch backing, social proof, repeat supporters',
    cta: 'Create a moment'
  },
  {
    icon: Users,
    title: 'Participants',
    outcome: 'Discover things worth doing, sharing, and backing.',
    proof: 'Missions, rewards, saved value, visible progress',
    cta: 'Browse opportunities'
  },
  {
    icon: Target,
    title: 'Brands',
    outcome: 'Buy verified action instead of vague impressions.',
    proof: 'Proof capture, completion quality, campaign dashboards',
    cta: 'Launch a campaign'
  },
  {
    icon: Handshake,
    title: 'Hosts and merchants',
    outcome: 'Convert local moments into foot traffic and loyalty.',
    proof: 'Check-ins, redemptions, community memory',
    cta: 'Activate a place'
  }
];

const successFactors = [
  { icon: Eye, label: 'Discoverable', text: 'Every card shows what it is, who it helps, and the next action.' },
  { icon: Shield, label: 'Verifiable', text: 'Proof, status, and reward rules are visible before commitment.' },
  { icon: BarChart3, label: 'Measurable', text: 'Creators and brands see momentum, completion, and value returned.' },
  { icon: CheckCircle, label: 'Retainable', text: 'Wallet, saved items, and achievements give every journey a reason to return.' }
];

const pathTabs = [
  {
    id: 'participants',
    label: 'Participants',
    headline: 'Find tasks, moments, and places that are worth your next move.',
    copy: 'Browse rewards, proof requirements, timelines, and upside before you commit. The product should feel like a market of choices, not a maze of panels.',
    actions: ['Join proof missions', 'Back creator moments', 'Save rewards to Vault'],
    cta: 'Start earning'
  },
  {
    id: 'creators',
    label: 'Creators',
    headline: 'Launch moments with early backing and visible momentum.',
    copy: 'Creators need pre-launch signal, funding, repeat supporters, and a path from content to community value.',
    actions: ['Fund upcoming drops', 'Sell momentum shares', 'Convert supporters into advocates'],
    cta: 'Create a moment'
  },
  {
    id: 'brands',
    label: 'Brands',
    headline: 'Buy verified action instead of hoping impressions turn into intent.',
    copy: 'Commercial users need pricing clarity, proof dashboards, UGC rights, and confidence that real people completed real actions.',
    actions: ['100 real people campaigns', 'Proof capture and dashboards', 'UGC and local activation'],
    cta: 'Launch campaign'
  },
  {
    id: 'hosts',
    label: 'Hosts',
    headline: 'Turn local energy into check-ins, memories, and repeat visits.',
    copy: 'Hosts and merchants need discovery, foot traffic, redemptions, and a reason for people to come back after the event.',
    actions: ['Place activations', 'Reward redemptions', 'Community memory capture'],
    cta: 'Activate a place'
  }
];

const earningMechanics = [
  {
    icon: Zap,
    title: 'Fuel the Moment',
    description: 'Boost upcoming content and earn participation rewards.',
    signal: '$25 avg',
    tone: 'bg-blue-50 text-blue-700 border-blue-100'
  },
  {
    icon: TrendingUp,
    title: 'Equity Trading',
    description: 'Own permanent shares of viral moments and follow the upside.',
    signal: '12.5% ROI',
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-100'
  },
  {
    icon: Target,
    title: 'Social Arbitrage',
    description: 'Spot early signals and predict which moments will trend next.',
    signal: '87% win rate',
    tone: 'bg-violet-50 text-violet-700 border-violet-100'
  },
  {
    icon: Users,
    title: 'Moment Scaling',
    description: 'Help brands and hosts turn ideas into measurable movement.',
    signal: 'Direct rewards',
    tone: 'bg-orange-50 text-orange-700 border-orange-100'
  }
];

const calculatorPackages = [
  {
    id: 'starter',
    label: 'Hero Bundle',
    price: 25000,
    actions: 100,
    ugc: '10-20 UGC pieces',
    delivery: '5 days',
    proof: 'Full proof dashboard'
  },
  {
    id: 'growth',
    label: 'Customer Activation',
    price: 120000,
    actions: 750,
    ugc: 'Multi-day venue proof',
    delivery: '7-14 days',
    proof: 'Advanced audience targeting'
  },
  {
    id: 'scale',
    label: 'Market Movement',
    price: 300000,
    actions: 2200,
    ugc: 'Campaign content library',
    delivery: '30 days',
    proof: 'ROI and retention reporting'
  }
];

const platformSignals = ['Instagram', 'TikTok', 'YouTube', 'X', 'LinkedIn', 'Facebook'];

const proofStories = [
  {
    name: 'Sarah Chen',
    role: 'Early creator',
    result: '$247',
    label: 'first month',
    quote: 'Made money before I had a large audience because people could back the idea early.'
  },
  {
    name: 'Mike Rodriguez',
    role: 'Participant',
    result: '$384',
    label: '2 months',
    quote: 'The best part is seeing what is open now, what proof is needed, and what I keep after.'
  },
  {
    name: 'Local Coffee Co.',
    role: 'Brand partner',
    result: '100+',
    label: 'verified actions',
    quote: 'We needed authentic local activity, not another abstract impressions report.'
  }
];

export default function Home() {
  const { user, isPending, redirectToLogin } = useAuth();
  const navigate = useNavigate();
  const [activePath, setActivePath] = useState(pathTabs[0]);
  const [selectedPackage, setSelectedPackage] = useState(calculatorPackages[0]);
  const [activeStats, setActiveStats] = useState({
    earners: 127,
    payout: 0.3,
    opportunities: 18
  });

  const marketStrip = useMemo(() => [
    { label: 'Live opportunities', value: activeStats.opportunities.toString(), change: '+4 today' },
    { label: 'Early members', value: activeStats.earners.toLocaleString(), change: 'growing' },
    { label: 'Weekly value', value: `${activeStats.payout.toFixed(1)}k gems`, change: 'paid out' },
    { label: 'Proof rate', value: '95%', change: 'verified' }
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
      <nav className="sticky top-0 z-50 border-b border-slate-900/10 bg-[#f7f3ec]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <img
            src="https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_extended-03.png"
            alt="Promorang"
            className="h-8 w-auto"
          />
          <div className="hidden items-center gap-7 md:flex">
            <a href="#discover" className="text-sm font-semibold text-slate-700 hover:text-slate-950">Discover</a>
            <a href="#mechanics" className="text-sm font-semibold text-slate-700 hover:text-slate-950">Earn</a>
            <a href="#calculator" className="text-sm font-semibold text-slate-700 hover:text-slate-950">Calculator</a>
            <a href="#paths" className="text-sm font-semibold text-slate-700 hover:text-slate-950">Journeys</a>
            <a href="#trust" className="text-sm font-semibold text-slate-700 hover:text-slate-950">Success factors</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => redirectToLogin()} className="text-sm font-semibold text-slate-700 hover:text-slate-950">
              Sign in
            </button>
            <button
              onClick={() => redirectToLogin()}
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Enter market
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
                Live discovery, verified action, shared upside
              </div>
              <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                Scroll the moments worth acting on.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700 sm:text-xl">
                Promorang turns campaigns, creator drops, places, and community missions into a discovery market where people can choose what to back, prove what they did, and keep the value they helped create.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => redirectToLogin()}
                  className="group inline-flex items-center justify-center rounded-full bg-orange-600 px-7 py-4 text-base font-black text-white shadow-xl shadow-orange-600/20 transition hover:-translate-y-0.5 hover:bg-orange-700"
                >
                  Start discovering
                  <ArrowRight className="ml-2 h-5 w-5 transition group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => navigate('/activate')}
                  className="inline-flex items-center justify-center rounded-full border border-slate-900/15 bg-white/75 px-7 py-4 text-base font-black text-slate-950 transition hover:border-slate-950"
                >
                  Build a campaign
                </button>
              </div>
            </div>

            <div id="discover" className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-3 shadow-2xl shadow-slate-950/20">
              <div className="flex items-center justify-between border-b border-white/10 px-3 py-3 text-white">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-300">Pulse board</p>
                  <h2 className="text-xl font-black">Open now</h2>
                </div>
                <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">LIVE</div>
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

        <section id="mechanics" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-700">Choose your path</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">The marketing promise stays: multiple ways to earn, create, activate, and grow.</h2>
              <p className="mt-4 text-lg leading-8 text-slate-700">
                The platform should preserve the strong conversion copy while making it easier to scan, compare, and act. These are not explanation panels anymore; they are entry points.
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-900/10 bg-white p-3 shadow-xl shadow-slate-950/5">
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                {pathTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePath(tab)}
                    className={`rounded-2xl px-3 py-3 text-sm font-black transition ${
                      activePath.id === tab.id
                        ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/15'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 rounded-[1.5rem] bg-[#f7f3ec] p-6">
                <h3 className="text-3xl font-black leading-tight text-slate-950">{activePath.headline}</h3>
                <p className="mt-4 text-base leading-7 text-slate-700">{activePath.copy}</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {activePath.actions.map((action) => (
                    <div key={action} className="rounded-2xl border border-slate-900/10 bg-white p-4">
                      <CheckCircle className="mb-3 h-5 w-5 text-emerald-600" />
                      <p className="text-sm font-bold leading-5 text-slate-800">{action}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => activePath.id === 'brands' || activePath.id === 'hosts' ? navigate('/activate') : redirectToLogin()}
                  className="mt-6 inline-flex items-center rounded-full bg-orange-600 px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-orange-700"
                >
                  {activePath.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {earningMechanics.map((mechanic) => {
              const Icon = mechanic.icon;
              return (
                <article key={mechanic.title} className={`rounded-3xl border p-6 ${mechanic.tone}`}>
                  <Icon className="mb-5 h-8 w-8" />
                  <h3 className="text-xl font-black text-slate-950">{mechanic.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{mechanic.description}</p>
                  <p className="mt-5 text-sm font-black">{mechanic.signal}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="calculator" className="bg-white py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-700">Commercial calculator</p>
                <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Keep the pricing clarity. Make the outcome obvious.</h2>
                <p className="mt-4 text-lg leading-8 text-slate-700">
                  Brands need a concrete starting point: price, actions, proof, delivery, and expected value before they talk to anyone.
                </p>
              </div>
              <button
                onClick={() => navigate('/activate')}
                className="inline-flex items-center justify-center rounded-full border border-slate-900/15 bg-slate-950 px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5"
              >
                See business page
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
              <div className="grid gap-4 md:grid-cols-3">
                {calculatorPackages.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedPackage(item)}
                    className={`rounded-3xl border p-6 text-left transition hover:-translate-y-1 ${
                      selectedPackage.id === item.id
                        ? 'border-orange-500 bg-orange-50 shadow-xl shadow-orange-600/10'
                        : 'border-slate-900/10 bg-[#f7f3ec] hover:border-slate-900/25'
                    }`}
                  >
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">{item.delivery}</p>
                    <h3 className="mt-3 text-2xl font-black text-slate-950">{item.label}</h3>
                    <p className="mt-3 text-3xl font-black text-orange-700">JMD ${item.price.toLocaleString()}</p>
                    <div className="mt-5 space-y-3 text-sm font-bold text-slate-700">
                      <p>{item.actions.toLocaleString()} verified actions</p>
                      <p>{item.ugc}</p>
                      <p>{item.proof}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/20">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <Calculator className="h-6 w-6 text-orange-300" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">Estimate</p>
                    <h3 className="text-2xl font-black">{selectedPackage.label}</h3>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Cost/action</p>
                    <p className="mt-2 text-3xl font-black">JMD ${calculatorResults.costPerAction}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Est. reach</p>
                    <p className="mt-2 text-3xl font-black">{calculatorResults.estimatedReach.toLocaleString()}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Proof</p>
                    <p className="mt-2 text-3xl font-black">{calculatorResults.proofValue}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Delivery</p>
                    <p className="mt-2 text-3xl font-black">{selectedPackage.delivery}</p>
                  </div>
                </div>

                <button
                  onClick={() => redirectToLogin()}
                  className="mt-6 flex w-full items-center justify-center rounded-full bg-white px-6 py-4 font-black text-slate-950 transition hover:-translate-y-0.5"
                >
                  Launch this package
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="paths" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-700">Stakeholder journeys</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">One platform, four reasons to care.</h2>
            <p className="mt-4 text-lg leading-8 text-slate-700">
              The product should meet each stakeholder with an action, not a lecture: discover, create, verify, measure, and come back.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stakeholderPaths.map((path) => {
              const Icon = path.icon;
              return (
                <article key={path.title} className="rounded-3xl border border-slate-900/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-950">{path.title}</h3>
                  <p className="mt-3 text-base font-semibold leading-7 text-slate-800">{path.outcome}</p>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{path.proof}</p>
                  <button onClick={() => redirectToLogin()} className="mt-6 inline-flex items-center text-sm font-black text-orange-700">
                    {path.cta}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="bg-slate-950 py-16 text-white lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-300">How it behaves</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">From browsing to proof in one loop.</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Discover', 'Browse live opportunities by role, reward, urgency, and proof needed.', Compass],
                ['Choose', 'Commit to a mission, moment, campaign, or place with clear expectations.', Play],
                ['Act', 'Complete the social, local, or creative task with guided proof capture.', Zap],
                ['Keep value', 'Track earnings, status, memories, and next-best actions in the wallet.', Flame]
              ].map(([title, text, Icon], index) => {
                const StepIcon = Icon as typeof Compass;
                return (
                  <div key={title as string} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="mb-5 flex items-center justify-between">
                      <StepIcon className="h-6 w-6 text-orange-300" />
                      <span className="text-sm font-black text-white/40">0{index + 1}</span>
                    </div>
                    <h3 className="text-xl font-black">{title as string}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{text as string}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-slate-900/10 bg-[#f7f3ec] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-700">Platform reach</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Creators earn across the channels people already use.</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {platformSignals.map((platform) => (
                <div key={platform} className="rounded-3xl border border-slate-900/10 bg-white p-5 text-center shadow-sm">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">
                    {platform.slice(0, 2).toUpperCase()}
                  </div>
                  <p className="text-sm font-black text-slate-800">{platform}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-700">Social proof</p>
                <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Real people, real results, now framed as a product loop.</h2>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                  <p className="text-2xl font-black text-emerald-700">{activeStats.earners.toLocaleString()}</p>
                  <p className="text-xs font-bold text-emerald-900">Early adopters</p>
                </div>
                <div className="rounded-2xl bg-orange-50 px-4 py-3">
                  <p className="text-2xl font-black text-orange-700">${activeStats.payout.toFixed(1)}k</p>
                  <p className="text-xs font-bold text-orange-900">Paid out</p>
                </div>
                <div className="rounded-2xl bg-blue-50 px-4 py-3">
                  <p className="text-2xl font-black text-blue-700">4.8</p>
                  <p className="text-xs font-bold text-blue-900">Rating</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {proofStories.map((story) => (
                <article key={story.name} className="rounded-3xl border border-slate-900/10 bg-[#f7f3ec] p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-slate-950">{story.name}</h3>
                      <p className="text-sm font-bold text-slate-500">{story.role}</p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 text-right">
                      <p className="text-2xl font-black text-orange-700">{story.result}</p>
                      <p className="text-xs font-bold text-slate-500">{story.label}</p>
                    </div>
                  </div>
                  <p className="text-base leading-7 text-slate-700">"{story.quote}"</p>
                  <div className="mt-5 flex text-orange-500">
                    {[...Array(5)].map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="trust" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.25fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-700">Success factors</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Design standards for the platform, not just the page.</h2>
              <p className="mt-4 text-lg leading-8 text-slate-700">
                A stronger Promorang should help people scan quickly, trust what they see, and understand why their next action matters.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {successFactors.map((factor) => {
                const Icon = factor.icon;
                return (
                  <div key={factor.label} className="rounded-3xl border border-slate-900/10 bg-white p-6">
                    <Icon className="mb-5 h-7 w-7 text-orange-600" />
                    <h3 className="text-xl font-black text-slate-950">{factor.label}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{factor.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[2rem] bg-orange-600 px-6 py-10 text-white shadow-2xl shadow-orange-600/20 sm:px-10 lg:flex lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Ready to enter the live market?</h2>
              <p className="mt-3 max-w-2xl text-orange-50">Start with discovery, then grow into creation, campaigns, and measurable stakeholder value.</p>
            </div>
            <button
              onClick={() => redirectToLogin()}
              className="mt-6 inline-flex items-center rounded-full bg-white px-7 py-4 font-black text-orange-700 transition hover:-translate-y-0.5 lg:mt-0"
            >
              Open Promorang
              <TrendingUp className="ml-2 h-5 w-5" />
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-900/10 bg-white/50 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-slate-600 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-4">
            <img
              src="https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_extended-03.png"
              alt="Promorang"
              className="h-8 w-auto"
            />
            <span>Discovery, action, and verified value.</span>
          </div>
          <div className="flex gap-6 font-semibold">
            <a href="#discover" className="hover:text-slate-950">Discover</a>
            <a href="#paths" className="hover:text-slate-950">Journeys</a>
            <a href="#trust" className="hover:text-slate-950">Trust</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
