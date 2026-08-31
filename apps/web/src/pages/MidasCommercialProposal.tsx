import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Ticket,
  BarChart3,
  ExternalLink,
  MapPin,
  HelpCircle,
  Play,
  KeyRound,
  TrendingUp,
  AlertCircle,
  Layers,
  Award,
  Share2,
  Calendar,
  Phone,
  CheckCircle2,
  LockKeyhole,
  Check,
  ChevronRight,
  Eye,
  Info,
  Clock,
  Download,
  Megaphone,
  DollarSign,
  Coins,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getSiteUrl } from '@/lib/discovery';
import { useI18n } from '@/i18n/I18nContext';

export default function MidasCommercialProposal() {
  const { t } = useI18n();
  const [currentChapter, setCurrentChapter] = useState<number>(1);
  const navigate = useNavigate();

  const totalChapters = 6;

  const chapterTitles = [
    { num: 1, id: 'why', title: 'Why Look at This', subtitle: 'The $0 Monday Problem' },
    { num: 2, id: 'how', title: 'How It Works', subtitle: 'The 4-Step Fan Journey' },
    { num: 3, id: 'events', title: 'Your Two Events', subtitle: 'Flyers & Aitix Ticketing' },
    { num: 4, id: 'promopush', title: 'PromoPush & Sponsor Revenue', subtitle: 'Host Commissions & Brand ROI' },
    { num: 5, id: 'tour', title: 'Interactive Tour', subtitle: '5-Minute Live Preview' },
    { num: 6, id: 'deal', title: 'Host Operations & Terms', subtitle: 'Zero Risk Pilot Deal' }
  ];

  return (
    <main className="min-h-screen bg-[#0d0c0a] text-[#f4efe5] selection:bg-[#ff5a1f] selection:text-white font-sans antialiased pb-32">
      <SEO
        title="MIDAS ENTERTAINMENT × PROMORANG — Executive Brief & Commercial Proposal"
        description="Executive proposal for Midas Entertainment: How Promorang turns event promotion into an owned audience database and sponsor revenue engine for Sophisticated and Capleton Encore Live."
        url={getSiteUrl("/proposals/midas")}
      />

      {/* Promorang Grain & Paper Texture Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-15"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E")`
        }}
      />

      {/* Top Header Bar */}
      <header className="relative z-20 border-b border-[#ffffff18] bg-[#0d0c0a]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-white font-black tracking-widest text-sm hover:opacity-90 transition-opacity">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5a1f] shadow-[0_0_0_4px_#ff5a1f33]" />
              <span className="font-serif tracking-normal text-base">PROMORANG <em className="text-[#ff5a1f] not-italic font-sans font-bold text-xs tracking-wider uppercase ml-1">PRESENTS</em></span>
            </Link>
            <span className="text-[#ffffff25] text-sm">/</span>
            <span className="text-[#c9c0b5] text-xs font-mono font-bold uppercase tracking-wider">
              {t("midasPitch.execProposal")}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/hosts/midas"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-stone-300 hover:text-white px-3 py-1.5 border border-[#ffffff15] rounded-sm bg-white/5"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#ff5a1f]" />
              <span>{t("midasPitch.hostPortal")}</span>
            </Link>
            <button
              onClick={() => {
                sessionStorage.setItem('promorang_midas_demo_active', 'true');
                navigate('/discover?demo=midas&step=1');
              }}
              className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-black text-xs px-4 py-2.5 rounded-sm transition-all shadow-[4px_4px_0_#11100e] flex items-center gap-2 uppercase tracking-wider active:translate-x-[2px] active:translate-y-[2px]"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{t("midasPitch.launchFlow")}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Signature Physical Golden Ticket Stub Hero Header */}
      <section className="relative z-10 pt-10 pb-8 px-4 sm:px-6 overflow-hidden">
        <div className="mx-auto max-w-7xl">
          
          {/* Tactile 3D Golden Ticket Container */}
          <div className="relative bg-[#161310] border-2 border-[#ffcf38]/40 rounded-sm p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8),12px_12px_0_#ff5a1f33] overflow-hidden">
            
            {/* Ticket Perforations on Left and Right */}
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0d0c0a] border-2 border-[#ffcf38]/40 shadow-inner" />
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0d0c0a] border-2 border-[#ffcf38]/40 shadow-inner" />
            
            {/* Top Serial & Stamp Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-dashed border-[#ffcf38]/30 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#ffcf38] to-[#ff5a1f] p-0.5 shadow-md flex items-center justify-center text-black font-black font-serif text-lg">
                  M
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black uppercase tracking-widest text-[#ffcf38]">
                      EXECUTIVE COMMERCIAL BRIEF · PASS #MIDAS-2026-PC
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 border border-emerald-500/30">
                      {t("midasPitch.purview")}
                    </span>
                  </div>
                  <h2 className="text-xs text-stone-400 font-mono">
                    Prepared for Midas Entertainment & 8Rivaz Ultra Lounge · Grizzly's Plantation Cove, Jamaica
                  </h2>
                </div>
              </div>

              {/* Barcode & Timestamp */}
              <div className="hidden sm:flex items-center gap-4 text-right">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 h-5 justify-end">
                    {[3,1,4,2,1,5,2,4,1,3,2,5,1,2,4,2,3,1].map((h, i) => (
                      <span key={i} className="w-0.5 bg-[#ffcf38]/80" style={{ height: `${h * 4}px` }} />
                    ))}
                  </div>
                  <span className="text-[9px] font-mono text-[#ffcf38]/70 block tracking-widest">
                    *876-MIDAS-AUG2026*
                  </span>
                </div>
              </div>
            </div>

            {/* Headline Hook */}
            <div className="pt-8 space-y-6">
              <div className="max-w-4xl space-y-3">
                <span className="bg-[#ff5a1f] text-white text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-sm tracking-wider">
                  The Bottom Line for Midas Leadership
                </span>
                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#f4efe5] leading-[1.08]">
                  Stop renting attention. <i className="text-[#ff5a1f] font-serif not-italic">Own your crowd & monetize your sponsors.</i>
                </h1>
                <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl font-normal">
                  Midas is investing heavily into <strong>Vanessa Bling</strong> and <strong>Capleton</strong> for August 29–30 at Plantation Cove. Once the music stops, Instagram and ticket outlets keep your customer data. Promorang captures <strong>100% verified phone numbers</strong>, turns one-time ticket buyers into repeat buyers, and unlocks <strong>host commission revenue</strong> on brand sponsorships through PromoPush.
                </p>
              </div>

              {/* 3 Executive Questions Answered Upfront */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-[#0a0908] border border-[#ffffff15] rounded-sm space-y-1.5">
                  <span className="text-[10px] font-mono text-[#ffcf38] uppercase font-bold flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-[#ff5a1f]" /> 1. What is this?
                  </span>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    A zero-cost audience capture & sponsor monetization engine that runs alongside your flyers and <strong>Aitix ticket links</strong>.
                  </p>
                </div>

                <div className="p-4 bg-[#0a0908] border border-[#ffffff15] rounded-sm space-y-1.5">
                  <span className="text-[10px] font-mono text-[#ffcf38] uppercase font-bold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> 2. Why do we need it?
                  </span>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    On Monday morning, you won't reset to zero. You get a downloadable directory of phone numbers, a <strong>1.8x viral squad multiplier</strong>, and <strong>PromoPush sponsor commissions</strong>.
                  </p>
                </div>

                <div className="p-4 bg-[#0a0908] border border-[#ffffff15] rounded-sm space-y-1.5">
                  <span className="text-[10px] font-mono text-[#ffcf38] uppercase font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" /> 3. What does Midas provide?
                  </span>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Just 50 Express Entry Wristbands and 30 Early Hosted Drinks Tokens from your existing setup. <strong>Zero upfront platform fees.</strong>
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Sequential Guided Chapter Navigation Bar */}
      <div className="sticky top-0 z-30 border-y border-[#ffffff15] bg-[#0d0c0a]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between py-3">
            
            {/* Chapter Tabs */}
            <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none">
              {chapterTitles.map((chap) => (
                <button
                  key={chap.num}
                  onClick={() => setCurrentChapter(chap.num)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-sm text-xs font-mono uppercase transition-all whitespace-nowrap ${
                    currentChapter === chap.num
                      ? 'bg-[#ff5a1f] text-white font-black shadow-[2px_2px_0_#000]'
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                    currentChapter === chap.num ? 'bg-black text-white' : 'bg-white/10 text-stone-300'
                  }`}>
                    {chap.num}
                  </span>
                  <span>{chap.title}</span>
                </button>
              ))}
            </div>

            {/* Step Counter Indicator */}
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-stone-400 pl-4 border-l border-white/15">
              <span>{t("midasPitch.chapterOf", { current: currentChapter, total: totalChapters })}</span>
            </div>

          </div>
        </div>
      </div>

      {/* Main Chapter Content Container */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 pt-12 space-y-12">

        {/* CHAPTER 1: THE WHY (THE $0 MONDAY PROBLEM & SOLUTION) */}
        {currentChapter === 1 && (
          <div className="space-y-10 animate-in fade-in duration-200">
            
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase tracking-widest">
                Chapter 1 · The Commercial Challenge
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                The "Monday Morning Reset Trap"
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                Why Jamaican event promotion costs keep rising while promoters lose direct access to their attendees:
              </p>
            </div>

            {/* Comparison Grid: Traditional vs Promorang */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left: Traditional Status Quo */}
              <div className="p-6 rounded-sm bg-[#161210] border-2 border-red-500/30 space-y-5">
                <div className="flex items-center justify-between border-b border-red-500/20 pb-3">
                  <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                    Traditional Promotion (Status Quo)
                  </span>
                  <span className="text-[10px] font-mono text-red-300 bg-red-500/10 px-2 py-0.5 rounded-sm">
                    {t("midasPitch.rented")}
                  </span>
                </div>

                <div className="space-y-4 text-xs text-stone-300">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0">✕</span>
                    <div>
                      <strong className="text-white block font-bold">Rented Instagram & Meta Ads</strong>
                      <span>You pay for views, but Meta owns the algorithm and charges you again next month.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0">✕</span>
                    <div>
                      <strong className="text-white block font-bold">Anonymous Gate & Ticket Outlets</strong>
                      <span>People buy at outlets or physical gates, drink, party, and go home without giving you their phone numbers.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0">✕</span>
                    <div>
                      <strong className="text-white block font-bold">Monday Morning Reset ($0 Equity)</strong>
                      <span>When you announce your December or Easter show, you have to spend the entire marketing budget from scratch.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Promorang Audience Equity */}
              <div className="p-6 rounded-sm bg-[#141812] border-2 border-[#10b981]/50 space-y-5 shadow-[8px_8px_0_#10b98122]">
                <div className="flex items-center justify-between border-b border-[#10b981]/30 pb-3">
                  <span className="text-xs font-mono font-bold text-[#10b981] uppercase tracking-wider">
                    With Promorang Audience Equity
                  </span>
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-sm">
                    {t("midasPitch.owned")}
                  </span>
                </div>

                <div className="space-y-4 text-xs text-stone-300">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">✓</span>
                    <div>
                      <strong className="text-white block font-bold">Native Jamaican Discovery Polls</strong>
                      <span>Partygoers vote on cultural topics on Promorang in 5 seconds—capturing real intent instantly.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">✓</span>
                    <div>
                      <strong className="text-white block font-bold">1.8x WhatsApp Referral Multiplier</strong>
                      <span>Partygoers forward digital pass codes to their crew to unlock fast-lane gate entry and drink perks.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">✓</span>
                    <div>
                      <strong className="text-white block font-bold">100% Owned Contact Directory & Broadcast Hub</strong>
                      <span>Midas exports verified Jamaican attendee records and re-engages fans directly via targeted in-app dashboard alerts and email announcements.</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Chapter Action */}
            <div className="pt-4 flex items-center justify-between border-t border-white/10">
              <span className="text-xs text-stone-400 font-mono">{t("midasPitch.nextPhones")}</span>
              <Button
                onClick={() => setCurrentChapter(2)}
                className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs uppercase px-5 py-3 rounded-sm flex items-center gap-1.5"
              >
                <span>{t("midasPitch.ch2Fan")}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

          </div>
        )}

        {/* CHAPTER 2: THE FAN JOURNEY (4 SIMPLE STEPS) */}
        {currentChapter === 2 && (
          <div className="space-y-10 animate-in fade-in duration-200">
            
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase tracking-widest">
                Chapter 2 · The Experience
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                How It Works on the Ground (4 Steps)
              </h2>
              <p className="text-stone-300 text-sm">
                No apps to download. Everything opens instantly in mobile Safari or Chrome.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-3">
                <span className="font-mono text-2xl font-black text-[#ff5a1f]">01</span>
                <h4 className="font-serif text-lg font-bold text-white">Partygoer Votes on Poll</h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  On Promorang: <em>"How are you ending summer 2026?"</em>. User taps Beach Party or Live Concert.
                </p>
                <Link to="/discover" className="text-[11px] font-mono text-[#ff5a1f] hover:underline block pt-2 border-t border-white/10">
                  {t("midasPitch.viewPoll")} ➔
                </Link>
              </div>

              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-3">
                <span className="font-mono text-2xl font-black text-[#ff5a1f]">02</span>
                <h4 className="font-serif text-lg font-bold text-white">Claims Free Gate Perk</h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  They see <strong>PROMORANG PRESENTS: Sophisticated / Capleton</strong> and claim an Express Gate Pass or drink token by submitting their phone.
                </p>
                <span className="text-[10px] font-mono text-emerald-400 block pt-2 border-t border-white/10">{t("midasPitch.phoneCaptured")}</span>
              </div>

              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-3">
                <span className="font-mono text-2xl font-black text-[#ffcf38]">03</span>
                <h4 className="font-serif text-lg font-bold text-white">Shares Pass with Crew</h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  They tap <em>"Send to Crew on WhatsApp"</em>. Their friends get pass codes and direct links to buy tickets on <strong>Aitix</strong>.
                </p>
                <span className="text-[10px] font-mono text-[#ffcf38] block pt-2 border-t border-white/10">1.8x viral multiplier</span>
              </div>

              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#10b981]/40 space-y-3">
                <span className="font-mono text-2xl font-black text-[#10b981]">04</span>
                <h4 className="font-serif text-lg font-bold text-white">Scans at Plantation Cove</h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  At the gate, door staff verify the express pass in 2 seconds on the Promorang Door Scanner.
                </p>
                <Link to="/hosts/midas" className="text-[11px] font-mono text-[#10b981] hover:underline block pt-2 border-t border-white/10">
                  {t("midasPitch.viewScanner")} ➔
                </Link>
              </div>

            </div>

            {/* PHASE 3: THE POST-EVENT AFTERGLOW — MEMORY VAULT & MOMENT PIECES */}
            <div className="rounded-sm border-2 border-[#a855f7]/40 bg-[#16121a] p-6 sm:p-8 space-y-6 shadow-[8px_8px_0_#a855f722]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ffffff15] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#a855f7] uppercase tracking-wider">
                      Phase 3 · Post-Event Fan Retention
                    </span>
                    <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 border border-purple-500/30 rounded-sm">
                      LIVING EVENT ARCHIVE
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                    The Memory Vault & Official Moment Pieces
                  </h3>
                </div>
                <Badge className="bg-[#a855f7] text-white font-mono text-xs px-3 py-1 uppercase tracking-wider self-start sm:self-auto">
                  Post-Event Equity
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-3xl">
                On Monday morning when the sound system turns off, the energy doesn't disappear. Promorang automatically seals the event into the <strong>Midas Memory Vault</strong>:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-black/50 border border-[#ffffff15] rounded-sm space-y-2">
                  <strong className="text-white font-bold block flex items-center gap-1.5 text-sm">
                    <Layers className="w-4 h-4 text-[#a855f7]" />
                    1. Verified Moment Pieces
                  </strong>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    Official photo recaps, DJ live sets, and attendee crowd highlights are minted as digital <strong>Moment Pieces</strong> proving fans were physically in the crowd.
                  </p>
                </div>

                <div className="p-4 bg-black/50 border border-[#ffffff15] rounded-sm space-y-2">
                  <strong className="text-white font-bold block flex items-center gap-1.5 text-sm">
                    <Award className="w-4 h-4 text-[#ffcf38]" />
                    2. Fan Status & Loyalty Rank
                  </strong>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    Holding Midas Moment Pieces levels up partygoers into <strong>Tier 3 Culture Insiders</strong>, automatically token-gating 20% early-bird discounts and VIP deck perks for your December and Easter festivals.
                  </p>
                </div>

                <div className="p-4 bg-black/50 border border-[#ffffff15] rounded-sm space-y-2">
                  <strong className="text-white font-bold block flex items-center gap-1.5 text-sm">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    3. Direct In-App & Email Hub
                  </strong>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    Broadcast holiday presales, soundcheck pass drops, or sponsored perks straight to attendees via in-app dashboard alerts and direct emails—without paying Meta ad fees.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-black/40 border border-white/10 rounded-sm flex items-center justify-between text-xs font-mono text-stone-300">
                <span className="text-purple-300">✓ Keeps your audience active 365 days a year between major calendar events</span>
                <div className="flex items-center gap-3">
                  <Link to="/vault" className="text-[#ffcf38] hover:underline flex items-center gap-1">
                    <span>{t("midasPitch.vaultLadder")}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  <span className="text-white/20">·</span>
                  <Link to="/hosts/midas" className="text-emerald-400 hover:underline flex items-center gap-1">
                    <span>{t("midasPitch.bcastCenter")}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Chapter Navigation */}
            <div className="pt-4 flex items-center justify-between border-t border-white/10">
              <Button
                variant="outline"
                onClick={() => setCurrentChapter(1)}
                className="border-white/20 font-mono text-xs uppercase"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>{t("midasPitch.ch1")}</span>
              </Button>
              <Button
                onClick={() => setCurrentChapter(3)}
                className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs uppercase px-5 py-3 rounded-sm flex items-center gap-1.5"
              >
                <span>{t("midasPitch.ch3Events")}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

          </div>
        )}

        {/* CHAPTER 3: THE 2 EVENTS & OFFICIAL FLYERS */}
        {currentChapter === 3 && (
          <div className="space-y-10 animate-in fade-in duration-200">
            
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase tracking-widest">
                Chapter 3 · Event Activation Showcase
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                The Two Showcase Moments at Plantation Cove
              </h2>
              <p className="text-stone-300 text-sm">
                Both events have been fully built with high-res flyers, official timings, artist lineups, and direct Aitix ticketing.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Event 1: Sophisticated */}
              <div className="rounded-sm border-2 border-[#ff5a1f]/40 bg-[#141210] p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-[#ffffff15] pb-3">
                  <div>
                    <span className="bg-[#ff5a1f] text-white text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-sm">
                      Saturday, August 29, 2026
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-white mt-1.5">
                      Sophisticated — The Beach Party
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#ffcf38]">4:00 PM – 10:00 PM</span>
                </div>

                <div className="aspect-[16/10] rounded-sm overflow-hidden border border-[#ffffff20] bg-black">
                  <img
                    src="/events/sophisticated-flyer.jpg"
                    alt="Sophisticated Beach Party Flyer featuring Vanessa Bling"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2 text-xs text-stone-300">
                  <p><strong>Headliner:</strong> Vanessa Bling live in concert alongside Illusion, Trippple X, Bishop Escobar & Fyah Prince.</p>
                  <p><strong>Ticketing:</strong> J$5,000 Pre-sold / J$6,000 Gate (Hosted drinks 4–7 PM).</p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <a
                    href="https://aitix.app/sophisticated"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs px-4 py-2.5 rounded-sm flex items-center gap-1.5"
                  >
                    <span>{t("midasPitch.buyTickets")}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <Link
                    to="/moments/sophisticated"
                    className="text-xs font-mono text-stone-300 hover:text-white underline underline-offset-4"
                  >
                    {t("midasPitch.viewMoment")} ➔
                  </Link>
                </div>
              </div>

              {/* Event 2: Capleton */}
              <div className="rounded-sm border-2 border-[#a855f7]/40 bg-[#141210] p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-[#ffffff15] pb-3">
                  <div>
                    <span className="bg-[#a855f7] text-white text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-sm">
                      Sunday, August 30, 2026
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-white mt-1.5">
                      Capleton Encore Live — Culture Rising
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#ffcf38]">4:00 PM – 10:00 PM</span>
                </div>

                <div className="aspect-[16/10] rounded-sm overflow-hidden border border-[#ffffff20] bg-black">
                  <img
                    src="/events/encore-live-capleton-flyer.jpg"
                    alt="Capleton Encore Live Flyer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2 text-xs text-stone-300">
                  <p><strong>Headliner:</strong> Capleton ("The Fireman" / King Shango), Nesbeth & Dean Fraser with DJ Delano (Renaissance) & Bass Odyssey.</p>
                  <p><strong>Ticketing:</strong> J$5,000 Pre-sold / J$7,000 Gate.</p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <a
                    href="https://aitix.app/culturerising"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#a855f7] hover:bg-[#b86bf7] text-white font-mono font-bold text-xs px-4 py-2.5 rounded-sm flex items-center gap-1.5"
                  >
                    <span>{t("midasPitch.buyTickets")}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <Link
                    to="/moments/encore-live-featuring-capleton"
                    className="text-xs font-mono text-stone-300 hover:text-white underline underline-offset-4"
                  >
                    {t("midasPitch.viewMoment")} ➔
                  </Link>
                </div>
              </div>

            </div>

            {/* UNIFIED WEEKEND AUDIENCE CAMPAIGN HUB */}
            <div className="rounded-sm border-2 border-[#ffcf38]/50 bg-[#161310] p-6 sm:p-8 space-y-5 shadow-[8px_8px_0_#ffcf3822]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#ffcf38] uppercase tracking-wider">
                      Public Fan Destination
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 border border-emerald-500/30 rounded-sm">
                      MASTER PROMO LINK READY
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                    The Midas Summer Finale Audience Campaign Page
                  </h3>
                </div>
                <Link
                  to="/campaigns/midas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs px-5 py-3 rounded-sm uppercase tracking-wider flex items-center gap-2 shadow-md shrink-0"
                >
                  <span>{t("midasPitch.openPublic")}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Instead of sending fans to separate confusing links, Midas gets a single high-converting festival hub (<strong>promorang.co/campaigns/midas</strong>) to put in your Instagram bio, press releases, and WhatsApp broadcasts. Fans can vote on the poll, claim express entry passes, invite friends on WhatsApp, and buy tickets directly on Aitix.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-stone-300">
                <div className="p-3 bg-black/50 border border-white/10 rounded-sm">
                  <span className="text-[#ff5a1f] block font-bold">✓ Weekend Festival Hub</span>
                  <span className="text-[11px] text-stone-400">Sophisticated + Capleton</span>
                </div>
                <div className="p-3 bg-black/50 border border-white/10 rounded-sm">
                  <span className="text-[#ffcf38] block font-bold">✓ Live Poll & Perks</span>
                  <span className="text-[11px] text-stone-400">Captures phone / WhatsApp</span>
                </div>
                <div className="p-3 bg-black/50 border border-white/10 rounded-sm">
                  <span className="text-emerald-400 block font-bold">✓ 1.8x WhatsApp Forward</span>
                  <span className="text-[11px] text-stone-400">Viral squad multiplier active</span>
                </div>
              </div>
            </div>

            {/* Bottom Chapter Navigation */}
            <div className="pt-4 flex items-center justify-between border-t border-white/10">
              <Button
                variant="outline"
                onClick={() => setCurrentChapter(2)}
                className="border-white/20 font-mono text-xs uppercase"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>{t("midasPitch.ch2")}</span>
              </Button>
              <Button
                onClick={() => setCurrentChapter(4)}
                className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs uppercase px-5 py-3 rounded-sm flex items-center gap-1.5"
              >
                <span>{t("midasPitch.ch4Push")}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

          </div>
        )}

        {/* CHAPTER 4: PROMOPUSH & SPONSOR REVENUE (MONETIZATION & COMMISSIONS) */}
        {currentChapter === 4 && (
          <div className="space-y-10 animate-in fade-in duration-200">
            
            <div className="max-w-3xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase tracking-widest">
                  Chapter 4 · PromoPush Sponsor Monetization
                </span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 border border-emerald-500/30 rounded-sm">
                  15%–20% HOST CASH COMMISSION
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                How PromoPush Monetizes Midas Sponsors
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                Corporate sponsors (beverage, telecom, lifestyle brands) pay premium rates for Promorang-powered events because we deliver verified foot traffic and user-generated content—while Midas earns a direct commission on every campaign dollar.
              </p>
            </div>

            {/* The 3 Core Pillars: What We Do, What Midas Gets, What Sponsors Get */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* 1. What We Do For You */}
              <div className="p-6 rounded-sm bg-[#161210] border-2 border-[#ffffff15] space-y-3">
                <div className="w-9 h-9 rounded-sm bg-[#ff5a1f]/20 text-[#ff5a1f] flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg font-bold text-white">1. What We Do For You</h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  We deploy <strong>PromoPush on-site missions</strong>: turning partygoers into active micro-promoters who post with your sponsors' drinks and check in at sponsor tents to earn points and rewards.
                </p>
                <span className="text-[10px] font-mono text-[#ff5a1f] block pt-2 border-t border-white/10">100+ organic UGC videos per event</span>
              </div>

              {/* 2. What Midas Gets */}
              <div className="p-6 rounded-sm bg-[#141812] border-2 border-[#10b981]/50 space-y-3 shadow-[6px_6px_0_#10b98122]">
                <div className="w-9 h-9 rounded-sm bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg font-bold text-white">2. What Midas Gets</h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Midas earns a <strong>15%–20% Host Cash Commission</strong> on all brand campaign budgets placed through PromoPush for your events (e.g. J$1M sponsor pool = <strong>J$150k–J$200k profit</strong> to Midas).
                </p>
                <span className="text-[10px] font-mono text-emerald-300 block pt-2 border-t border-white/10">Pure incremental revenue for Midas</span>
              </div>

              {/* 3. What Your Sponsors Get */}
              <div className="p-6 rounded-sm bg-[#161210] border-2 border-[#ffcf38]/40 space-y-3">
                <div className="w-9 h-9 rounded-sm bg-[#ffcf38]/20 text-[#ffcf38] flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg font-bold text-white">3. What Your Sponsors Get</h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Sponsors get <strong>guaranteed foot traffic</strong>, verified cocktail redemptions, hundreds of TikTok/Reel mentions, and a real-time analytics dashboard proving exact return on investment.
                </p>
                <span className="text-[10px] font-mono text-[#ffcf38] block pt-2 border-t border-white/10">10x measurable ROI vs static banners</span>
              </div>

            </div>

            {/* PROMOPUSH DISTRIBUTION MATRIX: HOW SPONSORS REACH JAMAICA */}
            <div className="rounded-sm border border-white/15 bg-[#141210] p-6 sm:p-7 space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#ffcf38] uppercase tracking-wider">
                    PromoPush Omnichannel Distribution
                  </span>
                  <Badge className="bg-[#ff5a1f] text-white font-mono text-[10px]">
                    MULTI-SURFACE ENGINE
                  </Badge>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  How PromoPush Distributes Promotions for Midas & Your Sponsors
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-black/50 border border-white/10 rounded-sm space-y-1.5">
                  <strong className="text-white font-bold block flex items-center gap-1.5 text-sm">
                    <Target className="w-4 h-4 text-blue-400" />
                    1. Geo-Fenced Meta Ads
                  </strong>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    Hyper-local Instagram & Facebook video ads targeted across St. Ann, Kingston, Montego Bay, and diaspora travel corridors driving directly into the ticket & perk funnel.
                  </p>
                </div>

                <div className="p-4 bg-black/50 border border-white/10 rounded-sm space-y-1.5">
                  <strong className="text-white font-bold block flex items-center gap-1.5 text-sm">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    2. Conversational Chatbots
                  </strong>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    Automated WhatsApp and IG Direct DM chatbots that answer fan questions 24/7 and deliver instant gate pass keys or drink vouchers straight into their chat.
                  </p>
                </div>

                <div className="p-4 bg-black/50 border border-white/10 rounded-sm space-y-1.5">
                  <strong className="text-white font-bold block flex items-center gap-1.5 text-sm">
                    <Layers className="w-4 h-4 text-[#ffcf38]" />
                    3. Flexible Placement Surfaces
                  </strong>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    Featured in Promorang's <strong>Discovery Carousels</strong>, pinned in <strong>Exclusive Dedicated Posts</strong>, or hosted on custom <strong>Branded Campaign Landing Hubs</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Practical Sponsor Example Box */}
            <div className="rounded-sm border-2 border-[#ff5a1f] bg-[#1a1410] p-6 sm:p-8 space-y-6 shadow-[8px_8px_0_#ff5a1f33]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ffffff15] pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-[#ffcf38] uppercase tracking-wider block">
                    Real-World Event Activation Example
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                    How This Works at Plantation Cove (August 29–30)
                  </h3>
                </div>
                <Badge className="bg-[#ff5a1f] text-white font-mono text-xs px-3 py-1 uppercase tracking-wider self-start sm:self-auto">
                  High-Margin Sponsor Packages
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                
                <div className="p-4 bg-black/50 border border-[#ffffff15] rounded-sm space-y-3">
                  <strong className="text-white text-sm font-bold block flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-[#ffcf38]" />
                    The Beverage Sponsor Campaign
                  </strong>
                  <p className="text-stone-300 leading-relaxed">
                    A liquor sponsor (e.g. Campari or Wray & Nephew) funds a <strong>J$500,000 sampling bounty</strong> on PromoPush. Partygoers at Sophisticated receive a push notification:
                  </p>
                  <div className="p-3 bg-white/5 border border-white/10 rounded-sm space-y-1 font-mono text-[11px] text-[#ffcf38]">
                    <p>🎯 "Order a signature cocktail at the main bar, snap a 5-sec video to your IG Story tagging @Sophisticated & the sponsor, and get 200 points + J$1,000 cash back."</p>
                  </div>
                </div>

                <div className="p-4 bg-black/50 border border-[#ffffff15] rounded-sm space-y-3">
                  <strong className="text-white text-sm font-bold block flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    The Direct Financial Return
                  </strong>
                  <ul className="space-y-2 text-stone-300">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span><strong>For Midas:</strong> Earns <strong>J$75,000–J$100,000</strong> host commission on this single sponsor activation.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span><strong>For the Sponsor:</strong> 250+ verified drinks ordered at the bar and 250+ video stories shared to thousands of followers across Jamaica.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span><strong>For Midas Sales Team:</strong> You can pitch corporate brands high-tech sponsorships that guarantee real sales and digital buzz.</span>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Pitch-Ready Brand Deck Forwarding Box */}
              <div className="p-4 bg-[#0d0c0a] border border-[#ffcf38]/40 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#ffcf38]" />
                    <span>Send This to Your Beverage & Corporate Brand Sponsors:</span>
                  </span>
                  <span className="text-[11px] text-stone-400 font-mono">
                    We built a dedicated Brand Sponsorship Deck & Interactive ROI Calculator (J$250k–J$2.5M tiers) for Midas sponsors.
                  </span>
                </div>
                <Link
                  to="/sponsorships/midas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#ffcf38] hover:bg-[#ffe066] text-black font-mono font-bold text-xs px-4 py-2.5 rounded-sm uppercase tracking-wider flex items-center gap-1.5 shrink-0 shadow-md"
                >
                  <span>{t("midasPitch.openBrand")}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>

            {/* PERPETUAL HOST AFFILIATE OVERRIDE ENGINE */}
            <div className="rounded-sm border-2 border-emerald-500/40 bg-[#121812] p-6 sm:p-8 space-y-6 shadow-[8px_8px_0_#10b98122]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                      Compounding Audience Equity
                    </span>
                    <Badge className="bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                      PERPETUAL AFFILIATE COMMISSIONS
                    </Badge>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                    Why Every Fan You Onboard Pays Midas Forever
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-3xl">
                When a partygoer votes on the poll, claims a gate perk, or scans into Plantation Cove, their Promorang account is permanently tagged to <strong>Midas Entertainment</strong> as their referring Host.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-black/50 border border-white/10 rounded-sm space-y-2">
                  <strong className="text-white font-bold block flex items-center gap-1.5 text-sm">
                    <Users className="w-4 h-4 text-emerald-400" />
                    1. Permanent Downline Attribution
                  </strong>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    You are not just selling a ticket once. You are building a tagged network of 3,500+ culture consumers who remain linked to Midas in the Promorang ecosystem.
                  </p>
                </div>

                <div className="p-4 bg-black/50 border border-white/10 rounded-sm space-y-2">
                  <strong className="text-white font-bold block flex items-center gap-1.5 text-sm">
                    <Coins className="w-4 h-4 text-[#ffcf38]" />
                    2. Ongoing Platform Overrides
                  </strong>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    Whenever these users engage with future brand campaigns, claim merchant offers, or attend other Promorang events across Jamaica, Midas earns continuous affiliate overrides.
                  </p>
                </div>

                <div className="p-4 bg-black/50 border border-white/10 rounded-sm space-y-2">
                  <strong className="text-white font-bold block flex items-center gap-1.5 text-sm">
                    <Award className="w-4 h-4 text-[#ff5a1f]" />
                    3. Micro-Promoter Royalties
                  </strong>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    If any partygoers who signed up under Midas become active micro-promoters on PromoPush, Midas receives an ongoing royalty on every brand campaign they complete.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-black/40 border border-emerald-500/20 rounded-sm flex items-center justify-between text-xs font-mono text-emerald-300">
                <span>✓ Turns a 2-day weekend event into a 365-day compounding revenue stream for Midas</span>
                <Link to="/hosts/midas" className="text-white hover:underline flex items-center gap-1">
                  <span>{t("midasPitch.viewCrm")}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Bottom Chapter Navigation */}
            <div className="pt-4 flex items-center justify-between border-t border-white/10">
              <Button
                variant="outline"
                onClick={() => setCurrentChapter(3)}
                className="border-white/20 font-mono text-xs uppercase"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>{t("midasPitch.ch3")}</span>
              </Button>
              <Button
                onClick={() => setCurrentChapter(5)}
                className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs uppercase px-5 py-3 rounded-sm flex items-center gap-1.5"
              >
                <span>{t("midasPitch.ch5Tour")}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

          </div>
        )}

        {/* CHAPTER 5: INTERACTIVE 5-MINUTE LIVE TOUR */}
        {currentChapter === 5 && (
          <div className="space-y-10 animate-in fade-in duration-200">
            
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase tracking-widest">
                Chapter 5 · Interactive Walkthrough
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                Test the 5 Live Platform Nodes Right Now
              </h2>
              <p className="text-stone-300 text-sm">
                Click any stage below or launch the guided overlay tour to experience the full funnel from consumer to host command center.
              </p>
            </div>

            {/* 6 Stages Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { step: 1, title: '1. Discovery Polls', desc: 'Summer Finale Poll', path: '/discover?demo=midas&step=1', color: 'border-orange-500/40 text-orange-400' },
                { step: 2, title: '2. Campaign Hub', desc: 'Master Festival Page', path: '/campaigns/midas', color: 'border-[#ffcf38]/40 text-[#ffcf38]' },
                { step: 3, title: '3. Sophisticated', desc: 'Vanessa Bling + Aitix', path: '/moments/sophisticated?demo=midas&step=2', color: 'border-orange-500/40 text-orange-400' },
                { step: 4, title: '4. Capleton Live', desc: 'Concert + Aitix', path: '/moments/encore-live-featuring-capleton?demo=midas&step=3', color: 'border-purple-500/40 text-purple-400' },
                { step: 5, title: '5. Venue Hub', desc: 'Plantation Cove Profile', path: '/venues/plantation-cove?demo=midas&step=4', color: 'border-emerald-500/40 text-emerald-400' },
                { step: 6, title: '6. Host Center', desc: 'Loyalty Scanner & Broadcast', path: '/hosts/midas?demo=midas&step=5', color: 'border-amber-500/40 text-amber-400' }
              ].map((s) => (
                <button
                  key={s.step}
                  onClick={() => {
                    sessionStorage.setItem('promorang_midas_demo_active', 'true');
                    navigate(s.path);
                  }}
                  className={`p-3.5 rounded-sm bg-[#141210] border-2 ${s.color} text-left space-y-1.5 hover:bg-white/5 transition-all group`}
                >
                  <span className="text-[9px] font-mono uppercase font-bold block">{t("midasPitch.node", { step: s.step })}</span>
                  <strong className="text-white text-xs block group-hover:text-[#ff5a1f] truncate">{s.title}</strong>
                  <p className="text-[10px] text-stone-400 leading-snug">{s.desc}</p>
                  <span className="text-[10px] font-mono text-[#ffcf38] flex items-center gap-1 pt-1">
                    <span>{t("midasPitch.open")}</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              ))}
            </div>

            {/* Launch Guided Tour CTA */}
            <div className="p-8 rounded-sm bg-gradient-to-r from-[#ff5a1f]/20 via-black to-[#a855f7]/20 border-2 border-[#ff5a1f]/50 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[8px_8px_0_#000]">
              <div className="space-y-1 text-center sm:text-left">
                <strong className="text-white text-lg font-serif block font-bold">Ready to take the 5-step guided tour?</strong>
                <p className="text-xs text-stone-300">An executive HUD bar will guide you step-by-step through each live screen.</p>
              </div>
              <button
                onClick={() => {
                  sessionStorage.setItem('promorang_midas_demo_active', 'true');
                  navigate('/discover?demo=midas&step=1');
                }}
                className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs px-6 py-3.5 rounded-sm uppercase tracking-wider shadow-md flex items-center gap-2 shrink-0"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{t("midasPitch.startTour")}</span>
              </button>
            </div>

            {/* Bottom Chapter Navigation */}
            <div className="pt-4 flex items-center justify-between border-t border-white/10">
              <Button
                variant="outline"
                onClick={() => setCurrentChapter(4)}
                className="border-white/20 font-mono text-xs uppercase"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>{t("midasPitch.ch4")}</span>
              </Button>
              <Button
                onClick={() => setCurrentChapter(6)}
                className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs uppercase px-5 py-3 rounded-sm flex items-center gap-1.5"
              >
                <span>{t("midasPitch.ch6Terms")}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

          </div>
        )}

        {/* CHAPTER 6: HOST OPERATIONS & TERMS (ZERO RISK PILOT) */}
        {currentChapter === 6 && (
          <div className="space-y-10 animate-in fade-in duration-200">
            
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-mono font-bold text-[#10b981] uppercase tracking-widest">
                Chapter 6 · Commercial Agreement & Next Steps
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                Zero-Risk Pilot Terms for August 29–30
              </h2>
              <p className="text-stone-300 text-sm">
                No software subscription fees. No complex contracts.
              </p>
            </div>

            {/* What Promorang Delivers vs What Midas Provides */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* 1. What Midas Gets */}
              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#10b981]/40 space-y-4">
                <span className="text-xs font-mono font-bold text-[#10b981] uppercase block flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  1. What Midas Gets
                </span>
                <div className="space-y-3 text-xs text-stone-300">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>100% Owned Contact Database:</strong> Downloadable CSV directory and direct in-app / email re-engagement hub to broadcast December & Easter presales.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>1.8x Viral Referral Engine:</strong> Native pass forwarding driving direct ticket sales on Aitix.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>15%–20% PromoPush Sponsor Commission:</strong> High-margin cash revenue on all corporate brand campaigns deployed at your event.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Dedicated Midas Host Operations & Broadcast Hub:</strong> Real-time gate scanner with Fan Loyalty Rank detection and direct in-app alerts at `/hosts/midas`.</span>
                  </div>
                </div>
              </div>

              {/* 2. What's Needed From Midas */}
              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffcf38]/40 space-y-4">
                <span className="text-xs font-mono font-bold text-[#ffcf38] uppercase block flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-[#ffcf38]" />
                  2. What Is Needed From Midas
                </span>
                <div className="space-y-3 text-xs text-stone-300">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#ffcf38] shrink-0 mt-0.5" />
                    <span><strong>50 Express Entry Wristbands per event:</strong> Fast-lane door access allocated to verified voters (zero out-of-pocket cost).</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#ffcf38] shrink-0 mt-0.5" />
                    <span><strong>30 Early Hosted Drinks Tokens:</strong> Redeemable strictly during early arrival hours (4:00 PM – 6:00 PM) to pack the venue early.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#ffcf38] shrink-0 mt-0.5" />
                    <span><strong>Co-Promo Link:</strong> Adding `promorang.co/moments/sophisticated` alongside your Aitix links on Instagram stories & bio.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Zero Platform Charge:</strong> 100% free pilot partnership for the August 29–30 weekend.</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Direct Approval Action Box */}
            <div className="p-8 rounded-sm bg-[#161310] border-2 border-[#ff5a1f] space-y-6 shadow-[10px_10px_0_#ff5a1f33]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase">Ready to lock in the activation?</span>
                  <h3 className="font-serif text-2xl font-bold text-white">Approve Midas Summer 2026 Activation</h3>
                  <p className="text-xs text-stone-300">Our engineering and cultural curation team will publish your campaign live within 2 hours.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to="/hosts/midas"
                    className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs px-6 py-3.5 rounded-sm uppercase tracking-wider shadow-md flex items-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>{t("midasPitch.openOps")}</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Chapter Navigation */}
            <div className="pt-4 flex items-center justify-between border-t border-white/10">
              <Button
                variant="outline"
                onClick={() => setCurrentChapter(5)}
                className="border-white/20 font-mono text-xs uppercase"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>{t("midasPitch.ch5")}</span>
              </Button>
              <Button
                onClick={() => setCurrentChapter(1)}
                variant="outline"
                className="border-white/20 font-mono text-xs uppercase"
              >
                <span>{t("midasPitch.returnCh1")}</span>
              </Button>
            </div>

          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="mt-24 border-t-2 border-[#ffffff15] bg-[#070605] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="font-serif font-bold text-lg text-white">PROMORANG <i className="text-[#ff5a1f] not-italic">COMMERCIAL PROPOSAL</i></span>
            <p className="text-xs text-[#887f74]">Midas Entertainment × 8Rivaz Ultra Lounge · Grizzly's Plantation Cove</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/hosts/midas"
              className="bg-[#ffffff0a] hover:bg-[#ffffff15] text-stone-300 hover:text-white font-mono text-xs px-5 py-3 rounded-sm border border-[#ffffff15]"
            >
              {t("midasPitch.opsCenter")}
            </Link>
            <button
              onClick={() => {
                sessionStorage.setItem('promorang_midas_demo_active', 'true');
                navigate('/discover?demo=midas&step=1');
              }}
              className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs px-5 py-3 rounded-sm uppercase tracking-wider shadow-[4px_4px_0_#000]"
            >
              {t("midasPitch.launchTour")}
            </button>
          </div>
        </div>
      </footer>

    </main>
  );
}
