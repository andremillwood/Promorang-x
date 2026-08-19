import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  Target,
  BarChart3,
  Layers,
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
  Check,
  Flame,
  Music,
  Activity,
  Sliders,
  DollarSign,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getSiteUrl } from '@/lib/discovery';

export default function MidasCommercialProposal() {
  const [activeTab, setActiveTab] = useState<'overview' | 'moments' | 'promopush' | 'incentives' | 'simulator'>('overview');
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoStep, setDemoStep] = useState(1);
  const [flywheelModel, setFlywheelModel] = useState<'traditional' | 'promorang'>('promorang');
  
  // Interactive Access Drop Simulator State
  const [expressPassCount, setExpressPassCount] = useState(50);
  const [vipUpgradeCount, setVipUpgradeCount] = useState(10);
  const [drinkTokenCount, setDrinkTokenCount] = useState(30);

  const navigate = useNavigate();

  // Calculated ROI estimates based on participation mechanics
  const estimatedParticipants = (expressPassCount * 3) + (vipUpgradeCount * 5) + (drinkTokenCount * 2) + 250;
  const estimatedSquadReferrals = Math.round(estimatedParticipants * 1.8);
  const estimatedRetainedAudience = Math.round(estimatedParticipants * 0.75);

  return (
    <main className="min-h-screen bg-[#070605] text-[#f4efe5] selection:bg-[#ff5a1f] selection:text-white pb-28 font-sans antialiased">
      <SEO
        title="MIDAS ENTERTAINMENT × PROMORANG — Executive Activation Proposal"
        description="Turning event promotion into reusable audience growth for Midas Entertainment: Sophisticated & Encore Live featuring Capleton at Plantation Cove."
        url={getSiteUrl("/proposals/midas")}
      />

      {/* Dynamic Background Glow Canvas */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-orange-600/15 via-amber-600/5 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-gradient-to-bl from-purple-700/15 via-indigo-600/5 to-transparent rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-gradient-to-tr from-emerald-600/10 to-transparent rounded-full blur-3xl opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Top Brand Command Ribbon */}
      <header className="relative z-20 border-b border-white/10 bg-[#070605]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-black tracking-widest uppercase bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
              PROMORANG
            </span>
            <span className="text-white/30 text-xs">×</span>
            <span className="font-serif text-sm font-bold text-white tracking-wider">
              MIDAS ENTERTAINMENT
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-[11px] font-mono text-orange-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Summer 2026 Season Executive Brief
            </span>
            <button
              onClick={() => {
                sessionStorage.setItem('promorang_midas_demo_active', 'true');
                navigate('/discover?demo=midas&step=1');
              }}
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-orange-950/60 flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Launch Walkthrough</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-14 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2">
                <span className="bg-orange-500/20 text-orange-400 text-xs font-black uppercase px-3 py-1 rounded-full border border-orange-500/30 font-mono tracking-wider">
                  Audience Infrastructure Proposal
                </span>
                <span className="bg-white/5 text-white/70 text-xs font-medium px-3 py-1 rounded-full border border-white/10">
                  Plantation Cove · St. Ann, Jamaica
                </span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05]">
                Turn Event Attention Into <span className="italic font-normal bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">Reusable Audience Equity.</span>
              </h1>
              
              <p className="text-base sm:text-lg text-stone-300 leading-relaxed max-w-2xl font-normal">
                Midas already produces elite entertainment and captures Jamaican attention. Promorang installs the interactive participation and identity layer—transforming temporary ticket buyers into an owned, measurable audience asset.
              </p>
            </div>

            {/* Strategic KPI Stat Rail */}
            <div className="grid grid-cols-2 gap-3 w-full lg:w-auto flex-shrink-0">
              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-1">
                <span className="text-white/40 text-[10px] font-mono font-bold uppercase tracking-wider block">Target Activations</span>
                <strong className="text-2xl font-serif font-black text-white block">2 Moments</strong>
                <span className="text-orange-400 text-xs font-semibold block">Sophisticated + Encore Live</span>
              </div>
              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-1">
                <span className="text-white/40 text-[10px] font-mono font-bold uppercase tracking-wider block">Canonical Anchor</span>
                <strong className="text-2xl font-serif font-black text-white block">Plantation Cove</strong>
                <span className="text-emerald-400 text-xs font-semibold block">Single Location Graph Node</span>
              </div>
            </div>
          </div>

          {/* Quick Launch Control Bar */}
          <div className="rounded-3xl border border-white/15 bg-gradient-to-r from-white/[0.06] via-white/[0.02] to-white/[0.06] p-4 sm:p-6 backdrop-blur-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-white text-sm font-bold block">Interactive Demonstration Ready</strong>
                <span className="text-white/60 text-xs block">Experience the live attendee flow from poll vote to gate check-in</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={() => {
                  sessionStorage.setItem('promorang_midas_demo_active', 'true');
                  navigate('/discover?demo=midas&step=1');
                }}
                className="flex-1 md:flex-initial bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-orange-950 flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Start Live Demo Flow</span>
              </button>
              <Link
                to="/discover"
                className="flex-1 md:flex-initial bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-orange-400" />
                <span>Discovery Polls</span>
              </Link>
              <Link
                to="/venues/plantation-cove"
                className="flex-1 md:flex-initial bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Venue Hub</span>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Navigation Tab Spine */}
      <div className="sticky top-0 z-30 border-b border-white/10 bg-[#070605]/95 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex space-x-2 sm:space-x-8 overflow-x-auto py-3 text-xs sm:text-sm font-bold scrollbar-none">
            {[
              { id: 'overview', label: '1. Commercial Problem & Value Model', icon: Target },
              { id: 'moments', label: '2. Curated Moments & Venue', icon: Ticket },
              { id: 'promopush', label: '3. PromoPush Geo & Field Activation', icon: Smartphone },
              { id: 'incentives', label: '4. Midas Access Drop (Perk Tiers)', icon: Award },
              { id: 'simulator', label: '5. Interactive Audience ROI Simulator', icon: Sliders }
            ].map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 whitespace-nowrap px-3.5 py-2 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 font-black shadow-sm'
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

      {/* Main Content Container */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 pt-10 space-y-12">

        {/* TAB 1: OVERVIEW & COMMERCIAL PROBLEM */}
        {activeTab === 'overview' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            
            {/* Interactive Model Toggle (Traditional vs Promorang) */}
            <div className="rounded-3xl border border-white/15 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-widest">Model Comparison</span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">Why Current Promotion Leaks Value</h3>
                </div>
                <div className="flex p-1 rounded-2xl bg-black/60 border border-white/15 self-start">
                  <button
                    onClick={() => setFlywheelModel('traditional')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      flywheelModel === 'traditional'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30 font-black'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    Traditional Event Marketing
                  </button>
                  <button
                    onClick={() => setFlywheelModel('promorang')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      flywheelModel === 'promorang'
                        ? 'bg-orange-500 text-white font-black shadow-lg shadow-orange-950'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    The Promorang Engine ✨
                  </button>
                </div>
              </div>

              {flywheelModel === 'traditional' ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                  <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-2">
                    <span className="text-[11px] font-mono text-red-400 font-bold block">01. Attention Spend</span>
                    <strong className="text-white text-base block">Flyers & Ad Blasts</strong>
                    <p className="text-stone-400 text-xs leading-relaxed">Midas pays for Meta ads, WhatsApp blasts, and DJ mentions. High noise, low attribution.</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-2">
                    <span className="text-[11px] font-mono text-red-400 font-bold block">02. Fragmented Sales</span>
                    <strong className="text-white text-base block">Anonymous Purchase</strong>
                    <p className="text-stone-400 text-xs leading-relaxed">Ticket buyers purchase through cash outlets or ticket sites with no social graph captured.</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-2">
                    <span className="text-[11px] font-mono text-red-400 font-bold block">03. Physical Attendance</span>
                    <strong className="text-white text-base block">Night of Event</strong>
                    <p className="text-stone-400 text-xs leading-relaxed">Crowd dances and leaves. No contact captured, no squad mapping, zero viral multiplier.</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-2">
                    <span className="text-[11px] font-mono text-red-400 font-bold block">04. The Reset Trap</span>
                    <strong className="text-red-400 text-base block">Audience Disappears</strong>
                    <p className="text-stone-400 text-xs leading-relaxed">For the next event, Midas starts from zero, rebuying the exact same audience attention.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                  <div className="p-5 rounded-2xl bg-orange-950/20 border border-orange-500/40 space-y-2">
                    <span className="text-[11px] font-mono text-orange-400 font-bold block">01. Discovery Polls</span>
                    <strong className="text-white text-base block">Interactive Hooks</strong>
                    <p className="text-stone-300 text-xs leading-relaxed">Culturally tailored polls capture attendee preferences and intent without long surveys.</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-orange-950/20 border border-orange-500/40 space-y-2">
                    <span className="text-[11px] font-mono text-orange-400 font-bold block">02. Verified Fast ID</span>
                    <strong className="text-white text-base block">Moment Participation</strong>
                    <p className="text-stone-300 text-xs leading-relaxed">User unlocks Access Drops (express entry, drink perks) and becomes an identifiable contact.</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-orange-950/20 border border-orange-500/40 space-y-2">
                    <span className="text-[11px] font-mono text-orange-400 font-bold block">03. Squad Growth</span>
                    <strong className="text-white text-base block">WhatsApp Crew Passes</strong>
                    <p className="text-stone-300 text-xs leading-relaxed">Attendees invite their squad to unlock group upgrades, creating an organic referral wave.</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-2">
                    <span className="text-[11px] font-mono text-emerald-400 font-bold block">04. Retained Equity</span>
                    <strong className="text-emerald-400 text-base block">Owned Audience Graph</strong>
                    <p className="text-stone-300 text-xs leading-relaxed">Midas builds an identified, retargetable audience database for every future booking.</p>
                  </div>
                </div>
              )}
            </div>

            {/* 10-Stage Visual Growth Loop */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 space-y-6">
              <div className="max-w-2xl">
                <span className="text-xs font-mono font-bold text-orange-400 tracking-wider uppercase">End-to-End Flywheel</span>
                <h3 className="font-serif text-2xl font-bold text-white mt-1">The Midas × Promorang Conversion Pipeline</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                {[
                  { step: '01', name: 'Promotion', desc: 'Midas IG, WhatsApp, DJs' },
                  { step: '02', name: 'Attention', desc: 'Attributable QRs & Links' },
                  { step: '03', name: 'Discovery', desc: 'Summer & Live Polls' },
                  { step: '04', name: 'Participation', desc: 'Vote + Earn Points' },
                  { step: '05', name: 'Identification', desc: 'Fast-Path Member ID' },
                  { step: '06', name: 'Sharing', desc: 'Invite Squad on WhatsApp' },
                  { step: '07', name: 'Conversion', desc: 'Ticket Passes & Pre-sales' },
                  { step: '08', name: 'Attendance', desc: 'Plantation Cove Check-In' },
                  { step: '09', name: 'Perk Unlock', desc: 'Access Drops & Upgrades' },
                  { step: '10', name: 'Retention', desc: 'Future Midas Productions' }
                ].map((item) => (
                  <div key={item.step} className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-1.5 hover:border-orange-500/40 transition-colors">
                    <span className="text-[11px] font-mono font-black text-orange-400 block">{item.step}</span>
                    <strong className="text-white text-xs font-bold block">{item.name}</strong>
                    <span className="text-[10px] text-stone-400 block leading-tight">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: CURATED MOMENTS & VENUE */}
        {activeTab === 'moments' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            
            {/* Canonical Venue Hub Anchor */}
            <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-black to-emerald-950/10 p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 font-mono">
                    Canonical Verified Venue Entity
                  </span>
                  <h3 className="font-serif text-3xl font-bold text-white">Grizzly's Plantation Cove</h3>
                  <p className="text-stone-300 text-sm flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    A1 North Coast Highway, Priory, St. Ann, Jamaica (18.45509° N, -77.23241° W)
                  </p>
                </div>
                <Link
                  to="/venues/plantation-cove"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-lg shadow-emerald-950"
                >
                  <span>Explore Canonical Venue Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
                Plantation Cove is registered as a single persistent venue node. Both Midas events reference this identical record, consolidating check-ins, participant heatmaps, and search indexing without duplicate data.
              </p>
            </div>

            {/* The Two Moments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Moment 1: Sophisticated */}
              <div className="rounded-3xl border border-white/15 bg-white/[0.02] overflow-hidden flex flex-col justify-between group hover:border-orange-500/40 transition-all shadow-xl">
                <div className="relative h-60 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&q=80&w=800"
                    alt="Sophisticated Beach Party"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070605] via-transparent to-black/60" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-orange-600 text-white font-black text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                      PROMORANG PRESENTS
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-orange-400 font-mono text-xs font-bold block">Saturday, August 29, 2026</span>
                    <h4 className="font-serif text-2xl font-bold text-white leading-tight">
                      Sophisticated — The Summer End Beach Party
                    </h4>
                  </div>
                </div>

                <div className="p-6 space-y-4 text-xs sm:text-sm flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5 text-stone-300">
                    <p><strong className="text-white">Headliner:</strong> Vanessa Bling Live in Concert</p>
                    <p><strong className="text-white">DJ Lineup:</strong> Trippple X, Bishop Escobar, Illusion Sound</p>
                    <p><strong className="text-white">Schedule:</strong> 4:00 PM – 10:00 PM (Hosted drinks segment 4–7 PM)</p>
                    <p><strong className="text-white">Admission:</strong> J$5,000 Pre-sold · J$6,000 at Gate</p>
                    <p><strong className="text-white">Promoter:</strong> Midas Entertainment & 8 Rivaz Ultra Lounge</p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-orange-400 font-bold text-xs">+200 Points & PromoKey</span>
                    <Link
                      to="/moments/sophisticated"
                      className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-orange-950"
                    >
                      <span>Explore Moment Page</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Moment 2: Encore Live featuring Capleton */}
              <div className="rounded-3xl border border-white/15 bg-white/[0.02] overflow-hidden flex flex-col justify-between group hover:border-purple-500/40 transition-all shadow-xl">
                <div className="relative h-60 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800"
                    alt="Encore Live featuring Capleton"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070605] via-transparent to-black/60" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-purple-600 text-white font-black text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                      PROMORANG PRESENTS
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-purple-400 font-mono text-xs font-bold block">Sunday, August 30, 2026</span>
                    <h4 className="font-serif text-2xl font-bold text-white leading-tight">
                      Encore Live featuring Capleton
                    </h4>
                  </div>
                </div>

                <div className="p-6 space-y-4 text-xs sm:text-sm flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5 text-stone-300">
                    <p><strong className="text-white">Headliner:</strong> Capleton ("The Fireman" / King Shango) Live</p>
                    <p><strong className="text-white">Format:</strong> Conscious Reggae Live Band Concert Experience</p>
                    <p><strong className="text-white">Schedule:</strong> 6:00 PM – 1:00 AM at Plantation Cove</p>
                    <p><strong className="text-white">Promoter:</strong> Midas Entertainment</p>
                    <p className="text-amber-300 font-semibold text-[11px]">
                      *Strictly disambiguated from "Encore Ladies Playground" or Kingston club nights.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-purple-400 font-bold text-xs">+200 Points & PromoKey</span>
                    <Link
                      to="/moments/encore-live-featuring-capleton"
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-purple-950"
                    >
                      <span>Explore Moment Page</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: PROMOPUSH GEO & FIELD ACTIVATION */}
        {activeTab === 'promopush' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            
            <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-br from-orange-950/25 via-black to-black p-8 space-y-6">
              <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-widest">Digital Push + Physical Pull</span>
              <h3 className="font-serif text-3xl font-bold text-white">PromoPush: Geo-Triggered Input Engine</h3>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-3xl">
                PromoPush turns physical foot traffic and geo-targeted social attention into verified Promorang participants. It bridges online ads directly with on-ground ambassadors stationed at Plantation Cove.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Digital Push */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 space-y-4">
                <div className="p-3 bg-orange-500/20 text-orange-400 rounded-2xl w-fit">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-xl font-bold text-white">1. Digital Push (Corridor Ads)</h4>
                <ul className="space-y-3 text-xs sm:text-sm text-stone-300">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 font-bold">•</span>
                    <span><strong>Pre-Event Travel Corridor:</strong> Meta/Google ads targeted across Ocho Rios, St. Ann, Kingston, and the North-South Highway.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 font-bold">•</span>
                    <span><strong>Direct Poll CTA:</strong> <em>"How are you ending summer? Vote & unlock private access at Plantation Cove."</em> Direct to poll (no generic detour).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 font-bold">•</span>
                    <span><strong>Event-Day 15km Fence:</strong> Geo-targeted alerts reaching nearby tourists and travelers heading along the north coast.</span>
                  </li>
                </ul>
              </div>

              {/* Physical Pull */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 space-y-4">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl w-fit">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-xl font-bold text-white">2. Physical Pull (Brand Ambassadors)</h4>
                <ul className="space-y-3 text-xs sm:text-sm text-stone-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>4 Trained Promorang Staff:</strong> Stationed at approved box office, entry gates, and lounge perimeters.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>10-Second Tablet Script:</strong> <em>"Quick one—what brought you out tonight?"</em> Attendee taps choice $\rightarrow$ instant ID capture.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>Instant Unlock + Squad Loop:</strong> Attendee receives instant unlock perk and is prompted to WhatsApp their crew.</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: MIDAS ACCESS DROP */}
        {activeTab === 'incentives' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            
            <div className="rounded-3xl border border-amber-500/30 bg-amber-950/15 p-8 space-y-4">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">Incentive Economics</span>
              <h3 className="font-serif text-3xl font-bold text-white">Midas × Promorang Access Drop Proposal</h3>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-3xl">
                Midas contributes a controlled, high-perceived-value perk inventory with near-zero marginal cash cost. This turns attendees into active promoters who bring their friends.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
              <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-orange-400 font-mono text-[11px] font-black uppercase">Tier 1 · Speed Access</span>
                  <h4 className="text-lg font-serif font-bold text-white">Express Entry Passes</h4>
                  <p className="text-stone-400 text-xs">50 Fast-track gate wristbands allocated for participants who complete the Discovery Poll and invite 2 friends.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] text-emerald-400 font-semibold">
                  Cost to Midas: $0 (Smooths gate flow)
                </div>
              </div>

              <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-purple-400 font-mono text-[11px] font-black uppercase">Tier 2 · High Value</span>
                  <h4 className="text-lg font-serif font-bold text-white">VIP Viewing Upgrades</h4>
                  <p className="text-stone-400 text-xs">10 VIP deck upgrades rewarded to top referrers who bring verified ticket holders into the Moment.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] text-emerald-400 font-semibold">
                  Cost to Midas: Utilizes VIP buffer
                </div>
              </div>

              <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-amber-400 font-mono text-[11px] font-black uppercase">Tier 3 · Exclusive</span>
                  <h4 className="text-lg font-serif font-bold text-white">Backstage Soundcheck Pass</h4>
                  <p className="text-stone-400 text-xs">2 Double passes for the highest crew builder to experience soundcheck with Vanessa Bling / Capleton.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] text-emerald-400 font-semibold">
                  Cost to Midas: High prestige, $0 cash
                </div>
              </div>

              <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-emerald-400 font-mono text-[11px] font-black uppercase">Tier 4 · Early Arrival</span>
                  <h4 className="text-lg font-serif font-bold text-white">Hosted Drinks Passes</h4>
                  <p className="text-stone-400 text-xs">30 Extra hosted drink tokens for participants who check in at Plantation Cove before 6:00 PM on August 29.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] text-emerald-400 font-semibold">
                  Benefit: Drives early venue arrival
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: AUDIENCE ROI SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            
            <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-r from-orange-950/20 via-black to-purple-950/20 p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-widest">Interactive Modeler</span>
                  <h3 className="font-serif text-3xl font-bold text-white mt-1">Midas Audience Growth & Retention Calculator</h3>
                </div>
                <Badge className="bg-orange-500 text-black font-black text-xs px-3 py-1 self-start">
                  Live Dynamic Simulation
                </Badge>
              </div>
              <p className="text-stone-300 text-sm leading-relaxed max-w-3xl">
                Adjust the proposed perk inventory allocation below to simulate the projected participant capture, viral squad multiplier, and retained audience base for future Midas productions.
              </p>
            </div>

            {/* Interactive Sliders & Live Projections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Sliders Column */}
              <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 space-y-6">
                <h4 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-orange-400" />
                  <span>Configure Midas Access Drop Allocation</span>
                </h4>

                {/* Slider 1 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">Express Entry Wristbands:</span>
                    <span className="text-orange-400 font-mono">{expressPassCount} Passes</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    step="10"
                    value={expressPassCount}
                    onChange={(e) => setExpressPassCount(Number(e.target.value))}
                    className="w-full accent-orange-500 bg-white/10 rounded-lg h-2"
                  />
                  <span className="text-[11px] text-stone-400 block">Drives early Discovery completions & viral 2-friend referrals.</span>
                </div>

                {/* Slider 2 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">VIP Viewing Deck Upgrades:</span>
                    <span className="text-purple-400 font-mono">{vipUpgradeCount} Upgrades</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="30"
                    step="2"
                    value={vipUpgradeCount}
                    onChange={(e) => setVipUpgradeCount(Number(e.target.value))}
                    className="w-full accent-purple-500 bg-white/10 rounded-lg h-2"
                  />
                  <span className="text-[11px] text-stone-400 block">Rewards top squad builders who bring verified ticket buyers.</span>
                </div>

                {/* Slider 3 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">Hosted Drinks Passes (Early Arrival):</span>
                    <span className="text-emerald-400 font-mono">{drinkTokenCount} Tokens</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="10"
                    value={drinkTokenCount}
                    onChange={(e) => setDrinkTokenCount(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-white/10 rounded-lg h-2"
                  />
                  <span className="text-[11px] text-stone-400 block">Incentivizes early check-ins at Plantation Cove before 6:00 PM.</span>
                </div>
              </div>

              {/* Live Output Cards */}
              <div className="rounded-3xl border border-white/10 bg-black/40 p-6 sm:p-8 space-y-5 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-mono text-orange-400 font-bold uppercase tracking-wider block">Projected Campaign Yield</span>
                  <h4 className="font-serif text-2xl font-bold text-white mt-1">Audience Output</h4>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                    <span className="text-stone-400 text-xs block">Identified Participants:</span>
                    <strong className="text-2xl font-mono font-black text-white block">{estimatedParticipants.toLocaleString()} attendees</strong>
                    <span className="text-[10px] text-orange-300 block">Direct verified contact captures</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                    <span className="text-stone-400 text-xs block">Viral Squad Multiplier:</span>
                    <strong className="text-2xl font-mono font-black text-purple-400 block">{estimatedSquadReferrals.toLocaleString()} touchpoints</strong>
                    <span className="text-[10px] text-purple-300 block">Secondary reach via WhatsApp crew loops</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                    <span className="text-stone-400 text-xs block">Retained Midas Audience:</span>
                    <strong className="text-2xl font-mono font-black text-emerald-400 block">{estimatedRetainedAudience.toLocaleString()} members</strong>
                    <span className="text-[10px] text-emerald-300 block">Direct access for Dream Weekend / future drops</span>
                  </div>
                </div>

                <Link
                  to="/dashboard/merchant"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Preview Live Analytics Dashboard</span>
                </Link>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Commercial Next Steps & CTA Bar */}
      <section className="mt-16 border-t border-white/10 bg-gradient-to-b from-[#070605] to-[#140a05] pt-12 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6">
          <span className="bg-orange-500/20 text-orange-400 text-xs font-black uppercase px-3.5 py-1.5 rounded-full border border-orange-500/30 font-mono">
            Commercial Next Action
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-black text-white">
            Activate Midas on Promorang
          </h2>
          <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Walk through the live interactive demonstration or explore the Plantation Cove venue hub to confirm our Summer 2026 activation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                sessionStorage.setItem('promorang_midas_demo_active', 'true');
                navigate('/discover?demo=midas&step=1');
              }}
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold px-6 py-3.5 rounded-2xl text-sm transition-all shadow-xl shadow-orange-950 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Live Guided Demonstration ➔</span>
            </button>
            <Link
              to="/venues/plantation-cove"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-6 py-3.5 rounded-2xl text-sm transition-all flex items-center gap-2"
            >
              <span>View Plantation Cove Hub</span>
              <MapPin className="w-4 h-4 text-emerald-400" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
