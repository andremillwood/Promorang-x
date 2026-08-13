const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;

const MONEY_SOURCES = new Set(['entry', 'host', 'event', 'platform', 'content', 'hybrid']);
const ALLOCATION_MONEY_SOURCES = new Set(['platform', 'content']);
const PROOF_TYPES = new Set(['code', 'photo', 'video', 'referral', 'link']);
const { resolvePlaceGeo, toMomentProofEnum, toMoveProofType } = require('../lib/jamaicaGeo');
const RULE_TYPES = new Set(['first_n', 'per_action', 'leaderboard', 'milestone', 'judged']);
const RECURRENCE_FREQUENCIES = new Set(['daily', 'weekly', 'monthly']);
const CONTENT_ORIGINS = new Set(['stakeholder_created', 'platform_seed', 'demo', 'scraped', 'imported']);
const ADMIN_ROLES = new Set(['admin', 'master_admin', 'moderator', 'administrator']);

function canAdministerMoments(user = {}) {
  const roles = [user.role, user.user_type, ...(Array.isArray(user.roles) ? user.roles : [])].filter(Boolean);
  const adminEmails = ['andremillwood@gmail.com', 'admin@promorang.com', 'demo@promorang.com'];
  return roles.some((role) => ADMIN_ROLES.has(role)) || adminEmails.includes(user.email);
}

function toMoney(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number < 0) return 0;
  return Math.round(number * 100) / 100;
}

function normalizeMove(move = {}, index = 0) {
  const proofType = toMoveProofType(move.proof_type);
  if (!move.title) throw new Error(`Move ${index + 1} requires a title`);
  if (!PROOF_TYPES.has(proofType)) throw new Error(`Move ${index + 1} has invalid proof_type`);

  return {
    title: String(move.title).trim(),
    description: move.description ? String(move.description).trim() : null,
    proof_type: proofType,
    reward_amount_jmd: toMoney(move.reward_amount_jmd),
    max_completions: move.max_completions ? Number(move.max_completions) : null,
    requires_unique: move.requires_unique !== false,
    sort_order: Number.isFinite(Number(move.sort_order)) ? Number(move.sort_order) : index,
  };
}

function normalizeMomentProofType(value, fallbackMoveProofType = 'code') {
  const rawValue = value || fallbackMoveProofType || 'Screenshot';
  const proofType = toMomentProofEnum(rawValue);
  if (!proofType) {
    throw new Error('proof_type must be QR, GPS, Photo, Video, API, Code, Share, Screenshot, or Link');
  }
  return proofType;
}

function productProofType(value, fallback = null) {
  const proofType = toMomentProofEnum(value || fallback);
  if (proofType === 'Screenshot' || proofType === 'Share' || proofType === 'Link') return proofType;
  return null;
}

function isGeoSchemaError(error) {
  const message = `${error?.message || ''} ${error?.details || ''}`.toLowerCase();
  return message.includes('country_code') || ((message.includes('column') || message.includes('schema cache')) && (message.includes('city') || message.includes('country')));
}

function isLatLngSchemaError(error) {
  const message = `${error?.message || ''} ${error?.details || ''}`.toLowerCase();
  return message.includes('latitude') || message.includes('longitude') || message.includes('lat') || message.includes('lng');
}

function resolveMomentGeo(payload = {}) {
  return resolvePlaceGeo({
    city: payload.city,
    location: payload.location,
    country: payload.country,
    countryCode: payload.country_code,
  });
}

function normalizeRule(rule = {}, index = 0) {
  const ruleType = String(rule.rule_type || '').toLowerCase();
  if (!RULE_TYPES.has(ruleType)) throw new Error(`Payout rule ${index + 1} has invalid rule_type`);

  return {
    rule_type: ruleType,
    amount_jmd: toMoney(rule.amount_jmd),
    cap_jmd: rule.cap_jmd === null || rule.cap_jmd === undefined || rule.cap_jmd === '' ? null : toMoney(rule.cap_jmd),
    rank_start: rule.rank_start ? Number(rule.rank_start) : null,
    rank_end: rule.rank_end ? Number(rule.rank_end) : null,
    criteria_json: rule.criteria_json || {},
  };
}

function calculateMoveLiability(moves) {
  return moves.reduce((total, move) => {
    if (move.reward_amount_jmd <= 0) return total;
    if (!move.max_completions) {
      throw new Error('Rewarded Moves must define max_completions to cap liability');
    }
    return total + (move.reward_amount_jmd * move.max_completions);
  }, 0);
}

function isRecurrenceSchemaError(error) {
  const message = `${error?.message || ''} ${error?.details || ''}`.toLowerCase();
  return message.includes('recurrence_') || message.includes('moment_recurrence_frequency');
}

function isMomentLineageSchemaError(error) {
  const message = `${error?.message || ''} ${error?.details || ''}`.toLowerCase();
  return message.includes('content_origin') ||
    message.includes('parent_moment_id') ||
    message.includes('creative_owner_id') ||
    message.includes('moment_content_origin');
}

