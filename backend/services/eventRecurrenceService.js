const MAX_GENERATED_OCCURRENCES = 52;
const DEFAULT_GENERATION_HORIZON_DAYS = 90;
const DEFAULT_TIMEZONE = 'UTC';
const SUPPORTED_FREQUENCIES = ['daily', 'weekly', 'monthly'];

function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function addMonths(date, months, preferredDay) {
  const next = new Date(date);
  next.setUTCDate(1);
  next.setUTCMonth(next.getUTCMonth() + months);

  const lastDayOfMonth = new Date(Date.UTC(
    next.getUTCFullYear(),
    next.getUTCMonth() + 1,
    0,
  )).getUTCDate();

  next.setUTCDate(Math.min(preferredDay, lastDayOfMonth));
  next.setUTCHours(
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
  );

  return next;
}

function setUtcTime(targetDate, sourceDate) {
  const next = new Date(targetDate);
  next.setUTCHours(
    sourceDate.getUTCHours(),
    sourceDate.getUTCMinutes(),
    sourceDate.getUTCSeconds(),
    sourceDate.getUTCMilliseconds(),
  );
  return next;
}

function startOfUtcDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function normalizeWeekdays(days, fallbackDay) {
  const values = Array.isArray(days) ? days : [];
  const normalized = values
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6);

  const deduped = [...new Set(normalized)];
  if (deduped.length > 0) {
    return deduped.sort((a, b) => a - b);
  }

  return [fallbackDay];
}

function safeDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeRecurrenceConfig(recurrence, anchorStartDate) {
  if (!recurrence || recurrence.enabled === false) {
    return null;
  }

  const anchorDate = safeDate(anchorStartDate);
  if (!anchorDate) {
    throw new Error('A valid start date is required for recurring events');
  }

  const frequency = typeof recurrence.frequency === 'string'
    ? recurrence.frequency.toLowerCase()
    : 'weekly';

  if (!SUPPORTED_FREQUENCIES.includes(frequency)) {
    throw new Error(`Unsupported recurrence frequency: ${frequency}`);
  }

  const interval = Math.max(1, Number(recurrence.interval) || 1);
  const count = recurrence.count == null || recurrence.count === ''
    ? null
    : Math.max(1, Number(recurrence.count));
  const until = recurrence.until ? safeDate(recurrence.until) : null;
  const generationHorizonDays = Math.max(
    7,
    Math.min(365, Number(recurrence.generationHorizonDays) || DEFAULT_GENERATION_HORIZON_DAYS),
  );
  const timezone = recurrence.timezone || DEFAULT_TIMEZONE;
  const byWeekday = normalizeWeekdays(recurrence.byWeekday, anchorDate.getUTCDay());
  const dayOfMonth = recurrence.dayOfMonth == null || recurrence.dayOfMonth === ''
    ? anchorDate.getUTCDate()
    : Math.min(31, Math.max(1, Number(recurrence.dayOfMonth)));

  return {
    enabled: true,
    frequency,
    interval,
    byWeekday,
    dayOfMonth,
    timezone,
    count,
    until: until ? until.toISOString() : null,
    generationHorizonDays,
  };
}

function computeDurationMs(startDate, endDate) {
  if (!endDate) return null;
  const duration = endDate.getTime() - startDate.getTime();
  return duration > 0 ? duration : null;
}

function generateDailyStarts(anchorStart, recurrence, maxFutureCount, stopDate) {
  const starts = [];
  let cursor = new Date(anchorStart);

  while (starts.length < maxFutureCount) {
    cursor = addDays(cursor, recurrence.interval);
    if (cursor > stopDate) break;
    starts.push(new Date(cursor));
  }

  return starts;
}

function generateWeeklyStarts(anchorStart, recurrence, maxFutureCount, stopDate) {
  const starts = [];
  const weekdays = normalizeWeekdays(recurrence.byWeekday, anchorStart.getUTCDay());
  const anchorDayStart = startOfUtcDay(anchorStart);
  let cursor = addDays(anchorDayStart, 1);

  while (starts.length < maxFutureCount && cursor <= stopDate) {
    const daysDiff = Math.floor((cursor.getTime() - anchorDayStart.getTime()) / 86400000);
    const weeksDiff = Math.floor(daysDiff / 7);
    const isMatchingWeek = weeksDiff % recurrence.interval === 0;
    const isMatchingWeekday = weekdays.includes(cursor.getUTCDay());

    if (isMatchingWeek && isMatchingWeekday) {
      const candidate = setUtcTime(cursor, anchorStart);
      if (candidate > anchorStart && candidate <= stopDate) {
        starts.push(candidate);
      }
    }

    cursor = addDays(cursor, 1);
  }

  return starts;
}

