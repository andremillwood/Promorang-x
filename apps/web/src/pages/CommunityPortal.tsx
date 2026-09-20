import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, LockKeyhole, Users } from 'lucide-react';
import SEO from '@/components/SEO';
import { PromoCardFace } from '@/components/promorang/PromoCardObject';
import { useCommunityAccess, useCommunityAction, useCommunityWorkspace } from '@/hooks/useCommunity';
import { CommunityLead } from '@/components/community/CommunityLead';
import { buttonClass, CommunityFormDialog, Field, inputClass, secondaryClass, type CommunityForm } from '@/components/community/CommunityForms';
import { ActionButton, dateLabel, GoalTrail, MoveBoard, proofForm, Rhythm, Roles, Rooms, SectionHeading, Wins } from '@/components/community/CommunitySections';
import type { CommunityAction, CommunityWorkspaceData } from '@/types/community';

function CommunityShell({ children }: { children: ReactNode }) {
  return <div className="experience-shell min-h-screen bg-[#0D0D0E] text-white selection:bg-orange-400/30">
    <SEO title="Community" description="A private place for Promorang members to create, contribute, and grow together." noindex />
    <a href="#community-content" className="sr-only z-50 focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:rounded-lg focus:bg-orange-300 focus:p-3 focus:text-black">Skip to community content</a>
    {children}
  </div>;
}
function Waiting({ title, children }: { title: string; children: ReactNode }) {
  return <CommunityShell><main id="community-content" className="mx-auto max-w-xl px-5 py-14 sm:py-24"><Link to="/card" className="mb-12 inline-flex min-h-11 items-center gap-2 text-sm text-white/65"><ArrowLeft className="h-4 w-4" /> My PromoCard</Link>
    <LockKeyhole className="mb-6 h-9 w-9 text-orange-300" /><p className="text-xs font-semibold uppercase tracking-[.22em] text-orange-300">Promorang Community</p><h1 className="mt-4 font-serif text-4xl font-bold">{title}</h1><div className="mt-6 space-y-6 text-sm leading-7 text-white/75">{children}</div></main></CommunityShell>;
}
export default function CommunityPortal() {
  const { tab = 'today' } = useParams();
  const access = useCommunityAccess();
  const workspace = useCommunityWorkspace(access.data?.membership?.status === 'active' && !access.isError);
  const mutation = useCommunityAction();
  const [applicationError, setApplicationError] = useState('');
  const onAction: CommunityAction = (action, data) => mutation.mutateAsync({ action, data });
  async function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setApplicationError('');
    try { await onAction('apply', Object.fromEntries(new FormData(event.currentTarget))); }
    catch (e) { setApplicationError(e instanceof Error ? e.message : 'Your request could not be sent.'); }
  }
  if (access.isLoading) return <Waiting title="Finding your place…"><p role="status">Checking your community membership.</p></Waiting>;
  if (access.isError) return <Waiting title="We couldn’t check your membership."><p role="alert">{access.error.message}</p><button onClick={() => void access.refetch()} className={buttonClass}>Try again</button></Waiting>;
  const member = access.data?.membership;
  if (!member || member.status !== 'active') return <Waiting title={member?.status === 'pending' ? 'Your introduction is with the team.' : member ? 'Your community access is on hold.' : 'A place to make things happen.'}>
    {member ? <p>{member.status === 'pending' ? 'A lead will review your request. Once approved, you can enter the rooms, take a move, and build your place in the community.' : 'A community lead can review your membership. Your PromoCard and previously earned value stay with your account.'}</p> : <><p>Build your skills, grow an audience, help someone move forward, and take on useful work. Entry is for approved community members, connected to your existing PromoCard.</p>
      <form className="space-y-5" onSubmit={apply}><Field label="Where do you want to grow?"><select name="career_path" className={inputClass} required>{access.data?.paths.map(p => <option key={p}>{p}</option>)}</select></Field><Field label="What would make joining worthwhile for you?"><textarea name="personal_goal" required minLength={10} maxLength={1000} rows={3} className={inputClass} placeholder="I want to… and I can help with…" /></Field>{applicationError && <p role="alert" className="text-red-200">{applicationError}</p>}<button disabled={mutation.isPending} className={buttonClass}>{mutation.isPending ? 'Sending…' : 'Introduce yourself'}<ArrowRight className="h-4 w-4" /></button></form></>}
    {access.data?.canBootstrap && <div className="border-t border-white/20 pt-6"><p className="mb-4 text-sm">Your platform administrator role can open the community’s lead workspace.</p><ActionButton action="bootstrap" values={{}} onAction={onAction}>Open the lead workspace</ActionButton></div>}
  </Waiting>;
  if (workspace.isLoading || !workspace.data && !workspace.isError) return <Waiting title="Welcome back."><p role="status">Loading your community, moves, and progress.</p></Waiting>;
  // Fail closed on membership or network errors. Never render a stale private workspace.
  if (workspace.isError) return <Waiting title="Let’s reconnect."><p role="alert">{workspace.error.message}</p><button onClick={() => { void access.refetch(); void workspace.refetch(); }} className={buttonClass}>Check access again</button></Waiting>;
  return <CommunityWorkspace key={member.user_id} data={workspace.data!} tab={tab} onAction={onAction} />;
}

