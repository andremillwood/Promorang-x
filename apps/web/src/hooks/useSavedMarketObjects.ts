import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { authPathForReturn } from "@/lib/post-auth-next";
import { clearResumableIntent, rememberResumableIntent } from "@/lib/resumable-intent";
import { trackGrowthEvent } from "@/lib/marketing-attribution";

export type SavedMarketObjectType = "discovery" | "demand" | "moment" | "offer" | "product";

export type SavedMarketObject = {
  id: string;
  user_id: string;
  object_type: SavedMarketObjectType;
  object_id: string;
  title: string;
  subtitle?: string | null;
  image_url?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
};

export type SaveMarketObjectInput = {
  type: SavedMarketObjectType;
  id: string;
  title: string;
  subtitle?: string | null;
  image?: string | null;
  href?: string | null;
  metadata?: Record<string, unknown>;
};

const WATCHABLE_TYPES: SavedMarketObjectType[] = ["discovery", "demand", "moment", "offer", "product"];

function currentReturnPath() {
  if (typeof window === "undefined") return "/discover";
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function useSavedMarketObjects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["saved-market-objects", user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<SavedMarketObject[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("saved_objects")
        .select("*")
        .eq("user_id", user.id)
        .in("object_type", WATCHABLE_TYPES)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as SavedMarketObject[];
    },
    staleTime: 20_000,
  });

  const toggleMutation = useMutation({
    mutationFn: async (object: SaveMarketObjectInput) => {
      if (!user) {
        const returnPath = object.href || currentReturnPath();
        rememberResumableIntent({ kind: "market_watch", returnPath, targetId: `${object.type}:${object.id}` });
        if (typeof window !== "undefined") {
          window.location.assign(authPathForReturn(returnPath, { mode: "login", role: "participant" }));
        }
        return { saved: false, redirected: true };
      }

      const { data: existing, error: existingError } = await supabase
        .from("saved_objects")
        .select("id")
        .eq("user_id", user.id)
        .eq("object_type", object.type)
        .eq("object_id", object.id)
        .maybeSingle();
      if (existingError) throw existingError;

      if (existing?.id) {
        const { error } = await supabase.from("saved_objects").delete().eq("id", existing.id).eq("user_id", user.id);
        if (error) throw error;
        clearResumableIntent({ kind: "market_watch", targetId: `${object.type}:${object.id}` });
        void trackGrowthEvent({
          eventName: "market_watch_removed",
          journey: "participant",
          stage: "retained",
          entityType: object.type,
          entityId: object.id,
          properties: { href: object.href || null },
        });
        return { saved: false, redirected: false };
      }

      const { error } = await supabase.from("saved_objects").insert({
        user_id: user.id,
        object_type: object.type,
        object_id: object.id,
        title: object.title,
        subtitle: object.subtitle || null,
        image_url: object.image || null,
        metadata: { ...(object.metadata || {}), href: object.href || null, watch: true },
      });
      if (error) throw error;
      clearResumableIntent({ kind: "market_watch", targetId: `${object.type}:${object.id}` });
      void trackGrowthEvent({
        eventName: "market_watch_saved",
        journey: "participant",
        stage: "retained",
        entityType: object.type,
        entityId: object.id,
        properties: { href: object.href || null },
      });
      return { saved: true, redirected: false };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-market-objects", user?.id] });
    },
  });

  const isSaved = (type: SavedMarketObjectType, id: string) =>
    Boolean(query.data?.some((item) => item.object_type === type && item.object_id === id));

  return {
    items: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    isSaved,
    toggle: toggleMutation.mutateAsync,
    toggling: toggleMutation.isPending,
  };
}
