const { z } = require('zod');
const framework = require('./framework');
const text = (min, max) => z.string().trim().min(min).max(max);
const uuid = z.string().uuid();
const tier = z.enum(framework.tiers);
const role = z.enum(framework.roles.map(r => r.id));
const pod = z.enum(framework.pods.map(p => p.id));
// Links are displayed, never fetched by the server. Reject executable and protocol-relative URLs.
const link = z.string().trim().max(2000).refine(value => {
  if (!value) return true;
  if (value.startsWith('/') && !/^\/[/\\]/.test(value) && !/[\\\s]/.test(value)) return true;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; }
}, 'Use an https link or a path within Promorang').nullable().optional();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => {
  const d = new Date(`${v}T12:00:00Z`); return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === v;
}, 'Choose a valid date');
const instant = z.string().datetime({ offset: true });
const schemas = {
  apply: z.object({ career_path: z.enum(framework.paths), personal_goal: text(10, 1000) }),
  bootstrap: z.object({}),
  profile: z.object({ career_path: z.enum(framework.paths), personal_goal: text(10, 1000), pods: z.array(pod).min(1).max(5) }),
  membership: z.object({ id: uuid, status: z.enum(['active', 'paused', 'removed']), tier }),
  lead_access: z.object({ id: uuid, can_manage: z.boolean() }),
  goal: z.object({ title: text(5, 140), why: text(10, 1500), starts_on: date, ends_on: date,
    results: z.array(z.object({ title: text(3, 140), unit: text(1, 40), target: z.number().positive().max(100000000) })).min(1).max(5),
  }).refine(v => v.ends_on >= v.starts_on, 'The end must come after the start'),
  propose: z.object({ title: text(5, 140), brief: text(20, 4000), proof_prompt: text(10, 2000),
    kind: z.enum(framework.kinds), pod, result_id: uuid.nullable(), points: z.number().int().min(0).max(1000),
    gems: z.number().min(0).max(100000).multipleOf(0.01), capacity: z.number().int().min(1).max(500),
    min_tier: tier, required_role: role.nullable(), due_at: instant }),
  publish: z.object({ move_id: uuid }), close: z.object({ move_id: uuid }), claim: z.object({ move_id: uuid }),
  submit: z.object({ move_id: uuid, submission_id: uuid, proof: text(10, 6000), proof_url: link }),
  withdraw: z.object({ move_id: uuid, submission_id: uuid }),
  release_claim: z.object({ move_id: uuid, submission_id: uuid, feedback: text(10, 2000) }),
  review: z.object({ move_id: uuid, submission_id: uuid, decision: z.enum(['approved', 'changes_requested', 'declined']),
    feedback: text(10, 3000), verified_value: z.number().min(0).max(100000000) }),
  apply_role: z.object({ role_slug: role, application: text(20, 3000) }),
  appoint: z.object({ id: uuid, approved: z.boolean(), note: text(10, 2000) }),
  review_role: z.object({ id: uuid, note: text(10, 2000) }),
  policy: z.object({ role_slug: role, min_points: z.number().int().min(0).max(10000), min_moves: z.number().int().min(1).max(100) }),
  session: z.object({ title: text(5, 140), description: text(10, 2000), starts_at: instant,
    duration_minutes: z.number().int().min(15).max(480), min_tier: tier, required_role: role.nullable(),
    join_url: link, replay_url: link, moment_id: uuid.nullable() }),
  rsvp: z.object({ id: uuid }),
  post: z.object({ title: text(3, 140), body: text(10, 4000), kind: z.enum(['note', 'feedback', 'big_up', 'resource', 'newsletter']),
    pod, min_tier: tier, required_role: role.nullable(), href: link }),
};
function parseCommand(action, data) {
  const schema = Object.hasOwn(schemas, action) && schemas[action];
  if (!schema) { const err = new Error('Unknown community action'); err.status = 400; throw err; }
  const result = schema.safeParse(data);
  if (!result.success) {
    const err = new Error(result.error.issues.map(i => `${i.path.join('.') || 'Request'}: ${i.message}`).join('; '));
    err.status = 400; throw err;
  }
  return result.data;
}
module.exports = { parseCommand, link };
