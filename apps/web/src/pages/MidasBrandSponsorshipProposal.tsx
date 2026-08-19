import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import {
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  BarChart3,
  Users,
  Award,
  CheckCircle2,
  DollarSign,
  Share2,
  ShieldCheck,
  Megaphone,
  Layers,
  MapPin,
  Calendar,
  ExternalLink,
  Coins,
  Check,
  Calculator,
  ChevronRight,
  TrendingUp,
  Flame,
  Wine,
  Camera,
  HeartHandshake
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getSiteUrl } from '@/lib/discovery';

export default function MidasBrandSponsorshipProposal() {
  const [activeTab, setActiveTab] = useState<'problem' | 'packages' | 'calculator' | 'analytics'>('problem');
  const [selectedBudget, setSelectedBudget] = useState<number>(500000); // J$500,000 default

  // Dynamic ROI Calculations
  const calculatedRedemptions = Math.round(selectedBudget / 1500);
  const calculatedUGCVideos = Math.round((selectedBudget * 0.4) / 2500);
  const calculatedReach = calculatedUGCVideos * 1850;
  const calculatedCostPerEngagement = Math.round(selectedBudget / (calculatedRedemptions + calculatedUGCVideos));

  const handleBookingInquiry = () => {
    toast.success("🎯 Sponsorship Inquiry Logged! Our brand activation team and Midas will coordinate your campaign within 4 hours.", {
      duration: 5000
    });
  };

  return (
    <main className="min-h-screen bg-[#0d0c0a] text-[#f4efe5] selection:bg-[#ff5a1f] selection:text-white font-sans antialiased pb-32">
      <SEO
        title="Brand Sponsorship & Activation Deck — Midas Summer Finale 2026 | Promorang"
        description="Brand sponsorship proposal for corporate beverage and lifestyle sponsors at Midas Summer Finale Weekend (Vanessa Bling & Capleton Live) at Grizzly's Plantation Cove."
        url={getSiteUrl("/sponsorships/midas")}
      />

      {/* Promorang Grain Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-15"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E")`
        }}
      />

      {/* Top Header Bar */}
      <header className="relative z-20 border-b border-white/10 bg-[#0d0c0a]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-white font-black tracking-widest text-sm hover:opacity-90">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5a1f] shadow-[0_0_0_4px_#ff5a1f33]" />
              <span className="font-serif text-base tracking-normal">PROMORANG <em className="text-[#ff5a1f] not-italic font-sans font-bold text-xs tracking-wider uppercase ml-1">FOR BRANDS</em></span>
            </Link>
            <span className="text-white/25 text-sm">/</span>
            <span className="text-stone-400 text-xs font-mono font-bold uppercase tracking-wider">
              Midas 2026 Brand Activation Deck
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/campaigns/midas"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-stone-300 hover:text-white px-3 py-1.5 border border-white/15 rounded-sm"
            >
              <span>See Public Festival Hub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Button
              onClick={handleBookingInquiry}
              className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs px-4 py-2.5 rounded-sm uppercase tracking-wider shadow-[3px_3px_0_#000]"
            >
              <HeartHandshake className="w-3.5 h-3.5 mr-1.5" />
              <span>Lock Sponsor Package</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="relative z-10 pt-12 pb-16 px-4 sm:px-6 border-b border-white/10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/30 via-[#0d0c0a] to-[#0d0c0a]">
        <div className="mx-auto max-w-5xl space-y-6">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#ffcf38] text-black text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-sm">
              Corporate Brand Activation Proposal
            </span>
            <span className="text-xs font-mono text-[#ff5a1f]">
              Target: Beverage, Telecom, Spirits & Lifestyle Brands
            </span>
            <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded-sm">
              AUGUST 29–30 · PLANTATION COVE
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
            Stop Paying for Banner Logos. <br />
            <i className="text-[#ffcf38] font-serif not-italic">Buy Guaranteed Taste Tests & Viral UGC.</i>
          </h1>

          <p className="text-stone-300 text-sm sm:text-lg max-w-3xl leading-relaxed">
            Sponsor Jamaica's premier summer finale weekend (<strong>Vanessa Bling</strong> & <strong>Capleton</strong>) with measurable foot traffic, 100+ authentic creator videos, and on-site product trial—tracked in real time on Promorang.
          </p>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 font-mono text-xs">
            <div className="p-4 bg-[#141210] border border-white/15 rounded-sm space-y-1">
              <span className="text-[10px] text-stone-400 uppercase block">Expected Audience</span>
              <strong className="text-2xl font-serif font-bold text-white block">3,500+</strong>
              <span className="text-[10px] text-[#ffcf38]">High-Income Partygoers</span>
            </div>
            <div className="p-4 bg-[#141210] border border-white/15 rounded-sm space-y-1">
              <span className="text-[10px] text-stone-400 uppercase block">Guaranteed UGC Stories</span>
              <strong className="text-2xl font-serif font-bold text-[#ff5a1f] block">150+</strong>
              <span className="text-[10px] text-orange-300">IG Reels / TikTok / WhatsApp</span>
            </div>
            <div className="p-4 bg-[#141210] border border-white/15 rounded-sm space-y-1">
              <span className="text-[10px] text-stone-400 uppercase block">Sponsor Foot Traffic</span>
              <strong className="text-2xl font-serif font-bold text-[#10b981] block">100%</strong>
              <span className="text-[10px] text-emerald-300">Verified QR Redemptions</span>
            </div>
            <div className="p-4 bg-[#141210] border border-white/15 rounded-sm space-y-1">
              <span className="text-[10px] text-stone-400 uppercase block">Post-Event Retention</span>
              <strong className="text-2xl font-serif font-bold text-[#a855f7] block">365 Days</strong>
              <span className="text-[10px] text-purple-300">Memory Vault Archive</span>
            </div>
          </div>

        </div>
      </section>

      {/* Chapter Tabs */}
      <div className="sticky top-0 z-30 border-b border-white/10 bg-[#0d0c0a]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex space-x-2 sm:space-x-4 overflow-x-auto py-3 text-xs font-mono uppercase tracking-wider scrollbar-none">
            {[
              { id: 'problem', label: '1. The Traditional Sponsorship Flaw', icon: Target },
              { id: 'packages', label: '2. Tech-Enabled Sponsor Packages', icon: Award },
              { id: 'calculator', label: '3. Interactive ROI & Budget Simulator', icon: Calculator },
              { id: 'analytics', label: '4. Live Brand Analytics Dashboard', icon: BarChart3 }
            ].map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-sm transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-[#ff5a1f] text-white font-black shadow-[2px_2px_0_#000]'
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
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

      {/* Main Container */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pt-12 space-y-14">

        {/* TAB 1: THE TRADITIONAL SPONSORSHIP FLAW */}
        {activeTab === 'problem' && (
          <div className="space-y-10 animate-in fade-in duration-200">
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase tracking-widest">
                The Brand Dilemma
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                Why Static Event Sponsorships Waste Budget
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                When beverage, spirits, and corporate brands spend J$1,000,000 on Jamaican entertainment events, here is what typically happens:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-6 rounded-sm bg-[#161210] border-2 border-red-500/30 space-y-4">
                <span className="text-xs font-mono font-bold text-red-400 uppercase block">
                  The Old Way · Zero Attribution
                </span>
                <div className="space-y-3 text-xs text-stone-300">
                  <p>• <strong>Passive Logo Backdrops:</strong> Your logo sits on a 10ft banner behind the DJ. Partygoers dance past it without registering your product.</p>
                  <p>• <strong>Unmeasured Sampling:</strong> Brand ambassadors hand out cups with zero data on who drank, what they thought, or if they'll buy at retail.</p>
                  <p>• <strong>Zero Digital Trail:</strong> Once the lights go on at 2 AM, your marketing team has zero leads, zero content, and zero measurable ROI to show leadership.</p>
                </div>
              </div>

              <div className="p-6 rounded-sm bg-[#141812] border-2 border-emerald-500/40 space-y-4 shadow-[6px_6px_0_#10b98122]">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase block">
                  The Promorang Way · Performance Activation
                </span>
                <div className="space-y-3 text-xs text-stone-300">
                  <p>• <strong>Tracked Cocktail & Product Bounties:</strong> Partygoers earn rewards only when they order your specific drink at the bar and scan in.</p>
                  <p>• <strong>100+ Authentic User UGC Videos:</strong> Attendees post high-energy IG Reels and TikToks holding your bottle/can at sunset.</p>
                  <p>• <strong>Live Digital Reporting:</strong> Marketing directors get a live dashboard showing exact drinks consumed, reach, and cost-per-engagement.</p>
                </div>
              </div>

            </div>

            <div className="pt-2 flex items-center justify-between border-t border-white/10">
              <span className="text-xs text-stone-400 font-mono">Explore tech-enabled activation tiers</span>
              <Button
                onClick={() => setActiveTab('packages')}
                className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs uppercase px-5 py-3 rounded-sm flex items-center gap-1.5"
              >
                <span>View Sponsor Packages</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: SPONSOR PACKAGES & ACTIVATION TIERS */}
        {activeTab === 'packages' && (
          <div className="space-y-10 animate-in fade-in duration-200">
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-mono font-bold text-[#ffcf38] uppercase tracking-widest">
                Activation Tiers · August 29–30 at Plantation Cove
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                Choose Your Performance Sponsorship Package
              </h2>
              <p className="text-stone-300 text-sm">
                Every tier combines on-site physical presence with guaranteed digital engagement and creator content.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Tier 1 */}
              <div className="p-6 rounded-sm bg-[#141210] border-2 border-white/15 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase">Tier 1 · Sampling</span>
                    <Badge className="bg-white/10 text-white font-mono text-[10px]">Product Trial</Badge>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-white">Bar Sampling Bounty</h3>
                  <div className="font-mono text-2xl font-black text-white">
                    J$350,000 <span className="text-xs font-normal text-stone-400">/ weekend</span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Ideal for ready-to-drink beverages, beer, and energy drinks looking to drive high-volume physical trials.
                  </p>
                  <ul className="space-y-2 text-xs text-stone-300 pt-2 border-t border-white/10">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#ff5a1f]" /> 250+ Verified Drink Check-Ins</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#ff5a1f]" /> Bar Tent Branding & QR Signage</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#ff5a1f]" /> Digital Discovery Poll Integration</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#ff5a1f]" /> Live Redemption Telemetry</li>
                  </ul>
                </div>
                <Button
                  onClick={() => { setSelectedBudget(350000); setActiveTab('calculator'); }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase py-3 rounded-sm border border-white/15"
                >
                  Simulate ROI ➔
                </Button>
              </div>

              {/* Tier 2 */}
              <div className="p-6 rounded-sm bg-[#161210] border-2 border-[#ff5a1f] space-y-4 shadow-[8px_8px_0_#ff5a1f22] flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#ffcf38] uppercase">Tier 2 · Viral Reach</span>
                    <Badge className="bg-[#ff5a1f] text-white font-mono text-[10px]">MOST POPULAR</Badge>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-white">Creator UGC & Viral Lounge</h3>
                  <div className="font-mono text-2xl font-black text-white">
                    J$750,000 <span className="text-xs font-normal text-stone-400">/ weekend</span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Combines dedicated bar activation with 50+ micro-creator bounties generating massive social buzz.
                  </p>
                  <ul className="space-y-2 text-xs text-stone-300 pt-2 border-t border-white/10">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#ffcf38]" /> 500+ Verified Drink Check-Ins</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#ffcf38]" /> 75+ Organic TikTok & IG Video Stories</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#ffcf38]" /> Branded Photo-Op Sunset Lounge Space</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#ffcf38]" /> 120,000+ Estimated Social Reach</li>
                  </ul>
                </div>
                <Button
                  onClick={() => { setSelectedBudget(750000); setActiveTab('calculator'); }}
                  className="w-full bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs uppercase py-3 rounded-sm shadow-md"
                >
                  Simulate ROI ➔
                </Button>
              </div>

              {/* Tier 3 */}
              <div className="p-6 rounded-sm bg-[#141210] border-2 border-purple-500/40 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-purple-400 uppercase">Tier 3 · Premium Stage</span>
                    <Badge className="bg-purple-500/20 text-purple-300 font-mono text-[10px]">EXCLUSIVE</Badge>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-white">Title Stage & VIP Deck</h3>
                  <div className="font-mono text-2xl font-black text-white">
                    J$1,500,000 <span className="text-xs font-normal text-stone-400">/ weekend</span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Full stage/deck naming rights, official digital Moment Pieces in the Memory Vault, and 100% owned lead capture.
                  </p>
                  <ul className="space-y-2 text-xs text-stone-300 pt-2 border-t border-white/10">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-400" /> Exclusive VIP Deck / Stage Naming</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-400" /> 150+ Verified UGC Video Stories</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-400" /> Branded Digital Moment Pieces in Vault</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-400" /> Complete Lead Export of Engaged Fans</li>
                  </ul>
                </div>
                <Button
                  onClick={() => { setSelectedBudget(1500000); setActiveTab('calculator'); }}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs uppercase py-3 rounded-sm"
                >
                  Simulate ROI ➔
                </Button>
              </div>

            </div>

            {/* PROMOPUSH MULTI-CHANNEL DISTRIBUTION & PLACEMENT MATRIX */}
            <div className="rounded-sm border-2 border-white/15 bg-[#141210] p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#ffcf38] uppercase tracking-wider">
                    PromoPush Omnichannel Distribution
                  </span>
                  <Badge className="bg-[#ff5a1f] text-white font-mono text-[10px]">
                    MULTI-SURFACE REACH
                  </Badge>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  How Your Brand Promotion Is Distributed Across Jamaica
                </h3>
                <p className="text-xs sm:text-sm text-stone-300">
                  Every PromoPush campaign includes cross-channel amplification across social, conversational chatbots, and dedicated Promorang surfaces:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                
                {/* 1. Geo-Targeted Meta Ads */}
                <div className="p-4 bg-black/50 border border-white/10 rounded-sm space-y-2">
                  <div className="w-8 h-8 rounded-sm bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                  <strong className="text-white font-bold block text-sm">
                    1. Geo-Fenced Meta Ads & Reels
                  </strong>
                  <p className="text-stone-400 leading-relaxed">
                    Hyper-targeted Instagram & Facebook video ads geo-fenced across St. Ann, Ocho Rios, Kingston, Montego Bay, and diaspora travel routes, driving partygoers directly into your offer.
                  </p>
                </div>

                {/* 2. Conversational Chatbots */}
                <div className="p-4 bg-black/50 border border-white/10 rounded-sm space-y-2">
                  <div className="w-8 h-8 rounded-sm bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <strong className="text-white font-bold block text-sm">
                    2. WhatsApp & DM Lead Chatbots
                  </strong>
                  <p className="text-stone-400 leading-relaxed">
                    Automated conversational funnels on WhatsApp and IG Direct answer partygoers' questions and deliver your instant drink voucher or gate pass key directly into their messages.
                  </p>
                </div>

                {/* 3. Flexible Placement Surfaces */}
                <div className="p-4 bg-black/50 border border-white/10 rounded-sm space-y-2">
                  <div className="w-8 h-8 rounded-sm bg-[#ffcf38]/20 text-[#ffcf38] flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <strong className="text-white font-bold block text-sm">
                    3. Flexible Placement Surfaces
                  </strong>
                  <p className="text-stone-400 leading-relaxed">
                    Choose your presence: be featured in Promorang’s <strong>Curated Promotion Carousels</strong>, take an <strong>Exclusive Dedicated Feature Post</strong>, or deploy your own <strong>Custom Campaign Hub</strong>.
                  </p>
                </div>

              </div>

              <div className="p-3.5 bg-black/40 border border-white/10 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-stone-300">
                <span className="text-[#ffcf38]">✓ Guaranteed attribution from first impression to on-site bar cup redemption</span>
                <span className="text-stone-400">Powered by PromoPush Smart Escrow</span>
              </div>
            </div>

            {/* IN-PLATFORM MOMENT INTEGRATION FOR BRANDS VIA HOSTS */}
            <div className="rounded-sm border-2 border-[#ffcf38]/40 bg-[#161310] p-6 sm:p-8 space-y-6 shadow-[8px_8px_0_#ff5a1f22]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#ffcf38] uppercase tracking-wider">
                      Native In-Platform Commercial Real Estate
                    </span>
                    <Badge className="bg-[#ff5a1f] text-white font-mono text-[10px]">
                      HOST-MOMENT INTEGRATION
                    </Badge>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                    How Brands Natively Engage & Monetize Moments via Midas
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-3xl">
                On Promorang, every Moment (like <em>Sophisticated</em> and <em>Capleton Encore Live</em>) is an interactive digital hub. Brands don't just put up logos—they activate in-platform utilities directly alongside the host:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                
                <div className="p-4 bg-black/50 border border-white/10 rounded-sm space-y-2">
                  <strong className="text-white font-bold block flex items-center gap-1.5 text-sm">
                    <Award className="w-4 h-4 text-[#ff5a1f]" />
                    1. Native Moment Title Slot
                  </strong>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    "Presented in Partnership with [Brand]" pinned on the official Moment page with verified click-throughs and brand story links.
                  </p>
                </div>

                <div className="p-4 bg-black/50 border border-white/10 rounded-sm space-y-2">
                  <strong className="text-white font-bold block flex items-center gap-1.5 text-sm">
                    <Zap className="w-4 h-4 text-[#ffcf38]" />
                    2. Unlockable In-Moment Perks
                  </strong>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    Attach digital rewards to the Moment: voting on the poll or checking in unlocks a J$500 cocktail voucher or VIP tasting token.
                  </p>
                </div>

                <div className="p-4 bg-black/50 border border-white/10 rounded-sm space-y-2">
                  <strong className="text-white font-bold block flex items-center gap-1.5 text-sm">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    3. Host-Approved Creator Bounties
                  </strong>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    Partygoers upload their photo/video proof with your beverage directly to the live Moment feed to claim cash rewards and points.
                  </p>
                </div>

                <div className="p-4 bg-black/50 border border-white/10 rounded-sm space-y-2">
                  <strong className="text-white font-bold block flex items-center gap-1.5 text-sm">
                    <Layers className="w-4 h-4 text-purple-400" />
                    4. Permanent Memory Vault Archive
                  </strong>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    Your brand is permanently minted into the official digital Moment Pieces in the Memory Vault, preserving your equity for years.
                  </p>
                </div>

              </div>

              <div className="p-3.5 bg-black/40 border border-white/10 rounded-sm flex items-center justify-between text-xs font-mono text-stone-300">
                <span className="text-[#ffcf38]">✓ Full collaboration between Host & Brand with zero conflicting software</span>
                <Link to="/moments/sophisticated" className="text-white hover:underline flex items-center gap-1">
                  <span>Preview Live Moment Hub</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INTERACTIVE ROI CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="space-y-10 animate-in fade-in duration-200">
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-mono font-bold text-[#ff5a1f] uppercase tracking-widest">
                Interactive Sponsor Budget Estimator
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                Simulate Your Sponsorship Return on Investment
              </h2>
              <p className="text-stone-300 text-sm">
                Adjust your marketing budget to see guaranteed foot-traffic check-ins, creator video volume, and total social reach.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Slider Controls */}
              <div className="lg:col-span-6 p-6 rounded-sm bg-[#141210] border-2 border-white/15 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-stone-300 uppercase">Activation Budget:</span>
                    <strong className="font-mono text-2xl font-black text-[#ffcf38]">
                      J${selectedBudget.toLocaleString()}
                    </strong>
                  </div>
                  <input
                    type="range"
                    min={250000}
                    max={2500000}
                    step={50000}
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(Number(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#ff5a1f]"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-stone-400">
                    <span>J$250,000 (Sampling)</span>
                    <span>J$1,000,000 (Viral Push)</span>
                    <span>J$2,500,000 (Title Tier)</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10 text-xs text-stone-300">
                  <strong className="text-white font-bold block">How Your Budget Is Allocated:</strong>
                  <div className="flex justify-between">
                    <span>• On-Site Product Trial & Bar Check-In Bounties:</span>
                    <strong className="font-mono text-white">60%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>• Creator Video UGC Bounties (IG/TikTok):</span>
                    <strong className="font-mono text-white">40%</strong>
                  </div>
                </div>

                <Button
                  onClick={handleBookingInquiry}
                  className="w-full bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs py-3.5 rounded-sm uppercase tracking-wider shadow-md flex items-center justify-center gap-2"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Reserve This Package for August 29–30</span>
                </Button>
              </div>

              {/* Projected Output Card */}
              <div className="lg:col-span-6 p-6 rounded-sm bg-[#161210] border-2 border-[#10b981] space-y-6 shadow-[8px_8px_0_#10b98122]">
                <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                    Guaranteed Performance Deliverables
                  </span>
                  <Badge className="bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                    100% Trackable
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                  <div className="p-3.5 bg-black/50 border border-white/10 rounded-sm space-y-1">
                    <span className="text-[10px] text-stone-400 uppercase block">Verified Drink Check-Ins</span>
                    <strong className="text-2xl font-serif font-black text-white block">
                      {calculatedRedemptions.toLocaleString()}+
                    </strong>
                    <span className="text-[10px] text-emerald-400">Guaranteed product trial</span>
                  </div>

                  <div className="p-3.5 bg-black/50 border border-white/10 rounded-sm space-y-1">
                    <span className="text-[10px] text-stone-400 uppercase block">Creator Video Stories</span>
                    <strong className="text-2xl font-serif font-black text-[#ffcf38] block">
                      {calculatedUGCVideos.toLocaleString()}+
                    </strong>
                    <span className="text-[10px] text-yellow-400">TikTok & IG Reels</span>
                  </div>

                  <div className="p-3.5 bg-black/50 border border-white/10 rounded-sm space-y-1">
                    <span className="text-[10px] text-stone-400 uppercase block">Estimated Social Reach</span>
                    <strong className="text-2xl font-serif font-black text-[#ff5a1f] block">
                      {calculatedReach.toLocaleString()}
                    </strong>
                    <span className="text-[10px] text-orange-400">Targeted Jamaican fans</span>
                  </div>

                  <div className="p-3.5 bg-black/50 border border-white/10 rounded-sm space-y-1">
                    <span className="text-[10px] text-stone-400 uppercase block">Cost Per Engagement</span>
                    <strong className="text-2xl font-serif font-black text-purple-400 block">
                      J${calculatedCostPerEngagement}
                    </strong>
                    <span className="text-[10px] text-purple-300">5x lower than Meta ads</span>
                  </div>
                </div>

                <div className="p-3 bg-black/40 border border-emerald-500/20 rounded-sm text-[11px] text-stone-300 font-mono flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unspent bounties are 100% refunded or credited if target redemptions aren't met.</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: LIVE BRAND ANALYTICS DASHBOARD */}
        {activeTab === 'analytics' && (
          <div className="space-y-10 animate-in fade-in duration-200">
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-mono font-bold text-[#10b981] uppercase tracking-widest">
                Real-Time Transparency
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                What Your Brand Marketing Team Sees in Real Time
              </h2>
              <p className="text-stone-300 text-sm">
                No waiting 3 weeks for an agency recap report. Watch on-site redemptions and creator posts live on your phone.
              </p>
            </div>

            {/* Mock Dashboard Preview */}
            <div className="rounded-sm border-2 border-white/15 bg-[#141210] p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-[#ffcf38] uppercase font-bold">Brand Intelligence Console</span>
                  <h4 className="font-serif text-xl font-bold text-white">Live Campaign: Midas Summer Finale 2026</h4>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-xs">
                  ● LIVE BROADCAST READY
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-4 bg-black/50 border border-white/10 rounded-sm space-y-1">
                  <span className="text-stone-400 text-[10px] uppercase">Bar Redemptions Today</span>
                  <strong className="text-2xl font-serif text-white block">312 / 400</strong>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#ff5a1f] h-full w-[78%]" />
                  </div>
                </div>

                <div className="p-4 bg-black/50 border border-white/10 rounded-sm space-y-1">
                  <span className="text-stone-400 text-[10px] uppercase">Creator Videos Approved</span>
                  <strong className="text-2xl font-serif text-[#ffcf38] block">64 Posts</strong>
                  <span className="text-stone-400 text-[10px]">Avg 1.8k views per video</span>
                </div>

                <div className="p-4 bg-black/50 border border-white/10 rounded-sm space-y-1">
                  <span className="text-stone-400 text-[10px] uppercase">Top Performing Creator</span>
                  <strong className="text-sm font-bold text-white block">@ShaniceVibes (8.4k views)</strong>
                  <span className="text-emerald-400 text-[10px]">High engagement score</span>
                </div>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-stone-300">Ready to deploy this exact activation for your brand at Plantation Cove?</span>
                <Button
                  onClick={handleBookingInquiry}
                  className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs uppercase px-5 py-2.5 rounded-sm"
                >
                  Contact Activation Lead
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="mt-24 border-t-2 border-white/10 bg-[#070605] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="font-serif font-bold text-lg text-white">PROMORANG <i className="text-[#ff5a1f] not-italic">BRAND SUITE</i></span>
            <p className="text-xs text-stone-400">Midas Summer Finale 2026 Commercial Activation · Plantation Cove, Jamaica</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/proposals/midas"
              className="text-xs font-mono text-stone-400 hover:text-white px-3 py-2 border border-white/15 rounded-sm"
            >
              Host Proposal
            </Link>
            <Link
              to="/campaigns/midas"
              className="text-xs font-mono text-stone-400 hover:text-white px-3 py-2 border border-white/15 rounded-sm"
            >
              Public Festival Hub
            </Link>
            <Button
              onClick={handleBookingInquiry}
              className="bg-[#ff5a1f] hover:bg-[#ff6b35] text-white font-mono font-bold text-xs px-5 py-2.5 rounded-sm uppercase tracking-wider shadow-md"
            >
              Lock Sponsor Package
            </Button>
          </div>
        </div>
      </footer>

    </main>
  );
}
