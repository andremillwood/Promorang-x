import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types
export interface MomentValuePool {
  id: string;
  moment_id: string;
  total_pool_cents: number;
  host_contribution_cents: number;
  venue_contribution_cents: number;
  brand_sponsorship_cents: number;
  base_marks_percentage: number;
  engagement_percentage: number;
  quality_bonus_percentage: number;
  is_funded: boolean;
  funding_completed_at: string | null;
  distribution_completed_at: string | null;
}

export interface StakeholderEarning {
  id: string;
  moment_id: string;
  user_id: string;
  stakeholder_type: 'guest' | 'host' | 'venue' | 'brand' | 'referrer' | 'content_creator';
  earning_category: 
    | 'base_mark' 
    | 'sentiment_review' 
    | 'media_upload' 
    | 'referral_conversion'
    | 'featured_testimonial'
    | 'high_engagement'
    | 'loyalty_bonus'
    | 'host_fee'
    | 'venue_facilitation'
    | 'brand_sponsorship';
  amount_cents: number;
  tier_multiplier: number;
  quality_multiplier: number;
  is_distributed: boolean;
  distributed_at: string | null;
  created_at: string;
  moment?: {
    title: string;
    starts_at: string;
  };
}

export interface EarningSummary {
  id: string;
  user_id: string;
  total_earned_cents: number;
  total_withdrawn_cents: number;
  available_balance_cents: number;
  marks_earned_cents: number;
  reviews_earned_cents: number;
  media_earned_cents: number;
  referrals_earned_cents: number;
  bonuses_earned_cents: number;
  total_moments_earned_from: number;
  total_reviews_earning: number;
  total_media_earning: number;
  total_referrals_earning: number;
  lifetime_marks: number;
  lifetime_reviews: number;
  lifetime_media: number;
  lifetime_referrals_converted: number;
  last_earning_at: string | null;
}

export interface DistributionRules {
  id: string;
  rule_name: string;
  base_mark_rate: number;
  sentiment_review_rate: number;
  media_upload_rate: number;
  referral_conversion_rate: number;
  featured_testimonial_bonus: number;
  guest_multiplier: number;
  regular_multiplier: number;
  mover_multiplier: number;
  min_review_length_for_bonus: number;
}

