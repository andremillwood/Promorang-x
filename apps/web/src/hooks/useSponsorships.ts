import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type SponsorshipStatus = 
  | "pending"
  | "viewed"
  | "negotiating"
  | "accepted"
  | "declined"
  | "active"
  | "completed"
  | "cancelled";

export interface SponsorshipRequest {
  id: string;
  campaign_id: string | null;
  moment_id: string;
  brand_id: string;
  host_id: string;
  bid_amount: number;
  platform_fee_percent: number;
  message: string | null;
  requirements: string | null;
  status: SponsorshipStatus;
  host_response: string | null;
  created_at: string;
  responded_at: string | null;
  expires_at: string | null;
  // Joined data
  moment?: {
    id: string;
    title: string;
    image_url: string | null;
    starts_at: string;
    location: string;
    category: string;
  };
  campaign?: {
    id: string;
    title: string;
  };
  brand_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

// For brands: get their outgoing sponsorship requests
export function useBrandSponsorshipRequests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["brand-sponsorship-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("sponsorship_requests")
        .select(`
          *,
          moment:moments(id, title, image_url, starts_at, location, category),
          campaign:campaigns(id, title)
        `)
        .eq("brand_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SponsorshipRequest[];
    },
    enabled: !!user,
  });
}

// For hosts: get incoming sponsorship requests for their moments
export function useHostSponsorshipRequests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["host-sponsorship-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("sponsorship_requests")
        .select(`
          *,
          moment:moments(id, title, image_url, starts_at, location, category),
          campaign:campaigns(id, title)
        `)
        .eq("host_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SponsorshipRequest[];
    },
    enabled: !!user,
  });
}

// Create a sponsorship request (brand action)
export function useCreateSponsorshipRequest() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: {
      moment_id: string;
      host_id: string;
      campaign_id?: string;
      bid_amount: number;
      message?: string;
      requirements?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("sponsorship_requests")
        .insert({
          brand_id: user.id,
          moment_id: request.moment_id,
          host_id: request.host_id,
          campaign_id: request.campaign_id,
          bid_amount: request.bid_amount,
          message: request.message,
          requirements: request.requirements,
          status: "pending" as SponsorshipStatus,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Sponsorship request sent! 📨",
        description: "The host will be notified of your offer.",
      });
      queryClient.invalidateQueries({ queryKey: ["brand-sponsorship-requests"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error sending request",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Respond to a sponsorship request (host action)
export function useRespondToSponsorship() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      status,
      response,
    }: {
      requestId: string;
      status: "accepted" | "declined" | "negotiating";
      response?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("sponsorship_requests")
        .update({
          status: status as SponsorshipStatus,
          host_response: response,
          responded_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .eq("host_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      const messages = {
        accepted: "Sponsorship accepted! 🎉",
        declined: "Sponsorship declined",
        negotiating: "Response sent to brand",
      };
      toast({
        title: messages[variables.status],
        description:
          variables.status === "accepted"
            ? "The brand will be notified and the moment will be sponsored."
            : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["host-sponsorship-requests"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error responding",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
