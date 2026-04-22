import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

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
  const { user, session } = useAuth();

  return useQuery({
    queryKey: ["joined-moments", user?.id],
    queryFn: async () => {
      if (!user || !session) return [];

      const response = await fetch(`${API_URL}/api/participation/me`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load joined moments");
      }

      return (payload?.moments || []) as Array<Moment & {
        participation_status?: string | null;
        joined_at?: string | null;
        checked_in_at?: string | null;
      }>;
    },
    enabled: !!user && !!session,
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
  const { user, session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (momentId: string) => {
      if (!user || !session) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/api/participation/moments/${momentId}/checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          metadata: {
            initiated_from: "useCheckIn",
          },
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Check-in failed");
      }

      return payload;
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
  const { user, session } = useAuth();

  return useQuery({
    queryKey: ["participant-stats", user?.id],
    queryFn: async () => {
      if (!user || !session) return null;

      const response = await fetch(`${API_URL}/api/participation/me`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load participant stats");
      }

      const joinedMoments = Array.isArray(payload?.moments) ? payload.moments : [];
      const totalJoined = joinedMoments.length;
      const checkedIn = joinedMoments.filter((moment) => Boolean(moment.checked_in_at)).length;

      const { count: rewardsClaimed } = await supabase
        .from("check_ins")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("reward_claimed", true);

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const thisMonth = joinedMoments.filter((moment) => {
        if (!moment.joined_at) return false;
        return new Date(moment.joined_at).getTime() >= startOfMonth.getTime();
      }).length;

      return {
        totalJoined,
        checkedIn,
        rewardsClaimed: rewardsClaimed || 0,
        thisMonth,
      };
    },
    enabled: !!user && !!session,
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
