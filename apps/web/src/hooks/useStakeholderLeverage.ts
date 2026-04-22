import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ============================================
// HUMAN: Personal Journey Types
// ============================================

export interface UserMomentJourney {
  id: string;
  user_id: string;
  journey_type: string;
  journey_name: string | null;
  moment_count: number;
  first_moment_at: string | null;
  last_moment_at: string | null;
  skill_level_start: string | null;
  skill_level_current: string | null;
  confidence_score_start: number | null;
  confidence_score_current: number | null;
  values_demonstrated: string[];
  key_moments: Array<{moment_id: string; significance: string; reflection: string}>;
  transformation_story: string | null;
  connections_made: number;
  mentors_found: string[];
  mentees_helped: string[];
  badges_earned: string[];
  streak_days: number;
  streak_max: number;
  is_public: boolean;
  share_url: string | null;
}

export interface UserYearlyMoments {
  id: string;
  user_id: string;
  year: number;
  total_moments: number;
  unique_hosts: number;
  unique_categories: string[];
  unique_archetypes: string[];
  cities_visited: number;
  neighborhoods_explored: string[];
  new_connections: number;
  community_hours: number;
  skills_started: number;
  skills_advanced: number;
  challenges_completed: number;
  top_emotions: string[];
  breakthrough_moment_id: string | null;
  most_meaningful_moment_id: string | null;
  year_in_review_story: string | null;
  ai_generated_summary: string | null;
  highlight_reel_urls: string[];
  featured_photo_url: string | null;
}

export interface UserIdentityMarker {
  id: string;
  user_id: string;
  dimension: string;
  strength_score: number;
  supporting_moments: string[];
  first_evidence_at: string | null;
  latest_evidence_at: string | null;
  is_user_confirmed: boolean;
  user_reflection: string | null;
  is_public: boolean;
}

// ============================================
// CORPORATE: Analytics Types
// ============================================

export interface CorporateMomentAnalytics {
  id: string;
  organization_id: string;
  moment_id: string | null;
  period_start: string;
  period_end: string;
  period_type: string;
  total_participants: number;
  new_participants: number;
  returning_participants: number;
  referred_participants: number;
  avg_sentiment_rating: number | null;
  sentiment_distribution: Record<string, number>;
  testimonial_count: number;
  photo_testimonials: number;
  video_testimonials: number;
  proof_completion_rate: number | null;
  reward_claim_rate: number | null;
  repeat_attendance_rate: number | null;
  cohort_30_day_retention: number | null;
  cohort_60_day_retention: number | null;
  cohort_90_day_retention: number | null;
  cohort_ltv_estimate: number | null;
  industry_benchmark_index: number | null;
  percentile_rank: number | null;
  ai_generated_insights: string[];
  recommended_actions: string[];
}

export interface CustomerJourneyPrediction {
  id: string;
  organization_id: string;
  user_id: string;
  next_moment_probability: number | null;
  next_moment_category: string | null;
  next_moment_timeframe: string | null;
  churn_risk_score: number | null;
  churn_risk_category: string | null;
  factors_driving_churn: string[];
  predicted_30_day_value: number | null;
  predicted_90_day_value: number | null;
  predicted_ltv: number | null;
  recommended_actions: Array<{action: string; expected_impact: number; urgency: string}>;
}

// ============================================
// VENUE: Operations Types
// ============================================

export interface VenueOperationsMetrics {
  id: string;
  venue_id: string;
  moment_id: string | null;
  date: string;
  hour_of_day: number;
  check_ins_count: number;
  check_in_peak_time: string | null;
  avg_check_in_duration_minutes: number | null;
  capacity_utilization_percent: number | null;
  queue_times_minutes: number | null;
  staff_efficiency_score: number | null;
  issues_reported: number;
  issue_types: string[];
  avg_dwell_time_minutes: number | null;
  conversion_to_next_action: number | null;
}

export interface VenueEcosystemConnection {
  id: string;
  source_venue_id: string;
  target_venue_id: string;
  shared_customers_count: number;
  customer_overlap_percent: number | null;
  avg_time_between_visits_hours: number | null;
  common_journey_pattern: string | null;
  relationship_type: string;
  is_partnership_active: boolean;
  recommendation_score: number | null;
  target_venue_name?: string;
  target_venue_category?: string;
}

// ============================================
// MAIN HOOK: Comprehensive Stakeholder Leverage
// ============================================