function normalizeRecurrencePayload(payload = {}) {
  const recurrenceEnabled = payload.recurrence_enabled === true;

  if (!recurrenceEnabled) {
    return {
      recurrence_enabled: false,
      recurrence_frequency: null,
      recurrence_interval: 1,
      recurrence_by_weekday: [],
      recurrence_day_of_month: null,
      recurrence_timezone: payload.recurrence_timezone || 'UTC',
      recurrence_until: null,
      recurrence_count: null,
    };
  }

  const recurrenceFrequency = String(payload.recurrence_frequency || '').toLowerCase();
  if (!RECURRENCE_FREQUENCIES.has(recurrenceFrequency)) {
    throw new Error('recurrence_frequency must be daily, weekly, or monthly');
  }

  const recurrenceInterval = Number(payload.recurrence_interval || 1);
  if (!Number.isInteger(recurrenceInterval) || recurrenceInterval <= 0) {
    throw new Error('recurrence_interval must be a positive integer');
  }

  const recurrenceByWeekday = Array.isArray(payload.recurrence_by_weekday)
    ? payload.recurrence_by_weekday
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6)
    : [];

  if (recurrenceFrequency === 'weekly' && recurrenceByWeekday.length === 0) {
    const startsAt = payload.starts_at ? new Date(payload.starts_at) : null;
    if (startsAt && !Number.isNaN(startsAt.getTime())) {
      recurrenceByWeekday.push(startsAt.getUTCDay());
    }
  }

  if (recurrenceFrequency === 'weekly' && recurrenceByWeekday.length === 0) {
    throw new Error('Weekly recurring moments need at least one weekday');
  }

  const recurrenceDayOfMonth =
    payload.recurrence_day_of_month === null || payload.recurrence_day_of_month === undefined || payload.recurrence_day_of_month === ''
      ? null
      : Number(payload.recurrence_day_of_month);

  if (
    recurrenceDayOfMonth !== null &&
    (!Number.isInteger(recurrenceDayOfMonth) || recurrenceDayOfMonth < 1 || recurrenceDayOfMonth > 31)
  ) {
    throw new Error('recurrence_day_of_month must be between 1 and 31');
  }

  const recurrenceCount =
    payload.recurrence_count === null || payload.recurrence_count === undefined || payload.recurrence_count === ''
      ? null
      : Number(payload.recurrence_count);

  if (recurrenceCount !== null && (!Number.isInteger(recurrenceCount) || recurrenceCount <= 0)) {
    throw new Error('recurrence_count must be a positive integer');
  }

  const recurrenceUntil = payload.recurrence_until
    ? new Date(payload.recurrence_until).toISOString()
    : null;

  return {
    recurrence_enabled: true,
    recurrence_frequency: recurrenceFrequency,
    recurrence_interval: recurrenceInterval,
    recurrence_by_weekday: recurrenceByWeekday,
    recurrence_day_of_month: recurrenceFrequency === 'monthly' ? recurrenceDayOfMonth : null,
    recurrence_timezone: payload.recurrence_timezone || 'UTC',
    recurrence_until: recurrenceUntil,
    recurrence_count: recurrenceCount,
  };
}

function validateEconomyPayload(payload = {}) {
  const moneySource = String(payload.money_source || '').toLowerCase();
  if (!MONEY_SOURCES.has(moneySource)) {
    throw new Error('money_source must be entry, host, event, platform, content, or hybrid');
  }

  const moves = (payload.moves || []).map(normalizeMove);
  const payoutRules = (payload.payout_rules || []).map(normalizeRule);

  if (moves.length === 0) throw new Error('At least one Move is required');
  if (payoutRules.length === 0) throw new Error('At least one payout rule is required');

  const entryFee = toMoney(payload.entry_fee_jmd);
  if (moneySource === 'entry' && entryFee <= 0) {
    throw new Error('entry_fee_jmd is required for entry-based Moments');
  }

  const rewardPool = toMoney(payload.reward_pool_jmd);
  const totalFunded = toMoney(payload.total_funded_jmd || payload.initial_funding_jmd);
  const moveLiability = calculateMoveLiability(moves);
  const maxMoveCompletions = moves.reduce((total, move) => {
    if (move.reward_amount_jmd > 0 && !move.max_completions) {
      throw new Error('Rewarded Moves must define max_completions to cap liability');
    }
    return total + Number(move.max_completions || 0);
  }, 0);
  const cappedRuleLiability = payoutRules.reduce((total, rule) => {
    if (rule.cap_jmd !== null && rule.cap_jmd !== undefined) return total + toMoney(rule.cap_jmd);
    if (rule.amount_jmd > 0 && maxMoveCompletions <= 0) {
      throw new Error('Payout rules with an amount require Move max_completions to cap liability');
    }
    return total + (rule.amount_jmd * maxMoveCompletions);
  }, 0);
  const maxLiability = Math.max(moveLiability, cappedRuleLiability);

  if (rewardPool > 0 && maxLiability > rewardPool) {
    throw new Error(`Reward pool must cover max liability. Pool: ${rewardPool} JMD, liability: ${maxLiability} JMD`);
  }

  if (rewardPool > 0 && moneySource !== 'entry' && !ALLOCATION_MONEY_SOURCES.has(moneySource) && totalFunded < rewardPool) {
    throw new Error('Self-funded or sponsor-funded reward Moments require initial funding that covers the reward pool');
  }

  return {
    moneySource,
    entryFee,
    rewardPool,
    totalFunded,
    hostMargin: toMoney(payload.host_margin_jmd),
    platformFee: toMoney(payload.platform_fee_jmd),
    opsBuffer: toMoney(payload.ops_buffer_jmd),
    moves,
    payoutRules,
  };
}

