const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;
const memoryService = require('./memoryService');

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
  if (userIds.length > 0 && momentIds.length > 0) {
    const { data: memories, error: memoryError } = await supabase
      .from('memories')
      .select('*')
      .in('user_id', userIds)
      .in('moment_id', momentIds)
      .order('issued_at', { ascending: false });

    if (memoryError) throw memoryError;
    memoryRows = memories || [];
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

async function submitProofSubmission({ momentId, userId, proofBundle }) {
  if (!supabase) throw new Error('Database not available');

  const { data, error } = await supabase
    .from('proof_submissions')
    .insert({
      moment_id: momentId,
      user_id: userId,
      proof_bundle: proofBundle || {},
      submission_state: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
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
  if (nextState === 'verified') {
    memory = await memoryService.issueMemoryForMoment({
      userId: data.user_id,
      momentId: data.moment_id,
      proofSubmissionId: data.id,
      reviewerId,
    });
  }

  return {
    submission: data,
    memory,
  };
}

module.exports = {
  isAdminReviewer,
  getProofRequirements,
  getPendingProofSubmissions,
  getProofSubmissionHistory,
  getProofSubmissionById,
  submitProofSubmission,
  reviewProofSubmission,
};
