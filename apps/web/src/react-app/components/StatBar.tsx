import { Heart, MessageCircle, Share2, Repeat, Eye } from 'lucide-react';
import type { ContentPieceType } from '../../shared/types';
import RelayButton from './Relay/RelayButton';

interface StatBarProps {
  content: ContentPieceType;
  onSocialAction?: (action: string, contentId?: number) => void;
  onShare?: (content: ContentPieceType) => void;
  onComment?: (content: ContentPieceType) => void;
}

function SocialButton({
  icon: Icon,
  count,
  action,
  onClick,
  color = 'gray'
}: {
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  action?: string;
  onClick?: () => void;
  color?: string;
}) {
  const getHoverColor = () => {
    switch (color) {
      case 'red': return 'hover:text-red-500';
      case 'blue': return 'hover:text-blue-500';
      case 'purple': return 'hover:text-purple-500';
      case 'green': return 'hover:text-green-500';
      default: return 'hover:text-pr-text-1';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-1 text-pr-text-2 ${getHoverColor()} transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] px-2 py-1 rounded-md hover:bg-pr-surface-2 focus:outline-none focus:ring-2 focus:ring-gray-400/50`}
      aria-label={`${action} (${count})`}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
      <span className="text-sm">{count}</span>
    </button>
  );
}

export default function StatBar({ content, onSocialAction, onShare, onComment }: StatBarProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-100">
      {/* Social Stats */}
      <div className="flex items-center justify-center sm:justify-start space-x-1 flex-wrap">
        {/* View Count */}
        {content.views_count !== undefined && (
          <div className="flex items-center space-x-1 text-pr-text-2 px-2 py-1 transition-all duration-200 hover:text-pr-text-1 hover:bg-pr-surface-2 rounded-md">
            <Eye className="w-4 h-4" />
            <span className="text-sm">{formatNumber(content.views_count)} views</span>
          </div>
        )}

        {/* Social Actions */}
        <div className="flex items-center space-x-1">
          <SocialButton
            icon={Heart}
            count={content.likes_count || 0}
            action="like"
            onClick={() => onSocialAction?.('like', content.id)}
            color="red"
          />

          <SocialButton
            icon={MessageCircle}
            count={content.comments_count || 0}
            action="comment"
            onClick={() => onComment?.(content)}
            color="blue"
          />

          <SocialButton
            icon={Repeat}
            count={content.reposts_count || 0}
            action="repost"
            onClick={() => onSocialAction?.('repost', content.id)}
            color="purple"
          />

          <SocialButton
            icon={Share2}
            count={0}
            action="share"
            onClick={() => onShare?.(content)}
            color="green"
          />

          {/* Relay Button - propagate content to your network */}
          <RelayButton
            objectType="content"
            objectId={String(content.id)}
            showLabel={false}
            className="ml-1"
          />
        </div>
      </div>

      {/* Engagement Progress */}
      {content.engagement_shares_total > 0 && (
        <div className="flex items-center justify-center sm:justify-end space-x-2 text-xs text-pr-text-2" role="group" aria-label="Engagement progress">
          <div className="flex items-center space-x-1">
            <div className="w-20 h-2 bg-pr-surface-3 rounded-full overflow-hidden" role="progressbar" aria-valuenow={content.engagement_shares_total - content.engagement_shares_remaining} aria-valuemin={0} aria-valuemax={content.engagement_shares_total} aria-label={`${content.engagement_shares_remaining} free shares remaining out of ${content.engagement_shares_total} total`}>
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{
                  width: `${((content.engagement_shares_total - content.engagement_shares_remaining) / content.engagement_shares_total) * 100}%`
                }}
              ></div>
            </div>
            <span className="text-green-600 font-medium" aria-label={`${content.engagement_shares_remaining} free shares remaining`}>
              {content.engagement_shares_remaining}/{content.engagement_shares_total}
            </span>
          </div>
          <span>free shares</span>
        </div>
      )}
    </div>
  );
}
