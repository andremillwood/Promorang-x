import React from 'react';
import { Sparkles, Flame, Plus, Gift, Zap } from 'lucide-react';

interface StoryItem {
  id: string;
  title: string;
  avatar: string;
  isAction?: boolean;
  hasUnread?: boolean;
  type?: 'wheel' | 'streak' | 'moment' | 'drop';
}

interface StoryGamificationRailProps {
  onOpenWheel?: () => void;
  onOpenStreak?: () => void;
}

const MOCK_STORIES: StoryItem[] = [
  {
    id: 'wheel',
    title: 'Daily Wheel',
    avatar: '',
    isAction: true,
    type: 'wheel',
  },
  {
    id: 'streak',
    title: 'Day 3 Streak',
    avatar: '',
    isAction: true,
    type: 'streak',
  },
  {
    id: '1',
    title: 'Kingston Scene',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    hasUnread: true,
    type: 'moment',
  },
  {
    id: '2',
    title: '@alex_m',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    hasUnread: true,
    type: 'drop',
  },
  {
    id: '3',
    title: 'Nike Flash Drop',
    avatar: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80',
    hasUnread: false,
    type: 'drop',
  },
];

export const StoryGamificationRail: React.FC<StoryGamificationRailProps> = ({
  onOpenWheel,
  onOpenStreak,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-3 px-1 flex items-center gap-3">
      {MOCK_STORIES.map((story) => {
        if (story.type === 'wheel') {
          return (
            <button
              key={story.id}
              onClick={onOpenWheel}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-all">
                <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-amber-400 animate-pulse" />
                </div>
              </div>
              <span className="text-[11px] font-bold text-amber-400">Daily Wheel</span>
            </button>
          );
        }

        if (story.type === 'streak') {
          return (
            <button
              key={story.id}
              onClick={onOpenStreak}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 p-0.5 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-all">
                <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                  <Gift className="w-7 h-7 text-orange-400" />
                </div>
              </div>
              <span className="text-[11px] font-bold text-orange-400">Day 3 Streak</span>
            </button>
          );
        }

        return (
          <div
            key={story.id}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <div
              className={`w-16 h-16 rounded-2xl p-0.5 transition-all group-hover:scale-105 ${
                story.hasUnread
                  ? 'bg-gradient-to-tr from-orange-500 via-amber-400 to-orange-500 shadow-md shadow-orange-500/20'
                  : 'bg-zinc-800'
              }`}
            >
              <img
                src={story.avatar}
                alt={story.title}
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <span className="text-[11px] font-medium text-zinc-300 max-w-[64px] truncate">
              {story.title}
            </span>
          </div>
        );
      })}
    </div>
  );
};
