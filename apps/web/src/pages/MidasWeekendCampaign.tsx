import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import {
  Calendar,
  MapPin,
  Ticket,
  Sparkles,
  Share2,
  Phone,
  CheckCircle2,
  ExternalLink,
  Zap,
  Vote,
  Award,
  LockKeyhole,
  Layers,
  Flame,
  ArrowRight,
  Clock,
  Music,
  Users,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getSiteUrl } from '@/lib/discovery';
import { useI18n } from '@/i18n/I18nContext';

export default function MidasWeekendCampaign() {
  const { t } = useI18n();
  const [activeDay, setActiveDay] = useState<'both' | 'sat' | 'sun'>('both');
  const [selectedPerk, setSelectedPerk] = useState<'express' | 'drink' | 'vip'>('express');
  const [phoneInput, setPhoneInput] = useState('');
  const [isClaimed, setIsClaimed] = useState(false);
  const [votedOption, setVotedOption] = useState<string | null>(null);

  const handleVotePoll = (optText: string) => {
    setVotedOption(optText);
    toast.success(t("midasWeek.voteToast", { option: optText }), { duration: 4000 });
  };

  const handleClaimPerk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) {
      toast.error(t("midasWeek.phoneToast"));
      return;
    }
    setIsClaimed(true);
    toast.success(t("midasWeek.unlockToast"), { duration: 6000 });
  };

  const handleShareSquad = () => {
    const shareText = "Yo! Grab your Express Entry pass and pre-sold tickets for Midas Summer Finale Weekend at Plantation Cove (Vanessa Bling on Sat Aug 29 & Capleton Live on Sun Aug 30): https://promorang.co/campaigns/midas";
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
    toast.success(t("midasWeek.waToast"));
  };

  return (
    <main className="min-h-screen bg-[#0a0908] text-[#f4efe5] selection:bg-[#ff5a1f] selection:text-white font-sans antialiased pb-32">
      <SEO
        title="Midas Summer Finale Weekend 2026 — Plantation Cove, Jamaica | Promorang"
        description="The official festival destination for Sophisticated Beach Party (Vanessa Bling) and Capleton Encore Live at Grizzly's Plantation Cove, August 29–30, 2026."
        url={getSiteUrl("/campaigns/midas")}
        image="/events/sophisticated-flyer.jpg"
      />

      {/* Background Ambience & Noise */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-15"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E")`
        }}
      />

      {/* Top Header */}
      <header className="relative z-20 border-b border-white/10 bg-[#0a0908]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white font-black tracking-widest text-sm hover:opacity-90">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5a1f] shadow-[0_0_0_4px_#ff5a1f33]" />
              <span className="font-serif text-base tracking-normal">PROMORANG <em className="text-[#ff5a1f] not-italic font-sans font-bold text-xs tracking-wider uppercase ml-1">{t("midasWeek.presents")}</em></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/venues/plantation-cove"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-stone-300 hover:text-white px-3 py-1.5 border border-white/15 rounded-sm"
            >
              <MapPin className="w-3.5 h-3.5 text-[#10b981]" />
              <span>{t("midasWeek.venueGuide")}</span>
            </Link>
            <a
              href="https://aitix.app/sophisticated"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs px-4 py-2.5 rounded-sm flex items-center gap-1.5 uppercase tracking-wider shadow-md"
            >
              <span>{t("midasWeek.getTickets")}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Festival Banner */}
      <section className="relative z-10 pt-10 pb-16 px-4 sm:px-6 border-b border-white/10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-950/40 via-[#0a0908] to-[#0a0908]">
        <div className="mx-auto max-w-5xl text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 bg-[#ff5a1f]/15 border border-[#ff5a1f]/40 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider text-[#ffcf38]">
            <Sparkles className="w-3.5 h-3.5 text-[#ff5a1f]" />
            <span>Midas Entertainment × 8Rivaz Ultra Lounge Present</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
            Summer Finale Weekend <span className="text-[#ff5a1f]">2026</span>
          </h1>

          <p className="text-stone-300 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Two unforgettable days of beachfront energy, live reggae vibrations, and world-class selectors at Jamaica's premier event grounds.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-stone-300 pt-2">
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-sm">
              <Calendar className="w-4 h-4 text-[#ff5a1f]" />
              <span>Saturday Aug 29 & Sunday Aug 30, 2026</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-sm">
              <MapPin className="w-4 h-4 text-[#10b981]" />
              <span>Grizzly's Plantation Cove · Priory, St. Ann</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-sm">
              <Clock className="w-4 h-4 text-[#ffcf38]" />
              <span>Gates Open 4:00 PM Daily</span>
            </span>
          </div>

        </div>
      </section>

      {/* Main Container */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pt-12 space-y-16">

        {/* THE 2 SHOWCASE EVENT TILES */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase tracking-widest block">
                {t("midasWeek.lineup")}
              </span>
              <h2 className="font-serif text-3xl font-bold text-white mt-1">
                Choose Your Experience or Attend Both
              </h2>
            </div>
            
            {/* Filter */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveDay('both')}
                className={`px-3 py-1.5 rounded-sm text-xs font-mono uppercase ${
                  activeDay === 'both' ? 'bg-[#ff5a1f] text-white font-bold' : 'bg-white/5 text-stone-400 border border-white/10'
                }`}
              >
                {t("midasWeek.bothDays")}
              </button>
              <button
                onClick={() => setActiveDay('sat')}
                className={`px-3 py-1.5 rounded-sm text-xs font-mono uppercase ${
                  activeDay === 'sat' ? 'bg-[#ff5a1f] text-white font-bold' : 'bg-white/5 text-stone-400 border border-white/10'
                }`}
              >
                {t("midasWeek.satOnly")}
              </button>
              <button
                onClick={() => setActiveDay('sun')}
                className={`px-3 py-1.5 rounded-sm text-xs font-mono uppercase ${
                  activeDay === 'sun' ? 'bg-[#a855f7] text-white font-bold' : 'bg-white/5 text-stone-400 border border-white/10'
                }`}
              >
                {t("midasWeek.sunOnly")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* DAY 1: SOPHISTICATED */}
            {(activeDay === 'both' || activeDay === 'sat') && (
              <div className="rounded-sm border-2 border-orange-500/40 bg-[#141210] overflow-hidden shadow-xl space-y-5 p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="bg-[#ff5a1f] text-white text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-sm">
                      Day 1 · Saturday, August 29, 2026
                    </span>
                    <span className="text-xs font-mono text-[#ffcf38]">4:00 PM – 10:00 PM</span>
                  </div>

                  <div className="aspect-[16/10] rounded-sm overflow-hidden border border-white/15 bg-black">
                    <img
                      src="/events/sophisticated-flyer.jpg"
                      alt="Sophisticated Beach Party Flyer featuring Vanessa Bling"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl font-bold text-white">
                      Sophisticated — The Summer End Beach Party
                    </h3>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Headlined by <strong>Vanessa Bling</strong> live in concert alongside Illusion, Trippple X, Bishop Escobar, and Fyah Prince. Hosted drinks from 4:00 PM – 7:00 PM.
                    </p>
                    <div className="p-3 bg-black/40 border border-white/10 rounded-sm font-mono text-xs text-stone-300 flex justify-between">
                      <span>{t("midasWeek.admission")} <strong>J$5,000 Pre-sold</strong></span>
                      <span className="text-stone-400">J$6,000 {t("midasWeek.gate")}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <a
                    href="https://aitix.app/sophisticated"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs py-3 rounded-sm text-center uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>{t("midasWeek.buyAitix")}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <Link
                    to="/moments/sophisticated"
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-stone-300 rounded-sm"
                  >
                    {t("midasWeek.momentHub")} ➔
                  </Link>
                </div>
              </div>
            )}

            {/* DAY 2: CAPLETON ENCORE LIVE */}
            {(activeDay === 'both' || activeDay === 'sun') && (
              <div className="rounded-sm border-2 border-purple-500/40 bg-[#141210] overflow-hidden shadow-xl space-y-5 p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="bg-[#a855f7] text-white text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-sm">
                      Day 2 · Sunday, August 30, 2026
                    </span>
                    <span className="text-xs font-mono text-[#ffcf38]">4:00 PM – 10:00 PM</span>
                  </div>

                  <div className="aspect-[16/10] rounded-sm overflow-hidden border border-white/15 bg-black">
                    <img
                      src="/events/encore-live-capleton-flyer.jpg"
                      alt="Capleton Encore Live Flyer"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl font-bold text-white">
                      Capleton Encore Live — Culture Rising
                    </h3>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Headlined by <strong>Capleton ("The Fireman" / King Shango)</strong>, Nesbeth, and Dean Fraser with DJ Delano (Renaissance), Bass Odyssey, and DJ Rors.
                    </p>
                    <div className="p-3 bg-black/40 border border-white/10 rounded-sm font-mono text-xs text-stone-300 flex justify-between">
                      <span>{t("midasWeek.admission")} <strong>J$5,000 Pre-sold</strong></span>
                      <span className="text-stone-400">J$7,000 {t("midasWeek.gate")}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <a
                    href="https://aitix.app/culturerising"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#a855f7] hover:bg-[#b86bf7] text-white font-mono font-bold text-xs py-3 rounded-sm text-center uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>{t("midasWeek.buyAitix")}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <Link
                    to="/moments/encore-live-featuring-capleton"
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-stone-300 rounded-sm"
                  >
                    {t("midasWeek.momentHub")} ➔
                  </Link>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* DISCOVERY POLL & CLAIM PASS PERK */}
        <section className="rounded-sm border-2 border-[#ffcf38]/40 bg-[#161310] p-6 sm:p-10 space-y-8 shadow-[10px_10px_0_#ff5a1f22]">
          
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="bg-[#ff5a1f] text-white text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-sm">
                {t("midasWeek.unlockGate")}
              </span>
              <span className="text-xs font-mono text-[#ffcf38]">
                {t("midasWeek.first50")}
              </span>
            </div>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Vote on the Summer Finale Poll to Claim Express Pass Key
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Tell us how you're ending summer 2026 to unlock an <strong>Express Entry Gate Pass Key</strong> or <strong>Early Hosted Drinks Token</strong> at Plantation Cove.
            </p>
          </div>

          {/* Poll Options */}
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-mono text-stone-400 uppercase block">{t("midasWeek.castVote")}</span>
            {[
              '🏖️ Beach party & oceanfront vibes (Sophisticated)',
              '🎤 Live reggae concert & conscious stage show (Capleton)',
              '🔥 High-energy club night & top sound system',
              '🍹 Chill courtyard lyme & food festival'
            ].map((opt) => (
              <button
                key={opt}
                onClick={() => handleVotePoll(opt)}
                className={`w-full p-3.5 rounded-sm text-left text-xs font-sans font-medium transition-all flex items-center justify-between border ${
                  votedOption === opt
                    ? 'bg-[#ff5a1f] border-[#ff5a1f] text-white font-bold shadow-md'
                    : 'bg-black/50 border-white/15 text-stone-200 hover:border-[#ff5a1f]'
                }`}
              >
                <span>{opt}</span>
                {votedOption === opt ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Vote className="w-4 h-4 text-stone-500" />}
              </button>
            ))}
          </div>

          {/* Claim Form */}
          <div className="border-t border-white/10 pt-6 space-y-4 max-w-2xl">
            <span className="text-xs font-mono text-stone-400 uppercase block">{t("midasWeek.enterWa")}</span>
            
            {isClaimed ? (
              <div className="p-6 bg-emerald-950/30 border-2 border-emerald-500/50 rounded-sm space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{t("midasWeek.passReserved")}</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Your express gate pass and 200 culture points are active for your phone number. Show this pass at the Plantation Cove entrance for fast-track entry!
                </p>
                <button
                  onClick={handleShareSquad}
                  className="bg-[#10b981] hover:bg-[#059669] text-black font-mono font-black text-xs px-5 py-3 rounded-sm uppercase tracking-wider flex items-center gap-2 shadow-md"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{t("midasWeek.forwardSquad")}</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleClaimPerk} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder={t("midasWeek.phonePh")}
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full bg-black/60 border border-white/20 text-xs text-white pl-10 pr-4 py-3 rounded-sm font-mono focus:outline-none focus:border-[#ff5a1f]"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs px-6 py-3 rounded-sm uppercase tracking-wider shadow-[3px_3px_0_#000]"
                >
                  {t("midasWeek.claimPass")}
                </Button>
              </form>
            )}
          </div>

        </section>

        {/* VIRAL WHATSAPP SQUAD SHARE CTA */}
        <section className="p-8 rounded-sm bg-gradient-to-r from-emerald-950/40 via-black to-black border-2 border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-mono font-bold text-[#10b981] uppercase">{t("midasWeek.rollCrew")}</span>
              <Badge className="bg-[#10b981] text-black font-bold text-[10px]">{t("midasWeek.squadBadge")}</Badge>
            </div>
            <h4 className="font-serif text-2xl font-bold text-white">Don't Party Alone at Plantation Cove</h4>
            <p className="text-xs text-stone-300 max-w-xl">
              Forward your pass code to 2 friends on WhatsApp. Top crew referrers unlock VIP Backstage Deck Upgrades and Soundcheck Double Passes.
            </p>
          </div>
          <button
            onClick={handleShareSquad}
            className="bg-[#10b981] hover:bg-[#059669] text-black font-mono font-bold text-xs px-6 py-3.5 rounded-sm uppercase tracking-wider shadow-[4px_4px_0_#000] flex items-center gap-2 shrink-0"
          >
            <Share2 className="w-4 h-4" />
            <span>{t("midasWeek.sendCrew")}</span>
          </button>
        </section>

        {/* VENUE & LOCATION INFORMATION */}
        <section className="rounded-sm border border-white/15 bg-[#141210] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#10b981] uppercase tracking-wider block">{t("midasWeek.officialVenue")}</span>
              <h3 className="font-serif text-2xl font-bold text-white">Grizzly's Plantation Cove · Priory, St. Ann</h3>
            </div>
            <Link
              to="/venues/plantation-cove"
              className="text-xs font-mono text-[#ffcf38] hover:underline flex items-center gap-1"
            >
              <span>{t("midasWeek.exploreVenue")}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-stone-300">
            <div className="space-y-1">
              <strong className="text-white block font-bold">{t("midasWeek.directions")}</strong>
              <p>Located on the North Coast Highway, Priory, St. Ann. 15 minutes from Ocho Rios, 50 minutes from Montego Bay.</p>
            </div>
            <div className="space-y-1">
              <strong className="text-white block font-bold">{t("midasWeek.gateTiming")}</strong>
              <p>Gates open at 4:00 PM sharp. Hosted drinks on Saturday run from 4:00 PM – 7:00 PM. Concert starts 6:00 PM.</p>
            </div>
            <div className="space-y-1">
              <strong className="text-white block font-bold">{t("midasWeek.outlets")}</strong>
              <p>Aitix Online (aitix.app/sophisticated, aitix.app/culturerising), 8Rivaz Ultra Lounge, and official St. Ann outlets.</p>
            </div>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="mt-24 border-t-2 border-white/10 bg-[#070605] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="font-serif font-bold text-lg text-white">MIDAS SUMMER FINALE <i className="text-[#ff5a1f] not-italic">WEEKEND 2026</i></span>
            <p className="text-xs text-stone-400">Presented by Midas Entertainment & 8Rivaz Ultra Lounge · Powered by Promorang</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/proposals/midas"
              className="text-xs font-mono text-stone-400 hover:text-white px-3 py-2 border border-white/15 rounded-sm"
            >
              {t("midasWeek.commercial")}
            </Link>
            <a
              href="https://aitix.app/sophisticated"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs px-5 py-2.5 rounded-sm uppercase tracking-wider shadow-md"
            >
              {t("midasWeek.getTicketsAitix")}
            </a>
          </div>
        </div>
      </footer>

    </main>
  );
}
