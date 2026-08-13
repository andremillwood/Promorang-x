const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;
const memoryService = require('./memoryService');
const momentEconomyService = require('./momentEconomyService');
const pieceEarningService = require('./pieceEarningService');
const promoPushTrackingService = require('./promoPushTrackingService');
const experienceAutomationService = require('./experienceAutomationService');
const growthOperatingService = require('./growthOperatingService');
const { geoProperties } = require('../lib/jamaicaGeo');

async function attachMissionAttribution(submissions = []) {
  if (!supabase || submissions.length === 0) return submissions;

  try {
    const userIds = [...new Set(submissions.map((row) => row.user_id).filter(Boolean))];
    const momentIds = [...new Set(submissions.map((row) => row.moment_id).filter(Boolean))];

    if (userIds.length === 0 || momentIds.length === 0) return submissions;

    const { data, error } = await supabase
      .from('mission_attributions')
      .select('*')
      .in('user_id', userIds)
      .in('moment_id', momentIds);

    if (error) {
      if (/relation .*mission_attributions.* does not exist/i.test(error.message || '')) {
        return submissions;
      }
      throw error;
    }

    return submissions.map((submission) => ({
      ...submission,
      mission_attribution: (data || []).find((row) => row.user_id === submission.user_id && row.moment_id === submission.moment_id) || null,
    }));
  } catch (error) {
    console.warn('[Proof Service] mission attribution hydration skipped:', error.message);
    return submissions;
  }
}

function isAdminReviewer(user = {}) {
  const adminRoles = ['admin', 'master_admin', 'moderator'];
  const adminEmails = ['andremillwood@gmail.com', 'admin@promorang.com', 'demo@promorang.com'];
  return adminRoles.includes(user.role) || adminRoles.includes(user.user_type) || adminEmails.includes(user.email);
}

