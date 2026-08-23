import React from 'react';
import { Flame, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

interface SlotScarcityBannerProps {
  windowName?: string;
  totalSlots?: number;
  remainingSlots?: number;
  closesInHours?: number;
  onBookSlot?: () => void;
}

export const SlotScarcityBanner: React.FC<SlotScarcityBannerProps> = ({
  windowName = 'Campaign Window B',
  totalSlots = 10,
  remainingSlots = 3,
  closesInHours = 18,
  onBookSlot,
}) => {
  const percentageFilled = Math.round(((totalSlots - remainingSlots) / totalSlots) * 100);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-950/60 via-gray-900/90 to-purple-950/60 border border-orange-500/30 p-4 shadow-xl mb-6">
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start md:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 shrink-0">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 border border-orange-500/30">
                Live Scarcity Counter
              </span>
              <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-500" /> Closes in {closesInHours}h
              </span>
            </div>
            <h3 className="text-sm md:text-base font-black text-white mt-1">
              {windowName}: <span className="text-orange-400">{remainingSlots} of {totalSlots}</span> slots left this week
            </h3>
            <p className="text-xs text-gray-400">
              Advertisers and Creators: Claim a sponsored slot before the Friday window locks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {/* Progress bar */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-bold text-gray-400 mb-1">
              {percentageFilled}% Allocated
            </span>
            <div className="w-28 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700/60">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${percentageFilled}%` }}
              />
            </div>
          </div>

          <button
            onClick={onBookSlot}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-xs transition-all shadow-lg shadow-orange-500/20 flex items-center gap-1.5 active:scale-95"
          >
            <span>Claim Slot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
