// Runs real PostgreSQL functions in an isolated PGlite database; no production credentials.
// COMMUNITY_PGLITE_MODULE may point to a separately installed @electric-sql/pglite.
const { PGlite } = require(process.env.COMMUNITY_PGLITE_MODULE || '@electric-sql/pglite');
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const db = new PGlite();
const A = '00000000-0000-4000-8000-000000000001';
const B = '00000000-0000-4000-8000-000000000002';
const C = '00000000-0000-4000-8000-000000000003';
const O = '00000000-0000-4000-8000-000000000004';
const S = 'b8ca4dba-f067-4daf-9206-b2908ff7aa11';
const command = async (actor, action, data = {}) => (await db.query(
  'select public.community_command($1,$2,$3::jsonb) as result', [actor, action, JSON.stringify(data)])).rows[0].result;
const one = async (sql, params = []) => (await db.query(sql, params)).rows[0];
let goal, result, move, work, memberB, memberC;
const draft = overrides => ({ title: 'Create a useful tutorial', brief: 'Create an original tutorial that helps a member publish useful work.',
  proof_prompt: 'Share the original tutorial link and what the member learned.', kind: 'content', pod: 'creators', result_id: result,
  points: 30, gems: 20, capacity: 2, min_tier: 'free', required_role: null, due_at: '2099-10-01T12:00:00Z', ...overrides });
