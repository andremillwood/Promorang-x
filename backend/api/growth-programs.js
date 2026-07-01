const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { supabase } = require('../lib/supabase');

router.use(requireAuth);

router.get('/summary', async (req, res) => {
  try {
    const [{ data: tier }, { data: allowances }, { data: commitments }, { data: claims }, { data: pledges }] = await Promise.all([
      supabase.rpc('get_effective_participant_tier', { p_user_id: req.user.id }).maybeSingle(),
      supabase.from('membership_allowance_grants').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(12),
      supabase.from('funded_reward_commitments').select('*, funded_reward_programs(*)').eq('user_id', req.user.id).order('created_at', { ascending: false }),
      supabase.from('creator_resilience_claims').select('*, creator_resilience_funds(name,currency)').eq('user_id', req.user.id).order('created_at', { ascending: false }),
      supabase.from('kickstart_pledges').select('*, kickstart_projects(title,currency,status)').eq('backer_id', req.user.id).order('created_at', { ascending: false })
    ]);
    res.json({ success: true, tier, allowances: allowances || [], commitments: commitments || [], claims: claims || [], pledges: pledges || [] });
  } catch (error) {
    console.error('[Growth Programs] Summary error:', error);
    res.status(500).json({ success: false, error: 'Failed to load Growth Hub summary' });
  }
});

router.post('/resilience/claims', async (req, res) => {
  try {
    const { fund_id, incident_type, requested_amount, evidence } = req.body;
    if (!fund_id || !incident_type || Number(requested_amount) <= 0) {
      return res.status(422).json({ success: false, error: 'Fund, incident type, and requested amount are required' });
    }
    const { data, error } = await supabase.from('creator_resilience_claims').insert({
      fund_id, user_id: req.user.id, incident_type,
      requested_amount: Number(requested_amount), evidence: evidence || {}
    }).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, claim: data });
  } catch (error) {
    console.error('[Growth Programs] Claim error:', error);
    res.status(400).json({ success: false, error: error.message || 'Failed to submit assistance request' });
  }
});

router.post('/kickstart/projects/:id/pledges', async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (amount <= 0) return res.status(422).json({ success: false, error: 'A positive pledge is required' });
    const { data, error } = await supabase.rpc('pledge_kickstart', {
      p_project_id: req.params.id, p_backer_id: req.user.id, p_amount: amount
    });
    if (error) throw error;
    res.status(201).json({ success: true, pledge: data });
  } catch (error) {
    console.error('[Growth Programs] Pledge error:', error);
    res.status(400).json({ success: false, error: error.message || 'Failed to escrow pledge' });
  }
});

module.exports = router;
