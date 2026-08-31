import React, { useState } from 'react';
import { X, Calendar, Gift, Check, Lock } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import type { TranslationKey } from '@/i18n/translations';

interface DailyRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaim?: (day: number, reward: string) => void;
}

const STREAK_DAYS = [
  { day: 1, rewardKey: 'streak.r1' as const, claimed: true, icon: '💎' },
  { day: 2, rewardKey: 'streak.r2' as const, claimed: true, icon: '💎' },
  { day: 3, rewardKey: 'streak.r3' as const, claimed: false, current: true, icon: '⚡' },
  { day: 4, rewardKey: 'streak.r4' as const, claimed: false, icon: '💎' },
  { day: 5, rewardKey: 'streak.r5' as const, claimed: false, icon: '🚀' },
  { day: 6, rewardKey: 'streak.r6' as const, claimed: false, icon: '💎' },
  { day: 7, rewardKey: 'streak.r7' as const, claimed: false, isGrand: true, icon: '👑' },
];

export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({
  isOpen,
  onClose,
  onClaim,
}) => {
  const { t } = useI18n();
  const [days, setDays] = useState(STREAK_DAYS);
  const [claimedCurrent, setClaimedCurrent] = useState(false);

  if (!isOpen) return null;

  const handleClaimToday = () => {
    const updated = days.map((d) => (d.current ? { ...d, claimed: true, current: false } : d));
    setDays(updated);
    setClaimedCurrent(true);
    if (onClaim) {
      onClaim(3, t("streak.r3"));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl overflow-hidden text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-semibold text-amber-400 mb-3">
          <Calendar className="w-3.5 h-3.5" />
          <span>{t("streak.badge")}</span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">{t("streak.title")}</h2>
        <p className="text-xs text-zinc-400 mb-6">
          {t("streak.copy")}
        </p>

        {/* Matrix Grid */}
        <div className="grid grid-cols-4 gap-2.5 mb-6">
          {days.slice(0, 4).map((d) => (
            <div
              key={d.day}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center relative transition-all ${
                d.claimed
                  ? 'bg-zinc-950 border-zinc-800 opacity-60'
                  : d.current
                  ? 'bg-gradient-to-b from-amber-500/20 to-orange-500/20 border-amber-500 text-white shadow-lg ring-2 ring-amber-500/50 scale-105'
                  : 'bg-zinc-950/40 border-zinc-800 text-zinc-500'
              }`}
            >
              <span className="text-[10px] font-bold text-zinc-400 mb-1">{t("streak.day", { day: d.day })}</span>
              <span className="text-xl mb-1">{d.icon}</span>
              <span className="text-[9px] font-semibold truncate max-w-full">{t(d.rewardKey as TranslationKey)}</span>

              {d.claimed && (
                <div className="absolute top-1 right-1 bg-emerald-500 text-black p-0.5 rounded-full">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {days.slice(4, 7).map((d) => (
            <div
              key={d.day}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center relative transition-all ${
                d.isGrand
                  ? 'col-span-1 bg-gradient-to-b from-amber-500/30 to-orange-600/30 border-amber-400 text-amber-300'
                  : d.claimed
                  ? 'bg-zinc-950 border-zinc-800 opacity-60'
                  : 'bg-zinc-950/40 border-zinc-800 text-zinc-500'
              }`}
            >
              <span className="text-[10px] font-bold text-zinc-400 mb-1">{t("streak.day", { day: d.day })}</span>
              <span className="text-xl mb-1">{d.icon}</span>
              <span className="text-[9px] font-semibold truncate max-w-full">{t(d.rewardKey as TranslationKey)}</span>

              {!d.claimed && !d.current && (
                <div className="absolute top-1 right-1 text-zinc-600">
                  <Lock className="w-3 h-3" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={claimedCurrent ? onClose : handleClaimToday}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          {claimedCurrent ? (
            <span>{t("streak.claimed")}</span>
          ) : (
            <>
              <Gift className="w-4 h-4" />
              <span>{t("streak.claimDay", { day: 3 })}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
