const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

async function createDeletionRequest({ userId = null, email, source, reason = null }) {
  const normalizedEmail = normalizeEmail(email);
  const { data: existing, error: lookupError } = await supabase
    .from('account_deletion_requests')
    .select('id,status,requested_at')
    .eq('email', normalizedEmail)
    .in('status', ['pending', 'verifying', 'processing'])
    .order('requested_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (existing) return existing;

  const { data, error } = await supabase
    .from('account_deletion_requests')
    .insert({
      user_id: userId,
      email: normalizedEmail,
      source,
      reason: reason ? String(reason).trim().slice(0, 1000) : null,
      acknowledged_at: new Date().toISOString(),
      metadata: { acknowledgement_window_days: 30 },
    })
    .select('id,status,requested_at')
    .single();

  if (error) throw error;
  return data;
}

router.post('/account-deletion-requests/authenticated', requireAuth, async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Privacy service unavailable' });
    const email = normalizeEmail(req.user?.email);
    if (!validEmail(email)) return res.status(400).json({ error: 'A verified account email is required' });

    const request = await createDeletionRequest({
      userId: req.user.id,
      email,
      source: 'mobile',
      reason: req.body?.reason,
    });
    return res.status(202).json({
      success: true,
      request,
      message: 'Your account deletion request has been received. We will complete it within 30 days unless legal retention requirements apply.',
    });
  } catch (error) {
    console.error('Authenticated deletion request failed:', error);
    return res.status(500).json({ error: 'Could not submit the deletion request' });
  }
});

router.post('/account-deletion-requests', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: 'Privacy service unavailable' });
    const email = normalizeEmail(req.body?.email);
    if (!validEmail(email)) return res.status(400).json({ error: 'Enter a valid email address' });
    if (req.body?.company) return res.status(202).json({ success: true });

    await createDeletionRequest({ email, source: 'web', reason: req.body?.reason });
    return res.status(202).json({
      success: true,
      message: 'Your request has been received. We may contact you at this address to verify account ownership.',
    });
  } catch (error) {
    console.error('Public deletion request failed:', error);
    return res.status(500).json({ error: 'Could not submit the deletion request' });
  }
});

module.exports = router;
