import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { operationalSupabase } from "@/integrations/supabase/operational";

export interface MomentComment {
  id: string;
  moment_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at?: string;
  user?: {
    full_name: string;
    avatar_url: string | null;
    pioneer?: boolean;
  };
  replies?: MomentComment[];
  reactions?: Record<string, number>;
  userReaction?: string | null;
}

type CommentRow = Omit<MomentComment, "user" | "replies" | "reactions" | "userReaction">;
const EMPTY_COMMENTS: MomentComment[] = [];

function buildThreads(
  rows: CommentRow[],
  profiles: Map<string, { full_name: string | null; avatar_url: string | null }>,
  reactionCounts: Map<string, Record<string, number>>,
  myReactions: Map<string, string>,
) {
  const comments = new Map<string, MomentComment>();

  rows.forEach((row) => {
    const profile = profiles.get(row.user_id);
    comments.set(row.id, {
      ...row,
      user: {
        full_name: profile?.full_name?.trim() || "Promorang member",
        avatar_url: profile?.avatar_url || null,
      },
      replies: [],
      reactions: reactionCounts.get(row.id) || {},
      userReaction: myReactions.get(row.id) || null,
    });
  });

  const roots: MomentComment[] = [];
  comments.forEach((comment) => {
    if (comment.parent_id && comments.has(comment.parent_id)) {
      comments.get(comment.parent_id)?.replies?.push(comment);
    } else {
      roots.push(comment);
    }
  });

  const ascending = (a: MomentComment, b: MomentComment) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  comments.forEach((comment) => comment.replies?.sort(ascending));
  return roots.sort((a, b) => -ascending(a, b));
}

export function useMomentConversation(momentId: string | null, userId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ["moment-conversation", momentId, userId || "guest"];

  useEffect(() => {
    if (!momentId) return;

    const channel = operationalSupabase
      .channel(`moment-conversation-${momentId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "moment_comments", filter: `moment_id=eq.${momentId}` },
        () => queryClient.invalidateQueries({ queryKey: ["moment-conversation", momentId] }),
      )
      .subscribe();

    return () => {
      operationalSupabase.removeChannel(channel);
    };
  }, [momentId, queryClient, userId]);

  const query = useQuery({
    queryKey,
    enabled: Boolean(momentId),
    queryFn: async () => {
      const { data: commentData, error: commentError } = await operationalSupabase
        .from("moment_comments")
        .select("id,moment_id,user_id,parent_id,content,created_at,updated_at")
        .eq("moment_id", momentId)
        .order("created_at", { ascending: true });
      if (commentError) throw commentError;

      const rows = (commentData || []) as CommentRow[];
      if (rows.length === 0) return [];

      const userIds = [...new Set(rows.map((row) => row.user_id))];
      const commentIds = rows.map((row) => row.id);
      const [profileResult, reactionResult] = await Promise.all([
        operationalSupabase.from("profiles").select("user_id,full_name,avatar_url").in("user_id", userIds),
        operationalSupabase
          .from("reactions")
          .select("user_id,entity_id,reaction_type")
          .eq("entity_type", "comment")
          .in("entity_id", commentIds),
      ]);

      if (profileResult.error) throw profileResult.error;
      if (reactionResult.error) throw reactionResult.error;

      const profiles = new Map(
        (profileResult.data || []).map((profile) => [profile.user_id, profile]),
      );
      const reactionCounts = new Map<string, Record<string, number>>();
      const myReactions = new Map<string, string>();
      (reactionResult.data || []).forEach((reaction) => {
        const counts = reactionCounts.get(reaction.entity_id) || {};
        counts[reaction.reaction_type] = (counts[reaction.reaction_type] || 0) + 1;
        reactionCounts.set(reaction.entity_id, counts);
        if (userId && reaction.user_id === userId) myReactions.set(reaction.entity_id, reaction.reaction_type);
      });

      return buildThreads(rows, profiles, reactionCounts, myReactions);
    },
  });

  const addComment = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      if (!momentId || !userId) throw new Error("Sign in to join the conversation.");
      const normalized = content.trim();
      if (!normalized) throw new Error("Write something before posting.");
      if (normalized.length > 1000) throw new Error("Keep Moment Wall posts under 1,000 characters.");

      const { error } = await operationalSupabase.from("moment_comments").insert({
        moment_id: momentId,
        user_id: userId,
        parent_id: parentId || null,
        content: normalized,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      if (!userId) throw new Error("Sign in to manage your posts.");
      const { error } = await operationalSupabase
        .from("moment_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    comments: query.data || EMPTY_COMMENTS,
    isLoading: query.isLoading,
    error: query.error,
    addComment: (content: string, parentId?: string) => addComment.mutateAsync({ content, parentId }),
    deleteComment: (commentId: string) => deleteComment.mutateAsync(commentId),
    isSubmitting: addComment.isPending || deleteComment.isPending,
  };
}
