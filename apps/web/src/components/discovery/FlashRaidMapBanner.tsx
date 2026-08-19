import React from 'react';
import { MapPin, Zap, Navigation, ShieldAlert, Sparkles } from 'lucide-react';
import { FlashRaid } from '../../types/viralPlaybooks';

interface FlashRaidMapBannerProps {
  raid: FlashRaid;
  onClaim: (raidId: string) => void;
}

export const FlashRaidMapBanner: React.FC<FlashRaidMapBannerProps> = ({ raid, onClaim }) => {
  return (
    <div className="p-4 bg-gradient-to-r from-yellow-950/60 via-amber-900/40 to-slate-900 border border-amber-500/50 rounded-2xl shadow-xl text-white backdrop-blur-md">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-500 text-black font-black text-[10px] tracking-wider uppercase rounded-full animate-pulse">
            <Zap className="w-3 h-3 fill-black" /> POKÉMON GO FLASH RAID
          </span>
          <span className="text-xs font-mono text-amber-300 font-bold">{raid.rewardMultiplier}x Reward Boost!</span>
        </div>

        <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
          <Navigation className="w-3.5 h-3.5 text-amber-400" /> {raid.distanceFormatted}
        </span>
      </div>

      <div className="mb-3">
        <h3 className="text-base font-bold text-white">{raid.title}</h3>
        <p className="text-xs text-gray-300 flex items-center gap-1 mt-0.5">
          <MapPin className="w-3.5 h-3.5 text-rose-400" /> {raid.merchantName} ({raid.radiusMeters}m radius check-in)
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-300">
          <strong className="text-amber-400">{raid.claimedSpots}</strong> / {raid.totalSpots} Raiders Claimed
        </div>

        {raid.userWithinRadius ? (
          <button
            onClick={() => onClaim(raid.id)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-xs rounded-xl shadow-lg hover:brightness-110 transition animate-bounce"
          >
            <Sparkles className="w-4 h-4 fill-black" /> CLAIM RAID DROP NOW
          </button>
        ) : (
          <button
            disabled
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 text-gray-400 border border-gray-700 text-xs rounded-xl cursor-not-allowed"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Walk closer to unlock
          </button>
        )}
      </div>
    </div>
  );
};
