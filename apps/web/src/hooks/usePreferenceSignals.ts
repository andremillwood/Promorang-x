import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PreferenceSignalType = "more_like_this" | "not_for_me" | "motivation";

export type PreferenceSignal = {
  id: string;
  user_id: string;
  object_type: string;
  object_key: string;
  label?: string | null;
  signal_type: PreferenceSignalType;
  source_surface?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export function usePreferenceSignals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["preference-signals", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("participant_preference_signals")
        .select("*")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data || []) as PreferenceSignal[];
    },
  });
}

export function useRecordPreferenceSignal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      objectType: string;
      objectKey: string;
      label?: string;
      signalType: PreferenceSignalType;
      sourceSurface: string;
      metadata?: Record<string, unknown>;
    }) => {
      if (!user) return null;
      const { data, error } = await (supabase as any)
        .from("participant_preference_signals")
        .upsert({
          user_id: user.id,
          object_type: input.objectType,
          object_key: input.objectKey,
          label: input.label || null,
          signal_type: input.signalType,
          source_surface: input.sourceSurface,
          metadata: input.metadata || {},
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,object_type,object_key" })
        .select()
        .single();
      if (error) throw error;
      return data as PreferenceSignal;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["preference-signals"] }),
  });
}
