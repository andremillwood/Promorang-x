import { useState, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, CircleDollarSign, Info, Network, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { useCommunityAction, useCommunityNetwork } from '@/hooks/useCommunity';
import { CommunityShell, Waiting } from './CommunityPortal';
import { buttonClass, Field, inputClass, secondaryClass } from '@/components/community/CommunityForms';
import { dateLabel, human } from '@/components/community/CommunitySections';
import type { CommunityNetworkPlan } from '@/types/community';

function NetworkFrame({ children }: { children: ReactNode }) {
  return <CommunityShell>
    <SEO title="Community Network" description="The optional, product-led Promorang Builder track." noindex />
    <header className="border-b border-white/10 bg-[#0D0D0E]/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link to="/community" className="inline-flex min-h-11 items-center gap-2 text-sm text-white/75"><ArrowLeft className="h-4 w-4" /> Community</Link>
        <span className="flex items-center gap-2 text-sm font-bold"><Network className="h-5 w-5 text-orange-300" /> Network track</span>
      </div>
    </header>
    <main id="community-content" className="mx-auto max-w-6xl space-y-8 px-5 pb-20 pt-8 sm:px-8 sm:pt-12">{children}</main>
  </CommunityShell>;
}

function PlanCard({ plan, selected, onSelect }: { plan: CommunityNetworkPlan; selected: boolean; onSelect: () => void }) {
  const isParticipant = plan.plan_key === 'participant';
  const fee = plan.monthly_fee_cents ? `$${(plan.monthly_fee_cents / 100).toFixed(2)} / month` : 'Free';
  return <article className={`flex h-full flex-col rounded-[1.5rem] border p-5 sm:p-6 ${selected ? 'border-orange-300 bg-orange-400/[.08]' : 'border-white/15 bg-white/[.025]'}`}>
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-orange-200">{isParticipant ? 'Always open' : human(plan.status)}</p><h3 className="mt-2 font-serif text-2xl font-bold">{plan.name}</h3></div>{isParticipant ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : <CircleDollarSign className="h-5 w-5 text-orange-300" />}</div>
    <p className="mt-3 flex-1 text-sm leading-6 text-white/65">{plan.description}</p>
    <p className="mt-5 text-xl font-bold text-orange-100">{fee}</p>
    <ul className="mt-4 space-y-2 text-xs leading-5 text-white/65">{plan.features.map(feature => <li key={feature} className="flex gap-2"><span className="text-orange-300">•</span>{feature}</li>)}</ul>
    {!isParticipant && <button type="button" className={`${selected ? buttonClass : secondaryClass} mt-5 w-full`} onClick={onSelect}>{selected ? 'Selected for interest' : 'I’m interested'}</button>}
  </article>;
}

function ActivityForm({ onSubmit, disabled }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void; disabled: boolean }) {
  return <section className="rounded-[1.5rem] border border-orange-300/25 bg-orange-400/[.04] p-5 sm:p-7"><div className="mb-4"><p className="text-xs font-bold uppercase tracking-[.18em] text-orange-200">Verified activity</p><h2 className="mt-2 font-serif text-3xl font-bold">Log what created value.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">Builders can submit customer, campaign, affiliate, support, training, or community activity with a source reference. A lead verifies the record; submission is never an automatic payout.</p></div><form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}><Field label="Activity type"><select name="event_type" className={inputClass}><option value="customer_sale">Customer sale</option><option value="campaign_delivery">Campaign delivery</option><option value="affiliate_sale">Affiliate sale</option><option value="support_action">Support action</option><option value="referral_conversion">Referral conversion</option><option value="training_complete">Training complete</option><option value="community_contribution">Community contribution</option></select></Field><Field label="Value · USD"><input name="value" type="number" min={0} step="0.01" defaultValue="0" className={inputClass} /></Field><Field label="Source reference"><input name="source_ref" required minLength={3} maxLength={240} className={inputClass} placeholder="Order, campaign, or receipt reference" /></Field><Field label="Evidence note"><input name="notes" required minLength={3} maxLength={2000} className={inputClass} placeholder="What did you deliver or sell?" /></Field><button disabled={disabled} className={`${secondaryClass} w-fit`}>{disabled ? 'Submitting…' : 'Submit for verification'}<ArrowRight className="h-4 w-4" /></button></form></section>;
}

