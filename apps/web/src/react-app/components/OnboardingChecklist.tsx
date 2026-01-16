import { useState, useEffect } from 'react';
import { Link as _Link } from 'react-router-dom';
import {
  CheckCircle as _CheckCircle,
  Circle as _Circle,
  Instagram as _Instagram,
  Gift as _Gift,
  TrendingUp as _TrendingUp,
  Users as _Users,
  Sparkles as _Sparkles,
  ChevronDown as _ChevronDown,
  ChevronUp as _ChevronUp,
  Trophy as _Trophy,
} from 'lucide-react';

const Link = _Link as any;
const CheckCircle = _CheckCircle as any;
const Circle = _Circle as any;
const Instagram = _Instagram as any;
const Gift = _Gift as any;
const TrendingUp = _TrendingUp as any;
const Users = _Users as any;
const Sparkles = _Sparkles as any;
const ChevronDown = _ChevronDown as any;
const ChevronUp = _ChevronUp as any;
const Trophy = _Trophy as any;

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
  reward?: string;
}

interface OnboardingChecklistProps {
  userData?: {
    instagram_connected?: boolean;
    total_drops_completed?: number;
    total_shares_owned?: number;
    referral_count?: number;
  };
  onComplete?: () => void;
}

export default function OnboardingChecklist({ userData, onComplete }: OnboardingChecklistProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  const checklistItems: ChecklistItem[] = [
    {
      id: 'instagram',
      label: 'Connect Instagram',
      description: 'Link your account to unlock social features',
      href: '/settings?tab=social',
      icon: Instagram,
      completed: userData?.instagram_connected || false,
      reward: '+50 Points',
    },
    {
      id: 'first_drop',
      label: 'Complete First Drop',
      description: 'Earn gems by completing a task',
      href: '/earn',
      icon: Gift,
      completed: (userData?.total_drops_completed || 0) > 0,
      reward: '+25 Gems',
    },
    {
      id: 'first_share',
      label: 'Buy First Share',
      description: 'Invest in creator content',
      href: '/market',
      icon: TrendingUp,
      completed: (userData?.total_shares_owned || 0) > 0,
      reward: '+10 Points',
    },
    {
      id: 'first_referral',
      label: 'Invite a Friend',
      description: 'Share your referral link',
      href: '/referrals',
      icon: Users,
      completed: (userData?.referral_count || 0) > 0,
      reward: '+100 Points',
    },
  ];

  const completedCount = checklistItems.filter((item) => item.completed).length;
  const totalCount = checklistItems.length;
  const progress = (completedCount / totalCount) * 100;
  const allComplete = completedCount === totalCount;

  useEffect(() => {
    if (allComplete && onComplete) {
      onComplete();
    }
  }, [allComplete, onComplete]);

  useEffect(() => {
    const wasDismissed = localStorage.getItem('onboarding_checklist_dismissed');
    if (wasDismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  if (dismissed || allComplete) return null;

  return (
    <div className="bg-pr-surface-card rounded-xl border border-pr-border overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-pr-surface-2 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-pr-text-1 text-sm">Getting Started</h3>
            <p className="text-xs text-pr-text-2">
              {completedCount}/{totalCount} completed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-16 h-2 bg-pr-surface-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-pr-text-2" />
          ) : (
            <ChevronDown className="w-4 h-4 text-pr-text-2" />
          )}
        </div>
      </button>

      {/* Checklist items */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          {checklistItems.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                item.completed
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-pr-surface-2 hover:bg-pr-surface-3'
              }`}
            >
              {item.completed ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-pr-text-2 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    item.completed ? 'text-green-700 dark:text-green-400 line-through' : 'text-pr-text-1'
                  }`}
                >
                  {item.label}
                </p>
                <p className="text-xs text-pr-text-2 truncate">{item.description}</p>
              </div>
              {item.reward && !item.completed && (
                <span className="text-xs font-medium text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                  {item.reward}
                </span>
              )}
            </Link>
          ))}

          {/* Completion reward */}
          <div className="mt-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                Complete all to unlock: Starter Badge + 50 Bonus Gems
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
