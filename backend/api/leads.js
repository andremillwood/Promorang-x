const express = require('express');
const { supabase } = require('../lib/supabase');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const FUNNELS = {
  scene: { stakeholder: 'participant', weight: 4, label: 'Find Your Scene' },
  moment: { stakeholder: 'host', weight: 14, label: 'Moment Potential Score' },
  demand: { stakeholder: 'merchant', weight: 16, label: 'Local Demand Snapshot' },
  creator: { stakeholder: 'creator', weight: 10, label: 'Influence-to-Action Audit' },
  sponsor: { stakeholder: 'brand', weight: 22, label: 'Sponsor-Ready Activation Brief' },
};
const STAGES = ['new','qualified','contacted','discovery','proposal','won','lost','nurture'];
const clean = (value, max = 500) => String(value || '').trim().slice(0, max) || null;
const normalEmail = (value) => String(value || '').trim().toLowerCase().slice(0, 320);
const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const captureWindows = new Map();
const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));

function captureRateLimit(req, res, next) {
  const key = String(req.headers['x-forwarded-for'] || req.ip || 'unknown').split(',')[0];
  const now = Date.now(); const window = captureWindows.get(key);
  if (!window || now - window.startedAt > 60 * 60 * 1000) captureWindows.set(key, { startedAt: now, count: 1 });
  else { window.count += 1; if (window.count > 12) return res.status(429).json({ success:false,error:'Too many report requests. Please try again later.' }); }
  next();
}

function qualification(input, funnel) {
  const diagnostic = Math.max(0, Math.min(100, Number(input.result?.score || 0)));
  let score = Math.round(diagnostic * .55) + funnel.weight;
  if (input.organizationName) score += 8;
  if (input.phone) score += 5;
  if (input.marketingConsent) score += 5;
  if (input.attribution?.utm_campaign) score += 3;
  return Math.min(100, score);
}

async function activity(leadId, type, title, body, metadata = {}, actorId = null) {
  const { error } = await supabase.from('crm_lead_activities').insert({ lead_id: leadId, activity_type: type, title, body, metadata, actor_id: actorId });
  if (error) throw error;
}