// Hook
export function useValuePool() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get user's earning summary
  const useEarningSummary = () => {
    return useQuery({
      queryKey: ['earning-summary', user?.id],
      queryFn: async () => {
        if (!user) return null;
        const { data, error } = await supabase
          .from('stakeholder_earning_summaries')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data as EarningSummary | null;
      },
      enabled: !!user,
    });
  };

  // Get user's earnings history
  const useEarningsHistory = (limit: number = 50) => {
    return useQuery({
      queryKey: ['earnings-history', user?.id, limit],
      queryFn: async () => {
        if (!user) return [];
        const { data, error } = await supabase
          .from('stakeholder_earnings')
          .select(`
            *,
            moment:moment_id (title, starts_at)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit);
        if (error) throw error;
        return data as StakeholderEarning[];
      },
      enabled: !!user,
    });
  };

  // Get distribution rules
  const useDistributionRules = () => {
    return useQuery({
      queryKey: ['distribution-rules'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('value_distribution_rules')
          .select('*')
          .eq('is_active', true)
          .order('effective_from', { ascending: false })
          .limit(1)
          .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data as DistributionRules | null;
      },
    });
  };

  // Get moment value pool
  const useMomentPool = (momentId: string | null) => {
    return useQuery({
      queryKey: ['moment-pool', momentId],
      queryFn: async () => {
        if (!momentId) return null;
        const { data, error } = await supabase
          .from('moment_value_pools')
          .select('*')
          .eq('moment_id', momentId)
          .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data as MomentValuePool | null;
      },
      enabled: !!momentId,
    });
  };

  // Create/fund a value pool (for hosts)
  const fundPool = useMutation({
    mutationFn: async ({
      momentId,
      amountCents,
      contributionBreakdown,
    }: {
      momentId: string;
      amountCents: number;
      contributionBreakdown?: {
        host?: number;
        venue?: number;
        brand?: number;
      };
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('moment_value_pools')
        .upsert({
          moment_id: momentId,
          total_pool_cents: amountCents,
          host_contribution_cents: contributionBreakdown?.host || amountCents,
          venue_contribution_cents: contributionBreakdown?.venue || 0,
          brand_sponsorship_cents: contributionBreakdown?.brand || 0,
          is_funded: true,
          funding_completed_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Value pool funded successfully');
      queryClient.invalidateQueries({ queryKey: ['moment-pool'] });
    },
  });

  // Trigger distribution (for hosts, after moment ends)
  const distributePool = useMutation({
    mutationFn: async (momentId: string) => {
      const { error } = await supabase
        .rpc('distribute_moment_value_pool', { p_moment_id: momentId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Value distributed to stakeholders');
      queryClient.invalidateQueries({ queryKey: ['moment-pool'] });
      queryClient.invalidateQueries({ queryKey: ['earnings-history'] });
      queryClient.invalidateQueries({ queryKey: ['earning-summary'] });
    },
  });

  // Request withdrawal
  const requestWithdrawal = useMutation({
    mutationFn: async ({
      amountCents,
      method,
    }: {
      amountCents: number;
      method: 'stripe' | 'paypal' | 'crypto' | 'gift_card' | 'donation';
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      // Check available balance
      const { data: summary } = await supabase
        .from('stakeholder_earning_summaries')
        .select('available_balance_cents')
        .eq('user_id', user.id)
        .single();
      
      if (!summary || summary.available_balance_cents < amountCents) {
        throw new Error('Insufficient balance');
      }
      
      const { data, error } = await supabase
        .from('stakeholder_withdrawals')
        .insert({
          user_id: user.id,
          amount_cents: amountCents,
          withdrawal_method: method,
          status: 'pending',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Withdrawal request submitted');
      queryClient.invalidateQueries({ queryKey: ['earning-summary'] });
    },
  });

  // Calculate potential earnings
  const calculatePotentialEarnings = (
    rules: DistributionRules | null,
    tier: 'guest' | 'regular' | 'mover',
    actions: {
      marks?: number;
      reviews?: number;
      media?: number;
      referrals?: number;
    }
  ) => {
    if (!rules) return { total: 0, breakdown: {} };
    
    const tierMult = tier === 'regular' ? rules.regular_multiplier :
                    tier === 'mover' ? rules.mover_multiplier :
                    rules.guest_multiplier;
    
    const marksEarnings = (actions.marks || 0) * rules.base_mark_rate * tierMult;
    const reviewsEarnings = (actions.reviews || 0) * rules.sentiment_review_rate * tierMult;
    const mediaEarnings = (actions.media || 0) * rules.media_upload_rate * tierMult;
    const referralsEarnings = (actions.referrals || 0) * rules.referral_conversion_rate * tierMult;
    
    return {
      total: Math.round(marksEarnings + reviewsEarnings + mediaEarnings + referralsEarnings),
      breakdown: {
        marks: Math.round(marksEarnings),
        reviews: Math.round(reviewsEarnings),
        media: Math.round(mediaEarnings),
        referrals: Math.round(referralsEarnings),
      },
    };
  };

  return {
    // Queries
    useEarningSummary,
    useEarningsHistory,
    useDistributionRules,
    useMomentPool,
    // Mutations
    fundPool,
    distributePool,
    requestWithdrawal,
    // Utils
    calculatePotentialEarnings,
  };
}

// Utility functions
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function getEarningCategoryLabel(category: StakeholderEarning['earning_category']): string {
  const labels: Record<string, string> = {
    base_mark: 'Attendance Mark',
    sentiment_review: 'Review Submitted',
    media_upload: 'Photo/Video Shared',
    referral_conversion: 'Friend Joined',
    featured_testimonial: 'Featured Review',
    high_engagement: 'High Engagement',
    loyalty_bonus: 'Regular Bonus',
    host_fee: 'Host Earnings',
    venue_facilitation: 'Venue Facilitation',
    brand_sponsorship: 'Brand Sponsorship',
  };
  return labels[category] || category;
}

export function getEarningCategoryIcon(category: StakeholderEarning['earning_category']): string {
  const icons: Record<string, string> = {
    base_mark: '🎯',
    sentiment_review: '⭐',
    media_upload: '📸',
    referral_conversion: '👥',
    featured_testimonial: '✨',
    high_engagement: '🔥',
    loyalty_bonus: '💎',
    host_fee: '🎭',
    venue_facilitation: '🏢',
    brand_sponsorship: '🎯',
  };
  return icons[category] || '💰';
}
