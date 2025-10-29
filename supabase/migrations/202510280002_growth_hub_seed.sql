-- Growth Hub Seed Data
-- Migration: 202510280002_growth_hub_seed

-- Insert sample staking channels
insert into public.staking_channels (
  id, name, description, min_stake, max_stake, base_apr, lock_period_days, status
) values 
  (
    '11111111-1111-1111-1111-111111111111', 
    '30-Day Staking', 
    'Standard 30-day staking with competitive returns', 
    100.00, 
    10000.00, 
    12.50, 
    30, 
    'active'
  ),
  (
    '22222222-2222-2222-2222-222222222222', 
    '90-Day Staking', 
    'Higher returns for longer commitment', 
    500.00, 
    50000.00, 
    15.75, 
    90, 
    'active'
  ),
  (
    '33333333-3333-3333-3333-333333333333', 
    'Flexible Staking', 
    'Stake and unstake anytime with lower returns', 
    50.00, 
    20000.00, 
    8.25, 
    0, 
    'active'
  )
  on conflict (id) do nothing;

-- Insert sample creator reward tiers
insert into public.creator_reward_tiers (
  id, name, description, metric, threshold, reward_type, reward_value, is_active
) values 
  (
    '44444444-4444-4444-4444-444444444444',
    'Bronze Views',
    'Reach 1,000 views on a single content piece',
    'views',
    1000,
    'gems',
    100.00,
    true
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'Silver Shares',
    'Sell 50 paid shares across all content',
    'paid_shares',
    50,
    'usd',
    10.00,
    true
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    'Gold Engagement',
    'Receive 500 engagement shares',
    'free_shares',
    500,
    'shares',
    10.00, -- 10 shares
    true
  ),
  (
    '77777777-7777-7777-7777-777777777777',
    'Platinum Comments',
    'Get 100 comments across all content',
    'comments',
    100,
    'gems',
    250.00,
    true
  )
  on conflict (id) do nothing;

-- Insert sample shield policies
insert into public.shield_policies (
  id, name, description, coverage_amount, premium_amount, duration_days, is_active
) values 
  (
    '88888888-8888-8888-8888-888888888888',
    'Basic Shield',
    'Basic protection for your staked assets',
    1000.00,
    50.00,
    30,
    true
  ),
  (
    '99999999-9999-9999-9999-999999999999',
    'Premium Shield',
    'Enhanced protection with lower deductible',
    5000.00,
    200.00,
    30,
    true
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Pro Shield',
    'Maximum protection for high-value stakes',
    20000.00,
    750.00,
    30,
    true
  )
  on conflict (id) do nothing;

-- Insert sample funding project (for demo purposes, with a known creator)
-- Note: Replace '00000000-0000-0000-0000-000000000000' with an actual user ID from your users table
insert into public.funding_projects (
  id, creator_id, title, description, target_amount, status, start_date, end_date, rewards
) values (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  (select id from public.users limit 1), -- Get first user as creator
  'Community Growth Fund',
  'Help us build new features for the Growth Hub',
  10000.00,
  'active',
  now() - interval '1 day',
  now() + interval '29 days',
  '{
    "tiers": [
      {"amount": 50, "title": "Supporter", "description": "Early access to new features"},
      {"amount": 250, "title": "Backer", "description": "Early access + exclusive content"},
      {"amount": 1000, "title": "Partner", "description": "All previous rewards + direct input on features"}
    ]
  }'::jsonb
) on conflict (id) do nothing;

-- Create a function to initialize user staking position (for demo purposes)
create or replace function public.initialize_user_staking(
  p_user_id uuid,
  p_channel_id uuid,
  p_amount numeric
) returns void as $$
begin
  insert into public.staking_positions (
    user_id, 
    channel_id, 
    amount, 
    multiplier,
    lock_until,
    status
  ) values (
    p_user_id,
    p_channel_id,
    p_amount,
    1.0, -- Base multiplier
    case 
      when (select lock_period_days from public.staking_channels where id = p_channel_id) > 0 
      then now() + (select (lock_period_days || ' days')::interval from public.staking_channels where id = p_channel_id)
      else null
    end,
    'active'
  );
  
  -- Record the transaction in the ledger
  insert into public.growth_ledger (
    user_id,
    source_type,
    source_id,
    amount,
    currency,
    status,
    metadata
  ) values (
    p_user_id,
    'staking',
    p_channel_id,
    -p_amount, -- Negative because user is staking (outflow)
    'gems',
    'completed',
    jsonb_build_object('position_id', currval(pg_get_serial_sequence('public.staking_positions', 'id')))
  );
end;
$$ language plpgsql security definer;

-- Create a function to claim staking rewards
create or replace function public.claim_staking_rewards(
  p_position_id uuid,
  p_user_id uuid
) returns numeric as $$
declare
  v_rewards numeric;
  v_position record;
begin
  -- Get the staking position with channel info
  select 
    sp.*,
    sc.base_apr,
    sc.lock_period_days
  into v_position
  from public.staking_positions sp
  join public.staking_channels sc on sp.channel_id = sc.id
  where sp.id = p_position_id
    and sp.user_id = p_user_id
    and sp.status = 'active';
  
  -- Calculate rewards based on time passed and APR
  v_rewards := v_position.amount * 
              (v_position.base_apr / 100.0) * 
              (extract(epoch from (now() - coalesce(v_position.last_claimed_at, v_position.created_at))) / 31536000.0);
  
  -- Update the position
  update public.staking_positions
  set 
    earned_so_far = earned_so_far + v_rewards,
    last_claimed_at = now(),
    updated_at = now()
  where id = p_position_id;
  
  -- Record the reward in the ledger
  insert into public.growth_ledger (
    user_id,
    source_type,
    source_id,
    amount,
    currency,
    status,
    metadata
  ) values (
    p_user_id,
    'staking_claim',
    p_position_id,
    v_rewards,
    'gems',
    'completed',
    jsonb_build_object('position_id', p_position_id)
  );
  
  return v_rewards;
end;
$$ language plpgsql security definer;

-- Create a function to check and award creator rewards
create or replace function public.check_creator_rewards(
  p_creator_id uuid
) returns void as $$
begin
  -- This is a simplified version. In production, this would:
  -- 1. Aggregate metrics for the current period
  -- 2. Check against reward tiers
  -- 3. Create reward entries
  -- 4. Apply 5% revenue cap if needed
  
  -- For now, we'll just log that the function was called
  raise notice 'Checking rewards for creator %', p_creator_id;
end;
$$ language plpgsql security definer;

-- Grant execute permissions to authenticated users
revoke all on function public.initialize_user_staking(uuid, uuid, numeric) from public;
revoke all on function public.claim_staking_rewards(uuid, uuid) from public;
revoke all on function public.check_creator_rewards(uuid) from public;

grant execute on function public.initialize_user_staking(uuid, uuid, numeric) to authenticated;
grant execute on function public.claim_staking_rewards(uuid, uuid) to authenticated;
grant execute on function public.check_creator_rewards(uuid) to authenticated;
