import { useState } from "react";
import { Send, MoreHorizontal, Reply, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReactionBar } from "@/components/ReactionBar";
import { PioneerBadge } from "@/components/badges/PioneerBadge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export interface Comment {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    user?: {
        full_name: string;
        avatar_url: string | null;
        pioneer?: boolean;
    };
    replies?: Comment[];
    reactions?: Record<string, number>;
    userReaction?: string | null;
}

interface CommentSectionProps {
    momentId: string;
    comments: Comment[];
    currentUserId?: string;
    onAddComment?: (content: string, parentId?: string) => Promise<void>;
    onDeleteComment?: (commentId: string) => Promise<void>;
    isLoading?: boolean;
    errorMessage?: string;
    canInteract?: boolean;
    disabledReason?: string;
    className?: string;
}

/**
 * Threaded comment section for moments
 * Features: Nested replies, reactions, real-time feel
 */
export function CommentSection({
    momentId,
    comments: initialComments,
    currentUserId,
    onAddComment,
    onDeleteComment,
    isLoading = false,
    errorMessage,
    canInteract = true,
    disabledReason = "Join this Moment to post on its Wall.",
    className,
}: CommentSectionProps) {
    const { toast } = useToast();
    const comments = initialComments;
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitComment = async () => {
        if (!newComment.trim()) return;

        setIsSubmitting(true);

        try {
            await onAddComment?.(newComment);
            setNewComment("");
            toast({ title: "Posted to the Moment Wall", description: "People in this Moment can now respond." });
        } catch (error) {
            toast({
                title: "Post not saved",
                description: error instanceof Error ? error.message : "Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitReply = async (parentId: string) => {
        if (!replyContent.trim()) return;

        setIsSubmitting(true);

        try {
            await onAddComment?.(replyContent, parentId);
            setReplyContent("");
            setReplyingTo(null);
            toast({ title: "Reply posted", description: "The conversation is up to date." });
        } catch (error) {
            toast({
                title: "Reply not saved",
                description: error instanceof Error ? error.message : "Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        try {
            await onDeleteComment?.(commentId);
            toast({ title: "Post removed" });
        } catch (error) {
            toast({
                title: "Post not removed",
                description: error instanceof Error ? error.message : "Please try again.",
                variant: "destructive",
            });
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
        <div className={cn("group", isReply && "ml-10 mt-3")}>
            <div className="flex gap-3">
                {/* Avatar */}
                <div className={cn(
                    "flex-shrink-0 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium",
                    isReply ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm"
                )}>
                    {comment.user?.avatar_url ? (
                        <img
                            src={comment.user.avatar_url}
                            alt=""
                            className="h-full w-full rounded-full object-cover"
                        />
                    ) : (
                        comment.user?.full_name?.charAt(0) || "?"
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-foreground">
                            {comment.user?.full_name || "Anonymous"}
                        </span>
                        {comment.user?.pioneer && <PioneerBadge showText={false} className="scale-75 origin-left" />}
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                            {formatTimeAgo(comment.created_at)}
                        </span>

                        {/* Actions */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-auto">
                            <button
                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                                title="Reply"
                            >
                                <Reply className="h-3.5 w-3.5" />
                            </button>
                            {comment.user_id === currentUserId && (
                                <button
                                    onClick={() => handleDelete(comment.id)}
                                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                                    title="Delete"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    <p className="text-foreground text-sm leading-relaxed mb-2">
                        {comment.content}
                    </p>

                    {/* Reactions */}
                    <ReactionBar
                        entityType="comment"
                        entityId={comment.id}
                        initialReactions={comment.reactions}
                        userReaction={comment.userReaction}
                        canInteract={canInteract}
                        disabledReason={disabledReason}
                        size="sm"
                    />

                    {/* Reply Input */}
                    {replyingTo === comment.id && (
                        <div className="flex gap-2 mt-3">
                            <Input
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write a reply..."
                                className="flex-1 h-9"
                                onKeyDown={(e) => e.key === "Enter" && handleSubmitReply(comment.id)}
                            />
                            <Button
                                size="sm"
                                onClick={() => handleSubmitReply(comment.id)}
                                disabled={!replyContent.trim() || isSubmitting || !canInteract}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {/* Replies */}
                    {comment.replies?.map(reply => (
                        <CommentItem key={reply.id} comment={reply} isReply />
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className={cn("space-y-6", className)}>
            {/* Add Comment */}
            <div className="flex gap-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium">
                    {currentUserId ? "Y" : "?"}
                </div>
                <div className="flex-1 flex gap-2">
                    <Input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={canInteract ? "Add to the Moment Wall..." : disabledReason}
                        className="flex-1"
                        disabled={!canInteract || !currentUserId}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                    />
                    <Button
                        onClick={handleSubmitComment}
                        disabled={!newComment.trim() || isSubmitting || !canInteract || !currentUserId}
                    >
                        <Send className="h-4 w-4 mr-2" />
                        Post
                    </Button>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6 pt-4">
                {isLoading ? (
                    <p className="text-center text-muted-foreground py-8">Loading the Moment Wall…</p>
                ) : errorMessage ? (
                    <p className="py-8 text-center text-sm text-destructive">{errorMessage}</p>
                ) : comments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                        No messages yet. Start the Moment Wall!
                    </p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className={cn(
                            "p-1 rounded-2xl transition-colors",
                            comment.user?.pioneer ? "bg-amber-500/5 border border-amber-500/10" : ""
                        )}>
                            <CommentItem comment={comment} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default CommentSection;
