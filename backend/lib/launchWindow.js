/**
 * Server mirror of packages/shared/src/launch-window.ts.
 * Keep the two date/cap literals identical. launchWindow.test.js checks both,
 * plus the SQL system_settings seed.
 */
const LAUNCH_WINDOW_END = '2027-01-31';
const DEFAULT_CAPPED_DROP_CAP = 100;

function launchWindowCalendarDate(value, timeZone = 'America/Jamaica') {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    const error = new Error('Invalid date');
    error.statusCode = 400;
    error.code = 'INVALID_DATE';
    throw error;
  }
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function isOnOrBeforeLaunchWindowEnd(value) {
  return launchWindowCalendarDate(value) <= LAUNCH_WINDOW_END;
}

function defaultCappedDropClosesAt() {
  return `${LAUNCH_WINDOW_END}T23:59:59-05:00`;
}

module.exports = {
  LAUNCH_WINDOW_END,
  DEFAULT_CAPPED_DROP_CAP,
  launchWindowCalendarDate,
  isOnOrBeforeLaunchWindowEnd,
  defaultCappedDropClosesAt,
};
