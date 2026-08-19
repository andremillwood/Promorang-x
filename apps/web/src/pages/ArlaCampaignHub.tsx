import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  MapPin,
  Calendar,
  Gift,
  Share2,
  BookOpen,
  ShoppingBag,
  ExternalLink,
  ChefHat,
  Vote,
  Users,
  Copy,
  TrendingUp,
  ShieldCheck,
  Zap,
  Info,
  Clock,
  Flame,
  Snowflake,
  Coffee,
  Check,
  ChevronRight,
  Navigation,
  Lock,
  Unlock,
  Award,
  Heart,
  Store,
  Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArlaRecipePackModal } from '@/components/arla/ArlaRecipePackModal';
import { getSiteUrl } from '@/lib/discovery';

type CulinaryMode = 'cook' | 'whip' | 'drink';

export default function ArlaCampaignHub() {
  // Active culinary showcase mode
  const [activeMode, setActiveMode] = useState<CulinaryMode>('cook');

  // State for Taste-Off voting
  const [tasteOffVote, setTasteOffVote] = useState<'pasta' | 'mousse' | null>(null);
  const [pastaVotes, setPastaVotes] = useState(148);
  const [mousseVotes, setMousseVotes] = useState(132);

  // State for Price expectation poll
  const [priceVote, setPriceVote] = useState<string | null>(null);
  const [showPriceReveal, setShowPriceReveal] = useState(false);

  // State for Usage intent poll
  const [intentVote, setIntentVote] = useState<string | null>(null);

  // State for Purchase intent
  const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null);

  // State for Recipe Pack Modal
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);

  // Actions completed tracker for Recipe Key unlock (unlocks at 2)
  const completedActions = [
    { id: 'tasteoff', label: 'Vote in the Taste-Off', done: !!tasteOffVote },
    { id: 'mode', label: 'Explore Culinary Modes', done: activeMode !== 'cook' || !!tasteOffVote },
    { id: 'price', label: 'Guess Price Expectation', done: !!priceVote },
    { id: 'intent', label: 'Log Usage Intent', done: !!intentVote },
    { id: 'purchase', label: 'Log Purchase Interest', done: !!purchaseStatus }
  ];

  const completedCount = completedActions.filter((a) => a.done).length;
  const isKeyUnlocked = completedCount >= 2;

  const totalVotes = pastaVotes + mousseVotes;
  const pastaPct = Math.round((pastaVotes / totalVotes) * 100);
  const moussePct = 100 - pastaPct;

  const handleTasteOffVote = (choice: 'pasta' | 'mousse') => {
    if (tasteOffVote) return;
    setTasteOffVote(choice);
    if (choice === 'pasta') {
      setPastaVotes((v) => v + 1);
      toast.success('Vote recorded for Team Rasta Pasta! 🍝 (+50 PromoPoints)');
    } else {
      setMousseVotes((v) => v + 1);
      toast.success('Vote recorded for Team Chocolate Chip Mousse! 🍫 (+50 PromoPoints)');
    }
  };

  const handlePriceSelect = (range: string) => {
    setPriceVote(range);
    setShowPriceReveal(true);
    toast.success('Valuation recorded! Roadshow price unlocked (+30 PromoPoints)');
  };

  const handleIntentSelect = (intent: string) => {
    setIntentVote(intent);
    toast.success('Usage intent recorded (+30 PromoPoints)');
    if (intent === 'recipes') {
      setRecipeModalOpen(true);
    } else if (intent === 'try') {
      document.getElementById('roadshow-moment')?.scrollIntoView({ behavior: 'smooth' });
    } else if (intent === 'price') {
      document.getElementById('roadshow-pricing')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/campaigns/arla-whip-and-cook?utm_source=promorang_share&utm_medium=referral&utm_campaign=arla_pricesmart`;
    navigator.clipboard.writeText(url);
    toast.success('Campaign referral link copied to clipboard!');
  };

  const shareWhatsApp = () => {
    const text = `Taste Rasta Pasta vs Chocolate Chip Mousse at PriceSmart Jamaica! Vote in the Arla Whip & Cook Taste-Off and unlock the 5-Recipe Pack: ${window.location.origin}/campaigns/arla-whip-and-cook`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-[#08080a] text-white selection:bg-[#8A1538] selection:text-white pb-36 font-sans relative overflow-x-hidden">
      <SEO
        title="Arla Pro Whip & Cook @ PriceSmart Jamaica — Taste It. Whip It. Cook It."
        description="Experience Arla Pro Whip & Cook 28% live at PriceSmart Jamaica (Red Hills Road). Vote in the Rasta Pasta vs Chocolate Chip Mousse Taste-Off, unlock 5 Recipes, and get 1L cartons for J$1,200."
        image="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200"
        url={getSiteUrl("/campaigns/arla-whip-and-cook")}
      />

      {/* Atmospheric Background Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-[#8A1538]/15 rounded-full blur-[140px]" />
        <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-[#008543]/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px]" />
      </div>

      {/* TOP NOTIFICATION RIBBON */}
      <aside aria-label="Roadshow Notice" className="relative z-20 bg-gradient-to-r from-[#8A1538] via-[#5A0C22] to-[#005826] text-white text-xs py-2.5 px-4 border-b border-white/10 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold tracking-wide">
              PriceSmart Jamaica Roadshow Active Today (10:00 AM – 8:00 PM) · 111 Red Hills Road
            </span>
          </div>
          <Link
            to="/proposals/arla-pro"
            className="inline-flex items-center gap-1 font-black text-amber-300 hover:text-white transition uppercase text-[10px] tracking-wider"
          >
            <span>Brand Deck & Proposal</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </aside>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-12 pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header Pill & Tags */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/15 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[#8A1538]" />
                <span className="text-[11px] font-black tracking-wider uppercase text-white/90">
                  Arla Pro Jamaica Roadshow
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                <Store className="h-3 w-3" />
                <span>PriceSmart Red Hills Road</span>
              </div>
            </div>

            {/* Quick RSVP link */}
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-bold"
            >
              <Link to="/moments/00000000-0000-0000-0002-000000000060">
                View PriceSmart Moment <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {/* Main Title & Hero Grid */}
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            
            {/* Left Hero Content */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight text-white leading-[1.02]">
                  WHIP OR COOK?
                </h1>
                <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-300 via-rose-300 to-emerald-300 bg-clip-text text-transparent">
                  One Product. Two Samples. Endless Possibilities.
                </p>
                <p className="text-sm sm:text-base text-white/70 max-w-xl leading-relaxed">
                  Arla Pro Whip & Cook 28% is live at PriceSmart Jamaica. Engineered for hot savoury reductions, firm dessert peaks, and rich blended drinks.
                </p>
              </div>

              {/* Price Callout Badge Banner */}
              <div className="rounded-2xl border border-white/15 bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent p-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                    PriceSmart Roadshow Offer
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400">Approx. J$1,200</span>
                    <span className="text-xs text-white/40 line-through">Reg: ~J$2,700</span>
                    <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                      56% Savings
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => document.getElementById('taste-off-arena')?.scrollIntoView({ behavior: 'smooth' })}
                  className="rounded-xl bg-gradient-to-r from-[#8A1538] to-[#008543] hover:opacity-95 text-white font-black text-xs px-5 py-3 shadow-lg shadow-[#8A1538]/25"
                >
                  <Vote className="mr-2 h-4 w-4" /> Vote in Taste-Off
                </Button>
              </div>

              {/* 3-Way Mode Switcher Tabs */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">
                  Select a Culinary Mode to Explore
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cook', label: 'Cook It', icon: Flame, color: 'border-orange-500/50 text-orange-400', tag: 'Hot & Savoury' },
                    { id: 'whip', label: 'Whip It', icon: Snowflake, color: 'border-emerald-500/50 text-emerald-400', tag: 'Cold & Sweet' },
                    { id: 'drink', label: 'Drink It', icon: Coffee, color: 'border-purple-500/50 text-purple-300', tag: 'Bonus Punch' },
                  ].map((mode) => {
                    const Icon = mode.icon;
                    const isSelected = activeMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => setActiveMode(mode.id as CulinaryMode)}
                        className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                          isSelected
                            ? 'border-white/30 bg-white/10 ring-2 ring-primary shadow-lg'
                            : 'border-white/10 bg-white/[0.02] hover:bg-white/5 text-white/60'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-white/40'}`} />
                          <span className="font-black text-xs text-white">{mode.label}</span>
                        </div>
                        <p className="text-[10px] text-white/50">{mode.tag}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Hero Interactive 3D Showcase Card */}
            <div className="relative">
              <div className="relative rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.08] to-black/60 p-6 backdrop-blur-xl shadow-2xl overflow-hidden space-y-5">
                
                {/* Dynamic Image Display Based on Active Mode */}
                <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-black relative border border-white/10 group">
                  <img
                    src={
                      activeMode === 'cook'
                        ? 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&q=80&w=800'
                        : activeMode === 'whip'
                        ? 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800'
                        : 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&q=80&w=800'
                    }
                    alt="Arla Application"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-4">
                    <div>
                      <Badge className="bg-black/60 border-white/20 text-white font-bold text-[10px] uppercase mb-1">
                        {activeMode === 'cook' ? '🍝 Rasta Pasta Hero' : activeMode === 'whip' ? '🍫 Chocolate Mousse Hero' : '🥤 Strong Back Drop'}
                      </Badge>
                      <p className="text-sm font-bold text-white">
                        {activeMode === 'cook'
                          ? 'Silky, Heat-Stable Savoury Sauce'
                          : activeMode === 'whip'
                          ? '3.5× Volume Expansion, Firm Peaks'
                          : 'Rich Creamy Punch with Real Stout'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Performance Attributes Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-[10px] uppercase text-white/40 font-bold block">Fat Content</span>
                    <strong className="text-white font-black">28% Dairy Fat</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-[10px] uppercase text-white/40 font-bold block">Stability</span>
                    <strong className="text-emerald-400 font-black">High Heat & Acid</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-[10px] uppercase text-white/40 font-bold block">Storage Rule</span>
                    <strong className="text-white font-black">Keep ≤ 8°C</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-[10px] uppercase text-white/40 font-bold block">Open Life</span>
                    <strong className="text-amber-400 font-black">Use in ~3 Days</strong>
                  </div>
                </div>

                {/* Recipe unlock trigger */}
                <Button
                  onClick={() => setRecipeModalOpen(true)}
                  className="w-full rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-bold py-3"
                >
                  <BookOpen className="mr-2 h-4 w-4 text-amber-400" />
                  View 5 Concept Recipes in Pack
                </Button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 1: THE LIVE TASTE-OFF VERSUS ARENA */}
      <section id="taste-off-arena" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 my-8">
        <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#140c10] via-[#101014] to-[#0a120c] p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-8">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8A1538]/30 border border-[#8A1538]/50 text-rose-300 text-[10px] font-black uppercase tracking-wider">
                <Vote className="h-3 w-3" />
                <span>Live Roadshow Taste-Off Battle</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-serif font-black text-white">
                Rasta Pasta vs Chocolate Chip Mousse
              </h2>
              <p className="text-xs sm:text-sm text-white/60 max-w-xl">
                Taste both samples at PriceSmart. Cast your vote right now. Real-time aggregated votes shape the live leaderboard.
              </p>
            </div>

            {/* Total Votes Count */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-right shrink-0">
              <span className="text-3xl font-black text-white">{totalVotes}</span>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Verified Votes</p>
            </div>
          </div>

          {/* Versus Duel Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Contender 1: Rasta Pasta */}
            <div
              className={`rounded-3xl border p-6 flex flex-col justify-between transition-all relative overflow-hidden ${
                tasteOffVote === 'pasta'
                  ? 'border-orange-500 bg-orange-500/10 ring-2 ring-orange-500 shadow-xl shadow-orange-500/10'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[10px] font-black uppercase">
                    Cook Application (Hot/Savoury)
                  </Badge>
                  {tasteOffVote === 'pasta' && (
                    <span className="text-xs font-black text-orange-400 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> Your Winner
                    </span>
                  )}
                </div>

                <div className="rounded-2xl overflow-hidden aspect-video border border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&q=80&w=800"
                    alt="Rasta Pasta"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="text-2xl font-serif font-black text-white flex items-center gap-2">
                    🍝 Team Rasta Pasta
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed mt-1">
                    Hot penne coated in a velvety Scotch bonnet, scallion, and bell pepper reduction. Demonstrates Arla Whip & Cook’s exceptional heat and acid stability without curdling.
                  </p>
                </div>
              </div>

              {/* Progress & Vote Action */}
              <div className="mt-6 space-y-4">
                {tasteOffVote && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-orange-400">{pastaPct}%</span>
                      <span className="text-white/50">{pastaVotes} votes</span>
                    </div>
                    <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${pastaPct}%` }}
                      />
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => handleTasteOffVote('pasta')}
                  disabled={!!tasteOffVote}
                  className={`w-full font-black text-xs py-3.5 rounded-2xl transition ${
                    tasteOffVote === 'pasta'
                      ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                      : 'bg-white/10 hover:bg-orange-500 hover:text-black text-white'
                  }`}
                >
                  {tasteOffVote === 'pasta' ? '✓ Voted Team Rasta Pasta' : 'Vote for Rasta Pasta (+50 Pts)'}
                </Button>
              </div>
            </div>

            {/* Contender 2: Chocolate Chip Mousse */}
            <div
              className={`rounded-3xl border p-6 flex flex-col justify-between transition-all relative overflow-hidden ${
                tasteOffVote === 'mousse'
                  ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500 shadow-xl shadow-emerald-500/10'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] font-black uppercase">
                    Whip Application (Cold/Dessert)
                  </Badge>
                  {tasteOffVote === 'mousse' && (
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> Your Winner
                    </span>
                  )}
                </div>

                <div className="rounded-2xl overflow-hidden aspect-video border border-white/10">
                  <img
                    src="https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800"
                    alt="Chocolate Chip Mousse"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="text-2xl font-serif font-black text-white flex items-center gap-2">
                    🍫 Team Chocolate Chip Mousse
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed mt-1">
                    Airy, firm peak structure whipped with 3.5× volume expansion. Clean, mild dairy flavour lets rich dark cocoa and chocolate chips take center stage.
                  </p>
                </div>
              </div>

              {/* Progress & Vote Action */}
              <div className="mt-6 space-y-4">
                {tasteOffVote && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-emerald-400">{moussePct}%</span>
                      <span className="text-white/50">{mousseVotes} votes</span>
                    </div>
                    <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                        style={{ width: `${moussePct}%` }}
                      />
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => handleTasteOffVote('mousse')}
                  disabled={!!tasteOffVote}
                  className={`w-full font-black text-xs py-3.5 rounded-2xl transition ${
                    tasteOffVote === 'mousse'
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                      : 'bg-white/10 hover:bg-emerald-500 hover:text-black text-white'
                  }`}
                >
                  {tasteOffVote === 'mousse' ? '✓ Voted Team Mousse' : 'Vote for Chocolate Chip Mousse (+50 Pts)'}
                </Button>
              </div>
            </div>

          </div>

          {/* Social Share & Referral Loop */}
          {tasteOffVote && (
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-white/80">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>
                  <strong>{pastaVotes > mousseVotes ? 'Rasta Pasta' : 'Chocolate Chip Mousse'}</strong> is leading the Taste-Off! Share your vote with friends:
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={shareWhatsApp} className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
                  <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share to WhatsApp
                </Button>
                <Button size="sm" variant="outline" onClick={copyShareLink} className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 text-xs">
                  <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Link
                </Button>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* SECTION 2: INTERACTIVE DISCOVERY & PRICE REVEAL */}
      <section id="roadshow-pricing" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 my-10">
        <div className="grid gap-6 md:grid-cols-3">
          
          {/* Card 1: Product Mode Preference */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-5 flex flex-col justify-between backdrop-blur-md">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary">Poll · Product Mode</span>
              <h3 className="text-xl font-bold text-white leading-snug">
                Whip It, Cook It, or Drink It?
              </h3>
              <p className="text-xs text-white/60">If we gave you one carton right now, what happens first?</p>
            </div>

            <div className="space-y-2">
              {[
                { id: 'cook', label: '🍳 Cook It (Alfredo, creamy chicken, seafood pasta)' },
                { id: 'whip', label: '🍰 Whip It (Mousse, cheesecake, toppings)' },
                { id: 'drink', label: '🥤 Drink It (Strong Back punch, specialty coffee)' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setActiveMode(opt.id as CulinaryMode);
                    toast.success('Mode preference saved! (+30 Pts)');
                  }}
                  className={`w-full text-left p-3 rounded-2xl border text-xs font-semibold transition ${
                    activeMode === opt.id
                      ? 'border-primary bg-primary/20 text-white shadow-md'
                      : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-emerald-400 font-bold flex items-center">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Active mode: {activeMode.toUpperCase()}
            </p>
          </div>

          {/* Card 2: Price Perception (Asked before reveal) */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-5 flex flex-col justify-between backdrop-blur-md">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Discovery · Valuation</span>
              <h3 className="text-xl font-bold text-white leading-snug">
                What would you expect to pay for 1L dual cream?
              </h3>
              <p className="text-xs text-white/60">Benchmark perceived value against activation pricing.</p>
            </div>

            {!showPriceReveal ? (
              <div className="space-y-1.5">
                {[
                  'Under J$1,000',
                  'J$1,000 – J$1,499',
                  'J$1,500 – J$1,999',
                  'J$2,000 – J$2,499',
                  'J$2,500+'
                ].map((range) => (
                  <button
                    key={range}
                    onClick={() => handlePriceSelect(range)}
                    className="w-full text-left p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80 transition"
                  >
                    {range}
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2 animate-in fade-in duration-200">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Special Offer Unlocked</span>
                <p className="text-2xl font-black text-white">Approx. J$1,200</p>
                <p className="text-xs text-white/70 leading-relaxed">
                  We've been advised the usual regular price is approx. <strong>J$2,700</strong> (56% difference). Available during the PriceSmart roadshow.
                </p>
              </div>
            )}
          </div>

          {/* Card 3: Usage Intent & Personalization */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-5 flex flex-col justify-between backdrop-blur-md">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">Discovery · Intent</span>
              <h3 className="text-xl font-bold text-white leading-snug">
                What would make you most likely to buy?
              </h3>
              <p className="text-xs text-white/60">Connects directly to matching Promorang inventory.</p>
            </div>

            <div className="space-y-2">
              {[
                { id: 'try', label: '🥄 Trying it first (Sample at PriceSmart)' },
                { id: 'recipes', label: '📖 Seeing recipes (Unlock 5-Recipe Pack)' },
                { id: 'price', label: '🏷️ The J$1,200 roadshow price' },
                { id: 'dual', label: '✨ Dual cooking + whipping utility' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleIntentSelect(item.id)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold transition ${
                    intentVote === item.id
                      ? 'border-rose-500 bg-rose-500/20 text-white'
                      : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {intentVote && (
              <p className="text-[11px] text-rose-400 font-bold flex items-center">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Smart recommendation applied!
              </p>
            )}
          </div>

        </div>
      </section>

      {/* SECTION 3: LEAD MAGNET / 5 WAYS TO WHIP & COOK DIGITAL COOKBOOK */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 my-12">
        <div className="rounded-3xl border border-white/15 bg-gradient-to-r from-[#8A1538]/25 via-[#141417] to-[#008543]/25 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-center">
            
            {/* Left Description & Unlock Tracker */}
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-black text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md">
                  Digital Product Lead Magnet
                </span>
                <span className="text-xs text-white/60">Arla Recipe Key Reward</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-serif font-black text-white">
                5 Ways to Whip & Cook with Arla
              </h2>
              
              <p className="text-sm text-white/70 leading-relaxed max-w-xl">
                A digital culinary guide featuring 5 concept recipes tailored for Jamaican kitchens: <strong>Roadshow Rasta Pasta</strong>, <strong>Chocolate Chip Mousse</strong>, <strong>Garlic Pan Chicken</strong>, <strong>Strawberry Cheesecake Cups</strong>, and <strong>Jamaican Strong Back Punch</strong>.
              </p>

              {/* Unlock Requirement Tracker */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 max-w-md">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-white flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>Arla Recipe Key Progress</span>
                  </span>
                  <span className={isKeyUnlocked ? 'text-emerald-400' : 'text-amber-400'}>
                    {Math.min(completedCount, 2)} / 2 Actions Completed
                  </span>
                </div>

                <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300 rounded-full"
                    style={{ width: `${Math.min((completedCount / 2) * 100, 100)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  {completedActions.slice(0, 4).map((action) => (
                    <div key={action.id} className="flex items-center gap-1.5 text-white/60">
                      {action.done ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <span className="h-3.5 w-3.5 rounded-full border border-white/20 shrink-0" />
                      )}
                      <span className={action.done ? 'text-white font-medium' : ''}>{action.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => setRecipeModalOpen(true)}
                  className={`rounded-2xl font-black text-xs px-8 py-3.5 transition shadow-lg ${
                    isKeyUnlocked
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                      : 'bg-primary hover:bg-orange-500 text-black shadow-primary/20'
                  }`}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  {isKeyUnlocked ? 'Open Unlocked Recipe Pack (5 Recipes)' : 'Preview 5-Recipe Pack'}
                </Button>

                <Button
                  variant="outline"
                  onClick={copyShareLink}
                  className="rounded-2xl border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs px-6 py-3.5"
                >
                  <Share2 className="mr-2 h-4 w-4" /> Share with Foodies
                </Button>
              </div>
            </div>

            {/* Right Interactive Recipe Book Card Preview */}
            <div
              className="rounded-3xl border border-white/15 bg-black/60 p-5 space-y-4 backdrop-blur-md cursor-pointer group"
              onClick={() => setRecipeModalOpen(true)}
            >
              <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-black relative">
                <img
                  src="https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800"
                  alt="Recipe Cookbook Preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end p-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-400 block">5 Concept Recipes</span>
                    <p className="text-base font-bold text-white">5 Ways to Whip & Cook with Arla</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-white/70">
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span>1. Roadshow Rasta Pasta</span>
                  <span className="text-orange-400 font-bold">Cook</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span>2. Chocolate Chip Mousse</span>
                  <span className="text-emerald-400 font-bold">Whip</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span>3. Creamy Garlic Pan Chicken</span>
                  <span className="text-orange-400 font-bold">Cook</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span>4. Strawberry Cheesecake Cups</span>
                  <span className="text-emerald-400 font-bold">Whip</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>5. Jamaican Strong Back Punch</span>
                  <span className="text-purple-300 font-bold">Drink</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4: PRICESMART ROADSHOW LOCATION & MISSIONS */}
      <section id="roadshow-moment" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 my-12">
        <div className="rounded-3xl border border-white/15 bg-white/[0.02] p-6 sm:p-10 space-y-8 backdrop-blur-md">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-[#8A1538] text-white font-bold text-xs uppercase px-3 py-0.5">
                  PriceSmart Jamaica
                </Badge>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-xs">
                  ● Sampling Active Daily (10:00 AM – 8:00 PM)
                </Badge>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-white">
                Arla Whip & Cook @ PriceSmart
              </h2>
              <p className="text-xs sm:text-sm text-white/60 flex flex-wrap items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>111 Red Hills Road, Kingston 19, Jamaica</span>
                <span>•</span>
                <Clock className="h-4 w-4 text-primary" />
                <span>Daily 10:00 AM – 8:00 PM</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button asChild className="rounded-2xl bg-primary hover:bg-orange-500 text-black font-black px-6 py-2.5">
                <Link to="/moments/00000000-0000-0000-0002-000000000060">
                  Open Roadshow Moment <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* 5 Submoments / Missions Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-primary" />
                <span>Active Submoments & Onsite Missions (5)</span>
              </h3>
              <span className="text-xs font-semibold text-white/40">Earn points & keys on site</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              
              <div className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-orange-400">Submoment A · Savoury</span>
                  <span className="text-xs font-bold text-purple-300">+40 pts</span>
                </div>
                <h4 className="text-sm font-bold text-white">Taste the Rasta Pasta</h4>
                <p className="text-xs text-white/60">Sample the hot jerk cream pasta and rate whether you'd cook it at home.</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-emerald-400">Submoment B · Dessert</span>
                  <span className="text-xs font-bold text-purple-300">+40 pts</span>
                </div>
                <h4 className="text-sm font-bold text-white">Taste Chocolate Chip Mousse</h4>
                <p className="text-xs text-white/60">Sample the whipped cold mousse and test dual-use cream versatility.</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-rose-400">Submoment C · Voting</span>
                  <span className="text-xs font-bold text-amber-300">PromoKey</span>
                </div>
                <h4 className="text-sm font-bold text-white">Pick Your Winner</h4>
                <p className="text-xs text-white/60">Vote in the official Taste-Off and share live results with friends.</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-amber-400">Submoment D · Retail</span>
                  <span className="text-xs font-bold text-purple-300">+60 pts</span>
                </div>
                <h4 className="text-sm font-bold text-white">Get Arla for J$1,200</h4>
                <p className="text-xs text-white/60">Special J$1,200 roadshow price. On-ground brand promoters can confirm your purchase.</p>
              </div>

              <div className="rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/[0.05] p-5 space-y-2 sm:col-span-2 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-amber-400">Submoment E · Surprise Drop</span>
                  <span className="text-xs font-bold text-amber-300">Bonus Perk</span>
                </div>
                <h4 className="text-sm font-bold text-white">Did You Catch the Strong Back? (Conditional Bonus)</h4>
                <p className="text-xs text-white/60">Surprise Jamaican Strong Back Punch drop with Arla cream (unconfirmed schedule, subject to daily drop announcements).</p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* FLOATING ACTION DOCK */}
      <div className="fixed bottom-6 inset-x-0 z-40 max-w-lg mx-auto px-4 pointer-events-none">
        <div className="rounded-full border border-white/20 bg-black/85 backdrop-blur-xl p-2 shadow-2xl flex items-center justify-between gap-2 pointer-events-auto ring-1 ring-white/10">
          <button
            onClick={() => document.getElementById('taste-off-arena')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-1 py-2 px-3 rounded-full bg-gradient-to-r from-[#8A1538] to-[#008543] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md"
          >
            <Vote className="h-3.5 w-3.5" />
            <span>Taste-Off</span>
          </button>

          <button
            onClick={() => setRecipeModalOpen(true)}
            className="flex-1 py-2 px-3 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <BookOpen className="h-3.5 w-3.5 text-amber-400" />
            <span>5 Recipes</span>
          </button>

          <Link
            to="/moments/00000000-0000-0000-0002-000000000060"
            className="p-2 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center justify-center"
            title="PriceSmart Location"
          >
            <MapPin className="h-4 w-4 text-primary" />
          </Link>

          <Link
            to="/proposals/arla-pro"
            className="p-2 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center justify-center"
            title="Commercial Proposal"
          >
            <Compass className="h-4 w-4 text-amber-300" />
          </Link>
        </div>
      </div>

      {/* Recipe Pack Modal */}
      <ArlaRecipePackModal
        isOpen={recipeModalOpen}
        onClose={() => setRecipeModalOpen(false)}
        unlocked={isKeyUnlocked}
      />
    </main>
  );
}
