import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types
export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  discovery_source: string | null;
  shared_moment_id: string | null;
  shared_moments_count: number;
  moment_overlap_score: number | null;
  created_at: string;
}

export interface UserProfileShowcase {
  id: string;
  user_id: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  website_url: string | null;
  featured_journey_id: string | null;
  featured_moment_ids: string[];
  featured_testimonial_ids: string[];
  is_public: boolean;
  allow_moment_discovery: boolean;
  allow_message_from_strangers: boolean;
  looking_for: string[];
  interests: string[];
  profile_views: number;
  last_active_at: string | null;
}

export interface UserRecommendation {
  id: string;
  user_id: string;
  recommended_user_id: string;
  recommendation_reason: string | null;
  shared_moment_categories: string[];
  shared_moments_count: number;
  complementary_interests: string[];
  similarity_score: number;
  network_proximity_score: number | null;
  moment_overlap_score: number | null;
  was_viewed: boolean;
  was_followed: boolean;
  was_dismissed: boolean;
}

export interface PublicProfile {
  user_id: string;
  display_name: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  interests: string[];
  follower_count: number;
  following_count: number;
  total_moments: number;
  journey_types: string[];
  identity_dimensions: string[];
}

export interface MomentOverlapUser {
  user_id: string;
  display_name: string;
  shared_moments: number;
  similarity_score: number;
}

// Main Hook
export function useUserDiscovery() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get users with moment overlap
  const useMomentOverlapUsers = (minSharedMoments: number = 1) => {
    return useQuery({
      queryKey: ['moment-overlap-users', user?.id, minSharedMoments],
      queryFn: async () => {
        if (!user) return [];
        const { data, error } = await supabase
          .rpc('find_users_by_moment_overlap', {
            p_user_id: user.id,
            p_min_shared_moments: minSharedMoments,
          });
        if (error) throw error;
        return data as MomentOverlapUser[];
      },
      enabled: !!user,
    });
  };

  // Search users
  const useSearchUsers = (query: string, location?: string, interests?: string[]) => {
    return useQuery({
      queryKey: ['user-search', query, location, interests],
      queryFn: async () => {
        if (!query || query.length < 2) return [];
        const { data, error } = await supabase
          .rpc('search_users', {
            p_query: query,
            p_location: location || null,
            p_interests: interests || null,
            p_limit: 20,
          });
        if (error) throw error;
        return data;
      },
      enabled: query.length >= 2,
    });
  };

  // Get user recommendations
  const useUserRecommendations = () => {
    return useQuery({
      queryKey: ['user-recommendations', user?.id],
      queryFn: async () => {
        if (!user) return [];
        const { data, error } = await supabase
          .from('user_recommendations')
          .select('*')
          .eq('user_id', user.id)
          .eq('was_dismissed', false)
          .order('similarity_score', { ascending: false })
          .limit(20);
        if (error) throw error;
        return data as UserRecommendation[];
      },
      enabled: !!user,
    });
  };

  // Get public profile
  const usePublicProfile = (userId: string | null) => {
    return useQuery({
      queryKey: ['public-profile', userId],
      queryFn: async () => {
        if (!userId) return null;
        const { data, error } = await supabase
          .rpc('get_public_profile', { p_user_id: userId });
        if (error) throw error;
        return data?.[0] as PublicProfile | null;
      },
      enabled: !!userId,
    });
  };

  // Get my showcase
  const useMyShowcase = () => {
    return useQuery({
      queryKey: ['my-showcase', user?.id],
      queryFn: async () => {
        if (!user) return null;
        const { data, error } = await supabase
          .from('user_profile_showcases')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data as UserProfileShowcase | null;
      },
      enabled: !!user,
    });
  };

  // Get my followers
  const useMyFollowers = () => {
    return useQuery({
      queryKey: ['my-followers', user?.id],
      queryFn: async () => {
        if (!user) return [];
        const { data, error } = await supabase
          .from('user_follows')
          .select(`
            *,
            follower:follower_id (
              id,
              email,
              profiles:profiles (display_name, avatar_url)
            )
          `)
          .eq('following_id', user.id);
        if (error) throw error;
        return data;
      },
      enabled: !!user,
    });
  };

  // Get who I follow
  const useMyFollowing = () => {
    return useQuery({
      queryKey: ['my-following', user?.id],
      queryFn: async () => {
        if (!user) return [];
        const { data, error } = await supabase
          .from('user_follows')
          .select(`
            *,
            following:following_id (
              id,
              email,
              profiles:profiles (display_name, avatar_url)
            )
          `)
          .eq('follower_id', user.id);
        if (error) throw error;
        return data;
      },
      enabled: !!user,
    });
  };

  // Follow user
  const followUser = useMutation({
    mutationFn: async ({ userId, source }: { userId: string; source?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: userId,
          discovery_source: source || 'profile_visit',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Now following');
      queryClient.invalidateQueries({ queryKey: ['my-following'] });
      queryClient.invalidateQueries({ queryKey: ['public-profile'] });
    },
  });

  // Unfollow user
  const unfollowUser = useMutation({
    mutationFn: async (userId: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Unfollowed');
      queryClient.invalidateQueries({ queryKey: ['my-following'] });
      queryClient.invalidateQueries({ queryKey: ['public-profile'] });
    },
  });

  // Update showcase
  const updateShowcase = useMutation({
    mutationFn: async (showcase: Partial<UserProfileShowcase>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('user_profile_showcases')
        .upsert({
          user_id: user.id,
          ...showcase,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Profile updated');
      queryClient.invalidateQueries({ queryKey: ['my-showcase'] });
    },
  });

  // Dismiss recommendation
  const dismissRecommendation = useMutation({
    mutationFn: async (recommendationId: string) => {
      const { error } = await supabase
        .from('user_recommendations')
        .update({ was_dismissed: true })
        .eq('id', recommendationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-recommendations'] });
    },
  });

  // Generate recommendations
  const generateRecommendations = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .rpc('generate_user_recommendations', { p_user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-recommendations'] });
    },
  });

  return {
    // Queries
    useMomentOverlapUsers,
    useSearchUsers,
    useUserRecommendations,
    usePublicProfile,
    useMyShowcase,
    useMyFollowers,
    useMyFollowing,
    // Mutations
    followUser,
    unfollowUser,
    updateShowcase,
    dismissRecommendation,
    generateRecommendations,
  };
}

// Utility functions
export function getLookingForLabel(type: string): string {
  const labels: Record<string, string> = {
    friends: '👋 Friends',
    collaborators: '🤝 Collaborators',
    mentors: '🎓 Mentors',
    mentees: '🌱 Mentees',
    networking: '💼 Networking',
    activity_partners: '🏃 Activity Partners',
  };
  return labels[type] || type;
}

export function formatDiscoverySource(source: string | null): string {
  if (!source) return 'Profile visit';
  const sources: Record<string, string> = {
    moment_overlap: 'Shared moments',
    search: 'Search',
    recommendation: 'Recommended',
    profile_visit: 'Profile visit',
  };
  return sources[source] || source;
}