router.post('/capture', captureRateLimit, async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ success: false, error: 'Lead service unavailable' });
    const input = req.body || {};
    if (input.website) return res.status(202).json({ success: true, data: { accepted: true } }); // honeypot
    const email = normalEmail(input.email);
    const funnel = FUNNELS[input.funnelKey];
    if (!validEmail(email) || !funnel || !input.result || !input.answers || typeof input.answers !== 'object') {
      return res.status(400).json({ success: false, error: 'A valid email, funnel, answers, and result are required' });
    }
    const now = new Date().toISOString();
    const score = qualification(input, funnel);
    const attribution = input.attribution || {};
    const existing = await supabase.from('crm_leads').select('id,capture_count,lifecycle_stage').eq('email', email).eq('funnel_key', input.funnelKey).maybeSingle();
    if (existing.error) throw existing.error;
    const payload = {
      email,
      full_name: clean(input.fullName, 160), organization_name: clean(input.organizationName, 200), phone: clean(input.phone, 60),
      stakeholder_type: funnel.stakeholder, funnel_key: input.funnelKey,
      qualification_score: score, diagnostic_score: Math.min(100, Number(input.result.score || 0)),
      result_name: clean(input.result.name, 200), result_insight: clean(input.result.insight, 2000),
      answers: input.answers, recommended_moves: Array.isArray(input.result.moves) ? input.result.moves.slice(0, 10) : [],
      source: clean(attribution.utm_source || attribution.source, 160), medium: clean(attribution.utm_medium || attribution.medium, 160),
      campaign: clean(attribution.utm_campaign || attribution.campaign, 200), content: clean(attribution.utm_content, 200), term: clean(attribution.utm_term, 200),
      landing_path: clean(input.landingPath, 500), referrer_url: clean(input.referrerUrl, 1000), anonymous_id: clean(input.anonymousId, 160),
      marketing_consent: Boolean(input.marketingConsent), consent_text: input.marketingConsent ? clean(input.consentText, 1000) : null,
      consent_at: input.marketingConsent ? now : null, last_captured_at: now,
      lifecycle_stage: existing.data?.lifecycle_stage === 'new' && score >= 70 ? 'qualified' : (existing.data?.lifecycle_stage || (score >= 70 ? 'qualified' : 'new')),
      capture_count: Number(existing.data?.capture_count || 0) + 1,
    };
    let lead;
    if (existing.data?.id) {
      const updated = await supabase.from('crm_leads').update(payload).eq('id', existing.data.id).select().single();
      if (updated.error) throw updated.error; lead = updated.data;
    } else {
      const created = await supabase.from('crm_leads').insert(payload).select().single();
      if (created.error) throw created.error; lead = created.data;
    }
    await activity(lead.id, 'captured', `${funnel.label} completed`, `Diagnostic score ${lead.diagnostic_score}; qualification ${lead.qualification_score}.`, { answers: input.answers, result: input.result, attribution });
    try {
      const { sendEmail, getBaseTemplate } = require('../services/resendService');
      const moves = (Array.isArray(input.result.moves) ? input.result.moves : []).map(move => `<li style="margin-bottom:8px">${escapeHtml(move)}</li>`).join('');
      const reportUrl = `${process.env.FRONTEND_URL || 'https://promorang.co'}/free/${input.funnelKey}`;
      const mail = await sendEmail({ to: email, subject: `Your Promorang report: ${clean(input.result.name,200)}`, html:getBaseTemplate({ title:escapeHtml(input.result.name), preheader:`Your ${funnel.label} result`, content:`<div class="highlight-card"><div class="label">Your signal</div><div class="value">${lead.diagnostic_score}/100</div></div><p>${escapeHtml(input.result.insight)}</p><h3>Your three highest-leverage moves</h3><ol>${moves}</ol><p>Your result has been saved securely. Promorang will only send ongoing marketing when you explicitly opted in.</p>`, ctaUrl:reportUrl, ctaText:'Return to your Promorang route' }), text:`${input.result.name}\nScore: ${lead.diagnostic_score}/100\n\n${input.result.insight}\n\nYour next moves:\n${(input.result.moves||[]).map((m,i)=>`${i+1}. ${m}`).join('\n')}\n\n${reportUrl}`, tags:[{name:'type',value:'lead-report'}], emailType:'lead_report', metadata:{lead_id:lead.id,funnel_key:input.funnelKey} });
      await activity(lead.id, mail.success ? 'email_sent' : 'email_failed', mail.success ? 'Field report emailed' : 'Field report email failed', mail.error || null, { messageId:mail.messageId || null });
    } catch (mailError) {
      console.warn('[Leads] report email unavailable:', mailError.message);
      await activity(lead.id, 'email_failed', 'Field report email failed', mailError.message);
    }
    res.status(existing.data ? 200 : 201).json({ success: true, data: { leadId: lead.id, saved: true, qualification: lead.qualification_score } });
  } catch (error) {
    console.error('[Leads] capture failed:', error);
    res.status(500).json({ success: false, error: 'We could not save the report. Please try again.' });
  }
});

router.use('/admin', requireAuth, requireAdmin);

