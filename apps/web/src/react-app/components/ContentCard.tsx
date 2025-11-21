import { Link } from 'react-router-dom';
import type { ContentPieceType, UserType } from '../../shared/types';
import {
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  ExternalLink,
  Eye,
  Gift,
  Repeat,
  Tag,
  Sparkles
} from 'lucide-react';
import ButtonGroup from '@/react-app/components/ButtonGroup';
import StatBar from '@/react-app/components/StatBar';
import { Routes as RoutePaths } from '@/react-app/utils/url';

interface ContentCardProps {
  content: ContentPieceType;
  onBuyShares?: (content: ContentPieceType) => void;
  onShare?: (content: ContentPieceType) => void;
  onSocialAction?: (action: string, contentId?: number) => void;
  onExternalMove?: (content: ContentPieceType) => void;
  onTip?: (content: ContentPieceType) => void;
  currentUser?: UserType | null;
  onEdit?: (content: ContentPieceType) => void;
  onDelete?: (content: ContentPieceType) => void;
  onComment?: (content: ContentPieceType) => void;
  onNavigate?: (content: ContentPieceType) => void;
  onPredict?: (content: ContentPieceType) => void;
  isSponsored?: boolean;
}

export default function ContentCard({
  content,
  onBuyShares,
  onShare,
  onSocialAction,
  onExternalMove,
  onTip,
  currentUser,
  onEdit,
  onDelete,
  onComment,
  onNavigate,
  onPredict,
  isSponsored
}: ContentCardProps) {
  const handleCardClick = () => {
    if (onNavigate) {
      onNavigate(content);
    }
  };

  const formatNumber = (num?: number | null) => {
    if (num === undefined || num === null || Number.isNaN(num)) {
      return '0';
    }

    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const totalShares = content.total_shares ?? 0;
  const availableShares = content.available_shares ?? 0;
  const ownedShares = Math.max(totalShares - availableShares, 0);
  const engagementSharesRemaining = content.engagement_shares_remaining ?? 0;
  const revenue = typeof content.current_revenue === 'number'
    ? content.current_revenue
    : Number(content.current_revenue) || 0;
  const createdAt = content.created_at ? new Date(content.created_at) : null;
  const postedDateLabel = createdAt && !Number.isNaN(createdAt.getTime())
    ? createdAt.toLocaleDateString()
    : 'Recently';
  const creatorProfilePath = content.creator_username
    ? RoutePaths.profile(content.creator_username)
    : content.creator_name
    ? RoutePaths.profile(content.creator_name)
    : null;

  return (
    <div
      className={`bg-pr-surface-card rounded-xl shadow-sm border border-pr-border p-5 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-pr-surface-3 max-w-[720px] mx-auto w-full focus-within:outline focus-within:outline-2 focus-within:outline-primary/40 focus-within:ring-2 focus-within:ring-primary/20 ${isSponsored || content.is_sponsored ? 'ring-2 ring-orange-200 ring-opacity-50' : ''}`}
      onClick={handleCardClick}
      tabIndex={0}
      role="article"
      aria-label={`Content by ${content.creator_name || content.creator_username || 'Unknown Creator'}: ${content.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Header Section - Demo/Sponsored indicators and view count */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {content.is_demo && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 flex items-center space-x-1 transition-all duration-200 hover:bg-purple-200 hover:scale-[1.02]">
              <Sparkles className="w-3 h-3" />
              <span>Demo</span>
            </span>
          )}
          {(isSponsored || content.is_sponsored) && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-200 flex items-center space-x-1 transition-all duration-200 hover:bg-orange-200 hover:scale-[1.02]">
              <Tag className="w-3 h-3" />
              <span>Sponsored</span>
            </span>
          )}
        </div>

        {content.views_count !== undefined && (
          <div className="flex items-center space-x-1 text-pr-text-2 transition-all duration-200 hover:text-pr-text-1 hover:bg-pr-surface-2 px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400/50" role="text" aria-label={`${formatNumber(content.views_count)} views`}>
            <Eye className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm">{formatNumber(content.views_count)} views</span>
          </div>
        )}
      </div>

      {/* Media Section - Image */}
      {content.media_url && (
        <div
          className="mb-4 rounded-lg overflow-hidden bg-pr-surface-2 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          <img
            src={content.media_url}
            alt={content.title}
            className="w-full h-48 object-cover hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Content Section - Title, Description, Creator Info */}
      <div className="mb-4">
        <button
          type="button"
          className="font-semibold text-left text-lg text-pr-text-1 mb-2 hover:text-orange-600 transition-colors leading-tight cursor-pointer focus:outline-none focus:text-orange-600"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          {content.title}
        </button>
        {content.description && (
          <p className="text-pr-text-2 text-sm leading-relaxed line-clamp-2 mb-3">{content.description}</p>
        )}

        {/* Creator Info and Revenue */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1">
            {creatorProfilePath ? (
              <Link
                to={creatorProfilePath}
                onClick={(e) => e.stopPropagation()}
                className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm transition-all duration-200 hover:scale-[1.05] cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:scale-[1.05]"
                aria-label={`Creator: ${content.creator_name || content.creator_username || 'Unknown'}`}
              >
                {(content.creator_name || content.creator_username || 'U')[0].toUpperCase()}
              </Link>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm transition-all duration-200 hover:scale-[1.05] cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:scale-[1.05]" aria-label={`Creator: ${content.creator_name || content.creator_username || 'Unknown'}`}>
                {(content.creator_name || content.creator_username || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                {creatorProfilePath ? (
                  <Link
                    to={creatorProfilePath}
                    onClick={(e) => e.stopPropagation()}
                    className="font-semibold text-pr-text-1 text-base hover:text-orange-600 transition-colors cursor-pointer focus:outline-none focus:text-orange-600"
                    aria-label={`Creator name: ${content.creator_name || content.creator_username || 'Unknown Creator'}`}
                  >
                    {content.creator_name || content.creator_username || 'Unknown Creator'}
                  </Link>
                ) : (
                  <span className="font-semibold text-pr-text-1 text-base" role="text" aria-label={`Creator name: ${content.creator_name || content.creator_username || 'Unknown Creator'}`}>
                    {content.creator_name || content.creator_username || 'Unknown Creator'}
                  </span>
                )}
                <span className="text-gray-400">•</span>
                <span className="text-sm text-pr-text-2">{postedDateLabel}</span>
                {content.platform && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-pr-text-2 capitalize">{content.platform}</span>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-pr-text-2">
                  {formatNumber(ownedShares)} shares owned
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-pr-text-2">
                  {formatNumber(totalShares)} total shares
                </span>
                {engagementSharesRemaining > 0 && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-green-600 font-medium">
                      {formatNumber(engagementSharesRemaining)} free shares available
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center space-x-1 text-green-600 mb-1 transition-all duration-200 hover:text-green-700 hover:bg-green-50 px-2 py-1 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400/50" role="text" aria-label={`Current revenue: $${revenue.toFixed(2)}`}>
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold">${revenue.toFixed(2)}</span>
            </div>
            <div className="text-xs text-pr-text-2">Current Revenue</div>
          </div>
        </div>

        {/* Platform URL */}
        {content.platform_url && (
          <div className="p-3 bg-pr-surface-2 rounded-lg border border-pr-border transition-all duration-200 hover:bg-pr-surface-2 hover:border-pr-surface-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ExternalLink className="w-4 h-4 text-pr-text-2" aria-hidden="true" />
                <span className="text-sm text-pr-text-2">View on {content.platform}</span>
              </div>
              <a
                href={content.platform_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-800 text-sm font-medium transition-all duration-200 hover:bg-orange-50 px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:bg-orange-50"
                onClick={(e) => e.stopPropagation()}
                aria-label={`Open content on ${content.platform} (opens in new tab)`}
              >
                Open Link
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Stats Section - Using StatBar component */}
      <StatBar
        content={content}
        onSocialAction={onSocialAction}
        onShare={onShare}
        onComment={onComment}
      />

      {/* Actions Section - Using ButtonGroup component */}
      <ButtonGroup
        content={content}
        onBuyShares={onBuyShares}
        onPredict={onPredict}
        onTip={onTip}
        currentUser={currentUser}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
