/**
 * Piece Governance Service
 * Handles voting and governance for piece holders
 */

const { supabase: serviceSupabase } = require('../lib/supabase');

const supabase = global.supabase || serviceSupabase || null;

// =====================================================
// PROPOSAL MANAGEMENT
// =====================================================

/**
 * Create a governance proposal
 */
async function createProposal({
  pieceType,
  assetId,
  proposerId,
  proposalType,
  title,
  description,
  executionThreshold = 50, // 50% approval required
  minParticipation = 10,   // 10% of holders must vote
  votingDurationDays = 7,
}) {
  if (!supabase) throw new Error('Database not available');
  
  // 1. Verify proposer holds pieces
  const proposerPieces = await getHolderPieceCount(pieceType, assetId, proposerId);
  if (proposerPieces < 1) {
    throw new Error('Must hold at least 1 piece to create proposal');
  }
  
  // 2. Calculate voting period
  const votingStartsAt = new Date();
  const votingEndsAt = new Date(votingStartsAt);
  votingEndsAt.setDate(votingEndsAt.getDate() + votingDurationDays);
  
  // 3. Create proposal
  const { data: proposal, error } = await supabase
    .from('piece_governance_proposals')
    .insert({
      piece_type: pieceType,
      asset_id: assetId,
      proposal_type: proposalType,
      title,
      description,
      proposed_by: proposerId,
      voting_starts_at: votingStartsAt.toISOString(),
      voting_ends_at: votingEndsAt.toISOString(),
      execution_threshold_percent: executionThreshold,
      min_participation_percent: minParticipation,
      status: 'active',
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    success: true,
    proposal,
  };
}

/**
 * Cast a vote on a proposal
 */
async function castVote({
  proposalId,
  voterId,
  vote, // 'for', 'against', 'abstain'
  voteReason = null,
}) {
  if (!supabase) throw new Error('Database not available');
  
  // 1. Get proposal
  const { data: proposal, error: propError } = await supabase
    .from('piece_governance_proposals')
    .select('*')
    .eq('id', proposalId)
    .single();
  
  if (propError) throw propError;
  
  // 2. Verify voting is open
  const now = new Date();
  if (proposal.status !== 'active') {
    throw new Error('Voting is not active on this proposal');
  }
  if (now < new Date(proposal.voting_starts_at)) {
    throw new Error('Voting has not started yet');
  }
  if (now > new Date(proposal.voting_ends_at)) {
    throw new Error('Voting has ended');
  }
  
  // 3. Get voter's piece count
  const votingPower = await getHolderPieceCount(
    proposal.piece_type,
    proposal.asset_id,
    voterId
  );
  
  if (votingPower <= 0) {
    throw new Error('Must hold pieces to vote');
  }
  
  // 4. Record or update vote
  const { data: existingVote, error: checkError } = await supabase
    .from('piece_governance_votes')
    .select('id')
    .eq('proposal_id', proposalId)
    .eq('voter_id', voterId)
    .maybeSingle();
  
  if (checkError) throw checkError;
  
  let voteRecord;
  
  if (existingVote) {
    // Update vote
    const { data, error } = await supabase
      .from('piece_governance_votes')
      .update({
        vote,
        voting_power: votingPower,
        pieces_held_at_vote: votingPower,
        vote_reason: voteReason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingVote.id)
      .select()
      .single();
    
    if (error) throw error;
    voteRecord = data;
  } else {
    // Create new vote
    const { data, error } = await supabase
      .from('piece_governance_votes')
      .insert({
        proposal_id: proposalId,
        voter_id: voterId,
        vote,
        voting_power: votingPower,
        pieces_held_at_vote: votingPower,
        vote_reason: voteReason,
      })
      .select()
      .single();
    
    if (error) throw error;
    voteRecord = data;
  }
  
  // 5. Update proposal vote counts
  await updateProposalVoteCounts(proposalId);
  
  return {
    success: true,
    vote: voteRecord,
    votingPower,
  };
}

/**
 * Update proposal vote counts
 */
async function updateProposalVoteCounts(proposalId) {
  // Get all votes
  const { data: votes, error } = await supabase
    .from('piece_governance_votes')
    .select('vote, voting_power')
    .eq('proposal_id', proposalId);
  
  if (error) throw error;
  
  const forVotes = votes.filter(v => v.vote === 'for').reduce((sum, v) => sum + parseFloat(v.voting_power), 0);
  const againstVotes = votes.filter(v => v.vote === 'against').reduce((sum, v) => sum + parseFloat(v.voting_power), 0);
  const abstainVotes = votes.filter(v => v.vote === 'abstain').reduce((sum, v) => sum + parseFloat(v.voting_power), 0);
  const totalVotingPower = forVotes + againstVotes + abstainVotes;
  
  // Get total supply for participation calculation
  const { data: proposal } = await supabase
    .from('piece_governance_proposals')
    .select('piece_type, asset_id')
    .eq('id', proposalId)
    .single();
  
  const totalSupply = await getTotalSupply(proposal.piece_type, proposal.asset_id);
  const participationPercent = totalSupply > 0 ? (totalVotingPower / totalSupply) * 100 : 0;
  
  // Update proposal
  await supabase
    .from('piece_governance_proposals')
    .update({
      result_for_votes: Math.floor(forVotes),
      result_against_votes: Math.floor(againstVotes),
      result_abstain_votes: Math.floor(abstainVotes),
      result_total_voting_power: totalVotingPower,
    })
    .eq('id', proposalId);
}

/**
 * Finalize a proposal after voting ends
 */
async function finalizeProposal(proposalId) {
  if (!supabase) throw new Error('Database not available');
  
  // 1. Get proposal
  const { data: proposal, error: propError } = await supabase
    .from('piece_governance_proposals')
    .select('*')
    .eq('id', proposalId)
    .single();
  
  if (propError) throw propError;
  
  if (proposal.status !== 'active') {
    throw new Error('Proposal is not in active voting state');
  }
  
  // 2. Check if voting period ended
  const now = new Date();
  if (now < new Date(proposal.voting_ends_at)) {
    throw new Error('Voting period has not ended yet');
  }
  
  // 3. Get total supply
  const totalSupply = await getTotalSupply(proposal.piece_type, proposal.asset_id);
  const participationPercent = totalSupply > 0 
    ? (proposal.result_total_voting_power / totalSupply) * 100 
    : 0;
  
  // 4. Determine result
  const forPercent = proposal.result_total_voting_power > 0
    ? (proposal.result_for_votes / proposal.result_total_voting_power) * 100
    : 0;
  
  let newStatus;
  if (participationPercent < proposal.min_participation_percent) {
    newStatus = 'failed'; // Quorum not reached
  } else if (forPercent >= proposal.execution_threshold_percent) {
    newStatus = 'passed';
  } else {
    newStatus = 'failed';
  }
  
  // 5. Update proposal status
  const { data: updated, error } = await supabase
    .from('piece_governance_proposals')
    .update({
      status: newStatus,
    })
    .eq('id', proposalId)
    .select()
    .single();
  
  if (error) throw error;
  
  // 6. If passed, queue for execution (would integrate with execution service)
  if (newStatus === 'passed') {
    await queueProposalExecution(proposal);
  }
  
  return {
    success: true,
    proposal: updated,
    result: newStatus,
    forPercent: forPercent.toFixed(2),
    participationPercent: participationPercent.toFixed(2),
  };
}

/**
 * Queue proposal for execution
 */
async function queueProposalExecution(proposal) {
  // In production, this would:
  // 1. Create execution task
  // 2. Send notifications to admins
  // 3. Log the decision
  
  console.log(`[PieceGovernance] Proposal ${proposal.id} passed and queued for execution`);
  
  return { queued: true };
}

/**
 * Execute a passed proposal (admin only)
 */
async function executeProposal(proposalId, adminId) {
  if (!supabase) throw new Error('Database not available');
  
  // 1. Verify admin
  const { data: admin, error: adminError } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', adminId)
    .eq('role', 'admin')
    .single();
  
  if (adminError || !admin) {
    throw new Error('Admin privileges required');
  }
  
  // 2. Get proposal
  const { data: proposal, error: propError } = await supabase
    .from('piece_governance_proposals')
    .select('*')
    .eq('id', proposalId)
    .eq('status', 'passed')
    .single();
  
  if (propError) throw propError;
  
  // 3. Execute based on proposal type
  let executionResult;
  
  switch (proposal.proposal_type) {
    case 'content_update':
      executionResult = await executeContentUpdate(proposal);
      break;
    case 'moment_scheduling':
      executionResult = await executeMomentScheduling(proposal);
      break;
    case 'fee_adjustment':
      executionResult = await executeFeeAdjustment(proposal);
      break;
    case 'revenue_allocation':
      executionResult = await executeRevenueAllocation(proposal);
      break;
    default:
      executionResult = { success: true, message: 'Proposal type requires manual execution' };
  }
  
  // 4. Mark as executed
  const { error: updateError } = await supabase
    .from('piece_governance_proposals')
    .update({
      status: 'executed',
      executed_at: new Date().toISOString(),
    })
    .eq('id', proposalId);
  
  if (updateError) throw updateError;
  
  return {
    success: true,
    executionResult,
  };
}

// =====================================================
// EXECUTION HANDLERS
// =====================================================

async function executeContentUpdate(proposal) {
  // Apply content changes based on proposal
  return { type: 'content_update', executed: true };
}

async function executeMomentScheduling(proposal) {
  // Schedule or modify moment
  return { type: 'moment_scheduling', executed: true };
}

async function executeFeeAdjustment(proposal) {
  // Adjust trading fees
  return { type: 'fee_adjustment', executed: true };
}

async function executeRevenueAllocation(proposal) {
  // Adjust revenue distribution ratios
  return { type: 'revenue_allocation', executed: true };
}

// =====================================================
// QUERIES
// =====================================================

/**
 * Get active proposals for a piece
 */
async function getActiveProposals(pieceType, assetId) {
  if (!supabase) return [];
  
  const now = new Date().toISOString();
  
  const { data: proposals, error } = await supabase
    .from('piece_governance_proposals')
    .select(`
      *,
      proposer:proposed_by(id, username, display_name),
      votes:piece_governance_votes(count)
    `)
    .eq('piece_type', pieceType)
    .eq('asset_id', assetId)
    .eq('status', 'active')
    .lte('voting_starts_at', now)
    .gte('voting_ends_at', now)
    .order('voting_ends_at', { ascending: true });
  
  if (error) throw error;
  
  return proposals || [];
}

/**
 * Get proposal details with votes
 */
async function getProposalDetails(proposalId) {
  if (!supabase) return null;
  
  const { data: proposal, error: propError } = await supabase
    .from('piece_governance_proposals')
    .select(`
      *,
      proposer:proposed_by(id, username, display_name, avatar_url),
      votes:piece_governance_votes(
        id,
        voter:voter_id(id, username, display_name),
        vote,
        voting_power,
        vote_reason,
        created_at
      )
    `)
    .eq('id', proposalId)
    .single();
  
  if (propError) throw propError;
  
  // Calculate stats
  const totalVotes = proposal.votes?.length || 0;
  const forVotes = proposal.votes?.filter(v => v.vote === 'for') || [];
  const againstVotes = proposal.votes?.filter(v => v.vote === 'against') || [];
  const abstainVotes = proposal.votes?.filter(v => v.vote === 'abstain') || [];
  
  return {
    ...proposal,
    stats: {
      totalVotes,
      forVotes: forVotes.length,
      againstVotes: againstVotes.length,
      abstainVotes: abstainVotes.length,
      forVotingPower: forVotes.reduce((sum, v) => sum + parseFloat(v.voting_power), 0),
      againstVotingPower: againstVotes.reduce((sum, v) => sum + parseFloat(v.voting_power), 0),
      abstainVotingPower: abstainVotes.reduce((sum, v) => sum + parseFloat(v.voting_power), 0),
    },
  };
}

/**
 * Get user's votes across all proposals
 */
async function getUserVotes(userId, status = 'active') {
  if (!supabase) return [];
  
  const { data: votes, error } = await supabase
    .from('piece_governance_votes')
    .select(`
      *,
      proposal:proposal_id(
        piece_type,
        asset_id,
        title,
        proposal_type,
        status,
        voting_ends_at
      )
    `)
    .eq('voter_id', userId)
    .eq('proposal.status', status)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return votes || [];
}

/**
 * Get governance participation stats
 */
async function getGovernanceStats(pieceType, assetId) {
  if (!supabase) return null;
  
  const { data: proposals, error } = await supabase
    .from('piece_governance_proposals')
    .select('status, result_total_voting_power')
    .eq('piece_type', pieceType)
    .eq('asset_id', assetId);
  
  if (error) throw error;
  
  const totalProposals = proposals?.length || 0;
  const passed = proposals?.filter(p => p.status === 'passed').length || 0;
  const failed = proposals?.filter(p => p.status === 'failed').length || 0;
  const executed = proposals?.filter(p => p.status === 'executed').length || 0;
  
  const totalVotingPower = proposals?.reduce((sum, p) => sum + (parseFloat(p.result_total_voting_power) || 0), 0) || 0;
  
  return {
    totalProposals,
    passed,
    failed,
    executed,
    passRate: totalProposals > 0 ? ((passed / totalProposals) * 100).toFixed(2) : 0,
    totalVotingPowerParticipated: totalVotingPower,
  };
}

// =====================================================
// AUTOMATION
// =====================================================

/**
 * Finalize all proposals that have ended voting
 * Should be called by cron job
 */
async function autoFinalizeProposals() {
  if (!supabase) return { finalized: 0 };
  
  const now = new Date().toISOString();
  
  // Get proposals that ended voting but not finalized
  const { data: proposals, error } = await supabase
    .from('piece_governance_proposals')
    .select('id')
    .eq('status', 'active')
    .lt('voting_ends_at', now);
  
  if (error) throw error;
  
  const results = [];
  
  for (const proposal of proposals || []) {
    try {
      const result = await finalizeProposal(proposal.id);
      results.push({ proposalId: proposal.id, ...result });
    } catch (err) {
      console.error(`[PieceGovernance] Failed to finalize ${proposal.id}:`, err);
      results.push({ proposalId: proposal.id, success: false, error: err.message });
    }
  }
  
  return {
    finalized: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results,
  };
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

async function getHolderPieceCount(pieceType, assetId, holderId) {
  const config = {
    content: { table: 'content_piece_positions', idCol: 'content_id' },
    moment: { table: 'moment_piece_positions', idCol: 'moment_id' },
    host: { table: 'host_piece_positions', idCol: 'host_id' },
    venue: { table: 'venue_piece_positions', idCol: 'venue_id' },
  }[pieceType];
  
  if (!config) return 0;
  
  const { data, error } = await supabase
    .from(config.table)
    .select('pieces_owned')
    .eq(config.idCol, assetId)
    .eq('holder_id', holderId)
    .single();
  
  if (error) return 0;
  return data?.pieces_owned || 0;
}

async function getTotalSupply(pieceType, assetId) {
  const config = {
    content: { table: 'content_piece_stats', idCol: 'content_id', totalCol: 'total_pieces' },
    moment: { table: 'moment_piece_stats', idCol: 'moment_id', totalCol: 'total_pieces' },
    host: { table: 'host_piece_stats', idCol: 'host_id', totalCol: 'total_pieces' },
    venue: { table: 'venue_piece_stats', idCol: 'venue_id', totalCol: 'total_pieces' },
  }[pieceType];
  
  if (!config) return 0;
  
  const { data, error } = await supabase
    .from(config.table)
    .select(config.totalCol)
    .eq(config.idCol, assetId)
    .single();
  
  if (error) return 0;
  return data?.[config.totalCol] || 0;
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createProposal,
  castVote,
  finalizeProposal,
  executeProposal,
  getActiveProposals,
  getProposalDetails,
  getUserVotes,
  getGovernanceStats,
  autoFinalizeProposals,
};
