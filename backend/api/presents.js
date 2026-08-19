const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth, requirePlatformAdmin, optionalAuth } = require('../middleware/auth');

const hash = (value) => value ? crypto.createHash('sha256').update(String(value)).digest('hex') : null;
const normalizeCode = (value) => String(value || '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 32);
const fail = (res, status, error, code = 'PRESENTS_ERROR') => res.status(status).json({ status: 'error', error, code });
const ok = (res, data) => res.json({ status: 'success', data });

function requireDatabase(res) {
  if (!supabase) {
    fail(res, 503, 'Promorang Presents is temporarily unavailable', 'DATABASE_UNAVAILABLE');
    return false;
  }
  return true;
}

router.get('/catalog', async (req, res) => {
  if (!requireDatabase(res)) return;
  const slug = String(req.query.program || 'founding-season');
  try {
    const { data: program, error: programError } = await supabase.from('presents_programs')
      .select('id,slug,name,city,description,capacity,starts_at,ends_at,settings')
      .eq('slug', slug).eq('status', 'live').maybeSingle();
    if (programError) throw programError;
    if (!program) return fail(res, 404, 'Program not found', 'PROGRAM_NOT_FOUND');
    const [{ data: experiences, error: expError }, { count, error: countError }] = await Promise.all([
      supabase.from('presents_experiences').select('*').eq('program_id', program.id)
        .in('status', ['live', 'sold_out']).order('event_date', { ascending: true, nullsFirst: false }),
      supabase.from('presents_memberships').select('id', { count: 'exact', head: true })
        .eq('program_id', program.id).eq('status', 'active'),
    ]);
    if (expError || countError) throw expError || countError;
    return ok(res, { program: { ...program, admitted_count: count || 0, remaining: program.capacity ? Math.max(0, program.capacity - (count || 0)) : null }, experiences: experiences || [] });
  } catch (error) {
    console.error('[Presents] catalog:', error.message);
    return fail(res, 500, 'Could not load private editions');
  }
});

router.post('/redeem', optionalAuth, async (req, res) => {
  if (!requireDatabase(res)) return;
  const code = normalizeCode(req.body.code);
  const anonymousId = String(req.body.anonymousId || '').trim().slice(0, 128);
  if (!code || (!req.user?.id && !anonymousId)) return fail(res, 400, 'Code and visitor identity are required', 'INVALID_REQUEST');
  try {
    const { data, error } = await supabase.rpc('redeem_presents_invite', {
      p_code: code,
      p_user_id: req.user?.id || null,
      p_anonymous_id: req.user?.id ? null : anonymousId,
      p_ip_hash: hash(req.ip || req.headers['x-forwarded-for']),
      p_user_agent_hash: hash(req.headers['user-agent']),
      p_metadata: { source_path: req.body.sourcePath || '/presents', campaign: req.body.campaign || null },
    });
    if (error) {
      const known = ['INVALID_CODE','CODE_UNAVAILABLE','CODE_EXPIRED','CODE_EXHAUSTED','PROGRAM_UNAVAILABLE','PROGRAM_FULL'];
      const matched = known.find((item) => error.message.includes(item));
      const messages = { INVALID_CODE: 'That invitation is not on the list.', CODE_UNAVAILABLE: 'That invitation is no longer active.', CODE_EXPIRED: 'That invitation has expired.', CODE_EXHAUSTED: 'That invitation has already been used.', PROGRAM_UNAVAILABLE: 'This private season is not currently open.', PROGRAM_FULL: 'The founding release is now full.' };
      return fail(res, matched ? 409 : 500, matched ? messages[matched] : 'Could not verify this invitation', matched || 'REDEEM_FAILED');
    }
    return ok(res, data);
  } catch (error) {
    console.error('[Presents] redeem:', error.message);
    return fail(res, 500, 'Could not verify this invitation');
  }
});

router.get('/me', requireAuth, async (req, res) => {
  if (!requireDatabase(res)) return;
  try {
    const anonymousId = String(req.query.anonymousId || '').trim().slice(0, 128);
    if (anonymousId) {
      const { data: existingUserMembership } = await supabase.from('presents_memberships').select('id')
        .eq('user_id', req.user.id).eq('status', 'active').limit(1).maybeSingle();
      if (!existingUserMembership) {
        const { data: anonymousMembership } = await supabase.from('presents_memberships').select('id,metadata')
          .eq('anonymous_id', anonymousId).eq('status', 'active').is('user_id', null).limit(1).maybeSingle();
        if (anonymousMembership) {
          await supabase.from('presents_memberships')
            .update({ user_id: req.user.id, anonymous_id: null, metadata: { ...(anonymousMembership.metadata || {}), identity_stitched_at: new Date().toISOString(), identity_source: 'authenticated_web' } })
            .eq('id', anonymousMembership.id).is('user_id', null);
        }
      }
    }
    const { data: membership, error } = await supabase.from('presents_memberships')
      .select('id,status,tier,admitted_at,program_id,presents_programs(slug,name,city)')
      .eq('user_id', req.user.id).eq('status', 'active').order('admitted_at', { ascending: false }).limit(1).maybeSingle();
    if (error) throw error;
    if (!membership) return ok(res, { membership: null, invite_codes: [], claims: [] });
    const [{ data: codes }, { data: claims }] = await Promise.all([
      supabase.from('presents_invite_codes').select('id,code,status,max_uses,used_count,expires_at,created_at')
        .eq('issuer_user_id', req.user.id).eq('program_id', membership.program_id).order('created_at'),
      supabase.from('presents_access_claims').select('id,status,credential_code,claimed_at,approved_at,redeemed_at,presents_experiences(title,event_name,venue_name,event_date)')
        .eq('user_id', req.user.id).order('claimed_at', { ascending: false }),
    ]);
    return ok(res, { membership, invite_codes: codes || [], claims: claims || [] });
  } catch (error) {
    console.error('[Presents] me:', error.message);
    return fail(res, 500, 'Could not load your Presents passport');
  }
});

router.post('/experiences/:id/claim', requireAuth, async (req, res) => {
  if (!requireDatabase(res)) return;
  try {
    const { data: membership } = await supabase.from('presents_memberships').select('id')
      .eq('user_id', req.user.id).eq('status', 'active').limit(1).maybeSingle();
    if (!membership) return fail(res, 403, 'A Promorang Presents invitation is required', 'MEMBERSHIP_REQUIRED');
    const { data, error } = await supabase.rpc('claim_presents_experience', { p_experience_id: req.params.id, p_membership_id: membership.id, p_user_id: req.user.id });
    if (error) {
      const known = ['EXPERIENCE_UNAVAILABLE','SOLD_OUT','NOT_ELIGIBLE','ALREADY_CLAIMED'];
      const matched = known.find((item) => error.message.includes(item));
      return fail(res, matched === 'SOLD_OUT' ? 409 : 400, matched === 'ALREADY_CLAIMED' ? 'You already claimed this experience.' : matched === 'SOLD_OUT' ? 'This experience is fully claimed.' : 'This experience cannot be claimed yet.', matched || 'CLAIM_FAILED');
    }
    return ok(res, data);
  } catch (error) {
    console.error('[Presents] claim:', error.message);
    return fail(res, 500, 'Could not claim this experience');
  }
});

router.get('/admin/overview', requireAuth, requirePlatformAdmin, async (req, res) => {
  if (!requireDatabase(res)) return;
  try {
    const [{ data: programs }, { data: codes }, { data: memberships }, { data: experiences }, { data: claims }] = await Promise.all([
      supabase.from('presents_programs').select('*').order('created_at', { ascending: false }),
      supabase.from('presents_invite_codes').select('*,presents_programs(name)').order('created_at', { ascending: false }).limit(250),
      supabase.from('presents_memberships').select('id,program_id,user_id,status,tier,admitted_at,admitted_by_code_id').order('admitted_at', { ascending: false }).limit(250),
      supabase.from('presents_experiences').select('*').order('created_at', { ascending: false }),
      supabase.from('presents_access_claims').select('*,presents_experiences(title,event_name)').order('claimed_at', { ascending: false }).limit(250),
    ]);
    return ok(res, { programs: programs || [], codes: codes || [], memberships: memberships || [], experiences: experiences || [], claims: claims || [] });
  } catch (error) {
    console.error('[Presents] admin overview:', error.message);
    return fail(res, 500, 'Could not load Presents operations');
  }
});

router.post('/admin/codes', requireAuth, requirePlatformAdmin, async (req, res) => {
  if (!requireDatabase(res)) return;
  const code = normalizeCode(req.body.code);
  if (!code || code.length < 4) return fail(res, 400, 'Enter a code with at least four characters', 'INVALID_CODE');
  try {
    const { data: program } = await supabase.from('presents_programs').select('id').eq('slug', req.body.program || 'founding-season').single();
    const { data, error } = await supabase.from('presents_invite_codes').insert({ program_id: program.id, code, source_type: req.body.source_type || 'campaign', source_label: req.body.source_label || null, max_uses: Math.min(10000, Math.max(1, Number(req.body.max_uses) || 1)), child_allowance: Math.min(20, Math.max(0, Number(req.body.child_allowance) || 3)), expires_at: req.body.expires_at || null, metadata: req.body.metadata || {} }).select().single();
    if (error) throw error;
    return res.status(201).json({ status: 'success', data });
  } catch (error) {
    console.error('[Presents] create code:', error.message);
    return fail(res, error.code === '23505' ? 409 : 500, error.code === '23505' ? 'That code already exists.' : 'Could not create code');
  }
});

router.patch('/admin/claims/:id', requireAuth, requirePlatformAdmin, async (req, res) => {
  if (!requireDatabase(res)) return;
  const status = String(req.body.status || '');
  if (!['approved','redeemed','rejected','cancelled'].includes(status)) return fail(res, 400, 'Invalid claim status');
  try {
    const changes = { status };
    if (status === 'approved') changes.approved_at = new Date().toISOString();
    if (status === 'redeemed') { changes.redeemed_at = new Date().toISOString(); changes.redeemed_by = req.user.id; }
    const { data, error } = await supabase.from('presents_access_claims').update(changes).eq('id', req.params.id).select().single();
    if (error) throw error;
    return ok(res, data);
  } catch (error) {
    console.error('[Presents] update claim:', error.message);
    return fail(res, 500, 'Could not update claim');
  }
});

module.exports = router;
