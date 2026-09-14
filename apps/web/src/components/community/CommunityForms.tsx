import { useState, type FormEvent, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import type { CommunityAction, CommunityWorkspaceData } from '@/types/community';

export const inputClass = 'mt-2 min-h-12 w-full rounded-xl border border-white/20 bg-[#18181b] px-3 py-3 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400';
export const buttonClass = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-black transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300 disabled:cursor-wait disabled:opacity-50';
export const secondaryClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-300 disabled:opacity-50';
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-sm font-medium text-white/80">{label}{children}</label>;
}
export type CommunityForm = { action: string; title: string; description: string; fields: ReactNode;
  values?: Record<string, unknown>; transform?: (values: Record<string, FormDataEntryValue>) => Record<string, unknown>; submit?: string };

export function CommunityFormDialog({ form, onClose, onAction }: { form: CommunityForm | null; onClose: () => void; onAction: CommunityAction }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form || pending) return;
    const entries = Object.fromEntries(new FormData(event.currentTarget).entries());
    setPending(true); setError('');
    try {
      await onAction(form.action, { ...form.values, ...(form.transform ? form.transform(entries) : entries) });
      onClose();
    } catch (err) { setError(err instanceof Error ? err.message : 'This could not be saved. Try again.'); }
    finally { setPending(false); }
  }
  return <Dialog open={Boolean(form)} onOpenChange={open => { if (!open && !pending) { setError(''); onClose(); } }}>
    <DialogContent className="max-h-[90dvh] overflow-y-auto border-white/20 bg-[#101012] text-white sm:max-w-xl">
      <DialogTitle className="pr-5 font-serif text-3xl">{form?.title}</DialogTitle>
      <DialogDescription className="text-white/65">{form?.description}</DialogDescription>
      <form key={`${form?.action}-${JSON.stringify(form?.values)}`} onSubmit={submit} className="mt-3 space-y-5">
        {form?.fields}
        {error && <p role="alert" className="rounded-xl border border-red-300/30 bg-red-400/10 p-3 text-sm text-red-100">{error}</p>}
        <button disabled={pending} className={buttonClass} type="submit">{pending ? 'Saving…' : form?.submit || 'Save'}</button>
      </form>
    </DialogContent>
  </Dialog>;
}

