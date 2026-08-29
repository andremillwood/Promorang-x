import React from 'react';
import { Flame, Snowflake, ShieldCheck, Zap } from 'lucide-react';
import { UserExplorationStreak } from '../../types/viralPlaybooks';

interface ExplorationStreakWidgetProps {
  streak: UserExplorationStreak;
}

export const ExplorationStreakWidget: React.FC<ExplorationStreakWidgetProps> = ({ streak }) => {
  return (
    <div className="p-4 bg-gradient-to-r from-orange-950/40 via-amber-950/30 to-slate-900 border border-orange-500/40 rounded-2xl shadow-lg text-white flex items-center justify-between">
      <div className="flex items-center gap-3.5">
        <div className="relative p-3 bg-orange-500/20 border border-orange-500/50 rounded-xl text-orange-400">
          <Flame className="w-7 h-7 text-orange-500 animate-pulse fill-orange-500/30" />
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-orange-600 text-white text-[9px] font-black rounded-full">
            {streak.currentStreakDays}d
          </span>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-orange-300 uppercase tracking-wider">Daily streak</span>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold rounded-md">
              {streak.yieldMultiplier}x more rewards
            </span>
          </div>
          <h4 className="text-sm font-bold text-white">
            {streak.currentStreakDays} day streak
          </h4>
          <p className="text-xs text-gray-400">Keep showing up this week to keep it.</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-2.5 py-1.5 bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-xs rounded-xl">
          <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold">{streak.streakFreezesAvailable} Freeze</span>
        </div>
      </div>
    </div>
  );
};
