import React from 'react';
import { Users, Flame, CheckCircle2, Clock } from 'lucide-react';
import { TippingStatus } from '../../types/grouponMechanics';

interface TippingProgressBarProps {
  currentClaims: number;
  tippingThreshold: number;
  tippingStatus: TippingStatus;
  tippingDeadline?: string;
  className?: string;
}

export const TippingProgressBar: React.FC<TippingProgressBarProps> = ({
  currentClaims,
  tippingThreshold,
  tippingStatus,
  tippingDeadline,
  className = '',
}) => {
  const percentage = Math.min(100, Math.round((currentClaims / tippingThreshold) * 100));
  const remaining = Math.max(0, tippingThreshold - currentClaims);
  const isTipped = tippingStatus === 'tipped' || currentClaims >= tippingThreshold;

  return (
    <div className={`p-4 bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-purple-950/40 border border-amber-500/30 rounded-xl shadow-lg backdrop-blur-md ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isTipped ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold rounded-full animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5" /> DEAL TIPPED & ACTIVE!
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-full">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" /> COLLECTIVE TIPPING DROP
            </span>
          )}
        </div>

        {tippingDeadline && !isTipped && (
          <div className="flex items-center gap-1 text-xs text-amber-300 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>Ends soon</span>
          </div>
        )}
      </div>

      {/* Progress Bar Container */}
      <div className="relative w-full h-3 bg-gray-800/80 rounded-full overflow-hidden mb-2 border border-gray-700/50">
        <div
          className={`h-full transition-all duration-700 ease-out rounded-full ${
            isTipped
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-gray-300 flex items-center gap-1">
          <Users className="w-3.5 h-3.5 text-amber-400" />
          <strong className="text-white">{currentClaims}</strong> / {tippingThreshold} claimed
        </span>

        {isTipped ? (
          <span className="text-emerald-400 font-semibold">Ready to redeem immediately!</span>
        ) : (
          <span className="text-amber-300 font-semibold">
            {remaining} more needed to activate deal!
          </span>
        )}
      </div>
    </div>
  );
};
