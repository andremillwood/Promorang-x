import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types
export interface MoneyQualification {
  id: string;
  user_id: string;
  is_tier_qualified: boolean;
  is_identity_verified: boolean;
  is_account_mature: boolean;
  has_no_violations: boolean;
  has_quality_engagement: boolean;
  is_qualified_for_money: boolean;
  first_qualified_at: string | null;
  last_recalculated_at: string;
  disqualified_at: string | null;
  disqualification_reason: string | null;
}

export interface QualificationEvent {
  id: string;
  user_id: string;
  event_type: 'qualified' | 'disqualified' | 'recalculated';
  previous_status: boolean;
  new_status: boolean;
  reason: string;
  triggered_by: string;
  created_at: string;
}

export interface RewardBundle {
  id: string;
  mark_id: string;
  user_id: string;
  moment_id: string;
  points_awarded: number;
  money_qualified: boolean;
  money_awarded_cents: number;
  giveaway_won: string | null;
  coupon_issued: string | null;
  key_earned: string | null;
  tier_at_mark: string;
  was_qualified_for_money: boolean;
  processed_at: string;
  moment?: {
    title: string;
    starts_at: string;
  };
}

// Hook
export function useMoneyQualification() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get user's qualification status
  const useQualificationStatus = () => {
    return useQuery({
      queryKey: ['money-qualification', user?.id],
      queryFn: async () => {
        if (!user) return null;
        
        // First recalculate to get fresh status
        const { data: calcData, error: calcError } = await supabase
          .rpc('recalculate_money_qualification', { p_user_id: user.id });
        
        if (calcError) throw calcError;
        
        // Then fetch the record
        const { data, error } = await supabase
          .from('user_money_qualification')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data as MoneyQualification | null;
      },
      enabled: !!user,
    });
  };

  // Get qualification events history
  const useQualificationEvents = (limit: number = 10) => {
    return useQuery({
      queryKey: ['qualification-events', user?.id, limit],
      queryFn: async () => {
        if (!user) return [];
        const { data, error } = await supabase
          .from('qualification_events')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit);
        if (error) throw error;
        return data as QualificationEvent[];
      },
      enabled: !!user,
    });
  };

  // Get user's reward bundles
  const useRewardBundles = (limit: number = 20) => {
    return useQuery({
      queryKey: ['reward-bundles', user?.id, limit],
      queryFn: async () => {
        if (!user) return [];
        const { data, error } = await supabase
          .from('mark_reward_bundles')
          .select(`
            *,
            moment:moment_id (title, starts_at)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit);
        if (error) throw error;
        return data as RewardBundle[];
      },
      enabled: !!user,
    });
  };

  // Manually recalculate qualification
  const recalculate = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .rpc('recalculate_money_qualification', { p_user_id: user.id });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const [isQualified, reasons, disqualifications] = data;
      if (isQualified) {
        toast.success('You qualify to earn money!', {
          description: reasons.join(', '),
        });
      } else {
        toast.info('Money qualification check complete', {
          description: disqualifications.join(', '),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['money-qualification'] });
    },
  });

  // Check if specific mark earned money
  const checkMarkRewards = useMutation({
    mutationFn: async (markId: string) => {
      const { data, error } = await supabase
        .rpc('orchestrate_mark_rewards', { p_mark_id: markId });
      if (error) throw error;
      return data;
    },
  });

  return {
    useQualificationStatus,
    useQualificationEvents,
    useRewardBundles,
    recalculate,
    checkMarkRewards,
  };
}

// Get human-readable qualification requirement
export function getQualificationRequirement(
  qualification: MoneyQualification | null
): { met: boolean; label: string; requirement: string }[] {
  if (!qualification) return [];

  return [
    {
      met: qualification.is_tier_qualified,
      label: 'Tier',
      requirement: 'Regular, Mover, or Host tier',
    },
    {
      met: qualification.is_identity_verified,
      label: 'Identity',
      requirement: 'Email verified',
    },
    {
      met: qualification.is_account_mature,
      label: 'Account Age',
      requirement: '7+ days old',
    },
    {
      met: qualification.has_no_violations,
      label: 'Standing',
      requirement: 'No recent violations',
    },
    {
      met: qualification.has_quality_engagement,
      label: 'Quality',
      requirement: 'Quality reviews or 3+ marks',
    },
  ];
}

// Get summary of what's blocking qualification
export function getQualificationBlockers(
  qualification: MoneyQualification | null
): string[] {
  if (!qualification) return ['Qualification not calculated yet'];
  if (qualification.is_qualified_for_money) return [];

  const blockers: string[] = [];
  
  if (!qualification.is_tier_qualified) {
    blockers.push('Complete 5+ moments at 2+ venues to become Regular');
  }
  if (!qualification.is_identity_verified) {
    blockers.push('Verify your email address');
  }
  if (!qualification.is_account_mature) {
    blockers.push('Wait 7 days from account creation');
  }
  if (!qualification.has_no_violations) {
    blockers.push('Resolve any account violations');
  }
  if (!qualification.has_quality_engagement) {
    blockers.push('Write detailed reviews (50+ characters)');
  }
  
  return blockers.length > 0 ? blockers : ['Unknown qualification issue'];
}
