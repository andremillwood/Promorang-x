import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface UserWithProfile {
  id: string;
  email: string;
  created_at: string;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    location: string | null;
  } | null;
  roles: string[];
}

export interface PlatformStats {
  totalUsers: number;
  totalMoments: number;
  totalParticipations: number;
  totalCheckIns: number;
  totalRewards: number;
  totalCampaigns: number;
  totalVenues: number;
  activeUsersThisWeek: number;
  momentsThisWeek: number;
  userGrowth: number;
}

export interface MomentForApproval {
  id: string;
  title: string;
  description: string | null;
  category: string;
  location: string;
  starts_at: string;
  status: string;
  visibility: string;
  created_at: string;
  host_id: string;
  host_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

// Check if user is admin
export function useIsAdmin() {
  const { roles } = useAuth();
  return roles.includes("admin" as any);
}

// Fetch platform-wide stats
export function usePlatformStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["admin-platform-stats"],
    queryFn: async () => {
      // Get total users count from profiles
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get total moments
      const { count: totalMoments } = await supabase
        .from("moments")
        .select("*", { count: "exact", head: true });

      // Get total participations
      const { count: totalParticipations } = await supabase
        .from("moment_participants")
        .select("*", { count: "exact", head: true });

      // Get total check-ins
      const { count: totalCheckIns } = await supabase
        .from("check_ins")
        .select("*", { count: "exact", head: true });

      // Get total rewards
      const { count: totalRewards } = await supabase
        .from("rewards")
        .select("*", { count: "exact", head: true });

      // Get total campaigns
      const { count: totalCampaigns } = await supabase
        .from("campaigns")
        .select("*", { count: "exact", head: true });

      // Get total venues
      const { count: totalVenues } = await supabase
        .from("venues")
        .select("*", { count: "exact", head: true });

      // Get active users this week (users with participations in last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { count: activeUsersThisWeek } = await supabase
        .from("moment_participants")
        .select("user_id", { count: "exact", head: true })
        .gte("joined_at", weekAgo.toISOString());

      // Get moments created this week
      const { count: momentsThisWeek } = await supabase
        .from("moments")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString());

      // Get users from last week for growth calc
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      
      const { count: usersLastWeek } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", twoWeeksAgo.toISOString())
        .lt("created_at", weekAgo.toISOString());

      const { count: usersThisWeek } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString());

      const userGrowth = usersLastWeek && usersLastWeek > 0 
        ? Math.round(((usersThisWeek || 0) - usersLastWeek) / usersLastWeek * 100)
        : 0;

      return {
        totalUsers: totalUsers || 0,
        totalMoments: totalMoments || 0,
        totalParticipations: totalParticipations || 0,
        totalCheckIns: totalCheckIns || 0,
        totalRewards: totalRewards || 0,
        totalCampaigns: totalCampaigns || 0,
        totalVenues: totalVenues || 0,
        activeUsersThisWeek: activeUsersThisWeek || 0,
        momentsThisWeek: momentsThisWeek || 0,
        userGrowth,
      } as PlatformStats;
    },
    enabled: !!user,
  });
}

// Fetch all users with profiles and roles
export function useAllUsers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["admin-all-users"],
    queryFn: async () => {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Get all roles
      const { data: allRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Merge data
      return profiles.map((profile) => ({
        id: profile.user_id,
        email: "", // Email not stored in profiles, would need auth admin access
        created_at: profile.created_at,
        profile: {
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          location: profile.location,
        },
        roles: allRoles
          ?.filter((r) => r.user_id === profile.user_id)
          .map((r) => r.role) || [],
      })) as UserWithProfile[];
    },
    enabled: !!user,
  });
}

// Fetch moments pending approval (draft status or recent)
export function useMomentsForApproval() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["admin-moments-approval"],
    queryFn: async () => {
      // Get all moments ordered by creation date
      const { data: moments, error } = await supabase
        .from("moments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get host profiles
      const hostIds = [...new Set(moments.map((m) => m.host_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", hostIds);

      return moments.map((moment) => ({
        ...moment,
        status: (moment as any).status || "joinable",
        visibility: (moment as any).visibility || "open",
        host_profile: profiles?.find((p) => p.user_id === moment.host_id) || null,
      })) as MomentForApproval[];
    },
    enabled: !!user,
  });
}

// Update moment status (for approval/rejection)
export function useUpdateMomentStatus() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ momentId, status }: { momentId: string; status: string }) => {
      const { error } = await supabase
        .from("moments")
        .update({ status: status as any })
        .eq("id", momentId);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Moment updated",
        description: "The moment status has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-moments-approval"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating moment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Add role to user
export function useAddUserRole() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: role as any });

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Role added",
        description: "The user role has been added.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-all-users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error adding role",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Remove role from user
export function useRemoveUserRole() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role as any);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Role removed",
        description: "The user role has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-all-users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error removing role",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