router.get('/admin/summary', async (_req, res) => {
  try {
    const { data, error } = await supabase.from('crm_leads').select('lifecycle_stage,stakeholder_type,funnel_key,qualification_score,estimated_value,realized_value,source,campaign,created_at,next_follow_up_at');
    if (error) throw error;
    const rows = data || []; const today = new Date().toISOString().slice(0,10);
    const countBy = key => rows.reduce((acc, row) => { const v = row[key] || 'unknown'; acc[v] = (acc[v] || 0) + 1; return acc; }, {});
    res.json({ success: true, data: {
      total: rows.length, qualified: rows.filter(r => r.qualification_score >= 70).length,
      openPipelineValue: rows.filter(r => !['won','lost'].includes(r.lifecycle_stage)).reduce((s,r) => s + Number(r.estimated_value || 0), 0),
      wonValue: rows.reduce((s,r) => s + Number(r.realized_value || 0), 0), overdue: rows.filter(r => r.next_follow_up_at && r.next_follow_up_at.slice(0,10) < today && !['won','lost'].includes(r.lifecycle_stage)).length,
      byStage: countBy('lifecycle_stage'), byStakeholder: countBy('stakeholder_type'), byFunnel: countBy('funnel_key'),
    }});
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.get('/admin', async (req, res) => {
  try {
    let query = supabase.from('crm_leads').select('*', { count: 'exact' }).order(req.query.sort === 'score' ? 'qualification_score' : 'updated_at', { ascending: false });
    if (req.query.stage && req.query.stage !== 'all') query = query.eq('lifecycle_stage', req.query.stage);
    if (req.query.stakeholder && req.query.stakeholder !== 'all') query = query.eq('stakeholder_type', req.query.stakeholder);
    if (req.query.funnel && req.query.funnel !== 'all') query = query.eq('funnel_key', req.query.funnel);
    if (req.query.search) query = query.or(`email.ilike.%${clean(req.query.search,100)}%,full_name.ilike.%${clean(req.query.search,100)}%,organization_name.ilike.%${clean(req.query.search,100)}%`);
    const page = Math.max(1, Number(req.query.page || 1)); const limit = Math.min(100, Math.max(10, Number(req.query.limit || 50)));
    const { data, error, count } = await query.range((page - 1) * limit, page * limit - 1);
    if (error) throw error; res.json({ success: true, data: { leads: data || [], count: count || 0, page, limit } });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.get('/admin/:id', async (req, res) => {
  try {
    const [lead, activities, tasks] = await Promise.all([
      supabase.from('crm_leads').select('*').eq('id', req.params.id).single(),
      supabase.from('crm_lead_activities').select('*').eq('lead_id', req.params.id).order('created_at', { ascending: false }),
      supabase.from('crm_lead_tasks').select('*').eq('lead_id', req.params.id).order('created_at', { ascending: false }),
    ]);
    if (lead.error) throw lead.error; if (activities.error) throw activities.error; if (tasks.error) throw tasks.error;
    res.json({ success: true, data: { lead: lead.data, activities: activities.data || [], tasks: tasks.data || [] } });
  } catch (error) { res.status(404).json({ success: false, error: error.message }); }
});

router.patch('/admin/:id', async (req, res) => {
  try {
    const input = req.body || {}; const allowed = {};
    if (input.lifecycleStage) { if (!STAGES.includes(input.lifecycleStage)) return res.status(400).json({ success:false,error:'Invalid stage' }); allowed.lifecycle_stage = input.lifecycleStage; }
    for (const [api, db] of Object.entries({ fullName:'full_name', organizationName:'organization_name', phone:'phone', assignedTo:'assigned_to', nextFollowUpAt:'next_follow_up_at', lostReason:'lost_reason' })) if (api in input) allowed[db] = input[api] || null;
    for (const [api, db] of Object.entries({ estimatedValue:'estimated_value', realizedValue:'realized_value' })) if (api in input) allowed[db] = input[api] === '' ? null : Number(input[api]);
    if (input.lifecycleStage === 'contacted') allowed.last_contacted_at = new Date().toISOString();
    if (input.lifecycleStage === 'won') allowed.converted_at = new Date().toISOString();
    const before = await supabase.from('crm_leads').select('lifecycle_stage,assigned_to').eq('id', req.params.id).single();
    const { data, error } = await supabase.from('crm_leads').update(allowed).eq('id', req.params.id).select().single(); if (error) throw error;
    if (input.lifecycleStage && input.lifecycleStage !== before.data?.lifecycle_stage) await activity(req.params.id, 'stage_changed', `Moved to ${input.lifecycleStage}`, null, { from: before.data?.lifecycle_stage, to: input.lifecycleStage }, req.user.id);
    res.json({ success: true, data });
  } catch (error) { res.status(400).json({ success: false, error: error.message }); }
});

router.post('/admin/:id/notes', async (req, res) => {
  try { const body = clean(req.body?.body, 5000); if (!body) return res.status(400).json({success:false,error:'Note is required'}); await activity(req.params.id, 'note', 'Note added', body, {}, req.user.id); res.status(201).json({success:true}); }
  catch (error) { res.status(400).json({success:false,error:error.message}); }
});

router.post('/admin/:id/tasks', async (req, res) => {
  try { const title = clean(req.body?.title, 300); if (!title) return res.status(400).json({success:false,error:'Task title is required'}); const created = await supabase.from('crm_lead_tasks').insert({ lead_id:req.params.id,title,description:clean(req.body?.description,2000),priority:req.body?.priority || 'normal',due_at:req.body?.dueAt || null,assigned_to:req.body?.assignedTo || req.user.id,created_by:req.user.id }).select().single(); if (created.error) throw created.error; await activity(req.params.id,'task_created',`Task: ${title}`,null,{taskId:created.data.id},req.user.id); res.status(201).json({success:true,data:created.data}); }
  catch(error){res.status(400).json({success:false,error:error.message});}
});

router.patch('/admin/:leadId/tasks/:taskId', async (req,res) => {
  try { const status = req.body?.status; if (!['open','complete','cancelled'].includes(status)) return res.status(400).json({success:false,error:'Invalid task status'}); const update={status,completed_at:status==='complete'?new Date().toISOString():null}; const changed=await supabase.from('crm_lead_tasks').update(update).eq('id',req.params.taskId).eq('lead_id',req.params.leadId).select().single(); if(changed.error) throw changed.error; if(status==='complete') await activity(req.params.leadId,'task_completed',`Completed: ${changed.data.title}`,null,{taskId:changed.data.id},req.user.id); res.json({success:true,data:changed.data}); }
  catch(error){res.status(400).json({success:false,error:error.message});}
});

module.exports = router;
