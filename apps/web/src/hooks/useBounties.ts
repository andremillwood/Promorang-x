import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type BountyStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "submitted"
  | "approved"
  | "completed"
  | "cancelled"
  | "expired";

export interface MomentBounty {
  id: string;
  campaign_id: string | null;
  brand_id: string;
  title: string;
  description: string | null;
  requirements: string;
  target_category: string;
  target_location: string | null;
  target_date_range: string | null; // tstzrange as string
  target_min_participants: number;
  payout_amount: number;
  platform_fee_percent: number;
  assigned_to: string | null;
  fulfilled_moment_id: string | null;
  status: BountyStatus;
  created_at: string;
  assigned_at: string | null;
  completed_at: string | null;
  expires_at: string | null;
  // Joined data
  brand_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  assigned_host?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  fulfilled_moment?: {
    id: string;
    title: string;
  };
}

// Get all open bounties (for hosts to browse)
export function useOpenBounties() {
  return useQuery({
    queryKey: ["open-bounties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("moment_bounties")
        .select("*")
        .eq("status", "open")
        .order("payout_amount", { ascending: false });

      if (error) throw error;
      return data as MomentBounty[];
    },
  });
}

// For brands: get their posted bounties
export function useBrandBounties() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["brand-bounties", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("moment_bounties")
        .select("*")
        .eq("brand_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MomentBounty[];
    },
    enabled: !!user,
  });
}

// For hosts: get bounties they've claimed
export function useHostClaimedBounties() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["host-claimed-bounties", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("moment_bounties")
        .select("*")
        .eq("assigned_to", user.id)
        .order("assigned_at", { ascending: false });

      if (error) throw error;
      return data as MomentBounty[];
    },
    enabled: !!user,
  });
}

// Create a bounty (brand action)
export function useCreateBounty() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bounty: {
      title: string;
      description?: string;
      requirements: string;
      target_category: string;
      target_location?: string;
      target_min_participants?: number;
      payout_amount: number;
      campaign_id?: string;
      expires_at?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("moment_bounties")
        .insert({
          brand_id: user.id,
          title: bounty.title,
          description: bounty.description,
          requirements: bounty.requirements,
          target_category: bounty.target_category,
          target_location: bounty.target_location,
          target_min_participants: bounty.target_min_participants || 10,
          payout_amount: bounty.payout_amount,
          campaign_id: bounty.campaign_id,
          expires_at: bounty.expires_at,
          status: "open" as BountyStatus,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Bounty posted! 🎯",
        description: "Hosts can now see and claim your bounty.",
      });
      queryClient.invalidateQueries({ queryKey: ["brand-bounties"] });
      queryClient.invalidateQueries({ queryKey: ["open-bounties"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error posting bounty",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Claim a bounty (host action)
export function useClaimBounty() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bountyId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("moment_bounties")
        .update({
          assigned_to: user.id,
          assigned_at: new Date().toISOString(),
          status: "assigned" as BountyStatus,
        })
        .eq("id", bountyId)
        .eq("status", "open")
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Bounty claimed! 🎉",
        description: "You can now create a moment to fulfill this bounty.",
      });
      queryClient.invalidateQueries({ queryKey: ["open-bounties"] });
      queryClient.invalidateQueries({ queryKey: ["host-claimed-bounties"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error claiming bounty",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Submit a moment to fulfill bounty (host action)
export function useSubmitBountyMoment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bountyId,
      momentId,
    }: {
      bountyId: string;
      momentId: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("moment_bounties")
        .update({
          fulfilled_moment_id: momentId,
          status: "submitted" as BountyStatus,
        })
        .eq("id", bountyId)
        .eq("assigned_to", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Moment submitted! 📋",
        description: "The brand will review your moment.",
      });
      queryClient.invalidateQueries({ queryKey: ["host-claimed-bounties"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error submitting",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Approve/reject bounty submission (brand action)
export function useReviewBountySubmission() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bountyId,
      approved,
    }: {
      bountyId: string;
      approved: boolean;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("moment_bounties")
        .update({
          status: approved ? ("approved" as BountyStatus) : ("in_progress" as BountyStatus),
          completed_at: approved ? new Date().toISOString() : null,
        })
        .eq("id", bountyId)
        .eq("brand_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.approved ? "Bounty approved! ✅" : "Revision requested",
        description: variables.approved
          ? "The host will receive their payout."
          : "The host has been notified to make changes.",
      });
      queryClient.invalidateQueries({ queryKey: ["brand-bounties"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error reviewing",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
