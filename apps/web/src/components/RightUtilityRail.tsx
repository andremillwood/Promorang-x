import React from 'react';
import { Flame, Users, Calendar, Sparkles, Bookmark, ArrowRight, Zap } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';

interface RightUtilityRailProps {
  onOpenSlashModal?: () => void;
  onOpenStreakModal?: () => void;
}

export const RightUtilityRail: React.FC<RightUtilityRailProps> = ({
  onOpenSlashModal,
  onOpenStreakModal,
}) => {
  const { t } = useI18n();

  return (
    <aside className="hidden lg:flex flex-col gap-5 w-80 shrink-0 sticky top-20 h-fit">
      {/* 1. Active Squad Slash Widget */}
      <div className="bg-zinc-900/80 border border-orange-500/30 rounded-3xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{t("promoshare.activeSquadSlash")}</h3>
              <p className="text-[10px] text-zinc-400">2 slots open • Expiring in 14:59</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 mb-4">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-zinc-400 font-medium">{t("promoshare.squadProgress")}</span>
            <span className="text-orange-400 font-bold">1 / 3 Friends</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" />
          </div>
        </div>

        <button
          onClick={onOpenSlashModal}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-400 text-black flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-orange-500/20"
        >
          <Users className="w-3.5 h-3.5" />
          <span>{t("promoshare.inviteFriendsSlash")}</span>
        </button>
      </div>

      {/* 2. 7-Day Rewards Chest Matrix Widget */}
      <div className="bg-zinc-900/80 border border-amber-500/30 rounded-3xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{t("promoshare.dayStreakActive")}</h3>
              <p className="text-[10px] text-zinc-400">Claim today's 1x Piece Boost</p>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenStreakModal}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-500/30 flex items-center justify-center gap-1.5 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t("promoshare.viewStreakMatrix")}</span>
        </button>
      </div>

      {/* 3. Saved Perks & Urgency Bookmarks */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-3">
          <Bookmark className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-bold text-white">Saved Perks (2 Expiry Alerts)</h3>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Nike Air Max Coupon</p>
              <p className="text-[10px] text-red-400 font-semibold">Expires in 2 hours</p>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500" />
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Starbucks Upgrade Piece</p>
              <p className="text-[10px] text-orange-400 font-semibold">Expires today</p>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500" />
          </div>
        </div>
      </div>
    </aside>
  );
};
