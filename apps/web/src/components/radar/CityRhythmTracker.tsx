import React from 'react';
import { Calendar, Flame, Sparkles, Key, TrendingUp, ArrowRight, ShieldCheck } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';

export type RhythmStage = 'DISCOVER' | 'BUILD' | 'UNLOCK' | 'ACT' | 'PROVE';

interface CityRhythmProps {
  currentStage?: RhythmStage;
  city?: string;
  activeDebateTitle?: string;
  keysCount?: number;
  onNavigateTab?: (tab: 'NOW' | 'DISCOVER' | 'UNLOCK' | 'SCENES') => void;
}

export const CityRhythmTracker: React.FC<CityRhythmProps> = ({
  currentStage = 'DISCOVER',
  city = 'Kingston',
  activeDebateTitle = 'Jerk King of Kingston Debate',
  keysCount = 15,
  onNavigateTab,
}) => {
  const { t } = useI18n();

  const rhythmSteps = [
    {
      stage: 'DISCOVER',
      day: t("radar.dayMonTue"),
      title: t("radar.stepDebateSignal"),
      description: t("radar.stepDebateSignalDesc"),
      icon: Flame,
      color: 'from-orange-500 to-amber-500',
      tab: 'DISCOVER' as const,
    },
    {
      stage: 'BUILD',
      day: t("radar.dayTue"),
      title: t("radar.stepVenueOutreach"),
      description: t("radar.stepVenueOutreachDesc"),
      icon: TrendingUp,
      color: 'from-purple-500 to-indigo-500',
      tab: 'DISCOVER' as const,
    },
    {
      stage: 'UNLOCK',
      day: t("radar.dayWed"),
      title: t("radar.stepKeysDrop"),
      description: t("radar.stepKeysDropDesc"),
      icon: Key,
      color: 'from-amber-400 to-orange-500',
      tab: 'UNLOCK' as const,
    },
    {
      stage: 'ACT',
      day: t("radar.dayFriSat"),
      title: t("radar.stepLiveMoments"),
      description: t("radar.stepLiveMomentsDesc"),
      icon: Sparkles,
      color: 'from-emerald-500 to-teal-500',
      tab: 'NOW' as const,
    },
    {
      stage: 'PROVE',
      day: t("radar.daySun"),
      title: t("radar.stepRecapLedger"),
      description: t("radar.stepRecapLedgerDesc"),
      icon: ShieldCheck,
      color: 'from-blue-500 to-cyan-500',
      tab: 'NOW' as const,
    },
  ];

  return (
    <div className="rounded-3xl bg-gradient-to-b from-gray-900/90 via-gray-950 to-gray-950 border border-gray-800 p-5 md:p-6 shadow-2xl mb-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 mb-5 border-b border-gray-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
              {t("radar.theaterEyebrow")}
            </span>
            <span className="text-gray-600 text-xs">•</span>
            <span className="text-xs text-gray-300 font-semibold">{city} Pulse</span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-white mt-1">
            {t("radar.rhythmTitle")}
          </h2>
        </div>

        {/* Current Active Status Pill */}
        <div className="flex items-center space-x-2 bg-gray-900 border border-gray-800 px-3.5 py-1.5 rounded-2xl w-fit">
          <Calendar className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs text-gray-400 font-medium">{t("radar.stageLabel")}</span>
          <span className="text-xs font-black text-purple-300">
            {currentStage === 'DISCOVER' ? t("radar.debateDemandActive") : t("radar.weekendActivationsLive")}
          </span>
        </div>
      </div>

      {/* 5-Step Rhythm Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {rhythmSteps.map((step, idx) => {
          const isCurrent = step.stage === currentStage;
          const Icon = step.icon;

          return (
            <div
              key={step.stage}
              onClick={() => onNavigateTab && onNavigateTab(step.tab)}
              className={`cursor-pointer rounded-2xl p-4 transition-all duration-300 border relative overflow-hidden flex flex-col justify-between ${
                isCurrent
                  ? 'bg-gray-800/80 border-orange-500/80 shadow-lg shadow-orange-500/10 scale-[1.02]'
                  : 'bg-gray-900/40 border-gray-800/80 hover:bg-gray-800/40 hover:border-gray-700'
              }`}
            >
              {isCurrent && (
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-orange-500 to-amber-400" />
              )}

              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isCurrent ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {step.day}
                  </span>
                  <div className={`p-1.5 rounded-xl ${
                    isCurrent ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-800 text-gray-500'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <h3 className={`text-xs font-black mb-1 ${isCurrent ? 'text-white' : 'text-gray-300'}`}>
                  {step.title}
                </h3>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-gray-800/60 flex items-center justify-between text-[10px]">
                <span className={isCurrent ? 'text-orange-400 font-bold' : 'text-gray-500'}>
                  {idx + 1}. {step.stage}
                </span>
                <ArrowRight className={`w-3 h-3 ${isCurrent ? 'text-orange-400' : 'text-gray-600'}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Operational Callout Strip */}
      <div className="mt-5 p-3.5 bg-gradient-to-r from-purple-950/40 via-gray-900/60 to-orange-950/40 rounded-2xl border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5 text-gray-300">
          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-[10px] font-black uppercase tracking-wider">
            {t("radar.liveCycleLabel")}
          </span>
          <span>
            <strong className="text-white">{t("radar.activeDebate")}:</strong> {activeDebateTitle} ({keysCount} {t("radar.keysUnlocking")})
          </span>
        </div>
        <button
          onClick={() => onNavigateTab && onNavigateTab('DISCOVER')}
          className="text-xs font-black text-orange-400 hover:text-orange-300 flex items-center space-x-1 shrink-0"
        >
          <span>{t("radar.voteToInfluence")}</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </button>
      </div>
    </div>
  );
};