export function useStakeholderLeverage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ============================================
  // HUMAN: Personal Journey Queries
  // ============================================

  const useUserJourneys = () => {
    return useQuery({
      queryKey: ['user-journeys', user?.id],
      queryFn: async () => {
        if (!user) return [];
        const { data, error } = await supabase
          .from('user_moment_journeys')
          .select('*')
          .eq('user_id', user.id)
          .order('moment_count', { ascending: false });
        if (error) throw error;
        return data as UserMomentJourney[];
      },
      enabled: !!user,
    });
  };

  const useUserYearlyMoments = (year?: number) => {
    const targetYear = year || new Date().getFullYear();
    return useQuery({
      queryKey: ['user-yearly-moments', user?.id, targetYear],
      queryFn: async () => {
        if (!user) return null;
        const { data, error } = await supabase
          .from('user_yearly_moments')
          .select('*')
          .eq('user_id', user.id)
          .eq('year', targetYear)
          .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data as UserYearlyMoments | null;
      },
      enabled: !!user,
    });
  };

  const useUserIdentityMarkers = () => {
    return useQuery({
      queryKey: ['user-identity-markers', user?.id],
      queryFn: async () => {
        if (!user) return [];
        const { data, error } = await supabase
          .from('user_identity_markers')
          .select('*')
          .eq('user_id', user.id)
          .order('strength_score', { ascending: false });
        if (error) throw error;
        return data as UserIdentityMarker[];
      },
      enabled: !!user,
    });
  };

  // Update journey story
  const updateJourneyStory = useMutation({
    mutationFn: async ({ journeyId, story }: { journeyId: string; story: string }) => {
      const { data, error } = await supabase
        .from('user_moment_journeys')
        .update({ transformation_story: story, updated_at: new Date().toISOString() })
        .eq('id', journeyId)
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-journeys'] });
      toast.success('Your journey story has been saved');
    },
  });

  // Confirm identity marker
  const confirmIdentityMarker = useMutation({
    mutationFn: async ({ markerId, reflection }: { markerId: string; reflection: string }) => {
      const { data, error } = await supabase
        .from('user_identity_markers')
        .update({ 
          is_user_confirmed: true, 
          user_reflection: reflection,
          updated_at: new Date().toISOString()
        })
        .eq('id', markerId)
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-identity-markers'] });
      toast.success('Identity marker confirmed');
    },
  });

  // ============================================
  // CORPORATE: Analytics Queries
  // ============================================

  const useCorporateAnalytics = (organizationId: string, periodType: string = 'month') => {
    return useQuery({
      queryKey: ['corporate-analytics', organizationId, periodType],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('corporate_moment_analytics')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('period_type', periodType)
          .order('period_start', { ascending: false })
          .limit(10);
        if (error) throw error;
        return data as CorporateMomentAnalytics[];
      },
      enabled: !!organizationId,
    });
  };

  const useCustomerPredictions = (organizationId: string, riskLevel?: string) => {
    return useQuery({
      queryKey: ['customer-predictions', organizationId, riskLevel],
      queryFn: async () => {
        let query = supabase
          .from('customer_journey_predictions')
          .select('*')
          .eq('organization_id', organizationId)
          .order('churn_risk_score', { ascending: false });
        
        if (riskLevel) {
          query = query.eq('churn_risk_category', riskLevel);
        }
        
        const { data, error } = await query.limit(50);
        if (error) throw error;
        return data as CustomerJourneyPrediction[];
      },
      enabled: !!organizationId,
    });
  };

  // ============================================
  // VENUE: Operations Queries
  // ============================================

  const useVenueOperations = (venueId: string, date?: string) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return useQuery({
      queryKey: ['venue-operations', venueId, targetDate],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('venue_operations_metrics')
          .select('*')
          .eq('venue_id', venueId)
          .eq('date', targetDate)
          .order('hour_of_day', { ascending: true });
        if (error) throw error;
        return data as VenueOperationsMetrics[];
      },
      enabled: !!venueId,
    });
  };

  const useVenueEcosystem = (venueId: string) => {
    return useQuery({
      queryKey: ['venue-ecosystem', venueId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('venue_ecosystem_connections')
          .select(`
            *,
            target_venue:target_venue_id (
              full_name,
              venue_category
            )
          `)
          .eq('source_venue_id', venueId)
          .order('recommendation_score', { ascending: false })
          .limit(20);
        if (error) throw error;
        return data as VenueEcosystemConnection[];
      },
      enabled: !!venueId,
    });
  };

  return {
    // Human
    useUserJourneys,
    useUserYearlyMoments,
    useUserIdentityMarkers,
    updateJourneyStory,
    confirmIdentityMarker,
    // Corporate
    useCorporateAnalytics,
    useCustomerPredictions,
    // Venue
    useVenueOperations,
    useVenueEcosystem,
  };
}

// Utility: Get journey type icon and color
export function getJourneyTypeMeta(type: string) {
  const meta: Record<string, { icon: string; color: string; label: string }> = {
    fitness: { icon: '💪', color: 'bg-red-100 text-red-800', label: 'Fitness' },
    learning: { icon: '📚', color: 'bg-blue-100 text-blue-800', label: 'Learning' },
    community: { icon: '👥', color: 'bg-green-100 text-green-800', label: 'Community' },
    career: { icon: '💼', color: 'bg-purple-100 text-purple-800', label: 'Career' },
    wellness: { icon: '🧘', color: 'bg-teal-100 text-teal-800', label: 'Wellness' },
    creative: { icon: '🎨', color: 'bg-pink-100 text-pink-800', label: 'Creative' },
    social: { icon: '🎉', color: 'bg-yellow-100 text-yellow-800', label: 'Social' },
  };
  return meta[type] || { icon: '✨', color: 'bg-gray-100 text-gray-800', label: type };
}

// Utility: Get identity dimension description
export function getIdentityDimensionDescription(dimension: string): string {
  const descriptions: Record<string, string> = {
    explorer: 'You consistently seek new experiences and push boundaries',
    connector: 'You build bridges between people and foster community',
    creator: 'You bring ideas to life and inspire others through your work',
    learner: 'You embrace growth and continuously expand your knowledge',
    mentor: 'You guide others and share your wisdom generously',
    advocate: 'You champion causes and drive positive change',
  };
  return descriptions[dimension] || `You demonstrate strong ${dimension} characteristics`;
}
