const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');
const proofService = require('../services/proofService');

router.get('/moments/:momentId', async (req, res) => {
  try {
    let query = supabase
      .from('content_missions')
      .select('*')
      .eq('moment_id', req.params.momentId)
      .eq('status', 'live')
      .order('due_at', { ascending: true, nullsFirst: false });

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, missions: data || [] });
  } catch (error) {
    console.error('[Missions API] list error:', error);
    res.status(500).json({ success: false, error: 'Unable to load missions' });
  }
});

router.get('/moments/:momentId/me', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('mission_participations')
      .select('*, mission:content_missions!inner(moment_id)')
      .eq('user_id', req.user.id)
      .eq('mission.moment_id', req.params.momentId);
    if (error) throw error;
    res.json({ success: true, participations: data || [] });
  } catch (error) {
    console.error('[Missions API] participation list error:', error);
    res.status(500).json({ success: false, error: 'Unable to load mission progress' });
  }
});

router.post('/:id/join', requireAuth, async (req, res) => {
  try {
    const { data: mission, error: missionError } = await supabase
      .from('content_missions')
      .select('id,status,starts_at,due_at,participant_limit')
      .eq('id', req.params.id)
      .maybeSingle();
    if (missionError) throw missionError;
    if (!mission || mission.status !== 'live') return res.status(404).json({ success: false, error: 'Mission is not available' });
    const now = Date.now();
    if (mission.starts_at && new Date(mission.starts_at).getTime() > now) return res.status(409).json({ success: false, error: 'Mission has not started' });
    if (mission.due_at && new Date(mission.due_at).getTime() <= now) return res.status(409).json({ success: false, error: 'Mission has ended' });

    if (mission.participant_limit) {
      const { count } = await supabase.from('mission_participations').select('id', { count: 'exact', head: true }).eq('mission_id', mission.id);
      if ((count || 0) >= mission.participant_limit) return res.status(409).json({ success: false, error: 'Mission is full' });
    }

    const { data, error } = await supabase
      .from('mission_participations')
      .upsert({ mission_id: mission.id, user_id: req.user.id }, { onConflict: 'mission_id,user_id', ignoreDuplicates: true })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, participation: data });
  } catch (error) {
    console.error('[Missions API] join error:', error);
    res.status(500).json({ success: false, error: error.message || 'Unable to join mission' });
  }
});

router.post('/:id/submit', requireAuth, async (req, res) => {
  try {
    const { proof_url, note } = req.body || {};
    if (!proof_url || !/^https?:\/\/\\S+$/i.test(proof_url)) {
      return res.status(400).json({ success: false, error: 'A valid public proof link is required' });
    }

    const { data: mission, error: missionError } = await supabase
      .from('content_missions')
      .select('id,moment_id,title,status,due_at,proof_type')
      .eq('id', req.params.id)
      .maybeSingle();
    if (missionError) throw missionError;
    if (!mission || mission.status !== 'live') return res.status(404).json({ success: false, error: 'Mission is not available' });
    if (mission.due_at && new Date(mission.due_at).getTime() <= Date.now()) return res.status(409).json({ success: false, error: 'The submission window has closed' });

    const { data: participation } = await supabase
      .from('mission_participations')
      .select('*')
      .eq('mission_id', mission.id)
      .eq('user_id', req.user.id)
      .maybeSingle();
    if (!participation) return res.status(409).json({ success: false, error: 'Join the mission before submitting proof' });
    if (participation.proof_submission_id) return res.status(409).json({ success: false, error: 'Proof has already been submitted' });

    const submission = await proofService.submitProofSubmission({
      momentId: mission.moment_id,
      userId: req.user.id,
      proofBundle: {
        proof_type: mission.proof_type,
        proof_url,
        note: String(note || '').slice(0, 500),
        source_mission_id: mission.id,
        mission_title: mission.title,
      },
    });

    const { data, error } = await supabase
      .from('mission_participations')
      .update({
        status: 'submitted',
        proof_submission_id: submission.id,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', participation.id)
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, participation: data, submission });
  } catch (error) {
    console.error('[Missions API] submit error:', error);
    res.status(500).json({ success: false, error: error.message || 'Unable to submit proof' });
  }
});

module.exports = router;
