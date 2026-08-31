import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import {
  ArrowRight,
  Check,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  Target,
  BarChart3,
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
  HelpCircle,
  AlertTriangle,
  Smile,
  CheckCircle2,
  DollarSign,
  Share2
} from 'lucide-react';
import { getSiteUrl } from '@/lib/discovery';
import { useI18n } from '@/i18n/I18nContext';

export default function ArlaCommercialProposal() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'problem' | 'solution' | 'mechanics' | 'roi'>('problem');

  return (
    <main className="min-h-screen bg-[#11100e] text-[#f4efe5] selection:bg-[#ff5a1f] selection:text-white font-sans pb-32">
      <SEO
        title="PROMORANG × ARLA PRO — Commercial Pilot Proposal"
        description="How Promorang turns the PriceSmart Jamaica Arla Pro sampling roadshow into verified retail sales, customer data, and repeat home cooking demand."
        url={getSiteUrl("/proposals/arla-pro")}
      />

      {/* 1. TOP TICKER / COMMERCIAL CONTEXT */}
      <div className="bg-[#ff5a1f] text-black font-mono font-black text-xs uppercase tracking-wider py-2.5 px-4 border-b-2 border-black flex items-center justify-between overflow-x-auto gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <span className="h-2.5 w-2.5 bg-black rounded-full animate-ping" />
          <span>COMMERCIAL BRIEF · PILOT ACTIVATION PROPOSAL FOR ARLA LEADERSHIP</span>
        </div>
        <div className="flex items-center gap-4 shrink-0 font-bold">
          <Link to="/campaigns/arla-whip-and-cook" className="bg-black text-white px-3 py-0.5 hover:bg-[#11100e] transition text-[10px]">
            {t("arlaPitch.seeLive")} →
          </Link>
        </div>
      </div>

      {/* 2. HERO / EXECUTIVE BRIEF */}
      <section className="relative border-b-2 border-black/40 bg-gradient-to-b from-[#181512] to-[#11100e] px-4 sm:px-8 pt-12 pb-16">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-[#ff5a1f]">
              <span>COMMERCIAL PROPOSAL</span>
              <span className="text-white/40">/</span>
              <span>ARLA FOODS × PROMORANG</span>
              <span className="text-white/40">/</span>
              <span className="text-[#ffcf38]">AUGUST 2026</span>
            </div>

            <Link
              to="/campaigns/arla-whip-and-cook"
              className="inline-flex items-center gap-2 font-mono text-xs font-black uppercase text-[#ffcf38] hover:text-white transition"
            >
              <span>{t("arlaPitch.viewShoppers")}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-4 max-w-4xl">
            <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.88] text-white">
              Don’t Just Hand Out Samples. <i className="text-[#ff5a1f] not-italic">Drive Repeat Sales.</i>
            </h1>

            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#ffcf38] leading-tight">
              How Promorang turns a 15-second taste test at PriceSmart into verified supermarket purchases and repeat home cooking.
            </p>

            <p className="text-sm sm:text-base text-[#d0c5b9] leading-relaxed max-w-2xl">
              Roadshows are great for product awareness, but without a digital bridge, 90% of shoppers forget the brand once they leave the store. Promorang connects the physical booth to digital voting, recipe unlocks, and verified buying intent.
            </p>
          </div>

          {/* Strategic Spine Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t-2 border-black font-mono text-xs">
            <div className="bg-black/60 border border-white/20 p-4 space-y-1">
              <span className="text-[#898071] text-[10px] uppercase font-bold block">{t("arlaPitch.targetProduct")}</span>
              <strong className="text-white text-sm block">Arla Whip & Cook 28%</strong>
              <span className="text-[#d0c5b9] text-[11px]">1L Dual-Use Dairy Cream</span>
            </div>

            <div className="bg-black/60 border border-white/20 p-4 space-y-1">
              <span className="text-[#898071] text-[10px] uppercase font-bold block">{t("arlaPitch.physical")}</span>
              <strong className="text-white text-sm block">PriceSmart Jamaica</strong>
              <span className="text-[#d0c5b9] text-[11px]">111 Red Hills Road, KGN 19</span>
            </div>

            <div className="bg-black/60 border border-white/20 p-4 space-y-1">
              <span className="text-[#898071] text-[10px] uppercase font-bold block">{t("arlaPitch.priceHook")}</span>
              <strong className="text-[#25D366] text-sm block">Approx. J$1,200</strong>
              <span className="text-[#d0c5b9] text-[11px]">Regular advice ~J$2,700</span>
            </div>

            <div className="bg-black/60 border border-white/20 p-4 space-y-1">
              <span className="text-[#898071] text-[10px] uppercase font-bold block">{t("arlaPitch.role")}</span>
              <strong className="text-[#ff5a1f] text-sm block">Demand Engine</strong>
              <span className="text-[#d0c5b9] text-[11px]">Trial → Data → Repeat Sales</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. TACTILE PROPOSAL TABS */}
      <section className="px-4 sm:px-8 py-8 bg-[#181512] border-b-2 border-black sticky top-0 z-30 font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2">
          {[
            { id: 'problem', label: t("arlaPitch.tabProblem") },
            { id: 'solution', label: t("arlaPitch.tabSolution") },
            { id: 'mechanics', label: t("arlaPitch.tabMechanics") },
            { id: 'roi', label: t("arlaPitch.tabRoi") }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 text-xs font-black uppercase transition cursor-pointer border-2 ${
                activeTab === tab.id
                  ? 'bg-[#ff5a1f] text-black border-black shadow-[4px_4px_0_#ffcf38]'
                  : 'bg-black/50 text-[#d0c5b9] border-white/10 hover:border-white/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* 4. TAB 1: THE SAMPLING PROBLEM */}
      {activeTab === 'problem' && (
        <section className="px-4 sm:px-8 py-16 bg-[#11100e] border-b-2 border-black">
          <div className="max-w-7xl mx-auto space-y-10">
            
            <div className="max-w-3xl space-y-2">
              <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#ff5a1f]">
                WHY TRADITIONAL SAMPLING FALLS SHORT
              </p>
              <h2 className="font-serif text-4xl sm:text-5xl font-black text-white">
                The 3 leaking holes in standard roadshows
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3 font-mono">
              
              <div className="bg-[#181512] border-2 border-white/20 p-6 space-y-4 shadow-[6px_6px_0_#000]">
                <span className="text-[#ff5a1f] font-black text-xs">LEAK #1</span>
                <h3 className="font-serif text-2xl font-bold text-white font-sans">Zero Shopper Data</h3>
                <p className="text-xs text-[#d0c5b9] leading-relaxed">
                  When shoppers try the Rasta Pasta or Chocolate Mousse, say “it taste nice,” and walk away, Arla collects zero emails, zero phone numbers, and has no way to contact them ever again.
                </p>
              </div>

              <div className="bg-[#181512] border-2 border-white/20 p-6 space-y-4 shadow-[6px_6px_0_#000]">
                <span className="text-[#ffcf38] font-black text-xs">LEAK #2</span>
                <h3 className="font-serif text-2xl font-bold text-white font-sans">The “What Do I Cook?” Barrier</h3>
                <p className="text-xs text-[#d0c5b9] leading-relaxed">
                  Even if a shopper buys a 1L carton for J$1,200 at PriceSmart, they often don’t know what else to cook besides the single sample they tasted. If the carton sits unused, they never buy carton #2.
                </p>
              </div>

              <div className="bg-[#181512] border-2 border-white/20 p-6 space-y-4 shadow-[6px_6px_0_#000]">
                <span className="text-[#25D366] font-black text-xs">LEAK #3</span>
                <h3 className="font-serif text-2xl font-bold text-white font-sans">No Measured Attribution</h3>
                <p className="text-xs text-[#d0c5b9] leading-relaxed">
                  Brand managers cannot distinguish whether a sales spike came from the temporary J$1,200 price discount, promoter charm, or organic warehouse foot traffic. There is no feedback loop.
                </p>
              </div>

            </div>

          </div>
        </section>
      )}

      {/* 5. TAB 2: HOW PROMORANG FIXES IT */}
      {activeTab === 'solution' && (
        <section className="px-4 sm:px-8 py-16 bg-[#f4efe5] text-[#11100e] border-b-2 border-black">
          <div className="max-w-7xl mx-auto space-y-12">
            
            <div className="max-w-3xl space-y-2">
              <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#ff5a1f]">
                THE PROMORANG UPGRADE
              </p>
              <h2 className="font-serif text-4xl sm:text-6xl font-bold leading-tight">
                Turn a 15-second free taste into an owned Jamaican customer list.
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3 border-t-2 border-black pt-8 font-mono">
              
              <article className="space-y-3 bg-white p-6 border-2 border-black shadow-[6px_6px_0_#ff5a1f]">
                <span className="text-[#ff5a1f] font-black text-sm">01 / TASTE-OFF VOTING</span>
                <h3 className="font-serif text-2xl font-bold text-black font-sans">Interactive Engagement</h3>
                <p className="text-xs text-[#554e45] leading-relaxed">
                  On-ground promoters invite shoppers to vote between Rasta Pasta and Chocolate Mousse on Promorang. It gamifies the experience and captures live declared taste preference.
                </p>
              </article>

              <article className="space-y-3 bg-white p-6 border-2 border-black shadow-[6px_6px_0_#ffcf38]">
                <span className="text-[#ff5a1f] font-black text-sm">02 / 5-RECIPE DIGITAL COOKBOOK</span>
                <h3 className="font-serif text-2xl font-bold text-black font-sans">Guaranteed Repeat Cooking</h3>
                <p className="text-xs text-[#554e45] leading-relaxed">
                  Voting unlocks "5 Ways to Whip & Cook with Arla" directly on the shopper’s phone. Now they have step-by-step guides for dinner, desserts, and punches to use up the carton at home.
                </p>
              </article>

              <article className="space-y-3 bg-white p-6 border-2 border-black shadow-[6px_6px_0_#25D366]">
                <span className="text-[#ff5a1f] font-black text-sm">03 / SALES VERIFICATION</span>
                <h3 className="font-serif text-2xl font-bold text-black font-sans">Zero Physical Signage Friction</h3>
                <p className="text-xs text-[#554e45] leading-relaxed">
                  No awkward QR stands required at the PriceSmart booth. Brand promoters simply ask shoppers to check in on Promorang and log verified sales upon checkout.
                </p>
              </article>

            </div>

          </div>
        </section>
      )}

      {/* 6. TAB 3: PLATFORM MECHANICS IMPLEMENTED NOW */}
      {activeTab === 'mechanics' && (
        <section className="px-4 sm:px-8 py-16 bg-[#11100e] border-b-2 border-black">
          <div className="max-w-7xl mx-auto space-y-10 font-mono">
            
            <div className="max-w-3xl space-y-2">
              <p className="text-xs font-black uppercase text-[#ffcf38] tracking-widest">
                LIVE PLATFORM INVENTORY
              </p>
              <h2 className="font-serif text-4xl sm:text-5xl font-black text-white">
                Everything we built & deployed for Arla today
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              
              <div className="bg-black border border-white/20 p-5 space-y-2">
                <span className="text-[10px] text-[#ff5a1f] font-bold">INVENTORY 01</span>
                <h4 className="text-base font-bold text-white font-serif">PriceSmart Venue Anchor</h4>
                <p className="text-xs text-white/60">Registered 111 Red Hills Road with daily recurring operating moments (10:00 AM – 8:00 PM).</p>
              </div>

              <div className="bg-black border border-white/20 p-5 space-y-2">
                <span className="text-[10px] text-[#ffcf38] font-bold">INVENTORY 02</span>
                <h4 className="text-base font-bold text-white font-serif">The Live Taste-Off Arena</h4>
                <p className="text-xs text-white/60">Live interactive showdown comparing Rasta Pasta vs Chocolate Chip Mousse with percentage bars.</p>
              </div>

              <div className="bg-black border border-white/20 p-5 space-y-2">
                <span className="text-[10px] text-[#25D366] font-bold">INVENTORY 03</span>
                <h4 className="text-base font-bold text-white font-serif">5 Submoment Missions</h4>
                <p className="text-xs text-white/60">Savoury sample, dessert sample, Taste-Off vote, J$1,200 purchase verification, and surprise Strong Back drop.</p>
              </div>

              <div className="bg-black border border-white/20 p-5 space-y-2">
                <span className="text-[10px] text-[#ff5a1f] font-bold">INVENTORY 04</span>
                <h4 className="text-base font-bold text-white font-serif">Price Perception Discovery</h4>
                <p className="text-xs text-white/60">Captures shopper valuation benchmarks before revealing the J$1,200 roadshow special offer.</p>
              </div>

              <div className="bg-black border border-white/20 p-5 space-y-2">
                <span className="text-[10px] text-[#ffcf38] font-bold">INVENTORY 05</span>
                <h4 className="text-base font-bold text-white font-serif">Arla Recipe Key Lead Magnet</h4>
                <p className="text-xs text-white/60">Digital reward unlocking the 5-Recipe Pack with food safety and storage guidelines (Keep ≤ 8°C).</p>
              </div>

              <div className="bg-black border border-white/20 p-5 space-y-2">
                <span className="text-[10px] text-[#25D366] font-bold">INVENTORY 06</span>
                <h4 className="text-base font-bold text-white font-serif">Presents Experience Feature</h4>
                <p className="text-xs text-white/60">Placed into Promorang Presents editorial programming under "Featured Sampling".</p>
              </div>

            </div>

          </div>
        </section>
      )}

      {/* 7. TAB 4: COMMERCIAL ROI & VALUE RECEIPT */}
      {activeTab === 'roi' && (
        <section className="px-4 sm:px-8 py-16 bg-[#161412] border-b-2 border-black">
          <div className="max-w-4xl mx-auto space-y-8 font-mono">
            
            <div className="text-center space-y-2">
              <p className="text-xs font-black uppercase text-[#ffcf38] tracking-widest">
                BUSINESS OUTCOMES
              </p>
              <h2 className="font-serif text-4xl sm:text-5xl font-black text-white">
                What Arla gets at the end of the pilot
              </h2>
            </div>

            <div className="bg-[#181512] border-2 border-white/20 p-6 sm:p-8 space-y-6 shadow-[10px_10px_0_#000]">
              
              <div className="flex justify-between items-center border-b border-white/20 pb-3 font-bold text-white text-xs">
                <span>{t("arlaPitch.deliverable")}</span>
                <span>{t("arlaPitch.value")}</span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <strong className="text-white block">1. Verified Shopper Audience List</strong>
                    <span className="text-white/60 text-[11px]">List of local Kingston cooks who tried the product and unlocked recipes.</span>
                  </div>
                  <span className="text-[#25D366] font-bold shrink-0">High-intent retargeting</span>
                </div>

                <div className="flex justify-between items-start gap-4">
                  <div>
                    <strong className="text-white block">2. Taste-Off Preference Analytics</strong>
                    <span className="text-white/60 text-[11px]">Data on whether Jamaicans view Arla primarily for pasta/cooking or desserts/baking.</span>
                  </div>
                  <span className="text-[#ffcf38] font-bold shrink-0">Product positioning data</span>
                </div>

                <div className="flex justify-between items-start gap-4">
                  <div>
                    <strong className="text-white block">3. Price Elasticity Benchmark</strong>
                    <span className="text-white/60 text-[11px]">Report on perceived fair price vs actual retail adoption at ~J$1,200.</span>
                  </div>
                  <span className="text-white font-bold shrink-0">Pricing intelligence</span>
                </div>

                <div className="flex justify-between items-start gap-4">
                  <div>
                    <strong className="text-white block">4. Attributed Roadshow Conversion</strong>
                    <span className="text-white/60 text-[11px]">Promoter-confirmed sales count and repeat intent tracking.</span>
                  </div>
                  <span className="text-[#25D366] font-bold shrink-0">Verified ROI</span>
                </div>
              </div>

              <div className="p-4 bg-black border border-white/20 text-xs text-white/70 space-y-2">
                <p className="font-bold text-white">Pilot Conclusion & Next Step:</p>
                <p>Arla receives a comprehensive <strong>Activation Value Receipt</strong> summarizing engagement, taste preferences, and recommendations for retail expansion into Hi-Lo, MegaMart, and Loshusan.</p>
              </div>

            </div>

          </div>
        </section>
      )}

      {/* 8. FOOTER / CALL TO ACTION */}
      <footer className="px-4 sm:px-8 py-16 bg-black text-center font-mono space-y-6 border-t-2 border-black">
        <div className="max-w-2xl mx-auto space-y-2">
          <p className="text-xs text-[#ff5a1f] font-black uppercase tracking-widest">NEXT STEPS FOR ARLA LEADERSHIP</p>
          <h3 className="font-serif text-3xl sm:text-4xl font-black text-white">Ready to review the live pilot?</h3>
          <p className="text-xs text-white/60">The consumer experience is active right now for PriceSmart shoppers.</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/campaigns/arla-whip-and-cook"
            className="px-6 py-3 bg-[#ff5a1f] text-black font-black uppercase text-xs tracking-wider border border-black shadow-[4px_4px_0_#ffcf38]"
          >
            {t("arlaPitch.openHub")} →
          </Link>
        </div>
      </footer>
    </main>
  );
}
