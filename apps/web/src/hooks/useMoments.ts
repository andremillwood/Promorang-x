import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Moment {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  category: string;
  location: string;
  venue_name: string | null;
  starts_at: string;
  ends_at: string | null;
  max_participants: number | null;
  reward: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MomentWithParticipants extends Moment {
  participant_count: number;
  host_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

// Fetch moments hosted by user
export function useHostedMoments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["hosted-moments", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("moments")
        .select("*")
        .eq("host_id", user.id)
        .order("starts_at", { ascending: true });

      if (error) throw error;
      return data as Moment[];
    },
    enabled: !!user,
  });
}

// Fetch moments joined by user
export function useJoinedMoments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["joined-moments", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: participations, error: partError } = await supabase
        .from("moment_participants")
        .select("moment_id, status, joined_at, checked_in_at")
        .eq("user_id", user.id);

      if (partError) throw partError;

      if (!participations || participations.length === 0) return [];

      const momentIds = participations.map((p) => p.moment_id);

      const { data: moments, error: momentsError } = await supabase
        .from("moments")
        .select("*")
        .in("id", momentIds)
        .order("starts_at", { ascending: true });

      if (momentsError) throw momentsError;

      // Merge participation data with moments
      return (moments as Moment[]).map((moment) => {
        const participation = participations.find((p) => p.moment_id === moment.id);
        return {
          ...moment,
          participation_status: participation?.status,
          joined_at: participation?.joined_at,
          checked_in_at: participation?.checked_in_at,
        };
      });
    },
    enabled: !!user,
  });
}

// Fetch participant count for a moment
export function useParticipantCount(momentId: string) {
  return useQuery({
    queryKey: ["participant-count", momentId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("moment_participants")
        .select("*", { count: "exact", head: true })
        .eq("moment_id", momentId);

      if (error) throw error;
      return count || 0;
    },
  });
}

// Check-in to a moment
export function useCheckIn() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (momentId: string) => {
      if (!user) throw new Error("Not authenticated");

      // Update participation status
      const { error: partError } = await supabase
        .from("moment_participants")
        .update({ 
          status: "checked_in",
          checked_in_at: new Date().toISOString()
        })
        .eq("moment_id", momentId)
        .eq("user_id", user.id);

      if (partError) throw partError;

      // Also create a check-in record
      const { error: checkInError } = await supabase
        .from("check_ins")
        .insert({
          moment_id: momentId,
          user_id: user.id,
          location_verified: true,
        });

      // Ignore duplicate key error (already checked in)
      if (checkInError && !checkInError.message.includes("duplicate")) {
        throw checkInError;
      }

      return true;
    },
    onSuccess: () => {
      toast({
        title: "Checked in! 🎉",
        description: "You're now checked in to this moment.",
      });
      queryClient.invalidateQueries({ queryKey: ["joined-moments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Check-in failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Get participant stats for a user
export function useParticipantStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["participant-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get total joined moments
      const { count: totalJoined } = await supabase
        .from("moment_participants")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get checked-in moments
      const { count: checkedIn } = await supabase
        .from("moment_participants")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "checked_in");

      // Get rewards claimed
      const { count: rewardsClaimed } = await supabase
        .from("check_ins")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("reward_claimed", true);

      // Get this month's joins
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: thisMonth } = await supabase
        .from("moment_participants")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("joined_at", startOfMonth.toISOString());

      return {
        totalJoined: totalJoined || 0,
        checkedIn: checkedIn || 0,
        rewardsClaimed: rewardsClaimed || 0,
        thisMonth: thisMonth || 0,
      };
    },
    enabled: !!user,
  });
}

// Get host stats
export function useHostStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["host-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get total moments hosted
      const { count: totalMoments } = await supabase
        .from("moments")
        .select("*", { count: "exact", head: true })
        .eq("host_id", user.id);

      // Get active moments
      const { count: activeMoments } = await supabase
        .from("moments")
        .select("*", { count: "exact", head: true })
        .eq("host_id", user.id)
        .eq("is_active", true)
        .gte("starts_at", new Date().toISOString());

      // Get total participants across all moments
      const { data: hostedMoments } = await supabase
        .from("moments")
        .select("id")
        .eq("host_id", user.id);

      let totalParticipants = 0;
      if (hostedMoments && hostedMoments.length > 0) {
        const { count } = await supabase
          .from("moment_participants")
          .select("*", { count: "exact", head: true })
          .in("moment_id", hostedMoments.map((m) => m.id));
        
        totalParticipants = count || 0;
      }

      return {
        totalMoments: totalMoments || 0,
        activeMoments: activeMoments || 0,
        totalParticipants,
      };
    },
    enabled: !!user,
  });
}
