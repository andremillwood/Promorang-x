import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface MomentSentimentReview {
  id: string;
  moment_id: string;
  user_id: string;
  proof_submission_id: string | null;
  overall_rating: number;
  experience_rating: number | null;
  value_rating: number | null;
  would_recommend: boolean;
  review_title: string | null;
  review_text: string | null;
  what_made_special: string | null;
  tags: string[];
  has_photo_testimonial: boolean;
  photo_urls: string[];
  has_video_testimonial: boolean;
  video_url: string | null;
  is_verified_attendee: boolean;
  verified_at: string | null;
  status: 'pending' | 'completed' | 'verified' | 'featured' | 'rejected';
  is_featured: boolean;
  helpful_count: number;
  sentiment_score: number | null;
  submitted_at: string | null;
  created_at: string;
}

export interface CreateSentimentReviewInput {
  moment_id: string;
  proof_submission_id?: string;
  overall_rating: number;
  experience_rating?: number;
  value_rating?: number;
  would_recommend: boolean;
  review_title?: string;
  review_text?: string;
  what_made_special?: string;
  tags?: string[];
  photo_urls?: string[];
  video_url?: string;
  submitted_from?: string;
}

const MOMENT_TAGS = [
  'Inspiring',
  'Educational',
  'Fun',
  'Networking',
  'Transformative',
  'Community',
  'Creative',
  'Actionable',
  'Entertaining',
  'ThoughtProvoking',
  'Intimate',
  'Energetic',
  'Relaxing',
  'Professional',
  'LifeChanging',
];

export function useMomentSentiment() {
  const { user } = useAuth();

  // Get reviews for a moment
  const useMomentReviews = (momentId: string | null) => {
    return useQuery({
      queryKey: ['moment-reviews', momentId],
      queryFn: async () => {
        if (!momentId) return [];
        
        const { data, error } = await supabase
          .rpc('get_moment_reviews', {
            p_moment_id: momentId,
            p_include_pending: false,
          });

        if (error) throw error;
        return data || [];
      },
      enabled: !!momentId,
    });
  };

  // Check if user has already reviewed a moment
  const useUserReview = (momentId: string | null) => {
    return useQuery({
      queryKey: ['user-moment-review', momentId, user?.id],
      queryFn: async () => {
        if (!momentId || !user) return null;

        const { data, error } = await supabase
          .from('moment_sentiment_reviews')
          .select('*')
          .eq('moment_id', momentId)
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data as MomentSentimentReview | null;
      },
      enabled: !!momentId && !!user,
    });
  };

  // Get sentiment stats for a moment
  const useMomentSentimentStats = (momentId: string | null) => {
    return useQuery({
      queryKey: ['moment-sentiment-stats', momentId],
      queryFn: async () => {
        if (!momentId) return null;

        const { data, error } = await supabase
          .from('moment_sentiment_stats')
          .select('*')
          .eq('moment_id', momentId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
      },
      enabled: !!momentId,
    });
  };

  // Create or update a review
  const createReview = useMutation({
    mutationFn: async (input: CreateSentimentReviewInput) => {
      if (!user) throw new Error('Must be logged in');

      const reviewData = {
        ...input,
        user_id: user.id,
        status: 'completed',
        submitted_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('moment_sentiment_reviews')
        .upsert(reviewData, {
          onConflict: 'moment_id,user_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data as MomentSentimentReview;
    },
    onSuccess: (_, variables) => {
      toast.success('Review submitted! Thank you for your feedback.');
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['moment-reviews', variables.moment_id] });
      queryClient.invalidateQueries({ queryKey: ['user-moment-review', variables.moment_id] });
      queryClient.invalidateQueries({ queryKey: ['moment-sentiment-stats', variables.moment_id] });
    },
    onError: (error) => {
      toast.error('Failed to submit review. Please try again.');
      console.error('Review submission error:', error);
    },
  });

  // Mark review as helpful
  const markHelpful = useMutation({
    mutationFn: async (reviewId: string) => {
      const { data, error } = await supabase
        .rpc('increment_review_helpful_count', { review_id: reviewId });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Marked as helpful!');
    },
  });

  const queryClient = useQueryClient();

  return {
    MOMENT_TAGS,
    useMomentReviews,
    useUserReview,
    useMomentSentimentStats,
    createReview,
    markHelpful,
  };
}

// Utility to calculate sentiment display
export function getSentimentLabel(score: number | null): string {
  if (score === null) return 'Neutral';
  if (score >= 0.5) return 'Very Positive';
  if (score >= 0.2) return 'Positive';
  if (score > -0.2) return 'Neutral';
  if (score > -0.5) return 'Mixed';
  return 'Needs Improvement';
}

export function getRatingLabel(rating: number): string {
  switch (rating) {
    case 5: return 'Exceptional';
    case 4: return 'Great';
    case 3: return 'Good';
    case 2: return 'Fair';
    case 1: return 'Needs Work';
    default: return '';
  }
}
