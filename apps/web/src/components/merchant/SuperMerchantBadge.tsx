import React from 'react';
import { Award, ShieldCheck, Star } from 'lucide-react';
import { SuperMerchantInfo } from '../../types/viralPlaybooks';

interface SuperMerchantBadgeProps {
  info: SuperMerchantInfo;
  showDetails?: boolean;
}

export const SuperMerchantBadge: React.FC<SuperMerchantBadgeProps> = ({ info, showDetails = false }) => {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/40 rounded-full backdrop-blur-md">
      <Award className="w-4 h-4 text-amber-400 fill-amber-400/30 animate-pulse" />
      <span className="text-xs font-bold text-amber-300 tracking-wide">{info.badgeTitle}</span>

      {showDetails && (
        <div className="flex items-center gap-2 border-l border-amber-500/30 pl-2 ml-1 text-xs text-gray-300">
          <span className="flex items-center gap-0.5 font-bold text-amber-400">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {info.trustScore}
          </span>
          <span className="text-[10px] text-gray-400">({info.totalRedemptions}+ Redemptions)</span>
        </div>
      )}
    </div>
  );
};
