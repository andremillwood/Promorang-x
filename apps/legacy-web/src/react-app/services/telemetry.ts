import { apiFetch } from '@/react-app/utils/api';

export type TelemetryEventType =
  | 'growth_feed_view'
  | 'growth_tab_selected'
  | 'growth_content_open'
  | 'growth_cta_click'
  | 'share_created'
  | 'share_verified'
  | 'share_reward_granted'
  | 'prediction_vote'
  | 'generic';

type TelemetryEvent = {
  session_id: string;
  event_type: TelemetryEventType;
  payload: Record<string, unknown>;
  user_id?: string;
};

const SESSION_STORAGE_KEY = 'telemetry.session-id';
const EVENTS_BUFFER: TelemetryEvent[] = [];
const FLUSH_INTERVAL_MS = 3_000;

let flushTimer: ReturnType<typeof setTimeout> | null = null;

const getSessionId = () => {
  if (typeof window === 'undefined') {
    return `srv-${Date.now()}`;
  }

  let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionId) {
    const randomId =
      typeof crypto !== 'undefined' &&
      typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `session-${Math.random().toString(36).slice(2, 10)}`;
    sessionId = randomId;
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
  return sessionId;
};

const scheduleFlush = () => {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    void flushQueue();
  }, FLUSH_INTERVAL_MS);
};

const flushQueue = async () => {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  if (EVENTS_BUFFER.length === 0) {
    return;
  }

  const events = EVENTS_BUFFER.splice(0, EVENTS_BUFFER.length);

  try {
    await apiFetch('/api/telemetry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(events),
    });
  } catch (error) {
    console.warn('[Telemetry] flush failed; retrying on next tick', error);
    EVENTS_BUFFER.unshift(...events);
    scheduleFlush();
  }
};

type LogMeta = {
  userId?: string;
};

export function logEvent(
  type: TelemetryEventType,
  payload: Record<string, unknown> = {},
  meta: LogMeta = {}
) {
  const event: TelemetryEvent = {
    session_id: getSessionId(),
    event_type: type,
    payload,
    user_id: meta.userId,
  };

  EVENTS_BUFFER.push(event);
  scheduleFlush();
}

export function flushTelemetry() {
  return flushQueue();
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (EVENTS_BUFFER.length === 0) return;
    const data = JSON.stringify(EVENTS_BUFFER.splice(0, EVENTS_BUFFER.length));
    navigator.sendBeacon?.('/api/telemetry', data);
  });
}
