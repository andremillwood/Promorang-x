import React, { useState } from 'react';
import { 
  Compass, Trophy, Lock, Zap, DollarSign, Sparkles, PartyPopper, ArrowRight, HelpCircle
} from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { OpsTheatreOrientationModal } from '@/components/onboarding/OpsTheatreOrientationModal';

export type RhythmStage = 
  | 'MONDAY_KICKOFF' 
  | 'TUESDAY_PROOF' 
  | 'WEDNESDAY_FREEZE' 
  | 'THURSDAY_CAMPAIGNS' 
  | 'FRIDAY_PAYOUTS' 
  | 'SATURDAY_GALA' 
  | 'SUNDAY_DIGEST';

interface CityRhythmProps {
  currentStage?: RhythmStage;
  city?: string;
  activeDebateTitle?: string;
  keysCount?: number;
  onNavigateTab?: (tab: 'NOW' | 'DISCOVER' | 'UNLOCK' | 'SCENES') => void;
}

function getAutoStage(): RhythmStage {
  const day = new Date().getDay();
  switch (day) {
    case 1: return 'MONDAY_KICKOFF';
    case 2: return 'TUESDAY_PROOF';
    case 3: return 'WEDNESDAY_FREEZE';
    case 4: return 'THURSDAY_CAMPAIGNS';
    case 5: return 'FRIDAY_PAYOUTS';
    case 6: return 'SATURDAY_GALA';
    case 0: return 'SUNDAY_DIGEST';
    default: return 'MONDAY_KICKOFF';
  }
}

export const CityRhythmTracker: React.FC<CityRhythmProps> = ({
  currentStage,
  city = 'Kingston',
  activeDebateTitle = 'Jerk King of Kingston Debate',
  keysCount = 15,
  onNavigateTab,
}) => {
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const activeStage = currentStage || getAutoStage();

  const rhythmSteps = [
    {
      stage: 'MONDAY_KICKOFF' as const,
      day: 'Mon',
      title: 'Radar Drops & Tasks',
      description: 'New Missions live; Radar drops 3 featured city moments.',
      icon: Compass,
      tab: 'DISCOVER' as const,
      accent: 'from-orange-500 to-amber-500',
    },
    {
      stage: 'TUESDAY_PROOF' as const,
      day: 'Tue',
      title: 'Proof & Leaderboard',
      description: 'UGC verified, Coins/Tickets credited, Top 5 posted.',
      icon: Trophy,
      tab: 'DISCOVER' as const,
      accent: 'from-purple-500 to-indigo-500',
    },
    {
      stage: 'WEDNESDAY_FREEZE' as const,
      day: 'Wed',
      title: 'The Mid-Week Freeze',
      description: 'Betting lines locked. Anticipation builds for Thursday.',
      icon: Lock,
      tab: 'UNLOCK' as const,
      accent: 'from-amber-400 to-orange-500',
    },
    {
      stage: 'THURSDAY_CAMPAIGNS' as const,
      day: 'Thu',
      title: 'Sponsor Slots Open',
      description: 'Campaign Window opens; Brand Gem prize pools launch.',
      icon: Zap,
      tab: 'NOW' as const,
      accent: 'from-orange-500 to-red-500',
    },
    {
      stage: 'FRIDAY_PAYOUTS' as const,
      day: 'Fri',
      title: 'Gem Payouts & Showcase',
      description: 'Winners credited Gems; week’s top UGC reels publish.',
      icon: DollarSign,
      tab: 'NOW' as const,
      accent: 'from-emerald-500 to-teal-500',
    },
    {
      stage: 'SATURDAY_GALA' as const,
      day: 'Sat',
      title: 'Live Moments & Pieces',
      description: 'Physical venue check-ins & collectible Vault Pieces unlock.',
      icon: Sparkles,
      tab: 'SCENES' as const,
      accent: 'from-pink-500 to-purple-500',
    },
    {
      stage: 'SUNDAY_DIGEST' as const,
      day: 'Sun',
      title: 'Vault & Growth Digest',
      description: 'Automated earnings recap + Growth Hub Lockbox resets.',
      icon: PartyPopper,
      tab: 'NOW' as const,
      accent: 'from-blue-500 to-cyan-500',
    },
  ];

  return (
    <>
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
                Ops Theatre Engine
              </span>
              <span className="text-gray-600 text-xs">•</span>
              <span className="text-xs text-gray-300 font-semibold">{city} Rhythm</span>
            </div>
            <h2 className="text-lg md:text-xl font-black text-white mt-1">
              7-Day Cultural & Earning Cycle
            </h2>
          </div>

          {/* Right Action Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 px-3 py-1.5 rounded-2xl text-xs font-bold text-gray-300 hover:text-white transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-orange-400" />
              <span>How It Works</span>
            </button>
          </div>
        </div>

        {/* 7-Step Rhythm Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {rhythmSteps.map((step, idx) => {
            const isCurrent = step.stage === activeStage;
            const Icon = step.icon;

            return (
              <div
                key={step.stage}
                onClick={() => onNavigateTab && onNavigateTab(step.tab)}
                className={`cursor-pointer rounded-2xl p-3.5 transition-all duration-300 border relative overflow-hidden flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-gray-800/90 border-orange-500 shadow-lg shadow-orange-500/15 scale-[1.03] ring-1 ring-orange-500/50'
                    : 'bg-gray-900/40 border-gray-800/70 hover:bg-gray-800/40 hover:border-gray-700'
                }`}
              >
                {isCurrent && (
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-orange-500 to-amber-400" />
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      isCurrent ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {step.day} {isCurrent && '• TODAY'}
                    </span>
                    <div className={`p-1 rounded-lg ${
                      isCurrent ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-800 text-gray-500'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <h3 className={`text-xs font-black mb-1 leading-tight ${isCurrent ? 'text-white' : 'text-gray-300'}`}>
                    {step.title}
                  </h3>
                  <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-3">
                    {step.description}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-gray-800/60 flex items-center justify-between text-[10px]">
                  <span className={isCurrent ? 'text-orange-400 font-bold' : 'text-gray-500'}>
                    Day {idx + 1}
                  </span>
                  <ArrowRight className={`w-3 h-3 ${isCurrent ? 'text-orange-400' : 'text-gray-600'}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Operational Callout Strip */}
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-950/40 via-gray-900/60 to-orange-950/40 rounded-2xl border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5 text-gray-300">
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-[10px] font-black uppercase tracking-wider">
              Live Cycle
            </span>
            <span>
              <strong className="text-white">Active Debate:</strong> {activeDebateTitle} ({keysCount} Keys Unlocking)
            </span>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('DISCOVER')}
            className="text-xs font-black text-orange-400 hover:text-orange-300 flex items-center space-x-1 shrink-0"
          >
            <span>Vote & Influence Odds</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      </div>

      {/* Stakeholder Orientation Modal */}
      <OpsTheatreOrientationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
