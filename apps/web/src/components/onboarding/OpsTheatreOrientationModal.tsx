import React, { useState } from 'react';
import { 
  X, Compass, Trophy, Lock, Zap, DollarSign, Sparkles, 
  PartyPopper, Crown, ArrowRight, UserCheck, Video, Store, Briefcase 
} from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import type { TranslationKey } from '@/i18n/translations';

export type StakeholderPersona = 'PARTICIPANT' | 'CREATOR' | 'MERCHANT' | 'ADVERTISER';

interface OrientationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPersona?: StakeholderPersona;
  onSelectAction?: (actionUrl: string) => void;
}

const PERSONA_DETAILS: Record<StakeholderPersona, {
  short: TranslationKey;
  title: TranslationKey;
  roleDesc: TranslationKey;
  icon: React.ElementType;
  color: string;
  firstMoveTitle: TranslationKey;
  firstMoveDesc: TranslationKey;
  firstMoveCTA: TranslationKey;
  firstMoveLink: string;
  rhythmHighlights: { day: TranslationKey; action: TranslationKey }[];
}> = {
  PARTICIPANT: {
    short: 'opsWeek.partShort',
    title: 'opsWeek.partTitle',
    roleDesc: 'opsWeek.partRole',
    icon: UserCheck,
    color: 'from-orange-500 to-amber-500',
    firstMoveTitle: 'opsWeek.partMove',
    firstMoveDesc: 'opsWeek.partMoveDesc',
    firstMoveCTA: 'opsWeek.partCta',
    firstMoveLink: '/radar',
    rhythmHighlights: [
      { day: 'opsWeek.mon.day', action: 'opsWeek.partMon' },
      { day: 'opsWeek.tue.day', action: 'opsWeek.partTue' },
      { day: 'opsWeek.wed.day', action: 'opsWeek.partWed' },
      { day: 'opsWeek.thu.day', action: 'opsWeek.partThu' },
      { day: 'opsWeek.fri.day', action: 'opsWeek.partFri' },
      { day: 'opsWeek.sat.day', action: 'opsWeek.partSat' },
      { day: 'opsWeek.monthEnd', action: 'opsWeek.partMonth' },
    ],
  },
  CREATOR: {
    short: 'opsWeek.creShort',
    title: 'opsWeek.creTitle',
    roleDesc: 'opsWeek.creRole',
    icon: Video,
    color: 'from-purple-500 to-pink-500',
    firstMoveTitle: 'opsWeek.creMove',
    firstMoveDesc: 'opsWeek.creMoveDesc',
    firstMoveCTA: 'opsWeek.creCta',
    firstMoveLink: '/create',
    rhythmHighlights: [
      { day: 'opsWeek.mon.day', action: 'opsWeek.creMon' },
      { day: 'opsWeek.tue.day', action: 'opsWeek.creTue' },
      { day: 'opsWeek.thu.day', action: 'opsWeek.creThu' },
      { day: 'opsWeek.fri.day', action: 'opsWeek.creFri' },
      { day: 'opsWeek.sat.day', action: 'opsWeek.creSat' },
    ],
  },
  MERCHANT: {
    short: 'opsWeek.merShort',
    title: 'opsWeek.merTitle',
    roleDesc: 'opsWeek.merRole',
    icon: Store,
    color: 'from-emerald-500 to-teal-500',
    firstMoveTitle: 'opsWeek.merMove',
    firstMoveDesc: 'opsWeek.merMoveDesc',
    firstMoveCTA: 'opsWeek.merCta',
    firstMoveLink: '/add-venue',
    rhythmHighlights: [
      { day: 'opsWeek.mon.day', action: 'opsWeek.merMon' },
      { day: 'opsWeek.thu.day', action: 'opsWeek.merThu' },
      { day: 'opsWeek.sat.day', action: 'opsWeek.merSat' },
      { day: 'opsWeek.sun.day', action: 'opsWeek.merSun' },
    ],
  },
  ADVERTISER: {
    short: 'opsWeek.advShort',
    title: 'opsWeek.advTitle',
    roleDesc: 'opsWeek.advRole',
    icon: Briefcase,
    color: 'from-blue-500 to-indigo-500',
    firstMoveTitle: 'opsWeek.advMove',
    firstMoveDesc: 'opsWeek.advMoveDesc',
    firstMoveCTA: 'opsWeek.advCta',
    firstMoveLink: '/create-campaign',
    rhythmHighlights: [
      { day: 'opsWeek.mon.day', action: 'opsWeek.advMon' },
      { day: 'opsWeek.thu.day', action: 'opsWeek.advThu' },
      { day: 'opsWeek.fri.day', action: 'opsWeek.advFri' },
      { day: 'opsWeek.growthHub', action: 'opsWeek.advHub' },
    ],
  },
};

export const OpsTheatreOrientationModal: React.FC<OrientationModalProps> = ({
  isOpen,
  onClose,
  initialPersona = 'PARTICIPANT',
  onSelectAction,
}) => {
  const { t } = useI18n();
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
                {t('opsWeek.doctrine')}
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-0.5">
              {t('opsWeek.rhythmTitle')}
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
                  {t(persona.short)}
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
              <h3 className="text-sm font-black text-white">{t(current.title)}</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              {t(current.roleDesc)}
            </p>
          </div>

          {/* First Move Callout */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-950/40 via-gray-900 to-gray-900 border border-orange-500/30">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-400">
              {t('opsWeek.day1Move')}
            </span>
            <h4 className="text-sm font-black text-white mt-0.5">{t(current.firstMoveTitle)}</h4>
            <p className="text-xs text-gray-300 mt-1">{t(current.firstMoveDesc)}</p>
          </div>

          {/* Weekly Cadence List */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
              {t('opsWeek.weeklySchedule')}
            </h4>
            <div className="space-y-1.5">
              {current.rhythmHighlights.map((step) => (
                <div key={step.day} className="flex items-start gap-2.5 p-2 rounded-xl bg-gray-900/40 border border-gray-800/60 text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-gray-800 text-orange-400 font-black text-[10px] shrink-0 uppercase tracking-wider">
                    {t(step.day)}
                  </span>
                  <span className="text-gray-300">{t(step.action)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-4 border-t border-gray-800 mt-4 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-gray-500 hidden sm:inline">
            {t('opsWeek.alwaysOn')}
          </span>
          <button
            onClick={handleAction}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-xs transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 active:scale-95 ml-auto"
          >
            <span>{t(current.firstMoveCTA)}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
