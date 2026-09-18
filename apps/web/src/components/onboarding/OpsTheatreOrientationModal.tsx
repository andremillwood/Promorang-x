import React, { useState } from 'react';
import { X, ArrowRight, UserCheck, Video, Store, Briefcase } from 'lucide-react';

export type StakeholderPersona = 'PARTICIPANT' | 'CREATOR' | 'MERCHANT' | 'ADVERTISER';

interface OrientationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPersona?: StakeholderPersona;
  onSelectAction?: (actionUrl: string) => void;
}

type PersonaDetail = {
  title: string;
  roleDesc: string;
  icon: React.ElementType;
  firstMoveTitle: string;
  firstMoveDesc: string;
  firstMoveCTA: string;
  firstMoveLink: string;
  signals: { label: string; action: string }[];
};

const PERSONA_DETAILS: Record<StakeholderPersona, PersonaDetail> = {
  PARTICIPANT: {
    title: 'Participant',
    roleDesc: 'Find relevant Moments, Discoveries, offers, and Scenes; take useful actions and keep only the consequences the platform actually records.',
    icon: UserCheck,
    firstMoveTitle: 'Find one useful next move',
    firstMoveDesc: 'Open Discover or Today, choose a real object, and follow its stated join, claim, purchase, check-in, or proof requirements.',
    firstMoveCTA: 'Open Discover',
    firstMoveLink: '/discover',
    signals: [
      { label: 'Discovery', action: 'Interest, votes, follows, and demand remain intent signals until a downstream action is verified.' },
      { label: 'Moment', action: 'RSVP is intent. Attendance is recorded only after the applicable check-in or proof path succeeds.' },
      { label: 'Value', action: 'Perks, Memories, entries, Gems, and access appear only when their issuance records exist.' },
      { label: 'Return', action: 'Your history should show what was actually verified and what that verification opened next.' },
    ],
  },
  CREATOR: {
    title: 'Creator',
    roleDesc: 'Connect releases and distribution to attributable action, approved work, and earnings without treating views or shares as payment.',
    icon: Video,
    firstMoveTitle: 'Open a real creator opportunity',
    firstMoveDesc: 'Review a Content Drop or creator brief, understand what counts, then submit or release work through the configured workflow.',
    firstMoveCTA: 'Open Content Drops',
    firstMoveLink: '/content-drops',
    signals: [
      { label: 'Brief', action: 'An open opportunity is not an accepted commission; terms, rights, availability, and review still matter.' },
      { label: 'Attribution', action: 'Shares and content can create attributed outcomes, but attribution is separate from approval.' },
      { label: 'Earning', action: 'An earning exists only when the configured commercial rule records it.' },
      { label: 'Settlement', action: 'Approved or earned value remains separate from paid or settled value.' },
    ],
  },
  MERCHANT: {
    title: 'Merchant / Venue',
    roleDesc: 'Respond to recorded demand, create real supply, validate customer actions, and learn from visits, redemptions, purchases, fulfillment, and return behavior.',
    icon: Store,
    firstMoveTitle: 'Put one real offer or place into the market',
    firstMoveDesc: 'Add a venue, product, or draft offer with explicit inventory and terms, then activate it only when the supply is actually available.',
    firstMoveCTA: 'Open Merchant Workspace',
    firstMoveLink: '/dashboard',
    signals: [
      { label: 'Demand', action: 'Demand is evidence of interest, not a sale or guaranteed foot traffic.' },
      { label: 'Validation', action: 'A QR scan or validation can confirm an eligible action; it does not automatically mean purchase or fulfillment.' },
      { label: 'Commerce', action: 'Paid order, fulfillment, refund, and settlement stay separate states.' },
      { label: 'Return', action: 'Repeat behavior is shown only from recorded customer actions, not inferred loyalty.' },
    ],
  },
  ADVERTISER: {
    title: 'Brand / Advertiser',
    roleDesc: 'Define a measurable customer outcome, fund or supply the activation, then review recorded evidence before deciding what to repeat, improve, or stop.',
    icon: Briefcase,
    firstMoveTitle: 'Shape one measurable activation',
    firstMoveDesc: 'Choose an audience, desired action, proof standard, participant value, budget or supply commitment, then review before launch.',
    firstMoveCTA: 'Create an Activation',
    firstMoveLink: '/create/campaign',
    signals: [
      { label: 'Market signal', action: 'Demand and Scene context inform a decision; they do not guarantee conversion.' },
      { label: 'Execution', action: 'Creators, hosts, merchants, funding, inventory, and proof requirements need explicit records.' },
      { label: 'Evidence', action: 'GPS, receipt, check-in, content, or other proof appears only where configured and actually recorded.' },
      { label: 'Decision', action: 'Use verified evidence and clearly labelled operator closeout notes to decide whether to repeat, improve, fund, invite, or stop.' },
    ],
  },
};

