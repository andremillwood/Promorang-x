import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface UserPreferences {
  id: string;
  user_id: string;
  // Demographics
  age_range: string | null;
  gender: string | null;
  // Geographics
  city: string | null;
  state: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  location_radius_km: number;
  location_sharing_enabled: boolean;
  // Psychographics
  lifestyle_tags: string[];
  // Preferences
  preferred_categories: string[];
  preferred_times: string[];
  notification_enabled: boolean;
  email_digest_frequency: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferencesInput {
  age_range?: string | null;
  gender?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  location_radius_km?: number;
  location_sharing_enabled?: boolean;
  lifestyle_tags?: string[];
  preferred_categories?: string[];
  preferred_times?: string[];
  notification_enabled?: boolean;
  email_digest_frequency?: string;
}

export function useUserPreferences() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-preferences", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as UserPreferences | null;
    },
    enabled: !!user,
  });
}

export function useHasCompletedOnboarding() {
  const { data: preferences, isLoading } = useUserPreferences();
  
  // User has completed onboarding if they have preferences with at least one category selected
  const hasCompleted = !isLoading && preferences && preferences.preferred_categories?.length > 0;
  
  return { hasCompleted, isLoading };
}

export function useCreateUserPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: UserPreferencesInput) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_preferences")
        .insert({
          user_id: user.id,
          ...preferences,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Preferences saved! 🎉",
        description: "We'll show you moments tailored to your interests.",
      });
      queryClient.invalidateQueries({ queryKey: ["user-preferences"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving preferences",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateUserPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: UserPreferencesInput) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_preferences")
        .update(preferences)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Preferences updated!",
        description: "Your preferences have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["user-preferences"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating preferences",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Utility for geolocation
export function useRequestLocation() {
  const updatePreferences = useUpdateUserPreferences();

  const requestLocation = () => {
    if (!navigator.geolocation) {
      return Promise.reject(new Error("Geolocation not supported"));
    }

    return new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    }).then((position) => {
      return updatePreferences.mutateAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        location_sharing_enabled: true,
      });
    });
  };

  return { requestLocation, isLoading: updatePreferences.isPending };
}
