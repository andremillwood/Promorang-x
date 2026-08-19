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
  LockKeyhole
} from 'lucide-react';
import { getSiteUrl } from '@/lib/discovery';

export default function MidasCommercialProposal() {
  const [activeTab, setActiveTab] = useState<'problem' | 'howitworks' | 'events' | 'perks' | 'outcomes'>('problem');
  
  // Interactive Access Drop Simulator State
  const [expressPassCount, setExpressPassCount] = useState(50);
  const [vipUpgradeCount, setVipUpgradeCount] = useState(10);
  const [drinkTokenCount, setDrinkTokenCount] = useState(30);

  const navigate = useNavigate();

  // Projections
  const estimatedParticipants = (expressPassCount * 3) + (vipUpgradeCount * 5) + (drinkTokenCount * 2) + 250;
  const estimatedSquadReferrals = Math.round(estimatedParticipants * 1.8);
  const estimatedRetainedAudience = Math.round(estimatedParticipants * 0.75);

  return (
    <main className="min-h-screen bg-[#0d0c0a] text-[#f4efe5] selection:bg-[#ff5a1f] selection:text-white font-sans antialiased pb-32">
      <SEO
        title="MIDAS ENTERTAINMENT × PROMORANG — Executive Proposal & Asset Hub"
        description="Executive proposal for Midas Entertainment: How Promorang turns event hype into an owned crowd of repeat buyers for Sophisticated and Capleton Encore Live at Plantation Cove."
        url={getSiteUrl("/proposals/midas")}
      />

      {/* Promorang Grain & Paper Texture Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-15"
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
              Midas Proposal Hub
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/hosts/midas"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-stone-300 hover:text-white px-3 py-1.5 border border-[#ffffff15] rounded-sm bg-white/5"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#ff5a1f]" />
              <span>Midas Host Portal</span>
            </Link>
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

      {/* Signature Physical Ticket Stub Hero Section */}
      <section className="relative z-10 pt-12 pb-16 px-4 sm:px-6 overflow-hidden">
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
                      COMMERCIAL ACTIVATION TICKET · PASS #MIDAS-2026-PC
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 border border-emerald-500/30">
                      OFFICIAL PURVIEW
                    </span>
                  </div>
                  <h2 className="text-xs text-stone-400 font-mono">
                    Midas Entertainment × 8Rivaz Ultra Lounge · Grizzly's Plantation Cove, Jamaica
                  </h2>
                </div>
              </div>

              {/* Barcode & Stamp */}
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

            {/* Main Hero Body Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-8">
              
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-3 text-xs font-mono font-bold tracking-widest text-[#ff5a1f] uppercase">
                  <span className="w-6 h-[2px] bg-[#ff5a1f]" />
                  <span>The Real Solution for Live Promoters</span>
                </div>

                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#f4efe5] leading-[1.08]">
                  Every event you promote, <i className="text-[#ff5a1f] font-serif not-italic">you shouldn't have to start from zero.</i>
                </h1>

                <p className="text-sm sm:text-base text-[#c9c0b5] leading-relaxed max-w-xl font-normal">
                  Promoters spend thousands renting attention through flyers, Instagram ads, DJs, and WhatsApp broadcasts. People party and go home. On Monday morning, you have zero phone numbers—forcing you to pay all over again for the next show.
                </p>

                <div className="p-4 bg-black/60 border-l-4 border-[#ffcf38] rounded-r-sm text-xs sm:text-sm text-stone-200 space-y-1">
                  <strong className="text-white font-bold block flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#ffcf38]" />
                    The Promorang Audience Equity Engine:
                  </strong>
                  <p className="text-stone-300">
                    We give your attendees zero-cost perks (Express Gate Entry, drink tokens, VIP decks) to vote on Jamaican polls and forward a WhatsApp pass to their squad—building you an <strong>owned contact list</strong> for every future event.
                  </p>
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => {
                      sessionStorage.setItem('promorang_midas_demo_active', 'true');
                      navigate('/discover?demo=midas&step=1');
                    }}
                    className="bg-gradient-to-r from-[#ff5a1f] to-[#ff3b00] hover:brightness-110 text-white font-bold text-sm px-6 py-4 rounded-sm transition-all shadow-[6px_6px_0_#000000] flex items-center gap-2 uppercase tracking-wider"
                  >
                    <span>Launch Live Interactive Walkthrough</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <Link
                    to="/hosts/midas"
                    className="bg-[#ffffff0d] hover:bg-[#ffffff18] border border-[#ffffff20] text-[#f4efe5] font-bold text-sm px-6 py-4 rounded-sm transition-all flex items-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4 text-[#ffcf38]" />
                    <span>View Midas Host Portal</span>
                  </Link>
                </div>
              </div>

              {/* Right Side: Tactile Live Platform Asset Deck */}
              <div className="lg:col-span-5">
                <div className="bg-[#0e0c0a] border-2 border-[#ffffff15] p-5 sm:p-6 rounded-sm shadow-xl space-y-3 font-sans">
                  
                  <div className="flex items-center justify-between border-b border-[#ffffff15] pb-3">
                    <span className="text-xs font-mono font-bold text-[#ffcf38] uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#ff5a1f]" />
                      Live Platform Asset Directory
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20">
                      5 LIVE NODES
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <Link
                      to="/discover"
                      className="p-3 rounded-sm bg-[#161310] border border-[#ffffff15] flex items-center justify-between hover:border-[#ff5a1f] transition-all group hover:translate-x-1"
                    >
                      <div>
                        <strong className="text-white block font-bold">1. Consumer Discovery Feed</strong>
                        <span className="text-stone-400 text-[11px]">promorang.co/discover (Summer Polls)</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-[#ff5a1f]" />
                    </Link>

                    <Link
                      to="/moments/sophisticated"
                      className="p-3 rounded-sm bg-[#161310] border border-[#ffffff15] flex items-center justify-between hover:border-[#ff5a1f] transition-all group hover:translate-x-1"
                    >
                      <div>
                        <strong className="text-white block font-bold">2. Sophisticated Moment Hub</strong>
                        <span className="text-stone-400 text-[11px]">Vanessa Bling + Flyer + Aitix Ticketing</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-[#ff5a1f]" />
                    </Link>

                    <Link
                      to="/moments/encore-live-featuring-capleton"
                      className="p-3 rounded-sm bg-[#161310] border border-[#ffffff15] flex items-center justify-between hover:border-[#a855f7] transition-all group hover:translate-x-1"
                    >
                      <div>
                        <strong className="text-white block font-bold">3. Capleton Encore Live Hub</strong>
                        <span className="text-stone-400 text-[11px]">Live Band Concert + Flyer + Aitix Ticketing</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-[#a855f7]" />
                    </Link>

                    <Link
                      to="/venues/plantation-cove"
                      className="p-3 rounded-sm bg-[#161310] border border-[#ffffff15] flex items-center justify-between hover:border-[#10b981] transition-all group hover:translate-x-1"
                    >
                      <div>
                        <strong className="text-white block font-bold">4. Plantation Cove Venue Hub</strong>
                        <span className="text-stone-400 text-[11px]">Canonical GPS Location Graph</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-[#10b981]" />
                    </Link>

                    <Link
                      to="/hosts/midas"
                      className="p-3 rounded-sm bg-[#161310] border-2 border-[#ff5a1f]/50 flex items-center justify-between hover:border-[#ff5a1f] transition-all group hover:translate-x-1 bg-orange-950/20"
                    >
                      <div>
                        <strong className="text-white block font-bold">5. Midas Host Operations Center</strong>
                        <span className="text-stone-400 text-[11px]">Live voter counters, phone list & gate status</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-[#ff5a1f]" />
                    </Link>
                  </div>

                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Tactile Perforated Navigation Tabs */}
      <div className="sticky top-0 z-30 border-b border-[#ffffff15] bg-[#0d0c0a]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex space-x-1 sm:space-x-3 overflow-x-auto py-3 text-xs font-bold scrollbar-none">
            {[
              { id: 'problem', label: '1. The Problem We Solve', icon: AlertCircle },
              { id: 'howitworks', label: '2. How It Works (4 Simple Steps)', icon: Zap },
              { id: 'events', label: '3. Your Two Events & Flyers', icon: Ticket },
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

      {/* Main Tab Content */}
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
                Right now, when Midas promotes an event in Jamaica, here is what happens:
              </p>
            </div>

            {/* 3 Broken Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-6 rounded-sm bg-[#161210] border border-red-500/30 space-y-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 font-mono font-black text-sm flex items-center justify-center">
                  1
                </div>
                <h4 className="font-serif text-lg font-bold text-white">Attention is Rented, Not Owned</h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  You pay Instagram, WhatsApp promoters, and DJs to hype the party. People see the flyer, but you don't know who they are until they walk through the gate.
                </p>
              </div>

              <div className="p-6 rounded-sm bg-[#161210] border border-red-500/30 space-y-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 font-mono font-black text-sm flex items-center justify-center">
                  2
                </div>
                <h4 className="font-serif text-lg font-bold text-white">Nobody Collects Contacts at the Gate</h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  People pay at ticket outlets or the gate, drink, party, and leave at 2 AM. You have no way to message them directly on Tuesday.
                </p>
              </div>

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

            {/* The Solution */}
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
                  <strong className="text-white block font-bold">1. Native Discovery Polls</strong>
                  <p className="text-stone-400 text-xs">Partygoers vote on live Jamaican polls on Promorang without filling out long boring surveys.</p>
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
                No complex app downloads. Everything works natively in the mobile browser on Promorang.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-3">
                <span className="font-mono text-xl font-black text-[#ff5a1f]">Step 1</span>
                <h4 className="font-serif text-lg font-bold text-white">Attendee Sees Poll</h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  On Promorang's Discovery feed: <em>"How are you ending summer in Jamaica?"</em>. One tap to vote.
                </p>
                <Link to="/discover" className="text-[11px] font-mono text-[#ff5a1f] hover:underline block pt-2 border-t border-[#ffffff15]">
                  View live poll on Promorang ➔
                </Link>
              </div>

              <div className="p-6 rounded-sm bg-[#141210] border-2 border-[#ffffff15] space-y-3">
                <span className="font-mono text-xl font-black text-[#ff5a1f]">Step 2</span>
                <h4 className="font-serif text-lg font-bold text-white">Claims Free Perk</h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  They see <strong>PROMORANG PRESENTS: Sophisticated / Capleton Encore Live</strong> and claim an Express Entry pass or drink token.
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
                  At Plantation Cove, they show their digital pass for express entry. Midas sees live attendance numbers on their host portal.
                </p>
                <Link to="/hosts/midas" className="text-[11px] font-mono text-[#10b981] hover:underline block pt-2 border-t border-[#ffffff15]">
                  View Midas Host Portal ➔
                </Link>
              </div>

            </div>

            {/* Live Interactive Demo Button */}
            <div className="p-6 rounded-sm bg-[#ffffff06] border border-[#ffffff15] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <strong className="text-white text-base block">Want to test the full loop live?</strong>
                <span className="text-stone-400 text-xs">Experience how an attendee votes, claims rewards, and checks into Plantation Cove.</span>
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

        {/* TAB 3: THE TWO EVENTS & FLYERS */}
        {activeTab === 'events' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            
            {/* The Single Official Venue Hub */}
            <div className="rounded-sm border-2 border-[#10b981] bg-[#0d1611] p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-[#10b981] uppercase tracking-widest">
                    One Official Venue Profile on Promorang
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
                  <span>Open Venue Page on Promorang</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <p className="text-stone-300 text-xs leading-relaxed max-w-3xl">
                Both Midas events live on this single official venue page. Partygoers can easily browse both days, share directions, and see upcoming events without confusing links.
              </p>
            </div>

            {/* The Two Moments with Real Flyers & Aitix Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Event 1: Sophisticated */}
              <div className="rounded-sm border-2 border-[#ffffff15] bg-[#141210] p-6 space-y-5 hover:border-[#ff5a1f] transition-colors flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="relative h-64 overflow-hidden border border-[#ffffff15] rounded-sm bg-black/40">
                    <img
                      src="/events/sophisticated-flyer.jpg"
                      alt="Sophisticated Summer End Beach Party Official Flyer"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-3 left-3 bg-[#ff5a1f] text-white font-mono font-black text-[10px] uppercase px-2.5 py-1">
                      SATURDAY, AUG 29 · 4PM–10PM
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#ff5a1f] uppercase font-bold">Midas × 8Rivaz Presents</span>
                      <span className="text-[10px] font-mono bg-orange-500/20 text-orange-400 px-2 py-0.5 border border-orange-500/30">Powered by aitix</span>
                    </div>
                    <h4 className="font-serif text-2xl font-bold text-white">Sophisticated — Summer End Beach Party</h4>
                    <p className="text-stone-300 text-xs leading-relaxed">
                      <strong>Performance by:</strong> Vanessa Bling live in concert.<br />
                      <strong>Entertainment by:</strong> Illusion Sound · Trippple X · Bishop Escobar · Fyah Prince.<br />
                      <strong>Schedule:</strong> 4:00 PM – 10:00 PM (Hosted drinks 4:00 PM – 7:00 PM).<br />
                      <strong>Admission:</strong> J$5,000 Pre-sold · J$6,000 at Gate.<br />
                      <strong>Physical Outlets:</strong> Zarim, Di Trends, Fesco (Beechwood/Ferry/Ocho Rios/Golden Grove), 8Rivaz, Leven22, Greenhous Taj Mahal, 12:12, Grab N Go, Fontana Pharmacy.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#ffffff15] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#ffcf38] font-mono text-xs font-bold">+200 Pts & Express Wristband</span>
                    <a
                      href="https://aitix.app/sophisticated"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-orange-600 hover:bg-orange-500 text-white font-mono font-bold text-xs px-4 py-2 uppercase tracking-wider rounded-sm flex items-center gap-1.5 shadow-[2px_2px_0_#000]"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Buy on Aitix ➔</span>
                    </a>
                  </div>
                  <Link
                    to="/moments/sophisticated"
                    className="w-full bg-[#ffffff0a] hover:bg-[#ffffff15] text-stone-300 hover:text-white font-mono text-xs py-2 rounded-sm flex items-center justify-center gap-1.5 transition-colors border border-[#ffffff15]"
                  >
                    <span>View Promorang Moment Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Event 2: Capleton Encore Live */}
              <div className="rounded-sm border-2 border-[#ffffff15] bg-[#141210] p-6 space-y-5 hover:border-[#a855f7] transition-colors flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="relative h-64 overflow-hidden border border-[#ffffff15] rounded-sm bg-black/40">
                    <img
                      src="/events/encore-live-capleton-flyer.jpg"
                      alt="Capleton Encore Live Culture Rising Official Flyer"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-3 left-3 bg-[#a855f7] text-white font-mono font-black text-[10px] uppercase px-2.5 py-1">
                      SUNDAY, AUG 30 · 4PM–10PM
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#a855f7] uppercase font-bold">Midas × 8Rivaz Presents</span>
                      <span className="text-[10px] font-mono bg-purple-500/20 text-purple-400 px-2 py-0.5 border border-purple-500/30">Powered by aitix</span>
                    </div>
                    <h4 className="font-serif text-2xl font-bold text-white">Capleton Encore Live — Culture Rising</h4>
                    <p className="text-stone-300 text-xs leading-relaxed">
                      <strong>Headliner:</strong> Capleton ("The Fireman" / King Shango) Live.<br />
                      <strong>Featuring:</strong> Nesbeth · Dean Fraser.<br />
                      <strong>Entertainment by:</strong> DJ Delano (Renaissance) · Bass Odyssey · DJ Rors.<br />
                      <strong>Schedule:</strong> Sunday, August 30, 2026 • 4:00 PM – 10:00 PM.<br />
                      <strong>Admission:</strong> J$5,000 Pre-sold · J$7,000 at Gate.<br />
                      <strong>Venue:</strong> Plantation Cove, St. Ann, Jamaica.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#ffffff15] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#ffcf38] font-mono text-xs font-bold">+200 Pts & Express Wristband</span>
                    <a
                      href="https://aitix.app/culturerising"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs px-4 py-2 uppercase tracking-wider rounded-sm flex items-center gap-1.5 shadow-[2px_2px_0_#000]"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Buy on Aitix ➔</span>
                    </a>
                  </div>
                  <Link
                    to="/moments/encore-live-featuring-capleton"
                    className="w-full bg-[#ffffff0a] hover:bg-[#ffffff15] text-stone-300 hover:text-white font-mono text-xs py-2 rounded-sm flex items-center justify-center gap-1.5 transition-colors border border-[#ffffff15]"
                  >
                    <span>View Promorang Moment Page</span>
                    <ExternalLink className="w-3 h-3" />
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
                  to="/hosts/midas"
                  className="w-full bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs py-3.5 rounded-sm flex items-center justify-center gap-2 uppercase tracking-wider shadow-[4px_4px_0_#000]"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Open Midas Host Operations Center</span>
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
