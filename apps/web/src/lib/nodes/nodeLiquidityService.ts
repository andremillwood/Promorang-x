/**
 * Promorang Node Liquidity Service
 * Handles user deposits, staking, yield distribution, and unstake redemptions.
 */

import { supabase } from '@/integrations/supabase/client';

export interface PromorangNode {
  id: string;
  node_name: string;
  node_slug: string;
  node_type: 'amm_liquidity' | 'merchant_coupon_float' | 'bounty_settlement' | 'general_treasury';
  description: string;
  target_capacity: number;
  current_tvl: number;
  base_annual_yield_rate: number;
  prize_pool_share: number;
  min_stake_usd: number;
  is_active: boolean;
}

export class NodeLiquidityService {
  /**
   * List all active Promorang Nodes
   */
  public static async getNodes(): Promise<PromorangNode[]> {
    const { data, error } = await supabase
      .from('promorang_nodes')
      .select('*')
      .eq('is_active', true)
      .order('current_tvl', { ascending: false });

    if (error) throw error;
    return (data as PromorangNode[]) || [];
  }

  /**
   * Stake funds into a node (100% Principal Protected)
   */
  public static async stakeInNode(userId: number, nodeId: string, amountUsd: number) {
    if (amountUsd <= 0) throw new Error('Stake amount must be greater than 0');

    // 1. Create stake entry
    const { data: stake, error: stakeError } = await supabase
      .from('node_stakes')
      .insert({
        user_id: userId,
        node_id: nodeId,
        staked_amount: amountUsd,
        status: 'active',
        locked_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7-day initial lock
      })
      .select('*')
      .single();

    if (stakeError) throw stakeError;

    // 2. Increment Node TVL
    const { data: node } = await supabase
      .from('promorang_nodes')
      .select('current_tvl')
      .eq('id', nodeId)
      .single();

    const newTvl = Number(node?.current_tvl || 0) + amountUsd;

    await supabase
      .from('promorang_nodes')
      .update({ current_tvl: newTvl, updated_at: new Date().toISOString() })
      .eq('id', nodeId);

    return stake;
  }

  /**
   * Request unstaking/withdrawal of principal
   */
  public static async requestUnstake(stakeId: string) {
    const { data, error } = await supabase
      .from('node_stakes')
      .update({
        status: 'unstaking_pending',
        unstake_requested_at: new Date().toISOString(),
      })
      .eq('id', stakeId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }
}