export default function CommunityNetwork() {
  const query = useCommunityNetwork();
  const action = useCommunityAction();
  const loadedData = query.data;
  const [selectedPlan, setSelectedPlan] = useState<'builder' | 'studio'>('builder');
  const [sponsor, setSponsor] = useState('');
  const [applicationCareer, setApplicationCareer] = useState(loadedData?.paths?.[0] || 'Community Leader');
  const [applicationGoal, setApplicationGoal] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  if (query.isLoading) return <Waiting title="Loading the network track…"><p role="status">Checking your community place and the current program posture.</p></Waiting>;
  if (query.isError || !query.data) return <Waiting title="This track is for community members."><p role="alert">{query.error instanceof Error ? query.error.message : 'Join the community first to view the optional Builder track.'}</p><Link to="/community" className={buttonClass}>Back to community <ArrowRight className="h-4 w-4" /></Link></Waiting>;

  const data = query.data;
  const selected = data.plans.find(plan => plan.plan_key === selectedPlan);
  const interestOpen = data.canExpressInterest && data.settings.matrix_mode !== 'paused';
  async function expressInterest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(''); setNotice('');
    try {
      await action.mutateAsync({ action: 'network_interest', data: { plan_key: selectedPlan, sponsor_user_id: sponsor.trim() || null } });
      setNotice('Interest recorded. A member of the team will explain the product, terms, and next step before anything is activated.');
      await query.refetch();
    } catch (err) { setError(err instanceof Error ? err.message : 'Your interest could not be recorded.'); }
  }
  async function applyBuilder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(''); setNotice('');
    try {
      await action.mutateAsync({ action: 'apply', data: { career_path: applicationCareer, personal_goal: applicationGoal } });
      setNotice('Builder application submitted. Your General Room access stays open while the team reviews it.');
      setApplicationGoal('');
      await query.refetch();
    } catch (err) { setError(err instanceof Error ? err.message : 'Your Builder application could not be submitted.'); }
  }
  async function submitActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setError(''); setNotice('');
    try {
      const key = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      await action.mutateAsync({ action: 'network_event', data: { event_type: values.event_type, source_ref: values.source_ref || null, value_cents: Math.round(Number(values.value || 0) * 100), notes: values.notes || null, idempotency_key: key } });
      setNotice('Activity submitted for verification. It is not a payout until a lead checks the evidence.');
      form.reset();
      await query.refetch();
    } catch (err) { setError(err instanceof Error ? err.message : 'The activity could not be submitted.'); }
  }
  return <NetworkFrame>
    {data.enrollment && data.member.member_kind === 'builder' && data.enrollment.status === 'active' && <ActivityForm onSubmit={submitActivity} disabled={action.isPending} />}
    <section className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[radial-gradient(circle_at_88%_0%,rgba(255,101,0,.2),transparent_42%)] p-6 sm:p-10">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-orange-200">Optional · product-led · member-only</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-6"><div><h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight sm:text-6xl">Build useful demand<br /><span className="text-orange-300">before building a network.</span></h1><p className="mt-5 max-w-2xl text-sm leading-7 text-white/70">The General Room is enough on its own. This page is for community members who want to learn the operator craft, use Promorang tools, and be considered for a future product-led network pilot.</p></div><div className="rounded-2xl border border-white/15 bg-black/20 px-5 py-4"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/55">Your place</p><p className="mt-1 text-sm font-semibold capitalize text-orange-100">{human(data.member.member_kind)} · {data.member.tier}</p></div></div>
    </section>

    {notice && <div role="status" className="rounded-xl border border-emerald-300/25 bg-emerald-400/5 p-4 text-sm leading-6 text-emerald-100">{notice}</div>}
    <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]"><div><div className="mb-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-orange-200">Choose your lane</p><h2 className="mt-2 font-serif text-3xl font-bold">Participation stays separate from opportunity.</h2><p className="mt-3 text-sm leading-6 text-white/65">You can keep attending activities and benefiting from member programming without ever joining the network track. The free participant plan is not a down-sell; it is the community’s front door.</p></div><div className="grid gap-4 md:grid-cols-3">{data.plans.map(plan => <PlanCard key={plan.plan_key} plan={plan} selected={plan.plan_key === selectedPlan} onSelect={() => !data.enrollment && !['participant'].includes(plan.plan_key) && setSelectedPlan(plan.plan_key as 'builder' | 'studio')} />)}</div></div>
      <aside className="h-fit rounded-[1.5rem] border border-white/15 bg-white/[.025] p-5 sm:p-6"><div className="flex items-start gap-3"><Info className="mt-1 h-5 w-5 shrink-0 text-orange-300" /><div><h2 className="font-serif text-2xl font-bold">How the pilot works</h2><p className="mt-3 text-sm leading-7 text-white/65">We start with tools, training, and real customer or campaign work. Any future network reward must come from verified external value and published terms; it is never created by a signup alone.</p></div></div><ul className="mt-5 space-y-3 border-t border-white/10 pt-5 text-sm leading-6 text-white/70"><li><strong className="text-white">1. Show interest.</strong> Tell us which builder lane fits.</li><li><strong className="text-white">2. Get qualified.</strong> We explain the product, price, disclosures, and expectations.</li><li><strong className="text-white">3. Create proof.</strong> Use the Business Engine and complete useful work.</li><li><strong className="text-white">4. Review activity.</strong> Verified records come before any compensation decision.</li></ul></aside></section>

    {data.enrollment ? <section className="rounded-[1.5rem] border border-orange-300/30 bg-orange-400/[.06] p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-orange-200">Your network record</p><h2 className="mt-2 font-serif text-3xl font-bold">{data.enrollment.plan?.name || human(data.enrollment.plan_key)}</h2><p className="mt-3 text-sm leading-6 text-white/70">Status: <strong className="capitalize text-orange-100">{human(data.enrollment.status)}</strong> · interest recorded {dateLabel(data.enrollment.joined_at, true)}</p></div><ShieldCheck className="h-6 w-6 text-orange-300" /></div><p className="mt-5 max-w-3xl text-sm leading-7 text-white/65">Your record is not a payout balance or an income promise. A lead must qualify the plan, confirm the terms, and verify any external activity before anything can be considered for release.</p><div className="mt-6 flex flex-wrap gap-3"><Link to="/community/engine" className={buttonClass}>Open Business Engine <ArrowRight className="h-4 w-4" /></Link><Link to="/community" className={secondaryClass}>Return to the General Room</Link></div>{data.events.length > 0 && <div className="mt-7 overflow-x-auto border-t border-white/10 pt-5"><h3 className="font-semibold">Verified activity trail</h3><table className="mt-3 w-full min-w-[34rem] text-left text-sm"><thead className="text-xs uppercase tracking-wider text-white/50"><tr><th className="py-2 pr-4">Activity</th><th className="py-2 pr-4">Value</th><th className="py-2 pr-4">Status</th><th className="py-2">When</th></tr></thead><tbody className="divide-y divide-white/10">{data.events.map(event => <tr key={event.id}><td className="py-3 pr-4">{human(event.event_type)}</td><td className="py-3 pr-4">${(event.value_cents / 100).toFixed(2)}</td><td className="py-3 pr-4 capitalize text-orange-100">{human(event.status)}</td><td className="py-3 text-white/60">{dateLabel(event.created_at, true)}</td></tr>)}</tbody></table></div>}</section> : <><section className="rounded-[1.5rem] border border-white/15 bg-white/[.025] p-5 sm:p-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-orange-200">Keep me posted</p><h2 className="mt-2 font-serif text-3xl font-bold">Record interest without joining anything today.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">Choose a lane above, optionally share a sponsor’s member ID, and we’ll follow up with the actual product and terms. Leaving this form untouched keeps you a full participant with the same community access.</p><form className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end" onSubmit={expressInterest}><Field label="Selected lane"><select className={inputClass} value={selectedPlan} onChange={event => setSelectedPlan(event.target.value as 'builder' | 'studio')}><option value="builder">Business Builder pilot</option><option value="studio">Business Studio pilot</option></select></Field><Field label="Sponsor member ID · optional"><input className={inputClass} value={sponsor} onChange={event => setSponsor(event.target.value)} placeholder="Leave blank and we’ll connect you" /></Field><button disabled={!interestOpen || action.isPending || !selected} className={buttonClass}>{!interestOpen ? 'Pilot is not open' : action.isPending ? 'Recording…' : 'Record my interest'}<ArrowRight className="h-4 w-4" /></button></form>{error && <p role="alert" className="mt-4 text-sm text-red-200">{error}</p>}<p className="mt-4 text-xs leading-5 text-white/50">Current program mode: <span className="capitalize">{data.settings.matrix_mode}</span>. Fees and compensation are not activated by this form.</p></section>{data.member.member_kind === 'participant' && <section className="rounded-[1.5rem] border border-orange-300/25 bg-orange-400/[.04] p-5 sm:p-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-orange-200">Want to build?</p><h2 className="mt-2 font-serif text-3xl font-bold">Apply while keeping your participant place.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">A Builder application is reviewed separately. You keep General Room access while the team checks fit, product understanding, and the work you want to own.</p><form className="mt-6 grid gap-4" onSubmit={applyBuilder}><Field label="Your direction"><select className={inputClass} value={applicationCareer} onChange={event => setApplicationCareer(event.target.value)}>{data.paths.map(path => <option key={path}>{path}</option>)}</select></Field><Field label="What would you bring to the Builder track?"><textarea className={inputClass} required minLength={10} maxLength={1000} rows={3} value={applicationGoal} onChange={event => setApplicationGoal(event.target.value)} placeholder="I want to help… and I can prove it by…" /></Field><button disabled={action.isPending} className={`${buttonClass} w-fit`}>{action.isPending ? 'Sending…' : 'Apply for Builder review'}<ArrowRight className="h-4 w-4" /></button></form></section>}</>}
  </NetworkFrame>;
}
