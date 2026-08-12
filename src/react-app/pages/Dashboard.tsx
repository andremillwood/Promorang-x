import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Compass,
  Crown,
  Diamond,
  Gift,
  Layers3,
  Rocket,
  Sparkles,
  Target,
  Users,
  Wallet
} from 'lucide-react';
import { UserType } from '@/shared/types';

type LensId = 'participant' | 'creator' | 'host' | 'merchant' | 'brand' | 'champion' | 'operator';

interface SuccessLens {
  id: LensId;
  label: string;
  program: string;
  promise: string;
  target: number;
  unit: string;
  nextAction: string;
  nextHref: string;
}

const SUCCESS_LENSES: SuccessLens[] = [
  { id: 'participant', label: 'Participant', program: 'First 5', promise: 'Complete five verified moves and establish your Promorang reputation.', target: 5, unit: 'verified moves', nextAction: 'Complete a verified opportunity', nextHref: '/earn' },
  { id: 'creator', label: 'Creator', program: 'Creator 25', promise: 'Activate 25 verified supporters around your next piece or project.', target: 25, unit: 'supporters', nextAction: 'Create your next piece', nextHref: '/create' },
  { id: 'host', label: 'Host', program: 'Full House', promise: 'Fill a moment, verify attendance, and retain the community for what comes next.', target: 50, unit: 'attendees', nextAction: 'Create a moment', nextHref: '/create' },
  { id: 'merchant', label: 'Merchant', program: 'Customer 50', promise: 'Turn a promotion into verified visits, redemptions, and repeat customers.', target: 50, unit: 'customer actions', nextAction: 'Activate your place', nextHref: '/activate' },
  { id: 'brand', label: 'Brand', program: 'Promorang 100', promise: 'Generate 100 verified customer actions within a clear budget and timeframe.', target: 100, unit: 'verified actions', nextAction: 'Launch a campaign', nextHref: '/advertiser' },
  { id: 'champion', label: 'Champion', program: 'Champion 10', promise: 'Help ten people achieve their first verified Promorang success.', target: 10, unit: 'people activated', nextAction: 'Find an opportunity to share', nextHref: '/earn' },
  { id: 'operator', label: 'Operator', program: 'Market 500', promise: 'Build a local network producing measurable value across every Promorang role.', target: 500, unit: 'network actions', nextAction: 'Review network opportunities', nextHref: '/growth-hub' }
];

