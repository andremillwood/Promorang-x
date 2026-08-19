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
  Send
} from 'lucide-react';
import { toast } from 'sonner';
import { getSiteUrl } from '@/lib/discovery';

export default function MidasCommercialProposal() {
  const [activeTab, setActiveTab] = useState<'proposal' | 'moments' | 'flywheel' | 'perks' | 'calculator'>('proposal');
  const [flywheelModel, setFlywheelModel] = useState<'traditional' | 'promorang'>('promorang');
  
  // Interactive Access Drop Simulator State
  const [expressPassCount, setExpressPassCount] = useState(50);
  const [vipUpgradeCount, setVipUpgradeCount] = useState(10);
  const [drinkTokenCount, setDrinkTokenCount] = useState(30);

  // Interactive Guestpass Code Input Demo
  const [demoCode, setDemoCode] = useState('MIDAS-VIP-2026');
  const [codeUnlocked, setCodeUnlocked] = useState(false);

  const navigate = useNavigate();

  // Calculated ROI estimates based on participation mechanics
  const estimatedParticipants = (expressPassCount * 3) + (vipUpgradeCount * 5) + (drinkTokenCount * 2) + 250;
  const estimatedSquadReferrals = Math.round(estimatedParticipants * 1.8);
  const estimatedRetainedAudience = Math.round(estimatedParticipants * 0.75);

  const handleTestUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoCode.trim()) return;
    setCodeUnlocked(true);
    toast.success("Guest Pass Validated: +200 Points & Access Drop Unlocked!");
  };

  return (
    <main className="min-h-screen bg-[#0d0c0a] text-[#f4efe5] selection:bg-[#ff5a1f] selection:text-white font-sans antialiased pb-32">
      <SEO
        title="PROMORANG PRESENTS × MIDAS ENTERTAINMENT — Commercial Activation"
        description="Turning event promotion into reusable audience growth for Midas Entertainment: Sophisticated & Encore Live featuring Capleton at Plantation Cove."
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
              Midas Partnership
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
              <span>Launch Live Flow</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Physical 3D Ticket Stub */}
      <section className="relative z-10 pt-16 pb-16 px-4 sm:px-6 overflow-hidden border-b border-[#ffffff15] bg-[radial-gradient(circle_at_80%_25%,#48200f_0,transparent_45%),linear-gradient(135deg,#0d0c0a_60%,#1f110a)]">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Editorial Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3 text-xs font-mono font-bold tracking-widest text-[#cfc5b7] uppercase">
              <span className="w-6 h-[2px] bg-[#ff5a1f]" />
              <span>Commercial Activation Proposal · Summer 2026</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#f4efe5] leading-[0.95]">
              Turning Event Promotion Into <i className="text-[#ff5a1f] font-serif not-italic">Reusable Equity.</i>
            </h1>

            <p className="text-base sm:text-lg text-[#c9c0b5] leading-relaxed max-w-xl font-normal">
              Midas already creates high-energy entertainment and commands Jamaican attention. Promorang installs the participation, discovery, and audience-capture layer around that attention—converting anonymous partygoers into an owned, measurable audience.
            </p>

            {/* Quick Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="px-3.5 py-1.5 rounded-sm bg-[#ffffff08] border border-[#ffffff18] text-xs text-[#ddd1c1] font-mono">
                📍 <strong>Plantation Cove</strong> · St. Ann, Jamaica
              </div>
              <div className="px-3.5 py-1.5 rounded-sm bg-[#ffffff08] border border-[#ffffff18] text-xs text-[#ddd1c1] font-mono">
                🎟️ <strong>2 Activations</strong> · Sophisticated & Encore Live
              </div>
            </div>

            {/* CTA Group */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => {
                  sessionStorage.setItem('promorang_midas_demo_active', 'true');
                  navigate('/discover?demo=midas&step=1');
                }}
                className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-bold text-sm px-6 py-4 rounded-sm transition-all shadow-[6px_6px_0_#000000] flex items-center gap-2 uppercase tracking-wider"
              >
                <span>Launch Interactive Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/venues/plantation-cove"
                className="bg-[#ffffff0d] hover:bg-[#ffffff18] border border-[#ffffff20] text-[#f4efe5] font-bold text-sm px-6 py-4 rounded-sm transition-all flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-[#ffcf38]" />
                <span>View Plantation Cove Hub</span>
              </Link>
            </div>
          </div>

          {/* Right Signature Physical Promorang Ticket Stub */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm transform rotate-1 hover:rotate-0 transition-transform duration-300 bg-[#f4efe5] text-[#11100e] p-6 shadow-[14px_14px_0_#ff5a1f] border-2 border-[#11100e] relative space-y-4 font-sans">
              
              {/* Ticket Top Header */}
              <div className="flex items-center justify-between border-b-2 border-[#11100e] pb-3 text-[11px] font-mono font-black uppercase tracking-widest">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ff5a1f]" />
                  PROMORANG PASS
                </span>
                <span className="text-[#ff5a1f]">MIDAS-2026</span>
              </div>

              {/* Ticket Center Display */}
              <div className="text-center py-4 border-b-2 border-dashed border-[#898071] space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#776e62] block">
                  Plantation Cove · St. Ann
                </span>
                <h3 className="font-serif text-3xl font-bold leading-tight text-[#11100e]">
                  MIDAS WEEKEND
                </h3>
                <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase tracking-wider block">
                  Aug 29 (Sophisticated) + Aug 30 (Capleton)
                </span>
              </div>

              {/* Ticket Meta Grid */}
              <div className="grid grid-cols-2 text-left text-xs border-b-2 border-[#11100e] pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#776e62] block">Perk Reward</span>
                  <strong className="font-bold text-sm block">+200 Pts + PromoKey</strong>
                </div>
                <div className="space-y-0.5 pl-3 border-l-2 border-[#11100e]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#776e62] block">Gate Status</span>
                  <strong className="font-bold text-sm text-[#008744] block">Verified Node</strong>
                </div>
              </div>

              {/* Ticket Simulated Barcode & Stamp */}
              <div className="pt-2 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex gap-[2px] h-6 items-center opacity-80">
                    <span className="w-1 h-full bg-[#11100e]" />
                    <span className="w-[2px] h-full bg-[#11100e]" />
                    <span className="w-1.5 h-full bg-[#11100e]" />
                    <span className="w-[1px] h-full bg-[#11100e]" />
                    <span className="w-2 h-full bg-[#11100e]" />
                    <span className="w-1 h-full bg-[#11100e]" />
                    <span className="w-[3px] h-full bg-[#11100e]" />
                    <span className="w-1 h-full bg-[#11100e]" />
                    <span className="w-2 h-full bg-[#11100e]" />
                  </div>
                  <span className="text-[9px] font-mono text-[#776e62]">876-MIDAS-PLANTATION-COVE</span>
                </div>
                <span className="border-2 border-[#ff5a1f] text-[#ff5a1f] font-mono font-black text-[10px] px-2 py-0.5 uppercase transform -rotate-6">
                  OFFICIAL PARTNER
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
              { id: 'proposal', label: '1. Executive Brief & Value', icon: Target },
              { id: 'moments', label: '2. Curated Moments & Venue', icon: Ticket },
              { id: 'flywheel', label: '3. The 10-Stage Flywheel', icon: Zap },
              { id: 'perks', label: '4. Midas Access Drop (Perks)', icon: KeyRound },
              { id: 'calculator', label: '5. Dynamic ROI Calculator', icon: Sliders }
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

        {/* TAB 1: PROPOSAL & VALUE */}
        {activeTab === 'proposal' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            
            {/* Value Proposition Core */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase tracking-widest">
                  The Commercial Opportunity
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
                  Stop Rebuying the Same Attention.
                </h2>
                <p className="text-stone-300 text-sm leading-relaxed">
                  Every entertainment brand in Jamaica faces the same dilemma: huge Instagram hype, sold-out venues, but zero persistent customer relationship once the music stops.
                </p>
                <div className="p-4 rounded-sm bg-[#ffffff06] border border-[#ffffff15] space-y-2">
                  <span className="text-[11px] font-mono text-[#ffcf38] font-bold uppercase">The Promorang Standard:</span>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    We turn Midas event attention into an identifiable, measurable, and reusable audience graph that fuels pre-sales for every future event.
                  </p>
                </div>
              </div>

              {/* Comparison Matrix */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-sm bg-[#161210] border border-[#ff5a1f33] space-y-3">
                  <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider block">Traditional Model</span>
                  <h4 className="font-serif text-lg font-bold text-white">Temporary Attention</h4>
                  <ul className="space-y-2 text-xs text-stone-400 leading-relaxed">
                    <li className="flex items-start gap-2">✕ Anonymous flyer & social ad clicks</li>
                    <li className="flex items-start gap-2">✕ No contact or squad mapping</li>
                    <li className="flex items-start gap-2">✕ Attendee database resets to zero on Monday</li>
                  </ul>
                </div>

                <div className="p-6 rounded-sm bg-[#1b1510] border-2 border-[#ff5a1f] space-y-3 shadow-[6px_6px_0_#ff5a1f33]">
                  <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase tracking-wider block">Promorang Presents</span>
                  <h4 className="font-serif text-lg font-bold text-white">Audience Equity</h4>
                  <ul className="space-y-2 text-xs text-stone-200 leading-relaxed">
                    <li className="flex items-start gap-2">✓ Cultural poll voting with instant contact capture</li>
                    <li className="flex items-start gap-2">✓ WhatsApp crew referrals with 1.8x multiplier</li>
                    <li className="flex items-start gap-2">✓ Reusable audience for Dream Weekend & future drops</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Interactive Guest Pass Sandbox */}
            <div className="rounded-sm border-2 border-[#ffffff15] bg-[#141210] p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase tracking-widest">Live Sandbox</span>
                  <h3 className="font-serif text-2xl font-bold text-white mt-1">Test the Midas Access Drop Code Mechanic</h3>
                </div>
                <span className="text-xs font-mono bg-[#ffffff0a] text-stone-300 px-3 py-1 border border-[#ffffff15]">
                  Fast-Path Verification
                </span>
              </div>

              <form onSubmit={handleTestUnlock} className="flex flex-col sm:flex-row gap-3 max-w-xl">
                <input
                  type="text"
                  value={demoCode}
                  onChange={(e) => setDemoCode(e.target.value.toUpperCase())}
                  placeholder="ENTER ACCESS CODE"
                  className="flex-1 bg-[#0a0908] border-2 border-[#898071] text-white px-4 py-3 font-mono font-bold text-sm tracking-wider uppercase focus:border-[#ff5a1f] focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs px-6 py-3 uppercase tracking-wider shadow-[4px_4px_0_#000000]"
                >
                  Verify Access Code
                </button>
              </form>

              {codeUnlocked && (
                <div className="p-4 rounded-sm bg-[#0e2a1b] border border-[#10b981] text-xs text-emerald-300 space-y-1 animate-in fade-in">
                  <div className="font-bold flex items-center gap-1.5 text-sm text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Midas Founding VIP Access Pass Activated!</span>
                  </div>
                  <p className="text-emerald-300/80">
                    User receives +200 PromoPoints, express gate entry perk, and a WhatsApp crew invite link.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: CURATED MOMENTS & VENUE */}
        {activeTab === 'moments' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            
            {/* Canonical Venue Card */}
            <div className="rounded-sm border-2 border-[#10b981] bg-[#0d1611] p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-[#10b981] uppercase tracking-widest">
                    Canonical Verified Venue
                  </span>
                  <h3 className="font-serif text-3xl font-bold text-white">Grizzly's Plantation Cove</h3>
                  <p className="text-stone-300 text-xs sm:text-sm flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#10b981]" />
                    Priory, St. Ann, Jamaica (18.45509° N, -77.23241° W)
                  </p>
                </div>
                <Link
                  to="/venues/plantation-cove"
                  className="bg-[#10b981] hover:bg-[#059669] text-white font-mono font-bold text-xs px-5 py-3 rounded-sm uppercase tracking-wider shadow-[4px_4px_0_#000] flex items-center gap-2 self-start"
                >
                  <span>Open Venue Node</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <p className="text-stone-300 text-xs leading-relaxed max-w-3xl">
                Both Midas activations sit under this identical canonical node. Check-ins, traffic metrics, and participant points are consolidated into a persistent location graph without fragmenting data.
              </p>
            </div>

            {/* Moments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Moment 1 */}
              <div className="rounded-sm border-2 border-[#ffffff15] bg-[#141210] p-6 space-y-5 hover:border-[#ff5a1f] transition-colors">
                <div className="relative h-48 overflow-hidden border border-[#ffffff15]">
                  <img
                    src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&q=80&w=800"
                    alt="Sophisticated Beach Party"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-[#ff5a1f] text-white font-mono font-black text-[10px] uppercase px-2.5 py-1">
                    PROMORANG PRESENTS
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[#ff5a1f] font-mono text-xs font-bold block">Saturday, Aug 29, 2026 · 4PM–10PM</span>
                  <h4 className="font-serif text-2xl font-bold text-white">Sophisticated — Summer End Beach Party</h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    Featuring Vanessa Bling live, Trippple X, Bishop Escobar, and Illusion Sound. Hosted drinks segment from 4:00 PM to 7:00 PM.
                  </p>
                </div>

                <div className="pt-3 border-t border-[#ffffff15] flex items-center justify-between">
                  <span className="text-[#ffcf38] font-mono text-xs font-bold">+200 Pts + PromoKey</span>
                  <Link
                    to="/moments/sophisticated"
                    className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs px-4 py-2 uppercase tracking-wider"
                  >
                    View Moment ➔
                  </Link>
                </div>
              </div>

              {/* Moment 2 */}
              <div className="rounded-sm border-2 border-[#ffffff15] bg-[#141210] p-6 space-y-5 hover:border-[#a855f7] transition-colors">
                <div className="relative h-48 overflow-hidden border border-[#ffffff15]">
                  <img
                    src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800"
                    alt="Encore Live featuring Capleton"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-[#a855f7] text-white font-mono font-black text-[10px] uppercase px-2.5 py-1">
                    PROMORANG PRESENTS
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[#a855f7] font-mono text-xs font-bold block">Sunday, Aug 30, 2026 · 6PM–1AM</span>
                  <h4 className="font-serif text-2xl font-bold text-white">Encore Live featuring Capleton</h4>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    High-energy conscious reggae live concert at Plantation Cove. Strictly disambiguated from weekly Kingston club nights.
                  </p>
                </div>

                <div className="pt-3 border-t border-[#ffffff15] flex items-center justify-between">
                  <span className="text-[#ffcf38] font-mono text-xs font-bold">+200 Pts + PromoKey</span>
                  <Link
                    to="/moments/encore-live-featuring-capleton"
                    className="bg-[#a855f7] hover:bg-[#9333ea] text-white font-mono font-bold text-xs px-4 py-2 uppercase tracking-wider"
                  >
                    View Moment ➔
                  </Link>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: THE 10-STAGE FLYWHEEL */}
        {activeTab === 'flywheel' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase tracking-widest">
                System Architecture
              </span>
              <h3 className="font-serif text-3xl font-bold text-white">The 10-Stage Audience Engine</h3>
              <p className="text-stone-300 text-sm">
                How Promorang turns standard flyer distribution into an owned community graph.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { num: '01', title: 'Attention Spend', desc: 'Midas posts IG, WhatsApp, DJs, and outdoor ads with custom Promorang QR/links.' },
                { num: '02', title: 'Discovery Poll', desc: 'User lands on Jamaican summer poll; votes in 1 click without answering boring surveys.' },
                { num: '03', title: 'Presents Match', desc: 'Promorang Presents delivers curated Sophisticated / Encore recommendation.' },
                { num: '04', title: 'Instant Reward', desc: 'User claims +200 Points and an initial PromoKey to lock in their spot.' },
                { num: '05', title: 'Identity Capture', desc: 'Fast phone/WhatsApp verification converts anonymous visitor into an identified member.' },
                { num: '06', title: 'Squad Multiplier', desc: 'Attendee receives a custom WhatsApp pass to invite 2 friends for Express Entry.' },
                { num: '07', title: 'Perk Drops', desc: 'Top squad referrers unlock VIP upgrades, soundcheck passes, and hosted drink tokens.' },
                { num: '08', title: 'Gate Check-In', desc: 'Attendee scans QR at Plantation Cove gate; attendance is cryptographically verified.' },
                { num: '09', title: 'Live Dashboard', desc: 'Midas tracks attendee counts, referral tree depth, and gate throughput in real time.' },
                { num: '10', title: 'Audience Reuse', desc: 'Direct broadcast access to this proven crowd for Dream Weekend and future shows.' }
              ].map(stage => (
                <div key={stage.num} className="p-4 rounded-sm bg-[#141210] border border-[#ffffff15] space-y-2 hover:border-[#ff5a1f] transition-colors">
                  <span className="font-mono text-xs font-black text-[#ff5a1f] block">{stage.num}.</span>
                  <strong className="text-white text-xs font-bold block">{stage.title}</strong>
                  <p className="text-[11px] text-stone-400 leading-relaxed">{stage.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: MIDAS ACCESS DROP (PERKS) */}
        {activeTab === 'perks' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-mono font-bold text-[#ffcf38] uppercase tracking-widest">
                Incentive Economics
              </span>
              <h3 className="font-serif text-3xl font-bold text-white">Midas Access Drop Proposal</h3>
              <p className="text-stone-300 text-sm">
                High perceived-value perks with zero marginal cash cost to Midas Entertainment.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-3">
                <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase block">Tier 1 · Speed</span>
                <h4 className="font-serif text-lg font-bold text-white">50 Express Entry Passes</h4>
                <p className="text-xs text-stone-300 leading-relaxed">Fast-track gate wristbands rewarded to attendees who complete the poll and invite 2 friends.</p>
                <span className="text-[11px] font-mono text-emerald-400 block pt-2 border-t border-[#ffffff15]">Cost to Midas: $0</span>
              </div>

              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-3">
                <span className="text-xs font-mono font-bold text-[#a855f7] uppercase block">Tier 2 · High Value</span>
                <h4 className="font-serif text-lg font-bold text-white">10 VIP Deck Upgrades</h4>
                <p className="text-xs text-stone-300 leading-relaxed">VIP viewing deck access rewarded to top squad builders who bring verified ticket holders.</p>
                <span className="text-[11px] font-mono text-emerald-400 block pt-2 border-t border-[#ffffff15]">Cost to Midas: Utilizes buffer</span>
              </div>

              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-3">
                <span className="text-xs font-mono font-bold text-[#ffcf38] uppercase block">Tier 3 · Exclusive</span>
                <h4 className="font-serif text-lg font-bold text-white">2 Soundcheck Double Passes</h4>
                <p className="text-xs text-stone-300 leading-relaxed">Exclusive backstage soundcheck access with Vanessa Bling or Capleton for the top referrer.</p>
                <span className="text-[11px] font-mono text-emerald-400 block pt-2 border-t border-[#ffffff15]">Cost to Midas: High prestige, $0 cash</span>
              </div>

              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-3">
                <span className="text-xs font-mono font-bold text-[#10b981] uppercase block">Tier 4 · Early Arrival</span>
                <h4 className="font-serif text-lg font-bold text-white">30 Hosted Drinks Passes</h4>
                <p className="text-xs text-stone-300 leading-relaxed">Extra drink tokens for participants who check in at Plantation Cove before 6:00 PM.</p>
                <span className="text-[11px] font-mono text-emerald-400 block pt-2 border-t border-[#ffffff15]">Benefit: Drives early venue arrival</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DYNAMIC ROI CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase tracking-widest">
                Interactive Modeler
              </span>
              <h3 className="font-serif text-3xl font-bold text-white">Audience Growth Calculator</h3>
              <p className="text-stone-300 text-sm">
                Adjust the perk allocations below to model projected attendee captures and squad virality.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Controls */}
              <div className="lg:col-span-7 p-6 sm:p-8 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span>Express Entry Allocation:</span>
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
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span>VIP Viewing Deck Upgrades:</span>
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
                </div>
              </div>

              {/* Projections Card */}
              <div className="lg:col-span-5 p-6 sm:p-8 rounded-sm bg-[#1a1410] border-2 border-[#ff5a1f] space-y-5 shadow-[8px_8px_0_#ff5a1f22]">
                <span className="text-xs font-mono font-bold text-[#ffcf38] uppercase tracking-wider block">Projected Campaign Yield</span>
                
                <div className="space-y-4">
                  <div className="space-y-0.5">
                    <span className="text-xs text-stone-400">Identified Attendees:</span>
                    <strong className="text-3xl font-serif font-black text-white block">{estimatedParticipants.toLocaleString()}</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs text-stone-400">Viral WhatsApp Multiplier:</span>
                    <strong className="text-3xl font-serif font-black text-[#ff5a1f] block">{estimatedSquadReferrals.toLocaleString()} touchpoints</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs text-stone-400">Retained Midas Audience:</span>
                    <strong className="text-3xl font-serif font-black text-[#10b981] block">{estimatedRetainedAudience.toLocaleString()} members</strong>
                  </div>
                </div>

                <Link
                  to="/dashboard/merchant"
                  className="w-full bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs py-3 rounded-sm flex items-center justify-center gap-2 uppercase tracking-wider shadow-[4px_4px_0_#000]"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Preview Live Dashboard</span>
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
            <p className="text-xs text-[#887f74]">Official Activation Protocol · Midas Entertainment Summer 2026</p>
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
