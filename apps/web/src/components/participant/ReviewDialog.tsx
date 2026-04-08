import { useState } from "react";
import { Star, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitReview } from "@/hooks/useUGC";

interface ReviewDialogProps {
  momentId: string;
  momentTitle?: string;
  trigger?: React.ReactNode;
}

export function ReviewDialog({ momentId, momentTitle, trigger }: ReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const submitReview = useSubmitReview();

  const handleSubmit = async () => {
    if (rating === 0) return;

    await submitReview.mutateAsync({
      momentId,
      rating,
      title: title.trim() || undefined,
      content: content.trim() || undefined,
    });

    // Reset and close
    setRating(0);
    setTitle("");
    setContent("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <MessageSquare className="w-4 h-4 mr-2" />
            Write Review
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Experience</DialogTitle>
          <DialogDescription>
            {momentTitle ? `Rate your experience at "${momentTitle}"` : "Rate your experience at this moment"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Your Rating</Label>
            <div className="flex items-center gap-1 justify-center py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {rating === 0 && "Tap a star to rate"}
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent!"}
            </p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="review-title">Title (optional)</Label>
            <Input
              id="review-title"
              placeholder="Sum up your experience"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="review-content">Review (optional)</Label>
            <Textarea
              id="review-content"
              placeholder="Tell others about your experience..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={1000}
              className="resize-none min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length}/1000
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || submitReview.isPending}
          >
            {submitReview.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