async function createLedgerEntry({ momentId, type, amountJmd, userId = null, proofSubmissionId = null, reference = null, metadata = {}, allowZero = false }) {
  if (!supabase) throw new Error('Database not available');
  const amount = toMoney(amountJmd);
  if (amount <= 0 && !allowZero) return null;

  const { data, error } = await supabase
    .from('moment_ledger')
    .insert({
      moment_id: momentId,
      type,
      amount_jmd: amount,
      user_id: userId,
      proof_submission_id: proofSubmissionId,
      reference,
      metadata,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function lockFundedEconomy(momentId, economics) {
  if (!economics || economics.reward_pool_jmd <= 0) return economics;
  if (economics.funding_status === 'locked' || economics.funding_status === 'completed') return economics;
  if (Number(economics.total_funded_jmd || 0) < Number(economics.reward_pool_jmd || 0)) return economics;

  await createLedgerEntry({
    momentId,
    type: 'escrow_lock',
    amountJmd: economics.reward_pool_jmd,
    reference: 'reward_pool_lock',
  });

  if (Number(economics.platform_fee_jmd || 0) > 0) {
    await createLedgerEntry({ momentId, type: 'platform_fee', amountJmd: economics.platform_fee_jmd, reference: 'moment_fee' });
  }
  if (Number(economics.host_margin_jmd || 0) > 0) {
    await createLedgerEntry({ momentId, type: 'host_margin', amountJmd: economics.host_margin_jmd, reference: 'host_margin' });
  }

  const { data, error } = await supabase
    .from('moment_economics')
    .update({
      funding_status: 'locked',
      payout_status: 'pending',
      locked_at: new Date().toISOString(),
    })
    .eq('moment_id', momentId)
    .select()
    .single();

  if (error) throw error;

  await supabase
    .from('moments')
    .update({ status: 'joinable', is_active: true, updated_at: new Date().toISOString() })
    .eq('id', momentId);

  return data;
}

async function createMomentWithEconomy(userId, payload = {}) {
  if (!supabase) throw new Error('Database not available');
  const economy = validateEconomyPayload(payload);
  const recurrence = normalizeRecurrencePayload(payload);
  const organizationId = payload.organization_id || null;
  const contentOrigin = CONTENT_ORIGINS.has(String(payload.content_origin || '').toLowerCase())
    ? String(payload.content_origin).toLowerCase()
    : 'stakeholder_created';
  const parentMomentId = payload.parent_moment_id || null;
  const creativeOwnerId = payload.creative_owner_id || userId;

  if (organizationId) {
    const { data: roleRows, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (roleError) throw roleError;

    const isAdmin = (roleRows || []).some((row) =>
      ['admin', 'master_admin', 'moderator'].includes(String(row.role || '').toLowerCase())
    );

    if (!isAdmin) {
      const { data: membership, error: membershipError } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('user_id', userId)
        .maybeSingle();

      if (membershipError) throw membershipError;
      if (!membership) throw new Error('You do not have access to create Moments for this organization');
    }
  }

  const status = economy.rewardPool > 0 && (economy.moneySource === 'entry' || ALLOCATION_MONEY_SOURCES.has(economy.moneySource))
    ? 'funding'
    : 'joinable';
  const isActive = true;
  const momentProofType = normalizeMomentProofType(payload.proof_type, economy.moves[0]?.proof_type);
  const requestedProductProof = productProofType(payload.proof_type, economy.moves[0]?.proof_type);
  const momentGeo = resolveMomentGeo(payload);

  const coreMomentInsert = {
      host_id: payload.host_id || userId,
      organizer_id: userId,
      organization_id: organizationId,
      title: payload.title,
      description: payload.description || null,
      type: payload.type || 'community',
      category: payload.category || 'community',
      venue_category: payload.venue_category || null,
      moment_archetype: payload.moment_archetype || null,
      conversion_type: payload.conversion_type || null,
      location: payload.location,
      city: momentGeo.city,
      country: momentGeo.country,
      country_code: momentGeo.country_code,
      venue_name: payload.venue_name || null,
      starts_at: payload.starts_at,
      ends_at: payload.ends_at || null,
      max_participants: payload.max_participants || payload.participant_cap || null,
      capacity_limit: payload.max_participants || payload.participant_cap || null,
      reward: payload.reward || (economy.rewardPool > 0 ? `${economy.rewardPool} JMD reward pool` : null),
      image_url: payload.image_url || null,
      banner_image_url: payload.banner_image_url || null,
      gallery_images: Array.isArray(payload.gallery_images) ? payload.gallery_images : [],
      video_url: payload.video_url || null,
      media_metadata: payload.media_metadata || {},
      is_active: isActive,
      status,
      visibility: payload.visibility || 'open',
      proof_type: requestedProductProof || momentProofType,
      evidence_requirements: payload.evidence_requirements || [],
      expected_action_unit: economy.moves[0]?.title || 'Action',
      check_in_code: payload.check_in_code || Math.random().toString(36).substring(2, 8).toUpperCase(),
  };
  const baseMomentInsert = {
      ...coreMomentInsert,
      parent_moment_id: parentMomentId,
      creative_owner_id: creativeOwnerId,
      content_origin: contentOrigin,
  };
  const recurrenceMomentInsert = {
      ...baseMomentInsert,
      recurrence_enabled: recurrence.recurrence_enabled,
      recurrence_frequency: recurrence.recurrence_frequency,
      recurrence_interval: recurrence.recurrence_interval,
      recurrence_by_weekday: recurrence.recurrence_by_weekday,
      recurrence_day_of_month: recurrence.recurrence_day_of_month,
      recurrence_timezone: recurrence.recurrence_timezone,
      recurrence_until: recurrence.recurrence_until,
      recurrence_count: recurrence.recurrence_count,
  };

  let moment;
  let momentError;
  ({ data: moment, error: momentError } = await supabase
    .from('moments')
    .insert(recurrenceMomentInsert)
    .select()
    .single());

  if (momentError && (isRecurrenceSchemaError(momentError) || isMomentLineageSchemaError(momentError) || isGeoSchemaError(momentError) || isLatLngSchemaError(momentError))) {
    if (recurrence.recurrence_enabled && isRecurrenceSchemaError(momentError)) {
      throw new Error('Recurring moments require the latest database migration to be applied');
    }

    const fallbackInsert = { ...(isMomentLineageSchemaError(momentError) ? coreMomentInsert : (isRecurrenceSchemaError(momentError) ? baseMomentInsert : recurrenceMomentInsert)) };
    if (isGeoSchemaError(momentError) || isLatLngSchemaError(momentError)) {
      delete fallbackInsert.city;
      delete fallbackInsert.country;
      delete fallbackInsert.country_code;
      delete fallbackInsert.latitude;
      delete fallbackInsert.longitude;
      delete fallbackInsert.lat;
      delete fallbackInsert.lng;
    }

    ({ data: moment, error: momentError } = await supabase
      .from('moments')
      .insert(fallbackInsert)
      .select()
      .single());
  }

  if (momentError) throw momentError;

  const fundingStatus = economy.moneySource === 'entry' || ALLOCATION_MONEY_SOURCES.has(economy.moneySource)
    ? 'pending'
    : economy.totalFunded >= economy.rewardPool ? 'funded' : 'pending';

  const { data: economics, error: economyError } = await supabase
    .from('moment_economics')
    .insert({
      moment_id: moment.id,
      money_source: economy.moneySource,
      entry_fee_jmd: economy.entryFee || null,
      total_funded_jmd: economy.totalFunded,
      reward_pool_jmd: economy.rewardPool,
      host_margin_jmd: economy.hostMargin,
      platform_fee_jmd: economy.platformFee,
      ops_buffer_jmd: economy.opsBuffer,
      funding_status: fundingStatus,
      payout_status: 'pending',
    })
    .select()
    .single();

  if (economyError) throw economyError;

  if (economy.totalFunded > 0) {
    await createLedgerEntry({
      momentId: moment.id,
      type: 'inflow',
      amountJmd: economy.totalFunded,
      userId,
      reference: payload.funding_reference || 'initial_funding',
      metadata: { money_source: economy.moneySource },
    });
  }

  const { data: moves, error: movesError } = await supabase
    .from('moment_moves')
    .insert(economy.moves.map((move) => ({ ...move, moment_id: moment.id })))
    .select();

  if (movesError) throw movesError;

  const { data: payoutRules, error: rulesError } = await supabase
    .from('moment_payout_rules')
    .insert(economy.payoutRules.map((rule) => ({ ...rule, moment_id: moment.id })))
    .select();

  if (rulesError) throw rulesError;

  const lockedEconomics = fundingStatus === 'funded'
    ? await lockFundedEconomy(moment.id, economics)
    : economics;

  return {
    moment,
    economics: lockedEconomics,
    moves: moves || [],
    payout_rules: payoutRules || [],
  };
}

async function updateMoment(userOrId, momentId, payload = {}) {
  if (!supabase) throw new Error('Database not available');

  const user = typeof userOrId === 'string' ? { id: userOrId } : (userOrId || {});
  const userId = user.id;

  const { data: existingMoment, error: existingError } = await supabase
    .from('moments')
    .select('*')
    .eq('id', momentId)
    .single();

  if (existingError) throw existingError;
  if (!existingMoment) throw new Error('Moment not found');
  if (!canAdministerMoments(user) && existingMoment.host_id !== userId && existingMoment.organizer_id !== userId) {
    throw new Error('You can only edit your own moments');
  }

  const recurrence = normalizeRecurrencePayload({
    ...existingMoment,
    ...payload,
    starts_at: payload.starts_at || existingMoment.starts_at,
  });

  const nextProofType = payload.proof_type
    ? (productProofType(payload.proof_type) || normalizeMomentProofType(payload.proof_type))
    : existingMoment.proof_type;
  const momentGeo = resolveMomentGeo({
    ...existingMoment,
    ...payload,
    location: payload.location || existingMoment.location,
  });

  const coreUpdates = {
    parent_moment_id: payload.parent_moment_id === undefined ? existingMoment.parent_moment_id || null : payload.parent_moment_id,
    creative_owner_id: payload.creative_owner_id === undefined ? existingMoment.creative_owner_id || userId : payload.creative_owner_id,
    content_origin: CONTENT_ORIGINS.has(String(payload.content_origin || existingMoment.content_origin || '').toLowerCase())
      ? String(payload.content_origin || existingMoment.content_origin).toLowerCase()
      : 'stakeholder_created',
    title: payload.title,
    description: payload.description || null,
    category: payload.category,
    venue_category: payload.venue_category || null,
    moment_archetype: payload.moment_archetype || null,
    conversion_type: payload.conversion_type || null,
    location: payload.location,
    city: momentGeo.city,
    country: momentGeo.country,
    country_code: momentGeo.country_code,
    proof_type: nextProofType,
    venue_name: payload.venue_name || null,
    starts_at: payload.starts_at,
    ends_at: payload.ends_at || null,
    max_participants: payload.max_participants || null,
    reward: payload.reward || null,
    image_url: payload.image_url || null,
    banner_image_url: payload.banner_image_url || null,
    gallery_images: Array.isArray(payload.gallery_images) ? payload.gallery_images : [],
    video_url: payload.video_url || null,
    media_metadata: payload.media_metadata || {},
    is_active: payload.is_active !== false,
    updated_at: new Date().toISOString(),
  };
  const legacyUpdates = {
    ...coreUpdates,
  };
  delete legacyUpdates.parent_moment_id;
  delete legacyUpdates.creative_owner_id;
  delete legacyUpdates.content_origin;

  const updates = {
    ...coreUpdates,
    recurrence_enabled: recurrence.recurrence_enabled,
    recurrence_frequency: recurrence.recurrence_frequency,
    recurrence_interval: recurrence.recurrence_interval,
    recurrence_by_weekday: recurrence.recurrence_by_weekday,
    recurrence_day_of_month: recurrence.recurrence_day_of_month,
    recurrence_timezone: recurrence.recurrence_timezone,
    recurrence_until: recurrence.recurrence_until,
    recurrence_count: recurrence.recurrence_count,
  };

  let updatedMoment;
  let updateError;
  ({ data: updatedMoment, error: updateError } = await supabase
    .from('moments')
    .update(updates)
    .eq('id', momentId)
    .select()
    .single());

  if (updateError && (isRecurrenceSchemaError(updateError) || isMomentLineageSchemaError(updateError) || isGeoSchemaError(updateError) || isLatLngSchemaError(updateError))) {
    if (recurrence.recurrence_enabled && isRecurrenceSchemaError(updateError)) {
      throw new Error('Recurring moments require the latest database migration to be applied');
    }

    const fallbackUpdates = { ...(isMomentLineageSchemaError(updateError) ? legacyUpdates : (isRecurrenceSchemaError(updateError) ? coreUpdates : updates)) };
    if (isGeoSchemaError(updateError) || isLatLngSchemaError(updateError)) {
      delete fallbackUpdates.city;
      delete fallbackUpdates.country;
      delete fallbackUpdates.country_code;
      delete fallbackUpdates.latitude;
      delete fallbackUpdates.longitude;
    }

    ({ data: updatedMoment, error: updateError } = await supabase
      .from('moments')
      .update(fallbackUpdates)
      .eq('id', momentId)
      .select()
      .single());
  }

  if (updateError) throw updateError;
  return updatedMoment;
}

async function getMomentEconomy(momentId) {
  if (!supabase) throw new Error('Database not available');

  const [economicsResult, movesResult, rulesResult, ledgerResult] = await Promise.all([
    supabase.from('moment_economics').select('*').eq('moment_id', momentId).maybeSingle(),
    supabase.from('moment_moves').select('*').eq('moment_id', momentId).order('sort_order', { ascending: true }),
    supabase.from('moment_payout_rules').select('*').eq('moment_id', momentId).order('created_at', { ascending: true }),
    supabase.from('moment_ledger').select('*').eq('moment_id', momentId).order('created_at', { ascending: false }),
  ]);

  if (economicsResult.error) throw economicsResult.error;
  if (movesResult.error) throw movesResult.error;
  if (rulesResult.error) throw rulesResult.error;
  if (ledgerResult.error) throw ledgerResult.error;

  return {
    economics: economicsResult.data || null,
    moves: movesResult.data || [],
    payout_rules: rulesResult.data || [],
    ledger: ledgerResult.data || [],
  };
}

async function addFunding({ momentId, userId, amountJmd, reference = 'manual_funding', metadata = {} }) {
  const amount = toMoney(amountJmd);
  if (amount <= 0) throw new Error('Funding amount must be greater than zero');
  if (reference) {
    const { data: existingLedger, error: existingError } = await supabase
      .from('moment_ledger')
      .select('id, moment_id')
      .eq('moment_id', momentId)
      .eq('type', 'inflow')
      .eq('reference', reference)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existingLedger) {
      const { data: existingEconomics, error: economyError } = await supabase
        .from('moment_economics')
        .select('*')
        .eq('moment_id', momentId)
        .single();

      if (economyError) throw economyError;
      return existingEconomics;
    }
  }

  const { data: current, error: currentError } = await supabase
    .from('moment_economics')
    .select('*')
    .eq('moment_id', momentId)
    .single();

  if (currentError) throw currentError;

  const nextTotal = toMoney(Number(current.total_funded_jmd || 0) + amount);
  const fundingStatus = nextTotal >= Number(current.reward_pool_jmd || 0) ? 'funded' : 'pending';

  const { data, error } = await supabase
    .from('moment_economics')
    .update({
      total_funded_jmd: nextTotal,
      funding_status: fundingStatus,
    })
    .eq('moment_id', momentId)
    .select()
    .single();

  if (error) throw error;

  await createLedgerEntry({ momentId, type: 'inflow', amountJmd: amount, userId, reference, metadata });
  return fundingStatus === 'funded' ? lockFundedEconomy(momentId, data) : data;
}

async function recordEntryPayment({ momentId, userId, amountJmd, reference = null }) {
  const economy = await getMomentEconomy(momentId);
  const economics = economy.economics;
  if (!economics || !['entry', 'hybrid'].includes(economics.money_source)) return null;

  const entryFee = Number(economics.entry_fee_jmd || 0);
  if (entryFee <= 0) return null;
  if (toMoney(amountJmd) < entryFee) throw new Error(`Entry fee is ${entryFee} JMD`);
  if (!reference) throw new Error('Entry payment reference is required');

  const updated = await addFunding({
    momentId,
    userId,
    amountJmd: entryFee,
    reference,
    metadata: { reason: 'entry_fee' },
  });

  return updated;
}

async function confirmStripeMomentPaymentIntent(paymentIntent) {
  const metadata = paymentIntent?.metadata || {};
  if (metadata.economy_flow !== 'moment_economy_v1' || !metadata.moment_id) {
    return { handled: false, reason: 'not_moment_economy_payment' };
  }

  const amountJmd = toMoney(Number(paymentIntent.amount_received || paymentIntent.amount || 0) / 100);
  if (amountJmd <= 0) return { handled: false, reason: 'zero_amount' };

  const economics = await confirmMomentPayment({
    momentId: metadata.moment_id,
    userId: metadata.user_id || null,
    amountJmd,
    paymentReference: paymentIntent.id,
    metadata: {
      confirmed_via: 'stripe_webhook',
      payment_type: metadata.payment_type || 'funding',
      stripe_currency: paymentIntent.currency,
      stripe_customer: paymentIntent.customer || null,
    },
  });

  return { handled: true, economics };
}

async function getRemainingRewardPool(momentId) {
  const economy = await getMomentEconomy(momentId);
  const economics = economy.economics;
  if (!economics) return 0;

  const paid = (economy.ledger || [])
    .filter((entry) => entry.type === 'payout')
    .reduce((sum, entry) => sum + Number(entry.amount_jmd || 0), 0);

  return Math.max(0, Number(economics.reward_pool_jmd || 0) - paid);
}

function buildUniqueKey(proofBundle = {}, move = {}) {
  const type = String(move.proof_type || proofBundle.proof_type || '').toLowerCase();
  if (type === 'referral') return proofBundle.referral_code || proofBundle.referral_user_id || proofBundle.code;
  if (type === 'link' || type === 'url' || type === 'api' || type === 'share') {
    return proofBundle.link_url || proofBundle.url || proofBundle.evidence_url;
  }
  if (type === 'code') return proofBundle.code;
  if (type === 'photo' || type === 'video' || type === 'screenshot' || type === 'share' || type === 'image') {
    return proofBundle.evidence_url || proofBundle.link_url;
  }
  return proofBundle.evidence_url || proofBundle.link_url || proofBundle.code || null;
}

async function validateUniqueProof({ momentId, userId, moveId, proofBundle }) {
  if (!moveId) return;

  const { data: move, error: moveError } = await supabase
    .from('moment_moves')
    .select('*')
    .eq('id', moveId)
    .single();

  if (moveError) throw moveError;
  if (!move.requires_unique) return;

  const uniqueKey = buildUniqueKey(proofBundle || {}, move);
  if (!uniqueKey) throw new Error('Unique proof value is required for this Move');

  const { data: duplicate, error } = await supabase
    .from('proof_submissions')
    .select('id')
    .eq('moment_id', momentId)
    .eq('moment_move_id', moveId)
    .neq('user_id', userId)
    .contains('proof_bundle', { unique_key: uniqueKey })
    .maybeSingle();

  if (error) throw error;
  if (duplicate) throw new Error('This proof has already been used');

  return uniqueKey;
}

async function resolveMoveForSubmission(submission) {
  if (submission.moment_move_id) {
    const { data, error } = await supabase.from('moment_moves').select('*').eq('id', submission.moment_move_id).single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('moment_moves')
    .select('*')
    .eq('moment_id', submission.moment_id)
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function calculatePayoutForSubmission(submission, move) {
  const economy = await getMomentEconomy(submission.moment_id);
  const economics = economy.economics;
  if (!economics) return { amount: 0, reason: 'no_economics' };
  if (economics.funding_status !== 'locked') return { amount: 0, reason: 'not_locked' };
  if (!move) return { amount: 0, reason: 'no_move' };

  const rules = economy.payout_rules || [];
  const rule = rules.find((item) => item.rule_type === 'per_action')
    || rules.find((item) => item.rule_type === 'first_n')
    || rules.find((item) => item.rule_type === 'milestone')
    || rules[0];

  if (!rule) return { amount: 0, reason: 'no_rule' };

  if (rule.rule_type === 'leaderboard' || rule.rule_type === 'judged') {
    return { amount: 0, reason: `${rule.rule_type}_requires_manual_settlement` };
  }

  if (rule.rule_type === 'first_n') {
    const maxWinners = Number(rule.rank_end || move.max_completions || 0);
    if (maxWinners > 0) {
      const { count, error } = await supabase
        .from('moment_ledger')
        .select('*', { count: 'exact', head: true })
        .eq('moment_id', submission.moment_id)
        .eq('type', 'payout')
        .contains('metadata', { moment_move_id: move.id });

      if (error) throw error;
      if ((count || 0) >= maxWinners) return { amount: 0, reason: 'first_n_exhausted' };
    }
  }

  const amount = toMoney(rule.amount_jmd || move.reward_amount_jmd);
  const remaining = await getRemainingRewardPool(submission.moment_id);
  if (amount <= 0) return { amount: 0, reason: 'zero_amount' };
  if (remaining < amount) return { amount: 0, reason: 'insufficient_reward_pool' };

  return { amount, rule, reason: 'payable' };
}

async function executePayoutForProof(submissionId, reviewerId = null, reviewer = null) {
  const { data: submission, error: submissionError } = await supabase
    .from('proof_submissions')
    .select('*')
    .eq('id', submissionId)
    .single();

  if (submissionError) throw submissionError;
  if (submission.submission_state !== 'verified') return { queued: false, reason: 'proof_not_verified' };
  if (submission.payout_ledger_id) return { queued: false, reason: 'already_paid_or_queued', ledger_id: submission.payout_ledger_id };

  const { data: moment, error: momentError } = await supabase
    .from('moments')
    .select('id, host_id, organizer_id')
    .eq('id', submission.moment_id)
    .single();

  if (momentError) throw momentError;
  if (!moment) throw new Error('Moment not found');

  const actorHostId = moment.host_id || moment.organizer_id || null;
  const isHostOrOrganizer = Boolean(reviewerId) && (reviewerId === moment.host_id || reviewerId === moment.organizer_id);
  if (!isHostOrOrganizer && !canAdministerMoments(reviewer || {})) {
    throw new Error('Only the host or organizer can credit moment_ledger on approve');
  }

  const move = await resolveMoveForSubmission(submission);
  const payout = await calculatePayoutForSubmission(submission, move);
  const points = Number(move?.reward_amount_jmd || payout.amount || 0);
  const ledgerMetadata = {
    moment_move_id: move?.id || null,
    reviewer_id: reviewerId,
    actor_host_id: actorHostId,
    proof_approved: true,
  };

  if (payout.amount <= 0) {
    const ledger = await createLedgerEntry({
      momentId: submission.moment_id,
      type: 'payout',
      amountJmd: points,
      userId: submission.user_id,
      proofSubmissionId: submission.id,
      reference: 'proof_approved',
      metadata: {
        ...ledgerMetadata,
        points,
        reason: payout.reason,
      },
      allowZero: true,
    });
    return { queued: false, reason: payout.reason, ledger, points };
  }

  const ledger = await createLedgerEntry({
    momentId: submission.moment_id,
    type: 'payout',
    amountJmd: payout.amount,
    userId: submission.user_id,
    proofSubmissionId: submission.id,
    reference: 'manual_queue',
    metadata: {
      ...ledgerMetadata,
      payout_rule_id: payout.rule?.id || null,
    },
  });

  const { data: queueItem, error: queueError } = await supabase
    .from('manual_payout_queue')
    .insert({
      moment_id: submission.moment_id,
      user_id: submission.user_id,
      proof_submission_id: submission.id,
      ledger_id: ledger.id,
      amount_jmd: payout.amount,
      status: 'queued',
    })
    .select()
    .single();

  if (queueError) throw queueError;

  await supabase
    .from('proof_submissions')
    .update({
      payout_status: 'in_progress',
      payout_ledger_id: ledger.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', submission.id);

  await supabase
    .from('moment_economics')
    .update({ payout_status: 'in_progress' })
    .eq('moment_id', submission.moment_id);

  return { queued: true, ledger, queue_item: queueItem };
}

async function getManualPayoutQueue() {
  const { data, error } = await supabase
    .from('manual_payout_queue')
    .select('*, moment:moments(id, title), proof:proof_submissions(id, proof_bundle)')
    .in('status', ['queued', 'processing'])
    .order('due_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

async function markManualPayoutPaid({ queueId, adminId, paymentReference, notes }) {
  if (!paymentReference) throw new Error('payment_reference is required');

  const { data, error } = await supabase
    .from('manual_payout_queue')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      paid_by: adminId,
      payment_reference: paymentReference,
      notes: notes || null,
    })
    .eq('id', queueId)
    .select()
    .single();

  if (error) throw error;

  if (data.proof_submission_id) {
    await supabase
      .from('proof_submissions')
      .update({ payout_status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', data.proof_submission_id);
  }

  return data;
}

async function createMomentPaymentIntent({ momentId, userId, amountJmd, paymentType = 'funding' }) {
  const stripeService = require('./stripeService');
  const amount = toMoney(amountJmd);
  if (amount <= 0) throw new Error('Payment amount must be greater than zero');

  if (!stripeService.isStripeConfigured()) {
    return {
      mode: 'manual',
      manual_required: true,
      amount_jmd: amount,
      message: 'Stripe is not configured. Record a manual payment reference after external payment.',
    };
  }

  return stripeService.createPaymentIntent(userId, amount, 'jmd', {
    moment_id: momentId,
    payment_type: paymentType,
    economy_flow: 'moment_economy_v1',
  });
}

async function confirmMomentPayment({ momentId, userId, amountJmd, paymentReference, metadata = {} }) {
  if (!paymentReference) throw new Error('payment_reference is required');
  return addFunding({
    momentId,
    userId,
    amountJmd,
    reference: paymentReference,
    metadata: {
      confirmed_via: 'moment_economy_api',
      ...metadata,
    },
  });
}

async function attemptAutomatedPayout({ queueId, adminId }) {
  const stripeService = require('./stripeService');

  const { data: queueItem, error } = await supabase
    .from('manual_payout_queue')
    .select('*')
    .eq('id', queueId)
    .single();

  if (error) throw error;
  if (!queueItem) throw new Error('Payout queue item not found');
  if (queueItem.status === 'paid') return { paid: true, queue_item: queueItem, already_paid: true };

  if (!stripeService.isStripeConfigured()) {
    return { paid: false, fallback: 'manual', reason: 'stripe_not_configured', queue_item: queueItem };
  }

  const { data: payoutMethod, error: methodError } = await supabase
    .from('user_payout_methods')
    .select('*')
    .eq('user_id', queueItem.user_id)
    .eq('method_type', 'stripe_connect')
    .eq('stripe_account_status', 'active')
    .eq('stripe_payouts_enabled', true)
    .order('is_default', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (methodError) throw methodError;
  if (!payoutMethod?.stripe_account_id) {
    return { paid: false, fallback: 'manual', reason: 'no_active_stripe_connect_method', queue_item: queueItem };
  }

  const transfer = await stripeService.createPayout(
    payoutMethod.stripe_account_id,
    Number(queueItem.amount_jmd),
    'jmd',
    {
      moment_id: queueItem.moment_id,
      queue_id: queueItem.id,
      proof_submission_id: queueItem.proof_submission_id || '',
      ledger_id: queueItem.ledger_id || '',
    }
  );

  const paid = await markManualPayoutPaid({
    queueId,
    adminId,
    paymentReference: transfer.transferId,
    notes: 'Automated Stripe Connect transfer',
  });

  return { paid: true, transfer, queue_item: paid };
}

async function queueManualSettlement({ momentId, userId, proofSubmissionId = null, amountJmd, reviewerId = null, reason = 'manual_settlement' }) {
  const amount = toMoney(amountJmd);
  if (amount <= 0) throw new Error('Settlement amount must be greater than zero');

  const remaining = await getRemainingRewardPool(momentId);
  if (remaining < amount) {
    throw new Error(`Insufficient reward pool. Remaining: ${remaining} JMD`);
  }

  const ledger = await createLedgerEntry({
    momentId,
    type: 'payout',
    amountJmd: amount,
    userId,
    proofSubmissionId,
    reference: 'manual_settlement_queue',
    metadata: {
      reason,
      reviewer_id: reviewerId,
      settlement_mode: 'manual',
    },
  });

  const { data: queueItem, error } = await supabase
    .from('manual_payout_queue')
    .insert({
      moment_id: momentId,
      user_id: userId,
      proof_submission_id: proofSubmissionId,
      ledger_id: ledger.id,
      amount_jmd: amount,
      status: 'queued',
      notes: reason,
    })
    .select()
    .single();

  if (error) throw error;

  if (proofSubmissionId) {
    await supabase
      .from('proof_submissions')
      .update({
        payout_status: 'in_progress',
        payout_ledger_id: ledger.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', proofSubmissionId);
  }

  await supabase
    .from('moment_economics')
    .update({ payout_status: 'in_progress' })
    .eq('moment_id', momentId);

  return { ledger, queue_item: queueItem };
}

async function settleRankedMoment({ momentId, reviewerId = null, ruleType = 'leaderboard' }) {
  const economy = await getMomentEconomy(momentId);
  const rule = (economy.payout_rules || []).find((item) => item.rule_type === ruleType)
    || (economy.payout_rules || []).find((item) => item.rule_type === 'leaderboard' || item.rule_type === 'judged');

  if (!rule) throw new Error('No leaderboard or judged payout rule found');

  const startRank = Number(rule.rank_start || 1);
  const endRank = Number(rule.rank_end || startRank);
  const amount = toMoney(rule.amount_jmd);
  if (amount <= 0) throw new Error('Ranked payout rule requires amount_jmd');
  if (endRank < startRank) throw new Error('rank_end must be greater than or equal to rank_start');

  const { data: submissions, error } = await supabase
    .from('proof_submissions')
    .select('*')
    .eq('moment_id', momentId)
    .eq('submission_state', 'verified')
    .is('payout_ledger_id', null)
    .order('reviewed_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })
    .range(startRank - 1, endRank - 1);

  if (error) throw error;

  const queued = [];
  for (let index = 0; index < (submissions || []).length; index += 1) {
    const submission = submissions[index];
    const rank = startRank + index;
    const settlement = await queueManualSettlement({
      momentId,
      userId: submission.user_id,
      proofSubmissionId: submission.id,
      amountJmd: amount,
      reviewerId,
      reason: `${rule.rule_type}_rank_${rank}`,
    });
    queued.push({ rank, ...settlement });
  }

  return { rule, queued };
}

module.exports = {
  createMomentWithEconomy,
  updateMoment,
  getMomentEconomy,
  addFunding,
  createMomentPaymentIntent,
  confirmMomentPayment,
  confirmStripeMomentPaymentIntent,
  recordEntryPayment,
  validateUniqueProof,
  executePayoutForProof,
  getManualPayoutQueue,
  markManualPayoutPaid,
  attemptAutomatedPayout,
  queueManualSettlement,
  settleRankedMoment,
};
