import { Star, ThumbsUp, Verified, Award, MessageSquare, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useMomentSentiment, MomentSentimentReview, getSentimentLabel } from '@/hooks/useMomentSentiment';
import { Skeleton } from '@/components/ui/skeleton';

interface MomentReviewsListProps {
  momentId: string;
  limit?: number;
  showStats?: boolean;
}

interface ReviewWithUser {
  review_id: string;
  user_id: string;
  user_display_name: string;
  user_avatar_url: string | null;
  overall_rating: number;
  review_title: string | null;
  review_text: string | null;
  what_made_special: string | null;
  tags: string[] | null;
  would_recommend: boolean;
  is_verified_attendee: boolean;
  is_featured: boolean;
  photo_urls: string[] | null;
  has_video_testimonial: boolean;
  helpful_count: number;
  submitted_at: string;
  created_at: string;
}

function ReviewCard({ review }: { review: ReviewWithUser }) {
  const { markHelpful } = useMomentSentiment();

  const handleHelpful = () => {
    markHelpful.mutate(review.review_id);
  };

  return (
    <div className="border-b last:border-0 pb-4 last:pb-0 mb-4 last:mb-0">
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={review.user_avatar_url || undefined} />
          <AvatarFallback>
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{review.user_display_name}</span>
            
            {review.is_verified_attendee && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Verified className="w-3 h-3" />
                Verified
              </Badge>
            )}
            
            {review.is_featured && (
              <Badge className="text-xs gap-1 bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                <Award className="w-3 h-3" />
                Featured
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "w-4 h-4",
                  star <= review.overall_rating
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                )}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-2">
              {new Date(review.submitted_at).toLocaleDateString()}
            </span>
          </div>

          {review.review_title && (
            <h4 className="font-medium mt-2">{review.review_title}</h4>
          )}

          {review.what_made_special && (
            <p className="text-sm mt-1">{review.what_made_special}</p>
          )}

          {review.review_text && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
              {review.review_text}
            </p>
          )}

          {review.tags && review.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {review.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {review.photo_urls && review.photo_urls.length > 0 && (
            <div className="flex gap-2 mt-3">
              {review.photo_urls.slice(0, 3).map((url, idx) => (
                <div 
                  key={idx}
                  className="w-16 h-16 rounded-md bg-cover bg-center"
                  style={{ backgroundImage: `url(${url})` }}
                />
              ))}
              {review.photo_urls.length > 3 && (
                <div className="w-16 h-16 rounded-md bg-secondary flex items-center justify-center text-sm font-medium">
                  +{review.photo_urls.length - 3}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHelpful}
              className="gap-1 text-muted-foreground hover:text-foreground"
            >
              <ThumbsUp className="w-4 h-4" />
              Helpful ({review.helpful_count})
            </Button>

            {review.would_recommend && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <Verified className="w-3 h-3" />
                Recommends this moment
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SentimentStats({ momentId }: { momentId: string }) {
  const { useMomentSentimentStats } = useMomentSentiment();
  const { data: stats, isLoading } = useMomentSentimentStats(momentId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-primary/5 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-primary">
          {stats.avg_overall_rating?.toFixed(1) || '0.0'}
        </div>
        <div className="flex justify-center gap-0.5 my-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "w-4 h-4",
                star <= Math.round(stats.avg_overall_rating || 0)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              )}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Average Rating</p>
      </div>

      <div className="bg-secondary/50 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold">
          {stats.total_reviews || 0}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {stats.verified_reviews > 0 && (
            <span className="text-green-600">{stats.verified_reviews} verified</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">Total Reviews</p>
      </div>

      <div className="bg-secondary/50 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-green-600">
          {stats.recommend_percentage || 0}%
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {stats.would_recommend_count || 0} people
        </p>
        <p className="text-xs text-muted-foreground">Would Recommend</p>
      </div>

      <div className="bg-secondary/50 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold">
          {stats.featured_reviews || 0}
        </div>
        <p className="text-xs text-muted-foreground">Featured Reviews</p>
      </div>
    </div>
  );
}

export function MomentReviewsList({ 
  momentId, 
  limit = 10,
  showStats = true 
}: MomentReviewsListProps) {
  const { useMomentReviews } = useMomentSentiment();
  const { data: reviews, isLoading, error } = useMomentReviews(momentId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Failed to load reviews. Please try again later.
        </CardContent>
      </Card>
    );
  }

  const displayReviews = reviews?.slice(0, limit) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="w-5 h-5" />
          Reviews & Sentiment
          {reviews && reviews.length > 0 && (
            <Badge variant="secondary">{reviews.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {showStats && <SentimentStats momentId={momentId} />}

        <div className="space-y-4">
          {displayReviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No reviews yet</p>
              <p className="text-sm">Be the first to share your experience!</p>
            </div>
          ) : (
            displayReviews.map((review) => (
              <ReviewCard key={review.review_id} review={review} />
            ))
          )}
        </div>

        {reviews && reviews.length > limit && (
          <Button variant="outline" className="w-full">
            View all {reviews.length} reviews
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