export function CommunityWorkspace({ data, tab = 'today', onAction }: { data: CommunityWorkspaceData; tab?: string; onAction: CommunityAction }) {
  const [form, setForm] = useState<CommunityForm | null>(null);
  const [notice, setNotice] = useState('');
  const member = data.membership;
  const current = ['today', 'board', 'rhythm', 'roles', 'rooms', 'wins', 'lead'].includes(tab) ? tab : 'today';
  const nextWork = data.work.find(w => ['changes_requested', 'claimed'].includes(w.status));
  const nextMove = data.moves.find(m => m.status === 'open' && m.eligible && Date.parse(m.due_at) > Date.now() && !data.work.some(w => w.move_id === m.id) && !data.receipts.some(w => w.move_id === m.id));
  const activeRole = data.myRoles.find(r => ['active', 'grace'].includes(r.effective_status || ''));
  const roleName = data.framework.roles.find(r => r.id === activeRole?.role_slug)?.name;
  const upcoming = data.sessions.filter(s => Date.parse(s.starts_at) > Date.now()).sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at))[0];
  const act: CommunityAction = async (action, values) => {
    const result = await onAction(action, values);
    const messages: Record<string, string> = { claim: 'Your place is held. Show your work when it is ready.', submit: 'Proof sent. A lead will review your contribution.', review: 'Review recorded. Approved rewards are in the member’s account.', rsvp: 'You’re on the session list.', propose: 'Your pitch is with the leads.', apply_role: 'Your role application is with the leads.', publish: 'The move is open. Any promised Gems are set aside.', close: 'The move is closed. Unused funding has been returned.' };
    setNotice(messages[action] || 'Saved. Your community is up to date.');
    return result;
  };
  function profileForm(): CommunityForm {
    return { action: 'profile', title: 'Choose your direction', description: 'Tell members what you are working toward and where you would like to contribute.',
      fields: <><Field label="Your path"><select name="career_path" defaultValue={member.career_path} className={inputClass}>{data.framework.paths.map(p => <option key={p}>{p}</option>)}</select></Field><Field label="Your next personal goal"><textarea name="personal_goal" defaultValue={member.personal_goal} required minLength={10} maxLength={1000} rows={3} className={inputClass} /></Field><fieldset><legend className="mb-3 text-sm text-white/80">Your interest groups</legend>{data.framework.pods.filter(p => p.id !== 'general').map(p => <label key={p.id} className="flex min-h-12 items-center gap-3 text-sm"><input type="checkbox" name={`pod_${p.id}`} defaultChecked={member.pods.includes(p.id)} className="h-5 w-5 accent-orange-400" />{p.name}</label>)}</fieldset></>,
      transform: v => ({ career_path: v.career_path, personal_goal: v.personal_goal, pods: ['general', ...data.framework.pods.filter(p => v[`pod_${p.id}`]).map(p => p.id)] }) };
  }
  return <CommunityShell>
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0D0D0E]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8"><Link to="/community" className="flex min-h-11 items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-black"><Users className="h-5 w-5" /></span><span className="text-sm font-bold tracking-wide">PROMORANG <span className="ml-1 font-normal text-white/55">/ community</span></span></Link><Link to="/card" className="inline-flex min-h-11 items-center gap-2 text-sm text-white/80">My PromoCard <ArrowRight className="h-4 w-4" /></Link></div>
      <nav aria-label="Community" className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-5 sm:px-8">{[['today', 'Today'], ['board', 'Move board'], ['rhythm', 'Rhythm'], ['roles', 'My place'], ['rooms', 'Rooms'], ['wins', 'My wins'], ...(data.lead ? [['lead', 'Lead room']] : [])].map(([id, label]) => <NavLink key={id} to={id === 'today' ? '/community' : `/community/${id}`} end className={`flex min-h-12 shrink-0 items-center border-b-2 text-sm font-medium ${current === id ? 'border-orange-400 text-orange-200' : 'border-transparent text-white/65 hover:text-white'}`}>{label}</NavLink>)}</nav>
    </header>
    <main id="community-content" className="mx-auto max-w-7xl px-5 pb-20 pt-8 sm:px-8 sm:pt-12">
      {notice && <div role="status" className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-emerald-300/25 bg-emerald-400/5 p-4 text-sm text-emerald-100"><span>{notice}</span><button aria-label="Dismiss update" onClick={() => setNotice('')} className="min-h-6 min-w-6">×</button></div>}
      {current === 'today' ? <>
        <section aria-label="Your next community move" className="relative grid gap-9 overflow-hidden rounded-[2rem] border border-white/15 bg-[radial-gradient(ellipse_at_top_right,rgba(255,85,0,.18),transparent_65%)] p-6 sm:p-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div><p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-orange-200"><span className="h-1.5 w-1.5 rounded-full bg-orange-400" /> Members only · Your community</p>
            <h1 className="max-w-xl font-serif text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl">Make your next<br /><span className="text-orange-300">move count.</span></h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/70">{member.display_name}, this is where your work helps the community grow, builds your place, and opens what comes next.</p>
            <div className="mt-7 border-l-2 border-orange-400 pl-4"><p className="text-[11px] uppercase tracking-[.16em] text-white/60">{nextWork ? 'Your next move' : nextMove ? 'A move for you' : 'Start with your people'}</p><p className="mt-2 max-w-md text-lg font-semibold">{nextWork?.move.title || nextMove?.title || 'Bring one useful idea to the room.'}</p></div>
            <div className="mt-6">{nextWork ? <button className={buttonClass} onClick={() => setForm(proofForm(nextWork))}>Show what you did <ArrowRight className="h-4 w-4" /></button> : <Link className={buttonClass} to={nextMove ? '/community/board' : '/community/rooms'}>{nextMove ? 'Find your next move' : 'Enter the General Room'}<ArrowRight className="h-4 w-4" /></Link>}</div>
          </div>
          <div className="flex min-w-0 flex-col justify-center"><PromoCardFace variant="membership" holder={member.display_name} available={roleName || 'Community member'} limit="Your place. Your people. Your PromoCard." sceneMark="Promorang Community" interactive={false} />
            <div className="mt-5 flex flex-wrap gap-3"><Link to="/card" className={secondaryClass}>Perks & saved access <ArrowRight className="h-4 w-4" /></Link><Link to="/moments" className={secondaryClass}>Find a Moment <ArrowRight className="h-4 w-4" /></Link></div>
            <p className="mt-4 text-xs leading-6 text-white/60">Your existing PromoCard represents you here. Your perks, Moment access, and earned value stay connected to the same account.</p>
          </div>
        </section>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16"><section><SectionHeading kicker="What we’re moving toward" title="Small moves. Shared wins." /><GoalTrail goals={data.goals.filter(g => g.ends_on >= new Date().toISOString().slice(0, 10)).slice(0, 3)} /></section>
          <aside className="space-y-7"><section className="border-t border-white/20 pt-6"><p className="text-xs uppercase tracking-[.15em] text-orange-200">Your direction</p><h2 className="mt-3 text-lg font-semibold">{member.career_path}</h2><p className="mt-2 text-sm leading-7 text-white/65">{member.personal_goal}</p><button onClick={() => setForm(profileForm())} className="mt-3 min-h-11 text-sm font-semibold text-orange-200">Update my direction →</button></section>
          <section className="border-t border-white/20 pt-6"><p className="text-xs uppercase tracking-[.15em] text-orange-200">Your momentum</p><p className="mt-3 font-serif text-4xl font-bold">{data.totals.recentPoints} <span className="font-sans text-sm font-normal text-white/65">points in the last 30 days</span></p><Link to="/community/roles" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm text-white/75">See my role and next check-in <ArrowRight className="h-4 w-4" /></Link></section>
          {upcoming && <section className="border-t border-white/20 pt-6"><p className="text-xs uppercase tracking-[.15em] text-orange-200">Next time together</p><h2 className="mt-3 text-lg font-semibold">{upcoming.title}</h2><p className="mt-2 text-sm text-white/65">{dateLabel(upcoming.starts_at, true)} · Jamaica</p><Link className="mt-3 inline-flex min-h-11 items-center text-sm text-orange-200" to="/community/rhythm">See the session →</Link></section>}
          </aside></div>
      </> : <div className="mx-auto max-w-4xl">
        {current === 'board' && <MoveBoard data={data} onForm={setForm} onAction={act} />}
        {current === 'rhythm' && <Rhythm data={data} onAction={act} />}
        {current === 'roles' && <Roles data={data} onForm={setForm} />}
        {current === 'rooms' && <Rooms data={data} onForm={setForm} />}
        {current === 'wins' && <Wins data={data} />}
        {current === 'lead' && <CommunityLead data={data} onForm={setForm} onAction={act} />}
      </div>}
    </main>
    <CommunityFormDialog key={form ? `${form.action}-${JSON.stringify(form.values)}` : 'closed'} form={form} onClose={() => setForm(null)} onAction={act} />
  </CommunityShell>;
}
