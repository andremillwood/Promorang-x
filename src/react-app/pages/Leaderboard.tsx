import { useEffect, useState } from 'react';
import {
  Trophy,
  Crown,
  Star,
  Zap,
  Key,
  Diamond,
  Medal,
  TrendingUp,
  Flame,
  ShieldCheck
} from 'lucide-react';

type LeaderboardEntry = {
  id: number;
  display_name: string;
  username: string;
  avatar_url: string;
  points_earned: number;
  gems_earned: number;
  keys_used: number;
  gold_collected: number;
  composite_score: number;
};

export default function Leaderboard() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/leaderboard/${period}`);
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const topThree = leaderboard.slice(0, 3);
  const remainingRankings = leaderboard.slice(3);

  // Position ordering for 3D Podium: Rank 2 (Left), Rank 1 (Center Elevated), Rank 3 (Right)
  const podiumRank2 = topThree[1];
  const podiumRank1 = topThree[0];
  const podiumRank3 = topThree[2];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 space-y-4">
        <div className="animate-spin w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full shadow-[0_0_20px_rgba(255,215,0,0.4)]"></div>
        <p className="text-gray-400 text-sm font-medium animate-pulse">Calculating Leaderboard Scores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 min-h-screen text-slate-100 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/40 via-neutral-900/90 to-yellow-950/40 border border-yellow-500/20 p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Flame className="w-3.5 h-3.5" />
              <span>Live Leaderboard</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center space-x-3">
              <Trophy className="w-9 h-9 text-yellow-400 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
              <span>Platform Leaderboard</span>
            </h1>
            <p className="text-gray-400 mt-2 max-w-xl text-sm leading-relaxed">
              Top performers earning Gems, Gold, and Keys across the Promorang gamified economy.
            </p>
          </div>

          {/* Period Selector Tabs */}
          <div className="flex p-1.5 rounded-xl bg-black/50 border border-white/10 backdrop-blur-md">
            {[
              { key: 'daily', label: 'Today', icon: Zap },
              { key: 'weekly', label: 'This Week', icon: TrendingUp },
              { key: 'monthly', label: 'This Month', icon: Star }
            ].map((periodOption) => {
              const Icon = periodOption.icon;
              const isActive = period === periodOption.key;
              return (
                <button
                  key={periodOption.key}
                  onClick={() => setPeriod(periodOption.key as any)}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black shadow-[0_0_20px_rgba(255,215,0,0.4)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-yellow-400'}`} />
                  <span>{periodOption.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Composite Score Formula Legend */}
      <div className="rounded-xl bg-white/[0.03] border border-white/10 p-5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Composite Score Weighting Formula</span>
          </h3>
          <span className="text-[11px] text-gray-500">Updated in Realtime</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="flex items-center space-x-2.5 p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300">
            <Star className="w-3.5 h-3.5 text-blue-400" />
            <span>Points × 0.25</span>
          </div>
          <div className="flex items-center space-x-2.5 p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300">
            <Diamond className="w-3.5 h-3.5 text-purple-400" />
            <span>Gems × 0.40</span>
          </div>
          <div className="flex items-center space-x-2.5 p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-300">
            <Key className="w-3.5 h-3.5 text-orange-400" />
            <span>Keys × 0.15</span>
          </div>
          <div className="flex items-center space-x-2.5 p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-300">
            <Medal className="w-3.5 h-3.5 text-yellow-400" />
            <span>Gold × 0.20</span>
          </div>
        </div>
      </div>

      {/* 3D Gamified Podium Section for Top 3 */}
      {leaderboard.length > 0 && (
        <div className="pt-6 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto">
            {/* Rank 2 - Silver (Left) */}
            {podiumRank2 && (
              <div className="flex flex-col items-center order-2 md:order-1">
                <div className="relative mb-3 group">
                  <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-slate-400 via-slate-200 to-slate-500 shadow-[0_0_20px_rgba(203,213,225,0.3)]">
                    <img
                      src={podiumRank2.avatar_url || '/default-avatar.png'}
                      alt={podiumRank2.display_name}
                      className="w-full h-full rounded-full object-cover border-2 border-black"
                    />
                  </div>
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-slate-300 text-black text-xs font-black px-2.5 py-0.5 rounded-full shadow-lg flex items-center space-x-1 border border-slate-100">
                    <Medal className="w-3 h-3 text-slate-700" />
                    <span>#2</span>
                  </div>
                </div>
                <h4 className="font-bold text-slate-200 text-sm mt-2 text-center truncate max-w-[160px]">
                  {podiumRank2.display_name || 'Anonymous User'}
                </h4>
                <p className="text-xs text-slate-400 mb-3">@{podiumRank2.username || 'user'}</p>

                {/* Silver Podium Base */}
                <div className="w-full h-36 rounded-t-2xl bg-gradient-to-b from-slate-800/80 via-slate-900/90 to-black border-t-2 border-slate-300/50 border-x border-slate-700/30 backdrop-blur-xl p-4 flex flex-col items-center justify-between text-center shadow-lg">
                  <div className="text-xs text-slate-300 font-mono font-semibold">
                    {podiumRank2.composite_score.toFixed(1)} <span className="text-[10px] text-slate-400">PTS</span>
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <p className="text-purple-300 font-medium">💎 {podiumRank2.gems_earned.toLocaleString()}</p>
                    <p className="text-yellow-300 font-medium">🪙 {podiumRank2.gold_collected}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 1 - Gold Champion (Center Elevated) */}
            {podiumRank1 && (
              <div className="flex flex-col items-center order-1 md:order-2 -mt-6">
                <div className="relative mb-3 group">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 animate-bounce">
                    <Crown className="w-8 h-8 text-yellow-300 drop-shadow-[0_0_12px_rgba(255,215,0,0.8)]" />
                  </div>
                  <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-yellow-500 via-amber-300 to-yellow-200 shadow-[0_0_35px_rgba(255,215,0,0.5)]">
                    <img
                      src={podiumRank1.avatar_url || '/default-avatar.png'}
                      alt={podiumRank1.display_name}
                      className="w-full h-full rounded-full object-cover border-2 border-black"
                    />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-400 text-black text-xs font-black px-3 py-0.5 rounded-full shadow-xl flex items-center space-x-1 border border-yellow-200">
                    <Trophy className="w-3.5 h-3.5 text-black" />
                    <span>#1 CHAMPION</span>
                  </div>
                </div>
                <h3 className="font-extrabold text-white text-base mt-3 text-center truncate max-w-[180px]">
                  {podiumRank1.display_name || 'Anonymous User'}
                </h3>
                <p className="text-xs text-yellow-400/90 font-medium mb-3">@{podiumRank1.username || 'user'}</p>

                {/* Gold Champion Podium Base */}
                <div className="w-full h-48 rounded-t-2xl bg-gradient-to-b from-amber-950/60 via-yellow-950/40 to-black border-t-2 border-yellow-400 border-x border-yellow-500/30 backdrop-blur-xl p-5 flex flex-col items-center justify-between text-center shadow-[0_0_30px_rgba(255,215,0,0.15)]">
                  <div className="text-sm text-yellow-300 font-mono font-black tracking-wide">
                    {podiumRank1.composite_score.toFixed(1)} <span className="text-xs text-yellow-500/80">PTS</span>
                  </div>
                  <div className="text-xs text-amber-200/90 space-y-1">
                    <p className="text-purple-300 font-bold">💎 {podiumRank1.gems_earned.toLocaleString()} Gems</p>
                    <p className="text-yellow-300 font-bold">🪙 {podiumRank1.gold_collected} Gold</p>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 3 - Bronze (Right) */}
            {podiumRank3 && (
              <div className="flex flex-col items-center order-3">
                <div className="relative mb-3 group">
                  <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-amber-700 via-amber-500 to-amber-800 shadow-[0_0_20px_rgba(217,119,6,0.3)]">
                    <img
                      src={podiumRank3.avatar_url || '/default-avatar.png'}
                      alt={podiumRank3.display_name}
                      className="w-full h-full rounded-full object-cover border-2 border-black"
                    />
                  </div>
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-amber-700 text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-lg flex items-center space-x-1 border border-amber-500">
                    <Medal className="w-3 h-3 text-amber-200" />
                    <span>#3</span>
                  </div>
                </div>
                <h4 className="font-bold text-slate-200 text-sm mt-2 text-center truncate max-w-[160px]">
                  {podiumRank3.display_name || 'Anonymous User'}
                </h4>
                <p className="text-xs text-slate-400 mb-3">@{podiumRank3.username || 'user'}</p>

                {/* Bronze Podium Base */}
                <div className="w-full h-32 rounded-t-2xl bg-gradient-to-b from-amber-950/40 via-neutral-900/90 to-black border-t-2 border-amber-600/50 border-x border-amber-800/30 backdrop-blur-xl p-4 flex flex-col items-center justify-between text-center shadow-lg">
                  <div className="text-xs text-amber-200 font-mono font-semibold">
                    {podiumRank3.composite_score.toFixed(1)} <span className="text-[10px] text-amber-400/70">PTS</span>
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <p className="text-purple-300 font-medium">💎 {podiumRank3.gems_earned.toLocaleString()}</p>
                    <p className="text-yellow-300 font-medium">🪙 {podiumRank3.gold_collected}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard List (Rank 4+) */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-1">
          Full Economy Rankings
        </h3>

        {remainingRankings.length > 0 ? (
          remainingRankings.map((entry, index) => {
            const rank = index + 4;
            return (
              <div
                key={entry.id}
                className="rounded-xl bg-white/[0.03] border border-white/10 p-4 transition-all duration-300 hover:bg-white/[0.06] hover:border-yellow-500/30 backdrop-blur-md group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Rank Badge */}
                    <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-gray-300 group-hover:text-yellow-400 group-hover:border-yellow-500/40 transition-colors">
                      #{rank}
                    </div>

                    <div className="flex items-center space-x-3">
                      <img
                        src={entry.avatar_url || '/default-avatar.png'}
                        alt={entry.display_name}
                        className="w-10 h-10 rounded-full object-cover border border-white/20"
                      />
                      <div>
                        <h4 className="font-semibold text-white text-sm group-hover:text-yellow-300 transition-colors">
                          {entry.display_name || 'Anonymous User'}
                        </h4>
                        <p className="text-xs text-gray-400">
                          @{entry.username || 'user'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-5 md:space-x-8">
                    {/* Points */}
                    <div className="hidden sm:flex items-center space-x-1.5">
                      <Star className="w-3.5 h-3.5 text-blue-400" />
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-200">{entry.points_earned.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-500">Points</p>
                      </div>
                    </div>

                    {/* Gems */}
                    <div className="flex items-center space-x-1.5">
                      <Diamond className="w-3.5 h-3.5 text-purple-400" />
                      <div className="text-right">
                        <p className="text-xs font-bold text-purple-300">{entry.gems_earned.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-500">Gems</p>
                      </div>
                    </div>

                    {/* Keys */}
                    <div className="hidden md:flex items-center space-x-1.5">
                      <Key className="w-3.5 h-3.5 text-orange-400" />
                      <div className="text-right">
                        <p className="text-xs font-bold text-orange-300">{entry.keys_used}</p>
                        <p className="text-[10px] text-gray-500">Keys</p>
                      </div>
                    </div>

                    {/* Gold */}
                    <div className="flex items-center space-x-1.5">
                      <Medal className="w-3.5 h-3.5 text-yellow-400" />
                      <div className="text-right">
                        <p className="text-xs font-bold text-yellow-300">{entry.gold_collected}</p>
                        <p className="text-[10px] text-gray-500">Gold</p>
                      </div>
                    </div>

                    {/* Composite Score Badge */}
                    <div className="text-right pl-4 border-l border-white/10">
                      <p className="text-base font-black text-yellow-400 font-mono">{entry.composite_score.toFixed(1)}</p>
                      <p className="text-[10px] text-gray-400">Score</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : leaderboard.length <= 3 ? null : (
          <div className="text-center py-12 rounded-xl bg-white/[0.02] border border-white/5">
            <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-gray-300 mb-1">No Additional Rankings</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Complete drops and participate in forecast markets to earn your spot on the global leaderboard!
            </p>
          </div>
        )}
      </div>

      {/* Aggregate Competition Stats */}
      {leaderboard.length > 0 && (
        <div className="rounded-xl bg-gradient-to-r from-neutral-900/90 via-black/80 to-neutral-900/90 border border-yellow-500/20 p-6 backdrop-blur-xl shadow-xl">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider flex items-center space-x-2">
            <Flame className="w-4 h-4 text-yellow-400" />
            <span>Economy Aggregates ({period})</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
              <p className="text-xl font-black text-blue-400 font-mono">
                {leaderboard.reduce((sum, entry) => sum + entry.points_earned, 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">Total Points</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
              <p className="text-xl font-black text-purple-400 font-mono">
                {leaderboard.reduce((sum, entry) => sum + entry.gems_earned, 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">Total Gems</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
              <p className="text-xl font-black text-orange-400 font-mono">
                {leaderboard.reduce((sum, entry) => sum + entry.keys_used, 0)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Keys Used</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
              <p className="text-xl font-black text-yellow-400 font-mono">
                {leaderboard.reduce((sum, entry) => sum + entry.gold_collected, 0)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Gold Collected</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

