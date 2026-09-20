import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Clock3, Gem, Plus } from 'lucide-react';
import type { CommunityAction, CommunityGoal, CommunityMove, CommunityWork, CommunityWorkspaceData } from '@/types/community';
import { buttonClass, secondaryClass, Field, inputClass, moveForm, postForm, type CommunityForm } from './CommunityForms';

export const dateLabel = (value: string | null, withTime = false) => value ? new Date(value.length === 10 ? `${value}T12:00:00` : value).toLocaleString('en-JM', {
  month: 'short', day: 'numeric', ...(withTime ? { hour: 'numeric', minute: '2-digit', timeZone: 'America/Jamaica' } : {}),
}) : 'Not set';
export const human = (value: string) => value.replace(/_/g, ' ');
export function SectionHeading({ kicker, title, children }: { kicker?: string; title: string; children?: ReactNode }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div>{kicker && <p className="mb-2 text-xs font-semibold uppercase tracking-[.18em] text-orange-300">{kicker}</p>}<h2 className="font-serif text-3xl font-bold sm:text-4xl">{title}</h2></div>{children}</div>;
}
export function Empty({ children }: { children: ReactNode }) {
  return <p className="border-y border-dashed border-white/20 py-8 text-sm leading-7 text-white/65">{children}</p>;
}
export function ActionButton({ action, values, onAction, children, secondary = false }: {
  action: string; values: Record<string, unknown>; onAction: CommunityAction; children: ReactNode; secondary?: boolean;
}) {
  const [pending, setPending] = useState(false); const [error, setError] = useState('');
  return <div><button className={secondary ? secondaryClass : buttonClass} disabled={pending} onClick={async () => {
    setPending(true); setError('');
    try { await onAction(action, values); } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.'); } finally { setPending(false); }
  }}>{pending ? 'Saving…' : children}</button>{error && <p role="alert" className="mt-2 max-w-lg text-sm text-red-200">{error}</p>}</div>;
}
export function GoalTrail({ goals }: { goals: CommunityGoal[] }) {
  if (!goals.length) return <Empty>The next shared goal is being shaped. Bring an idea to the General Room or ask a lead to open the first goal.</Empty>;
  return <div className="space-y-9">{goals.map(g => <article key={g.id} className="border-l-2 border-orange-400/50 pl-5 sm:pl-7">
    <div className="flex flex-wrap justify-between gap-2"><h3 className="text-xl font-semibold">{g.title}</h3><span className="text-xs text-white/60">{dateLabel(g.starts_on)} — {dateLabel(g.ends_on)}</span></div>
    <p className="mt-2 text-sm leading-6 text-white/65">{g.why}</p>
    <div className="mt-5 space-y-5">{g.results.map(r => {
      const percent = Math.min(100, Math.max(0, Number(r.current_value) / Number(r.target) * 100));
      return <div key={r.id}><div className="mb-2 flex items-end justify-between gap-3"><p className="text-sm">{r.title}</p><span className="shrink-0 text-xs text-orange-200">{Number(r.current_value).toLocaleString()} / {Number(r.target).toLocaleString()} {r.unit}</span></div>
        <div role="progressbar" aria-label={r.title} aria-valuemin={0} aria-valuemax={Number(r.target)} aria-valuenow={Math.min(Number(r.target), Number(r.current_value))} className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-orange-400" style={{ width: `${percent}%` }} /></div></div>;
    })}</div>
  </article>)}</div>;
}
export function proofForm(work: CommunityWork): CommunityForm {
  return { action: 'submit', title: 'Show what you made happen', description: work.move.proof_prompt,
    values: { move_id: work.move_id, submission_id: work.id }, submit: 'Send for review',
    fields: <><Field label="What did you do, and what changed?"><textarea name="proof" minLength={10} maxLength={6000} required rows={5} className={inputClass} defaultValue={work.proof || ''} /></Field>
      <Field label="Proof link · optional"><input name="proof_url" maxLength={2000} className={inputClass} defaultValue={work.proof_url || ''} placeholder="https://…" /></Field>
      <p className="text-sm leading-6 text-white/65">A lead checks the work against the brief. Approval adds {work.move.points} points{Number(work.move.gems) > 0 ? ` and releases ${work.move.gems} Gems` : ''}. You can be asked to make changes.</p></>,
    transform: v => ({ ...v, proof_url: v.proof_url || null }) };
}
function WorkSlip({ move, work, data, onForm, onAction }: { move: CommunityMove; work?: CommunityWork; data: CommunityWorkspaceData; onForm: (f: CommunityForm) => void; onAction: CommunityAction }) {
  const win = data.goals.flatMap(g => g.results).find(r => r.id === move.result_id);
  const canSubmit = work && ['claimed', 'changes_requested'].includes(work.status);
  const canClaim = !work && move.eligible && move.status === 'open' && Date.parse(move.due_at) > Date.now();
  return <article className="relative overflow-hidden rounded-[1.2rem] border border-white/15 bg-[#171719]">
    <div className="flex flex-col sm:flex-row"><div className="min-w-0 flex-1 p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[.13em] text-orange-300"><span>{human(move.kind)}</span><span className="text-white/60">{work ? human(work.status) : move.status === 'proposed' ? 'Pitch · awaiting a lead' : 'Community move'}</span></div>
      <h3 className="mt-3 font-serif text-2xl font-bold">{move.title}</h3><p className="mt-2 whitespace-pre-line text-sm leading-6 text-white/70">{move.brief}</p>
      {win && <p className="mt-3 text-xs text-orange-200">Moves us toward: {win.title}</p>}
      <details className="mt-4 text-sm"><summary className="min-h-10 cursor-pointer text-white/80">What counts as done</summary><p className="pb-3 leading-6 text-white/65">{move.proof_prompt}</p></details>
      {work?.feedback && <p className="mb-4 border-l-2 border-amber-300 pl-3 text-sm leading-6 text-amber-100">Lead’s note: {work.feedback}</p>}
      <div className="flex flex-wrap gap-3">{canSubmit && <><button className={buttonClass} onClick={() => onForm(proofForm(work))}>Send your proof <ArrowRight className="h-4 w-4" /></button><ActionButton secondary action="withdraw" values={{ move_id: move.id, submission_id: work.id }} onAction={onAction}>Release my place</ActionButton></>}
        {canClaim && <ActionButton action="claim" values={{ move_id: move.id }} onAction={onAction}>I’ll take this <ArrowRight className="h-4 w-4" /></ActionButton>}
        {work?.status === 'submitted' && <p className="flex min-h-11 items-center gap-2 text-sm text-orange-200"><Clock3 className="h-4 w-4" /> With a lead for review</p>}
        {!work && move.status === 'open' && Date.parse(move.due_at) <= Date.now() && <p className="text-sm text-white/60">Deadline passed · existing work can still be reviewed.</p>}
      </div>
    </div><div className="relative flex shrink-0 flex-row items-center justify-between gap-3 border-t border-dashed border-white/25 bg-white/[.025] px-5 py-4 sm:w-40 sm:flex-col sm:items-start sm:justify-center sm:border-l sm:border-t-0 sm:py-6">
      <div><p className="text-2xl font-bold text-orange-200">+{move.points}</p><p className="text-xs text-white/65">contribution points</p></div>
      <div>{Number(move.gems) > 0 ? <><p className="flex items-center gap-1.5 text-lg font-bold"><Gem className="h-4 w-4 text-orange-300" />{Number(move.gems).toLocaleString()} Gems</p><p className="mt-1 text-xs text-white/60">{move.status === 'proposed' ? 'Proposed reward' : 'Set aside per approval'}</p></> : <p className="text-xs text-white/65">Points contribution<br />No Gem payment</p>}</div>
      <p className="text-xs leading-5 text-white/65">Due {dateLabel(move.due_at, true)}<br />Jamaica time</p>
    </div></div>
  </article>;
}
export function MoveBoard({ data, onForm, onAction }: { data: CommunityWorkspaceData; onForm: (f: CommunityForm) => void; onAction: CommunityAction }) {
  const [filter, setFilter] = useState('open');
  const owned = new Map([...data.work, ...data.receipts].map(w => [w.move_id, w]));
  const active = data.work.filter(w => ['claimed', 'submitted', 'changes_requested'].includes(w.status));
  const moves = filter === 'mine' ? active.map(w => w.move)
    : data.moves.filter(m => filter === 'pitches' ? m.status === 'proposed' : m.status === 'open' && !owned.has(m.id));
  return <><SectionHeading kicker="The move board" title="Good work. Real progress."><button onClick={() => onForm(moveForm(data))} className={secondaryClass}><Plus className="h-4 w-4" /> Pitch a move</button></SectionHeading>
    <div className="mb-6 flex flex-wrap gap-2" aria-label="Filter moves">{[['open', 'Open moves'], ['mine', `My moves (${active.length})`], ['pitches', 'Pitches']].map(([id, label]) => <button key={id} aria-pressed={filter === id} className={filter === id ? buttonClass : secondaryClass} onClick={() => setFilter(id)}>{label}</button>)}</div>
    <div className="space-y-5">{moves.map(m => <WorkSlip key={m.id} move={m} work={owned.get(m.id)} data={data} onForm={onForm} onAction={onAction} />)}{!moves.length && <Empty>{filter === 'mine' ? 'Your hands are free. Find a move that fits what you want to learn, make, or earn.' : filter === 'pitches' ? 'No pitches waiting here. Bring a clear brief and help the community move forward.' : 'No open moves for you right now. Bring an idea to the room or pitch a move tied to a shared goal.'}</Empty>}</div></>;
}