async function getProofRequirements(momentId) {
  if (!supabase) throw new Error('Database not available');

  const { data, error } = await supabase
    .from('proof_requirements')
    .select('*')
    .eq('moment_id', momentId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

async function getPendingProofSubmissions(viewer = {}) {
  if (!supabase) throw new Error('Database not available');

  const { data, error } = await supabase
    .from('proof_submissions')
    .select(`
      *,
      moment:moments (
        id,
        title,
        reward,
        memory_rarity,
        venue_name,
        category,
        host_id
      )
    `)
    .eq('submission_state', 'pending')
    .order('created_at', { ascending: true });

  if (error) throw error;
  const rows = data || [];
  const scopedRows = isAdminReviewer(viewer) ? rows : rows.filter((row) => row.moment?.host_id === viewer.id);
  return attachMissionAttribution(scopedRows);
}

async function getProofSubmissionHistory(viewer = {}, limit = 50) {
  if (!supabase) throw new Error('Database not available');

  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(Number(limit), 1), 100) : 50;
  const { data, error } = await supabase
    .from('proof_submissions')
    .select(`
      *,
      moment:moments (
        id,
        title,
        reward,
        memory_rarity,
        venue_name,
        category,
        host_id
      )
    `)
    .neq('submission_state', 'pending')
    .order('reviewed_at', { ascending: false, nullsFirst: false })
    .limit(safeLimit);

  if (error) throw error;

  const scopedSubmissions = isAdminReviewer(viewer)
    ? (data || [])
    : (data || []).filter((row) => row.moment?.host_id === viewer.id);
  const submissions = scopedSubmissions;
  if (submissions.length === 0) return [];

  const memoryPairs = submissions.map((submission) => ({
    user_id: submission.user_id,
    moment_id: submission.moment_id,
    submission_id: submission.id,
  }));

  const userIds = [...new Set(memoryPairs.map((pair) => pair.user_id).filter(Boolean))];
  const momentIds = [...new Set(memoryPairs.map((pair) => pair.moment_id).filter(Boolean))];

  let memoryRows = [];
  let rewardRows = [];
  let payoutRows = [];
  let pieceRows = [];
  if (userIds.length > 0 && momentIds.length > 0) {
    const submissionIds = submissions.map((submission) => submission.id);
    const attendanceSourceIds = submissions.map((submission) => `${submission.moment_id}:${submission.user_id}`);

    const [
      { data: memories, error: memoryError },
      { data: rewards, error: rewardsError },
      { data: payouts, error: payoutsError },
      { data: pieces, error: piecesError },
    ] = await Promise.all([
      supabase
        .from('memories')
        .select('*')
        .in('user_id', userIds)
        .in('moment_id', momentIds)
        .order('issued_at', { ascending: false }),
      supabase
        .from('rewards')
        .select('id, user_id, moment_id, reward_type, reward_value, status, redemption_code, created_at')
        .in('user_id', userIds)
        .in('moment_id', momentIds)
        .order('created_at', { ascending: false }),
      supabase
        .from('moment_payout_queue')
        .select('id, proof_submission_id, amount_jmd, status, created_at, processed_at')
        .in('proof_submission_id', submissionIds)
        .order('created_at', { ascending: false }),
      supabase
        .from('piece_earning_events')
        .select('id, user_id, piece_type, asset_id, quantity, reason, source_type, source_id, created_at')
        .in('user_id', userIds)
        .order('created_at', { ascending: false })
        .limit(500),
    ]);

    if (memoryError) throw memoryError;
    if (rewardsError) throw rewardsError;
    if (payoutsError) throw payoutsError;
    if (piecesError) throw piecesError;
    memoryRows = memories || [];
    rewardRows = rewards || [];
    payoutRows = payouts || [];
    pieceRows = pieces || [];
  }

  const memoryMap = new Map();
  for (const memory of memoryRows) {
    const submissionId = memory?.metadata?.proof_submission_id || null;
    if (submissionId && !memoryMap.has(submissionId)) {
      memoryMap.set(submissionId, memory);
    }
  }

  const hydrated = submissions.map((submission) => ({
    ...submission,
    memory: memoryMap.get(submission.id) || null,
    reward: rewardRows.find((reward) => reward.user_id === submission.user_id && reward.moment_id === submission.moment_id) || null,
    payout: (() => {
      const queueItem = payoutRows.find((payout) => payout.proof_submission_id === submission.id) || null;
      return queueItem ? { queued: true, queue_item: queueItem } : null;
    })(),
    attendance_piece_awards: pieceRows.filter((piece) =>
      piece.source_id === `${submission.moment_id}:${submission.user_id}` &&
      ['moment_checkin', 'content_distribution_checkin', 'moment_referral_checkin'].includes(piece.source_type)
    ).map((event) => ({ event })),
    piece_award: (() => {
      const event = pieceRows.find((piece) => piece.source_id === submission.id && piece.source_type === 'content_proof_verified') || null;
      return event ? { event } : null;
    })(),
  }));

  return attachMissionAttribution(hydrated);
}

async function getProofSubmissionById(submissionId) {
  if (!supabase) throw new Error('Database not available');

  const { data, error } = await supabase
    .from('proof_submissions')
    .select(`
      *,
      moment:moments (
        id,
        title,
        host_id
      )
    `)
    .eq('id', submissionId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Proof submission not found');
  return data;
}

async function getProofSubmissionAudit(submissionId) {
  if (!supabase) throw new Error('Database not available');

  const submission = await getProofSubmissionById(submissionId);
  const sourceContentId = submission.proof_bundle?.source_content_id || submission.proof_bundle?.content_id || null;
  const attendanceSourceId = `${submission.moment_id}:${submission.user_id}`;

  const [
    eventsResult,
    rewardsResult,
    memoriesResult,
    piecesResult,
    payoutQueueResult,
    automationResult,
  ] = await Promise.all([
    supabase
      .from('participation_events')
      .select('id, event_type, evidence_url, metadata, created_at')
      .eq('moment_id', submission.moment_id)
      .eq('user_id', submission.user_id)
      .order('created_at', { ascending: true }),
    supabase
      .from('rewards')
      .select('id, reward_type, reward_value, status, redemption_code, created_at')
      .eq('moment_id', submission.moment_id)
      .eq('user_id', submission.user_id)
      .order('created_at', { ascending: true }),
    supabase
      .from('memories')
      .select('id, title, rarity, issued_at, metadata')
      .eq('moment_id', submission.moment_id)
      .eq('user_id', submission.user_id)
      .order('issued_at', { ascending: true }),
    supabase
      .from('piece_earning_events')
      .select('id, piece_type, asset_id, quantity, reason, source_type, source_id, metadata, created_at')
      .eq('user_id', submission.user_id)
      .or(`source_id.eq.${submission.id},source_id.eq.${attendanceSourceId}`)
      .order('created_at', { ascending: true }),
    supabase
      .from('moment_payout_queue')
      .select('id, amount_jmd, status, created_at, processed_at, proof_submission_id')
      .eq('proof_submission_id', submission.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('experience_automation_runs')
      .select('id,action,status,target_type,target_id,result,error_message,started_at,completed_at')
      .eq('trigger_id', submission.id)
      .order('created_at', { ascending: true })
      .catch(() => ({ data: [], error: null })),
  ]);

  if (eventsResult.error) throw eventsResult.error;
  if (rewardsResult.error) throw rewardsResult.error;
  if (memoriesResult.error) throw memoriesResult.error;
  if (piecesResult.error) throw piecesResult.error;
  if (payoutQueueResult.error) throw payoutQueueResult.error;
  if (automationResult.error) throw automationResult.error;

  const timeline = [];

  timeline.push({
    kind: 'proof_submission',
    at: submission.created_at,
    title: 'Proof submitted',
    detail: submission.proof_bundle?.proof_type
      ? `${submission.proof_bundle.proof_type} proof captured`
      : 'Proof bundle captured',
  });

  for (const event of eventsResult.data || []) {
    const metadataSubmissionId = event?.metadata?.proof_submission_id || null;
    if (metadataSubmissionId && metadataSubmissionId !== submission.id) continue;
    if (!metadataSubmissionId && !['verification_submitted', 'verification_approved'].includes(event.event_type)) continue;

    timeline.push({
      kind: 'participation_event',
      at: event.created_at,
      title: event.event_type === 'verification_approved' ? 'Attendance verified' : 'Attendance captured',
      detail: event.event_type === 'verification_approved'
        ? 'Reward issuance is now eligible'
        : 'Submission is waiting for host or admin review',
    });
  }

  if (submission.reviewed_at) {
    timeline.push({
      kind: submission.submission_state === 'verified' ? 'proof_verified' : 'proof_rejected',
      at: submission.reviewed_at,
      title: submission.submission_state === 'verified' ? 'Proof approved' : 'Proof rejected',
      detail: submission.review_reason || null,
    });
  }

  for (const reward of rewardsResult.data || []) {
    timeline.push({
      kind: 'reward',
      at: reward.created_at,
      title: 'Reward issued',
      detail: `${reward.reward_value || reward.reward_type} • ${reward.status}`,
    });
  }

  for (const memory of memoriesResult.data || []) {
    const metadataSubmissionId = memory?.metadata?.proof_submission_id || null;
    if (metadataSubmissionId && metadataSubmissionId !== submission.id) continue;

    timeline.push({
      kind: 'memory',
      at: memory.issued_at || submission.reviewed_at || submission.created_at,
      title: 'Memory issued',
      detail: `${memory.title}${memory.rarity ? ` • ${memory.rarity}` : ''}`,
    });
  }

  for (const pieceEvent of piecesResult.data || []) {
    if (pieceEvent.source_id === attendanceSourceId && !['moment_checkin', 'content_distribution_checkin', 'moment_referral_checkin'].includes(pieceEvent.source_type)) {
      continue;
    }
    if (pieceEvent.source_id === submission.id && pieceEvent.source_type !== 'content_proof_verified') {
      continue;
    }
    if (sourceContentId && pieceEvent.piece_type === 'content' && pieceEvent.asset_id !== sourceContentId) {
      continue;
    }

    timeline.push({
      kind: 'piece_award',
      at: pieceEvent.created_at,
      title: 'Piece award recorded',
      detail: `${pieceEvent.quantity} ${pieceEvent.piece_type} piece(s) • ${pieceEvent.reason}`,
    });
  }

  for (const payout of payoutQueueResult.data || []) {
    timeline.push({
      kind: 'payout',
      at: payout.processed_at || payout.created_at,
      title: payout.status === 'completed' ? 'Payout completed' : 'Payout queued',
      detail: `JMD ${Number(payout.amount_jmd || 0).toLocaleString()} • ${payout.status}`,
    });
  }

  for (const automation of automationResult.data || []) {
    timeline.push({
      kind: 'experience_automation',
      at: automation.completed_at || automation.started_at,
      title: automation.status === 'completed' ? 'Experience reward unlocked' : 'Experience automation needs attention',
      detail: automation.status === 'completed'
        ? `${automation.target_type || 'reward'} • ${automation.action}`
        : automation.error_message || `${automation.action} • ${automation.status}`,
    });
  }

  timeline.sort((a, b) => new Date(a.at || 0).getTime() - new Date(b.at || 0).getTime());

  return {
    submission,
    reward_count: (rewardsResult.data || []).length,
    memory_count: (memoriesResult.data || []).length,
    payout_count: (payoutQueueResult.data || []).length,
    timeline,
  };
}

async function submitProofSubmission({ momentId, userId, proofBundle, momentMoveId = null }) {
  if (!supabase) throw new Error('Database not available');

  const normalizedBundle = proofBundle || {};
  const uniqueKey = await momentEconomyService.validateUniqueProof({
    momentId,
    userId,
    moveId: momentMoveId,
    proofBundle: normalizedBundle,
  });

  const { data, error } = await supabase
    .from('proof_submissions')
    .insert({
      moment_id: momentId,
      user_id: userId,
      moment_move_id: momentMoveId,
      proof_bundle: uniqueKey ? { ...normalizedBundle, unique_key: uniqueKey } : normalizedBundle,
      submission_state: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  let momentRow = {};
  try {
    const { data: moment } = await supabase
      .from('moments')
      .select('id, city, country, country_code, location, proof_type')
      .eq('id', momentId)
      .maybeSingle();
    momentRow = moment || {};
  } catch (momentError) {
    console.warn('[Proof Service] moment geo lookup skipped:', momentError.message);
  }
  const proofKind = String(normalizedBundle?.proof_type || momentRow.proof_type || '').toLowerCase();
  const geoProps = geoProperties(momentRow, {
    moment_move_id: momentMoveId || null,
    proof_type: normalizedBundle?.proof_type || momentRow.proof_type || null,
  });
  try {
    await growthOperatingService.recordEvent({
      eventName: 'proof_submitted', journey: 'participant', stage: 'outcome',
      userId, momentId, entityType: 'proof_submission', entityId: data.id,
      source: normalizedBundle?.utm_source || (normalizedBundle?.promopush_tracking_code ? 'promopush' : 'product'),
      medium: normalizedBundle?.utm_medium || (normalizedBundle?.promopush_tracking_code ? 'attributed_link' : 'organic'),
      campaign: normalizedBundle?.utm_campaign || null,
      referralCode: normalizedBundle?.referral_code || null,
      promoPushCampaignId: normalizedBundle?.promopush_campaign_id || null,
      promoPushChannelId: normalizedBundle?.promopush_channel_id || null,
      idempotencyKey: `growth:proof-submitted:${data.id}`,
      properties: geoProps,
    });
  } catch (growthError) {
    console.warn('[Proof Service] growth proof submission mirror skipped:', growthError.message);
  }
  if (proofKind === 'share' || proofKind === 'screenshot' || proofKind === 'link') {
    try {
      await growthOperatingService.recordEvent({
        eventName: 'share_completed', journey: 'shared', stage: 'amplified',
        userId, momentId, entityType: 'proof_submission', entityId: data.id,
        source: 'product',
        medium: proofKind,
        idempotencyKey: `growth:share-completed:${data.id}`,
        properties: geoProps,
      });
    } catch (growthError) {
      console.warn('[Proof Service] growth share_completed skipped:', growthError.message);
    }
  }
  return data;
}

async function ensureMomentReward(momentId, userId) {
  if (!supabase) throw new Error('Database not available');

  const { data: moment, error: momentError } = await supabase
    .from('moments')
    .select('id, reward')
    .eq('id', momentId)
    .maybeSingle();

  if (momentError) throw momentError;
  if (!moment?.reward) return null;

  const { data: existing, error: existingError } = await supabase
    .from('rewards')
    .select('id')
    .eq('user_id', userId)
    .eq('moment_id', moment.id)
    .eq('status', 'earned')
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing;

  const { data, error } = await supabase
    .from('rewards')
    .insert({
      user_id: userId,
      moment_id: moment.id,
      reward_type: 'freebie',
      reward_value: moment.reward,
      status: 'earned',
      redemption_code: `RWD-${Date.now().toString(36).toUpperCase()}`,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function finalizeVerifiedAttendance({ momentId, userId, proofSubmissionId, reviewerId, proofBundle = {} }) {
  if (!supabase) throw new Error('Database not available');

  await supabase
    .from('moment_participants')
    .update({
      status: 'checked_in',
      checked_in_at: new Date().toISOString(),
    })
    .eq('moment_id', momentId)
    .eq('user_id', userId);

  try {
    await supabase.from('participation_events').insert({
      moment_id: momentId,
      user_id: userId,
      event_type: 'verification_approved',
      metadata: {
        proof_submission_id: proofSubmissionId,
        reviewer_id: reviewerId,
        verification_status: 'verified',
        verified_at: new Date().toISOString(),
      },
    });
  } catch (eventError) {
    console.warn('[Proof Service] approval participation event skipped:', eventError.message);
  }

  const reward = await ensureMomentReward(momentId, userId);
  await promoPushTrackingService.trackPromoPushEvent({
    eventType: 'proof_verified',
    momentId,
    userId,
    proofSubmissionId,
    rewardId: reward?.id || null,
    metadata: {
      ...proofBundle,
      reviewer_id: reviewerId,
    },
  });

  let momentRow = {};
  try {
    const { data: moment } = await supabase
      .from('moments')
      .select('id, city, country, country_code, location, proof_type')
      .eq('id', momentId)
      .maybeSingle();
    momentRow = moment || {};
  } catch (momentError) {
    console.warn('[Proof Service] moment geo lookup skipped:', momentError.message);
  }
  const geoProps = geoProperties(momentRow, {
    reviewer_id: reviewerId,
    reward_id: reward?.id || null,
    proof_type: proofBundle?.proof_type || momentRow.proof_type || null,
  });
  try {
    await growthOperatingService.recordEvent({
      eventName: 'verified_outcome', journey: 'participant', stage: 'outcome',
      userId, momentId, entityType: 'proof_submission', entityId: proofSubmissionId,
      source: proofBundle?.utm_source || (proofBundle?.promopush_tracking_code ? 'promopush' : 'product'),
      medium: proofBundle?.utm_medium || (proofBundle?.promopush_tracking_code ? 'attributed_link' : 'organic'),
      campaign: proofBundle?.utm_campaign || null,
      referralCode: proofBundle?.referral_code || null,
      promoPushCampaignId: proofBundle?.promopush_campaign_id || null,
      promoPushChannelId: proofBundle?.promopush_channel_id || null,
      idempotencyKey: `growth:verified-proof:${proofSubmissionId}`,
      properties: geoProps,
    });
  } catch (growthError) {
    console.warn('[Proof Service] growth outcome mirror skipped:', growthError.message);
  }
  try {
    await growthOperatingService.recordEvent({
      eventName: 'proof_approved', journey: 'participant', stage: 'outcome',
      userId, momentId, entityType: 'proof_submission', entityId: proofSubmissionId,
      source: proofBundle?.utm_source || (proofBundle?.promopush_tracking_code ? 'promopush' : 'product'),
      medium: proofBundle?.utm_medium || (proofBundle?.promopush_tracking_code ? 'attributed_link' : 'organic'),
      campaign: proofBundle?.utm_campaign || null,
      referralCode: proofBundle?.referral_code || null,
      promoPushCampaignId: proofBundle?.promopush_campaign_id || null,
      promoPushChannelId: proofBundle?.promopush_channel_id || null,
      idempotencyKey: `growth:proof-approved:${proofSubmissionId}`,
      properties: geoProps,
    });
  } catch (growthError) {
    console.warn('[Proof Service] growth proof_approved skipped:', growthError.message);
  }

  if (reward?.id) {
    await promoPushTrackingService.trackPromoPushEvent({
      eventType: 'reward_issued',
      momentId,
      userId,
      proofSubmissionId,
      rewardId: reward.id,
      metadata: {
        ...proofBundle,
        reviewer_id: reviewerId,
      },
    });
  }

  let pieceAwards = [];
  try {
    pieceAwards = await pieceEarningService.awardMomentCheckIn({
      momentId,
      userId,
      invitedByUserId: proofBundle?.invited_by_user_id || proofBundle?.referrer_id || null,
      sourceContentId: proofBundle?.source_content_id || null,
      metadata: {
        ...proofBundle,
        proof_submission_id: proofSubmissionId,
        reviewer_id: reviewerId,
      },
    });
  } catch (earningError) {
    console.warn('[Proof Service] verified attendance piece award skipped:', earningError.message);
  }

  return { reward, piece_awards: pieceAwards };
}

async function reviewProofSubmission({ submissionId, reviewerId, action, reviewReason }) {
  if (!supabase) throw new Error('Database not available');

  const nextState = action === 'approve' ? 'verified' : 'rejected';

  const { data, error } = await supabase
    .from('proof_submissions')
    .update({
      submission_state: nextState,
      review_reason: reviewReason || null,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', submissionId)
    .select()
    .single();

  if (error) throw error;

  let memory = null;
  let payout = null;
  let pieceAward = null;
  let reward = null;
  let attendancePieceAwards = [];
  let experienceAutomations = [];
  let linkedMissionId = data.proof_bundle?.source_mission_id || data.proof_bundle?.mission_id || null;
  if (nextState === 'verified') {
    const finalizedAttendance = await finalizeVerifiedAttendance({
      momentId: data.moment_id,
      userId: data.user_id,
      proofSubmissionId: data.id,
      reviewerId,
      proofBundle: data.proof_bundle || {},
    });
    reward = finalizedAttendance.reward;
    attendancePieceAwards = finalizedAttendance.piece_awards || [];

    memory = await memoryService.issueMemoryForMoment({
      userId: data.user_id,
      momentId: data.moment_id,
      proofSubmissionId: data.id,
      reviewerId,
    });

    payout = await momentEconomyService.executePayoutForProof(data.id, reviewerId);

    const sourceContentId = data.proof_bundle?.source_content_id || data.proof_bundle?.content_id || null;
    if (sourceContentId) {
      try {
        pieceAward = await pieceEarningService.awardContentProofVerified({
          contentId: sourceContentId,
          userId: data.user_id,
          proofSubmissionId: data.id,
          metadata: {
            moment_id: data.moment_id,
            reviewer_id: reviewerId,
          },
        });
      } catch (earningError) {
        console.warn('[ProofService] content proof piece award skipped:', earningError.message);
      }
    }
  }

  // Keep the first-class mission state and its explicit reward in step with the
  // existing proof review. Mission reward failures must not invalidate proof.
  try {
    const { data: participation } = await supabase
      .from('mission_participations')
      .select('id,mission_id,user_id,status,mission:content_missions(*)')
      .eq('proof_submission_id', data.id)
      .maybeSingle();

    if (participation) {
      linkedMissionId = participation.mission_id || linkedMissionId;
      const verified = nextState === 'verified';
      await supabase
        .from('mission_participations')
        .update({
          status: verified ? 'verified' : 'rejected',
          verified_at: verified ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', participation.id);

      const mission = participation.mission;
      if (verified && mission?.reward_type === 'pioneer_points' && mission.reward_points) {
        await supabase.rpc('record_pioneer_points', {
          p_beneficiary_type: 'user',
          p_beneficiary_id: participation.user_id,
          p_contributor_type: 'creator',
          p_event_type: 'content_mission',
          p_source_type: 'mission_participations',
          p_source_id: participation.id,
          p_idempotency_key: `content-mission:${participation.id}`,
          p_metadata: { mission_id: mission.id, moment_id: mission.moment_id },
        });
      }

      if (verified) {
        await supabase
          .from('mission_participations')
          .update({ status: 'rewarded', rewarded_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq('id', participation.id);
      }
    }
  } catch (missionError) {
    console.warn('[ProofService] mission completion sync skipped:', missionError.message);
  }

  if (nextState === 'verified') {
    try {
      experienceAutomations = await experienceAutomationService.processVerifiedProof({
        proof: data,
        missionId: linkedMissionId,
        campaignId: data.proof_bundle?.campaign_id || null,
      });
    } catch (automationError) {
      console.warn('[ProofService] experience automation skipped:', automationError.message);
    }
  }

  return {
    submission: data,
    reward,
    memory,
    payout,
    attendance_piece_awards: attendancePieceAwards,
    piece_award: pieceAward,
    experience_automations: experienceAutomations,
  };
}

module.exports = {
  isAdminReviewer,
  getProofRequirements,
  getPendingProofSubmissions,
  getProofSubmissionHistory,
  getProofSubmissionById,
  getProofSubmissionAudit,
  submitProofSubmission,
  reviewProofSubmission,
};
