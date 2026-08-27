import React from 'react';
import { Sparkles, Zap, Ticket, ArrowRight, Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PromoShareTicketDrawModal } from '@/components/promoshare/PromoShareTicketDrawModal';
import { useI18n } from '@/i18n/I18nContext';

interface PromoShareHeroProps {
  totalTickets?: number;
  multiplier?: number;
  onOpenSlash?: () => void;
}

export const PromoShareHero: React.FC<PromoShareHeroProps> = ({
  totalTickets = 14,
  multiplier = 3.5,
  onOpenSlash,
}) => {
  const { t } = useI18n();

  return (
    <div className="relative overflow-hidden rounded-3xl border border-orange-500/30 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6 sm:p-10 shadow-2xl mb-8">
      {/* Background Glow Highlights */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        {/* Left Headline Column */}
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-full text-xs font-bold text-orange-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("promoshare.heroEyebrow")}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none">
            {t("promoshare.heroTitle")}
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            {t("promoshare.heroSubtitle")}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <PromoShareTicketDrawModal userTickets={totalTickets} />

            <Button
              onClick={() => {
                const text = encodeURIComponent(
                  "🔥 Yo! Check out Promorang for the best underground events, secret guestlists, and free member perks in Jamaica. Claim your VIP pass here: " +
                  (typeof window !== "undefined" ? window.location.origin + "/discover" : "https://promorang.co/discover")
                );
                window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
              }}
              className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-6 shadow-lg shadow-emerald-900/20"
            >
              <span className="mr-2">💬</span>
              <span>Share to WhatsApp</span>
            </Button>

            <Button
              onClick={onOpenSlash}
              variant="outline"
              className="rounded-2xl border-orange-500/40 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 font-bold px-6 py-6"
            >
              <Users className="w-4 h-4 mr-2" />
              <span>{t("promoshare.squadSlash")}</span>
            </Button>
          </div>
        </div>

        {/* Right Stats Hub Card */}
        <div className="w-full lg:w-80 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{t("promoshare.yourStanding")}</span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[10px] font-bold text-emerald-400">
              <Zap className="w-3 h-3" /> {t("promoshare.qualified")}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/60">
              <p className="text-[10px] text-zinc-500 font-bold uppercase">{t("promoshare.activeTickets")}</p>
              <p className="text-2xl font-black text-white flex items-center gap-1.5 mt-0.5">
                <Ticket className="w-5 h-5 text-orange-400" /> {totalTickets}
              </p>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/60">
              <p className="text-[10px] text-zinc-500 font-bold uppercase">{t("promoshare.yieldMultiplier")}</p>
              <p className="text-2xl font-black text-amber-400 flex items-center gap-1 mt-0.5">
                <Trophy className="w-5 h-5 text-amber-400" /> {multiplier}x
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
