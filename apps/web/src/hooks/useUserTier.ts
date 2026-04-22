import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  UserTier, 
  userTiers, 
  getUserTier, 
  getTierProgress, 
  getRelationshipDescription,
  TierDefinition 
} from '@/lib/mark-terminology';
import { toast } from 'sonner';

// User tier tracking in database
export interface UserTierStatus {
  id: string;
  user_id: string;
  current_tier: UserTier;
  total_marks: number;
  unique_venues_marked: number;
  current_streak: number;
  longest_streak: number;
  last_mark_at: string | null;
  days_since_last_mark: number | null;
  has_hosted: boolean;
  tier_achieved_at: string;
  tier_progress: {
    complete: boolean;
    nextTier: UserTier | null;
    requirements: Array<{
      type: string;
      label: string;
      current: number;
      target: number;
    }>;
  };
  
  // Relationship tracking
  venue_relationships: Array<{
    venue_id: string;
    venue_name: string;
    marks_count: number;
    relationship_type: string;
    last_marked_at: string;
  }>;
  
  host_relationships: Array<{
    host_id: string;
    host_name: string;
    marks_count: number;
    relationship_type: string;
  }>;
}

// Hook for user tier management
export function useUserTier() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get current tier status
  const useTierStatus = () => {
    return useQuery({
      queryKey: ['user-tier-status', user?.id],
      queryFn: async () => {
        if (!user) return null;
        
        // Get mark stats
        const { data: markStats, error: markError } = await supabase
          .from('moment_attendee_discovery')
          .select('moment_id, venue_id, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (markError) throw markError;
        
        // Calculate stats
        const totalMarks = markStats?.length || 0;
        const uniqueVenues = new Set(markStats?.map(m => m.venue_id).filter(Boolean)).size;
        const lastMark = markStats?.[0]?.created_at;
        const daysSinceLastMark = lastMark 
          ? Math.floor((Date.now() - new Date(lastMark).getTime()) / (1000 * 60 * 60 * 24))
          : null;
        
        // Check if user has hosted
        const { data: hostedMoments, error: hostError } = await supabase
          .from('moments')
          .select('id')
          .eq('host_id', user.id)
          .limit(1);
        
        if (hostError) throw hostError;
        const hasHosted = (hostedMoments?.length || 0) > 0;
        
        // Calculate streak (simplified - consecutive days with marks)
        let currentStreak = 0;
        if (markStats && markStats.length > 0) {
          const today = new Date();
          const marksByDay = new Set(markStats.map(m => m.created_at?.split('T')[0]));
          
          for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toISOString().split('T')[0];
            
            if (marksByDay.has(dateStr)) {
              currentStreak++;
            } else if (i === 0) {
              continue; // Today might not have a mark yet
            } else {
              break;
            }
          }
        }
        
        // Determine tier
        const currentTier = getUserTier(
          totalMarks,
          uniqueVenues,
          currentStreak,
          hasHosted,
          daysSinceLastMark
        );
        
        // Get progress to next tier
        const progress = getTierProgress(
          currentTier,
          totalMarks,
          uniqueVenues,
          currentStreak
        );
        
        // Get venue relationships
        const { data: venueRels, error: venueError } = await supabase
          .rpc('get_user_venue_relationships', { p_user_id: user.id });
        
        if (venueError) throw venueError;
        
        // Get host relationships
        const { data: hostRels, error: hostRelsError } = await supabase
          .rpc('get_user_host_relationships', { p_user_id: user.id });
        
        if (hostRelsError) throw hostRelsError;
        
        return {
          id: user.id,
          user_id: user.id,
          current_tier: currentTier,
          total_marks: totalMarks,
          unique_venues_marked: uniqueVenues,
          current_streak: currentStreak,
          longest_streak: currentStreak, // Simplified
          last_mark_at: lastMark,
          days_since_last_mark: daysSinceLastMark,
          has_hosted: hasHosted,
          tier_achieved_at: new Date().toISOString(),
          tier_progress: progress,
          venue_relationships: venueRels || [],
          host_relationships: hostRels || [],
        } as UserTierStatus;
      },
      enabled: !!user,
    });
  };

  // Get tier definition
  const getTierInfo = (tier: UserTier): TierDefinition => {
    return userTiers[tier];
  };

  // Get relationship description for a specific entity
  const getRelationship = (
    tier: UserTier,
    entityType: 'host' | 'venue' | 'brand' | 'community',
    context?: { name?: string; visits?: number; marks?: number }
  ): string => {
    return getRelationshipDescription(tier, entityType, context);
  };

  // Check if user qualifies for tier upgrade
  const checkTierUpgrade = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data: currentStatus, error } = await supabase
        .from('user_tier_tracking')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      // Recalculate tier
      const { data: markStats } = await supabase
        .from('moment_attendee_discovery')
        .select('venue_id')
        .eq('user_id', user.id);
      
      const totalMarks = markStats?.length || 0;
      const uniqueVenues = new Set(markStats?.map(m => m.venue_id).filter(Boolean)).size;
      
      const { data: hosted } = await supabase
        .from('moments')
        .select('id')
        .eq('host_id', user.id)
        .limit(1);
      
      const hasHosted = (hosted?.length || 0) > 0;
      const newTier = getUserTier(totalMarks, uniqueVenues, 0, hasHosted, null);
      
      if (currentStatus?.current_tier !== newTier) {
        // Tier upgrade!
        await supabase
          .from('user_tier_tracking')
          .upsert({
            user_id: user.id,
            current_tier: newTier,
            total_marks: totalMarks,
            unique_venues_marked: uniqueVenues,
            has_hosted: hasHosted,
            tier_achieved_at: new Date().toISOString(),
          });
        
        return { upgraded: true, from: currentStatus?.current_tier, to: newTier };
      }
      
      return { upgraded: false, current: newTier };
    },
    onSuccess: (result) => {
      if (result.upgraded) {
        const tierInfo = userTiers[result.to];
        toast.success(
          `You've become ${tierInfo.article} ${tierInfo.label}!`,
          { description: tierInfo.description }
        );
        queryClient.invalidateQueries({ queryKey: ['user-tier-status'] });
      }
    },
  });

  return {
    useTierStatus,
    getTierInfo,
    getRelationship,
    checkTierUpgrade,
  };
}

// Quick tier badge component helper
export function getTierBadge(tier: UserTier): {
  label: string;
  icon: string;
  color: string;
  article: string;
} {
  const t = userTiers[tier];
  return {
    label: t.label,
    icon: t.icon,
    color: t.color,
    article: t.article,
  };
}

// Hook for venue-specific relationship
export function useVenueRelationship(venueId: string) {
  const { user } = useAuth();
  const { useTierStatus } = useUserTier();
  const { data: tierStatus } = useTierStatus();
  
  return useQuery({
    queryKey: ['venue-relationship', user?.id, venueId],
    queryFn: async () => {
      if (!user || !tierStatus) return null;
      
      const { data: marks, error } = await supabase
        .from('moment_attendee_discovery')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('venue_id', venueId);
      
      if (error) throw error;
      
      const markCount = marks?.length || 0;
      const relationship = getRelationshipDescription(
        tierStatus.current_tier,
        'venue',
        { name: venueId, visits: markCount }
      );
      
      return {
        markCount,
        relationship,
        tier: tierStatus.current_tier,
        isRegular: markCount >= 3,
        firstMarkDate: marks?.[marks.length - 1]?.created_at,
        lastMarkDate: marks?.[0]?.created_at,
      };
    },
    enabled: !!user && !!venueId && !!tierStatus,
  });
}
