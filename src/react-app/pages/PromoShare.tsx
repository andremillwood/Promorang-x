import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Gift, Sparkles, Target, Ticket, Users } from 'lucide-react';

export default function PromoShare() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/promoshare/dashboard', { credentials: 'include' })
      .then(response => response.ok ? response.json() : null)
      .then(result => setDashboard(result?.data || result))
      .catch(() => setDashboard(null))
      .finally(() => setLoading(false));
  }, []);

  const cycles = dashboard?.draws || dashboard?.cycles || dashboard?.user_stats_by_cycle || [];
  const primary = cycles[0] || dashboard?.activeCycle || {};
  const stats = dashboard?.user_stats_by_cycle?.[0] || primary;
  const entries = Number(stats?.total_entries || primary?.userTickets || dashboard?.userTickets || 0);
  const weight = Number(stats?.final_weight || stats?.weight || 0);
  const eligible = Boolean(stats?.eligible || ['qualified', 'boosted', 'winner', 'spotlighted'].includes(stats?.status));
  const progress = useMemo(() => [
    { label: 'Verified moves', current: Number(stats?.verified_moves_count || 0), target: 3, icon: BadgeCheck },
    { label: 'Moments joined', current: Number(stats?.moments_joined_count || 0), target: 1, icon: Sparkles },
    { label: 'People referred', current: Number(stats?.referral_count || 0), target: 1, icon: Users }
  ], [stats]);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" /></div>;

  return <div className="space-y-8">
    <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-600 via-rose-600 to-purple-700 p-6 text-white shadow-xl sm:p-9">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div><p className="text-xs font-black uppercase tracking-[0.22em] text-orange-100">Verified activity rewards</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">PromoShare</h1><p className="mt-4 max-w-2xl text-base leading-7 text-white/80">Your verified moves, moments, proofs, and referrals create entries and weight across active PromoShare cycles. The more genuine value you create, the stronger your participation becomes.</p><button onClick={() => navigate('/earn')} className="mt-6 inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">Find a qualifying action <ArrowRight className="ml-2 h-4 w-4" /></button></div>
        <div className="grid grid-cols-2 gap-3"><Stat label="Status" value={eligible ? 'Qualified' : 'Building'} /><Stat label="Entries" value={entries} /><Stat label="Current weight" value={weight} /><Stat label="Active cycles" value={cycles.length} /></div>
      </div>
    </section>

    <section className="grid gap-4 lg:grid-cols-3">{progress.map(({ label, current, target, icon: Icon }) => { const pct = Math.min(100, Math.round(current / target * 100)); return <article key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div className="rounded-2xl bg-orange-50 p-3 text-orange-600"><Icon className="h-5 w-5" /></div><span className="text-sm font-black text-slate-500">{current} / {target}</span></div><h2 className="mt-4 text-lg font-black text-slate-950">{label}</h2><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-orange-500" style={{ width: `${pct}%` }} /></div><p className="mt-3 text-sm text-slate-500">{pct >= 100 ? 'This qualification path is complete.' : `${target - current} more to complete this path.`}</p></article>; })}</section>

    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">How it connects</p><h2 className="mt-2 text-2xl font-black text-slate-950">PromoShare rewards activity across Promorang</h2><p className="mt-3 text-sm leading-6 text-slate-600">Qualifying activity can also advance your success program, strengthen your reputation, unlock Pieces, and create new Growth Hub opportunities.</p></div><div className="grid gap-3 sm:grid-cols-3"><Connection icon={Target} title="Contribute" text="Complete genuine moves, moments, proofs, and referrals." /><Connection icon={Ticket} title="Qualify" text="See exactly which activity created your entries and weight." /><Connection icon={Gift} title="Share" text="Participate in transparent reward cycles funded by the ecosystem." /></div></div></section>
  </div>;
}

function Stat({ label, value }: { label: string; value: string | number }) { return <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10"><p className="text-xs font-black uppercase tracking-[0.14em] text-white/60">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></div>; }
function Connection({ icon: Icon, title, text }: any) { return <div className="rounded-2xl bg-slate-50 p-4"><Icon className="h-5 w-5 text-orange-600" /><h3 className="mt-3 font-black text-slate-950">{title}</h3><p className="mt-2 text-sm leading-5 text-slate-600">{text}</p></div>; }