export const OpsTheatreOrientationModal: React.FC<OrientationModalProps> = ({
  isOpen,
  onClose,
  initialPersona = 'PARTICIPANT',
  onSelectAction,
}) => {
  const [activePersona, setActivePersona] = useState<StakeholderPersona>(initialPersona);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-gray-800 bg-gray-950 p-6 shadow-2xl">
        <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="flex shrink-0 items-center justify-between border-b border-gray-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                Role orientation
              </span>
            </div>
            <h2 className="mt-0.5 text-xl font-black text-white">
              What counts for each role
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-800 bg-gray-900 p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-4 grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4">
          {(Object.keys(PERSONA_DETAILS) as StakeholderPersona[]).map((key) => {
            const persona = PERSONA_DETAILS[key];
            const isSelected = activePersona === key;
            const Icon = persona.icon;

            return (
              <button
                key={key}
                onClick={() => setActivePersona(key)}
                className={`flex flex-col justify-between rounded-2xl border p-2.5 text-left transition-all ${
                  isSelected
                    ? 'border-orange-500/80 bg-gray-800 shadow-lg shadow-orange-500/10'
                    : 'border-gray-800/80 bg-gray-900/50 hover:bg-gray-900'
                }`}
              >
                <div className={`mb-2 w-fit rounded-xl p-1.5 ${
                  isSelected ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-800 text-gray-400'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`truncate text-xs font-black ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                  {persona.title.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
            <div className="mb-1 flex items-center gap-2">
              <PersonaIcon className="h-4 w-4 text-orange-400" />
              <h3 className="text-sm font-black text-white">{current.title}</h3>
            </div>
            <p className="text-xs leading-relaxed text-gray-400">{current.roleDesc}</p>
          </div>

          <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-950/40 via-gray-900 to-gray-900 p-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-400">
              Your next useful move
            </span>
            <h4 className="mt-0.5 text-sm font-black text-white">{current.firstMoveTitle}</h4>
            <p className="mt-1 text-xs text-gray-300">{current.firstMoveDesc}</p>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-black uppercase tracking-wider text-gray-400">
              State boundaries to keep in mind
            </h4>
            <div className="space-y-1.5">
              {current.signals.map((step) => (
                <div key={step.label} className="flex items-start gap-2.5 rounded-xl border border-gray-800/60 bg-gray-900/40 p-2 text-xs">
                  <span className="shrink-0 rounded-md bg-gray-800 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-orange-400">
                    {step.label}
                  </span>
                  <span className="text-gray-300">{step.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex shrink-0 items-center justify-between gap-3 border-t border-gray-800 pt-4">
          <span className="hidden text-[11px] text-gray-500 sm:inline">
            Production absence stays empty. Verification, issuance, earning, and settlement are separate states.
          </span>
          <button
            onClick={handleAction}
            className="ml-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-2.5 text-xs font-black text-white shadow-lg shadow-orange-500/25 transition-all hover:from-orange-600 hover:to-orange-700 active:scale-95 sm:w-auto"
          >
            <span>{current.firstMoveCTA}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