export function Rhythm({ data, onAction }: { data: CommunityWorkspaceData; onAction: CommunityAction }) {
  const [week, setWeek] = useState(1);
  const selected = data.framework.weeks.find(w => w.week === week)!;
  return <><SectionHeading kicker="Community rhythm" title="A reason to come back." />
    <section className="mb-12"><h3 className="mb-4 text-xl font-semibold">On the calendar</h3><div className="space-y-4">{data.sessions.map(s => {
      const ended = Date.parse(s.starts_at) + s.duration_minutes * 60000 <= Date.now();
      return <article key={s.id} className="flex flex-col gap-4 border-y border-white/15 py-5 sm:flex-row sm:items-start"><div className="sm:w-32 sm:shrink-0"><p className="text-sm font-semibold text-orange-200">{dateLabel(s.starts_at, true)}</p><p className="mt-1 text-xs text-white/60">Jamaica · {s.duration_minutes} min</p></div><div className="flex-1"><h4 className="text-lg font-semibold">{s.title}</h4><p className="mt-1 text-sm leading-6 text-white/65">{s.description}</p><div className="mt-4 flex flex-wrap gap-3">
        {!ended && !s.joined && s.eligible && <ActionButton action="rsvp" values={{ id: s.id }} onAction={onAction}>Count me in</ActionButton>}
        {s.joined && <span className="inline-flex items-center gap-2 text-sm text-emerald-200"><Check className="h-4 w-4" /> You’re on the list</span>}
        {!ended && s.join_url && <a href={s.join_url} rel="noopener noreferrer" target="_blank" className={secondaryClass}>Open session</a>}
        {s.replay_url && <a href={s.replay_url} target="_blank" rel="noopener noreferrer" className={secondaryClass}>Watch the recording</a>}
        {s.moment_id && <Link to={`/moments/${s.moment_id}`} className={secondaryClass}>See the Moment</Link>}
      </div></div></article>;
    })}{!data.sessions.length && <Empty>Sessions will appear here when a lead confirms the date and details. Explore the community’s planned rhythm below.</Empty>}</div></section>
    <section><SectionHeading kicker="The four-week playbook" title="From hello to your next win." /><p className="mb-5 text-sm leading-6 text-white/65">These are programming templates. Booked dates and access links appear on the calendar above. Free, Premium, and Super refer to your community membership.</p>
      <div className="mb-7 grid grid-cols-4 gap-2">{data.framework.weeks.map(w => <button className={`min-h-14 rounded-xl border px-2 text-sm ${week === w.week ? 'border-orange-300 bg-orange-400 text-black' : 'border-white/20 text-white/70'}`} key={w.week} onClick={() => setWeek(w.week)} aria-pressed={week === w.week}>Week {w.week}</button>)}</div>
      <h3 className="font-serif text-2xl font-bold">{selected.title}</h3><p className="mt-2 text-sm text-white/65">{selected.sourceTitle}</p>
      <div className="mt-5 divide-y divide-white/10">{selected.sessions.map((s, i) => <div className="flex gap-3 py-3 text-sm" key={`${s.title}-${i}`}><span className="w-24 shrink-0 text-white/60">{s.day}</span><span className="flex-1">{s.title}</span><span className="text-xs capitalize text-orange-200">{s.tier === 'all' ? 'All members' : s.tier}</span></div>)}</div>
    </section>
    <section className="mt-12"><SectionHeading kicker="General Room · Jamaica time" title="The daily rhythm." /><div className="space-y-0">{data.framework.daily.map(d => <div key={d.start} className="flex gap-4 border-l border-orange-400/40 pb-6 pl-5"><p className="w-24 shrink-0 text-xs leading-5 text-orange-200">{d.start}–{d.end}</p><div><h3 className="text-sm font-semibold">{d.title}</h3><p className="mt-1 text-sm leading-6 text-white/60">{d.prompt}</p></div></div>)}</div><p className="text-sm text-white/60">Drop in when it suits you. The rhythm is an invitation; points come from accepted contributions.</p></section>
  </>;
}

