import { useState } from 'react';
import { Heart, MessageCircle, Share2, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import RelayButton from './Relay/RelayButton';

interface Creator {
  id: string;
  username: string;
  display_name: string;
  profile_image: string;
  is_verified: boolean;
}

interface SocialStats {
  likes_count: number;
  comments_count: number;
  shares_count: number;
  completions_count: number;
  is_liked: boolean;
  is_following_creator: boolean;
}

interface SocialDropCardProps {
  dropId: string;
  creator: Creator;
  socialStats: SocialStats;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onFollow?: () => void;
}

export default function SocialDropCard({
  dropId,
  creator,
  socialStats,
  onLike,
  onComment,
  onShare,
  onFollow,
}: SocialDropCardProps) {
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(socialStats.is_liked);
  const [likesCount, setLikesCount] = useState(socialStats.likes_count);
  const [isFollowing, setIsFollowing] = useState(socialStats.is_following_creator);

  const handleLike = async () => {
    try {
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);

      const endpoint = newIsLiked ? '/api/social/reactions' : '/api/social/reactions';
      const method = newIsLiked ? 'POST' : 'DELETE';

      await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: newIsLiked ? JSON.stringify({
          target_type: 'drop',
          target_id: dropId,
          reaction_type: 'like',
        }) : undefined,
      });

      if (onLike) onLike();
    } catch (error) {
      console.error('Error toggling like:', error);
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
    }
  };

  const handleFollow = async () => {
    try {
      const newIsFollowing = !isFollowing;
      setIsFollowing(newIsFollowing);

      const endpoint = `/api/social/follow/${creator.id}`;
      const method = newIsFollowing ? 'POST' : 'DELETE';

      await fetch(endpoint, {
        method,
        credentials: 'include',
      });

      toast({
        title: newIsFollowing ? 'Following' : 'Unfollowed',
        description: `You ${newIsFollowing ? 'are now following' : 'unfollowed'} ${creator.display_name}`,
        type: 'success',
      });

      if (onFollow) onFollow();
    } catch (error) {
      console.error('Error toggling follow:', error);
      setIsFollowing(!isFollowing);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this drop on Promorang',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied',
        description: 'Drop link copied to clipboard',
        type: 'success',
      });
    }
    if (onShare) onShare();
  };

  return (
    <div className="border-t border-pr-border pt-3 mt-3">
      {/* Creator Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <img
            src={creator.profile_image || 'https://via.placeholder.com/32'}
            alt={creator.display_name}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-pr-text-1">
                {creator.display_name || creator.username}
              </span>
              {creator.is_verified && (
                <span className="text-blue-500">✓</span>
              )}
            </div>
            <span className="text-xs text-pr-text-2">@{creator.username}</span>
          </div>
        </div>

        {!isFollowing && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleFollow}
            className="text-xs"
          >
            Follow
          </Button>
        )}
      </div>

      {/* Social Proof */}
      <div className="flex items-center gap-4 mb-3 text-xs text-pr-text-2">
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          <span>{socialStats.completions_count} completed</span>
        </div>
        {socialStats.completions_count > 100 && (
          <div className="flex items-center gap-1 text-orange-600">
            <TrendingUp className="h-3 w-3" />
            <span>Trending</span>
          </div>
        )}
      </div>

      {/* Engagement Buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${isLiked
              ? 'bg-red-50 text-red-600'
              : 'hover:bg-pr-surface-2 text-pr-text-2'
            }`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm">{likesCount}</span>
        </button>

        <button
          onClick={onComment}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-pr-surface-2 text-pr-text-2 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm">{socialStats.comments_count}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-pr-surface-2 text-pr-text-2 transition-colors"
        >
          <Share2 className="h-4 w-4" />
          <span className="text-sm">Share</span>
        </button>

        {/* Relay Button */}
        <RelayButton
          objectType="drop"
          objectId={dropId}
          showLabel={false}
        />
      </div>
    </div>
  );
}