export function tierField() {
  return <Field label="Community tier"><select name="min_tier" className={inputClass} defaultValue="free"><option value="free">All members</option><option value="premium">Premium and Super</option><option value="super">Super</option></select></Field>;
}
export function roleField(data: CommunityWorkspaceData) {
  return <Field label="Role access"><select name="required_role" className={inputClass}><option value="">Any community role</option>{data.framework.roles.map(r => <option value={r.id} key={r.id}>{r.name}</option>)}</select></Field>;
}
export function moveForm(data: CommunityWorkspaceData): CommunityForm {
  return { action: 'propose', title: 'Put a move on the board',
    description: 'What needs doing, what counts as done, and who benefits? A lead reviews the brief and sets aside any Gems before opening it.', submit: 'Send the pitch',
    fields: <>
      <Field label="Give it a clear name"><input name="title" required minLength={5} maxLength={140} className={inputClass} placeholder="Help three new creators publish their first post" /></Field>
      <Field label="The job to be done"><textarea name="brief" required minLength={20} maxLength={4000} className={inputClass} rows={3} placeholder="When… I need help to… so that…" /></Field>
      <Field label="What will prove it worked?"><textarea name="proof_prompt" required minLength={10} maxLength={2000} className={inputClass} rows={2} placeholder="Share the published links and what changed for each creator." /></Field>
      <Field label="Which win does this move forward?"><select name="result_id" className={inputClass} required><option value="">Choose a measurable win</option>{data.goals.flatMap(g => g.results.map(r => <option key={r.id} value={r.id}>{g.title} · {r.title}</option>))}</select></Field>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Type of contribution"><select name="kind" className={inputClass}>{data.framework.kinds.map(k => <option key={k}>{k}</option>)}</select></Field>
        <Field label="Room"><select name="pod" className={inputClass}>{data.framework.pods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field></div>
      <div className="grid grid-cols-3 gap-3"><Field label="Points"><input name="points" type="number" defaultValue={30} min={0} max={1000} required className={inputClass} /></Field>
        <Field label="Gems per person"><input name="gems" type="number" defaultValue={0} min={0} max={100000} step="0.01" required className={inputClass} /></Field>
        <Field label="Places"><input name="capacity" type="number" defaultValue={1} min={1} max={500} required className={inputClass} /></Field></div>
      <Field label="Deadline in your local time"><input name="due_at" type="datetime-local" required className={inputClass} /></Field>
      {tierField()}{roleField(data)}
    </>, transform: v => ({ ...v, result_id: v.result_id || null, required_role: v.required_role || null,
      points: Number(v.points), gems: Number(v.gems), capacity: Number(v.capacity), due_at: new Date(String(v.due_at)).toISOString() }) };
}

export function goalForm(): CommunityForm {
  return { action: 'goal', title: 'Choose the next shared goal', description: 'Name the change you want to make. Add up to three measurable wins so the crew knows when it is working.',
    fields: <>
      <Field label="Our goal"><input name="title" required minLength={5} maxLength={140} className={inputClass} placeholder="Help new members find their first paid opportunity" /></Field>
      <Field label="Why does it matter?"><textarea name="why" required minLength={10} maxLength={1500} rows={2} className={inputClass} /></Field>
      <div className="grid grid-cols-2 gap-3"><Field label="Start"><input type="date" name="starts_on" required className={inputClass} /></Field><Field label="Finish"><input type="date" name="ends_on" required className={inputClass} /></Field></div>
      {[0, 1, 2].map(i => <fieldset key={i} className="space-y-3 rounded-xl border border-white/15 p-4"><legend className="px-2 text-sm">Win {i + 1}{i > 0 ? ' · optional' : ''}</legend>
        <Field label="What will change?"><input name={`result_${i}`} required={i === 0} minLength={3} maxLength={140} className={inputClass} placeholder="Members completing a first paid job" /></Field>
        <div className="grid grid-cols-2 gap-3"><Field label="Target"><input type="number" name={`target_${i}`} required={i === 0} min={1} max={100000000} className={inputClass} /></Field>
          <Field label="Unit"><input name={`unit_${i}`} required={i === 0} maxLength={40} className={inputClass} placeholder="members" /></Field></div>
      </fieldset>)}
    </>, transform: v => ({ title: v.title, why: v.why, starts_on: v.starts_on, ends_on: v.ends_on,
      results: [0, 1, 2].filter(i => String(v[`result_${i}`] || '').trim()).map(i => ({ title: v[`result_${i}`], target: Number(v[`target_${i}`]), unit: v[`unit_${i}`] })) }) };
}

export function postForm(data: CommunityWorkspaceData, pod = 'general', role: string | null = null): CommunityForm {
  return { action: 'post', title: role ? 'Speak in your role room' : 'Bring something to the room',
    description: 'Ask for help, share useful feedback, or give someone a specific big up.',
    values: { pod, required_role: role }, fields: <>
      <Field label="What are you sharing?"><select name="kind" className={inputClass}><option value="note">A conversation or collaboration</option><option value="feedback">Feedback or a question</option><option value="big_up">A big up</option>{data.membership.can_manage && <><option value="resource">A resource or recording</option><option value="newsletter">This week’s newsletter</option></>}</select></Field>
      <Field label="Title"><input name="title" required minLength={3} maxLength={140} className={inputClass} /></Field>
      <Field label="Tell the room"><textarea name="body" rows={4} required minLength={10} maxLength={4000} className={inputClass} /></Field>
      <Field label="Link · optional"><input name="href" maxLength={2000} className={inputClass} placeholder="https://…" /></Field>
      {data.membership.can_manage && tierField()}
    </>, transform: v => ({ ...v, min_tier: v.min_tier || 'free', href: v.href || null }) };
}
