const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;
const {
  DEFAULT_CAPPED_DROP_CAP,
  defaultCappedDropClosesAt,
  isOnOrBeforeLaunchWindowEnd,
} = require('../lib/launchWindow');

const CLAIM_ERRORS = {
  UNAUTHENTICATED: { status: 401, message: 'Sign in to claim this' },
  COUNTRY_REQUIRED: { status: 403, message: 'Confirm your country before claiming a drop' },
  AGE_REQUIRED: { status: 403, message: 'You need to be 18 or older to claim this' },
  MEMBERSHIP_REQUIRED: { status: 403, message: 'This drop is for members' },
  DROP_NOT_FOUND: { status: 404, message: 'This drop is not open' },
  DROP_NOT_LIVE: { status: 409, message: 'This drop is not open yet' },
  DROP_CLOSED: { status: 409, message: 'This drop has closed' },
  SOLD_OUT: { status: 409, message: 'Just missed it' },
};

function httpError(statusCode, message, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function resolveCap(input) {
  if (input === undefined || input === null || input === '') return DEFAULT_CAPPED_DROP_CAP;
  const cap = Number(input);
  if (!Number.isInteger(cap) || cap < 1) {
    throw httpError(400, 'Cap must be a positive whole number', 'INVALID_CAP');
  }
  return cap;
}

function assertInsideLaunchWindow(value, label) {
  if (value === undefined || value === null || value === '') return;
  if (!isOnOrBeforeLaunchWindowEnd(value)) {
    throw httpError(400, `${label} has to fall on or before the launch window`, 'OUTSIDE_LAUNCH_WINDOW');
  }
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function mapClaimError(error) {
  const text = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`;
  const code = Object.keys(CLAIM_ERRORS).find((key) => text.includes(key));
  if (!code) return error;
  const mapped = CLAIM_ERRORS[code];
  return httpError(mapped.status, mapped.message, code);
}

async function readRemaining(slug) {
  if (!supabase) throw httpError(500, 'Database not available', 'DATABASE_UNAVAILABLE');
  const { data, error } = await supabase.rpc('get_capped_drop_remaining', { p_slug: slug });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row || null;
}

async function getPublicDrop(slug, userId = null) {
  if (!supabase) throw httpError(500, 'Database not available', 'DATABASE_UNAVAILABLE');
  const counts = await readRemaining(slug);
  const { data: drop, error } = await supabase
    .from('capped_drops')
    .select('id, slug, title, status, opens_at, closes_at, sold_out_at, moment_id, cap')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  if (!drop || !counts) return null;

  let alreadyClaimed = false;
  if (userId) {
    const { data: claim, error: claimError } = await supabase
      .from('capped_drop_claims')
      .select('id')
      .eq('drop_id', drop.id)
      .eq('user_id', userId)
      .maybeSingle();
    if (claimError) throw claimError;
    alreadyClaimed = Boolean(claim);
  }

  return {
    id: drop.id,
    slug: counts.slug || drop.slug,
    title: drop.title,
    moment_id: drop.moment_id,
    opens_at: drop.opens_at,
    closes_at: drop.closes_at,
    cap: counts.cap,
    claimed_count: counts.claimed_count,
    remaining: counts.remaining,
    status: counts.status,
    sold_out_at: counts.sold_out_at || drop.sold_out_at,
    already_claimed: alreadyClaimed,
  };
}

async function createDrop(userId, body = {}) {
  if (!supabase) throw httpError(500, 'Database not available', 'DATABASE_UNAVAILABLE');
  const title = String(body.title || '').trim();
  if (!title) throw httpError(400, 'A name is required', 'TITLE_REQUIRED');

  const slug = slugify(body.slug || title);
  if (!slug) throw httpError(400, 'A name is required', 'TITLE_REQUIRED');

  const cap = resolveCap(body.cap);
  const opensAt = body.opens_at || null;
  const closesAt = body.closes_at || defaultCappedDropClosesAt();
  assertInsideLaunchWindow(opensAt, 'Open time');
  assertInsideLaunchWindow(closesAt, 'Close time');
  if (opensAt && closesAt && new Date(closesAt).getTime() <= new Date(opensAt).getTime()) {
    throw httpError(400, 'Close time has to be after open time', 'INVALID_WINDOW');
  }

  const status = opensAt && new Date(opensAt).getTime() > Date.now() ? 'scheduled' : 'live';
  const { data, error } = await supabase
    .from('capped_drops')
    .insert({
      slug,
      title,
      moment_id: body.moment_id || null,
      cap,
      status,
      opens_at: opensAt,
      closes_at: closesAt,
      requires_membership: body.requires_membership === true,
      created_by: userId,
    })
    .select('id, slug, title, cap, status, opens_at, closes_at, moment_id, requires_membership')
    .single();

  if (error) {
    if (/duplicate|unique/i.test(error.message || '')) {
      throw httpError(409, 'A drop with that name already exists', 'SLUG_TAKEN');
    }
    throw error;
  }
  return data;
}

async function claimDrop(userId, slug) {
  if (!supabase) throw httpError(500, 'Database not available', 'DATABASE_UNAVAILABLE');
  const { data: drop, error } = await supabase
    .from('capped_drops')
    .select('id, slug, title')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  if (!drop) throw httpError(404, 'This drop is not open', 'DROP_NOT_FOUND');

  const { data, error: claimError } = await supabase.rpc('claim_capped_drop', {
    p_drop_id: drop.id,
    p_user_id: userId,
  });
  if (claimError) throw mapClaimError(claimError);
  return { ...data, slug: drop.slug, title: drop.title };
}

async function registerNextNotice(userId) {
  if (!supabase) throw httpError(500, 'Database not available', 'DATABASE_UNAVAILABLE');
  const { data, error } = await supabase
    .from('capped_drop_next_notices')
    .upsert({ user_id: userId }, { onConflict: 'user_id' })
    .select('id, created_at')
    .single();
  if (error) throw error;
  return { saved: true, notice: data };
}

module.exports = {
  CLAIM_ERRORS,
  resolveCap,
  assertInsideLaunchWindow,
  slugify,
  mapClaimError,
  getPublicDrop,
  createDrop,
  claimDrop,
  registerNextNotice,
  readRemaining,
};
