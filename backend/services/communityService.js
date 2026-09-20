const { supabase } = require('../lib/supabase');
const framework = require('../community/framework');
const { parseCommand } = require('../community/validation');
const SPACE_ID = 'b8ca4dba-f067-4daf-9206-b2908ff7aa11';
const LEAD_ACTIONS = new Set(['membership', 'goal', 'publish', 'close', 'review', 'appoint', 'review_role', 'session', 'policy', 'release_claim', 'lead_access']);
const tierRank = tier => framework.tiers.indexOf(tier);
const roleState = (seat, definition, now = Date.now()) => {
  if (!['active', 'grace'].includes(seat.status)) return seat.status;
  if (Date.parse(seat.term_ends_at) <= now) return 'term_complete';
  const limit = seat.status === 'grace' ? Date.parse(seat.grace_until)
    : Date.parse(seat.review_at) + definition.grace_days * 86400000;
  if (!(limit > now)) return 'paused';
  if (seat.status === 'grace' || Date.parse(seat.review_at) <= now) return 'grace';
  return 'active';
};

function createCommunityService(db = supabase) {
  const read = async query => {
    const { data, error } = await query;
    if (error) {
      const missing = ['42P01', 'PGRST205', 'PGRST202'].includes(error.code);
      const e = new Error(missing ? 'The community is being prepared. Please try again later.' : 'Community data could not be loaded. Please try again.');
      e.status = missing ? 503 : 500; throw e;
    }
    return data;
  };
  const ready = () => { if (!db) { const e = new Error('The community is temporarily unavailable.'); e.status = 503; throw e; } };
  const membership = userId => read(db.from('community_memberships').select('*').eq('space_id', SPACE_ID).eq('user_id', userId).maybeSingle());
  const isPlatformAdmin = user => (user.roles || []).some(r => ['admin', 'administrator', 'master_admin'].includes(r));
  async function access(user) {
    ready();
    return { membership: await membership(user.id), canBootstrap: isPlatformAdmin(user), paths: framework.paths };
  }
  async function requireMember(user) {
    ready();
    const member = await membership(user.id);
    if (member?.status !== 'active') { const e = new Error('This space is for approved community members.'); e.status = 403; throw e; }
    return member;
  }
  async function workspace(user) {
    const member = await requireMember(user);
    // Read every receipt page for correct lifetime/review totals, independent of the UI history limit.
    const ownWork = [];
    for (let from = 0; ; from += 500) {
      const rows = await read(db.from('community_submissions').select('*,move:community_moves!inner(*)')
        .eq('user_id', user.id).eq('move.space_id', SPACE_ID).order('id').range(from, from + 499));
      ownWork.push(...rows);
      if (rows.length < 500) break;
    }
    const [moves, goals, seats, definitions, sessions, posts, rsvps, people] = await Promise.all([
      read(db.from('community_moves').select('*').eq('space_id', SPACE_ID).order('created_at', { ascending: false }).limit(300)),
      read(db.from('community_goals').select('*,results:community_results(*)').eq('space_id', SPACE_ID).order('ends_on', { ascending: false }).limit(100)),
      read(db.from('community_role_seats').select('*').eq('space_id', SPACE_ID).eq('user_id', user.id)),
      read(db.from('community_role_definitions').select('*')),
      read(db.from('community_sessions').select('*').eq('space_id', SPACE_ID).order('starts_at', { ascending: false }).limit(100)),
      read(db.from('community_posts').select('*').eq('space_id', SPACE_ID).order('created_at', { ascending: false }).limit(200)),
      read(db.from('community_session_rsvps').select('session_id').eq('user_id', user.id)),
      read(db.from('community_memberships').select('id,user_id,display_name,career_path,personal_goal,pods,joined_at')
        .eq('space_id', SPACE_ID).eq('status', 'active').order('joined_at').limit(300)),
    ]);
    const definitionMap = Object.fromEntries(definitions.map(d => [d.slug, d]));
    const myRoles = seats.map(seat => {
      const d = definitionMap[seat.role_slug];
      const recent = ownWork.filter(s => s.status === 'approved' && Date.parse(s.reviewed_at) >= Date.now() - d.review_days * 86400000);
      return { ...seat, effective_status: d.tiers.includes(member.tier) ? roleState(seat, d) : 'tier_changed',
        points: recent.reduce((sum, s) => sum + s.points_awarded, 0),
        moves: recent.filter(s => s.move.kind === d.kind).length, definition: d };
    });
    const activeRoles = myRoles.filter(s => ['active', 'grace'].includes(s.effective_status)).map(s => s.role_slug);
    const eligible = item => tierRank(member.tier) >= tierRank(item.min_tier || 'free')
      && (!item.required_role || activeRoles.includes(item.required_role));
    const approved = ownWork.filter(s => s.status === 'approved');
    const recent = approved.filter(s => Date.parse(s.reviewed_at) >= Date.now() - 30 * 86400000);
    const ownMoves = new Set(ownWork.map(s => s.move_id));
    let lead = null;
    if (member.can_manage) {
      const [members, applications, reviewQueue, audit, unfinished] = await Promise.all([
        read(db.from('community_memberships').select('*').eq('space_id', SPACE_ID).order('created_at', { ascending: false }).limit(300)),
        read(db.from('community_role_seats').select('*').eq('space_id', SPACE_ID).order('review_at').limit(300)),
        read(db.from('community_submissions').select('*,move:community_moves!inner(*)').eq('move.space_id', SPACE_ID)
          .eq('status', 'submitted').order('submitted_at').limit(200)),
        read(db.from('community_audit').select('id,actor_id,action,record_id,created_at').eq('space_id', SPACE_ID)
          .order('created_at', { ascending: false }).limit(50)),
        read(db.from('community_submissions').select('*,move:community_moves!inner(*)').eq('move.space_id', SPACE_ID)
          .in('status', ['claimed', 'changes_requested']).order('created_at').limit(200)),
      ]);
      lead = { members, applications, reviewQueue, audit, unfinished, canAssignLeads: isPlatformAdmin(user) };
    }
    // Never return a previously authorized snapshot after a membership has been suspended.
    const latest = await requireMember(user);
    if (latest.tier !== member.tier || latest.can_manage !== member.can_manage) {
      const e = new Error('Your community access changed. Refresh to continue.'); e.status = 409; throw e;
    }
    return {
      membership: member, framework, definitions, myRoles, people, goals,
      moves: moves.filter(j => member.can_manage || ownMoves.has(j.id) || j.created_by === user.id || (j.status === 'open' && eligible(j)))
        .filter(j => member.can_manage || j.status !== 'proposed' || j.created_by === user.id)
        .map(j => ({ ...j, eligible: eligible(j) })),
      sessions: sessions.filter(s => member.can_manage || eligible(s)).map(s => ({ ...s, eligible: eligible(s), joined: rsvps.some(r => r.session_id === s.id) })),
      posts: posts.filter(p => member.can_manage || eligible(p)),
      // Preserve active work even when the 300 newest board rows no longer include its move.
      work: ownWork.filter(s => s.status !== 'approved'), receipts: approved.sort((a, b) => Date.parse(b.reviewed_at) - Date.parse(a.reviewed_at)).slice(0, 100),
      totals: { points: approved.reduce((n, s) => n + s.points_awarded, 0), recentPoints: recent.reduce((n, s) => n + s.points_awarded, 0),
        approvedMoves: approved.length, earnedGems: approved.reduce((n, s) => n + Number(s.gems_awarded), 0),
        pendingGems: ownWork.filter(s => s.status === 'submitted').reduce((n, s) => n + Number(s.move.gems), 0) },
      lead,
    };
  }
  async function command(user, action, input) {
    ready();
    const data = parseCommand(action, input);
    if (['bootstrap', 'lead_access'].includes(action) && !isPlatformAdmin(user)) { const e = new Error('A platform administrator must manage lead access.'); e.status = 403; throw e; }
    if (!['apply', 'bootstrap'].includes(action)) {
      const member = await requireMember(user);
      if (LEAD_ACTIONS.has(action) && !member.can_manage) { const e = new Error('A community lead must do this.'); e.status = 403; throw e; }
    }
    if (['apply', 'bootstrap'].includes(action)) data.display_name = String(user.display_name || user.full_name || user.username || 'Member').slice(0, 120);
    const { data: result, error } = await db.rpc('community_command', { p_actor: user.id, p_action: action, p_data: data });
    if (error) {
      const e = new Error(error.code === '42501' ? 'You do not have access to this community action.'
        : error.code === 'P0001' ? error.message : 'This change could not be saved. Refresh and try again.');
      e.status = error.code === '42501' ? 403 : error.code === 'P0001' ? 409 : 500; throw e;
    }
    return result;
  }
  return { access, workspace, command };
}
module.exports = { ...createCommunityService(), createCommunityService, roleState };
