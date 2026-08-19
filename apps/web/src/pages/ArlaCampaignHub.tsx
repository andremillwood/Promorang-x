import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import {
  ArrowRight,
  Check,
  ChevronRight,
  Sparkles,
  MapPin,
  Clock,
  Vote,
  BookOpen,
  Share2,
  Copy,
  ChefHat,
  Flame,
  Snowflake,
  Coffee,
  Ticket,
  Percent,
  CheckCircle2,
  ExternalLink,
  Store,
  Compass,
  Zap,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { ArlaRecipePackModal } from '@/components/arla/ArlaRecipePackModal';
import { getSiteUrl } from '@/lib/discovery';

type CulinaryMode = 'cook' | 'whip' | 'drink';

export default function ArlaCampaignHub() {
  const [activeMode, setActiveMode] = useState<CulinaryMode>('cook');
  const [tasteOffVote, setTasteOffVote] = useState<'pasta' | 'mousse' | null>(null);
  const [pastaVotes, setPastaVotes] = useState(156);
  const [mousseVotes, setMousseVotes] = useState(142);
  const [priceVote, setPriceVote] = useState<string | null>(null);
  const [showPriceReveal, setShowPriceReveal] = useState(false);
  const [intentVote, setIntentVote] = useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null);
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);

  const completedActions = [
    { id: 'tasteoff', label: 'Taste-Off Vote Cast', done: !!tasteOffVote },
    { id: 'mode', label: 'Culinary Mode Tested', done: activeMode !== 'cook' || !!tasteOffVote },
    { id: 'price', label: 'Valuation Logged', done: !!priceVote },
    { id: 'intent', label: 'Usage Preference Set', done: !!intentVote }
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
      toast.success('PASSPORT STAMPED: Team Rasta Pasta! 🍝 (+50 Proof Points)');
    } else {
      setMousseVotes((v) => v + 1);
      toast.success('PASSPORT STAMPED: Team Chocolate Chip Mousse! 🍫 (+50 Proof Points)');
    }
  };

  const handlePriceSelect = (range: string) => {
    setPriceVote(range);
    setShowPriceReveal(true);
    toast.success('Perception logged! Roadshow Price Slip revealed (+30 Proof Points)');
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/campaigns/arla-whip-and-cook?utm_source=promorang&utm_medium=tasteoff_share&utm_campaign=arla_pricesmart`;
    navigator.clipboard.writeText(url);
    toast.success('Taste-Off Invitation Link copied to clipboard!');
  };

  const shareWhatsApp = () => {
    const text = `🍝 vs 🍫: Taste Rasta Pasta vs Chocolate Chip Mousse at PriceSmart Jamaica! Vote in the Arla Whip & Cook Taste-Off: ${window.location.origin}/campaigns/arla-whip-and-cook`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-[#11100e] text-[#f4efe5] selection:bg-[#ff5a1f] selection:text-white font-sans pb-32">
      <SEO
        title="PROMORANG × ARLA PRO — The PriceSmart Roadshow Taste-Off"
        description="One product. Hot, cold and everything between. Experience Arla Pro Whip & Cook 28% live at PriceSmart Jamaica (111 Red Hills Road). Vote in the Taste-Off, unlock 5 Recipes, and get 1L cartons for J$1,200."
        image="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200"
        url={getSiteUrl("/campaigns/arla-whip-and-cook")}
      />

      {/* 1. TOP TICKER / LIVE STATUS BANNER */}
      <div className="bg-[#ff5a1f] text-black font-mono font-black text-xs uppercase tracking-widest py-2.5 px-4 border-b-2 border-black flex items-center justify-between overflow-x-auto gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <span className="h-2.5 w-2.5 bg-black rounded-full animate-ping" />
          <span>PRICESMART JAMAICA ROADSHOW · 111 RED HILLS ROAD · DAILY 10:00 AM – 8:00 PM</span>
        </div>
        <div className="flex items-center gap-4 shrink-0 font-bold">
          <span>ROADSHOW PRICE: ~J$1,200 (56% SAVINGS)</span>
          <Link to="/proposals/arla-pro" className="bg-black text-white px-2.5 py-0.5 hover:bg-[#11100e] transition text-[10px]">
            ARLA BRAND PROPOSAL →
          </Link>
        </div>
      </div>

      {/* 2. HERO SECTION — EDITORIAL BRUTALIST GRID */}
      <section className="relative border-b-2 border-black/40 bg-gradient-to-b from-[#181512] to-[#11100e] px-4 sm:px-8 pt-12 pb-16">
        <div className="max-w-7xl mx-auto grid gap-12 lg:grid-cols-[1.25fr_0.75fr] items-center">
          
          {/* Left Column: Hero Manifesto */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-[#ff5a1f]">
              <span>PROMORANG PRESENTS</span>
              <span className="text-white/40">/</span>
              <span>ARLA PRO ROADSHOW</span>
              <span className="text-white/40">/</span>
              <span className="text-[#ffcf38]">KINGSTON 19</span>
            </div>

            <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.88] text-white">
              WHIP <i className="text-[#ff5a1f] not-italic">&</i> COOK.
            </h1>

            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#ffcf38] leading-tight">
              One cream. Two samples. Pick your side.
            </p>

            <p className="text-sm sm:text-base text-[#d0c5b9] leading-relaxed max-w-xl">
              Arla Pro Whip & Cook 28% has landed at <strong>PriceSmart (111 Red Hills Road)</strong>. An ultra-stable European dairy formulation built for high-heat savoury cooking, fluffy dessert whipping, and Jamaican cream punches.
            </p>

            {/* Tactile Mode Pill Selector */}
            <div className="pt-2 space-y-3">
              <span className="font-mono text-[10px] uppercase font-black tracking-widest text-[#898071] block">
                [ EXPLORE DUAL-PURPOSE UTILITY ]
              </span>
              <div className="grid grid-cols-3 gap-2.5 max-w-lg">
                {[
                  { id: 'cook', label: '01 / COOK IT', sub: 'Hot / Savoury', icon: Flame },
                  { id: 'whip', label: '02 / WHIP IT', sub: 'Cold / Dessert', icon: Snowflake },
                  { id: 'drink', label: '03 / DRINK IT', sub: 'Bonus Drop', icon: Coffee }
                ].map((mode) => {
                  const isSel = activeMode === mode.id;
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setActiveMode(mode.id as CulinaryMode)}
                      className={`p-3 text-left border-2 transition-all cursor-pointer ${
                        isSel
                          ? 'border-[#ff5a1f] bg-[#ff5a1f] text-black shadow-[4px_4px_0_#ffcf38]'
                          : 'border-white/20 bg-white/5 text-[#d0c5b9] hover:border-white/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-black text-xs">{mode.label}</span>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <p className={`text-[10px] font-bold ${isSel ? 'text-black/80' : 'text-white/40'}`}>{mode.sub}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => document.getElementById('tasteoff-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-7 py-4 bg-[#ff5a1f] text-black font-black uppercase text-xs tracking-wider shadow-[6px_6px_0_#ffcf38] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_#ffcf38] transition cursor-pointer border-2 border-black"
              >
                ENTER THE TASTE-OFF VOTE ↓
              </button>

              <button
                onClick={() => setRecipeModalOpen(true)}
                className="px-6 py-4 bg-transparent text-[#f4efe5] font-black uppercase text-xs tracking-wider border-2 border-[#f4efe5]/40 hover:border-[#f4efe5] hover:bg-white/5 transition cursor-pointer"
              >
                5 RECIPES PACK ({isKeyUnlocked ? 'UNLOCKED' : 'PREVIEW'})
              </button>
            </div>
          </div>

          {/* Right Column: Physical Stamped Roadshow Ticket */}
          <div className="relative">
            <div className="bg-[#f4efe5] text-[#11100e] p-6 shadow-[14px_14px_0_#ff5a1f] border-2 border-black rotate-1 hover:rotate-0 transition-transform duration-300">
              
              {/* Ticket Top */}
              <div className="flex justify-between items-center font-mono text-[10px] font-black uppercase tracking-widest border-b-2 border-black pb-3">
                <span>TASTING PASS № 0823</span>
                <span className="bg-black text-white px-2 py-0.5">KINGSTON ROADSHOW</span>
              </div>

              {/* Ticket Image & Mode Preview */}
              <div className="my-4 relative border-2 border-black overflow-hidden aspect-[4/3] bg-black">
                <img
                  src={
                    activeMode === 'cook'
                      ? 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&q=80&w=800'
                      : activeMode === 'whip'
                      ? 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800'
                      : 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&q=80&w=800'
                  }
                  alt="Application View"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-[#ffcf38] text-black font-mono font-black text-[10px] uppercase px-2 py-0.5 border border-black">
                  {activeMode === 'cook' ? 'HERO 01: RASTA PASTA' : activeMode === 'whip' ? 'HERO 02: CHOCOLATE MOUSSE' : 'BONUS: STRONG BACK PUNCH'}
                </div>
              </div>

              {/* Ticket Center Stage */}
              <div className="text-center py-2 border-b-2 border-dashed border-[#898071]">
                <span className="font-mono text-[10px] font-black uppercase tracking-widest text-[#776e62]">PRICE SPECIAL</span>
                <strong className="block font-serif text-5xl font-black text-[#ff5a1f] leading-none my-1">
                  J$1,200
                </strong>
                <p className="font-mono text-[10px] text-[#776e62]">
                  Advised regular approx. J$2,700 (56% difference)
                </p>
              </div>

              {/* Ticket Meta Grid */}
              <div className="grid grid-cols-2 font-mono text-[10px] border-b-2 border-black my-3">
                <div className="py-2 pr-2 border-r-2 border-black">
                  <span className="text-[#776e62] block">VENUE</span>
                  <strong className="text-xs">PriceSmart KGN 19</strong>
                </div>
                <div className="py-2 pl-2">
                  <span className="text-[#776e62] block">HOURS</span>
                  <strong className="text-xs">10:00 AM – 8:00 PM</strong>
                </div>
              </div>

              {/* Ticket Perforation Footer */}
              <div className="flex items-center justify-between font-mono text-[10px] text-[#776e62] pt-1">
                <span>SHOW THIS DIGITAL PASS ON SITE</span>
                <span className="text-black font-bold">1L DUAL CREAM</span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. THE LIVE TASTE-OFF ARENA (SPORTS-STYLE SPLIT DUEL) */}
      <section id="tasteoff-section" className="px-4 sm:px-8 py-20 bg-[#161412] border-b-2 border-black">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#332e29] pb-6">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#ff5a1f]">
                OFFICIAL ROADSHOW ARENA
              </p>
              <h2 className="font-serif text-4xl sm:text-6xl font-black text-white mt-1">
                Rasta Pasta <i className="text-[#ffcf38] not-italic">vs</i> Chocolate Mousse
              </h2>
            </div>
            <div className="font-mono text-left md:text-right bg-black/60 border border-white/10 p-3 px-5">
              <span className="text-2xl font-black text-[#ffcf38]">{totalVotes}</span>
              <p className="text-[10px] font-bold text-white/40 uppercase">Verified Taste Votes</p>
            </div>
          </div>

          {/* Duel Matchup Arena */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Card 1: Team Rasta Pasta */}
            <div className={`p-6 border-2 transition-all flex flex-col justify-between ${
              tasteOffVote === 'pasta'
                ? 'border-[#ff5a1f] bg-[#ff5a1f]/10 shadow-[8px_8px_0_#ff5a1f]'
                : 'border-white/15 bg-black/40 hover:border-white/40'
            }`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center font-mono text-xs">
                  <span className="bg-[#ff5a1f] text-black font-black px-2.5 py-0.5">CONTENDER 01</span>
                  <span className="text-white/50">COOK APPLICATION</span>
                </div>

                <div className="border border-white/20 aspect-video overflow-hidden bg-black">
                  <img
                    src="https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&q=80&w=800"
                    alt="Rasta Pasta"
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="font-serif text-3xl font-black text-white">🍝 Team Rasta Pasta</h3>
                <p className="text-xs text-[#c0b5a8] leading-relaxed">
                  Hot penne with Scotch bonnet, scallions, and colourful bell peppers in a rich Arla Whip & Cook reduction. Simmer-stable up to high boiling heat without breaking.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                {tasteOffVote && (
                  <div className="font-mono text-xs space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-[#ff5a1f]">{pastaPct}% FAVORITE</span>
                      <span className="text-white/60">{pastaVotes} VOTES</span>
                    </div>
                    <div className="h-3 w-full bg-black border border-white/20">
                      <div className="h-full bg-[#ff5a1f]" style={{ width: `${pastaPct}%` }} />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleTasteOffVote('pasta')}
                  disabled={!!tasteOffVote}
                  className={`w-full py-4 font-mono font-black uppercase text-xs tracking-wider border-2 transition cursor-pointer ${
                    tasteOffVote === 'pasta'
                      ? 'bg-[#ff5a1f] text-black border-black shadow-[4px_4px_0_#ffcf38]'
                      : 'bg-white text-black border-black hover:bg-[#ff5a1f]'
                  }`}
                >
                  {tasteOffVote === 'pasta' ? '✓ YOUR WINNER STAMPED' : 'VOTE TEAM RASTA PASTA (+50 PTS)'}
                </button>
              </div>
            </div>

            {/* Card 2: Team Chocolate Chip Mousse */}
            <div className={`p-6 border-2 transition-all flex flex-col justify-between ${
              tasteOffVote === 'mousse'
                ? 'border-[#ffcf38] bg-[#ffcf38]/10 shadow-[8px_8px_0_#ffcf38]'
                : 'border-white/15 bg-black/40 hover:border-white/40'
            }`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center font-mono text-xs">
                  <span className="bg-[#ffcf38] text-black font-black px-2.5 py-0.5">CONTENDER 02</span>
                  <span className="text-white/50">WHIP APPLICATION</span>
                </div>

                <div className="border border-white/20 aspect-video overflow-hidden bg-black">
                  <img
                    src="https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800"
                    alt="Chocolate Chip Mousse"
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="font-serif text-3xl font-black text-white">🍫 Team Chocolate Mousse</h3>
                <p className="text-xs text-[#c0b5a8] leading-relaxed">
                  Chilled, airy dessert with firm peaks whipped from the exact same carton (3.5× expansion). Mild dairy profile lets cocoa and dark chocolate chips shine.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                {tasteOffVote && (
                  <div className="font-mono text-xs space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-[#ffcf38]">{moussePct}% FAVORITE</span>
                      <span className="text-white/60">{mousseVotes} VOTES</span>
                    </div>
                    <div className="h-3 w-full bg-black border border-white/20">
                      <div className="h-full bg-[#ffcf38]" style={{ width: `${moussePct}%` }} />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleTasteOffVote('mousse')}
                  disabled={!!tasteOffVote}
                  className={`w-full py-4 font-mono font-black uppercase text-xs tracking-wider border-2 transition cursor-pointer ${
                    tasteOffVote === 'mousse'
                      ? 'bg-[#ffcf38] text-black border-black shadow-[4px_4px_0_#ff5a1f]'
                      : 'bg-white text-black border-black hover:bg-[#ffcf38]'
                  }`}
                >
                  {tasteOffVote === 'mousse' ? '✓ YOUR WINNER STAMPED' : 'VOTE TEAM CHOCOLATE MOUSSE (+50 PTS)'}
                </button>
              </div>
            </div>

          </div>

          {/* Post-Vote Group Chat Share */}
          {tasteOffVote && (
            <div className="p-6 bg-black border-2 border-[#ff5a1f] flex flex-wrap items-center justify-between gap-4 font-mono">
              <div className="text-xs">
                <span className="text-[#ffcf38] font-black uppercase block mb-0.5">SHARE YOUR SELECTION</span>
                <p className="text-white/70">Invite your food crew to vote and sample at PriceSmart Red Hills Road.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={shareWhatsApp}
                  className="px-5 py-2.5 bg-[#25D366] text-black font-black text-xs uppercase border border-black shadow-[3px_3px_0_#fff] cursor-pointer"
                >
                  SHARE TO WHATSAPP
                </button>
                <button
                  onClick={copyShareLink}
                  className="px-5 py-2.5 bg-white/10 text-white font-black text-xs uppercase border border-white/20 hover:bg-white/20 cursor-pointer"
                >
                  COPY LINK
                </button>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 4. MANIFESTO & 3 CULINARY PILLARS (CREAM PAPER SECTION) */}
      <section className="bg-[#f4efe5] text-[#11100e] px-4 sm:px-8 py-20 border-b-2 border-black">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="max-w-3xl space-y-2">
            <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#ff5a1f]">
              THE PRODUCT REALITY
            </p>
            <h2 className="font-serif text-4xl sm:text-6xl font-bold leading-tight">
              Most people think cream only does one thing. This does three.
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 border-t-2 border-black pt-8 font-mono">
            
            <article className="space-y-3">
              <span className="text-[#ff5a1f] font-black text-sm">01 / COOKING STABILITY</span>
              <h3 className="font-serif text-2xl font-bold text-black font-sans">Boil & Acid Tolerant</h3>
              <p className="text-xs text-[#554e45] leading-relaxed">
                Does not curdle when simmered with lemon, wine, or Jamaican Scotch bonnet peppers. Yields high gloss and heavy sauce coating.
              </p>
            </article>

            <article className="space-y-3">
              <span className="text-[#ff5a1f] font-black text-sm">02 / 3.5× EXPANSION</span>
              <h3 className="font-serif text-2xl font-bold text-black font-sans">High Volume Yield</h3>
              <p className="text-xs text-[#554e45] leading-relaxed">
                Whips to 350% volume with exceptional bowl stability. Perfect for mousses, cheesecakes, and cake frosting in Jamaican humidity.
              </p>
            </article>

            <article className="space-y-3">
              <span className="text-[#ff5a1f] font-black text-sm">03 / BEVERAGE EMULSION</span>
              <h3 className="font-serif text-2xl font-bold text-black font-sans">Spirits & Punch</h3>
              <p className="text-xs text-[#554e45] leading-relaxed">
                Emulsifies seamlessly with Dragon Stout, peanut butter, and vanilla for traditional Jamaican cream punches without fat separation.
              </p>
            </article>

          </div>

        </div>
      </section>

      {/* 5. ITEM RECEIPT / J$1,200 PRICE BREAKDOWN */}
      <section className="px-4 sm:px-8 py-20 bg-[#11100e] border-b-2 border-black">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="text-center space-y-2">
            <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#ffcf38]">
              COMMERCIAL SNAPSHOT
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl font-black text-white">
              The Roadshow Value Equation
            </h2>
            <p className="text-xs text-white/60 font-mono">
              Available exclusively during the current PriceSmart Jamaica activation.
            </p>
          </div>

          {/* Monospace Price Receipt Card */}
          <div className="bg-[#181512] border-2 border-white/20 p-6 sm:p-8 font-mono text-xs text-[#d0c5b9] shadow-[10px_10px_0_#000] space-y-4">
            <div className="flex justify-between items-center border-b border-white/20 pb-3 font-bold text-white">
              <span>ITEM SPECIFICATION</span>
              <span>PRICE (JMD)</span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span>ARLA PRO WHIP & COOK (1L / 28% FAT)</span>
                <span className="text-white font-bold">1L CARTON</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>ADVISED REGULAR NORMAL BENCHMARK</span>
                <span className="line-through">~J$2,700</span>
              </div>
              <div className="flex justify-between text-[#ffcf38] font-black text-sm pt-2 border-t border-white/10">
                <span>ROADSHOW ACTIVATION PRICE</span>
                <span>J$1,200</span>
              </div>
              <div className="flex justify-between text-[#25D366] font-bold">
                <span>ESTIMATED DIFFERENCE / SAVINGS</span>
                <span>-J$1,500 (~56%)</span>
              </div>
            </div>

            <div className="p-3 bg-black/60 border border-white/10 text-[10px] text-white/50 space-y-1">
              <p>● Product is available directly at the PriceSmart roadshow station.</p>
              <p>● Promoters on the ground can verify your purchase on-site.</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {['Planning to Buy', 'Already Purchased at Roadshow'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setPurchaseStatus(st);
                    toast.success(`Purchase interest logged: ${st}`);
                  }}
                  className={`p-3 text-center border font-bold text-xs uppercase transition cursor-pointer ${
                    purchaseStatus === st
                      ? 'border-[#ff5a1f] bg-[#ff5a1f] text-black shadow-[2px_2px_0_#ffcf38]'
                      : 'border-white/20 bg-white/5 text-white/80 hover:bg-white/10'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 6. DIGITAL PRODUCT LEAD MAGNET: 5 WAYS TO WHIP & COOK */}
      <section className="px-4 sm:px-8 py-20 bg-[#161412] border-b-2 border-black">
        <div className="max-w-7xl mx-auto grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
          
          <div className="space-y-6">
            <div className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#ffcf38] flex items-center gap-2">
              <span>CULINARY VAULT</span>
              <span>/</span>
              <span>DIGITAL LEAD MAGNET</span>
            </div>

            <h2 className="font-serif text-4xl sm:text-6xl font-black text-white leading-tight">
              5 Ways to Whip <i className="text-[#ff5a1f] not-italic">&</i> Cook
            </h2>

            <p className="text-sm text-[#d0c5b9] leading-relaxed max-w-xl">
              An exclusive recipe index curated for Jamaican households: <strong>Roadshow Rasta Pasta</strong>, <strong>Whipped Chocolate Chip Mousse</strong>, <strong>Creamy Garlic Pan Chicken</strong>, <strong>Strawberry Cheesecake Cups</strong>, and <strong>Jamaican Strong Back Punch</strong>.
            </p>

            {/* Key Unlock Tracker */}
            <div className="bg-black border-2 border-white/20 p-5 max-w-md font-mono space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#ffcf38]">ARLA RECIPE KEY ACCESS</span>
                <span className={isKeyUnlocked ? 'text-[#25D366]' : 'text-[#ff5a1f]'}>
                  {Math.min(completedCount, 2)} / 2 ACTIONS DONE
                </span>
              </div>
              <div className="h-2 w-full bg-white/10">
                <div
                  className="h-full bg-[#ff5a1f] transition-all duration-300"
                  style={{ width: `${Math.min((completedCount / 2) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-white/50">
                {isKeyUnlocked ? '★ Recipe Key Active. Open and save the cookbook below.' : 'Vote in the Taste-Off or explore culinary modes to unlock.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setRecipeModalOpen(true)}
                className={`px-7 py-4 font-mono font-black uppercase text-xs tracking-wider border-2 transition cursor-pointer ${
                  isKeyUnlocked
                    ? 'bg-[#25D366] text-black border-black shadow-[6px_6px_0_#ffcf38]'
                    : 'bg-[#ff5a1f] text-black border-black shadow-[6px_6px_0_#fff]'
                }`}
              >
                {isKeyUnlocked ? 'OPEN 5-RECIPE PACK NOW →' : 'PREVIEW RECIPE INDEX →'}
              </button>
            </div>
          </div>

          {/* Recipe Pack Index Preview */}
          <div
            onClick={() => setRecipeModalOpen(true)}
            className="bg-[#f4efe5] text-[#11100e] p-6 border-2 border-black shadow-[12px_12px_0_#ffcf38] font-mono cursor-pointer hover:rotate-1 transition-transform"
          >
            <div className="flex justify-between border-b-2 border-black pb-2 text-xs font-black">
              <span>INDEX: 5 DISHES</span>
              <span>ARLA PRO 28%</span>
            </div>
            <div className="divide-y divide-black/15 text-xs py-2">
              <div className="py-2.5 flex justify-between">
                <span>01. Roadshow Rasta Pasta</span>
                <span className="font-bold text-[#ff5a1f]">SAVOURY</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>02. Chocolate Chip Mousse</span>
                <span className="font-bold text-[#ffcf38]">DESSERT</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>03. Garlic & Herb Pan Chicken</span>
                <span className="font-bold text-[#ff5a1f]">DINNER</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>04. Strawberry Cheesecake Cups</span>
                <span className="font-bold text-[#ffcf38]">NO-BAKE</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>05. Jamaican Strong Back Punch</span>
                <span className="font-bold text-[#ff5a1f]">DRINK</span>
              </div>
            </div>
            <div className="text-[10px] text-center pt-2 text-[#776e62] border-t-2 border-black">
              CLICK TO VIEW INGREDIENTS & STEPS
            </div>
          </div>

        </div>
      </section>

      {/* 7. ROADSHOW LOCATION & MISSIONS */}
      <section className="px-4 sm:px-8 py-20 bg-[#11100e] border-b-2 border-black">
        <div className="max-w-7xl mx-auto space-y-8 font-mono">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/20 pb-6">
            <div>
              <span className="text-xs font-black uppercase text-[#ff5a1f] tracking-widest">PHYSICAL COORDINATES</span>
              <h2 className="font-serif text-4xl sm:text-5xl font-black text-white mt-1">PriceSmart Jamaica</h2>
              <p className="text-xs text-white/60 mt-1">111 Red Hills Road, Kingston 19 · Daily 10:00 AM – 8:00 PM</p>
            </div>
            <Link
              to="/moments/00000000-0000-0000-0002-000000000060"
              className="px-6 py-3 bg-white text-black font-black uppercase text-xs tracking-wider border border-black hover:bg-[#ffcf38] transition"
            >
              VIEW ROADSHOW MOMENT →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 bg-black border border-white/20 space-y-1.5">
              <span className="text-[10px] text-[#ff5a1f] font-bold">MISSION 01</span>
              <h4 className="text-sm font-bold text-white font-serif">Taste Rasta Pasta</h4>
              <p className="text-[11px] text-white/60">Sample the hot jerk pasta and log feedback (+40 Pts).</p>
            </div>
            <div className="p-4 bg-black border border-white/20 space-y-1.5">
              <span className="text-[10px] text-[#ffcf38] font-bold">MISSION 02</span>
              <h4 className="text-sm font-bold text-white font-serif">Taste Chocolate Mousse</h4>
              <p className="text-[11px] text-white/60">Sample the whipped cold mousse (+40 Pts).</p>
            </div>
            <div className="p-4 bg-black border border-white/20 space-y-1.5">
              <span className="text-[10px] text-[#25D366] font-bold">MISSION 03</span>
              <h4 className="text-sm font-bold text-white font-serif">Vote in Taste-Off</h4>
              <p className="text-[11px] text-white/60">Pick your winner and stamp your passport (+50 Pts).</p>
            </div>
            <div className="p-4 bg-black border border-white/20 space-y-1.5">
              <span className="text-[10px] text-[#ff5a1f] font-bold">MISSION 04</span>
              <h4 className="text-sm font-bold text-white font-serif">Get Arla for J$1,200</h4>
              <p className="text-[11px] text-white/60">Special roadshow price. Promoters confirm purchase.</p>
            </div>
            <div className="p-4 bg-black border border-dashed border-[#ffcf38] space-y-1.5 sm:col-span-2">
              <span className="text-[10px] text-[#ffcf38] font-bold">MISSION 05 (SURPRISE DROP)</span>
              <h4 className="text-sm font-bold text-white font-serif">Did You Catch Strong Back?</h4>
              <p className="text-[11px] text-white/60">Surprise Jamaican Strong Back Punch drop (occasional schedule).</p>
            </div>
          </div>

        </div>
      </section>

      {/* 8. FOOTER COMMERCIAL CALLOUT */}
      <footer className="px-4 sm:px-8 py-16 bg-black text-center font-mono space-y-6">
        <div className="max-w-2xl mx-auto space-y-2">
          <p className="text-xs text-[#ff5a1f] font-black uppercase tracking-widest">ARLA × PROMORANG PILOT</p>
          <h3 className="font-serif text-3xl sm:text-4xl font-black text-white">Turning Product Trial into Repeat Demand</h3>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/proposals/arla-pro"
            className="px-6 py-3 bg-[#ff5a1f] text-black font-black uppercase text-xs tracking-wider border border-black shadow-[4px_4px_0_#ffcf38]"
          >
            VIEW FULL COMMERCIAL PROPOSAL →
          </Link>
        </div>
      </footer>

      {/* Recipe Pack Modal */}
      <ArlaRecipePackModal
        isOpen={recipeModalOpen}
        onClose={() => setRecipeModalOpen(false)}
        unlocked={isKeyUnlocked}
      />
    </main>
  );
}