function generateMonthlyStarts(anchorStart, recurrence, maxFutureCount, stopDate) {
  const starts = [];
  let monthOffset = recurrence.interval;

  while (starts.length < maxFutureCount) {
    const candidate = addMonths(anchorStart, monthOffset, recurrence.dayOfMonth);
    if (candidate > stopDate) break;
    starts.push(candidate);
    monthOffset += recurrence.interval;
  }

  return starts;
}

function generateFutureOccurrences(anchorStartValue, anchorEndValue, recurrenceInput) {
  const anchorStart = safeDate(anchorStartValue);
  if (!anchorStart) {
    throw new Error('A valid anchor start date is required to generate recurring events');
  }

  const anchorEnd = safeDate(anchorEndValue);
  const recurrence = normalizeRecurrenceConfig(recurrenceInput, anchorStartValue);
  if (!recurrence) {
    return [];
  }

  const durationMs = computeDurationMs(anchorStart, anchorEnd);
  const maxFutureCount = recurrence.count == null
    ? MAX_GENERATED_OCCURRENCES
    : Math.max(0, Math.min(MAX_GENERATED_OCCURRENCES, recurrence.count - 1));

  if (maxFutureCount === 0) {
    return [];
  }

  const horizonDate = addDays(anchorStart, recurrence.generationHorizonDays);
  const untilDate = recurrence.until ? safeDate(recurrence.until) : null;
  const stopDate = untilDate && untilDate < horizonDate ? untilDate : horizonDate;

  if (stopDate <= anchorStart) {
    return [];
  }

  let starts;
  if (recurrence.frequency === 'daily') {
    starts = generateDailyStarts(anchorStart, recurrence, maxFutureCount, stopDate);
  } else if (recurrence.frequency === 'weekly') {
    starts = generateWeeklyStarts(anchorStart, recurrence, maxFutureCount, stopDate);
  } else {
    starts = generateMonthlyStarts(anchorStart, recurrence, maxFutureCount, stopDate);
  }

  return starts.map((startDate, index) => ({
    occurrenceIndex: index + 1,
    event_date: startDate.toISOString(),
    event_end_date: durationMs ? new Date(startDate.getTime() + durationMs).toISOString() : null,
  }));
}

function buildSeriesTemplateFromEvent(eventPayload, recurrence) {
  return {
    title: eventPayload.title || null,
    description: eventPayload.description || null,
    category: eventPayload.category || null,
    location_name: eventPayload.location_name || null,
    location_address: eventPayload.location_address || null,
    flyer_url: eventPayload.flyer_url || null,
    banner_url: eventPayload.banner_url || null,
    is_virtual: Boolean(eventPayload.is_virtual),
    virtual_url: eventPayload.virtual_url || null,
    ticketing_platform: eventPayload.ticketing_platform || null,
    ticketing_url: eventPayload.ticketing_url || null,
    ticket_price_range: eventPayload.ticket_price_range || null,
    max_attendees: eventPayload.max_attendees ?? null,
    is_public: eventPayload.is_public !== false,
    tags: Array.isArray(eventPayload.tags) ? eventPayload.tags : [],
    total_rewards_pool: Number(eventPayload.total_rewards_pool || 0),
    total_verified_credits_pool: Number(eventPayload.total_verified_credits_pool || 0),
    recurrence,
  };
}

function buildOccurrenceEventPayload(templatePayload, occurrence, overrides = {}) {
  const { recurrence, ...eventFields } = templatePayload;

  return {
    ...eventFields,
    ...overrides,
    event_date: occurrence.event_date,
    event_end_date: occurrence.event_end_date,
    recurrence_enabled: true,
    recurrence_frequency: recurrence?.frequency || null,
    recurrence_interval: recurrence?.interval || 1,
    recurrence_by_weekday: recurrence?.byWeekday || null,
    recurrence_day_of_month: recurrence?.dayOfMonth || null,
    recurrence_timezone: recurrence?.timezone || DEFAULT_TIMEZONE,
    recurrence_until: recurrence?.until || null,
    recurrence_count: recurrence?.count || null,
    generation_horizon_days: recurrence?.generationHorizonDays || DEFAULT_GENERATION_HORIZON_DAYS,
    occurrence_index: occurrence.occurrenceIndex,
    series_snapshot: templatePayload,
  };
}

module.exports = {
  DEFAULT_GENERATION_HORIZON_DAYS,
  DEFAULT_TIMEZONE,
  buildOccurrenceEventPayload,
  buildSeriesTemplateFromEvent,
  generateFutureOccurrences,
  normalizeRecurrenceConfig,
  safeDate,
};
