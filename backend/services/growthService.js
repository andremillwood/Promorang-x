const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'your-supabase-service-key';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get all active staking channels
 * @returns {Promise<Array>} List of staking channels
 */
const getStakingChannels = async () => {
  const { data, error } = await supabase
    .from('staking_channels')
    .select('*')
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching staking channels:', error);
    throw new Error('Failed to fetch staking channels');
  }

  return data || [];
};

/**
 * Get user's staking positions
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of user's staking positions
 */
const getUserStakingPositions = async (userId) => {
  const { data, error } = await supabase
    .from('staking_positions')
    .select(`
      *,
      staking_channels:channel_id (id, name, base_apr, lock_period_days)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching staking positions:', error);
    throw new Error('Failed to fetch staking positions');
  }

  return data || [];
};

/**
 * Create a new staking position
 * @param {string} userId - User ID
 * @param {string} channelId - Staking channel ID
 * @param {number} amount - Amount to stake
 * @returns {Promise<Object>} Created staking position
 */
const createStakingPosition = async (userId, channelId, amount) => {
  // Start a transaction
  const { data: channel, error: channelError } = await supabase
    .from('staking_channels')
    .select('*')
    .eq('id', channelId)
    .eq('status', 'active')
    .single();

  if (channelError || !channel) {
    throw new Error('Invalid or inactive staking channel');
  }

  if (amount < channel.min_stake || (channel.max_stake && amount > channel.max_stake)) {
    throw new Error(`Amount must be between ${channel.min_stake} and ${channel.max_stake || 'unlimited'}`);
  }

  // Check user's balance (simplified - in reality, you'd check their wallet)
  const { data: user } = await supabase
    .from('users')
    .select('gems_balance')
    .eq('id', userId)
    .single();

  if (!user || user.gems_balance < amount) {
    throw new Error('Insufficient balance');
  }

  // Create staking position
  const lockUntil = channel.lock_period_days > 0
    ? new Date(Date.now() + channel.lock_period_days * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const { data: position, error: positionError } = await supabase
    .from('staking_positions')
    .insert({
      user_id: userId,
      channel_id: channelId,
      amount,
      multiplier: 1.0, // Could be calculated based on lock period or other factors
      lock_until: lockUntil,
      status: 'active',
    })
    .select()
    .single();

  if (positionError) {
    console.error('Error creating staking position:', positionError);
    throw new Error('Failed to create staking position');
  }

  // Record the transaction in the ledger
  const { error: ledgerError } = await supabase
    .from('growth_ledger')
    .insert({
      user_id: userId,
      source_type: 'staking',
      source_id: position.id,
      amount: -amount, // Negative because it's an outflow
      currency: 'gems',
      status: 'completed',
      metadata: { position_id: position.id },
    });

  if (ledgerError) {
    console.error('Error recording staking transaction:', ledgerError);
    // In a real app, you might want to rollback the position creation
  }

  // Update user's gem balance
  const { error: updateError } = await supabase.rpc('decrement_gems', {
    user_id: userId,
    amount,
  });

  if (updateError) {
    console.error('Error updating user balance:', updateError);
    // In a real app, you might want to handle this error appropriately
  }

  return position;
};

/**
 * Claim staking rewards
 * @param {string} userId - User ID
 * @param {string} positionId - Staking position ID
 * @returns {Promise<Object>} Result with rewards claimed
 */
const claimStakingRewards = async (userId, positionId) => {
  // In a real implementation, this would calculate and distribute rewards
  // For now, we'll mark it as claimed and return a success response
  
  const { data: position, error: positionError } = await supabase
    .from('staking_positions')
    .select('*')
    .eq('id', positionId)
    .eq('user_id', userId)
    .single();

  if (positionError || !position) {
    throw new Error('Position not found or access denied');
  }

  if (position.status !== 'active' && position.status !== 'withdrawable') {
    throw new Error('Position is not eligible for rewards');
  }

  // Calculate rewards (simplified - in reality, this would be more complex)
  const rewards = position.amount * 0.01; // 1% for demo purposes

  // Update position
  const { data: updatedPosition, error: updateError } = await supabase
    .from('staking_positions')
    .update({
      earned_so_far: position.earned_so_far + rewards,
      last_claimed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', positionId)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating staking position:', updateError);
    throw new Error('Failed to claim rewards');
  }

  // Record the reward in the ledger
  const { error: ledgerError } = await supabase
    .from('growth_ledger')
    .insert({
      user_id: userId,
      source_type: 'staking_claim',
      source_id: positionId,
      amount: rewards,
      currency: 'gems',
      status: 'completed',
      metadata: { position_id: positionId },
    });

  if (ledgerError) {
    console.error('Error recording reward transaction:', ledgerError);
    // In a real app, you might want to handle this error appropriately
  }

  // Update user's gem balance
  const { error: balanceError } = await supabase.rpc('increment_gems', {
    user_id: userId,
    amount: rewards,
  });

  if (balanceError) {
    console.error('Error updating user balance:', balanceError);
    // In a real app, you might want to handle this error appropriately
  }

  return {
    success: true,
    rewards,
    position: updatedPosition,
  };
};

/**
 * Get funding projects
 * @param {Object} options - Query options
 * @param {number} [options.limit=10] - Number of projects to return
 * @param {number} [options.offset=0] - Offset for pagination
 * @param {string} [options.status='active'] - Project status filter
 * @returns {Promise<Object>} Paginated list of funding projects
 */
const getFundingProjects = async ({ limit = 10, offset = 0, status = 'active' } = {}) => {
  const query = supabase
    .from('funding_projects')
    .select('*', { count: 'exact' })
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching funding projects:', error);
    throw new Error('Failed to fetch funding projects');
  }

  return {
    projects: data || [],
    total: count || 0,
    limit,
    offset,
  };
};

/**
 * Create a funding project
 * @param {string} creatorId - Creator's user ID
 * @param {Object} projectData - Project data
 * @returns {Promise<Object>} Created project
 */
const createFundingProject = async (creatorId, projectData) => {
  const { title, description, target_amount, rewards } = projectData;

  if (!title || !description || !target_amount) {
    throw new Error('Missing required fields');
  }

  const { data: project, error } = await supabase
    .from('funding_projects')
    .insert({
      creator_id: creatorId,
      title,
      description,
      target_amount,
      amount_raised: 0,
      status: 'active',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      rewards: rewards || { tiers: [] },
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating funding project:', error);
    throw new Error('Failed to create funding project');
  }

  return project;
};

/**
 * Pledge to a funding project
 * @param {string} backerId - Backer's user ID
 * @param {string} projectId - Project ID to pledge to
 * @param {number} amount - Pledge amount
 * @param {string} [rewardTier] - Optional reward tier ID
 * @returns {Promise<Object>} Result of the pledge
 */
const pledgeToProject = async (backerId, projectId, amount, rewardTier) => {
  // In a real implementation, you would:
  // 1. Verify the project exists and is active
  // 2. Check if the backer has sufficient balance
  // 3. Create a pledge record
  // 4. Update the project's amount_raised
  // 5. Record the transaction in the ledger
  
  // This is a simplified version
  const { data: pledge, error } = await supabase
    .from('funding_pledges')
    .insert({
      project_id: projectId,
      backer_id: backerId,
      amount,
      reward_tier: rewardTier,
      status: 'pledged',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating pledge:', error);
    throw new Error('Failed to create pledge');
  }

  // Update project's amount_raised
  await supabase.rpc('increment_project_funding', {
    project_id: projectId,
    amount,
  });

  // Record the transaction in the ledger
  await supabase
    .from('growth_ledger')
    .insert({
      user_id: backerId,
      source_type: 'funding_pledge',
      source_id: pledge.id,
      amount: -amount, // Negative because it's an outflow
      currency: 'gems',
      status: 'completed',
      metadata: { 
        project_id: projectId,
        reward_tier: rewardTier,
      },
    });

  return {
    success: true,
    pledge,
  };
};

/**
 * Get creator rewards for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} List of creator rewards
 */
const getCreatorRewards = async (userId, { status } = {}) => {
  const query = supabase
    .from('creator_rewards')
    .select('*')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });

  if (status) {
    query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching creator rewards:', error);
    throw new Error('Failed to fetch creator rewards');
  }

  return data || [];
};

/**
 * Get user's growth ledger (transaction history)
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated list of ledger entries
 */
const getUserLedger = async (userId, { limit = 20, offset = 0 } = {}) => {
  const { data, count, error } = await supabase
    .from('growth_ledger')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching ledger entries:', error);
    throw new Error('Failed to fetch ledger entries');
  }

  return {
    entries: data || [],
    total: count || 0,
    limit,
    offset,
  };
};

module.exports = {
  getStakingChannels,
  getUserStakingPositions,
  createStakingPosition,
  claimStakingRewards,
  getFundingProjects,
  createFundingProject,
  pledgeToProject,
  getCreatorRewards,
  getUserLedger,
};
