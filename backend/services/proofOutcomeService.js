const { supabase } = require('../lib/supabase');

function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function rate(numerator, denominator) {
  if (!denominator) return 0;
  return Number(((numerator / denominator) * 100).toFixed(1));
}

function buildSummary({
  label,
  actionLabel,
  totalJoins = 0,
  totalCheckIns = 0,
  verifiedProofs = 0,
  pendingProofs = 0,
  rejectedProofs = 0,
  approvedContent = 0,
  pendingContent = 0,
  rejectedContent = 0,
  rewardUnits = 0,
  topMoments = [],
}) {
  return {
    label,
    chain: {
      action: {
        label: actionLabel,
        value: totalJoins,
        helper: totalJoins === 1 ? '1 join or attribution event' : `${totalJoins} joins or attributed entries`,
      },
      verification: {
        label: 'Verified',
        value: verifiedProofs,
        helper: `${totalCheckIns} check-ins captured, ${pendingProofs} pending proof reviews`,
      },
      outcome: {
        label: 'Outcome',
        value: rewardUnits,
        helper: `${rewardUnits} verified reward outcomes, ${approvedContent} approved content items`,
      },
      repeatability: {
        label: 'Repeat',
        value: topMoments.length,
        helper: topMoments.length > 0
          ? `${topMoments.length} moments/campaign units feeding the loop`
          : 'No repeatable units in the loop yet',
      },
    },
    metrics: {
      joins: totalJoins,
      check_ins: totalCheckIns,
      verified_proofs: verifiedProofs,
      pending_proofs: pendingProofs,
      rejected_proofs: rejectedProofs,
      approved_content: approvedContent,
      pending_content: pendingContent,
      rejected_content: rejectedContent,
      reward_units: rewardUnits,
      proof_completion_rate: rate(verifiedProofs, totalCheckIns || verifiedProofs + pendingProofs + rejectedProofs),
      content_approval_rate: rate(approvedContent, approvedContent + pendingContent + rejectedContent),
    },
    top_moments: topMoments,
  };
}

async function getMomentProofOutcome(momentId) {
  const [
    { data: moment, error: momentError },
    { data: participants = [], error: participantsError },
    { data: proofs = [], error: proofsError },
    { data: media = [], error: mediaError },
    { data: reviews = [], error: reviewsError },
  ] = await Promise.all([
    supabase
      .from('moments')
      .select('id, title, host_id, reward, proof_type, starts_at, venue_name, location')
      .eq('id', momentId)
      .maybeSingle(),
    supabase
      .from('moment_participants')
      .select('status, checked_in_at')
      .eq('moment_id', momentId),
    supabase
      .from('proof_submissions')
      .select('submission_state')
      .eq('moment_id', momentId),
    supabase
      .from('moment_media')
      .select('moderation_status')
      .eq('moment_id', momentId),
    supabase
      .from('moment_reviews')
      .select('moderation_status')
      .eq('moment_id', momentId),
  ]);

  if (momentError) throw momentError;
  if (participantsError) throw participantsError;
  if (proofsError) throw proofsError;
  if (mediaError) throw mediaError;
  if (reviewsError) throw reviewsError;

  if (!moment) {
    throw new Error('Moment not found');
  }

  const verifiedProofs = proofs.filter((proof) => proof.submission_state === 'verified').length;
  const pendingProofs = proofs.filter((proof) => proof.submission_state === 'pending').length;
  const rejectedProofs = proofs.filter((proof) => proof.submission_state === 'rejected').length;

  const contentRows = [...media, ...reviews];
  const approvedContent = contentRows.filter((item) => item.moderation_status === 'approved').length;
  const pendingContent = contentRows.filter((item) => item.moderation_status === 'pending').length;
  const rejectedContent = contentRows.filter((item) => ['rejected', 'flagged'].includes(item.moderation_status)).length;
  const joinsCount = participants.length;
  const checkInsCount = participants.filter((participant) => participant.checked_in_at || participant.status === 'checked_in').length;

  return {
    scope: 'moment',
    entity: {
      id: moment.id,
      title: moment.title,
      reward: moment.reward || null,
      proof_type: moment.proof_type || null,
      venue_name: moment.venue_name || null,
      location: moment.location || null,
      starts_at: moment.starts_at,
    },
    ...buildSummary({
      label: 'Moment Proof Chain',
      actionLabel: 'Joined',
      totalJoins: joinsCount,
      totalCheckIns: checkInsCount,
      verifiedProofs,
      pendingProofs,
      rejectedProofs,
      approvedContent,
      pendingContent,
      rejectedContent,
      rewardUnits: verifiedProofs,
      topMoments: [{
        id: moment.id,
        title: moment.title,
        joins: joinsCount,
        verified_proofs: verifiedProofs,
        reward_units: verifiedProofs,
      }],
    }),
  };
}

