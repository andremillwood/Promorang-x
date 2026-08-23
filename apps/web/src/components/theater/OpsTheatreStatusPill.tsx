import React from 'react';
import { Calendar, Zap, Lock, DollarSign, Trophy, Sparkles, Compass, PartyPopper } from 'lucide-react';

export type OpsDayStage = 
  | 'MONDAY_KICKOFF' 
  | 'TUESDAY_PROOF' 
  | 'WEDNESDAY_FREEZE' 
  | 'THURSDAY_CAMPAIGNS' 
  | 'FRIDAY_PAYOUTS' 
  | 'SATURDAY_GALA' 
  | 'SUNDAY_DIGEST';

export interface OpsTheatreStatusProps {
  forcedStage?: OpsDayStage;
  showDetails?: boolean;
  onOpenOrientation?: () => void;
}

export function getCurrentOpsStage(): OpsDayStage {
  const day = new Date().getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
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

export const OPS_STAGE_META: Record<OpsDayStage, {
  dayLabel: string;
  badgeText: string;
  tagline: string;
  icon: React.ElementType;
  dotColor: string;
  badgeBg: string;
  textColor: string;
  nextEvent: string;
}> = {
  MONDAY_KICKOFF: {
    dayLabel: 'Monday',
    badgeText: 'Missions Live',
    tagline: 'Radar Drops & Starter Missions Released',
    icon: Compass,
    dotColor: 'bg-emerald-400',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
    textColor: 'text-emerald-300',
    nextEvent: 'Tuesday Leaderboards drop tomorrow',
  },
  TUESDAY_PROOF: {
    dayLabel: 'Tuesday',
    badgeText: 'Proofs & Ranks',
    tagline: 'Proof Verification & Top 5 Leaderboard',
    icon: Trophy,
    dotColor: 'bg-purple-400',
    badgeBg: 'bg-purple-500/10 border-purple-500/30',
    textColor: 'text-purple-300',
    nextEvent: 'Odds freeze at midnight Wednesday',
  },
  WEDNESDAY_FREEZE: {
    dayLabel: 'Wednesday',
    badgeText: 'The Freeze',
    tagline: 'Speculation Lines Locked • Ops Resting',
    icon: Lock,
    dotColor: 'bg-amber-400',
    badgeBg: 'bg-amber-500/10 border-amber-500/30',
    textColor: 'text-amber-300',
    nextEvent: 'Thursday Campaign Slots open tomorrow at 9 AM',
  },
  THURSDAY_CAMPAIGNS: {
    dayLabel: 'Thursday',
    badgeText: 'Campaigns Open',
    tagline: 'Sponsor Slots Open & Sub-Moments Live',
    icon: Zap,
    dotColor: 'bg-orange-400',
    badgeBg: 'bg-orange-500/10 border-orange-500/30',
    textColor: 'text-orange-400',
    nextEvent: 'Friday Gem payouts release at 6 PM',
  },
  FRIDAY_PAYOUTS: {
    dayLabel: 'Friday',
    badgeText: 'Gem Payouts',
    tagline: 'Campaign Wins Credited & UGC Showcase Live',
    icon: DollarSign,
    dotColor: 'bg-green-400',
    badgeBg: 'bg-green-500/10 border-green-500/30',
    textColor: 'text-green-300',
    nextEvent: 'Saturday Live Moments activate tomorrow',
  },
  SATURDAY_GALA: {
    dayLabel: 'Saturday',
    badgeText: 'Live Moments',
    tagline: 'Radar Hotspots Live & Vault Piece Unlocks',
    icon: Sparkles,
    dotColor: 'bg-pink-400',
    badgeBg: 'bg-pink-500/10 border-pink-500/30',
    textColor: 'text-pink-300',
    nextEvent: 'Sunday automated balance digest tomorrow',
  },
  SUNDAY_DIGEST: {
    dayLabel: 'Sunday',
    badgeText: 'Vault Digest',
    tagline: 'Weekly Recaps & Growth Hub Lockbox',
    icon: PartyPopper,
    dotColor: 'bg-blue-400',
    badgeBg: 'bg-blue-500/10 border-blue-500/30',
    textColor: 'text-blue-300',
    nextEvent: 'New week resets Monday morning',
  },
};

export const OpsTheatreStatusPill: React.FC<OpsTheatreStatusProps> = ({
  forcedStage,
  showDetails = false,
  onOpenOrientation,
}) => {
  const stage = forcedStage || getCurrentOpsStage();
  const meta = OPS_STAGE_META[stage];
  const Icon = meta.icon;

  return (
    <div 
      onClick={onOpenOrientation}
      className={`group cursor-pointer transition-all duration-300 inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border backdrop-blur-xl ${meta.badgeBg} hover:border-orange-500/50 hover:scale-[1.02] shadow-lg`}
      title="Click to view the Promorang Ops Theatre guide"
    >
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${meta.dotColor}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${meta.dotColor}`}></span>
      </span>

      <Icon className={`w-3.5 h-3.5 ${meta.textColor}`} />

      <span className="text-xs font-black text-white tracking-wide">
        {meta.dayLabel}: <span className={meta.textColor}>{meta.badgeText}</span>
      </span>

      {showDetails && (
        <span className="hidden md:inline-block text-[11px] text-gray-400 border-l border-gray-700/60 pl-2">
          {meta.tagline}
        </span>
      )}

      <span className="text-[10px] text-gray-500 group-hover:text-orange-400 transition-colors uppercase tracking-wider font-semibold">
        Show Guide
      </span>
    </div>
  );
};