export function Roles({ data, onForm }: { data: CommunityWorkspaceData; onForm: (f: CommunityForm) => void }) {
  return <><SectionHeading kicker="Find your place" title="A role you can make your own." /><p className="mb-8 max-w-2xl text-sm leading-7 text-white/65">Roles recognize useful work and open the corresponding role room and resources. Your standing follows accepted contributions. A lead reviews your progress before the next round.</p>
    <div className="space-y-8">{data.framework.roles.map(r => {
      const d = data.definitions.find(d => d.slug === r.id)!; const seat = data.myRoles.find(s => s.role_slug === r.id);
      const eligible = r.tiers.includes(data.membership.tier);
      return <article key={r.id} className="border-t border-white/20 pt-6"><div className="flex flex-wrap justify-between gap-3"><h3 className="font-serif text-2xl font-bold">{r.name}</h3><span className="text-xs font-semibold uppercase tracking-wider text-orange-200">{seat ? human(seat.effective_status || seat.status) : eligible ? 'Applications open' : 'Premium & Super'}</span></div>
        <p className="mt-2 text-sm leading-6 text-white/75">{r.purpose}</p>
        <p className="mt-4 text-sm text-white/70">Keep it moving: <strong className="text-white">{d.min_points} points + {d.min_moves} accepted {d.kind} moves</strong> every {d.review_days} days.</p>
        <p className="mt-2 text-xs leading-6 text-white/60">{d.term_days}-day term · {d.grace_days}-day grace period after a check-in is due. {r.proof}</p>
        <div className="mt-4 flex flex-wrap gap-2">{r.privileges.map(p => <span className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70" key={p}>{p}</span>)}</div>
        {seat && <div className="mt-5 border-l-2 border-orange-400 pl-4"><p className="text-sm">Your progress: {seat.points} points · {seat.moves}/{d.min_moves} role moves</p><p className="mt-2 text-xs leading-6 text-white/60">Check-in: {dateLabel(seat.review_at)} · Term ends: {dateLabel(seat.term_ends_at)}{seat.grace_until ? ` · Grace ends: ${dateLabel(seat.grace_until)}` : ''}</p>{seat.review_note && <p className="mt-2 text-sm text-orange-100">{seat.review_note}</p>}</div>}
        {eligible && (!seat || ['declined', 'paused', 'term_complete', 'tier_changed'].includes(seat.effective_status || seat.status)) && <button className={`${secondaryClass} mt-5`} onClick={() => onForm({ action: 'apply_role', title: `Step up as ${r.name}`, description: 'Tell the leads what you want to contribute. Selection starts a supported first term; a badge alone does not approve work or create payment.', values: { role_slug: r.id }, fields: <Field label="What would you bring to the role?"><textarea name="application" required minLength={20} maxLength={3000} rows={4} className={inputClass} /></Field>, submit: 'Put my name forward' })}>Put my name forward <ArrowRight className="h-4 w-4" /></button>}
      </article>;
    })}</div><p className="mt-8 text-sm leading-7 text-white/60">Stipends, bonuses, commissions, merchandise, and special invitations need a funded brief or a confirmed offer. A role does not create an automatic payment. Approved job earnings stay yours when a role ends.</p></>;
}

export function Rooms({ data, onForm }: { data: CommunityWorkspaceData; onForm: (f: CommunityForm) => void }) {
  const [room, setRoom] = useState('general');
  const role = room.startsWith('role:') ? room.slice(5) : null;
  const visible = data.posts.filter(p => role ? p.required_role === role : p.pod === room && !p.required_role);
  return <><SectionHeading kicker="Better together" title="Bring your people into it."><button onClick={() => onForm(postForm(data, role ? 'general' : room, role))} className={secondaryClass}><Plus className="h-4 w-4" /> Start something</button></SectionHeading>
    <label className="mb-6 block max-w-md text-sm text-white/70">Choose a room<select value={room} onChange={e => setRoom(e.target.value)} className={inputClass}>{data.framework.pods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}{data.myRoles.filter(s => ['active', 'grace'].includes(s.effective_status || '')).map(s => <option key={s.id} value={`role:${s.role_slug}`}>{data.framework.roles.find(r => r.id === s.role_slug)?.name} · Role room</option>)}</select></label>
    <p className="mb-5 text-sm text-white/65">{data.framework.pods.find(p => p.id === room)?.focus || 'Plan, share resources, and help the people holding this role.'}</p>
    <div className="divide-y divide-white/15">{visible.map(p => <article key={p.id} className="py-6"><p className="text-xs text-orange-200">{p.author_name} · {human(p.kind)} · {dateLabel(p.created_at)}</p><h3 className="mt-2 text-xl font-semibold">{p.title}</h3><p className="mt-3 whitespace-pre-line text-sm leading-7 text-white/75">{p.body}</p>{p.href && <a href={p.href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-orange-200">Open the shared link <ArrowRight className="h-4 w-4" /></a>}</article>)}{!visible.length && <Empty>Be the first to bring a useful question, a draft, or a collaboration to this room.</Empty>}</div>
    <section className="mt-12"><SectionHeading kicker="People to build with" title="Find your next collaborator." /><div className="divide-y divide-white/10">{data.people.filter(p => room === 'general' || role || p.pods.includes(room)).map(p => <div key={p.id} className="flex gap-4 py-5"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-400/15 text-orange-200">{p.display_name.slice(0, 1)}</span><div><h3 className="text-sm font-semibold">{p.display_name}</h3><p className="mt-1 text-xs text-orange-200">{p.career_path}</p><p className="mt-2 text-sm leading-6 text-white/60">Working toward: {p.personal_goal}</p></div></div>)}</div></section>
  </>;
}
export function Wins({ data }: { data: CommunityWorkspaceData }) {
  return <><SectionHeading kicker="What changed because you took part" title="Keep your receipts." />
    <div className="mb-10 flex flex-wrap gap-x-10 gap-y-5 border-y border-white/20 py-6">{[[data.totals.points, 'contribution points earned'], [data.totals.earnedGems, 'Gems earned from approved jobs'], [data.totals.pendingGems, 'Gems awaiting work approval']].map(([v, l]) => <div key={l}><p className="font-serif text-3xl font-bold text-orange-100">{Number(v).toLocaleString()}</p><p className="mt-1 text-xs text-white/65">{l}</p></div>)}</div>
    <p className="mb-8 text-sm leading-7 text-white/65">Contribution points count your verified work even after you use PromoPoints elsewhere. Gems are credited to your existing account when a paid job is approved. These are earned totals, not your available balance. <Link className="font-semibold text-orange-200" to="/wallet">Open your wallet →</Link></p>
    <div className="grid gap-6 sm:grid-cols-2">{data.receipts.map(s => <article key={s.id} className="relative border-b-4 border-dashed border-[#101012] bg-[#eee8dc] px-6 py-7 text-[#242321]"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#6b5743]">Promorang · Contribution receipt</p><h3 className="mt-4 font-serif text-2xl font-bold">{s.move.title}</h3><div className="my-5 border-t border-dashed border-[#958c7e]" /><dl className="space-y-3 text-sm"><div className="flex justify-between"><dt>Points earned</dt><dd className="font-bold">+{s.points_awarded}</dd></div><div className="flex justify-between"><dt>Gems earned</dt><dd className="font-bold">{Number(s.gems_awarded)}</dd></div><div className="flex justify-between"><dt>Verified result</dt><dd>{Number(s.verified_value)}</dd></div></dl><p className="mt-5 text-sm leading-6">{s.feedback}</p><p className="mt-5 text-xs">Approved {dateLabel(s.reviewed_at, true)} · Jamaica</p><p className="mt-2 break-all font-mono text-[10px] text-[#6b5743]">{s.id}</p></article>)}</div>
    {!data.receipts.length && <Empty>Your first receipt starts with one useful move. Take a brief, show what you did, and return here after approval.</Empty>}
  </>;
}