const JOURNEY = [
  { label: 'Discover', icon: Compass },
  { label: 'Contribute', icon: Sparkles },
  { label: 'Prove', icon: BadgeCheck },
  { label: 'Earn', icon: Gift },
  { label: 'Own', icon: Layers3 },
  { label: 'Grow', icon: Rocket },
  { label: 'Champion', icon: Crown }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [lensId, setLensId] = useState<LensId>(() => (localStorage.getItem('promorang:success-lens') as LensId) || 'participant');
  const [promoShare, setPromoShare] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      fetch('/api/app/users/me', { credentials: 'include' }).then(response => response.ok ? response.json() : null),
      fetch('/api/promoshare/dashboard', { credentials: 'include' }).then(response => response.ok ? response.json() : null)
    ]).then(([userResult, promoResult]) => {
      if (userResult.status === 'fulfilled') setUser(userResult.value);
      if (promoResult.status === 'fulfilled') setPromoShare(promoResult.value?.data || promoResult.value);
      setLoading(false);
    });
  }, []);

  const lens = SUCCESS_LENSES.find(item => item.id === lensId) || SUCCESS_LENSES[0];
  const estimatedProgress = useMemo(() => {
    const activity = Number((user as any)?.xp_points || (user as any)?.points_balance || 0);
    return Math.min(lens.target, Math.max(0, Math.floor(activity / 100)));
  }, [lens, user]);
  const progressPercent = Math.round((estimatedProgress / lens.target) * 100);
  const promoStats = promoShare?.user_stats_by_cycle?.[0] || promoShare?.cycles?.[0] || {};

  const selectLens = (nextLens: LensId) => {
    setLensId(nextLens);
    localStorage.setItem('promorang:success-lens', nextLens);
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-xl shadow-slate-950/10">
        <div className="grid gap-8 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">My success · {lens.label} lens</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{lens.program}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{lens.promise}</p>
            <div className="mt-7">
              <div className="flex items-end justify-between gap-4">
                <div><span className="text-3xl font-black">{estimatedProgress}</span><span className="ml-2 text-sm font-bold text-slate-400">of {lens.target} {lens.unit}</span></div>
                <span className="text-sm font-black text-orange-300">{progressPercent}%</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-300" style={{ width: `${progressPercent}%` }} /></div>
            </div>
          </div>
          <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/10">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Next best action</p>
            <p className="mt-3 text-xl font-black">{lens.nextAction}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">This advances your active program and can also create PromoShare, Pieces, and Growth Hub value.</p>
            <button onClick={() => navigate(lens.nextHref)} className="mt-5 inline-flex items-center rounded-full bg-orange-500 px-5 py-3 text-sm font-black hover:bg-orange-600">Take the next step <ArrowRight className="ml-2 h-4 w-4" /></button>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div><p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Choose your current objective</p><h2 className="mt-1 text-2xl font-black text-slate-950">One account, every way to succeed</h2></div>
          <p className="text-sm text-slate-500">Changing your lens changes priorities—not your access.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {SUCCESS_LENSES.map(item => <button key={item.id} onClick={() => selectLens(item.id)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-black transition ${item.id === lensId ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-orange-300'}`}>{item.label}</button>)}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">The Promorang journey</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {JOURNEY.map(({ label, icon: Icon }, index) => <div key={label} className="relative rounded-2xl bg-slate-50 p-4"><Icon className="h-5 w-5 text-orange-600" /><p className="mt-3 text-sm font-black text-slate-900">{label}</p><p className="mt-1 text-xs font-bold text-slate-400">Step {index + 1}</p></div>)}
        </div>
      </section>

      <section>
        <div className="mb-4"><p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Your connected value</p><h2 className="mt-1 text-2xl font-black text-slate-950">Every system advances the same success journey</h2></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SystemCard icon={Gift} eyebrow="Earn" title="PromoShare" value={`${promoStats.total_entries || promoStats.final_weight || 0} entries`} description="Verified moves, moments, proofs, and referrals improve your participation." action="View PromoShare" onClick={() => navigate('/promoshare')} tone="orange" />
          <SystemCard icon={Layers3} eyebrow="Own" title="Pieces" value="4 asset types" description="Explore content, moment, host, and venue Pieces connected to real activity." action="Explore Pieces" onClick={() => navigate('/pieces')} tone="purple" />
          <SystemCard icon={Rocket} eyebrow="Grow" title="Growth Hub" value={`${Number((user as any)?.gems_balance || 0).toLocaleString()} Gems`} description="Fund, grow, stake, and protect the value you build across Promorang." action="Open Growth Hub" onClick={() => navigate('/growth-hub')} tone="blue" />
          <SystemCard icon={Users} eyebrow="Champion" title="Your network" value="Build together" description="Help other people succeed and make your downstream impact visible." action="Find opportunities" onClick={() => navigate('/earn')} tone="green" />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <ValueCard icon={Wallet} label="Value earned" value={Number((user as any)?.gems_balance || 0).toLocaleString()} detail="Gems currently available" />
        <ValueCard icon={Diamond} label="Value retained" value="Pieces + reputation" detail="Assets and proof that stay connected to you" />
        <ValueCard icon={BarChart3} label="Value generated" value={estimatedProgress.toLocaleString()} detail={`${lens.unit} toward ${lens.program}`} />
      </section>
    </div>
  );
}

function SystemCard({ icon: Icon, eyebrow, title, value, description, action, onClick, tone }: any) {
  const tones: Record<string, string> = { orange: 'bg-orange-50 text-orange-700', purple: 'bg-purple-50 text-purple-700', blue: 'bg-blue-50 text-blue-700', green: 'bg-emerald-50 text-emerald-700' };
  return <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className={`inline-flex rounded-2xl p-3 ${tones[tone]}`}><Icon className="h-5 w-5" /></div><p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-slate-400">{eyebrow}</p><div className="mt-1 flex items-start justify-between gap-3"><h3 className="text-xl font-black text-slate-950">{title}</h3><span className="text-xs font-black text-slate-500">{value}</span></div><p className="mt-3 min-h-[3.75rem] text-sm leading-5 text-slate-600">{description}</p><button onClick={onClick} className="mt-4 inline-flex items-center text-sm font-black text-slate-950 hover:text-orange-600">{action}<ArrowRight className="ml-2 h-4 w-4" /></button></article>;
}

function ValueCard({ icon: Icon, label, value, detail }: any) {
  return <div className="rounded-2xl bg-slate-950 p-5 text-white"><div className="flex items-center justify-between"><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</p><Icon className="h-5 w-5 text-orange-400" /></div><p className="mt-4 text-2xl font-black">{value}</p><p className="mt-1 text-sm text-slate-400">{detail}</p></div>;
}
