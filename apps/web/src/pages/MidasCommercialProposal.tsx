import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import {
  ArrowRight,
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
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getSiteUrl } from '@/lib/discovery';

export default function MidasCommercialProposal() {
  const [activeTab, setActiveTab] = useState<'overview' | 'moments' | 'promopush' | 'incentives' | 'data'>('overview');
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoStep, setDemoStep] = useState(1);
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#070709] text-white selection:bg-[#ff5a1f] selection:text-white pb-24 font-sans">
      <SEO
        title="MIDAS ENTERTAINMENT × PROMORANG — Commercial Activation Proposal"
        description="Turning event promotion into reusable audience growth for Midas Entertainment: Sophisticated & Encore Live featuring Capleton at Plantation Cove."
        url={getSiteUrl("/proposals/midas")}
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-white/10 pt-20 pb-16 bg-gradient-to-b from-[#1c0e05] via-[#0d0a08] to-[#070709]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-orange-600/20 via-amber-600/5 to-transparent opacity-80 pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-black uppercase px-3.5 py-1 rounded-full tracking-wider shadow-lg shadow-orange-950">
                Commercial Activation Proposal
              </span>
              <span className="bg-white/10 text-white/80 text-xs font-bold px-3 py-1 rounded-full border border-white/15">
                Summer 2026 Season
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/discover"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 underline underline-offset-4"
              >
                <span>Live Interactive Polls</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="space-y-3 max-w-4xl">
            <h1 className="font-serif text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
              MIDAS ENTERTAINMENT × PROMORANG
            </h1>
            <p className="text-xl sm:text-3xl font-serif text-orange-300 font-bold">
              Turning Event Promotion Into Reusable Audience Growth
            </p>
            <p className="text-sm sm:text-base text-white/70 max-w-3xl leading-relaxed">
              Midas already creates high-energy entertainment and commands Jamaican cultural attention. Promorang provides the participation, audience-capture, and activation layer around that attention—converting anonymous partygoers into an owned, measurable audience.
            </p>
          </div>

          {/* Strategic Spine Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10 text-xs">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <span className="text-white/40 block uppercase text-[10px] font-bold">Partner Brand</span>
              <p className="text-white font-bold mt-1 text-sm">Midas Entertainment</p>
              <p className="text-white/50 text-[11px]">Co-promoter: 8 Rivaz Lounge</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <span className="text-white/40 block uppercase text-[10px] font-bold">Canonical Venue</span>
              <p className="text-white font-bold mt-1 text-sm">Plantation Cove</p>
              <p className="text-white/50 text-[11px]">Priory, St. Ann, Jamaica</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <span className="text-white/40 block uppercase text-[10px] font-bold">Key Activations</span>
              <p className="text-orange-400 font-black text-sm mt-1">2 Curated Moments</p>
              <p className="text-white/50 text-[11px]">Sophisticated & Encore Live</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <span className="text-white/40 block uppercase text-[10px] font-bold">Strategic Objective</span>
              <p className="text-emerald-400 font-bold mt-1 text-sm">Audience Retention</p>
              <p className="text-white/50 text-[11px]">Attention → Capture → Repeat</p>
            </div>
          </div>

        </div>
      </section>

      {/* Live Demonstration Quick Launcher */}
      <section className="border-b border-white/10 bg-gradient-to-r from-orange-950/40 via-black to-purple-950/40 py-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-orange-400 font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Interactive Demonstration Assets
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">Explore the Live Promorang Activation System</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/discover"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-orange-400" />
                <span>Discovery Polls</span>
              </Link>
              <Link
                to="/moments/sophisticated"
                className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-md shadow-orange-950"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Sophisticated Moment</span>
              </Link>
              <Link
                to="/moments/encore-live-featuring-capleton"
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-md shadow-purple-950"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Encore Live Moment</span>
              </Link>
              <Link
                to="/venues/plantation-cove"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Plantation Cove Venue</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-30 border-b border-white/10 bg-[#070709]/95 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex space-x-2 sm:space-x-8 overflow-x-auto py-3 text-xs sm:text-sm font-bold scrollbar-none">
            {[
              { id: 'overview', label: '1. Commercial Problem & Value' },
              { id: 'moments', label: '2. Curated Moments & Venue' },
              { id: 'promopush', label: '3. PromoPush & Field Capture' },
              { id: 'incentives', label: '4. Midas Access Drop' },
              { id: 'data', label: '5. Growth Loop & Metrics' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap px-3 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 font-black'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10 space-y-12">

        {/* TAB 1: COMMERCIAL PROBLEM & VALUE */}
        {activeTab === 'overview' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            
            {/* The Shift */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-3xl border border-red-500/20 bg-red-950/10 p-6 sm:p-8 space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                  <span>Traditional Event Promotion</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">Temporary Attention · Disposable Audience</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Midas spends budget and energy posting flyers to Instagram, blasting WhatsApp chats, and paying DJs for radio/club shouts. People see the flyer, some buy tickets, attend the party, and <strong className="text-white">disappear</strong>.
                </p>
                <div className="p-4 rounded-2xl bg-black/40 border border-red-500/20 font-mono text-xs text-red-300">
                  Flyer View → Maybe Attend → Anonymous Exit → Start From Zero Next Event
                </div>
              </div>

              <div className="rounded-3xl border border-orange-500/30 bg-orange-950/15 p-6 sm:p-8 space-y-4 shadow-xl shadow-orange-950/20">
                <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/30">
                  <span>The Promorang Engine</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">Participation Layer · Owned Retention</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Promorang sits as the interactive layer around Midas promotion. We capture attendee intent through interactive polls, reward viral crew invites, verify on-site attendance at Plantation Cove, and maintain an ongoing relationship for all future events.
                </p>
                <div className="p-4 rounded-2xl bg-black/40 border border-orange-500/30 font-mono text-xs text-orange-300">
                  Discovery → Participation → Verified ID → Crew Viral Share → Post-Event Retention
                </div>
              </div>
            </div>

            {/* Growth Flywheel Diagram */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 space-y-6">
              <div className="max-w-2xl">
                <span className="text-xs font-mono font-bold text-orange-400 tracking-wider uppercase">The 10-Stage Audience Flywheel</span>
                <h3 className="font-serif text-2xl font-bold text-white mt-1">Transforming Midas's Reach Into Reusable Equity</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                {[
                  { step: '01', name: 'Promotion', desc: 'Midas IG, WhatsApp, DJs' },
                  { step: '02', name: 'Attention', desc: 'Attributable Links & QRs' },
                  { step: '03', name: 'Discovery', desc: 'Summer & Live Polls' },
                  { step: '04', name: 'Participation', desc: 'Vote + Earn Points' },
                  { step: '05', name: 'Identification', desc: 'Fast-Path Member ID' },
                  { step: '06', name: 'Sharing', desc: 'Invite Squad on WhatsApp' },
                  { step: '07', name: 'Conversion', desc: 'Ticket Outlets & Passes' },
                  { step: '08', name: 'Attendance', desc: 'Plantation Cove Check-In' },
                  { step: '09', name: 'Perk Unlock', desc: 'Access Drop & Perks' },
                  { step: '10', name: 'Retention', desc: 'Next Midas Experience' }
                ].map((item, idx) => (
                  <div key={item.step} className="rounded-2xl border border-white/10 bg-black/40 p-3.5 space-y-1">
                    <span className="text-[10px] font-mono font-black text-orange-400 block">{item.step}</span>
                    <strong className="text-white text-xs font-bold block">{item.name}</strong>
                    <span className="text-[10px] text-white/50 block leading-tight">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Propositions Table */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 space-y-6">
              <h3 className="font-serif text-2xl font-bold text-white">What Each Party Contributes & Receives</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
                <div className="space-y-4 rounded-2xl border border-white/10 bg-black/30 p-6">
                  <span className="text-orange-400 font-bold uppercase tracking-wider text-xs block">Promorang Provides Midas</span>
                  <ul className="space-y-2.5 text-white/80">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span><strong>PROMORANG PRESENTS Curation:</strong> Prominent active-distribution placement for both activations.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span><strong>Cultural Discovery Polls:</strong> Interactive top-of-funnel consumer intent polling engine.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span><strong>PromoPush Geo-Targeting:</strong> Hyper-local ad routing + on-the-ground promoter activation.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span><strong>Real-Time Analytics & CRM:</strong> Verified participant registry, referral tree, and exportable data.</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4 rounded-2xl border border-white/10 bg-black/30 p-6">
                  <span className="text-amber-400 font-bold uppercase tracking-wider text-xs block">Midas Contributes</span>
                  <ul className="space-y-2.5 text-white/80">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span><strong>Activation Permission:</strong> Official authorization to activate around Sophisticated & Encore Live.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span><strong>Channel Integration:</strong> Deploying Promorang QR codes & links on IG bio, WhatsApp, and DJ copy.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span><strong>Access Drop Inventory:</strong> Controlled perks (VIP upgrades, express entry wristbands, drinks tokens).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span><strong>Venue Access:</strong> Approved stationing of 4 Promorang brand ambassadors at Plantation Cove gates.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: CURATED MOMENTS & VENUE */}
        {activeTab === 'moments' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            
            {/* Plantation Cove Canonical Venue Card */}
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/15 p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                    Canonical Verified Venue Entity
                  </span>
                  <h3 className="font-serif text-3xl font-bold text-white mt-2">Grizzly's Plantation Cove</h3>
                  <p className="text-white/70 text-sm flex items-center gap-1.5 mt-1">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    A1 North Coast Highway, Priory, St. Ann, Jamaica (18.45509° N, -77.23241° W)
                  </p>
                </div>
                <Link
                  to="/venues/plantation-cove"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <span>View Canonical Venue Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed max-w-3xl">
                Plantation Cove is established as a single, canonical location node in the Promorang Knowledge Graph. Both Midas events reference this identical venue record, accumulating historical attendance signals and check-in momentum without data fragmentation.
              </p>
            </div>

            {/* The Two Moments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Moment 1: Sophisticated */}
              <div className="rounded-3xl border border-white/15 bg-white/[0.02] overflow-hidden flex flex-col justify-between">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&q=80&w=800"
                    alt="Sophisticated Beach Party"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-black/60" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-orange-600 text-white font-black text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                      PROMORANG PRESENTS
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-orange-400 font-mono text-xs font-bold">Saturday, August 29, 2026</span>
                    <h4 className="font-serif text-2xl font-bold text-white leading-tight">
                      Sophisticated — The Summer End Beach Party
                    </h4>
                  </div>
                </div>

                <div className="p-6 space-y-4 text-xs sm:text-sm flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5 text-white/70">
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
                      className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <span>Explore Moment</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Moment 2: Encore Live featuring Capleton */}
              <div className="rounded-3xl border border-white/15 bg-white/[0.02] overflow-hidden flex flex-col justify-between">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800"
                    alt="Encore Live featuring Capleton"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-black/60" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-purple-600 text-white font-black text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                      PROMORANG PRESENTS
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-purple-400 font-mono text-xs font-bold">Sunday, August 30, 2026</span>
                    <h4 className="font-serif text-2xl font-bold text-white leading-tight">
                      Encore Live featuring Capleton
                    </h4>
                  </div>
                </div>

                <div className="p-6 space-y-4 text-xs sm:text-sm flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5 text-white/70">
                    <p><strong className="text-white">Headliner:</strong> Capleton ("The Fireman" / King Shango) Live</p>
                    <p><strong className="text-white">Format:</strong> Conscious Reggae & Dancehall Live Band Experience</p>
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
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <span>Explore Moment</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

            </div>

            {/* Cultural Discovery Polls Preview */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono font-bold text-orange-400 tracking-wider uppercase">Top-of-Funnel Discovery Engine</span>
                  <h3 className="font-serif text-2xl font-bold text-white mt-1">Live Cultural Polls Feeding Midas Experiences</h3>
                </div>
                <Link
                  to="/discover"
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors self-start"
                >
                  <span>Test Discovery Polls Live</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <span className="px-2.5 py-0.5 bg-orange-500/20 text-orange-400 rounded-full text-[10px] font-bold">Summer Finale Poll</span>
                  <p className="text-white font-bold text-sm">"How are you ending summer 2026 in Jamaica?"</p>
                  <div className="space-y-1.5 text-xs text-white/60">
                    <div className="p-2 rounded bg-white/5">1. Beach party & oceanfront vibes</div>
                    <div className="p-2 rounded bg-white/5">2. Live concert & conscious stage show</div>
                    <div className="p-2 rounded bg-white/5">3. Club night & high-energy party</div>
                  </div>
                  <p className="text-[11px] text-orange-300 font-semibold pt-2 border-t border-white/10">
                    → Routes voters directly to Promorang Presents: Sophisticated
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-[10px] font-bold">Live Culture Poll</span>
                  <p className="text-white font-bold text-sm">"What gets you out for a live experience?"</p>
                  <div className="space-y-1.5 text-xs text-white/60">
                    <div className="p-2 rounded bg-white/5">1. Reggae & conscious roots vibration</div>
                    <div className="p-2 rounded bg-white/5">2. Dancehall energy & top selectors</div>
                    <div className="p-2 rounded bg-white/5">3. Afrobeats & crossover rhythm</div>
                  </div>
                  <p className="text-[11px] text-purple-300 font-semibold pt-2 border-t border-white/10">
                    → Routes voters directly to Promorang Presents: Encore Live
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: PROMOPUSH & FIELD CAPTURE */}
        {activeTab === 'promopush' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            
            <div className="rounded-3xl border border-orange-500/30 bg-orange-950/20 p-8 space-y-6">
              <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-widest">Digital Push + Physical Pull</span>
              <h3 className="font-serif text-3xl font-bold text-white">PromoPush: On-the-Ground + Geo-Targeted Activation</h3>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-3xl">
                PromoPush is Promorang's proprietary activation methodology. It combines geo-targeted digital advertising with trained physical field ambassadors to turn foot traffic and online attention into identified, Measurable Promorang participants.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Digital Push */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 space-y-4">
                <div className="p-3 bg-orange-500/20 text-orange-400 rounded-2xl w-fit">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-xl font-bold text-white">1. Digital Push (Pre-Event & Event-Day)</h4>
                <ul className="space-y-3 text-xs sm:text-sm text-white/70">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 font-bold">•</span>
                    <span><strong>Pre-Event Corridor Targeting:</strong> Meta & Google ads geo-fenced along Ocho Rios, St. Ann's Bay, Kingston, and the North-South highway.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 font-bold">•</span>
                    <span><strong>Direct Funnel Hook:</strong> <em>"How are you ending summer? Vote & unlock private access at Plantation Cove."</em> Direct to Discovery Polls (no generic landing pages).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 font-bold">•</span>
                    <span><strong>Event-Day 15km Geo-Fence:</strong> Real-time ad targeting surrounding Plantation Cove notifying nearby visitors of last-minute ticket passes and entry perks.</span>
                  </li>
                </ul>
              </div>

              {/* Physical Pull */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 space-y-4">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl w-fit">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-xl font-bold text-white">2. Physical Pull (Brand Ambassadors)</h4>
                <ul className="space-y-3 text-xs sm:text-sm text-white/70">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>4 Dedicated Field Ambassadors:</strong> Stationed at approved entrance gates and perimeter access points at Plantation Cove.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>The 10-Second Engagement Script:</strong> <em>"Quick one—what brought you out to Plantation Cove tonight?"</em> Attendee answers on tablet or scans badge.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>Instant Unlock & WhatsApp Loop:</strong> Attendee instantly receives their reward code and is prompted to pass it to their crew in WhatsApp.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Event Day Capture Points */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 space-y-6">
              <h4 className="font-serif text-2xl font-bold text-white">Plantation Cove Physical QR Touchpoints</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center space-y-1.5">
                  <QrCode className="w-6 h-6 text-orange-400 mx-auto" />
                  <strong className="text-white block">Main Gate & Box Office</strong>
                  <span className="text-white/50 block text-[11px]">Express wristband unlock</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center space-y-1.5">
                  <QrCode className="w-6 h-6 text-orange-400 mx-auto" />
                  <strong className="text-white block">Bars & Hosted Drinks</strong>
                  <span className="text-white/50 block text-[11px]">Drink token verification</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center space-y-1.5">
                  <QrCode className="w-6 h-6 text-purple-400 mx-auto" />
                  <strong className="text-white block">VIP & Cabana Lounges</strong>
                  <span className="text-white/50 block text-[11px]">VIP upgrade access claims</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center space-y-1.5">
                  <QrCode className="w-6 h-6 text-emerald-400 mx-auto" />
                  <strong className="text-white block">Promoter Stations</strong>
                  <span className="text-white/50 block text-[11px]">Tablet scan & quick voting</span>
                </div>
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
              <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-3xl">
                To turn passive viewers into active distributors who invite their friends, Midas allocates a controlled, high-perceived-value perk inventory with near-zero marginal cash cost.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
              
              <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-orange-400 font-mono text-[11px] font-black uppercase">Tier 1 · Scarcity Access</span>
                  <h4 className="text-lg font-serif font-bold text-white">Express Entry Wristbands</h4>
                  <p className="text-white/60 text-xs">50 Fast-Track gate wristbands allocated for participants who complete the Discovery Poll and invite 2 friends.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] text-emerald-400 font-semibold">
                  Cost to Midas: $0 (Smooths gate flow)
                </div>
              </div>

              <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-purple-400 font-mono text-[11px] font-black uppercase">Tier 2 · High Value</span>
                  <h4 className="text-lg font-serif font-bold text-white">VIP Viewing Upgrades</h4>
                  <p className="text-white/60 text-xs">10 VIP deck upgrades rewarded to top squad referrers who bring verified ticket buyers into the Moment.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] text-emerald-400 font-semibold">
                  Cost to Midas: Utilizes VIP buffer
                </div>
              </div>

              <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-amber-400 font-mono text-[11px] font-black uppercase">Tier 3 · Exclusive</span>
                  <h4 className="text-lg font-serif font-bold text-white">Backstage / Soundcheck Pass</h4>
                  <p className="text-white/60 text-xs">2 Double passes for the ultimate squad builder to experience the soundcheck with Vanessa Bling / Capleton.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] text-emerald-400 font-semibold">
                  Cost to Midas: High prestige, $0 cash
                </div>
              </div>

              <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-emerald-400 font-mono text-[11px] font-black uppercase">Tier 4 · Early Arrival</span>
                  <h4 className="text-lg font-serif font-bold text-white">Hosted Drinks Pass</h4>
                  <p className="text-white/60 text-xs">30 Extra hosted drink tokens for participants who check in at Plantation Cove before 6:00 PM on August 29.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] text-emerald-400 font-semibold">
                  Benefit: Drives early venue arrival
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 5: DATA, RETENTION & REPORTING */}
        {activeTab === 'data' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            
            <div className="rounded-3xl border border-blue-500/30 bg-blue-950/15 p-8 space-y-4">
              <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">Audience Retention & Analytics</span>
              <h3 className="font-serif text-3xl font-bold text-white">Post-Event Retention & Midas Campaign Reporting</h3>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-3xl">
                The campaign does not end when the music stops at Plantation Cove. Promorang provides Midas with a real-time analytics dashboard and an ongoing retention pipeline for future events.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h4 className="font-serif text-2xl font-bold text-white">Deliverable Midas Campaign Dashboard</h4>
                <Link
                  to="/dashboard/merchant"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors self-start"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Preview Promoter Dashboard</span>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                  <span className="text-white/50 block text-[11px]">Discovery Signals</span>
                  <strong className="text-white font-bold text-base">Poll Responses</strong>
                  <p className="text-white/40 text-[10px]">Summer ending & genre breakdown</p>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                  <span className="text-white/50 block text-[11px]">Moment Capture</span>
                  <strong className="text-orange-400 font-bold text-base">Verified Joins</strong>
                  <p className="text-white/40 text-[10px]">Unique participant accounts</p>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                  <span className="text-white/50 block text-[11px]">Viral Multiplication</span>
                  <strong className="text-purple-400 font-bold text-base">Crew Referrals</strong>
                  <p className="text-white/40 text-[10px]">WhatsApp share attribution tree</p>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                  <span className="text-white/50 block text-[11px]">Physical Verification</span>
                  <strong className="text-emerald-400 font-bold text-base">Gate Check-Ins</strong>
                  <p className="text-white/40 text-[10px]">Verified attendance at Plantation Cove</p>
                </div>
              </div>
            </div>

            {/* Post-Event Retention Flow */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 space-y-6">
              <h4 className="font-serif text-2xl font-bold text-white">Post-Event Retention Flywheel</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <span className="text-orange-400 font-mono text-[10px] font-black uppercase">T+12 Hours</span>
                  <strong className="text-white block font-bold">Recap & Highlight Reel</strong>
                  <p className="text-white/60 text-xs">Automated message delivering party photo recaps and asking attendees to rate their favorite DJ set.</p>
                </div>
                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <span className="text-purple-400 font-mono text-[10px] font-black uppercase">T+48 Hours</span>
                  <strong className="text-white block font-bold">Feedback Discovery Poll</strong>
                  <p className="text-white/60 text-xs">"What should Midas bring to Plantation Cove next season?" Capturing forward intent for upcoming calendar bookings.</p>
                </div>
                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <span className="text-emerald-400 font-mono text-[10px] font-black uppercase">Next Calendar Drop</span>
                  <strong className="text-white block font-bold">Pre-Warmed Access Drops</strong>
                  <p className="text-white/60 text-xs">Launch ticket pre-sales to a qualified, pre-identified list of past attendees without starting from zero ad spend.</p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Commercial Next Steps & CTA Bar */}
      <section className="mt-16 border-t border-white/10 bg-gradient-to-b from-[#070709] to-[#140a05] pt-12 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6">
          <span className="bg-orange-500/20 text-orange-400 text-xs font-black uppercase px-3.5 py-1.5 rounded-full border border-orange-500/30">
            Immediate Next Step
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-black text-white">
            Activate Midas on Promorang
          </h2>
          <p className="text-sm sm:text-base text-white/70 max-w-2xl mx-auto leading-relaxed">
            Let's walk through a 5-minute live demonstration of the discovery polls, moment pages, and audience dashboard to confirm our Summer 2026 activation at Plantation Cove.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                setDemoStep(1);
                setShowDemoModal(true);
              }}
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-6 py-3.5 rounded-2xl text-sm transition-all shadow-xl shadow-orange-950 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch 7-Step Interactive Demonstration</span>
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

      {/* 7-Step Guided Interactive Demonstration Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#0e0c0a] border border-orange-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-orange-950/50 space-y-6 text-white max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-orange-400 font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Midas 3–5 Minute Guided Demonstration
                </span>
                <h3 className="font-serif text-2xl font-bold text-white mt-1">
                  Step {demoStep} of 7: {
                    demoStep === 1 ? "Cultural Discovery Poll (Top of Funnel)" :
                    demoStep === 2 ? "PROMORANG PRESENTS Recommendation" :
                    demoStep === 3 ? "Sophisticated Beach Party Moment Page" :
                    demoStep === 4 ? "Encore Live featuring Capleton Moment" :
                    demoStep === 5 ? "Canonical Plantation Cove Venue Hub" :
                    demoStep === 6 ? "Instant Join & WhatsApp Crew Share" :
                    "Promoter Intelligence Dashboard"
                  }
                </h3>
              </div>
              <button
                onClick={() => setShowDemoModal(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
                aria-label="Close Demonstration Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Body */}
            <div className="space-y-4 text-sm text-white/80">
              {demoStep === 1 && (
                <div className="space-y-3">
                  <p>
                    <strong>What happens:</strong> The attendee sees an interactive Jamaican discovery poll via Instagram bio, WhatsApp, or DJ ad (e.g. <em>"How are you ending summer 2026 in Jamaica?"</em>).
                  </p>
                  <p className="text-white/60 text-xs">
                    Tapping an option (like <em>Beach party & oceanfront vibes</em>) records live demand signals without creating a boring survey barrier.
                  </p>
                  <div className="p-4 rounded-2xl bg-black/40 border border-orange-500/20 text-xs text-orange-300 font-mono">
                    Endpoint: /discover · Live vote counts + Demand threshold meters
                  </div>
                </div>
              )}

              {demoStep === 2 && (
                <div className="space-y-3">
                  <p>
                    <strong>What happens:</strong> Immediately following their vote, the attendee receives a personalized result followed by the curated card: <strong>PROMORANG PRESENTS: Sophisticated at Plantation Cove</strong>.
                  </p>
                  <p className="text-white/60 text-xs">
                    Promorang Presents acts as the active-distribution recommendation tier, cleanly separated from user poll answers.
                  </p>
                  <div className="p-4 rounded-2xl bg-black/40 border border-orange-500/20 text-xs text-orange-300 font-mono">
                    Badge: PROMORANG PRESENTS · Curated High-Intent Placement
                  </div>
                </div>
              )}

              {demoStep === 3 && (
                <div className="space-y-3">
                  <p>
                    <strong>What happens:</strong> The attendee lands on the dedicated <strong>Sophisticated Moment Page</strong>.
                  </p>
                  <p className="text-white/60 text-xs">
                    They see Vanessa Bling headliner billing, DJ lineup (Trippple X, Bishop Escobar, Illusion Sound), hosted drinks segment (4–7 PM), and J$5,000 pre-sold ticket access.
                  </p>
                  <div className="p-4 rounded-2xl bg-black/40 border border-orange-500/20 text-xs text-orange-300 font-mono">
                    Endpoint: /moments/sophisticated · Plantation Cove, Aug 29, 2026
                  </div>
                </div>
              )}

              {demoStep === 4 && (
                <div className="space-y-3">
                  <p>
                    <strong>What happens:</strong> Attendees interested in live concert reggae explore <strong>Encore Live featuring Capleton</strong>.
                  </p>
                  <p className="text-white/60 text-xs">
                    Strictly disambiguated from any weekly club night, highlighting Capleton's full live band reggae concert on Sunday, August 30 at Plantation Cove.
                  </p>
                  <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/20 text-xs text-purple-300 font-mono">
                    Endpoint: /moments/encore-live-featuring-capleton
                  </div>
                </div>
              )}

              {demoStep === 5 && (
                <div className="space-y-3">
                  <p>
                    <strong>What happens:</strong> Clicking the venue opens the canonical <strong>Plantation Cove Venue Hub</strong> in Priory, St. Ann.
                  </p>
                  <p className="text-white/60 text-xs">
                    Both Midas events sit under this single persistent venue record (18.45509° N, -77.23241° W), building lasting location authority.
                  </p>
                  <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/20 text-xs text-emerald-300 font-mono">
                    Endpoint: /venues/plantation-cove · Verified Google Places Anchor
                  </div>
                </div>
              )}

              {demoStep === 6 && (
                <div className="space-y-3">
                  <p>
                    <strong>What happens:</strong> The attendee taps <strong>"Join Moment"</strong>.
                  </p>
                  <p className="text-white/60 text-xs">
                    Zero-friction contact capture takes place. The user immediately receives +200 PromoPoints, an unlock code for Midas Access Drops, and an instant WhatsApp referral button to invite their crew.
                  </p>
                  <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/20 text-xs text-amber-300 font-mono">
                    Growth Loop: Attendee joins → Unlocks perk → Forwards WhatsApp pass to crew
                  </div>
                </div>
              )}

              {demoStep === 7 && (
                <div className="space-y-3">
                  <p>
                    <strong>What happens:</strong> Midas opens the <strong>Merchant/Host Dashboard</strong> to view real-time data.
                  </p>
                  <p className="text-white/60 text-xs">
                    Track discovery completions, verified moment joins, referral tree attribution, and gate check-ins at Plantation Cove.
                  </p>
                  <div className="p-4 rounded-2xl bg-black/40 border border-blue-500/20 text-xs text-blue-300 font-mono">
                    Endpoint: /dashboard/merchant · Real-Time Campaign Intelligence
                  </div>
                </div>
              )}
            </div>

            {/* Step Stepper Indicators */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    onClick={() => setDemoStep(num)}
                    className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                      demoStep === num
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-950 font-black'
                        : demoStep > num
                        ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/10 text-white/40'
                    }`}
                  >
                    {demoStep > num ? '✓' : num}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {demoStep > 1 && (
                  <button
                    onClick={() => setDemoStep(s => s - 1)}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
                  >
                    Previous
                  </button>
                )}

                {demoStep < 7 ? (
                  <button
                    onClick={() => setDemoStep(s => s + 1)}
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white transition-colors flex items-center gap-1"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowDemoModal(false);
                      navigate('/discover');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors flex items-center gap-1"
                  >
                    <span>Open Live Demo</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}

                {/* Direct Action Link for Current Step */}
                <button
                  onClick={() => {
                    setShowDemoModal(false);
                    if (demoStep === 1) navigate('/discover');
                    else if (demoStep === 2) navigate('/radar');
                    else if (demoStep === 3) navigate('/moments/sophisticated');
                    else if (demoStep === 4) navigate('/moments/encore-live-featuring-capleton');
                    else if (demoStep === 5) navigate('/venues/plantation-cove');
                    else if (demoStep === 6) navigate('/moments/sophisticated');
                    else if (demoStep === 7) navigate('/dashboard/merchant');
                  }}
                  className="px-3 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/15 text-xs font-bold text-orange-400 transition-colors"
                >
                  Jump to Page ↗
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}
