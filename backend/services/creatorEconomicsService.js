const { supabase: serviceSupabase } = require('../lib/supabase');

const supabase = global.supabase || serviceSupabase || null;

const DEFAULT_RULES = {
  mission_join: { percent: 5, unit: 2 },
  mission_verification: { percent: 10, unit: 4 },
  memory_issuance: { percent: 12.5, unit: 6 },
  sponsored_boost: { percent: 15, unit: 10 },
  catalyst_conversion: { percent: 7.5, unit: 1 },
};

async function ensureCreatorEconomicProfile(userId) {
  if (!supabase) throw new Error('Database not available');

  const { data: existing, error } = await supabase
    .from('creator_economic_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (existing) return existing;

  const { data, error: insertError } = await supabase
    .from('creator_economic_profiles')
    .insert({ user_id: userId })
    .select()
    .single();

  if (insertError) throw insertError;
  return data;
}

async function getRevenueShareRule({ creatorId, missionLinkId, contentItemId, sourceType }) {
  const filters = [];
  if (missionLinkId) filters.push(['mission_link_id', missionLinkId]);
  if (contentItemId) filters.push(['content_item_id', contentItemId]);
  if (creatorId) filters.push(['creator_id', creatorId]);

  for (const [column, value] of filters) {
    const { data, error } = await supabase
      .from('creator_revenue_share_rules')
      .select('*')
      .eq(column, value)
      .eq('source_type', sourceType)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (data) return data;
  }

  return null;
}

async function updateCreatorProfileAggregates(creatorId) {
  const { data: ledgerRows, error: ledgerError } = await supabase
    .from('creator_earnings_ledger')
    .select('creator_share_amount, source_type')
    .eq('creator_id', creatorId)
    .in('status', ['pending', 'approved', 'settled']);

  if (ledgerError) throw ledgerError;

  const rows = ledgerRows || [];
  const totals = {
    lifetime_momentum_value: Number(rows.reduce((sum, row) => sum + Number(row.creator_share_amount || 0), 0).toFixed(2)),
    lifetime_verified_unlocks: rows.filter((row) => row.source_type === 'mission_verification').length,
    lifetime_memories_issued: rows.filter((row) => row.source_type === 'memory_issuance').length,
    lifetime_catalyst_conversions: rows.filter((row) => row.source_type === 'catalyst_conversion').length,
  };

  const { data, error } = await supabase
    .from('creator_economic_profiles')
    .update(totals)
    .eq('user_id', creatorId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function recordCreatorLedgerEntry({
  creatorId,
  missionAttributionId = null,
  missionLinkId = null,
  contentItemId = null,
  momentId = null,
  brandId = null,
  sourceType,
  unitCount = 1,
  metadata = {},
}) {
  if (!supabase) throw new Error('Database not available');
  await ensureCreatorEconomicProfile(creatorId);

  const { data: existing, error: existingError } = missionAttributionId
    ? await supabase
      .from('creator_earnings_ledger')
      .select('id')
      .eq('creator_id', creatorId)
      .eq('mission_attribution_id', missionAttributionId)
      .eq('source_type', sourceType)
      .maybeSingle()
    : { data: null, error: null };

  if (existingError) throw existingError;
  if (existing) return { skipped: true, entry: existing };

  const rule = await getRevenueShareRule({ creatorId, missionLinkId, contentItemId, sourceType });
  const fallback = DEFAULT_RULES[sourceType] || { percent: 0, unit: 0 };
  const creatorSharePercent = Number(rule?.revshare_percent ?? fallback.percent ?? 0);
  const unitAmount = Number(rule?.fixed_amount ?? fallback.unit ?? 0);
  const grossAmount = Number((unitAmount * unitCount).toFixed(2));
  const creatorShareAmount = Number(((grossAmount * creatorSharePercent) / 100).toFixed(2));

  const { data, error } = await supabase
    .from('creator_earnings_ledger')
    .insert({
      creator_id: creatorId,
      mission_attribution_id: missionAttributionId,
      mission_link_id: missionLinkId,
      content_item_id: contentItemId,
      moment_id: momentId,
      brand_id: brandId,
      source_type: sourceType,
      unit_count: unitCount,
      unit_amount: unitAmount,
      gross_amount: grossAmount,
      creator_share_percent: creatorSharePercent,
      creator_share_amount: creatorShareAmount,
      metadata,
    })
    .select()
    .single();

  if (error) throw error;

  await updateCreatorProfileAggregates(creatorId);
  return { skipped: false, entry: data };
}

async function getCreatorEconomicsSummary(userId) {
  if (!supabase) throw new Error('Database not available');
  const profile = await ensureCreatorEconomicProfile(userId);

  const { data: ledger, error } = await supabase
    .from('creator_earnings_ledger')
    .select('*')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;

  const rows = ledger || [];
  const pending = rows.filter((row) => row.status === 'pending');
  const settled = rows.filter((row) => row.status === 'settled');

  return {
    profile,
    summary: {
      pending_value: Number(pending.reduce((sum, row) => sum + Number(row.creator_share_amount || 0), 0).toFixed(2)),
      settled_value: Number(settled.reduce((sum, row) => sum + Number(row.creator_share_amount || 0), 0).toFixed(2)),
      total_entries: rows.length,
      mission_join_value: Number(rows.filter((row) => row.source_type === 'mission_join').reduce((sum, row) => sum + Number(row.creator_share_amount || 0), 0).toFixed(2)),
      verification_value: Number(rows.filter((row) => row.source_type === 'mission_verification').reduce((sum, row) => sum + Number(row.creator_share_amount || 0), 0).toFixed(2)),
      memory_value: Number(rows.filter((row) => row.source_type === 'memory_issuance').reduce((sum, row) => sum + Number(row.creator_share_amount || 0), 0).toFixed(2)),
      catalyst_value: Number(rows.filter((row) => row.source_type === 'catalyst_conversion').reduce((sum, row) => sum + Number(row.creator_share_amount || 0), 0).toFixed(2)),
    },
    recent_entries: rows.slice(0, 25),
  };
}

module.exports = {
  ensureCreatorEconomicProfile,
  recordCreatorLedgerEntry,
  getCreatorEconomicsSummary,
};
