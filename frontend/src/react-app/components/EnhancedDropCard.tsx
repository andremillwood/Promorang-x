import { useNavigate } from 'react-router-dom';
import { DropType } from '@/shared/types';
import { Clock, Users, Target, Star, TrendingUp, Calendar, Award } from 'lucide-react';
import { Routes as RoutePaths } from '@/react-app/utils/url';

interface EnhancedDropCardProps {
  drop: DropType;
  onApply?: (drop: DropType) => void;
}

export default function EnhancedDropCard({ drop, onApply }: EnhancedDropCardProps) {
  const navigate = useNavigate();
  const formatLabel = (value?: string | null, fallback = 'Unknown') => {
    const label = value && value.trim().length > 0 ? value : fallback;
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  const getDifficultyColor = (difficulty?: string | null) => {
    const level = (difficulty || '').toLowerCase();
    switch (level) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status?: string | null) => {
    const state = (status || '').toLowerCase();
    switch (state) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `${diffDays} days left`;
    }
  };

  const getRewardPerKey = () => {
    if (drop.key_cost === 0) return 0;
    return (drop.gem_reward_base / drop.key_cost).toFixed(1);
  };

  const handleCardClick = () => {
    navigate(RoutePaths.drop(String(drop.id)));
  };

  const previewImage = drop.preview_image || drop.content_url || `https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1200&q=80&sat=-15&sig=${drop.id}`;

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-gray-200"
      onClick={handleCardClick}
    >
      <div className="mb-4 -mx-5 -mt-5">
        <div className="h-40 w-full overflow-hidden rounded-t-xl">
          <img
            src={previewImage}
            alt={drop.title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(event) => {
              (event.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80&sig=${drop.id}`;
            }}
          />
        </div>
      </div>

      {/* Header with Creator Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {(drop.creator_name || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-900 text-base hover:text-purple-600 transition-colors">
                {drop.creator_name || 'Unknown Creator'}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-500">
                {new Date(drop.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-500">
                {drop.current_participants} participants
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">
                {drop.platform || 'Any platform'}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center space-x-1 text-purple-600 mb-1">
            <Award className="w-4 h-4" />
            <span className="text-sm font-semibold">
              {drop.gem_pool_remaining} gems
            </span>
          </div>
          <div className="text-xs text-gray-500">Pool Remaining</div>
        </div>
      </div>

      {/* Title and Description */}
      <div className="mb-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold text-lg text-gray-900 mb-2 hover:text-purple-600 transition-colors leading-tight">
          {drop.title}
        </h3>
        {drop.description && (
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{drop.description}</p>
        )}
      </div>

      {/* Status and Difficulty Badges */}
      <div className="flex items-center space-x-2 mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(drop.status)}`}>
          {drop.status.charAt(0).toUpperCase() + drop.status.slice(1)}
        </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(drop.difficulty)}`}>
              {formatLabel(drop.difficulty)}
            </span>
        {drop.is_proof_drop && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            Proof Drop
          </span>
        )}
        {drop.is_paid_drop && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            Paid Drop
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Target className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-gray-500">Cost</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{drop.key_cost}</div>
          <div className="text-xs text-gray-500">keys</div>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-gray-500">Reward</span>
          </div>
          <div className="text-lg font-bold text-purple-600">{drop.gem_reward_base}</div>
          <div className="text-xs text-gray-500">gems</div>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-500">ROI</span>
          </div>
          <div className="text-lg font-bold text-green-600">{getRewardPerKey()}x</div>
          <div className="text-xs text-gray-500">per key</div>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-500">Participants</span>
          </div>
          <div className="text-lg font-bold text-blue-600">{drop.current_participants}</div>
          <div className="text-xs text-gray-500">joined</div>
        </div>
      </div>

      {/* Deadline and Requirements */}
      <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4" />
          <span>{drop.deadline_at ? formatDeadline(drop.deadline_at) : 'No deadline'}</span>
        </div>

        {drop.requirements && (
          <div className="text-xs">
            Requirements: {drop.requirements.length > 30
              ? drop.requirements.substring(0, 30) + '...'
              : drop.requirements}
          </div>
        )}
      </div>

      {/* Apply Button */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Created {new Date(drop.created_at).toLocaleDateString()}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onApply?.(drop);
          }}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
            drop.status?.toLowerCase() === 'active'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white hover:shadow-lg hover:-translate-y-0.5'
              : 'bg-gray-100 text-gray-500 cursor-not-allowed'
          }`}
          disabled={drop.status?.toLowerCase() !== 'active'}
        >
          {drop.status?.toLowerCase() === 'active' ? (
            <>
              <span>Apply Now</span>
              <Target className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Not Available</span>
              <Clock className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
