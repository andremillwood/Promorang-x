import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Zap,
  Target,
  BarChart3,
  Users,
  Compass,
  FileText,
  Lock,
  ChevronRight,
  ExternalLink,
  Award,
  Clock,
  MapPin,
  QrCode,
  Radio,
  Share2,
  Calendar,
  Ticket,
  HelpCircle,
  Smartphone,
  X,
  Play,
  Flame,
  Sliders,
  KeyRound,
  CheckCircle2,
  LockKeyhole,
  Music,
  Send,
  AlertCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { getSiteUrl } from '@/lib/discovery';

export default function MidasCommercialProposal() {
  const [activeTab, setActiveTab] = useState<'problem' | 'howitworks' | 'events' | 'perks' | 'outcomes'>('problem');
  
  // Interactive Access Drop Simulator State
  const [expressPassCount, setExpressPassCount] = useState(50);
  const [vipUpgradeCount, setVipUpgradeCount] = useState(10);
  const [drinkTokenCount, setDrinkTokenCount] = useState(30);

  // Interactive Guestpass Code Input Demo
  const [demoCode, setDemoCode] = useState('MIDAS-VIP-2026');
  const [codeUnlocked, setCodeUnlocked] = useState(false);

  const navigate = useNavigate();

  // Plain-English Calculated Projections
  const estimatedParticipants = (expressPassCount * 3) + (vipUpgradeCount * 5) + (drinkTokenCount * 2) + 250;
  const estimatedSquadReferrals = Math.round(estimatedParticipants * 1.8);
  const estimatedRetainedAudience = Math.round(estimatedParticipants * 0.75);

  const handleTestUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoCode.trim()) return;
    setCodeUnlocked(true);
    toast.success("Guest Pass Validated: +200 Points & Express Gate Pass Unlocked!");
  };

  return (
    <main className="min-h-screen bg-[#0d0c0a] text-[#f4efe5] selection:bg-[#ff5a1f] selection:text-white font-sans antialiased pb-32">
      <SEO
        title="MIDAS ENTERTAINMENT × PROMORANG — Simple Event Growth Proposal"
        description="How Midas can turn flyer hype into an owned crowd of repeat ticket buyers for Sophisticated and Encore Live at Plantation Cove."
        url={getSiteUrl("/proposals/midas")}
      />

      {/* Promorang Noise Texture Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E")`
        }}
      />

      {/* Top Promorang Presents Navigation Bar */}
      <header className="relative z-20 border-b border-[#ffffff18] bg-[#0d0c0a]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-white font-black tracking-widest text-sm hover:opacity-90 transition-opacity">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5a1f] shadow-[0_0_0_4px_#ff5a1f33]" />
              <span className="font-serif tracking-normal text-base">PROMORANG <em className="text-[#ff5a1f] not-italic font-sans font-bold text-xs tracking-wider uppercase ml-1">PRESENTS</em></span>
            </Link>
            <span className="text-[#ffffff25] text-sm">/</span>
            <span className="text-[#c9c0b5] text-xs font-mono font-bold uppercase tracking-wider">
              Midas Entertainment Brief
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sessionStorage.setItem('promorang_midas_demo_active', 'true');
                navigate('/discover?demo=midas&step=1');
              }}
              className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-black text-xs px-4 py-2.5 rounded-sm transition-all shadow-[4px_4px_0_#11100e] flex items-center gap-2 uppercase tracking-wider active:translate-x-[2px] active:translate-y-[2px]"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>See How It Works (Live Demo)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-14 pb-16 px-4 sm:px-6 overflow-hidden border-b border-[#ffffff15] bg-[radial-gradient(circle_at_80%_25%,#48200f_0,transparent_45%),linear-gradient(135deg,#0d0c0a_60%,#1f110a)]">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Copy: Straight to the point */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3 text-xs font-mono font-bold tracking-widest text-[#cfc5b7] uppercase">
              <span className="w-6 h-[2px] bg-[#ff5a1f]" />
              <span>Partnership Proposal · Summer 2026</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#f4efe5] leading-[1.05]">
              Every event you promote, <i className="text-[#ff5a1f] font-serif not-italic">you shouldn't have to start from zero.</i>
            </h1>

            <p className="text-base sm:text-lg text-[#c9c0b5] leading-relaxed max-w-xl font-normal">
              You spend money on Meta ads, flyers, DJs, and WhatsApp blasts. People party and go home. But on Monday morning, you don't have their numbers—so you have to pay all over again for the next event. 
            </p>

            <p className="text-sm font-semibold text-white bg-[#ffffff0a] p-4 border-l-4 border-[#ff5a1f] rounded-r-sm">
              💡 <strong>The Fix:</strong> Promorang gives your crowd perks (express entry, drink tokens) to identify themselves and invite their squad on WhatsApp. You build an owned crowd of repeat buyers forever.
            </p>

            {/* CTA Group */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => {
                  sessionStorage.setItem('promorang_midas_demo_active', 'true');
                  navigate('/discover?demo=midas&step=1');
                }}
                className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-bold text-sm px-6 py-4 rounded-sm transition-all shadow-[6px_6px_0_#000000] flex items-center gap-2 uppercase tracking-wider"
              >
                <span>Launch Live 3-Minute Walkthrough</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/venues/plantation-cove"
                className="bg-[#ffffff0d] hover:bg-[#ffffff18] border border-[#ffffff20] text-[#f4efe5] font-bold text-sm px-6 py-4 rounded-sm transition-all flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-[#ffcf38]" />
                <span>View Plantation Cove Venue Page</span>
              </Link>
            </div>
          </div>

          {/* Right: The Midas Physical Ticket Pass */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm transform rotate-1 hover:rotate-0 transition-transform duration-300 bg-[#f4efe5] text-[#11100e] p-6 shadow-[14px_14px_0_#ff5a1f] border-2 border-[#11100e] relative space-y-4 font-sans">
              
              <div className="flex items-center justify-between border-b-2 border-[#11100e] pb-3 text-[11px] font-mono font-black uppercase tracking-widest">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ff5a1f]" />
                  MIDAS AUDIENCE PASS
                </span>
                <span className="text-[#ff5a1f]">AUG 2026</span>
              </div>

              <div className="text-center py-3 border-b-2 border-dashed border-[#898071] space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#776e62] block">
                  Plantation Cove · St. Ann, Jamaica
                </span>
                <h3 className="font-serif text-2xl font-bold leading-tight text-[#11100e]">
                  MIDAS SUMMER FINALE
                </h3>
                <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase tracking-wider block">
                  Aug 29 (Sophisticated) · Aug 30 (Capleton)
                </span>
              </div>

              {/* What the attendee gets */}
              <div className="space-y-2 text-xs border-b-2 border-[#11100e] pb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#776e62] block font-bold">Attendee Incentive:</span>
                <div className="flex items-center justify-between font-bold">
                  <span>⚡ Express Line Wristband</span>
                  <span className="text-emerald-700">Unlocked</span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span>🍹 Hosted Drink Token (Before 6 PM)</span>
                  <span className="text-emerald-700">Unlocked</span>
                </div>
              </div>

              {/* What Midas gets */}
              <div className="pt-1 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-[#776e62] block">Outcome for Midas:</span>
                  <strong className="text-xs font-bold text-[#11100e] block">1 Verified Contact + 2 Squad Referrals</strong>
                </div>
                <span className="border-2 border-[#ff5a1f] text-[#ff5a1f] font-mono font-black text-[10px] px-2 py-0.5 uppercase transform -rotate-3">
                  100% OWNED
                </span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Promorang Tactical Navigation Tabs */}
      <div className="sticky top-0 z-30 border-b border-[#ffffff15] bg-[#0d0c0a]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex space-x-1 sm:space-x-3 overflow-x-auto py-3 text-xs sm:text-sm font-bold scrollbar-none">
            {[
              { id: 'problem', label: '1. The Problem We Solve', icon: AlertCircle },
              { id: 'howitworks', label: '2. How It Works (Simple Steps)', icon: Zap },
              { id: 'events', label: '3. Your Two Events at Plantation Cove', icon: Ticket },
              { id: 'perks', label: '4. The Free Perks Midas Offers', icon: KeyRound },
              { id: 'outcomes', label: '5. The Real Business Outcomes', icon: TrendingUp }
            ].map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-sm transition-all text-xs font-mono uppercase tracking-wider ${
                    activeTab === tab.id
                      ? 'bg-[#ff5a1f] text-white font-black shadow-[3px_3px_0_#000]'
                      : 'text-[#a89f91] hover:text-white hover:bg-[#ffffff0a]'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 pt-12 space-y-16">

        {/* TAB 1: THE PROBLEM WE SOLVE */}
        {activeTab === 'problem' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            
            <div className="max-w-3xl space-y-3">
              <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase tracking-widest">
                The Real Pain Point in Event Promotion
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
                "The Monday Morning Reset Trap"
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                Right now, when Midas promotes an event, here is what happens:
              </p>
            </div>

            {/* 3 Broken Steps vs 3 Promorang Fixes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Pain 1 */}
              <div className="p-6 rounded-sm bg-[#161210] border border-red-500/30 space-y-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 font-mono font-black text-sm flex items-center justify-center">
                  1
                </div>
                <h4 className="font-serif text-lg font-bold text-white">Attention is Rented, Not Owned</h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  You pay Instagram, WhatsApp promoters, and DJs to hype the party. People see the flyer, but you don't know who they are until they walk through the gate.
                </p>
              </div>

              {/* Pain 2 */}
              <div className="p-6 rounded-sm bg-[#161210] border border-red-500/30 space-y-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 font-mono font-black text-sm flex items-center justify-center">
                  2
                </div>
                <h4 className="font-serif text-lg font-bold text-white">Nobody Collects Contacts at the Gate</h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  People pay at ticket outlets or the gate, drink, party, and leave at 2 AM. You have no way to message them directly on Tuesday.
                </p>
              </div>

              {/* Pain 3 */}
              <div className="p-6 rounded-sm bg-[#161210] border border-red-500/30 space-y-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 font-mono font-black text-sm flex items-center justify-center">
                  3
                </div>
                <h4 className="font-serif text-lg font-bold text-white">Next Event? Start Back at Zero</h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  When you plan your next party or concert, you have to spend the exact same ad budget to reach the exact same crowd all over again.
                </p>
              </div>

            </div>

            {/* The Promorang Solution Box */}
            <div className="rounded-sm border-2 border-[#ff5a1f] bg-[#1a1410] p-6 sm:p-8 space-y-6 shadow-[8px_8px_0_#ff5a1f33]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#ffcf38] uppercase">
                <Sparkles className="w-4 h-4 text-[#ff5a1f]" />
                <span>How Promorang Solves This For Midas</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                We Turn Your Existing Promotion Into an Owned Customer List.
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-stone-200">
                <div className="p-4 bg-black/40 border border-[#ffffff15] rounded-sm space-y-1">
                  <strong className="text-white block font-bold">1. Quick 10-Second Poll</strong>
                  <p className="text-stone-400 text-xs">Partygoers tap their vibe (beach party vs live concert) on Instagram or WhatsApp and get rewarded instantly.</p>
                </div>
                <div className="p-4 bg-black/40 border border-[#ffffff15] rounded-sm space-y-1">
                  <strong className="text-white block font-bold">2. Free WhatsApp Squad Pass</strong>
                  <p className="text-stone-400 text-xs">To unlock Express Gate Entry or drink tokens, they forward a pass to 2 friends, multiplying your reach for free.</p>
                </div>
                <div className="p-4 bg-black/40 border border-[#ffffff15] rounded-sm space-y-1">
                  <strong className="text-white block font-bold">3. Reusable Audience Forever</strong>
                  <p className="text-stone-400 text-xs">You get a clean dashboard of real phone numbers and past attendees ready to pre-order tickets for your next event.</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: HOW IT WORKS (SIMPLE STEPS) */}
        {activeTab === 'howitworks' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            
            <div className="max-w-3xl space-y-3">
              <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase tracking-widest">
                The Simple 4-Step Process
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
                How It Works on the Ground
              </h2>
              <p className="text-stone-300 text-sm">
                No complex app downloads. Everything works right in the mobile browser in under 15 seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-3">
                <span className="font-mono text-xl font-black text-[#ff5a1f]">Step 1</span>
                <h4 className="font-serif text-lg font-bold text-white">Attendee Sees Poll</h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  On Instagram bio, WhatsApp, or DJ flyer: <em>"How are you ending summer in Jamaica?"</em>. One tap to vote.
                </p>
                <span className="text-[10px] font-mono text-stone-400 block pt-2 border-t border-[#ffffff15]">Takes 5 seconds</span>
              </div>

              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-3">
                <span className="font-mono text-xl font-black text-[#ff5a1f]">Step 2</span>
                <h4 className="font-serif text-lg font-bold text-white">Claims Free Perk</h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  They see <strong>PROMORANG PRESENTS: Sophisticated / Encore Live</strong> and claim an Express Entry pass or drink token.
                </p>
                <span className="text-[10px] font-mono text-stone-400 block pt-2 border-t border-[#ffffff15]">User enters phone / WhatsApp</span>
              </div>

              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-3">
                <span className="font-mono text-xl font-black text-[#ff5a1f]">Step 3</span>
                <h4 className="font-serif text-lg font-bold text-white">Shares with Squad</h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  They tap <em>"Send to Crew on WhatsApp"</em> so their friends also get fast-line entry, bringing 2–3 more paying partygoers with them.
                </p>
                <span className="text-[10px] font-mono text-[#ffcf38] block pt-2 border-t border-[#ffffff15]">Free viral word-of-mouth</span>
              </div>

              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-3">
                <span className="font-mono text-xl font-black text-[#10b981]">Step 4</span>
                <h4 className="font-serif text-lg font-bold text-white">Scans at Gate</h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  At Plantation Cove, they show their digital pass for express entry. Midas sees live attendance numbers on their dashboard.
                </p>
                <span className="text-[10px] font-mono text-[#10b981] block pt-2 border-t border-[#ffffff15]">Attendance verified</span>
              </div>

            </div>

            {/* Live Interactive Demo Button */}
            <div className="p-6 rounded-sm bg-[#ffffff06] border border-[#ffffff15] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <strong className="text-white text-base block">Want to test it yourself right now?</strong>
                <span className="text-stone-400 text-xs">Walk through the live voter experience on your phone or laptop.</span>
              </div>
              <button
                onClick={() => {
                  sessionStorage.setItem('promorang_midas_demo_active', 'true');
                  navigate('/discover?demo=midas&step=1');
                }}
                className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs px-6 py-3 uppercase tracking-wider shadow-[4px_4px_0_#000] whitespace-nowrap"
              >
                Launch Walkthrough ➔
              </button>
            </div>

          </div>
        )}

        {/* TAB 3: THE TWO EVENTS */}
        {activeTab === 'events' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            
            {/* The Single Official Venue Hub */}
            <div className="rounded-sm border-2 border-[#10b981] bg-[#0d1611] p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-[#10b981] uppercase tracking-widest">
                    One Official Venue Profile
                  </span>
                  <h3 className="font-serif text-3xl font-bold text-white">Grizzly's Plantation Cove</h3>
                  <p className="text-stone-300 text-xs sm:text-sm flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#10b981]" />
                    Priory, St. Ann, Jamaica
                  </p>
                </div>
                <Link
                  to="/venues/plantation-cove"
                  className="bg-[#10b981] hover:bg-[#059669] text-white font-mono font-bold text-xs px-5 py-3 rounded-sm uppercase tracking-wider shadow-[4px_4px_0_#000] flex items-center gap-2 self-start"
                >
                  <span>Open Venue Page</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <p className="text-stone-300 text-xs leading-relaxed max-w-3xl">
                Both Midas events live on this single official venue page. Partygoers can easily browse both days, share directions, and see upcoming events without confusing links.
              </p>
            </div>

            {/* The Two Moments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Event 1 */}
              <div className="rounded-sm border-2 border-[#ffffff15] bg-[#141210] p-6 space-y-5 hover:border-[#ff5a1f] transition-colors">
                <div className="relative h-48 overflow-hidden border border-[#ffffff15]">
                  <img
                    src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&q=80&w=800"
                    alt="Sophisticated Beach Party"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-[#ff5a1f] text-white font-mono font-black text-[10px] uppercase px-2.5 py-1">
                    SATURDAY, AUG 29
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-serif text-2xl font-bold text-white">Sophisticated — Summer End Beach Party</h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    <strong>Featuring:</strong> Vanessa Bling live, Trippple X, Bishop Escobar, Illusion Sound.<br />
                    <strong>Time:</strong> 4:00 PM – 10:00 PM (Hosted drinks segment 4–7 PM).<br />
                    <strong>Admission:</strong> J$5,000 Pre-sold · J$6,000 at Gate.
                  </p>
                </div>

                <div className="pt-3 border-t border-[#ffffff15] flex items-center justify-between">
                  <span className="text-[#ffcf38] font-mono text-xs font-bold">+200 Pts + PromoKey</span>
                  <Link
                    to="/moments/sophisticated"
                    className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs px-4 py-2 uppercase tracking-wider"
                  >
                    View Event Page ➔
                  </Link>
                </div>
              </div>

              {/* Event 2 */}
              <div className="rounded-sm border-2 border-[#ffffff15] bg-[#141210] p-6 space-y-5 hover:border-[#a855f7] transition-colors">
                <div className="relative h-48 overflow-hidden border border-[#ffffff15]">
                  <img
                    src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800"
                    alt="Encore Live featuring Capleton"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-[#a855f7] text-white font-mono font-black text-[10px] uppercase px-2.5 py-1">
                    SUNDAY, AUG 30
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-serif text-2xl font-bold text-white">Encore Live featuring Capleton</h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    <strong>Headliner:</strong> Capleton ("The Fireman") Live Band Concert.<br />
                    <strong>Time:</strong> 6:00 PM – 1:00 AM.<br />
                    <strong>Notice:</strong> 100% separate from any weekly Kingston club night.
                  </p>
                </div>

                <div className="pt-3 border-t border-[#ffffff15] flex items-center justify-between">
                  <span className="text-[#ffcf38] font-mono text-xs font-bold">+200 Pts + PromoKey</span>
                  <Link
                    to="/moments/encore-live-featuring-capleton"
                    className="bg-[#a855f7] hover:bg-[#9333ea] text-white font-mono font-bold text-xs px-4 py-2 uppercase tracking-wider"
                  >
                    View Event Page ➔
                  </Link>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: THE PERKS MIDAS OFFERS */}
        {activeTab === 'perks' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-mono font-bold text-[#ffcf38] uppercase tracking-widest">
                Zero Cash Cost to Midas
              </span>
              <h3 className="font-serif text-3xl font-bold text-white">Perks That Cost You $0 but Excite Your Crowd</h3>
              <p className="text-stone-300 text-sm">
                You don't pay cash incentives. You simply allocate perks you already control to motivate ticket buyers to act early and invite their friends.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-3">
                <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase block">Perk 1</span>
                <h4 className="font-serif text-lg font-bold text-white">50 Express Entry Wristbands</h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Skip the long regular line at the gate. Rewarded to partygoers who complete the poll and invite 2 friends on WhatsApp.
                </p>
                <div className="text-[11px] font-mono text-emerald-400 pt-2 border-t border-[#ffffff15]">
                  ✓ Cost: $0 (Just smooths your gate line)
                </div>
              </div>

              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-3">
                <span className="text-xs font-mono font-bold text-[#a855f7] uppercase block">Perk 2</span>
                <h4 className="font-serif text-lg font-bold text-white">10 VIP Deck Upgrades</h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Elevated VIP deck access rewarded to top squad referrers who bring the most verified paying attendees.
                </p>
                <div className="text-[11px] font-mono text-emerald-400 pt-2 border-t border-[#ffffff15]">
                  ✓ Cost: Uses existing VIP space
                </div>
              </div>

              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-3">
                <span className="text-xs font-mono font-bold text-[#ffcf38] uppercase block">Perk 3</span>
                <h4 className="font-serif text-lg font-bold text-white">2 Soundcheck Double Passes</h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Exclusive backstage soundcheck meet-and-greet with Vanessa Bling or Capleton for the #1 squad builder.
                </p>
                <div className="text-[11px] font-mono text-emerald-400 pt-2 border-t border-[#ffffff15]">
                  ✓ Cost: High prestige, $0 cash
                </div>
              </div>

              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-3">
                <span className="text-xs font-mono font-bold text-[#10b981] uppercase block">Perk 4</span>
                <h4 className="font-serif text-lg font-bold text-white">30 Hosted Drink Tokens</h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Extra drink pass for attendees who arrive and check in at Plantation Cove before 6:00 PM on Saturday.
                </p>
                <div className="text-[11px] font-mono text-emerald-400 pt-2 border-t border-[#ffffff15]">
                  ✓ Benefit: Fills your venue early
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 5: REAL BUSINESS OUTCOMES */}
        {activeTab === 'outcomes' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase tracking-widest">
                The Commercial Return
              </span>
              <h2 className="font-serif text-3xl font-bold text-white">What Midas Walks Away With</h2>
              <p className="text-stone-300 text-sm">
                Here is the real mathematical outcome of running your Summer 2026 activation on Promorang:
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Controls */}
              <div className="lg:col-span-6 p-6 sm:p-8 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-6">
                <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase tracking-wider block">
                  Simulate Your Numbers
                </span>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span>Express Gate Wristbands:</span>
                    <span className="text-[#ff5a1f]">{expressPassCount} Passes</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    step="10"
                    value={expressPassCount}
                    onChange={(e) => setExpressPassCount(Number(e.target.value))}
                    className="w-full accent-[#ff5a1f] bg-[#ffffff15] h-2 rounded-sm"
                  />
                  <span className="text-[11px] text-stone-400 block">Drives fast 2-friend WhatsApp shares.</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span>VIP Deck Upgrades:</span>
                    <span className="text-[#a855f7]">{vipUpgradeCount} Upgrades</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="30"
                    step="2"
                    value={vipUpgradeCount}
                    onChange={(e) => setVipUpgradeCount(Number(e.target.value))}
                    className="w-full accent-[#a855f7] bg-[#ffffff15] h-2 rounded-sm"
                  />
                  <span className="text-[11px] text-stone-400 block">Rewards your biggest brand ambassadors.</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span>Hosted Drink Tokens (Early Arrival):</span>
                    <span className="text-[#10b981]">{drinkTokenCount} Tokens</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="10"
                    value={drinkTokenCount}
                    onChange={(e) => setDrinkTokenCount(Number(e.target.value))}
                    className="w-full accent-[#10b981] bg-[#ffffff15] h-2 rounded-sm"
                  />
                  <span className="text-[11px] text-stone-400 block">Packs the beach before 6:00 PM.</span>
                </div>
              </div>

              {/* Projections Card */}
              <div className="lg:col-span-6 p-6 sm:p-8 rounded-sm bg-[#1a1410] border-2 border-[#ff5a1f] space-y-6 shadow-[8px_8px_0_#ff5a1f22] flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-[#ffcf38] uppercase tracking-wider block">Your 3 Big Outcomes</span>
                  <h4 className="font-serif text-2xl font-bold text-white mt-1">Guaranteed Campaign Results</h4>
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="p-3.5 bg-black/40 border border-[#ffffff15] rounded-sm space-y-1">
                    <span className="text-stone-400 text-xs">1. Verified Contact List (Phone & WhatsApp):</span>
                    <strong className="text-2xl font-serif font-black text-white block">~{estimatedParticipants.toLocaleString()} partygoers</strong>
                    <span className="text-[11px] text-emerald-400">People you can message for free next time</span>
                  </div>

                  <div className="p-3.5 bg-black/40 border border-[#ffffff15] rounded-sm space-y-1">
                    <span className="text-stone-400 text-xs">2. Free Word-of-Mouth WhatsApp Shares:</span>
                    <strong className="text-2xl font-serif font-black text-[#ff5a1f] block">~{estimatedSquadReferrals.toLocaleString()} squad invites</strong>
                    <span className="text-[11px] text-[#ffcf38]">Organic peer recommendations at $0 cost</span>
                  </div>

                  <div className="p-3.5 bg-black/40 border border-[#ffffff15] rounded-sm space-y-1">
                    <span className="text-stone-400 text-xs">3. Reusable Audience for Future Events:</span>
                    <strong className="text-2xl font-serif font-black text-[#10b981] block">~{estimatedRetainedAudience.toLocaleString()} loyal fans</strong>
                    <span className="text-[11px] text-emerald-300">Ready to buy pre-sold tickets for Dream Weekend</span>
                  </div>
                </div>

                <Link
                  to="/dashboard/merchant"
                  className="w-full bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs py-3.5 rounded-sm flex items-center justify-center gap-2 uppercase tracking-wider shadow-[4px_4px_0_#000]"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Preview Promoter Dashboard</span>
                </Link>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Signature Promorang Commercial Footer */}
      <footer className="mt-24 border-t-2 border-[#ffffff15] bg-[#070605] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="font-serif font-bold text-lg text-white">PROMORANG <i className="text-[#ff5a1f] not-italic">PRESENTS</i></span>
            <p className="text-xs text-[#887f74]">Midas Entertainment Summer 2026 Activation · Plantation Cove, Jamaica</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                sessionStorage.setItem('promorang_midas_demo_active', 'true');
                navigate('/discover?demo=midas&step=1');
              }}
              className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs px-5 py-3 rounded-sm uppercase tracking-wider shadow-[4px_4px_0_#000]"
            >
              Start Live Demo Flow ➔
            </button>
          </div>
        </div>
      </footer>

    </main>
  );
}
