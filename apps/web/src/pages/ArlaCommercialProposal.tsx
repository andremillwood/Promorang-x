import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  BookOpen,
  Award,
  Clock,
  MapPin,
  QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getSiteUrl } from '@/lib/discovery';

export default function ArlaCommercialProposal() {
  const [activeTab, setActiveTab] = useState<'overview' | 'journey' | 'data' | 'governance' | 'report'>('overview');

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white selection:bg-[#8A1538] selection:text-white pb-24 font-sans">
      <SEO
        title="PROMORANG × ARLA PRO — Whip & Cook Commercial Proposal"
        description="Commercial proposal for Arla Pro: Consumer Discovery, Sampling Amplification & Retail Conversion Pilot around the PriceSmart Jamaica roadshow."
        url={getSiteUrl("/proposals/arla-pro")}
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-white/10 pt-20 pb-16 bg-gradient-to-b from-[#1c0810] via-[#0f090c] to-[#0a0a0c]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#8A1538]/20 via-transparent to-transparent opacity-80" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="bg-[#8A1538] text-white text-xs font-black uppercase px-3 py-1 rounded-full tracking-wider">
                Commercial Proposal
              </span>
              <span className="bg-white/10 text-white/80 text-xs font-bold px-3 py-1 rounded-full border border-white/15">
                Pilot Phase · August 2026
              </span>
            </div>
            <Link
              to="/campaigns/arla-whip-and-cook"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
            >
              <span>Explore Live Consumer Campaign Hub</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3 max-w-4xl">
            <h1 className="font-serif text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
              PROMORANG × ARLA PRO
            </h1>
            <p className="text-xl sm:text-3xl font-serif text-rose-300 font-bold">
              Whip & Cook Consumer Discovery & Roadshow Amplification Pilot
            </p>
            <p className="text-sm sm:text-base text-white/70 max-w-3xl leading-relaxed">
              Extending the current PriceSmart Jamaica roadshow into an interactive participation, preference discovery, and retargetable audience engine.
            </p>
          </div>

          {/* Strategic Spine Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10 text-xs">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <span className="text-white/40 block uppercase text-[10px] font-bold">Brand & Product</span>
              <p className="text-white font-bold mt-1">Arla Pro Whip & Cook</p>
              <p className="text-white/50 text-[11px]">28% Fat · 1L Dual Use</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <span className="text-white/40 block uppercase text-[10px] font-bold">Physical Anchor</span>
              <p className="text-white font-bold mt-1">PriceSmart Jamaica</p>
              <p className="text-white/50 text-[11px]">111 Red Hills Road, KGN 19</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <span className="text-white/40 block uppercase text-[10px] font-bold">Offer Context</span>
              <p className="text-emerald-400 font-black text-sm mt-1">Approx. J$1,200</p>
              <p className="text-white/50 text-[11px]">Advised reg. ~J$2,700 (56% diff)</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <span className="text-white/40 block uppercase text-[10px] font-bold">Promorang Role</span>
              <p className="text-amber-400 font-bold mt-1">Participation Layer</p>
              <p className="text-white/50 text-[11px]">Discovery → Data → Retention</p>
            </div>
          </div>

        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0c]/90 backdrop-blur-lg">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex overflow-x-auto py-3 gap-2 scrollbar-none">
          {[
            { id: 'overview', label: '1. Executive Strategy & Fit' },
            { id: 'journey', label: '2. Customer Journey & Mechanics' },
            { id: 'data', label: '3. Data & Consumer Intelligence' },
            { id: 'governance', label: '4. Live Now vs Approval Gates' },
            { id: 'report', label: '5. Campaign Report Template' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-primary text-black shadow-md'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Main Tab Content */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10 space-y-12">

        {/* TAB 1: EXECUTIVE STRATEGY & FIT */}
        {activeTab === 'overview' && (
          <div className="space-y-10">
            
            {/* The Opportunity Card */}
            <div className="rounded-3xl border border-white/15 bg-white/[0.03] p-6 sm:p-10 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Strategic Opportunity</span>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">
                  Transforming Physical Product Trial into Retained Demand
                </h2>
                <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-3xl">
                  Arla is already spending capital to put delicious physical samples of Rasta Pasta and Chocolate Chip Mousse into shoppers' mouths at PriceSmart. However, without a connected digital participation layer, each interaction ends when the sample cup is thrown away.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 pt-4">
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.05] p-5 space-y-3">
                  <h3 className="text-base font-bold text-rose-300">Without Promorang (Standard Roadshow)</h3>
                  <ul className="space-y-2 text-xs text-white/70">
                    <li className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">✕</span>
                      <span>Anonymous trial: no record of who tasted what.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">✕</span>
                      <span>Unmeasured dual-use comprehension: shoppers may not realize one cream made both items.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">✕</span>
                      <span>Zero post-event retention: no way to send recipes or re-engage shoppers after they leave.</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.05] p-5 space-y-3">
                  <h3 className="text-base font-bold text-emerald-300">With Promorang (Amplified Roadshow)</h3>
                  <ul className="space-y-2 text-xs text-white/80">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Taste-Off Debate:</strong> Converts anonymous sampling into declared preference data.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Recipe Pack Lead Magnet:</strong> 5 recipes unlocked by active participation.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Retargetable Audience:</strong> Builds a consented audience for future Jamaican retail drops.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Platform Primitives Mapping */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 space-y-6">
              <h3 className="text-xl font-serif font-black text-white">How Arla Maps onto Promorang Primitives</h3>
              
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-primary">Venue</span>
                  <p className="font-bold text-sm text-white">PriceSmart Jamaica</p>
                  <p className="text-xs text-white/50">Canonical 111 Red Hills Road location with coordinates & hours.</p>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-primary">Moments</span>
                  <p className="font-bold text-sm text-white">Daily Roadshow Drops</p>
                  <p className="text-xs text-white/50">Recurring instances for each day of the activation (Aug 18–23).</p>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-primary">Submoments</span>
                  <p className="font-bold text-sm text-white">5 Sample & Deal Missions</p>
                  <p className="text-xs text-white/50">Rasta Pasta, Mousse, Taste-Off, J$1,200 Deal, and Strong Back Bonus.</p>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-primary">Discovery Polls</span>
                  <p className="font-bold text-sm text-white">Viral Preference Capture</p>
                  <p className="text-xs text-white/50">Taste-Off Poll, Product Mode Poll, and Price Perception Discovery.</p>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-primary">Digital Product</span>
                  <p className="font-bold text-sm text-white">5-Recipe Pack Guide</p>
                  <p className="text-xs text-white/50">Lead magnet unlocked by completing any 2 qualifying actions.</p>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-primary">Promorang Presents</span>
                  <p className="font-bold text-sm text-white">Editorial Curation</p>
                  <p className="text-xs text-white/50">Curated cultural placement: "One cream. Two samples. Pick a side."</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: CUSTOMER JOURNEY & MECHANICS */}
        {activeTab === 'journey' && (
          <div className="rounded-3xl border border-white/15 bg-white/[0.03] p-6 sm:p-10 space-y-8">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Step-by-Step Architecture</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-white mt-1">
                The 8-Stage Conversion Journey
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  step: '01',
                  title: 'DISCOVER',
                  subtitle: 'Digital / Social Signal',
                  desc: 'Shopper encounters Discovery on Promorang Presents, WhatsApp, or Instagram: "Whip or Cook? If you had one carton, what happens first?" Shopper discovers that Arla Whip & Cook is engineered for both hot and cold uses.'
                },
                {
                  step: '02',
                  title: 'VISIT',
                  subtitle: 'Moment Direction',
                  desc: 'Promorang surfaces today’s active PriceSmart Moment at 111 Red Hills Road, communicating sampling hours, driving navigation, and providing calendar RSVP.'
                },
                {
                  step: '03',
                  title: 'TASTE',
                  subtitle: 'Dual Trial on Site',
                  desc: 'Shopper samples hot Rasta Pasta (savoury) and cold Chocolate Chip Mousse (dessert). Promorang captures self-reported or promoter-facilitated trial.'
                },
                {
                  step: '04',
                  title: 'VOTE',
                  subtitle: 'Preference Data Capture',
                  desc: 'Shopper votes in the live Taste-Off: Team Rasta Pasta 🍝 vs Team Chocolate Chip Mousse 🍫. Live aggregate percentages reveal the crowd favourite.'
                },
                {
                  step: '05',
                  title: 'UNLOCK',
                  subtitle: 'Lead Magnet Delivery',
                  desc: 'Upon completing 2 qualifying actions, the shopper unlocks the "5 Ways to Whip & Cook with Arla" digital cookbook and saves it to their Promorang Vault.'
                },
                {
                  step: '06',
                  title: 'BUY',
                  subtitle: 'Retail Roadshow Conversion',
                  desc: 'Shopper is prompted with the temporary J$1,200 roadshow price (approx. 56% below indicated regular J$2,700). Shopper logs purchase intention.'
                },
                {
                  step: '07',
                  title: 'SHARE',
                  subtitle: 'Viral Member Referral',
                  desc: 'Shopper shares their Taste-Off vote and referral link via WhatsApp or Instagram to invite a family member or friend to taste at PriceSmart.'
                },
                {
                  step: '08',
                  title: 'RETAIN',
                  subtitle: 'Post-Roadshow Audience',
                  desc: 'Consented participants join Arla’s Promorang discovery audience for recipe push notifications, retail restock alerts, and future sampling activations.'
                }
              ].map((item) => (
                <div key={item.step} className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-primary">{item.step} / {item.title}</span>
                    <span className="text-[10px] font-bold text-white/40 uppercase">{item.subtitle}</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed pt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DATA & CONSUMER INTELLIGENCE */}
        {activeTab === 'data' && (
          <div className="rounded-3xl border border-white/15 bg-white/[0.03] p-6 sm:p-10 space-y-8">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Actionable Brand Intelligence</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-white mt-1">
                What Arla Learns Beyond Passive Impressions
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-2xl">
                Traditional sampling agencies report: "We gave out 1,000 cups." Promorang delivers a quantitative consumer profile.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <span className="text-[10px] font-black uppercase text-emerald-400">1. Dual-Use Comprehension</span>
                <p className="text-xs text-white/70">
                  Percentage of consumers who were previously unaware that a single cream can both cook under high heat and whip to 3.5× volume.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <span className="text-[10px] font-black uppercase text-emerald-400">2. Sample Preference Winner</span>
                <p className="text-xs text-white/70">
                  Exact percentage breakdown between Savoury (Rasta Pasta) and Dessert (Mousse), revealing primary culinary drivers for Jamaican households.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <span className="text-[10px] font-black uppercase text-emerald-400">3. Price Expectation Matrix</span>
                <p className="text-xs text-white/70">
                  Perceived consumer valuation measured before price reveal vs the J$1,200 roadshow price vs J$2,700 regular retail benchmark.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <span className="text-[10px] font-black uppercase text-emerald-400">4. High-Intent Usage Breakdown</span>
                <p className="text-xs text-white/70">
                  What consumers intend to cook first at home (Pasta, Chicken, Seafood, Mousse, Cheesecake, Punch, Coffee).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <span className="text-[10px] font-black uppercase text-emerald-400">5. Conversion Intent Rate</span>
                <p className="text-xs text-white/70">
                  Percentage of sampled consumers expressing active purchase intent or reporting immediate roadshow carton purchase.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <span className="text-[10px] font-black uppercase text-emerald-400">6. Viral Distribution Multiplier</span>
                <p className="text-xs text-white/70">
                  Number of downstream referrals generated by participants inviting peer cooks, bakers, and friends to PriceSmart.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GOVERNANCE & APPROVAL GATES */}
        {activeTab === 'governance' && (
          <div className="rounded-3xl border border-white/15 bg-white/[0.03] p-6 sm:p-10 space-y-8">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Operational Realities & Governance</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-white mt-1">
                Operational Alignment & Execution Framework
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-2xl">
                Framed accurately as Arla doing the promotion, with Promorang powering the consumer discovery, taste-off voting, and digital retention layer.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500 text-black font-black text-[10px]">ACTIVE OPERATIONAL FLOW</Badge>
                  <h3 className="text-base font-bold text-white">Live Execution Architecture</h3>
                </div>
                <ul className="space-y-2.5 text-xs text-white/80">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Roadshow Hours:</strong> Daily 10:00 AM – 8:00 PM at PriceSmart (111 Red Hills Rd).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Brand-Led Framing:</strong> Framed cleanly as Arla’s promotion, with Promorang as the participation layer.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Promoter Verbal Prompt:</strong> Sampling promoters on ground prompt shoppers to check out the Taste-Off and vote on Promorang.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Social Media Driver:</strong> Targeted social posts direct shoppers into the Taste-Off and recipe hub.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>On-Ground Sales Confirmation:</strong> Field promoters verify sales when shoppers purchase cartons at J$1,200.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Strong Back Sample:</strong> Unscheduled/occasional bonus drop (clearly unconfirmed without daily schedule lock).</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-500 text-black font-black text-[10px]">RESTRAINT & CLEAR BOUNDARIES</Badge>
                  <h3 className="text-base font-bold text-white">Non-Intrusive Implementation</h3>
                </div>
                <ul className="space-y-2.5 text-xs text-white/80">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>No Physical Booth QR Signage:</strong> No Promorang branded hardware or banners cluttering the Arla sampling station.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>No False Partnership Claims:</strong> Positioned as Arla’s roadshow, avoiding unauthorized co-brand claims.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Concept Recipes Clearly Labelled:</strong> 5 recipe pack concepts marked as requiring official culinary sign-off.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Price Claims Clarified:</strong> J$2,700 cited carefully as "advised regular price" rather than manufacturer MSRP.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CAMPAIGN REPORT TEMPLATE */}
        {activeTab === 'report' && (
          <div className="rounded-3xl border border-white/15 bg-white/[0.03] p-6 sm:p-10 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Executive Deliverable</span>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-white mt-1">
                  Arla Pro Roadshow Pilot — Campaign Report Sample
                </h2>
                <p className="text-xs text-white/50">Comprehensive telemetry deliverable provided to Arla marketing leadership.</p>
              </div>
              <Badge className="bg-[#008543] text-white text-xs px-3 py-1">Telemetry Ready</Badge>
            </div>

            {/* Key KPI Metric Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <span className="text-[10px] text-white/40 uppercase font-bold">Total Digital Touchpoints</span>
                <p className="text-2xl font-black text-white mt-1">1,420</p>
                <p className="text-[11px] text-emerald-400 font-semibold">+18% vs benchmark</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <span className="text-[10px] text-white/40 uppercase font-bold">Taste-Off Poll Votes</span>
                <p className="text-2xl font-black text-rose-300 mt-1">242</p>
                <p className="text-[11px] text-white/60">Pasta: 53% | Mousse: 47%</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <span className="text-[10px] text-white/40 uppercase font-bold">Recipe Pack Unlocks</span>
                <p className="text-2xl font-black text-amber-300 mt-1">188</p>
                <p className="text-[11px] text-emerald-400 font-semibold">78% Completion Rate</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <span className="text-[10px] text-white/40 uppercase font-bold">J$1,200 Intent Logged</span>
                <p className="text-2xl font-black text-emerald-400 mt-1">94</p>
                <p className="text-[11px] text-white/60">42 Reported Purchased</p>
              </div>
            </div>

            {/* Insights Table */}
            <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
              <table className="w-full text-left text-xs text-white/80">
                <thead className="bg-white/5 text-white/40 uppercase text-[10px] font-bold border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Insight Category</th>
                    <th className="p-3.5">Metric / Finding</th>
                    <th className="p-3.5">Commercial Implication for Arla</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="p-3.5 font-bold text-white">Dual-Use Awareness</td>
                    <td className="p-3.5 text-amber-300">62% unaware before sampling</td>
                    <td className="p-3.5 text-white/60">Demonstrating both hot and cold applications on packaging doubles perceived utility.</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-white">Price Perception</td>
                    <td className="p-3.5 text-emerald-300">68% expected price J$1,500–J$2,499</td>
                    <td className="p-3.5 text-white/60">J$1,200 roadshow price represents exceptional impulse value; strong headroom for retail shelf pricing.</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-white">Top Intended Dish</td>
                    <td className="p-3.5 text-rose-300">Creamy Pasta (38%), Mousse/Cake (31%)</td>
                    <td className="p-3.5 text-white/60">Rasta Pasta recipe card should remain flagship retail point-of-sale asset in Jamaica.</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-white">Referral Virality</td>
                    <td className="p-3.5 text-purple-300">1.34 downstream shares / participant</td>
                    <td className="p-3.5 text-white/60">Foodies actively share Jamaican food debates in group chats when prompted with clear choices.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Call to Action Footer */}
        <section className="rounded-3xl border border-[#8A1538]/30 bg-gradient-to-r from-[#8A1538]/20 via-[#141417] to-[#008543]/20 p-8 sm:p-12 text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-2">
            <Badge className="bg-amber-400 text-black font-black text-xs uppercase px-3 py-1">
              Ready for Market
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-serif font-black text-white">
              Let's Turn Trial into Repeat Demand
            </h2>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              The platform primitives are live. Let's align on field promoter enablement and brand-approved assets to maximize remaining roadshow days.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild className="rounded-2xl bg-primary hover:bg-orange-500 text-black font-black px-8 py-3.5 text-xs shadow-lg">
              <Link to="/campaigns/arla-whip-and-cook">
                Launch Live Campaign Hub <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-2xl border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-3.5 text-xs">
              <Link to="/moments/00000000-0000-0000-0002-000000000060">
                View Today's Moment
              </Link>
            </Button>
          </div>
        </section>

      </div>
    </main>
  );
}
