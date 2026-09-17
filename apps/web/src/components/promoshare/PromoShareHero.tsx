import React from 'react';
import { Sparkles, Zap, Ticket, Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PromoShareTicketDrawModal } from '@/components/promoshare/PromoShareTicketDrawModal';
import { useI18n } from '@/i18n/I18nContext';

interface PromoShareHeroProps {
  totalTickets: number;
  multiplier?: number | null;
  eligibility?: 'qualified' | 'not_qualified' | 'in_progress' | null;
  onOpenSlash?: () => void;
}

export const PromoShareHero: React.FC<PromoShareHeroProps> = ({
  totalTickets,
  multiplier = null,
  eligibility = null,
  onOpenSlash,
}) => {
  const { t } = useI18n();
  const isQualified = eligibility === 'qualified';
  const standingLabel = isQualified
    ? t('promoshare.qualified')
    : eligibility === 'not_qualified'
      ? 'Not qualified'
      : eligibility === 'in_progress'
        ? 'In progress'
        : 'No standing recorded';

  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl border border-orange-500/30 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6 shadow-2xl sm:p-10">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />

      <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t('promoshare.heroEyebrow')}</span>
          </div>

          <h1 className="text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-6xl">
            {t('promoshare.heroTitle')}
          </h1>

          <p className="text-sm leading-relaxed text-zinc-400 sm:text-base">
            {t('promoshare.heroSubtitle')}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <PromoShareTicketDrawModal userTickets={totalTickets} />

            <Button
              onClick={() => {
                const text = encodeURIComponent(
                  'Check out Promorang and see what is moving near you: ' +
                  (typeof window !== 'undefined' ? window.location.origin + '/discover' : 'https://promorang.co/discover'),
                );
                window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
              }}
              className="rounded-2xl bg-emerald-600 px-6 py-6 font-bold text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-700"
            >
              <span className="mr-2">💬</span>
              <span>Share to WhatsApp</span>
            </Button>

            {onOpenSlash ? (
              <Button
                onClick={onOpenSlash}
                variant="outline"
                className="rounded-2xl border-orange-500/40 bg-orange-500/10 px-6 py-6 font-bold text-orange-400 hover:bg-orange-500/20"
              >
                <Users className="mr-2 h-4 w-4" />
                <span>{t('promoshare.squadSlash')}</span>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="w-full space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-xl backdrop-blur-xl lg:w-80">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{t('promoshare.yourStanding')}</span>
            <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${isQualified ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400' : 'border-zinc-700 bg-zinc-800 text-zinc-300'}`}>
              <Zap className="h-3 w-3" /> {standingLabel}
            </div>
          </div>

          <div className={`grid gap-3 ${multiplier != null ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-950 p-3">
              <p className="text-[10px] font-bold uppercase text-zinc-500">{t('promoshare.activeTickets')}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-2xl font-black text-white">
                <Ticket className="h-5 w-5 text-orange-400" /> {totalTickets}
              </p>
              <p className="mt-1 text-[10px] leading-4 text-zinc-500">Recorded entries only. A ticket is a chance in its named draw, not a guaranteed prize.</p>
            </div>

            {multiplier != null ? (
              <div className="rounded-xl border border-zinc-800/60 bg-zinc-950 p-3">
                <p className="text-[10px] font-bold uppercase text-zinc-500">Recorded multiplier</p>
                <p className="mt-0.5 flex items-center gap-1 text-2xl font-black text-amber-400">
                  <Trophy className="h-5 w-5 text-amber-400" /> {multiplier}x
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
