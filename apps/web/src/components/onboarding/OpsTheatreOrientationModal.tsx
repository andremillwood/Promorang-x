import React, { useState } from 'react';
import { 
  X, Compass, Trophy, Lock, Zap, DollarSign, Sparkles, 
  PartyPopper, Crown, ArrowRight, UserCheck, Video, Store, Briefcase 
} from 'lucide-react';

export type StakeholderPersona = 'PARTICIPANT' | 'CREATOR' | 'MERCHANT' | 'ADVERTISER';

interface OrientationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPersona?: StakeholderPersona;
  onSelectAction?: (actionUrl: string) => void;
}

export const OpsTheatreOrientationModal: React.FC<OrientationModalProps> = ({
  isOpen,
  onClose,
  initialPersona = 'PARTICIPANT',
  onSelectAction,
}) => {
  const [activePersona, setActivePersona] = useState<StakeholderPersona>(initialPersona);

  if (!isOpen) return null;

  const PERSONA_DETAILS: Record<StakeholderPersona, {
    title: string;
    roleDesc: string;
    icon: React.ElementType;
    color: string;
    firstMoveTitle: string;
    firstMoveDesc: string;
    firstMoveCTA: string;
    firstMoveLink: string;
    rhythmHighlights: { day: string; action: string }[];
  }> = {
    PARTICIPANT: {
      title: 'Participant / Earner',
      roleDesc: 'Play the weekly attention game, complete missions, collect pieces, and win real Gems.',
      icon: UserCheck,
      color: 'from-orange-500 to-amber-500',
      firstMoveTitle: 'Complete Your Starter Mission',
      firstMoveDesc: 'Follow your first local Scene and vote in this week’s Cultural Poll to earn 10 Coins + 1 PromoShare ticket instantly.',
      firstMoveCTA: 'Start Earning Now',
      firstMoveLink: '/radar',
      rhythmHighlights: [
        { day: 'Monday', action: 'New Missions & Radar City Drops release in Today view.' },
        { day: 'Tuesday', action: 'Proofs verified; Top 5 earners climb the Leaderboard.' },
        { day: 'Wednesday', action: 'Odds freeze on Social Bets; anticipation builds.' },
        { day: 'Thursday', action: 'Sponsored Brand Missions open with Gem prize pools.' },
        { day: 'Friday', action: 'Gem payouts credit to your wallet; UGC showcase posts.' },
        { day: 'Saturday', action: 'Live Moments in physical venues unlock Vault Pieces.' },
        { day: 'Month-End', action: 'PromoShare Live Jackpot stream with massive Gem rewards.' },
      ],
    },
    CREATOR: {
      title: 'Content Creator',
      roleDesc: 'Turn your media into viral community missions, build clout, and earn perpetual royalties.',
      icon: Video,
      color: 'from-purple-500 to-pink-500',
      firstMoveTitle: 'Submit Your First Clip',
      firstMoveDesc: 'Submit a reel or TikTok link to be featured in the Scene feed. Community members will complete missions to boost your video.',
      firstMoveCTA: 'Submit Content',
      firstMoveLink: '/create',
      rhythmHighlights: [
        { day: 'Monday', action: 'Ops curates & spotlights emerging creator media in Scene feed.' },
        { day: 'Tuesday', action: 'Community engagement pushes you onto the Creator Leaderboard.' },
        { day: 'Thursday', action: 'Claim a Creator Boost Slot to run Gem-incentivized tasks.' },
        { day: 'Friday', action: 'Featured in the Weekly Creator Showcase reel with ROI stats.' },
        { day: 'Saturday', action: 'Host Sub-Moments and earn secondary Piece trade royalties.' },
      ],
    },
    MERCHANT: {
      title: 'Merchant & Venue Host',
      roleDesc: 'Drive guaranteed foot traffic and sales with zero upfront advertising risk via free sampling.',
      icon: Store,
      color: 'from-emerald-500 to-teal-500',
      firstMoveTitle: 'Activate Free Monthly Sampling',
      firstMoveDesc: 'List a zero-risk perk (e.g. 10% off or free welcome drink). Promorang wraps missions around it to drive foot traffic.',
      firstMoveCTA: 'Claim Free Allowance',
      firstMoveLink: '/add-venue',
      rhythmHighlights: [
        { day: 'Monday', action: 'Venue pinned as an active hotspot on Opportunity Radar.' },
        { day: 'Thursday', action: 'Offer exclusive BOGO / Gem discount vouchers to users.' },
        { day: 'Saturday', action: 'Attendees arrive to redeem vouchers via web QR ticket scanner.' },
        { day: 'Sunday', action: 'Automated foot traffic and sales recap delivered to inbox.' },
      ],
    },
    ADVERTISER: {
      title: 'Brand & Advertiser',
      roleDesc: 'Secure scarce Thursday campaign slots to generate authentic UGC and measurable ROI.',
      icon: Briefcase,
      color: 'from-blue-500 to-indigo-500',
      firstMoveTitle: 'Book a Campaign Slot',
      firstMoveDesc: 'Reserve 1 of 10 scarce monthly campaign slots to deploy branded video challenges and surveys.',
      firstMoveCTA: 'View Open Slots',
      firstMoveLink: '/create-campaign',
      rhythmHighlights: [
        { day: 'Monday', action: 'Slot counters reset and intake creative brief.' },
        { day: 'Thursday', action: 'Campaign Window launches live to thousands of earners.' },
        { day: 'Friday', action: 'Campaign closes; receive verified UGC video assets & reach report.' },
        { day: 'Growth Hub', action: 'Pre-commit Gems in Lockbox for permanent 15% booking discounts.' },
      ],
    },
  };

  const current = PERSONA_DETAILS[activePersona];
  const PersonaIcon = current.icon;

  const handleAction = () => {
    onClose();
    if (onSelectAction) {
      onSelectAction(current.firstMoveLink);
    } else {
      window.location.href = current.firstMoveLink;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-gray-950 border border-gray-800 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                Ops Theatre Doctrine
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-0.5">
              The Promorang Weekly Rhythm
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 shrink-0">
          {(Object.keys(PERSONA_DETAILS) as StakeholderPersona[]).map((key) => {
            const persona = PERSONA_DETAILS[key];
            const isSelected = activePersona === key;
            const Icon = persona.icon;

            return (
              <button
                key={key}
                onClick={() => setActivePersona(key)}
                className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gray-800 border-orange-500/80 shadow-lg shadow-orange-500/10'
                    : 'bg-gray-900/50 border-gray-800/80 hover:bg-gray-900'
                }`}
              >
                <div className={`p-1.5 rounded-xl w-fit mb-2 ${
                  isSelected ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-800 text-gray-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-xs font-black truncate ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                  {persona.title.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto pr-1 space-y-4 flex-1">
          {/* Persona Overview Card */}
          <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <PersonaIcon className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-black text-white">{current.title}</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              {current.roleDesc}
            </p>
          </div>

          {/* First Move Callout */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-950/40 via-gray-900 to-gray-900 border border-orange-500/30">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-400">
              Your Day-1 Move
            </span>
            <h4 className="text-sm font-black text-white mt-0.5">{current.firstMoveTitle}</h4>
            <p className="text-xs text-gray-300 mt-1">{current.firstMoveDesc}</p>
          </div>

          {/* Weekly Cadence List */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
              Your Weekly Schedule
            </h4>
            <div className="space-y-1.5">
              {current.rhythmHighlights.map((step) => (
                <div key={step.day} className="flex items-start gap-2.5 p-2 rounded-xl bg-gray-900/40 border border-gray-800/60 text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-gray-800 text-orange-400 font-black text-[10px] shrink-0 uppercase tracking-wider">
                    {step.day}
                  </span>
                  <span className="text-gray-300">{step.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-4 border-t border-gray-800 mt-4 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-gray-500 hidden sm:inline">
            Always-on platform is 24/7 • Ops Theatre creates the weekly hype
          </span>
          <button
            onClick={handleAction}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-xs transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 active:scale-95 ml-auto"
          >
            <span>{current.firstMoveCTA}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