before(async () => {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create function auth.uid() returns uuid language sql as $$ select null::uuid $$;
    create table public.users(id uuid primary key); create table public.user_roles(user_id uuid,role text);
    create table public.moments(id uuid primary key);`);
  const root = path.resolve(__dirname, '../../supabase/migrations');
  await db.exec(fs.readFileSync(path.join(root, '202607010002_canonical_economy.sql'), 'utf8'));
  await db.exec(fs.readFileSync(path.join(root, '20260914034622_community_members_experience.sql'), 'utf8'));
  for (const id of [A, B, C, O]) await db.query('insert into public.users(id) values($1)', [id]);
  await db.query("insert into public.user_roles values($1,'admin')", [A]);
});
after(() => db.close());

test('direct browser roles cannot read private tables or call privileged functions', async () => {
  for (const role of ['anon', 'authenticated']) {
    await db.exec(`set role ${role}`);
    try {
      for (const table of ['community_memberships', 'community_moves', 'community_posts', 'community_submissions', 'community_sessions']) {
        await assert.rejects(db.query(`select * from public.${table}`), /permission denied/);
      }
      await assert.rejects(command(A, 'bootstrap', { display_name: 'Fake admin' }), /permission denied/);
      await assert.rejects(db.query('select public.community_role_active($1,$2,$3)', [S, A, 'creator']), /permission denied/);
    } finally { await db.exec('reset role'); }
  }
  const tables = await db.query("select relname,relrowsecurity from pg_class where relname like 'community_%' and relkind='r'");
  assert.equal(tables.rows.length, 12);
  assert.ok(tables.rows.every(t => t.relrowsecurity));
});

test('platform administration and membership approval remain separate from account metadata', async () => {
  await assert.rejects(command(B, 'bootstrap', { display_name: 'Self-appointed' }), /administrator/);
  await command(A, 'bootstrap', { display_name: 'Lead' });
  memberB = await command(B, 'apply', { display_name: 'Member B', career_path: 'YouTube Creator', personal_goal: 'Publish my first useful series' });
  memberC = await command(C, 'apply', { display_name: 'Member C', career_path: 'Community Leader', personal_goal: 'Help creators publish their best work' });
  assert.equal(memberB.status, 'pending');
  await assert.rejects(command(B, 'goal', {}), /Active community membership/);
  await command(A, 'membership', { id: memberB.id, status: 'active', tier: 'free' });
  await command(A, 'membership', { id: memberC.id, status: 'active', tier: 'super' });
  await assert.rejects(command(B, 'membership', { id: memberB.id, status: 'active', tier: 'super' }), /lead/);
  await command(A, 'lead_access', { id: memberC.id, can_manage: true });
  assert.equal((await one('select can_manage from community_memberships where id=$1', [memberC.id])).can_manage, true);
});

test('goals have independent measurable wins and pitches require linked goals', async () => {
  goal = await command(A, 'goal', { title: 'Help members publish useful work', why: 'Consistent original work helps members grow an audience.',
    starts_on: '2026-09-01', ends_on: '2099-10-01', results: [{ title: 'Original tutorials published', unit: 'tutorials', target: 10 }, { title: 'First-time creators supported', unit: 'members', target: 5 }] });
  const rows = (await db.query('select * from community_results where goal_id=$1 order by title', [goal.id])).rows;
  assert.equal(rows.length, 2); result = rows.find(r => r.unit === 'tutorials').id;
  const orphan = await command(B, 'propose', draft({ result_id: null }));
  await assert.rejects(command(A, 'publish', { move_id: orphan.id }), /measurable win/);
});

test('paid jobs cannot open without funds; opening twice cannot debit twice', async () => {
  move = await command(B, 'propose', draft());
  await assert.rejects(command(A, 'publish', { move_id: move.id }), /Insufficient gems balance/);
  assert.equal((await one('select status from community_moves where id=$1', [move.id])).status, 'proposed');
  await db.query("select post_economy_transaction($1,'gems',100,'earn','test_funding','test:fund')", [A]);
  await command(A, 'publish', { move_id: move.id });
  await command(A, 'publish', { move_id: move.id });
  assert.equal(Number((await one('select gems from economy_wallets where user_id=$1', [A])).gems), 60);
  assert.equal(Number((await one('select secured_gems from community_moves where id=$1', [move.id])).secured_gems), 40);
});

test('claiming is idempotent, capacity-limited, and unavailable to outsiders', async () => {
  await assert.rejects(command(O, 'claim', { move_id: move.id }), /Active community membership/);
  work = await command(B, 'claim', { move_id: move.id });
  assert.equal((await command(B, 'claim', { move_id: move.id })).id, work.id);
  await command(C, 'claim', { move_id: move.id });
  await assert.rejects(command(A, 'claim', { move_id: move.id }), /places.*taken/);
  await assert.rejects(command(A, 'close', { move_id: move.id }), /Resolve or withdraw/);
});

test('proof is owner-bound; submission and revision do not award rewards', async () => {
  await assert.rejects(command(C, 'submit', { move_id: move.id, submission_id: work.id, proof: 'Stolen ownership of another person’s work' }), /another member/);
  await command(B, 'submit', { move_id: move.id, submission_id: work.id, proof: 'I published an original tutorial and helped one creator use it.', proof_url: 'https://example.com/tutorial' });
  assert.equal(Number((await one('select gems from economy_wallets where user_id=$1', [B])).gems), 0);
  await command(A, 'review', { move_id: move.id, submission_id: work.id, decision: 'changes_requested', verified_value: 999, feedback: 'Add the learner’s outcome to the recap.' });
  assert.equal(Number((await one('select current_value from community_results where id=$1', [result])).current_value), 0);
  await command(B, 'submit', { move_id: move.id, submission_id: work.id, proof: 'Updated tutorial and learner outcome are now in the recap.' });
});

test('approval posts points, Gems, and goal progress exactly once in one transaction', async () => {
  const payload = { move_id: move.id, submission_id: work.id, decision: 'approved', verified_value: 1, feedback: 'Original tutorial and learner outcome verified.' };
  await command(A, 'review', payload); await command(A, 'review', payload);
  const wallet = await one('select points,gems from economy_wallets where user_id=$1', [B]);
  assert.equal(Number(wallet.points), 30); assert.equal(Number(wallet.gems), 20);
  assert.equal(Number((await one('select current_value from community_results where id=$1', [result])).current_value), 1);
  assert.equal(Number((await one('select released_gems from community_moves where id=$1', [move.id])).released_gems), 20);
  assert.equal(Number((await one("select count(*) as n from economy_transactions where reference_id=$1", [work.id])).n), 2);
});

test('a lead cannot approve their own work and unused funds return once', async () => {
  const cwork = await one('select * from community_submissions where move_id=$1 and user_id=$2', [move.id, C]);
  await command(C, 'submit', { move_id: move.id, submission_id: cwork.id, proof: 'I created a second useful original tutorial.' });
  await assert.rejects(command(C, 'review', { move_id: move.id, submission_id: cwork.id, decision: 'approved', verified_value: 1, feedback: 'Self approval should not be allowed.' }), /Another lead/);
  await command(A, 'review', { move_id: move.id, submission_id: cwork.id, decision: 'declined', verified_value: 0, feedback: 'The submitted tutorial does not match the brief.' });
  const reclaimed = await command(C, 'claim', { move_id: move.id });
  assert.equal(reclaimed.id, cwork.id); assert.equal(reclaimed.status, 'claimed');
  await command(C, 'submit', { move_id: move.id, submission_id: cwork.id, proof: 'I revised the tutorial with a clearer member outcome.' });
  await command(A, 'review', { move_id: move.id, submission_id: cwork.id, decision: 'declined', verified_value: 0, feedback: 'Keep iterating with the mentor before publishing.' });
  await command(A, 'close', { move_id: move.id }); await command(A, 'close', { move_id: move.id });
  assert.equal(Number((await one('select gems from economy_wallets where user_id=$1', [A])).gems), 80);
  assert.equal(Number((await one('select refunded_gems from community_moves where id=$1', [move.id])).refunded_gems), 20);
});

test('role eligibility, review progress, grace, expiry, and reapplication are enforced', async () => {
  await assert.rejects(command(B, 'apply_role', { role_slug: 'mentor', application: 'I would like to support new members.' }), /not open/);
  const seat = await command(B, 'apply_role', { role_slug: 'creator', application: 'I will make useful original tutorials with clear outcomes.' });
  await command(A, 'appoint', { id: seat.id, approved: true, note: 'Welcome. Build two accepted tutorials in your first month.' });
  assert.equal((await one('select community_role_active($1,$2,$3) as active', [S, B, 'creator'])).active, true);
  const checked = await command(A, 'review_role', { id: seat.id, note: 'One more accepted tutorial will meet the target.' });
  assert.equal(checked.status, 'grace');
  await db.query("update community_role_seats set grace_until=now()-interval '1 day' where id=$1", [seat.id]);
  assert.equal((await one('select community_role_active($1,$2,$3) as active', [S, B, 'creator'])).active, false);
  assert.equal((await command(B, 'apply_role', { role_slug: 'creator', application: 'I am ready to start a fresh term with two new tutorials.' })).status, 'applied');
  await command(A, 'appoint', { id: seat.id, approved: true, note: 'Start a fresh term with a supported first month.' });
  await db.query("update community_role_seats set term_ends_at=now()-interval '1 day' where id=$1", [seat.id]);
  assert.equal((await one('select community_role_active($1,$2,$3) as active', [S, B, 'creator'])).active, false);
  assert.equal((await command(B, 'apply_role', { role_slug: 'creator', application: 'I am applying for the next term as a content creator.' })).status, 'applied');
});

test('tier and role restrictions block actions, session RSVPs, and private role-room posting', async () => {
  const restricted = await command(A, 'propose', draft({ gems: 0, min_tier: 'premium' }));
  await command(A, 'publish', { move_id: restricted.id });
  await assert.rejects(command(B, 'claim', { move_id: restricted.id }), /different community tier/);
  const session = await command(A, 'session', { title: 'Mentor working session', description: 'Plan the next month of mentoring.', starts_at: '2099-01-01T14:00:00Z', duration_minutes: 60, min_tier: 'premium', required_role: 'mentor' });
  await assert.rejects(command(B, 'rsvp', { id: session.id }), /different community tier/);
  await assert.rejects(command(B, 'post', { kind: 'note', pod: 'general', required_role: 'mentor', title: 'Private room post', body: 'Attempt to enter the private mentor room.' }), /active role/);
  await assert.rejects(command(B, 'post', { kind: 'resource', pod: 'general', title: 'Fake official guide', body: 'Unauthorized official resource publication.' }), /lead publishes/);
});

test('suspension blocks new actions without taking back approved earnings', async () => {
  await command(A, 'membership', { id: memberB.id, status: 'paused', tier: 'free' });
  await assert.rejects(command(B, 'post', { kind: 'note' }), /Active community membership/);
  assert.equal(Number((await one('select gems from economy_wallets where user_id=$1', [B])).gems), 20);
});

test('all service functions use invoker security with no browser execution grants', async () => {
  const functions = (await db.query("select proname,prosecdef from pg_proc where proname in ('community_command','community_role_active')")).rows;
  assert.ok(functions.every(f => !f.prosecdef));
  const audit = await one("select count(*) as n from community_audit where action in ('review','membership','lead_access')");
  assert.ok(Number(audit.n) >= 5);
});
