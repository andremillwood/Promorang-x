import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const db = supabase as any;

export function useConsumerInteractions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const joinScene = useMutation({
    mutationFn: async (scene: any) => {
      if (!user) throw new Error("Sign in to join this Scene");
      if (!scene?.id) throw new Error("Scene unavailable");
      const { error } = await db.from("scene_memberships").upsert(
        {
          scene_id: scene.id,
          user_id: user.id,
          relationship: "participant",
          membership_state: "active",
        },
        { onConflict: "scene_id,user_id,relationship" },
      );
      if (error) throw error;
      return scene;
    },
    onSuccess: (scene) => {
      toast({ title: `Joined ${scene.title}`, description: "This Scene can now shape what Promorang surfaces for you." });
      queryClient.invalidateQueries({ queryKey: ["scenes"] });
      queryClient.invalidateQueries({ queryKey: ["scene"] });
    },
    onError: (error: any) => toast({ title: "Could not join Scene", description: error.message, variant: "destructive" }),
  });

  const votePoll = useMutation({
    mutationFn: async ({ pollId, optionId }: { pollId: string; optionId: string }) => {
      if (!user) throw new Error("Sign in to vote");
      if (!pollId || !optionId) throw new Error("Poll unavailable");

      const { data: existing } = await db
        .from("discovery_votes")
        .select("id,option_id")
        .eq("discovery_id", pollId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing?.id) {
        if (existing.option_id === optionId) return { alreadyVoted: true };
        throw new Error("You already voted in this Discovery");
      }

      const { error: insertError } = await db.from("discovery_votes").insert({
        discovery_id: pollId,
        option_id: optionId,
        user_id: user.id,
      });
      if (insertError) throw insertError;

      // Keep legacy counters in sync until database triggers own this responsibility.
      const [{ data: option }, { data: poll }] = await Promise.all([
        db.from("discovery_options").select("votes_count").eq("id", optionId).maybeSingle(),
        db.from("discovery_questions").select("total_votes").eq("id", pollId).maybeSingle(),
      ]);
      await Promise.all([
        db.from("discovery_options").update({ votes_count: Number(option?.votes_count || 0) + 1 }).eq("id", optionId),
        db.from("discovery_questions").update({ total_votes: Number(poll?.total_votes || 0) + 1 }).eq("id", pollId),
      ]);

      return { alreadyVoted: false };
    },
    onSuccess: (result) => {
      toast({
        title: result.alreadyVoted ? "Signal already counted" : "Signal counted",
        description: "Promorang can use this to improve what surfaces next.",
      });
      queryClient.invalidateQueries({ queryKey: ["consumer-home-live-polls"] });
    },
    onError: (error: any) => toast({ title: "Could not record signal", description: error.message, variant: "destructive" }),
  });

  const shareInvite = async (code?: string | null) => {
    if (!code) {
      window.location.href = "/growth/referrals";
      return;
    }
    const url = `${window.location.origin}/auth?mode=signup&ref=${encodeURIComponent(code)}`;
    const payload = { title: "Join me on Promorang", text: "See what is moving and what we can unlock together.", url };
    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await navigator.clipboard.writeText(url);
    toast({ title: "Invite link copied", description: "Share it with your people." });
  };

  return { joinScene, votePoll, shareInvite };
}
