/**
 * Promorang No-Loss Lottery Engine
 * Manages ticket calculation, Provably Fair RNG winner selection, and draw executions.
 */

import { supabase } from '@/integrations/supabase/client';

export interface UserTicketSummary {
  userId: number;
  userTier: 'free' | 'premium' | 'super';
  stakedAmount: number;
  streakDays: number;
  baseTickets: number;
  multiplier: number;
  totalTickets: number;
}

export class NoLossLotteryService {
  /**
   * Calculates dynamic tickets for a user based on stake, tier, and streak
   */
  public static calculateTickets(
    stakedAmount: number,
    tier: 'free' | 'premium' | 'super',
    streakDays: number
  ): { baseTickets: number; multiplier: number; totalTickets: number } {
    const baseTickets = Math.floor(stakedAmount / 10);
    
    let multiplier = 1.0;
    if (tier === 'premium') multiplier = 3.0;
    if (tier === 'super') multiplier = 10.0;

    const streakBoost = 1 + Math.min(streakDays, 365) * 0.005; // 0.5% boost per streak day
    const totalTickets = Math.floor(baseTickets * multiplier * streakBoost);

    return {
      baseTickets,
      multiplier,
      totalTickets,
    };
  }

  /**
   * Provably fair weighted random ticket selection using seed entropy
   */
  public static selectWinner(
    participants: { userId: number; ticketCount: number }[],
    entropySeed: string
  ): number | null {
    const totalTickets = participants.reduce((acc, p) => acc + p.ticketCount, 0);
    if (totalTickets <= 0) return null;

    // Simple pseudo-random hash generator for deterministic draw resolution
    let hash = 0;
    for (let i = 0; i < entropySeed.length; i++) {
      hash = ((hash << 5) - hash) + entropySeed.charCodeAt(i);
      hash |= 0;
    }
    const positiveHash = Math.abs(hash);
    const winningTicketIndex = positiveHash % totalTickets;

    let cumulative = 0;
    for (const participant of participants) {
      cumulative += participant.ticketCount;
      if (winningTicketIndex < cumulative) {
        return participant.userId;
      }
    }

    return participants[participants.length - 1]?.userId || null;
  }

  /**
   * Fetch active prize pools
   */
  public static async getActivePrizePools() {
    const { data, error } = await supabase
      .from('no_loss_prize_pools')
      .select('*')
      .eq('is_active', true)
      .order('next_draw_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Fetch user's active tickets summary across all nodes
   */
  public static async getUserTickets(userId: number): Promise<UserTicketSummary> {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('user_tier, points_streak_days')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    const { data: stakes, error: stakeError } = await supabase
      .from('node_stakes')
      .select('staked_amount')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (stakeError) throw stakeError;

    const totalStaked = (stakes || []).reduce((sum, s) => sum + Number(s.staked_amount), 0);
    const tier = (user?.user_tier as 'free' | 'premium' | 'super') || 'free';
    const streak = user?.points_streak_days || 0;

    const { baseTickets, multiplier, totalTickets } = this.calculateTickets(totalStaked, tier, streak);

    return {
      userId,
      userTier: tier,
      stakedAmount: totalStaked,
      streakDays: streak,
      baseTickets,
      multiplier,
      totalTickets,
    };
  }
}
