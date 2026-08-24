import React, { useState } from 'react';
import { Trophy, Flame, Sparkles, Camera, Award, TrendingUp, Users, ArrowRight, Star, Heart, CheckCircle2 } from 'lucide-react';

interface LeaderboardItem {
  rank: number;
  id: string;
  title: string;
  subtitle: string;
  stat: string;
  secondaryStat?: string;
  badge?: string;
  avatar?: string;
  isTrending?: boolean;
}

const TOP_DISCOVERIES: LeaderboardItem[] = [
  {
    rank: 1,
    id: 'disc-1',
    title: 'Sweetwood Jerk Joint',
    subtitle: 'Kingston Jerk Debate • Voted by 48 foodies',
    stat: '112 Total Votes',
    secondaryStat: '48% Share',
    badge: 'Trending #1',
    isTrending: true,
  },
  {
    rank: 2,
    id: 'disc-2',
    title: "Gloria's Seafood City",
    subtitle: 'Port Royal Escovitch Fish Champion',
    stat: '86 Total Votes',
    secondaryStat: '41% Share',
    badge: 'Demand Met',
  },
  {
    rank: 3,
    id: 'disc-3',
    title: "Tracks & Records FAT Wednesdays",
    subtitle: 'After-Work Table Hangout',
    stat: '58 Total Votes',
    secondaryStat: '27 Keys Pending',
  },
  {
    rank: 4,
    id: 'disc-4',
    title: 'Strawberry Hill Sunset Vinyl',
    subtitle: 'High Tea & Mountain Listening Session',
    stat: '46 Total Votes',
    secondaryStat: 'Community Vote',
  }
];

const TOP_MOMENTS: LeaderboardItem[] = [
  {
    rank: 1,
    id: 'mom-1',
    title: 'Encore R&B Brunch & Daytime Party',
    subtitle: 'The Terrace Kingston • Weekly Anchor',
    stat: '184 Check-ins',
    secondaryStat: '98% Retention',
    badge: 'Kingston #1 Moment',
    isTrending: true,
  },
  {
    rank: 2,
    id: 'mom-2',
    title: 'Uptown Mondays Authentic Street Dance',
    subtitle: 'Savannah Plaza • 10:00 PM',
    stat: '310 Attendees',
    secondaryStat: '100% Verified',
    badge: 'Sound System King',
  },
  {
    rank: 3,
    id: 'mom-3',
    title: 'Kingston Dub Club Sunday Roots Session',
    subtitle: "Jack's Hill Skyline Overlook",
    stat: '215 Attendees',
    secondaryStat: '50 Keys Claimed',
  },
  {
    rank: 4,
    id: 'mom-4',
    title: 'FAT Wednesdays Live Social & Game Night',
    subtitle: "Usain Bolt's Tracks & Records",
    stat: '220 Attendees',
    secondaryStat: '15 Keys Active',
  }
];

const TOP_SCOUTS: LeaderboardItem[] = [
  {
    rank: 1,
    id: 'scout-1',
    title: 'Jules (@KingstonFoodies)',
    subtitle: 'Culinary Scout • 8 Discoveries Published',
    stat: '1,420 Movement Attributed',
    secondaryStat: '+850 Gems',
    badge: 'Genesis Guild Leader',
    isTrending: true,
  },
  {
    rank: 2,
    id: 'scout-2',
    title: 'Chef Andre (Culinary Steward)',
    subtitle: 'Tasting Host • 5 Curated Drops',
    stat: '940 Movement Attributed',
    secondaryStat: '+620 Gems',
    badge: 'Master Curator',
  },
  {
    rank: 3,
    id: 'scout-3',
    title: 'Marcus Nightlife Selector',
    subtitle: 'Culture Scout • 4 Sound Sessions',
    stat: '810 Movement Attributed',
    secondaryStat: '+490 Gems',
  },
  {
    rank: 4,
    id: 'scout-4',
    title: 'Maya R. (Creative Workshop Lead)',
    subtitle: 'Art & Pottery Guide • 3 Sessions',
    stat: '540 Movement Attributed',
    secondaryStat: '+380 Gems',
  }
];

export const RadarLeaderboards: React.FC = () => {
  const [boardType, setBoardType] = useState<'DISCOVERIES' | 'MOMENTS' | 'SCOUTS'>('DISCOVERIES');

  const currentList = 
    boardType === 'DISCOVERIES' ? TOP_DISCOVERIES :
    boardType === 'MOMENTS' ? TOP_MOMENTS : TOP_SCOUTS;

  return (
    <div className="rounded-3xl bg-gradient-to-b from-gray-900 via-gray-950 to-gray-950 border border-gray-800 p-5 md:p-7 shadow-2xl mb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center">
              <Trophy className="w-3 h-3 mr-1" /> Verified Proof & Status
            </span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-400 font-semibold">Kingston Power Rankings</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white">
            Culture & Movement Leaderboards
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time rankings powered by verified community votes, physical door check-ins, and attributed creator foot traffic.
          </p>
        </div>

        {/* Board Switcher */}
        <div className="flex items-center bg-gray-900 border border-gray-800 p-1 rounded-2xl w-fit">
          <button
            onClick={() => setBoardType('DISCOVERIES')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1 ${
              boardType === 'DISCOVERIES' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 mr-1" />
            <span>Top Discoveries</span>
          </button>

          <button
            onClick={() => setBoardType('MOMENTS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1 ${
              boardType === 'MOMENTS' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            <span>Top Moments</span>
          </button>

          <button
            onClick={() => setBoardType('SCOUTS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1 ${
              boardType === 'SCOUTS' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5 mr-1" />
            <span>Top Creator Scouts</span>
          </button>
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {currentList.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl p-4 border transition-all flex items-center justify-between ${
              item.rank === 1
                ? 'bg-gradient-to-r from-amber-950/30 via-gray-900 to-gray-900 border-amber-500/50 shadow-lg shadow-amber-500/5'
                : 'bg-gray-900/60 border-gray-800/80 hover:border-gray-700 hover:bg-gray-850'
            }`}
          >
            <div className="flex items-center space-x-3.5 min-w-0">
              {/* Rank Badge */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                item.rank === 1 ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30 font-black' :
                item.rank === 2 ? 'bg-gray-300 text-black font-bold' :
                item.rank === 3 ? 'bg-amber-800 text-amber-100 font-bold' :
                'bg-gray-800 text-gray-400'
              }`}>
                #{item.rank}
              </div>

              {/* Title & Subtitle */}
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
                  {item.badge && (
                    <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-md text-[9px] font-black uppercase tracking-wider shrink-0">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">{item.subtitle}</p>
              </div>
            </div>

            {/* Stats Column */}
            <div className="text-right shrink-0 pl-3">
              <div className="text-xs font-black text-white">{item.stat}</div>
              {item.secondaryStat && (
                <div className="text-[10px] font-bold text-orange-400 mt-0.5">{item.secondaryStat}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Leaderboard Footer CTA */}
      <div className="mt-5 pt-4 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-orange-400" />
          <span>Rankings update daily at midnight. Weekly winners receive priority PromoKey allocations and venue sponsorship matching.</span>
        </div>
        <a
          href="/pioneers"
          className="text-orange-400 hover:text-orange-300 font-bold text-xs flex items-center space-x-1 shrink-0"
        >
          <span>View Full Genesis Records</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </a>
      </div>
    </div>
  );
};
