const express = require('express');
const { supabase } = require('../lib/supabase');

const router = express.Router();

const QUEUE = [];
const MAX_BATCH = Number(process.env.TELEMETRY_BATCH_SIZE || 200);
const FLUSH_INTERVAL_MS = Number(process.env.TELEMETRY_FLUSH_INTERVAL_MS || 3000);

let isFlushing = false;

async function flushQueue() {
  if (isFlushing || !QUEUE.length) {
    return;
  }

  if (!supabase) {
    // No persistence available; drop events in development.
    console.warn('[telemetry.flush] Supabase unavailable, discarding events:', QUEUE.length);
    QUEUE.splice(0, QUEUE.length);
    return;
  }

  isFlushing = true;
  const batch = QUEUE.splice(0, MAX_BATCH);

  const rows = batch.map((event) => ({
    user_id: event.user_id || null,
    session_id: event.session_id,
    event_type: event.event_type,
    payload: event.payload || {},
    user_agent: event.user_agent || null,
    ip: event.ip || null,
  }));

  const { error } = await supabase.from('telemetry.events').insert(rows);

  if (error) {
    console.error('[telemetry.flush] insert failed:', error);
    // Re-queue once
    QUEUE.unshift(...batch);
  }

  isFlushing = false;
}

setInterval(() => {
  flushQueue().catch((error) => {
    console.error('[telemetry.flush] unexpected error', error);
  });
}, FLUSH_INTERVAL_MS).unref();

router.post('/', async (req, res) => {
  let body = req.body;

  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (error) {
      body = [];
    }
  }

  const payload = Array.isArray(body?.events)
    ? body.events
    : Array.isArray(body)
      ? body
      : [body];

  let accepted = 0;

  for (const event of payload) {
    if (!event || typeof event !== 'object') continue;
    if (!event.session_id || !event.event_type) continue;

    QUEUE.push({
      ...event,
      payload: event.payload || {},
      user_agent: req.headers['user-agent'] || null,
      ip: req.headers['x-forwarded-for'] || req.ip || null,
    });
    accepted += 1;
  }

  if (QUEUE.length >= MAX_BATCH) {
    flushQueue().catch((error) => console.error('[telemetry.flush] immediate flush failed', error));
  }

  return res.json({
    status: 'queued',
    queued: accepted,
    backlog: QUEUE.length,
  });
});

router.post('/_flush', async (_req, res) => {
  await flushQueue();
  return res.json({ status: 'flushed', backlog: QUEUE.length });
});

module.exports = router;
