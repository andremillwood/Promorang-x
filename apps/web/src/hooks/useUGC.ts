import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface MomentMedia {
  id: string;
  moment_id: string;
  user_id: string;
  media_type: string;
  media_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  is_approved: boolean;
  is_featured: boolean;
  moderation_status: string;
  view_count: number;
  created_at: string;
}

export interface MomentReview {
  id: string;
  moment_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  is_verified_participant: boolean;
  is_featured: boolean;
  helpful_count: number;
  moderation_status: string;
  created_at: string;
  updated_at: string;
}

// Fetch media for a moment
export function useMomentMedia(momentId: string) {
  return useQuery({
    queryKey: ["moment-media", momentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("moment_media")
        .select("*")
        .eq("moment_id", momentId)
        .eq("moderation_status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MomentMedia[];
    },
    enabled: !!momentId,
  });
}

// Fetch user's uploaded media
export function useUserMedia() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-media", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("moment_media")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MomentMedia[];
    },
    enabled: !!user,
  });
}

// Upload media to a moment
export function useUploadMedia() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      momentId,
      file,
      caption,
    }: {
      momentId: string;
      file: File;
      caption?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Determine media type
      const mediaType = file.type.startsWith("video/") ? "video" : "image";

      // Upload to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${momentId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("moment-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("moment-images")
        .getPublicUrl(fileName);

      // Create media record
      const { data, error } = await supabase
        .from("moment_media")
        .insert({
          moment_id: momentId,
          user_id: user.id,
          media_type: mediaType,
          media_url: urlData.publicUrl,
          caption: caption || null,
          moderation_status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Media uploaded! 📸",
        description: "Your content is pending review.",
      });
      queryClient.invalidateQueries({ queryKey: ["moment-media", variables.momentId] });
      queryClient.invalidateQueries({ queryKey: ["user-media"] });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Fetch reviews for a moment
export function useMomentReviews(momentId: string) {
  return useQuery({
    queryKey: ["moment-reviews", momentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("moment_reviews")
        .select("*")
        .eq("moment_id", momentId)
        .eq("moderation_status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MomentReview[];
    },
    enabled: !!momentId,
  });
}

// Fetch user's reviews
export function useUserReviews() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-reviews", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("moment_reviews")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MomentReview[];
    },
    enabled: !!user,
  });
}

// Submit a review
export function useSubmitReview() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      momentId,
      rating,
      title,
      content,
    }: {
      momentId: string;
      rating: number;
      title?: string;
      content?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Check if user participated
      const { data: participation } = await supabase
        .from("moment_participants")
        .select("id")
        .eq("moment_id", momentId)
        .eq("user_id", user.id)
        .maybeSingle();

      const { data, error } = await supabase
        .from("moment_reviews")
        .insert({
          moment_id: momentId,
          user_id: user.id,
          rating,
          title: title || null,
          content: content || null,
          is_verified_participant: !!participation,
          moderation_status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Review submitted! ⭐",
        description: "Thanks for sharing your experience.",
      });
      queryClient.invalidateQueries({ queryKey: ["moment-reviews", variables.momentId] });
      queryClient.invalidateQueries({ queryKey: ["user-reviews"] });
    },
    onError: (error: any) => {
      toast({
        title: "Review failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Moderate media (for hosts)
export function useModerateMedia() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mediaId,
      status,
      notes,
    }: {
      mediaId: string;
      status: "approved" | "rejected";
      notes?: string;
    }) => {
      const { error } = await supabase
        .from("moment_media")
        .update({
          moderation_status: status,
          moderation_notes: notes || null,
          is_approved: status === "approved",
        })
        .eq("id", mediaId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Content moderated",
        description: "The media status has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["moment-media"] });
    },
    onError: (error: any) => {
      toast({
        title: "Moderation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