async function getHostProofOutcome(hostId) {
  const { data: moments = [], error: momentsError } = await supabase
    .from('moments')
    .select('id, title, starts_at, venue_name, location')
    .eq('host_id', hostId)
    .order('starts_at', { ascending: false })
    .limit(12);

  if (momentsError) throw momentsError;

  const momentIds = moments.map((moment) => moment.id);
  if (momentIds.length === 0) {
    return {
      scope: 'host',
      entity: null,
      ...buildSummary({
        label: 'Hosted Proof Chain',
        actionLabel: 'Joined',
      }),
    };
  }

  const [
    { data: joins = [], error: joinsError },
    { data: proofs = [], error: proofsError },
    { data: media = [], error: mediaError },
    { data: reviews = [], error: reviewsError },
  ] = await Promise.all([
    supabase.from('moment_participants').select('moment_id, status, checked_in_at').in('moment_id', momentIds),
    supabase.from('proof_submissions').select('moment_id, submission_state').in('moment_id', momentIds),
    supabase.from('moment_media').select('moment_id, moderation_status').in('moment_id', momentIds),
    supabase.from('moment_reviews').select('moment_id, moderation_status').in('moment_id', momentIds),
  ]);

  if (joinsError) throw joinsError;
  if (proofsError) throw proofsError;
  if (mediaError) throw mediaError;
  if (reviewsError) throw reviewsError;

  const joinCounts = joins.reduce((acc, row) => {
    acc[row.moment_id] = (acc[row.moment_id] || 0) + 1;
    return acc;
  }, {});
  const checkInCounts = joins.reduce((acc, row) => {
    if (row.checked_in_at || row.status === 'checked_in') {
      acc[row.moment_id] = (acc[row.moment_id] || 0) + 1;
    }
    return acc;
  }, {});
  const proofCounts = proofs.reduce((acc, row) => {
    const current = acc[row.moment_id] || { verified: 0, pending: 0, rejected: 0 };
    if (row.submission_state === 'verified') current.verified += 1;
    if (row.submission_state === 'pending') current.pending += 1;
    if (row.submission_state === 'rejected') current.rejected += 1;
    acc[row.moment_id] = current;
    return acc;
  }, {});
  const contentCounts = [...media, ...reviews].reduce((acc, row) => {
    const current = acc[row.moment_id] || { approved: 0, pending: 0, rejected: 0 };
    if (row.moderation_status === 'approved') current.approved += 1;
    if (row.moderation_status === 'pending') current.pending += 1;
    if (['rejected', 'flagged'].includes(row.moderation_status)) current.rejected += 1;
    acc[row.moment_id] = current;
    return acc;
  }, {});

  const topMoments = moments
    .map((moment) => ({
      id: moment.id,
      title: moment.title,
      starts_at: moment.starts_at,
      venue_name: moment.venue_name || moment.location || null,
      joins: joinCounts[moment.id] || 0,
      check_ins: checkInCounts[moment.id] || 0,
      verified_proofs: proofCounts[moment.id]?.verified || 0,
      pending_proofs: proofCounts[moment.id]?.pending || 0,
      reward_units: proofCounts[moment.id]?.verified || 0,
      approved_content: contentCounts[moment.id]?.approved || 0,
    }))
    .sort((a, b) => (b.verified_proofs + b.joins) - (a.verified_proofs + a.joins))
    .slice(0, 4);

  const totals = topMoments.reduce((acc, moment) => {
    acc.joins += moment.joins;
    acc.check_ins += moment.check_ins;
    acc.verified_proofs += moment.verified_proofs;
    acc.pending_proofs += moment.pending_proofs;
    acc.reward_units += moment.reward_units;
    acc.approved_content += moment.approved_content;
    return acc;
  }, {
    joins: 0,
    check_ins: 0,
    verified_proofs: 0,
    pending_proofs: 0,
    reward_units: 0,
    approved_content: 0,
  });

  const rejectedProofs = proofs.filter((row) => row.submission_state === 'rejected').length;
  const pendingContent = [...media, ...reviews].filter((row) => row.moderation_status === 'pending').length;
  const rejectedContent = [...media, ...reviews].filter((row) => ['rejected', 'flagged'].includes(row.moderation_status)).length;

  return {
    scope: 'host',
    entity: {
      hosted_moments: moments.length,
    },
    ...buildSummary({
      label: 'Hosted Proof Chain',
      actionLabel: 'Joined',
      totalJoins: totals.joins,
      totalCheckIns: totals.check_ins,
      verifiedProofs: totals.verified_proofs,
      pendingProofs: totals.pending_proofs,
      rejectedProofs,
      approvedContent: totals.approved_content,
      pendingContent,
      rejectedContent,
      rewardUnits: totals.reward_units,
      topMoments,
    }),
  };
}

