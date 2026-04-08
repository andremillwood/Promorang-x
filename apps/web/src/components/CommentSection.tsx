import { useState } from "react";
import { Send, MoreHorizontal, Reply, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReactionBar } from "@/components/ReactionBar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Comment {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    user?: {
        full_name: string;
        avatar_url: string | null;
    };
    replies?: Comment[];
    reactions?: Record<string, number>;
}

interface CommentSectionProps {
    momentId: string;
    comments: Comment[];
    currentUserId?: string;
    onAddComment?: (content: string, parentId?: string) => void;
    onDeleteComment?: (commentId: string) => void;
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
    className,
}: CommentSectionProps) {
    const { toast } = useToast();
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitComment = async () => {
        if (!newComment.trim()) return;

        setIsSubmitting(true);

        // Optimistic add
        const tempComment: Comment = {
            id: `temp-${Date.now()}`,
            user_id: currentUserId || "",
            content: newComment,
            created_at: new Date().toISOString(),
            user: { full_name: "You", avatar_url: null },
            reactions: {},
        };

        setComments(prev => [tempComment, ...prev]);
        setNewComment("");
        onAddComment?.(newComment);

        toast({
            title: "Comment added",
            description: "Your comment has been posted",
        });

        setIsSubmitting(false);
    };

    const handleSubmitReply = async (parentId: string) => {
        if (!replyContent.trim()) return;

        setIsSubmitting(true);

        // Optimistic add reply
        const tempReply: Comment = {
            id: `temp-${Date.now()}`,
            user_id: currentUserId || "",
            content: replyContent,
            created_at: new Date().toISOString(),
            user: { full_name: "You", avatar_url: null },
            reactions: {},
        };

        setComments(prev => prev.map(comment => {
            if (comment.id === parentId) {
                return {
                    ...comment,
                    replies: [...(comment.replies || []), tempReply]
                };
            }
            return comment;
        }));

        setReplyContent("");
        setReplyingTo(null);
        onAddComment?.(replyContent, parentId);

        toast({
            title: "Reply added",
            description: "Your reply has been posted",
        });

        setIsSubmitting(false);
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
                        <span className="font-medium text-foreground">
                            {comment.user?.full_name || "Anonymous"}
                        </span>
                        <span className="text-xs text-muted-foreground">
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
                                    onClick={() => onDeleteComment?.(comment.id)}
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
                                disabled={!replyContent.trim() || isSubmitting}
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
                        placeholder="Add a comment..."
                        className="flex-1"
                        onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                    />
                    <Button
                        onClick={handleSubmitComment}
                        disabled={!newComment.trim() || isSubmitting}
                    >
                        <Send className="h-4 w-4 mr-2" />
                        Post
                    </Button>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
                {comments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                        No comments yet. Be the first to share your thoughts!
                    </p>
                ) : (
                    comments.map(comment => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))
                )}
            </div>
        </div>
    );
}

export default CommentSection;
