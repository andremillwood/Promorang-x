const { supabase } = require('../lib/supabase');
const framework = require('../community/framework');
const { parseCommand, parseAdminCommand } = require('../community/validation');
const SPACE_ID = 'b8ca4dba-f067-4daf-9206-b2908ff7aa11';
const LEAD_ACTIONS = new Set(['membership', 'goal', 'publish', 'close', 'review', 'appoint', 'review_role', 'session', 'policy', 'release_claim', 'lead_access']);
const ENGINE_ACTIONS = new Set(['engine_open', 'engine_contact', 'engine_deal', 'engine_task', 'engine_task_complete', 'engine_automation', 'engine_form']);
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
  const isMissing = error => ['42P01', 'PGRST205', 'PGRST202', '42703'].includes(error?.code);
  const readOptional = async (query, fallback = null) => {
    ready();
    const { data, error } = await query;
    if (error) {
      if (isMissing(error)) return fallback;
      const e = new Error('Community data could not be loaded. Please try again.'); e.status = 500; throw e;
    }
    return data;
  };
  const membershipQuery = userId => db.from('community_memberships').select('*').eq('space_id', SPACE_ID).eq('user_id', userId).maybeSingle();
  const membership = userId => read(membershipQuery(userId));
  const isPlatformAdmin = user => (user.roles || []).some(r => ['admin', 'administrator', 'master_admin'].includes(r));
  const requirePlatformAdmin = user => {
    if (!isPlatformAdmin(user)) { const e = new Error('A platform administrator is required for this control room.'); e.status = 403; throw e; }
  };
  async function access(user) {
    ready();
    const settings = await readOptional(db.from('community_program_settings').select('*').eq('id', 1).maybeSingle(), {
      participant_access_enabled: true, matrix_program_enabled: false, business_engine_enabled: true, matrix_mode: 'pilot',
    });
    return { membership: await membership(user.id), canBootstrap: isPlatformAdmin(user), isPlatformAdmin: isPlatformAdmin(user), participantAccessEnabled: settings?.participant_access_enabled !== false, paths: framework.paths };
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
    const [programSettings, networkPlans, networkEnrollment, engineWorkspace] = await Promise.all([
      readOptional(db.from('community_program_settings').select('*').eq('id', 1).maybeSingle(), null),
      readOptional(db.from('community_network_plans').select('*').in('status', ['available', 'draft']).order('monthly_fee_cents'), []),
      readOptional(db.from('community_network_enrollments').select('*,plan:community_network_plans(*)').eq('space_id', SPACE_ID).eq('user_id', user.id).maybeSingle(), null),
      readOptional(db.from('community_engine_workspaces').select('id,name,plan_key,status,timezone,created_at,updated_at').eq('owner_id', user.id).maybeSingle(), null),
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
      network: {
        settings: programSettings || { participant_access_enabled: true, matrix_program_enabled: false, business_engine_enabled: true, matrix_mode: 'pilot' },
        plans: networkPlans || [], enrollment: networkEnrollment,
      },
      engine: { enabled: programSettings?.business_engine_enabled !== false, workspace: engineWorkspace },
      isPlatformAdmin: isPlatformAdmin(user),
      lead,
    };
  }

  const ENGINE_STAGE_SEEDS = [
    { stage_key: 'new', name: 'New', sort_order: 10, color: 'slate' },
    { stage_key: 'qualified', name: 'Qualified', sort_order: 20, color: 'blue' },
    { stage_key: 'conversation', name: 'Conversation', sort_order: 30, color: 'violet' },
    { stage_key: 'proposal', name: 'Proposal', sort_order: 40, color: 'amber' },
    { stage_key: 'won', name: 'Won', sort_order: 50, color: 'emerald', is_won: true },
    { stage_key: 'lost', name: 'Lost', sort_order: 60, color: 'rose', is_lost: true },
  ];

  async function engineWorkspaceFor(user) {
    return readOptional(db.from('community_engine_workspaces').select('*').eq('owner_id', user.id).maybeSingle(), null);
  }

  async function engine(user) {
    const member = await requireMember(user);
    const settings = await readOptional(db.from('community_program_settings').select('*').eq('id', 1).maybeSingle(), null);
    const plans = await readOptional(db.from('community_network_plans').select('*').in('status', ['available', 'draft']).order('monthly_fee_cents'), []);
    const current = await engineWorkspaceFor(user);
    if (!current) {
      return { enabled: settings?.business_engine_enabled !== false, canCreate: member.member_kind === 'builder' || member.can_manage, workspace: null, plans: plans || [], stages: [], contacts: [], deals: [], tasks: [], automations: [], forms: [] };
    }
    const [stages, contacts, deals, tasks, automations, forms] = await Promise.all([
      readOptional(db.from('community_engine_stages').select('*').eq('workspace_id', current.id).order('sort_order'), []),
      readOptional(db.from('community_engine_contacts').select('*').eq('workspace_id', current.id).order('updated_at', { ascending: false }).limit(500), []),
      readOptional(db.from('community_engine_deals').select('*,contact:community_engine_contacts(display_name,email),stage:community_engine_stages(stage_key,name,color,is_won,is_lost)').eq('workspace_id', current.id).order('updated_at', { ascending: false }).limit(500), []),
      readOptional(db.from('community_engine_tasks').select('*').eq('workspace_id', current.id).order('due_at', { ascending: true, nullsFirst: false }).limit(500), []),
      readOptional(db.from('community_engine_automations').select('*').eq('workspace_id', current.id).order('created_at', { ascending: false }), []),
      readOptional(db.from('community_engine_forms').select('*').eq('workspace_id', current.id).order('created_at', { ascending: false }), []),
    ]);
    return { enabled: settings?.business_engine_enabled !== false, canCreate: true, workspace: current, plans: plans || [], stages: stages || [], contacts: contacts || [], deals: deals || [], tasks: tasks || [], automations: automations || [], forms: forms || [] };
  }

  async function ownedEngineWorkspace(user, requireBuilder = false) {
    const member = await requireMember(user);
    if (requireBuilder && member.member_kind !== 'builder' && !member.can_manage) {
      const e = new Error('The Business Engine is available to approved Business Builders.'); e.status = 403; throw e;
    }
    const current = await engineWorkspaceFor(user);
    if (!current) { const e = new Error('Open your Business Engine workspace first.'); e.status = 409; throw e; }
    return { member, workspace: current };
  }

  async function engineCommand(user, action, data) {
    ready();
    const { member, workspace: current } = action === 'engine_open'
      ? { member: await requireMember(user), workspace: await engineWorkspaceFor(user) }
      : await ownedEngineWorkspace(user, true);
    if (action === 'engine_open') {
      if (member.member_kind !== 'builder' && !member.can_manage) { const e = new Error('Apply for the Business Builder track before opening a workspace.'); e.status = 403; throw e; }
      const settings = await readOptional(db.from('community_program_settings').select('*').eq('id', 1).maybeSingle(), null);
      if (settings?.business_engine_enabled === false) { const e = new Error('The Business Engine pilot is paused.'); e.status = 409; throw e; }
      if (current) return current;
      const { data: created, error } = await db.from('community_engine_workspaces').insert({
        membership_id: member.id, owner_id: user.id, name: data.name, plan_key: data.plan_key, status: 'pilot', timezone: framework.timezone,
      }).select('*').single();
      if (error) { const e = new Error(error.code === '23505' ? 'You already have a Business Engine workspace.' : 'The Business Engine workspace could not be opened.'); e.status = error.code === '23505' ? 409 : 500; throw e; }
      const { error: stageError } = await db.from('community_engine_stages').insert(ENGINE_STAGE_SEEDS.map(stage => ({ ...stage, workspace_id: created.id })));
      if (stageError) { await db.from('community_engine_workspaces').delete().eq('id', created.id); const e = new Error('The Business Engine pipeline could not be initialized.'); e.status = 500; throw e; }
      await db.from('community_audit').insert({ space_id: SPACE_ID, actor_id: user.id, action: 'engine_open', record_id: created.id, detail: { plan_key: created.plan_key } });
      return created;
    }

    if (current.status === 'paused') {
      const e = new Error('This Business Engine workspace is paused. Ask a platform administrator to resume it.'); e.status = 409; throw e;
    }

    if (action === 'engine_contact') {
      const { data: created, error } = await db.from('community_engine_contacts').insert({
        workspace_id: current.id, owner_id: user.id, display_name: data.display_name, email: data.email || null,
        phone: data.phone || null, organization: data.organization || null, source: data.source, lifecycle_stage: data.lifecycle_stage,
        consent_status: data.consent_status, next_action_at: data.next_action_at || null, notes: data.notes || null,
      }).select('*').single();
      if (error) { const e = new Error('The contact could not be saved.'); e.status = 500; throw e; }
      return created;
    }

    if (action === 'engine_deal') {
      const stage = await read(db.from('community_engine_stages').select('id').eq('id', data.stage_id).eq('workspace_id', current.id).maybeSingle());
      if (!stage) { const e = new Error('Choose a stage in your workspace.'); e.status = 400; throw e; }
      if (data.contact_id) {
        const contact = await read(db.from('community_engine_contacts').select('id').eq('id', data.contact_id).eq('workspace_id', current.id).maybeSingle());
        if (!contact) { const e = new Error('Choose a contact in your workspace.'); e.status = 400; throw e; }
      }
      const { data: created, error } = await db.from('community_engine_deals').insert({ workspace_id: current.id, owner_id: user.id, contact_id: data.contact_id || null, stage_id: data.stage_id, title: data.title, value_cents: data.value_cents, source: data.source, expected_close_at: data.expected_close_at || null, notes: data.notes || null }).select('*,contact:community_engine_contacts(display_name,email),stage:community_engine_stages(stage_key,name,color,is_won,is_lost)').single();
      if (error) { const e = new Error('The pipeline item could not be saved.'); e.status = 500; throw e; }
      return created;
    }

    if (action === 'engine_task') {
      if (data.contact_id) {
        const contact = await read(db.from('community_engine_contacts').select('id').eq('id', data.contact_id).eq('workspace_id', current.id).maybeSingle());
        if (!contact) { const e = new Error('Choose a contact in your workspace.'); e.status = 400; throw e; }
      }
      if (data.deal_id) {
        const deal = await read(db.from('community_engine_deals').select('id').eq('id', data.deal_id).eq('workspace_id', current.id).maybeSingle());
        if (!deal) { const e = new Error('Choose a pipeline item in your workspace.'); e.status = 400; throw e; }
      }
      const { data: created, error } = await db.from('community_engine_tasks').insert({ workspace_id: current.id, owner_id: user.id, contact_id: data.contact_id || null, deal_id: data.deal_id || null, title: data.title, priority: data.priority, due_at: data.due_at || null }).select('*').single();
      if (error) { const e = new Error('The follow-up task could not be saved.'); e.status = 500; throw e; }
      return created;
    }

    if (action === 'engine_task_complete') {
      const { data: updated, error } = await db.from('community_engine_tasks').update({ status: 'complete', completed_at: new Date().toISOString() }).eq('id', data.id).eq('workspace_id', current.id).eq('owner_id', user.id).select('*').maybeSingle();
      if (error || !updated) { const e = new Error('That task could not be completed.'); e.status = error ? 500 : 404; throw e; }
      return updated;
    }

    if (action === 'engine_automation') {
      const { data: created, error } = await db.from('community_engine_automations').insert({ workspace_id: current.id, owner_id: user.id, name: data.name, trigger_key: data.trigger_key, action_key: data.action_key, status: data.status, config: data.config }).select('*').single();
      if (error) { const e = new Error('The automation could not be saved.'); e.status = 500; throw e; }
      return created;
    }

    if (action === 'engine_form') {
      const { data: created, error } = await db.from('community_engine_forms').insert({ workspace_id: current.id, owner_id: user.id, name: data.name, slug: data.slug, status: data.status, fields: data.fields }).select('*').single();
      if (error) { const e = new Error(error.code === '23505' ? 'That form slug is already in use.' : 'The form could not be saved.'); e.status = error.code === '23505' ? 409 : 500; throw e; }
      return created;
    }
    const e = new Error('Unknown Business Engine action'); e.status = 400; throw e;
  }

  async function network(user) {
    const member = await requireMember(user);
    const settings = await readOptional(db.from('community_program_settings').select('*').eq('id', 1).maybeSingle(), {
      participant_access_enabled: true, matrix_program_enabled: false, business_engine_enabled: true, matrix_mode: 'pilot',
    });
    const plans = await readOptional(db.from('community_network_plans').select('*').in('status', ['available', 'draft']).order('monthly_fee_cents'), []);
    const enrollment = await readOptional(db.from('community_network_enrollments').select('*,plan:community_network_plans(*)').eq('space_id', SPACE_ID).eq('user_id', user.id).maybeSingle(), null);
    let events = [];
    if (enrollment) events = await readOptional(db.from('community_network_events').select('id,event_type,source_ref,value_cents,status,notes,verified_at,created_at').eq('enrollment_id', enrollment.id).order('created_at', { ascending: false }).limit(100), []);
    return {
      member: { id: member.id, member_kind: member.member_kind || 'participant', tier: member.tier, status: member.status },
      settings, plans: plans || [], enrollment, events: events || [], paths: framework.paths,
      canExpressInterest: settings?.matrix_program_enabled !== false && !enrollment,
      disclosure: 'The Business Builder track is optional. Network rewards, if launched, follow verified external commerce and a published compensation plan. No income is guaranteed and participation in the General Room does not require joining this track.',
    };
  }

  async function networkCommand(user, action, data) {
    const member = await requireMember(user);
    if (!['network_interest', 'network_event'].includes(action)) { const e = new Error('Unknown network action'); e.status = 400; throw e; }
    const settings = await readOptional(db.from('community_program_settings').select('*').eq('id', 1).maybeSingle(), null);
    if (settings?.matrix_program_enabled === false || settings?.matrix_mode === 'paused') { const e = new Error('The Business Builder pilot is not open yet.'); e.status = 409; throw e; }
    if (action === 'network_event') {
      if (member.member_kind !== 'builder') { const e = new Error('Only approved Business Builders can submit network activity.'); e.status = 403; throw e; }
      const enrollment = await readOptional(db.from('community_network_enrollments').select('*').eq('space_id', SPACE_ID).eq('user_id', user.id).eq('status', 'active').maybeSingle(), null);
      if (!enrollment) { const e = new Error('An active Builder enrollment is required before recording activity.'); e.status = 409; throw e; }
      const { data: event, error } = await db.from('community_network_events').insert({ enrollment_id: enrollment.id, user_id: user.id, event_type: data.event_type, source_ref: data.source_ref || null, value_cents: data.value_cents, notes: data.notes || null, status: 'pending', idempotency_key: data.idempotency_key || null }).select('*').single();
      if (error) { const e = new Error(error.code === '23505' ? 'That activity record was already submitted.' : 'Your activity could not be recorded.'); e.status = error.code === '23505' ? 409 : 500; throw e; }
      await db.from('community_audit').insert({ space_id: SPACE_ID, actor_id: user.id, action: 'network_event', record_id: event.id, detail: { event_type: data.event_type, value_cents: data.value_cents } });
      return event;
    }
    if (data.sponsor_user_id === user.id) { const e = new Error('You cannot sponsor yourself.'); e.status = 400; throw e; }
    if (data.sponsor_user_id) {
      const sponsor = await read(db.from('community_memberships').select('user_id').eq('space_id', SPACE_ID).eq('user_id', data.sponsor_user_id).eq('status', 'active').maybeSingle());
      if (!sponsor) { const e = new Error('Choose an active community member as sponsor.'); e.status = 400; throw e; }
    }
    const existing = await readOptional(db.from('community_network_enrollments').select('*').eq('space_id', SPACE_ID).eq('user_id', user.id).maybeSingle(), null);
    if (existing && existing.status !== 'withdrawn') return existing;
    if (existing?.status === 'withdrawn') {
      const { data: reopened, error } = await db.from('community_network_enrollments').update({ plan_key: data.plan_key, sponsor_user_id: data.sponsor_user_id || null, status: 'interest', activated_at: null, updated_at: new Date().toISOString() }).eq('id', existing.id).select('*,plan:community_network_plans(*)').single();
      if (error) { const e = new Error('Your network interest could not be reopened.'); e.status = 500; throw e; }
      await db.from('community_audit').insert({ space_id: SPACE_ID, actor_id: user.id, action: 'network_interest_reopened', record_id: reopened.id, detail: { plan_key: data.plan_key, sponsor_user_id: data.sponsor_user_id || null } });
      return reopened;
    }
    const { data: enrollment, error } = await db.from('community_network_enrollments').insert({ space_id: SPACE_ID, membership_id: member.id, user_id: user.id, sponsor_user_id: data.sponsor_user_id || null, plan_key: data.plan_key, status: 'interest' }).select('*,plan:community_network_plans(*)').single();
    if (error) { const e = new Error(error.code === '23505' ? 'Your Business Builder interest is already recorded.' : 'Your network interest could not be saved.'); e.status = error.code === '23505' ? 409 : 500; throw e; }
    await db.from('community_audit').insert({ space_id: SPACE_ID, actor_id: user.id, action: 'network_interest', record_id: enrollment.id, detail: { plan_key: data.plan_key, sponsor_user_id: data.sponsor_user_id || null } });
    return enrollment;
  }

  async function ensureAdminMembership(user) {
    let member = await readOptional(membershipQuery(user.id), null);
    if (!member) {
      const { data, error } = await db.from('community_memberships').insert({
        space_id: SPACE_ID, user_id: user.id, status: 'active', tier: 'super', member_kind: 'builder', can_manage: true,
        display_name: String(user.display_name || user.full_name || user.username || 'Platform admin').slice(0, 120),
        career_path: 'Community Leader', personal_goal: 'Keep the community safe, useful, and moving.', joined_at: new Date().toISOString(),
      }).select('*').single();
      if (error) { const e = new Error('The admin membership could not be initialized.'); e.status = 500; throw e; }
      member = data;
      await db.from('community_audit').insert({ space_id: SPACE_ID, actor_id: user.id, action: 'admin_membership_initialized', record_id: member.id, detail: {} });
    } else if (member.status !== 'active' || !member.can_manage || member.member_kind !== 'builder') {
      const { data, error } = await db.from('community_memberships').update({ status: 'active', tier: 'super', member_kind: 'builder', can_manage: true, joined_at: member.joined_at || new Date().toISOString() }).eq('id', member.id).select('*').single();
      if (error) { const e = new Error('The admin membership could not be initialized.'); e.status = 500; throw e; }
      member = data;
    }
    return member;
  }

  async function admin(user) {
    ready();
    requirePlatformAdmin(user);
    const [members, seats, moves, reviewQueue, goals, sessions, audit, settings, plans, enrollments, events, engineWorkspaces, contacts, deals, tasks] = await Promise.all([
      read(db.from('community_memberships').select('*').eq('space_id', SPACE_ID).order('created_at', { ascending: false }).limit(1000)),
      read(db.from('community_role_seats').select('*').eq('space_id', SPACE_ID).order('review_at').limit(1000)),
      read(db.from('community_moves').select('*').eq('space_id', SPACE_ID).order('created_at', { ascending: false }).limit(1000)),
      read(db.from('community_submissions').select('*,move:community_moves!inner(title,points,gems,due_at,status,space_id)').eq('move.space_id', SPACE_ID).eq('status', 'submitted').order('submitted_at').limit(1000)),
      read(db.from('community_goals').select('*,results:community_results(*)').eq('space_id', SPACE_ID).order('ends_on', { ascending: false }).limit(500)),
      read(db.from('community_sessions').select('*').eq('space_id', SPACE_ID).order('starts_at', { ascending: true }).limit(500)),
      read(db.from('community_audit').select('id,actor_id,action,record_id,detail,created_at').eq('space_id', SPACE_ID).order('created_at', { ascending: false }).limit(200)),
      readOptional(db.from('community_program_settings').select('*').eq('id', 1).maybeSingle(), { participant_access_enabled: true, matrix_program_enabled: false, business_engine_enabled: true, matrix_mode: 'pilot' }),
      readOptional(db.from('community_network_plans').select('*').order('monthly_fee_cents'), []),
      readOptional(db.from('community_network_enrollments').select('*,plan:community_network_plans(*)').eq('space_id', SPACE_ID).order('created_at', { ascending: false }).limit(1000), []),
      readOptional(db.from('community_network_events').select('*,enrollment:community_network_enrollments(user_id,plan_key)').order('created_at', { ascending: false }).limit(1000), []),
      readOptional(db.from('community_engine_workspaces').select('*').order('created_at', { ascending: false }).limit(500), []),
      readOptional(db.from('community_engine_contacts').select('id,workspace_id,owner_id,lifecycle_stage,created_at,updated_at').order('updated_at', { ascending: false }).limit(2000), []),
      readOptional(db.from('community_engine_deals').select('id,workspace_id,owner_id,stage_id,value_cents,created_at,updated_at').order('updated_at', { ascending: false }).limit(2000), []),
      readOptional(db.from('community_engine_tasks').select('id,workspace_id,owner_id,status,priority,due_at,created_at').order('created_at', { ascending: false }).limit(2000), []),
    ]);
    const active = members.filter(m => m.status === 'active');
    const heldGems = moves.reduce((n, m) => n + Number(m.secured_gems || 0) - Number(m.released_gems || 0) - Number(m.refunded_gems || 0), 0);
    const verifiedEvents = (events || []).filter(e => e.status === 'verified' || e.status === 'paid');
    return {
      isPlatformAdmin: true,
      settings,
      plans: plans || [],
      metrics: {
        totalMembers: members.length, activeMembers: active.length,
        participants: active.filter(m => (m.member_kind || 'participant') === 'participant').length,
        builders: active.filter(m => m.member_kind === 'builder').length,
        pendingMembers: members.filter(m => m.status === 'pending').length,
        pausedMembers: members.filter(m => m.status === 'paused').length,
        activeRoles: seats.filter(s => ['active', 'grace'].includes(s.status)).length,
        submittedWork: reviewQueue.length, openMoves: moves.filter(m => m.status === 'open').length,
        heldGems: Number(heldGems.toFixed(2)), upcomingSessions: sessions.filter(s => Date.parse(s.starts_at) > Date.now()).length,
        networkInterest: (enrollments || []).filter(e => e.status === 'interest' || e.status === 'pending').length,
        activeNetworkMembers: (enrollments || []).filter(e => e.status === 'active').length,
        verifiedNetworkEvents: verifiedEvents.length,
        engineWorkspaces: (engineWorkspaces || []).length, engineContacts: (contacts || []).length,
        engineDeals: (deals || []).length, openEngineTasks: (tasks || []).filter(t => t.status !== 'complete').length,
      },
      members, seats, moves, reviewQueue, goals, sessions, enrollments: enrollments || [], events: events || [],
      engineWorkspaces: engineWorkspaces || [], audit,
    };
  }

  async function adminCommand(user, action, input) {
    ready();
    requirePlatformAdmin(user);
    if (LEAD_ACTIONS.has(action)) {
      await ensureAdminMembership(user);
      return command(user, action, input);
    }
    const data = parseAdminCommand(action, input);
    let result;
    if (action === 'admin_membership') {
      const existing = await read(db.from('community_memberships').select('*').eq('id', data.id).eq('space_id', SPACE_ID).maybeSingle());
      if (!existing) { const e = new Error('Membership not found.'); e.status = 404; throw e; }
      if (existing.can_manage && data.status !== 'active') { const e = new Error('Remove lead access before pausing or removing this membership.'); e.status = 409; throw e; }
      const { data: updated, error } = await db.from('community_memberships').update({ status: data.status, tier: data.tier, member_kind: data.member_kind, joined_at: data.status === 'active' ? (existing.joined_at || new Date().toISOString()) : existing.joined_at }).eq('id', data.id).eq('space_id', SPACE_ID).select('*').single();
      if (error) { const e = new Error('Membership could not be updated.'); e.status = 500; throw e; }
      result = updated;
    } else if (action === 'admin_lead_access') {
      const existing = await read(db.from('community_memberships').select('id,user_id,status').eq('id', data.id).eq('space_id', SPACE_ID).maybeSingle());
      if (existing?.user_id === user.id) { const e = new Error('Another administrator must change your lead access.'); e.status = 409; throw e; }
      if (!existing || existing.status !== 'active') { const e = new Error('An active membership is required.'); e.status = 409; throw e; }
      const { data: updated, error } = await db.from('community_memberships').update({ can_manage: data.can_manage }).eq('id', data.id).eq('space_id', SPACE_ID).select('*').single();
      if (error) { const e = new Error('Lead access could not be updated.'); e.status = 500; throw e; }
      result = updated;
    } else if (action === 'admin_network_settings') {
      const { data: updated, error } = await db.from('community_program_settings').upsert({ id: 1, ...data, updated_by: user.id, updated_at: new Date().toISOString() }).select('*').single();
      if (error) { const e = new Error('Community program settings could not be updated.'); e.status = 500; throw e; }
      result = updated;
    } else if (action === 'admin_network_enrollment') {
      const { data: updated, error } = await db.from('community_network_enrollments').update({ status: data.status, plan_key: data.plan_key, activated_at: data.status === 'active' ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq('id', data.id).eq('space_id', SPACE_ID).select('*,plan:community_network_plans(*)').maybeSingle();
      if (error || !updated) { const e = new Error(error?.code === 'PGRST116' || !updated ? 'Network enrollment not found.' : 'Network enrollment could not be updated.'); e.status = !updated ? 404 : 500; throw e; }
      const memberKind = data.status === 'active' ? 'builder' : 'participant';
      const { error: memberError } = await db.from('community_memberships').update({ member_kind: memberKind }).eq('id', updated.membership_id).eq('space_id', SPACE_ID);
      if (memberError) { const e = new Error('Network enrollment changed, but the member place could not be synchronized.'); e.status = 500; throw e; }
      result = updated;
    } else if (action === 'admin_verify_event') {
      const { data: updated, error } = await db.from('community_network_events').update({ status: data.status, notes: data.notes, verified_by: user.id, verified_at: data.status === 'verified' ? new Date().toISOString() : null }).eq('id', data.id).select('*').single();
      if (error) { const e = new Error('Network activity could not be reviewed.'); e.status = 500; throw e; }
      result = updated;
    } else if (action === 'admin_workspace_status') {
      const { data: updated, error } = await db.from('community_engine_workspaces').update({ status: data.status, plan_key: data.plan_key, updated_at: new Date().toISOString() }).eq('id', data.id).select('*').single();
      if (error) { const e = new Error('Business Engine workspace could not be updated.'); e.status = 500; throw e; }
      result = updated;
    }
    await db.from('community_audit').insert({ space_id: SPACE_ID, actor_id: user.id, action, record_id: result?.id || null, detail: { data } });
    return result;
  }
  async function command(user, action, input) {
    ready();
    const data = parseCommand(action, input);
    if (action === 'join' || action === 'apply') {
      const functionName = action === 'join' ? 'community_join' : 'community_apply_builder';
      const { data: result, error } = await db.rpc(functionName, {
        p_actor: user.id,
        p_display_name: String(user.display_name || user.full_name || user.username || 'Member').slice(0, 120),
        p_career_path: data.career_path,
        p_personal_goal: data.personal_goal,
      });
      if (error) {
        const e = new Error(error.code === '42501' ? error.message : 'This community request could not be saved. Please try again.');
        e.status = error.code === '42501' ? 403 : 500; throw e;
      }
      return result;
    }
    if (action === 'network_interest' || action === 'network_event') return networkCommand(user, action, data);
    if (ENGINE_ACTIONS.has(action)) return engineCommand(user, action, data);
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
  return { access, workspace, command, admin, adminCommand, network, engine };
}
module.exports = { ...createCommunityService(), createCommunityService, roleState };
