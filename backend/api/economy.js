const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const economyService = require('../services/economyService');
const { supabase } = require('../lib/supabase');

const ENGAGEMENT_CAPS = { view: 5, like: 20, save: 10, comment: 10, share: 10 };

router.use(requireAuth);

router.get('/wallet', async (req, res) => {
  try {
    const balance = await economyService.getBalance(req.user.id);
    res.json({ success: true, balance });
  } catch (error) {
    console.error('[Economy API] Wallet error:', error);
    res.status(500).json({ success: false, error: 'Failed to load wallet' });
  }
});

router.get('/receipts', async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const { data, error } = await supabase
      .from('reward_receipts')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    res.json({ success: true, receipts: data || [] });
  } catch (error) {
    console.error('[Economy API] Receipt error:', error);
    res.status(500).json({ success: false, error: 'Failed to load reward receipts' });
  }
});

router.get('/notifications', async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    let query = supabase
      .from('value_notifications')
      .select('*, receipt:reward_receipts(*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (req.query.unread === 'true') query = query.is('read_at', null);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, notifications: data || [] });
  } catch (error) {
    console.error('[Economy API] Notification error:', error);
    res.status(500).json({ success: false, error: 'Failed to load value notifications' });
  }
});

router.patch('/notifications/:id/read', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('value_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, error: 'Notification not found' });
    res.json({ success: true, notification: data });
  } catch (error) {
    console.error('[Economy API] Notification read error:', error);
    res.status(500).json({ success: false, error: 'Failed to update notification' });
  }
});

router.get('/engagement-caps', async (req, res) => {
  try {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const { data, error } = await supabase
      .from('engagement_reward_events')
      .select('action_type')
      .eq('user_id', req.user.id)
      .gte('created_at', start.toISOString());
    if (error) throw error;
    const used = (data || []).reduce((totals, event) => {
      totals[event.action_type] = (totals[event.action_type] || 0) + 1;
      return totals;
    }, {});
    const caps = Object.entries(ENGAGEMENT_CAPS).map(([action_type, daily_limit]) => ({
      action_type,
      used: used[action_type] || 0,
      daily_limit,
      remaining: Math.max(0, daily_limit - (used[action_type] || 0)),
    }));
    res.json({ success: true, timezone: 'UTC', resets_at: new Date(start.getTime() + 86400000).toISOString(), caps });
  } catch (error) {
    console.error('[Economy API] Engagement caps error:', error);
    res.status(500).json({ success: false, error: 'Failed to load engagement limits' });
  }
});

router.post('/convert/points-to-promokeys', async (req, res) => {
  try {
    const quantity = Number.parseInt(req.body.quantity, 10);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 3) {
      return res.status(422).json({ success: false, error: 'Quantity must be between 1 and 3 PromoKeys' });
    }

    const result = await economyService.convertPointsToPromoKeys(req.user.id, quantity);
    res.json({ ...result, conversion_id: crypto.randomUUID() });
  } catch (error) {
    console.error('[Economy API] Conversion error:', error);
    const status = /insufficient|limit/i.test(error.message) ? 422 : 500;
    res.status(status).json({ success: false, error: error.message || 'Conversion failed' });
  }
});

router.post('/journey-events', async (req, res) => {
  try {
    const { event_name, journey_stage, object_type, object_id, metadata } = req.body || {};
    if (!event_name || !['orientation', 'first_value', 'proof', 'unlock', 'mastery'].includes(journey_stage)) {
      return res.status(422).json({ success: false, error: 'Valid event name and journey stage are required' });
    }
    const { error } = await require('../lib/supabase').supabase.from('value_journey_events').insert({
      user_id: req.user.id, event_name, journey_stage, object_type: object_type || null,
      object_id: object_id ? String(object_id) : null, metadata: metadata || {}
    });
    if (error) throw error;
    res.status(202).json({ success: true });
  } catch (error) {
    console.error('[Economy API] Journey telemetry error:', error);
    res.status(500).json({ success: false, error: 'Failed to record journey event' });
  }
});

module.exports = router;