async function getCampaignProofOutcome(campaignId) {
  const [
    { data: campaign, error: campaignError },
    { data: sponsorships = [], error: sponsorshipsError },
  ] = await Promise.all([
    supabase
      .from('campaigns')
      .select('id, title, description, budget, reward_value, is_active, created_at')
      .eq('id', campaignId)
      .maybeSingle(),
    supabase
      .from('campaign_sponsorships')
      .select('campaign_id, moment_id, amount_usd')
      .eq('campaign_id', campaignId),
  ]);

  if (campaignError) throw campaignError;
  if (sponsorshipsError) throw sponsorshipsError;
  if (!campaign) throw new Error('Campaign not found');

  const momentIds = sponsorships.map((row) => row.moment_id).filter(Boolean);

  let moments = [];
  let joins = [];
  let checkIns = [];
  let proofs = [];
  let media = [];
  let reviews = [];

  if (momentIds.length > 0) {
    const [
      momentsResult,
      joinsResult,
      proofsResult,
      mediaResult,
      reviewsResult,
    ] = await Promise.all([
      supabase.from('moments').select('id, title, starts_at, venue_name, location').in('id', momentIds),
      supabase.from('moment_participants').select('moment_id, status, checked_in_at').in('moment_id', momentIds),
      supabase.from('proof_submissions').select('moment_id, submission_state').in('moment_id', momentIds),
      supabase.from('moment_media').select('moment_id, moderation_status').in('moment_id', momentIds),
      supabase.from('moment_reviews').select('moment_id, moderation_status').in('moment_id', momentIds),
    ]);

    if (momentsResult.error) throw momentsResult.error;
    if (joinsResult.error) throw joinsResult.error;
    if (proofsResult.error) throw proofsResult.error;
    if (mediaResult.error) throw mediaResult.error;
    if (reviewsResult.error) throw reviewsResult.error;

    moments = momentsResult.data || [];
    joins = joinsResult.data || [];
    proofs = proofsResult.data || [];
    media = mediaResult.data || [];
    reviews = reviewsResult.data || [];
  }

  const joinCounts = joins.reduce((acc, row) => {
    acc[row.moment_id] = (acc[row.moment_id] || 0) + 1;
    return acc;
  }, {});
  const checkInCounts = joins.reduce((acc, row) => {
    if (row.checked_in_at || row.status === 'checked_in') {
      acc[row.moment_id] = (acc[row.moment_id] || 0) + 1;
    }
    return acc;
  }, {});
  const proofCounts = proofs.reduce((acc, row) => {
    const current = acc[row.moment_id] || { verified: 0, pending: 0, rejected: 0 };
    if (row.submission_state === 'verified') current.verified += 1;
    if (row.submission_state === 'pending') current.pending += 1;
    if (row.submission_state === 'rejected') current.rejected += 1;
    acc[row.moment_id] = current;
    return acc;
  }, {});
  const contentCounts = [...media, ...reviews].reduce((acc, row) => {
    const current = acc[row.moment_id] || { approved: 0, pending: 0, rejected: 0 };
    if (row.moderation_status === 'approved') current.approved += 1;
    if (row.moderation_status === 'pending') current.pending += 1;
    if (['rejected', 'flagged'].includes(row.moderation_status)) current.rejected += 1;
    acc[row.moment_id] = current;
    return acc;
  }, {});
  const spendByMoment = sponsorships.reduce((acc, row) => {
    acc[row.moment_id] = (acc[row.moment_id] || 0) + toNumber(row.amount_usd);
    return acc;
  }, {});

  const topMoments = moments
    .map((moment) => ({
      id: moment.id,
      title: moment.title,
      starts_at: moment.starts_at,
      venue_name: moment.venue_name || moment.location || null,
      joins: joinCounts[moment.id] || 0,
      check_ins: checkInCounts[moment.id] || 0,
      verified_proofs: proofCounts[moment.id]?.verified || 0,
      pending_proofs: proofCounts[moment.id]?.pending || 0,
      reward_units: proofCounts[moment.id]?.verified || 0,
      approved_content: contentCounts[moment.id]?.approved || 0,
      spend_usd: spendByMoment[moment.id] || 0,
    }))
    .sort((a, b) => (b.verified_proofs + b.joins) - (a.verified_proofs + a.joins))
    .slice(0, 5);

  const totals = topMoments.reduce((acc, moment) => {
    acc.joins += moment.joins;
    acc.check_ins += moment.check_ins;
    acc.verified_proofs += moment.verified_proofs;
    acc.pending_proofs += moment.pending_proofs;
    acc.reward_units += moment.reward_units;
    acc.approved_content += moment.approved_content;
    acc.spend_usd += moment.spend_usd;
    return acc;
  }, {
    joins: 0,
    check_ins: 0,
    verified_proofs: 0,
    pending_proofs: 0,
    reward_units: 0,
    approved_content: 0,
    spend_usd: 0,
  });

  const rejectedProofs = proofs.filter((row) => row.submission_state === 'rejected').length;
  const pendingContent = [...media, ...reviews].filter((row) => row.moderation_status === 'pending').length;
  const rejectedContent = [...media, ...reviews].filter((row) => ['rejected', 'flagged'].includes(row.moderation_status)).length;

  return {
    scope: 'campaign',
    entity: {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description || null,
      budget: campaign.budget || null,
      reward_value: campaign.reward_value || null,
      is_active: Boolean(campaign.is_active),
    },
    ...buildSummary({
      label: 'Campaign Proof Chain',
      actionLabel: 'Attributed joins',
      totalJoins: totals.joins,
      totalCheckIns: totals.check_ins,
      verifiedProofs: totals.verified_proofs,
      pendingProofs: totals.pending_proofs,
      rejectedProofs,
      approvedContent: totals.approved_content,
      pendingContent,
      rejectedContent,
      rewardUnits: totals.reward_units,
      topMoments,
    }),
    spend_usd: Number(totals.spend_usd.toFixed(2)),
    spend_per_verified_proof: totals.verified_proofs > 0
      ? Number((totals.spend_usd / totals.verified_proofs).toFixed(2))
      : 0,
  };
}

module.exports = {
  getMomentProofOutcome,
  getHostProofOutcome,
  getCampaignProofOutcome,
};
